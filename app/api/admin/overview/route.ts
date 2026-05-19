import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { ClientProfile } from "@/models/ClientProfile";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { Test } from "@/models/Test";
import { Scope } from "@/models/Scope";

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);
  
  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    // 1. Get all Freelancers
    const freelancerProfiles = await FreelancerProfile.find({}).lean();
    const freelancers = await Promise.all(
      freelancerProfiles.map(async (fp) => {
        const u = await User.findById(fp.userId).lean();
        const latestTest = await Test.findOne({ freelancerId: fp.userId }).sort({ createdAt: -1 }).lean();
        return {
          ...fp,
          name: (u as any)?.name || "N/A",
          email: (u as any)?.email || "N/A",
          testStatus: latestTest ? latestTest.status : "not_started",
          testScore: latestTest?.evaluation?.total || null,
          testId: latestTest ? latestTest._id : null,
        };
      })
    );

    // 2. Get all Clients
    const clientProfiles = await ClientProfile.find({}).lean();
    const clients = await Promise.all(
      clientProfiles.map(async (cp) => {
        const u = await User.findById(cp.userId).lean();
        return {
          ...cp,
          name: (u as any)?.name || "N/A",
          email: (u as any)?.email || "N/A",
        };
      })
    );

    // 3. Get all Projects
    const projectList = await Project.find({}).sort({ createdAt: -1 }).lean();
    const projects = await Promise.all(
      projectList.map(async (p) => {
        const c = await User.findById(p.clientId).lean();
        const f = p.freelancerId ? await User.findById(p.freelancerId).lean() : null;
        return {
          ...p,
          clientName: (c as any)?.name || "N/A",
          freelancerName: (f as any)?.name || null,
        };
      })
    );

    return NextResponse.json({
      freelancers,
      clients,
      projects,
    });
  } catch (err: any) {
    console.error("[ADMIN_OVERVIEW_ERROR]", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
