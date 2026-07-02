import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "freelancer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      files, // Array of { label: string, url: string }
      notes,
    } = body;

    await connectDB();
    const userId = (session.user as any).id;

    const assessment = await Test.findOne({
      freelancerId: userId,
      status: "in_progress",
    }).sort({ createdAt: -1 });

    if (!assessment) {
      return NextResponse.json(
        { error: "No active in-progress assessment found" },
        { status: 404 }
      );
    }

    // Validate required deliverables
    const requiredDeliverables = assessment.deliverables?.filter((d: any) => d.required) || [];
    const missingDeliverables: string[] = [];

    const submittedFilesMap = new Map();
    if (files && Array.isArray(files)) {
      files.forEach(f => submittedFilesMap.set(f.label, f.url));
    }

    for (const deliverable of requiredDeliverables) {
      const url = submittedFilesMap.get(deliverable.label);
      if (!url || !url.trim()) {
        missingDeliverables.push(deliverable.label);
      }
    }

    // Also notes is mandatory
    if (!notes || notes.trim().length <= 10) {
      missingDeliverables.push("Additional Notes");
    }

    if (missingDeliverables.length > 0) {
      return NextResponse.json(
        {
          error: "Required deliverables are missing",
          missing: missingDeliverables,
        },
        { status: 422 }
      );
    }

    // Save submission
    assessment.submission = {
      files: files || [],
      notes: notes || undefined,
      submittedAt: new Date(),
    };
    assessment.status = "under_review";

    // Mark all checkpoints complete on submit
    assessment.progressCheckpoints = assessment.progressCheckpoints.map((cp: any) => ({
      ...cp,
      completed: true,
    }));

    await assessment.save();

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "under_review" }
    );

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    console.error("Assessment submission error:", err);
    return NextResponse.json({ error: err.message || "Submission failed" }, { status: 500 });
  }
}
