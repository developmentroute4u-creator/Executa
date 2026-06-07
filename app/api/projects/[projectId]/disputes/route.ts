import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Dispute } from "@/models/Dispute";
import { Message } from "@/models/Message";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reason, details } = await req.json();
    if (!reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 });

    await connectDB();
    const userId = (session.user as any).id;

    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isClient = project.clientId.toString() === userId;
    const isFreelancer = project.freelancerId?.toString() === userId || 
      project.assignedFreelancers?.some((f: any) => f.userId.toString() === userId);

    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: "Forbidden: You are not a member of this project" }, { status: 403 });
    }

    const proposerRole = isClient ? "client" : "freelancer";

    // ─── COMPUTE AUTOMATED PLATFORM AUDIT METRICS ───
    const milestones = project.milestones || [];
    const milestonesTotal = milestones.length;
    let milestonesOverdue = 0;
    let overdueDaysMax = 0;
    const now = new Date();

    milestones.forEach((m: any) => {
      if (m.status !== "approved" && m.dueDate && new Date(m.dueDate) < now) {
        milestonesOverdue++;
        const diffMs = now.getTime() - new Date(m.dueDate).getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > overdueDaysMax) {
          overdueDaysMax = diffDays;
        }
      }
    });

    // Fetch last messages to assess inactivity
    const chatMessages = await Message.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(100).lean();
    const lastFreelancerMsg = chatMessages.find((m: any) => m.senderRole === "freelancer");
    const lastClientMsg = chatMessages.find((m: any) => m.senderRole === "client");

    const lastFreelancerMessageAt = lastFreelancerMsg ? new Date(lastFreelancerMsg.createdAt) : undefined;
    const lastClientMessageAt = lastClientMsg ? new Date(lastClientMsg.createdAt) : undefined;

    const freelancerInactivityHours = lastFreelancerMessageAt
      ? (now.getTime() - lastFreelancerMessageAt.getTime()) / (1000 * 60 * 60)
      : 9999;

    const clientInactivityHours = lastClientMessageAt
      ? (now.getTime() - lastClientMessageAt.getTime()) / (1000 * 60 * 60)
      : 9999;

    // Determine auditVerdict
    let auditVerdict = "Requires Manual Mediation: Quality criteria, scope boundaries, or custom terms must be analyzed manually by administration.";

    if (proposerRole === "client") {
      if (reason.toLowerCase().includes("unresponsive") || reason.toLowerCase().includes("inactive")) {
        if (freelancerInactivityHours > 48) {
          auditVerdict = `Legitimate: The expert team has been completely inactive for ${Math.round(freelancerInactivityHours)} hours.`;
        } else {
          auditVerdict = `Suspected False Alarm: The expert team is active and sent a message ${Math.round(freelancerInactivityHours)} hours ago.`;
        }
      } else if (reason.toLowerCase().includes("deadline") || reason.toLowerCase().includes("missed")) {
        if (milestonesOverdue > 0) {
          auditVerdict = `Legitimate: There are ${milestonesOverdue} milestone(s) overdue by up to ${overdueDaysMax} days.`;
        } else {
          auditVerdict = `Suspected False Alarm: All active milestones are currently within their target schedule deadlines.`;
        }
      }
    } else if (proposerRole === "freelancer") {
      if (reason.toLowerCase().includes("unresponsive")) {
        if (clientInactivityHours > 72) {
          auditVerdict = `Legitimate: The client has been inactive for ${Math.round(clientInactivityHours)} hours.`;
        } else {
          auditVerdict = `Suspected False Alarm: The client has sent a message within the last ${Math.round(clientInactivityHours)} hours.`;
        }
      }
    }

    // ─── SAVE DISPUTE DOCUMENT ───
    const dispute = await Dispute.create({
      projectId: project._id,
      proposerId: new mongoose.Types.ObjectId(userId),
      proposerRole,
      reason,
      details,
      status: "active",
      platformAudit: {
        milestonesTotal,
        milestonesOverdue,
        overdueDaysMax,
        lastFreelancerMessageAt,
        lastClientMessageAt,
        freelancerInactivityHours,
        clientInactivityHours,
        auditVerdict,
      },
    });

    // ─── UPDATE PROJECT STATUS ───
    project.status = "disputed";
    await project.save();

    // ─── POST CHAT NOTIFICATION MESSAGE ───
    const sideName = proposerRole === "client" ? "client" : "expert team";
    const conflictMsg = `⚠️ [Executa Support Alert]\n\nThe ${sideName} has officially flagged a conflict.\n\nReason: "${reason}"\n${details ? `Details: "${details}"\n` : ""}\nLIVE AUDIT ENGAGED: Executa's senior audit panel has been alerted and will inspect this secure chat thread and scope functional definitions. Project parameters, communications, and deliverables are under immediate platform review.`;

    const message = await Message.create({
      projectId: project._id,
      senderRole: "admin",
      content: conflictMsg,
    });

    return NextResponse.json({ success: true, dispute, message });

  } catch (err: any) {
    console.error("[POST_DISPUTES_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
