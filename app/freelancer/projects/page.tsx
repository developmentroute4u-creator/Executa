"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Card, Badge, Button } from "@/components/ui";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3" /></svg>,
  test: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" /></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>,
  earnings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" /><path d="M8 5v1.5M8 9.5V11M6 7.5c0-.8.8-1.5 2-1.5s2 .7 2 1.5-1 1.3-2 1.5-2 .7-2 1.5S6.8 12 8 12s2-.5 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
};

export default function FreelancerProjectsPage() {
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
    { label: "Dashboard", href: "/freelancer/dashboard", icon: SidebarIcons.home },
    { label: "Skill Test", href: "/freelancer/test", icon: SidebarIcons.test },
    { label: "Projects", href: "/freelancer/projects", icon: SidebarIcons.projects, active: true },
    { label: "Earnings", href: "/freelancer/earnings", icon: SidebarIcons.earnings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Freelancer" }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
            <p className="text-sm text-text-secondary mt-1">Assigned and completed projects.</p>
          </div>

          {loading ? (
            <div className="text-sm text-text-secondary py-8 text-center">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center border border-border border-dashed rounded-xl">
              <h3 className="text-sm font-medium text-text-primary mb-1">No assigned projects</h3>
              <p className="text-xs text-text-secondary mb-5">Ensure your skill evaluation is completed and you are marked as available.</p>
              <Button variant="outline" size="sm" href="/freelancer/dashboard">Go to Dashboard</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project._id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold">{project.title}</h3>
                    <Badge variant="stone" className="capitalize">{project.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-sm text-text-secondary line-clamp-2">{project.goal}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
