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
  // Type 1: platform fee  →  project.payment.merchantTransactionId
  // Type 2: milestone     →  project.milestones[i].payment.merchantTransactionId
  // Type 3: custom unit   →  project.pendingCustomUnit.merchantTransactionId
  // Type 4: upgrade fee   →  ScopeUpgrade.upgradePayment.merchantTransactionId
  let project = await Project.findOne({ "payment.merchantTransactionId": merchantTransactionId });
  let isMilestonePayment = false;
  let isCustomUnitPayment = false;
  let isUpgradePayment = false;
  let upgradeDoc: any = null;
  let milestoneIndex = -1;

  if (!project) {
    project = await Project.findOne({ "milestones.payment.merchantTransactionId": merchantTransactionId });
    if (project) {
      isMilestonePayment = true;
      milestoneIndex = project.milestones.findIndex((m: any) => m.payment?.merchantTransactionId === merchantTransactionId);
    }
  }

  if (!project) {
    project = await Project.findOne({ "pendingCustomUnit.merchantTransactionId": merchantTransactionId });
    if (project) {
      isCustomUnitPayment = true;
    }
  }

  // Type 4: Upgrade fee — look in ScopeUpgrade collection
  if (!project) {
    const { ScopeUpgrade } = require("@/models/ScopeUpgrade");
    upgradeDoc = await ScopeUpgrade.findOne({ "upgradePayment.merchantTransactionId": merchantTransactionId });
    if (upgradeDoc) {
      isUpgradePayment = true;
      project = await Project.findById(upgradeDoc.projectId);
    }
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found for this transaction" }, { status: 404 });
  }

  // Already paid guard for upgrade fee
  if (isUpgradePayment && upgradeDoc?.upgradePayment?.status === "paid") {
    return NextResponse.json({ paid: true, projectId: project._id, isUpgrade: true });
  }

  // If already committed (custom unit already in scope), return success
  if (isCustomUnitPayment) {
    const cu = project.pendingCustomUnit;
    if (cu?.paymentStatus === "paid") {
      return NextResponse.json({ paid: true, projectId: project._id, isCustomUnit: true });
    }
  }

  // If already marked paid in DB, just return success
  if (isMilestonePayment) {
    const milestone = project.milestones[milestoneIndex];
    if (milestone.payment?.status === "paid") {
      return NextResponse.json({ paid: true, projectId: project._id, isMilestone: true, milestoneIndex });
    }
  } else if (!isCustomUnitPayment && !isUpgradePayment) {
    if (project.payment?.status === "paid") {
      return NextResponse.json({ paid: true, projectId: project._id });
    }
  }

  // Otherwise, check with PhonePe
  try {
    const token = await getPhonePeToken();
    const statusRes = await fetch(`${PHONEPE_BASE}/checkout/v2/order/${merchantTransactionId}/status`, {
      headers: { Authorization: `O-Bearer ${token}` },
    });

    const rawText = await statusRes.text();
    let statusData: any = {};
    try { statusData = JSON.parse(rawText); } catch { /* non-JSON response */ }

    // Log for debugging (non-sensitive)
    console.log(`[PhonePe verify] txn=${merchantTransactionId} httpStatus=${statusRes.status}`, JSON.stringify(statusData).slice(0, 500));

    if (!statusRes.ok) {
      // Non-OK from PhonePe — return retriable state so client keeps polling
      console.warn(`[PhonePe verify] Non-OK response for ${merchantTransactionId}: ${statusRes.status} ${rawText.slice(0, 200)}`);
      return NextResponse.json({ paid: false, state: "PENDING", error: `PhonePe returned ${statusRes.status}` });
    }

    // PhonePe v2 API uses inconsistent field names across environments — try all variants
    const state: string = (
      statusData?.state ||
      statusData?.data?.state ||
      statusData?.orderState ||
      statusData?.data?.orderState ||
      statusData?.paymentState ||
      statusData?.data?.paymentState ||
      statusData?.order?.state ||
      ""
    ).toUpperCase();

    const phonePeTxnId: string = (
      statusData?.transactionId ||
      statusData?.data?.transactionId ||
      statusData?.order?.transactionId ||
      statusData?.data?.order?.transactionId ||
      ""
    );

    console.log(`[PhonePe verify] Resolved state="${state}" txnId="${phonePeTxnId}" for ${merchantTransactionId}`);

    if (state === "COMPLETED") {
      if (isUpgradePayment && upgradeDoc) {
        // ── Upgrade fee paid: reveal the scope unit, advance to freelancer approval ──
        if (upgradeDoc.upgradePayment?.status !== "paid") {
          upgradeDoc.upgradePayment = {
            status: "paid",
            merchantTransactionId,
            transactionId: phonePeTxnId,
            paidAt: new Date(),
          };
          upgradeDoc.status = "pending_freelancer_approval";
          await upgradeDoc.save();

          // Post system alert to execution thread
          try {
            const { Message } = require("@/models/Message");
            await Message.create({
              projectId: project._id,
              senderRole: "admin",
              content: `⚡ [Scope Upgrade Requested]\n\nClient has requested a scope upgrade for the functional unit "${upgradeDoc.proposedUnit?.name || 'New Functionality'}".\n\nThe upgrade request has been sent to the expert for approval. Once accepted, the project scope and milestone breakdown will be updated automatically.`,
            });
          } catch (msgErr) {
            console.error("[Upgrade fee msg]", msgErr);
          }
        }

        return NextResponse.json({ paid: true, projectId: project._id, isUpgrade: true });
        // ──────────────────────────────────────────────────────────────────────────
      } else if (isCustomUnitPayment) {
        // ── Commit the pending custom unit to the project scope ──────────────
        const cu = project.pendingCustomUnit;
        if (cu && cu.paymentStatus !== "paid") {
          const { Scope } = require("@/models/Scope");
          const scope = await Scope.findById(project.scopeId);
          if (scope) {
            // Strip payment meta fields before adding to scope
            const cuPlain: Record<string, any> = JSON.parse(JSON.stringify(cu));
            const { merchantTransactionId: _txn, paymentStatus: _ps, platformFee: _pf, unitPrice: _up, transactionId: _tid, paidAt: _pa, ...unitData } = cuPlain;
            scope.functionalUnits = [...(scope.functionalUnits || []), { ...unitData, addedByClient: true }];
            await scope.save();
          }

          // Mark as paid + record transaction
          project.pendingCustomUnit = {
            ...(JSON.parse(JSON.stringify(cu)) as any),
            paymentStatus: "paid",
            transactionId: phonePeTxnId,
            paidAt: new Date(),
          };
          await project.save();
        }

        return NextResponse.json({ paid: true, projectId: project._id, isCustomUnit: true });
        // ─────────────────────────────────────────────────────────────────────
      } else if (isMilestonePayment) {
        const milestone = project.milestones[milestoneIndex];
        milestone.payment = {
          ...milestone.payment,
          status: "paid",
          transactionId: phonePeTxnId,
          paidAt: new Date(),
        };
        milestone.status = "approved";

        // Credit freelancer totalEarnings
        const freelancerId = project.freelancerId || (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
        if (freelancerId) {
          const { FreelancerProfile } = require("@/models/FreelancerProfile");
          const profile = await FreelancerProfile.findOne({ userId: freelancerId });
          if (profile) {
            profile.totalEarnings = (profile.totalEarnings || 0) + (milestone.amount || 0);
            await profile.save();
          }
        }

        // Check if all milestones are approved. If so, complete project
        const allApproved = project.milestones.every((m: any) => m.status === "approved");
        if (allApproved) {
          project.status = "completed";
        }

        await project.save();

        // Create execution room chat alert message
        const { Message } = require("@/models/Message");
        await Message.create({
          projectId: project._id,
          senderRole: "admin",
          content: `💳 [Payment Released via PhonePe]\n\nClient has successfully completed the PhonePe milestone payment of ₹${(milestone.amount || 0).toLocaleString()} for Milestone ${milestoneIndex + 1}: "${milestone.title}".\n\nDeliverables and source files are now fully unlocked for access!`
        });

        return NextResponse.json({ paid: true, projectId: project._id, isMilestone: true, milestoneIndex });
      } else {
        // Mark as paid in DB (legacy platform fee payment)
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
      }
    } else if (state === "FAILED" || state === "ERROR" || state === "PAYMENT_ERROR" || state === "PAYMENT_FAILED") {
      if (isMilestonePayment) {
        project.milestones[milestoneIndex].payment.status = "failed";
      } else if (isUpgradePayment && upgradeDoc) {
        upgradeDoc.upgradePayment = { ...upgradeDoc.upgradePayment, status: "failed" };
        await upgradeDoc.save();
      } else if (!isCustomUnitPayment) {
        project.payment = { ...project.payment, status: "failed" };
        await project.save();
      }
      return NextResponse.json({ paid: false, state });
    } else {
      // Unknown state — return PENDING so the client continues polling
      console.log(`[PhonePe verify] Unknown state "${state}" for ${merchantTransactionId} — client will retry`);
      return NextResponse.json({ paid: false, state: "PENDING" });
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
    // Extract state using all known PhonePe v2 field variants
    const state: string = (
      body?.state || body?.data?.state ||
      body?.orderState || body?.data?.orderState ||
      body?.paymentState || body?.data?.paymentState || ""
    ).toUpperCase();
    const merchantTransactionId = body?.merchantOrderId || body?.data?.merchantOrderId;
    const phonePeTxnId = body?.transactionId || body?.data?.transactionId;

    if (!merchantTransactionId) {
      return NextResponse.json({ error: "No merchantOrderId" }, { status: 400 });
    }

    await connectDB();
    
    // Find project by merchantTransactionId (either platform fee, milestone, custom unit, or scope upgrade payment)
    let project = await Project.findOne({ "payment.merchantTransactionId": merchantTransactionId });
    let isMilestonePayment = false;
    let milestoneIndex = -1;
    let isCustomUnitPayment = false;
    let isUpgradePayment = false;
    let upgradeDoc: any = null;

    if (!project) {
      project = await Project.findOne({ "milestones.payment.merchantTransactionId": merchantTransactionId });
      if (project) {
        isMilestonePayment = true;
        milestoneIndex = project.milestones.findIndex((m: any) => m.payment?.merchantTransactionId === merchantTransactionId);
      }
    }

    if (!project) {
      project = await Project.findOne({ "pendingCustomUnit.merchantTransactionId": merchantTransactionId });
      if (project) {
        isCustomUnitPayment = true;
      }
    }

    if (!project) {
      const { ScopeUpgrade } = require("@/models/ScopeUpgrade");
      upgradeDoc = await ScopeUpgrade.findOne({ "upgradePayment.merchantTransactionId": merchantTransactionId });
      if (upgradeDoc) {
        isUpgradePayment = true;
        project = await Project.findById(upgradeDoc.projectId);
      }
    }

    if (!project) return NextResponse.json({ success: true }); // Idempotent

    if (state === "COMPLETED") {
      if (isUpgradePayment && upgradeDoc) {
        if (upgradeDoc.upgradePayment?.status !== "paid") {
          upgradeDoc.upgradePayment = {
            status: "paid",
            merchantTransactionId,
            transactionId: phonePeTxnId,
            paidAt: new Date(),
          };
          upgradeDoc.status = "pending_freelancer_approval";
          await upgradeDoc.save();

          // Post system alert to execution thread
          try {
            const { Message } = require("@/models/Message");
            await Message.create({
              projectId: project._id,
              senderRole: "admin",
              content: `⚡ [Scope Upgrade Requested]\n\nClient has requested a scope upgrade for the functional unit "${upgradeDoc.proposedUnit?.name || 'New Functionality'}".\n\nThe upgrade request has been sent to the expert for approval. Once accepted, the project scope and milestone breakdown will be updated automatically.`,
            });
          } catch (msgErr) {
            console.error("[Upgrade fee msg callback]", msgErr);
          }
        }
      } else if (isCustomUnitPayment) {
        const cu = project.pendingCustomUnit;
        if (cu && cu.paymentStatus !== "paid") {
          const { Scope } = require("@/models/Scope");
          const scope = await Scope.findById(project.scopeId);
          if (scope) {
            const cuPlain = JSON.parse(JSON.stringify(cu));
            const { merchantTransactionId: _txn, paymentStatus: _ps, platformFee: _pf, unitPrice: _up, transactionId: _tid, paidAt: _pa, ...unitData } = cuPlain;
            scope.functionalUnits = [...(scope.functionalUnits || []), { ...unitData, addedByClient: true }];
            await scope.save();
          }

          project.pendingCustomUnit = {
            ...(JSON.parse(JSON.stringify(cu)) as any),
            paymentStatus: "paid",
            transactionId: phonePeTxnId,
            paidAt: new Date(),
          };
          await project.save();
        }
      } else if (isMilestonePayment) {
        const milestone = project.milestones[milestoneIndex];
        if (milestone.payment && milestone.payment.status !== "paid") {
          milestone.payment.status = "paid";
          milestone.payment.transactionId = phonePeTxnId;
          milestone.payment.paidAt = new Date();
          milestone.status = "approved";

          const freelancerId = project.freelancerId || (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
          if (freelancerId) {
            const { FreelancerProfile } = require("@/models/FreelancerProfile");
            const profile = await FreelancerProfile.findOne({ userId: freelancerId });
            if (profile) {
              profile.totalEarnings = (profile.totalEarnings || 0) + (milestone.amount || 0);
              await profile.save();
            }
          }

          const allApproved = project.milestones.every((m: any) => m.status === "approved");
          if (allApproved) {
            project.status = "completed";
          }

          await project.save();

          const { Message } = require("@/models/Message");
          await Message.create({
            projectId: project._id,
            senderRole: "admin",
            content: `💳 [Payment Released via Webhook]\n\nClient has successfully completed the PhonePe milestone payment of ₹${(milestone.amount || 0).toLocaleString()} for Milestone ${milestoneIndex + 1}: "${milestone.title}".\n\nDeliverables and source files are now fully unlocked for access!`
          });
        }
      } else {
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
      }
    } else if (state === "FAILED" || state === "ERROR" || state === "PAYMENT_ERROR" || state === "PAYMENT_FAILED") {
      if (isMilestonePayment) {
        project.milestones[milestoneIndex].payment.status = "failed";
        await project.save();
      } else if (isUpgradePayment && upgradeDoc) {
        upgradeDoc.upgradePayment = { ...upgradeDoc.upgradePayment, status: "failed" };
        await upgradeDoc.save();
      } else if (isCustomUnitPayment) {
        if (project.pendingCustomUnit) {
          project.pendingCustomUnit.paymentStatus = "failed";
          await project.save();
        }
      } else {
        project.payment = { ...project.payment, status: "failed" };
        await project.save();
      }
    }

    // PhonePe requires a 200 response
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PhonePe callback]", err);
    return NextResponse.json({ success: true }); // Always 200 to PhonePe
  }
}
