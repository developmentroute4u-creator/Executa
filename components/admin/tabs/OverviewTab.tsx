"use client";
import { Card, Badge, Button } from "@/components/ui";

export function OverviewTab({ overview, stats, setActiveTab }: { overview: any, stats: any, setActiveTab: (tab: string) => void }) {
  const needsAttention = stats?.pendingCalibration > 0 || stats?.disputedProjects > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Platform Overview</h2>
        <p className="text-sm text-text-tertiary mt-1">High-level metrics across the entire platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Freelancers", value: stats?.totalFreelancers || 0 },
          { label: "Total Clients", value: stats?.totalClients || 0 },
          { label: "Active Projects", value: stats?.activeProjects || 0 },
          { label: "Open Disputes", value: stats?.disputedProjects || 0, urgent: stats?.disputedProjects > 0 },
          { label: "Platform Revenue", value: `₹${(stats?.platformFeeRevenue || 0).toLocaleString()}` },
          { label: "Total Contract Value", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}` },
          { label: "Completed Projects", value: stats?.completedProjects || 0 },
          { label: "Tests Waiting", value: stats?.pendingCalibration || 0, urgent: stats?.pendingCalibration > 0 },
        ].map((s, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between relative overflow-hidden bg-white">
            {s.urgent && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
            <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">{s.label}</span>
            <span className="text-2xl font-black text-text-primary mt-2">{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Needs Attention */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Needs Attention</h3>
        <Card className="p-0 overflow-hidden">
          {needsAttention ? (
            <div className="flex flex-col">
              {stats?.pendingCalibration > 0 && (
                <div className="p-4 flex items-center justify-between border-b border-border bg-red-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <span className="text-xs font-bold">{stats.pendingCalibration}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Tests waiting for review</p>
                      <p className="text-xs text-text-secondary">Freelancers are blocked until calibrated.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("tests")}>Go Review &rarr;</Button>
                </div>
              )}
              {stats?.disputedProjects > 0 && (
                <div className="p-4 flex items-center justify-between bg-red-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <span className="text-xs font-bold">{stats.disputedProjects}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Disputes open</p>
                      <p className="text-xs text-text-secondary">Projects are frozen and require mediation.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("disputes")}>Go Resolve &rarr;</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-text-secondary">
              <span className="inline-block w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">✓</span>
              Everything is running fine. No urgent actions needed.
            </div>
          )}
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Recent Projects</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-border text-xs text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Project Name</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Matched Expert</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overview?.projects?.slice(0, 5).map((p: any) => (
                  <tr key={p._id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setActiveTab("projects")}>
                    <td className="px-4 py-4 font-semibold text-text-primary">{p.title}</td>
                    <td className="px-4 py-4 text-text-secondary">{p.clientName}</td>
                    <td className="px-4 py-4 text-text-secondary">{p.freelancerName || "Not matched yet"}</td>
                    <td className="px-4 py-4 font-bold text-right">₹{p.pricing?.total?.toLocaleString() || 0}</td>
                    <td className="px-4 py-4 text-right">
                      <Badge variant={p.status === "active" ? "green" : p.status === "completed" ? "purple" : "stone"}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
                {(!overview?.projects || overview.projects.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary italic">No recent projects</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
