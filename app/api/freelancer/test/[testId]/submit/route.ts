import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { assignLevel } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { testId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { submissionUrl, submissionNotes } = await req.json();
    if (!submissionUrl) return NextResponse.json({ error: "Submission URL required" }, { status: 400 });

    await connectDB();
    const userId = (session.user as any).id;

    const test = await Test.findOne({ _id: params.testId, freelancerId: userId });
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    test.submissionUrl = submissionUrl;
    test.submissionNotes = submissionNotes;
    test.submittedAt = new Date();
    test.status = "under_review";
    await test.save();

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "under_review" }
    );

    return NextResponse.json({ test });
  } catch (err) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
