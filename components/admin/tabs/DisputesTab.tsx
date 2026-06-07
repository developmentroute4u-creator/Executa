"use client";
import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";

export function DisputesTab({
  projects,
  setActiveTab,
  fetchOverview,
  setPreSelectedProjectId
}: {
  projects?: any[],
  setActiveTab: (tab: string) => void,
  fetchOverview: () => void,
  setPreSelectedProjectId?: (id: string | null) => void
}) {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<"active" | "history">("active");

  // Resolve modal states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error("Error fetching disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenResolve = (projectId: string) => {
    setSelectedProjectId(projectId);
    setResolutionNotes("");
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedProjectId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_dispute",
          projectId: selectedProjectId,
          notes: resolutionNotes.trim()
        }),
      });
      if (res.ok) {
        setShowResolveModal(false);
        fetchDisputes();
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

  const activeDisputes = disputes.filter(d => d.status === "active");
  const resolvedDisputes = disputes.filter(d => d.status === "resolved");

  const filteredDisputes = activeTabSub === "active" ? activeDisputes : resolvedDisputes;

  const formatHours = (hours: number) => {
    if (hours > 2000) return "Never messaged";
    if (hours < 1) return "Less than an hour ago";
    return `${Math.round(hours)} hours ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            Operational Disputes & Audits
            {activeDisputes.length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                {activeDisputes.length} ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-text-secondary mt-1">Review disputes, verify platform constraints, and log resolved resolutions.</p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTabSub("active")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === "active"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Active Disputes ({activeDisputes.length})
          </button>
          <button
            onClick={() => setActiveTabSub("history")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTabSub === "history"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Resolution History ({resolvedDisputes.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400 animate-pulse">
            Analyzing Platform Disputes...
          </span>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <Card className="py-16 text-center border-dashed bg-green-50/20 border-green-200">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            {activeTabSub === "active" ? "No active disputes. All clear." : "No resolution history recorded."}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {activeTabSub === "active" ? "All platform operations are performing within bounds." : "Dispute history logs will populate here once resolved."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredDisputes.map((d: any) => (
            <Card key={d._id} className={`p-6 border ${d.status === "active" ? "border-red-100" : "border-stone-200/60"} bg-white space-y-5 shadow-sm`}>
              
              {/* Badge & Meta header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    d.status === "active"
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}>
                    {d.status === "active" ? "🔒 Active Audit Lock" : "✅ Resolved"}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    Opened: {new Date(d.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-stone-500">
                  Flagged by: <span className="text-stone-900 font-black capitalize">{d.proposerRole}</span> ({d.proposerName})
                </span>
              </div>

              {/* Title and details */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-text-primary leading-tight">{d.projectTitle}</h3>
                <p className="text-xs text-text-secondary">
                  Client: <span className="font-semibold text-text-primary">{d.clientName}</span> &middot; 
                  Expert Team: <span className="font-semibold text-[#E85239]">{d.freelancerName}</span>
                </p>
              </div>

              {/* Selected reason and notes */}
              <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-2 text-xs">
                <p className="text-stone-700 font-bold">
                  Flagged Reason: <span className="text-stone-900 font-medium italic">"{d.reason}"</span>
                </p>
                {d.details && (
                  <p className="text-stone-600 leading-relaxed">
                    <strong>Detailed Notes:</strong> "{d.details}"
                  </p>
                )}
              </div>

              {/* AUTOMATED PLATFORM AUDIT REPORT */}
              <div className="border border-stone-200/60 rounded-xl overflow-hidden bg-stone-50/30">
                <div className="bg-stone-100/60 px-4 py-2.5 border-b border-stone-200/50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Platform Automated Audit Report
                  </span>
                  <span className="text-[9px] font-bold text-stone-400">System generated</span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Milestones analysis */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Milestone Deadlines</p>
                    <p className="text-stone-800 font-semibold">
                      {d.platformAudit?.milestonesOverdue > 0 ? (
                        <span className="text-red-600 font-bold">
                          🚨 {d.platformAudit.milestonesOverdue} Milestone(s) Overdue
                        </span>
                      ) : (
                        <span className="text-emerald-600">
                          ✓ No milestones overdue
                        </span>
                      )}
                    </p>
                    {d.platformAudit?.overdueDaysMax > 0 && (
                      <p className="text-[11px] text-stone-400">
                        Max overdue latency: {d.platformAudit.overdueDaysMax} days
                      </p>
                    )}
                    <p className="text-[10px] text-stone-400">
                      Total milestones: {d.platformAudit?.milestonesTotal || 0}
                    </p>
                  </div>

                  {/* Responsiveness / Message logs */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Inactivity Audit</p>
                    <p className="text-stone-700">
                      Expert: <span className={d.platformAudit?.freelancerInactivityHours > 48 ? "text-amber-600 font-bold" : "text-stone-900 font-semibold"}>
                        {formatHours(d.platformAudit?.freelancerInactivityHours)}
                      </span>
                    </p>
                    <p className="text-stone-700">
                      Client: <span className={d.platformAudit?.clientInactivityHours > 72 ? "text-amber-600 font-bold" : "text-stone-900 font-semibold"}>
                        {formatHours(d.platformAudit?.clientInactivityHours)}
                      </span>
                    </p>
                  </div>

                  {/* Verdict */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Platform Verdict</p>
                    <div className={`p-2 rounded-lg text-[11px] leading-relaxed font-bold ${
                      d.platformAudit?.auditVerdict?.startsWith("Legitimate")
                        ? "bg-red-50 text-red-750 border border-red-100"
                        : d.platformAudit?.auditVerdict?.startsWith("Suspected")
                        ? "bg-emerald-50 text-emerald-755 border border-emerald-100"
                        : "bg-blue-50 text-blue-755 border border-blue-100"
                    }`}>
                      {d.platformAudit?.auditVerdict || "Requires manual audit review"}
                    </div>
                  </div>
                </div>
              </div>

              {/* RESOLUTION DETAILS (For Resolved Disputes) */}
              {d.status === "resolved" && (
                <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl space-y-1.5 text-xs">
                  <p className="text-emerald-800 font-black">
                    ✓ Resolution Certified
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    <strong>Admin Resolution Notes:</strong> "{d.resolutionNotes || 'Resolved after review.'}"
                  </p>
                  {d.resolvedAt && (
                    <p className="text-[10px] text-stone-400">
                      Resolved: {new Date(d.resolvedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              )}

              {/* CTA buttons */}
              {d.status === "active" && (
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      if (setPreSelectedProjectId) {
                        setPreSelectedProjectId(d.projectId);
                      }
                      setActiveTab("projects");
                    }}
                  >
                    Inspect Chat Thread
                  </Button>
                  <Button 
                    className="flex-1 bg-[#E85239] hover:bg-[#d44127] text-white border-0"
                    disabled={submitting}
                    onClick={() => handleOpenResolve(d.projectId)}
                  >
                    Certify & Resolve Dispute
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

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
                onClick={handleResolveSubmit}
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
