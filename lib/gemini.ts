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

// Model priority order based on API key availability and capability:
// 1. gemini-3.5-flash  — Primary (top model, 5 RPM / 20 RPD)
// 2. gemini-2.5-flash  — Fallback (same limits, slightly lower tier)
// 3. gemini-3.1-flash-lite — Last resort (15 RPM / 500 RPD, high volume)
const MODELS = [
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite"
];

// Centralized premium helper with researched daily limit tracking and auto-failover/switch logic
async function callGeminiApi(model: string, prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[GEMINI] No GEMINI_API_KEY env variable found.");
    throw new Error("Missing GEMINI_API_KEY");
  }

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
    if (response.status === 429) {
      const limitsInfo: Record<string, string> = {
        "gemini-3.5-flash": "Gemini 3.5 Flash: 5 RPM / 250K TPM / 20 RPD limit reached.",
        "gemini-2.5-flash": "Gemini 2.5 Flash: 5 RPM / 250K TPM / 20 RPD limit reached.",
        "gemini-3.1-flash-lite": "Gemini 3.1 Flash Lite: 15 RPM / 250K TPM / 500 RPD limit reached.",
      };
      const limitMessage = limitsInfo[model] || `Daily rate limit reached for model ${model}.`;
      console.error(`[DAILY LIMIT EXCEEDED] ${limitMessage} Automatically switching to the next available model...`);
    }
    const resText = await response.text();
    console.error(`[GEMINI API ERROR] Model ${model} returned ${response.status}: ${resText}`);
    throw new Error(`HTTP ${response.status} from ${model}`);
  }

  const resJson = await response.json();
  let text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }

  // Remove potential markdown wrappers
  text = text.trim();
  if (text.startsWith("```json")) text = text.substring(7);
  else if (text.startsWith("```")) text = text.substring(3);
  if (text.endsWith("```")) text = text.substring(0, text.length - 3);
  
  return JSON.parse(text.trim());
}

export interface DiscoveryPayload {
  title: string;
  domain: string;
  projectDescription: string;
  projectProblem: string;
  targetUsers: string;
  userJourney: string;
  managedEntities: string;
  specialRequirements?: string;
  successCriteria: string;
}

export async function askGeminiForScope(
  payload: DiscoveryPayload
): Promise<any | null> {
  const prompt = `You are an elite software scoping and architecture engine. Your objective is to discover the project scope based ENTIRELY on the client's own words and business outcomes below. You MUST use EVERY piece of information provided — do NOT ignore or summarize away any detail.

PROJECT FOUNDATION:
- Name: "${payload.title}"
- Domain: "${payload.domain}" (NOTE: If this is 'Design & Development' or 'both', you MUST incorporate BOTH UX/UI design processes like wireframing/mockups AND technical development implementation seamlessly into the functional units and deliverables. You must generate distinct, highly detailed functional units for BOTH the Design phase and the Development phase. Do not skew entirely to one or the other. Give equal, massive weight to both.)

DISCOVERY INTELLIGENCE (Client's Own Words — USE ALL OF THIS):
- Project Overview: "${payload.projectDescription}"
- Problem Being Solved: "${payload.projectProblem}"
- Target Users: "${payload.targetUsers}"
- User Journey & Actions: "${payload.userJourney}"
- Entities & Info Managed: "${payload.managedEntities}"
- Special Requirements: "${payload.specialRequirements || "None"}"
- Success Criteria: "${payload.successCriteria}"

CRITICAL RULES FOR MAXIMAL COMPREHENSIVENESS:
- You MUST read and incorporate EVERY field above into the scope. If the client mentioned specific features, integrations, user types, entities, or requirements, they MUST appear in your functional units, included scope, or deliverables.
- The project summary must reflect the client's ACTUAL project — not a generic template.
- Functional units must be derived FROM the client's description, user journey, entities, and requirements. Provide a COMPREHENSIVE list of units (generate at least 6 to 12 units to cover everything deeply).
- "Included" arrays MUST be extremely detailed, spelling out exactly "what includes what" at a granular level. Do not be vague. List every expected micro-feature, flow, or screen component.
- The "excluded" items should be realistic premium add-ons that the client did NOT mention.
- NEVER generate simple screen or page counts. Focus on comprehensive capability delivery.
- Your unitScores should reflect realistic India-market effort (typically 12-28 per unit). A standard feature like auth = 14, a complex feature like payment = 22. Keep total project score between 60-180 for most projects so pricing feels fair and competitive for Indian clients.

INSTRUCTIONS:
1. Generate OUTPUT 1: Project Summary.
2. CRITICAL MANDATORY DOMAIN RULE — YOU MUST FOLLOW THIS EXACTLY:
   - If Domain is 'Design' → Generate ONLY UI/UX, wireframing, visual design, and design-system-focused functional units. Do NOT include any backend, API, database, or development units.
   - If Domain is 'Development' → Generate ONLY technical implementation units (Frontend code, Backend, Database, API, Infrastructure). Do NOT include any design-specific units like wireframing or mockups.
   - If Domain is 'Design & Development' → Generate DISTINCT, comprehensive units for BOTH the Design phase AND the Development phase with equal weight to both.
   VIOLATION OF THIS RULE IS UNACCEPTABLE. The domain is non-negotiable.
3. For each Functional Unit, assign a unitScore between 12 and 28 points based on logic depth and implementation complexity for India market rates, and build an effortDrivers object.
4. Generate OUTPUT 3: Expected Deliverables (derived strictly from the client's domain. E.g. Figma files for Design, Source Code for Development).
5. Generate OUTPUT 4: Included Scope (explicit, measurable, execution-focused items that the client mentioned or clearly needs).
6. Generate OUTPUT 5: Excluded Scope (protect both client and freelancer, e.g., Future Enhancements, 3rd Party Costs, things NOT mentioned).
7. Generate OUTPUT 6: Required Capabilities (technical skills needed based on domain and project).

Return your response strictly in the following JSON format. Do not wrap in markdown or add notes.
{
  "projectSummary": {
    "overview": "Professional and detailed overview that references the client's specific project, problem, and goals",
    "businessGoal": "The primary business outcome derived from the client's success criteria",
    "primaryUsers": ["Specific user groups the client mentioned"]
  },
  "functionalUnits": [
    {
      "name": "Unit Name Derived From Client's Description",
      "description": "Outcome-based description reflecting what the client actually needs",
      "included": ["Granular detail 1 (what includes what)", "Granular detail 2", "Granular detail 3"],
      "excluded": ["Premium add-on not mentioned by client"],
      "deliverables": ["Concrete deliverable"],
      "unitScore": 20,
      "effortDrivers": {
        "logicDepth": 7, "interactionDensity": 5, "dataHandling": 6, "dependencyLevel": 5, "variations": 4, "outputExpectation": 7, "totalScore": 20
      }
    }
  ],
  "overallIncluded": ["Measurable inclusion derived from client's input"],
  "overallExcluded": ["Future Enhancements", "Third-party API costs"],
  "expectedDeliverables": ["Deliverable based on domain"],
  "requiredCapabilities": ["Backend Development", "Mobile App Development"]
}`;

  const errors: string[] = [];
  for (const model of MODELS) {
    try {
      console.log(`[GEMINI] Trying model: ${model}`);
      const parsed = await callGeminiApi(model, prompt);
      if (parsed.functionalUnits && Array.isArray(parsed.functionalUnits)) {
        console.log(`[GEMINI] Successfully generated scope with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI] Model ${model} failed:`, e.message || e);
      errors.push(e.message || "");
    }
  }

  console.warn("[GEMINI] All models failed or rate limited. Errors: ", errors);
  if (errors.some(e => e.includes("429"))) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  } else if (errors.some(e => e.includes("403") && e.includes("leaked"))) {
    throw new Error("API_KEY_LEAKED");
  } else if (errors.some(e => e.includes("400") && e.includes("API key not valid"))) {
    throw new Error("API_KEY_INVALID");
  } else if (errors.some(e => e.includes("403") || e.includes("401") || e.includes("400"))) {
    throw new Error("API_KEY_INVALID");
  } else if (errors.some(e => e.includes("404"))) {
    throw new Error("MODEL_NOT_FOUND");
  }
  
  throw new Error("RATE_LIMIT_EXCEEDED");
}

export async function askGeminiForCustomUnit(
  name: string,
  description: string,
  field: string = "development"
): Promise<any | null> {
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

  const errors: string[] = [];
  for (const model of MODELS) {
    try {
      console.log(`[GEMINI CUSTOM UNIT] Trying model: ${model}`);
      const parsed = await callGeminiApi(model, prompt);
      if (parsed.name && parsed.included && parsed.excluded && parsed.deliverables) {
        console.log(`[GEMINI CUSTOM UNIT] Successfully expanded unit with model ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI CUSTOM UNIT] Model ${model} failed:`, e.message || e);
      errors.push(e.message || "");
    }
  }

  console.warn("[GEMINI CUSTOM UNIT] All models failed or rate limited. Errors: ", errors);
  if (errors.some(e => e.includes("429"))) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  } else if (errors.some(e => e.includes("403") || e.includes("401") || e.includes("400"))) {
    throw new Error("API_KEY_INVALID");
  } else if (errors.some(e => e.includes("404"))) {
    throw new Error("MODEL_NOT_FOUND");
  }

  throw new Error("RATE_LIMIT_EXCEEDED");
}

export async function askGeminiToMatchFreelancers(
  project: { title: string; goal: string; field: string; requiredLevel?: number; functionalUnits: any[] },
  freelancers: Array<{ id: string; name: string; domain: string; level: number | null; specializations: string[]; bio: string; testScore: number | null }>
): Promise<any | null> {
  const prompt = `You are a premium AI matching agent. Your task is to evaluate and match the best freelancer(s) for the following project:

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
Test Score: ${f.testScore || "N/A"}/50
Bio: "${f.bio}"
`).join("\n\n")}

For each freelancer, calculate a match percentage (fitScore, integer 0-100) based on:
1. Specialization and skill overlap with the project functional units and goal.
2. Capability level (freelancers at or above required project level are preferred).
3. Test performance score.

CRITICAL CALIBRATION RULE FOR MATCH SCORE (fitScore):
- Be constructive, encouraging, and balanced. Since every candidate in this pool has ALREADY passed our rigorous, multi-hour vetting test and is approved, their baseline match score should be high.
- A candidate who has matching skills/specializations but is one level below the project required difficulty (e.g. a Level 2 freelancer for a Level 3 project) is still highly competent and should be scored between 70% and 88% based on their skill overlap. Do not penalize them down to low or discouraging scores (like 30% - 50%).
- A candidate who is an exact level match or higher should be scored between 85% and 98% based on skill alignment.

Explain in a highly articulate, premium paragraph (fitReason) exactly how the freelancer's specific skills align to the scope of this project and why they are qualified to execute it.

MATCHING LOGIC:
- If Field is "development" or "design", identify the absolute best-suited freelancer and return their ID in 'bestMatches' with role "fullstack" or the relevant domain.
- If Field is "design_development", you MUST identify TWO distinct top freelancers: one specifically specialized in Design and one specifically specialized in Development. Return BOTH of their IDs in the 'bestMatches' array, explicitly assigning them the "design" and "development" roles respectively.

Return your response strictly in the following JSON format:
{
  "matches": [
    {
      "freelancerId": "ID of freelancer",
      "fitScore": 95,
      "fitReason": "Highly detailed paragraph explaining the exact capability match..."
    }
  ],
  "bestMatches": [
    {
      "freelancerId": "ID of best freelancer",
      "role": "design or development or fullstack"
    }
  ]
}

Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI MATCHING] Trying model: ${model}`);
      const parsed = await callGeminiApi(model, prompt);
      if (parsed.matches && parsed.bestMatches) {
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
  const prompt = `You are a premium technical vetting director for a governed execution platform.
Your job is to generate an EXTREMELY DETAILED, custom, highly practical, and challenging Level 2 skill evaluation test task for a freelancer.

The freelancer has selected the following expertise:
Primary Field: "${field}"
Selected Domains: ${domains.join(", ")}
Selected Micro-Capabilities: ${specializations.join(", ")}

You MUST generate ONE blended real-world business assignment that incorporates all the chosen micro-capabilities naturally.
Do NOT generate separate questions. Do NOT generate generic academic, tutorial-level, or repetitive tasks.

The output MUST be a strict, valid JSON matching the following structure:
{
  "projectContext": "Provide a massive, highly realistic business scenario (2-3 detailed paragraphs) outlining a premium company commission (e.g. 'A high-growth multi-tenant SaaS analytics platform designed for...'). Avoid simple, generic contexts.",
  "businessProblem": "State a comprehensive, highly realistic operational and technical challenge they need to solve (2-3 detailed paragraphs). Explain the specific visual dropoffs, latency bottlenecks, or scaling limits they must address.",
  "prompt": "A highly concise, action-oriented, and professional assignment title or headline (e.g. 'Build a High-Performance Collaborative white-board component with CRDT sync'). Never use generic titles.",
  "constraints": [
    "5-7 highly specific, strict technical constraints (e.g. strict auto-layout without CSS frameworks, performance loading budgets like LCP under 1.2s, inclusions/exclusions)."
  ],
  "deliverables": [
    "4-6 high-quality tangible deliverables (e.g. 'Production-ready GitHub repository with strict commit hygiene', 'Hosted live URL on Vercel', 'Comprehensive architectural trade-off document')."
  ],
  "requirements": [
    "7-10 highly technical, granular, actionable requirements specific to their exact micro-capabilities (e.g. edge cases, state hydration, precise API routing protections)."
  ],
  "capabilitySpecificDimensions": [
    {
      "capabilityName": "Must be exactly one of the selected micro-capabilities (e.g., from: ${specializations.join(", ")})",
      "dimensionName": "Advanced dynamic evaluation dimension name (e.g., 'Optimistic UI & Cache Synchronization')",
      "description": "Comprehensive specific focus of dynamic scoring evaluation"
    }
  ]
}

Ensure that for EACH micro-capability selected, you include at least 1 dimension under "capabilitySpecificDimensions".
Ensure the output is valid JSON. Do not wrap in markdown or add notes.`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI CUSTOM TEST] Trying model: ${model}`);
      const parsed = await callGeminiApi(model, prompt);
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

export async function askGeminiForScopeUpgrade(
  currentScopeContext: any,
  requestDetails: { whatToAdd: string; howItWorks: string; whyNeeded?: string },
  projectField: string = "development"
): Promise<any | null> {
  const prompt = `You are an elite software scoping engine. A client wants to upgrade an existing project scope.
  
EXISTING SCOPE CONTEXT (Summary):
Overview: ${currentScopeContext.projectSummary?.overview || ""}
Existing Total Functional Units: ${currentScopeContext.functionalUnits?.length || 0}
Existing Score: ${currentScopeContext.totalEffortScore || 0}
Project Domain Field: ${projectField}
CRITICAL DOMAIN RULE:
- If Project Domain Field is 'design' → The new unit MUST be design-only (UI/UX, wireframes, visual design, prototypes). Do NOT include backend, API, or development deliverables.
- If Project Domain Field is 'development' → The new unit MUST be development-only (code, APIs, database, infrastructure). Do NOT include wireframes or mockup deliverables.
- If Project Domain Field is 'design_development' or 'both' → You MUST incorporate BOTH UI/UX design deliverables AND technical development implementation. The 'included' array MUST explicitly list design aspects alongside development aspects.

CLIENT UPGRADE REQUEST:
What to Add: "${requestDetails.whatToAdd}"
How it Works: "${requestDetails.howItWorks}"
Why Needed: "${requestDetails.whyNeeded || "Not provided"}"

Your objective is to generate exactly ONE new Functional Unit that covers this new requirement, and analyze its impact. Ensure it reflects the required Domain Field.

Return your response strictly in the following JSON format. Do not wrap in markdown or add notes.
{
  "proposedUnit": {
    "name": "Professional Name for this Feature",
    "description": "Clear, professional description of the new unit",
    "included": ["Granular capability 1", "Granular capability 2"],
    "excluded": ["Out of scope item"],
    "deliverables": ["Tangible deliverable"],
    "unitScore": 30, 
    "effortDrivers": {
      "logicDepth": 5, "interactionDensity": 5, "dataHandling": 5, "dependencyLevel": 5, "variations": 5, "outputExpectation": 5, "totalScore": 30
    }
  },
  "scopeImpactSummary": "Business-friendly paragraph explaining what is being added and how it changes the project.",
  "deliverableImpact": ["New deliverable to expect", "Changes to existing deliverables"]
}`;

  for (const model of MODELS) {
    try {
      console.log(`[GEMINI UPGRADE] Trying model: ${model}`);
      const parsed = await callGeminiApi(model, prompt);
      if (parsed.proposedUnit && parsed.scopeImpactSummary) {
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[GEMINI UPGRADE] Model ${model} failed:`, e.message || e);
    }
  }

  console.warn("[GEMINI UPGRADE] All models failed. Returning null.");
  return null;
}
