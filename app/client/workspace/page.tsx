"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, FolderOpen, Zap, ArrowRight,
  AlertTriangle, Plus, Briefcase, ChevronDown, ChevronUp,
  Sparkles, ListChecks, CircleDot,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const now = new Date();
  const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
  const h = istHour % 24;
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, accent = false, delay = 0,
}: {
  label: string; value: string | number; icon: any; accent?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-5 border flex flex-col gap-4 ${
        accent
          ? "bg-[#E85239] border-transparent shadow-[0_8px_32px_rgba(232,82,57,0.25)]"
          : "bg-white border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-white/15" : "bg-stone-50 border border-stone-100"}`}>
        <Icon size={17} className={accent ? "text-white" : "text-stone-400"} />
      </div>
      <div>
        <p className={`text-3xl font-black tracking-tight leading-none mb-1 ${accent ? "text-white" : "text-stone-900"}`}>{value}</p>
        <p className={`text-[12px] font-bold uppercase tracking-wider ${accent ? "text-white/70" : "text-stone-400"}`}>{label}</p>
      </div>
    </motion.div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    execution:    { label: "In Execution",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    active:       { label: "Active",        cls: "bg-blue-50 text-blue-600 border-blue-100"          },
    scope_review: { label: "Scope Review",  cls: "bg-amber-50 text-amber-600 border-amber-100"       },
    completed:    { label: "Completed",     cls: "bg-stone-50 text-stone-400 border-stone-100"       },
  };
  const { label, cls } = map[status] ?? { label: status.replace(/_/g, " "), cls: "bg-stone-50 text-stone-400 border-stone-100" };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, idx }: { project: any; idx: number }) {
  const progress = project.status === "execution" ? 33 : project.status === "active" ? 8 : 5;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * idx }}>
      <Link href={`/client/projects/${project._id}`} className="block group">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-stone-200 transition-all duration-300 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#E85239] to-[#FF8A75] w-0 group-hover:w-full transition-all duration-500" />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#E85239] transition-colors">
                  {project.title}
                </h3>
                <p className="text-[13px] text-stone-400 font-medium mt-1">
                  {project.freelancerName ? `Executed by ${project.freelancerName}` : "Awaiting execution"}
                </p>
              </div>
              <StatusPill status={project.status} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-semibold text-stone-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * idx }}
                  className="h-full rounded-full bg-gradient-to-r from-[#E85239] to-[#FF8A75]"
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">View Project</span>
            <ArrowRight size={13} className="text-stone-300 group-hover:text-[#E85239] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Action Centre ─────────────────────────────────────────────────────────────
// Derives smart next-step items from project data + getting started guide state.
function deriveActionItems(projects: any[]): {
  id: string; type: "urgent" | "next" | "guide";
  title: string; description: string; href: string; done?: boolean;
}[] {
  const items: any[] = [];

  // 1. Attention / urgent items from projects
  projects.forEach(p => {
    const isAccepted = p.status === "active" && p.freelancerAccepted && !p.clientAcknowledgedAcceptance;
    if (p.status === "scope_review") {
      items.push({
        id: `scope-${p._id}`, type: "urgent",
        title: "Scope Review Required",
        description: `Review and approve the AI-generated scope for "${p.title}".`,
        href: `/client/projects/${p._id}`,
      });
    }
    if (isAccepted) {
      items.push({
        id: `accepted-${p._id}`, type: "urgent",
        title: "Freelancer Accepted",
        description: `Confirm acceptance and enter execution for "${p.title}".`,
        href: `/client/projects/${p._id}`,
      });
    }
  });

  // 2. Smart next steps per active project (non-urgent)
  projects.filter(p => ["active", "execution"].includes(p.status)).forEach(p => {
    const alreadyUrgent = items.find(i => i.href === `/client/projects/${p._id}` && i.type === "urgent");
    if (!alreadyUrgent) {
      items.push({
        id: `next-${p._id}`, type: "next",
        title: p.status === "execution" ? "Check execution progress" : "Review project status",
        description: `"${p.title}" is in the ${p.status.replace("_", " ")} phase.`,
        href: `/client/projects/${p._id}`,
      });
    }
  });

  // 3. Getting started guide — checklist of key platform milestones
  const hasProject   = projects.length > 0;
  const hasActive    = projects.some(p => ["active", "execution", "completed"].includes(p.status));
  const hasCompleted = projects.some(p => p.status === "completed");

  const guide = [
    { id: "gs-create",   title: "Create your first project",   description: "Set up a project brief for AI scoping.", href: "/client/onboarding", done: hasProject   },
    { id: "gs-scope",    title: "Review & approve a scope",     description: "Confirm the AI-generated project scope.", href: "/client/projects",   done: hasActive    },
    { id: "gs-exec",     title: "Enter the execution room",     description: "Collaborate with your assigned freelancer.", href: "/client/projects", done: hasActive    },
    { id: "gs-complete", title: "Complete a project",           description: "Deliver and close your first engagement.", href: "/client/projects",  done: hasCompleted },
  ];

  // Only add guide if not everything is done
  if (!guide.every(g => g.done)) {
    guide.forEach(g => items.push({ ...g, type: "guide" }));
  }

  return items;
}

function ActionCentre({ projects }: { projects: any[] }) {
  const [guideOpen, setGuideOpen] = useState(true);
  const items   = deriveActionItems(projects);
  const urgent  = items.filter(i => i.type === "urgent");
  const next    = items.filter(i => i.type === "next");
  const guide   = items.filter(i => i.type === "guide");
  const guideDoneCount = guide.filter(g => g.done).length;
  const allGuideDone   = guideDoneCount === guide.length;

  return (
    <div className="space-y-5">
      <h2 className="text-[11px] font-bold tracking-[0.12em] text-stone-400 uppercase">Your Action Centre</h2>

      {/* ── Urgent attention ── */}
      {urgent.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#E85239] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] animate-pulse inline-block" />
            Needs Your Attention
          </p>
          {urgent.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <Link href={item.href}>
                <div className="flex items-start gap-3.5 p-4 bg-[#FFF7F6] border border-[#E85239]/20 rounded-2xl hover:bg-[#FFE8E4]/50 hover:border-[#E85239]/40 transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-[#E85239]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={14} className="text-[#E85239]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-stone-900 leading-none mb-1">{item.title}</p>
                    <p className="text-[12px] text-stone-500 leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowRight size={13} className="text-[#E85239]/40 group-hover:text-[#E85239] shrink-0 mt-1 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Next steps ── */}
      {next.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
            <CircleDot size={10} className="text-stone-300" />
            Upcoming Next Steps
          </p>
          {next.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
              <Link href={item.href}>
                <div className="flex items-start gap-3.5 p-4 bg-white border border-stone-100 rounded-2xl hover:border-stone-200 hover:shadow-sm transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#E85239]/8 group-hover:border-[#E85239]/15 transition-colors">
                    <Sparkles size={13} className="text-stone-300 group-hover:text-[#E85239] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-stone-800 leading-none mb-1">{item.title}</p>
                    <p className="text-[12px] text-stone-400 leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowRight size={13} className="text-stone-200 group-hover:text-[#E85239] shrink-0 mt-1 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Getting Started Checklist ── */}
      {guide.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => setGuideOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                <ListChecks size={14} className="text-stone-400" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-stone-800 leading-none">Getting Started</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {allGuideDone ? "All steps complete 🎉" : `${guideDoneCount} of ${guide.length} complete`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress ring placeholder */}
              <div className="w-8 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(guideDoneCount / guide.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#E85239] to-[#FF8A75]"
                />
              </div>
              {guideOpen ? <ChevronUp size={14} className="text-stone-300" /> : <ChevronDown size={14} className="text-stone-300" />}
            </div>
          </button>

          <AnimatePresence>
            {guideOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t border-stone-50 divide-y divide-stone-50">
                  {guide.map((step, i) => (
                    <Link key={step.id} href={step.done ? "#" : step.href}>
                      <div className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors ${step.done ? "opacity-50 cursor-default" : "hover:bg-stone-50 cursor-pointer group"}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          step.done ? "border-emerald-400 bg-emerald-400" : "border-stone-200 group-hover:border-[#E85239]/40"
                        }`}>
                          {step.done && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-semibold leading-none mb-0.5 ${step.done ? "line-through text-stone-400" : "text-stone-700"}`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-stone-400">{step.description}</p>
                        </div>
                        {!step.done && (
                          <ArrowRight size={11} className="text-stone-200 group-hover:text-[#E85239] transition-colors shrink-0" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── All clear state ── */}
      {urgent.length === 0 && next.length === 0 && allGuideDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 text-center gap-2">
          <CheckCircle2 size={22} className="text-emerald-400" />
          <p className="text-[13px] font-bold text-stone-500">You're all caught up!</p>
          <p className="text-[12px] text-stone-400">No pending actions right now.</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClientWorkspace() {
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || "Client";

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeProjects  = projects.filter(p => ["execution", "active"].includes(p.status));
  const completedCount  = projects.filter(p => p.status === "completed").length;
  const urgentCount     = projects.filter(
    p => p.status === "scope_review" || (p.status === "active" && p.freelancerAccepted && !p.clientAcknowledgedAcceptance)
  ).length;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14 space-y-10">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-5"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#E85239] mb-2">Client Dashboard</p>
          <h1 className="text-[32px] md:text-[42px] font-black tracking-tight text-stone-900 leading-[1.1]">
            {getGreeting()}, {userName.split(" ")[0]}.
          </h1>
          <p className="text-[15px] text-stone-400 font-medium mt-2 leading-relaxed">
            {urgentCount > 0
              ? `You have ${urgentCount} item${urgentCount !== 1 ? "s" : ""} requiring your attention.`
              : "Everything looks good — you're all caught up."}
          </p>
        </div>

        <Link href="/client/onboarding">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="shrink-0 flex items-center gap-2.5 px-5 py-3 bg-stone-900 hover:bg-[#E85239] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} /> New Project
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={activeProjects.length} icon={Zap}           accent delay={0.05} />
        <StatCard label="Total Projects"  value={projects.length}       icon={FolderOpen}           delay={0.1}  />
        <StatCard label="Needs Attention" value={urgentCount}           icon={AlertTriangle}        delay={0.15} />
        <StatCard label="Completed"       value={completedCount}        icon={CheckCircle2}         delay={0.2}  />
      </div>

      {/* ── Main 2-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Active Projects */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold tracking-[0.12em] text-stone-400 uppercase">Active Projects</h2>
            <Link href="/client/projects"
              className="text-[12px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-36 bg-stone-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : activeProjects.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                <Briefcase size={22} className="text-stone-300" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-stone-500 mb-1">No active projects</p>
                <p className="text-[13px] text-stone-400">Create a project to get started.</p>
              </div>
              <Link href="/client/onboarding"
                className="px-5 py-2.5 bg-stone-900 hover:bg-[#E85239] text-white text-[13px] font-bold rounded-xl transition-colors">
                Create New Project
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((p, i) => <ProjectCard key={p._id} project={p} idx={i} />)}
            </div>
          )}
        </div>

        {/* Right: Action Centre */}
        <div className="lg:col-span-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <ActionCentre projects={projects} />
          )}
        </div>
      </div>
    </div>
  );
}
