"use client";
import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronRight, Zap, Shield,
  Lock, ArrowLeft, FileText, UserCheck, BadgeCheck, AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   TYPES & DATA
───────────────────────────────────────────────────────── */
type Stage = 0 | 1 | 2 | 3;
type Role = "client" | "freelancer";

/* Problem cards — with stat bullets to fill the card */
const PROBLEMS = {
  client: [
    {
      num: "01", title: "No fixed price",
      desc: "Hourly billing. The invoice is always a surprise.",
      bullets: ["73% of clients experience invoice shock", "Average budget overrun: 2.4×", "Zero cap on hours billed"],
    },
    {
      num: "02", title: "No clear scope",
      desc: "Requirements drift constantly. Deadlines shift without explanation.",
      bullets: ["67% of projects exceed original scope", "Scope creep costs 3× more than planned", "No accountability for changes"],
    },
    {
      num: "03", title: "No way to verify",
      desc: "CVs hide what developers can't actually build.",
      bullets: ["92% of CVs include exaggerated skills", "Unqualified devs cost weeks to detect", "No standardised skill tests on most platforms"],
    },
    {
      num: "04", title: "No protection",
      desc: "If something goes wrong, you're entirely on your own.",
      bullets: ["Platforms offer zero financial protection", "Dispute resolution takes weeks or months", "Funds released with no quality gate"],
    },
  ],
  freelancer: [
    {
      num: "01", title: "Race to the bottom",
      desc: "Platforms push you to cut your rates just to win.",
      bullets: ["Platform fees take up to 20% of earnings", "Lowest bidder wins regardless of quality", "Premium engineers earn less than juniors"],
    },
    {
      num: "02", title: "Scope creep",
      desc: "One task turns into months of unpaid extras.",
      bullets: ["85% of freelancers report unpaid extra work", "Revisions expand 3× beyond the original brief", "No formal change request process exists"],
    },
    {
      num: "03", title: "Specs always shift",
      desc: "You build one thing. They want another.",
      bullets: ["Requirements change mid-build constantly", "No version control on project specs", "Client-side changes cause delivery delays"],
    },
    {
      num: "04", title: "No proof of skill",
      desc: "Years of real experience mean nothing without proof.",
      bullets: ["Portfolios can be faked in minutes", "No verification beyond self-reported CVs", "Skills go unrecognised without platform reviews"],
    },
  ],
};

/* Commitment cards — same structure for layout consistency */
const COMMITMENTS = [
  {
    num: "01", badge: "Predictability First", Icon: Lock,
    headLine: "Scope locked,", accent: "before work starts.",
    body: "Price is agreed and locked before a single line of code is written. No surprise invoices. No scope creep. No budget overruns. Ever.",
    bullets: ["Fixed price agreed upfront", "No surprise invoices, ever", "Scope document signed before day one"],
  },
  {
    num: "02", badge: "Guaranteed Quality", Icon: Zap,
    headLine: "Talent tested,", accent: "before they join.",
    body: "Every expert has passed our Level 2 Skills Assessment. No self-reported CVs. You only work with the top 1% of vetted talent.",
    bullets: ["Level 2 Skills Assessment", "Design and code quality verified", "Only the top 1% make it through"],
  },
  {
    num: "03", badge: "Absolute Accountability", Icon: Shield,
    headLine: "Pay per milestone,", accent: "not per hour.",
    body: "Funds release only when milestones are completed and verified. If a milestone isn't delivered, you don't pay. Simple as that.",
    bullets: ["Escrow protects your funds at all times", "Milestone completion verified before release", "No delivery = no payment, guaranteed"],
  },
];

/* ─────────────────────────────────────────────────────────
   DIRECTIONAL SLIDE VARIANTS
   direction > 0 → forward (next): enter from right, exit left
   direction < 0 → backward (prev): enter from left, exit right
───────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};
const slideTransition = { duration: 0.36, ease: [0.23, 1, 0.32, 1] as const };

/* ─────────────────────────────────────────────────────────
   AMBIENT ORB
───────────────────────────────────────────────────────── */
function Orb({ x = "50%", y = "50%", size = 200, opacity = 0.07, delay = 0 }: {
  x?: string; y?: string; size?: number; opacity?: number; delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y, translateX: "-50%", translateY: "-50%",
        background: `radial-gradient(circle, rgba(232,82,57,${opacity}) 0%, transparent 70%)`, filter: "blur(52px)"
      }}
      animate={{ scale: [1, 1.25, 1], opacity: [opacity * 0.6, opacity, opacity * 0.6] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   HERO — LIVE TRANSFORMATION CARD
───────────────────────────────────────────────────────── */
const TRANSFORM_PAIRS = [
  {
    perspective: "For Clients",
    rawLabel: "Raw Requirement",
    rawQuote: '"I need a payment system. Make it work fast."',
    phase: "PROCESSING SCOPE",
    outLabel: "Scope Locked",
    outTitle: "Stripe Billing Integration",
    milestones: ["Webhook validation & retry logic", "Secure escrow flow built", "Invoice & receipt system"],
    tag: "Fixed price · 3 milestones · Locked",
    stamp: "SCOPE LOCKED",
  },
  {
    perspective: "For Freelancers",
    rawLabel: "Unverified Developer",
    rawQuote: '"3 years experience, knows React and Node."',
    phase: "VETTING IN PROGRESS",
    outLabel: "Talent Verified",
    outTitle: "Top 1% React Engineer",
    milestones: ["Level 2 Skills Assessment passed", "Design & code quality verified", "Real-time domain evaluated"],
    tag: "Expert matched · Ready to execute",
    stamp: "TALENT VERIFIED",
  },
];

type TPhase = "raw" | "processing" | "output";

function LiveTransformCard() {
  const [pairIdx, setPairIdx] = useState(0);
  const [phase, setPhase] = useState<TPhase>("raw");
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const pair = TRANSFORM_PAIRS[pairIdx];

  useEffect(() => {
    setPhase("raw"); setProgress(0); setRevealed(0);
    const t1 = setTimeout(() => setPhase("processing"), 1800);
    const t2 = setTimeout(() => {
      let p = 0;
      const iv = setInterval(() => { p += 4; setProgress(Math.min(p, 100)); if (p >= 100) clearInterval(iv); }, 28);
    }, 1900);
    const t3 = setTimeout(() => { setPhase("output"); setRevealed(0); }, 4700);
    const t4 = setTimeout(() => setRevealed(1), 5100);
    const t5 = setTimeout(() => setRevealed(2), 5550);
    const t6 = setTimeout(() => setRevealed(3), 6000);
    const t7 = setTimeout(() => setPairIdx(p => (p + 1) % TRANSFORM_PAIRS.length), 9000);
    return () => [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
  }, [pairIdx]);

  return (
    <div className="w-full rounded-[28px] bg-white border border-stone-200/80 shadow-[0_18px_60px_rgba(232,82,57,0.09)] overflow-hidden">
      <motion.div className="h-[3px] w-full"
        animate={{
          background: phase === "output"
            ? ["#E85239", "#FF5B3A", "#E85239"]
            : phase === "processing"
              ? ["rgba(232,82,57,0.4)", "rgba(232,82,57,0.9)", "rgba(232,82,57,0.4)"]
              : "rgba(232,82,57,0.2)"
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-accent" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{pair.perspective}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-wider">
            {phase === "raw" ? "AWAITING INPUT" : phase === "processing" ? pair.phase : pair.stamp}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {phase === "raw" && (
            <motion.div key="raw" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                  <FileText size={14} className="text-stone-400" />
                </div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{pair.rawLabel}</span>
              </div>
              <p className="text-[15px] font-mono font-medium text-stone-700 leading-snug bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">{pair.rawQuote}</p>
              <div className="mt-4 flex gap-1.5">
                {["?", "?", "?"].map((s, i) => (
                  <motion.div key={i} className="w-8 h-8 rounded-xl bg-stone-100/80 border border-stone-200/60 flex items-center justify-center text-stone-300 font-black text-sm"
                    animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity }}>{s}</motion.div>
                ))}
                <span className="text-[11px] text-stone-300 font-medium self-center ml-1">No scope · No price · No timeline</span>
              </div>
            </motion.div>
          )}
          {phase === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }}>
              <div className="flex items-center gap-2 mb-4">
                <motion.div className="w-8 h-8 rounded-xl bg-orange-50 border border-accent/20 flex items-center justify-center"
                  animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                  <Zap size={14} className="text-accent" />
                </motion.div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{pair.phase}</span>
              </div>
              <div className="space-y-3">
                {["Analysing requirements...", "Structuring milestones...", "Locking price..."].map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.45, duration: 0.3 }} className="flex items-center gap-3">
                    <motion.div className="w-4 h-4 rounded-full border-2 border-accent/40 flex items-center justify-center shrink-0"
                      animate={{ borderColor: progress > (i + 1) * 33 ? "#E85239" : "rgba(232,82,57,0.3)", background: progress > (i + 1) * 33 ? "rgba(232,82,57,0.1)" : "transparent" }}>
                      {progress > (i + 1) * 33 && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </motion.div>
                    <span className="text-[12px] text-stone-500 font-medium">{step}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-accent to-[#FF5B3A] rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.05 }} />
              </div>
            </motion.div>
          )}
          {phase === "output" && (
            <motion.div key="output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  {pair.perspective === "For Clients" ? <Lock size={13} className="text-white" /> : <UserCheck size={13} className="text-white" />}
                </motion.div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{pair.outLabel}</span>
              </div>
              <h3 className="text-[18px] font-black text-stone-900 tracking-tight leading-tight mb-3">{pair.outTitle}</h3>
              <div className="space-y-2 mb-3">
                {pair.milestones.map((m, i) => (
                  <AnimatePresence key={i}>
                    {revealed > i && (
                      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }} className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-accent shrink-0" strokeWidth={2.5} />
                        <span className="text-[12px] text-stone-600 font-semibold">{m}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
              <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-accent/20"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 300 }}>
                <BadgeCheck size={12} className="text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{pair.tag}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAGE 0 — HERO
───────────────────────────────────────────────────────── */
function StageHero({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto scrollbar-hide select-none relative"
      style={{ background: "linear-gradient(160deg, #FDFAF9 0%, #FFF3EF 55%, #FFF7F5 100%)" }}>
      <Orb x="75%" y="15%" size={280} opacity={0.10} delay={0} />
      <Orb x="8%" y="60%" size={220} opacity={0.07} delay={2} />

      {/* Top Section: Nav + Headline (takes flex-1) */}
      <div className="flex-1 flex flex-col justify-start z-10 min-h-0">
        {/* Nav */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-12 shrink-0">
          <div className="flex items-center">
            <span className="font-black text-[19px] tracking-tight text-stone-900">EXECUTA</span>
            <span className="font-black text-[19px] text-accent ml-0.5">.</span>
          </div>
          <Link href="/auth/login?role=client&mode=signup">
            <button className="text-[11px] font-bold text-accent border border-accent/35 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm active:scale-95 transition-transform">
              Sign In
            </button>
          </Link>
        </div>

        {/* Headline - Centered vertically within the remaining space above the card */}
        <div className="flex-1 flex flex-col justify-center items-center px-5 text-center py-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/6 mb-2.5">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-accent" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <span className="text-[9.5px] font-bold text-accent uppercase tracking-widest">The Execution Platform</span>
          </div>
          <h1 className="font-black text-[30px] leading-[1.08] tracking-tight text-stone-900">
            Freelancing,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">finally fixed.</span>
          </h1>
        </div>
      </div>

      {/* Middle Section: Centered Card (centered perfectly on screen) */}
      <div className="relative z-10 px-5 shrink-0 flex justify-center items-center py-2">
        <LiveTransformCard />
      </div>

      {/* Bottom Section: Stats + CTA (takes flex-1 and justifies content to the bottom) */}
      <div className="flex-1 flex flex-col justify-end pb-10 z-10 min-h-0">
        <div className="flex items-center justify-center gap-6 mb-5 shrink-0">
          {[["Top 1%", "Vetted Talent"], ["Fixed", "Pricing"], ["Zero", "Surprises"]].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-[15px] font-black text-accent">{val}</span>
              <span className="text-[10px] text-stone-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
        <div className="px-5 w-full shrink-0">
          <motion.button onClick={onNext} whileTap={{ scale: 0.97 }}
            className="w-full bg-accent text-white font-bold text-[15px] py-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(232,82,57,0.38)]">
            Explore Executa <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAGE DOTS
───────────────────────────────────────────────────────── */
function StageDots({ stage, total, onSelect }: {
  stage: Stage; total: number; onSelect: (s: Stage) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 pointer-events-auto">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button key={i}
          onClick={() => onSelect(i as Stage)}
          animate={{ height: i === stage ? 26 : 7, opacity: i === stage ? 1 : 0.38 }}
          transition={{ duration: 0.26 }}
          className="w-[5px] rounded-full"
          style={{ background: i === stage ? "#E85239" : "#d1cbc7" }}
          aria-label={`Section ${i + 1}`} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SHARED CARD FACE — used by both Problem AND Commitments
───────────────────────────────────────────────────────── */
interface CardData {
  num: string;
  title?: string;
  headLine?: string;
  accent?: string;
  desc?: string;
  body?: string;
  bullets: string[];
  badge?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon?: React.ComponentType<any>;
  roleBadge?: string;
}

interface SharedCardProps {
  card: CardData;
  direction: number;
  idx: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onDragEnd: (_: unknown, info: { offset: { x: number } }) => void;
  nextLabel?: string;
  prevLabel?: string;
  bulletIcon?: "alert" | "check";
}

const SharedCard = forwardRef<HTMLDivElement, SharedCardProps>(({
  card, direction, idx, total,
  onNext, onPrev, isFirst, isLast,
  onDragEnd, nextLabel = "Next", prevLabel, bulletIcon = "alert"
}, ref) => {
  const Icon = card.Icon;
  const title = card.title ?? card.headLine ?? "";
  const accentText = card.accent;
  const description = card.desc ?? card.body ?? "";

  return (
    <motion.div
      ref={ref}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={onDragEnd}
      transformTemplate={({ x, y }) => `translateX(${x}) translateY(${y})`}
      className="absolute inset-0 z-20 flex flex-col"
    >
      {/* Card shell */}
      <div className="w-full h-full bg-white rounded-[28px] border border-stone-200/80 shadow-[0_10px_40px_rgba(232,82,57,0.07)] overflow-hidden flex flex-col antialiased">
        {/* Top stripe */}
        <div className="h-[3px] bg-gradient-to-r from-accent to-[#FF5B3A] shrink-0" />

        <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
                {card.badge ?? card.roleBadge ?? ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {Icon && (
                <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <Icon size={14} className="text-accent" strokeWidth={1.8} />
                </div>
              )}
              <span className="font-mono text-[11px] font-bold text-stone-300">{idx + 1}/{total}</span>
            </div>
          </div>

          {/* Large watermark number */}
          <div className="font-mono font-black leading-none text-accent/6 select-none shrink-0"
            style={{ fontSize: "clamp(52px, 14vw, 72px)", lineHeight: 1 }}>
            {card.num}
          </div>

          {/* Title */}
          <h3 className="text-[21px] font-black text-stone-900 tracking-tight leading-tight mt-0.5 mb-2 shrink-0">
            {title}
            {accentText && <> <span className="text-accent">{accentText}</span></>}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-stone-500 leading-relaxed font-medium shrink-0">
            {description}
          </p>

          {/* Bullets — UI updated for premium look and proper spacing */}
          <div className="mt-5 mb-auto flex flex-col gap-3">
            {card.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-stone-50 border border-stone-100/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                  {bulletIcon === "alert" ? (
                    <AlertTriangle size={12} className="text-accent" strokeWidth={2.5} />
                  ) : (
                    <CheckCircle2 size={12} className="text-accent" strokeWidth={2.5} />
                  )}
                </div>
                <span className="text-[13px] text-stone-700 font-semibold leading-snug">{b}</span>
              </div>
            ))}
          </div>

          {/* Nav row — pinned bottom */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100 shrink-0">
            <button onClick={onPrev}
              className="flex items-center gap-1 text-[12px] font-bold text-stone-400 active:opacity-60 transition-opacity">
              <ArrowLeft size={14} />
              {prevLabel ?? (isFirst ? "Back" : "Prev")}
            </button>
            {isLast ? (
              <button onClick={onNext}
                className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-accent px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(232,82,57,0.38)] active:scale-95 transition-transform">
                {nextLabel} <ArrowRight size={12} />
              </button>
            ) : (
              <button onClick={onNext}
                className="flex items-center gap-1 text-[12px] font-bold text-stone-500 active:opacity-60">
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
SharedCard.displayName = "SharedCard";

/* ─────────────────────────────────────────────────────────
   STAGE 1 — THE PROBLEM  (3D flip + directional slide)
───────────────────────────────────────────────────────── */
function StageProblem({ onNext, onPrev, initialCard = 0 }: { onNext: () => void; onPrev: () => void; initialCard?: number }) {
  const [role, setRole] = useState<Role>("client");
  const [activeCard, setActiveCard] = useState(initialCard);
  const [flipped, setFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const direction = useRef(1); // 1=forward, -1=backward
  const isAnimating = useRef(false);

  const clientItems = PROBLEMS.client;
  const freelancerItems = PROBLEMS.freelancer;
  const currentItems = flipped ? freelancerItems : clientItems;
  const currentRole: Role = flipped ? "freelancer" : "client";

  const handleRoleSwitch = (r: Role) => {
    if (isAnimating.current) return;
    if ((r === "freelancer") === flipped) return;
    isAnimating.current = true;
    direction.current = r === "freelancer" ? 1 : -1;
    setFlipped(r === "freelancer");
    setRole(r);
    setActiveCard(0);
    setTimeout(() => { isAnimating.current = false; }, 750);
  };

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x;
    if (dx < -50 && activeCard < currentItems.length - 1) {
      direction.current = 1;
      setActiveCard(p => p + 1);
    } else if (dx > 50 && activeCard > 0) {
      direction.current = -1;
      setActiveCard(p => p - 1);
    } else if (dx > 50 && activeCard === 0) {
      onPrev();
    }
  }, [activeCard, currentItems.length, onPrev]);

  const goNext = () => {
    if (activeCard < currentItems.length - 1) {
      direction.current = 1;
      setActiveCard(p => p + 1);
    } else {
      onNext();
    }
  };

  const goPrev = () => {
    if (activeCard === 0) {
      onPrev();
    } else {
      direction.current = -1;
      setActiveCard(p => p - 1);
    }
  };

  /* Build card data matching SharedCard interface */
  const cardData = (items: typeof clientItems, role: Role): CardData[] =>
    items.map(item => ({
      ...item,
      badge: role === "client" ? "For Clients" : "For Freelancers",
    }));

  const frontCards = cardData(clientItems, "client");
  const backCards = cardData(freelancerItems, "freelancer");
  const activeCardData = flipped
    ? backCards[Math.min(activeCard, backCards.length - 1)]
    : frontCards[Math.min(activeCard, frontCards.length - 1)];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide select-none"
      style={{ background: "linear-gradient(160deg, #FDFAF9 0%, #FFF3EF 55%, #FFF7F5 100%)" }}>
      <Orb x="80%" y="12%" size={240} opacity={0.08} delay={0} />
      <Orb x="5%" y="65%" size={200} opacity={0.06} delay={1.5} />

      {/* Header - Bigger text and more padding to push card down */}
      <div className="relative z-10 px-5 pt-12 pb-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-5 bg-stone-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">The Problem</span>
        </div>
        <h2 className="font-black text-[34px] leading-[1.05] tracking-tighter text-stone-900">
          Freelancing is broken<br />
          <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">for both sides.</span>
        </h2>
      </div>

      {/* Role toggle - Centered, 50/50 split, larger mb to push card down */}
      <div className="relative z-10 px-5 mb-8 shrink-0 flex justify-center">
        <div className="flex w-full max-w-[320px] p-1 bg-stone-100/80 border border-stone-200/50 rounded-full shadow-inner">
          {(["client", "freelancer"] as Role[]).map(r => (
            <button key={r}
              onClick={() => handleRoleSwitch(r)}
              className={`flex-1 py-2.5 rounded-full text-[13px] font-black tracking-wide transition-all duration-300 ${currentRole === r ? "bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" : "text-stone-400"
                }`}>
              {r === "client" ? "I'm a Client" : "I'm a Freelancer"}
            </button>
          ))}
        </div>
      </div>

      {/* 3D flip area */}
      <div className="relative z-10 flex-1 flex flex-col px-5 min-h-0">
        <div className="relative flex-1" style={{ perspective: "1100px" }}>
          {/* Ghost stack cards */}
          {currentItems.map((_, i) => {
            if (i <= activeCard) return null;
            const off = i - activeCard;
            if (off > 2) return null;
            return (
              <div key={i} className="absolute inset-0 rounded-[28px] bg-white border border-stone-200/60"
                style={{ transform: `translateY(${off * 8}px) scale(${1 - off * 0.035})`, opacity: 1 - off * 0.28, zIndex: 10 - off }} />
            );
          })}

          {/* 3D flip wrapper */}
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
            onAnimationStart={() => setIsFlipping(true)}
            onAnimationComplete={() => setIsFlipping(false)}
            transformTemplate={({ rotateY }) => `rotateY(${rotateY})`}
            style={{
              transformStyle: isFlipping ? "preserve-3d" : "flat",
              position: "absolute",
              inset: 0,
              zIndex: 20
            }}
          >
            {/* Front face — client */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: isFlipping ? "hidden" : "visible",
                WebkitBackfaceVisibility: isFlipping ? "hidden" : "visible",
                display: (!flipped || isFlipping) ? "block" : "none"
              }}
            >
              <AnimatePresence custom={direction.current} initial={false}>
                {!flipped && (
                  <SharedCard
                    key={`client-${activeCard}`}
                    card={activeCardData}
                    direction={direction.current}
                    idx={activeCard}
                    total={clientItems.length}
                    onNext={goNext}
                    onPrev={goPrev}
                    isFirst={activeCard === 0}
                    isLast={activeCard === clientItems.length - 1}
                    onDragEnd={handleDragEnd}
                    nextLabel={activeCard === clientItems.length - 1 ? "See Solution" : "Next"}
                    bulletIcon="alert"
                  />
                )}
              </AnimatePresence>
            </div>
            {/* Back face — freelancer (pre-rotated 180°) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: isFlipping ? "hidden" : "visible",
                WebkitBackfaceVisibility: isFlipping ? "hidden" : "visible",
                transform: "rotateY(180deg)",
                display: (flipped || isFlipping) ? "block" : "none"
              }}
            >
              <AnimatePresence custom={direction.current} initial={false}>
                {flipped && (
                  <SharedCard
                    key={`freelancer-${activeCard}`}
                    card={activeCardData}
                    direction={direction.current}
                    idx={activeCard}
                    total={freelancerItems.length}
                    onNext={goNext}
                    onPrev={goPrev}
                    isFirst={activeCard === 0}
                    isLast={activeCard === freelancerItems.length - 1}
                    onDragEnd={handleDragEnd}
                    nextLabel={activeCard === freelancerItems.length - 1 ? "See Solution" : "Next"}
                    bulletIcon="alert"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-3 shrink-0">
          {currentItems.map((_, i) => (
            <motion.button key={i}
              onClick={() => { direction.current = i > activeCard ? 1 : -1; setActiveCard(i); }}
              animate={{ width: i === activeCard ? 22 : 7, opacity: i === activeCard ? 1 : 0.3 }}
              transition={{ duration: 0.26 }}
              className="h-2 rounded-full bg-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAGE 2 — COMMITMENTS
───────────────────────────────────────────────────────── */
function StageCommitments({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [idx, setIdx] = useState(0);
  const direction = useRef(1);
  const isDone = idx === COMMITMENTS.length - 1;

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x;
    if (dx < -50 && idx < COMMITMENTS.length - 1) {
      direction.current = 1;
      setIdx(p => p + 1);
    } else if (dx > 50 && idx > 0) {
      direction.current = -1;
      setIdx(p => p - 1);
    } else if (dx > 50 && idx === 0) {
      onPrev();
    }
  }, [idx, onPrev]);

  const goNext = () => {
    if (!isDone) { direction.current = 1; setIdx(p => p + 1); }
    else onNext();
  };

  const goPrev = () => {
    if (idx > 0) { direction.current = -1; setIdx(p => p - 1); }
    else onPrev();
  };

  /* Map commitment to SharedCard data */
  const cardData: CardData = {
    num: COMMITMENTS[idx].num,
    badge: COMMITMENTS[idx].badge,
    Icon: COMMITMENTS[idx].Icon,
    headLine: COMMITMENTS[idx].headLine,
    accent: COMMITMENTS[idx].accent,
    body: COMMITMENTS[idx].body,
    bullets: COMMITMENTS[idx].bullets,
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide select-none"
      style={{ background: "linear-gradient(160deg, #FDFAF9 0%, #FFF3EF 55%, #FFF7F5 100%)" }}>
      <Orb x="50%" y="20%" size={320} opacity={0.08} delay={0} />
      <Orb x="15%" y="75%" size={200} opacity={0.06} delay={2} />

      {/* Header - Bigger text and more padding to push card down */}
      <div className="relative z-10 px-5 pt-14 pb-8 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-5 bg-stone-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">Our Commitments</span>
        </div>
        <h2 className="font-black text-[34px] leading-[1.05] tracking-tighter text-stone-900">
          Three things that make<br />
          <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">every project land.</span>
        </h2>
      </div>

      {/* Card area */}
      <div className="relative z-10 flex-1 flex flex-col px-5 min-h-0">
        <div className="relative flex-1">
          {/* Ghost stacks */}
          {COMMITMENTS.map((_, i) => {
            if (i <= idx) return null;
            const off = i - idx;
            if (off > 2) return null;
            return (
              <div key={i} className="absolute inset-0 rounded-[28px] bg-white border border-stone-200/60"
                style={{ transform: `translateY(${off * 8}px) scale(${1 - off * 0.035})`, opacity: 1 - off * 0.28, zIndex: 10 - off }} />
            );
          })}

          <AnimatePresence custom={direction.current} initial={false}>
            <SharedCard
              key={`commitment-${idx}`}
              card={cardData}
              direction={direction.current}
              idx={idx}
              total={COMMITMENTS.length}
              onNext={goNext}
              onPrev={goPrev}
              isFirst={idx === 0}
              isLast={isDone}
              onDragEnd={handleDragEnd}
              nextLabel={isDone ? "See How It Works" : "Next"}
              prevLabel={idx === 0 ? "Back" : "Prev"}
              bulletIcon="check"
            />
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-3 shrink-0">
          {COMMITMENTS.map((_, i) => (
            <motion.button key={i}
              onClick={() => { direction.current = i > idx ? 1 : -1; setIdx(i); }}
              animate={{ width: i === idx ? 22 : 7, opacity: i <= idx ? 1 : 0.25 }}
              transition={{ duration: 0.26 }}
              className="h-2 rounded-full bg-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAGE 3 — CTA
───────────────────────────────────────────────────────── */
function StageCTA({ onPrev }: { onPrev: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto scrollbar-hide select-none relative"
      style={{ background: "linear-gradient(160deg, #FDFAF9 0%, #FFF3EF 55%, #FFF7F5 100%)" }}>
      {/* Background Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#E85239_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />

      {/* Top Left Back Arrow Button */}
      <div className="absolute top-12 left-5 z-50">
        <button
          onClick={onPrev}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-950 active:scale-95 transition-all shadow-sm"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      <Orb x="30%" y="20%" size={280} opacity={0.08} delay={0} />
      <Orb x="85%" y="70%" size={240} opacity={0.06} delay={2} />

      {/* Top spacer */}
      <div className="h-6 shrink-0" />

      <div className="flex-1 flex flex-col justify-start items-center px-5 text-center z-10 pt-[40px] pb-4">
        {/* Pulsing EXECUTA logo in the center (smoother, larger, interactive concentric rings) */}
        <div className="relative flex items-center justify-center mb-[30px] py-4 w-full max-w-[280px] shrink-0">
          {/* Subtle breathing double outline contour behind the logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="absolute border-2 border-[#E85239] rounded-full logo-ripple-ring"
              animate={{
                scale: [1, 1.7],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute border-2 border-[#E85239] rounded-full logo-ripple-ring"
              animate={{
                scale: [1, 1.7],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.4,
              }}
            />
          </div>
          {/* Logo container with standard dot and hover/touch interaction */}
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            animate={{
              boxShadow: isHovered 
                ? "0 20px 48px rgba(232, 82, 57, 0.15)" 
                : "0 12px 36px rgba(232, 82, 57, 0.08)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative z-10 flex items-center bg-white px-7 py-4 rounded-full border border-[#E85239]/25 cursor-pointer logo-cta-btn"
          >
            <span className="font-black text-[28px] tracking-tight text-stone-900 leading-none select-none logo-cta-text">EXECUTA</span>
            <span className="font-black text-[28px] text-accent ml-0.5 leading-none select-none logo-cta-text">.</span>
          </motion.div>
        </div>

        {/* Now Open for Access badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/6 border border-accent/20 mb-[16px] shrink-0"
        >
          <motion.span className="w-1.5 h-1.5 rounded-full bg-accent" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Now Open for Access</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-black text-[31px] leading-[1.08] tracking-tight text-stone-900 mb-[12px] shrink-0"
        >
          Ready to execute<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A]">flawlessly?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-[270px] mb-[24px] shrink-0"
        >
          Join the platform built for clients who demand results and experts who actually deliver them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3 w-full max-w-[290px] text-left shrink-0"
        >
          {["Scope locked before work starts", "Top 1% vetted talent only", "Pay only when milestones are met"].map((item) => (
            <motion.div
              key={item}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/60 shadow-[0_4px_12px_rgba(232,82,57,0.02)] transition-all hover:border-accent/30"
            >
              <div className="w-[22px] h-[22px] rounded-full bg-accent flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(232,82,57,0.22)]">
                <CheckCircle2 size={11} className="text-white" strokeWidth={3.5} />
              </div>
              <span className="text-[12px] text-stone-700 font-bold leading-snug">{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 px-5 pb-8 space-y-3 shrink-0 mt-auto">
        <Link href="/auth/login?role=client&mode=signup" className="block">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="relative w-full bg-accent text-white font-bold text-[15px] py-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(232,82,57,0.35)] overflow-hidden"
          >
            {/* Shimmer light effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 1 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Hire a Freelancer <ArrowRight size={16} />
            </span>
          </motion.button>
        </Link>
        <Link href="/auth/login?role=freelancer&mode=signup" className="block">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full bg-white text-stone-700 font-bold text-[15px] py-[15px] rounded-2xl flex items-center justify-center gap-2 border border-stone-200 shadow-sm active:bg-stone-50"
          >
            Join as Freelancer <ArrowRight size={16} />
          </motion.button>
        </Link>
        <div className="flex justify-center gap-7 pt-2">
          {[["Contact", "/contact"], ["Terms", "/terms"], ["Privacy", "/privacy"]].map(([label, href]) => (
            <Link key={label} href={href} className="text-[11px] text-stone-400 font-medium hover:text-stone-600 transition-colors">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────── */
export default function MobileLandingPage() {
  const [stage, setStage] = useState<Stage>(0);
  const [problemStartCard, setProblemStartCard] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const cooldown = useRef(false);

  const goNext = useCallback(() => {
    setStage(p => {
      if (p === 0) setProblemStartCard(0); // If going forward into Problem from Hero
      return Math.min(3, p + 1) as Stage;
    });
  }, []);

  const goPrev = useCallback(() => {
    setStage(p => {
      if (p === 2) setProblemStartCard(3); // If going backward into Problem from Commitments, start at card 4
      return Math.max(0, p - 1) as Stage;
    });
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (cooldown.current) return;
    if (touchStartY.current === null || touchStartX.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
    // Only handle global vertical swipes, ignore horizontal swiping over the cards
    if (Math.abs(dy) > 70 && Math.abs(dy) > dx * 2) {
      cooldown.current = true;
      if (dy > 0) goNext(); else goPrev();
      setTimeout(() => { cooldown.current = false; }, 650);
    }
    touchStartY.current = null; touchStartX.current = null;
  };

  const STAGES = [
    <StageHero key="hero" onNext={goNext} />,
    <StageProblem key="problem" onNext={goNext} onPrev={goPrev} initialCard={problemStartCard} />,
    <StageCommitments key="commitments" onNext={goNext} onPrev={goPrev} />,
    <StageCTA key="cta" onPrev={goPrev} />,
  ];

  return (
    <div className="relative w-full overflow-hidden executa-mobile-viewport" style={{ height: "100svh" }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence mode="wait">
        <motion.div key={stage} className="absolute inset-0"
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -28 }}
          transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}>
          {STAGES[stage]}
        </motion.div>
      </AnimatePresence>

      {/* Side navigation bar on the phone (floating light-orange rail) */}
      <AnimatePresence>
        {(stage === 0 || stage === 3) && (
          <motion.div
            key="side-nav-rail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{ y: "-50%" }}
            className="absolute right-0 top-1/2 z-50 pointer-events-auto bg-[#FFF7F5]/95 backdrop-blur-md border-l border-y border-[#E85239]/20 rounded-l-3xl py-5 pl-3.5 pr-2 shadow-[-4px_6px_20px_rgba(232,82,57,0.06)]"
          >
            <StageDots stage={stage} total={4} onSelect={s => setStage(s)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
