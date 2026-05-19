// Standalone MongoDB capability catalog seeder script
global.crypto = require('crypto');
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/executa";

// Inline schemas for standalone script execution
const CapabilityLakeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  field: { type: String, enum: ["development", "design"], required: true },
  domain: { type: String, required: true },
  description: { type: String },
  evaluations: [{ type: String }]
}, { timestamps: true });

const CapabilityLake = mongoose.models.CapabilityLake || mongoose.model("CapabilityLake", CapabilityLakeSchema);

const DESIGN_CAPABILITY_DATABASE = {
  ui_ux: [
    { name: "UX Writing", evaluations: ["Clarity", "Tone Mapping", "User Reassurance"] },
    { name: "UX Strategy", evaluations: ["Business Alignment", "Value Prop Definition"] },
    { name: "Mobile UX", evaluations: ["Touch Target Usability", "One-Handed Flow Optimization"] },
    { name: "Information Architecture", evaluations: ["Card Sorting Alignment", "Navigational Depth"] },
    { name: "User Flow Design", evaluations: ["Friction Reduction", "Conversion Flow Logic"] },
    { name: "Interaction Design", evaluations: ["Micro-interaction Delight", "State Transition Logic"] },
    { name: "Design Systems", evaluations: ["Tokenization Architecture", "Component Scalability"] },
    { name: "Accessibility Thinking", evaluations: ["WCAG 2.1 Compliance", "Contrast Ratios"] },
    { name: "Responsive UX", evaluations: ["Fluid Adaptation", "Breakpoint Hierarchy"] },
    { name: "UX Research Thinking", evaluations: ["Hypothesis Validity", "Qualitative Signals"] },
    { name: "Conversion UX", evaluations: ["CTA Prominence", "Funnel Exit Mitigation"] },
    { name: "Dashboard UX", evaluations: ["Data Density Balance", "Widget Scannability"] },
    { name: "Onboarding Experience Design", evaluations: ["Time-To-Value Speed", "Cognitive Load Management"] },
    { name: "Product Thinking", evaluations: ["Feature Prioritization", "Core Problem Solving"] }
  ],
  graphic: [
    { name: "Visual Hierarchy", evaluations: ["Focal Point Alignment", "Gestalt Principles"] },
    { name: "Typography Systems", evaluations: ["Pairing Compatibility", "Kerning & Line Height Logic"] },
    { name: "Layout Composition", evaluations: ["Grid Systems Alignment", "Asymmetric Balance"] },
    { name: "Marketing Design Thinking", evaluations: ["AIDA Funnel Application", "Banner Clarity"] },
    { name: "Ad Creative Thinking", evaluations: ["CTR Magnetism", "Visual Punchiness"] },
    { name: "Brand Consistency", evaluations: ["Style Guide Compliance", "Visual Coherence"] },
    { name: "Social Media Adaptation", evaluations: ["Aspect Ratio Optimization", "Visual Stopping Power"] },
    { name: "Print Adaptation", evaluations: ["Bleed Safety Margins", "CMYK Translation"] },
    { name: "Color Psychology", evaluations: ["Mood Alignment", "Harmonious Palettes"] }
  ],
  branding: [
    { name: "Logo Systems", evaluations: ["Scalability Bounds", "Vector Precision"] },
    { name: "Brand Architecture", evaluations: ["Sub-brand Logic", "Cohesive Hierarchy"] },
    { name: "Typography Identity", evaluations: ["Logotype Customization", "Branded Font Systems"] },
    { name: "Brand Scalability", evaluations: ["Monochrome Translation", "Favicon Legibility"] },
    { name: "Packaging Direction", evaluations: ["Material Coherence", "Structural Design Fit"] },
    { name: "Visual Language Development", evaluations: ["Brand Theme Consistency", "Illustrative Cohesiveness"] },
    { name: "Brand Storytelling", evaluations: ["Emotional Resonance", "Copy-Visual Alignment"] },
    { name: "Multi-platform Consistency", evaluations: ["Responsive Asset Integrity", "Brand Guidelines Fit"] }
  ],
  motion: [
    { name: "Motion Timing", evaluations: ["Easing Curves", "Temporal Snappiness"] },
    { name: "Narrative Thinking", evaluations: ["Storyboard Narrative", "Motion Sequence Arc"] },
    { name: "Transition Logic", evaluations: ["Viewport Morphing", "Flow Continuation"] },
    { name: "UI Motion", evaluations: ["Micro-interaction Delight", "Feedback Clarity"] },
    { name: "Editing Rhythm", evaluations: ["Beat Sync Accuracy", "Tempo Pacing"] },
    { name: "Visual Pacing", evaluations: ["Focal Retention Speed", "Scene Length Flow"] },
    { name: "Platform Adaptation", evaluations: ["Frame Rate Optimization", "Codec Compatibility"] }
  ],
  product: [
    { name: "Systems Thinking", evaluations: ["Data Object Relationships", "Ecosystem Mapping"] },
    { name: "Product Strategy", evaluations: ["Market Context Fit", "Feature ROI Analysis"] },
    { name: "User Journey Thinking", evaluations: ["Alternative Path Recovery", "Edge Case Navigation"] },
    { name: "Scalability UX", evaluations: ["High-volume Layout Adaptability", "Dynamic State States"] },
    { name: "Data-heavy UX", evaluations: ["Density Optimization", "Search & Filter Depth"] },
    { name: "Operational UX", evaluations: ["Workflow Efficiency Rates", "Batch Action Structuring"] },
    { name: "Multi-role Systems", evaluations: ["Permissions Isolation UX", "Workspace Switching Logic"] }
  ]
};

const DEV_CAPABILITY_DATABASE = {
  frontend: [
    { name: "Component Architecture", evaluations: ["Atomicity Level", "Props Cleanliness"] },
    { name: "Responsive Systems", evaluations: ["Container Queries Logic", "Layout Adaptability"] },
    { name: "State Management", evaluations: ["Data Flow Isolation", "Render Side-effect Avoidance"] },
    { name: "Rendering Optimization", evaluations: ["Cumulative Layout Shift Rates", "Time-To-Interactive Speed"] },
    { name: "Accessibility", evaluations: ["ARIA Attribute Coverage", "Keyboard Navigation Flow"] },
    { name: "Reusable UI Systems", evaluations: ["Prop-driven Extensibility", "Token Mapping Fit"] },
    { name: "Routing Architecture", evaluations: ["Route Nesting Cleanliness", "Prefetch Performance"] },
    { name: "Design System Integration", evaluations: ["Visual Token Alignment", "Component Parity"] },
    { name: "Frontend Scalability", evaluations: ["Bundle Size Efficiency", "Dynamic Imports Architecture"] },
    { name: "Error State Handling", evaluations: ["Boundary Catch Completeness", "Graceful UI Fallbacks"] },
    { name: "API Consumption", evaluations: ["Hook Architecture Nesting", "Optimistic State Rendering"] },
    { name: "Loading State Logic", evaluations: ["Skeleton Screen Placement", "Perceived Speed Optimizations"] }
  ],
  backend: [
    { name: "API Architecture", evaluations: ["RESTful standard alignment", "Payload Size Optimization"] },
    { name: "Authentication Systems", evaluations: ["Token Rotation Security", "Hashing Quality"] },
    { name: "Database Design", evaluations: ["Index Structure Optimization", "Schema Normalization"] },
    { name: "Role-based Access", evaluations: ["Middleware Governance", "Granular ACL Depth"] },
    { name: "Scalability Thinking", evaluations: ["Throttling Integrity", "Concurrency Management"] },
    { name: "Error Recovery", evaluations: ["Transaction Rollback Safety", "Log Completeness"] },
    { name: "Queue Systems", evaluations: ["Message Retries Strategy", "Worker Scale Adaptability"] },
    { name: "Security Handling", evaluations: ["OWASP Top 10 Mitigation", "SQL & Query Injection Safety"] },
    { name: "Data Relationships", evaluations: ["Cascade Integrity", "Avoidance of N+1 Queries"] },
    { name: "Caching Strategy", evaluations: ["TTL Optimization Logic", "Cache Invalidation Flow"] },
    { name: "Service Architecture", evaluations: ["Module Autonomy", "Dependency Isolation Level"] }
  ],
  fullstack: [
    { name: "System Integration", evaluations: ["End-To-End Performance", "Schema Synchronization Fit"] },
    { name: "Frontend-Backend Coordination", evaluations: ["Type Safety Consistency", "Network Overhead Reduction"] },
    { name: "Data Flow Design", evaluations: ["State Mirroring Synchronicity", "Transport Protocol Selection"] },
    { name: "Multi-role Architecture", evaluations: ["Role Isolation Security", "Workspace Sync Speed"] },
    { name: "Realtime System Thinking", evaluations: ["WebSocket Throttling", "Reconnection Logic Integrity"] },
    { name: "Deployment Logic", evaluations: ["Environment Parity", "Build Pipeline Stability"] }
  ],
  mobile: [
    { name: "Cross-platform Architecture", evaluations: ["Bridge Performance", "Native Capability Parity"] },
    { name: "Offline-first Thinking", evaluations: ["Sync Conflict Resolution", "Local Store Serialization"] },
    { name: "Mobile Performance", evaluations: ["Memory Overhead Tracking", "GPU Render Optimizations"] },
    { name: "Native Interaction Patterns", evaluations: ["Platform-specific Layouts", "Haptic Integration Fit"] },
    { name: "Gesture Systems", evaluations: ["Touch Response Snappiness", "Multi-touch Handling Logic"] },
    { name: "Mobile Scalability", evaluations: ["Dynamic Asset Resolution", "Deep Linking Cleanliness"] }
  ],
  cms: [
    { name: "Template Architecture", evaluations: ["Component Reusability", "Page Builder Integration"] },
    { name: "Dynamic Content Systems", evaluations: ["Custom Field Relationships", "Query Loop Efficiencies"] },
    { name: "CMS Logic", evaluations: ["Validation Pipeline Safety", "Taxonomy Customization Fit"] },
    { name: "Reusable Sections", evaluations: ["Block Autonomy", "Visual Editing Boundaries"] },
    { name: "Ecommerce Workflows", evaluations: ["Checkout Friction Points", "Cart State Preservation"] },
    { name: "SEO Structure", evaluations: ["Meta Automation Parsing", "Semantic DOM Layout"] }
  ],
  devops: [
    { name: "CI/CD Systems", evaluations: ["Pipeline Velocity Speed", "Automated Testing Coverage"] },
    { name: "Infrastructure Scaling", evaluations: ["Auto-scaling Triggers Logic", "Load Balancer Efficiencies"] },
    { name: "Deployment Automation", evaluations: ["Zero-downtime Rollouts Strategy", "State Rollback Speeds"] },
    { name: "Monitoring Systems", evaluations: ["Alert Threshold Optimization", "Telemetry Density Balance"] },
    { name: "Failover Handling", evaluations: ["Disaster Recovery RTO", "Active-Passive Sync Integrity"] },
    { name: "Cloud Architecture", evaluations: ["IAM Granularity Depth", "Asset Cost Optimizations"] }
  ],
  data_ai: [
    { name: "AI Workflow Design", evaluations: ["Prompt Chain Resiliency", "Fallback Logic Safety"] },
    { name: "Automation Thinking", evaluations: ["Idempotency Integrity", "Rate Limit Strategy"] },
    { name: "Data Pipeline Thinking", evaluations: ["Ingestion Speed Velocity", "Format Transform Integrity"] },
    { name: "ML System Understanding", evaluations: ["Inference Delay Tracking", "Dynamic Scoring Adaptability"] },
    { name: "API Integration Logic", evaluations: ["Vector Embeddings Strategy", "Dynamic Model fallback"] },
    { name: "AI Product Thinking", evaluations: ["Context Relevancy Ratios", "Hallucination Control Rates"] }
  ]
};

async function seed() {
  try {
    console.log("Connecting to Database:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected. Clearing old capability lakes...");
    await CapabilityLake.deleteMany({});

    const capToInsert = [];

    // Process design catalog
    for (const [dom, caps] of Object.entries(DESIGN_CAPABILITY_DATABASE)) {
      for (const cap of caps) {
        capToInsert.push({
          name: cap.name,
          field: "design",
          domain: dom,
          description: `Vetting capability signal focused on measuring ${cap.name} and visual execution intelligence.`,
          evaluations: cap.evaluations
        });
      }
    }

    // Process dev catalog
    for (const [dom, caps] of Object.entries(DEV_CAPABILITY_DATABASE)) {
      for (const cap of caps) {
        capToInsert.push({
          name: cap.name,
          field: "development",
          domain: dom,
          description: `Vetting capability signal focused on measuring ${cap.name} and system-level architecture.`,
          evaluations: cap.evaluations
        });
      }
    }

    console.log(`Seeding ${capToInsert.length} core micro-capabilities into capability_lakes...`);
    await CapabilityLake.insertMany(capToInsert);
    console.log("Seeding complete! Database successfully populated with high-fidelity capability model metrics.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
