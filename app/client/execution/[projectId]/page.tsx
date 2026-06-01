"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, Send, Paperclip, FileText, Plus, X, Loader2, AlertCircle } from "lucide-react";

export default function ClientExecutionRoom({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Scope Upgrade State
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<"intake" | "loading" | "review">("intake");
  const [upgradeForm, setUpgradeForm] = useState({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
  const [proposedUpgrade, setProposedUpgrade] = useState<any>(null);

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
  }, [params.projectId]);

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
        setUpgradeStep("review");
      } else {
        setUpgradeStep("intake");
        alert("Failed to generate upgrade proposal. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUpgradeStep("intake");
    }
  };

  const confirmUpgrade = async () => {
    if (!proposedUpgrade) return;
    try {
      const res = await fetch(`/api/projects/${params.projectId}/upgrades/${proposedUpgrade._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "client_approve" })
      });
      if (res.ok) {
        const data = await res.json();
        setUpgrades(prev => [data.upgrade, ...prev]);
        setShowUpgradeModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex-1 p-12 text-stone-400 font-bold text-[14px]">Loading execution canvas...</div>;
  }

  if (!project) {
    return <div className="flex-1 p-12 text-stone-900 font-bold text-[16px]">Execution room not found.</div>;
  }

  return (
    <div className="flex-1 w-full h-[calc(100vh-theme(spacing.20))] flex flex-col pt-6">
      
      <div className="px-12 flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/client/execution" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[24px] font-black tracking-tight text-stone-900">{project.title}</h1>
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#E85239]">
              {project.status === "execution" || project.status === "active" ? "Active Execution" : "Setup Phase"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Current Phase</p>
            <p className="text-[14px] font-bold text-stone-900">
              {project.status === "execution" || project.status === "active" ? "Awaiting Delivery" : "Waiting to start"}
            </p>
          </div>
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

            {project.status === "execution" || project.status === "active" ? (
              <div className="bg-[#FFF7F6] border border-orange-100 rounded-2xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[18px] font-bold text-stone-900 mb-2">Initial Milestone Setup</h3>
                    <p className="text-[14px] text-stone-600 max-w-xl">The execution room is ready. Your expert team will upload deliverables here matching the approved scope constraints.</p>
                  </div>
                  <Link 
                    href={`/client/projects/${params.projectId}/scope`} 
                    target="_blank"
                    className="px-4 py-2.5 bg-white border border-orange-200 text-[#E85239] text-[13px] font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(232,82,57,0.15)] transition-all flex items-center gap-2 shrink-0"
                  >
                    <FileText size={16} /> View Approved Scope
                  </Link>
                </div>
                
                <div className="flex items-center gap-3 text-stone-400">
                  <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />
                  <span className="text-[13px] font-medium">Pending upload from execution team</span>
                </div>
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
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                Execution Room Created
              </span>
            </div>

            {messages.map((m: any) => (
              <div key={m._id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl shadow-sm border max-w-[90%] ${
                  m.isMe 
                    ? 'bg-[#E85239] text-white border-[#E85239] rounded-tr-sm' 
                    : 'bg-white text-stone-700 border-stone-100 rounded-tl-sm'
                }`}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="text-[11px] font-medium text-stone-400 mt-2 mx-1">
                  {m.senderDisplayName} • {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
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

              {upgradeStep === "review" && proposedUpgrade && (
                <div className="flex flex-col gap-6">
                  {/* Functional Unit matching Scope Creation style */}
                  <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm text-left">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[14px] font-bold text-stone-900">{proposedUpgrade.proposedUnit.name}</h3>
                        <p className="text-[12px] text-stone-500 mt-1">{proposedUpgrade.proposedUnit.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                      <div>
                        <p className="text-[12px] font-bold text-stone-900 mb-2">Included</p>
                        <ul className="space-y-1">
                          {proposedUpgrade.proposedUnit.included?.map((item: string, idx: number) => (
                            <li key={idx} className="text-[12px] text-stone-600 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">✓</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-stone-900 mb-2">Excluded</p>
                        <ul className="space-y-1">
                          {proposedUpgrade.proposedUnit.excluded?.map((item: string, idx: number) => (
                            <li key={idx} className="text-[12px] text-stone-600 flex items-start gap-1.5">
                              <span className="text-stone-400 mt-0.5">×</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-[#FFF7F6] border border-orange-100 rounded-xl p-6">
                    <h4 className="text-[14px] font-bold text-stone-900 mb-4">Pricing Impact</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[13px] text-stone-600">
                        <span>Current Active Scope Price</span>
                        <span className="font-medium">₹{project.pricing?.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] font-bold text-[#E85239]">
                        <span>+ Added Functional Unit</span>
                        <span>₹{proposedUpgrade.costImpact.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[15px] font-black text-stone-900 pt-3 border-t border-orange-200">
                        <span>New Total Price</span>
                        <span>₹{(project.pricing?.total + proposedUpgrade.costImpact).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex justify-end">
              {upgradeStep === "intake" && (
                <button 
                  onClick={submitUpgradeRequest}
                  disabled={!upgradeForm.whatToAdd || !upgradeForm.howItWorks}
                  className="px-6 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl shadow-md hover:bg-[#d44127] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Proposal
                </button>
              )}
              {upgradeStep === "review" && (
                <button 
                  onClick={confirmUpgrade}
                  className="px-6 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl shadow-md hover:bg-[#d44127] transition-colors"
                >
                  Confirm & Send to Expert
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
