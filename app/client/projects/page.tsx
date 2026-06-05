"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, CheckCircle2, ChevronRight, Activity, Archive, Plus, Search } from "lucide-react";

export default function ClientProjectsList() {
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "matching" | "completed">("active");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const tabs = [
    { id: "active", label: "Active", icon: <Activity size={14} /> },
    { id: "draft", label: "Needs Review", icon: <Clock size={14} /> },
    { id: "matching", label: "Freelancer Finding", icon: <Search size={14} /> },
    { id: "completed", label: "Completed", icon: <CheckCircle2 size={14} /> }
  ];

  // Map backend statuses to frontend tabs
  const filteredProjects = projects.filter(p => {
    if (activeTab === "draft") return ["scoping", "scope_review"].includes(p.status);
    if (activeTab === "matching") return ["matching"].includes(p.status);
    if (activeTab === "active") return ["execution", "active", "pending"].includes(p.status);
    if (activeTab === "completed") return p.status === "completed";
    return false;
  });

  function getStatusBadge(status: string) {
    const map: Record<string, { label: string; color: string }> = {
      scoping: { label: "Scoping", color: "bg-amber-50 text-amber-600 border border-amber-100" },
      scope_review: { label: "Scope Ready — Review Now", color: "bg-[#FFF7F6] text-[#E85239] border border-orange-100" },
      matching: { label: "Finding Freelancer", color: "bg-[#FFF7F6] text-[#E85239] border border-orange-100" },
      pending: { label: "Pending Acceptance", color: "bg-amber-50 text-amber-600 border border-amber-100" },
      execution: { label: "In Execution", color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
      active: { label: "Active", color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
      completed: { label: "Completed", color: "bg-stone-50 text-stone-500 border border-stone-100" },
      archived: { label: "Archived", color: "bg-stone-50 text-stone-400 border border-stone-100" },
    };
    return map[status] || { label: status.replace("_", " "), color: "bg-stone-50 text-stone-500 border border-stone-100" };
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 sm:p-8 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5"
      >
        <div>
          <h1 className="text-[28px] sm:text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-2 sm:mb-4">
            Projects
          </h1>
          <p className="text-[14px] sm:text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
            Manage your governed executions, track active progress, and oversee completed deliverables.
          </p>
        </div>
        <Link 
          href="/client/onboarding"
          className="h-12 px-6 bg-stone-900 text-white text-[14px] font-bold rounded-xl flex items-center gap-2 hover:bg-[#E85239] hover:shadow-[0_8px_20px_rgba(232,82,57,0.25)] transition-all self-start sm:self-auto whitespace-nowrap"
        >
          <Plus size={18} /> Create new project
        </Link>
      </motion.div>

      {/* TABS */}
      <div className="flex gap-1 sm:gap-2 mb-8 sm:mb-10 border-b border-stone-200/60 pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex items-center gap-2 px-3 sm:px-5 py-3 text-[11px] sm:text-[13px] font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === "draft" ? "Review" : tab.id === "matching" ? "Matching" : tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="project-tab-indicator"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#E85239]"
              />
            )}
          </button>
        ))}
      </div>

      {/* PROJECT LIST */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-[14px] font-medium text-stone-400 py-12">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl bg-white/50">
            <h3 className="text-[16px] font-bold text-stone-900 mb-2">No projects found</h3>
            <p className="text-[14px] text-stone-500 mb-6">You don't have any {activeTab} projects at the moment.</p>
            {activeTab === "draft" && (
              <Link href="/client/onboarding" className="text-[13px] font-bold text-[#E85239] hover:underline">
                Create new project
              </Link>
            )}
          </div>
        ) : (
          filteredProjects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/client/projects/${project._id}`}>
                <div className="group bg-white rounded-2xl p-6 md:p-8 border border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-10px_rgba(232,82,57,0.1)] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1">
                    <h3 className="text-[20px] font-black text-stone-900 mb-2 group-hover:text-[#E85239] transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${getStatusBadge(project.status).color}`}>
                        {getStatusBadge(project.status).label}
                      </span>
                      {project.freelancerName && (
                        <span className="text-[13px] font-medium text-stone-400">
                          · {project.freelancerName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {project.pricing?.total > 0 && (
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Value</p>
                        <p className="text-[16px] font-black text-stone-900">₹{project.pricing.total.toLocaleString("en-IN")}</p>
                      </div>
                    )}
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-[#E85239] group-hover:text-white transition-colors text-stone-400">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
