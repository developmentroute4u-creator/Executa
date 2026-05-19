"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Button, Card } from "@/components/ui";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3" /></svg>,
  test: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 2H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.3" /><path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.3" /></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>,
  earnings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" /><path d="M8 5v6M5.5 8h5" stroke="currentColor" strokeWidth="1.3" /></svg>,
};

export default function FreelancerProjectPreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [scope, setScope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  const sidebarItems = [
    { label: "Dashboard", href: "/freelancer/dashboard", icon: SidebarIcons.home },
    { label: "Skill Test", href: "/freelancer/test", icon: SidebarIcons.test },
    { label: "Projects", href: "/freelancer/projects", icon: SidebarIcons.projects, active: true },
    { label: "Earnings", href: "/freelancer/earnings", icon: SidebarIcons.earnings },
  ];

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load project details.");
        return res.json();
      })
      .then((data) => {
        setProject(data.project);
        setScope(data.scope);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const acceptProject = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: true }),
      });
      if (res.ok) {
        router.push(`/freelancer/projects/${projectId}/chat`);
      } else {
        const d = await res.json();
        setError(d.error || "Approval failed.");
      }
    } catch (err) {
      setError("Failed to approve project.");
    } finally {
      setAccepting(false);
    }
  };

  const rejectProject = async () => {
    setRejecting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: true }),
      });
      if (res.ok) {
        router.push("/freelancer/dashboard");
      } else {
        const d = await res.json();
        setError(d.error || "Rejection failed.");
      }
    } catch (err) {
      setError("Failed to reject invitation.");
    } finally {
      setRejecting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-text-primary">
        <Sidebar items={sidebarItems} user={{ name: session?.user?.name, email: session?.user?.email, role: "Freelancer" }} />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-text-primary">Loading technical specifications...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen bg-background text-text-primary">
        <Sidebar items={sidebarItems} user={{ name: session?.user?.name, email: session?.user?.email, role: "Freelancer" }} />
        <main className="flex-1 p-8 max-w-4xl mx-auto space-y-4 bg-background">
          <Link href="/freelancer/dashboard" className="text-sm text-accent hover:underline flex items-center gap-2 font-bold">
            &larr; Back to Dashboard
          </Link>
          <Card className="p-8 border-red-500/25 bg-red-500/5">
            <h3 className="text-lg font-bold text-error">Project Preview Failed</h3>
            <p className="text-sm text-text-primary mt-2">{error || "The requested project could not be found."}</p>
          </Card>
        </main>
      </div>
    );
  }

  const pricing = project.pricing || {};

  // Display full summary of the project goal
  const projectSummary = project.goal 
    ? project.goal.trim()
    : "No goals specified.";

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <Sidebar items={sidebarItems} user={{ name: session?.user?.name, email: session?.user?.email, role: "Freelancer" }} />

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto px-8 py-16 space-y-12 animate-fade-up">
          
          {/* Header Action Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
            <div className="space-y-2">
              <Link href="/freelancer/dashboard" className="text-xs text-accent hover:underline flex items-center gap-1.5 font-bold mb-4">
                &larr; Back to Dashboard
              </Link>
              <h2 className="text-3xl font-bold tracking-tight text-text-primary">Scope & Contract Review</h2>
              <p className="text-sm text-text-secondary">Review the client requirements and technical specifications below before accepting.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                loading={rejecting}
                onClick={rejectProject}
                className="px-6 py-3 text-sm font-bold bg-white text-error hover:bg-error/5 border-error/30 hover:border-error/50 transition-all rounded-xl"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                loading={accepting}
                onClick={acceptProject}
                className="px-8 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 border-blue-600 text-white transition-all shadow-md hover:shadow-lg rounded-xl flex items-center gap-2"
              >
                Accept Project <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Button>
            </div>
          </div>

          {/* Section 1: Project Identity & Crisp AI Summary */}
          <div className="space-y-4">
            <Card className="p-8 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Project Name</span>
                <h1 className="text-2xl font-bold text-text-primary leading-tight">{project.title || "Contract Specification"}</h1>
              </div>
              <div className="space-y-2 border-t border-border pt-5">
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Project Summary</span>
                <p className="text-sm text-text-primary leading-relaxed">{projectSummary}</p>
              </div>
            </Card>
          </div>

          {/* Section 2: Delivery Parameters */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-text-primary border-b border-border pb-3">Delivery Parameters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="p-6 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Priority Track</span>
                <span className="text-sm font-bold text-text-primary capitalize">{project.priority || "Medium"} Priority</span>
              </Card>
              <Card className="p-6 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Estimated Timeline</span>
                <span className="text-sm font-bold text-text-primary">{scope?.timeline?.estimated || 4} Weeks</span>
              </Card>
            </div>
          </div>

          {/* Section 3: Technical Functional Scope Breakdown */}
          {scope?.functionalUnits && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-text-primary border-b border-border pb-3">Governed Technical Scope</h4>
              <div className="grid gap-6">
                {scope.functionalUnits.map((unit: any, idx: number) => (
                  <Card key={idx} className="p-8 space-y-6">
                    <h5 className="text-lg font-bold text-text-primary">{unit.name}</h5>
                    <p className="text-sm text-text-primary leading-relaxed">{unit.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                      {unit.included && unit.included.length > 0 && (
                        <div className="space-y-4">
                          <span className="font-bold text-text-primary flex items-center gap-2 text-[10px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            Included in Scope
                          </span>
                          <ul className="space-y-3 text-sm text-text-primary">
                            {unit.included.map((inc: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="w-1 h-1 bg-text-tertiary rounded-full mt-2 shrink-0" />
                                <span className="leading-tight">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {unit.deliverables && unit.deliverables.length > 0 && (
                        <div className="space-y-4">
                          <span className="font-bold text-text-primary flex items-center gap-2 text-[10px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-success rounded-full" />
                            Expected Deliverables
                          </span>
                          <ul className="space-y-3 text-sm text-text-primary">
                            {unit.deliverables.map((del: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="w-1 h-1 bg-text-tertiary rounded-full mt-2 shrink-0" />
                                <span className="leading-tight">{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Pricing and Final Decision Footer Actions */}
          <Card className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-12">
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Contract Compensation</span>
              <span className="text-3xl font-bold text-accent block">{formatCurrency(pricing.freelancerPrice || 0)}</span>
              <p className="text-xs text-text-secondary mt-1">Payment is secured in escrow and released upon milestone completion.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
              <Button
                variant="outline"
                loading={rejecting}
                onClick={rejectProject}
                className="px-6 py-3.5 text-sm font-bold bg-white text-error hover:bg-error/5 border-error/30 hover:border-error/50 transition-all rounded-xl shadow-sm"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                loading={accepting}
                onClick={acceptProject}
                className="px-8 py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 border-blue-600 text-white transition-all shadow-md hover:shadow-lg rounded-xl flex items-center gap-2"
              >
                Accept Project <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Button>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
