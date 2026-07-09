import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import crypto from "crypto";

// Uses NEXTAUTH_SECRET so the cookie is tied to this deployment's secret
const SECRET =
  process.env.NEXTAUTH_SECRET ||
  "executa-secret-key-change-in-production-2024";

/** Creates a short-lived HMAC-signed cookie value: `{projectId}:{ts}:{sig}` */
function signPPToken(projectId: string): string {
  const ts      = Date.now().toString(36);
  const payload = `${projectId}:${ts}`;
  const sig     = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 20);
  return `${payload}:${sig}`;
}

/**
 * GET /api/payment/redirect?txnId=EXP-…
 *
 * Called by the payment-success page after verification.
 * - Looks up the project by merchantTransactionId in the DB
 * - Determines the correct post-payment destination
 * - Sets a short-lived (5-min) post-payment cookie for that projectId
 * - Redirects to the destination — bypassing the session middleware check
 */
export async function GET(req: NextRequest) {
  const txnId = req.nextUrl.searchParams.get("txnId");

  if (!txnId) {
    return NextResponse.redirect(new URL("/client/dashboard", req.url));
  }

  try {
    await connectDB();

    // ── Detect payment type by DB lookup ─────────────────────────────────────
    let projectId = "";
    let destination = "";

    // 1. Platform fee
    let project = await Project.findOne({ "payment.merchantTransactionId": txnId }).lean();
    if (project) {
      projectId   = (project as any)._id.toString();
      destination = `/client/projects/${projectId}/scope`;
    }

    // 2. Milestone payment
    if (!projectId) {
      project = await Project.findOne({ "milestones.payment.merchantTransactionId": txnId }).lean();
      if (project) {
        projectId   = (project as any)._id.toString();
        destination = `/client/execution/${projectId}`;
      }
    }

    // 3. Custom unit scope addition
    if (!projectId) {
      project = await Project.findOne({ "pendingCustomUnit.merchantTransactionId": txnId }).lean();
      if (project) {
        projectId   = (project as any)._id.toString();
        destination = `/client/projects/${projectId}/scope`;
      }
    }

    // 4. Upgrade fee
    if (!projectId) {
      const { ScopeUpgrade } = require("@/models/ScopeUpgrade");
      const upgrade = await ScopeUpgrade.findOne({ "upgradePayment.merchantTransactionId": txnId }).lean();
      if (upgrade) {
        projectId   = (upgrade as any).projectId.toString();
        destination = `/client/execution/${projectId}`;
      }
    }

    if (!projectId) {
      // txnId not found — send to dashboard
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }

    // ── Build response with post-payment cookie ───────────────────────────────
    const response = NextResponse.redirect(new URL(destination, req.url));

    response.cookies.set(`pp_${projectId}`, signPPToken(projectId), {
      maxAge:   300,                                          // 5 minutes
      httpOnly: true,
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      path:     "/",
    });

    return response;
  } catch (err) {
    console.error("[payment/redirect]", err);
    return NextResponse.redirect(new URL("/client/dashboard", req.url));
  }
}
