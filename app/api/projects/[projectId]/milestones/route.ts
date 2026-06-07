import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { Message } from "@/models/Message";
import mongoose from "mongoose";

// PATCH: Handles milestone actions ("submit" by freelancer, or direct "approve" override)
export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, milestoneIndex, submissionUrl, submissionNotes } = await req.json();

  if (milestoneIndex === undefined || milestoneIndex < 0) {
    return NextResponse.json({ error: "milestoneIndex is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;

    // ───────────────── ACTION: SUBMIT DELIVERABLES ─────────────────
    if (action === "submit") {
      // Verify sender is the assigned freelancer
      const isFreelancer = project.freelancerId?.toString() === userId || 
        project.assignedFreelancers?.some((f: any) => f.userId.toString() === userId);

      if (!isFreelancer) {
        return NextResponse.json({ error: "Forbidden: Only the assigned freelancer can submit deliverables." }, { status: 403 });
      }

      if (!project.milestones[milestoneIndex]) {
        return NextResponse.json({ error: "Invalid milestone index" }, { status: 400 });
      }

      const milestone = project.milestones[milestoneIndex];
      milestone.status = "submitted";
      milestone.submissionUrl = submissionUrl;
      milestone.submissionNotes = submissionNotes;
      milestone.submittedAt = new Date();

      await project.save();

      // Post execution room system alert message
      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `🚀 [Milestone Deliverable Submitted]\n\nThe execution team has submitted deliverables for Milestone ${milestoneIndex + 1}: "${milestone.title}".\n\nClient partner: Please review deliverables and release the escrow payment of ₹${(milestone.amount || 0).toLocaleString()} to unlock full access to the source code files.`
      });

      return NextResponse.json({ success: true, project });
    }

    // ───────────────── ACTION: APPROVE & RELEASE ESCROW ─────────────────
    if (action === "approve") {
      // Verify sender is the client who owns the project
      if (project.clientId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden: Only the client who owns the project can release payments." }, { status: 403 });
      }

      if (!project.milestones[milestoneIndex]) {
        return NextResponse.json({ error: "Invalid milestone index" }, { status: 400 });
      }

      const milestone = project.milestones[milestoneIndex];
      if (milestone.status !== "submitted") {
        return NextResponse.json({ error: "Milestone is not in submitted state" }, { status: 400 });
      }

      // Check if freelancer profile has bank details (warn but allow manual release if forced)
      const freelancerId = project.freelancerId || (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
      if (!freelancerId) {
        return NextResponse.json({ error: "No freelancer is assigned to this project" }, { status: 400 });
      }

      const profile = await FreelancerProfile.findOne({ userId: freelancerId });
      if (!profile) {
        return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
      }

      // Mark milestone as approved/paid
      milestone.status = "approved";
      if (!milestone.payment) {
        milestone.payment = { status: "paid" };
      } else {
        milestone.payment.status = "paid";
        milestone.payment.paidAt = new Date();
      }

      // Add to freelancer total earnings
      profile.totalEarnings = (profile.totalEarnings || 0) + (milestone.amount || 0);
      await profile.save();

      // Check if all milestones are approved. If so, complete project
      const allApproved = project.milestones.every((m: any) => m.status === "approved");
      if (allApproved) {
        project.status = "completed";
      }

      await project.save();

      // Post execution room system alert message
      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `💳 [Escrow Released Directly]\n\nClient has approved Milestone ${milestoneIndex + 1} and released the payment of ₹${(milestone.amount || 0).toLocaleString()} directly to the expert's bank coordinates (Account Number / UPI ID).\n\nSource code repository and deliverable details are now fully unlocked.`
      });

      return NextResponse.json({ success: true, project });
    }

    return NextResponse.json({ error: "Unsupported milestone action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Milestone operation error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
