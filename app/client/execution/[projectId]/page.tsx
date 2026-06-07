"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, Send, Paperclip, FileText, Plus, X, Loader2, AlertCircle, Lock, Unlock, CreditCard, ShieldAlert, AlertTriangle, Calendar, Clock } from "lucide-react";
import { cn, formatCurrency, getRemainingTimeDetails } from "@/lib/utils";

export default function ClientExecutionRoom({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Scope Upgrade State
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<"intake" | "loading" | "payment">("intake");
  const [upgradeForm, setUpgradeForm] = useState({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
  const [proposedUpgrade, setProposedUpgrade] = useState<any>(null);
  const [upgradePlatformFee, setUpgradePlatformFee] = useState(0);
  const [upgradeExpertCost, setUpgradeExpertCost] = useState(0);
  const [upgradeId, setUpgradeId] = useState<string | null>(null);
  const [initiatingUpgradePayment, setInitiatingUpgradePayment] = useState(false);
 
  // Milestone Payment States
  const [payingMilestoneIndex, setPayingMilestoneIndex] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Scope Conflict Flag Modal States
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflictReason, setSelectedConflictReason] = useState("");
  const [conflictDetails, setConflictDetails] = useState("");
  const [flaggingConflict, setFlaggingConflict] = useState(false);

  const handleFlagConflict = async () => {
    if (!selectedConflictReason || flaggingConflict) return;

    setFlaggingConflict(true);
    try {
      const reasonMap: Record<string, string> = {
        optA: "Freelancer is unresponsive or inactive.",
        optB: "Freelancer has submitted low-quality or incomplete deliverables.",
        optC: "Freelancer is requesting additional payments or communication off-platform.",
        optD: "Freelancer is missing milestone deadlines repeatedly.",
        optE: "Other freelancer quality, cooperation, or scope conflict."
      };

      const reasonText = reasonMap[selectedConflictReason] || "Other freelancer quality, cooperation, or scope conflict.";
      
      const conflictMsg = `⚠️ [Executa Support Alert]\n\nThe client has officially flagged a scope or cooperation conflict.\n\nReason: "${reasonText}"\n${conflictDetails ? `Details: "${conflictDetails}"\n` : ""}\nLIVE AUDIT ENGAGED: Executa's senior audit panel has been alerted and will inspect this secure chat thread and scope functional definitions. All project parameters, communications, and deliverables are under immediate platform review.`;

      const res = await fetch(`/api/projects/${params.projectId}/disputes`, {
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

  const handleReleasePayment = async (milestoneIndex: number) => {
    setPayingMilestoneIndex(milestoneIndex);
    try {
      const res = await fetch(`/api/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.projectId,
          milestoneIndex
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating payment.");
    } finally {
      setPayingMilestoneIndex(null);
    }
  };

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then(res => res.json())
      .then(data => {
        setProject(data.project);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`/api/projects/${params.projectId}/chat`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(console.error);
      
    fetch(`/api/projects/${params.projectId}/upgrades`)
      .then(res => res.json())
      .then(data => setUpgrades(data.upgrades || []))
      .catch(console.error);

    // Setup minor polling for live synchronized chat thread (every 6 seconds)
    const interval = setInterval(async () => {
      try {
        const chatRes = await fetch(`/api/projects/${params.projectId}/chat`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setMessages(chatData.messages || []);
        }
      } catch (e) {
        console.error("Chat sync error:", e);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [params.projectId]);

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

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
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

  const submitUpgradeRequest = async () => {
    if (!upgradeForm.whatToAdd || !upgradeForm.howItWorks) return;
    setUpgradeStep("loading");
    try {
      const res = await fetch(`/api/projects/${params.projectId}/upgrades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upgradeForm)
      });
      if (res.ok) {
        const data = await res.json();
        setProposedUpgrade(data.upgrade);
        setUpgradePlatformFee(data.upgrade.platformFee || 0);
        setUpgradeExpertCost(data.upgrade.expertCost || 0);
        setUpgradeId(data.upgrade._id);
        // Go to payment step — scope is hidden until fee is paid
        setUpgradeStep("payment");
      } else {
        setUpgradeStep("intake");
        alert("Failed to generate upgrade proposal. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUpgradeStep("intake");
    }
  };

  const handlePayUpgradeFee = async () => {
    if (!upgradeId || initiatingUpgradePayment) return;
    setInitiatingUpgradePayment(true);
    try {
      const res = await fetch(`/api/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: params.projectId, upgradeId })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment initiation failed. Please try again.");
        return;
      }

      if (data.skipPayment) {
        // Fee too small — upgrade already confirmed server-side
        setUpgrades(prev => [data.upgrade, ...prev]);
        setShowUpgradeModal(false);
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Could not obtain payment URL. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setInitiatingUpgradePayment(false);
    }
  };

  if (loading) {
    return <div className="flex-1 p-12 text-stone-400 font-bold text-[14px]">Loading execution canvas...</div>;
  }

  if (!project) {
    return <div className="flex-1 p-12 text-stone-900 font-bold text-[16px]">Execution room not found.</div>;
  }

  return (
    <div className="flex-1 w-full h-[calc(100vh-theme(spacing.20))] max-h-[calc(100vh-theme(spacing.20))] overflow-hidden flex flex-col pt-6">
      
      <div className="px-12 flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/client/execution" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[24px] font-black tracking-tight text-stone-900">{project.title}</h1>
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#E85239]">
              {project.status === "execution" || project.status === "active" || project.status === "disputed" ? "Active Execution" : "Setup Phase"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Current Phase</p>
            <p className="text-[14px] font-bold text-stone-900">
              {project.status === "execution" || project.status === "active" || project.status === "disputed" ? "Awaiting Delivery" : "Waiting to start"}
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedConflictReason("");
              setConflictDetails("");
              setShowConflictModal(true);
            }}
            className="px-4 py-2 border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <AlertTriangle size={14} className="shrink-0" strokeWidth={2.5} />
            Flag Scope Conflict
          </button>
          <button 
            onClick={() => {
              setUpgradeForm({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
              setProposedUpgrade(null);
              setUpgradeStep("intake");
              setShowUpgradeModal(true);
            }}
            className="px-4 py-2 bg-stone-900 text-white text-[13px] font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Functional Unit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border-t border-stone-200/50 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        
        {/* EXECUTION CANVAS (Left) */}
        <div className="flex-1 overflow-y-auto p-12 border-r border-stone-200/50">
          <h2 className="text-[16px] font-bold text-stone-900 mb-8 flex items-center gap-2">
            <CheckCircle2 className="text-stone-400" size={18} /> Live Deliverables
          </h2>
          
          <div className="flex flex-col gap-6">
            {upgrades.some(u => u.status === "pending_freelancer_approval") && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <div>
                  <h3 className="text-[15px] font-bold text-amber-900 mb-1">Scope Upgrade Pending</h3>
                  <p className="text-[13px] text-amber-700">Your requested scope upgrade is currently waiting for expert approval. Once accepted, the project scope and pricing will be automatically updated.</p>
                </div>
              </div>
            )}

            {project.status === "execution" || project.status === "active" || project.status === "completed" || project.status === "disputed" ? (
              <div className="space-y-6">
                {(project.milestones || []).map((m: any, idx: number) => {
                  const isSubmitted = m.status === "submitted";
                  const isApproved = m.status === "approved";
                  const isPending = m.status === "pending";

                  const isActive = (project.milestones || []).slice(0, idx).every((prev: any) => prev.status === "approved") && !isApproved;

                  return (
                    <div key={idx} className={cn(
                      "border rounded-2xl p-6 transition-all relative overflow-hidden",
                      isApproved ? "bg-emerald-50/10 border-emerald-100/60" :
                      isActive ? "bg-orange-50/5 border-orange-200/60 ring-1 ring-orange-200/40" : "bg-white border-stone-200/50"
                    )}>
                      <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                            isApproved ? "bg-emerald-100 text-emerald-700" :
                            isSubmitted ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-600"
                          )}>
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-[14px] font-black text-stone-900 leading-tight">{m.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-bold text-stone-500">Value: {formatCurrency(m.amount || 0)}</span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                            isApproved ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            isSubmitted ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-stone-50 border-stone-200 text-stone-500"
                          )}>
                            {isApproved ? "Released & Unlocked" :
                             isSubmitted ? "Awaiting Release" : "In Progress"}
                          </span>
                        </div>
                      </div>

                      {/* Objectives objectives */}
                      {m.deliverables && m.deliverables.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 font-sans">Scope Objectives</p>
                          <ul className="space-y-1 text-[12px] text-stone-600 font-sans">
                            {m.deliverables.map((d: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E85239]" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Delivery Access */}
                      {isApproved && (
                        <div className="mt-4 pt-4 border-t border-dashed border-stone-200 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/60 font-sans flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-[12px] mb-2">
                              <Unlock size={14} /> Deliverables Unlocked & Transferred
                            </div>
                            <div className="text-[12px] text-stone-600 space-y-1.5 leading-normal">
                              <p><strong>Deliverable Link:</strong> <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-[#E85239] underline hover:text-[#d44127] font-semibold">{m.submissionUrl}</a></p>
                              {m.submissionNotes && <p><strong>Notes:</strong> {m.submissionNotes}</p>}
                              {m.payment?.paidAt && <p className="text-[10px] text-stone-400">Escrow released on: {new Date(m.payment.paidAt).toLocaleString("en-IN")}</p>}
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-text-tertiary select-none shrink-0 self-end md:self-center">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span>Completed & Released</span>
                          </div>
                        </div>
                      )}

                      {isSubmitted && (
                        <div className="mt-4 pt-4 border-t border-dashed border-stone-200 font-sans">
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-stone-700 font-bold text-[13px]">
                                <Lock size={14} className="text-stone-400" /> Deliverables Secured & Masked
                              </div>
                              <p className="text-[11px] text-stone-500 max-w-md leading-relaxed">
                                The expert has submitted all milestone objectives. Release the milestone payment to decrypt and unlock access to repositories and design source files.
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
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
                              <button
                                type="button"
                                disabled={payingMilestoneIndex !== null}
                                onClick={() => handleReleasePayment(idx)}
                                className="shrink-0 px-4 py-2.5 bg-[#E85239] hover:bg-[#d44127] disabled:opacity-50 text-white text-[12px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-[0.98]"
                              >
                                {payingMilestoneIndex === idx ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CreditCard size={13} />
                                )}
                                Release Payment & Unlock
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isPending && (
                        <div className="mt-4 pt-4 border-t border-dashed border-stone-200/50 flex items-center justify-between gap-4 text-stone-400 font-sans text-[12px]">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse" />
                            <span>
                              {isActive 
                                ? "Expert is currently working on this milestone objective." 
                                : "Locked. Awaiting completion of previous milestones."}
                            </span>
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
            ) : (
              <div className="bg-stone-50 border border-stone-100 rounded-2xl p-8 text-center">
                <p className="text-[14px] font-medium text-stone-500">Project is not in active execution yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* COMMUNICATION LAYER (Right) */}
        <div className="w-[400px] flex flex-col bg-stone-50/50">
          <div className="p-6 border-b border-stone-200/50 flex items-center gap-3 bg-white">
            <MessageSquare size={18} className="text-stone-400" />
            <h2 className="text-[14px] font-bold text-stone-900">Execution Thread</h2>
          </div>
          
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                Execution Room Created
              </span>
            </div>

            {messages.map((m: any) => {
              const isSystem = m.content.startsWith("⚠️") || m.content.startsWith("🚀") || m.content.startsWith("💳") || m.content.startsWith("⚡") || m.senderRole === "admin";
              return (
                <div key={m._id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm border max-w-[90%] text-[13px] leading-relaxed whitespace-pre-wrap",
                    isSystem
                      ? "bg-amber-50 border-amber-200 text-amber-900 font-medium rounded-2xl"
                      : m.isMe 
                      ? "bg-[#E85239] text-white border-[#E85239] rounded-tr-sm" 
                      : "bg-white text-stone-700 border-stone-100 rounded-tl-sm"
                  )}>
                    <p>{m.content}</p>
                  </div>
                  <span className="text-[11px] font-medium text-stone-400 mt-2 mx-1">
                    {isSystem ? "Executa System Alert" : m.senderDisplayName} • {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-white border-t border-stone-200/50">
            <div className="relative">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Discuss the deliverables..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pr-12 text-[13px] outline-none focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] resize-none h-24 text-stone-800"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button 
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="w-8 h-8 rounded-lg bg-[#E85239] text-white flex items-center justify-center shadow-md hover:bg-[#d44127] transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-[18px] font-bold text-stone-900">Scope Upgrade Request</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {upgradeStep === "intake" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">1. What would you like to add, change, or improve?</label>
                    <p className="text-[12px] text-stone-500 mb-3">Describe the new functionality, workflow, or enhancement in business terms.</p>
                    <textarea 
                      value={upgradeForm.whatToAdd}
                      onChange={e => setUpgradeForm({...upgradeForm, whatToAdd: e.target.value})}
                      placeholder="e.g. I want users to save rides and access them later."
                      className="w-full h-24 bg-stone-50 border border-stone-200 rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">2. How should this work when completed?</label>
                    <p className="text-[12px] text-stone-500 mb-3">Walk us through the expected behavior (who uses it, actions they take, outcomes).</p>
                    <textarea 
                      value={upgradeForm.howItWorks}
                      onChange={e => setUpgradeForm({...upgradeForm, howItWorks: e.target.value})}
                      placeholder="e.g. A student clicks a save button on a ride listing, accesses saved rides from their profile..."
                      className="w-full h-24 bg-stone-50 border border-stone-200 rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">3. Why is this change needed? (Optional)</label>
                    <input 
                      value={upgradeForm.whyNeeded}
                      onChange={e => setUpgradeForm({...upgradeForm, whyNeeded: e.target.value})}
                      placeholder="e.g. User feedback requested this feature."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239]"
                    />
                  </div>
                </div>
              )}

              {upgradeStep === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#E85239] mb-4" size={32} />
                  <h3 className="text-[16px] font-bold text-stone-900">AI Analyzing Scope Impact...</h3>
                  <p className="text-[13px] text-stone-500 mt-2 text-center max-w-sm">Generating a precise functional unit and calculating the effort requirements for this upgrade.</p>
                </div>
              )}

              {upgradeStep === "payment" && proposedUpgrade && (
                <div className="flex flex-col gap-5">
                  {/* What they requested */}
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Your Request</p>
                    <p className="text-[13px] font-semibold text-stone-900 mb-1">{upgradeForm.whatToAdd}</p>
                    <p className="text-[12px] text-stone-500 leading-relaxed">{upgradeForm.howItWorks}</p>
                  </div>

                  {/* AI generated unit name preview */}
                  <div className="bg-[#FFF7F6] border border-orange-100 rounded-xl p-5 flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#E85239]/10 rounded-full flex items-center justify-center shrink-0">
                      <Plus size={14} className="text-[#E85239]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">AI-Generated Functional Unit</p>
                      <p className="text-[14px] font-bold text-stone-900">{proposedUpgrade.proposedUnit?.name}</p>
                      <p className="text-[12px] text-stone-500 mt-1 leading-relaxed line-clamp-2">{proposedUpgrade.proposedUnit?.description}</p>
                      <p className="text-[11px] text-[#E85239] font-bold mt-2">🔒 Full scope details unlocked after payment</p>
                    </div>
                  </div>

                  {/* Fee breakdown */}
                  <div className="rounded-xl border border-stone-200 overflow-hidden">
                    <div className="bg-stone-50 px-5 py-3 border-b border-stone-200">
                      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Scope Upgrade Fee Breakdown</p>
                    </div>
                    <div className="p-5 space-y-3 text-[13px]">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Expert execution cost (added to scope)</span>
                        <span className="font-semibold text-stone-800 tabular-nums">₹{upgradeExpertCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                        <span className="text-stone-600">Platform scope upgrade rate</span>
                        <span className="font-semibold text-stone-800">5%</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-stone-900">Platform upgrade fee (due now)</span>
                        <span className="font-black text-[18px] text-[#E85239] tabular-nums">₹{upgradePlatformFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-[12px] text-blue-700 leading-relaxed">
                      <strong>What happens after payment?</strong>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        <li>You pay the 5% platform fee (<strong>₹{upgradePlatformFee.toLocaleString()}</strong>) now via PhonePe.</li>
                        <li>The scope upgrade is sent to your expert for approval.</li>
                        <li>Expert execution cost (<strong>₹{upgradeExpertCost.toLocaleString()}</strong>) is added to future milestones.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-[12px] font-bold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              {upgradeStep === "intake" && (
                <button 
                  onClick={submitUpgradeRequest}
                  disabled={!upgradeForm.whatToAdd || !upgradeForm.howItWorks}
                  className="px-6 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl shadow-md hover:bg-[#d44127] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Proposal
                </button>
              )}
              {upgradeStep === "payment" && (
                <button 
                  onClick={handlePayUpgradeFee}
                  disabled={initiatingUpgradePayment}
                  className="px-6 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl shadow-md hover:bg-[#d44127] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {initiatingUpgradePayment ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard size={14} /> Pay ₹{upgradePlatformFee.toLocaleString()} via PhonePe</>
                  )}
                </button>
              )}
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
            <div className="p-6 border-b border-stone-200/50 flex justify-between items-center bg-stone-50/50 font-sans">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500 animate-pulse" size={18} strokeWidth={2.5} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">Flag Scope Dispute Conflict</h2>
              </div>
              <button 
                onClick={() => setShowConflictModal(false)} 
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5 font-sans">
              <p className="text-[11px] text-stone-500 leading-normal">
                Select the specific cooperation issue or scope violation below. Upon submission, Executa will immediately freeze this secure execution canvas and audit the secure comms to protect your project under **Contributing Mode**.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Select Discrepancy Scenario *</label>
                <div className="flex flex-col gap-2 mt-1.5">
                  {[
                    { id: "optA", text: "Freelancer is unresponsive or inactive." },
                    { id: "optB", text: "Freelancer has submitted low-quality or incomplete deliverables." },
                    { id: "optC", text: "Freelancer is requesting additional payments or communication off-platform." },
                    { id: "optD", text: "Freelancer is missing milestone deadlines repeatedly." },
                    { id: "optE", text: "Other freelancer quality, cooperation, or scope conflict." }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedConflictReason(opt.id)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all flex items-start justify-between gap-3",
                        selectedConflictReason === opt.id 
                          ? "border-red-200 bg-red-50/40 text-red-700 shadow-sm"
                          : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 hover:text-stone-900"
                      )}
                    >
                      <span>{opt.text}</span>
                      <span className={cn(
                        "w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-black",
                        selectedConflictReason === opt.id 
                          ? "bg-red-500 border-red-500 text-white"
                          : "border-stone-200 bg-stone-50"
                      )}>
                        {selectedConflictReason === opt.id ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Explain Specific Details (Optional)</label>
                <textarea
                  rows={3}
                  value={conflictDetails}
                  onChange={(e) => setConflictDetails(e.target.value)}
                  placeholder="e.g. The freelancer has not replied to chat messages for 48 hours, and missed the milestone 2 deadline..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white px-4 py-3 text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all text-stone-800 placeholder:text-stone-400 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-200/50 bg-stone-50/50 flex justify-end gap-3 shrink-0 font-sans">
              <button 
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition-colors select-none"
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
    </div>
  );
}
