"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Badge, Card, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  new: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

export default function ClientProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project?.status === "scope_review") {
          router.replace(`/client/projects/${projectId}/scope`);
        } else {
          setData(d);
        }
      })
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const sidebarItems = [
    { label: "Dashboard", href: "/client/dashboard", icon: SidebarIcons.home },
    { label: "My Projects", href: "/client/projects", icon: SidebarIcons.projects, active: true },
    { label: "New Project", href: "/client/onboarding", icon: SidebarIcons.new },
  ];

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-sm text-text-secondary">Loading project…</div>
      </main>
    </div>
  );

  if (!data?.project) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-sm text-text-secondary">Project not found.</div>
      </main>
    </div>
  );

  const { project, scope } = data;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
          <Link href="/client/projects" className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Back to projects</Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">{project.title}</h1>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>{project.field}</span>
                <span>·</span>
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
            </div>
            <Badge variant="blue" className="capitalize">{project.status.replace("_", " ")}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-base font-semibold mb-3">Project Goal</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{project.goal}</p>
              </Card>

              {scope && (
                <Card className="p-6">
                  <h2 className="text-base font-semibold mb-4">Functional Units</h2>
                  <div className="space-y-3">
                    {scope.functionalUnits?.map((unit: any) => (
                      <div key={unit.id} className="p-4 bg-surface rounded-lg border border-border">
                        <div className="text-sm font-semibold">{unit.name}</div>
                        <div className="text-xs text-text-secondary mt-1">{unit.description}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-base font-semibold mb-4">Details</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-text-secondary text-xs mb-1">Industry</div>
                    <div className="font-medium capitalize">{project.industry}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-1">Priority</div>
                    <div className="font-medium capitalize">{project.priority}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-1">Accountability Mode</div>
                    <div className="font-medium capitalize">{project.accountabilityMode}</div>
                  </div>
                </div>
              </Card>

              {project.pricing && (
                <Card className="p-6">
                  <h2 className="text-base font-semibold mb-4">Pricing</h2>
                  <div className="text-3xl font-semibold tabular-nums text-text-primary mb-1">
                    {formatCurrency(project.pricing.total)}
                  </div>
                  <div className="text-xs text-text-secondary mb-4">Total amount</div>
                  <Button variant="outline" className="w-full" href={`/client/projects/${project._id}/scope`}>
                    View full breakdown
                  </Button>
                </Card>
              )}

              {project.status === "active" && (
                <Card className="p-6 border border-accent/30 bg-accent/5 shadow-sm">
                  <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Communication Channel</h2>
                  <p className="text-[11px] text-text-secondary mb-4 leading-relaxed">
                    Collaborate securely with the assigned technical expert in real time. Private freelancer identity details remain fully protected.
                  </p>
                  <Link href={`/client/projects/${project._id}/chat`}>
                    <Button variant="primary" className="w-full text-xs font-semibold py-2">
                      Open Secure Chat &rarr;
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
