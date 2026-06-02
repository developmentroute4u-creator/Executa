"use client";
import { Card } from "@/components/ui";

export function SettingsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">System Settings</h2>
        <p className="text-xs text-text-secondary mt-1">Platform configuration and scoring matrices reference.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Level Scoring Matrix */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border pb-2">Level Scoring Matrix</h3>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Freelancer capability bounds are dictated by their absolute test score (out of 50). This bounds their capability tier for matching.
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">Level 1 (Foundational)</span>
              <span className="text-xs font-bold text-accent">1 – 30 points</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">Level 2 (Advanced)</span>
              <span className="text-xs font-bold text-accent">31 – 40 points</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">Level 3 (Expert)</span>
              <span className="text-xs font-bold text-accent">41 – 50 points</span>
            </div>
          </div>
        </Card>

        {/* Rate Bands */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border pb-2">Platform Rate Bands</h3>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            The base rate per functional scope point is dictated by the complexity of the project (effort score mapping to Level 1-3).
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">L1 Project Scope</span>
              <span className="text-xs font-bold text-accent">₹25 – ₹45 / pt</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">L2 Project Scope</span>
              <span className="text-xs font-bold text-accent">₹45 – ₹80 / pt</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-primary">L3 Project Scope</span>
              <span className="text-xs font-bold text-accent">₹80 – ₹120 / pt</span>
            </div>
          </div>
        </Card>

        {/* Platform Status */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-text-primary border-b border-border pb-2">Platform Operational Status</h3>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Platform Live — All systems running</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
