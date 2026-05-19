"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Navbar";
import { Card, Badge } from "@/components/ui";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  tests: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
};

export default function AdminProjectsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: SidebarIcons.home },
    { label: "Test Reviews", href: "/admin/dashboard", icon: SidebarIcons.tests },
    { label: "Projects", href: "/admin/projects", icon: SidebarIcons.projects, active: true },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Admin" }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight">Platform Projects</h1>
            <p className="text-sm text-text-secondary mt-1">Monitor active projects and resolve disputes.</p>
          </div>

          <div className="py-16 text-center border border-border border-dashed rounded-xl">
            <h3 className="text-sm font-medium text-text-primary mb-1">No active projects requiring oversight</h3>
            <p className="text-xs text-text-secondary">Projects flagged for disputes will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
