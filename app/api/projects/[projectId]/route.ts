import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { Message } from "@/models/Message";
import { getEffortLevel, getRateRange, calculatePrice } from "@/lib/utils";
import { askGeminiForCustomUnit } from "@/lib/gemini";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const project = await Project.findById(params.projectId).lean() as any;
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (project.freelancerId) {
    const { User } = await import("@/models/User");
    const freelancer = await User.findById(project.freelancerId).lean();
    if (freelancer) {
      project.freelancerName = freelancer.name;
    }
  }

  if (project.assignedFreelancers && project.assignedFreelancers.length > 0) {
    const { User } = await import("@/models/User");
    for (const f of project.assignedFreelancers) {
      const user = await User.findById(f.userId).lean();
      if (user) {
        f.name = user.name;
      }
    }
  }

  const scope = project.scopeId ? await Scope.findById(project.scopeId).lean() : null;

  return NextResponse.json({ project, scope });
}

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();

    if (body.reject) {
      const project = await Project.findById(params.projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const freelancerId = project.freelancerId;
      if (freelancerId) {
        const { FreelancerProfile } = require("@/models/FreelancerProfile");
        await FreelancerProfile.updateOne(
          { userId: freelancerId },
          {
            $pull: { activeProjectIds: project._id },
            $set: { available: true }
          }
        );
      }

      project.freelancerId = undefined;
      project.status = "matching";
      project.freelancerAccepted = false;
      await project.save();

      return NextResponse.json({ success: true, project });
    }

    if (body.accept || body.freelancerAccepted || body.action === "accept_scope") {
      const project = await Project.findById(params.projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const loggedInUserId = (session.user as any).id;

      const assignedIdx = project.assignedFreelancers?.findIndex((a: any) => a.userId.toString() === loggedInUserId);
      const isLegacyAssigned = project.freelancerId && project.freelancerId.toString() === loggedInUserId;

      if (assignedIdx === undefined || (assignedIdx === -1 && !isLegacyAssigned)) {
        return NextResponse.json({ error: "Unauthorized: You are not assigned to this project." }, { status: 403 });
      }

      if (assignedIdx !== undefined && assignedIdx !== -1 && project.assignedFreelancers) {
        if (project.assignedFreelancers[assignedIdx].accepted) {
          return NextResponse.json({ error: "You have already accepted this project." }, { status: 400 });
        }
        project.assignedFreelancers[assignedIdx].accepted = true;
      }

      // Update top-level boolean for legacy checks, but it represents "has at least one accepted" until all accept.
      project.freelancerAccepted = true;

      // Check if ALL assigned freelancers have accepted
      let allAccepted = true;
      if (project.assignedFreelancers && project.assignedFreelancers.length > 0) {
        allAccepted = project.assignedFreelancers.every((a: any) => a.accepted === true);
      }

      if (allAccepted) {
        project.status = "active";
      }

      await project.save();

      const { FreelancerProfile } = require("@/models/FreelancerProfile");
      await FreelancerProfile.updateOne(
        { userId: new mongoose.Types.ObjectId(loggedInUserId) },
        {
          $addToSet: { activeProjectIds: project._id },
          $set: { available: false }
        }
      );

      if (allAccepted) {
        // Notify client and initialize project workspace chat message
        await Message.create({
          projectId: project._id,
          senderId: new mongoose.Types.ObjectId(loggedInUserId),
          senderRole: "freelancer",
          content: "👋 Project Approved! The execution team has officially accepted the scope and initiated execution. The secure chat channel is active and development has started!"
        });
      }

      return NextResponse.json({ success: true, project });
    }

    const { customUnit, ...projectUpdates } = body;

    if (customUnit) {
      const project = await Project.findById(params.projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const scope = await Scope.findById(project.scopeId);
      if (!scope) return NextResponse.json({ error: "Scope not found" }, { status: 404 });

      // Dynamically expand the custom functionality using the Gemini AI Engine
      let expandedUnit;
      try {
        expandedUnit = await askGeminiForCustomUnit(
          customUnit.name,
          customUnit.description,
          project.field || "development"
        );
      } catch (e: any) {
        console.warn(`[GEMINI CUSTOM UNIT API ERROR] ${e.message || e}. Falling back to baseline configuration.`);
        expandedUnit = null;
      }

      // If AI fails or returns null, gracefully fallback to a baseline configuration
      if (!expandedUnit) {
        console.warn("[PATCH /api/projects/:id] askGeminiForCustomUnit returned null. Falling back.");
        const score = 30;
        expandedUnit = {
          name: customUnit.name,
          description: customUnit.description || "",
          included: ["Feature implementation matching project details"],
          excluded: ["Advanced premium configurations (available as upgrade)"],
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
        };
      }

      const unitId = customUnit.name.toLowerCase().replace(/\s/g, "_");
      const score = Number(expandedUnit.unitScore) || 30;

      const newUnit = {
        id: unitId,
        name: expandedUnit.name,
        description: expandedUnit.description || customUnit.description || "",
        included: expandedUnit.included || [],
        excluded: expandedUnit.excluded || [],
        deliverables: expandedUnit.deliverables || [],
        unitScore: score,
        addedByClient: true,
        effortDrivers: {
          name: expandedUnit.name,
          logicDepth: expandedUnit.effortDrivers?.logicDepth || 5,
          interactionDensity: expandedUnit.effortDrivers?.interactionDensity || 5,
          dataHandling: expandedUnit.effortDrivers?.dataHandling || 5,
          dependencyLevel: expandedUnit.effortDrivers?.dependencyLevel || 5,
          variations: expandedUnit.effortDrivers?.variations || 5,
          outputExpectation: expandedUnit.effortDrivers?.outputExpectation || 5,
          totalScore: score,
        },
      };

      scope.functionalUnits.push(newUnit);
      scope.totalEffortScore = scope.functionalUnits.reduce((sum, u) => sum + u.unitScore, 0);
      scope.effortLevel = getEffortLevel(scope.totalEffortScore);
      scope.timeline.estimated = Math.ceil(scope.totalEffortScore / 15);
      await scope.save();

      // Recalculate project pricing
      const rateRange = getRateRange(project.field || "development", scope.effortLevel);
      const avgRate = Math.round((rateRange.min + rateRange.max) / 2);
      const pricing = calculatePrice(scope.totalEffortScore, avgRate);

      project.requiredLevel = scope.effortLevel;
      project.pricing = { ...pricing, ratePerPoint: avgRate, accountabilityMode: "basic" };
      await project.save();

      return NextResponse.json({ project, scope });
    }

    // Payment guard: if trying to move to "matching", require payment to be "paid"
    if (projectUpdates.status === "matching") {
      const projectForPaymentCheck = await Project.findById(params.projectId).lean() as any;
      if (!projectForPaymentCheck) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (projectForPaymentCheck.payment?.status !== "paid") {
        return NextResponse.json({ error: "Payment required before confirming scope", paymentRequired: true }, { status: 402 });
      }
    }

    const project = await Project.findByIdAndUpdate(params.projectId, projectUpdates, { new: true });
    const scope = project?.scopeId ? await Scope.findById(project.scopeId) : null;
    return NextResponse.json({ project, scope });
  } catch (err) {
    console.error("[PATCH_PROJECT]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
