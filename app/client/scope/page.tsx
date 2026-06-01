"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Target, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ClientScopeIntelligence() {
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

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Scope Intelligence
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          Define clear boundaries, verify requirements, and lock down project scope with AI assistance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* SCOPE LIBRARY */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-4">
            <h2 className="text-[14px] font-bold tracking-wide text-stone-900 uppercase">Active Scopes</h2>
            <Link href="/client/onboarding" className="text-[13px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors">
              + Create new project
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-8 text-stone-400 font-bold text-[14px]">Loading scopes...</div>
            ) : projects.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl bg-white/50">
                <p className="text-[14px] text-stone-500">No project scopes generated yet.</p>
              </div>
            ) : (
              projects.map(project => (
                <Link key={`scope-${project._id}`} href={`/client/projects/${project._id}`}>
                  <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] cursor-pointer hover:border-stone-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-stone-900" />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-stone-900">{project.title}</h3>
                          <p className="text-[13px] font-medium text-stone-500">
                            {project.status === "execution" || project.status === "completed" ? "Locked & Agreed" : "Draft Version"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg ${project.status === "execution" || project.status === "completed"
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600"
                        }`}>
                        {project.status === "execution" || project.status === "completed" ? "Locked" : "Reviewing"}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-stone-50">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-stone-400" />
                        <span className="text-[13px] font-medium text-stone-600">
                          {project.pricing?.total ? "Calculated Scope" : "Pending Analysis"}
                        </span>
                      </div>
                      {project.status === "execution" || project.status === "completed" ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 size={14} />
                          <span className="text-[13px] font-bold">100% Health Score</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#E85239]">
                          <AlertTriangle size={14} />
                          <span className="text-[13px] font-bold">Review Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* SCOPE INTELLIGENCE ASSISTANT */}
        <div className="flex flex-col">
          <div className="sticky top-28 bg-[#FFF7F6] border border-orange-200/50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(232,82,57,0.05)]">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="#E85239" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="#E85239" fillOpacity="0.4" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="#E85239" fillOpacity="0.4" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="#E85239" />
              </svg>
            </div>
            <h3 className="text-[20px] font-black text-stone-900 mb-2">Scope Analyzer</h3>
            <p className="text-[14px] font-medium text-stone-600 leading-relaxed mb-8">
              Executa analyzes your drafts to identify missing requirements, ambiguities, and scope creep risks before you lock the contract.
            </p>
            <Link href="/client/onboarding" className="w-full group flex items-center justify-between px-5 py-4 bg-white border border-orange-100 rounded-xl hover:border-[#E85239] transition-colors text-left shadow-sm">
              <span className="text-[14px] font-bold text-stone-900">Create new project</span>
              <ArrowRight size={16} className="text-[#E85239] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
