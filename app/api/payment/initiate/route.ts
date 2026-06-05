import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import crypto from "crypto";

// PhonePe UAT base URL
const PHONEPE_BASE = process.env.PHONEPE_ENV === "UAT"
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/hermes";

const CLIENT_ID = process.env.PHONEPE_CLIENT_ID!;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET!;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Get OAuth token from PhonePe
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

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Only the client who owns the project can pay
  const userId = (session.user as any).id;
  if (project.clientId.toString() !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  const merchantTransactionId = `EXECUTA_${projectId}_${Date.now()}`;

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
