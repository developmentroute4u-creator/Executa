"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Badge, Card, LevelBadge, ScoreBar } from "@/components/ui";

function downloadTaskAsPDF(test: any) {
  if (!test) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const specHtml = test.taskRequirements?.map((r: string) => `<li>${r}</li>`).join("") || "";
  const constraintsHtml = test.constraints?.map((c: string) => `<li>${c}</li>`).join("") || "";
  const deliverablesHtml = test.deliverables?.map((d: string) => `<li>${d}</li>`).join("") || "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Executa Assignment - ${test.specialization || "Skill Vetting"}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            line-height: 1.6;
            padding: 45px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
            letter-spacing: -0.025em;
          }
          .header p {
            font-size: 13.5px;
            color: #64748b;
            margin: 0;
          }
          .badge-container {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          .badge {
            background: #f1f5f9;
            color: #334155;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .badge.accent {
            background: #eff6ff;
            color: #2563eb;
          }
          h2 {
            font-size: 14px;
            font-weight: 700;
            color: #475569;
            margin-top: 35px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
          }
          p, li {
            font-size: 13.5px;
            color: #334155;
          }
          ul {
            padding-left: 20px;
            margin-top: 8px;
          }
          li {
            margin-bottom: 6px;
          }
          .prompt-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-size: 13px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            margin: 15px 0;
            white-space: pre-wrap;
            color: #0f172a;
            line-height: 1.5;
          }
          .footer {
            margin-top: 60px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Executa Assignment Brief</h1>
          <p>Synthesized dynamically by the Executa Vetting & Evaluation Engine</p>
          <div class="badge-container">
            <div class="badge accent">${test.specialization || "Skill Verification"}</div>
            <div class="badge">Level ${test.level || 2} assignment</div>
          </div>
        </div>

        <h2>01 / Project Context</h2>
        <p>${test.projectContext || "A high-scale tech solution designed to serve dynamic modern business workflows."}</p>

        <h2>02 / Business & Operational Problem</h2>
        <p>${test.businessProblem || "Design and implement a highly reliable interface and system architecture to minimize failure rates and drive transaction volume."}</p>

        <h2>03 / Assignment Prompt</h2>
        <div class="prompt-box">${test.taskPrompt}</div>

        <h2>04 / Technical Requirements</h2>
        <ul>
          ${specHtml || "<li>Build a robust and functional prototype demonstrating dynamic capability.</li>"}
        </ul>

        ${constraintsHtml ? `
          <h2>05 / Operational Constraints</h2>
          <ul>${constraintsHtml}</ul>
        ` : ""}

        ${deliverablesHtml ? `
          <h2>06 / Expected Deliverables</h2>
          <ul>${deliverablesHtml}</ul>
        ` : ""}

        <div class="footer">
          Executa Governed Execution Platform &copy; ${new Date().getFullYear()} &middot; Confidential Skill Assessment
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function FreelancerVettingTestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [test, setTest] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subUrl, setSubUrl] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch profile and current test
    Promise.all([
      fetch("/api/freelancer/profile").then((r) => r.json()),
      fetch("/api/freelancer/test").then((r) => r.json())
    ])
      .then(([profileData, testData]) => {
        setProfile(profileData.profile);
        setTest(testData.test);
      })
      .catch((err) => console.error("Error loading test info:", err))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleStartTest() {
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/freelancer/test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const d = await res.json();
        setTest(d.test);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to start test.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmitTest() {
    if (!subUrl) {
      setError("Please provide a submission URL or link.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/freelancer/test/${test._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl: subUrl, submissionNotes: subNotes }),
      });
      if (res.ok) {
        const d = await res.json();
        setTest(d.test);
      } else {
        setError("Submission failed. Try again.");
      }
    } catch {
      setError("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-text-secondary animate-pulse">Loading custom vetting workspace…</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-xl font-semibold">No assigned test found</h1>
        <p className="text-sm text-text-secondary max-w-sm">Please complete your onboarding profile to generate your custom vetting task.</p>
        <Button variant="primary" onClick={() => router.push("/freelancer/onboarding")}>Go to Onboarding</Button>
      </div>
    );
  }

  const specializations = profile?.specializations || [];
  const domains = (profile?.domain || "fullstack").split(",").map((d: string) => d.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Dynamic Navigation Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <Link href="/freelancer/dashboard" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>
          </div>
          <span className="text-sm font-semibold">Executa</span>
        </Link>
        <span className="text-xs text-text-secondary hidden md:inline font-medium">Vetting & Evaluation Tracks</span>
        <div>
          <Link href="/freelancer/dashboard" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
            ← Dashboard Home
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 max-w-3xl mx-auto space-y-10 animate-fade-up">
        
        {/* VIEW 1: ASSIGNED STATE (GUIDELINES PREVIEW & ACCEPT BUTTON) */}
        {test.status === "assigned" && (
          <div className="space-y-10">
            {/* Title Block */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="blue">Dynamic Evaluation Engine</Badge>
                <Badge variant="stone" className="font-semibold capitalize">Level {test.level || 2} Evaluation</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                Skill Evaluation Workspace
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                Executa rejects traditional theoretical tests, academic questions, and syntax memorization. Below is your custom, outcome-based project assignment designed to measure real-world ability.
              </p>
            </div>

            {/* Selected Profile summary */}
            <Card className="p-6 border-border bg-surface/50 space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Selected Expertise Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-[10px] text-text-tertiary mb-1.5 uppercase font-medium">Domain Tracks</div>
                  <div className="flex flex-wrap gap-2">
                    {domains.map((dom: string) => (
                      <span key={dom} className="px-2.5 py-1 bg-surface text-text-secondary text-xs rounded border border-border capitalize font-medium">{dom}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary mb-1.5 uppercase font-medium">Specializations</div>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec: string) => (
                      <span key={spec} className="px-2.5 py-1 bg-accent/5 text-accent text-xs rounded border border-accent/15 font-semibold">{spec}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Structured Real-World Assignment Details */}
            <div className="space-y-8">
              {/* Context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">01 / Project Context</h3>
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary leading-relaxed bg-surface p-5 rounded-lg border border-border/60">
                    {test.projectContext || "A high-growth technology platform facing complex scaling demands and user alignment constraints."}
                  </p>
                </div>
              </div>

              {/* Problem */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">02 / Business Problem</h3>
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {test.businessProblem || "Create a robust interface and back-end layer that addresses trust issues and drops high user abandonment rates."}
                  </p>
                </div>
              </div>

              {/* Prompt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">03 / Assignment Prompt</h3>
                <div className="md:col-span-2">
                  <div className="p-6 bg-accent-light/35 text-text-primary text-sm rounded-xl border border-accent/10 leading-relaxed font-sans">
                    {test.taskPrompt}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl bg-surface border border-border">
              <div className="space-y-1 max-w-md">
                <div className="text-sm font-semibold text-text-primary">Ready to begin your assignment?</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Once you accept, you will enter the working workspace to build and submit your prototype.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {error && <div className="text-xs text-error font-medium">{error}</div>}
                <button
                  onClick={() => downloadTaskAsPDF(test)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg border border-border bg-white text-text-secondary hover:border-border-strong flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Task (PDF)
                </button>
                <Button variant="primary" onClick={handleStartTest} loading={starting} className="px-6 py-2.5 text-xs font-semibold whitespace-nowrap">
                  Accept & Start Task
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: IN PROGRESS STATE (WORKSPACE + SUBMISSION FORM) */}
        {test.status === "in_progress" && (
          <div className="space-y-10">
            {/* Title Bar with PDF button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">In Progress</Badge>
                  <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Evaluation Workspace</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary capitalize">
                  {test.specialization || "Skill Verification Assignment"}
                </h1>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => downloadTaskAsPDF(test)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-border bg-white text-text-secondary hover:border-border-strong flex items-center gap-1.5 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Guidelines (PDF)
                </button>
              </div>
            </div>

            {/* Core Guidelines Card */}
            <div className="space-y-8">
              {/* Context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">01 / Context</h3>
                <div className="md:col-span-2">
                  <p className="text-sm text-text-secondary leading-relaxed bg-surface p-5 rounded-lg border border-border/60">
                    {test.projectContext || "A high-growth technology platform facing complex scaling demands and user alignment constraints."}
                  </p>
                </div>
              </div>

              {/* Problem */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">02 / Business Problem</h3>
                <div className="md:col-span-2 text-sm text-text-secondary leading-relaxed">
                  {test.businessProblem || "Design and implement a highly reliable interface and system architecture to minimize failure rates."}
                </div>
              </div>

              {/* Prompt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">03 / Assignment</h3>
                <div className="md:col-span-2">
                  <div className="p-6 bg-accent-light/35 text-text-primary text-sm rounded-xl border border-accent/10 leading-relaxed font-sans">
                    {test.taskPrompt}
                  </div>
                </div>
              </div>

              {/* Requirements list */}
              {test.taskRequirements && test.taskRequirements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">04 / Requirements</h3>
                  <div className="md:col-span-2">
                    <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
                      {test.taskRequirements.map((r: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5">
                          <span className="text-accent shrink-0 font-bold">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Technical Constraints */}
              {test.constraints && test.constraints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">05 / Constraints</h3>
                  <div className="md:col-span-2">
                    <ul className="space-y-2.5 text-sm text-text-secondary">
                      {test.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5">
                          <span className="text-accent shrink-0 font-bold">✕</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Deliverables checklist */}
              {test.deliverables && test.deliverables.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline border-t border-border pt-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">06 / Expected Output</h3>
                  <div className="md:col-span-2">
                    <ul className="space-y-2.5 text-sm text-text-secondary">
                      {test.deliverables.map((d: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Upload Form Card */}
            <Card className="p-6 border border-border/90 bg-surface/50 space-y-6">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] text-accent uppercase font-bold tracking-wider">Ready to Deliver?</span>
                <h3 className="text-base font-semibold text-text-primary">Upload your workspace prototype</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-text-primary">Submission URL or Link <span className="text-error">*</span></label>
                  <input
                    className="w-full rounded border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="GitHub repository, Figma canvas, cloud folder link…"
                    value={subUrl}
                    onChange={(e) => setSubUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-text-primary">Operational Notes & Details (optional)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                    placeholder="Provide execution insights, setup choices, or login credentials if needed…"
                    value={subNotes}
                    onChange={(e) => setSubNotes(e.target.value)}
                  />
                </div>
                {error && <p className="text-xs text-error font-medium">{error}</p>}
                <Button variant="primary" onClick={handleSubmitTest} loading={submitting} className="px-5 py-2.5 text-xs font-semibold">
                  Submit Skill Test For Vetting
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* VIEW 3: SUBMITTED OR UNDER REVIEW STATE */}
        {(test.status === "submitted" || test.status === "under_review") && (
          <Card className="p-12 text-center border border-border bg-surface/30 space-y-6 animate-scale-in">
            <div className="w-14 h-14 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">Evaluation Submission In Review</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                Your vetting prototype has been safely received. Our automated rubrics and expert evaluators are scoring your codebase context.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/5 border border-amber-500/15 text-[11px] text-[#B45309] font-medium font-mono">
                Estimated Queue Wait Time: 24–48 hours
              </div>
            </div>
            <div className="pt-4 border-t border-border/80">
              <Link href="/freelancer/dashboard">
                <Button variant="outline" className="px-5 py-2 text-xs">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* VIEW 4: EVALUATED AND RATED COMPLETE STATE */}
        {test.status === "evaluated" && test.evaluation && (
          <Card className="p-6 space-y-6 animate-fade-up">
            {/* Vetting complete header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-success uppercase font-bold tracking-wider">Verification Complete</span>
                <h3 className="text-base font-semibold text-text-primary mt-0.5">Vetting Performance Breakdown</h3>
              </div>
              <LevelBadge level={profile?.level || 1} />
            </div>

            {/* Summary scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-lg text-center border border-border">
                <div className="text-3xl font-semibold tabular-nums text-text-primary">{test.evaluation.total}</div>
                <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider mt-1">Total score / 50</div>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg text-center border border-accent/10">
                <div className="text-sm font-semibold text-accent capitalize">{profile?.field} Track</div>
                <div className="text-xs text-text-secondary mt-1">Verified Expert Level {profile?.level || 2}</div>
              </div>
            </div>

            {/* Rubrics breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Evaluation Rubric Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "functionalCoverage", label: "Functional Coverage" },
                  { key: "logic", label: "Logical Structure" },
                  { key: "usability", label: "Usability & Layout UI" },
                  { key: "edgeCases", label: "Edge Case Robustness" },
                  { key: "outputQuality", label: "Code & Asset Quality" },
                ].map(({ key, label }) => (
                  <ScoreBar key={key} label={label} score={test.evaluation[key] ?? 0} max={10} />
                ))}
              </div>
            </div>

            {/* Evaluator Notes */}
            {test.evaluation.evaluatorNotes && (
              <div className="p-4 bg-surface rounded-lg border border-border space-y-1.5">
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Evaluator Feedback Insights</div>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">{test.evaluation.evaluatorNotes}</p>
              </div>
            )}

            {/* Back to dashboard button */}
            <div className="pt-4 border-t border-border flex justify-end">
              <Link href="/freelancer/dashboard">
                <Button variant="primary" className="px-5 py-2 text-xs font-semibold">
                  Proceed to Projects Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
