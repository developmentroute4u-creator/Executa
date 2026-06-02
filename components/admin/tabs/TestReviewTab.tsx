"use client";
import { useState } from "react";
import { Card, Badge, Button, LevelBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function TestReviewTab({ tests, fetchOverview }: { tests: any[], fetchOverview: () => void }) {
  const [selected, setSelected] = useState<any>(null);
  const [scores, setScores] = useState({ functionalCoverage: 0, logic: 0, usability: 0, edgeCases: 0, outputQuality: 0 });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSubmitEvaluation = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tests/${selected._id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores,
          notes,
          capabilityScores: []
        }),
      });

      if (res.ok) {
        setSelected(null);
        setScores({ functionalCoverage: 0, logic: 0, usability: 0, edgeCases: 0, outputQuality: 0 });
        setNotes("");
        fetchOverview();
      } else {
        const err = await res.json();
        alert(`Evaluation failed: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Test list */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Submissions Pending Vetting</h2>
        {tests.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-sm text-text-secondary">No talent test submissions are currently waiting in the evaluation queue.</p>
          </div>
        )}
        {tests.map((t) => (
          <button
            key={t._id}
            onClick={() => { setSelected(t); setScores(t.evaluation || { functionalCoverage: 0, logic: 0, usability: 0, edgeCases: 0, outputQuality: 0 }); }}
            className={`w-full text-left p-4 rounded-xl border transition-all ${selected?._id === t._id ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-white hover:border-border-strong"}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-text-primary">{t.freelancerName || "Professional Candidate"}</span>
              {t.status === "evaluated" ? (
                 <Badge variant="green">Evaluated ({t.evaluation?.total || 0}/50)</Badge>
              ) : (
                 <Badge variant="amber">Under Review</Badge>
              )}
            </div>
            <div className="text-xs text-text-secondary capitalize">{t.freelancerSpecialization} &middot; {t.freelancerField}</div>
            <div className="text-[10px] text-text-tertiary mt-2">Submitted: {formatDate(t.createdAt)}</div>
          </button>
        ))}
      </div>

      {/* Evaluation Calibration Panel */}
      <div>
        {!selected ? (
          <div className="h-72 flex items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-surface/20">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-primary">Select Vetting Assignment</p>
              <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed mx-auto">Choose a pending submission on the left to grade, calibrate level bounds, and submit evaluator feedback.</p>
            </div>
          </div>
        ) : (
          <Card className="p-6 space-y-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] text-accent uppercase font-bold tracking-wider">Calibration Workspace</span>
              <h3 className="text-base font-semibold text-text-primary mt-0.5">{selected.freelancerName}</h3>
              <p className="text-xs text-text-secondary capitalize mt-0.5">{selected.freelancerSpecialization} &middot; {selected.freelancerField} track</p>
            </div>

            {/* Vetting Deliverables Links */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Deliverable Artifact</span>
                {selected.submissionUrl ? (
                  <a href={selected.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                    View Candidate Deliverable URL &rarr;
                  </a>
                ) : (
                  <p className="text-xs text-text-secondary mt-1">No URL provided.</p>
                )}
              </div>

              {selected.submissionNotes && (
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">Candidate Operational Notes</span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded border border-border mt-1 font-sans">
                    {selected.submissionNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Score Sliders */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-tertiary border-b border-border pb-1.5">
                <span>Dynamic Signal Criteria</span>
                <span className="text-accent font-semibold text-sm">{total} / 50</span>
              </div>
              {[
                { key: "functionalCoverage", label: "Functional Coverage" },
                { key: "logic", label: "Logical Structure" },
                { key: "usability", label: "Usability & UI" },
                { key: "edgeCases", label: "Edge Cases" },
                { key: "outputQuality", label: "Code/Asset Quality" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-semibold text-text-primary tabular-nums">{(scores as any)[key] || 0} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={(scores as any)[key] || 0}
                    onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full accent-accent bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border space-y-4">
              <div>
                <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-2">Evaluator Operational Feedback</label>
                <textarea
                  className="w-full text-xs p-3 rounded border border-border bg-surface focus:outline-none focus:border-accent font-sans placeholder:text-text-tertiary"
                  rows={4}
                  placeholder="Notes added here will be securely available to the freelancer."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between bg-surface/50 p-4 rounded-xl border border-border">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Caliber Outcome</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-text-primary">{total}</span>
                    <LevelBadge level={total <= 30 ? 1 : total <= 40 ? 2 : 3} />
                  </div>
                </div>
                <Button onClick={handleSubmitEvaluation} loading={submitting} disabled={submitting}>
                  Commit Evaluation & Lock Level
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
