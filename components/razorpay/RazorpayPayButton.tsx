"use client";

import React, { useState } from "react";
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import { Loader2, CreditCard } from "lucide-react";

interface RazorpayPayButtonProps {
  amountInRupees?: number;
  amountInPaise?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  projectId?: string;
  milestoneIndex?: number;
  className?: string;
  buttonText?: string;
  onSuccess?: (data: {
    order_id: string;
    payment_id: string;
    signature: string;
  }) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
  disabled?: boolean;
}

export default function RazorpayPayButton({
  amountInRupees,
  amountInPaise,
  currency = "INR",
  name = "FINDADE",
  description = "Project Execution Payment",
  prefill,
  notes,
  projectId,
  milestoneIndex,
  className = "",
  buttonText,
  onSuccess,
  onError,
  onDismiss,
  disabled = false,
}: RazorpayPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate final amount in paise (minimum 100 paise = ₹1)
  const finalAmountInPaise =
    amountInPaise ||
    (amountInRupees !== undefined ? Math.round(amountInRupees * 100) : 100);

  const displayRupees = (finalAmountInPaise / 100).toLocaleString("en-IN");

  async function handleCheckout() {
    if (disabled || loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      await loadRazorpayScript();

      const createOrderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmountInPaise,
          currency,
          receipt: `rcpt_${Date.now().toString(36)}`,
          notes: {
            ...notes,
            ...(projectId ? { projectId } : {}),
            ...(milestoneIndex !== undefined ? { milestoneIndex: String(milestoneIndex) } : {}),
          },
        }),
      });

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Order creation failed.");
      }

      const keyId = orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const configId = orderData.config_id || process.env.NEXT_PUBLIC_RAZORPAY_CONFIG_ID;

      if (!keyId) {
        throw new Error("Razorpay Key ID is not configured.");
      }

      const completeVerification = async (paymentId: string, orderId: string, signature: string) => {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
              projectId,
              milestoneIndex,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed.");
          }

          setLoading(false);
          if (onSuccess) {
            onSuccess({
              order_id: orderId,
              payment_id: paymentId,
              signature: signature,
            });
          }
        } catch (verifyErr: any) {
          console.error("Verification error:", verifyErr);
          setLoading(false);
          setErrorMessage(verifyErr.message || "Payment verification failed.");
          if (onError) onError(verifyErr.message || "Payment verification failed.");
        }
      };

      const options: any = {
        key: keyId,
        config_id: configId || undefined,
        amount: orderData.amount,
        currency: orderData.currency,
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || "Client Partner",
          email: prefill?.email || "client@findade.com",
          contact: prefill?.contact || "9558171690",
        },
        theme: {
          color: "#E85239",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMessage("Payment was cancelled.");
            if (onDismiss) onDismiss();
          },
          escape: true,
          backdropclose: false,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          await completeVerification(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
      };

      if ((window as any).Razorpay) {
        const razorpayModal = new (window as any).Razorpay(options);
        razorpayModal.on("payment.failed", (failedRes: any) => {
          console.error("Payment failed:", failedRes);
          const errText = failedRes.error?.description || "Payment failed. Please try again.";
          setErrorMessage(errText);
          setLoading(false);
          if (onError) onError(errText);
        });
        razorpayModal.open();
      } else {
        throw new Error("Unable to open Razorpay payment gateway.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Payment initialization failed.");
      if (onError) onError(err.message || "Payment initialization failed.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={
          className ||
          "w-full h-12 px-6 bg-[#E85239] hover:bg-[#d44530] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(232,82,57,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Checkout...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{buttonText || `Pay ₹${displayRupees} with Razorpay`}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="text-[12px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
