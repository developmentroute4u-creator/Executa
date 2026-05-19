"use client";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (username === "admin" && password === "admin123") {
      // Set the dedicated admin session cookie (isolated from NextAuth client/freelancer sessions)
      document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
      window.location.href = "/admin/dashboard";
    } else {
      setError("Invalid administrative credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 border border-border shadow-2xl relative overflow-hidden animate-fade-up">
        {/* Decorative subtle ambient border line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-accent" />

        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Executa Admin Gateway</h1>
          <p className="text-xs text-text-secondary mt-1">ProvideAdministrative Credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">
              Username ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 font-sans"
              placeholder="e.g. admin"
            />
          </div>

          <div>
            <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-error font-medium text-center bg-error-light p-2 rounded border border-error/20">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full text-xs font-semibold py-2.5" loading={loading}>
            Authenticate &rarr;
          </Button>
        </form>
      </Card>
    </div>
  );
}
