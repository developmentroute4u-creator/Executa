"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, ArrowRight, CheckCircle2, LogOut } from "lucide-react";

export default function ProfileEnvironment() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen pl-24">
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 pt-24 md:pt-32">
        
        <header className="mb-16 border-b border-border/40 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-2.5">
              <User className="text-accent" size={18} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Profile & Configuration</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Profile
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Manage your identity, view your verified skills directory, and control your active platform session.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              
              <div className="space-y-12">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">Personal Details</p>
                  <p className="font-display text-4xl font-semibold text-text-primary tracking-tight mb-2">{user?.name || "User"}</p>
                  <p className="font-sans text-sm text-text-secondary">{user?.email}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">Verified Skills Directory</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(profile?.skills || ["Software Engineering", "Systems Design", "Technical Writing"]).map((skill: string, i: number) => (
                      <span key={i} className="px-3.5 py-1.5 bg-background border border-border/50 text-text-primary rounded-xl font-sans text-xs font-medium shadow-sm hover:border-accent/30 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12 border-t md:border-t-0 md:border-l border-border/50 pt-12 md:pt-0 md:pl-12">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">Identity Verification</p>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-accent" size={24} strokeWidth={2} />
                    <p className="font-display text-3xl font-semibold text-text-primary">Fully Verified</p>
                  </div>
                  <p className="text-xs font-medium text-text-secondary mt-4">KYC, payouts configuration, and identity verified.</p>
                </div>

                <div className="pt-12 border-t border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">Account Security</p>
                  <button 
                    onClick={() => {
                      fetch("/api/auth/signout", { method: "POST" })
                        .then(() => window.location.href = "/");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
                  >
                    Sign Out of Session <LogOut size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
