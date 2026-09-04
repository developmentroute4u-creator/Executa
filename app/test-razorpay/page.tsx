"use client";

import React, { useState } from "react";
import RazorpayPayButton from "@/components/razorpay/RazorpayPayButton";
import { CheckCircle2, Shield, CreditCard, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RazorpayTestPage() {
  const [testAmount, setTestAmount] = useState<number>(100);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f4f0] py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-200/40">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E85239]/10 flex items-center justify-center text-[#E85239]">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E85239] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                Sandbox Mode
              </span>
            </div>
            <h1 className="text-[22px] font-black text-stone-900 tracking-tight">
              Razorpay Standard Checkout
            </h1>
          </div>
        </div>

        <p className="text-[13px] text-stone-600 leading-relaxed mb-6">
          Test order creation, modal checkout flow, and signature verification with test credentials.
        </p>

        {/* Amount Selector */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-5 mb-6">
          <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
            Select Test Amount (INR)
          </label>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[1, 100, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setTestAmount(amt);
                  setSuccessData(null);
                  setCustomError(null);
                }}
                className={`py-2 px-3 text-[13px] font-bold rounded-xl border transition-all ${
                  testAmount === amt
                    ? "bg-[#E85239] text-white border-[#E85239] shadow-sm shadow-orange-200"
                    : "bg-white text-stone-700 border-stone-200/80 hover:border-stone-300"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-[14px]">
              ₹
            </span>
            <input
              type="number"
              min={1}
              value={testAmount}
              onChange={(e) => {
                setTestAmount(Math.max(1, Number(e.target.value) || 1));
                setSuccessData(null);
                setCustomError(null);
              }}
              placeholder="Custom Amount"
              className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-4 py-2.5 text-[14px] font-bold text-stone-800 outline-none focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]"
            />
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-4">
          <RazorpayPayButton
            amountInRupees={testAmount}
            name="FINDADE Platform"
            description={`Test Order for ₹${testAmount}`}
            prefill={{
              name: "Jay Thaker",
              email: "jay@findade.com",
              contact: "9558171690",
            }}
            notes={{
              purpose: "testing_standard_checkout",
            }}
            onSuccess={(data) => {
              setSuccessData(data);
              setCustomError(null);
            }}
            onError={(err) => {
              setCustomError(err);
              setSuccessData(null);
            }}
          />
        </div>

        {/* Success Modal / Card */}
        {successData && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-[14px]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Payment Verified Successfully!</span>
            </div>
            <div className="text-[12px] font-mono text-emerald-900/80 space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-100">
              <p>
                <strong>Payment ID:</strong> {successData.payment_id}
              </p>
              <p>
                <strong>Order ID:</strong> {successData.order_id}
              </p>
              <p className="truncate">
                <strong>Signature:</strong> {successData.signature}
              </p>
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-stone-400 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-500" />
            <span>HMAC-SHA256 Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#E85239]" />
            <span>Razorpay Standard Web SDK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
