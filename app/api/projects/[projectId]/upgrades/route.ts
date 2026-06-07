import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { ScopeUpgrade } from "@/models/ScopeUpgrade";
import { askGeminiForScopeUpgrade } from "@/lib/gemini";
import { calculatePrice, getRateRange } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { whatToAdd, howItWorks, whyNeeded } = await req.json();
    if (!whatToAdd || !howItWorks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    const project = await Project.findById(params.projectId).lean() as any;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.clientId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden: Only client can propose upgrades" }, { status: 403 });
    }

    const scope = await Scope.findById(project.scopeId).lean() as any;
    if (!scope) return NextResponse.json({ error: "Scope not found" }, { status: 404 });

    // Call Gemini with safe try-catch wrapper and fallback
    let upgradeData = null;
    try {
      upgradeData = await askGeminiForScopeUpgrade(scope, { whatToAdd, howItWorks, whyNeeded }, project.field);
    } catch (e: any) {
      console.warn(`[GEMINI UPGRADE API ERROR] ${e.message || e}. Falling back to offline engine.`);
    }

    if (!upgradeData) {
      console.log("[POST /api/projects/:id/upgrades] Generating offline fallback upgrade proposal...");
      const score = 20;
      upgradeData = {
        proposedUnit: {
          name: whatToAdd || "Scope Upgrade Module",
          description: howItWorks || "Custom functionality upgrade based on client requirements.",
          included: ["Feature upgrade implementation matching description"],
          excluded: ["Advanced premium configurations (available as upgrade)"],
          deliverables: ["Upgraded code features and layout deployment"],
          unitScore: score,
          effortDrivers: {
            logicDepth: 5,
            interactionDensity: 5,
            dataHandling: 5,
            dependencyLevel: 5,
            variations: 5,
            outputExpectation: 5,
            totalScore: score
          }
        },
        scopeImpactSummary: `Offline fallback generated for: ${whatToAdd}. Adds the requested functionality.`,
        deliverableImpact: ["Upgraded feature files", "Updated repository integration"]
      };
    }

    // Assign ID to proposed unit
    const proposedUnit = upgradeData.proposedUnit;
    proposedUnit.id = proposedUnit.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    proposedUnit.addedByClient = true;
    const score = Number(proposedUnit.unitScore) || 30;

    // Calculate Pricing Impact
    const currentScore = scope.totalEffortScore;
    const currentRateRange = getRateRange(project.field || "development", scope.effortLevel);
    const currentAvgRate = Math.round((currentRateRange.min + currentRateRange.max) / 2);
    
    const ratePerPoint = project.pricing?.ratePerPoint || currentAvgRate;

    const currentPriceObj = calculatePrice(currentScore, ratePerPoint);
    const newScore = currentScore + score;
    const newPriceObj = calculatePrice(newScore, ratePerPoint);

    const expertCost = newPriceObj.freelancerPrice - currentPriceObj.freelancerPrice;
    const platformFee = Math.round(expertCost * 0.05);
    const costImpact = expertCost + platformFee;

    const upgrade = await ScopeUpgrade.create({
      projectId: project._id,
      originalScopeId: scope._id,
      status: "draft",
      requestDetails: { whatToAdd, howItWorks, whyNeeded },
      proposedUnit,
      scopeImpactSummary: upgradeData.scopeImpactSummary,
      deliverableImpact: upgradeData.deliverableImpact,
      costImpact,
      expertCost,
      platformFee,
      effortImpact: score
    });

    return NextResponse.json({ success: true, upgrade });

  } catch (err: any) {
    console.error("[SCOPE_UPGRADE_POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const upgrades = await ScopeUpgrade.find({ projectId: params.projectId }).sort({ createdAt: -1 }).lean();
  
  return NextResponse.json({ upgrades });
}
