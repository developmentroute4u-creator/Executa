export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
            const idx = trimmed.indexOf("=");
            const key = trimmed.substring(0, idx).trim();
            let val = trimmed.substring(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
          }
        });
      }
    } catch {}
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  loadEnvFallback();

  const env           = process.env.PHONEPE_ENV            || "UAT";
  const clientId      = process.env.PHONEPE_CLIENT_ID      || "";
  const clientSecret  = process.env.PHONEPE_CLIENT_SECRET  || "";
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";

  const tokenBase = env === "UAT"
    ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
    : "https://api.phonepe.com/apis/identity-manager";

  const pgBase = env === "UAT"
    ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
    : "https://api.phonepe.com/apis/pg";

  const result: any = {
    env,
    clientId: clientId ? `${clientId.slice(0, 8)}...` : "MISSING",
    clientSecret: clientSecret ? `${clientSecret.slice(0, 8)}...` : "MISSING",
    clientVersion,
    tokenBase,
    pgBase,
  };

  // Step 1: Get token
  let token = "";
  try {
    const tokenRes = await fetch(`${tokenBase}/v1/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_version: clientVersion,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    const tokenText = await tokenRes.text();
    let tokenData: any = {};
    try { tokenData = JSON.parse(tokenText); } catch {}
    result.tokenStep = {
      httpStatus: tokenRes.status,
      ok: tokenRes.ok,
      response: tokenData,
    };
    if (tokenRes.ok) {
      token = tokenData.access_token || "";
      result.tokenObtained = true;
    }
  } catch (e: any) {
    result.tokenStep = { error: e.message };
  }

  // Step 2: Try creating a minimal ₹1 test order (only if token obtained)
  if (token) {
    const testPayload = {
      merchantOrderId: `TEST-DIAG-${Date.now().toString(36)}`,
      amount: 100, // ₹1 in paise
      expireAfter: 300,
      metaInfo: { udf1: "diagnostic-test" },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Diagnostic test payment",
        merchantUrls: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/diagnostic-callback`,
        },
      },
    };
    try {
      const orderRes = await fetch(`${pgBase}/checkout/v2/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
        body: JSON.stringify(testPayload),
      });
      const orderText = await orderRes.text();
      let orderData: any = {};
      try { orderData = JSON.parse(orderText); } catch {}
      result.orderCreationStep = {
        httpStatus: orderRes.status,
        ok: orderRes.ok,
        response: orderData,
      };
    } catch (e: any) {
      result.orderCreationStep = { error: e.message };
    }
  }

  return NextResponse.json(result, { status: 200 });
}
