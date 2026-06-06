import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { askGeminiForScopeUpgrade } from "@/lib/gemini";

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
      return NextResponse.json({ error: "Forbidden: Only client can propose custom units" }, { status: 403 });
    }

    const scope = await Scope.findById(project.scopeId).lean() as any;
    if (!scope) return NextResponse.json({ error: "Scope not found" }, { status: 404 });

    // Call Gemini with safe try-catch wrapper and fallback
    let upgradeData = null;
    try {
      upgradeData = await askGeminiForScopeUpgrade(scope, { whatToAdd, howItWorks, whyNeeded }, project.field);
    } catch (e: any) {
      console.warn(`[GEMINI CUSTOM UNIT API ERROR] ${e.message || e}. Falling back to offline engine.`);
    }

    if (!upgradeData) {
      console.log("[POST /api/projects/:id/ai-custom-unit] Generating offline fallback custom unit...");
      const score = 20;
      upgradeData = {
        proposedUnit: {
          name: whatToAdd || "Custom Module",
          description: howItWorks || "Custom functionality based on client description.",
          included: ["Feature implementation matching user journey description"],
          excluded: ["Advanced custom integrations (available as upgrade)"],
          deliverables: ["Functional module matching client guidelines"],
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
        scopeImpactSummary: `Offline fallback custom unit generated for: ${whatToAdd}.`,
        deliverableImpact: ["Custom features file", "Workspace component configuration"]
      };
    }

    // Prepare the generated unit
    const proposedUnit = upgradeData.proposedUnit;
    proposedUnit.id = proposedUnit.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    proposedUnit.addedByClient = true;
    
    // We don't save anything here, we just return the unit to the frontend to review and accept
    return NextResponse.json({ success: true, proposedUnit, impact: upgradeData.scopeImpactSummary });

  } catch (err: any) {
    console.error("[SCOPE_AI_CUSTOM_UNIT_POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
