export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { User } from "@/models/User";
import { getEffortLevel, getRateRange, calculatePrice } from "@/lib/utils";
import { askGeminiForScope } from "@/lib/gemini";
import { generateScope } from "@/lib/scopeGenerator";

// GET /api/projects — list client's projects
export async function GET(req: NextRequest) {
  let session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id;
  let role = (session?.user as any)?.role;

  if (!userId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userId = token.id as string;
      role = token.role as string;
    }
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const query = role === "client" ? { clientId: userId } : { freelancerId: userId };
  const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

  const populatedProjects = await Promise.all(
    projects.map(async (p) => {
      let freelancerName = null;
      if (p.freelancerId) {
        const f = await User.findById(p.freelancerId).lean();
        freelancerName = (f as any)?.name || null;
      }
      return { ...p, freelancerName };
    })
  );

  return NextResponse.json({ projects: populatedProjects });
}

// POST /api/projects — create project + generate scope
export async function POST(req: NextRequest) {
  let session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id;
  let role = (session?.user as any)?.role;

  if (!userId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userId = token.id as string;
      role = token.role as string;
    }
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      domain,
      projectDescription,
      projectProblem,
      targetUsers,
      userJourney,
      managedEntities,
      specialRequirements,
      successCriteria,
      priority,
      deadline,
    } = body;

    await connectDB();

    const domainLower = (domain || "").toLowerCase();
    const field: "development" | "design" | "design_development" =
      domainLower.includes("design") && domainLower.includes("dev")
        ? "design_development"
        : domainLower.includes("design")
        ? "design"
        : "development";

    const project = await Project.create({
      clientId: userId,
      title: title || "Untitled Project",
      field,
      projectDescription: projectDescription || "",
      projectProblem: projectProblem || "",
      targetUsers: targetUsers || "",
      userJourney: userJourney || "",
      managedEntities: managedEntities || "",
      specialRequirements: specialRequirements || "",
      successCriteria: successCriteria || "",
      priority: priority || "medium",
      deadline: deadline ? new Date(deadline) : undefined,
      status: "scoping",
    });

    if (!project) {
      throw new Error("Project creation failed in DB");
    }

    // Attempt to generate scope using AI engine with automatic fallbacks
    let generatedScope: any = null;
    try {
      generatedScope = await askGeminiForScope({
        title,
        domain: domain || "Development",
        projectDescription,
        projectProblem,
        targetUsers,
        userJourney,
        managedEntities,
        specialRequirements,
        successCriteria
      });
    } catch (e: any) {
      console.warn(`[GEMINI RATE LIMIT/ERROR] ${e.message || e}. Falling back to offline generator.`);
      generatedScope = null;
    }

    // If AI fails or returns malformed response, use the offline scope generator
    if (!generatedScope || !Array.isArray(generatedScope.functionalUnits) || generatedScope.functionalUnits.length === 0) {
      console.log("[POST /api/projects] AI scope generation unavailable. Generating offline fallback scope...");
      const result = generateScope({
        title,
        goal: successCriteria,
        businessModel: projectDescription,
        field: domain
      });
      generatedScope = {
        ...result,
        projectSummary: {
          overview: projectDescription || "A managed project scope.",
          businessGoal: successCriteria || "Achieve project success criteria.",
          primaryUsers: [targetUsers || "End Users"]
        },
        overallIncluded: [
          "Core features described in project foundation",
          "Functional units as defined in scope document",
          "Clean responsive UI view matching domain requirement"
        ],
        overallExcluded: [
          "Additional modules outside original request",
          "Production server costs and hosting licenses",
          "Continuous integration and continuous deployment pipelines"
        ],
        expectedDeliverables: [
          field === "design" ? "Figma visual layout files" : "Production-ready git repository source code"
        ],
        requiredCapabilities: [
          field === "design" ? "UI/UX Design" : field === "design_development" ? "UI/UX Design & Fullstack Development" : "Fullstack Web Development"
        ]
      };
    }

    // Calibrate totalEffortScore and timeline from results
    const rawUnits = Array.isArray(generatedScope.functionalUnits) ? generatedScope.functionalUnits : [];
    const functionalUnits = rawUnits.map((u: any, idx: number) => {
      const uName = u.name || `Functional Unit ${idx + 1}`;
      const score = Number(u.unitScore) || Number(u.effortDrivers?.totalScore) || 25;
      return {
        id: (u.id || uName).toLowerCase().replace(/\s+/g, "_"),
        name: uName,
        description: u.description || "",
        included: Array.isArray(u.included) ? u.included : [],
        excluded: Array.isArray(u.excluded) ? u.excluded : [],
        deliverables: Array.isArray(u.deliverables) ? u.deliverables : [],
        unitScore: score,
        effortDrivers: u.effortDrivers || {
          name: uName,
          logicDepth: 5, interactionDensity: 5, dataHandling: 5,
          dependencyLevel: 5, variations: 5, outputExpectation: 5,
          totalScore: score
        }
      };
    });

    const calculatedEffortScore = functionalUnits.reduce((sum: number, u: any) => sum + u.unitScore, 0);
    const totalEffortScore = Math.max(60, calculatedEffortScore);
    const weeks = Math.max(2, Math.ceil(totalEffortScore / 15));

    const formattedScope = {
      projectSummary: generatedScope.projectSummary || {
        overview: projectDescription || "A managed project.",
        businessGoal: successCriteria || "Achieve project success criteria.",
        primaryUsers: [targetUsers || "End Users"]
      },
      functionalUnits,
      overallIncluded: generatedScope.overallIncluded || [],
      overallExcluded: generatedScope.overallExcluded || [],
      expectedDeliverables: generatedScope.expectedDeliverables || [],
      requiredCapabilities: generatedScope.requiredCapabilities || [],
      totalEffortScore,
      timeline: { estimated: weeks, unit: "weeks" as const },
      revisionRules: [
        "2 revision rounds included per functional unit",
        "Revisions must be within original scope definition",
        "Change requests outside scope require upgrade approval"
      ],
      upgradeRules: [
        "New functional units can be added via upgrade request",
        "Upgrades are priced at current rate per effort point",
        "Timeline adjusts proportionally with upgrades"
      ]
    };

    const effortLevel = getEffortLevel(formattedScope.totalEffortScore);

    const scope = await Scope.create({
      projectId: project._id,
      ...formattedScope,
      effortLevel,
      status: "draft",
    });

    // Update project with scope + pricing
    const rateRange = getRateRange(field, effortLevel);
    const avgRate = Math.round((rateRange.min + rateRange.max) / 2);
    const pricing = calculatePrice(formattedScope.totalEffortScore, avgRate);

    await Project.findByIdAndUpdate(project._id, {
      scopeId: scope?._id,
      requiredLevel: effortLevel,
      pricing: { ...pricing, ratePerPoint: avgRate, accountabilityMode: "basic" },
      status: "scope_review",
    });

    return NextResponse.json({ projectId: project._id.toString(), scopeId: scope?._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("[CREATE_PROJECT]", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}
