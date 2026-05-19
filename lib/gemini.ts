import { connectDB } from "./db";

// Standard functional units map for reference
const STANDARD_UNITS: Record<string, any> = {
  "Authentication System": {
    name: "Authentication System",
    description: "User registration, login, session management, and access control",
    included: ["Email/password auth", "Session handling", "Protected routes", "Password reset"],
    excluded: ["Social OAuth (add-on)", "2FA (add-on)"],
    deliverables: ["Auth flow", "JWT implementation", "Route guards"],
    unitScore: 34,
    effortDrivers: { name: "Authentication", logicDepth: 7, interactionDensity: 5, dataHandling: 6, dependencyLevel: 5, variations: 4, outputExpectation: 7, totalScore: 34 }
  },
  "Dashboard": {
    name: "Dashboard",
    description: "Primary data visualization and user control interface",
    included: ["Summary metrics", "Activity feed", "Quick actions", "Responsive layout"],
    excluded: ["Custom report builder (add-on)", "Data exports (add-on)"],
    deliverables: ["Dashboard UI", "Data connectors", "State management"],
    unitScore: 41,
    effortDrivers: { name: "Dashboard", logicDepth: 6, interactionDensity: 8, dataHandling: 7, dependencyLevel: 6, variations: 6, outputExpectation: 8, totalScore: 41 }
  },
  "API Layer": {
    name: "API Layer",
    description: "RESTful API endpoints with validation and error handling",
    included: ["CRUD endpoints", "Input validation", "Error handling", "API documentation"],
    excluded: ["GraphQL (add-on)", "WebSockets (add-on)"],
    deliverables: ["API routes", "Validation schemas", "Error responses"],
    unitScore: 40,
    effortDrivers: { name: "API Layer", logicDepth: 8, interactionDensity: 4, dataHandling: 8, dependencyLevel: 7, variations: 5, outputExpectation: 8, totalScore: 40 }
  },
  "Payment & Checkout": {
    name: "Payment & Checkout",
    description: "Secure payment processing and order management",
    included: ["Payment gateway integration", "Order tracking", "Invoice generation", "Refund flow"],
    excluded: ["Multi-currency (add-on)", "Subscription billing (add-on)"],
    deliverables: ["Payment UI", "Gateway integration", "Order management"],
    unitScore: 45,
    effortDrivers: { name: "Payment", logicDepth: 9, interactionDensity: 6, dataHandling: 8, dependencyLevel: 8, variations: 5, outputExpectation: 9, totalScore: 45 }
  },
  "Search & Filter": {
    name: "Search & Filter",
    description: "Advanced content discovery with filtering and sorting",
    included: ["Full-text search", "Filter system", "Sort controls", "Pagination"],
    excluded: ["AI semantic search (add-on)", "Faceted search (add-on)"],
    deliverables: ["Search UI", "Query engine", "Filter components"],
    unitScore: 39,
    effortDrivers: { name: "Search", logicDepth: 7, interactionDensity: 7, dataHandling: 7, dependencyLevel: 5, variations: 6, outputExpectation: 7, totalScore: 39 }
  },
  "User Profile": {
    name: "User Profile",
    description: "User account management and profile customization",
    included: ["Profile editing", "Avatar upload", "Account settings", "Notification preferences"],
    excluded: ["Portfolio showcase (add-on)", "Social features (add-on)"],
    deliverables: ["Profile UI", "Settings panel", "Image upload"],
    unitScore: 28,
    effortDrivers: { name: "Profile", logicDepth: 4, interactionDensity: 6, dataHandling: 5, dependencyLevel: 4, variations: 4, outputExpectation: 5, totalScore: 28 }
  },
  "SEO Setup": {
    name: "SEO Setup",
    description: "Technical SEO foundations and meta optimization",
    included: ["Meta tags", "Sitemap", "Structured data", "OG tags", "Performance basics"],
    excluded: ["Content strategy (add-on)", "Analytics setup (add-on)"],
    deliverables: ["SEO component", "Sitemap config", "Schema markup"],
    unitScore: 20,
    effortDrivers: { name: "SEO", logicDepth: 4, interactionDensity: 2, dataHandling: 3, dependencyLevel: 3, variations: 3, outputExpectation: 5, totalScore: 20 }
  },
  "Notification System": {
    name: "Notification System",
    description: "In-app and email notification delivery",
    included: ["In-app notifications", "Email templates", "Notification preferences", "Read/unread state"],
    excluded: ["Push notifications (add-on)", "SMS (add-on)"],
    deliverables: ["Notification center", "Email templates", "Event triggers"],
    unitScore: 29,
    effortDrivers: { name: "Notification", logicDepth: 5, interactionDensity: 4, dataHandling: 5, dependencyLevel: 6, variations: 4, outputExpectation: 5, totalScore: 29 }
  }
};

const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];

export async function askGeminiForScope(
  title: string,
  goal: string,
  businessModel: string,
  field: string = "development"
): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY env variable found.");
    return null;
  }

  const prompt = `You are a premium software scoping algorithm. Analyze this project brief and business model:
Project Title: "${title}"
Project Goal: "${goal}"
Business Model: "${businessModel}"
Field: "${field}"

Identify which of these standard functional units are required for this project (choose only what is relevant):
1. Authentication System
2. Dashboard
3. API Layer
4. Payment & Checkout
5. Search & Filter
6. User Profile
7. SEO Setup
8. Notification System

In addition to standard functional units, if the project description requires unique features not fully covered by these 8 standard units, you MUST define one or more custom functional units (for example, "Real-time Messaging Chat", "Scheduling Calendar", "Product Inventory Manager", "AI Translation", etc.) to make the scope fully complete and accurate.

For each selected standard unit, use the predefined values. For each custom unit:
- Assign a clean, professional name (e.g. "Real-time Messaging").
- Write a short description.
- Specify an array of features that are "included".
- Specify an array of features that are "excluded" (out of scope, premium add-ons).
- Specify an array of "deliverables".
- Calculate an estimated total score (unitScore) between 15 and 50 points based on logic depth and implementation complexity. Also build the effortDrivers object using similar metrics.

Return your response strictly in the following JSON format:
{
  "articulatedGoal": "A beautifully written, highly articulate explanation of the project goal summarizing it in a clear way for freelancers...",
  "functionalUnits": [
    {
      "name": "Authentication System",
      "description": "User registration, login, session management...",
      "included": ["Email/password auth", "Session handling"],
      "excluded": ["Social OAuth", "2FA"],
      "deliverables": ["Auth flow", "Route guards"],
      "unitScore": 34,
      "effortDrivers": {
        "logicDepth": 7,
        "interactionDensity": 5,
        "dataHandling": 6,
        "dependencyLevel": 5,
        "variations": 4,
        "outputExpectation": 7,
        "totalScore": 34
      }
    }
  ]
}

Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI] Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${model}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text.trim());
      if (parsed.functionalUnits && Array.isArray(parsed.functionalUnits)) {
        console.log(`[GEMINI] Successfully generated scope with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI] Model ${model} failed:`, e.message || e);
      // Automatically loops and falls back to the next model in the MODELS array
    }
  }

  console.warn("[GEMINI] All models failed or rate limited. Falling back to local rules.");
  return null;
}

export async function askGeminiForCustomUnit(
  name: string,
  description: string,
  field: string = "development"
): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY env variable found.");
    return null;
  }

  const prompt = `You are a premium software scoping algorithm. Expand this custom functional unit:
Name: "${name}"
Description: "${description}"
Field: "${field}"

Based on this name and description, please articulate:
1. What is "included" (features to implement, as an array of strings).
2. What is "excluded" (premium out-of-scope features/add-ons, as an array of strings).
3. What the "deliverables" are (as an array of strings).
4. Calculate an estimated complexity/effort score (unitScore) between 15 and 50 points based on implementation difficulty.
5. Build an effortDrivers object with parameters (logicDepth, interactionDensity, dataHandling, dependencyLevel, variations, outputExpectation) scored between 1 and 10, with totalScore equal to the unitScore.

Return your response strictly in the following JSON format:
{
  "name": "Name of unit",
  "description": "Articulated description of the unit",
  "included": ["feature 1", "feature 2"],
  "excluded": ["feature A", "feature B"],
  "deliverables": ["deliverable 1", "deliverable 2"],
  "unitScore": 30,
  "effortDrivers": {
    "logicDepth": 6,
    "interactionDensity": 5,
    "dataHandling": 6,
    "dependencyLevel": 5,
    "variations": 4,
    "outputExpectation": 6,
    "totalScore": 30
  }
}

Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI CUSTOM UNIT] Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${model}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text.trim());
      if (parsed.name && parsed.included && parsed.excluded && parsed.deliverables) {
        console.log(`[GEMINI CUSTOM UNIT] Successfully expanded unit with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI CUSTOM UNIT] Model ${model} failed:`, e.message || e);
    }
  }

  console.warn("[GEMINI CUSTOM UNIT] All models failed. Returning null.");
  return null;
}

export async function askGeminiToMatchFreelancers(
  project: { title: string; goal: string; field: string; requiredLevel?: number; functionalUnits: any[] },
  freelancers: Array<{ id: string; name: string; domain: string; level: number | null; specializations: string[]; bio: string; testScore: number | null }>
): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY env variable found.");
    return null;
  }

  const prompt = `You are a premium AI matching agent. Your task is to evaluate and match the best freelancer for the following project:

Project Title: "${project.title}"
Goal: "${project.goal}"
Field: "${project.field}"
Required Difficulty Level: Level ${project.requiredLevel || 2}
Functional Scope Requirements:
${project.functionalUnits.map(u => `- ${u.name}: ${u.description} (Included: ${u.included?.join(", ")})`).join("\n")}

Here is the list of qualified and available freelancers:
${freelancers.map(f => `
Freelancer ID: "${f.id}"
Name: "${f.name}"
Domain: "${f.domain}"
Level: Level ${f.level || 1}
Specializations: ${f.specializations?.join(", ")}
Test Score: ${f.testScore || "N/A"}/100
Bio: "${f.bio}"
`).join("\n\n")}

For each freelancer, calculate a match percentage (fitScore, integer 0-100) based on:
1. Specialization and skill overlap with the project functional units and goal.
2. Capability level ( freelancers at or above required project level are preferred).
3. Test performance score.

Explain in a highly articulate, premium paragraph (fitReason) exactly how the freelancer's specific skills align to the scope of this project and why they are qualified to execute it.
Identify the absolute best-suited freelancer as the 'bestMatchId'.

Return your response strictly in the following JSON format:
{
  "matches": [
    {
      "freelancerId": "ID of freelancer",
      "fitScore": 95,
      "fitReason": "Highly detailed paragraph explaining the exact capability match..."
    }
  ],
  "bestMatchId": "ID of best freelancer"
}

Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI MATCHING] Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${model}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text.trim());
      if (parsed.matches && parsed.bestMatchId) {
        console.log(`[GEMINI MATCHING] Successfully evaluated matches with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI MATCHING] Model ${model} failed:`, e.message || e);
    }
  }

  console.warn("[GEMINI MATCHING] All models failed. Returning null.");
  return null;
}

export async function askGeminiForCustomTest(
  field: "development" | "design",
  domains: string[],
  specializations: string[]
): Promise<{
  prompt: string;
  requirements: string[];
  projectContext: string;
  businessProblem: string;
  constraints: string[];
  deliverables: string[];
  capabilitySpecificDimensions: Array<{
    capabilityName: string;
    dimensionName: string;
    description: string;
  }>;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY env variable found.");
    return null;
  }

  const prompt = `You are a premium technical vetting director for a governed execution platform.
Your job is to generate a custom, highly practical, and challenging Level 2 skill evaluation test task for a freelancer.

The freelancer has selected the following expertise:
Primary Field: "${field}"
Selected Domains: ${domains.join(", ")}
Selected Micro-Capabilities: ${specializations.join(", ")}

You MUST generate ONE blended real-world business assignment that incorporates all the chosen micro-capabilities naturally.
Do NOT generate separate questions. Do NOT generate generic academic, tutorial-level, or repetitive tasks.

The output MUST be a strict, valid JSON matching the following structure:
{
  "projectContext": "Provide a realistic business scenario (e.g., 'A fast-growing fintech startup that serves low-income users...')",
  "businessProblem": "State a real-world operational problem they need to solve.",
  "prompt": "A clear, inspiring, and professional task description outlining the project goal, context, and what the freelancer needs to build.",
  "constraints": [
    "Constraint 1 (e.g. low trust environment, performance thresholds, scaling bounds, offline-first restriction)",
    "Constraint 2"
  ],
  "deliverables": [
    "Deliverable 1 (e.g. High-fidelity interactive prototype, fully responsive React interface)",
    "Deliverable 2"
  ],
  "requirements": [
    "Objective technical requirement 1...",
    "Objective technical requirement 2..."
  ],
  "capabilitySpecificDimensions": [
    {
      "capabilityName": "Select one of the micro-capabilities (e.g. UX Writing)",
      "dimensionName": "Evaluation metric name (e.g. User Reassurance)",
      "description": "Specific focus of evaluation (e.g. clarity, tone, reassuring labels on high-dropoff fields)"
    }
  ]
}

Ensure that for EACH micro-capability selected, you include at least 1 dimension under "capabilitySpecificDimensions".
Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI CUSTOM TEST] Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${model}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text.trim());
      if (
        parsed.prompt &&
        Array.isArray(parsed.requirements) &&
        parsed.projectContext &&
        parsed.businessProblem &&
        Array.isArray(parsed.constraints) &&
        Array.isArray(parsed.deliverables) &&
        Array.isArray(parsed.capabilitySpecificDimensions)
      ) {
        console.log(`[GEMINI CUSTOM TEST] Successfully generated custom structured test with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI CUSTOM TEST] Model ${model} failed:`, e.message || e);
    }
  }

  console.warn("[GEMINI CUSTOM TEST] All models failed. Returning null.");
  return null;
}



