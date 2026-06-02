import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST /api/freelancer/test/start
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "freelancer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { field, domain, specialization } = await req.json();
    await connectDB();
    const userId = (session.user as any).id;

    const existing = await Test.findOne({ freelancerId: userId, status: { $in: ["assigned", "in_progress", "submitted", "under_review"] } });
    if (existing) return NextResponse.json({ error: "Active test already exists", testId: existing._id }, { status: 409 });

    let taskData;
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: { responseMimeType: "application/json" } 
      });
      const prompt = `You are an expert technical recruiter and Senior Principal Engineer at a top-tier tech company.
You are generating a "Level 2 Skills Assessment" for a freelancer applying to work on your platform.
Field: ${field}
Domain: ${domain}
Specialization: ${specialization}

Your goal is to create an extremely realistic, high-quality, production-level assignment that will test their expertise in this specific specialization. 
The test MUST NOT be trivial. It should feel like a real-world, scoped feature request from a product manager.

Follow these strict guidelines:
1. "taskPrompt": Make it an engaging, specific project title.
2. "projectContext": Provide a professional 2-3 sentence background about a fictional company and their core product. 
3. "businessProblem": Clearly articulate the complex business challenge that necessitates this project.
4. "taskRequirements": Provide 5-7 highly technical, rigorous requirements. Use industry-standard terminology (e.g. "state management", "CI/CD", "accessibility (WCAG)", "responsive architecture").
5. "constraints": Provide 3-5 strict limitations (e.g., "Must be fully offline-capable", "Do not use UI libraries like Material UI").
6. "deliverables": Provide 3-5 exact deliverables expected (e.g., "A GitHub repository link", "A Loom video walk-through").

Return ONLY valid JSON with this exact schema:
{
  "taskPrompt": "String",
  "projectContext": "String",
  "businessProblem": "String",
  "taskRequirements": ["String", "String", ...],
  "constraints": ["String", "String", ...],
  "deliverables": ["String", "String", ...]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      taskData = JSON.parse(text);
    } catch (aiError) {
      console.error("Gemini failed:", aiError);
      // Fallback
      taskData = {
        taskPrompt: `Custom Assessment for ${specialization || domain}`,
        projectContext: "We are an innovative startup looking to expand our capabilities.",
        businessProblem: "We need an expert to help us solve complex challenges in this domain.",
        taskRequirements: ["Demonstrate best practices", "Ensure high quality deliverables", "Include clear documentation"],
        constraints: ["Must be completed within the standard timeframe", "Follow industry standards"],
        deliverables: ["Source files / code repository", "Documentation / summary"]
      };
    }

    const test = await Test.create({
      freelancerId: userId,
      field,
      domain,
      specialization,
      level: 2,
      taskPrompt: taskData.taskPrompt,
      projectContext: taskData.projectContext,
      businessProblem: taskData.businessProblem,
      taskRequirements: taskData.taskRequirements,
      constraints: taskData.constraints,
      deliverables: taskData.deliverables,
      status: "assigned",
    });

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "in_progress" }
    );

    return NextResponse.json({ testId: test._id.toString(), test });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}

// GET /api/freelancer/test/start — get current test or test by id, plus all tests
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const url = new URL(req.url);
  const testId = url.searchParams.get("id");

  let test;
  if (testId) {
    test = await Test.findOne({ _id: testId, freelancerId: userId }).lean();
  } else {
    test = await Test.findOne({ freelancerId: userId }).sort({ createdAt: -1 }).lean();
  }

  const tests = await Test.find({ freelancerId: userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ test, tests });
}

// PATCH /api/freelancer/test — Start the assigned custom test
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const userId = (session.user as any).id;

    const test = await Test.findOne({ freelancerId: userId, status: "assigned" }).sort({ createdAt: -1 });
    if (!test) return NextResponse.json({ error: "No assigned test found" }, { status: 404 });

    test.status = "in_progress";
    await test.save();

    await FreelancerProfile.findOneAndUpdate(
      { userId },
      { testStatus: "in_progress" }
    );

    return NextResponse.json({ success: true, test });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

