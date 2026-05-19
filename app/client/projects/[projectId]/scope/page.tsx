"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, ScoreBar, Card, Input, Textarea } from "@/components/ui";
import { formatCurrency, getLevelLabel } from "@/lib/utils";

export default function ScopeReviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState({
    name: "",
    description: "",
    included: "",
    excluded: "",
    deliverables: "",
    unitScore: 30,
  });

  async function handleAddCustomUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!newUnit.name) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUnit: {
            name: newUnit.name,
            description: newUnit.description,
            included: newUnit.included.split(",").map(s => s.trim()).filter(Boolean),
            excluded: newUnit.excluded.split(",").map(s => s.trim()).filter(Boolean),
            deliverables: newUnit.deliverables.split(",").map(s => s.trim()).filter(Boolean),
            unitScore: newUnit.unitScore,
          }
        })
      });
      const updated = await res.json();
      if (res.ok && updated.project && updated.scope) {
        setData(updated);
        setShowAddModal(false);
        setNewUnit({ name: "", description: "", included: "", excluded: "", deliverables: "", unitScore: 30 });
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
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{project.title}</h1>
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
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
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
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Add Custom Functionality</h2>
              <p className="text-xs text-text-secondary mt-1">If our AI engine missed any details, append them to your project brief here.</p>
            </div>

            <form onSubmit={handleAddCustomUnit} className="space-y-4">
              <Input
                label="Functionality Name"
                placeholder="e.g. Appointment Booking Calendar"
                value={newUnit.name}
                onChange={e => setNewUnit({ ...newUnit, name: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                placeholder="Allows patients to schedule dental checkups online based on calendar availability slot parameters."
                rows={4}
                value={newUnit.description}
                onChange={e => setNewUnit({ ...newUnit, description: e.target.value })}
                required
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit" loading={adding}>
                  {adding ? "Adding..." : "Add to Scope"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
