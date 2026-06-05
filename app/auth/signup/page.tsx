"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type Role = "client" | "freelancer";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get("role") as Role) || "client";
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (role === "client") router.push("/client/onboarding");
      else router.push("/freelancer/onboarding");
    } catch { setError("Something went wrong."); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-[42%] bg-surface border-r border-border flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Executa</span>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-4">
            {role === "client" ? "Define your project.\nGet it executed." : "Prove your capability.\nGet matched to real work."}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {role === "client"
              ? "The Scope Engine generates a structured project definition. The Matching Engine finds the right freelancer."
              : "Complete a skill evaluation. Receive a capability level. Get matched to projects that fit your specialization."}
          </p>
        </div>
        <div className="space-y-3">
          {(role === "client"
            ? ["Describe your goal", "Receive structured scope", "Get matched & execute"]
            : ["Choose your specialization", "Complete skill evaluation", "Get matched to projects"]
          ).map((item, i) => (
            <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="w-5 h-5 rounded-full border border-border text-xs flex items-center justify-center shrink-0">{i + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          {step === 1 && (
            <>
              <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight mb-2">Join Executa</h1>
                <p className="text-sm text-text-secondary">Choose how you'll use the platform.</p>
              </div>
              <div className="space-y-3 mb-8">
                {(["client", "freelancer"] as Role[]).map((r) => (
                  <button key={r} onClick={() => setRole(r)}
                    className={cn("w-full text-left p-5 rounded-xl border-2 transition-all",
                      role === r ? "border-accent bg-accent-light" : "border-border bg-white hover:border-border-strong")}>
                    <div className="text-sm font-semibold mb-1">{r === "client" ? "I'm a client" : "I'm a freelancer"}</div>
                    <div className="text-xs text-text-secondary">
                      {r === "client" ? "I have a project that needs structured execution." : "I want to be evaluated and matched to real projects."}
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="primary" className="w-full" onClick={() => setStep(2)}>Continue as {role}</Button>
              <p className="text-sm text-text-secondary mt-6 text-center">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-accent font-medium">Sign in</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-10">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary mb-6">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-muted text-accent text-xs font-medium mb-4 capitalize">{role}</div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2">Create your account</h1>
                <p className="text-sm text-text-secondary">You'll be taken through onboarding after signup.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full name" type="text" placeholder="Arjun Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input label="Email address" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} hint="At least 8 characters" />
                {error && <div className="p-3 bg-error-light border border-error/20 rounded text-xs text-error">{error}</div>}
                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  {loading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm text-text-secondary">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
