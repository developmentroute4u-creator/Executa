import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvFallback() {
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
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
          }
        });
      }
    } catch (err) {
      console.warn(`[Razorpay loadEnvFallback] Notice for ${file}:`, err);
    }
  }
}

export function getRazorpayConfig() {
  loadEnvFallback();
  const rawKeyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "";
  const rawKeySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    "";
  const rawConfigId =
    process.env.NEXT_PUBLIC_RAZORPAY_CONFIG_ID ||
    process.env.RAZORPAY_CONFIG_ID ||
    "";

  const keyId = (rawKeyId || "").trim();
  const keySecret = (rawKeySecret || "").trim();
  const configId = (rawConfigId || "").trim();

  return { keyId, keySecret, configId };
}

export function getRazorpayInstance(): Razorpay {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials missing in environment variables (.env.local).");
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function generateTestSignature(orderId: string, paymentId: string): string {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) return "";
  return crypto
    .createHmac("sha256", keySecret)
    .update(`${String(orderId).trim()}|${String(paymentId).trim()}`)
    .digest("hex");
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const { keySecret } = getRazorpayConfig();
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    const cleanSignature = String(signature || "").trim();

    if (!cleanOrderId || !cleanPaymentId || !cleanSignature || !keySecret) {
      return false;
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${cleanOrderId}|${cleanPaymentId}`)
      .digest("hex");

    const bufA = Buffer.from(generatedSignature, "utf-8");
    const bufB = Buffer.from(cleanSignature, "utf-8");

    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("[Razorpay verifyRazorpaySignature exception]:", err);
    return false;
  }
}
