"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, Badge, Button, ScoreBar, LevelBadge } from "@/components/ui";

// Import all 8 tabs
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { TestReviewTab } from "@/components/admin/tabs/TestReviewTab";
import { FreelancersTab } from "@/components/admin/tabs/FreelancersTab";
import { ClientsTab } from "@/components/admin/tabs/ClientsTab";
import { ProjectsTab } from "@/components/admin/tabs/ProjectsTab";
import { DisputesTab } from "@/components/admin/tabs/DisputesTab";
import { FeatureControlsTab } from "@/components/admin/tabs/FeatureControlsTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { SupportTab } from "@/components/admin/tabs/SupportTab";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  tests: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-3 3-4 6-4s6 1 6 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  disputes: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  feature: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [preSelectedProjectId, setPreSelectedProjectId] = useState<string | null>(null);

  const [tests, setTests] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({ freelancers: [], clients: [], projects: [], stats: {} });
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setOverview(d))
      .catch((err) => console.error("Error fetching admin overview:", err))
      .finally(() => setLoading(false));

    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []));
  };

  useEffect(() => {
    // Isolated client-side check for administrative session cookie
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      acc[k] = v;
      return acc;
    }, {} as any);

    if (cookies.admin_session === "authenticated") {
      setAuthenticated(true);
      setCheckingAuth(false);
      fetchOverview();
    } else {
      window.location.href = "/admin/login";
    }
  }, []);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: SidebarIcons.home },
    { id: "tests", label: "Test Review", icon: SidebarIcons.tests, badge: overview.stats?.pendingCalibration },
    { id: "freelancers", label: "Freelancers", icon: SidebarIcons.users },
    { id: "clients", label: "Clients", icon: SidebarIcons.users },
    { id: "projects", label: "Projects", icon: SidebarIcons.projects },
    { id: "disputes", label: "Disputes", icon: SidebarIcons.disputes, alert: overview.stats?.disputedProjects > 0 },
    { id: "features", label: "Feature Controls", icon: SidebarIcons.feature },
    { id: "settings", label: "Settings", icon: SidebarIcons.settings },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-xs font-semibold text-text-secondary animate-pulse">Authenticating Administrative Session…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={overview.stats} />

      <main className="flex-1 pl-[100px] transition-all duration-300 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-10 py-12">
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-sm font-semibold text-text-tertiary animate-pulse">Loading Platform Matrix...</span>
            </div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab overview={overview} stats={overview.stats} setActiveTab={setActiveTab} />}
              {activeTab === "tests" && <TestReviewTab tests={tests} fetchOverview={fetchOverview} />}
              {activeTab === "freelancers" && <FreelancersTab freelancers={overview.freelancers || []} fetchOverview={fetchOverview} />}
              {activeTab === "clients" && <ClientsTab clients={overview.clients || []} projects={overview.projects || []} setActiveTab={setActiveTab} fetchOverview={fetchOverview} />}
              {activeTab === "projects" && <ProjectsTab projects={overview.projects || []} freelancers={overview.freelancers || []} fetchOverview={fetchOverview} preSelectedProjectId={preSelectedProjectId} setPreSelectedProjectId={setPreSelectedProjectId} />}
              {activeTab === "disputes" && <DisputesTab projects={overview.projects || []} setActiveTab={setActiveTab} fetchOverview={fetchOverview} setPreSelectedProjectId={setPreSelectedProjectId} />}
              {activeTab === "support" && <SupportTab />}
              {activeTab === "features" && <FeatureControlsTab />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
