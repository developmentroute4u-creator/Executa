"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    // Redirect based on role — fetch session
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    if (role === "client") router.push("/client/dashboard");
    else if (role === "freelancer") router.push("/freelancer/dashboard");
    else if (role === "admin") router.push("/admin/dashboard");
    else router.push("/");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-surface border-r border-border flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Executa</span>
        </Link>

        <div>
          <blockquote className="text-2xl font-semibold tracking-tight text-text-primary leading-snug mb-4">
            "A system that defines work, assigns capability, and enforces outcomes."
          </blockquote>
          <p className="text-sm text-text-secondary">The governed execution platform.</p>
        </div>

        <div className="space-y-3">
          {["Structured scope, not vague briefs", "Capability proven through output", "Pricing derived from effort"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Welcome back</h1>
            <p className="text-sm text-text-secondary">Sign in to your Executa account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-error-light border border-error/20 rounded text-xs text-error">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-8 text-center">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-accent hover:text-accent-hover font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
