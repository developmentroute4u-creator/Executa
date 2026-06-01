"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Clock, User, CheckCircle2, Loader2,
  Sparkles, ChevronRight, Shield, Zap, AlertCircle
} from "lucide-react";

function formatCurrency(val: number) {
  if (!val) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
}

function formatDomainName(domain: string) {
  if (!domain) return "";
  return domain
    .replace(/_ai/gi, " AI")
    .replace(/ai/gi, "AI")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/,/g, ", ");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    scoping: { label: "Scoping", color: "bg-amber-50 text-amber-600 border-amber-100" },
    scope_review: { label: "Scope Review", color: "bg-blue-50 text-blue-600 border-blue-100" },
    matching: { label: "Finding Match", color: "bg-[#FFF7F6] text-[#E85239] border-orange-100" },
    pending: { label: "Pending", color: "bg-amber-50 text-amber-600 border-amber-100" },
    active: { label: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    execution: { label: "In Execution", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    completed: { label: "Completed", color: "bg-stone-50 text-stone-600 border-stone-200" },
    archived: { label: "Archived", color: "bg-stone-50 text-stone-400 border-stone-100" },
  };
  const s = map[status] || { label: status.replace("_", " "), color: "bg-stone-50 text-stone-500 border-stone-200" };
  return (
    <span className={`px-3 py-1 text-[12px] font-bold rounded-full border uppercase tracking-wider ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function ProjectDetailView({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  // Inline matching state variables
  const [matchStatus, setMatchStatus] = useState<"idle" | "loading" | "loaded" | "empty">("idle");
  const [matchData, setMatchData] = useState<any>(null);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null);
  const [modalFreelancer, setModalFreelancer] = useState<any>(null);
  const [appointing, setAppointing] = useState(false);
  const [appointSuccess, setAppointSuccess] = useState(false);
  const [matchLoadingText, setMatchLoadingText] = useState("Initiating AI match engine...");

  const triggerMatchLoad = () => {
    setMatchStatus("loading");
    setMatchLoadingText("Initiating AI match engine...");
    
    fetch(`/api/projects/${params.projectId}/match`)
      .then(res => {
        if (!res.ok) throw new Error("Match fetch failed");
        return res.json();
      })
      .then(d => {
        setMatchData(d);
        if (d.freelancers && d.freelancers.length > 0) {
          setSelectedFreelancerId(d.bestMatchId || d.freelancers[0].id);
          setTimeout(() => {
            setMatchStatus("loaded");
          }, 2500);
        } else {
          setTimeout(() => {
            setMatchStatus("empty");
          }, 2000);
        }
      })
      .catch(err => {
        console.error("Failed to load matches:", err);
        setMatchStatus("empty");
      });
  };

  useEffect(() => {
    if (matchStatus === "loading") {
      const texts = [
        "Initiating AI match engine...",
        "Scanning vetted specialist database...",
        "Analyzing domain capability alignment...",
        "Calculating contract compliance...",
        "Finalizing recommendations..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < texts.length - 1) {
          i++;
          setMatchLoadingText(texts[i]);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [matchStatus]);

  async function handleAppoint(freelancerId: string) {
    setAppointing(true);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId }),
      });
      if (res.ok) {
        setAppointSuccess(true);
        setTimeout(() => {
          setMatchStatus("idle");
          setAppointSuccess(false);
          reload();
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to appoint freelancer:", err);
    } finally {
      setAppointing(false);
    }
  }

  const reload = () => {
    fetch(`/api/projects/${params.projectId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [params.projectId]);

  async function confirmScope() {
    setConfirming(true);
    const res = await fetch(`/api/projects/${params.projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "matching" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData(updated);
      triggerMatchLoad();
    }
    setConfirming(false);
  }

  if (loading) {
    return (
      <div className="flex-1 p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={28} />
      </div>
    );
  }

  if (!data?.project) {
    return <div className="flex-1 p-12 text-stone-900 font-bold text-[16px]">Project not found.</div>;
  }

  const { project, scope } = data;
  const status = project.status;
  const pricing = project.pricing;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-8 md:p-12">
      {/* Back */}
      <Link
        href="/client/projects"
        className="inline-flex items-center gap-2 text-[13px] font-bold text-stone-400 hover:text-stone-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-col md:flex-row md:items-end gap-4 justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge status={status} />
            <span className="text-[12px] font-medium text-stone-400">
              {project.field === "development" ? "Development" : "Design"} Project
            </span>
          </div>
          <h1 className="text-[36px] font-black tracking-tight text-stone-900 leading-[1.1]">
            {project.title}
          </h1>
        </div>

        {/* Action button based on status */}
        {status === "scope_review" && (
          <button
            onClick={confirmScope}
            disabled={confirming}
            className="h-12 px-6 bg-stone-900 text-white text-[14px] font-bold rounded-xl flex items-center gap-2 hover:bg-[#E85239] hover:shadow-[0_8px_20px_rgba(232,82,57,0.25)] transition-all disabled:opacity-60"
          >
            {confirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {confirming ? "Proceeding..." : "Confirm Scope & Find Freelancer"}
          </button>
        )}
        {(status === "matching") && matchStatus === "loaded" && (
          <button
            onClick={triggerMatchLoad}
            className="h-12 px-6 bg-[#E85239] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_8px_20px_rgba(232,82,57,0.3)] hover:-translate-y-0.5 transition-all font-bold"
          >
            <Sparkles size={16} /> Refresh Match
          </button>
        )}
        {(status === "execution" || status === "active") && (
          <Link
            href={`/client/execution/${params.projectId}`}
            className="h-12 px-6 bg-[#E85239] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_8px_20px_rgba(232,82,57,0.3)] hover:-translate-y-0.5 transition-all"
          >
            <Zap size={16} /> Enter Execution Room
          </Link>
        )}
      </motion.div>

      {/* ============ SCOPE REVIEW STATE ============ */}
      {status === "scope_review" && scope && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Alert banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-amber-700">Your AI-generated scope is ready for review</p>
              <p className="text-[12px] text-amber-600 mt-0.5">Review all functional units below, then confirm to proceed to freelancer matching.</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Estimated Timeline", value: `${scope.timeline?.estimated} ${scope.timeline?.unit}`, sub: `≈ ${Math.round((scope.timeline?.estimated || 0) / 4.3 * 10) / 10} months` },
              { label: "Project Value", value: pricing?.total ? formatCurrency(pricing.total) : "Calculating…", sub: pricing?.ratePerPoint ? `${formatCurrency(pricing.ratePerPoint)}/pt` : "" },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">{m.label}</p>
                <p className="text-[22px] font-black text-stone-900">{m.value}</p>
                {m.sub && <p className="text-[12px] text-stone-400 mt-0.5">{m.sub}</p>}
              </div>
            ))}
          </div>

          {/* Project Summary */}
          {scope.projectSummary?.overview && (
            <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-stone-400" />
                <h2 className="text-[14px] font-bold text-stone-900 uppercase tracking-wider">Project Summary</h2>
              </div>
              <p className="text-[15px] font-medium text-stone-600 leading-relaxed">
                {scope.projectSummary.overview}
              </p>
              {scope.projectSummary.primaryUsers?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {scope.projectSummary.primaryUsers.map((u: string) => (
                    <span key={u} className="px-3 py-1 bg-stone-50 text-stone-600 text-[12px] font-bold rounded-full border border-stone-100">
                      {u}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scope Boundaries */}
          {(scope.overallIncluded?.length > 0 || scope.overallExcluded?.length > 0) && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Scope
                </h3>
                <ul className="space-y-2.5">
                  {scope.overallIncluded?.map((item: string) => (
                    <li key={item} className="text-[13px] text-stone-600 flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-300" /> Out of Scope
                </h3>
                <ul className="space-y-2.5">
                  {scope.overallExcluded?.map((item: string) => (
                    <li key={item} className="text-[13px] text-stone-500 flex items-start gap-2.5">
                      <span className="text-stone-300 font-bold mt-0.5">×</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Functional Units */}
          <div>
            <h2 className="text-[16px] font-black text-stone-900 mb-5">Functional Units</h2>
            <div className="space-y-4">
              {scope.functionalUnits?.map((unit: any) => (
                <div key={unit.id} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-stone-900">{unit.name}</h3>
                      <p className="text-[13px] text-stone-500 mt-1">{unit.description}</p>
                    </div>
                    <div className="shrink-0 ml-4 text-right">
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Effort</div>
                      <div className="text-[18px] font-black text-[#E85239]">{unit.unitScore}pts</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 pt-4 border-t border-stone-100">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">Included</p>
                      <ul className="space-y-1.5">
                        {unit.included?.map((i: string) => (
                          <li key={i} className="text-[12px] text-stone-600 flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5">✓</span>{i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">Excluded</p>
                      <ul className="space-y-1.5">
                        {unit.excluded?.map((e: string) => (
                          <li key={e} className="text-[12px] text-stone-500 flex items-start gap-1.5">
                            <span className="text-stone-300 mt-0.5">×</span>{e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          {scope.expectedDeliverables?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h2 className="text-[14px] font-bold text-stone-900 uppercase tracking-wider mb-4">Expected Deliverables</h2>
              <div className="flex flex-wrap gap-2">
                {scope.expectedDeliverables.map((d: string) => (
                  <span key={d} className="px-3 py-1.5 bg-stone-50 text-stone-600 text-[12px] font-bold rounded-lg border border-stone-100">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Capabilities */}
          {scope.requiredCapabilities?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h2 className="text-[14px] font-bold text-stone-900 uppercase tracking-wider mb-4">Required Capabilities</h2>
              <div className="flex flex-wrap gap-2">
                {scope.requiredCapabilities.map((c: string) => (
                  <span key={c} className="px-3 py-1.5 bg-[#FFF0EE] text-[#E85239] text-[12px] font-bold rounded-lg border border-[#E85239]/15">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {pricing && (
            <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
              <h2 className="text-[16px] font-black text-stone-900 mb-6">Pricing Breakdown</h2>
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-stone-50 border border-stone-100">
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Timeline</p>
                  <p className="text-[15px] font-black text-stone-900 mt-1">{scope.timeline?.estimated} {scope.timeline?.unit}</p>
                </div>
                <div className="text-center border-x border-stone-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Effort</p>
                  <p className="text-[15px] font-black text-stone-900 mt-1">{scope.totalEffortScore} pts</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Rate</p>
                  <p className="text-[15px] font-black text-stone-900 mt-1">{formatCurrency(pricing.ratePerPoint)}/pt</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Freelancer Price", value: pricing.freelancerPrice },
                  { label: "Scope Fee", value: pricing.scopeFee },
                  { label: "Accountability Fee", value: pricing.accountabilityFee },
                  { label: "Execution Fee (5%)", value: pricing.executionFee },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-[14px]">
                    <span className="text-stone-500 font-medium">{row.label}</span>
                    <span className="font-bold text-stone-900">{formatCurrency(row.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[16px] pt-4 mt-2 border-t border-stone-100">
                  <span className="font-black text-stone-900">Total</span>
                  <span className="font-black text-[#E85239]">{formatCurrency(pricing.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm CTA */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/client/projects" className="h-12 px-6 border border-stone-200 text-stone-600 text-[14px] font-bold rounded-xl flex items-center hover:border-stone-300 transition-all">
              Back to Projects
            </Link>
            <button
              onClick={confirmScope}
              disabled={confirming}
              className="h-12 px-8 bg-stone-900 text-white text-[14px] font-bold rounded-xl flex items-center gap-2 hover:bg-[#E85239] hover:shadow-[0_8px_20px_rgba(232,82,57,0.25)] transition-all disabled:opacity-60"
            >
              {confirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {confirming ? "Proceeding..." : "Confirm Scope & Find Freelancer"}
            </button>
          </div>
        </motion.div>
      )}

      {/* ============ MATCHING STATE ============ */}
      {status === "matching" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {matchStatus === "idle" && (
            <div className="bg-white rounded-2xl p-10 border border-stone-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF7F6] border-2 border-orange-100 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="text-[#E85239] animate-pulse" size={28} />
              </div>
              <h2 className="text-[22px] font-black text-stone-900 mb-2">Finding Your Perfect Match</h2>
              <p className="text-[14px] text-stone-500 max-w-md mx-auto">
                Our AI governance layer is evaluating verified, vetted specialists against your confirmed project scope.
              </p>
              <button
                onClick={triggerMatchLoad}
                className="mt-8 inline-flex items-center gap-2 h-12 px-8 bg-[#E85239] text-white text-[14px] font-bold rounded-xl hover:shadow-[0_8px_20px_rgba(232,82,57,0.3)] hover:-translate-y-0.5 transition-all font-bold"
              >
                <Sparkles size={16} /> View Matched Freelancers
              </button>
            </div>
          )}

          {matchStatus === "loading" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm overflow-hidden relative min-h-[350px] flex flex-col items-center justify-center"
            >
              {/* Background pulses */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[300px] h-[300px] bg-gradient-to-br from-[#E85239] to-orange-200 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: "2s" }} />
              </div>
              
              <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-stone-100 border-t-[#E85239] border-l-[#E85239]/50 border-r-orange-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#FFF7F6] rounded-full flex items-center justify-center shadow-inner border border-orange-50">
                      <Sparkles className="text-[#E85239] animate-pulse" size={28} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-[22px] font-black text-stone-900 mb-4 text-center">AI Match Engine Running</h3>
                
                <div className="w-full space-y-4">
                  {/* Dynamic text pill */}
                  <div className="flex items-center justify-center text-[13px] font-bold text-[#E85239] bg-[#FFF7F6] px-5 py-2.5 rounded-full border border-orange-100 shadow-sm mx-auto">
                    <Loader2 className="animate-spin mr-2" size={14} />
                    <span className="truncate">{matchLoadingText}</span>
                  </div>
                  
                  {/* Progress bar line */}
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#E85239] to-orange-400"
                      initial={{ width: "10%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {matchStatus === "empty" && (
            <div className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-[#E85239] rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-[18px] font-bold text-stone-900">No Matched Freelancers Found</h2>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                Our database does not currently have available specialists matching this exact scope.
              </p>
              <button
                onClick={triggerMatchLoad}
                className="mt-4 px-6 h-10 border border-stone-200 hover:border-stone-300 rounded-xl text-stone-600 text-xs font-bold transition-all"
              >
                Retry Search
              </button>
            </div>
          )}

          {matchStatus === "loaded" && matchData && (
            <>
              {/* ── Freelancer modal overlay ── */}
              {modalFreelancer && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                  onClick={() => setModalFreelancer(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.22 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    {appointSuccess ? (
                      <div className="p-16 text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                          <CheckCircle2 className="text-white" size={30} />
                        </div>
                        <div>
                          <h2 className="text-[22px] font-black text-stone-900">Expert Appointed!</h2>
                          <p className="text-[13px] text-stone-500 mt-2">Your execution contract is live. Setting up your workspace...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Modal header */}
                        <div className="p-6 border-b border-stone-100">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="text-[10px] font-black text-[#E85239] uppercase tracking-widest mb-1">AI Recommendation</div>
                              <h2 className="text-[22px] font-black text-stone-900 leading-tight">{modalFreelancer.name}</h2>
                              <p className="text-[12px] text-stone-400 font-medium mt-1">
                                {formatDomainName(modalFreelancer.domain)} Specialist &middot; Level {modalFreelancer.level} &middot; Score {modalFreelancer.testScore}/100
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[36px] font-black text-[#E85239] leading-none">{modalFreelancer.fitScore}%</div>
                              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">AI Match</div>
                            </div>
                          </div>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
                          <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">About</p>
                            <p className="text-[13px] text-stone-600 leading-relaxed">{modalFreelancer.bio}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {modalFreelancer.specializations?.map((s: string) => (
                                <span key={s} className="px-2.5 py-1 bg-stone-50 text-stone-600 text-[11px] font-bold rounded-lg border border-stone-100">{s}</span>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gradient-to-br from-[#FFF7F6] to-orange-50/30 border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#E85239] animate-pulse" />
                              <span className="text-[10px] font-black text-[#E85239] uppercase tracking-widest">Why this expert?</span>
                            </div>
                            <p className="text-[12px] text-stone-600 leading-relaxed">{modalFreelancer.fitReason}</p>
                          </div>
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-5 border-t border-stone-100 flex items-center justify-between gap-4 bg-stone-50/50">
                          <div>
                            <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Project Value</div>
                            <div className="text-[20px] font-black text-stone-900 mt-0.5">{pricing?.total ? formatCurrency(pricing.total) : "—"}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setModalFreelancer(null)}
                              className="h-11 px-5 border border-stone-200 rounded-xl text-stone-600 text-[13px] font-bold hover:border-stone-300 transition-all"
                            >
                              View Others
                            </button>
                            <button
                              onClick={() => handleAppoint(modalFreelancer.id)}
                              disabled={appointing}
                              className="h-11 px-6 bg-[#E85239] text-white text-[13px] font-black rounded-xl flex items-center gap-2 hover:bg-[#d44530] hover:shadow-[0_6px_20px_rgba(232,82,57,0.35)] transition-all disabled:opacity-60"
                            >
                              {appointing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                              {appointing ? "Please wait…" : "Hire Now"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              )}

              {/* ── Single card with all 5 specialists ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-[16px] font-black text-stone-900">AI‑Matched Specialists</h2>
                    <p className="text-[12px] text-stone-400 mt-0.5">Click a specialist to review their profile and appoint them.</p>
                  </div>
                  <span className="px-3 py-1 bg-[#FFF7F6] text-[#E85239] text-[11px] font-bold rounded-full border border-orange-100 uppercase tracking-wider">
                    {matchData.freelancers?.length} Found
                  </span>
                </div>

                {/* Specialist rows */}
                <div className="p-4 space-y-3 bg-stone-50/50">
                  {matchData.freelancers?.map((f: any, idx: number) => (
                    <div
                      key={f.id}
                      onClick={() => setModalFreelancer(f)}
                      className="group flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50 cursor-pointer transition-all duration-200"
                    >
                      {/* Rank badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0 transition-colors ${
                        idx === 0
                          ? "bg-[#FFF7F6] text-[#E85239] border-2 border-orange-200 shadow-sm"
                          : "bg-stone-50 text-stone-400 border border-stone-100 group-hover:border-stone-200 group-hover:text-stone-500"
                      }`}>
                        #{idx + 1}
                      </div>

                      {/* Name + domain */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-stone-900 group-hover:text-[#E85239] transition-colors">{f.name}</div>
                        <div className="text-[12px] text-stone-400 font-medium mt-0.5">
                          {formatDomainName(f.domain)} &middot; Level {f.level}
                        </div>
                      </div>

                      {/* Short bio preview */}
                      <div className="hidden lg:block flex-1 min-w-0 pr-4">
                        <p className="text-[12px] text-stone-400 line-clamp-1 group-hover:text-stone-500 transition-colors">{f.bio}</p>
                      </div>

                      {/* Score + arrow */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className={`text-[16px] font-black leading-none ${
                            f.fitScore >= 90 ? "text-emerald-600" : "text-[#E85239]"
                          }`}>
                            {f.fitScore}%
                          </div>
                          <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-1">Match</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-[#FFF7F6] transition-colors">
                          <ChevronRight size={16} className="text-stone-300 group-hover:text-[#E85239] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Still show scope summary */}
          {scope && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Estimated Timeline", value: `${scope.timeline?.estimated} ${scope.timeline?.unit}`, sub: `≈ ${Math.round((scope.timeline?.estimated || 0) / 4.3 * 10) / 10} months` },
                { label: "Project Value", value: pricing?.total ? formatCurrency(pricing.total) : "—", sub: "Fully funded in escrow" },
              ].map(m => (
                <div key={m.label} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">{m.label}</p>
                  <p className="text-[20px] font-black text-stone-900">{m.value}</p>
                  {m.sub && <p className="text-[12px] text-stone-400 mt-0.5">{m.sub}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ============ ACTIVE / EXECUTION STATE ============ */}
      {(status === "execution" || status === "active" || status === "pending") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Execution active banner */}
          {status === "pending" ? (
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-amber-700">Project is pending freelancer review</p>
                <p className="text-[12px] text-amber-600 mt-0.5">
                  The matched execution team is reviewing your scope and will accept shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-emerald-700">Project is actively in execution</p>
                <p className="text-[12px] text-emerald-600 mt-0.5">
                  {project.freelancerName
                    ? `${project.freelancerName} is working on your project`
                    : "A verified expert is executing your scope"}
                </p>
              </div>
              <Link
                href={`/client/execution/${params.projectId}`}
                className="h-10 px-5 bg-emerald-600 text-white text-[13px] font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all"
              >
                <Zap size={14} /> Open Workspace
              </Link>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Scope summary */}
              {scope && (
                <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
                  <h2 className="text-[15px] font-bold text-stone-900 mb-5 flex items-center gap-2">
                    <FileText size={16} className="text-stone-400" /> Project Scope
                  </h2>
                  <p className="text-[14px] text-stone-600 leading-relaxed mb-5">
                    {scope.projectSummary?.overview || project.projectDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Timeline</p>
                      <p className="text-[16px] font-black text-stone-900">{scope.timeline?.estimated} {scope.timeline?.unit}</p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Effort Score</p>
                      <p className="text-[16px] font-black text-stone-900">{scope.totalEffortScore} pts</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/client/projects/${params.projectId}/scope`}
                      className="text-[13px] font-bold text-[#E85239] hover:underline flex items-center gap-1"
                    >
                      View full scope <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Pricing */}
              {pricing && (
                <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
                  <h2 className="text-[15px] font-bold text-stone-900 mb-5 flex items-center gap-2">
                    <Shield size={16} className="text-stone-400" /> Pricing & Value
                  </h2>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Total Project Value</p>
                      <p className="text-[28px] font-black text-stone-900">{formatCurrency(pricing.total)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Required Level</p>
                      <p className="text-[28px] font-black text-[#E85239]">Lvl {project.requiredLevel || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Freelancer card */}
            <div>
              <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
                <h2 className="text-[14px] font-bold text-stone-900 mb-5 flex items-center gap-2">
                  <User size={15} className="text-stone-400" /> {project.assignedFreelancers?.length > 1 ? "Execution Team" : "Assigned Expert"}
                </h2>
                {project.assignedFreelancers?.length > 0 ? (
                  <div className="space-y-6">
                    {project.assignedFreelancers.map((f: any, idx: number) => (
                      <div key={idx} className="border-b border-stone-100 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-lg uppercase">
                            {f.name?.charAt(0) || "E"}
                          </div>
                          <div>
                            <h3 className="text-[16px] font-bold text-stone-900">{f.name || "Verified Expert"}</h3>
                            <p className="text-[11px] font-bold text-[#E85239] uppercase tracking-wider">{f.role} Specialist</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${
                          f.accepted ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                        }`}>
                          {f.accepted ? (
                            <>
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-[12px] font-bold text-emerald-600">Scope Accepted</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-amber-500" />
                              <span className="text-[12px] font-bold text-amber-600">Pending Review</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : project.freelancerId ? (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-xl uppercase">
                        {project.freelancerName?.charAt(0) || "F"}
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-stone-900">{project.freelancerName || "Verified Expert"}</h3>
                        <p className="text-[12px] font-bold text-[#E85239] uppercase tracking-wider">Level {project.requiredLevel} Specialist</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${
                      project.status === "pending" ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                    }`}>
                      {project.status === "pending" ? (
                        <>
                          <Clock size={14} className="text-amber-500" />
                          <span className="text-[12px] font-bold text-amber-600">Pending Review</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-[12px] font-bold text-emerald-600">Scope Accepted & Executing</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-300 mx-auto mb-3">
                      <User size={20} />
                    </div>
                    <p className="text-[14px] font-bold text-stone-500">Awaiting Assignment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============ COMPLETED STATE ============ */}
      {status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-10 border border-stone-100 shadow-sm text-center"
        >
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="text-stone-400" size={28} />
          </div>
          <h2 className="text-[22px] font-black text-stone-900 mb-2">Project Completed</h2>
          <p className="text-[14px] text-stone-500">
            This project has been successfully delivered. All governed outcomes were met.
          </p>
        </motion.div>
      )}
    </div>
  );
}
