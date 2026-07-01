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

// OpenRouter model configurations
export const PRIMARY_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct",
  "meta-llama/llama-3.3-70b-instruct"
];

export const MATCHING_MODELS = [
  "deepseek/deepseek-r1-distill-llama-70b",
  "meta-llama/llama-3.3-70b-instruct"
];

// Centralized OpenRouter API wrapper with fallback logic
export async function callOpenRouterApi(models: string[], prompt: string, responseFormatJson: boolean = true): Promise<any> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;

  if (!keyToUse) {
    console.warn("[OPENROUTER] No API key found in env variables.");
    throw new Error("Missing OPENROUTER_API_KEY or GEMINI_API_KEY");
  }

  const errors: string[] = [];
  for (const model of models) {
    try {
      console.log(`[OPENROUTER] Trying model: ${model}`);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${keyToUse}`,
        "HTTP-Referer": "https://executa.io",
        "X-Title": "Executa"
      };

      const body: any = {
        model: model,
        messages: [
          { role: "user", content: prompt }
        ]
      };

      if (responseFormatJson) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const resText = await response.text();
        if (response.status === 429) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("API_KEY_INVALID");
        }
        throw new Error(`Status ${response.status}: ${resText}`);
      }

      const resJson = await response.json();
      let text = resJson.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from OpenRouter.");
      }

      text = text.trim();
      if (responseFormatJson) {
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length - 3);
        return JSON.parse(text.trim());
      }

      return text;
    } catch (e: any) {
      console.warn(`[OPENROUTER] Model ${model} failed:`, e.message || e);
      errors.push(e.message || "");
    }
  }

  console.error("[OPENROUTER] All models in the chain failed. Errors:", errors);
  if (errors.some(e => e.includes("RATE_LIMIT_EXCEEDED"))) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
  if (errors.some(e => e.includes("API_KEY_INVALID"))) {
    throw new Error("API_KEY_INVALID");
  }
  throw new Error("RATE_LIMIT_EXCEEDED");
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

  try {
    const parsed = await callOpenRouterApi(PRIMARY_MODELS, prompt);
    if (parsed.functionalUnits && Array.isArray(parsed.functionalUnits)) {
      console.log("[OPENROUTER] Successfully generated scope");
      return parsed;
    }
  } catch (e: any) {
    console.error("[OPENROUTER] Scope generation failed:", e);
    throw e;
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

  try {
    const parsed = await callOpenRouterApi(PRIMARY_MODELS, prompt);
    if (parsed.name && parsed.included && parsed.excluded && parsed.deliverables) {
      console.log("[OPENROUTER] Successfully expanded custom unit");
      return parsed;
    }
  } catch (e: any) {
    console.error("[OPENROUTER] Custom unit expansion failed:", e);
    throw e;
  }
  throw new Error("RATE_LIMIT_EXCEEDED");
}

// Helper to calculate freelancer match score using deterministic platform logic
export function calculateFreelancerMatchScore(
  project: { title: string; goal: string; field: string; requiredLevel?: number; functionalUnits: any[] },
  freelancer: { id: string; name: string; domain: string; level: number | null; specializations: string[]; bio: string; testScore: number | null; available?: boolean }
): number {
  // 1. Skills overlap (35% weight)
  const projectText = (
    project.title + " " +
    project.goal + " " +
    project.functionalUnits.map(u => u.name + " " + u.description + " " + (u.included || []).join(" ")).join(" ")
  ).toLowerCase();

  const freelancerSkills = freelancer.specializations || [];
  let matchedSkillsCount = 0;
  freelancerSkills.forEach(skill => {
    if (projectText.includes(skill.toLowerCase())) {
      matchedSkillsCount++;
    }
  });

  // Check domain match
  if (freelancer.domain && projectText.includes(freelancer.domain.toLowerCase().replace("_", " "))) {
    matchedSkillsCount += 1;
  }

  let skillsScore = 70; // baseline
  if (freelancerSkills.length > 0) {
    const skillRatio = matchedSkillsCount / Math.max(1, freelancerSkills.length);
    skillsScore = 70 + Math.min(30, skillRatio * 30);
  }

  // 2. Experience Level vs Project Level (35% weight)
  const fLevel = freelancer.level || 1;
  const pLevel = project.requiredLevel || 2;
  let expScore = 70;
  if (fLevel >= pLevel) {
    expScore = 90 + Math.min(10, (fLevel - pLevel) * 5); // 90 to 100
  } else if (fLevel === pLevel - 1) {
    expScore = 80;
  } else {
    expScore = 65; // two levels below
  }

  // 3. Vetting Results (20% weight)
  // testScore is out of 50. Normalize to 0-100.
  const testScoreVal = freelancer.testScore !== null ? freelancer.testScore : 40;
  const vettingScore = (testScoreVal / 50) * 100;

  // 4. Availability (10% weight)
  const availabilityScore = freelancer.available !== false ? 100 : 0;

  // Combine: Skills (35%), Experience (35%), Vetting (20%), Availability (10%)
  let fitScore = Math.round(
    (skillsScore * 0.35) +
    (expScore * 0.35) +
    (vettingScore * 0.20) +
    (availabilityScore * 0.10)
  );

  return Math.max(0, Math.min(100, fitScore));
}

export async function askGeminiToMatchFreelancers(
  project: { title: string; goal: string; field: string; requiredLevel?: number; functionalUnits: any[] },
  freelancers: Array<{ id: string; name: string; domain: string; level: number | null; specializations: string[]; bio: string; testScore: number | null; available?: boolean }>
): Promise<any | null> {
  const prompt = `You are a premium AI matching agent. Your task is to write detailed fit explanations for qualified freelancers for the following project:

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

INSTRUCTIONS:
1. For each freelancer, explain in a highly articulate, premium paragraph (fitReason) exactly how the freelancer's specific skills and specializations align to the scope of this project and why they are qualified to execute it. Focus on specific technical domain compatibility (e.g. why their React or Figma expertise matches the functional units).
2. Identify the absolute best-suited freelancer(s) for the project:
   - If Field is "development" or "design", identify the absolute best-suited freelancer and return their ID in 'bestMatches' with role "fullstack" or the relevant domain.
   - If Field is "design_development", you MUST identify TWO distinct top freelancers: one specifically specialized in Design and one specifically specialized in Development. Return BOTH of their IDs in the 'bestMatches' array, explicitly assigning them the "design" and "development" roles respectively.

Return your response strictly in the following JSON format. Do not wrap in markdown or add notes.
{
  "matches": [
    {
      "freelancerId": "ID of freelancer",
      "fitReason": "Highly detailed paragraph explaining the exact capability match..."
    }
  ],
  "bestMatches": [
    {
      "freelancerId": "ID of best freelancer",
      "role": "design or development or fullstack"
    }
  ]
}`;

  try {
    const parsed = await callOpenRouterApi(MATCHING_MODELS, prompt);
    if (parsed && parsed.matches && parsed.bestMatches) {
      const matches = freelancers.map(f => {
        const matchDetails = (parsed.matches || []).find((m: any) => m.freelancerId === f.id);
        const fitScore = calculateFreelancerMatchScore(project, f);
        return {
          freelancerId: f.id,
          fitScore,
          fitReason: matchDetails?.fitReason || "Highly qualified professional with matching domain expertise."
        };
      });

      console.log("[OPENROUTER] Successfully matched freelancers with platform-calculated scores");
      return {
        matches,
        bestMatches: parsed.bestMatches
      };
    }
  } catch (e: any) {
    console.error("[OPENROUTER] Matching failed:", e);
  }

  // Fallback: calculate matches entirely on platform logic
  console.log("[OPENROUTER] Fallback: Calculating matches entirely on platform logic");
  const matches = freelancers.map(f => {
    const fitScore = calculateFreelancerMatchScore(project, f);
    return {
      freelancerId: f.id,
      fitScore,
      fitReason: `Vetted ${f.domain} specialist with matching capabilities. Highly capable at Level ${f.level || 1}.`
    };
  });

  const sorted = [...freelancers].map(f => ({
    ...f,
    fitScore: calculateFreelancerMatchScore(project, f)
  })).sort((a, b) => b.fitScore - a.fitScore);

  const bestMatches: any[] = [];
  if (project.field === "design_development") {
    const bestDesigner = sorted.find(f => f.domain === "ui_ux" || f.domain === "product" || f.domain === "motion" || f.domain === "branding" || f.domain === "graphic");
    const bestDeveloper = sorted.find(f => f.domain !== "ui_ux" && f.domain !== "product" && f.domain !== "motion" && f.domain !== "branding" && f.domain !== "graphic");
    if (bestDesigner) bestMatches.push({ freelancerId: bestDesigner.id, role: "design" });
    if (bestDeveloper) bestMatches.push({ freelancerId: bestDeveloper.id, role: "development" });
  } else {
    if (sorted[0]) {
      bestMatches.push({ freelancerId: sorted[0].id, role: project.field === "design" ? "design" : "development" });
    }
  }

  return { matches, bestMatches };
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

  try {
    const parsed = await callOpenRouterApi(PRIMARY_MODELS, prompt);
    if (
      parsed &&
      parsed.prompt &&
      Array.isArray(parsed.requirements) &&
      parsed.projectContext &&
      parsed.businessProblem &&
      Array.isArray(parsed.constraints) &&
      Array.isArray(parsed.deliverables) &&
      Array.isArray(parsed.capabilitySpecificDimensions)
    ) {
      console.log("[OPENROUTER] Successfully generated custom structured test");
      return parsed;
    }
  } catch (e: any) {
    console.error("[OPENROUTER] Custom test generation failed:", e);
  }
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

  try {
    const parsed = await callOpenRouterApi(PRIMARY_MODELS, prompt);
    if (parsed && parsed.proposedUnit && parsed.scopeImpactSummary) {
      console.log("[OPENROUTER] Successfully generated scope upgrade unit");
      return parsed;
    }
  } catch (e: any) {
    console.error("[OPENROUTER] Scope upgrade unit generation failed:", e);
  }
  return null;
}
