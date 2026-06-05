import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { PaymentMethod } from "@/models/PaymentMethod";
import mongoose from "mongoose";

const PHONEPE_BASE = process.env.PHONEPE_ENV === "UAT"
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/hermes";

const CLIENT_ID = process.env.PHONEPE_CLIENT_ID!;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET!;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";

async function getPhonePeToken(): Promise<string> {
  const res = await fetch(`${PHONEPE_BASE}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_version: CLIENT_VERSION,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

// GET: called from frontend payment-success page to verify payment status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantTransactionId = searchParams.get("merchantTransactionId");

  if (!merchantTransactionId) {
    return NextResponse.json({ error: "merchantTransactionId required" }, { status: 400 });
  }

  await connectDB();

  // Find project by merchantTransactionId
  const project = await Project.findOne({ "payment.merchantTransactionId": merchantTransactionId });
  if (!project) {
    return NextResponse.json({ error: "Project not found for this transaction" }, { status: 404 });
  }

  // If already marked paid in DB, just return success
  if (project.payment?.status === "paid") {
    return NextResponse.json({ paid: true, projectId: project._id });
  }

  // Otherwise, check with PhonePe
  try {
    const token = await getPhonePeToken();
    const statusRes = await fetch(`${PHONEPE_BASE}/checkout/v2/order/${merchantTransactionId}/status`, {
      headers: { Authorization: `O-Bearer ${token}` },
    });

    if (!statusRes.ok) {
      return NextResponse.json({ paid: false, error: "Status check failed" });
    }

    const statusData = await statusRes.json();
    const state = statusData?.state || statusData?.data?.state;
    const phonePeTxnId = statusData?.transactionId || statusData?.data?.transactionId;

    if (state === "COMPLETED") {
      // Mark as paid in DB
      project.payment = {
        ...project.payment,
        status: "paid",
        transactionId: phonePeTxnId,
        paidAt: new Date(),
      };
      await project.save();

      // ── Auto-capture payment instrument into PaymentMethod ──────────────
      try {
        const instrument = statusData?.paymentInstrument || statusData?.data?.paymentInstrument;
        if (instrument && project.clientId) {
          const clientId = project.clientId.toString();
          const instrType: string = (instrument.type || "").toUpperCase();

          let pmData: Record<string, any> = {
            userId: new mongoose.Types.ObjectId(clientId),
            consentGiven: true,
          };

          if (instrType === "UPI" || instrType.includes("UPI")) {
            const upiId = instrument.upiId || instrument.vpa || instrument.payerVpa || "";
            pmData = {
              ...pmData,
              type: "upi",
              label: upiId || `UPI (${phonePeTxnId?.slice(-6)})`,
              upiId: upiId || undefined,
            };
          } else if (instrType === "CARD" || instrType.includes("CARD") || instrType.includes("CREDIT") || instrType.includes("DEBIT")) {
            const last4 = instrument.cardLast4 || instrument.last4 || "????";
            const brand = instrument.cardType || instrument.networkType || "Card";
            const expiry = instrument.cardExpiry || "";
            pmData = {
              ...pmData,
              type: "card",
              label: `${brand} •••• ${last4}`,
              cardLast4: last4,
              cardBrand: brand,
              cardExpiry: expiry,
            };
          } else if (instrType === "NET_BANKING" || instrType.includes("NETBANKING") || instrType.includes("NET")) {
            const bank = instrument.bankId || instrument.bankName || "Net Banking";
            pmData = {
              ...pmData,
              type: "netbanking",
              label: `${bank} Net Banking`,
              bank,
            };
          } else {
            // Generic fallback — store as UPI placeholder
            pmData = {
              ...pmData,
              type: "upi",
              label: `Payment via PhonePe (${phonePeTxnId?.slice(-6) || ""})`,
            };
          }

          // Only create if not already saved (idempotent)
          const existing = await PaymentMethod.findOne({
            userId: new mongoose.Types.ObjectId(clientId),
            label: pmData.label,
          });
          if (!existing) {
            const isDefault = (await PaymentMethod.countDocuments({ userId: new mongoose.Types.ObjectId(clientId) })) === 0;
            await PaymentMethod.create({ ...pmData, isDefault });
          }
        }
      } catch (captureErr) {
        // Non-fatal — don't fail the payment verification
        console.error("[PaymentMethod capture]", captureErr);
      }
      // ────────────────────────────────────────────────────────────────────

      return NextResponse.json({ paid: true, projectId: project._id });
    } else if (state === "FAILED" || state === "ERROR") {
      project.payment = { ...project.payment, status: "failed" };
      await project.save();
      return NextResponse.json({ paid: false, state });
    } else {
      return NextResponse.json({ paid: false, state });
    }
  } catch (err: any) {
    console.error("[PhonePe verify]", err);
    return NextResponse.json({ paid: false, error: err.message }, { status: 500 });
  }
}

// POST: PhonePe server-to-server webhook callback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const state = body?.state || body?.data?.state;
    const merchantTransactionId = body?.merchantOrderId || body?.data?.merchantOrderId;
    const phonePeTxnId = body?.transactionId || body?.data?.transactionId;

    if (!merchantTransactionId) {
      return NextResponse.json({ error: "No merchantOrderId" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findOne({ "payment.merchantTransactionId": merchantTransactionId });
    if (!project) return NextResponse.json({ success: true }); // Idempotent

    if (state === "COMPLETED") {
      project.payment = {
        ...project.payment,
        status: "paid",
        transactionId: phonePeTxnId,
        paidAt: new Date(),
      };
      await project.save();

      // ── Auto-capture instrument via webhook ─────────────────────────────
      try {
        const instrument = body?.paymentInstrument || body?.data?.paymentInstrument;
        if (instrument && project.clientId) {
          const clientId = project.clientId.toString();
          const instrType: string = (instrument.type || "").toUpperCase();
          let pmData: Record<string, any> = { userId: new mongoose.Types.ObjectId(clientId), consentGiven: true };

          if (instrType.includes("UPI")) {
            const upiId = instrument.upiId || instrument.vpa || instrument.payerVpa || "";
            pmData = { ...pmData, type: "upi", label: upiId || `UPI (${phonePeTxnId?.slice(-6)})`, upiId: upiId || undefined };
          } else if (instrType.includes("CARD") || instrType.includes("CREDIT") || instrType.includes("DEBIT")) {
            const last4 = instrument.cardLast4 || instrument.last4 || "????";
            const brand = instrument.cardType || instrument.networkType || "Card";
            pmData = { ...pmData, type: "card", label: `${brand} •••• ${last4}`, cardLast4: last4, cardBrand: brand };
          } else if (instrType.includes("NET") || instrType.includes("BANK")) {
            const bank = instrument.bankId || instrument.bankName || "Net Banking";
            pmData = { ...pmData, type: "netbanking", label: `${bank} Net Banking`, bank };
          } else {
            pmData = { ...pmData, type: "upi", label: `Payment via PhonePe (${phonePeTxnId?.slice(-6) || ""})` };
          }

          const existing = await PaymentMethod.findOne({ userId: new mongoose.Types.ObjectId(clientId), label: pmData.label });
          if (!existing) {
            const isDefault = (await PaymentMethod.countDocuments({ userId: new mongoose.Types.ObjectId(clientId) })) === 0;
            await PaymentMethod.create({ ...pmData, isDefault });
          }
        }
      } catch (captureErr) {
        console.error("[PaymentMethod webhook capture]", captureErr);
      }
      // ────────────────────────────────────────────────────────────────────
    } else if (state === "FAILED" || state === "ERROR") {
      project.payment = { ...project.payment, status: "failed" };
      await project.save();
    }

    // PhonePe requires a 200 response
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PhonePe callback]", err);
    return NextResponse.json({ success: true }); // Always 200 to PhonePe
  }
}
