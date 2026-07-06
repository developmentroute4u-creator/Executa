"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function PaymentSuccessContent() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantTransactionId = searchParams.get("txnId");
  const { status: sessionStatus } = useSession();

  const [status, setStatus] = useState<"waiting" | "verifying" | "paid" | "failed">("waiting");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!merchantTransactionId) {
      setStatus("failed");
      return;
    }

    // Wait until session is resolved — PhonePe redirects can arrive before
    // the NextAuth session cookie has been re-read by the browser.
    if (sessionStatus === "loading") return;

    // If still unauthenticated after session resolves, redirect to login
    // with a callbackUrl so the user lands back here after signing in.
    if (sessionStatus === "unauthenticated") {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // Session is authenticated — begin verification
    setStatus("verifying");
    let tries = 0;
    const MAX_TRIES = 20;  // 20 × 3s = 60s window

    async function verify() {
      tries++;
      setAttempts(tries);
      try {
        const res = await fetch(`/api/payment/verify?merchantTransactionId=${merchantTransactionId}`);
        const data = await res.json();

        if (data.paid) {
          setStatus("paid");
          setTimeout(() => {
            if (data.isMilestone || data.isUpgrade) {
              router.push(`/client/execution/${params.projectId}`);
            } else {
              router.push(`/client/projects/${params.projectId}/scope`);
            }
          }, 3000);
        } else if (data.state === "FAILED" || data.state === "ERROR" || data.state === "PAYMENT_ERROR") {
          setStatus("failed");
        } else if (tries < MAX_TRIES) {
          // Retry every 3s — PhonePe can take 30–60s to confirm
          setTimeout(verify, 3000);
        } else {
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

    // Give PhonePe 2.5s after the redirect before first verification attempt
    setTimeout(verify, 2500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantTransactionId, sessionStatus]);

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

        {/* Waiting for session / Verifying — same spinner */}
        {(status === "waiting" || status === "verifying") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
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
              {attempts > 2 && <span className="block mt-1 text-stone-400 text-[12px]">This may take a few seconds…</span>}
            </p>
          </motion.div>
        )}

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
            <p className="text-[14px] text-stone-500 leading-relaxed">
              {merchantTransactionId?.startsWith("EXECUTA_MS_")
                ? "Your milestone payment has been processed. Deliverables are now unlocked."
                : merchantTransactionId?.startsWith("EXECUTA_UG_")
                ? "Scope upgrade fee paid. The new functional unit has been unlocked and sent to your expert for approval."
                : merchantTransactionId?.startsWith("EXECUTA_CU_")
                ? "Scope upgrade fee paid. Your new functionality has been added to the project scope."
                : "Your platform fees have been paid. Your full project scope is now unlocked."}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 size={13} />
              Payment method saved to Billing &amp; Finances
            </div>
            <div className="flex items-center gap-2 text-[13px] text-stone-400">
              <Loader2 size={14} className="animate-spin" />
              Redirecting to your project…
            </div>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-[22px] font-black text-stone-900">Payment Not Confirmed</h2>
            <p className="text-[14px] text-stone-500 leading-relaxed">
              We couldn't verify your payment. If money was deducted, it will be refunded automatically within 3-5 business days.
            </p>
            <Link
              href={`/client/projects/${params.projectId}`}
              className="mt-2 inline-flex items-center gap-2 h-12 px-8 bg-stone-900 hover:bg-[#E85239] text-white text-[14px] font-bold rounded-xl transition-all duration-300"
            >
              Return to Project
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

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
