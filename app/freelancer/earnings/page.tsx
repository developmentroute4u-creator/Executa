"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Zap,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";

export default function EarningsEnvironment() {
  const [profile, setProfile] = useState<any>(null);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Workflow States
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"amount" | "destination" | "confirm" | "success">("amount");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");

  // Payout Method Selection / Configuration
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [isConfiguringNew, setIsConfiguringNew] = useState<boolean>(false);
  const [newMethodType, setNewMethodType] = useState<"upi_id" | "upi_mobile" | "bank_transfer">("upi_id");
  const [newMethodForm, setNewMethodForm] = useState({
    accountHolderName: "",
    upiId: "",
    upiMobile: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    saveMethod: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission & Response
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completedPayout, setCompletedPayout] = useState<any>(null);

  const fetchEarnings = () => {
    fetch("/api/freelancer/payout")
      .then((r) => r.json())
      .then((data) => {
        setPayoutData(data);
        if (data.payoutMethods && data.payoutMethods.length > 0) {
          const defaultMethod = data.payoutMethods.find((m: any) => m.isDefault) || data.payoutMethods[0];
          setSelectedMethodId(defaultMethod.id);
          setIsConfiguringNew(false);
        } else if (data.bankDetails && (data.bankDetails.upiId || data.bankDetails.accountNumber || data.bankDetails.upiMobile)) {
          setSelectedMethodId("legacy_bank");
          setIsConfiguringNew(false);
        } else {
          setIsConfiguringNew(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(console.error);
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const totalRevenue = payoutData?.totalEarnings ?? (profile?.totalEarnings || 0);
  const totalWithdrawn = payoutData?.withdrawnEarnings ?? (profile?.withdrawnEarnings || 0);
  const availableBalance = payoutData?.availableBalance ?? Math.max(0, totalRevenue - totalWithdrawn);
  const payoutsList = payoutData?.payouts || profile?.payouts || [];
  const payoutMethods = payoutData?.payoutMethods || profile?.payoutMethods || [];

  // Open modal handler
  const handleOpenModal = () => {
    setWithdrawAmount(availableBalance > 0 ? String(availableBalance) : "");
    setAmountError("");
    setSubmitError("");
    setStep("amount");
    setShowModal(true);
  };

  // Quick chips
  const handleQuickPercent = (percent: number) => {
    if (availableBalance <= 0) return;
    const calc = Math.floor((availableBalance * percent) / 100);
    setWithdrawAmount(String(Math.max(10, calc)));
    setAmountError("");
  };

  // Step 1: Validate Amount & Proceed
  const handleProceedFromAmount = () => {
    const val = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(val) || val <= 0) {
      setAmountError("Please enter a valid amount to withdraw.");
      return;
    }
    if (val < 10) {
      setAmountError("Minimum withdrawal amount is ₹10.");
      return;
    }
    if (val > availableBalance) {
      setAmountError(
        `Insufficient balance. You cannot withdraw ₹${val.toLocaleString("en-IN")}. Available balance is ₹${availableBalance.toLocaleString("en-IN")}.`
      );
      return;
    }
    setAmountError("");
    setStep("destination");
  };

  // Validation for new method form
  const validateNewMethod = () => {
    const errs: Record<string, string> = {};
    if (newMethodType === "upi_id") {
      if (!newMethodForm.upiId.trim()) {
        errs.upiId = "UPI ID is required.";
      } else if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(newMethodForm.upiId.trim())) {
        errs.upiId = "Invalid UPI ID format (e.g. yourname@okhdfcbank or 9876543210@paytm).";
      }
    } else if (newMethodType === "upi_mobile") {
      const cleanMobile = newMethodForm.upiMobile.replace(/\D/g, "");
      if (!cleanMobile) {
        errs.upiMobile = "Mobile number is required.";
      } else if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
        errs.upiMobile = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
      }
    } else if (newMethodType === "bank_transfer") {
      if (!newMethodForm.accountHolderName.trim()) {
        errs.accountHolderName = "Account holder name is required.";
      }
      if (!newMethodForm.accountNumber.trim()) {
        errs.accountNumber = "Account number is required.";
      } else if (!/^\d{9,18}$/.test(newMethodForm.accountNumber.trim())) {
        errs.accountNumber = "Account number must be 9–18 digits.";
      }
      if (newMethodForm.accountNumber !== newMethodForm.confirmAccountNumber) {
        errs.confirmAccountNumber = "Account numbers do not match.";
      }
      if (!newMethodForm.ifscCode.trim()) {
        errs.ifscCode = "IFSC code is required.";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(newMethodForm.ifscCode.trim().toUpperCase())) {
        errs.ifscCode = "Invalid IFSC format (e.g. HDFC0001234).";
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2: Validate Destination & Proceed to Review
  const handleProceedFromDestination = () => {
    if (isConfiguringNew) {
      if (!validateNewMethod()) return;
    } else if (!selectedMethodId) {
      alert("Please select a payout destination account.");
      return;
    }
    setStep("confirm");
  };

  // Step 3: Execute Payout via Razorpay Payouts
  const handleExecutePayout = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload: any = {
        amount: Number(withdrawAmount),
      };

      if (isConfiguringNew) {
        payload.newPayoutMethod = {
          type: newMethodType,
          accountHolderName: newMethodForm.accountHolderName.trim(),
          upiId: newMethodForm.upiId.trim(),
          upiMobile: newMethodForm.upiMobile.trim(),
          accountNumber: newMethodForm.accountNumber.trim(),
          ifscCode: newMethodForm.ifscCode.trim().toUpperCase(),
          saveMethod: newMethodForm.saveMethod,
        };
      } else if (selectedMethodId === "legacy_bank") {
        // Uses legacy bankDetails on profile
      } else {
        payload.payoutMethodId = selectedMethodId;
      }

      const res = await fetch("/api/freelancer/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute payout.");
      }

      setCompletedPayout(data.payout);
      setStep("success");
      fetchEarnings();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while executing payout.");
    } finally {
      setSubmitting(false);
    }
  };

  // Selected method summary helper
  const getSelectedMethodSummary = () => {
    if (isConfiguringNew) {
      if (newMethodType === "upi_id") return `UPI ID: ${newMethodForm.upiId || "Configured UPI"}`;
      if (newMethodType === "upi_mobile") return `UPI Mobile: +91 ${newMethodForm.upiMobile}`;
      return `Bank Transfer: A/C ending in ${newMethodForm.accountNumber ? newMethodForm.accountNumber.slice(-4) : "****"} (${newMethodForm.ifscCode.toUpperCase() || "IFSC"})`;
    }

    if (selectedMethodId === "legacy_bank") {
      const b = payoutData?.bankDetails || profile?.bankDetails;
      if (b?.upiId) return `UPI ID: ${b.upiId}`;
      if (b?.upiMobile) return `UPI Mobile: +91 ${b.upiMobile}`;
      if (b?.accountNumber) return `Bank A/C: ••••${b.accountNumber.slice(-4)} (${(b.ifscCode || "").toUpperCase()})`;
    }

    const found = payoutMethods.find((m: any) => m.id === selectedMethodId);
    if (found) {
      if (found.type === "upi_id") return `UPI ID: ${found.upiId}`;
      if (found.type === "upi_mobile") return `UPI Mobile: +91 ${found.upiMobile}`;
      return `Bank A/C: ••••${(found.accountNumber || "").slice(-4)} (${(found.ifscCode || "").toUpperCase()})`;
    }

    return "Selected Payout Account";
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background min-h-screen flex flex-col justify-center py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 w-full">
        {/* Header */}
        <header className="mb-12 border-b border-border/40 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-2.5">
              <IndianRupee className="text-accent" size={18} strokeWidth={2.5} />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Earnings &amp; Payouts</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Earnings
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Track your cleared revenue, available balance, and request instant Razorpay disbursements.
            </p>
          </motion.div>
        </header>

        {/* Main Balances Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgba(232,82,57,0.02)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {loading ? (
            <div className="h-44 bg-stone-50 rounded-2xl animate-pulse" />
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:items-center justify-between">
              {/* Total Revenue */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Total Cleared Revenue</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    100% Yours • 0% Fee
                  </span>
                </div>
                <p className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-text-primary">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-6 mt-4 text-xs text-text-tertiary font-medium">
                  <span>Withdrawn to date: <strong className="text-text-secondary">{formatCurrency(totalWithdrawn)}</strong></span>
                  <span>•</span>
                  <span>Escrow Protection: <strong className="text-emerald-600">Active</strong></span>
                </div>
              </div>

              {/* Available & Payout Action */}
              <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border/60 pt-8 lg:pt-0 lg:pl-12 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Available to Withdraw</p>
                <p className="font-display text-4xl font-bold text-accent mb-6">
                  {formatCurrency(availableBalance)}
                </p>

                <button
                  onClick={handleOpenModal}
                  disabled={availableBalance < 10}
                  className={`flex items-center justify-between w-full px-6 py-4 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all ${
                    availableBalance >= 10
                      ? "bg-accent hover:bg-accent-hover text-white shadow-[0_4px_16px_rgba(232,82,57,0.25)] hover:shadow-[0_6px_24px_rgba(232,82,57,0.35)] active:scale-[0.98] cursor-pointer"
                      : "bg-stone-100 text-stone-400 border border-stone-200/80 shadow-none cursor-not-allowed select-none"
                  }`}
                >
                  <span>Execute Payment</span>
                  <ArrowRight size={15} strokeWidth={2.5} className={availableBalance >= 10 ? "text-white" : "text-stone-300"} />
                </button>
                {availableBalance < 10 && (
                  <p className="text-[11px] text-text-tertiary mt-2.5 text-center">
                    Minimum withdrawal threshold is ₹10.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Payout & Earnings History */}
        <motion.div
          className="mt-10 bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.02)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-text-primary">Disbursement &amp; Payout History</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Direct transfers executed to your verified bank and UPI accounts</p>
            </div>
            <span className="text-xs font-bold text-text-tertiary bg-stone-50 border border-border/60 px-3 py-1.5 rounded-full">
              {payoutsList.length} {payoutsList.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {payoutsList.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border/60 rounded-2xl bg-stone-50/50">
              <CreditCard className="mx-auto text-stone-300 mb-3" size={32} />
              <p className="text-sm font-semibold text-text-secondary">No payouts executed yet</p>
              <p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto">
                When you complete client milestones and execute withdrawals, your payout records and Razorpay disbursement receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {payoutsList.map((p: any, idx: number) => (
                    <tr key={p.id || idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-text-primary flex items-center gap-2">
                          <ArrowUpRight size={14} className="text-emerald-500" />
                          <span>Payout Disbursed</span>
                        </div>
                        <div className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Just now"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-text-secondary font-medium">
                        {p.accountDetails || "Direct Bank/UPI"}
                      </td>
                      <td className="py-4 px-4 font-bold text-stone-900 font-display text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Transferred</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-[11px] text-text-tertiary">
                        {p.phonePeRefId || p.transactionId || "RZP-DIRECT"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Payout Execution Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-border/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <IndianRupee size={15} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary leading-none">Execute Payout</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wider font-mono">
                      Step {step === "amount" ? "1 of 3" : step === "destination" ? "2 of 3" : step === "confirm" ? "3 of 3" : "Completed"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-stone-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Step Content */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                
                {/* ══ STEP 1: Enter Withdrawal Amount ══ */}
                {step === "amount" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary">How much would you like to withdraw?</h4>
                      <p className="text-xs text-text-tertiary mt-1">
                        Enter any amount between <strong className="text-text-primary font-semibold">₹10</strong> and your cleared balance of <strong className="text-accent font-semibold">{formatCurrency(availableBalance)}</strong>.
                      </p>
                    </div>

                    {/* Big Amount Input */}
                    <div className="bg-stone-50/80 border border-border/80 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span>Withdrawal Amount</span>
                        <span>Available: <strong className="text-text-primary">{formatCurrency(availableBalance)}</strong></span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-2xl font-bold text-text-tertiary font-display">₹</span>
                        <input
                          type="number"
                          min={10}
                          max={availableBalance}
                          value={withdrawAmount}
                          onChange={(e) => {
                            setWithdrawAmount(e.target.value);
                            setAmountError("");
                          }}
                          placeholder="0"
                          className="w-full bg-white border border-border/80 rounded-xl pl-9 pr-4 py-3.5 text-2xl font-bold font-display text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                        />
                      </div>

                      {/* Percentage Chips */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {[
                          { label: "25%", val: 25 },
                          { label: "50%", val: 50 },
                          { label: "75%", val: 75 },
                          { label: "100% (Max)", val: 100 },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => handleQuickPercent(chip.val)}
                            className="py-1.5 text-xs font-semibold rounded-lg bg-white border border-border/70 text-text-secondary hover:border-accent hover:text-accent transition-colors"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error message */}
                    {amountError && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{amountError}</span>
                      </div>
                    )}

                    {/* Calculation breakdown */}
                    {Number(withdrawAmount) > 0 && !amountError && (
                      <div className="bg-stone-50/50 border border-border/50 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex justify-between text-text-tertiary">
                          <span>Requested Withdrawal:</span>
                          <span className="font-semibold text-text-primary">{formatCurrency(Number(withdrawAmount))}</span>
                        </div>
                        <div className="flex justify-between text-text-tertiary">
                          <span>Platform Processing Fee:</span>
                          <span className="font-semibold text-emerald-600">₹0 (Free)</span>
                        </div>
                        <div className="border-t border-border/40 pt-2 flex justify-between font-bold text-text-primary">
                          <span>Remaining Balance After:</span>
                          <span>{formatCurrency(Math.max(0, availableBalance - Number(withdrawAmount)))}</span>
                        </div>
                      </div>
                    )}

                    {/* Step 1 Actions */}
                    <div className="pt-2">
                      <button
                        onClick={handleProceedFromAmount}
                        disabled={availableBalance < 10}
                        className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_16px_rgba(232,82,57,0.2)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Select Payout Destination</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ══ STEP 2: Confirm or Configure Payout Destination ══ */}
                {step === "destination" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary">Confirm Payout Destination</h4>
                      <p className="text-xs text-text-tertiary mt-1">
                        Funds will be disbursed directly via Razorpay to this verified destination account.
                      </p>
                    </div>

                    {/* Pre-configured payout methods list (if exists and not adding new) */}
                    {!isConfiguringNew && (payoutMethods.length > 0 || profile?.bankDetails?.upiId || profile?.bankDetails?.accountNumber) ? (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                          <span>Confirming payout will be released to this destination:</span>
                        </div>

                        <div className="space-y-2">
                          {payoutMethods.map((m: any) => (
                            <label
                              key={m.id}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                selectedMethodId === m.id
                                  ? "bg-accent/5 border-accent shadow-sm"
                                  : "bg-white border-border/70 hover:bg-stone-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="payoutMethod"
                                  checked={selectedMethodId === m.id}
                                  onChange={() => setSelectedMethodId(m.id)}
                                  className="text-accent focus:ring-accent accent-accent"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-primary capitalize">
                                      {m.type.replace("_", " ")}
                                    </span>
                                    {m.isDefault && (
                                      <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-secondary mt-0.5 font-medium">
                                    {m.type === "upi_id" && m.upiId}
                                    {m.type === "upi_mobile" && `+91 ${m.upiMobile}`}
                                    {m.type === "bank_transfer" && `••••${(m.accountNumber || "").slice(-4)} (${(m.ifscCode || "").toUpperCase()})`}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}

                          {/* Legacy bank details fallback if payoutMethods is empty */}
                          {payoutMethods.length === 0 && profile?.bankDetails && (
                            <div className="p-4 rounded-2xl border bg-accent/5 border-accent">
                              <p className="text-xs font-bold text-text-primary">Configured Profile Coordinates</p>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {profile.bankDetails.upiId ? `UPI: ${profile.bankDetails.upiId}` : `A/C: ••••${profile.bankDetails.accountNumber?.slice(-4)}`}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsConfiguringNew(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover pt-1 cursor-pointer"
                        >
                          <Plus size={14} /> Add another payout method
                        </button>
                      </div>
                    ) : (
                      /* Configuration Flow for New Payment Method */
                      <div className="space-y-4">
                        {payoutMethods.length > 0 && (
                          <div className="flex justify-between items-center pb-2">
                            <span className="text-xs font-bold text-text-primary">Configure New Payout Method</span>
                            <button
                              type="button"
                              onClick={() => setIsConfiguringNew(false)}
                              className="text-xs text-text-tertiary hover:text-text-primary underline"
                            >
                              Use saved method
                            </button>
                          </div>
                        )}

                        {/* Method Tabs */}
                        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100/80 rounded-xl">
                          {[
                            { type: "upi_id", label: "UPI ID", icon: Smartphone },
                            { type: "upi_mobile", label: "UPI Mobile", icon: Smartphone },
                            { type: "bank_transfer", label: "Bank Transfer", icon: Building2 },
                          ].map((t) => {
                            const Icon = t.icon;
                            return (
                              <button
                                key={t.type}
                                type="button"
                                onClick={() => setNewMethodType(t.type as any)}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                  newMethodType === t.type
                                    ? "bg-white text-accent shadow-sm"
                                    : "text-text-tertiary hover:text-text-primary"
                                }`}
                              >
                                <Icon size={13} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Input Fields */}
                        {newMethodType === "upi_id" && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-[11px] font-bold text-text-tertiary uppercase">UPI ID / VPA</label>
                              <input
                                type="text"
                                placeholder="e.g. yourname@okhdfcbank"
                                value={newMethodForm.upiId}
                                onChange={(e) => setNewMethodForm({ ...newMethodForm, upiId: e.target.value })}
                                className="w-full mt-1 px-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                              />
                              {formErrors.upiId && <p className="text-[11px] text-red-500 mt-1">{formErrors.upiId}</p>}
                            </div>
                          </div>
                        )}

                        {newMethodType === "upi_mobile" && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-[11px] font-bold text-text-tertiary uppercase">Registered Mobile Number (UPI)</label>
                              <div className="relative mt-1 flex items-center">
                                <span className="absolute left-3.5 text-xs text-text-tertiary font-bold">+91</span>
                                <input
                                  type="text"
                                  maxLength={10}
                                  placeholder="9876543210"
                                  value={newMethodForm.upiMobile}
                                  onChange={(e) => setNewMethodForm({ ...newMethodForm, upiMobile: e.target.value.replace(/\D/g, "") })}
                                  className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                                />
                              </div>
                              {formErrors.upiMobile && <p className="text-[11px] text-red-500 mt-1">{formErrors.upiMobile}</p>}
                            </div>
                          </div>
                        )}

                        {newMethodType === "bank_transfer" && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-[11px] font-bold text-text-tertiary uppercase">Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="Full Name as in Bank Passbook"
                                value={newMethodForm.accountHolderName}
                                onChange={(e) => setNewMethodForm({ ...newMethodForm, accountHolderName: e.target.value })}
                                className="w-full mt-1 px-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                              />
                              {formErrors.accountHolderName && <p className="text-[11px] text-red-500 mt-1">{formErrors.accountHolderName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-bold text-text-tertiary uppercase">Account Number</label>
                                <input
                                  type="password"
                                  placeholder="9–18 Digits"
                                  value={newMethodForm.accountNumber}
                                  onChange={(e) => setNewMethodForm({ ...newMethodForm, accountNumber: e.target.value })}
                                  className="w-full mt-1 px-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                                />
                                {formErrors.accountNumber && <p className="text-[11px] text-red-500 mt-1">{formErrors.accountNumber}</p>}
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-text-tertiary uppercase">Confirm A/C Number</label>
                                <input
                                  type="text"
                                  placeholder="Re-enter Account"
                                  value={newMethodForm.confirmAccountNumber}
                                  onChange={(e) => setNewMethodForm({ ...newMethodForm, confirmAccountNumber: e.target.value })}
                                  className="w-full mt-1 px-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                                />
                                {formErrors.confirmAccountNumber && <p className="text-[11px] text-red-500 mt-1">{formErrors.confirmAccountNumber}</p>}
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-text-tertiary uppercase">IFSC Code</label>
                              <input
                                type="text"
                                maxLength={11}
                                placeholder="e.g. HDFC0001234"
                                value={newMethodForm.ifscCode}
                                onChange={(e) => setNewMethodForm({ ...newMethodForm, ifscCode: e.target.value.toUpperCase() })}
                                className="w-full mt-1 px-4 py-2.5 bg-stone-50 border border-border/80 rounded-xl text-xs text-text-primary outline-none focus:border-accent font-mono uppercase"
                              />
                              {formErrors.ifscCode && <p className="text-[11px] text-red-500 mt-1">{formErrors.ifscCode}</p>}
                            </div>
                          </div>
                        )}

                        <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={newMethodForm.saveMethod}
                            onChange={(e) => setNewMethodForm({ ...newMethodForm, saveMethod: e.target.checked })}
                            className="rounded text-accent focus:ring-accent accent-accent"
                          />
                          <span className="text-xs text-text-secondary">Save this payout method to profile for future withdrawals</span>
                        </label>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep("amount")}
                        className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-text-primary text-xs font-bold rounded-xl transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedFromDestination}
                        className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_16px_rgba(232,82,57,0.2)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Review &amp; Confirm Payout</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ══ STEP 3: Final Review & Release via Razorpay ══ */}
                {step === "confirm" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary">Review Payout Details</h4>
                      <p className="text-xs text-text-tertiary mt-1">
                        Please review the breakdown before authorizing fund release via Razorpay.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-stone-50 border border-border/80 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-border/40 pb-3">
                        <span className="text-xs text-text-tertiary">Withdrawal Amount:</span>
                        <span className="font-display text-xl font-bold text-stone-900">{formatCurrency(Number(withdrawAmount))}</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Destination Account:</span>
                          <span className="font-semibold text-text-primary">{getSelectedMethodSummary()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Processing Channel:</span>
                          <span className="font-semibold text-accent flex items-center gap-1">
                            <Zap size={12} /> Razorpay Instant Disbursement
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-tertiary">Platform Fee:</span>
                          <span className="font-bold text-emerald-600">₹0 (Zero Deduction)</span>
                        </div>
                        <div className="flex justify-between border-t border-border/40 pt-2 font-bold text-sm">
                          <span className="text-text-primary">Total Net Credited:</span>
                          <span className="text-accent font-display text-base">{formatCurrency(Number(withdrawAmount))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Guarantee */}
                    <div className="p-4 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl flex items-start gap-3 text-xs text-emerald-800">
                      <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Protected Under FINDADE Escrow Policy</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                          Your earnings are transferred directly from our secure escrow custody. Expected transfer time: 2–5 minutes.
                        </p>
                      </div>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setStep("destination")}
                        className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-text-primary text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleExecutePayout}
                        className="flex-1 py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_16px_rgba(232,82,57,0.25)] hover:shadow-[0_6px_24px_rgba(232,82,57,0.35)] active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Processing Disbursement…</span>
                          </>
                        ) : (
                          <>
                            <Zap size={15} />
                            <span>Confirm &amp; Release Funds</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ══ STEP 4: Success State ══ */}
                {step === "success" && (
                  <div className="py-4 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-text-primary">Disbursement Initiated!</h4>
                      <p className="text-xs text-text-tertiary">
                        Your payment has been successfully released and queued via Razorpay.
                      </p>
                    </div>

                    {/* Receipt Details */}
                    <div className="bg-stone-50 border border-border/80 rounded-2xl p-5 text-left text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Amount Released:</span>
                        <span className="font-bold text-text-primary font-display text-sm">
                          {formatCurrency(completedPayout?.amount || Number(withdrawAmount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Destination:</span>
                        <span className="font-semibold text-text-secondary">
                          {completedPayout?.accountDetails || getSelectedMethodSummary()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Transaction Ref:</span>
                        <span className="font-mono text-text-secondary">{completedPayout?.transactionId || "EXW-COMPLETED"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Razorpay Ref ID:</span>
                        <span className="font-mono text-emerald-600 font-bold">{completedPayout?.phonePeRefId || "RZP-DISBURSED"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Status:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Funds Released
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      Done &amp; Return to Dashboard
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
