"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Badge, Card, Input, Textarea } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function MatchFreelancerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appointing, setAppointing] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Custom freelancer simulator form state
  const [simName, setSimName] = useState("");
  const [simDomain, setSimDomain] = useState("fullstack");
  const [simBio, setSimBio] = useState("");
  const [simSpecs, setSimSpecs] = useState("");
  const [simLevel, setSimLevel] = useState(2);
  const [simScore, setSimScore] = useState(90);
  const [simRate, setSimRate] = useState(300);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/match`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.freelancers?.length > 0) {
          setSelectedId(d.bestMatchId || d.freelancers[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleAppoint(freelancerId: string) {
    setAppointing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId }),
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

  async function handleAddSimulatedFreelancer(e: React.FormEvent) {
    e.preventDefault();
    if (!simName || !simBio) return;

    setSimulating(true);
    try {
      // Direct POST to register a mock user & freelancer profile
      const userRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: simName,
          email: `${simName.toLowerCase().replace(/\s/g, ".")}@executa.io`,
          password: "password123",
          role: "freelancer",
        }),
      });
      const user = await userRes.json();

      if (userRes.ok && user.user?.id) {
        // Create matching Freelancer Profile
        const profileRes = await fetch("/api/freelancer/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.user.id,
            field: data?.project?.field || "development",
            domain: simDomain,
            specializations: simSpecs.split(",").map(s => s.trim()).filter(Boolean),
            bio: simBio,
            level: Number(simLevel),
            testScore: Number(simScore),
            ratePerPoint: Number(simRate),
            available: true,
            testStatus: "approved"
          }),
        });

        if (profileRes.ok) {
          // Re-fetch match data
          const refetchRes = await fetch(`/api/projects/${projectId}/match`);
          const refetched = await refetchRes.json();
          setData(refetched);
          setSelectedId(user.user.id);
          setShowSimulateModal(false);
          // Reset form
          setSimName("");
          setSimBio("");
          setSimSpecs("");
        }
      }
    } catch (err) {
      console.error("Failed to add simulated freelancer:", err);
    } finally {
      setSimulating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sm text-text-secondary">AI evaluation engine running match analysis…</div>
    </div>
  );

  const { project, scope, freelancers = [] } = data || {};
  const selectedFreelancer = freelancers.find((f: any) => f.id === selectedId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-8 justify-between">
        <Link href={`/client/projects/${projectId}/scope`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Review Scope</Link>
        <span className="text-sm font-medium text-text-primary">Governed Matching Engine</span>
        <Button variant="outline" size="sm" onClick={() => setShowSimulateModal(true)}>
          + Add Candidate Freelancer
        </Button>
      </div>

      <div className="pt-24 pb-16 px-8 max-w-5xl mx-auto space-y-8 animate-fade-up">
        {/* Title */}
        <div>
          <Badge variant="blue" className="mb-3">Scope Confirmed</Badge>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Qualified Execution Match</h1>
          <p className="text-text-secondary text-sm max-w-xl">
            Our algorithmic governance layer has matched your confirmed project scope against verified, vetted specialists who completed the Executa evaluations.
          </p>
        </div>

        {success ? (
          <Card className="p-8 text-center border-emerald-500/20 bg-emerald-500/5 py-16 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto text-2xl">✓</div>
            <h2 className="text-xl font-semibold text-text-primary">Appointing Complete!</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Your governed execution contract is finalized. You are being redirected to your active project workspace.
            </p>
          </Card>
        ) : freelancers.length === 0 ? (
          <Card className="p-8 text-center py-16 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">No Matching Freelancers Available</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Add a candidate freelancer manually to test the AI evaluation and start the project.
            </p>
            <Button variant="primary" onClick={() => setShowSimulateModal(true)}>
              + Add Candidate Freelancer
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-5 gap-8 items-start">
            {/* Candidate List (Left) */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Candidate Pool</h2>
              <div className="space-y-3">
                {freelancers.map((f: any) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden bg-card hover:bg-card-hover ${
                      selectedId === f.id
                        ? "border-accent shadow-sm"
                        : "border-border/60"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-semibold tracking-tight text-text-primary">{f.name}</div>
                        <div className="text-xs text-text-secondary capitalize mt-0.5">{f.domain} · Level {f.level}</div>
                      </div>
                      <Badge variant={f.fitScore >= 90 ? "green" : "blue"} className="tabular-nums">
                        {f.fitScore}% Match
                      </Badge>
                    </div>
                    <div className="text-xs text-text-secondary line-clamp-2 mt-2 leading-relaxed">
                      {f.bio}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation Report (Right) */}
            <div className="col-span-3 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">AI Evaluation & recommendation</h2>
              {selectedFreelancer && (
                <Card className="p-6 space-y-6">
                  <div className="flex justify-between items-start border-b border-border/40 pb-5">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{selectedFreelancer.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="stone" className="capitalize text-xs">{selectedFreelancer.domain} Specialist</Badge>
                        <Badge variant="stone" className="text-xs">Level {selectedFreelancer.level} Developer</Badge>
                        <span className="text-xs text-text-secondary tabular-nums">Test Score: {selectedFreelancer.testScore}/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-secondary">AI Evaluation Match</div>
                      <div className="text-2xl font-semibold text-accent tracking-tight tabular-nums mt-0.5">{selectedFreelancer.fitScore}%</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-1.5">Expert Profile</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{selectedFreelancer.bio}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFreelancer.specializations?.map((spec: string) => (
                          <span key={spec} className="px-2 py-0.5 bg-surface text-text-secondary text-[11px] rounded-md border border-border">{spec}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-2">
                      <h4 className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        AI Alignment Analysis
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {selectedFreelancer.fitReason}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-text-secondary">Unified Scope Cost</span>
                      <div className="text-xl font-semibold tabular-nums text-text-primary mt-0.5">
                        {formatCurrency(project.pricing?.total)}
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => handleAppoint(selectedFreelancer.id)} loading={appointing}>
                      {appointing ? "Appointing..." : `Hire ${selectedFreelancer.name} & Start`}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-border/60">
              <h3 className="text-base font-semibold tracking-tight">Simulate & Add Qualified Freelancer</h3>
              <p className="text-xs text-text-secondary mt-1">Add a vetted freelancer with specific skills to see how the AI dynamically matches them against your scope.</p>
            </div>
            <form onSubmit={handleAddSimulatedFreelancer} className="p-6 space-y-4 text-left">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Freelancer Name</label>
                <Input value={simName} onChange={e => setSimName(e.target.value)} placeholder="e.g. John Doe" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Domain</label>
                  <select
                    value={simDomain}
                    onChange={e => setSimDomain(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Fullstack</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Skill Level</label>
                  <select
                    value={simLevel}
                    onChange={e => setSimLevel(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value={1}>Level 1 (Junior)</option>
                    <option value={2}>Level 2 (Mid-Level)</option>
                    <option value={3}>Level 3 (Senior)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Test Score (1-100)</label>
                  <Input type="number" min={1} max={100} value={simScore} onChange={e => setSimScore(Number(e.target.value))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Point Rate (INR)</label>
                  <Input type="number" value={simRate} onChange={e => setSimRate(Number(e.target.value))} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Specializations (comma separated)</label>
                <Input value={simSpecs} onChange={e => setSimSpecs(e.target.value)} placeholder="React, APIs, Payments, Search" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Short Bio</label>
                <Textarea value={simBio} onChange={e => setSimBio(e.target.value)} placeholder="Explain their background and what kind of projects they build..." required rows={3} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setShowSimulateModal(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit" loading={simulating}>
                  {simulating ? "Seeding..." : "Seed Candidate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
