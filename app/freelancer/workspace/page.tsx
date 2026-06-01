"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Activity, Clock, Zap, IndianRupee, ArrowRight, AlertTriangle, CheckCircle2, X } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function WorkspaceEnvironment() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [pendingUpgrades, setPendingUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewUpgrade, setReviewUpgrade] = useState<any>(null);

  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setAllProjects(d.activeProjects || []);
        setPendingUpgrades(d.pendingUpgrades || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApproveUpgrade = async (upgradeId: string, projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/upgrades/${upgradeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "freelancer_approve" })
      });
      if (res.ok) {
        setPendingUpgrades(prev => prev.filter(u => u._id !== upgradeId));
        setReviewUpgrade(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeWorkspace = allProjects.filter(
    (p) => p.status === "active"
  );
  const pendingInvitations = allProjects.filter(
    (p) => p.status === "pending"
  );

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen font-sans selection:bg-accent/10 selection:text-accent pl-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 pt-24 md:pt-32">

        {/* ── Unified Welcome Header ── */}
        <header className="mb-10 border-b border-border/40 pb-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 block">
              {getFormattedDate()}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              {getGreeting()}, <span className="text-accent">{user?.name || "Professional"}</span>
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Here is an overview of your active projects and earnings.
            </p>
          </motion.div>
        </header>

        {/* ── Soft Panels Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Active Projects */}
          <motion.div 
            className="lg:col-span-8 flex flex-col gap-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >

            {pendingUpgrades.length > 0 && (
              <div className="bg-[#FFF7F6] border border-orange-200 rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-orange-500" size={24} />
                    <h2 className="font-display text-xl font-semibold text-text-primary tracking-tight">Scope Upgrades Pending</h2>
                  </div>
                  <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider">
                    Action Required
                  </span>
                </div>
                <div className="space-y-4">
                  {pendingUpgrades.map(upgrade => {
                    const relatedProject = allProjects.find(p => p._id === upgrade.projectId);
                    return (
                      <div key={upgrade._id} className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">{relatedProject?.title}</p>
                          <h4 className="text-base font-bold text-text-primary">{upgrade.proposedUnit.name}</h4>
                          <p className="text-sm text-text-secondary mt-1 max-w-xl line-clamp-1">{upgrade.proposedUnit.description}</p>
                        </div>
                        <button 
                          onClick={() => setReviewUpgrade({ upgrade, project: relatedProject })}
                          className="shrink-0 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          Review & Approve
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-xl border border-border rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)] relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                    <Activity size={18} strokeWidth={2} />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-text-primary tracking-tight">Active Projects</h2>
                </div>
                <span className="text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">
                  {activeWorkspace.length} {activeWorkspace.length === 1 ? "Project" : "Projects"}
                </span>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <div className="space-y-6 animate-pulse opacity-20">
                    <div className="h-12 bg-text-primary w-2/3 rounded-lg" />
                    <div className="h-12 bg-text-primary w-1/2 rounded-lg" />
                  </div>
                ) : activeWorkspace.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border/50 rounded-2xl bg-white/30">
                    <Zap className="mx-auto text-text-tertiary mb-4" size={24} strokeWidth={1.5} />
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      System idle. No active projects.
                    </p>
                  </div>
                ) : (
                  activeWorkspace.map((p) => (
                    <ActiveExecutionRow key={p._id} project={p} />
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Quick Stats & Actions */}
          <motion.div 
            className="lg:col-span-4 flex flex-col gap-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Action Required Panel */}
            <div className="bg-white/80 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(232,82,57,0.01)] flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-accent/20">
              <div>
                <div className="flex items-center gap-3 border-b border-border/30 pb-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                    <Clock size={16} strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-text-primary tracking-tight">Action Required</h3>
                </div>
                
                <div className="my-2 overflow-hidden">
                  <p className="font-display text-2xl md:text-3xl tracking-tight font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                    {pendingInvitations.length} {pendingInvitations.length === 1 ? "Pending Project" : "Pending Projects"}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {pendingInvitations.length === 0 
                      ? "All project requests reviewed." 
                      : "New requests await your review."}
                  </p>
                </div>
              </div>
              
              <Link href="/freelancer/projects" className="text-xs font-semibold text-accent hover:text-accent-hover transition-all duration-200 flex items-center gap-1.5 self-start bg-accent/5 hover:bg-accent/10 px-3.5 py-2 rounded-xl border border-accent/10 mt-4">
                View Projects <ArrowRight size={12} />
              </Link>
            </div>

            {/* Cleared Revenue Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(232,82,57,0.01)] flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-accent/20">
              <div>
                <div className="flex items-center gap-3 border-b border-border/30 pb-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                    <IndianRupee size={16} strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-text-primary tracking-tight">Cleared Revenue</h3>
                </div>
                
                <div className="my-2 overflow-hidden">
                  <p className="font-display text-2xl md:text-3xl tracking-tight font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(profile?.totalEarnings || 0)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    All earnings successfully processed.
                  </p>
                </div>
              </div>
              
              <Link href="/freelancer/earnings" className="text-xs font-semibold text-accent hover:text-accent-hover transition-all duration-200 flex items-center gap-1.5 self-start bg-accent/5 hover:bg-accent/10 px-3.5 py-2 rounded-xl border border-accent/10 mt-4">
                View Earnings <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>

      {reviewUpgrade && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-[18px] font-bold text-text-primary">Review Scope Upgrade</h2>
              <button onClick={() => setReviewUpgrade(null)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6">
                <p className="text-[12px] font-bold text-accent uppercase tracking-wider mb-2">{reviewUpgrade.project?.title}</p>
                <h3 className="text-[18px] font-bold text-text-primary mb-2">{reviewUpgrade.upgrade.proposedUnit.name}</h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">{reviewUpgrade.upgrade.proposedUnit.description}</p>
              </div>

              <div>
                <h4 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500"/> Included Capabilities
                </h4>
                <ul className="space-y-2">
                  {reviewUpgrade.upgrade.proposedUnit.included.map((item: string, i: number) => (
                    <li key={i} className="text-[14px] text-text-secondary flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"/> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-border rounded-xl p-5">
                  <p className="text-[12px] text-text-tertiary font-bold uppercase mb-1">Effort Impact</p>
                  <p className="text-[20px] font-bold text-text-primary">+{reviewUpgrade.upgrade.effortImpact} Points</p>
                </div>
                <div className="bg-stone-50 border border-border rounded-xl p-5">
                  <p className="text-[12px] text-text-tertiary font-bold uppercase mb-1">Price Increase</p>
                  <p className="text-[20px] font-bold text-[#E85239]">{formatCurrency(reviewUpgrade.upgrade.costImpact)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-stone-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setReviewUpgrade(null)}
                className="px-6 py-3 bg-white border border-border text-text-primary text-[14px] font-bold rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleApproveUpgrade(reviewUpgrade.upgrade._id, reviewUpgrade.upgrade.projectId)}
                className="px-6 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl shadow-md hover:bg-[#d44127] transition-colors"
              >
                Approve Upgrade
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ActiveExecutionRow({ project: p }: { project: any }) {
  return (
    <Link href={`/freelancer/execution/${p._id}`} className="group block">
      <div className="flex items-center justify-between p-5 md:p-6 rounded-2xl bg-white/40 border border-border/80 hover:border-accent/40 hover:bg-white/90 shadow-[0_2px_8px_rgba(232,82,57,0.01)] hover:shadow-[0_8px_24px_rgba(232,82,57,0.03)] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10 group-hover:scale-105 transition-transform duration-300">
            <Zap size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-lg md:text-xl font-medium text-text-primary group-hover:text-accent transition-colors duration-200 tracking-tight">
              {p.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-text-tertiary font-medium">Active Project</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-text-tertiary group-hover:text-accent transition-colors duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Go to Project
          </span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
}
