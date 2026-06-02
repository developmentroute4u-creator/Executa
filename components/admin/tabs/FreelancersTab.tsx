"use client";
import { useState } from "react";
import { Card, Badge, Button, LevelBadge } from "@/components/ui";

export function FreelancersTab({ freelancers, fetchOverview }: { freelancers: any[], fetchOverview: () => void }) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");

  const [overrideModal, setOverrideModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = freelancers.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (levelFilter !== "all" && f.level !== Number(levelFilter)) return false;
    if (fieldFilter !== "all" && f.field !== fieldFilter) return false;
    return true;
  });

  const handleAction = async (action: string, payload: any) => {
    if (action === "reset_freelancer_test" && !confirm("Are you sure you want to completely wipe this freelancer's test?")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        setOverrideModal(null);
        fetchOverview();
      } else {
        const err = await res.json();
        alert(`Action failed: ${err.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Search name, email, specialization..."
          className="flex-1 text-sm p-2 rounded-lg border border-border focus:outline-none focus:border-accent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="text-sm p-2 rounded-lg border border-border bg-transparent focus:outline-none focus:border-accent"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
        <select
          className="text-sm p-2 rounded-lg border border-border bg-transparent focus:outline-none focus:border-accent"
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
        >
          <option value="all">All Fields</option>
          <option value="design">Design</option>
          <option value="development">Development</option>
        </select>
        <span className="text-xs text-text-secondary font-medium whitespace-nowrap px-2">
          Showing {filtered.length} profile{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((f: any) => (
          <Card key={f._id} className="p-6 space-y-4 relative overflow-hidden">
            {f.suspended && (
              <div className="absolute top-0 inset-x-0 bg-red-100 text-red-700 text-center py-1 text-[10px] font-bold uppercase tracking-wider">
                Account Suspended
              </div>
            )}
            <div className={`space-y-1 ${f.suspended ? "pt-3" : ""}`}>
              <h3 className="text-sm font-semibold text-text-primary">{f.name}</h3>
              <p className="text-[11px] text-text-tertiary">{f.email}</p>
            </div>
            <div className="text-xs text-text-secondary capitalize">
              <span className="font-semibold text-accent">{f.field} track</span> &middot; {f.specializations?.join(", ") || "General"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={f.testStatus === "approved" ? "green" : f.testStatus === "under_review" ? "amber" : "stone"}>
                {f.testStatus === "approved" ? `Calibrated (${f.testScore}/50)` : f.testStatus.replace("_", " ")}
              </Badge>
              {f.testStatus === "approved" && f.level && <LevelBadge level={f.level} />}
            </div>
            <div className="text-xs font-semibold text-text-primary border-t border-border pt-4">
              Rate: ₹{f.ratePerPoint || 0} / pt
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 text-[11px]" onClick={() => setOverrideModal({ ...f })}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-1.5"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="px-2" title="Reset Test" onClick={() => handleAction("reset_freelancer_test", { freelancerId: f.userId })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </Button>
              <Button variant="outline" size="sm" className={`px-2 ${f.suspended ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`} title={f.suspended ? "Activate User" : "Suspend User"} onClick={() => handleAction("suspend_user", { userId: f.userId, suspended: !f.suspended })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M12 14c-5 0-9 4-9 8h18c0-4-4-8-9-8z"/></svg>
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-xs text-text-secondary">No freelancers found.</p>
          </div>
        )}
      </div>

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text-primary">Edit Profile Calibration</h2>
              <p className="text-xs text-text-secondary">{overrideModal.name} ({overrideModal.email})</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Override Caliber Level</label>
                <select
                  className="w-full text-sm p-2 rounded-lg border border-border bg-surface focus:outline-none focus:border-accent"
                  value={overrideModal.level || 1}
                  onChange={(e) => setOverrideModal({ ...overrideModal, level: Number(e.target.value) })}
                >
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-primary">Override Test Score</label>
                  <span className="text-xs font-bold">{overrideModal.testScore || 0} / 50</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={overrideModal.testScore || 0}
                  onChange={(e) => setOverrideModal({ ...overrideModal, testScore: Number(e.target.value) })}
                  className="w-full accent-accent bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-primary">Rate Per Point (₹)</label>
                  <span className="text-xs font-bold">₹{overrideModal.ratePerPoint || 20}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={120}
                  value={overrideModal.ratePerPoint || 20}
                  onChange={(e) => setOverrideModal({ ...overrideModal, ratePerPoint: Number(e.target.value) })}
                  className="w-full accent-accent bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setOverrideModal(null)}>Cancel</Button>
              <Button
                loading={submitting}
                onClick={() => handleAction("override_freelancer_level", {
                  freelancerId: overrideModal.userId,
                  level: overrideModal.level,
                  testScore: overrideModal.testScore,
                  ratePerPoint: overrideModal.ratePerPoint
                })}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
