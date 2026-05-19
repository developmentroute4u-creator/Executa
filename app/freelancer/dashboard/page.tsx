"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Button, Badge, Card, LevelBadge, ScoreBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  test: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  earnings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v1.5M8 9.5V11M6 7.5c0-.8.8-1.5 2-1.5s2 .7 2 1.5-1 1.3-2 1.5-2 .7-2 1.5S6.8 12 8 12s2-.5 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

export default function FreelancerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [subUrl, setSubUrl] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [startingTest, setStartingTest] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => { 
        setProfile(d.profile); 
        setTest(d.test); 
        setActiveProjects(d.activeProjects || []);
      });
  }, []);

  async function startTest() {
    setStartingTest(true);
    const res = await fetch("/api/freelancer/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: profile.field, domain: profile.domain, specialization: profile.specializations?.[0] }),
    });
    const data = await res.json();
    setStartingTest(false);
    if (data.test) setTest(data.test);
  }

  async function submitTest() {
    if (!subUrl) { setError("Please provide a submission URL or link."); return; }
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/freelancer/test/${test._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionUrl: subUrl, submissionNotes: subNotes }),
    });
    setSubmitting(false);
    if (res.ok) {
      const d = await res.json();
      setTest(d.test);
    } else {
      setError("Submission failed. Try again.");
    }
  }

  const sidebarItems = [
    { label: "Dashboard", href: "/freelancer/dashboard", icon: SidebarIcons.home, active: true },
    { label: "Skill Test", href: "/freelancer/test", icon: SidebarIcons.test },
    { label: "Projects", href: "/freelancer/projects", icon: SidebarIcons.projects },
    { label: "Earnings", href: "/freelancer/earnings", icon: SidebarIcons.earnings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Freelancer" }} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-8 animate-fade-up">
          
          {/* Dashboard Header Bar */}
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Freelancer Workspace</p>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{user?.name || "Professional"}</h1>
            </div>
            <div className="flex items-center gap-3">
              {profile?.available !== undefined && (
                <Badge variant={profile.available ? "green" : "stone"}>
                  {profile.available ? "Available for Projects" : "Unavailable"}
                </Badge>
              )}
              {profile?.level && <LevelBadge level={profile.level} />}
            </div>
          </div>

          {/* Clean Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Field Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Expertise Track</span>
                <div className="text-sm font-semibold text-text-primary mt-1.5 capitalize">{profile?.field || "—"} Development</div>
              </div>
              <div className="text-xs text-text-secondary mt-3 truncate capitalize">
                {profile?.domain?.split(",").slice(0, 2).join(", ") || "—"}
              </div>
            </Card>

            {/* Status Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Skill Verification</span>
                <div className="text-sm font-semibold text-text-primary mt-1.5 capitalize">
                  {test ? test.status.replace("_", " ") : "Not Started"}
                </div>
              </div>
              <div className="text-xs text-text-secondary mt-3">
                {test?.status === "evaluated" ? "Verification Complete" : "Pending completion"}
              </div>
            </Card>

            {/* Earnings Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Total Earnings</span>
                <div className="text-lg font-semibold text-text-primary mt-1">{formatCurrency(profile?.totalEarnings || 0)}</div>
              </div>
              <div className="text-xs text-text-secondary mt-3">
                To date on Executa
              </div>
            </Card>
          </div>

          {/* Main Action Content Area */}
          <div id="test" className="space-y-6">
            {/* NO TEST CREATED YET */}
            {!test && profile?.field && (
              <Card className="p-8 text-center border-dashed border-border/80">
                <div className="w-12 h-12 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                </div>
                <h3 className="text-base font-semibold mb-2 text-text-primary">Ready for your skill evaluation?</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6 max-w-sm mx-auto">
                  Get a Level 2 practical skill evaluation task compiled specifically for your domains. AI tools and framework assets are allowed.
                </p>
                <Button variant="primary" onClick={startTest} loading={startingTest} className="px-6 py-2">
                  Start skill test
                </Button>
              </Card>
            )}

            {/* EXISTING TEST: REDIRECT GATEWAY */}
            {test && (
              <Card className="p-6 border border-border/90 bg-surface/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-accent uppercase font-bold tracking-wider">Verification Workspace</span>
                    <h3 className="text-base font-semibold text-text-primary capitalize">
                      {test.specialization || "Custom Specialist Assignment"}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                      Access your separate verification track to download the task guidelines as a print-ready PDF, review evaluation criteria, or submit your active prototype deliverables.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Link href="/freelancer/test">
                      <Button variant="primary" className="px-5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap">
                        Open Verification Track →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* ACTIVE PROJECTS LIST */}
            {activeProjects.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Active Project Workspace</h3>
                <div className="grid grid-cols-1 gap-4">
                  {activeProjects.map((p) => (
                    <Card key={p._id} className="p-6 border border-border">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Project under execution</span>
                          <h4 className="text-base font-semibold text-text-primary">{p.title}</h4>
                          <p className="text-xs text-text-secondary line-clamp-1 max-w-xl">{p.goal}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-3">
                          <Link href={`/freelancer/projects/${p._id}/chat`}>
                            <Button variant="primary" className="px-5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap">
                              Secure Chat Channel &rarr;
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
