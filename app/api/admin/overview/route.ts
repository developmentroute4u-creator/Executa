import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { ClientProfile } from "@/models/ClientProfile";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { Test } from "@/models/Test";

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);
  
  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    // 1. Get all Freelancers — start from FreelancerProfile + enrich with User
    const freelancerProfiles = await FreelancerProfile.find({}).lean();
    const freelancers = await Promise.all(
      freelancerProfiles.map(async (fp) => {
        const u = await User.findById(fp.userId).lean() as any;
        const latestTest = await Test.findOne({ freelancerId: fp.userId }).sort({ createdAt: -1 }).lean() as any;
        return {
          ...fp,
          name: u?.name || "N/A",
          email: u?.email || "N/A",
          suspended: u?.suspended || false,
          // Prefer Test document status over FreelancerProfile.testStatus for freshness
          testStatus: latestTest ? latestTest.status : fp.testStatus || "not_started",
          testScore: latestTest?.evaluation?.total || fp.testScore || null,
          testId: latestTest ? latestTest._id : null,
          // Pass evaluation so admin panel can show level badge
          evaluation: latestTest?.evaluation || null,
        };
      })
    );

    // 2. Get all Clients — start from ALL users with role="client" (not just those with a ClientProfile)
    // This ensures clients who haven't finished onboarding still appear in the registry
    const clientUsers = await User.find({ role: "client" }).lean() as any[];
    const clients = await Promise.all(
      clientUsers.map(async (u) => {
        // Try to find their ClientProfile (might not exist if onboarding incomplete)
        const cp = await ClientProfile.findOne({ userId: u._id }).lean() as any;
        const projectCount = await Project.countDocuments({ clientId: u._id });
        const completedProjects = await Project.find({ clientId: u._id, status: "completed" }).lean() as any[];
        const totalSpend = completedProjects.reduce((sum: number, p: any) => sum + (p.pricing?.total || 0), 0);
        return {
          _id: cp?._id || u._id,  // Use ClientProfile _id if available
          userId: u._id,
          name: u.name || "N/A",
          email: u.email || "N/A",
          suspended: u.suspended || false,
          company: cp?.company || "",
          industry: cp?.industry || "",
          website: cp?.website || "",
          onboardingStep: cp?.onboardingStep || 0,
          projectCount,
          totalSpend,
        };
      })
    );

    // 3. Get all Projects with client + freelancer names
    const projectList = await Project.find({}).sort({ createdAt: -1 }).lean();
    const projects = await Promise.all(
      projectList.map(async (p) => {
        const c = await User.findById(p.clientId).lean() as any;
        const f = p.freelancerId ? await User.findById(p.freelancerId).lean() as any : null;
        return {
          ...p,
          clientName: c?.name || "N/A",
          freelancerName: f?.name || null,
        };
      })
    );

    // 4. Platform stats
    const totalFreelancers = freelancerProfiles.length;
    const totalClients = clientUsers.length;
    const totalProjects = projectList.length;
    const activeProjects = projectList.filter(p => p.status === "active").length;
    const disputedProjects = projectList.filter(p => p.status === "disputed").length;
    const completedProjects = projectList.filter(p => p.status === "completed").length;
    
    // Count tests that are waiting for review (submitted OR under_review)
    const pendingCalibration = freelancers.filter(f =>
      f.testStatus === "submitted" || f.testStatus === "under_review"
    ).length;
    
    const totalRevenue = (projectList as any[])
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + (p.pricing?.total || 0), 0);

    const platformFeeRevenue = (projectList as any[])
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + (p.pricing?.executionFee || 0) + (p.pricing?.scopeFee || 0), 0);

    return NextResponse.json({
      freelancers,
      clients,
      projects,
      stats: {
        totalFreelancers,
        totalClients,
        totalProjects,
        activeProjects,
        disputedProjects,
        completedProjects,
        pendingCalibration,
        totalRevenue,
        platformFeeRevenue,
      }
    });
  } catch (err: any) {
    console.error("[ADMIN_OVERVIEW_ERROR]", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
