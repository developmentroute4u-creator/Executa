import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";

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
