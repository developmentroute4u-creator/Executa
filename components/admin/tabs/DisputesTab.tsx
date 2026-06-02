"use client";
import { useState } from "react";
import { Card, Button } from "@/components/ui";

export function DisputesTab({ projects, setActiveTab, fetchOverview }: { projects: any[], setActiveTab: (tab: string) => void, fetchOverview: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const disputedProjects = projects.filter(p => p.status === "disputed");

  const handleResolve = async (projectId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_dispute", projectId }),
      });
      if (res.ok) {
        fetchOverview();
      } else {
        const err = await res.json();
        alert(`Action failed: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          Audit Resolutions
          {disputedProjects.length > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {disputedProjects.length} ACTIVE
            </span>
          )}
        </h2>
        <p className="text-xs text-text-secondary mt-1">Review and resolve frozen execution scopes.</p>
      </div>

      {disputedProjects.length === 0 ? (
        <Card className="py-16 text-center border-dashed bg-green-50/30">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="text-sm font-bold text-text-primary">No disputes. All clear.</h3>
          <p className="text-xs text-text-secondary mt-1">All platform operations are certified.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disputedProjects.map((p: any) => (
            <Card key={p._id} className="p-6 space-y-5 border-red-200">
              <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider bg-red-50 p-2 rounded-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
                Active Dispute Locked
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-text-primary">{p.title}</h3>
                <p className="text-[11px] text-text-secondary">
                  Client: <span className="font-semibold text-text-primary">{p.clientName}</span> &middot; 
                  Expert: <span className="font-semibold text-accent">{p.freelancerName || "N/A"}</span>
                </p>
              </div>

              <div className="p-3 bg-surface border border-border rounded text-xs leading-relaxed text-text-secondary italic">
                ⚠️ System Dispute State Active. Secure billing locks are active. Project progression is frozen until administrative mediation is completed.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setActiveTab("projects")}
                >
                  Inspect Chat
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                  disabled={submitting}
                  onClick={() => handleResolve(p._id)}
                >
                  Resolve Dispute
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
