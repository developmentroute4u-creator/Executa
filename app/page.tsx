"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MobileLandingPage from "@/components/MobileLandingPage";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  UserCheck,
  FileCheck,
  Code,
  Database,
} from "lucide-react";

const HERO_CYCLE_PAIRS = [
  { type: "client", inputTitle: "Raw Input", input: "I need a payment system, make it work fast.", outputTitle: "Structured Scope", output: "Stripe Billing Integration", detail: "4 milestones · webhook validation · retry logic", iconColor: "text-accent", bgColor: "bg-[#FFF7F5]/95", borderColor: "border-accent/20" },
  { type: "freelancer", inputTitle: "Unknown Developer", input: "3 years experience, knows React and Node.", outputTitle: "Verified Expert", output: "Top 1% React Engineer", detail: "Passed Level 2 Skills Assessment · Verified design & code quality", iconColor: "text-blue-600", bgColor: "bg-[#FFF7F5]/90", borderColor: "border-accent/20" },
  { type: "client", inputTitle: "Raw Input", input: "Build me a login page with social stuff.", outputTitle: "Structured Scope", output: "Multi-Provider Auth System", detail: "3 milestones · OAuth flows · session mgmt", iconColor: "text-accent", bgColor: "bg-[#FFF7F5]/95", borderColor: "border-accent/20" },
  { type: "freelancer", inputTitle: "Unknown Developer", input: "I built a chat app in college.", outputTitle: "Verified Systems Expert", output: "Top 1% Backend Engineer", detail: "Passed real-time WebSocket architecture evaluation", iconColor: "text-blue-600", bgColor: "bg-[#FFF7F5]/90", borderColor: "border-accent/20" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  const [inputIndex, setInputIndex] = useState(0);

  const handleTabToggle = (tab: "client" | "freelancer") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  useEffect(() => {
    const interval = setInterval(() => setInputIndex((p) => (p + 1) % HERO_CYCLE_PAIRS.length), 6000);
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     UNIFIED SCROLL SEQUENCE (Wheel-Locked)
  ───────────────────────────────────────────────────────────── */
  const seqRaw = useMotionValue(0);
  const seq = useSpring(seqRaw, { stiffness: 100, damping: 24, mass: 0.5 });
  const seqRef = useRef(0);
  const unlockedRef = useRef(false);
  const wheelBusy = useRef(false);

  // Phase A: Logo zoom (0.0 -> 0.40)
  const heroLogoScale = useTransform(seq, [0, 0.40], [1, 30]);
  const heroLogoBorderRadius = useTransform(seq, [0, 0.36], ["50%", "0%"]);
  const heroElementsOpacity = useTransform(seq, [0, 0.24], [1, 0]);
  const heroInnerLogoOpacity = useTransform(seq, [0, 0.16], [1, 0]);
  const heroLogoOpacity = useTransform(seq, [0.36, 0.50], [1, 0]);

  // Phase B & C & D: Title & Cards Slide In -> Hold -> Merge -> Morph (0.40 -> 0.88)
  const sec2TitleOp = useTransform(seq, [0.40, 0.52, 0.76, 0.88], [0, 1, 1, 0]);
  const sec2TitleY = useTransform(seq, [0.40, 0.52, 0.76, 0.88], [15, 0, 0, -25]);

  // Cards slide in, then merge at center
  const sec2ClientX = useTransform(seq, [0.44, 0.56, 0.76, 0.88], ["-50vw", "0px", "0px", "232px"]);
  const sec2FreelanX = useTransform(seq, [0.44, 0.56, 0.76, 0.88], ["50vw", "0px", "0px", "-232px"]);

  const sec2CardsFilter = useTransform(seq, [0.76, 0.88, 0.92], ["blur(0px) brightness(1)", "blur(8px) brightness(1.2)", "blur(24px) brightness(2.5)"]);
  const sec2CardsOp = useTransform(seq, [0.44, 0.56, 0.88, 0.94], [0, 1, 1, 0]);
  const cardScale = useTransform(seq, [0.76, 0.88], [1, 0.96]);
  const cardInnerOp = useTransform(seq, [0.76, 0.84], [1, 0]);

  const sec2ScrollNudgeOp = useTransform(seq, [0.56, 0.64, 0.84, 0.88, 1.16, 1.20, 2.80, 2.94], [0, 1, 1, 0, 0, 1, 1, 0]);

  // Phase E: Solution Box Appears (0.88 -> 1.20)
  const sec2SolOp = useTransform(seq, [0.88, 1.00, 1.12, 1.20], [0, 1, 1, 0]);
  const sec2SolScale = useTransform(seq, [0.88, 1.00, 1.12, 1.20], [0.85, 1, 1, 0.96]);
  const sec2SolFilter = useTransform(seq, [0.88, 1.00, 1.12, 1.20], ["blur(16px) brightness(2)", "blur(0px) brightness(1)", "blur(0px) brightness(1)", "blur(12px)"]);
  const sec2SolY = useTransform(seq, [0.88, 1.00, 1.12, 1.20], [25, 0, 0, -25]);

  // Phase F: Commitments Snap-Lock Sequence (1.20 -> 1.96)
  // Clean fade-in for commitments layer, then fades out at the end as Stage 4 starts
  const commitmentsLayerOp = useTransform(seq, [1.20, 1.28, 1.88, 1.96], [0, 1, 1, 0]);
  const s3HeaderOp = useTransform(seq, [1.22, 1.30, 1.88, 1.96], [0, 1, 1, 0]);
  const s3HeaderY = useTransform(seq, [1.22, 1.30, 1.88, 1.96], [-20, 0, 0, -20]);

  // Snaps for 3 Commitments cards
  const item1Op = useTransform(seq, [1.20, 1.26, 1.40, 1.44], [0, 1, 1, 0]);
  const item1Y = useTransform(seq, [1.20, 1.26, 1.40, 1.44], [30, 0, 0, -30]);
  const item1Scale = useTransform(seq, [1.40, 1.44], [1, 0.96]);

  const item2Op = useTransform(seq, [1.44, 1.50, 1.64, 1.68], [0, 1, 1, 0]);
  const item2Y = useTransform(seq, [1.44, 1.50, 1.64, 1.68], [30, 0, 0, -30]);
  const item2Scale = useTransform(seq, [1.64, 1.68], [1, 0.96]);

  const item3Op = useTransform(seq, [1.68, 1.74, 1.88, 1.96], [0, 1, 1, 0]);
  const item3Y = useTransform(seq, [1.68, 1.74, 1.88, 1.96], [30, 0, 0, -30]);

  // Dot track indicators mapped directly to Stage 3 scroll seq
  const dot1Op = useTransform(seq, [1.20, 1.26, 1.40, 1.44], [0.3, 1, 1, 0.3]);
  const dot1Scale = useTransform(seq, [1.20, 1.26, 1.40, 1.44], [0.8, 1.25, 1.25, 0.8]);

  const dot2Op = useTransform(seq, [1.44, 1.50, 1.64, 1.68], [0.3, 1, 1, 0.3]);
  const dot2Scale = useTransform(seq, [1.44, 1.50, 1.64, 1.68], [0.8, 1.25, 1.25, 0.8]);

  const dot3Op = useTransform(seq, [1.68, 1.74, 1.88, 1.96], [0.3, 1, 1, 0.3]);
  const dot3Scale = useTransform(seq, [1.68, 1.74, 1.88, 1.96], [0.8, 1.25, 1.25, 0.8]);

  // Phase G: Journey Roadmap snaps absolutely in place (1.96 -> 3.00)
  const journeyLayerOp = useTransform(seq, [1.94, 2.02], [0, 1]);
  const s5HeaderOp = useTransform(seq, [1.96, 2.04], [0, 1]);
  const s5HeaderY = useTransform(seq, [1.96, 2.04], [-20, 0]);

  // Snaps for 4 Roadmap steps
  const step1Op = useTransform(seq, [1.80, 2.09, 2.22, 2.35], [0, 1, 1, 0]);
  const step1Y = useTransform(seq, [1.80, 2.09, 2.22, 2.35], [100, 0, 0, -100]);
  const step1Scale = useTransform(seq, [1.80, 2.09, 2.22, 2.35], [0.9, 1, 1, 0.9]);
  const step1RotX = useTransform(seq, [1.80, 2.09, 2.22, 2.35], [15, 0, 0, -15]);
  const step1Disp = useTransform(seq, (v) => (v < 1.80 || v > 2.35) ? "none" : "flex");

  const step2Op = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], [0, 0, 1, 1, 0]);
  const step2Y = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], [100, 100, 0, 0, -100]);
  const step2Scale = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], [0.9, 0.9, 1, 1, 0.9]);
  const step2RotX = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], [15, 15, 0, 0, -15]);
  const step2Disp = useTransform(seq, (v) => (v < 2.09 || v > 2.61) ? "none" : "flex");

  const step3Op = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], [0, 0, 1, 1, 0]);
  const step3Y = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], [100, 100, 0, 0, -100]);
  const step3Scale = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], [0.9, 0.9, 1, 1, 0.9]);
  const step3RotX = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], [15, 15, 0, 0, -15]);
  const step3Disp = useTransform(seq, (v) => (v < 2.35 || v > 2.87) ? "none" : "flex");

  const step4Op = useTransform(seq, [2.61, 2.74, 2.87, 3.00], [0, 0, 1, 1]);
  const step4Y = useTransform(seq, [2.61, 2.74, 2.87, 3.00], [100, 100, 0, 0]);
  const step4Scale = useTransform(seq, [2.61, 2.74, 2.87, 3.00], [0.9, 0.9, 1, 1]);
  const step4RotX = useTransform(seq, [2.61, 2.74, 2.87, 3.00], [15, 15, 0, 0]);
  const step4Disp = useTransform(seq, (v) => v < 2.61 ? "none" : "flex");

  // Dot track indicators mapped directly to Stage 4 scroll seq (active-pill capsule stretch vertically)
  const jDot1Op = useTransform(seq, [1.80, 2.09, 2.22, 2.35], [0.3, 1, 1, 0.3]);
  const jDot1Height = useTransform(seq, [1.80, 2.09, 2.22, 2.35], ["10px", "24px", "24px", "10px"]);

  const jDot2Op = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], [0.3, 0.3, 1, 1, 0.3]);
  const jDot2Height = useTransform(seq, [2.09, 2.22, 2.35, 2.48, 2.61], ["10px", "10px", "24px", "24px", "10px"]);

  const jDot3Op = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], [0.3, 0.3, 1, 1, 0.3]);
  const jDot3Height = useTransform(seq, [2.35, 2.48, 2.61, 2.74, 2.87], ["10px", "10px", "24px", "24px", "10px"]);

  const jDot4Op = useTransform(seq, [2.61, 2.74, 2.87, 3.00], [0.3, 0.3, 1, 1]);
  const jDot4Height = useTransform(seq, [2.61, 2.74, 2.87, 3.00], ["10px", "10px", "24px", "24px"]);

  // Pointer events & visibility layers
  const sec2PointerEvents = useTransform(seq, (v) => (v > 0.40 && v < 1.20) ? "auto" : "none");
  const solPointerEvents = useTransform(seq, (v) => (v > 0.88 && v < 1.20) ? "auto" : "none");
  const commitPointerEvents = useTransform(seq, (v) => (v > 1.20 && v < 1.96) ? "auto" : "none");
  const journeyPointerEvents = useTransform(seq, (v) => (v > 1.96) ? "auto" : "none");

  useEffect(() => {
    // Only run wheel-lock on desktop (lg+)
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const onWheel = (e: WheelEvent) => {
      if (unlockedRef.current) return;
      e.preventDefault();
      if (wheelBusy.current) return;
      wheelBusy.current = true;
      requestAnimationFrame(() => { wheelBusy.current = false; });

      const speed = 1000; // Increased spacing for more comfortable, deliberate scrolling
      const next = Math.min(3, Math.max(0, seqRef.current + e.deltaY / speed));
      seqRef.current = next;
      seqRaw.set(next);

      if (next >= 2.98) {
        setTimeout(() => { unlockedRef.current = true; document.body.style.overflow = "unset"; }, 200);
      }
    };
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => { window.removeEventListener("wheel", onWheel); document.body.style.overflow = "unset"; };
  }, [seqRaw]);

  useEffect(() => {
    // Only run scroll-lock on desktop (lg+)
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const onScroll = () => {
      if (window.scrollY <= 0 && unlockedRef.current) {
        unlockedRef.current = false;
        seqRef.current = 2.98;
        seqRaw.set(2.98);
        document.body.style.overflow = "hidden";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [seqRaw]);



  return (
    <div className="bg-background text-text-primary font-sans antialiased overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          MOBILE / TABLET VIEW (< lg) — Non-scrollable app
      ══════════════════════════════════════════════════ */}
      <div className="block lg:hidden">
        <MobileLandingPage />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP VIEW (lg+) — Wheel-locked scroll sequence
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:block">

      {/* ════════════════════════════════════════════════
          STAGE 1, 2, 2.5, & 3 — LOCKED UNIFIED SEQUENCE
      ════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full bg-surface overflow-hidden">

        {/* ── STAGE 1: HERO ── */}
        <motion.div style={{ opacity: heroElementsOpacity }}
          className="absolute inset-x-0 top-0 pt-16 px-6 md:px-16 z-30 pointer-events-none select-none flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-[420px]">
            <h2 className={`font-sans font-bold tracking-tighter text-4xl md:text-5xl lg:text-7xl transition-all duration-700 ${HERO_CYCLE_PAIRS[inputIndex].type === "freelancer" ? "text-stone-900" : "text-stone-300"}`}>
              We <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">test</span> the talent.
            </h2>
            {HERO_CYCLE_PAIRS[inputIndex].type === "freelancer" && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-stone-400 leading-relaxed">
                Top 1% vetted talent, assessed and ready to execute your vision.
              </motion.p>
            )}
          </div>
          <div className="max-w-[420px] md:text-right">
            <h2 className={`font-sans font-bold tracking-tighter text-4xl md:text-5xl lg:text-7xl transition-all duration-700 ${HERO_CYCLE_PAIRS[inputIndex].type === "client" ? "text-stone-900" : "text-stone-300"}`}>
              We <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">lock</span> the scope.
            </h2>
            {HERO_CYCLE_PAIRS[inputIndex].type === "client" && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-stone-400 md:ml-auto leading-relaxed">
                Crystal clear requirements, predictable timelines, and absolutely no guesswork.
              </motion.p>
            )}
          </div>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-20">
          <motion.div style={{ opacity: heroElementsOpacity }} className="absolute inset-0 flex items-center justify-center z-0 hidden sm:flex">
            {/* Outer ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute w-[900px] h-[900px] rounded-full border border-dashed border-stone-300">
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute top-[-28px] left-[calc(50%-28px)] w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><FileCheck size={24} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-28px] left-[calc(50%-28px)] w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><ShieldCheck size={24} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute left-[-28px] top-[calc(50%-28px)] w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><Code size={24} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute right-[-28px] top-[calc(50%-28px)] w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><UserCheck size={24} className="text-accent" strokeWidth={1.5} /></motion.div>
            </motion.div>
            {/* Middle ring */}
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute w-[640px] h-[640px] rounded-full border border-dashed border-stone-300">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute top-[-24px] left-[calc(50%-24px)] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><Layers size={22} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-24px] left-[calc(50%-24px)] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><Database size={22} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute right-[-24px] top-[calc(50%-24px)] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><ArrowRightLeft size={22} className="text-accent" strokeWidth={1.5} /></motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute left-[-24px] top-[calc(50%-24px)] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-stone-100"><CheckCircle2 size={22} className="text-accent" strokeWidth={1.5} /></motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ scale: heroLogoScale, borderRadius: heroLogoBorderRadius, opacity: heroLogoOpacity }}
            className="relative z-50 w-36 h-36 md:w-48 md:h-48 bg-surface flex items-center justify-center shadow-[0_10px_60px_rgba(232,82,57,0.08)] border border-white/60"
          >
            <motion.div style={{ opacity: heroInnerLogoOpacity }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="flex items-center justify-center w-[75%]">
              <svg viewBox="0 0 160 40" className="w-full h-auto drop-shadow-sm overflow-visible">
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-sans font-black text-stone-900" style={{ fontSize: "28px", letterSpacing: "-0.05em" }}>
                  EXECUTA<tspan fill="#E85239">.</tspan>
                </text>
              </svg>
            </motion.div>
          </motion.div>

          {/* I/O animation cards */}
          <motion.div style={{ opacity: heroElementsOpacity }} className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none hidden sm:flex">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ maskImage: "radial-gradient(circle at center, transparent 96px, black 98px)", WebkitMaskImage: "radial-gradient(circle at center, transparent 96px, black 98px)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={`in-${inputIndex}`} className="absolute bg-white/95 backdrop-blur-3xl border border-stone-200 p-6 lg:p-7 rounded-2xl shadow-sm w-[300px] lg:w-[380px] will-change-transform"
                  animate={{ x: HERO_CYCLE_PAIRS[inputIndex].type === "freelancer" ? ["-60vw", "-26vw", "-26vw", "0vw", "0vw"] : ["60vw", "26vw", "26vw", "0vw", "0vw"], scale: [1, 1, 1, 0.4, 0.4] }}
                  transition={{ duration: 6, times: [0, 0.18, 0.40, 0.48, 1], ease: "easeInOut" }}>
                  <div className="flex items-center gap-3 mb-4"><div className="w-2.5 h-2.5 rounded-full bg-stone-400" /><p className="text-[11px] font-mono font-bold text-stone-600 uppercase tracking-widest">{HERO_CYCLE_PAIRS[inputIndex].inputTitle}</p></div>
                  <p className="text-[15px] lg:text-[18px] font-mono text-stone-800 font-medium leading-relaxed">&ldquo;{HERO_CYCLE_PAIRS[inputIndex].input}&rdquo;</p>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={`out-${inputIndex}`} className={`absolute bg-[#FFF7F5]/95 backdrop-blur-xl border-2 border-accent/20 p-6 lg:p-7 rounded-3xl shadow-[0_20px_40px_-12px_rgba(230,62,0,0.08)] w-[320px] lg:w-[420px] will-change-transform`}
                  animate={{ x: HERO_CYCLE_PAIRS[inputIndex].type === "freelancer" ? ["0vw", "0vw", "26vw", "26vw", "60vw"] : ["0vw", "0vw", "-26vw", "-26vw", "-60vw"], scale: [0.4, 0.4, 1, 1, 1] }}
                  transition={{ duration: 6, times: [0, 0.52, 0.60, 0.82, 1], ease: "easeInOut" }}>
                  <div className="flex items-center gap-3 mb-4"><div className={`w-2.5 h-2.5 rounded-full animate-pulse bg-accent shadow-[0_0_8px_rgba(230,62,0,0.5)]`} /><p className={`text-[11px] font-mono font-bold uppercase tracking-widest text-accent`}>{HERO_CYCLE_PAIRS[inputIndex].outputTitle}</p></div>
                  <p className="text-[17px] lg:text-[21px] font-mono font-semibold text-stone-900 leading-snug mb-2">{HERO_CYCLE_PAIRS[inputIndex].output}</p>
                  <p className="text-[13px] lg:text-[14px] font-mono text-stone-600 leading-relaxed">{HERO_CYCLE_PAIRS[inputIndex].detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div style={{ opacity: heroElementsOpacity }} className="absolute inset-x-0 bottom-0 pb-8 md:pb-12 px-6 md:px-16 z-[70] flex justify-between pointer-events-auto">
          <Link href="/auth/login?role=freelancer&mode=signup">
            <button className={`group flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full transition-all duration-500 shadow-lg ${HERO_CYCLE_PAIRS[inputIndex].type === "freelancer" ? "bg-accent text-white hover:bg-accent-hover" : "bg-orange-50 text-accent opacity-60 scale-95"}`}>
              Join as Freelancer <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/auth/login?role=client&mode=signup" className="ml-auto">
            <button className={`group flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full transition-all duration-500 shadow-lg ${HERO_CYCLE_PAIRS[inputIndex].type === "client" ? "bg-accent text-white hover:bg-accent-hover" : "bg-orange-50 text-accent opacity-60 scale-95"}`}>
              Hire Freelancers <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        {/* ── STAGE 2: PROBLEM STATE ── */}
        <motion.div style={{ pointerEvents: sec2PointerEvents }} className="absolute inset-0 z-40 flex flex-col items-center justify-start overflow-hidden px-4 md:px-12 pt-[10vh]">

          <motion.div className="relative w-full max-w-[1200px] flex flex-col items-center justify-start">
            <motion.div style={{ opacity: sec2TitleOp, y: sec2TitleY }} className="text-center mb-6 shrink-0 relative z-20">
              <div className="flex items-center justify-center gap-3 mb-2.5">
                <div className="h-px w-8 bg-stone-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">The Honest Problem</span>
                <div className="h-px w-8 bg-stone-300" />
              </div>
              <h2 className="font-sans font-bold tracking-tight text-stone-900 leading-[1.05]" style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)" }}>
                Freelancing is broken<br />
                <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">for both sides.</span>
              </h2>
            </motion.div>

            {/* Cards Row */}
            <div className="relative w-full flex justify-center h-[460px]">

              {/* CLIENT CARD */}
              <motion.div
                style={{ x: sec2ClientX, opacity: sec2CardsOp, filter: sec2CardsFilter, scale: cardScale }}
                className="absolute right-[calc(50%+12px)] top-0 bg-[#FDFDFD] rounded-[2rem] p-8 shadow-[0_25px_60px_-15px_rgba(232,82,57,0.04),0_1px_4px_rgba(232,82,57,0.01)] border border-stone-200/80 w-[440px] h-[450px] flex flex-col z-10 overflow-hidden group/card transition-shadow hover:shadow-[0_30px_70px_-10px_rgba(232,82,57,0.06)] duration-500"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-[#FF5B3A]" />

                <motion.div style={{ opacity: cardInnerOp }} className="flex flex-col h-full justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[9px] font-bold text-accent uppercase tracking-wider mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      For Clients
                    </div>

                    <h4 className="text-[22px] font-bold text-stone-900 leading-[1.25] tracking-tight mb-5">
                      You keep paying.<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">Nothing gets done.</span>
                    </h4>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { num: "01", title: "No fixed price", desc: "Hourly billing. The invoice is always a surprise." },
                      { num: "02", title: "No clear scope", desc: "Requirements drift. Deadlines shift." },
                      { num: "03", title: "No way to verify", desc: "CVs hide what they can't actually build." },
                      { num: "04", title: "No protection", desc: "If it goes wrong, you're on your own." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-stone-50/50 border border-stone-100 rounded-2xl transition-all duration-300 hover:bg-stone-50 hover:border-accent/30 hover:translate-x-1 group">
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5 select-none">
                          <span className="font-mono text-xs font-bold text-accent/40 group-hover:text-accent transition-colors duration-300">{item.num}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent transition-colors duration-300" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 leading-none mb-0.5 group-hover:text-accent transition-colors duration-300">{item.title}</p>
                          <p className="text-[12px] text-stone-500 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* FREELANCER CARD */}
              <motion.div
                style={{ x: sec2FreelanX, opacity: sec2CardsOp, filter: sec2CardsFilter, scale: cardScale }}
                className="absolute left-[calc(50%+12px)] top-0 bg-[#FDFDFD] rounded-[2rem] p-8 shadow-[0_25px_60px_-15px_rgba(232,82,57,0.04),0_1px_4px_rgba(232,82,57,0.01)] border border-stone-200/80 w-[440px] h-[450px] flex flex-col z-10 overflow-hidden group/card transition-shadow hover:shadow-[0_30px_70px_-10px_rgba(232,82,57,0.06)] duration-500"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-[#FF5B3A]" />

                <motion.div style={{ opacity: cardInnerOp }} className="flex flex-col h-full justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[9px] font-bold text-accent uppercase tracking-wider mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      For Freelancers
                    </div>

                    <h4 className="text-[22px] font-bold text-stone-900 leading-[1.25] tracking-tight mb-5">
                      You keep working.<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">You never get paid fairly.</span>
                    </h4>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { num: "01", title: "Race to the bottom", desc: "Platforms push you to cut rates just to win." },
                      { num: "02", title: "Scope creep", desc: "One task turns into months of unpaid extras." },
                      { num: "03", title: "Specs always shift", desc: "You build one thing. They want another." },
                      { num: "04", title: "No proof of skill", desc: "Experience means nothing without a track record." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-stone-50/50 border border-stone-100 rounded-2xl transition-all duration-300 hover:bg-stone-50 hover:border-accent/30 hover:translate-x-1 group">
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5 select-none">
                          <span className="font-mono text-xs font-bold text-accent/40 group-hover:text-accent transition-colors duration-300">{item.num}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent transition-colors duration-300" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-stone-900 leading-none mb-0.5 group-hover:text-accent transition-colors duration-300">{item.title}</p>
                          <p className="text-[12px] text-stone-500 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </motion.div>

        </motion.div>

        {/* ── STAGE 2.5: SOLUTION BOX ── */}
        <motion.div
          style={{ opacity: sec2SolOp, scale: sec2SolScale, filter: sec2SolFilter, y: sec2SolY, pointerEvents: solPointerEvents }}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-12 z-40 pointer-events-none"
        >
          <div className="w-full max-w-[1000px] bg-white rounded-[2.5rem] p-12 md:p-16 shadow-[0_40px_120px_-25px_rgba(232,82,57,0.1),0_1px_4px_rgba(0,0,0,0.01)] border border-stone-200/80 relative overflow-hidden flex flex-col items-center pointer-events-auto mt-4 transition-all duration-500">

            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent via-accent to-[#FF5B3A]" />
            <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[80%] h-[350px] bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white border border-stone-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.03)] mb-6 relative z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
                <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor" opacity="0.15" />
                <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-600">The Solution</span>
            </div>

            <h3 className="text-3xl md:text-5xl font-sans font-bold text-stone-900 mb-12 tracking-tight relative z-10 max-w-xl text-center leading-none">
              Built to fix <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">both sides.</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-8 w-full mb-12 relative z-10">

              {/* Highlighted Scope Card */}
              <div className="bg-[#FCFCFC] rounded-3xl p-8 border border-stone-200/80 flex flex-col items-start text-left transition-all hover:bg-white hover:border-accent/40 hover:shadow-[0_20px_50px_-15px_rgba(232,82,57,0.06)] duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100 group-hover:scale-105 transition-transform duration-300">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#E85239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>

                <span className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">01 / Predictability</span>

                <h4 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-4 leading-none">
                  Scope <span className="text-accent">Locked.</span>
                </h4>

                <p className="text-stone-500 text-[14px] leading-relaxed">
                  Price is agreed and locked before work starts. We eliminate hourly billing entirely, meaning no surprise invoices, no scope creep, and zero budget overruns.
                </p>
              </div>

              {/* Highlighted Talent Card */}
              <div className="bg-[#FCFCFC] rounded-3xl p-8 border border-stone-200/80 flex flex-col items-start text-left transition-all hover:bg-white hover:border-accent/40 hover:shadow-[0_20px_50px_-15px_rgba(232,82,57,0.06)] duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100 group-hover:scale-105 transition-transform duration-300">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" stroke="#E85239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>

                <span className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">02 / Assurance</span>

                <h4 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-4 leading-none">
                  Talent <span className="text-accent">Tested.</span>
                </h4>

                <p className="text-stone-500 text-[14px] leading-relaxed">
                  Every expert has passed our Level 2 Skills Assessment. No self-reported CVs. You only work with the top 1% of vetted talent.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full relative z-10">
              <Link href="/auth/login?role=client&mode=signup" className="w-full sm:w-auto">
                <button className="flex items-center justify-center gap-2.5 bg-accent text-white px-9 py-4 rounded-full font-bold text-[14px] shadow-[0_12px_24px_-8px_rgba(232,82,57,0.4)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-6px_rgba(232,82,57,0.5)] transition-all duration-300 w-full sm:w-auto group">
                  Hire Freelancers
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
              <Link href="/auth/login?role=freelancer&mode=signup" className="w-full sm:w-auto">
                <button className="flex items-center justify-center gap-2.5 bg-white text-stone-800 border border-stone-200 px-9 py-4 rounded-full font-bold text-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto group">
                  Join as Freelancer
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── STAGE 3: COMMITMENTS SNAP-LOCKS (Absolute Overlay inside Unified Sequence) ── */}
        <motion.div
          style={{ opacity: commitmentsLayerOp, pointerEvents: commitPointerEvents }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-start overflow-hidden px-4 md:px-12 pt-[10vh]"
        >
          {/* Consistent Floated Header matching 'The Honest Problem' exactly */}
          <motion.div
            style={{ opacity: s3HeaderOp, y: s3HeaderY }}
            className="absolute top-[10vh] inset-x-0 z-20 text-center flex flex-col items-center select-none"
          >
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <div className="h-px w-8 bg-stone-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Our Commitments</span>
              <div className="h-px w-8 bg-stone-300" />
            </div>
            <h2 className="font-sans font-bold tracking-tight text-stone-900 leading-[1.05]" style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)" }}>
              Three things that make<br />
              <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">every project land.</span>
            </h2>
          </motion.div>

          <div className="relative w-full max-w-[1000px] h-[75%] flex items-center justify-center px-6">

            {/* ── COMMITMENT 01 (Predictability) ── */}
            <motion.div
              style={{ opacity: item1Op, y: item1Y, scale: item1Scale }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            >
              <div className="absolute font-sans font-extrabold text-[24vw] leading-none text-accent/5 select-none z-0 mt-8">
                01
              </div>
              <div className="relative z-10 flex flex-col items-center max-w-xl px-4 mt-32 md:mt-36">
                <div className="px-3.5 py-1.5 rounded-full bg-orange-50/80 border border-accent/15 text-[10px] font-bold text-accent uppercase tracking-widest mb-6">
                  Predictability First
                </div>
                <h3 className="text-3xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
                  Scope locked before <span className="text-accent font-extrabold">work starts.</span>
                </h3>
                <p className="text-[15px] md:text-[16px] text-stone-500 leading-relaxed font-medium">
                  Every project begins with a structured scope document — deliverables, milestones, and pricing — all agreed before a single line of code is written. No scope creep. No surprises.
                </p>
              </div>
            </motion.div>

            {/* ── COMMITMENT 02 (Quality) ── */}
            <motion.div
              style={{ opacity: item2Op, y: item2Y, scale: item2Scale }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            >
              <div className="absolute font-sans font-extrabold text-[24vw] leading-none text-accent/5 select-none z-0 mt-8">
                02
              </div>
              <div className="relative z-10 flex flex-col items-center max-w-xl px-4 mt-32 md:mt-36">
                <div className="px-3.5 py-1.5 rounded-full bg-orange-50/80 border border-accent/15 text-[10px] font-bold text-accent uppercase tracking-widest mb-6">
                  Guaranteed Quality
                </div>
                <h3 className="text-3xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
                  Talent tested before <span className="text-accent font-extrabold">they join.</span>
                </h3>
                <p className="text-[15px] md:text-[16px] text-stone-500 leading-relaxed font-medium">
                  Every expert has passed our Level 2 Skills Assessment. No self-reported CVs. No guessing. You work with experts who have genuinely proven their skills.
                </p>
              </div>
            </motion.div>

            {/* ── COMMITMENT 03 (Accountability) ── */}
            <motion.div
              style={{ opacity: item3Op, y: item3Y }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            >
              <div className="absolute font-sans font-extrabold text-[24vw] leading-none text-accent/5 select-none z-0 mt-8">
                03
              </div>
              <div className="relative z-10 flex flex-col items-center max-w-xl px-4 mt-32 md:mt-36">
                <div className="px-3.5 py-1.5 rounded-full bg-orange-50/80 border border-accent/15 text-[10px] font-bold text-accent uppercase tracking-widest mb-6">
                  Absolute Accountability
                </div>
                <h3 className="text-3xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
                  Accountability in <span className="text-accent font-extrabold">every milestone.</span>
                </h3>
                <p className="text-[15px] md:text-[16px] text-stone-500 leading-relaxed font-medium">
                  Payment is tied to milestone completion — not hours worked. If a milestone isn&apos;t delivered, you don&apos;t pay. Simple.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Centered Progress dots positioned horizontally right in the bottom center (elevated to bottom-[16vh] to prevent overlaps) */}
          <div className="absolute bottom-[16vh] left-1/2 -translate-x-1/2 flex gap-3.5 z-50 select-none pointer-events-auto">
            {[
              { op: dot1Op, scale: dot1Scale },
              { op: dot2Op, scale: dot2Scale },
              { op: dot3Op, scale: dot3Scale }
            ].map((dot, idx) => (
              <motion.div
                key={idx}
                style={{ opacity: dot.op, scale: dot.scale }}
                className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm"
              />
            ))}
          </div>

        </motion.div>

        {/* ── STAGE 4: YOUR JOURNEY (ROADMAP SCROLL SNAPPING) ── */}
        <motion.div
          style={{ opacity: journeyLayerOp, pointerEvents: journeyPointerEvents }}
          className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden px-6 md:px-16"
        >
          <div className="w-full max-w-[1140px] flex flex-col md:flex-row items-center justify-between gap-12 select-none relative z-10 -mt-6 md:-mt-12">

            {/* Left Column: Fixed big editorial header text */}
            <motion.div
              style={{ opacity: s5HeaderOp, y: s5HeaderY }}
              className="w-full md:w-[35%] text-left relative z-20 shrink-0"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Your Journey</span>
                <div className="h-px w-8 bg-stone-300" />
              </div>
              <h2 className="font-sans font-bold tracking-tight text-stone-900 leading-[1.02] mb-6 animate-fade-in" style={{ fontSize: "clamp(2.5rem, 4.8vw, 3.8rem)" }}>
                How it works<br />
                <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">for you.</span>
              </h2>
              <p className="text-[14.5px] text-stone-500 font-medium leading-relaxed max-w-[280px]">
                A predictable, transparent roadmap designed to keep every step clear, vetted, and accounted for.
              </p>
            </motion.div>

            {/* Right Column: Switcher, 3D Deck and Vertical Indicator Dots */}
            <div className="w-full md:w-[60%] flex flex-col items-center justify-center relative min-h-[480px]">

              {/* Centered Horizontal tab Switcher Selector */}
              <div className="flex items-center gap-1 p-1 bg-stone-100/80 rounded-full w-fit mb-8 shrink-0 relative z-30 pointer-events-auto shadow-sm">
                {(["client", "freelancer"] as const).map((tab) => (
                  <button key={tab} onClick={() => handleTabToggle(tab)}
                    className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${activeTab === tab ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                    {tab === "client" ? "I'm a Client" : "I'm a Freelancer"}
                  </button>
                ))}
              </div>

              {/* Stop-Motion Snapping Cards Container */}
              <div className="relative w-full max-w-[700px] h-[360px] md:h-[300px] flex items-center justify-center" style={{ perspective: "1500px" }}>
                {[
                  {
                    n: "01",
                    client: {
                      tag: "Milestone 01",
                      title: "Describe what you need",
                      body: "No technical jargon required. Describe your goal in plain language — we turn it into a structured, priced scope document.",
                      specTitle: "Scope Blueprint",
                      checks: ["Plain language input received", "AI scope document auto-generated", "Priced deliverables mapped"]
                    },
                    freelancer: {
                      tag: "Requirement 01",
                      title: "Apply and prove your skills",
                      body: "Take our technical assessment — no CV required. If you're in the top 1%, you're in.",
                      specTitle: "Technical Screening",
                      checks: ["Real-world coding test starting", "Algorithmic review passed", "Architecture evaluation cleared"]
                    }
                  },
                  {
                    n: "02",
                    client: {
                      tag: "Milestone 02",
                      title: "Review scope + fixed price",
                      body: "Before anyone starts, you see the full breakdown: deliverables, milestones, and a single fixed price. Approve it, and work begins.",
                      specTitle: "Milestone Locked",
                      checks: ["Deliverables outline approved", "Fixed-price quote locked", "Secure escrow deposit funded"]
                    },
                    freelancer: {
                      tag: "Requirement 02",
                      title: "Get matched to real projects",
                      body: "We bring you projects that match your skills and availability. No bidding wars. No undercutting.",
                      specTitle: "Project Pairing",
                      checks: ["Matching skills analysis completed", "Active projects available", "Direct assignment offered"]
                    }
                  },
                  {
                    n: "03",
                    client: {
                      tag: "Milestone 03",
                      title: "Matched with a vetted expert",
                      body: "We assign a developer who has passed our technical assessment for your specific domain. No guesswork.",
                      specTitle: "Vetting Check",
                      checks: ["Top 1% technical screen passed", "Domain-expert dev matched", "Kickoff workspace launched"]
                    },
                    freelancer: {
                      tag: "Requirement 03",
                      title: "Build with a clear scope",
                      body: "Every project comes with a fully defined scope. You know exactly what to build and what you'll earn.",
                      specTitle: "Development Specs",
                      checks: ["Detailed blueprint reviewed", "Earning thresholds confirmed", "Milestone roadmap claimed"]
                    }
                  },
                  {
                    n: "04",
                    client: {
                      tag: "Milestone 04",
                      title: "Pay per milestone, not per hour",
                      body: "Funds release as milestones are completed and verified. You stay in control throughout.",
                      specTitle: "Delivery Quality",
                      checks: ["Deliverable milestone verified", "Auto quality review check passed", "Escrow funds released safely"]
                    },
                    freelancer: {
                      tag: "Requirement 04",
                      title: "Get paid when you deliver",
                      body: "Milestone payments are released automatically on completion. No chasing. No disputes.",
                      specTitle: "Secure Payments",
                      checks: ["Milestone task completed", "Code quality checks verified", "Payment released automatically"]
                    }
                  }
                ].map(({ n, client, freelancer }, idx) => {
                  const stepOp = idx === 0 ? step1Op : idx === 1 ? step2Op : idx === 2 ? step3Op : step4Op;
                  const stepY = idx === 0 ? step1Y : idx === 1 ? step2Y : idx === 2 ? step3Y : step4Y;
                  const stepScale = idx === 0 ? step1Scale : idx === 1 ? step2Scale : idx === 2 ? step3Scale : step4Scale;
                  const stepRotX = idx === 0 ? step1RotX : idx === 1 ? step2RotX : idx === 2 ? step3RotX : step4RotX;
                  const stepDisp = idx === 0 ? step1Disp : idx === 1 ? step2Disp : idx === 2 ? step3Disp : step4Disp;

                  return (
                    <motion.div
                      key={n}
                      style={{
                        opacity: stepOp,
                        y: stepY,
                        scale: stepScale,
                        rotateX: stepRotX,
                        display: stepDisp,
                        transformStyle: "preserve-3d"
                      }}
                      className="absolute inset-x-0 mx-auto w-full max-w-[660px] h-[380px] md:h-[290px] pointer-events-none select-none z-10"
                    >
                      <div
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative w-full h-full pointer-events-auto cursor-pointer"
                      >
                        {/* FRONT FACE (Client) */}
                        <motion.div
                          animate={{ rotateY: activeTab === "client" ? 0 : 180 }}
                          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                          className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-xl border border-stone-200/50 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(232,82,57,0.03)] flex flex-col md:flex-row gap-6 items-center justify-between transition-transform duration-300 hover:scale-[1.015] hover:shadow-[0_25px_60px_rgba(232,82,57,0.06)] active:scale-[0.99] border-t-2 border-t-accent/20"
                        >
                          {/* Left half: Copy editorial */}
                          <div className="flex-1 text-left">
                            <div className="px-3.5 py-1 rounded-full bg-orange-50/80 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest mb-4 inline-block shadow-sm">
                              {client.tag}
                            </div>
                            <h3 className="text-xl md:text-2xl font-sans font-bold text-stone-900 tracking-tight leading-snug mb-3">
                              {client.title.split(" ").slice(0, -2).join(" ")} <span className="text-accent font-extrabold">{client.title.split(" ").slice(-2).join(" ")}</span>
                            </h3>
                            <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-sm">
                              {client.body}
                            </p>
                          </div>

                          {/* Right half: Dynamic spec checklists container */}
                          <div className="bg-stone-50/60 backdrop-blur-md border border-stone-100 p-5 rounded-2xl w-full md:w-[250px] shrink-0 text-left space-y-3 select-none shadow-inner">
                            <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/50">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                                {client.specTitle}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            </div>
                            <div className="space-y-2.5">
                              {client.checks.map((check, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-2">
                                  <CheckCircle2 size={12} className="text-accent mt-0.5 shrink-0" strokeWidth={2.5} />
                                  <p className="text-[11px] text-stone-600 font-semibold leading-tight">
                                    {check}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* BACK FACE (Freelancer) */}
                        <motion.div
                          animate={{ rotateY: activeTab === "client" ? -180 : 0 }}
                          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transformStyle: "preserve-3d"
                          }}
                          className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-xl border border-stone-200/50 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(232,82,57,0.03)] flex flex-col md:flex-row gap-6 items-center justify-between transition-transform duration-300 hover:scale-[1.015] hover:shadow-[0_25px_60px_rgba(232,82,57,0.06)] active:scale-[0.99] border-t-2 border-t-accent/20"
                        >
                          {/* Left half: Copy editorial */}
                          <div className="flex-1 text-left">
                            <div className="px-3.5 py-1 rounded-full bg-orange-50/80 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest mb-4 inline-block shadow-sm">
                              {freelancer.tag}
                            </div>
                            <h3 className="text-xl md:text-2xl font-sans font-bold text-stone-900 tracking-tight leading-snug mb-3">
                              {freelancer.title.split(" ").slice(0, -2).join(" ")} <span className="text-accent font-extrabold">{freelancer.title.split(" ").slice(-2).join(" ")}</span>
                            </h3>
                            <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-sm">
                              {freelancer.body}
                            </p>
                          </div>

                          {/* Right half: Dynamic spec checklists container */}
                          <div className="bg-stone-50/60 backdrop-blur-md border border-stone-100 p-5 rounded-2xl w-full md:w-[250px] shrink-0 text-left space-y-3 select-none shadow-inner">
                            <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/50">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                                {freelancer.specTitle}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            </div>
                            <div className="space-y-2.5">
                              {freelancer.checks.map((check, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-2">
                                  <CheckCircle2 size={12} className="text-accent mt-0.5 shrink-0" strokeWidth={2.5} />
                                  <p className="text-[11px] text-stone-600 font-semibold leading-tight">
                                    {check}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
                {/* Vertical Progress dots on the right side for Stage 5 */}
                <div className="absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-50 select-none pointer-events-auto">
                  {[
                    { op: jDot1Op, h: jDot1Height },
                    { op: jDot2Op, h: jDot2Height },
                    { op: jDot3Op, h: jDot3Height },
                    { op: jDot4Op, h: jDot4Height }
                  ].map((dot, idx) => (
                    <motion.div
                      key={idx}
                      style={{ opacity: dot.op, height: dot.h }}
                      className="w-2.5 rounded-full bg-accent shadow-sm"
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </motion.div>

        {/* Scroll nudge positioned in the horizontal bottom center with mouse scroll animation */}
        <motion.div style={{ opacity: sec2ScrollNudgeOp }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none pointer-events-none z-50">
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-stone-400">Keep Scrolling</span>
          <motion.div className="w-[18px] h-[28px] md:w-[22px] md:h-[34px] rounded-full border-2 border-stone-300 flex justify-center pt-1.5 md:pt-2">
            <motion.div animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-accent" />
          </motion.div>
        </motion.div>

      </section>

      {/* ════════════════════════════════════════════════
          SECTION 6 — EDITORIAL FOOTER · SINGLE FRAME
      ════════════════════════════════════════════════ */}
      <section
        className="w-full relative flex flex-col justify-center overflow-hidden"
        style={{
          height: "100svh",
          paddingBottom: "calc(clamp(110px, 20vw, 260px) * 0.82 + 16px)",
          background: "linear-gradient(150deg, #FFF7F6 0%, #FFF2EE 45%, #FDEAE4 100%)",
        }}
      >
        {/* ── Ambient glow blobs ── */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#E85239]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-0 w-[450px] h-[450px] bg-orange-300/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-[#E85239]/4 rounded-full blur-[120px] pointer-events-none" />

        {/* ── Top separator ── */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E85239]/25 to-transparent" />

        {/* ── MAIN CONTENT — left/right split ── */}
        <div
          className="relative z-10 w-full max-w-[1280px] mx-auto px-8 md:px-16"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-20">

            {/* LEFT — headline + description + buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <h2
                className="font-sans font-black leading-[1.02] tracking-tight text-stone-900 mb-1"
                style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
              >
                Lock scope. Hire talent.
              </h2>
              <h2
                className="font-sans leading-[1.0] tracking-tight mb-4"
                style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
              >
                <span
                  className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  execute flawlessly.
                </span>
              </h2>
              <p className="text-[14px] text-stone-500 font-medium leading-[1.7] max-w-[500px] mb-6">
                Define your requirements and secure milestone payments in escrow.<br />
                We instantly match you with verified experts to build and deliver<br />
                your project precisely on time.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/auth/login?role=client&mode=signup">
                  <button className="group inline-flex items-center gap-2 bg-[#E85239] text-white font-bold text-[14px] tracking-wide px-7 py-3.5 rounded-full shadow-[0_6px_24px_-6px_rgba(232,82,57,0.55)] hover:shadow-[0_14px_32px_-6px_rgba(232,82,57,0.65)] transition-all duration-300 hover:-translate-y-0.5">
                    Hire a Freelancer <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/auth/login?role=freelancer&mode=signup">
                  <button className="group inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-stone-800 font-bold text-[14px] tracking-wide px-7 py-3.5 rounded-full border border-stone-200 hover:bg-white hover:border-stone-300 transition-all duration-300 hover:-translate-y-0.5">
                    Join as Freelancer <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* RIGHT — nav link columns (top-aligned with headline) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 pt-2"
            >
              <div className="flex flex-row gap-12 md:gap-16">
                <div className="flex flex-col gap-2.5">
                  <span className="text-[12px] font-bold tracking-wider text-stone-700 mb-2">Pages</span>
                  {[
                    { label: "For Clients", href: "/auth/login?role=client&mode=signup" },
                    { label: "For Freelancers", href: "/auth/login?role=freelancer&mode=signup" },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="text-[12px] text-stone-500 hover:text-[#E85239] transition-colors duration-200 font-medium">
                      {l.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="text-[12px] font-bold tracking-wider text-stone-700 mb-2">Contact & legal</span>
                  {[
                    { label: "Contact Us", href: "/contact" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "LinkedIn", href: "#" },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="text-[12px] text-stone-500 hover:text-[#E85239] transition-colors duration-200 font-medium">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── Centered gradient line — fades from both sides ── */}
        <div
          className="absolute left-0 right-0 pointer-events-none px-8 md:px-16"
          style={{ bottom: "calc(clamp(110px, 20vw, 260px) * 0.82 + 20px)" }}
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E85239]/25 to-transparent" />
        </div>

        {/* ── GIANT WORDMARK — gradient-filled, bleeds off the bottom ── */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center select-none pointer-events-none">
          <div
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontWeight: 900,
              fontSize: "clamp(110px, 20vw, 260px)",
              lineHeight: 0.82,
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              background: "linear-gradient(180deg, rgba(232,82,57,0.22) 0%, rgba(240,120,90,0.14) 30%, rgba(253,200,180,0.10) 60%, rgba(254,234,228,0.06) 82%, transparent 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "1px rgba(232,82,57,0.10)",
              filter: "drop-shadow(0 -2px 0 rgba(232,82,57,0.06))",
            }}
          >
            EXECUTA
          </div>
        </div>

      </section>

      </div>{/* end desktop */}
    </div>
  );
}
