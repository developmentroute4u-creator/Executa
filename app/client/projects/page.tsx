"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Badge, Card, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  new: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

export default function ClientProjectsListPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const sidebarItems = [
    { label: "Dashboard", href: "/client/dashboard", icon: SidebarIcons.home },
    { label: "My Projects", href: "/client/projects", icon: SidebarIcons.projects, active: true },
    { label: "New Project", href: "/client/onboarding", icon: SidebarIcons.new },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
              <p className="text-sm text-text-secondary mt-1">All your projects and their statuses.</p>
            </div>
            <Button variant="primary" size="sm" href="/client/onboarding">+ New project</Button>
          </div>

          {loading ? (
            <div className="text-sm text-text-secondary py-8 text-center">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center border border-border border-dashed rounded-xl">
              <h3 className="text-sm font-medium text-text-primary mb-1">No projects yet</h3>
              <p className="text-xs text-text-secondary mb-5">Create a new project to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Link key={project._id} href={project.status === "scope_review" ? `/client/projects/${project._id}/scope` : `/client/projects/${project._id}`} className="block">
                  <Card className="p-5 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold">{project.title}</h3>
                      <Badge variant="stone" className="capitalize">{project.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-sm text-text-secondary mb-4 line-clamp-1">{project.goal}</div>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary border-t border-border pt-3">
                      <span>Created {formatDate(project.createdAt)}</span>
                      {project.pricing?.total && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-text-primary">{formatCurrency(project.pricing.total)}</span>
                        </>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
