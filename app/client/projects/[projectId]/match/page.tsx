"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";

function formatDomainName(domain: string) {
  if (!domain) return "";
  return domain
    .replace(/_ai/gi, " AI")
    .replace(/ai/gi, "AI")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/,/g, ", ");
}

export default function MatchFreelancerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  
  const [matchStatus, setMatchStatus] = useState<"loading" | "loaded" | "empty">("loading");
  const [matchLoadingText, setMatchLoadingText] = useState("Initiating AI match engine...");
  const [progress, setProgress] = useState(10);
  
  const [modalFreelancer, setModalFreelancer] = useState<any>(null);
  const [appointing, setAppointing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/match`);
      const d = await res.json();
      
      // Shuffle the freelancers slightly so it feels like new data
      if (d.freelancers && d.freelancers.length > 0) {
        d.freelancers = d.freelancers.sort(() => Math.random() - 0.5);
        // Slightly tweak match scores to make it seem like a fresh evaluation
        d.freelancers = d.freelancers.map((f: any) => ({
          ...f,
          fitScore: Math.min(99, Math.max(75, f.fitScore + (Math.floor(Math.random() * 7) - 3)))
        })).sort((a: any, b: any) => b.fitScore - a.fitScore);
      }
      
      setTimeout(() => {
        setData(d);
        setRefreshing(false);
      }, 1200); // 1.2s soft animation delay
    } catch (err) {
      console.error("Failed to refresh matches:", err);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (matchStatus === "loading") {
      const texts = [
        "domain experts...",
        "vetted specialists...",
        "technical alignment...",
        "availability...",
        "the perfect fit..."
      ];
      let i = 0;
      const textInterval = setInterval(() => {
        if (i < texts.length - 1) {
          i++;
          setMatchLoadingText(texts[i]);
        }
      }, 1800);

      let currentProgress = 10;
      const progressInterval = setInterval(() => {
        if (currentProgress < 95) {
          const jump = Math.floor(Math.random() * 12) + 2;
          currentProgress = Math.min(95, currentProgress + jump);
          setProgress(currentProgress);
        }
      }, 350);

      return () => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
      };
    }
  }, [matchStatus]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/match`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setTimeout(() => {
          if (d.freelancers?.length > 0) {
            setProgress(100);
            setTimeout(() => {
              setMatchStatus("loaded");
            }, 700);
          } else {
            setProgress(100);
            setTimeout(() => {
              setMatchStatus("empty");
            }, 700);
          }
        }, 4000); // Artificial hold to show animation tension
      })
      .catch((err) => {
        console.error("Match fetch failed:", err);
        setMatchStatus("empty");
      });
  }, [projectId]);

  async function handleAppoint(freelancersToAppoint: any[]) {
    setAppointing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancersToAppoint }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/client/projects/${projectId}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to appoint freelancer:", err);
    } finally {
      setAppointing(false);
    }
  }

  const { project, freelancers = [], bestMatches = [] } = data || {};
  const pricing = project?.pricing;
  const isSplitMode = project?.field === "design_development" && bestMatches.length > 1;

  // Find the exact profiles for the best matches
  const teamProfiles = bestMatches.map((bm: any) => {
    const profile = freelancers.find((f: any) => f.id === bm.freelancerId);
    return { ...bm, profile };
  }).filter((bm: any) => bm.profile);

  if (matchStatus === "loading") {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">
        {/* Header bar */}
        <div className="fixed top-0 inset-x-0 z-[110] bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
          <Link href={`/client/projects/${projectId}/scope`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Scope Confirmed</Link>
          <span className="text-sm font-medium text-text-primary">Qualified Execution Match</span>
          <Link href="/client/workspace" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Go to Dashboard →</Link>
        </div>

        <div className="flex-1 pt-14 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 border border-stone-100 shadow-sm w-full max-w-xl flex flex-col items-center justify-center"
          >
            {/* Wordmark logo pulse */}
            <div className="mb-10 flex items-center justify-center animate-pulse" style={{ animationDuration: "2.5s" }}>
              <span className="font-black text-[36px] tracking-tighter text-stone-900 leading-none">
                EXECUTA<span className="text-[#E85239]">.</span>
              </span>
            </div>

            <div className="w-full max-w-sm flex flex-col items-center">
              {/* Heading with fixed + dynamic text */}
              <div className="flex items-center gap-2 text-[22px] font-black text-stone-900 mb-8">
                <span>Finding</span>
                <div className="text-[#E85239] relative min-w-[220px] text-left h-8 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={matchLoadingText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-0 whitespace-nowrap"
                    >
                      {matchLoadingText}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Progress bar line */}
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#E85239] to-orange-400"
                  initial={{ width: "10%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <Link href={`/client/projects/${projectId}/scope`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Scope Confirmed</Link>
        <span className="text-sm font-medium text-text-primary">Qualified Execution Match</span>
        <Link href="/client/workspace" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Go to Dashboard →</Link>
      </div>

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto space-y-10">

        {matchStatus === "empty" && (
          <Card className="p-12 text-center space-y-3 border-dashed mt-12">
            <div className="w-10 h-10 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            </div>
            <h2 className="text-base font-semibold text-text-primary">Freelancer not found.</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Our database does not currently have available specialists matching this exact scope.
            </p>
          </Card>
        )}

        {matchStatus === "loaded" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-black text-stone-900">
                  {isSplitMode ? "AI‑Matched Execution Team" : "AI‑Matched Specialists"}
                </h2>
                <p className="text-[12px] text-stone-400 mt-0.5">
                  {isSplitMode ? "A dedicated designer and developer paired for your project." : "Click a specialist to review their profile and appoint them."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#FFF7F6] text-[#E85239] text-[11px] font-bold rounded-full border border-orange-100 uppercase tracking-wider">
                  {isSplitMode ? "2 Experts Found" : `${freelancers?.length || 0} Found`}
                </span>
                {!isSplitMode && (
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-[12px] font-bold rounded-lg border border-stone-200 transition-all focus:outline-none disabled:opacity-50"
                  >
                    <svg 
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={refreshing ? "animate-spin text-[#E85239]" : ""}
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Generate More
                  </button>
                )}
              </div>
            </div>

            {/* Specialist rows */}
            <div className={`p-4 space-y-3 bg-stone-50/50 transition-all duration-500 ${refreshing ? "opacity-40 blur-[1px] pointer-events-none" : "opacity-100 blur-0 pointer-events-auto"}`}>
              {isSplitMode ? (
                // Split Team View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamProfiles.map((member: any) => {
                    const f = member.profile;
                    const cutAmount = (pricing?.total || 0) * (member.pricingCut || 0.5);
                    return (
                      <div key={f.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {member.role}
                          </span>
                          <span className="text-[#E85239] text-[15px] font-black">{f.fitScore}% Match</span>
                        </div>
                        <h3 className="text-[18px] font-black text-stone-900">{f.name}</h3>
                        <p className="text-[12px] text-stone-400 font-medium mb-4">Level {f.level} &middot; {formatDomainName(f.domain)}</p>
                        <p className="text-[13px] text-stone-600 line-clamp-3 mb-4">{f.fitReason || f.bio}</p>
                        
                        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Project Split</div>
                          <div className="text-[16px] font-black text-stone-900">{formatCurrency(cutAmount)}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="col-span-1 md:col-span-2 pt-4 pb-2 flex justify-center">
                    <button
                      onClick={() => handleAppoint(teamProfiles)}
                      disabled={appointing}
                      className="h-12 px-8 bg-[#E85239] text-white text-[14px] font-black rounded-xl flex items-center gap-2 hover:bg-[#d44530] shadow-md hover:shadow-orange-200 transition-all disabled:opacity-60"
                    >
                      {appointing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {appointing ? "Appointing Team..." : "Hire Full Team & Start"}
                    </button>
                  </div>
                </div>
              ) : (
                // Single Freelancer List View
                freelancers?.map((f: any, idx: number) => (
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

                    {/* Score + button + arrow */}
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
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Still show scope summary at the bottom so they know it is fixed for everyone */}
        {matchStatus === "loaded" && data?.scope && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up mt-8">
            {[
              { 
                label: "Estimated Timeline", 
                value: `${data.scope.timeline?.estimated} ${data.scope.timeline?.unit}`, 
                sub: `≈ ${Math.round((data.scope.timeline?.estimated || 0) / 4.3 * 10) / 10} months` 
              },
              { 
                label: "Project Value", 
                value: pricing?.total ? formatCurrency(pricing.total) : "—", 
                sub: "Fixed budget for any candidate" 
              },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">{m.label}</p>
                <p className="text-[20px] font-black text-stone-900">{m.value}</p>
                {m.sub && <p className="text-[12px] text-stone-400 mt-0.5">{m.sub}</p>}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Freelancer modal overlay ── */}
      {modalFreelancer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => { if (!success) setModalFreelancer(null); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {success ? (
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
                      onClick={() => handleAppoint([{ freelancerId: modalFreelancer.id, role: "fullstack", pricingCut: 1 }])}
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
    </div>
  );
}
