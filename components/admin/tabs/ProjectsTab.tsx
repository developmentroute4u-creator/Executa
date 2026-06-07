"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Badge, Button } from "@/components/ui";

export function ProjectsTab({
  projects,
  freelancers,
  fetchOverview,
  preSelectedProjectId,
  setPreSelectedProjectId
}: {
  projects: any[],
  freelancers: any[],
  fetchOverview: () => void,
  preSelectedProjectId?: string | null,
  setPreSelectedProjectId?: (id: string | null) => void
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(preSelectedProjectId || null);

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Resolution Notes Modal in Projects Tab
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const fetchMessages = async (projectId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching project messages:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (preSelectedProjectId) {
      setExpandedProject(preSelectedProjectId);
      fetchMessages(preSelectedProjectId);
      if (setPreSelectedProjectId) {
        setPreSelectedProjectId(null);
      }
    }
  }, [preSelectedProjectId, setPreSelectedProjectId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      setMessages([]);
    } else {
      setExpandedProject(p._id);
      setSelectedStatus(p.status);
      setSelectedFreelancer(p.freelancerId || "");
      setChatMessage("");
      setNewUnitName("");
      setNewUnitDesc("");
      fetchMessages(p._id);
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
        if (expandedProject) {
          fetchMessages(expandedProject);
        }
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              {/* Oversight Panel */}
              {isExpanded && (
                <div className="bg-surface/50 border-t border-border grid grid-cols-1 lg:grid-cols-2 animate-in slide-in-from-top-2">

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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            Dispute Lock Active
                          </div>
                          <p className="text-[11px] text-red-700 leading-relaxed">
                            This project is frozen. Resolve the dispute once mediation is complete.
                          </p>
                          <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                            size="sm"
                            disabled={submitting}
                            onClick={() => {
                              setResolutionNotes("");
                              setShowResolveModal(true);
                            }}
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

                  {/* Right Col Wrapper (Relative to match grid cell height) */}
                  <div className="relative bg-white min-h-[350px] lg:min-h-0">
                    {/* Right Col Content (Absolute to prevent stretching the card height) */}
                    <div className="lg:absolute lg:inset-0 p-6 flex flex-col justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2 mb-2">Secure Chat Thread</h4>

                    <div
                      ref={chatContainerRef}
                      className="flex-1 mb-2 overflow-y-auto min-h-0 pr-1"
                    >
                      <div className="flex flex-col space-y-3 pt-1 pb-2 px-0.5">
                        {loadingChat ? (
                          <div className="h-32 flex items-center justify-center">
                            <span className="text-[10px] text-text-tertiary uppercase tracking-wider animate-pulse">Loading conversation thread...</span>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                            <p className="text-xs font-bold text-text-primary">No messages yet</p>
                            <p className="text-[10px] text-text-tertiary mt-1">This secure workspace chat contains no history.</p>
                          </div>
                        ) : (
                          messages.map((m) => {
                            const isSystem = m.senderRole === "admin";
                            return (
                              <div key={m._id} className={`flex flex-col ${isSystem ? "items-end" : "items-start"}`}>
                                <span className="text-[9px] text-text-tertiary mb-0.5 font-semibold">
                                  {isSystem ? "Administrator" : m.senderDisplayName} &bull; {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm leading-relaxed ${isSystem
                                    ? "bg-amber-50 text-amber-900 border border-amber-200"
                                    : m.senderRole === "client"
                                      ? "bg-blue-50 text-blue-900 border border-blue-150"
                                      : "bg-emerald-50 text-emerald-900 border border-emerald-150"
                                  }`}>
                                  {m.content}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Type system announcement..."
                        className="flex-1 text-sm p-2.5 rounded-xl bg-surface border border-border focus:border-accent focus:outline-none"
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

      {/* RESOLUTION NOTES INPUT MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-100 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in scale-in duration-200">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Certify Resolution</h3>
              <p className="text-[11px] text-text-secondary mt-1">Provide resolution notes that will be posted in the chat thread and saved in the platform logs.</p>
            </div>

            <textarea
              rows={4}
              placeholder="e.g. Verified responsive activity and confirmed completion. Instructed client to release milestone..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-xl outline-none p-3 text-xs resize-none"
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#E85239] hover:bg-[#d44127] text-white border-0"
                disabled={submitting}
                onClick={async () => {
                  setShowResolveModal(false);
                  await handleAction("resolve_dispute", { notes: resolutionNotes.trim() });
                }}
              >
                {submitting ? "Resolving..." : "Confirm Resolve"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
