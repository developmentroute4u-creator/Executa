import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { callOpenRouterApi, PRIMARY_MODELS } from "@/lib/gemini";

// ─── Default progress checkpoints ────────────────────────────────────────────
const DEFAULT_CHECKPOINTS = [
  { id: "brief_reviewed",       label: "Project Overview Reviewed",   completed: false },
  { id: "role_understood",      label: "Your Role Understood",        completed: false },
  { id: "deliverables_prepared",label: "Deliverables Prepared",       completed: false },
  { id: "documentation_added",  label: "Documentation Added",         completed: false },
  { id: "files_uploaded",       label: "Files / Links Added",         completed: false },
  { id: "final_review",         label: "Final Review Completed",      completed: false },
];

// ─── Strip internal artifacts before sending to client ───────────────────────
function sanitize(doc: any) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  delete obj.internalArtifacts;
  return obj;
}

// ─── POST: Generate a new assessment ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "freelancer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { field, domain, specialization, specializations } = await req.json();
    await connectDB();
    const userId = (session.user as any).id;

    // Block duplicate active assessment
    const existing = await Test.findOne({
      freelancerId: userId,
      status: { $in: ["assigned", "in_progress", "submitted", "under_review"] },
    });
    
    if (existing && existing.assignmentTitle) {
      return NextResponse.json(
        { error: "Active assessment already exists", assessmentId: existing._id },
        { status: 409 }
      );
    }

    const specLabel = specialization || (specializations && specializations[0]) || domain;

    // ── Fixed 11-section AI prompt ─────────────────────────────────────────
    const prompt = `You are a senior delivery director at a premium digital agency.
You are creating a REAL CLIENT PROJECT BRIEF for a freelancer capability assessment.

Freelancer details:
- Field: ${field}
- Domain: ${domain}
- Specialization: ${specLabel}
- Assessment Level: Level 2 (experienced professional, not yet at principal/lead level)

CRITICAL RULES:
1. This is NOT an exam. This is NOT a quiz. It must feel like the freelancer just received their FIRST REAL CLIENT PROJECT.
2. The Project Overview must read like a real client explaining their business problem — no technical jargon, no implementation details.
3. Your Role must create a sense of professional ownership, not list tasks.
4. Project Objectives must be BUSINESS outcomes, not technical deliverables.
5. Exceptions define evaluation boundaries — what is intentionally OUT of scope.
6. Common Mistakes should guide thinking without revealing the expected solution.
7. Internal Artifacts are ONLY for the evaluation team and must never be visible to the freelancer.
8. Write naturally, professionally, and concisely. No filler, no academic tone.

Return ONLY valid JSON — no markdown, no code fences — matching this exact schema:

{
  "assignmentTitle": "Compelling, specific project title (not a job description)",
  "capabilityArea": "Precise capability being assessed (e.g. 'Product UI Design', 'REST API Development', 'Mobile Frontend')",
  "assignmentSummary": "Two crisp sentences summarising what this assignment is about and why it matters.",

  "projectOverview": {
    "background": "2-3 sentences about the company, what they do, and where they are in their journey.",
    "currentSituation": "2-3 sentences about what is happening right now that has led to this project.",
    "businessProblem": "2-3 sentences describing the specific problem the business needs solved. Write as the client would say it.",
    "expectedOutcome": "2-3 sentences on what success looks like from the client's perspective. Business outcomes, not technical specs."
  },

  "yourRole": "One clear, ownership-defining sentence. E.g. 'You have been brought in as the Lead Product Designer responsible for designing the end-to-end customer experience for the new checkout flow.'",

  "projectObjectives": [
    "Business objective 1 — outcome-focused",
    "Business objective 2",
    "Business objective 3",
    "Business objective 4",
    "Business objective 5"
  ],

  "constraints": [
    "Realistic constraint 1 (business, platform, brand, tech, or timeline)",
    "Realistic constraint 2",
    "Realistic constraint 3",
    "Realistic constraint 4"
  ],

  "exceptions": [
    "Item explicitly excluded from this assignment 1",
    "Item explicitly excluded from this assignment 2",
    "Item explicitly excluded from this assignment 3",
    "Item explicitly excluded from this assignment 4"
  ],

  "successCriteria": "3-4 sentences explaining what a high-quality submission demonstrates. Focus on understanding, execution quality, logical thinking, professional decision-making, and completeness. Do NOT mention scores or pass/fail.",

  "deliverables": [
    { "label": "Primary deliverable label", "description": "What exactly must be submitted and in what form", "required": true, "type": "repository" },
    { "label": "Secondary deliverable label", "description": "What exactly must be submitted", "required": true, "type": "link" },
    { "label": "Optional deliverable label", "description": "What it is and why it adds value", "required": false, "type": "notes" }
  ],

  "commonMistakes": [
    "Realistic mistake that professionals commonly make on this type of assignment",
    "Second common mistake",
    "Third common mistake",
    "Fourth common mistake"
  ],

  "importantNotes": [
    "AI tools may be used, but the submitted work must reflect your own professional understanding and decision-making.",
    "All external assets, libraries, or resources used must be properly licensed.",
    "Incomplete submissions may receive partial evaluation — submit what you have completed.",
    "Submissions cannot be edited after final submission."
  ],

  "internalArtifacts": {
    "expectedSolution": "Detailed description of what an ideal Level 2 submission looks like for this specific assignment.",
    "expectedFunctionalUnits": ["Core unit 1", "Core unit 2", "Core unit 3", "Core unit 4"],
    "referenceOutcome": "The benchmark output a Level 2 professional should produce.",
    "evaluationRubric": {
      "businessUnderstanding": "What evaluators look for to assess how well the submission addresses the business problem.",
      "executionQuality": "What evaluators look for regarding technical or design execution quality.",
      "decisionMaking": "What evaluators look for regarding trade-off decisions and professional judgment.",
      "professionalPresentation": "What evaluators look for in how the work is organised, documented, and presented.",
      "scalabilityThinking": "What evaluators look for regarding future-proofing and scalability."
    },
    "capabilityIndicators": ["Level 2 indicator 1", "Level 2 indicator 2", "Level 2 indicator 3"],
    "decisionPoints": ["Key decision point 1", "Key decision point 2", "Key decision point 3"],
    "levelRecommendation": "Level 2"
  }
}`;

    let data: any;
    try {
      data = await callOpenRouterApi(PRIMARY_MODELS, prompt);
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError);
      data = buildFallback(field, specLabel);
    }

    let assessment;
    if (existing) {
      existing.assignmentTitle = data.assignmentTitle;
      existing.capabilityArea = data.capabilityArea;
      existing.assignmentSummary = data.assignmentSummary;
      existing.projectOverview = data.projectOverview;
      existing.yourRole = data.yourRole;
      existing.projectObjectives = data.projectObjectives;
      existing.constraints = data.constraints;
      existing.exceptions = data.exceptions;
      existing.successCriteria = data.successCriteria;
      existing.deliverables = data.deliverables;
      existing.commonMistakes = data.commonMistakes;
      existing.importantNotes = data.importantNotes;
      existing.internalArtifacts = data.internalArtifacts;
      existing.progressCheckpoints = DEFAULT_CHECKPOINTS;
      await existing.save();
      assessment = existing;
    } else {
      assessment = await Test.create({
        freelancerId:     userId,
        field,
        domain,
        specialization:   specLabel,
        specializations:  specializations || [specLabel],
        level:            2,

        assignmentTitle:  data.assignmentTitle,
        capabilityArea:   data.capabilityArea,
        assignmentSummary:data.assignmentSummary,

        projectOverview:  data.projectOverview,
        yourRole:         data.yourRole,
        projectObjectives:data.projectObjectives,
        constraints:      data.constraints,
        exceptions:       data.exceptions,
        successCriteria:  data.successCriteria,
        deliverables:     data.deliverables,
        commonMistakes:   data.commonMistakes,
        importantNotes:   data.importantNotes,

        internalArtifacts:data.internalArtifacts,
        progressCheckpoints: DEFAULT_CHECKPOINTS,
        status: "assigned",
        locked: false,
      });
    }

    await FreelancerProfile.findOneAndUpdate({ userId }, { testStatus: "in_progress" });

    return NextResponse.json({
      assessmentId: assessment._id.toString(),
      assessment: sanitize(assessment),
    });
  } catch (err: any) {
    console.error("Assessment generation error:", err);
    return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
  }
}

// ─── GET: Fetch current or specified assessment ───────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const url = new URL(req.url);
  const assessmentId = url.searchParams.get("id");

  let assessment;
  if (assessmentId) {
    assessment = await Test.findOne({ _id: assessmentId, freelancerId: userId }).lean();
  } else {
    assessment = await Test.findOne({ freelancerId: userId }).sort({ createdAt: -1 }).lean();
  }

  const all = await Test.find({ freelancerId: userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    assessment: sanitize(assessment),
    assessments: all.map(sanitize),
  });
}

// ─── PATCH: start / save / checkpoint ────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, checkpointId, savedProgress } = body;
    await connectDB();
    const userId = (session.user as any).id;

    if (action === "start") {
      const a = await Test.findOne({
        freelancerId: userId,
        status: "assigned",
      }).sort({ createdAt: -1 });
      if (!a) return NextResponse.json({ error: "No assigned assessment found" }, { status: 404 });

      a.status = "in_progress";
      a.locked = true;
      a.timerStartedAt = new Date();
      await a.save();

      await FreelancerProfile.findOneAndUpdate({ userId }, { testStatus: "in_progress" });
      return NextResponse.json({ success: true, assessment: sanitize(a) });
    }

    if (action === "save") {
      const a = await Test.findOne({
        freelancerId: userId,
        status: "in_progress",
      }).sort({ createdAt: -1 });
      if (!a) return NextResponse.json({ error: "No active assessment" }, { status: 404 });

      if (savedProgress !== undefined) a.savedProgress = savedProgress;
      await a.save();
      return NextResponse.json({ success: true });
    }

    if (action === "checkpoint" && checkpointId) {
      const a = await Test.findOne({
        freelancerId: userId,
        status: { $in: ["assigned", "in_progress"] },
      }).sort({ createdAt: -1 });
      if (!a) return NextResponse.json({ error: "No active assessment" }, { status: 404 });

      let cp = a.progressCheckpoints.find((c: any) => c.id === checkpointId);
      if (cp) {
        cp.completed = true;
      } else {
        a.progressCheckpoints.push({ id: checkpointId, label: checkpointId.replace(/_/g, " "), completed: true });
      }
      a.markModified("progressCheckpoints");
      await a.save();
      return NextResponse.json({ success: true, checkpoints: a.progressCheckpoints });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Fallback content ─────────────────────────────────────────────────────────
function buildFallback(field: string, specLabel: string) {
  return {
    assignmentTitle: `${specLabel} — Client Project Assignment`,
    capabilityArea: specLabel,
    assignmentSummary: `Design and deliver a production-ready ${specLabel} solution for a real business scenario. This assignment evaluates your ability to translate business requirements into professional, executable outcomes.`,
    projectOverview: {
      background: "We are a growing technology company building digital products for modern businesses across multiple sectors.",
      currentSituation: "Our team is expanding and we have an immediate need for an experienced specialist to help deliver a critical product milestone.",
      businessProblem: `We need a skilled ${specLabel} professional to build a high-quality solution that directly addresses our business requirements and serves our users effectively.`,
      expectedOutcome: "A production-ready solution that demonstrates technical excellence, professional judgment, and clear thinking around the business problem.",
    },
    yourRole: `You have been brought in as the ${specLabel} responsible for designing and delivering the complete solution from brief to final handoff.`,
    projectObjectives: [
      "Deliver a working, high-quality solution that solves the stated business problem",
      "Demonstrate professional decision-making throughout the execution",
      "Ensure the solution is usable, scalable, and maintainable",
      "Provide clear documentation that supports future development",
      "Build with the end user's experience as the primary concern",
    ],
    constraints: [
      "The solution must be deliverable within the assessment period",
      "External dependencies must be well-justified and minimal",
      "The solution must follow established best practices for the domain",
      "Documentation must be in English and clearly written",
    ],
    exceptions: [
      "Advanced analytics and reporting features are out of scope",
      "Third-party integrations beyond the core requirement are excluded",
      "Admin panel or back-office tooling is not required",
      "Marketing assets and brand identity are not part of this assignment",
    ],
    successCriteria: "A strong submission demonstrates clear understanding of the business problem, not just technical proficiency. The solution should reflect professional judgment in trade-off decisions, with clean, well-organised deliverables and documentation that a senior reviewer can follow without additional explanation.",
    deliverables: [
      { label: "Primary Deliverable", description: "Your main solution — repository, file, or working build as appropriate for the domain", required: true, type: "link" },
      { label: "Documentation", description: "Clear explanation of your approach, the decisions made, and any trade-offs considered", required: true, type: "notes" },
      { label: "Supporting Materials", description: "Any additional context, references, or supporting files that strengthen your submission", required: false, type: "link" },
    ],
    commonMistakes: [
      "Focusing on technical complexity instead of solving the stated business problem",
      "Submitting work without documentation or explanation of key decisions",
      "Adding features and functionality that were not requested",
      "Ignoring edge cases and error states in the implementation",
    ],
    importantNotes: [
      "AI tools may be used, but the submitted work must reflect your own professional understanding and decision-making.",
      "All external assets, libraries, or resources used must be properly licensed.",
      "Incomplete submissions may receive partial evaluation — submit what you have completed.",
      "Submissions cannot be edited after final submission.",
    ],
    internalArtifacts: {
      expectedSolution: `A well-structured ${specLabel} solution that clearly addresses the business problem with professional quality.`,
      expectedFunctionalUnits: ["Core functionality", "Error handling", "Documentation", "Testing or validation"],
      referenceOutcome: "A professional, production-quality deliverable that a senior reviewer would approve for client handoff.",
      evaluationRubric: {
        businessUnderstanding: "Does the solution address the actual business problem, or just the surface technical requirement?",
        executionQuality: "Is the implementation clean, consistent, and correct?",
        decisionMaking: "Are trade-offs acknowledged and well-reasoned?",
        professionalPresentation: "Is the deliverable well-organised and easy to review without extra explanation?",
        scalabilityThinking: "Does the solution account for future growth or changing requirements?",
      },
      capabilityIndicators: ["Handles edge cases thoughtfully", "Documents key decisions clearly", "Uses appropriate abstractions without over-engineering"],
      decisionPoints: ["Approach and architecture selection", "Trade-off decisions made during execution", "Scope management choices"],
      levelRecommendation: "Level 2",
    },
  };
}
