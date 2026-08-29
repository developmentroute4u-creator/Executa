import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
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
      email: "alex.rivera@findade.com",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Sophia Chen",
      email: "sophia.chen@findade.com",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "David Kim",
      email: "david.kim@findade.com",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Elena Rostova",
      email: "elena.rostova@findade.com",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Marcus Vance",
      email: "marcus.vance@findade.com",
      password: "password123",
      role: "freelancer" as const,
      onboardingComplete: true
    },
    {
      name: "Isabella Rossi",
      email: "isabella.rossi@findade.com",
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
  let session = await getServerSession(authOptions);
  let loggedInUserId = (session?.user as any)?.id;

  if (!loggedInUserId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      loggedInUserId = token.id as string;
    }
  }

  if (!loggedInUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    await seedMockFreelancers();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const scope = await Scope.findById(project.scopeId);
    if (!scope) return NextResponse.json({ error: "Scope not found" }, { status: 404 });

    // Build query based on project field to ensure we only match relevant specialists
    const query: any = {
      testStatus: "approved",
      $or: [
        { available: true },
        { userId: project.freelancerId }
      ]
    };

    if (project.field === "design") {
      query.field = "design";
    } else if (project.field === "development") {
      query.field = "development";
    }

    const rawFreelancers = await FreelancerProfile.find(query);

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
            testScore: f.testScore || 40,
            available: f.available
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

    if (!aiResponse || !aiResponse.matches || !aiResponse.bestMatches) {
      return NextResponse.json({ 
        error: "AI matching engine was unable to evaluate candidate alignments. Please check your Gemini API key and model availability." 
      }, { status: 500 });
    }

    const matches = aiResponse.matches;
    const bestMatches = aiResponse.bestMatches;

    // Zip matches info with actual profiles to send to frontend and slice to return top 5 matches
    const matchedFreelancers = freelancers.map(f => {
      const matchDetails = matches.find((m: any) => m.freelancerId === f.id);
      return {
        ...f,
        fitScore: matchDetails ? matchDetails.fitScore : 0,
        fitReason: matchDetails ? matchDetails.fitReason : "No matching capabilities identified by AI evaluation."
      };
    }).sort((a, b) => b.fitScore - a.fitScore);

    // Calculate split pricing based on functional units sum
    let designTotalScore = 0;
    let devTotalScore = 0;
    const units = scope.functionalUnits || [];
    
    if (project.field === "design_development") {
      units.forEach((u: any) => {
        const str = (u.name + " " + u.description).toLowerCase();
        if (str.includes("design") || str.includes("ui") || str.includes("ux") || str.includes("wireframe") || str.includes("mockup")) {
          designTotalScore += u.unitScore || 0;
        } else {
          devTotalScore += u.unitScore || 0;
        }
      });
      
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
  let session = await getServerSession(authOptions);
  let loggedInUserId = (session?.user as any)?.id;

  if (!loggedInUserId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      loggedInUserId = token.id as string;
    }
  }

  if (!loggedInUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    let freelancersToAppoint = body.freelancersToAppoint;

    // Support single freelancerId payload from modal click
    if (!freelancersToAppoint && body.freelancerId) {
      freelancersToAppoint = [{
        freelancerId: body.freelancerId,
        role: body.role || "fullstack",
        pricingCut: 1
      }];
    }

    if (!freelancersToAppoint || !Array.isArray(freelancersToAppoint) || freelancersToAppoint.length === 0) {
      return NextResponse.json({ error: "Missing freelancer selection" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Reset assigned list
    project.assignedFreelancers = [];

    for (const assignment of freelancersToAppoint) {
      const freelancerUser = await User.findById(assignment.freelancerId);
      if (!freelancerUser) {
        return NextResponse.json({ error: `Selected specialist not found: ${assignment.freelancerId}` }, { status: 404 });
      }

      project.assignedFreelancers.push({
        userId: new mongoose.Types.ObjectId(assignment.freelancerId),
        role: assignment.role || (project.field === "design" ? "design" : "fullstack"),
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
          $addToSet: { activeProjectIds: project._id },
          $set: { available: false } // Book freelancer
        }
      );
    }

    project.status = "pending";
    await project.save();

    return NextResponse.json({ success: true, project });

  } catch (err: any) {
    console.error("[POST /api/projects/:id/match] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to appoint specialist" }, { status: 500 });
  }
}
