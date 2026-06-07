import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { ScopeUpgrade } from "@/models/ScopeUpgrade";
import { Message } from "@/models/Message";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { User } from "@/models/User";
import { Test } from "@/models/Test";
import { calculatePrice, getEffortLevel, getRateRange } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);

  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action specifier" }, { status: 400 });
    }

    // ─── ACTION 1: FORCE MATCH TALENT ───
    if (action === "force_match") {
      const { projectId, freelancerId } = body;
      if (!projectId || !freelancerId) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
      }

      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const freelancerUser = await User.findById(freelancerId);
      if (!freelancerUser) return NextResponse.json({ error: "Freelancer user not found" }, { status: 404 });

      project.freelancerId = freelancerId;
      project.freelancerAccepted = true;
      project.status = "active";
      if (!project.milestones || project.milestones.length === 0) {
        const freelancerPrice = project.pricing?.freelancerPrice || 0;
        const m1 = Math.round(freelancerPrice * 0.20);
        const m2 = Math.round(freelancerPrice * 0.30);
        const m3 = freelancerPrice - m1 - m2;
        project.milestones = [
          {
            title: "Milestone 1: Core Architecture & Setup (20%)",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Initial repository structure", "Database schemas", "Deployment configuration"],
            percentage: 20,
            amount: m1,
            payment: { status: "pending" }
          },
          {
            title: "Milestone 2: Logic & Integration (30%)",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Functional API endpoints", "Database logic integration", "Unit/Integration tests"],
            percentage: 30,
            amount: m2,
            payment: { status: "pending" }
          },
          {
            title: "Milestone 3: Final Handovers & Source Code (50%)",
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Polished UI design implementation", "Completed source code transfer", "Deployment build validation"],
            percentage: 50,
            amount: m3,
            payment: { status: "pending" }
          }
        ];
      }
      await project.save();

      // Create system chat message
      await Message.create({
        projectId: project._id,
        senderId: freelancerId, // Mock as system
        senderRole: "admin",
        content: `⚡ [System Match Override]: Admin has manually matched & assigned Expert "${freelancerUser.name}" to this project. Operational Canvas initialized.`
      });

      return NextResponse.json({ success: true, project });
    }

    // ─── ACTION 2: OVERRIDE STATUS ───
    if (action === "update_project_status") {
      const { projectId, status } = body;
      if (!projectId || !status) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      project.status = status;
      if (status === "disputed") {
        const { Dispute } = require("@/models/Dispute");
        const activeDispute = await Dispute.findOne({ projectId: project._id, status: "active" });
        if (!activeDispute) {
          await Dispute.create({
            projectId: project._id,
            proposerId: project.clientId,
            proposerRole: "client",
            reason: "Manually flagged by Platform Administrator.",
            details: "Administrative status override.",
            status: "active",
            platformAudit: {
              milestonesTotal: project.milestones?.length || 0,
              milestonesOverdue: project.milestones?.filter((m: any) => m.status === "pending" && m.dueDate && new Date(m.dueDate) < new Date()).length || 0,
              overdueDaysMax: 0,
              freelancerInactivityHours: 0,
              clientInactivityHours: 0,
              auditVerdict: "Manually overridden by administrator."
            }
          });
        }
      } else {
        const { Dispute } = require("@/models/Dispute");
        await Dispute.updateMany(
          { projectId: project._id, status: "active" },
          {
            $set: {
              status: "resolved",
              resolutionNotes: `Dispute resolved by administrator manually overriding status to ${status.toUpperCase()}.`,
              resolvedAt: new Date(),
            }
          }
        );
      }

      if (status === "active" && (!project.milestones || project.milestones.length === 0)) {
        const freelancerPrice = project.pricing?.freelancerPrice || 0;
        const m1 = Math.round(freelancerPrice * 0.20);
        const m2 = Math.round(freelancerPrice * 0.30);
        const m3 = freelancerPrice - m1 - m2;
        project.milestones = [
          {
            title: "Milestone 1: Core Architecture & Setup (20%)",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Initial repository structure", "Database schemas", "Deployment configuration"],
            percentage: 20,
            amount: m1,
            payment: { status: "pending" }
          },
          {
            title: "Milestone 2: Logic & Integration (30%)",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Functional API endpoints", "Database logic integration", "Unit/Integration tests"],
            percentage: 30,
            amount: m2,
            payment: { status: "pending" }
          },
          {
            title: "Milestone 3: Final Handovers & Source Code (50%)",
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            status: "pending",
            deliverables: ["Polished UI design implementation", "Completed source code transfer", "Deployment build validation"],
            percentage: 50,
            amount: m3,
            payment: { status: "pending" }
          }
        ];
      }
      await project.save();

      // Post chat alert
      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `⚙️ [System Event]: Administrator has manually updated this project status to: "${status.toUpperCase().replace("_", " ")}".`
      });

      return NextResponse.json({ success: true, project });
    }

    // ─── ACTION 3: INJECT ADMIN CHAT ───
    if (action === "admin_chat_message") {
      const { projectId, content } = body;
      if (!projectId || !content) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const message = await Message.create({
        projectId,
        senderRole: "admin",
        content: `⚙️ [Platform Administration Announcement]: ${content}`
      });

      return NextResponse.json({ success: true, message });
    }

    // ─── ACTION 4: FORCE APPROVE UPGRADE ───
    if (action === "force_approve_upgrade") {
      const { projectId, upgradeId } = body;
      if (!projectId || !upgradeId) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const upgrade = await ScopeUpgrade.findById(upgradeId);
      if (!upgrade) return NextResponse.json({ error: "Upgrade not found" }, { status: 404 });

      upgrade.status = "approved";
      await upgrade.save();

      const currentScope = await Scope.findById(project.scopeId).lean() as any;
      if (!currentScope) return NextResponse.json({ error: "Scope missing" }, { status: 500 });

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

      const currentRateRange = getRateRange(project.field || "development", newEffortLevel);
      const avgRate = Math.round((currentRateRange.min + currentRateRange.max) / 2);
      const newPricing = calculatePrice(newTotalScore, avgRate);

      project.scopeId = newScope._id;
      project.requiredLevel = newEffortLevel;
      project.pricing = { ...newPricing, ratePerPoint: avgRate, accountabilityMode: project.pricing?.accountabilityMode || "basic" };
      await project.save();

      // Post Chat Message
      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `⚙️ [System Force Override]: Scope Version ${newScope.version} has been manually APPROVED by administration. The "${upgrade.proposedUnit.name}" functional unit has been locked into active deliverables.`
      });

      return NextResponse.json({ success: true, upgrade, newScope });
    }

    // ─── ACTION 5: MANUAL ADD FUNCTIONAL UNIT ───
    if (action === "add_functional_unit") {
      const { projectId, unitName, unitDescription } = body;
      if (!projectId || !unitName || !unitDescription) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const currentScope = await Scope.findById(project.scopeId);
      if (!currentScope) return NextResponse.json({ error: "Scope missing" }, { status: 500 });

      // Generate a basic functional unit structure
      const newUnit = {
        id: `FU-${Date.now().toString().slice(-4)}`,
        name: unitName,
        description: unitDescription,
        included: ["Standard functional setup", "Configuration logic implementation"],
        excluded: ["Structural changes outside description"],
        deliverables: ["Tested asset build"],
        addedByClient: true,
        unitScore: 10,
        effortDrivers: {
          name: unitName,
          logicDepth: 5,
          interactionDensity: 5,
          dataHandling: 5,
          dependencyLevel: 5,
          variations: 5,
          outputExpectation: 5,
          totalScore: 30
        }
      };

      currentScope.functionalUnits.push(newUnit as any);
      currentScope.totalEffortScore += 10;
      currentScope.effortLevel = getEffortLevel(currentScope.totalEffortScore);
      currentScope.version += 1;
      await currentScope.save();

      // Recalculate price limits
      const rateRange = getRateRange(project.field || "development", currentScope.effortLevel);
      const avgRate = Math.round((rateRange.min + rateRange.max) / 2);
      const newPricing = calculatePrice(currentScope.totalEffortScore, avgRate);

      project.pricing = { ...newPricing, ratePerPoint: avgRate, accountabilityMode: project.pricing?.accountabilityMode || "basic" };
      await project.save();

      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `⚙️ [System Override]: Administrator has directly injected a new functional deliverable: "${unitName}" into the active scope.`
      });

      return NextResponse.json({ success: true, scope: currentScope });
    }

    // ─── ACTION 6: OVERRIDE TALENT RATING / LEVEL ───
    if (action === "override_freelancer_level") {
      const { freelancerId, level, testScore, ratePerPoint } = body;
      if (!freelancerId || !level || testScore === undefined || !ratePerPoint) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const profile = await FreelancerProfile.findOneAndUpdate(
        { userId: freelancerId },
        { level, testScore, ratePerPoint, testStatus: "approved" },
        { new: true }
      );

      if (!profile) return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });

      await User.findByIdAndUpdate(freelancerId, { onboardingComplete: true });

      return NextResponse.json({ success: true, profile });
    }

    // ─── ACTION 7: RESET TALENT ONBOARDING & TESTS ───
    if (action === "reset_freelancer_test") {
      const { freelancerId } = body;
      if (!freelancerId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

      // Clean profile records
      const profile = await FreelancerProfile.findOneAndUpdate(
        { userId: freelancerId },
        { level: 1, testScore: 0, testStatus: "not_started", ratePerPoint: 35 },
        { new: true }
      );

      // Delete active test evaluations
      await Test.deleteMany({ freelancerId });

      return NextResponse.json({ success: true, profile });
    }

    // ─── ACTION 8: RESOLVE SYSTEM DISPUTE ───
    if (action === "resolve_dispute") {
      const { projectId, notes } = body;
      if (!projectId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

      const project = await Project.findByIdAndUpdate(projectId, { status: "active" }, { new: true });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      // Mark all active disputes for this project as resolved
      const { Dispute } = require("@/models/Dispute");
      await Dispute.updateMany(
        { projectId: project._id, status: "active" },
        {
          $set: {
            status: "resolved",
            resolutionNotes: notes || "Resolved by administrator after review.",
            resolvedAt: new Date(),
          }
        }
      );

      await Message.create({
        projectId: project._id,
        senderRole: "admin",
        content: `⚙️ [Executa Support Override]: Platform Audit successfully complete. Active dispute has been RESOLVED.\n\nResolution Notes: "${notes || 'Resolved by administrator.'}"\n\nCanvas billing has resumed under active state and Executa's contributing rails are certified.`
      });

      return NextResponse.json({ success: true, project });
    }

    // ─── ACTION 9: SUSPEND/ACTIVATE USER ───
    if (action === "suspend_user") {
      const { userId, suspended } = body;
      if (!userId || suspended === undefined) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

      const user = await User.findByIdAndUpdate(userId, { suspended }, { new: true });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "Unsupported override action" }, { status: 400 });

  } catch (err: any) {
    console.error("[ADMIN_ACTIONS_OVERRIDE_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
