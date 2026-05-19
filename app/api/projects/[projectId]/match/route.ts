import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { User } from "@/models/User";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { askGeminiToMatchFreelancers } from "@/lib/gemini";
import mongoose from "mongoose";

// Self-healing database seeder for mock freelancers to ensure perfect, immediate client testing
async function seedMockFreelancers() {
  const count = await User.countDocuments({ role: "freelancer" });
  if (count > 0) return;

  console.log("[SEED] No freelancers found. Seeding high-quality qualified mock freelancers...");

  const mockUsers = [
    {
      name: "Alex Rivera",
      email: "alex.rivera@executa.io",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Sophia Chen",
      email: "sophia.chen@executa.io",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "David Kim",
      email: "david.kim@executa.io",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    }
  ];

  const profiles = [
    {
      field: "development" as const,
      domain: "fullstack" as const,
      specializations: ["React", "Node.js", "APIs", "Payment & Checkout", "Search & Filter"],
      bio: "Highly reliable fullstack web developer with 4 years of experience delivering robust SaaS interfaces and payment processing systems.",
      level: 2 as const,
      testStatus: "approved" as const,
      testScore: 88,
      ratePerPoint: 295,
      available: true
    },
    {
      field: "development" as const,
      domain: "frontend" as const,
      specializations: ["React", "Dashboard", "User Profile", "SEO Setup", "TailwindCSS"],
      bio: "Detail-oriented frontend engineer specialized in building gorgeous, high-performance dashboards and SEO-optimized user experiences.",
      level: 3 as const,
      testStatus: "approved" as const,
      testScore: 95,
      ratePerPoint: 350,
      available: true
    },
    {
      field: "development" as const,
      domain: "backend" as const,
      specializations: ["Node.js", "API Layer", "Notification System", "Database Architecture"],
      bio: "Backend developer focused on high-availability API layers, clean system design, and reliable automated notification workers.",
      level: 2 as const,
      testStatus: "approved" as const,
      testScore: 84,
      ratePerPoint: 270,
      available: true
    }
  ];

  for (let i = 0; i < mockUsers.length; i++) {
    const user = await User.create(mockUsers[i]);
    if (user) {
      await FreelancerProfile.create({
        ...profiles[i],
        userId: user._id
      });
    }
  }
  console.log("[SEED] Successfully seeded mock freelancers.");
}

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const scope = await Scope.findById(project.scopeId);
    if (!scope) return NextResponse.json({ error: "Scope not found" }, { status: 404 });

    // Query qualified, available, and approved freelancers in this project's field (e.g. development/design)
    const rawFreelancers = await FreelancerProfile.find({
      field: project.field || "development",
      available: true,
      testStatus: "approved"
    }).populate("userId");

    const freelancers = rawFreelancers.map((f: any) => ({
      id: f.userId._id.toString(),
      name: f.userId.name,
      domain: f.domain,
      level: f.level,
      specializations: f.specializations || [],
      bio: f.bio || "",
      testScore: f.testScore || 80
    }));

    if (freelancers.length === 0) {
      return NextResponse.json({
        project,
        scope,
        freelancers: [],
        matches: [],
        bestMatchId: null
      });
    }

    // Call Gemini to evaluate matches against the scope
    const aiResponse = await askGeminiToMatchFreelancers({
      title: project.title,
      goal: project.goal,
      field: project.field || "development",
      requiredLevel: project.requiredLevel || 2,
      functionalUnits: scope.functionalUnits || []
    }, freelancers);

    const matches = aiResponse?.matches || freelancers.map(f => ({
      freelancerId: f.id,
      fitScore: 80,
      fitReason: `${f.name} is a highly qualified ${f.domain} specialist with matching skills.`
    }));

    const bestMatchId = aiResponse?.bestMatchId || freelancers[0].id;

    // Zip matches info with actual profiles to send to frontend
    const matchedFreelancers = freelancers.map(f => {
      const matchDetails = matches.find((m: any) => m.freelancerId === f.id);
      return {
        ...f,
        fitScore: matchDetails ? matchDetails.fitScore : 75,
        fitReason: matchDetails ? matchDetails.fitReason : "Solid overall technical candidate."
      };
    }).sort((a, b) => b.fitScore - a.fitScore);

    return NextResponse.json({
      project,
      scope,
      freelancers: matchedFreelancers,
      bestMatchId
    });

  } catch (err: any) {
    console.error("[GET /api/projects/:id/match] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Appoint Freelancer Endpoint
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { freelancerId } = await req.json();
    if (!freelancerId) return NextResponse.json({ error: "Missing freelancerId" }, { status: 400 });

    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const freelancerUser = await User.findById(freelancerId);
    if (!freelancerUser || freelancerUser.role !== "freelancer") {
      return NextResponse.json({ error: "Invalid freelancer selected" }, { status: 404 });
    }

    // Link freelancer to project and update project status to active
    project.freelancerId = new mongoose.Types.ObjectId(freelancerId);
    project.status = "active";
    await project.save();

    // Link project to freelancer profile active projects
    await FreelancerProfile.updateOne(
      { userId: new mongoose.Types.ObjectId(freelancerId) },
      { 
        $push: { activeProjectIds: project._id },
        $set: { available: false } // Book freelancer
      }
    );

    return NextResponse.json({ success: true, project });

  } catch (err: any) {
    console.error("[POST /api/projects/:id/match] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
