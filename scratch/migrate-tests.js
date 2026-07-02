const mongoose = require("mongoose");

const PRIMARY_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct",
  "meta-llama/llama-3.3-70b-instruct"
];

// Helper to call OpenRouter
async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing API Key");

  for (const model of PRIMARY_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://executa.io",
          "X-Title": "Executa"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }

      const resJson = await response.json();
      let text = resJson.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      text = text.trim();
      if (text.startsWith("```json")) text = text.substring(7);
      else if (text.startsWith("```")) text = text.substring(3);
      if (text.endsWith("```")) text = text.substring(0, text.length - 3);
      return JSON.parse(text.trim());
    } catch (e) {
      console.warn(`Model ${model} failed:`, e.message);
    }
  }
  throw new Error("All models failed");
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const TestSchema = new mongoose.Schema({}, { strict: false });
  const Test = mongoose.models.Test || mongoose.model("Test", TestSchema, "tests");

  // Find latest test that is missing assignmentTitle
  const legacyTest = await Test.findOne({
    status: { $in: ["assigned", "in_progress"] },
    assignmentTitle: { $exists: false }
  }).sort({ createdAt: -1 });

  if (!legacyTest) {
    console.log("No legacy tests found needing migration.");
    await mongoose.disconnect();
    return;
  }

  console.log("Found legacy test to migrate:", {
    id: legacyTest._id,
    taskPrompt: legacyTest.taskPrompt,
    field: legacyTest.field,
    domain: legacyTest.domain
  });

  const specLabel = legacyTest.specialization || legacyTest.specializations?.[0] || legacyTest.domain || "Specialist";

  const prompt = `You are a senior delivery director at a premium digital agency.
You are creating a REAL CLIENT PROJECT BRIEF for a freelancer capability assessment.

Freelancer details:
- Field: ${legacyTest.field}
- Domain: ${legacyTest.domain}
- Specialization: ${specLabel}
- Assessment Level: Level 2 (experienced professional, not yet at principal/lead level)

Return ONLY valid JSON matching this exact schema:
{
  "assignmentTitle": "Compelling, specific project title",
  "capabilityArea": "Precise capability area (e.g. 'Frontend UI Development')",
  "assignmentSummary": "Two sentences summary",
  "projectOverview": {
    "background": "Company background",
    "currentSituation": "Current situation leading to this",
    "businessProblem": "The business problem to solve",
    "expectedOutcome": "What success looks like"
  },
  "yourRole": "Role responsibility sentence",
  "projectObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "constraints": ["Constraint 1", "Constraint 2"],
  "exceptions": ["Out of scope 1", "Out of scope 2"],
  "successCriteria": "Success criteria description",
  "deliverables": [
    { "label": "Code Repository", "description": "What to submit", "required": true, "type": "repository" }
  ],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "importantNotes": ["Note 1", "Note 2"],
  "internalArtifacts": {
    "expectedSolution": "Expected solution desc",
    "expectedFunctionalUnits": ["Unit 1", "Unit 2"],
    "referenceOutcome": "Reference outcome desc",
    "evaluationRubric": {
      "businessUnderstanding": "Rubric desc",
      "executionQuality": "Rubric desc"
    },
    "capabilityIndicators": ["Indicator 1"],
    "decisionPoints": ["Decision point 1"],
    "levelRecommendation": "Level 2"
  }
}`;

  console.log("Calling OpenRouter...");
  const data = await callOpenRouter(prompt);
  console.log("Received AI data, updating document...");

  await Test.updateOne(
    { _id: legacyTest._id },
    {
      $set: {
        assignmentTitle: data.assignmentTitle,
        capabilityArea: data.capabilityArea,
        assignmentSummary: data.assignmentSummary,
        projectOverview: data.projectOverview,
        yourRole: data.yourRole,
        projectObjectives: data.projectObjectives,
        constraints: data.constraints,
        exceptions: data.exceptions,
        successCriteria: data.successCriteria,
        deliverables: data.deliverables,
        commonMistakes: data.commonMistakes,
        importantNotes: data.importantNotes,
        internalArtifacts: data.internalArtifacts,
        progressCheckpoints: [
          { id: "brief_reviewed", label: "Project Overview Reviewed", completed: false },
          { id: "role_understood", label: "Your Role Understood", completed: false },
          { id: "deliverables_prepared", label: "Deliverables Prepared", completed: false },
          { id: "documentation_added", label: "Documentation Added", completed: false },
          { id: "files_uploaded", label: "Files / Links Added", completed: false },
          { id: "final_review", label: "Final Review Completed", completed: false }
        ]
      }
    }
  );

  console.log("Migration complete!");
  await mongoose.disconnect();
}

run().catch(console.error);
