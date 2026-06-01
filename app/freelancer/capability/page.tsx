"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ArrowRight, Zap, CheckCircle2, Clock } from "lucide-react";

export default function CapabilityEnvironment() {
  const [profile, setProfile] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(console.error);

    fetch("/api/freelancer/test")
      .then((r) => r.json())
      .then((d) => setTest(d.test))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen pl-24">
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 pt-24 md:pt-32">
        
        <header className="mb-16 border-b border-border/40 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Award className="text-accent" size={18} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Skills & Assessment</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Skills & Tier
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              View your verified execution tier, upgrade your status, and explore custom skills paths.
            </p>
          </motion.div>
        </header>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(232,82,57,0.01)]"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
        >
          {loading ? (
            <div className="h-64 bg-background rounded-2xl animate-pulse" />
          ) : (
            <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
              
              {/* Mastery Tier Readout */}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">Verified Skills Tier</p>
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-display text-[6rem] md:text-[7rem] leading-none tracking-tight text-text-primary">
                    {profile?.tier || "T-0"}
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent font-sans text-xs uppercase tracking-wider font-semibold rounded-full">
                    Base Level
                  </span>
                </div>
                
                <p className="text-base text-text-secondary leading-relaxed max-w-sm">
                  Your verified tier determines your eligibility for premier projects and automates matching based on platform-verified expertise.
                </p>
              </div>

              {/* Assessment Timeline */}
              <div className="w-full md:w-80 shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">Evaluation Progress</p>
                
                {test?.status === "evaluated" ? (
                  <div className="relative pl-6 border-l-2 border-accent/20">
                    <div className="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-accent" />
                    <p className="text-xs font-medium text-text-tertiary mb-2">
                      Completed {new Date(test.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="font-display text-xl font-semibold text-text-primary mb-2">Evaluation Complete</p>
                    <p className="text-sm text-text-secondary">Your skills tier is locked and verified. Next review opens automatically in 90 days.</p>
                  </div>
                ) : test?.status === "submitted" ? (
                  <div className="relative pl-6 border-l-2 border-accent/20">
                    <div className="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-accent animate-ping" />
                    <div className="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-accent" />
                    <p className="text-xs font-medium text-accent mb-2">Review in Progress</p>
                    <p className="font-display text-xl font-semibold text-text-primary mb-2">Awaiting Verification</p>
                    <p className="text-sm text-text-secondary">Your answers have been submitted. Our team is actively verifying your skillset tier.</p>
                  </div>
                ) : (
                  <div className="p-6 bg-accent/[0.02] border border-accent/15 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 text-accent">
                      <Zap size={20} strokeWidth={2} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Upgrade Available</span>
                    </div>
                    <p className="font-display text-lg font-semibold text-text-primary mb-2">Test Your Skills</p>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                      Complete our skills verification assessment to unlock high-tier projects and increase your rate limits.
                    </p>
                    <Link
                      href="/freelancer/onboarding"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
                    >
                      Begin Assessment <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
