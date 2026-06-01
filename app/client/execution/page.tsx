"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";

export default function ClientExecutionIndex() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        // Filter for projects actively in execution
        const execProjects = (data.projects || []).filter((p: any) => 
          ["execution", "active"].includes(p.status)
        );
        setProjects(execProjects);
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
        className="mb-12"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Execution Rooms
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          Select an active project to enter the live execution canvas and review deliverables.
        </p>
      </motion.div>

      {loading ? (
        <div className="py-20 flex justify-center text-stone-400 font-bold text-[14px]">Loading execution environments...</div>
      ) : projects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl bg-white/50">
          <Zap size={32} className="text-stone-300 mb-4" />
          <h3 className="text-[16px] font-bold text-stone-900 mb-2">No Active Executions</h3>
          <p className="text-[14px] text-stone-500">You don't have any projects currently in the execution phase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/client/execution/${project._id}`}>
                <div className="group bg-white rounded-2xl p-8 border border-stone-100 shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(232,82,57,0.15)] hover:border-orange-200 transition-all cursor-pointer flex flex-col h-full">
                  
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap size={20} className="text-[#E85239]" />
                  </div>

                  <h3 className="text-[18px] font-black text-stone-900 mb-2 group-hover:text-[#E85239] transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  
                  <p className="text-[13px] font-medium text-stone-500 mb-8 flex-1">
                    Executed by <span className="text-stone-900 font-bold">{project.freelancerName || "Unassigned"}</span>
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">
                      {project.status.replace("_", " ")}
                    </span>
                    <ChevronRight size={18} className="text-stone-300 group-hover:text-[#E85239] transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
