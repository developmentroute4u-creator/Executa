import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { User } from "@/models/User";
import { getEffortLevel, getRateRange, calculatePrice } from "@/lib/utils";
import { askGeminiForScope } from "@/lib/gemini";

// GET /api/projects — list client's projects
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = token.id;
  const role = token.role;

  const query = role === "client" ? { clientId: userId } : { freelancerId: userId };
  const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

  const populatedProjects = await Promise.all(
    projects.map(async (p) => {
      let freelancerName = null;
      if (p.freelancerId) {
        const f = await User.findById(p.freelancerId).lean();
        freelancerName = (f as any)?.name || null;
      }
      return { ...p, freelancerName };
    })
  );

  return NextResponse.json({ projects: populatedProjects });
}

// POST /api/projects — create project + generate scope
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (token.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      domain,
      projectDescription,
      projectProblem,
      targetUsers,
      userJourney,
      managedEntities,
      specialRequirements,
      successCriteria,
      priority,
      deadline,
    } = body;

    await connectDB();
    const userId = token.id as string;

    const project = await Project.create({
      clientId: userId,
      title,
      field: domain === "Development" ? "development" : domain === "Design & Development" ? "design_development" : "design",
      projectDescription,
      projectProblem,
      targetUsers,
      userJourney,
      managedEntities,
      specialRequirements: specialRequirements || "",
      successCriteria,
      priority: priority || "medium",
      deadline: deadline ? new Date(deadline) : undefined,
      status: "scoping",
    });

    if (!project) {
      throw new Error("Project creation failed in DB");
    }

    // Attempt to generate scope using Gemini with automatic fallbacks
    let generatedScope;
    try {
      generatedScope = await askGeminiForScope({
        title,
        domain,
        projectDescription,
        projectProblem,
        targetUsers,
        userJourney,
        managedEntities,
        specialRequirements,
        successCriteria
      });
    } catch (e: any) {
      console.warn(`[GEMINI RATE LIMIT/ERROR] ${e.message || e}. Falling back to offline generator.`);
      generatedScope = null;
    }

    // If Gemini fails (e.g. rate limit, invalid key), use the offline scope generator
    if (!generatedScope) {
      console.log("[POST /api/projects] Gemini failed. Generating offline fallback scope...");
      const result = generateScope({
        title,
        goal: successCriteria,
        businessModel: projectDescription,
        field: domain
      });
      generatedScope = {
        ...result,
        projectSummary: {
          overview: projectDescription || "A managed project.",
          businessGoal: successCriteria || "Achieve project success criteria.",
          primaryUsers: [targetUsers || "End Users"]
        },
        overallIncluded: [
          "Core features described in project foundation",
          "Functional units as defined in scope document",
          "Clean responsive UI view matching domain requirement"
        ],
        overallExcluded: [
          "Additional modules outside original request",
          "Production server costs and hosting licenses",
          "Continuous integration and continuous deployment pipelines"
        ],
        expectedDeliverables: [
          domain === "Design" ? "Figma visual layout files" : "Production-ready git repository source code"
        ],
        requiredCapabilities: [
          domain === "Design" ? "UI/UX Design" : "Fullstack Web Development"
        ]
      };
    }

    // Calibrate totalEffortScore and timeline from Gemini results
    const functionalUnits = generatedScope.functionalUnits.map((u: any) => ({
      id: u.name.toLowerCase().replace(/\s/g, "_"),
      name: u.name,
      description: u.description || "",
      included: u.included || [],
      excluded: u.excluded || [],
      deliverables: u.deliverables || [],
      unitScore: u.unitScore || u.effortDrivers?.totalScore || 30,
      effortDrivers: u.effortDrivers || {
        logicDepth: 5, interactionDensity: 5, dataHandling: 5,
        dependencyLevel: 5, variations: 5, outputExpectation: 5,
        totalScore: u.unitScore || 30
      }
    }));

    const totalEffortScore = functionalUnits.reduce((sum: number, u: any) => sum + u.unitScore, 0);
    const weeks = Math.ceil(totalEffortScore / 15);

    const formattedScope = {
      projectSummary: generatedScope.projectSummary || {
        overview: projectDescription,
        businessGoal: successCriteria,
        primaryUsers: [targetUsers]
      },
      functionalUnits,
      overallIncluded: generatedScope.overallIncluded || [],
      overallExcluded: generatedScope.overallExcluded || [],
      expectedDeliverables: generatedScope.expectedDeliverables || [],
      requiredCapabilities: generatedScope.requiredCapabilities || [],
      totalEffortScore,
      timeline: { estimated: weeks, unit: "weeks" as const },
      revisionRules: [
        "2 revision rounds included per functional unit",
        "Revisions must be within original scope definition",
        "Change requests outside scope require upgrade approval"
      ],
      upgradeRules: [
        "New functional units can be added via upgrade request",
        "Upgrades are priced at current rate per effort point",
        "Timeline adjusts proportionally with upgrades"
      ]
    };

    const effortLevel = getEffortLevel(formattedScope.totalEffortScore);

    const scope = await Scope.create({
      projectId: project._id,
      ...formattedScope,
      effortLevel,
      status: "draft",
    });

    // Update project with scope + pricing
    const rateRange = getRateRange(domain === "Development" ? "development" : "design", effortLevel);
    const avgRate = Math.round((rateRange.min + rateRange.max) / 2);
    const pricing = calculatePrice(formattedScope.totalEffortScore, avgRate);

    await Project.findByIdAndUpdate(project._id, {
      scopeId: scope?._id,
      requiredLevel: effortLevel,
      pricing: { ...pricing, ratePerPoint: avgRate, accountabilityMode: "basic" },
      status: "scope_review",
    });

    return NextResponse.json({ projectId: project._id.toString(), scopeId: scope?._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("[CREATE_PROJECT]", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}

// Scope generation engine
function generateScope(input: any) {
  const { title, goal, businessModel, field } = input;

  const unitMap: Record<string, any> = {
    "Authentication": {
      name: "Authentication System",
      description: "User registration, login, session management, and access control",
      included: ["Email/password auth", "Session handling", "Protected routes", "Password reset"],
      excluded: ["Social OAuth (add-on)", "2FA (add-on)"],
      deliverables: ["Auth flow", "JWT implementation", "Route guards"],
      effortDrivers: { name: "Authentication", logicDepth: 7, interactionDensity: 5, dataHandling: 6, dependencyLevel: 5, variations: 4, outputExpectation: 7, totalScore: 34 },
    },
    "Dashboard": {
      name: "Dashboard",
      description: "Primary data visualization and user control interface",
      included: ["Summary metrics", "Activity feed", "Quick actions", "Responsive layout"],
      excluded: ["Custom report builder (add-on)", "Data exports (add-on)"],
      deliverables: ["Dashboard UI", "Data connectors", "State management"],
      effortDrivers: { name: "Dashboard", logicDepth: 6, interactionDensity: 8, dataHandling: 7, dependencyLevel: 6, variations: 6, outputExpectation: 8, totalScore: 41 },
    },
    "API": {
      name: "API Layer",
      description: "RESTful API endpoints with validation and error handling",
      included: ["CRUD endpoints", "Input validation", "Error handling", "API documentation"],
      excluded: ["GraphQL (add-on)", "WebSockets (add-on)"],
      deliverables: ["API routes", "Validation schemas", "Error responses"],
      effortDrivers: { name: "API Layer", logicDepth: 8, interactionDensity: 4, dataHandling: 8, dependencyLevel: 7, variations: 5, outputExpectation: 8, totalScore: 40 },
    },
    "Payment": {
      name: "Payment & Checkout",
      description: "Secure payment processing and order management",
      included: ["Payment gateway integration", "Order tracking", "Invoice generation", "Refund flow"],
      excluded: ["Multi-currency (add-on)", "Subscription billing (add-on)"],
      deliverables: ["Payment UI", "Gateway integration", "Order management"],
      effortDrivers: { name: "Payment", logicDepth: 9, interactionDensity: 6, dataHandling: 8, dependencyLevel: 8, variations: 5, outputExpectation: 9, totalScore: 45 },
    },
    "Search": {
      name: "Search & Filter",
      description: "Advanced content discovery with filtering and sorting",
      included: ["Full-text search", "Filter system", "Sort controls", "Pagination"],
      excluded: ["AI semantic search (add-on)", "Faceted search (add-on)"],
      deliverables: ["Search UI", "Query engine", "Filter components"],
      effortDrivers: { name: "Search", logicDepth: 7, interactionDensity: 7, dataHandling: 7, dependencyLevel: 5, variations: 6, outputExpectation: 7, totalScore: 39 },
    },
    "Profile": {
      name: "User Profile",
      description: "User account management and profile customization",
      included: ["Profile editing", "Avatar upload", "Account settings", "Notification preferences"],
      excluded: ["Portfolio showcase (add-on)", "Social features (add-on)"],
      deliverables: ["Profile UI", "Settings panel", "Image upload"],
      effortDrivers: { name: "Profile", logicDepth: 4, interactionDensity: 6, dataHandling: 5, dependencyLevel: 4, variations: 4, outputExpectation: 5, totalScore: 28 },
    },
    "SEO": {
      name: "SEO Setup",
      description: "Technical SEO foundations and meta optimization",
      included: ["Meta tags", "Sitemap", "Structured data", "OG tags", "Performance basics"],
      excluded: ["Content strategy (add-on)", "Analytics setup (add-on)"],
      deliverables: ["SEO component", "Sitemap config", "Schema markup"],
      effortDrivers: { name: "SEO", logicDepth: 4, interactionDensity: 2, dataHandling: 3, dependencyLevel: 3, variations: 3, outputExpectation: 5, totalScore: 20 },
    },
    "Notification": {
      name: "Notification System",
      description: "In-app and email notification delivery",
      included: ["In-app notifications", "Email templates", "Notification preferences", "Read/unread state"],
      excluded: ["Push notifications (add-on)", "SMS (add-on)"],
      deliverables: ["Notification center", "Email templates", "Event triggers"],
      effortDrivers: { name: "Notification", logicDepth: 5, interactionDensity: 4, dataHandling: 5, dependencyLevel: 6, variations: 4, outputExpectation: 5, totalScore: 29 },
    },
  };

  // Match functionality to units based on brief (title, goal, businessModel)
  const matched: any[] = [];
  const keywords: Record<string, string> = {
    auth: "Authentication", login: "Authentication", register: "Authentication", user: "Authentication", signup: "Authentication", "sign-in": "Authentication", password: "Authentication", credentials: "Authentication",
    dashboard: "Dashboard", analytics: "Dashboard", metrics: "Dashboard", charts: "Dashboard", graphs: "Dashboard", kpi: "Dashboard",
    api: "API", endpoint: "API", backend: "API", restful: "API", graphql: "API",
    payment: "Payment", checkout: "Payment", billing: "Payment", stripe: "Payment", paypal: "Payment", subscription: "Payment", purchase: "Payment", cart: "Payment",
    search: "Search", filter: "Search", browse: "Search", sort: "Search", find: "Search",
    profile: "Profile", account: "Profile", settings: "Profile", avatar: "Profile", bio: "Profile",
    seo: "SEO", "search engine": "SEO", sitemap: "SEO", metadata: "SEO",
    notification: "Notification", email: "Notification", alert: "Notification", sms: "Notification", push: "Notification", notify: "Notification",
  };

  const usedUnits = new Set<string>();
  const scanText = `${title || ""} ${goal || ""} ${businessModel || ""}`.toLowerCase();

  // Match from keywords found in the text brief
  for (const [kw, unit] of Object.entries(keywords)) {
    if (scanText.includes(kw) && !usedUnits.has(unit) && unitMap[unit]) {
      usedUnits.add(unit);
      matched.push({ id: unit.toLowerCase().replace(/\s/g, "_"), ...unitMap[unit] });
    }
  }

  // Default units if nothing matched
  if (matched.length === 0) {
    usedUnits.add("Authentication");
    usedUnits.add("Dashboard");
    matched.push({ id: "authentication", ...unitMap["Authentication"] });
    matched.push({ id: "dashboard", ...unitMap["Dashboard"] });
  }

  const totalEffortScore = matched.reduce((sum, u) => sum + u.effortDrivers.totalScore, 0);
  const weeks = Math.ceil(totalEffortScore / 15);

  return {
    functionalUnits: matched.map((u) => ({
      ...u,
      unitScore: u.effortDrivers.totalScore,
    })),
    totalEffortScore,
    timeline: { estimated: weeks, unit: "weeks" as const },
    revisionRules: [
      "2 revision rounds included per functional unit",
      "Revisions must be within original scope definition",
      "Change requests outside scope require upgrade approval",
    ],
    upgradeRules: [
      "New functional units can be added via upgrade request",
      "Upgrades are priced at current rate per effort point",
      "Timeline adjusts proportionally with upgrades",
    ],
  };
}
