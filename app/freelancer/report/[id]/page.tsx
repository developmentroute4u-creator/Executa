"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, Award, ExternalLink, FileText, CheckCircle2,
  Briefcase, User, Target, ShieldAlert, Ban, CheckSquare,
  Package, AlertCircle, StickyNote, ChevronDown, ChevronUp, Link2,
} from "lucide-react";

// ── Tiny helpers ─────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Icon size={15} className="text-accent shrink-0" />
        <h3 className="font-semibold text-[13px] text-text-primary uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1.5">{label}</p>
      <p className="text-[14px] text-text-secondary leading-relaxed">{value}</p>
    </div>
  );
}

function BulletList({ items, color = "accent" }: { items: string[]; color?: string }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-relaxed">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color === "red" ? "bg-red-400" : "bg-accent"}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-text-secondary">{label}</span>
        <span className="font-bold text-text-primary">{score}/{max}</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-[#FF8A75]"
        />
      </div>
    </div>
  );
}

// ── Expandable assignment details ────────────────────────────────────────────

function AssignmentDetails({ test }: { test: any }) {
  const [open, setOpen] = useState(false);
  const a = test;

  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
      >
        <span className="font-semibold text-[13px] text-text-primary">View Full Assignment Details</span>
        {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="divide-y divide-border/40"
        >
          {/* Project Overview */}
          {a.projectOverview && (
            <div className="p-6 space-y-5">
              <Section title="Project Overview" icon={Briefcase}>
                <TextBlock label="Business Background" value={a.projectOverview.background} />
                <TextBlock label="Current Situation" value={a.projectOverview.currentSituation} />
                <TextBlock label="The Problem" value={a.projectOverview.businessProblem} />
                <TextBlock label="Expected Outcome" value={a.projectOverview.expectedOutcome} />
              </Section>
            </div>
          )}

          {/* Your Role */}
          {a.yourRole && (
            <div className="p-6">
              <Section title="Your Role" icon={User}>
                <p className="text-[15px] font-medium text-text-primary leading-snug">{a.yourRole}</p>
              </Section>
            </div>
          )}

          {/* Objectives */}
          {a.projectObjectives?.length > 0 && (
            <div className="p-6">
              <Section title="Project Objectives" icon={Target}>
                <BulletList items={a.projectObjectives} />
              </Section>
            </div>
          )}

          {/* Constraints */}
          {a.constraints?.length > 0 && (
            <div className="p-6">
              <Section title="Constraints" icon={ShieldAlert}>
                <BulletList items={a.constraints} />
              </Section>
            </div>
          )}

          {/* Exceptions */}
          {a.exceptions?.length > 0 && (
            <div className="p-6">
              <Section title="Exceptions (Out of Scope)" icon={Ban}>
                <BulletList items={a.exceptions} color="red" />
              </Section>
            </div>
          )}

          {/* Success Criteria */}
          {a.successCriteria && (
            <div className="p-6">
              <Section title="Success Criteria" icon={CheckSquare}>
                <p className="text-[14px] text-text-secondary leading-relaxed">{a.successCriteria}</p>
              </Section>
            </div>
          )}

          {/* Deliverables */}
          {a.deliverables?.length > 0 && (
            <div className="p-6">
              <Section title="Deliverables" icon={Package}>
                <div className="space-y-3">
                  {a.deliverables.map((d: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-border/40">
                      <CheckCircle2 size={14} className={`shrink-0 mt-0.5 ${d.required ? "text-accent" : "text-stone-300"}`} />
                      <div>
                        <p className="text-[12px] font-bold text-text-primary">
                          {d.label}
                          {!d.required && <span className="ml-2 text-[10px] font-normal text-text-tertiary">(Optional)</span>}
                        </p>
                        <p className="text-[12px] text-text-tertiary leading-relaxed mt-0.5">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* Common Mistakes */}
          {a.commonMistakes?.length > 0 && (
            <div className="p-6">
              <Section title="Common Mistakes to Avoid" icon={AlertCircle}>
                <BulletList items={a.commonMistakes} color="red" />
              </Section>
            </div>
          )}

          {/* Important Notes */}
          {a.importantNotes?.length > 0 && (
            <div className="p-6">
              <Section title="Important Notes" icon={StickyNote}>
                <BulletList items={a.importantNotes} />
              </Section>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/freelancer/report/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setTest(d.test);
      })
      .catch(() => setError("Failed to load report."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-tertiary">Loading report…</p>
        </div>
      </main>
    );
  }

  // ── Error ──
  if (error || !test) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-text-secondary">{error || "Report not found."}</p>
          <button onClick={() => router.push("/freelancer/capability")}
            className="text-sm text-accent hover:underline">← Return to Skills Section</button>
        </div>
      </main>
    );
  }

  const ev = test.evaluation;
  const scorePct = ev ? Math.round((ev.total / 50) * 100) : null;

  const scoreCategories = ev ? [
    { label: "Functional Coverage", score: ev.functionalCoverage },
    { label: "Logic & Reasoning",   score: ev.logic             },
    { label: "Usability",           score: ev.usability         },
    { label: "Edge Cases",          score: ev.edgeCases         },
    { label: "Output Quality",      score: ev.outputQuality     },
  ] : [];

  // Submission links — new flexible files[] OR legacy fields
  const submissionLinks: { label: string; url: string }[] = [];
  if (test.submission?.files?.length) {
    test.submission.files.forEach((f: { label: string; url: string }) => {
      if (f.url) submissionLinks.push({ label: f.label, url: f.url });
    });
  } else {
    if (test.submission?.repositoryLink)   submissionLinks.push({ label: "Repository",    url: test.submission.repositoryLink });
    if (test.submission?.prototypeLink)    submissionLinks.push({ label: "Prototype",     url: test.submission.prototypeLink  });
    if (test.submission?.designFileUrl)    submissionLinks.push({ label: "Design File",   url: test.submission.designFileUrl  });
    if (test.submission?.documentationUrl) submissionLinks.push({ label: "Documentation", url: test.submission.documentationUrl });
    if (test.submissionUrl)                submissionLinks.push({ label: "Submission",    url: test.submissionUrl             });
  }
  const submissionNotes = test.submission?.notes || test.submissionNotes || "";

  return (
    <main className="min-h-screen bg-background font-sans">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => router.push("/freelancer/capability")}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors shrink-0">
              <ChevronLeft size={14} /> Back
            </button>
            <div className="w-px h-4 bg-border" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Assignment Report</p>
              <h1 className="font-semibold text-sm text-text-primary truncate max-w-xs md:max-w-md leading-tight">
                {test.assignmentTitle || test.taskPrompt || "Your Assignment"}
              </h1>
            </div>
          </div>

          {/* Score chip in header */}
          {scorePct !== null && (
            <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-accent/8 border border-accent/20 rounded-full">
              <Award size={13} className="text-accent" />
              <span className="text-sm font-bold text-accent">{scorePct}%</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 space-y-8">

        {/* ── Assignment title + tags ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-accent/8 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full border border-accent/15">
              {test.domain}
            </span>
            {test.capabilityArea && (
              <span className="px-3 py-1 bg-stone-50 text-stone-500 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-border/60">
                {test.capabilityArea}
              </span>
            )}
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
              Completed
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary tracking-tight leading-snug">
            {test.assignmentTitle || test.taskPrompt}
          </h2>
          {test.assignmentSummary && (
            <p className="text-[15px] text-text-secondary leading-relaxed">{test.assignmentSummary}</p>
          )}
        </motion.div>

        {/* ── Evaluation Score ── */}
        {ev && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#FFF7F6] to-white border border-[#E85239]/20 rounded-3xl p-7 space-y-6">

            {/* Overall score */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Evaluation Score</p>
                <p className="text-sm text-text-secondary font-medium">Verified Capabilities</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-display font-bold text-accent leading-none">{scorePct}%</p>
                <p className="text-[11px] font-semibold text-text-tertiary tracking-wider uppercase mt-1">
                  {ev.total} / 50 Raw Points
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-accent/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="h-full bg-gradient-to-r from-accent to-[#FF8A75] rounded-full"
              />
            </div>

            {/* Dimension scores */}
            {scoreCategories.some(c => c.score > 0) && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border/30">
                {scoreCategories.map(c => <ScoreBar key={c.label} label={c.label} score={c.score} />)}
              </div>
            )}

            {/* Evaluator notes */}
            {ev.evaluatorNotes && (
              <div className="bg-white/70 rounded-xl border border-border/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Evaluator Notes</p>
                <p className="text-[13px] text-text-secondary leading-relaxed">{ev.evaluatorNotes}</p>
              </div>
            )}

            {/* Capability scores */}
            {ev.capabilityScores?.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Capability Breakdown</p>
                {ev.capabilityScores.map((cs: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-border/30">
                    <div className="text-right shrink-0 w-14">
                      <p className="text-lg font-bold text-accent leading-none">{cs.score}</p>
                      <p className="text-[10px] text-text-tertiary">/10</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-text-primary">{cs.capabilityName}</p>
                      <p className="text-[11px] text-text-tertiary">{cs.dimensionName}</p>
                      {cs.feedback && <p className="text-[12px] text-text-secondary leading-relaxed mt-1">{cs.feedback}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Submission Links ── */}
        {(submissionLinks.length > 0 || submissionNotes) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white border border-border/50 rounded-3xl p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <Link2 size={15} className="text-accent" />
              <h3 className="font-semibold text-[13px] text-text-primary uppercase tracking-widest">Submitted Links</h3>
            </div>

            {submissionLinks.map((link, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-xl border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={14} className="text-text-tertiary shrink-0" />
                  <span className="text-[13px] font-semibold text-text-primary">{link.label}</span>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
                  Open <ExternalLink size={11} />
                </a>
              </div>
            ))}

            {submissionNotes && (
              <div className="bg-stone-50 rounded-xl border border-border/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Additional Notes</p>
                <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">{submissionNotes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Full Assignment (collapsed by default) ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AssignmentDetails test={test} />
        </motion.div>

        {/* ── Footer back button ── */}
        <div className="pt-4 flex justify-center">
          <button onClick={() => router.push("/freelancer/capability")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-border/60 hover:border-accent/30 text-text-secondary hover:text-accent text-sm font-medium rounded-xl transition-all">
            <ChevronLeft size={14} /> Return to Skills Section
          </button>
        </div>

      </div>
    </main>
  );
}
