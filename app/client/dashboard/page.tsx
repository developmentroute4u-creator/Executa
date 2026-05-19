"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Button, Badge, Card } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  new: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

export default function ClientDashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch((err) => console.error("Error loading projects", err))
      .finally(() => setLoading(false));
  }, []);

  const user = session?.user as any;

  const sidebarItems = [
    { label: "Dashboard", href: "/client/dashboard", icon: SidebarIcons.home, active: true },
    { label: "All Projects", href: "/client/projects", icon: SidebarIcons.projects },
    { label: "Start Project", href: "/client/onboarding", icon: SidebarIcons.new },
  ];

  const activeProjects = projects.filter((p) => ["active", "matching", "scope_review", "scoping"].includes(p.status));
  const completedProjects = projects.filter((p) => p.status === "completed");
  const totalBudget = activeProjects.reduce((sum, p) => sum + (p.pricing?.total || 0), 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 animate-fade-up">
          
          {/* Top Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-border pb-6">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-1 font-bold">Client Execution Hub</p>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Welcome, {user?.name || "Client"}</h1>
              <p className="text-sm text-text-secondary mt-1 max-w-lg">
                Track your active projects, review AI-generated scopes, and collaborate with verified expert talent.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-4">
              <div className="text-right hidden md:block mr-4">
                <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider mb-0.5">Active Total Budget</div>
                <div className="text-lg font-bold text-text-primary">{formatCurrency(totalBudget)}</div>
              </div>
              <Link href="/client/onboarding">
                <Button variant="primary" className="px-6 py-2.5 shadow-sm text-sm font-semibold">
                  + Start New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Projects View */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-2">Your Projects</h2>

            {loading && (
              <div className="py-12 flex justify-center">
                <span className="text-xs font-semibold text-text-secondary animate-pulse">Loading execution data…</span>
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="py-20 text-center border border-border border-dashed rounded-2xl bg-surface/30">
                <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">No active projects yet</h3>
                <p className="text-xs text-text-secondary mb-6 max-w-sm mx-auto leading-relaxed">
                  Start a new project. Our system will immediately generate a detailed scope, exact budget, and match you with expert talent.
                </p>
                <Link href="/client/onboarding">
                  <Button variant="primary" className="px-6 py-2">Start your first project</Button>
                </Link>
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => {
                  
                  // Clean status mapping for non-jargon display
                  let displayStatus = "";
                  let statusColor: "stone" | "amber" | "blue" | "green" | "red" = "stone";
                  
                  switch (project.status) {
                    case "scoping":
                      displayStatus = "Generating Scope"; statusColor = "stone"; break;
                    case "scope_review":
                      displayStatus = "Action Required: Review Scope"; statusColor = "amber"; break;
                    case "matching":
                    case "pricing":
                      displayStatus = "Finding Freelancer Match"; statusColor = "blue"; break;
                    case "active":
                      displayStatus = "Active Execution"; statusColor = "green"; break;
                    case "review":
                      displayStatus = "Pending Your Approval"; statusColor = "blue"; break;
                    case "completed":
                      displayStatus = "Completed Successfully"; statusColor = "stone"; break;
                    case "disputed":
                      displayStatus = "Disputed"; statusColor = "red"; break;
                    default:
                      displayStatus = project.status; statusColor = "stone";
                  }

                  const routePath = project.status === "scope_review" 
                    ? `/client/projects/${project._id}/scope`
                    : `/client/projects/${project._id}`;

                  return (
                    <Link key={project._id} href={routePath} className="block group">
                      <Card className={`p-0 overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 ${project.status === 'scope_review' ? 'border-amber-500/30' : 'border-border'}`}>
                        
                        {/* Dynamic Status Banner Header */}
                        <div className={`px-5 py-3 border-b flex justify-between items-center ${
                          statusColor === 'amber' ? 'bg-amber-500/5 border-amber-500/20' : 
                          statusColor === 'green' ? 'bg-emerald-500/5 border-emerald-500/20' :
                          statusColor === 'blue' ? 'bg-blue-500/5 border-blue-500/20' :
                          'bg-surface border-border'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${
                              statusColor === 'amber' ? 'bg-amber-500' : 
                              statusColor === 'green' ? 'bg-emerald-500' :
                              statusColor === 'blue' ? 'bg-blue-500' :
                              'bg-text-tertiary'
                            }`} />
                            <span className={`text-[11px] uppercase font-bold tracking-wider ${
                              statusColor === 'amber' ? 'text-amber-700' : 
                              statusColor === 'green' ? 'text-emerald-700' :
                              statusColor === 'blue' ? 'text-blue-700' :
                              'text-text-secondary'
                            }`}>
                              {displayStatus}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-tertiary">{formatDate(project.createdAt)}</span>
                        </div>

                        {/* Project Details */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">{project.title}</h3>
                              <Badge variant="stone" className="capitalize shrink-0">{project.field || "Development"}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{project.goal}</p>
                          </div>

                          <div className="mt-auto pt-5 space-y-4">
                            {/* Execution & Talent Data */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                              <div>
                                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-0.5">Matched Talent</span>
                                {project.freelancerName ? (
                                  <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success"><path d="M20 6L9 17l-5-5"/></svg>
                                    {project.freelancerName}
                                  </span>
                                ) : (
                                  <span className="text-xs text-text-secondary italic">Pending match…</span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-0.5">Budget</span>
                                <span className="text-sm font-bold text-text-primary">
                                  {project.pricing?.total ? formatCurrency(project.pricing.total) : "Calculating…"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Call to Action Banner */}
                            {project.status === "scope_review" && (
                              <div className="w-full text-center px-4 py-2 bg-accent text-white text-xs font-semibold rounded-md shadow-sm">
                                Review & Confirm Scope &rarr;
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
