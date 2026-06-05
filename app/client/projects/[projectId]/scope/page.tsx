"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, ScoreBar, Card, Input, Textarea } from "@/components/ui";
import { formatCurrency, getLevelLabel } from "@/lib/utils";
import { CheckCircle2, X, Loader2, Check } from "lucide-react";

export default function ScopeReviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<"intake" | "loading" | "review">("intake");
  const [upgradeForm, setUpgradeForm] = useState({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
  const [proposedUpgrade, setProposedUpgrade] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [showPlatformFees, setShowPlatformFees] = useState(false);

  async function handleGenerateCustomUnit() {
    if (!upgradeForm.whatToAdd || !upgradeForm.howItWorks) return;
    setUpgradeStep("loading");
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-custom-unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upgradeForm)
      });
      if (res.ok) {
        const data = await res.json();
        setProposedUpgrade(data);
        setUpgradeStep("review");
      } else {
        setUpgradeStep("intake");
        alert("Failed to generate unit. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUpgradeStep("intake");
    }
  }

  async function handleAddCustomUnit() {
    if (!proposedUpgrade?.proposedUnit) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customUnit: proposedUpgrade.proposedUnit })
      });
      const updated = await res.json();
      if (res.ok && updated.project && updated.scope) {
        setData(updated);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add custom unit:", err);
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function confirmScope() {
    setConfirming(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "matching" }),
    });
    router.push(`/client/projects/${projectId}/match`);
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sm text-text-secondary">Loading scope…</div>
    </div>
  );

  const { project, scope } = data || {};
  if (!project || !scope) return null;

  const pricing = project.pricing;

  // Filter exclusively for functionalities that the user manually appended
  const clientAddedUnits = scope?.functionalUnits?.filter((u: any) => u.addedByClient) || [];
  const ratePerPoint = pricing?.ratePerPoint || 400;
  const customScore = clientAddedUnits.reduce((sum: number, u: any) => sum + (u.unitScore || 0), 0);
  const customFee = customScore * ratePerPoint;
  const baseFreelancerPrice = pricing ? pricing.freelancerPrice - customFee : 0;

  const timelineEstimated = scope.timeline?.estimated || 0;
  const timelineUnit = scope.timeline?.unit || "weeks";
  let timelineDisplay = `${timelineEstimated} ${timelineUnit}`;

  if (timelineUnit === "weeks" && timelineEstimated > 0) {
      const months = (timelineEstimated / 4.33).toFixed(1);
      const formattedMonths = months.endsWith(".0") ? months.slice(0, -2) : months;
      timelineDisplay = `${timelineEstimated} weeks (${formattedMonths} month${formattedMonths === "1" ? "" : "s"})`;
  } else if (timelineUnit === "days" && timelineEstimated > 0) {
      const months = (timelineEstimated / 30).toFixed(1);
      const formattedMonths = months.endsWith(".0") ? months.slice(0, -2) : months;
      timelineDisplay = `${timelineEstimated} days (${formattedMonths} month${formattedMonths === "1" ? "" : "s"})`;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-4 sm:px-8 justify-between gap-2">
        <Link href="/client/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">← Dashboard</Link>
        <span className="text-sm font-medium text-text-primary hidden sm:block">Scope Review</span>
        <Button variant="primary" onClick={confirmScope} loading={confirming} size="sm">
          <span className="hidden sm:inline">Confirm scope & proceed</span>
          <span className="sm:hidden">Confirm</span>
        </Button>
      </div>

      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-8 sm:space-y-12 animate-fade-up">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col gap-3">
            <div>
               <span className="text-xs font-bold uppercase tracking-widest text-[#E85239] mb-2 block">Scope Definition</span>
               <div className="flex flex-wrap items-center gap-3">
                 <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">{project.title}</h1>
                 <span className="capitalize text-[11px] font-bold bg-[#FFF7F5] text-[#E85239] border border-[#FCE1DC] px-3 py-1 rounded-md">
                   {project.field === "design_development" ? "Design & Development" : project.field}
                 </span>
               </div>
            </div>
          </div>
          {project.goal && (
             <p className="text-sm text-stone-500 mt-4 leading-relaxed max-w-3xl">{project.goal}</p>
          )}
        </div>

        {/* Effort summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {[
            { label: "Effort Level", value: `Level ${scope.effortLevel} · ${getLevelLabel(scope.effortLevel)}` },
            { label: "Timeline", value: timelineDisplay },
          ].map((s) => (
            <Card key={s.label} className="p-4 sm:p-6 shadow-sm border-stone-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{s.label}</div>
              <div className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-800">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Functional Units */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-semibold tracking-tight">Functional Units</h2>
            <Button variant="outline" size="sm" onClick={() => {
              setUpgradeForm({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
              setProposedUpgrade(null);
              setUpgradeStep("intake");
              setShowAddModal(true);
            }}>
              + Add custom
            </Button>
          </div>
          <div className="space-y-6">
            {scope.functionalUnits?.map((unit: any) => (
              <Card key={unit.id} className="p-5 sm:p-8 shadow-sm border-stone-200">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-stone-900">{unit.name}</h3>
                    <p className="text-sm text-stone-500 mt-2 leading-relaxed">{unit.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-100">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">Included</p>
                    <ul className="space-y-3">
                      {unit.included?.map((i: string) => (
                        <li key={i} className="text-[13px] text-stone-600 flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 bg-emerald-100 text-emerald-600 rounded-full p-0.5"><Check size={12} strokeWidth={3} /></div>
                          <span className="leading-relaxed">{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">Excluded</p>
                    <ul className="space-y-3">
                      {unit.excluded?.map((e: string) => (
                        <li key={e} className="text-[13px] text-stone-500 flex items-start gap-3 opacity-80">
                          <div className="mt-0.5 shrink-0 bg-stone-100 text-stone-400 rounded-full p-0.5"><X size={12} strokeWidth={3} /></div>
                          <span className="leading-relaxed">{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        {pricing && (
          <Card className="p-5 sm:p-8 border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#E85239] to-[#FF5B3A]" />
            <div className="flex flex-col items-center text-center space-y-3">
              <div>
                <h2 className="text-[12px] font-black text-stone-400 uppercase tracking-widest mb-3">Expert Execution Cost</h2>
                <div className="text-4xl sm:text-6xl font-black tabular-nums tracking-tighter text-[#E85239]">
                  {formatCurrency(baseFreelancerPrice)}
                </div>
              </div>
              <p className="text-[13px] text-stone-500 max-w-sm mx-auto leading-relaxed">
                This is the final cost to execute your scope. Paid directly to your expert upon milestone completion.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col items-center">
              <button
                onClick={() => setShowPlatformFees(!showPlatformFees)}
                className="text-[12px] font-bold text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2"
              >
                {showPlatformFees ? "Hide complete breakdown" : "View complete breakdown"}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${showPlatformFees ? 'rotate-180' : ''}`}>
                   <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showPlatformFees && (
                <div className="w-full max-w-md mx-auto mt-6 space-y-1 text-[13px] animate-in fade-in duration-300">
                  <div className="flex justify-between items-center py-3 border-b border-stone-200 mb-3">
                    <span className="font-bold text-stone-900">Expert Execution Cost</span>
                    <span className="font-bold text-[15px] tabular-nums text-stone-900">{formatCurrency(baseFreelancerPrice)}</span>
                  </div>

                  {clientAddedUnits.length > 0 && clientAddedUnits.map((u: any) => (
                    <div key={u.id} className="flex justify-between items-center py-2">
                      <span className="text-stone-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E85239]/40" />
                        {u.name} <span className="text-[10px] font-bold text-[#E85239] uppercase tracking-wider ml-1">Added</span>
                      </span>
                      <span className="font-medium tabular-nums text-stone-900">{formatCurrency((u.unitScore || 0) * ratePerPoint)}</span>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-stone-100 border-dashed" />
                  
                  <div className="flex justify-between items-center py-2 opacity-60">
                    <span className="text-stone-600 flex items-center gap-2">
                      Platform Scope Fee <Badge variant="stone" className="bg-stone-200/50 text-stone-500 text-[10px] h-4.5 px-1.5 leading-none">Paid</Badge>
                    </span>
                    <span className="tabular-nums font-medium text-stone-600">{formatCurrency(pricing.scopeFee)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 opacity-60">
                    <span className="text-stone-600 flex items-center gap-2">
                      Platform Accountability Fee <Badge variant="stone" className="bg-stone-200/50 text-stone-500 text-[10px] h-4.5 px-1.5 leading-none">Paid</Badge>
                    </span>
                    <span className="tabular-nums font-medium text-stone-600">{formatCurrency(pricing.accountabilityFee)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 opacity-60">
                    <span className="text-stone-600 flex items-center gap-2">
                      Platform Execution Fee <Badge variant="stone" className="bg-stone-200/50 text-stone-500 text-[10px] h-4.5 px-1.5 leading-none">Paid</Badge>
                    </span>
                    <span className="tabular-nums font-medium text-stone-600">{formatCurrency(pricing.executionFee)}</span>
                  </div>
                  
                  <div className="pt-4 mt-6 border-t border-stone-200 flex justify-between items-center">
                    <span className="font-bold text-stone-900">This project's total value</span>
                    <span className="font-black text-lg tabular-nums text-stone-900">{formatCurrency(pricing.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Rules */}
        {scope.revisionRules?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-5 sm:p-8 shadow-sm border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">Revision Rules</h3>
              <ul className="space-y-3">
                {scope.revisionRules.map((r: string) => <li key={r} className="text-[13px] text-stone-500 leading-relaxed flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0 mt-1.5" />{r}</li>)}
              </ul>
            </Card>
            <Card className="p-5 sm:p-8 shadow-sm border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">Upgrade Rules</h3>
              <ul className="space-y-3">
                {scope.upgradeRules.map((r: string) => <li key={r} className="text-[13px] text-stone-500 leading-relaxed flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0 mt-1.5" />{r}</li>)}
              </ul>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
          <Button variant="outline" href="/client/dashboard">Back to dashboard</Button>
          <Button variant="primary" onClick={confirmScope} loading={confirming}>Confirm scope & find freelancer</Button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-up">
            <div className="p-6 border-b border-border flex justify-between items-center bg-stone-50/50 rounded-t-2xl">
              <h2 className="text-[18px] font-bold text-stone-900">Add Custom Functionality</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {upgradeStep === "intake" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">1. What would you like to add, change, or improve?</label>
                    <p className="text-[12px] text-text-secondary mb-3">Describe the new functionality, workflow, or enhancement in business terms.</p>
                    <textarea
                      value={upgradeForm.whatToAdd}
                      onChange={e => setUpgradeForm({ ...upgradeForm, whatToAdd: e.target.value })}
                      placeholder="e.g. I want users to save rides and access them later."
                      className="w-full h-24 bg-stone-50 border border-border rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">2. How should this work when completed?</label>
                    <p className="text-[12px] text-text-secondary mb-3">Walk us through the expected behavior (who uses it, actions they take, outcomes).</p>
                    <textarea
                      value={upgradeForm.howItWorks}
                      onChange={e => setUpgradeForm({ ...upgradeForm, howItWorks: e.target.value })}
                      placeholder="e.g. A student clicks a save button on a ride listing, accesses saved rides from their profile..."
                      className="w-full h-24 bg-stone-50 border border-border rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">3. Why is this change needed? (Optional)</label>
                    <input
                      value={upgradeForm.whyNeeded}
                      onChange={e => setUpgradeForm({ ...upgradeForm, whyNeeded: e.target.value })}
                      placeholder="e.g. User feedback requested this feature."
                      className="w-full bg-stone-50 border border-border rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239]"
                    />
                  </div>
                </div>
              )}

              {upgradeStep === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#E85239] mb-4" size={32} />
                  <h3 className="text-[16px] font-bold text-stone-900">AI Analyzing Scope Impact...</h3>
                  <p className="text-[13px] text-text-secondary mt-2 text-center max-w-sm">Generating a precise functional unit and calculating the effort requirements.</p>
                </div>
              )}

              {upgradeStep === "review" && proposedUpgrade?.proposedUnit && (
                <div className="flex flex-col gap-6">
                  <div className="bg-[#FFF7F6] border border-orange-100 rounded-2xl p-6">
                    <h3 className="text-[18px] font-bold text-stone-900 mb-2">{proposedUpgrade.proposedUnit.name}</h3>
                    <p className="text-[13px] text-stone-700 leading-relaxed">{proposedUpgrade.proposedUnit.description}</p>
                  </div>

                  <div>
                    <h4 className="text-[14px] font-bold text-stone-900 mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Included Capabilities</h4>
                    <ul className="space-y-2">
                      {proposedUpgrade.proposedUnit.included.map((item: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-secondary flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-stone-50 border border-border rounded-2xl p-6">
                    <h4 className="text-[14px] font-bold text-stone-900 mb-2">Scope Impact Summary</h4>
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-0">{proposedUpgrade.impact}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-stone-50/50 rounded-b-2xl flex justify-end">
              {upgradeStep === "intake" && (
                <Button
                  variant="primary"
                  onClick={handleGenerateCustomUnit}
                  disabled={!upgradeForm.whatToAdd || !upgradeForm.howItWorks}
                >
                  Generate Proposal
                </Button>
              )}
              {upgradeStep === "review" && (
                <Button
                  variant="primary"
                  onClick={handleAddCustomUnit}
                  loading={adding}
                >
                  Confirm & Add to Scope
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
