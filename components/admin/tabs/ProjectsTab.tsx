"use client";
import { useState } from "react";
import { Card, Badge, Button } from "@/components/ui";

export function ProjectsTab({ projects, freelancers, fetchOverview }: { projects: any[], freelancers: any[], fetchOverview: () => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // States for oversight panel actions
  const [selectedFreelancer, setSelectedFreelancer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = projects.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.clientName?.toLowerCase().includes(search.toLowerCase()) && !p.freelancerName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const handleExpand = (p: any) => {
    if (expandedProject === p._id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(p._id);
      setSelectedStatus(p.status);
      setSelectedFreelancer(p.freelancerId || "");
      setChatMessage("");
      setNewUnitName("");
      setNewUnitDesc("");
    }
  };

  const handleAction = async (action: string, payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, projectId: expandedProject, ...payload }),
      });
      if (res.ok) {
        if (action === "admin_chat_message") setChatMessage("");
        if (action === "add_functional_unit") { setNewUnitName(""); setNewUnitDesc(""); }
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
          placeholder="Search project name, client, or expert..."
          className="flex-1 text-sm p-2 rounded-lg border border-border focus:outline-none focus:border-accent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="text-sm p-2 rounded-lg border border-border bg-transparent focus:outline-none focus:border-accent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="scoping">Scoping</option>
          <option value="matching">Matching</option>
          <option value="active">Active</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="disputed">Disputed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-xs text-text-secondary font-medium whitespace-nowrap px-2">
          Showing {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((p: any) => {
          const isExpanded = expandedProject === p._id;

          return (
            <Card key={p._id} className={`p-0 overflow-hidden transition-all ${isExpanded ? "ring-2 ring-accent border-accent" : ""}`}>
              {/* Card Header */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface/30"
                onClick={() => handleExpand(p)}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{p.title}</h3>
                    <Badge variant={p.status === "active" ? "green" : p.status === "disputed" ? "red" : p.status === "completed" ? "purple" : "stone"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary capitalize">{p.field || "General"} Track</p>
                  <p className="text-xs text-text-tertiary">
                    Client: <span className="font-semibold text-text-primary">{p.clientName}</span> &middot; 
                    Expert: <span className="font-semibold text-accent">{p.freelancerName || "Not assigned"}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Level</span>
                    <span className="text-xs font-bold text-text-primary">L{p.requiredLevel || 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Budget</span>
                    <span className="text-sm font-bold text-text-primary">₹{(p.pricing?.total || 0).toLocaleString()}</span>
                  </div>
                  <div className={`p-2 rounded-full transition-transform ${isExpanded ? "bg-accent/10 text-accent rotate-180" : "bg-surface text-text-secondary"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Oversight Panel */}
              {isExpanded && (
                <div className="bg-surface/50 border-t border-border flex flex-col lg:flex-row animate-in slide-in-from-top-2">
                  
                  {/* Left Col: Controls */}
                  <div className="flex-1 p-6 space-y-8 border-r border-border">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2 mb-4">Project Controls</h4>
                      
                      {/* Force Assign */}
                      <div className="space-y-2 mb-6">
                        <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Force Assign Expert</label>
                        <div className="flex items-center gap-2">
                          <select 
                            className="flex-1 text-xs p-2 rounded bg-white border border-border"
                            value={selectedFreelancer}
                            onChange={(e) => setSelectedFreelancer(e.target.value)}
                          >
                            <option value="">Select Freelancer...</option>
                            {freelancers.filter((f) => f.testStatus === "approved").map((f) => (
                              <option key={f.userId} value={f.userId}>{f.name} (L{f.level} - {f.field})</option>
                            ))}
                          </select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={submitting || !selectedFreelancer}
                            onClick={() => handleAction("force_match", { freelancerId: selectedFreelancer })}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>

                      {/* Override Status */}
                      <div className="space-y-2 mb-6">
                        <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Override Project Status</label>
                        <div className="flex items-center gap-2">
                          <select 
                            className="flex-1 text-xs p-2 rounded bg-white border border-border"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                          >
                            <option value="scoping">scoping</option>
                            <option value="scope_review">scope_review</option>
                            <option value="pricing">pricing</option>
                            <option value="matching">matching</option>
                            <option value="active">active</option>
                            <option value="review">review</option>
                            <option value="completed">completed</option>
                            <option value="disputed">disputed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={submitting || selectedStatus === p.status}
                            onClick={() => handleAction("update_project_status", { status: selectedStatus })}
                          >
                            Update
                          </Button>
                        </div>
                      </div>

                      {/* Dispute Resolution */}
                      {p.status === "disputed" && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-3">
                          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                            Dispute Lock Active
                          </div>
                          <p className="text-[11px] text-red-700 leading-relaxed">
                            This project is frozen. Resolve the dispute once mediation is complete.
                          </p>
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white border-0" 
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleAction("resolve_dispute", {})}
                          >
                            Resolve Dispute & Unfreeze
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Scope Injection */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2 mb-4">Add Work Item</h4>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Unit Name (e.g. Admin Dashboard)"
                          className="w-full text-xs p-2 rounded bg-white border border-border"
                          value={newUnitName}
                          onChange={(e) => setNewUnitName(e.target.value)}
                        />
                        <textarea 
                          placeholder="Brief description of requirements..."
                          className="w-full text-xs p-2 rounded bg-white border border-border"
                          rows={2}
                          value={newUnitDesc}
                          onChange={(e) => setNewUnitDesc(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          disabled={submitting || !newUnitName || !newUnitDesc}
                          onClick={() => handleAction("add_functional_unit", { unitName: newUnitName, unitDescription: newUnitDesc })}
                        >
                          Inject to Scope
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Chat Inject */}
                  <div className="flex-1 p-6 flex flex-col bg-white">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2 mb-4">System Announcement Inject</h4>
                    <p className="text-[11px] text-text-secondary mb-4 leading-relaxed">
                      Send a message directly into the project's chat. It will appear as an official platform announcement to both the client and the expert.
                    </p>
                    
                    <div className="flex-1 bg-surface border border-border rounded-lg p-4 mb-4 flex items-center justify-center text-center">
                      <p className="text-[10px] text-text-tertiary uppercase tracking-widest max-w-[200px]">Live Chat Feed View Disabled in Global Oversight</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <input 
                        type="text" 
                        placeholder="Type system announcement..."
                        className="flex-1 text-sm p-2 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && chatMessage && handleAction("admin_chat_message", { content: chatMessage })}
                      />
                      <Button 
                        disabled={submitting || !chatMessage}
                        onClick={() => handleAction("admin_chat_message", { content: chatMessage })}
                      >
                        Send
                      </Button>
                    </div>
                  </div>

                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-sm text-text-secondary">No projects found matching query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
