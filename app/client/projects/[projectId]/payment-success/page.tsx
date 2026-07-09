"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
type PageStatus = "verifying" | "paid" | "failed" | "session_lost";

// ── Main content ──────────────────────────────────────────────────────────────
function PaymentSuccessContent() {
  const params        = useParams<{ projectId: string }>();
  const searchParams  = useSearchParams();
  const merchantTxnId = searchParams.get("txnId");

  const [status, setStatus]         = useState<PageStatus>("verifying");
  const [attempts, setAttempts]     = useState(0);
  const [redirectPath, setRedirectPath] = useState("");
  const verifyStarted               = useRef(false);

  useEffect(() => {
    // Only start once — guard against strict-mode double-invoke
    if (verifyStarted.current) return;
    verifyStarted.current = true;

    if (!merchantTxnId) {
      setStatus("failed");
      return;
    }

    let tries = 0;
    const MAX_TRIES = 20; // 20 × 3 s = 60 s window

    /**
     * The verify API is intentionally public (no auth required).
     * It identifies the project via merchantTransactionId only.
     * We verify FIRST, then navigate — session state is irrelevant here.
     */
    async function verify() {
      tries++;
      setAttempts(tries);
      try {
        const res  = await fetch(`/api/payment/verify?merchantTransactionId=${merchantTxnId}`);
        const data = await res.json();

        if (data.paid) {
          const target =
            data.isMilestone || data.isUpgrade
              ? `/client/execution/${params.projectId}`
              : `/client/projects/${params.projectId}/scope`;

          setRedirectPath(target);
          setStatus("paid");

          // Use a full browser navigation (not client-side router.push) so the
          // session cookie is guaranteed to be sent with the request. Client-side
          // Next.js router navigation after a cross-origin payment redirect can
          // reach the edge middleware before the cookie is flushed, which was
          // causing the middleware to incorrectly bounce the user to /auth/login.
          setTimeout(() => {
            window.location.replace(target);
          }, 3000);

        } else if (
          data.state === "FAILED" ||
          data.state === "ERROR"  ||
          data.state === "PAYMENT_ERROR" ||
          data.state === "PAYMENT_FAILED"
        ) {
          setStatus("failed");
        } else if (tries < MAX_TRIES) {
          setTimeout(verify, 3000);
        } else {
          // Exhausted retries — payment may still succeed via webhook.
          // Surface a graceful error instead of login redirect.
          setStatus("failed");
        }
      } catch {
        if (tries < MAX_TRIES) {
          setTimeout(verify, 3000);
        } else {
          setStatus("failed");
        }
      }
    }

    // Give PhonePe 2.5 s after redirect before first attempt
    setTimeout(verify, 2500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const successMessage =
    merchantTxnId?.startsWith("EXM") || merchantTxnId?.startsWith("EXECUTA_MS_")
      ? "Your milestone payment has been processed. Deliverables are now unlocked."
      : merchantTxnId?.startsWith("EXU") || merchantTxnId?.startsWith("EXECUTA_UG_")
      ? "Scope upgrade paid. The new unit is unlocked and sent to your expert for approval."
      : merchantTxnId?.startsWith("EXC") || merchantTxnId?.startsWith("EXECUTA_CU_")
      ? "Scope addition paid. Your new functionality has been added to the project scope."
      : "Platform fees paid. Your full project scope is now unlocked.";

  const loginUrl = redirectPath
    ? `/auth/login?callbackUrl=${encodeURIComponent(redirectPath)}`
    : `/auth/login`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF7F5] flex items-center justify-center p-6">
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#E85239]/8 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-[0_24px_80px_-12px_rgba(232,82,57,0.08)] border border-stone-100 p-12 max-w-md w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#E85239] to-[#FF5B3A]" />

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 160 40" className="w-32 h-auto overflow-visible">
            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
              className="font-sans font-black"
              style={{ fontSize: "28px", letterSpacing: "-0.05em", fill: "#1c1917" }}>
              EXECUTA<tspan fill="#E85239">.</tspan>
            </text>
          </svg>
        </div>

        {/* ── Verifying ── */}
        {status === "verifying" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-stone-100 border-t-[#E85239] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#FFF7F5] rounded-full flex items-center justify-center">
                  <Loader2 size={22} className="text-[#E85239] animate-spin" />
                </div>
              </div>
            </div>
            <h2 className="text-[22px] font-black text-stone-900 mt-2">Verifying Payment</h2>
            <p className="text-[14px] text-stone-500 leading-relaxed">
              Please wait while we confirm your payment with PhonePe.
              {attempts > 2 && (
                <span className="block mt-1 text-stone-400 text-[12px]">This may take a few seconds…</span>
              )}
            </p>
          </motion.div>
        )}

        {/* ── Paid ── */}
        {status === "paid" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100"
            >
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>

            <h2 className="text-[24px] font-black text-stone-900">Payment Confirmed!</h2>
            <p className="text-[14px] text-stone-500 leading-relaxed">{successMessage}</p>

            <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 size={13} />
              Payment recorded successfully
            </div>

            {/* Manual navigation in case auto-redirect doesn't fire */}
            {redirectPath && (
              <a href={redirectPath}
                className="mt-1 inline-flex items-center gap-2 h-11 px-6 bg-stone-900 hover:bg-[#E85239] text-white text-[13px] font-bold rounded-xl transition-all">
                Go to Project <ArrowRight size={14} />
              </a>
            )}

            <div className="flex items-center gap-2 text-[13px] text-stone-400">
              <Loader2 size={14} className="animate-spin" />
              Redirecting to your project…
            </div>
          </motion.div>
        )}

        {/* ── Session Lost ── */}
        {status === "session_lost" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-100">
              <LogIn size={36} className="text-amber-500" />
            </div>
            <h2 className="text-[22px] font-black text-stone-900">Session Expired</h2>
            <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 size={13} />
              Your payment was recorded successfully
            </div>
            <p className="text-[14px] text-stone-500 leading-relaxed">
              Your session timed out during the payment redirect. Please sign in again to view your project — your payment is safe.
            </p>
            <Link href={loginUrl}
              className="mt-2 inline-flex items-center gap-2 h-12 px-8 bg-stone-900 hover:bg-[#E85239] text-white text-[14px] font-bold rounded-xl transition-all duration-300">
              <LogIn size={15} /> Sign In to Continue
            </Link>
          </motion.div>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-[22px] font-black text-stone-900">Payment Not Confirmed</h2>
            <p className="text-[14px] text-stone-500 leading-relaxed">
              We could not verify your payment. If any amount was deducted, it will be refunded automatically within 3–5 business days.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Link href={`/client/projects/${params.projectId}`}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-stone-900 hover:bg-[#E85239] text-white text-[14px] font-bold rounded-xl transition-all duration-300">
                Return to Project
              </Link>
              <Link href="/client/workspace"
                className="inline-flex items-center justify-center gap-2 h-10 px-6 text-stone-400 hover:text-stone-700 text-[13px] font-medium transition-colors">
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page export (Suspense required for useSearchParams) ───────────────────────
export default function PaymentSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#FFF7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E85239]/20 border-t-[#E85239] rounded-full animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </React.Suspense>
  );
}
