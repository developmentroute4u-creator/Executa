"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const STEPS = ["Project details", "Business & context", "Generate scope"];

const INDUSTRIES = [
  { value: "", label: "Select industry" },
  { value: "technology", label: "Technology" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Fintech" },
  { value: "education", label: "Education" },
  { value: "media", label: "Media & Publishing" },
  { value: "saas", label: "SaaS / B2B" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

const FIELDS = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
];

const PRIORITIES = [
  { value: "low", label: "Low — flexible timeline" },
  { value: "medium", label: "Medium — standard timeline" },
  { value: "high", label: "High — expedited" },
  { value: "critical", label: "Critical — urgent" },
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    industry: "development",
    field: "development",
    goal: "",
    businessName: "",
    businessWebsite: "",
    businessModel: "",
    usageContext: "",
    targetAudience: "",
    references: "",
    priority: "medium",
    deadline: "",
  });

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          industry: form.field, // Use selected field (development/design) as industry
          goal: form.title,     // Default goal to the title
          references: form.references ? form.references.split("\n").filter(Boolean) : [],
          deadline: form.deadline || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(false);
        return;
      }
      router.push(`/client/projects/${data.projectId}/scope`);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const canProceed = [
    !!form.title && !!form.field,
    form.businessName && form.businessModel && form.targetAudience,
    true,
  ][step];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Executa</span>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  i < step
                    ? "bg-success text-white"
                    : i === step
                    ? "bg-accent text-white"
                    : "border border-border text-text-tertiary"
                )}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 h-px", i < step ? "bg-success" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
        <div className="w-24" />
      </div>

      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        {/* Step 0: About */}
        {step === 0 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">
                Step 1 of 3
              </p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Tell us about your project</h1>
              <p className="text-text-secondary">
                Start with the essentials. We will use this information to automatically draft a structured scope.
              </p>
            </div>
            <div className="space-y-5">
              <Input
                label="Project title"
                placeholder="e.g. E-commerce platform for handmade goods"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Field</label>
                <div className="grid grid-cols-2 gap-3">
                  {FIELDS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setForm({ ...form, field: f.value, industry: f.value })}
                      className={cn(
                        "p-4 rounded-lg border-2 text-sm font-medium transition-all text-left",
                        form.field === f.value
                          ? "border-accent bg-accent-light text-accent"
                          : "border-border text-text-secondary hover:border-border-strong"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Business Basics & Context */}
        {step === 1 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">
                Step 2 of 3
              </p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Business details & context</h1>
              <p className="text-text-secondary">
                Provide details about your business and usage context. This feeds our Scope Generation Engine.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Business Basics</h3>
                <div className="space-y-4">
                  <Input
                    label="Business or Company name"
                    placeholder="e.g. Artisans Guild"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    required
                  />
                  <Input
                    label="Business Website (optional)"
                    placeholder="e.g. https://artisansguild.co"
                    value={form.businessWebsite}
                    onChange={(e) => setForm({ ...form, businessWebsite: e.target.value })}
                  />
                  <Textarea
                    label="Business Model & Description"
                    placeholder="e.g. A peer-to-peer marketplace connecting rural artisans with urban buyers, charging a 10% commission on transactions."
                    rows={10}
                    className="min-h-[220px] text-sm leading-relaxed"
                    value={form.businessModel}
                    onChange={(e) => setForm({ ...form, businessModel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Context & Timeline</h3>
                <div className="space-y-4">
                  <Input
                    label="Who is the target audience?"
                    placeholder="e.g. Independent artisans aged 25–45 in Tier 1 Indian cities"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    required
                  />
                  <Textarea
                    label="Usage context"
                    placeholder="e.g. Mobile-first web app, used primarily on smartphones. Must load fast on 4G."
                    rows={8}
                    className="min-h-[180px] text-sm leading-relaxed"
                    value={form.usageContext}
                    onChange={(e) => setForm({ ...form, usageContext: e.target.value })}
                  />
                  <Textarea
                    label="References (optional, one per line)"
                    placeholder="https://example.com&#10;https://another.com"
                    rows={6}
                    className="min-h-[140px] text-sm leading-relaxed"
                    value={form.references}
                    onChange={(e) => setForm({ ...form, references: e.target.value })}
                  />
                  <Select
                    label="Priority"
                    options={PRIORITIES}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  />
                  <Input
                    label="Deadline (optional)"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Generate */}
        {step === 2 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">
                Step 3 of 3
              </p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Ready to generate your scope</h1>
              <p className="text-text-secondary">
                Our Scope Generation Engine will analyze your goal, business model, and project context to automatically build a structured, effort-scored project scope.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Brief Summary</h3>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Project Title</span>
                  <span className="font-medium text-text-primary">{form.title}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Company</span>
                  <span className="font-medium text-text-primary">{form.businessName}</span>
                </div>
                {form.businessWebsite && (
                  <div className="flex gap-2">
                    <span className="text-text-secondary w-32 shrink-0">Website</span>
                    <span className="font-medium text-text-primary">{form.businessWebsite}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Industry</span>
                  <span className="font-medium capitalize text-text-primary">{form.industry}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Field</span>
                  <span className="font-medium capitalize text-text-primary">{form.field}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Priority</span>
                  <span className="font-medium capitalize text-text-primary">{form.priority}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Business Model</span>
                  <span className="font-medium text-text-primary line-clamp-2">{form.businessModel}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Audience</span>
                  <span className="font-medium text-text-primary line-clamp-1">{form.targetAudience}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Deadline</span>
                  <span className="font-medium text-text-primary">
                    {form.deadline ? new Date(form.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not specified"}
                  </span>
                </div>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-error-light border border-error/20 rounded text-xs text-error">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L3 7l6 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 2l6 5-6 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {loading ? "Generating scope…" : "Generate scope"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
