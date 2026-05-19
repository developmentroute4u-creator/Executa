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
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3" /></svg>,
  test: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" /></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>,
  earnings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" /><path d="M8 5v1.5M8 9.5V11M6 7.5c0-.8.8-1.5 2-1.5s2 .7 2 1.5-1 1.3-2 1.5-2 .7-2 1.5S6.8 12 8 12s2-.5 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
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
  
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

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

  async function acceptProject(projectId: string) {
    setAcceptingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerAccepted: true })
      });
      if (res.ok) {
        // Refresh profile and active projects
        const r = await fetch("/api/freelancer/profile");
        const d = await r.json();
        setProfile(d.profile);
        setTest(d.test);
        setActiveProjects(d.activeProjects || []);
        setExpandedProjectId(null); // Close modal/expansion on accept
      }
    } catch (err) {
      console.error("Error accepting project:", err);
    } finally {
      setAcceptingId(null);
    }
  }

  async function rejectProject(projectId: string) {
    setRejectingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: true })
      });
      if (res.ok) {
        // Refresh profile and active projects
        const r = await fetch("/api/freelancer/profile");
        const d = await r.json();
        setProfile(d.profile);
        setTest(d.test);
        setActiveProjects(d.activeProjects || []);
        setExpandedProjectId(null); // Close modal/expansion on reject
      }
    } catch (err) {
      console.error("Error rejecting project:", err);
    } finally {
      setRejectingId(null);
    }
  }

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
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Project Invitations</span>
                <div className="text-lg font-semibold text-text-primary mt-1">
                  {activeProjects.filter(p => !p.freelancerAccepted).length}
                </div>
              </div>
              <div className="text-xs text-text-secondary mt-3">
                Matched client partners awaiting your confirmation
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
          <div className="space-y-8">
            
            {/* 1. MATCHED PROJECT INVITATIONS */}
            {activeProjects.filter(p => !p.freelancerAccepted).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Matched Project Invitations</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {activeProjects.filter(p => !p.freelancerAccepted).map((p) => {
                    const pricing = p.pricing || {};
                    const client = p.clientId || {};
                    
                    return (
                      <Card key={p._id} className="p-6 border border-amber-500/25 bg-amber-500/[0.01] hover:border-amber-500/40 transition-all space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="stone" className="text-[9px] uppercase tracking-wider font-bold">New Match Invitation</Badge>
                              <span className="text-[11px] text-text-tertiary font-mono">ID: {p._id.toString().slice(-6).toUpperCase()}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-text-primary mt-1">{p.title}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">{p.goal}</p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Estimated Compensation</span>
                            <span className="text-lg font-bold text-accent">{formatCurrency(pricing.freelancerPrice || 0)}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <button
                            onClick={() => setExpandedProjectId(p._id)}
                            className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1.5 self-start sm:self-center transition-colors"
                          >
                            🔎 Inspect & Preview Full Scope &rarr;
                          </button>
                          
                          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
                            <Button
                              variant="outline"
                              loading={rejectingId === p._id}
                              onClick={() => rejectProject(p._id)}
                              className="px-4 py-2 text-xs font-bold bg-transparent text-error hover:bg-error/5 border-error/30 hover:border-error/50 transition-all"
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              loading={acceptingId === p._id}
                              onClick={() => acceptProject(p._id)}
                              className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 border-amber-500 text-white transition-all"
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ACTIVE PROJECT WORKSPACE */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary border-b border-border pb-2">Active Project Workspace</h3>
              
              {activeProjects.filter(p => p.freelancerAccepted).length === 0 ? (
                <Card className="p-8 text-center border-dashed border-border/80 bg-surface/10">
                  <div className="w-10 h-10 bg-text-secondary/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17v-5M12 17v-3M15 17v-8" /></svg>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary mb-1">No Active Projects under Execution</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed max-w-sm mx-auto">
                    Once you accept a matched project invitation above, it will transition here as active and unlock your secure direct communication channel.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeProjects.filter(p => p.freelancerAccepted).map((p) => {
                    const pricing = p.pricing || {};
                    return (
                      <Card key={p._id} className="p-6 border border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1">
                            <span className="text-[10px] text-success uppercase font-bold tracking-wider block">Project Under Execution</span>
                            <h4 className="text-base font-semibold text-text-primary">{p.title}</h4>
                            <p className="text-xs text-text-secondary line-clamp-1 max-w-xl">{p.goal}</p>
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Budget</span>
                              <span className="text-sm font-bold text-text-primary">{formatCurrency(pricing.freelancerPrice || 0)}</span>
                            </div>
                            <Link href={`/freelancer/projects/${p._id}/chat`}>
                              <Button variant="primary" className="px-5 py-2.5 text-xs flex items-center gap-1.5 whitespace-nowrap">
                                Secure Chat Channel &rarr;
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 3. STUNNING FULL PROJECT PREVIEW MODAL */}
          {expandedProjectId && (() => {
            const p = activeProjects.find(proj => proj._id === expandedProjectId);
            if (!p) return null;
            const scope = p.scopeId || {};
            const client = p.clientId || {};
            const pricing = p.pricing || {};
            
            return (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-zinc-950 border border-border max-w-3xl w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-border/80 flex items-start justify-between bg-slate-50 dark:bg-zinc-900/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" className="text-[9px] uppercase tracking-wider font-bold">Matched Project Invitation</Badge>
                        <span className="text-[11px] text-text-tertiary font-mono">ID: {p._id.toString().slice(-6).toUpperCase()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mt-1.5">{p.title}</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Client Partner: <span className="font-semibold text-text-primary">{client.name || "Client Partner"}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setExpandedProjectId(null)} 
                      className="text-text-tertiary hover:text-text-primary transition-colors p-1.5 hover:bg-surface rounded-lg"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>

                  {/* Scrollable Body */}
                  <div className="p-6 overflow-y-auto space-y-6 text-left">
                    
                    {/* Goal & Description */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">01 / Strategic Goal & Context</h4>
                      <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-border space-y-3">
                        <p className="text-xs text-text-primary font-medium leading-relaxed">{p.goal}</p>
                        {p.targetAudience && (
                          <p className="text-[11px] text-text-secondary leading-relaxed pt-1">
                            <span className="font-bold text-text-primary block mb-0.5">Target Audience:</span>
                            {p.targetAudience}
                          </p>
                        )}
                        {p.useCaseContext && (
                          <p className="text-[11px] text-text-secondary leading-relaxed pt-1">
                            <span className="font-bold text-text-primary block mb-0.5">Usage / Operational Context:</span>
                            {p.useCaseContext}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Vetting Specifications parameters */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">02 / Governed Technical Parameters</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-border">
                        <div>
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Priority</span>
                          <span className="text-xs font-semibold text-text-primary capitalize">{p.priority || "Medium"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Complexity Track</span>
                          <span className="text-xs font-semibold text-text-primary">Level {p.requiredLevel || 2}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Total Effort Points</span>
                          <span className="text-xs font-semibold text-text-primary font-mono">{scope.totalEffortScore || 0} pts</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Estimated Timeline</span>
                          <span className="text-xs font-semibold text-text-primary">{scope.timeline?.estimated || 4} Weeks</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Functional Units */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">03 / Governed Technical Scope</h4>
                      <div className="grid gap-3.5">
                        {scope.functionalUnits?.map((unit: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white dark:bg-zinc-900/40 rounded-xl border border-border/80 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-text-primary">{unit.name}</h5>
                              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-border font-semibold text-text-secondary">{unit.unitScore} pts</span>
                            </div>
                            <p className="text-[11px] text-text-secondary leading-relaxed">{unit.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[10px]">
                              {unit.included && unit.included.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-semibold text-text-primary block">✓ Inclusions</span>
                                  <ul className="list-disc list-inside text-text-secondary space-y-0.5">
                                    {unit.included.map((inc: string, i: number) => <li key={i}>{inc}</li>)}
                                  </ul>
                                </div>
                              )}
                              {unit.deliverables && unit.deliverables.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-semibold text-text-primary block">⚿ Expected Deliverable</span>
                                  <ul className="list-disc list-inside text-text-secondary space-y-0.5">
                                    {unit.deliverables.map((del: string, i: number) => <li key={i}>{del}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Footer Actions with both Reject & Approve buttons */}
                  <div className="p-6 border-t border-border/80 bg-slate-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Estimated Compensation</span>
                      <span className="text-xl font-bold text-accent">{formatCurrency(pricing.freelancerPrice || 0)}</span>
                    </div>
                    <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                      <Button
                        variant="outline"
                        loading={rejectingId === p._id}
                        onClick={() => rejectProject(p._id)}
                        className="px-5 py-2.5 text-xs font-bold bg-transparent text-error hover:bg-error/5 border-error/30 hover:border-error/50 transition-all"
                      >
                        Reject Invitation
                      </Button>
                      <Button
                        variant="primary"
                        loading={acceptingId === p._id}
                        onClick={() => acceptProject(p._id)}
                        className="px-6 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 border-amber-500 text-white transition-all"
                      >
                        Approve Project &rarr;
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
