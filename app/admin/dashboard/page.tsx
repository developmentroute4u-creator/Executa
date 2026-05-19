"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Card, Badge, Button, ScoreBar, LevelBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  tests: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"tests" | "freelancers" | "clients">("tests");
  
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // States for dynamic test evaluation
  const [tests, setTests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [scores, setScores] = useState({ functionalCoverage: 0, logic: 0, usability: 0, edgeCases: 0, outputQuality: 0 });
  const [capabilityScores, setCapabilityScores] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // States for comprehensive talent & client hubs
  const [overview, setOverview] = useState<any>({ freelancers: [], clients: [], projects: [] });
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [talentSearch, setTalentSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const fetchOverview = () => {
    setLoadingOverview(true);
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setOverview(d))
      .catch((err) => console.error("Error fetching admin overview:", err))
      .finally(() => setLoadingOverview(false));
  };

  useEffect(() => {
    // Isolated client-side check for administrative session cookie
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      acc[k] = v;
      return acc;
    }, {} as any);

    if (cookies.admin_session === "authenticated") {
      setAuthenticated(true);
      setCheckingAuth(false);
      
      // Load admin payloads securely
      fetch("/api/admin/tests")
        .then((r) => r.json())
        .then((d) => setTests(d.tests || []));
      
      fetchOverview();
    } else {
      window.location.href = "/admin/login";
    }
  }, []);

  useEffect(() => {
    if (selected) {
      setScores({
        functionalCoverage: selected.evaluation?.functionalCoverage || 0,
        logic: selected.evaluation?.logic || 0,
        usability: selected.evaluation?.usability || 0,
        edgeCases: selected.evaluation?.edgeCases || 0,
        outputQuality: selected.evaluation?.outputQuality || 0,
      });
      setCapabilityScores(selected.evaluation?.capabilityScores || []);
      setNotes(selected.evaluation?.evaluatorNotes || "");
    } else {
      setScores({ functionalCoverage: 0, logic: 0, usability: 0, edgeCases: 0, outputQuality: 0 });
      setCapabilityScores([]);
      setNotes("");
    }
  }, [selected]);

  async function evaluate() {
    if (!selected) return;
    setSubmitting(true);
    setMessage("");
    const res = await fetch(`/api/admin/tests/${selected._id}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, capabilityScores, evaluatorNotes: notes }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setMessage(`Evaluated successfully. Level ${data.level} assigned.`);
      setTests((prev) => prev.filter((t) => t._id !== selected._id));
      setSelected(null);
      fetchOverview(); // Sync hubs instantly
    } else {
      setMessage("Evaluation failed.");
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const sidebarItems = [
    { label: "Vetting Workspace", href: "#", onClick: () => setActiveTab("tests"), icon: SidebarIcons.home, active: activeTab === "tests" },
    { label: "Freelancer Talent", href: "#", onClick: () => setActiveTab("freelancers"), icon: SidebarIcons.tests, active: activeTab === "freelancers" },
    { label: "Clients & Projects", href: "#", onClick: () => setActiveTab("clients"), icon: SidebarIcons.projects, active: activeTab === "clients" },
  ];

  // Filtering freelancers
  const filteredFreelancers = overview.freelancers?.filter((f: any) => {
    const searchString = `${f.name} ${f.email} ${f.field} ${f.specializations?.join(" ")}`.toLowerCase();
    return searchString.includes(talentSearch.toLowerCase());
  }) || [];

  // Filtering clients
  const filteredClients = overview.clients?.filter((c: any) => {
    const searchString = `${c.name} ${c.email} ${c.company} ${c.industry}`.toLowerCase();
    return searchString.includes(clientSearch.toLowerCase());
  }) || [];

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-xs font-semibold text-text-secondary animate-pulse">Authenticating Administrative Session…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin navigation layout */}
      <aside className="w-60 shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col">
        <div className="h-14 px-5 flex items-center border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">Executa Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { item.onClick && item.onClick(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${item.active ? "bg-white text-text-primary font-medium shadow-sm border border-border" : "text-text-secondary hover:text-text-primary hover:bg-white/70"}`}
            >
              <span className={`w-4 h-4 shrink-0 ${item.active ? "text-accent" : "text-text-tertiary"}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-surface/50 text-xs text-text-secondary flex flex-col gap-2">
          <div>
            <p className="font-semibold text-text-primary">System Admin</p>
            <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider mt-0.5">Administrative Portal</p>
          </div>
          <button
            onClick={() => {
              document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/admin/login";
            }}
            className="text-[11px] text-error hover:underline text-left mt-1 font-semibold"
          >
            Sign Out &rarr;
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12">
          
          {/* Main Tab bar Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Admin Control Center</h1>
              <p className="text-xs text-text-secondary mt-1">Govern talent calibration, manage clients, and oversee scopes.</p>
            </div>
            
            {/* Horizontal Sub-Tabs */}
            <div className="flex bg-surface rounded-lg p-1 border border-border shrink-0">
              <button
                onClick={() => setActiveTab("tests")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "tests" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
              >
                Vetting Submissions ({tests.length})
              </button>
              <button
                onClick={() => setActiveTab("freelancers")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "freelancers" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
              >
                Talent Hub ({overview.freelancers?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("clients")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "clients" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
              >
                Clients & Projects ({overview.clients?.length || 0})
              </button>
            </div>
          </div>

          {/* TAB 1: PENDING EVALUATIONS & CALIBRATION */}
          {activeTab === "tests" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
              {/* Test list */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Submissions Pending Vetting</h2>
                {tests.length === 0 && (
                  <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/30">
                    <p className="text-sm text-text-secondary">No talent test submissions are currently waiting in the evaluation queue.</p>
                  </div>
                )}
                {tests.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => { setSelected(t); setMessage(""); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selected?._id === t._id ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-white hover:border-border-strong"}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-text-primary">{t.freelancerName || "Professional Candidate"}</span>
                      <Badge variant="amber">Under Review</Badge>
                    </div>
                    <div className="text-xs text-text-secondary capitalize">{t.specialization} &middot; {t.field}</div>
                    <div className="text-[10px] text-text-tertiary mt-2">Submitted: {formatDate(t.createdAt)}</div>
                  </button>
                ))}
              </div>

              {/* Evaluation Calibration Panel */}
              <div>
                {!selected ? (
                  <div className="h-72 flex items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-surface/20">
                    <div className="space-y-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-tertiary mx-auto" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      <p className="text-xs font-semibold text-text-primary">Select Vetting Assignment</p>
                      <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed">Choose a pending submission on the left to grade, calibrate level bounds, and submit evaluator feedback.</p>
                    </div>
                  </div>
                ) : (
                  <Card className="p-6 space-y-6">
                    <div className="border-b border-border pb-4">
                      <span className="text-[10px] text-accent uppercase font-bold tracking-wider">Calibration Workspace</span>
                      <h3 className="text-base font-semibold text-text-primary mt-0.5">{selected.freelancerName}</h3>
                      <p className="text-xs text-text-secondary capitalize mt-0.5">{selected.specialization} &middot; {selected.field} track</p>
                    </div>

                    {/* Vetting Deliverables Links */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Deliverable Artifact</span>
                        {selected.submissionUrl ? (
                          <a href={selected.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                            View Candidate Deliverable URL &rarr;
                          </a>
                        ) : (
                          <p className="text-xs text-text-secondary mt-1">No URL provided.</p>
                        )}
                      </div>

                      {selected.submissionNotes && (
                        <div>
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Candidate Operational Notes</span>
                          <p className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded border border-border mt-1 font-sans">
                            {selected.submissionNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Score Sliders */}
                    <div className="space-y-4 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-tertiary border-b border-border pb-1.5">
                        <span>Dynamic Signal Criteria</span>
                        <span className="text-accent font-semibold text-sm">{total} / 50</span>
                      </div>
                      {[
                        { key: "functionalCoverage", label: "Functional Coverage" },
                        { key: "logic", label: "Logical Structure" },
                        { key: "usability", label: "Usability & UI" },
                        { key: "edgeCases", label: "Edge Cases" },
                        { key: "outputQuality", label: "Code/Asset Quality" },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">{label}</span>
                            <span className="font-semibold text-text-primary tabular-nums">{(scores as any)[key]} / 10</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={(scores as any)[key]}
                            onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                            className="w-full accent-accent bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}

                      {/* Capability-Specific criteria */}
                      {capabilityScores && capabilityScores.length > 0 && (
                        <div className="space-y-4 border-t border-border pt-4">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Blended Capability Criteria</span>
                          {capabilityScores.map((cap, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-secondary capitalize font-medium">{cap.capabilityName} &middot; <span className="text-text-tertiary">{cap.dimensionName}</span></span>
                                <span className="font-semibold text-text-primary tabular-nums">{cap.score} / 10</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={10}
                                value={cap.score}
                                onChange={(e) => {
                                  const newScores = [...capabilityScores];
                                  newScores[idx].score = Number(e.target.value);
                                  setCapabilityScores(newScores);
                                }}
                                className="w-full accent-accent bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Level Bounds Indicator */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="p-3 rounded-lg bg-surface border border-border text-center">
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Awarded Caliber Tier</span>
                        <span className="text-xs font-semibold text-text-primary mt-1 block">
                          {total <= 30 ? "Level 1: Executor" : total <= 40 ? "Level 2: Independent" : "Level 3: Systems Thinker"}
                        </span>
                      </div>
                      
                      <textarea
                        rows={3}
                        className="w-full rounded border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none font-sans"
                        placeholder="Provide dynamic feedback explanation and guidance..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {message && <p className={`text-xs font-medium text-center ${message.includes("successful") ? "text-success" : "text-error"}`}>{message}</p>}
                    <Button variant="primary" className="w-full text-xs font-semibold" onClick={evaluate} loading={submitting}>
                      Submit evaluation
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TALENT HUB (FREELANCERS LIST & VERIFICATION STATES) */}
          {activeTab === "freelancers" && (
            <div className="space-y-6 animate-fade-up">
              {/* Search Control */}
              <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border">
                <input
                  className="flex-1 max-w-sm rounded border border-border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
                  placeholder="Search freelancers by name, track, or specialization…"
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                />
                <span className="text-xs text-text-secondary font-medium">Showing {filteredFreelancers.length} candidates</span>
              </div>

              {loadingOverview ? (
                <div className="py-12 text-center text-xs text-text-secondary">Loading registered talent profiles…</div>
              ) : filteredFreelancers.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <p className="text-xs text-text-secondary">No freelancers match the search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredFreelancers.map((f: any) => (
                    <Card key={f._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-border-strong transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-text-primary">{f.name}</span>
                          <span className="text-xs text-text-tertiary">({f.email})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="px-2 py-0.5 bg-surface text-text-secondary text-[10px] rounded border border-border font-medium capitalize">{f.field} Track</span>
                          {f.specializations?.slice(0, 3).map((spec: string) => (
                            <span key={spec} className="px-2 py-0.5 bg-accent/5 text-accent text-[10px] rounded border border-accent/15 font-semibold capitalize">{spec}</span>
                          ))}
                          {f.specializations?.length > 3 && (
                            <span className="text-[10px] text-text-tertiary">+{f.specializations.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        {/* Verification details */}
                        <div className="text-right">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Verification</span>
                          <span className="mt-0.5 inline-block">
                            {f.testStatus === "evaluated" ? (
                              <Badge variant="green">Evaluated ({f.testScore}/50)</Badge>
                            ) : f.testStatus === "submitted" || f.testStatus === "under_review" ? (
                              <Badge variant="amber">Pending Evaluation</Badge>
                            ) : f.testStatus === "in_progress" || f.testStatus === "assigned" ? (
                              <Badge variant="stone">Test In Progress</Badge>
                            ) : (
                              <Badge variant="stone">Not Started</Badge>
                            )}
                          </span>
                        </div>

                        {/* Level badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block mb-0.5">Assigned Level</span>
                          <LevelBadge level={f.level || 1} />
                        </div>

                        {/* Earnings detail */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Total Earnings</span>
                          <span className="text-xs font-bold text-text-primary">${(f.totalEarnings || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLIENTS & PROJECTS (ACTIVITY MONITOR) */}
          {activeTab === "clients" && (
            <div className="space-y-8 animate-fade-up">
              {/* Search Control */}
              <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border">
                <input
                  className="flex-1 max-w-sm rounded border border-border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
                  placeholder="Search clients by name, company, or industry…"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                <span className="text-xs text-text-secondary font-medium">Showing {filteredClients.length} clients</span>
              </div>

              {loadingOverview ? (
                <div className="py-12 text-center text-xs text-text-secondary">Loading platform client feeds…</div>
              ) : filteredClients.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <p className="text-xs text-text-secondary">No clients found matching query.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredClients.map((c: any) => {
                    const clientProjects = overview.projects?.filter((p: any) => String(p.clientId) === String(c.userId)) || [];
                    return (
                      <Card key={c._id} className="p-6 space-y-4">
                        {/* Client details header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] text-accent uppercase font-bold tracking-wider">Corporate Partner</span>
                            <h3 className="text-sm font-semibold text-text-primary">{c.name} &middot; <span className="text-xs font-normal text-text-secondary">{c.company || "Independent"} ({c.industry || "General"})</span></h3>
                            <p className="text-[11px] text-text-tertiary">{c.email}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <Badge variant={clientProjects.length > 0 ? "blue" : "stone"}>
                              {clientProjects.length} Active Scope{clientProjects.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>

                        {/* Projects execution activity feed */}
                        {clientProjects.length === 0 ? (
                          <p className="text-xs text-text-tertiary italic">No scoping projects registered for this client yet.</p>
                        ) : (
                          <div className="space-y-3">
                            <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Scope Execution Feeds</span>
                            <div className="grid grid-cols-1 gap-3">
                              {clientProjects.map((p: any) => (
                                <div key={p._id} className="p-4 rounded-lg bg-surface border border-border flex flex-col md:flex-row justify-between gap-4 items-start md:items-center text-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-text-primary capitalize">{p.title}</p>
                                    <p className="text-[11px] text-text-secondary leading-relaxed max-w-xl">Goal: {p.goal}</p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {p.pricing?.total && (
                                        <span className="text-[10px] text-accent font-bold">Budget: ${p.pricing.total.toLocaleString()}</span>
                                      )}
                                      {p.requiredLevel && (
                                        <span className="text-[10px] text-text-secondary">Level Required: L{p.requiredLevel}</span>
                                      )}
                                      {p.freelancerName && (
                                        <span className="text-[10px] text-success font-medium">Matched Talent: {p.freelancerName}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    <span className="text-[10px] text-text-tertiary">Status:</span>
                                    <Badge variant={p.status === "active" ? "green" : p.status === "matching" ? "blue" : p.status === "disputed" ? "red" : "stone"}>
                                      {p.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
