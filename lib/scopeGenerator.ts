// Scope generation engine — domain-aware offline fallback
export function generateScope(input: any) {
  const { title, goal, businessModel, field } = input;

  // Normalized domain type
  const domainLower = (field || "").toLowerCase();
  const isDesign = domainLower === "design";
  const isDevelopment = domainLower === "development";
  const isBoth = domainLower === "design & development" || domainLower === "design_development";

  // ── DESIGN UNITS ──────────────────────────────────────────────────────────
  const DESIGN_UNIT_MAP: Record<string, any> = {
    "Discovery": {
      name: "UX Discovery & Research",
      description: "User research, competitor analysis, and information architecture to ground design decisions",
      included: ["Stakeholder interviews synthesis", "Competitive landscape analysis", "User persona creation", "Information architecture (IA) map", "Sitemap design"],
      excluded: ["Live user testing labs (add-on)", "Quantitative analytics audit (add-on)"],
      deliverables: ["Research report", "User personas", "IA sitemap"],
      effortDrivers: { logicDepth: 5, interactionDensity: 4, dataHandling: 4, dependencyLevel: 3, variations: 4, outputExpectation: 5, totalScore: 22 },
    },
    "Wireframing": {
      name: "Wireframing & Low-Fidelity Layouts",
      description: "Structural layout blueprints for all key screens and user flows",
      included: ["Low-fidelity wireframes for all key screens", "User flow diagrams", "Navigation architecture", "Mobile-first responsive layouts", "Annotated interaction notes"],
      excluded: ["High-fidelity mockups (next phase)", "Animated transitions (add-on)"],
      deliverables: ["Figma wireframe file", "User flow diagrams", "Annotated screens"],
      effortDrivers: { logicDepth: 5, interactionDensity: 7, dataHandling: 3, dependencyLevel: 4, variations: 6, outputExpectation: 6, totalScore: 26 },
    },
    "VisualDesign": {
      name: "Visual Identity & UI Design",
      description: "High-fidelity, pixel-perfect visual design for all screens with brand cohesion",
      included: ["Brand color palette & typography selection", "High-fidelity UI mockups for all screens", "Component states (hover, focus, error, loading)", "Dark/light mode variants", "Iconography and imagery direction"],
      excluded: ["Brand logo creation (add-on)", "Print/marketing materials (add-on)"],
      deliverables: ["Figma high-fidelity design file", "Color & typography guide"],
      effortDrivers: { logicDepth: 6, interactionDensity: 8, dataHandling: 4, dependencyLevel: 5, variations: 7, outputExpectation: 8, totalScore: 28 },
    },
    "Prototyping": {
      name: "Interactive Prototype",
      description: "Clickable prototype linking all screens to simulate the final user experience",
      included: ["Clickable Figma prototype linking all screens", "Micro-interaction definitions", "Transition animations between screens", "Stakeholder presentation flow"],
      excluded: ["Code implementation (add-on)", "Live user testing (add-on)"],
      deliverables: ["Shareable Figma prototype link", "Interaction specification notes"],
      effortDrivers: { logicDepth: 5, interactionDensity: 9, dataHandling: 3, dependencyLevel: 5, variations: 6, outputExpectation: 7, totalScore: 24 },
    },
    "DesignSystem": {
      name: "Design System & Component Library",
      description: "Reusable, scalable component library ensuring visual consistency across the product",
      included: ["Atomic component library (buttons, inputs, cards, modals)", "Spacing & grid system", "Figma auto-layout components", "Usage guidelines documentation"],
      excluded: ["Code component library (add-on)", "Accessibility WCAG audit (add-on)"],
      deliverables: ["Figma design system file", "Component usage documentation"],
      effortDrivers: { logicDepth: 6, interactionDensity: 6, dataHandling: 4, dependencyLevel: 5, variations: 5, outputExpectation: 7, totalScore: 25 },
    },
    "Handoff": {
      name: "Developer Handoff & Specifications",
      description: "Export-ready assets and developer annotations for smooth handoff",
      included: ["Exportable SVG/PNG assets", "Spacing & dimension annotations", "Figma Dev Mode activation", "Style guide with hex codes and font specs"],
      excluded: ["Code implementation (add-on)"],
      deliverables: ["Figma Dev Mode handoff link", "Asset export package", "Style guide PDF"],
      effortDrivers: { logicDepth: 3, interactionDensity: 3, dataHandling: 3, dependencyLevel: 4, variations: 3, outputExpectation: 5, totalScore: 15 },
    },
  };

  // ── DEVELOPMENT UNITS ─────────────────────────────────────────────────────
  const DEV_UNIT_MAP: Record<string, any> = {
    "Authentication": {
      name: "Authentication System",
      description: "User registration, login, session management, and access control",
      included: ["Email/password auth", "Session handling", "Protected routes", "Password reset"],
      excluded: ["Social OAuth (add-on)", "2FA (add-on)"],
      deliverables: ["Auth flow", "JWT implementation", "Route guards"],
      effortDrivers: { logicDepth: 7, interactionDensity: 5, dataHandling: 6, dependencyLevel: 5, variations: 4, outputExpectation: 7, totalScore: 34 },
    },
    "Dashboard": {
      name: "Dashboard",
      description: "Primary data visualization and user control interface",
      included: ["Summary metrics", "Activity feed", "Quick actions", "Responsive layout"],
      excluded: ["Custom report builder (add-on)", "Data exports (add-on)"],
      deliverables: ["Dashboard UI", "Data connectors", "State management"],
      effortDrivers: { logicDepth: 6, interactionDensity: 8, dataHandling: 7, dependencyLevel: 6, variations: 6, outputExpectation: 8, totalScore: 41 },
    },
    "API": {
      name: "API Layer",
      description: "RESTful API endpoints with validation and error handling",
      included: ["CRUD endpoints", "Input validation", "Error handling", "API documentation"],
      excluded: ["GraphQL (add-on)", "WebSockets (add-on)"],
      deliverables: ["API routes", "Validation schemas", "Error responses"],
      effortDrivers: { logicDepth: 8, interactionDensity: 4, dataHandling: 8, dependencyLevel: 7, variations: 5, outputExpectation: 8, totalScore: 40 },
    },
    "Payment": {
      name: "Payment & Checkout",
      description: "Secure payment processing and order management",
      included: ["Payment gateway integration", "Order tracking", "Invoice generation", "Refund flow"],
      excluded: ["Multi-currency (add-on)", "Subscription billing (add-on)"],
      deliverables: ["Payment UI", "Gateway integration", "Order management"],
      effortDrivers: { logicDepth: 9, interactionDensity: 6, dataHandling: 8, dependencyLevel: 8, variations: 5, outputExpectation: 9, totalScore: 45 },
    },
    "Search": {
      name: "Search & Filter",
      description: "Advanced content discovery with filtering and sorting",
      included: ["Full-text search", "Filter system", "Sort controls", "Pagination"],
      excluded: ["AI semantic search (add-on)", "Faceted search (add-on)"],
      deliverables: ["Search UI", "Query engine", "Filter components"],
      effortDrivers: { logicDepth: 7, interactionDensity: 7, dataHandling: 7, dependencyLevel: 5, variations: 6, outputExpectation: 7, totalScore: 39 },
    },
    "Profile": {
      name: "User Profile",
      description: "User account management and profile customization",
      included: ["Profile editing", "Avatar upload", "Account settings", "Notification preferences"],
      excluded: ["Portfolio showcase (add-on)", "Social features (add-on)"],
      deliverables: ["Profile UI", "Settings panel", "Image upload"],
      effortDrivers: { logicDepth: 4, interactionDensity: 6, dataHandling: 5, dependencyLevel: 4, variations: 4, outputExpectation: 5, totalScore: 28 },
    },
    "SEO": {
      name: "SEO Setup",
      description: "Technical SEO foundations and meta optimization",
      included: ["Meta tags", "Sitemap", "Structured data", "OG tags", "Performance basics"],
      excluded: ["Content strategy (add-on)", "Analytics setup (add-on)"],
      deliverables: ["SEO component", "Sitemap config", "Schema markup"],
      effortDrivers: { logicDepth: 4, interactionDensity: 2, dataHandling: 3, dependencyLevel: 3, variations: 3, outputExpectation: 5, totalScore: 20 },
    },
    "Notification": {
      name: "Notification System",
      description: "In-app and email notification delivery",
      included: ["In-app notifications", "Email templates", "Notification preferences", "Read/unread state"],
      excluded: ["Push notifications (add-on)", "SMS (add-on)"],
      deliverables: ["Notification center", "Email templates", "Event triggers"],
      effortDrivers: { logicDepth: 5, interactionDensity: 4, dataHandling: 5, dependencyLevel: 6, variations: 4, outputExpectation: 5, totalScore: 29 },
    },
  };

  // Keyword matchers: Design
  const DESIGN_KEYWORDS: Record<string, string> = {
    wireframe: "Wireframing", mockup: "VisualDesign", ui: "VisualDesign", ux: "Discovery",
    design: "VisualDesign", figma: "VisualDesign", prototype: "Prototyping", flow: "Prototyping",
    branding: "VisualDesign", typography: "VisualDesign", layout: "Wireframing",
    component: "DesignSystem", "design system": "DesignSystem", handoff: "Handoff",
    research: "Discovery", user: "Discovery", persona: "Discovery",
  };

  // Keyword matchers: Development
  const DEV_KEYWORDS: Record<string, string> = {
    auth: "Authentication", login: "Authentication", register: "Authentication", signup: "Authentication",
    dashboard: "Dashboard", analytics: "Dashboard", metrics: "Dashboard", charts: "Dashboard",
    api: "API", endpoint: "API", backend: "API", restful: "API",
    payment: "Payment", checkout: "Payment", billing: "Payment", stripe: "Payment", cart: "Payment",
    search: "Search", filter: "Search", browse: "Search",
    profile: "Profile", account: "Profile", settings: "Profile",
    seo: "SEO", sitemap: "SEO",
    notification: "Notification", email: "Notification", alert: "Notification",
  };

  const usedUnits = new Set<string>();
  const matched: any[] = [];
  const scanText = `${title || ""} ${goal || ""} ${businessModel || ""}`.toLowerCase();

  // Match units based on domain selection
  if (isDesign || isBoth) {
    for (const [kw, unit] of Object.entries(DESIGN_KEYWORDS)) {
      if (scanText.includes(kw) && !usedUnits.has(unit) && DESIGN_UNIT_MAP[unit]) {
        usedUnits.add(unit);
        matched.push({ id: unit.toLowerCase(), ...DESIGN_UNIT_MAP[unit] });
      }
    }
    // Default design units if nothing matched
    if (isDesign && matched.length === 0) {
      ["Wireframing", "VisualDesign", "Prototyping"].forEach(u => {
        usedUnits.add(u);
        matched.push({ id: u.toLowerCase(), ...DESIGN_UNIT_MAP[u] });
      });
    }
  }

  if (isDevelopment || isBoth) {
    for (const [kw, unit] of Object.entries(DEV_KEYWORDS)) {
      if (scanText.includes(kw) && !usedUnits.has(unit) && DEV_UNIT_MAP[unit]) {
        usedUnits.add(unit);
        matched.push({ id: unit.toLowerCase(), ...DEV_UNIT_MAP[unit] });
      }
    }
    // Default development units if nothing matched
    if (isDevelopment && matched.length === 0) {
      ["Authentication", "Dashboard"].forEach(u => {
        usedUnits.add(u);
        matched.push({ id: u.toLowerCase(), ...DEV_UNIT_MAP[u] });
      });
    }
  }

  // Absolute fallback if domain was unrecognized
  if (matched.length === 0) {
    matched.push({ id: "authentication", ...DEV_UNIT_MAP["Authentication"] });
    matched.push({ id: "dashboard", ...DEV_UNIT_MAP["Dashboard"] });
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
