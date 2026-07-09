import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvFallback() {
  if (
    process.env.PHONEPE_CLIENT_ID && 
    process.env.PHONEPE_CLIENT_ID !== "undefined" &&
    process.env.PHONEPE_CLIENT_SECRET &&
    process.env.PHONEPE_CLIENT_SECRET !== "undefined"
  ) {
    return;
  }
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    try {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const index = trimmed.indexOf("=");
            const key = trimmed.substring(0, index).trim();
            let value = trimmed.substring(index + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1);
            }
            if (!process.env[key] || process.env[key] === "undefined") {
              process.env[key] = value;
            }
          }
        });
      }
    } catch (err) {
      console.warn(`Failed to read fallback env file ${file}:`, err);
    }
  }
}

// Ensure env variables are loaded before evaluating top-level constants
loadEnvFallback();

const PHONEPE_ENV = process.env.PHONEPE_ENV || "UAT";

// PhonePe PG base URL (for checkout/v2/pay)
const PHONEPE_BASE = PHONEPE_ENV === "UAT"
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/pg";

// PhonePe identity manager base URL (for oauth/token)
const PHONEPE_TOKEN_BASE = PHONEPE_ENV === "UAT"
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/identity-manager";

const CLIENT_ID = process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_ID !== "undefined"
  ? process.env.PHONEPE_CLIENT_ID
  : "M22XTO82UL82X_2606031540";

const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET && process.env.PHONEPE_CLIENT_SECRET !== "undefined"
  ? process.env.PHONEPE_CLIENT_SECRET
  : "NWFlMzczMzktMTk1NC00MDdhLWFkMTktODZhZDJlMzhjNDhj";

const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Warn loudly if APP_URL is not explicitly set — dynamic Vercel preview URLs
// are not whitelisted in PhonePe and will cause "Something went wrong" on their page.
if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn(
    "[Payment] NEXT_PUBLIC_APP_URL is not set. Using fallback:",
    APP_URL,
    "— Set this in Vercel env vars to your stable production URL and whitelist it in PhonePe dashboard."
  );
}

/**
 * Generates a short, unique merchantTransactionId (≤38 chars).
 * PhonePe v2 enforces a strict 38-character limit on merchantOrderId.
 * Format: {PREFIX}-{base36_timestamp}-{4_random_hex_bytes}
 * Example: EXC-m9d2x4k-a3f1c2e9  (27 chars)
 */
function makeTxnId(prefix: "EXP" | "EXM" | "EXC" | "EXU"): string {
  const ts  = Date.now().toString(36); // ~8 chars
  const rnd = crypto.randomBytes(4).toString("hex"); // 8 chars
  return `${prefix}-${ts}-${rnd}`; // max: 3+1+8+1+8 = 21 chars  ✓
}

// Get OAuth token from PhonePe
async function getPhonePeToken(): Promise<string> {
  const res = await fetch(`${PHONEPE_TOKEN_BASE}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_version: CLIENT_VERSION,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PhonePe token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, milestoneIndex, customUnit } = body;
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Only the client who owns the project can pay
  const userId = (session.user as any).id;
  if (project.clientId.toString() !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ─── CUSTOM UNIT SCOPE FEE (5% of unit price) ───────────────────────────────
  if (customUnit) {
    const ratePerPoint = project.pricing?.ratePerPoint || 400;
    const unitPrice = (customUnit.unitScore || 0) * ratePerPoint;
    const platformFee = Math.round(unitPrice * 0.05); // 5%

    if (platformFee < 100) {
      // PhonePe min is ₹1 (100 paise). If fee is below that, skip payment gate.
      return NextResponse.json({ skipPayment: true, unitPrice, platformFee: 0 });
    }

    const merchantTransactionId = makeTxnId("EXC");
    const amountInPaise = Math.round(platformFee * 100);

    try {
      const token = await getPhonePeToken();

      const orderPayload = {
        merchantOrderId: merchantTransactionId,
        amount: amountInPaise,
        expireAfter: 1200,
        metaInfo: {
          udf1: projectId,
          udf2: userId,
          udf3: "custom_unit_fee",
          udf4: customUnit.id || "",
        },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Executa Scope Upgrade Fee: ${customUnit.name}`,
          merchantUrls: {
            redirectUrl: `${APP_URL}/client/projects/${projectId}/payment-success?txnId=${merchantTransactionId}`,
          },
        },
      };

      const orderRes = await fetch(`${PHONEPE_BASE}/checkout/v2/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error("[PhonePe custom unit fee error]", errText);
        return NextResponse.json({ error: "PhonePe order creation failed", detail: errText }, { status: 500 });
      }

      const orderData = await orderRes.json();
      const redirectUrl = orderData?.redirectUrl || orderData?.data?.instrumentResponse?.redirectInfo?.url;

      if (!redirectUrl) {
        return NextResponse.json({ error: "No redirect URL from PhonePe" }, { status: 500 });
      }

      // Save pending custom unit on the project — committed only after payment
      project.pendingCustomUnit = {
        ...customUnit,
        platformFee,
        unitPrice,
        merchantTransactionId,
        paymentStatus: "initiated",
      };
      await project.save();

      return NextResponse.json({ redirectUrl, merchantTransactionId, platformFee, unitPrice });
    } catch (err: any) {
      console.error("[PhonePe custom unit initiate]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  // ─── END CUSTOM UNIT SCOPE FEE ───────────────────────────────────────────────

  // ─── UPGRADE FEE (5% platform fee for execution-phase Add Functional Unit) ───
  const { upgradeId } = body;
  if (upgradeId) {
    const { ScopeUpgrade } = require("@/models/ScopeUpgrade");
    const upgrade = await ScopeUpgrade.findById(upgradeId);
    if (!upgrade) return NextResponse.json({ error: "Upgrade not found" }, { status: 404 });
    if (upgrade.projectId.toString() !== projectId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const platformFee = upgrade.platformFee || 0;
    if (platformFee < 1) {
      // Fee too small — no payment needed, advance to pending_freelancer_approval
      upgrade.status = "pending_freelancer_approval";
      upgrade.upgradePayment = { status: "paid", paidAt: new Date() };
      await upgrade.save();
      return NextResponse.json({ skipPayment: true, upgrade });
    }

    const merchantTransactionId = makeTxnId("EXU");
    const amountInPaise = Math.round(platformFee * 100);

    try {
      const token = await getPhonePeToken();
      const orderPayload = {
        merchantOrderId: merchantTransactionId,
        amount: amountInPaise,
        expireAfter: 1200,
        metaInfo: {
          udf1: projectId,
          udf2: userId,
          udf3: "upgrade_fee",
          udf4: upgradeId,
        },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Executa Scope Upgrade Fee: ${upgrade.proposedUnit?.name || "Functional Unit"}`,
          merchantUrls: {
            redirectUrl: `${APP_URL}/client/projects/${projectId}/payment-success?txnId=${merchantTransactionId}`,
          },
        },
      };

      const orderRes = await fetch(`${PHONEPE_BASE}/checkout/v2/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `O-Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error("[PhonePe upgrade fee error]", errText);
        return NextResponse.json({ error: "PhonePe order creation failed", detail: errText }, { status: 500 });
      }

      const orderData = await orderRes.json();
      const redirectUrl = orderData?.redirectUrl || orderData?.data?.instrumentResponse?.redirectInfo?.url;
      if (!redirectUrl) return NextResponse.json({ error: "No redirect URL from PhonePe" }, { status: 500 });

      // Record payment initiation on the upgrade doc
      upgrade.upgradePayment = {
        status: "initiated",
        merchantTransactionId,
      };
      await upgrade.save();

      return NextResponse.json({ redirectUrl, merchantTransactionId, platformFee, upgrade });
    } catch (err: any) {
      console.error("[PhonePe upgrade fee initiate]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  // ─── END UPGRADE FEE ─────────────────────────────────────────────────────────

  const isMilestone = milestoneIndex !== undefined;

  if (isMilestone) {
    // Check if freelancer profile has bank details
    const freelancerId = project.freelancerId || (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
    if (!freelancerId) {
      return NextResponse.json({ error: "No freelancer is assigned to this project" }, { status: 400 });
    }

    const freelancerProfile = await FreelancerProfile.findOne({ userId: freelancerId });
    
    // Check new multi-method payoutMethods array first
    const methods: any[] = freelancerProfile?.payoutMethods || [];
    const hasNewMethod = methods.some((m: any) =>
      (m.type === "upi_id" && m.upiId) ||
      (m.type === "upi_mobile" && m.upiMobile) ||
      (m.type === "bank_transfer" && m.accountNumber && m.ifscCode)
    );

    // Fallback: check legacy bankDetails single-method
    const hasUpi = freelancerProfile?.bankDetails?.upiId || freelancerProfile?.bankDetails?.upiMobile;
    const hasBankAccount = freelancerProfile?.bankDetails?.accountNumber && freelancerProfile?.bankDetails?.ifscCode;
    
    if (!hasNewMethod && !hasUpi && !hasBankAccount) {
      return NextResponse.json({ 
        error: "The assigned expert has not configured their Bank Account or UPI ID yet. Milestone payment cannot be initiated until they set it up in their Profile settings." 
      }, { status: 400 });
    }

    if (!project.milestones[milestoneIndex]) {
      return NextResponse.json({ error: "Invalid milestone index" }, { status: 400 });
    }

    const milestone = project.milestones[milestoneIndex];
    if (milestone.status === "approved") {
      return NextResponse.json({ alreadyPaid: true });
    }

    const milestoneAmount = milestone.amount || 0;
    const amountInPaise = Math.round(milestoneAmount * 100);
    const merchantTransactionId = makeTxnId("EXM");

    try {
      const token = await getPhonePeToken();

      const orderPayload = {
        merchantOrderId: merchantTransactionId,
        amount: amountInPaise,
        expireAfter: 1200,
        metaInfo: {
          udf1: projectId,
          udf2: userId,
          udf3: "milestone_payment",
          udf4: milestoneIndex.toString()
        },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Release Milestone ${milestoneIndex + 1} for: ${project.title}`,
          merchantUrls: {
            redirectUrl: `${APP_URL}/client/projects/${projectId}/payment-success?txnId=${merchantTransactionId}`,
          },
        },
      };

      const orderRes = await fetch(`${PHONEPE_BASE}/checkout/v2/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error("[PhonePe initiate error]", errText);
        return NextResponse.json({ error: "PhonePe order creation failed", detail: errText }, { status: 500 });
      }

      const orderData = await orderRes.json();
      const redirectUrl = orderData?.redirectUrl || orderData?.data?.instrumentResponse?.redirectInfo?.url;

      if (!redirectUrl) {
        console.error("[PhonePe no redirectUrl]", orderData);
        return NextResponse.json({ error: "No redirect URL from PhonePe" }, { status: 500 });
      }

      // Save milestone payment status as initiated in DB
      milestone.payment = {
        status: "initiated",
        merchantTransactionId,
      };
      await project.save();

      return NextResponse.json({ redirectUrl, merchantTransactionId });
    } catch (err: any) {
      console.error("[PhonePe milestone initiate]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Fallback to legacy platform fee payment flow
  // If already paid, return success immediately
  if (project.payment?.status === "paid") {
    return NextResponse.json({ alreadyPaid: true });
  }

  // Calculate platform fees only (scopeFee + accountabilityFee + executionFee)
  const pricing = project.pricing;
  if (!pricing) return NextResponse.json({ error: "Pricing not ready" }, { status: 400 });

  const platformFees = (pricing.scopeFee || 0) + (pricing.accountabilityFee || 0) + (pricing.executionFee || 0);
  // PhonePe uses paise (1 INR = 100 paise)
  const amountInPaise = Math.round(platformFees * 100);

  // Unique merchant transaction ID
  const merchantTransactionId = makeTxnId("EXP");

  try {
    const token = await getPhonePeToken();

    // Create order with PhonePe
    const orderPayload = {
      merchantOrderId: merchantTransactionId,
      amount: amountInPaise,
      expireAfter: 1200, // 20 minutes
      metaInfo: {
        udf1: projectId,
        udf2: userId,
        udf3: "platform_fees",
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: `Executa Platform Fees for project: ${project.title}`,
        merchantUrls: {
          redirectUrl: `${APP_URL}/client/projects/${projectId}/payment-success?txnId=${merchantTransactionId}`,
        },
      },
    };

    const orderRes = await fetch(`${PHONEPE_BASE}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("[PhonePe initiate error]", errText);
      return NextResponse.json({ error: "PhonePe order creation failed", detail: errText }, { status: 500 });
    }

    const orderData = await orderRes.json();
    const redirectUrl = orderData?.redirectUrl || orderData?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectUrl) {
      console.error("[PhonePe no redirectUrl]", orderData);
      return NextResponse.json({ error: "No redirect URL from PhonePe" }, { status: 500 });
    }

    // Save payment as initiated in DB
    project.payment = {
      status: "initiated",
      merchantTransactionId,
      amount: platformFees,
    };
    await project.save();

    return NextResponse.json({ redirectUrl, merchantTransactionId });
  } catch (err: any) {
    console.error("[PhonePe initiate]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
