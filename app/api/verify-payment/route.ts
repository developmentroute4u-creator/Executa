export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Message } from "@/models/Message";
import { FreelancerProfile } from "@/models/FreelancerProfile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.razorpay_order_id || body.order_id || body.orderId;
    const paymentId = body.razorpay_payment_id || body.payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;
    const { projectId, milestoneIndex, type, upgradeId } = body;

    // 1. Validation: Missing fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification fields (order_id, payment_id, or signature).",
        },
        { status: 400 }
      );
    }

    // 2. Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = verifyRazorpaySignature(
      String(orderId),
      String(paymentId),
      String(signature)
    );

    if (!isValid) {
      console.error("[Razorpay Verify] Signature mismatch for order:", orderId);
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: Signature mismatch.",
        },
        { status: 400 }
      );
    }

    // 3. Signature is valid — synchronize project state in DB
    if (projectId) {
      try {
        await connectDB();
        const project = await Project.findById(projectId);

        if (project) {
          if (
            milestoneIndex !== undefined &&
            milestoneIndex !== null &&
            project.milestones &&
            project.milestones[milestoneIndex]
          ) {
            // Milestone release
            const milestone = project.milestones[milestoneIndex];
            milestone.payment = {
              status: "paid",
              transactionId: String(paymentId),
              merchantTransactionId: String(orderId),
              paidAt: new Date(),
            };
            milestone.status = "approved";

            // Credit freelancer totalEarnings
            const freelancerId =
              project.freelancerId ||
              (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
            if (freelancerId) {
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

            // Execution room chat message
            await Message.create({
              projectId: project._id,
              senderRole: "admin",
              content: `💳 [Payment Released via Razorpay]\n\nClient successfully paid ₹${(
                milestone.amount || 0
              ).toLocaleString("en-IN")} for Milestone ${Number(milestoneIndex) + 1}: "${
                milestone.title
              }" (Payment ID: ${paymentId}).\n\nDeliverables and source files are unlocked!`,
            });
          } else {
            // Platform fee or initial project payment
            project.payment = {
              status: "paid",
              transactionId: String(paymentId),
              merchantTransactionId: String(orderId),
              paidAt: new Date(),
            };
            if (project.status === "scoping" || project.status === "scope_review") {
              project.status = "matching";
            }
            await project.save();
          }
        }
      } catch (dbErr) {
        console.warn("[Razorpay Verify DB Update Notice]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    console.error("[Razorpay verify-payment error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error during verification",
      },
      { status: 500 }
    );
  }
}
