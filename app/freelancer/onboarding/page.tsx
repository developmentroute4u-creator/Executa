"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const DESIGN_DOMAINS = [
  {
    value: "ui_ux",
    label: "UI/UX Design",
    specs: ["UX Writing", "UX Strategy", "Mobile UX", "Information Architecture", "User Flow Design", "Interaction Design", "Design Systems", "Accessibility Thinking", "Responsive UX", "UX Research Thinking", "Conversion UX", "Dashboard UX", "Onboarding Experience Design", "Product Thinking"]
  },
  {
    value: "graphic",
    label: "Graphic Design",
    specs: ["Visual Hierarchy", "Typography Systems", "Layout Composition", "Marketing Design Thinking", "Ad Creative Thinking", "Brand Consistency", "Social Media Adaptation", "Print Adaptation", "Color Psychology"]
  },
  {
    value: "branding",
    label: "Branding & Identity",
    specs: ["Logo Systems", "Brand Architecture", "Typography Identity", "Brand Scalability", "Packaging Direction", "Visual Language Development", "Brand Storytelling", "Multi-platform Consistency"]
  },
  {
    value: "motion",
    label: "Motion & Video Design",
    specs: ["Motion Timing", "Narrative Thinking", "Transition Logic", "UI Motion", "Editing Rhythm", "Visual Pacing", "Platform Adaptation"]
  },
  {
    value: "product",
    label: "Product Design",
    specs: ["Systems Thinking", "Product Strategy", "User Journey Thinking", "Scalability UX", "Data-heavy UX", "Operational UX", "Multi-role Systems"]
  }
];

const DEV_DOMAINS = [
  {
    value: "frontend",
    label: "Frontend Development",
    specs: ["Component Architecture", "Responsive Systems", "State Management", "Rendering Optimization", "Accessibility", "Reusable UI Systems", "Routing Architecture", "Design System Integration", "Frontend Scalability", "Error State Handling", "API Consumption", "Loading State Logic"]
  },
  {
    value: "backend",
    label: "Backend Development",
    specs: ["API Architecture", "Authentication Systems", "Database Design", "Role-based Access", "Scalability Thinking", "Error Recovery", "Queue Systems", "Security Handling", "Data Relationships", "Caching Strategy", "Service Architecture"]
  },
  {
    value: "fullstack",
    label: "Full Stack Development",
    specs: ["System Integration", "Frontend-Backend Coordination", "Data Flow Design", "Multi-role Architecture", "Realtime System Thinking", "Deployment Logic"]
  },
  {
    value: "mobile",
    label: "Mobile Development",
    specs: ["Cross-platform Architecture", "Offline-first Thinking", "Mobile Performance", "Native Interaction Patterns", "Gesture Systems", "Mobile Scalability"]
  },
  {
    value: "cms",
    label: "CMS / No-Code",
    specs: ["Template Architecture", "Dynamic Content Systems", "CMS Logic", "Reusable Sections", "Ecommerce Workflows", "SEO Structure"]
  },
  {
    value: "devops",
    label: "DevOps & Infrastructure",
    specs: ["CI/CD Systems", "Infrastructure Scaling", "Deployment Automation", "Monitoring Systems", "Failover Handling", "Cloud Architecture"]
  },
  {
    value: "data_ai",
    label: "Data & AI",
    specs: ["AI Workflow Design", "Automation Thinking", "Data Pipeline Thinking", "ML System Understanding", "API Integration Logic", "AI Product Thinking"]
  }
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const { data: session } = useSession();
  const user = session?.user as any;
  const isOnboardingComplete = user?.onboardingComplete;

  const [step, setStep] = useState(0);
  const [field, setField] = useState<"development" | "design" | "">("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [takenSpecializations, setTakenSpecializations] = useState<Set<string>>(new Set());
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/freelancer/test")
      .then(r => r.json())
      .then(d => {
        if (d.tests) {
          const usedSpecs = new Set<string>();
          d.tests.forEach((t: any) => {
            if (t.specializations && Array.isArray(t.specializations)) {
              t.specializations.forEach((s: string) => usedSpecs.add(s));
            } else if (t.specialization) {
              usedSpecs.add(t.specialization);
            }
          });
          setTakenSpecializations(usedSpecs);
        }
      })
      .catch(console.error);
  }, []);

  const domains = field === "design" ? DESIGN_DOMAINS : DEV_DOMAINS;

  // Retrieve specializations for all selected domains
  const availableSpecializations = selectedDomains.flatMap(
    (domVal) => domains.find((d) => d.value === domVal)?.specs || []
  );

  function toggleDomain(domVal: string) {
    setSelectedDomains((prev) =>
      prev.includes(domVal) ? prev.filter((d) => d !== domVal) : [...prev, domVal]
    );
  }

  function toggleSpecialization(spec: string) {
    setSelectedSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  }

  async function handleComplete() {
    if (selectedDomains.length === 0 || selectedSpecializations.length === 0) {
      setError("Please select at least one domain and one specialization.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          domain: selectedDomains.join(","),
          specializations: selectedSpecializations,
          bio,
          onboardingStep: 4,
          onboardingComplete: true
        }),
      });
      if (!res.ok) {
        setError("Failed to save profile");
        setLoading(false);
        return;
      }
      router.push(source ? `/freelancer/assessment?source=${source}` : "/freelancer/assessment");
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-black text-[22px] tracking-tighter text-stone-900 leading-none">
            EXECUTA<span className="text-[#E85239]">.</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {["Field", "Domain", "Specialization", "Profile"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all border",
                i < step
                  ? "bg-[#FCE1DC] border-transparent text-accent"
                  : i === step
                  ? "bg-accent border-accent text-white"
                  : "bg-transparent border-border text-text-tertiary/60"
              )}>
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div className={cn("w-6 h-px", i < step ? "bg-[#FCE1DC]" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
        <div className="w-20" />
      </div>

      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        {/* Step 0: Field */}
        {step === 0 && (
          <div className="animate-fade-up">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Step 1 of 4</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">What's your primary field?</h1>
            <p className="text-text-secondary mb-10">This determines the skill evaluation track you'll be placed in.</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "development", label: "Development", desc: "Frontend, Backend, Full Stack, Mobile, DevOps, Data & AI" },
                { value: "design", label: "Design", desc: "UI/UX, Graphic, Branding, Motion, Product Design" },
              ].map((f) => (
                <button key={f.value} onClick={() => setField(f.value as any)}
                  className={cn("p-6 rounded-xl border-2 text-left transition-all",
                    field === f.value ? "border-accent bg-[#FCE1DC]" : "border-border bg-white hover:border-border-strong")}>
                  <div className="text-base font-semibold mb-2">{f.label}</div>
                  <div className="text-xs text-text-secondary leading-relaxed">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Domain */}
        {step === 1 && (
          <div className="animate-fade-up">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Step 2 of 4</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Choose your domains</h1>
            <p className="text-text-secondary mb-10">Select one or more domains that describe your core expertise (multiple selections allowed).</p>
            <div className="space-y-2.5">
              {domains.map((d) => {
                const isSelected = selectedDomains.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDomain(d.value)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between",
                      isSelected ? "border-accent bg-[#FCE1DC] shadow-sm" : "border-border bg-white hover:border-border-strong"
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{d.label}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        {d.specs.slice(0, 4).join(" · ")}
                        {d.specs.length > 4 ? ` +${d.specs.length - 4} specialist fields` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold border border-accent shadow-sm animate-scale-in">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border bg-surface hover:border-border-strong transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Specialization */}
        {step === 2 && selectedDomains.length > 0 && (
          <div className="animate-fade-up">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Step 3 of 4</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Pick your specializations</h1>
            <p className="text-text-secondary mb-8">Choose the specific skills you want to be evaluated on (multiple selections allowed).</p>
            <div className="flex flex-wrap gap-3">
              {availableSpecializations.map((spec) => {
                const isTaken = takenSpecializations.has(spec);
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => !isTaken && toggleSpecialization(spec)}
                    disabled={isTaken}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 relative overflow-hidden",
                      isTaken
                        ? "bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-70"
                        : isSelected
                        ? "bg-accent/10 border-accent/30 text-accent shadow-sm"
                        : "bg-white border-border hover:border-accent/30 hover:bg-surface text-text-secondary hover:text-text-primary hover:shadow-sm"
                    )}
                  >
                    {spec}
                    {isTaken && <span className="absolute inset-0 flex items-center justify-center bg-stone-50/50 backdrop-blur-[1px] opacity-100 text-[10px] uppercase font-bold tracking-wider text-stone-500">Taken</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Bio */}
        {step === 3 && (
          <div className="animate-fade-up space-y-6">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-4">Step 4 of 4</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Briefly introduce yourself</h1>
              <p className="text-text-secondary">This appears on your profile after you pass your evaluation.</p>
            </div>
            <Card className="p-6 space-y-4 bg-accent-light border-accent/20">
              <h3 className="text-sm font-semibold text-accent">What happens next</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-accent font-bold">1.</span> We'll generate a custom Level 2 task incorporating your chosen skills using AI</li>
                <li className="flex gap-2"><span className="text-accent font-bold">2.</span> You will review the custom task guidelines and apply to start the test</li>
                <li className="flex gap-2"><span className="text-accent font-bold">3.</span> AI tools are permitted — only your output is evaluated</li>
                <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Once you submit or begin your test, you'll be redirected to your dashboard</li>
              </ul>
            </Card>
            <div>
              <label className="block text-sm font-medium mb-1.5">Short bio (optional)</label>
              <textarea
                rows={4}
                className="w-full rounded border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                placeholder="e.g. 4 years building React applications, specializing in performance-critical UIs and design systems."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            {error && <div className="p-3 bg-error-light border border-error/20 rounded text-xs text-error">{error}</div>}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          {step === 0 && !isOnboardingComplete ? (
            <div />
          ) : (
            <Button variant="ghost" onClick={() => step === 0 ? router.push(source === 'capability' ? '/freelancer/capability' : '/freelancer/workspace') : setStep((s) => s - 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              variant="primary"
              disabled={
                step === 0 ? !field :
                step === 1 ? selectedDomains.length === 0 :
                selectedSpecializations.length === 0
              }
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={handleComplete} loading={loading}>
              Generate custom vetting test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#E85239]/20 border-t-[#E85239] rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
