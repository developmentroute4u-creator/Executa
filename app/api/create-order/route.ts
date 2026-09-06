export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { keyId, keySecret, configId } = getRazorpayConfig();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment configuration missing. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawAmount = body.amount ?? body.amountInPaise ?? (body.amountInRupees ? Number(body.amountInRupees) * 100 : undefined);
    const { currency = "INR", receipt, notes } = body;

    const numericAmount = Math.round(Number(rawAmount));
    if (!numericAmount || isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount. Minimum amount is 100 paise (₹1.00).",
        },
        { status: 400 }
      );
    }

    // Razorpay receipt has a strict maximum 40-character limit
    let safeReceipt: string;
    if (receipt && typeof receipt === "string" && receipt.trim()) {
      const sanitized = receipt.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
      safeReceipt = sanitized.length > 40 ? sanitized.slice(0, 40) : sanitized;
    } else {
      safeReceipt = `rc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    }

    // Razorpay notes: max 15 key-value pairs, string values up to 256 chars
    const safeNotes: Record<string, string> = {};
    if (typeof notes === "object" && notes !== null) {
      const keys = Object.keys(notes).slice(0, 15);
      for (const k of keys) {
        const val = notes[k];
        if (val !== undefined && val !== null) {
          safeNotes[k.slice(0, 40)] = String(val).slice(0, 256);
        }
      }
    }

    const orderPayload = {
      amount: numericAmount, // amount in paise
      currency: (currency || "INR").toString().trim().toUpperCase(),
      receipt: safeReceipt,
      notes: safeNotes,
    };

    // Call official Razorpay Orders API
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const orderData = await razorpayRes.json();

    if (razorpayRes.ok && orderData && orderData.id) {
      return NextResponse.json({
        success: true,
        order_id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        key_id: keyId,
        config_id: configId || undefined,
        is_live_order: true,
      });
    }

    console.error("[Razorpay API Order Creation Error]:", orderData);
    return NextResponse.json(
      {
        success: false,
        error: orderData?.error?.description || orderData?.error?.message || "Razorpay could not create the payment order.",
      },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("[Razorpay create-order exception]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Unable to communicate with Razorpay servers.",
      },
      { status: 500 }
    );
  }
}
