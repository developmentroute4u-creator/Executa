"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Lock, CheckCircle2, Loader2,
  Shield, FileText, Zap, ChevronDown, Star,
  BadgeCheck, Headphones, BarChart3, Users, ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

function formatCurrency(val: number) {
  if (!val) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
}

const FEE_DETAILS = {
  scopeFee: {
    label: "Scope Fee",
    tagline: "Platform Scope Intelligence",
    icon: FileText,
    benefits: [
      "Full functional scope — every feature mapped",
      "Detailed breakdown of deliverables & boundaries",
      "Effort scoring that protects you from overpricing",
      "Clear in-scope vs out-of-scope definitions",
      "Project timeline & phase estimation",
    ],
    why: "Without a structured scope, projects go over-budget 78% of the time. This small fee gives you a professionally structured blueprint — the kind that would cost ₹5,000–₹15,000 from a traditional consultant.",
  },
  accountabilityFee: {
    label: "Accountability Fee",
    tagline: "Your Protection Layer",
    icon: Shield,
    benefits: [
      "Dedicated dispute resolution if issues arise",
      "Expert quality review at every milestone",
      "Contract governance & delivery enforcement",
      "24/7 support channel with the Executa team",
      "Money-back guarantee if scope isn't delivered",
    ],
    why: "This is your safety net. If the expert doesn't deliver what the scope says, Executa steps in. No platform in India offers this level of execution accountability for just ₹199.",
  },
  executionFee: {
    label: "Execution Fee",
    tagline: "5% Platform Operations Only",
    icon: Zap,
    benefits: [
      "Secure payment escrow management",
      "Workspace & communication infrastructure",
      "Milestone tracking & delivery verification",
      "Platform maintenance & security",
      "Expert vetting & background verification",
    ],
    why: "Just 5% — that's it. Industry platforms like Upwork charge 20%+ in fees. Executa charges only 5% to keep operations running, so the maximum money goes directly to the expert building your product.",
  },
};

const GUARANTEE_ITEMS = [
  { stat: "100%", label: "Verified experts only" },
  { stat: "5%",   label: "Our only platform fee — EVER" },
  { stat: "₹0",   label: "Hidden charges or surprises" },
];

export default function PaymentGatePage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedFee, setExpandedFee] = useState<string | null>("accountabilityFee");

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        if (d.project?.payment?.status === "paid") {
          router.replace(`/client/projects/${params.projectId}/scope`);
        }
      })
      .catch(() => setLoading(false));
  }, [params.projectId, router]);

  async function handlePayNow() {
    setPaymentLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: params.projectId }),
      });
      const d = await res.json();
      if (d.alreadyPaid) {
        router.push(`/client/projects/${params.projectId}/scope`);
        return;
      }
      if (d.redirectUrl) {
        window.location.href = d.redirectUrl;
      } else {
        setError(d.error || "Payment initiation failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E85239]/20 border-t-[#E85239] rounded-full animate-spin" />
      </div>
    );
  }

  const project = data?.project;
  const scope = data?.scope;
  const pricing = project?.pricing;
  const platformFees = pricing
    ? (pricing.scopeFee || 0) + (pricing.accountabilityFee || 0) + (pricing.executionFee || 0)
    : 0;
  const expertProjectCost = pricing?.freelancerPrice || 0;
  const totalProjectValue = pricing?.total || expertProjectCost + platformFees;

  const feeRows: { key: keyof typeof FEE_DETAILS; resolved: number }[] = [
    { key: "scopeFee",        resolved: pricing?.scopeFee        || 99  },
    { key: "accountabilityFee", resolved: pricing?.accountabilityFee || 199 },
    { key: "executionFee",    resolved: pricing?.executionFee    || 0   },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F5] relative overflow-hidden">
      {/* Ambient brand glows */}
      <div className="absolute top-[-18%] right-[-10%] w-[700px] h-[700px] bg-[#E85239]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-12%] left-[-6%] w-[500px] h-[500px] bg-[#FCE1DC]/50 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Top Nav ── */}
      <div className="fixed top-0 inset-x-0 z-50 bg-[#FFF7F5]/95 backdrop-blur-md border-b border-[#F5DDD9] h-14 flex items-center px-4 sm:px-8 justify-between">
        <span className="font-black text-[18px] sm:text-[22px] tracking-tighter text-stone-900 leading-none select-none">
          EXECUTA<span className="text-[#E85239]">.</span>
        </span>
        {/* 5-step progress */}
        <div className="flex items-center gap-1 sm:gap-2">
          {["Foundation", "Explanation", "Deep Dive", "Generate", "Unlock"].map((s, i) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2">
              <div className={[
                "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border",
                i < 4
                  ? "bg-[#FCE1DC] border-transparent text-[#E85239]"
                  : "bg-[#E85239] border-[#E85239] text-white shadow-[0_2px_12px_rgba(232,82,57,0.4)]"
              ].join(" ")}>
                {i < 4 ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : "5"}
              </div>
              {i < 4 && <div className="w-3 sm:w-5 h-px bg-[#F5DDD9]" />}
            </div>
          ))}
        </div>
        <div className="w-10 sm:w-24" />
      </div>

      {/* ── Page Content ── */}
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Header ── */}
          <div className="mb-8 sm:mb-10 text-center">
            <motion.p
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-[10px] font-black text-[#E85239] uppercase tracking-[0.22em] mb-3"
            >
              Step 5 of 5 · Final Step
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
              className="text-[28px] sm:text-[44px] font-black tracking-tight text-stone-900 leading-[1.06] mb-3"
            >
              One Small Fee.{" "}
              <span className="text-[#E85239]">Massive Value.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="text-[16px] font-medium text-stone-500 max-w-lg mx-auto leading-relaxed"
            >
              Your scope is ready. Unlock the platform fee —{" "}
              <strong className="text-stone-800">{formatCurrency(platformFees)}</strong>{" "}
              — and start execution immediately.
            </motion.p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ════════════ LEFT col (3) ════════════ */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Fee accordion cards */}
              {feeRows.map(({ key, resolved }, idx) => {
                const fee = FEE_DETAILS[key];
                const Icon = fee.icon;
                const isOpen = expandedFee === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-2xl border border-[#F0D8D4] shadow-[0_2px_16px_rgba(232,82,57,0.04)] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFee(isOpen ? null : key)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-[#FFF3F1]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#FFF0ED] flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-[#E85239]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-black text-stone-900">{fee.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-[#FCE1DC] text-[#E85239]">
                            {fee.tagline}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 truncate">{fee.why.split(".")[0]}.</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[17px] font-black text-stone-900">{formatCurrency(resolved)}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                          className="w-6 h-6 rounded-full bg-[#FFF0ED] flex items-center justify-center"
                        >
                          <ChevronDown size={13} className="text-[#E85239]" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ height: { duration: 0.32, ease: [0.25, 1, 0.5, 1] }, opacity: { duration: 0.2 } }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#F5DDD9] px-5 py-5 bg-[#FFFAF9]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <p className="text-[9px] font-black text-[#E85239] uppercase tracking-[0.18em] mb-3">What's included</p>
                                <ul className="space-y-2.5">
                                  {fee.benefits.map((b) => (
                                    <li key={b} className="flex items-start gap-2.5">
                                      <div className="mt-[2px] shrink-0 w-4 h-4 rounded-full bg-[#FCE1DC] flex items-center justify-center">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#E85239" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </div>
                                      <span className="text-[12px] text-stone-700 leading-snug">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-[#F5DDD9]">
                                <p className="text-[9px] font-black text-[#E85239] uppercase tracking-[0.18em] mb-2">Why this matters</p>
                                <p className="text-[12px] text-stone-600 leading-relaxed">{fee.why}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* ── Total Platform Fees ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46 }}
                className="bg-white rounded-2xl border border-[#F0D8D4] shadow-[0_2px_16px_rgba(232,82,57,0.04)] overflow-hidden"
              >
                {/* Mini fee breakdown */}
                <div className="px-5 pt-4 pb-3 space-y-2">
                  <p className="text-[9px] font-black text-[#E85239] uppercase tracking-[0.16em] mb-3">Platform Fees Breakdown</p>
                  {[
                    { label: "Scope Fee", amount: pricing?.scopeFee || 99 },
                    { label: "Accountability Fee", amount: pricing?.accountabilityFee || 199 },
                    { label: "Execution Fee", amount: pricing?.executionFee || 0 },
                  ].map(({ label, amount }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-500 font-medium">{label}</span>
                      <span className="text-[11px] font-black text-stone-800">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
                {/* Total row — brand accent */}
                <div className="bg-[#FFF0ED] border-t border-[#F0D8D4] px-5 py-3 flex items-center justify-between">
                  <p className="text-[11px] font-black text-[#E85239] uppercase tracking-[0.14em]">Total Platform Fees</p>
                  <p className="text-[22px] font-black text-[#E85239] leading-none">{formatCurrency(platformFees)}</p>
                </div>
              </motion.div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 font-medium">
                  {error}
                </div>
              )}

              {/* ── Pay button ── */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={handlePayNow}
                disabled={paymentLoading || !pricing}
                className="w-full h-16 bg-[#E85239] hover:bg-[#d44530] disabled:opacity-50 text-white text-[16px] font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_40px_rgba(232,82,57,0.25)] hover:shadow-[0_14px_50px_rgba(232,82,57,0.38)] transition-all duration-300"
              >
                {paymentLoading ? (
                  <><Loader2 size={20} className="animate-spin" />Redirecting to PhonePe…</>
                ) : (
                  <><CreditCard size={19} />Pay {formatCurrency(platformFees)} via PhonePe<ArrowRight size={18} /></>
                )}
              </motion.button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-5 text-[10px] text-stone-400">
                <span className="flex items-center gap-1.5"><Lock size={10} />SSL Secured</span>
                <span className="flex items-center gap-1.5"><Shield size={10} />PhonePe Encrypted</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={10} />UPI · Cards · Net Banking</span>
              </div>

              {/* ── Platform Guarantee — compact, matching support card height ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56 }}
                className="bg-white rounded-2xl border border-[#F0D8D4] px-5 py-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star size={11} className="text-[#E85239]" fill="currentColor" />
                  <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.18em]">Platform Guarantee</p>
                </div>
                <div className="flex items-center divide-x divide-[#F5DDD9]">
                  {GUARANTEE_ITEMS.map(({ stat, label }) => (
                    <div key={label} className="flex-1 text-center px-3 first:pl-0 last:pr-0">
                      <p className="text-[17px] font-black text-[#E85239] leading-none">{stat}</p>
                      <p className="text-[9px] text-stone-400 mt-1 leading-snug">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ════════════ RIGHT col (2) ════════════ */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* ── Expert Project Cost + Total ── */}
              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }}
                className="bg-white rounded-2xl border border-[#F0D8D4] shadow-[0_2px_16px_rgba(232,82,57,0.04)] overflow-hidden"
              >
                <div className="px-5 pt-5 pb-4">
                  <p className="text-[9px] font-black text-[#E85239] uppercase tracking-[0.18em] mb-4">Project Investment</p>

                  {/* Project cost */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[12px] font-bold text-stone-700 mb-0.5">Project Cost</p>
                      <p className="text-[10px] text-stone-400 leading-snug">Paid directly to expert on milestone completion</p>
                    </div>
                    <p className="text-[18px] font-black text-stone-800 shrink-0">{formatCurrency(expertProjectCost)}</p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-[#F5DDD9] mb-3" />

                  {/* Platform fees summary (read-only) */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>Platform Fees (due today)</span>
                    <span className="font-semibold text-stone-500">{formatCurrency(platformFees)}</span>
                  </div>
                </div>

                {/* Total — full brand orange */}
                <div className="bg-[#E85239] px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.15em]">Total Project Value</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Project cost + platform fees</p>
                  </div>
                  <p className="text-[28px] font-black text-white leading-none">{formatCurrency(totalProjectValue)}</p>
                </div>
              </motion.div>

              {/* ── What unlocks ── */}
              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 }}
                className="bg-white rounded-2xl p-5 border border-[#F0D8D4] shadow-[0_2px_16px_rgba(232,82,57,0.04)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-[#FFF0ED] rounded-full flex items-center justify-center">
                    <Lock size={10} className="text-[#E85239]" />
                  </div>
                  <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.18em]">Unlocks after payment</p>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: FileText,     label: "Complete Scope Document",        desc: "Every feature, boundary & detail" },
                    { icon: BarChart3,    label: "Functional Units + Effort Scores", desc: "Full technical breakdown" },
                    { icon: CheckCircle2, label: "Deliverables List",              desc: "Exact outputs to expect" },
                    { icon: Users,        label: "Expert Matching Engine",          desc: "Matches verified specialists" },
                    { icon: Zap,          label: "Execution Workspace",             desc: "Live project management room" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#FFF0ED] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={12} className="text-[#E85239]" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-stone-800">{label}</p>
                        <p className="text-[10px] text-stone-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Support + back ── */}
              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.44 }}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#F0D8D4]"
              >
                <Headphones size={13} className="text-[#E85239] shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Have questions before paying?{" "}
                  <Link href="/client/support" className="text-[#E85239] font-bold hover:underline">
                    Contact our team
                  </Link>
                  {" "}— we respond in under 2 hours.
                </p>
              </motion.div>

              <button
                onClick={() => router.push(`/client/projects/${params.projectId}`)}
                className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 hover:text-[#E85239] transition-colors py-1 mx-auto"
              >
                <ChevronLeft size={13} />
                Go back to scope setup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
