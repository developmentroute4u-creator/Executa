"use client";
import { useState } from "react";
import { Card, Badge, Button } from "@/components/ui";

export function ClientsTab({ clients, projects, setActiveTab, fetchOverview }: { clients: any[], projects: any[], setActiveTab: (tab: string) => void, fetchOverview: () => void }) {
  const [search, setSearch] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = clients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase()) && !c.company?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = async (action: string, payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
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
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Search client name, email, or company..."
          className="flex-1 text-sm p-2 rounded-lg border border-border focus:outline-none focus:border-accent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-text-secondary font-medium whitespace-nowrap px-2">
          Showing {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((c: any) => {
          const clientProjects = projects.filter((p: any) => String(p.clientId) === String(c.userId));
          const isExpanded = expandedClient === c._id;

          return (
            <Card key={c._id} className="p-0 overflow-hidden relative">
              {c.suspended && (
                <div className="absolute top-0 inset-x-0 bg-red-100 text-red-700 text-center py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Account Suspended
                </div>
              )}
              
              {/* Card Header */}
              <div className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${c.suspended ? "mt-2" : ""}`}>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-text-primary">{c.name} <span className="text-xs font-normal text-text-secondary ml-2">&middot; {c.company || "Independent"} ({c.industry || "General"})</span></h3>
                  <p className="text-[11px] text-text-tertiary">{c.email}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Total Spend</span>
                    <span className="text-sm font-bold text-text-primary">₹{(c.totalSpend || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setExpandedClient(isExpanded ? null : c._id)}
                    >
                      {isExpanded ? "Hide Projects" : `View Projects (${clientProjects.length})`}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`px-3 ${c.suspended ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`} 
                      title={c.suspended ? "Activate Client" : "Suspend Client"} 
                      onClick={() => handleAction("suspend_user", { userId: c.userId, suspended: !c.suspended })}
                      disabled={submitting}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M12 14c-5 0-9 4-9 8h18c0-4-4-8-9-8z"/></svg>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Inline Projects View */}
              {isExpanded && (
                <div className="bg-surface border-t border-border p-6 space-y-4 animate-in slide-in-from-top-2">
                  <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Client's Active & Past Scopes</span>
                  
                  {clientProjects.length === 0 ? (
                    <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                      This client hasn't created any projects yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientProjects.map((p: any) => (
                        <div key={p._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-border rounded-lg">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{p.title}</p>
                            <p className="text-[11px] text-text-secondary mt-1">Matched: {p.freelancerName || "Pending Match"}</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs font-bold">₹{p.pricing?.total?.toLocaleString() || 0}</span>
                            <Badge variant={p.status === "active" ? "green" : p.status === "disputed" ? "red" : p.status === "completed" ? "purple" : "stone"}>
                              {p.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("projects")}>Go &rarr;</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-sm text-text-secondary">No clients found matching query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
