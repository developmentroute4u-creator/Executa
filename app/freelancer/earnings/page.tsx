"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { IndianRupee, ArrowRight } from "lucide-react";

export default function EarningsEnvironment() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
              <IndianRupee className="text-accent" size={18} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Earnings Overview</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Earnings
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Track your cleared revenue, outstanding payments, and request payouts.
            </p>
          </motion.div>
        </header>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(232,82,57,0.01)]"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
        >
          {loading ? (
            <div className="h-48 bg-background rounded-2xl animate-pulse" />
          ) : (
            <div className="flex flex-col md:flex-row gap-16 md:items-center">
              
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">Total Cleared Revenue</p>
                <p className="font-display text-[5rem] md:text-[6rem] leading-none tracking-tight text-text-primary">
                  {formatCurrency(profile?.totalEarnings || 0)}
                </p>
              </div>
              
              <div className="w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-12 md:pt-0 md:pl-12 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">Available to Withdraw</p>
                <p className="font-display text-4xl text-text-primary mb-8">{formatCurrency(profile?.totalEarnings || 0)}</p>
                
                <button className="flex items-center justify-between w-full p-4 rounded-xl text-xs uppercase tracking-wider font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-[0_4px_16px_rgba(232,82,57,0.2)]">
                  Execute Payout <ArrowRight size={14} strokeWidth={3} />
                </button>
              </div>

            </div>
          )}
        </motion.div>

        <motion.div 
          className="mt-12 bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-[0_8px_30px_rgba(232,82,57,0.01)]"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}
        >
           <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-8">Earnings History</p>
           <div className="py-16 text-center border border-dashed border-border/50 rounded-2xl bg-background">
             <p className="text-xs text-text-tertiary">No recent transactions recorded.</p>
           </div>
        </motion.div>
      </div>
    </main>
  );
}
