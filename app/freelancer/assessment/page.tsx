"use client";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  User,
  Target,
  ShieldAlert,
  CheckSquare,
  Package,
  StickyNote,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronLeft,
  ExternalLink,
  FileText,
  Link2,
  GitBranch,
  Send,
  Loader2,
  Zap,
  Sparkles,
  X,
  Ban,
  AlertCircle,
  PlayCircle,
  Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Checkpoint  { id: string; label: string; completed: boolean; }
interface Deliverable { label: string; description: string; required: boolean; type: string; }

// ─── Fixed nav matching the 11-section document template ─────────────────────
const NAV_SECTIONS = [
  { id: "s-assignment",      label: "Assignment",           icon: Briefcase   },
  { id: "s-overview",        label: "Project Overview",     icon: Briefcase   },
  { id: "s-role",            label: "Your Role",            icon: User        },
  { id: "s-objectives",      label: "Objectives",           icon: Target      },
  { id: "s-constraints",     label: "Constraints",          icon: ShieldAlert },
  { id: "s-exceptions",      label: "Exceptions",           icon: Ban         },
  { id: "s-success",         label: "Success Criteria",     icon: CheckSquare },
  { id: "s-deliverables",    label: "Deliverables",         icon: Package     },
  { id: "s-mistakes",        label: "Common Mistakes",      icon: AlertCircle },
  { id: "s-notes",           label: "Important Notes",      icon: StickyNote  },
  { id: "s-start",           label: "Start Assignment",     icon: PlayCircle  },
];

const NAV_ACTIVE_SECTIONS = NAV_SECTIONS.slice(0, -1); // excludes "Start" from observer

// ─── Floating Tracker ─────────────────────────────────────────────────────────
function FloatingTracker({
  checkpoints,
  onCheck,
  disabled,
}: {
  checkpoints: Checkpoint[];
  onCheck: (id: string) => void;
  disabled: boolean;
}) {
  const completed = checkpoints.filter((c) => c.completed).length;
  const pct = checkpoints.length > 0 ? Math.round((completed / checkpoints.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/90 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-sm"
    >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
            Project Progress
          </span>
          <span className="text-xs font-bold text-accent">{pct}%</span>
        </div>

        {/* Bar */}
        <div className="w-full h-1 bg-stone-100 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-[#FF8A75] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="space-y-2">
          {checkpoints.map((cp) => (
            <button
              key={cp.id}
              onClick={() => !disabled && !cp.completed && onCheck(cp.id)}
              disabled={disabled || cp.completed}
              className="w-full flex items-center gap-2.5 group text-left"
            >
              <div className="shrink-0">
                {cp.completed ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </motion.div>
                ) : (
                  <Circle size={14}
                    className="text-stone-300 group-hover:text-accent/60 transition-colors" />
                )}
              </div>
              <span className={`text-[11px] leading-snug font-medium transition-colors ${
                cp.completed
                  ? "text-emerald-600 line-through decoration-emerald-300/60"
                  : "text-text-secondary group-hover:text-text-primary"
              }`}>
                {cp.label}
              </span>
            </button>
          ))}
        </div>

        {pct === 100 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-semibold text-emerald-600">✓ Ready to submit</span>
          </motion.div>
        )}
    </motion.div>
  );
}

// ─── Document Section wrapper ─────────────────────────────────────────────────
function DocSection({
  id, number, title, icon: Icon, children,
}: {
  id: string; number: number; title: string; icon: any; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-tertiary tracking-widest font-mono">
            {String(number).padStart(2, "0")}
          </span>
          <div className="w-px h-3.5 bg-border/60" />
        </div>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-text-tertiary shrink-0" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
            {title}
          </h2>
        </div>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}

// ─── Content card ─────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

// ─── Bullet list inside a card ────────────────────────────────────────────────
function BulletList({ items, color = "accent" }: { items: string[]; color?: "accent" | "stone" | "red" }) {
  const dot = color === "accent"
    ? "bg-accent"
    : color === "red"
    ? "bg-red-400"
    : "bg-stone-300";
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-2 shrink-0`} />
          <span className="text-[14px] text-text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Numbered list ─────────────────────────────────────────────────────────────
function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-md bg-accent/8 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-accent">{i + 1}</span>
          </div>
          <span className="text-[14px] text-text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

// ─── Mark-reviewed button ─────────────────────────────────────────────────────
function ReviewButton({
  checkpointId, label, checkpoints, onCheck, disabled,
}: {
  checkpointId: string;
  label: string;
  checkpoints: Checkpoint[];
  onCheck: (id: string) => void;
  disabled: boolean;
}) {
  const cp = checkpoints.find((c) => c.id === checkpointId) || { id: checkpointId, label, completed: false };
  return (
    <button
      onClick={() => !disabled && !cp.completed && onCheck(cp.id)}
      disabled={disabled || cp.completed}
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-all select-none duration-200 ${
        cp.completed
          ? "text-emerald-500 cursor-default font-semibold"
          : "text-text-tertiary hover:text-accent cursor-pointer"
      }`}
    >
      {cp.completed ? (
        <>
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span>Reviewed</span>
        </>
      ) : (
        <>
          <Circle size={13} className="text-text-tertiary/60 shrink-0" />
          <span>Mark as reviewed</span>
        </>
      )}
    </button>
  );
}

// ─── Submission workspace ─────────────────────────────────────────────────────
function SubmissionWorkspace({
  deliverables, form, onChange, onSubmit, submitting, validationErrors,
}: {
  deliverables: Deliverable[];
  form: Record<string, string>;
  onChange: (k: string, v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  validationErrors: string[];
}) {
  const requiredMet = deliverables
    .every((d, i) => !d.required || !!form[`d_${i}`]?.trim()) &&
    !!(form.notes && form.notes.trim().length > 10);

  const INPUT_CLS = "w-full px-4 py-3 bg-surface border border-border/60 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all";

  return (
    <div className="mt-8 border-t border-border/40 pt-8 space-y-6">
      <p className="text-[13px] text-text-secondary leading-relaxed">
        When your work is ready to hand over, fill in the fields below. Include everything the
        evaluation team needs to review your solution.
      </p>

      {/* Fields */}
      <div className="space-y-5">
        {deliverables.map((d, i) => (
          <div key={i}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
              {d.label} {d.required ? <span className="text-accent text-[10px] font-bold">Required</span> : <span className="text-text-tertiary font-normal normal-case tracking-normal">(Optional)</span>}
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="url" placeholder="Paste link here..."
                value={form[`d_${i}`] || ""} onChange={e => onChange(`d_${i}`, e.target.value)}
                className={`${INPUT_CLS} pl-9`} />
            </div>
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
            Additional Notes <span className="text-accent text-[10px] font-bold">Required</span>
          </label>
          <textarea rows={5} value={form.notes || ""}
            onChange={e => onChange("notes", e.target.value)}
            placeholder="Walk through your approach, explain your decisions, mention trade-offs, and share anything the reviewer needs to know (minimum 10 characters)."
            className={`${INPUT_CLS} resize-none leading-relaxed`} />
        </div>
      </div>

      {/* Validation */}
      {validationErrors.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Missing required deliverables:</p>
          <ul className="space-y-1">
            {validationErrors.map((e) => (
              <li key={e} className="text-xs text-red-600 flex items-center gap-1.5">
                <X size={11} />{e}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/40">
        <p className="text-xs text-text-tertiary max-w-sm leading-relaxed">
          Once submitted, your work enters evaluation. The platform will determine your capability level. Results are communicated separately.
        </p>
        <button onClick={onSubmit} disabled={submitting || !requiredMet}
          className="shrink-0 flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-hover disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(232,82,57,0.2)] hover:shadow-[0_6px_24px_rgba(232,82,57,0.3)] active:scale-[0.98]">
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Assessment</>}
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation screen ──────────────────────────────────────────────────────
function ConfirmationScreen({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-lg w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}>
              <CheckCircle2 size={36} className="text-emerald-500" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
            Assessment Submitted
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            <span className="font-medium text-text-primary">{title}</span> has been successfully handed over for evaluation.
          </p>
        </div>

        <div className="bg-white/80 border border-border/60 rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles size={14} className="text-accent" />
            <span className="text-sm font-semibold text-text-primary">What happens next</span>
          </div>
          <ol className="space-y-3 pl-5">
            {[
              "Your submission is now under evaluation.",
              "The platform will compare your solution against expected execution outcomes.",
              "Your capability level will be determined and communicated to you.",
              "No scores or pass/fail results are shown immediately.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary">
                <span className="text-accent font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <a href="/freelancer/workspace"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border/60 hover:border-accent/30 text-text-primary text-sm font-medium rounded-xl transition-all hover:bg-surface">
          <ChevronLeft size={14} />
          Return to Workspace
        </a>
      </motion.div>
    </div>
  );
}

// ─── Exit guard ───────────────────────────────────────────────────────────────
function useExitGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [active]);
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssessmentWorkspace() {
  const router = useRouter();
  const [assessment, setAssessment]       = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [generating, setGenerating]       = useState(false);
  const [starting, setStarting]           = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [error, setError]                 = useState("");
  const [genError, setGenError]           = useState("");
  const [profile, setProfile]             = useState<any>(null);
  const [activeSection, setActiveSection] = useState("s-assignment");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [form, setForm] = useState<Record<string, string>>({
    repositoryLink: "", designFileUrl: "", prototypeLink: "",
    documentationUrl: "", notes: "",
  });

  const autoSaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isActive = assessment?.status === "in_progress" && !submitted;
  useExitGuard(isActive);

  const checkpoints: Checkpoint[] = useMemo(() => {
    if (!assessment?.progressCheckpoints) return [];
    
    const requiredIds = [
      { id: "brief_reviewed",        label: "Project Overview" },
      { id: "role_understood",       label: "Your Role" },
      { id: "objectives_reviewed",   label: "Project Objectives" },
      { id: "constraints_reviewed",  label: "Constraints" },
      { id: "exceptions_reviewed",   label: "Exceptions" },
      { id: "success_reviewed",      label: "Success Criteria" },
      { id: "deliverables_prepared", label: "Deliverables" },
      { id: "mistakes_reviewed",     label: "Common Mistakes" },
      { id: "notes_reviewed",        label: "Important Notes" },
    ];

    const list = [...assessment.progressCheckpoints];
    const targetIds = [...requiredIds];
    
    if (assessment.status === "in_progress") {
      targetIds.push(
        { id: "documentation_added",  label: "Documentation Added" },
        { id: "files_uploaded",       label: "Files / Links Added" },
        { id: "final_review",         label: "Final Review" }
      );
    }

    return targetIds.map(t => {
      const existing = list.find(c => c.id === t.id);
      return {
        id: t.id,
        label: t.label,
        completed: existing ? existing.completed : false
      };
    });
  }, [assessment]);

  // ── Generate assignment using profile data ──
  async function generateAssignment(prof: any) {
    setGenerating(true);
    setGenError("");
    try {
      const field          = prof.field || "development";
      const domain         = prof.domain || prof.specializations?.[0] || "General";
      const specialization = prof.specializations?.[0] || domain;
      const specializations = prof.specializations?.length ? prof.specializations : [specialization];

      const genRes = await fetch("/api/freelancer/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, domain, specialization, specializations }),
      });
      const genData = await genRes.json();

      if (!genRes.ok) {
        // 409 = already exists, reload
        if (genRes.status === 409 && genData.assessmentId) {
          const reloadRes = await fetch(`/api/freelancer/assessment?id=${genData.assessmentId}`);
          const reloadData = await reloadRes.json();
          if (reloadData.assessment) { setAssessment(reloadData.assessment); return; }
        }
        setGenError(genData.error || "Failed to generate assignment. Please try again.");
        return;
      }
      setAssessment(genData.assessment);
    } catch (e: any) {
      setGenError(e.message || "Something went wrong generating your assignment.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Load on mount ──
  useEffect(() => {
    async function load() {
      try {
        // 1. Check for existing assessment
        const res = await fetch("/api/freelancer/assessment");
        const d = await res.json();

        // 2. Fetch profile details (always needed for profile context or fallback)
        const pRes = await fetch("/api/freelancer/profile");
        const pData = await pRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
        }

        if (d.assessment) {
          // If the assessment is a legacy onboarding test (no 11-section brief generated yet), trigger generation
          if (!d.assessment.assignmentTitle && pData.profile) {
            await generateAssignment(pData.profile);
            return;
          }
          
          setAssessment(d.assessment);
          if (["under_review", "submitted", "evaluated"].includes(d.assessment.status)) {
            setSubmitted(true);
          }
          if (d.assessment.savedProgress) {
            try { const s = JSON.parse(d.assessment.savedProgress); if (s.form) setForm(s.form); } catch {}
          }
          return;
        }

        // 3. None found — auto-generate immediately
        if (pData.profile) {
          await generateAssignment(pData.profile);
        }
      } catch (err) {
        console.error("Assessment load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ── Section observer ──
  useEffect(() => {
    if (!assessment) return;
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    NAV_SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [assessment, isActive]);

  // ── Auto-save ──
  const triggerAutoSave = useCallback((newForm: Record<string, string>) => {
    if (!isActive) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/freelancer/assessment", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", savedProgress: JSON.stringify({ form: newForm }) }),
        });
        setLastSaved(new Date());
      } catch {}
    }, 2000);
  }, [isActive]);

  function handleFormChange(key: string, val: string) {
    const updated = { ...form, [key]: val };
    setForm(updated);
    triggerAutoSave(updated);
    if (val.trim() && isActive) {
      const cp = assessment?.progressCheckpoints?.find((c: Checkpoint) => c.id === "files_uploaded");
      if (cp && !cp.completed) handleCheckpoint("files_uploaded");
    }
  }

  // ── Checkpoint ──
  async function handleCheckpoint(checkpointId: string) {
    const isClickable = assessment && ["assigned", "in_progress"].includes(assessment.status);
    if (!isClickable) return;
    try {
      const res = await fetch("/api/freelancer/assessment", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkpoint", checkpointId }),
      });
      const data = await res.json();
      if (data.checkpoints) setAssessment((p: any) => ({ ...p, progressCheckpoints: data.checkpoints }));
    } catch {}
  }

  // ── Start ──
  async function handleStart() {
    setStarting(true); setError("");
    try {
      const res = await fetch("/api/freelancer/assessment", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) throw new Error("Failed to start assessment");
      const data = await res.json();
      setAssessment(data.assessment);
      router.push("/freelancer/workspace");
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setStarting(false);
    }
  }

  // ── Submit ──
  async function handleSubmit() {
    setSubmitting(true); setValidationErrors([]); setError("");
    try {
      const files = assessment?.deliverables?.map((d: any, i: number) => ({
        label: d.label,
        url: form[`d_${i}`] || ""
      })) || [];
      const payload = { files, notes: form.notes || "" };

      const res = await fetch("/api/freelancer/assessment/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.missing) { setValidationErrors(data.missing); } else { setError(data.error || "Submission failed."); }
        return;
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ─── Render: Loading ──────────────────────────────────────────────────────
  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm px-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">
              {generating ? "Generating your assignment…" : "Loading…"}
            </p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              {generating
                ? "The AI is creating a personalised real-world project brief tailored to your specialization. This takes 15–30 seconds."
                : "Checking for your assignment…"}
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Render: No assessment (generation failed or not onboarded) ────────────
  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto">
            <Zap size={28} className="text-accent/50" />
          </div>

          {genError ? (
            <>
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">Generation Failed</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{genError}</p>
              </div>
              {profile && (
                <button
                  onClick={() => generateAssignment(profile)}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl shadow-[0_4px_16px_rgba(232,82,57,0.2)] hover:bg-accent-hover transition-all disabled:opacity-60"
                >
                  {generating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><ArrowRight size={14} /> Try Again</>}
                </button>
              )}
            </>
          ) : (
            <>
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">No Assignment Found</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Complete your onboarding profile first to receive a personalised capability assignment.
                </p>
              </div>
              <a href="/freelancer/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl shadow-[0_4px_16px_rgba(232,82,57,0.2)] hover:bg-accent-hover transition-all">
                Complete Onboarding <ArrowRight size={14} />
              </a>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Render: Submitted ─────────────────────────────────────────────────────
  if (submitted || ["under_review","submitted","evaluated"].includes(assessment.status)) {
    return <ConfirmationScreen title={assessment.assignmentTitle || "Your Assessment"} />;
  }

  // ─── Render: Assignment document (assigned OR in_progress) ─────────────────
  const a = assessment;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40 print:hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a href="/freelancer/capability"
              onClick={e => { if (isActive && !confirm("Leave the assessment workspace? Your progress is saved.")) e.preventDefault(); }}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors shrink-0">
              <ChevronLeft size={14} /><span>Back</span>
            </a>
            <div className="w-px h-4 bg-border" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {isActive ? "Assignment Active" : "Assignment Brief"}
              </p>
              <h1 className="font-display text-sm font-semibold text-text-primary leading-tight truncate max-w-xs md:max-w-md">
                {a.assignmentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isActive && (
              <>
                <div className="hidden md:flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lastSaved
                    ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Auto-saving…"}
                </div>
                <button onClick={() => scrollTo("s-submission")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent/8 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-transparent rounded-lg text-xs font-semibold transition-all">
                  <Send size={11} /> Submit Work
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-10 flex justify-center">
        <div className="flex gap-12 w-full max-w-5xl justify-center">

          {/* ── Left TOC nav ── */}
          <nav className="hidden lg:block w-48 shrink-0 self-start sticky top-28 select-none print:hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary/70 mb-5 px-1">
              Sections
            </p>
            <div className="space-y-1">
              {NAV_SECTIONS.map(({ id, label }, idx) => {
                const isActive = activeSection === id;
                return (
                  <motion.button
                    key={id}
                    onClick={() => scrollTo(id)}
                    animate={{
                      x: isActive ? 8 : 0,
                      scale: isActive ? 1.06 : 1.0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`w-full flex items-center gap-3 py-1.5 text-left transition-colors duration-200 cursor-pointer origin-left ${
                      isActive
                        ? "text-accent font-semibold"
                        : id === "s-start"
                        ? "text-accent/70 hover:text-accent font-medium"
                        : "text-text-tertiary hover:text-text-primary"
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-50 w-5 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[12px] tracking-wide truncate">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* ── Main document ── */}
          <main className="flex-1 min-w-0 space-y-14 pb-24">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-2">
                <X size={14} />{error}
              </div>
            )}

            {/* ══ 01 — Assignment ══════════════════════════════════════════ */}
            <DocSection id="s-assignment" number={1} title="Assignment" icon={Briefcase}>
              <Card>
                <div className="space-y-5">
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-accent/8 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full border border-accent/15">
                      {a.domain}
                    </span>
                    <span className="px-3 py-1 bg-stone-50 text-stone-500 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-border/60">
                      {a.capabilityArea}
                    </span>
                    <span className="px-3 py-1 bg-stone-50 text-stone-500 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-border/60">
                      Level 2
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
                    {a.assignmentTitle}
                  </h2>

                  {/* Summary */}
                  {a.assignmentSummary && (
                    <p className="text-[15px] text-text-secondary leading-relaxed border-t border-border/40 pt-4">
                      {a.assignmentSummary}
                    </p>
                  )}

                </div>
              </Card>
            </DocSection>

            {/* ══ 02 — Project Overview ════════════════════════════════════ */}
            <DocSection id="s-overview" number={2} title="Project Overview" icon={Briefcase}>
              <Card>
                <div className="space-y-6">
                  {[
                    { key: "background",       label: "Business Background"  },
                    { key: "currentSituation", label: "Current Situation"    },
                    { key: "businessProblem",  label: "The Problem"          },
                    { key: "expectedOutcome",  label: "Expected Outcome"     },
                  ].map(({ key, label }) => (
                    a.projectOverview?.[key] && (
                      <div key={key}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2">{label}</p>
                        <p className="text-[14px] text-text-secondary leading-relaxed">
                          {a.projectOverview[key]}
                        </p>
                      </div>
                    )
                  ))}
                </div>
                
                <div className="flex justify-center pt-4 border-t border-border/30 mt-4">
                  <ReviewButton checkpointId="brief_reviewed" label="Project Overview" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 03 — Your Role ═══════════════════════════════════════════ */}
            <DocSection id="s-role" number={3} title="Your Role" icon={User}>
              <Card className="bg-gradient-to-br from-white/80 to-accent/3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60 mb-3">You have been brought in as</p>
                <p className="font-display text-xl md:text-2xl font-semibold text-text-primary leading-snug tracking-tight">
                  {a.yourRole}
                </p>
                <p className="mt-5 pt-5 border-t border-border/40 text-[13px] text-text-secondary leading-relaxed">
                  This project is yours to own. The decisions you make, the trade-offs you navigate, and the quality of work you deliver are entirely your professional responsibility.
                </p>

                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="role_understood" label="Your Role" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 04 — Project Objectives ══════════════════════════════════ */}
            <DocSection id="s-objectives" number={4} title="Project Objectives" icon={Target}>
              <Card>
                <NumberedList items={a.projectObjectives || []} />
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="objectives_reviewed" label="Project Objectives" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 05 — Constraints ═════════════════════════════════════════ */}
            <DocSection id="s-constraints" number={5} title="Constraints" icon={ShieldAlert}>
              <Card>
                <BulletList items={a.constraints || []} color="accent" />
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="constraints_reviewed" label="Constraints" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 06 — Exceptions ══════════════════════════════════════════ */}
            <DocSection id="s-exceptions" number={6} title="Exceptions" icon={Ban}>
              <Card>
                <p className="text-[12px] text-text-tertiary mb-4 italic">
                  The following items are intentionally excluded from this assignment and will not be evaluated.
                </p>
                <BulletList items={a.exceptions || []} color="stone" />
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="exceptions_reviewed" label="Exceptions" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 07 — Success Criteria ════════════════════════════════════ */}
            <DocSection id="s-success" number={7} title="Success Criteria" icon={CheckSquare}>
              <Card>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {a.successCriteria}
                </p>
                <p className="mt-5 pt-5 border-t border-border/40 text-[12px] text-text-tertiary italic leading-relaxed">
                  Evaluation determines whether your submission reflects Level 1, Level 2, or Level 3 capability. Results are communicated after a complete review — no scores are shown immediately.
                </p>
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="success_reviewed" label="Success Criteria" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 08 — Deliverables ════════════════════════════════════════ */}
            <DocSection id="s-deliverables" number={8} title="Deliverables" icon={Package}>
              <Card>
                <div className="space-y-6">
                  {(a.deliverables || []).map((d: Deliverable, i: number) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-surface border border-border/40 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-text-tertiary">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-text-primary">{d.label}</span>
                          {d.required
                            ? <span className="text-[9px] font-bold text-accent bg-accent/8 px-2 py-0.5 rounded-full border border-accent/15">Required</span>
                            : <span className="text-[9px] font-medium text-text-tertiary bg-stone-50 px-2 py-0.5 rounded-full border border-border/40">Optional</span>}
                        </div>
                        <p className="text-[13px] text-text-secondary leading-relaxed">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center pt-4 border-t border-border/30 mt-6">
                  <ReviewButton checkpointId="deliverables_prepared" label="Deliverables" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 09 — Common Mistakes ═════════════════════════════════════ */}
            <DocSection id="s-mistakes" number={9} title="Common Mistakes to Avoid" icon={AlertCircle}>
              <Card>
                <p className="text-[12px] text-text-tertiary mb-4 italic">
                  These are patterns that frequently appear in weaker submissions. Use this list to sense-check your work before submitting.
                </p>
                <BulletList items={a.commonMistakes || []} color="red" />
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="mistakes_reviewed" label="Common Mistakes" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 10 — Important Notes ═════════════════════════════════════ */}
            <DocSection id="s-notes" number={10} title="Important Notes" icon={StickyNote}>
              <Card>
                <ul className="space-y-4">
                  {(a.importantNotes || []).map((note: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-stone-500">{i + 1}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary leading-relaxed">{note}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center pt-4 border-t border-border/30 mt-5">
                  <ReviewButton checkpointId="notes_reviewed" label="Important Notes" checkpoints={checkpoints} onCheck={handleCheckpoint} disabled={assessment && !["assigned", "in_progress"].includes(assessment.status)} />
                </div>
              </Card>
            </DocSection>

            {/* ══ 11 — Start Assignment ════════════════════════════════════ */}
            <DocSection id="s-start" number={11} title="Start Assignment" icon={PlayCircle}>
              {!isActive ? (
                <Card className="text-center py-10">
                  <div className="space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto">
                      <PlayCircle size={28} className="text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-text-primary tracking-tight">
                        Ready to begin?
                      </h3>
                      <p className="text-[13px] text-text-secondary leading-relaxed max-w-sm mx-auto">
                        Once you start, the assignment workspace opens, progress tracking activates, and your session is timestamped. You can return at any time — your work is automatically saved.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center max-w-xs mx-auto">
                      {[
                        { label: "Level", value: "2" },
                        { label: "Timer", value: "Open" },
                        { label: "Deliverables", value: String(a.deliverables?.length || 0) },
                      ].map(({ label, value }) => (
                        <div key={label} className="space-y-1">
                          <p className="text-[10px] text-text-tertiary">{label}</p>
                          <p className="text-sm font-bold text-text-primary">{value}</p>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button onClick={() => window.print()}
                        className="inline-flex items-center gap-2.5 px-8 py-4 bg-white border border-border/80 hover:border-accent/40 text-text-primary hover:text-accent rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-[0_2px_12px_rgba(232,82,57,0.02)] active:scale-[0.98] print:hidden">
                        <Download size={16} /> Download as PDF
                      </button>
                      <button onClick={handleStart} disabled={starting}
                        className="inline-flex items-center gap-2.5 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-[0_4px_24px_rgba(232,82,57,0.25)] hover:shadow-[0_8px_32px_rgba(232,82,57,0.35)] active:scale-[0.98] disabled:opacity-60 print:hidden">
                        {starting
                          ? <><Loader2 size={16} className="animate-spin" /> Opening workspace…</>
                          : <><PlayCircle size={16} /> Start Assignment<ArrowRight size={14} strokeWidth={2.5} /></>}
                      </button>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Submission workspace — appears after Start is clicked */
                <section id="s-submission">
                  <Card>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                        Assignment Active — Workspace Open
                      </p>
                    </div>
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-1">
                      Work through the assignment above. When your deliverables are ready, submit them below.
                    </p>

                    <SubmissionWorkspace
                      deliverables={a.deliverables || []}
                      form={form}
                      onChange={handleFormChange}
                      onSubmit={handleSubmit}
                      submitting={submitting}
                      validationErrors={validationErrors}
                    />
                  </Card>
                </section>
              )}
            </DocSection>

          </main>
        </div>
      </div>
    </div>
  );
}
