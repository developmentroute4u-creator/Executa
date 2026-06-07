import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { ScopeUpgrade } from "@/models/ScopeUpgrade";
import { Message } from "@/models/Message";
import { calculatePrice, getEffortLevel, getRateRange } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string, upgradeId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action } = await req.json();
    if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

    await connectDB();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const upgrade = await ScopeUpgrade.findById(params.upgradeId);
    if (!upgrade) return NextResponse.json({ error: "Upgrade not found" }, { status: 404 });

    const isClient = project.clientId.toString() === userId;
    const isFreelancer = project.freelancerId && project.freelancerId.toString() === userId;
    
    let isAssigned = false;
    if (project.assignedFreelancers && project.assignedFreelancers.length > 0) {
      isAssigned = project.assignedFreelancers.some((a: any) => a.userId.toString() === userId);
    }

    if (action === "client_approve") {
      if (!isClient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      
      upgrade.status = "pending_freelancer_approval";
      await upgrade.save();
      
      return NextResponse.json({ success: true, upgrade });
    }

    if (action === "freelancer_approve") {
      if (!isFreelancer && !isAssigned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      upgrade.status = "approved";
      await upgrade.save();

      // VERSIONING LOGIC
      const currentScope = await Scope.findById(project.scopeId).lean() as any;
      if (!currentScope) return NextResponse.json({ error: "Scope missing" }, { status: 500 });

      // Create new cloned scope
      const newFunctionalUnits = [...(currentScope.functionalUnits || []), upgrade.proposedUnit];
      const newTotalScore = currentScope.totalEffortScore + upgrade.effortImpact;
      const newEffortLevel = getEffortLevel(newTotalScore);

      const newScope = await Scope.create({
        projectId: currentScope.projectId,
        projectSummary: currentScope.projectSummary,
        functionalUnits: newFunctionalUnits,
        overallIncluded: currentScope.overallIncluded,
        overallExcluded: currentScope.overallExcluded,
        expectedDeliverables: currentScope.expectedDeliverables,
        requiredCapabilities: currentScope.requiredCapabilities,
        totalEffortScore: newTotalScore,
        effortLevel: newEffortLevel,
        timeline: {
          estimated: Math.ceil(newTotalScore / 15),
          unit: currentScope.timeline?.unit || "weeks"
        },
        revisionRules: currentScope.revisionRules,
        upgradeRules: currentScope.upgradeRules,
        status: "locked",
        version: (currentScope.version || 1) + 1,
        previousScopeId: currentScope._id,
        confirmedAt: new Date()
      });

      // Update Project
      const currentRateRange = getRateRange(project.field || "development", newEffortLevel);
      const avgRate = Math.round((currentRateRange.min + currentRateRange.max) / 2);
      
      const ratePerPoint = project.pricing?.ratePerPoint || avgRate;
      const newPricing = calculatePrice(newTotalScore, ratePerPoint);

      project.scopeId = newScope._id;
      project.requiredLevel = newEffortLevel;
      project.pricing = { 
        ...newPricing, 
        ratePerPoint, 
        accountabilityMode: project.pricing?.accountabilityMode || "basic" 
      };

      // Add a new milestone for this scope upgrade
      const expertCost = upgrade.expertCost || Math.round(upgrade.costImpact / 1.05);
      const upgradeMilestone = {
        title: `Scope Upgrade: ${upgrade.proposedUnit.name}`,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
        status: "pending" as const,
        deliverables: upgrade.proposedUnit.deliverables && upgrade.proposedUnit.deliverables.length > 0
          ? upgrade.proposedUnit.deliverables
          : ["Upgrade implementation"],
        amount: expertCost,
        payment: { status: "pending" as const }
      };
      
      project.milestones.push(upgradeMilestone);
      await project.save();

      // Post Chat Message
      await Message.create({
        projectId: project._id,
        senderId: userId,
        senderRole: userRole,
        content: `🎉 Scope Version ${newScope.version} Approved! The "${upgrade.proposedUnit.name}" functional unit has been officially added to the active scope.`
      });

      return NextResponse.json({ success: true, upgrade, newScope });
    }

    if (action === "reject") {
      upgrade.status = "rejected";
      await upgrade.save();
      return NextResponse.json({ success: true, upgrade });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("[SCOPE_UPGRADE_PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
