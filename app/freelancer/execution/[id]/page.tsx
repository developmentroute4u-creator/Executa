"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Paperclip, 
  FileText, 
  Plus, 
  X, 
  Loader2,
  AlertCircle, 
  AlertTriangle,
  Zap,
  Calendar,
  Clock
} from "lucide-react";
import { cn, formatCurrency, getRemainingTimeDetails } from "@/lib/utils";

export default function ExecutionRoom({ params }: { params: { id: string } }) {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const [project, setProject] = useState<any>(null);
  const [scope, setScope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  
  // Tabs
  const [view, setView] = useState<"canvas" | "submissions">("canvas");

  // Chat/Comms Thread
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Scope Upgrades / Increments
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [showUpgradeDetailsModal, setShowUpgradeDetailsModal] = useState(false);
  const [approvingUpgrade, setApprovingUpgrade] = useState(false);

  // Scope Conflict Flag Modal
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflictReason, setSelectedConflictReason] = useState("");
  const [conflictDetails, setConflictDetails] = useState("");
  const [flaggingConflict, setFlaggingConflict] = useState(false);

  // Milestone Submission States
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const handleAcceptScope = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_scope" }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to accept scope.");
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting scope.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineScope = async () => {
    if (!confirm("Are you sure you want to decline this project assignment? This will return the project to matchmaking.")) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: true }),
      });
      if (res.ok) {
        router.push("/freelancer/projects");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to decline scope.");
      }
    } catch (err) {
      console.error(err);
      alert("Error declining scope.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitMilestone = async (milestoneIndex: number) => {
    if (!submissionUrl.trim()) {
      alert("Please enter a deliverable link.");
      return;
    }
    setSubmittingMilestone(true);
    try {
      const res = await fetch(`/api/projects/${params.id}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          milestoneIndex,
          submissionUrl: submissionUrl.trim(),
          submissionNotes: submissionNotes.trim()
        })
      });
      if (res.ok) {
        setSubmissionUrl("");
        setSubmissionNotes("");
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to submit deliverables.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting deliverables.");
    } finally {
      setSubmittingMilestone(false);
    }
  };

  // Load project data
  const fetchData = async () => {
    try {
      // 1. Fetch project & scope details
      const projRes = await fetch(`/api/projects/${params.id}`);
      if (!projRes.ok) throw new Error("Failed to load project details");
      const projData = await projRes.json();
      setProject(projData.project);
      setScope(projData.scope);

      // 2. Fetch secure chat thread
      const chatRes = await fetch(`/api/projects/${params.id}/chat`);
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setMessages(chatData.messages || []);
      }

      // 3. Fetch scope upgrades
      const upgradeRes = await fetch(`/api/projects/${params.id}/upgrades`);
      if (upgradeRes.ok) {
        const upgradeData = await upgradeRes.json();
        setUpgrades(upgradeData.upgrades || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup minor polling for live synchronized chat thread (every 6 seconds)
    const interval = setInterval(async () => {
      try {
        const chatRes = await fetch(`/api/projects/${params.id}/chat`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setMessages(chatData.messages || []);
        }
      } catch (e) {
        console.error("Chat sync error:", e);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [params.id]);

  // Scroll to bottom of chat internally on message updates (prevent page viewport jumping)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 150;
      if (!hasInitialScrolled || isNearBottom) {
        container.scrollTop = container.scrollHeight;
        if (!hasInitialScrolled) {
          setHasInitialScrolled(true);
        }
      }
    }
  }, [messages, hasInitialScrolled]);

  // Chat message submission
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scope Upgrade Approval
  const handleApproveUpgrade = async () => {
    const pendingUpgrade = upgrades.find(u => u.status === "pending_freelancer_approval");
    if (!pendingUpgrade || approvingUpgrade) return;

    setApprovingUpgrade(true);
    try {
      const res = await fetch(`/api/projects/${params.id}/upgrades/${pendingUpgrade._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "freelancer_approve" })
      });
      if (res.ok) {
        setShowUpgradeDetailsModal(false);
        fetchData(); // Reload scope details and units dynamically
      } else {
        alert("Failed to approve scope upgrade. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingUpgrade(false);
    }
  };

  // Scope Conflict Flag Dispute Handler
  const handleFlagConflict = async () => {
    if (!selectedConflictReason || flaggingConflict) return;

    setFlaggingConflict(true);
    try {
      const reasonMap: Record<string, string> = {
        optA: "Client is requesting additional out-of-scope functional units directly in chat without formal pricing adjustments.",
        optB: "Client wants substantial structural revisions to approved, completed deliverables.",
        optC: "Client is compressing the delivery timeline without adjusting scope limits or split prices.",
        optD: "Client is completely unresponsive but expects immediate project completion.",
        optE: "Client is requesting off-platform billing or communication circumventions off the secure rails."
      };

      const reasonText = reasonMap[selectedConflictReason] || "Other scope discrepancy or client cooperation conflict.";
      
      // Formulate secure system alert message warning the client and activating contributing mode
      const conflictMsg = `⚠️ [Executa Support Alert]\n\nThe expert team has officially flagged a scope boundary conflict.\n\nReason: "${reasonText}"\n${conflictDetails ? `Details: "${conflictDetails}"\n` : ""}\nLIVE AUDIT ENGAGED: Executa's senior audit panel has been alerted and will inspect this secure chat thread and scope functional definitions. Expert contributions are fully protected under Executa's secure Contributing Mode. All billing limits and functional deliverables are frozen under audit.`;

      const res = await fetch(`/api/projects/${params.id}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText, details: conflictDetails })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        setSelectedConflictReason("");
        setConflictDetails("");
        setShowConflictModal(false);
        setProject(prev => prev ? { ...prev, status: "disputed" } : null);
      } else {
        alert("Could not register scope conflict. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFlaggingConflict(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-background flex flex-col items-center justify-center p-8 pl-32 font-sans min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-[#E85239] w-8 h-8" strokeWidth={2.5} />
          <p className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Synchronizing Live Execution Canvas...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 bg-background flex flex-col items-center justify-center p-8 pl-32 font-sans min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="text-[#E85239] w-12 h-12 mx-auto" />
          <h2 className="text-xl font-bold text-text-primary">Execution Room Not Found</h2>
          <p className="text-sm text-text-secondary">Please check the project ID or return to your dashboard.</p>
          <Link href="/freelancer/workspace">
            <button className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors">
              Go to Workspace
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const pendingUpgrade = upgrades.find(u => u.status === "pending_freelancer_approval");

  return (
    <main className="w-full h-screen max-h-screen overflow-hidden flex flex-col bg-background font-sans select-none">
      
      {/* ── Editorial Top Navigation Header ── */}
      <header className="shrink-0 border-b border-border/40 px-10 md:px-12 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 bg-white/80 backdrop-blur-xl">
        <div className="space-y-1">
          <Link 
            href="/freelancer/workspace" 
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-text-tertiary hover:text-[#E85239] transition-colors group mb-3 py-1"
          >
            <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" /> Exit to Workspace
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] animate-pulse" />
            <p className="text-[10px] font-bold text-[#E85239] uppercase tracking-wider">Live Execution Environment</p>
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight font-bold leading-tight">{project.title}</h1>
        </div>

        {/* Tab Controls and Conflict Actions */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-wider">
            <button 
              onClick={() => setView("canvas")}
              className={cn("transition-colors pb-1.5 border-b-2 font-bold", view === "canvas" ? "text-text-primary border-[#E85239]" : "text-text-tertiary border-transparent hover:text-text-secondary")}
            >
              Operational Canvas
            </button>
            {project.status !== "pending" && (
              <button 
                onClick={() => setView("submissions")}
                className={cn("transition-colors pb-1.5 border-b-2 font-bold", view === "submissions" ? "text-text-primary border-[#E85239]" : "text-text-tertiary border-transparent hover:text-text-secondary")}
              >
                Submissions
              </button>
            )}
          </div>

          <button 
            onClick={() => {
              setSelectedConflictReason("");
              setConflictDetails("");
              setShowConflictModal(true);
            }}
            className="px-4 py-2 border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <AlertTriangle size={13} className="shrink-0" strokeWidth={2.5} />
            Flag Scope Conflict
          </button>
        </div>
      </header>

      {/* ── Split Canvas Workspace ── */}
      <div className="flex-1 flex overflow-hidden border-t border-border/20 bg-stone-50/20">
        
        {/* Left column: Operational Workspace Deliverables */}
        <div className="flex-1 overflow-y-auto p-10 md:p-12 relative">
          
          {view === "canvas" && (
            <div className="max-w-4xl space-y-8 animate-fade-up">
              
              {/* Dynamic Scope Upgrade Pending Review Banner */}
              {pendingUpgrade && (
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex gap-3">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">Scope Upgrade Pending Your Approval</h3>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        The client has requested a new functional deliverable: <strong className="font-semibold text-amber-900">"{pendingUpgrade.proposedUnit.name}"</strong>. Review the effort and pricing impact to accept and add to active deliverables.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowUpgradeDetailsModal(true)}
                    className="shrink-0 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    Review & Approve
                  </button>
                </div>
              )}

              {/* Title deliverables header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#E85239]" size={18} strokeWidth={2.5} />
                  <h2 className="font-display text-lg font-bold text-text-primary tracking-tight">Approved Functional Scope Units</h2>
                </div>
                <span className="text-[11px] font-bold bg-[#FCE1DC]/30 text-[#E85239] px-3 py-1 rounded-full uppercase tracking-wider">
                  {scope?.functionalUnits?.length || 0} Functional Units
                </span>
              </div>

              {/* Functional Units List */}
              <div className="space-y-6">
                {scope?.functionalUnits && scope.functionalUnits.length > 0 ? (
                  scope.functionalUnits.map((unit: any, idx: number) => (
                    <div key={idx} className="bg-white border border-border/60 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow relative overflow-hidden">
                      {unit.addedByClient && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                          Upgrade / Increment
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-text-primary tracking-tight">{unit.name}</h3>
                        <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">{unit.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-50 text-xs">
                        <div className="space-y-2">
                          <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Included Scope Actions</h4>
                          <ul className="space-y-1.5">
                            {unit.included?.map((item: string, i: number) => (
                              <li key={i} className="text-text-secondary flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Excluded Bounds</h4>
                          <ul className="space-y-1.5">
                            {unit.excluded?.map((item: string, i: number) => (
                              <li key={i} className="text-text-secondary flex items-start gap-1.5 leading-relaxed">
                                <span className="text-text-tertiary font-bold shrink-0">×</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border border-dashed border-border/50 rounded-2xl bg-white/40">
                    <p className="text-sm text-text-secondary">No active functional deliverables configured yet.</p>
                  </div>
                )}

                {/* Accept/Decline action banner if pending approval */}
                {project.status === "pending" && (
                  <div className="mt-12 p-8 bg-white border border-border/60 rounded-3xl shadow-[0_8px_30px_rgba(232,82,57,0.01)] flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-[#FF5B3A]" />
                    <div className="space-y-2">
                      <h3 className="font-display text-base font-bold text-text-primary tracking-tight">Review & Decide on Project Scope</h3>
                      <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
                        Please review the approved functional units, requirements, and exclusions above. Declining this project will return it to matchmaking for other experts.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                      <button
                        onClick={handleDeclineScope}
                        disabled={processing}
                        className="flex-1 px-6 py-3 border border-red-200 hover:border-red-300 bg-red-50/20 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                      >
                        Decline Scope
                      </button>
                      <button
                        onClick={handleAcceptScope}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-accent text-white hover:bg-accent-hover text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                      >
                        {processing ? "Accepting..." : "Accept Scope"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "submissions" && (
            <div className="max-w-4xl space-y-8 animate-fade-up">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <FileText className="text-[#E85239]" size={18} strokeWidth={2.5} />
                <h2 className="font-display text-lg font-bold text-text-primary tracking-tight">Milestone Objectives & Deliveries</h2>
              </div>

              <div className="space-y-6">
                {(project.milestones || []).map((m: any, idx: number) => {
                  const isActive = (project.milestones || []).slice(0, idx).every((prev: any) => prev.status === "approved") && m.status !== "approved";
                  return (
                    <div key={idx} className={cn(
                      "bg-white border rounded-2xl p-6 transition-all relative overflow-hidden",
                      isActive ? "border-accent bg-accent/[0.01] ring-1 ring-accent" : "border-border/60"
                    )}>
                      <div className="flex items-center justify-between border-b border-stone-50 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            m.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                            m.status === "submitted" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                          )}>
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-text-primary leading-tight">{m.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-text-secondary">Value: {formatCurrency(m.amount || 0)}</span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                            m.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            m.status === "submitted" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-stone-50 border-stone-200 text-stone-500"
                          )}>
                            {m.status === "approved" ? "Paid & Unlocked" :
                             m.status === "submitted" ? "Awaiting Release" : "In Progress"}
                          </span>
                        </div>
                      </div>

                      {/* Scope objectives list */}
                      {m.deliverables && m.deliverables.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-2">Scope Objectives</p>
                          <ul className="space-y-1.5 text-xs text-text-secondary">
                            {m.deliverables.map((d: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Submission details or submission form */}
                      {m.status === "pending" && isActive && (
                        <div className="mt-4 pt-4 border-t border-dashed border-border/60 space-y-4">
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Submit Objectives Work</h4>
                          <div className="grid grid-cols-1 gap-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Deliverable URL (GitHub / Figma / Drive / Build Link)</label>
                              <input
                                type="text"
                                placeholder="e.g. https://github.com/... or https://figma.com/... or https://drive.google.com/..."
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                className="w-full px-4 py-2.5 bg-stone-50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-xl outline-none font-sans text-xs text-text-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Operational Handover Notes (Credentials, Details)</label>
                              <textarea
                                rows={3}
                                placeholder="Provide access details, notes, or instructions for this build..."
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                className="w-full px-4 py-2.5 bg-stone-50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-xl outline-none font-sans text-xs text-text-primary resize-none"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mt-2">
                              <button
                                type="button"
                                disabled={submittingMilestone || !submissionUrl.trim()}
                                onClick={() => handleSubmitMilestone(idx)}
                                className="px-6 py-3 bg-[#E85239] hover:bg-[#d44127] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md justify-self-start flex items-center gap-2 active:scale-[0.98]"
                              >
                                {submittingMilestone && <Loader2 size={12} className="animate-spin" />}
                                Submit Milestone Deliverables
                              </button>

                              {m.dueDate && (() => {
                                const { formattedDate, isOverdue, remainingText } = getRemainingTimeDetails(m.dueDate);
                                return (
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border select-none bg-accent/5 text-accent border-accent/20 shrink-0 self-end sm:self-auto",
                                    isOverdue && "animate-pulse"
                                  )}>
                                    {remainingText === "Due today" ? (
                                      <Clock size={13} className="text-accent shrink-0 animate-bounce" />
                                    ) : (
                                      <Calendar size={13} className="text-accent shrink-0" />
                                    )}
                                    <span>
                                      Target: {formattedDate} ({remainingText})
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {m.status === "submitted" && (
                        <div className="mt-4 pt-4 border-t border-dashed border-border/60 bg-amber-50/20 p-4 rounded-xl border border-amber-100/60 font-sans flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-800">Submitted Deliverables (Awaiting Review & Release):</p>
                            <div className="mt-2 text-xs text-text-secondary space-y-1 leading-normal">
                              <p><strong>Deliverable Link:</strong> <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent-hover font-semibold">{m.submissionUrl}</a></p>
                              {m.submissionNotes && <p><strong>Notes:</strong> {m.submissionNotes}</p>}
                            </div>
                            <p className="text-[10px] text-amber-700 font-semibold mt-3">🔒 ESCROW SECURED: The client has been notified. Payment release of ₹{(m.amount || 0).toLocaleString()} via PhonePe is required to unlock full access on their side.</p>
                          </div>
                          {m.dueDate && (() => {
                            const { formattedDate, isOverdue, remainingText } = getRemainingTimeDetails(m.dueDate);
                            return (
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border select-none bg-accent/5 text-accent border-accent/20 shrink-0 self-end md:self-center",
                                isOverdue && "animate-pulse"
                              )}>
                                {remainingText === "Due today" ? (
                                  <Clock size={13} className="text-accent shrink-0 animate-bounce" />
                                ) : (
                                  <Calendar size={13} className="text-accent shrink-0" />
                                )}
                                <span>
                                  Target: {formattedDate} ({remainingText})
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {m.status === "approved" && (
                        <div className="mt-4 pt-4 border-t border-dashed border-border/60 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/60 font-sans flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-800">Released Deliverables & Paid Info:</p>
                            <div className="mt-2 text-xs text-text-secondary space-y-1 leading-normal">
                              <p><strong>Deliverable Link:</strong> <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent-hover font-semibold">{m.submissionUrl}</a></p>
                              {m.submissionNotes && <p><strong>Notes:</strong> {m.submissionNotes}</p>}
                              {m.payment?.paidAt && <p className="text-[10px] text-text-tertiary">Released at: {new Date(m.payment.paidAt).toLocaleString("en-IN")}</p>}
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-text-tertiary select-none shrink-0 self-end md:self-center">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span>Completed & Released</span>
                          </div>
                        </div>
                      )}

                      {m.status === "pending" && !isActive && (
                        <div className="mt-2 pt-2 flex items-center justify-between gap-4 border-t border-dashed border-border/60">
                          <div className="text-[11px] text-text-tertiary font-sans italic">
                            This objective is locked until the previous milestones are finished and approved.
                          </div>
                          {m.dueDate && (() => {
                            const { formattedDate, isOverdue, remainingText } = getRemainingTimeDetails(m.dueDate);
                            return (
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border select-none bg-accent/5 text-accent border-accent/20 shrink-0",
                                isOverdue && "animate-pulse"
                              )}>
                                {remainingText === "Due today" ? (
                                  <Clock size={13} className="text-accent shrink-0 animate-bounce" />
                                ) : (
                                  <Calendar size={13} className="text-accent shrink-0" />
                                )}
                                <span>
                                  Target: {formattedDate} ({remainingText})
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Dynamic synchronized communications stream */}
        <div className="w-[400px] shrink-0 bg-stone-50/50 border-l border-border/40 flex flex-col relative z-20">
          <div className="p-6 border-b border-stone-200/50 flex items-center gap-3 bg-white">
            <MessageSquare size={18} className="text-stone-400" />
            <h2 className="text-[14px] font-bold text-stone-900">Execution Thread</h2>
          </div>

          {/* Messages list */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="text-center py-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary bg-stone-100 px-3 py-1 rounded-full border border-border/10">
                Secure Comms Rails Active
              </span>
            </div>

            {messages.map((m) => {
              const isSystem = m.content.startsWith("⚠️") || m.content.startsWith("🚀") || m.content.startsWith("💳") || m.content.startsWith("⚡") || m.senderRole === "admin";
              return (
                <div key={m._id} className={cn("flex flex-col", m.isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm border max-w-[90%] text-[13px] leading-relaxed font-sans whitespace-pre-wrap",
                    isSystem
                      ? "bg-amber-50 border-amber-200 text-amber-900 font-medium rounded-2xl"
                      : m.isMe
                      ? "bg-[#E85239] text-white border-[#E85239] rounded-tr-sm"
                      : "bg-white text-text-secondary border-stone-100 rounded-tl-sm"
                  )}>
                    <p>{m.content}</p>
                  </div>
                  <span className="text-[11px] font-medium text-stone-400 mt-2 mx-1">
                    {isSystem ? "Executa System Alert" : m.senderDisplayName} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Typing Area */}
          <div className="p-6 bg-white border-t border-border/40">
            {project.status === "pending" ? (
              <div className="text-center py-4 px-2 text-xs text-text-tertiary italic bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                Accept project scope to unlock team chat thread.
              </div>
            ) : (
              <div className="relative">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Discuss implementation details..."
                  className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 pr-10 text-[13px] outline-none focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] resize-none h-20 text-text-primary placeholder:text-text-tertiary"
                />
                <button 
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-[#E85239] text-white flex items-center justify-center shadow-md hover:bg-[#d44127] transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Send size={12} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Scope Upgrade Details Modal ── */}
      {showUpgradeDetailsModal && pendingUpgrade && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col border border-border"
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Review Proposed Scope Increment</h2>
              <button 
                onClick={() => setShowUpgradeDetailsModal(false)} 
                className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-[#FFF7F6] border border-orange-100 rounded-2xl p-5">
                <h3 className="text-base font-bold text-text-primary tracking-tight">{pendingUpgrade.proposedUnit.name}</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{pendingUpgrade.proposedUnit.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-2.5">Included</h4>
                  <ul className="space-y-1.5">
                    {pendingUpgrade.proposedUnit.included?.map((item: string, i: number) => (
                      <li key={i} className="text-text-secondary flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-2.5">Excluded</h4>
                  <ul className="space-y-1.5">
                    {pendingUpgrade.proposedUnit.excluded?.map((item: string, i: number) => (
                      <li key={i} className="text-text-secondary flex items-start gap-1.5 leading-relaxed">
                        <span className="text-text-tertiary font-bold">×</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Effort Impact</p>
                  <p className="text-lg font-bold text-text-primary mt-1">+{pendingUpgrade.effortImpact} Points</p>
                </div>
                <div className="bg-stone-50 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Pricing Impact</p>
                  <p className="text-lg font-bold text-[#E85239] mt-1">+{formatCurrency(pendingUpgrade.expertCost || Math.round(pendingUpgrade.costImpact / 1.05))}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-stone-50/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setShowUpgradeDetailsModal(false)}
                className="px-5 py-2.5 bg-white border border-border text-text-primary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition-colors select-none"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleApproveUpgrade}
                disabled={approvingUpgrade}
                className="px-5 py-2.5 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] select-none"
              >
                {approvingUpgrade ? "Approving..." : "Approve Scope Increment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Scope Conflict Flag Modal ── */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-border"
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500 animate-pulse" size={18} strokeWidth={2.5} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Flag Scope Dispute Conflict</h2>
              </div>
              <button 
                onClick={() => setShowConflictModal(false)} 
                className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors animate-scale-in"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <p className="text-[11px] text-text-secondary leading-relaxed leading-normal">
                Select the specific cooperation issue or scope violation below. Upon submission, Executa will immediately freeze this secure execution canvas and audit the secure comms to protect your contributions under **Contributing Mode**.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Select Discrepancy Scenario *</label>
                <div className="flex flex-col gap-2 mt-1.5">
                  {[
                    { id: "optA", text: "Client is requesting additional out-of-scope work in chat without upgrade units." },
                    { id: "optB", text: "Client wants substantial revisions to completed/approved milestones." },
                    { id: "optC", text: "Client is pushing for faster delivery without adjusting compensation." },
                    { id: "optD", text: "Client is unresponsive but expects instant submission." },
                    { id: "optE", text: "Client is requesting off-platform billing or communication rails." }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedConflictReason(opt.id)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all flex items-start justify-between gap-3",
                        selectedConflictReason === opt.id 
                          ? "border-red-200 bg-red-50/40 text-red-700 shadow-sm"
                          : "border-border bg-white hover:border-stone-300 text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <span>{opt.text}</span>
                      <span className={cn(
                        "w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-black",
                        selectedConflictReason === opt.id 
                          ? "bg-red-500 border-red-500 text-white"
                          : "border-border bg-stone-50"
                      )}>
                        {selectedConflictReason === opt.id ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Explain Specific Details (Optional)</label>
                <textarea
                  rows={3}
                  value={conflictDetails}
                  onChange={(e) => setConflictDetails(e.target.value)}
                  placeholder="e.g. Client requested a payment gateway integration in chat message at 2:30 PM, but refuses to add a functional unit upgrade..."
                  className="w-full rounded-xl border border-border bg-stone-50/50 focus:bg-white px-4 py-3 text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all text-text-primary placeholder:text-text-tertiary resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-stone-50/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="px-5 py-2.5 bg-white border border-border text-text-primary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition-colors select-none"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleFlagConflict}
                disabled={!selectedConflictReason || flaggingConflict}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {flaggingConflict ? "Flagging..." : "Flag Scope Conflict"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </main>
  );
}
