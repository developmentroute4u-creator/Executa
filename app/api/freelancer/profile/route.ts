import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { Test } from "@/models/Test";
import { User } from "@/models/User";
import { Project } from "@/models/Project";

// GET /api/freelancer/profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const profile = await FreelancerProfile.findOne({ userId }).lean();
  const test = await Test.findOne({ freelancerId: userId }).sort({ createdAt: -1 }).lean();

  let activeProjects: any[] = [];
  if (profile && profile.activeProjectIds && profile.activeProjectIds.length > 0) {
    activeProjects = await Project.find({ _id: { $in: profile.activeProjectIds } }).lean();
  }

  return NextResponse.json({ profile, test, activeProjects });
}

// PATCH /api/freelancer/profile — update profile fields
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();
    const userId = (session.user as any).id;

    const profile = await FreelancerProfile.findOneAndUpdate(
      { userId },
      { $set: body },
      { new: true }
    );

    // If onboarding complete, automatically generate custom skill test
    if (body.onboardingComplete && profile) {
      await User.findByIdAndUpdate(userId, { onboardingComplete: true });

      // Split comma-separated domains and use specializations to generate custom task
      const domains = (profile.domain || "fullstack").split(",").map(d => d.trim()).filter(Boolean);
      const specs = profile.specializations || [];

      let customTask = null;
      try {
        const { askGeminiForCustomTest } = require("@/lib/gemini");
        customTask = await askGeminiForCustomTest(profile.field, domains, specs);
      } catch (e) {
        console.error("Gemini custom test generation failed, falling back to local task:", e);
      }

      const taskPrompt = customTask?.prompt || `Vetting Project: Build a high-performance system incorporating your expert skills in: ${specs.join(", ")}. Ensure beautiful interface design, robust logic handling, proper edge case validation, and clean structure.`;
      const taskRequirements = customTask?.requirements || [
        `Complete functional implementation of a ${specs.join(" / ")} prototype`,
        "Modern, premium visual layout with smooth transitions",
        "Clear input validation and error messages",
        "Edge cases (e.g. empty states, loading sequences) handled gracefully",
        "Documentation of technical decisions and how to run it",
      ];

      // Remove any existing active test
      await Test.deleteMany({ freelancerId: userId });

      // Build capability specific dimensions matching the generated result
      const capabilityScores = customTask?.capabilitySpecificDimensions?.map((d: any) => ({
        capabilityName: d.capabilityName,
        dimensionName: d.dimensionName,
        score: 0,
        feedback: ""
      })) || specs.map(s => ({
        capabilityName: s,
        dimensionName: "Execution Quality",
        score: 0,
        feedback: ""
      }));

      // Create assigned test
      await Test.create({
        freelancerId: userId,
        field: profile.field,
        domain: profile.domain,
        specialization: specs[0] || "Custom Specialist",
        specializations: specs,
        level: 2,
        taskPrompt,
        taskRequirements,
        projectContext: customTask?.projectContext || "High-growth software startup environment.",
        businessProblem: customTask?.businessProblem || `Build and refine a custom business portal satisfying: ${specs.join(", ")}.`,
        constraints: customTask?.constraints || ["Maximum loading delay under 200ms", "Zero external CSS frameworks permitted"],
        deliverables: customTask?.deliverables || ["Fully responsive interactive web portal", "Complete architectural block design document"],
        status: "assigned",
        evaluation: {
          functionalCoverage: 0,
          logic: 0,
          usability: 0,
          edgeCases: 0,
          outputQuality: 0,
          total: 0,
          assignedLevel: 1,
          evaluatorNotes: "",
          capabilityScores
        }
      });

      // Update test status to not_started
      profile.testStatus = "not_started";
      await profile.save();
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[PATCH /api/freelancer/profile] Error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
