"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ArrowRight, Zap, CheckCircle2, Clock, Plus } from "lucide-react";

export default function CapabilityEnvironment() {
  const [profile, setProfile] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(console.error);

    fetch("/api/freelancer/test")
      .then((r) => r.json())
      .then((d) => {
        setTest(d.test);
        setTests(d.tests || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen pl-24 font-sans">
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 pt-24 md:pt-32">
        
        {/* Sleek, Header block matching other pages in a center-right flex layout */}
        <header className="mb-10 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Award className="text-[#E85239] w-4 h-4" strokeWidth={2.5} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E85239]">Skills & Top Tier</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Skills Profile
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Track your expert progress, review verified capabilities, and manage active assignments.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="shrink-0 flex items-center"
          >
            {(!test || test.status === "submitted" || test.status === "under_review" || test.status === "evaluated") && (
              <Link 
                href="/freelancer/onboarding?source=capability"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FCE1DC]/35 hover:bg-[#E85239] border border-[#E85239]/20 hover:border-transparent text-[#E85239] hover:text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all select-none shadow-sm hover:shadow-[0_4px_16px_rgba(232,82,57,0.15)] active:scale-[0.98]"
              >
                <Plus size={14} className="shrink-0" strokeWidth={3} />
                Add New Skill Set
              </Link>
            )}
          </motion.div>
        </header>

        {/* Full Width, High-Fidelity Summary Card (Aligned with the global 1000px page grid) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E85239]/5 rounded-full blur-3xl pointer-events-none" />
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#E85239] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-tertiary">Loading profile details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Top Meta Details Row */}
              {test ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E85239] bg-[#FCE1DC]/30 border border-[#E85239]/20 px-3 py-1 rounded-full">
                    {test.status === "assigned" ? "Assignment Available" : 
                     test.status === "in_progress" ? "Assignment Active" : 
                     test.status === "submitted" || test.status === "under_review" ? "Review Pending" : "Top Completed"}
                  </span>
                  
                  {test.status === "in_progress" && (
                    <div className="flex items-center gap-1.5 text-xs text-[#E85239] font-bold bg-[#FCE1DC]/20 px-3 py-1.5 rounded-full border border-[#E85239]/10">
                      <Clock size={12} className="animate-pulse" />
                      <span>Pending Submit</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Assignment Title & Expertise Badge Grid */}
              {test ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight font-semibold leading-tight">
                      {test.taskPrompt || "Top Skills Assignment"}
                    </h2>
                    
                    {/* The Tech (Domains) */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile?.specializations && profile.specializations.length > 0 ? (
                        profile.specializations.map((spec: string, i: number) => (
                          <span 
                            key={i} 
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FCE1DC]/20 border border-[#E85239]/10 text-[#E85239] tracking-wide"
                          >
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-tertiary">No expertise domains specified.</span>
                      )}
                    </div>
                  </div>

                  {/* Premium Score Metric if completed */}
                  {test.status === "evaluated" && test.evaluation && (
                    <div className="bg-[#FFF7F6] border border-[#E85239]/20 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E85239]/10 rounded-full blur-2xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
                      
                      <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-semibold text-text-secondary tracking-wide uppercase">Evaluation Score</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-display font-bold tracking-tighter text-[#E85239]">
                              {(test.evaluation.total / 50 * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-[#E85239]/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${(test.evaluation.total / 50) * 100}%` }} 
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-[#E85239] to-[#FF8A75] rounded-full"
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-tertiary">Verified Capabilities</span>
                          <span className="text-slate-500 bg-white/60 px-2 py-0.5 rounded-md border border-[#E85239]/10 shadow-sm">
                            {test.evaluation.total} / 50 Raw Points
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Premium Action Row: Left description, Right button */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-border/30">
                    <div className="max-w-xl">
                      <p className="text-[13px] text-text-secondary leading-relaxed font-sans">
                        {test.status === "assigned" && (
                          <>
                            Your custom skills assessment is active and ready.
                            <br />
                            Click the button on the right to view details and start your assignment.
                          </>
                        )}
                        {test.status === "in_progress" && (
                          <>
                            Your assignment is currently active and in progress. Build your custom solution and click
                            <br />
                            the button to upload your project files.
                          </>
                        )}
                        {test.status === "submitted" && (
                          <>
                            Your assignment solution has been submitted successfully. Click the button to
                            <br />
                            inspect your details and review notes.
                          </>
                        )}
                        {test.status === "under_review" && (
                          <>
                            Our expert evaluation panel is currently reviewing your project.
                            <br />
                            Click the button to check the status and details of your solution.
                          </>
                        )}
                        {test.status === "evaluated" && (
                          <>
                            Your skills assessment has been successfully graded.
                            <br />
                            Click the button to read your complete technical evaluation report.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <Link 
                        href="/freelancer/test"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all shadow-[0_4px_16px_rgba(232,82,57,0.15)] hover:shadow-[0_6px_20px_rgba(232,82,57,0.25)] active:scale-[0.98] select-none"
                      >
                        {test.status === "assigned" && "Begin Assignment"}
                        {test.status === "in_progress" && "Complete & Submit"}
                        {(test.status === "submitted" || test.status === "under_review") && "View Submission"}
                        {test.status === "evaluated" && "View Detailed Report"}
                        <ArrowRight size={14} strokeWidth={3} />
                      </Link>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-6 text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-[#E85239]/5 flex items-center justify-center text-[#E85239]/40 mx-auto">
                    <Zap size={28} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl text-text-primary tracking-tight font-semibold">No Assignment Found</h3>
                    <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                      Complete our onboarding questionnaire to receive your custom skills assignment.
                    </p>
                  </div>
                  <Link href="/freelancer/onboarding">
                    <button className="px-6 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors shadow-[0_4px_16px_rgba(232,82,57,0.15)] hover:shadow-[0_6px_20px_rgba(232,82,57,0.25)] active:scale-[0.98]">
                      Start Questionnaire
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Historic Tests (Compressed View) ── */}
        {!loading && tests && tests.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 space-y-4"
          >
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider pl-2">Past Skill Assessments</h3>
            <div className="grid gap-3">
              {tests.slice(1).map((pastTest: any) => (
                <div key={pastTest._id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-border/40 rounded-2xl hover:bg-white transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                      {pastTest.status === "evaluated" ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Clock size={18} className="text-stone-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-text-primary line-clamp-1 group-hover:text-[#E85239] transition-colors">{pastTest.taskPrompt || "Archived Assignment"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                          {pastTest.specialization || pastTest.domain || "General"}
                        </span>
                        {pastTest.status === "evaluated" && pastTest.evaluation && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span className="text-[10px] font-bold text-emerald-600">
                              {(pastTest.evaluation.total / 50 * 100).toFixed(0)}% Score
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/freelancer/test?id=${pastTest._id}`}
                    className="shrink-0 px-4 py-2 bg-stone-100 hover:bg-[#E85239] text-stone-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-stone-200 hover:border-transparent"
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}
