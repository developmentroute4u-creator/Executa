"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ClientWorkspace() {
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || "Client";

  const getGreeting = () => {
    // IST is UTC+5:30
    const now = new Date();
    const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
    const h = istHour % 24;
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    if (h >= 17 && h < 21) return "Good evening";
    return "Good night";
  };
  
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

  const activeProjects = projects.filter(p => p.status === "execution");
  const requiresAttention = projects.filter(p => p.status === "scope_review").length;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 sm:p-8 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 sm:mb-16"
      >
        <h1 className="text-[28px] sm:text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-3 sm:mb-4">
          {getGreeting()}, {userName.split(' ')[0]}.
        </h1>
        <p className="text-[15px] sm:text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          You have {requiresAttention} item{requiresAttention !== 1 ? 's' : ''} requiring your attention, and {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} active.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Attention & Projects */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          
          {/* ATTENTION REQUIRED (Highest Priority) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[12px] font-bold tracking-[0.1em] text-stone-400 uppercase">Attention Required</h2>
            </div>
            <div className="flex flex-col gap-4">
              {projects.filter(p => p.status === "scope_review").map(project => (
                <Link key={`attn-${project._id}`} href={`/client/projects/${project._id}`} className="block">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="group relative bg-white rounded-2xl p-6 shadow-[0_8px_30px_-10px_rgba(232,82,57,0.15)] border border-[#E85239]/20 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#E85239]" />
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E85239]/10 flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 size={20} className="text-[#E85239]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-1">Scope Review Required</h3>
                          <p className="text-sm font-medium text-stone-500 mb-4">{project.title} — AI scoping complete.</p>
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-stone-900 text-white text-[13px] font-bold rounded-lg hover:bg-[#E85239] transition-colors">
                              Review Scope
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}

              {requiresAttention === 0 && (
                <div className="py-8 text-center bg-stone-50/50 rounded-2xl border border-stone-100">
                  <p className="text-[13px] font-bold text-stone-400 uppercase tracking-widest">All caught up</p>
                </div>
              )}
            </div>
          </section>

          {/* ACTIVE PROJECTS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[12px] font-bold tracking-[0.1em] text-stone-400 uppercase">Active Projects</h2>
              <Link href="/client/projects" className="text-[12px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors">View All</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="py-8 text-center text-[13px] font-bold text-stone-400">Loading projects...</div>
              ) : activeProjects.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-stone-50/50 rounded-2xl border border-stone-100">
                  <p className="text-[14px] font-medium text-stone-500 mb-4">No active projects right now.</p>
                  <Link href="/client/onboarding" className="px-4 py-2 bg-stone-900 text-white text-[13px] font-bold rounded-lg hover:bg-[#E85239] transition-colors">
                    Create new project
                  </Link>
                </div>
              ) : (
                activeProjects.map(project => (
                  <Link key={project._id} href={`/client/projects/${project._id}`} className="block group">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-[18px] font-black text-stone-900 mb-1">{project.title}</h3>
                          <p className="text-[14px] font-medium text-stone-500">
                            {project.freelancerName ? `Executed by ${project.freelancerName}` : "Awaiting Freelancer"}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
                          {project.status.replace("_", " ")}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-[13px] font-bold mb-2">
                          <span className="text-stone-900">Current Phase</span>
                          <span className="text-stone-400">
                            {project.status === "execution" ? "In Progress" : "Setup"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${project.status === 'execution' ? 'bg-[#E85239] w-1/3' : 'bg-stone-900 w-[5%]'}`} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Events & Activity */}
        <div className="lg:col-span-5 flex flex-col gap-12">
          
          {/* UPCOMING EVENTS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[12px] font-bold tracking-[0.1em] text-stone-400 uppercase">Upcoming Events</h2>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <div className="flex flex-col gap-6">
                {activeProjects.length > 0 ? (
                  activeProjects.map((project, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col justify-center items-center min-w-[40px]">
                        <span className="text-xl font-black text-stone-300">—</span>
                      </div>
                      <div className="w-[1px] bg-stone-100 mt-2" />
                      <div className="pt-1">
                        <h4 className="text-[14px] font-bold text-stone-900 mb-1 line-clamp-1">{project.title}</h4>
                        <p className="text-[13px] text-stone-500 font-medium capitalize">{project.status.replace("_", " ")} Phase</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[13px] text-stone-500 font-medium">No upcoming events scheduled.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
