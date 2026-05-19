import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

// Icons (inline SVG — no extra deps)
const Icon = {
  scope: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 14.5h7M14.5 11v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  pricing: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6v1.5M10 12.5V14M7.5 8.5C7.5 7.5 8.5 7 10 7s2.5.8 2.5 2c0 1-1 1.5-2.5 2s-2.5 1-2.5 2c0 1.2 1.2 2 2.5 2s2.5-.5 2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  skill: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  match: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  accountability: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L14 6H18V14L14 18H6L2 14V6L6 2H10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const SYSTEMS = [
  {
    number: "01",
    icon: Icon.scope,
    name: "Scope Engine",
    headline: "Work defined in functional units.",
    body: "The platform breaks every project into Functional Units — meaningful product outcomes scored across Logic Depth, Interaction Density, Data Handling, Dependency Level, Variations, and Output Expectation. No screens. No hours. No vague descriptions.",
    tags: ["Functional Units", "Effort Drivers", "Structured Scope"],
  },
  {
    number: "02",
    icon: Icon.pricing,
    name: "Pricing Engine",
    headline: "Price derived from effort, not negotiation.",
    body: "Every project receives a Total Effort Score. Price = Effort Score × Rate per Point. Rate is determined by field, specialization, and evaluated freelancer level. Three tiers: L1 (40–100pts), L2 (100–220pts), L3 (220–400pts).",
    tags: ["Effort-Based Pricing", "Three Tiers", "Transparent Fees"],
  },
  {
    number: "03",
    icon: Icon.skill,
    name: "Skill Evaluation",
    headline: "Capability proven through output, not claims.",
    body: "Freelancers are assigned a Level 2 task matching their domain. Output is evaluated across 5 dimensions: Functional Coverage, Logic, Usability, Edge Cases, and Output Quality — each scored 0–10. AI assistance is permitted. Only the result matters.",
    tags: ["Outcome-Based", "0–50 Score", "AI Allowed"],
  },
  {
    number: "04",
    icon: Icon.match,
    name: "Matching Engine",
    headline: "Matched by proof, not profile.",
    body: "The system matches freelancers to projects based on specialization, evaluated level, project effort range, and availability. No bidding. No proposals. No guesswork.",
    tags: ["No Bidding", "Level-Matched", "Availability-Aware"],
  },
  {
    number: "05",
    icon: Icon.accountability,
    name: "Accountability System",
    headline: "Outcomes enforced, not hoped for.",
    body: "Choose Basic mode for autonomous execution, or Accountability mode for full platform oversight — scope enforcement, dispute resolution, rework approval, and escalation handling built in.",
    tags: ["Dispute Resolution", "Scope Enforcement", "Rework Oversight"],
  },
];

const CLIENT_STEPS = [
  { step: "01", title: "Describe your goal", body: "Answer questions about your industry, audience, functionality, and priorities through a conversational intake flow." },
  { step: "02", title: "Receive structured scope", body: "The Scope Engine generates a complete project definition using Functional Units and Effort Drivers — no vague estimates." },
  { step: "03", title: "Review and confirm", body: "Add or remove units, select upgrades, and lock the scope. Pricing is calculated automatically." },
  { step: "04", title: "Matched to a freelancer", body: "The Matching Engine assigns a vetted, level-appropriate freelancer. No browsing. No negotiation." },
  { step: "05", title: "Execution with oversight", body: "Work proceeds against defined milestones. Accountability mode available for full platform enforcement." },
];

const FREELANCER_STEPS = [
  { step: "01", title: "Select your field and domain", body: "Choose Development or Design, then narrow to your domain and specialization." },
  { step: "02", title: "Complete the skill test", body: "Receive a Level 2 task. Submit your output. AI tools are permitted — only the result is evaluated." },
  { step: "03", title: "Receive your level", body: "Scoring across 5 dimensions determines your level: Executor (L1), Independent (L2), or Systems Thinker (L3)." },
  { step: "04", title: "Get matched to projects", body: "Projects that match your specialization, level, and availability are assigned directly to you." },
];

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs text-text-secondary mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Governed Execution Platform · Currently in private beta
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary mb-8 animate-fade-up">
            Work, clearly defined.
            <br />
            <span className="text-text-secondary">Execution without chaos.</span>
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-12 animate-fade-up" style={{ animationDelay: "60ms" }}>
            Executa is not a freelance marketplace. It is a governed execution platform that defines scope as structured Functional Units, evaluates freelancer capability through outcome-based testing, and enforces accountability at every stage.
          </p>

          <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <Link
              href="/auth/signup?role=client"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-accent text-white text-sm font-medium rounded hover:bg-accent-hover transition-colors shadow-sm"
            >
              Start a project
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/auth/signup?role=freelancer"
              className="inline-flex items-center gap-2.5 px-6 py-3 border border-border text-text-primary text-sm font-medium rounded hover:border-border-strong hover:bg-surface transition-all"
            >
              Apply as a freelancer
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 pt-10 border-t border-border grid grid-cols-3 gap-8 max-w-lg animate-fade-up" style={{ animationDelay: "180ms" }}>
            {[
              { value: "5", label: "Core systems" },
              { value: "3", label: "Capability levels" },
              { value: "0", label: "Gigs. Ever." },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-semibold tracking-tight text-text-primary">{s.value}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="py-24 px-6 bg-surface border-y border-border" id="systems">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-5">Platform philosophy</p>
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary mb-6">
                This platform doesn't sell freelancers. It sells clarity, structure, and accountability.
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Every feature connects to one of five core systems. There are no gig cards, no bidding wars, no portfolio browsing, and no vague project descriptions. Work is defined precisely before execution begins — and the system holds both parties to that definition.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Clarity", "Structure", "Accountability", "Execution", "Reduced Decision Fatigue", "Outcome Enforcement"].map((item) => (
                <div key={item} className="p-4 bg-white border border-border rounded-lg text-sm text-text-primary font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SYSTEMS ── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Five core systems</p>
            <h2 className="text-3xl font-semibold tracking-tight text-text-primary max-w-xl">
              Every feature connects to a system. Every system enforces an outcome.
            </h2>
          </div>

          <div className="space-y-0 border-t border-border">
            {SYSTEMS.map((system, i) => (
              <div
                key={system.number}
                className="grid md:grid-cols-[200px_1fr] gap-8 py-10 border-b border-border group"
              >
                {/* Left */}
                <div className="flex items-start gap-4">
                  <span className="text-xs font-medium text-text-tertiary tabular-nums mt-0.5">{system.number}</span>
                  <div>
                    <div className="text-text-tertiary mb-3 group-hover:text-accent transition-colors duration-200">
                      {system.icon}
                    </div>
                    <div className="text-sm font-semibold text-text-primary">{system.name}</div>
                  </div>
                </div>
                {/* Right */}
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-text-primary mb-3">{system.headline}</h3>
                  <p className="text-text-secondary leading-relaxed text-sm mb-5">{system.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {system.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-xs text-text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOWS ── */}
      <section className="py-28 px-6 bg-surface border-y border-border" id="workflow">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            {/* Client */}
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-5">Client workflow</p>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-10">
                From requirement to execution in five steps.
              </h2>
              <div className="space-y-8">
                {CLIENT_STEPS.map((s) => (
                  <div key={s.step} className="flex gap-5">
                    <div className="text-xs font-medium text-text-tertiary tabular-nums pt-0.5 w-6 shrink-0">{s.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary mb-1">{s.title}</div>
                      <div className="text-sm text-text-secondary leading-relaxed">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/signup?role=client"
                className="inline-flex items-center gap-2 mt-10 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Start your first project {Icon.arrow}
              </Link>
            </div>

            {/* Freelancer */}
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-5">Freelancer workflow</p>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-10">
                Prove capability. Get matched. Execute.
              </h2>
              <div className="space-y-8">
                {FREELANCER_STEPS.map((s) => (
                  <div key={s.step} className="flex gap-5">
                    <div className="text-xs font-medium text-text-tertiary tabular-nums pt-0.5 w-6 shrink-0">{s.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary mb-1">{s.title}</div>
                      <div className="text-sm text-text-secondary leading-relaxed">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/signup?role=freelancer"
                className="inline-flex items-center gap-2 mt-10 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Apply as a freelancer {Icon.arrow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-28 px-6" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Pricing structure</p>
            <h2 className="text-3xl font-semibold tracking-tight text-text-primary max-w-xl">
              Price = Effort Score × Rate per Point. No negotiation.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { level: "Level 1", range: "40–100 pts", label: "Executor", devRate: "₹120–160 / pt", designRate: "₹100–140 / pt", desc: "Execution-focused work. Defined tasks, clear outputs." },
              { level: "Level 2", range: "100–220 pts", label: "Independent", devRate: "₹160–240 / pt", designRate: "₹140–210 / pt", desc: "Independent thinking. Ambiguity handled with judgment.", featured: true },
              { level: "Level 3", range: "220–400 pts", label: "Systems Thinker", devRate: "₹240–350 / pt", designRate: "₹210–320 / pt", desc: "System design, edge cases, architectural decisions." },
            ].map((tier) => (
              <div
                key={tier.level}
                className={`rounded-xl border p-7 ${tier.featured ? "bg-accent-light border-accent/30 ring-1 ring-accent/20" : "bg-white border-border"}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">{tier.level}</div>
                    <div className="text-lg font-semibold text-text-primary">{tier.label}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tier.featured ? "bg-accent text-white" : "bg-stone-100 text-stone-600"}`}>
                    {tier.range}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{tier.desc}</p>
                <div className="space-y-2.5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Development</span>
                    <span className="font-medium text-text-primary">{tier.devRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Design</span>
                    <span className="font-medium text-text-primary">{tier.designRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-tertiary mt-8">
            Platform fees applied: Scope Fee (₹999) + Accountability Fee (₹599) + Execution Fee (5% of freelancer price).
            Accountability Mode is optional.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 bg-text-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-6 leading-tight">
            Where scope becomes structure.<br />Where structure becomes execution.
          </h2>
          <p className="text-stone-400 text-lg mb-12 leading-relaxed">
            No gigs. No bidding. No chaos. Just clearly defined work, evaluated capability, and enforced outcomes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup?role=client"
              className="px-7 py-3.5 bg-white text-text-primary text-sm font-semibold rounded hover:bg-stone-100 transition-colors"
            >
              Start a project
            </Link>
            <Link
              href="/auth/signup?role=freelancer"
              className="px-7 py-3.5 border border-stone-600 text-stone-300 text-sm font-semibold rounded hover:border-stone-400 hover:text-white transition-all"
            >
              Apply as a freelancer
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 border-t border-stone-800 bg-text-primary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
              </svg>
            </div>
            <span className="text-sm text-stone-400">Executa</span>
          </div>
          <p className="text-xs text-stone-600">© 2026 Executa. A governed execution platform.</p>
        </div>
      </footer>
    </div>
  );
}
