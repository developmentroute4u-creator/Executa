"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui";

export function FeatureControlsTab() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/feature-flags")
      .then(res => res.json())
      .then(data => {
        if (data.flags) setFlags(data.flags);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, enabled: boolean) => {
    // Optimistic update
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled } : f));
    
    try {
      await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
    } catch (err) {
      // Revert on error
      setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !enabled } : f));
      console.error("Failed to toggle flag", err);
    }
  };

  const freelancerFlags = flags.filter(f => f.role === "freelancer");
  const clientFlags = flags.filter(f => f.role === "client");

  if (loading) {
    return <div className="py-12 text-center text-xs text-text-secondary">Loading system flags...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">Feature Controls</h2>
        <p className="text-xs text-text-secondary mt-1">Turn sections on or off globally. Takes effect immediately upon reload.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Freelancer Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">Freelancer Experience</h3>
          <div className="space-y-3">
            {freelancerFlags.map((flag) => (
              <Card key={flag.key} className={`p-4 flex items-center justify-between transition-colors ${flag.enabled ? "bg-white" : "bg-surface border-dashed"}`}>
                <div className="space-y-0.5">
                  <p className={`text-sm font-semibold ${flag.enabled ? "text-text-primary" : "text-text-tertiary"}`}>{flag.name}</p>
                  <p className={`text-[10px] ${flag.enabled ? "text-text-secondary" : "text-text-tertiary"}`}>{flag.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(flag.key, !flag.enabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${flag.enabled ? "bg-red-500" : "bg-stone-300"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${flag.enabled ? "translate-x-4.5" : "translate-x-1"}`} />
                </button>
              </Card>
            ))}
            {freelancerFlags.length === 0 && <p className="text-xs text-text-secondary">No freelancer flags found.</p>}
          </div>
        </div>

        {/* Client Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">Client Experience</h3>
          <div className="space-y-3">
            {clientFlags.map((flag) => (
              <Card key={flag.key} className={`p-4 flex items-center justify-between transition-colors ${flag.enabled ? "bg-white" : "bg-surface border-dashed"}`}>
                <div className="space-y-0.5">
                  <p className={`text-sm font-semibold ${flag.enabled ? "text-text-primary" : "text-text-tertiary"}`}>{flag.name}</p>
                  <p className={`text-[10px] ${flag.enabled ? "text-text-secondary" : "text-text-tertiary"}`}>{flag.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(flag.key, !flag.enabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${flag.enabled ? "bg-red-500" : "bg-stone-300"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${flag.enabled ? "translate-x-4.5" : "translate-x-1"}`} />
                </button>
              </Card>
            ))}
            {clientFlags.length === 0 && <p className="text-xs text-text-secondary">No client flags found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
