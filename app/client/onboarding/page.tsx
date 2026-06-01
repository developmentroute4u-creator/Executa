"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Project Foundation", "Project Explanation", "Deep Dive", "Generate Scope"];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing business outcomes...");
  const [loadingProgress, setLoadingProgress] = useState(10);
  const [error, setError] = useState("");
  const [readMore, setReadMore] = useState(false);

  const [form, setForm] = useState({
    title: "",
    domain: "",
    projectDescription: "",
    projectProblem: "",
    targetUsers: "",
    userJourney: "",
    managedEntities: "",
    specialRequirements: "",
    successCriteria: "",
  });

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const texts = [
      "Analyzing business outcomes...",
      "Structuring execution timeline...",
      "Defining functional units...",
      "Calculating effort scores...",
      "Finalizing executable scope..."
    ];
    let i = 0;
    const textInt = setInterval(() => {
      if (i < texts.length - 1) {
        i++;
        setLoadingText(texts[i]);
      }
    }, 1200);

    let currentProgress = 10;
    const progInt = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += Math.floor(Math.random() * 8) + 2;
        setLoadingProgress(Math.min(95, currentProgress));
      }
    }, 400);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      setTimeout(() => {
        clearInterval(textInt);
        clearInterval(progInt);
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth/login");
            return;
          }
          setError(data.error || "Failed");
          setLoading(false);
          return;
        }
        
        setLoadingProgress(100);
        setTimeout(() => {
          router.push(`/client/projects/${data.projectId}/scope`);
        }, 500);
      }, 3500);
    } catch {
      clearInterval(textInt);
      clearInterval(progInt);
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const canProceed = [
    // Step 1 validation
    !!form.title && !!form.domain,
    // Step 2 validation
    !!form.projectDescription && !!form.projectProblem && !!form.targetUsers,
    // Step 3 validation
    !!form.userJourney && !!form.managedEntities && !!form.successCriteria,
    // Step 4 validation
    true,
  ][step];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-black text-[22px] tracking-tighter text-stone-900 leading-none">
            EXECUTA<span className="text-[#E85239]">.</span>
          </span>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all border",
                  i < step
                    ? "bg-[#FCE1DC] border-transparent text-accent"
                    : i === step
                    ? "bg-accent border-accent text-white"
                    : "bg-transparent border-border text-text-tertiary/60"
                )}
              >
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-6 h-px", i < step ? "bg-[#FCE1DC]" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
        <div className="w-24" />
      </div>

      <div className={cn("pt-24 pb-24 px-6 max-w-3xl mx-auto", loading && "hidden")}>
        {/* Step 0: Project Foundation */}
        {step === 0 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">Step 1 of {STEPS.length}</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Project Foundation</h1>
              <p className="text-text-secondary">Start with the essentials to ground your project.</p>
            </div>
            <div className="space-y-8">
              <Input
                label="Project Name"
                placeholder="Enter your project name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Domain</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Design", "Development", "Design & Development"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, domain: d })}
                      className={cn(
                        "p-4 rounded-lg border-2 text-sm font-medium transition-all text-center",
                        form.domain === d
                          ? "border-accent bg-accent-light text-accent"
                          : "border-border text-text-secondary hover:border-border-strong"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Project Explanation */}
        {step === 1 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">Step 2 of {STEPS.length}</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Project Explanation</h1>
              <p className="text-text-secondary">We focus on business outcomes, not screen counts. Explain your project in your own words.</p>
            </div>

            <div className="space-y-10">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">1. Tell us about your project.</label>
                <p className="text-xs text-text-secondary mb-3">Explain what you want to build, improve, redesign, automate, or create. Don't worry about technical details. Simply explain the project in your own words.</p>
                <Textarea
                  placeholder="e.g. I want to build a mobile app that allows local artisans to sell their handcrafted goods..."
                  rows={6}
                  className="text-sm min-h-[140px]"
                  value={form.projectDescription}
                  onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">2. What problem are you trying to solve?</label>
                <p className="text-xs text-text-secondary mb-3">Describe the challenge, inefficiency, pain point, opportunity, or business need that led you to start this project.</p>
                <Textarea
                  placeholder="e.g. Currently, artisans rely on expensive middlemen. We want to give them a direct platform..."
                  rows={5}
                  className="text-sm min-h-[120px]"
                  value={form.projectProblem}
                  onChange={(e) => setForm({ ...form, projectProblem: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">3. Who will use this solution?</label>
                <p className="text-xs text-text-secondary mb-3">Describe the people who will interact with it (e.g., Customers, Employees, Students, Managers, Vendors, Administrators).</p>
                <Textarea
                  placeholder="e.g. There are two groups: The artisans who upload their goods, and the customers who buy them."
                  rows={4}
                  className="text-sm min-h-[100px]"
                  value={form.targetUsers}
                  onChange={(e) => setForm({ ...form, targetUsers: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Deep Dive */}
        {step === 2 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">Step 3 of {STEPS.length}</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Deep Dive</h1>
              <p className="text-text-secondary">Help us understand the mechanics and goals of your project.</p>
            </div>

            <div className="space-y-10">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">4. Walk us through how this should work.</label>
                <p className="text-xs text-text-secondary mb-3">Imagine the project is completed. Describe the journey from start to finish. What should users be able to do? What actions should happen? What outcomes should they achieve? <strong>(This is the most important question).</strong></p>
                <Textarea
                  placeholder="e.g. A user signs up, browses artisan profiles, filters by category, adds items to cart, and checks out using a card. The artisan receives a notification..."
                  rows={8}
                  className="text-sm min-h-[180px]"
                  value={form.userJourney}
                  onChange={(e) => setForm({ ...form, userJourney: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">5. What are the important things that this project needs to handle, organize, track, create, store, or manage?</label>
                <p className="text-xs text-text-secondary mb-3">Think about everything important for the project to function (e.g. people, products, services, bookings, documents, content, payments, conversations, reports).</p>
                <Textarea
                  placeholder="e.g. We need to manage artisan profiles, a product catalog, order history, and payment transfers."
                  rows={5}
                  className="text-sm min-h-[120px]"
                  value={form.managedEntities}
                  onChange={(e) => setForm({ ...form, managedEntities: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">6. Are there any special requirements, business rules, integrations, constraints, or unique expectations?</label>
                <p className="text-xs text-text-secondary mb-3">Examples: AI functionality, Real-time updates, Multi-language support, Payment systems. If none, leave blank.</p>
                <Textarea
                  placeholder="e.g. We must integrate with Stripe for split payments."
                  rows={4}
                  className="text-sm min-h-[100px]"
                  value={form.specialRequirements}
                  onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">7. What does success look like for this project?</label>
                <p className="text-xs text-text-secondary mb-3">When the project is completed, what outcome are you expecting? What would make you confidently say: "This project achieved its goal."</p>
                <Textarea
                  placeholder="e.g. Success means having a functional app in the App Store where artisans can receive orders without technical issues."
                  rows={4}
                  className="text-sm min-h-[100px]"
                  value={form.successCriteria}
                  onChange={(e) => setForm({ ...form, successCriteria: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-widest mb-3">Step 4 of {STEPS.length}</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Generate Scope</h1>
              <p className="text-text-secondary">
                Our AI Scope Discovery Engine will now synthesize your business outcomes into a structured, executable project scope.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Discovery Summary</h3>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Project Title</span>
                  <span className="font-medium text-text-primary">{form.title}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Domain</span>
                  <span className="font-medium text-text-primary">{form.domain}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary w-32 shrink-0">Brief Overview</span>
                  <div className="font-medium text-text-primary flex-1">
                    <p className={cn(!readMore && "line-clamp-2")}>
                      {form.projectDescription} {form.projectProblem}
                    </p>
                    {((form.projectDescription + form.projectProblem).length > 150) && (
                      <button 
                        onClick={() => setReadMore(!readMore)}
                        className="text-xs text-accent hover:underline mt-1 font-semibold"
                      >
                        {readMore ? "Read less" : "Read more"}
                      </button>
                    )}
                  </div>
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
        {!loading && (
        <div className="fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-md border-t border-border p-4 px-8 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => step === 0 ? router.push('/client/workspace') : setStep((s) => s - 1)}>
              Back
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {loading ? "Discovering Scope…" : "Generate scope"}
              </Button>
            )}
          </div>
        </div>
        )}

      </div>

      {/* Loading Scope Animation Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center pt-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-12 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center justify-center"
          >
            {/* Wordmark logo pulse */}
            <div className="mb-10 flex items-center justify-center animate-pulse" style={{ animationDuration: "2.5s" }}>
              <span className="font-black text-[36px] tracking-tighter text-stone-900 leading-none">
                EXECUTA<span className="text-[#E85239]">.</span>
              </span>
            </div>
            
            <h3 className="text-[22px] font-black text-stone-900 mb-6 text-center">
              Drafting Project Scope
            </h3>

            <div className="w-full space-y-6">
              <div className="h-6 relative w-full flex justify-center items-center text-[#E85239] font-bold text-[14px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute text-center whitespace-nowrap"
                  >
                    {loadingText}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                    className="h-full bg-gradient-to-r from-orange-300 to-[#E85239]"
                    initial={{ width: "10%" }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                 />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
