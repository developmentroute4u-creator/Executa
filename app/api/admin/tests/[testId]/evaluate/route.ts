import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { User } from "@/models/User";
import { assignLevel, calculateRatePerPoint } from "@/lib/utils";

// Admin: evaluate a test submission
export async function POST(req: NextRequest, { params }: { params: { testId: string } }) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);
  
  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { functionalCoverage, logic, usability, edgeCases, outputQuality, evaluatorNotes, capabilityScores, action } = await req.json();
    const total = functionalCoverage + logic + usability + edgeCases + outputQuality;
    const level = assignLevel(total);

    await connectDB();

    const test = await Test.findByIdAndUpdate(params.testId, {
      status: "evaluated",
      evaluation: {
        functionalCoverage, logic, usability, edgeCases, outputQuality,
        total, assignedLevel: level, evaluatorNotes, evaluatedAt: new Date(),
        capabilityScores: capabilityScores || []
      },
    }, { new: true });

    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    const isRejected = action === "reject";

    // Update freelancer profile with performance-based rate per point (or mark as rejected)
    const userDoc = await User.findById(test.freelancerId).lean();
    const field = (userDoc as any)?.field || "development";
    const ratePerPoint = calculateRatePerPoint(level, total, field);

    await FreelancerProfile.findOneAndUpdate(
      { userId: test.freelancerId },
      { 
        level, 
        testStatus: isRejected ? "rejected" : "approved", 
        testScore: total, 
        scoreBreakdown: { functionalCoverage, logic, usability, edgeCases, outputQuality }, 
        ratePerPoint 
      }
    );
    
    if (!isRejected) {
      await User.findByIdAndUpdate(test.freelancerId, { onboardingComplete: true });
    }

    return NextResponse.json({ test, level });
  } catch (err) {
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
