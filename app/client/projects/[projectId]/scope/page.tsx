"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, ScoreBar, Card, Input, Textarea } from "@/components/ui";
import { formatCurrency, getLevelLabel } from "@/lib/utils";
import { CheckCircle2, X, Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <Link href="/client/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Dashboard</Link>
        <span className="text-sm font-medium text-text-primary">Scope Review</span>
        <Button variant="primary" onClick={confirmScope} loading={confirming} size="sm">
          Confirm scope & proceed
        </Button>
      </div>

      <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto space-y-10 animate-fade-up">
        {/* Header */}
        <div>
          <Badge variant="amber" className="mb-4">Awaiting your review</Badge>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
            <Badge variant="stone" className="capitalize text-xs font-semibold bg-stone-100 text-stone-600 border-stone-200">
              {project.field === "design_development" ? "Design & Development" : project.field}
            </Badge>
          </div>
          <p className="text-text-secondary">{project.goal}</p>
        </div>

        {/* Effort summary */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Effort Level", value: `Level ${scope.effortLevel} · ${getLevelLabel(scope.effortLevel)}` },
            { label: "Timeline", value: `${scope.timeline?.estimated} ${scope.timeline?.unit}` },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-text-secondary mb-1">{s.label}</div>
              <div className="text-xl font-semibold tracking-tight">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Functional Units */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-tight">Functional Units</h2>
            <Button variant="outline" size="sm" onClick={() => {
              setUpgradeForm({ whatToAdd: "", howItWorks: "", whyNeeded: "" });
              setProposedUpgrade(null);
              setUpgradeStep("intake");
              setShowAddModal(true);
            }}>
              + Add custom functionality
            </Button>
          </div>
          <div className="space-y-4">
            {scope.functionalUnits?.map((unit: any) => (
              <Card key={unit.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold">{unit.name}</h3>
                    <p className="text-xs text-text-secondary mt-1">{unit.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-2">Included</p>
                    <ul className="space-y-1">
                      {unit.included?.map((i: string) => <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5"><span className="text-success mt-0.5">✓</span>{i}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-2">Excluded</p>
                    <ul className="space-y-1">
                      {unit.excluded?.map((e: string) => <li key={e} className="text-xs text-text-secondary flex items-start gap-1.5"><span className="text-text-tertiary mt-0.5">×</span>{e}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        {pricing && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold tracking-tight mb-5">Pricing Breakdown</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-2.5 border-b border-border/40 pb-3 mb-1">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-text-secondary">Freelancer Price</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatCurrency(baseFreelancerPrice)}</span>
                </div>
                {clientAddedUnits.length > 0 && clientAddedUnits.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-text-secondary ml-4 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-border" />
                        {u.name} <span className="text-xs opacity-70">(Added by you)</span>
                      </span>
                    </div>
                    <span className="font-medium tabular-nums text-text-tertiary">{formatCurrency((u.unitScore || 0) * ratePerPoint)}</span>
                  </div>
                ))}
              </div>

              {[
                { label: "Scope Fee", value: pricing.scopeFee },
                { label: "Accountability Fee", value: pricing.accountabilityFee },
                { label: "Execution Fee (5%)", value: pricing.executionFee },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-text-secondary">{row.label}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatCurrency(row.value)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-xl font-semibold tabular-nums text-text-primary">{formatCurrency(pricing.total)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Rules */}
        {scope.revisionRules?.length > 0 && (
          <div className="grid grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3">Revision Rules</h3>
              <ul className="space-y-2">
                {scope.revisionRules.map((r: string) => <li key={r} className="text-xs text-text-secondary">{r}</li>)}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3">Upgrade Rules</h3>
              <ul className="space-y-2">
                {scope.upgradeRules.map((r: string) => <li key={r} className="text-xs text-text-secondary">{r}</li>)}
              </ul>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
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
                      onChange={e => setUpgradeForm({...upgradeForm, whatToAdd: e.target.value})}
                      placeholder="e.g. I want users to save rides and access them later."
                      className="w-full h-24 bg-stone-50 border border-border rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">2. How should this work when completed?</label>
                    <p className="text-[12px] text-text-secondary mb-3">Walk us through the expected behavior (who uses it, actions they take, outcomes).</p>
                    <textarea 
                      value={upgradeForm.howItWorks}
                      onChange={e => setUpgradeForm({...upgradeForm, howItWorks: e.target.value})}
                      placeholder="e.g. A student clicks a save button on a ride listing, accesses saved rides from their profile..."
                      className="w-full h-24 bg-stone-50 border border-border rounded-xl p-4 text-[13px] outline-none focus:border-[#E85239] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-stone-900 mb-2">3. Why is this change needed? (Optional)</label>
                    <input 
                      value={upgradeForm.whyNeeded}
                      onChange={e => setUpgradeForm({...upgradeForm, whyNeeded: e.target.value})}
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
                    <h4 className="text-[14px] font-bold text-stone-900 mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Included Capabilities</h4>
                    <ul className="space-y-2">
                      {proposedUpgrade.proposedUnit.included.map((item: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-secondary flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0"/> {item}
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
