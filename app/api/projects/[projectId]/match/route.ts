import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { User } from "@/models/User";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { askGeminiToMatchFreelancers } from "@/lib/gemini";
import { calculatePrice } from "@/lib/utils";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Self-healing database seeder for mock freelancers to ensure perfect, immediate client testing
async function seedMockFreelancers() {
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
    },
    {
      name: "Elena Rostova",
      email: "elena.rostova@executa.io",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Marcus Vance",
      email: "marcus.vance@executa.io",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Isabella Rossi",
      email: "isabella.rossi@executa.io",
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
    },
    {
      field: "development" as const,
      domain: "frontend" as const,
      specializations: ["React", "CSS Animation", "Framer Motion", "Responsive Layouts"],
      bio: "Creative frontend specialist with 5 years experience crafting immersive animation pipelines and pixel-perfect design systems.",
      level: 3 as const,
      testStatus: "approved" as const,
      testScore: 91,
      ratePerPoint: 320,
      available: true
    },
    {
      field: "development" as const,
      domain: "backend" as const,
      specializations: ["Node.js", "PostgreSQL", "Redis Caching", "Docker Containerization"],
      bio: "Senior backend system engineer with a focus on low-latency data structures, distributed cache layers, and robust deployment pipelines.",
      level: 3 as const,
      testStatus: "approved" as const,
      testScore: 93,
      ratePerPoint: 340,
      available: true
    },
    {
      field: "design" as const,
      domain: "ui_ux" as const,
      specializations: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
      bio: "Expert UX/UI designer specializing in high-conversion SaaS flows and premium, pixel-perfect design systems.",
      level: 3 as const,
      testStatus: "approved" as const,
      testScore: 96,
      ratePerPoint: 310,
      available: true
    }
  ];

  for (let i = 0; i < mockUsers.length; i++) {
    const exists = await User.findOne({ email: mockUsers[i].email });
    if (!exists) {
      const user = await User.create(mockUsers[i]);
      if (user) {
        await FreelancerProfile.create({
          ...profiles[i],
          userId: user._id
        });
      }
    }
  }
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

    // Query approved and available freelancers across the entire database
    const rawFreelancers = await FreelancerProfile.find({
      testStatus: "approved",
      $or: [
        { available: true },
        { userId: project.freelancerId }
      ]
    });

    const freelancers = [];
    for (const f of rawFreelancers) {
      if (f.userId) {
        const userDoc = await User.findById(f.userId);
        if (userDoc) {
          freelancers.push({
            id: userDoc._id.toString(),
            name: userDoc.name,
            domain: f.domain,
            level: f.level,
            specializations: f.specializations || [],
            bio: f.bio || "",
            testScore: f.testScore || 40
          });
        }
      }
    }

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
      goal: (project as any).projectDescription || project.title,
      field: project.field || "development",
      requiredLevel: project.requiredLevel || 2,
      functionalUnits: scope.functionalUnits || []
    }, freelancers);

    const matches = aiResponse?.matches || freelancers.map(f => ({
      freelancerId: f.id,
      fitScore: 80,
      fitReason: `${f.name} is a highly qualified ${f.domain} specialist with matching skills.`
    }));

    const bestMatches = aiResponse?.bestMatches || [{ freelancerId: freelancers[0].id, role: "fullstack" }];

    // Zip matches info with actual profiles to send to frontend and slice to return top 5 matches
    const matchedFreelancers = freelancers.map(f => {
      const matchDetails = matches.find((m: any) => m.freelancerId === f.id);
      return {
        ...f,
        fitScore: matchDetails ? matchDetails.fitScore : 75,
        fitReason: matchDetails ? matchDetails.fitReason : "Solid overall technical candidate."
      };
    }).sort((a, b) => b.fitScore - a.fitScore).slice(0, 8);

    // Calculate split pricing based on functional units sum
    let designTotalScore = 0;
    let devTotalScore = 0;
    const units = scope.functionalUnits || [];
    
    // Fallback naive split if we can't determine it
    if (project.field === "design_development") {
      // Half and half if we don't have distinct tags
      // For a real prod app, you might use AI or keyword parsing to categorize units.
      // Since our new prompt enforces separate phases, let's just do a 50/50 split of the total unit score as a safe baseline, 
      // or try to parse 'design' vs 'development' keywords.
      units.forEach((u: any) => {
        const str = (u.name + " " + u.description).toLowerCase();
        if (str.includes("design") || str.includes("ui") || str.includes("ux") || str.includes("wireframe") || str.includes("mockup")) {
          designTotalScore += u.unitScore || 0;
        } else {
          devTotalScore += u.unitScore || 0;
        }
      });
      
      // If parsing fails to separate them cleanly, enforce an even split
      if (designTotalScore === 0 || devTotalScore === 0) {
        designTotalScore = 1;
        devTotalScore = 1;
      }
    }

    // Attach pricing split info to best matches
    const totalScore = designTotalScore + devTotalScore;
    const finalBestMatches = bestMatches.map((bm: any) => {
      let pricingCut = 1; // 100%
      if (project.field === "design_development") {
        pricingCut = bm.role === "design" ? (designTotalScore / totalScore) : (devTotalScore / totalScore);
      }
      return {
        ...bm,
        pricingCut
      };
    });

    return NextResponse.json({
      project,
      scope,
      freelancers: matchedFreelancers,
      bestMatches: finalBestMatches
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
    const { freelancersToAppoint } = await req.json(); // Expected format: [{ freelancerId, role }]
    if (!freelancersToAppoint || freelancersToAppoint.length === 0) {
      return NextResponse.json({ error: "Missing freelancersToAppoint" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Handle backward compatibility + new logic
    project.assignedFreelancers = [];

    for (const assignment of freelancersToAppoint) {
      const freelancerUser = await User.findById(assignment.freelancerId);
      if (!freelancerUser || freelancerUser.role !== "freelancer") {
        return NextResponse.json({ error: `Invalid freelancer selected: ${assignment.freelancerId}` }, { status: 404 });
      }

      project.assignedFreelancers.push({
        userId: new mongoose.Types.ObjectId(assignment.freelancerId),
        role: assignment.role || "fullstack",
        splitPrice: assignment.pricingCut || 1,
        accepted: false
      });

      // Maintain backward compatibility for single assignments
      if (freelancersToAppoint.length === 1) {
        project.freelancerId = new mongoose.Types.ObjectId(assignment.freelancerId);
      }

      // Link project to freelancer profile active projects
      await FreelancerProfile.updateOne(
        { userId: new mongoose.Types.ObjectId(assignment.freelancerId) },
        { 
          $push: { activeProjectIds: project._id },
          $set: { available: false } // Book freelancer
        }
      );
    }

    project.status = "pending";
    await project.save();

    return NextResponse.json({ success: true, project });

  } catch (err: any) {
    console.error("[POST /api/projects/:id/match] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
