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

    // Call Gemini
    const upgradeData = await askGeminiForScopeUpgrade(scope, { whatToAdd, howItWorks, whyNeeded }, project.field);
    if (!upgradeData) {
      return NextResponse.json({ error: "Failed to generate upgrade proposal via AI" }, { status: 500 });
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
    const currentPrice = calculatePrice(currentScore, currentAvgRate).total;

    const newScore = currentScore + score;
    // Assuming effortLevel might stay the same or jump (simplified for now to use current level rate)
    const newRateRange = getRateRange(project.field || "development", scope.effortLevel);
    const newAvgRate = Math.round((newRateRange.min + newRateRange.max) / 2);
    const newPrice = calculatePrice(newScore, newAvgRate).total;

    const costImpact = newPrice - currentPrice;

    const upgrade = await ScopeUpgrade.create({
      projectId: project._id,
      originalScopeId: scope._id,
      status: "draft",
      requestDetails: { whatToAdd, howItWorks, whyNeeded },
      proposedUnit,
      scopeImpactSummary: upgradeData.scopeImpactSummary,
      deliverableImpact: upgradeData.deliverableImpact,
      costImpact,
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
