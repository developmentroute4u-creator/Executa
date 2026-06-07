"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

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
        router.push(`/freelancer/execution/${projectId}`);
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
        router.push("/freelancer/projects");
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

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-text-tertiary uppercase tracking-widest animate-pulse">Loading technical specifications...</p>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex-1 p-8 max-w-4xl mx-auto space-y-4">
        <Link href="/freelancer/projects" className="text-sm text-accent hover:underline flex items-center gap-2 font-bold">
          &larr; Back to Triage
        </Link>
        <div className="bg-white border border-error/20 rounded-2xl p-8 shadow-sm">
          <h3 className="font-display text-lg font-bold text-error">Project Preview Failed</h3>
          <p className="text-sm text-text-primary mt-2">{error || "The requested project could not be found."}</p>
        </div>
      </main>
    );
  }

  const pricing = project.pricing || {};
  const projectSummary = project.goal ? project.goal.trim() : "No goals specified.";

  return (
    <main className="flex-1 overflow-y-auto bg-background min-h-screen font-sans selection:bg-accent/10 selection:text-accent flex flex-col justify-center py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 w-full">

        {/* Back Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-text-secondary border border-border hover:border-border-strong hover:text-text-primary shadow-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <span className="text-xs font-semibold text-text-tertiary">Project Scope Review</span>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary mb-2">Scope & Contract Review</h2>
            <p className="text-sm text-text-secondary">Review the client requirements and technical specifications below before accepting.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              disabled={rejecting}
              onClick={rejectProject}
              className="btn-secondary text-error hover:bg-error/5 hover:border-error/20"
            >
              Decline
            </button>
            <button
              disabled={accepting}
              onClick={acceptProject}
              className="btn-primary"
            >
              Accept Project
            </button>
          </div>
        </div>

        {/* Section 1: Project Identity */}
        <section className="bg-white border border-border rounded-2xl p-8 shadow-sm mb-8">
          <div className="space-y-1 mb-6">
            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Project Name</span>
            <h1 className="font-display text-2xl font-bold text-text-primary leading-tight">{project.title || "Contract Specification"}</h1>
          </div>
          <div className="pt-6 border-t border-border">
            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-2">Project Summary</span>
            <p className="text-sm text-text-secondary leading-relaxed">{projectSummary}</p>
          </div>
        </section>

        {/* Section 2: Delivery Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Priority Track</span>
            <span className="text-sm font-bold text-text-primary capitalize">{project.priority || "Medium"} Priority</span>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Estimated Timeline</span>
            <span className="text-sm font-bold text-text-primary">{scope?.timeline?.estimated || 4} Weeks</span>
          </div>
        </div>

        {/* Section 3: Technical Functional Scope Breakdown */}
        {scope?.functionalUnits && (
          <div className="mb-12">
            <h3 className="font-display text-lg font-bold text-text-primary mb-6">Governed Technical Scope</h3>
            <div className="space-y-6">
              {scope.functionalUnits.map((unit: any, idx: number) => (
                <div key={idx} className="bg-white border border-border rounded-2xl p-8 shadow-sm">
                  <h4 className="font-display text-xl font-bold text-text-primary mb-2">{unit.name}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">{unit.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                    {unit.included && unit.included.length > 0 && (
                      <div>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider mb-4">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                          Included in Scope
                        </span>
                        <ul className="space-y-3">
                          {unit.included.map((inc: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                              <span className="w-1 h-1 bg-border-strong rounded-full mt-2 shrink-0" />
                              <span className="leading-tight">{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {unit.deliverables && unit.deliverables.length > 0 && (
                      <div>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider mb-4">
                          <span className="w-1.5 h-1.5 bg-success rounded-full" />
                          Expected Deliverables
                        </span>
                        <ul className="space-y-3">
                          {unit.deliverables.map((del: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                              <span className="w-1 h-1 bg-border-strong rounded-full mt-2 shrink-0" />
                              <span className="leading-tight">{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Pricing and Final Decision Footer Actions */}
        <div className="bg-text-primary rounded-2xl p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">Contract Compensation</span>
            <span className="font-display text-4xl font-bold text-white block">{formatCurrency(pricing.freelancerPrice || 0)}</span>
            <p className="text-xs text-white/70 max-w-xs">Payment is secured in escrow and released upon milestone completion.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              disabled={rejecting}
              onClick={rejectProject}
              className="px-6 py-3 rounded-lg font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Decline
            </button>
            <button
              disabled={accepting}
              onClick={acceptProject}
              className="px-8 py-3 rounded-lg font-bold text-sm bg-accent text-white hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Accept Project
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
