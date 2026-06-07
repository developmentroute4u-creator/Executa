import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Dispute } from "@/models/Dispute";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);

  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    // Auto-heal: Ensure all projects marked as "disputed" have an active Dispute document
    const disputedProjects = await Project.find({ status: "disputed" }).lean();
    for (const p of disputedProjects) {
      const activeDispute = await Dispute.findOne({ projectId: p._id, status: "active" });
      if (!activeDispute) {
        await Dispute.create({
          projectId: p._id,
          proposerId: p.clientId,
          proposerRole: "client",
          reason: "Platform Dispute Lock Active.",
          details: "This project has been placed in a disputed state. Admin review required.",
          status: "active",
          platformAudit: {
            milestonesTotal: p.milestones?.length || 0,
            milestonesOverdue: p.milestones?.filter((m: any) => m.status === "pending" && m.dueDate && new Date(m.dueDate) < new Date()).length || 0,
            overdueDaysMax: 0,
            freelancerInactivityHours: 0,
            clientInactivityHours: 0,
            auditVerdict: "Requires Manual Mediation: Quality criteria, scope boundaries, or custom terms must be analyzed manually by administration."
          }
        });
      }
    }

    const disputesList = await Dispute.find({}).sort({ createdAt: -1 }).lean();

    const disputes = await Promise.all(
      disputesList.map(async (d) => {
        const project = await Project.findById(d.projectId).lean() as any;
        let projectTitle = "Deleted Project";
        let clientName = "Deleted Client";
        let freelancerName = "Unassigned";

        if (project) {
          projectTitle = project.title || "Untitled Project";
          const client = await User.findById(project.clientId).lean() as any;
          if (client) {
            clientName = client.name || client.email || "N/A";
          }
          const freelancerId = project.freelancerId || (project.assignedFreelancers && project.assignedFreelancers[0]?.userId);
          if (freelancerId) {
            const freelancer = await User.findById(freelancerId).lean() as any;
            if (freelancer) {
              freelancerName = freelancer.name || freelancer.email || "N/A";
            }
          }
        }

        const proposer = await User.findById(d.proposerId).lean() as any;
        const proposerName = proposer ? (proposer.name || proposer.email) : "Unknown User";

        return {
          ...d,
          projectTitle,
          clientName,
          freelancerName,
          proposerName,
        };
      })
    );

    return NextResponse.json({ disputes });
  } catch (err: any) {
    console.error("[GET_ADMIN_DISPUTES_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
