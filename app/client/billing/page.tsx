"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Download, CheckCircle2, X, Smartphone,
  Building2, Star, Trash2, Shield, AlertCircle, Loader2,
  ArrowRight, ChevronRight, Wallet, IndianRupee
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type MethodType = "upi" | "card" | "netbanking";
interface PaymentMethodDoc {
  _id: string;
  type: MethodType;
  label: string;
  upiId?: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  bank?: string;
  accountHolderName?: string;
  isDefault: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

function detectCardBrand(num: string): string {
  if (/^4/.test(num)) return "VISA";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^(508[5-9]|60[6-9]|61|62[01]|6521|6522|81[0-9])/.test(num)) return "RuPay";
  if (/^3[47]/.test(num)) return "Amex";
  return "Card";
}

const BANKS = [
  "HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
  "Canara Bank", "IDFC FIRST Bank", "Yes Bank", "IndusInd Bank", "Federal Bank"
];

const METHOD_ICONS: Record<MethodType, React.ReactNode> = {
  upi: <Smartphone size={18} className="text-[#E85239]" />,
  card: <CreditCard size={18} className="text-[#E85239]" />,
  netbanking: <Building2 size={18} className="text-[#E85239]" />,
};

// ─── Add Payment Method Modal ─────────────────────────────────────────────────
type ModalStep = "choose" | "upi" | "card" | "netbanking";

function AddPaymentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState<ModalStep>("choose");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // UPI
  const [upiId, setUpiId] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");

  // Net Banking
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");

  // Consent
  const [consent, setConsent] = useState(false);

  const resetForm = () => {
    setError(""); setConsent(false);
    setUpiId(""); setCardNumber(""); setCardExpiry(""); setCardName(""); setBank(""); setAccountName("");
  };

  const goToStep = (s: ModalStep) => { resetForm(); setStep(s); };

  async function handleSave() {
    if (!consent) { setError("Please accept the consent to continue."); return; }
    setSaving(true); setError("");

    let body: Record<string, any> = { consentGiven: true };
    if (step === "upi") {
      if (!upiId.includes("@")) { setError("Enter a valid UPI ID (e.g. name@bank)"); setSaving(false); return; }
      body = { ...body, type: "upi", upiId };
    } else if (step === "card") {
      const raw = cardNumber.replace(/\s/g, "");
      if (raw.length < 15) { setError("Enter a valid card number"); setSaving(false); return; }
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { setError("Enter expiry as MM/YY"); setSaving(false); return; }
      const brand = detectCardBrand(raw);
      body = { ...body, type: "card", cardLast4: raw.slice(-4), cardBrand: brand, cardExpiry, accountHolderName: cardName };
    } else if (step === "netbanking") {
      if (!bank) { setError("Please select a bank"); setSaving(false); return; }
      body = { ...body, type: "netbanking", bank, accountHolderName: accountName };
    }

    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Format card number with spaces
  const handleCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    setCardNumber(raw.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleCardExpiry = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) setCardExpiry(raw.slice(0, 2) + "/" + raw.slice(2));
    else setCardExpiry(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#E85239] to-[#FF7A61]" />

        {/* Header */}
        <div className="px-8 pt-7 pb-0 flex items-start justify-between">
          <div>
            {step !== "choose" && (
              <button
                onClick={() => goToStep("choose")}
                className="text-[11px] font-bold text-stone-400 hover:text-[#E85239] mb-2 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="text-[22px] font-black text-stone-900">
              {step === "choose" && "Add Payment Method"}
              {step === "upi" && "Add UPI"}
              {step === "card" && "Add Card"}
              {step === "netbanking" && "Add Net Banking"}
            </h2>
            <p className="text-[12px] text-stone-400 mt-1">
              {step === "choose" && "Choose how you'd like to pay for escrow"}
              {step === "upi" && "Enter your UPI ID to link for payments"}
              {step === "card" && "Enter your card details securely"}
              {step === "netbanking" && "Link your bank account for net banking"}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-stone-600 transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 pt-6">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Choose type */}
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-3">
                {([
                  { id: "upi", icon: Smartphone, title: "UPI", desc: "Pay via any UPI app — GPay, PhonePe, Paytm" },
                  { id: "card", icon: CreditCard, title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay, Amex" },
                  { id: "netbanking", icon: Building2, title: "Net Banking", desc: "Direct bank transfer through HDFC, ICICI & more" },
                ] as const).map(({ id, icon: Icon, title, desc }) => (
                  <button
                    key={id}
                    onClick={() => goToStep(id)}
                    id={`pm-choose-${id}`}
                    className="group flex items-center gap-4 p-4 border border-stone-200 rounded-2xl hover:border-[#E85239] hover:bg-[#FFF7F6] transition-all duration-200 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FFF0ED] flex items-center justify-center shrink-0 group-hover:bg-[#FCE1DC] transition-colors">
                      <Icon size={20} className="text-[#E85239]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-stone-900">{title}</p>
                      <p className="text-[12px] text-stone-400 mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-[#E85239] transition-colors" />
                  </button>
                ))}

                <p className="flex items-center gap-2 text-[11px] text-stone-400 mt-2">
                  <Shield size={12} className="shrink-0" />
                  All payments are processed securely via PhonePe
                </p>
              </motion.div>
            )}

            {/* STEP 2a — UPI */}
            {step === "upi" && (
              <motion.div key="upi" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">UPI ID</label>
                  <input
                    id="pm-upi-id"
                    type="text"
                    placeholder="yourname@okicici"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim())}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors"
                  />
                  <p className="text-[11px] text-stone-400 mt-2">Examples: name@upi · name@okicici · name@ybl · name@paytm</p>
                </div>
                {renderConsentAndSave()}
              </motion.div>
            )}

            {/* STEP 2b — Card */}
            {step === "card" && (
              <motion.div key="card" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Card Number</label>
                  <input
                    id="pm-card-number"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => handleCardNumber(e.target.value)}
                    inputMode="numeric"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Expiry</label>
                    <input
                      id="pm-card-expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => handleCardExpiry(e.target.value)}
                      inputMode="numeric"
                      maxLength={5}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Cardholder Name</label>
                    <input
                      id="pm-card-name"
                      type="text"
                      placeholder="As on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                {cardNumber.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
                    <CreditCard size={14} className="text-[#E85239]" />
                    <span className="text-[12px] font-bold text-stone-600">
                      {detectCardBrand(cardNumber.replace(/\s/g, ""))}
                    </span>
                  </div>
                )}
                {renderConsentAndSave()}
              </motion.div>
            )}

            {/* STEP 2c — Net Banking */}
            {step === "netbanking" && (
              <motion.div key="netbanking" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Select Bank</label>
                  <select
                    id="pm-bank-select"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors"
                  >
                    <option value="">Choose your bank…</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Account Holder Name</label>
                  <input
                    id="pm-account-name"
                    type="text"
                    placeholder="Your name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-[#E85239] focus:bg-white transition-colors"
                  />
                </div>
                {renderConsentAndSave()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  function renderConsentAndSave() {
    return (
      <>
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-600 font-medium">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setConsent(c => !c)}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${consent ? "bg-[#E85239] border-[#E85239]" : "border-stone-300 group-hover:border-[#E85239]"}`}
          >
            {consent && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <p className="text-[12px] text-stone-500 leading-relaxed">
            By saving, I authorise Executa to store this payment method and use it to fund project escrow on my behalf. My financial data is encrypted and never shared.
          </p>
        </label>
        <button
          id="pm-save-btn"
          onClick={handleSave}
          disabled={saving || !consent}
          className="w-full py-3.5 bg-[#E85239] disabled:bg-stone-200 disabled:text-stone-400 text-white text-[14px] font-bold rounded-xl hover:bg-[#d44127] disabled:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <>Save Payment Method <ArrowRight size={16} /></>}
        </button>
      </>
    );
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientBilling() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDoc[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const toggleProject = (id: string) =>
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const fetchMethods = useCallback(async () => {
    setMethodsLoading(true);
    try {
      const res = await fetch("/api/payment-methods");
      const data = await res.json();
      setPaymentMethods(data.methods || []);
    } catch { /* silent */ }
    finally { setMethodsLoading(false); }
  }, []);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetchMethods();
  }, [fetchMethods]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/payment-methods?id=${id}`, { method: "DELETE" });
    setPaymentMethods(prev => prev.filter(m => m._id !== id));
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);
    await fetch("/api/payment-methods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m._id === id })));
    setSettingDefault(null);
  };

  // Active escrow = freelancer is assigned AND work has actually started
  const activeEscrowProjects = projects.filter(p =>
    ["active", "execution", "review"].includes(p.status) &&
    p.pricing?.total &&
    (p.freelancerId || (p.assignedFreelancers && p.assignedFreelancers.length > 0))
  );

  // Paid = platform fee was successfully charged via PhonePe
  const paidProjects = projects.filter(p => p.payment?.status === "paid" && p.payment?.paidAt);
  const completedProjects = projects.filter(p => p.status === "completed");

  const totalPlatformFeesPaid = paidProjects.reduce((s, p) => s + (p.payment?.amount || 0), 0);
  const activeEscrowTotal = activeEscrowProjects.reduce((s, p) => s + (p.pricing?.total || 0), 0);

  // Payment history = ONLY platform fee payments (scope creation charges)
  const paymentHistory = paidProjects
    .map(p => ({
      _id: `pf-${p._id}`,
      date: p.payment?.paidAt,
      description: `${p.title} — Platform Fee`,
      amount: p.payment?.amount || 0,
      txnId: p.payment?.transactionId,
    }))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-3">
          Billing & Finances
        </h1>
        <p className="text-[17px] font-medium text-stone-400 max-w-2xl leading-relaxed">
          Transparent financial ledgers, active escrow payments, and verifiable invoicing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ══════════ LEFT — Ledgers ══════════ */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Active Escrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm"
          >
            <h2 className="text-[13px] font-bold tracking-widest text-stone-400 uppercase mb-6">
              Active Escrow Holdings
            </h2>
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="py-8 flex items-center gap-2 text-stone-400 text-[13px]">
                  <Loader2 size={16} className="animate-spin" />Loading escrow ledgers…
                </div>
              ) : activeEscrowProjects.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
                  <Wallet size={28} className="text-stone-300" />
                  <p className="text-[13px] text-stone-400">No active projects with a hired freelancer yet.</p>
                  <p className="text-[12px] text-stone-300">Escrow funds appear here once a freelancer accepts and work begins.</p>
                </div>
              ) : (
                activeEscrowProjects.map(project => {
                  const isExpanded = expandedProjects.includes(project._id);
                  const p = project.pricing;
                  return (
                    <div key={project._id} className="flex flex-col p-6 border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors bg-stone-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center">
                            <CreditCard size={20} className="text-[#E85239]" />
                          </div>
                          <div>
                            <h3 className="text-[17px] font-black text-stone-900">{project.title}</h3>
                            <p className="text-[12px] font-bold text-stone-400 capitalize">{project.status.replace("_", " ")} Phase</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[24px] font-black text-stone-900 leading-none">{fmt(p.total)}</p>
                          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Funded in Escrow</p>
                        </div>
                      </div>

                      {!isExpanded ? (
                        <div className="mt-5 flex justify-center">
                          <button
                            onClick={() => toggleProject(project._id)}
                            className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm"
                          >
                            See full breakdown ↓
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mt-6 pt-6 border-t border-stone-100">
                            <div className="bg-white p-5 rounded-xl border border-stone-100 space-y-3">
                              {[
                                ["Freelancer Price", fmt(p.freelancerPrice)],
                                ["Scope Fee", fmt(p.scopeFee)],
                                ["Accountability Fee", fmt(p.accountabilityFee)],
                                ["Execution Fee (5%)", fmt(p.executionFee)],
                              ].map(([label, val]) => (
                                <div key={label} className="flex items-center justify-between text-[13px]">
                                  <span className="text-stone-500">{label}</span>
                                  <span className="font-bold text-stone-900">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 flex justify-center">
                            <button
                              onClick={() => toggleProject(project._id)}
                              className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors"
                            >
                              Hide breakdown ↑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Payment History & Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm"
          >
            <h2 className="text-[13px] font-bold tracking-widest text-stone-400 uppercase mb-6">
              Platform Fee Payments
            </h2>
            {loading ? (
              <div className="py-8 flex items-center gap-2 text-stone-400 text-[13px]">
                <Loader2 size={16} className="animate-spin" />Loading…
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-3 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
                <IndianRupee size={28} className="text-stone-300" />
                <p className="text-[13px] text-stone-400">No platform fee payments yet. Create a scope to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Project</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] font-medium text-stone-700">
                    {paymentHistory.map(row => (
                      <tr key={row._id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 text-stone-400 text-[12px] whitespace-nowrap">
                          {row.date ? new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-4 pr-4">{row.description}</td>
                        <td className="py-4 font-bold text-stone-900 whitespace-nowrap">{fmt(row.amount)}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-600">
                            Platform Fee
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 text-[#E85239] hover:text-[#d44127] font-bold text-[12px] transition-colors"
                          >
                            <Download size={13} />Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* ══════════ RIGHT — Summary + Payment Methods ══════════ */}
        <div className="flex flex-col gap-6">

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-[12px] font-bold tracking-widest text-stone-400 uppercase mb-1">Platform Fees Paid</h2>
            <p className="text-[44px] font-black tracking-tighter leading-none mb-8">
              {fmt(totalPlatformFeesPaid)}
            </p>
            <div className="flex flex-col gap-4 border-t border-stone-700/60 pt-5">
              {[
                ["Projects Completed", completedProjects.length],
                ["Active in Escrow", fmt(activeEscrowTotal)],
                ["Total Scopes Paid", paidProjects.length],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between items-center text-[12px]">
                  <span className="text-stone-400 font-medium">{label}</span>
                  <span className="font-bold">{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#FFF7F6] border border-orange-100 rounded-3xl p-7 flex flex-col gap-0"
          >
            <div className="mb-5">
              <h3 className="text-[16px] font-bold text-stone-900 mb-1">Payment Methods</h3>
              <p className="text-[12px] font-medium text-stone-500">Saved accounts used for escrow funding.</p>
            </div>

            {methodsLoading ? (
              <div className="py-4 flex items-center gap-2 text-stone-400 text-[12px]">
                <Loader2 size={14} className="animate-spin" />Loading…
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="py-4 text-center border border-dashed border-orange-200 rounded-2xl mb-4">
                <p className="text-[12px] text-stone-400 italic">No payment methods saved yet.</p>
                <p className="text-[11px] text-stone-300 mt-1">Methods are auto-saved after your first payment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {paymentMethods.map(method => (
                  <div
                    key={method._id}
                    className={`flex items-center gap-3 p-4 bg-white rounded-2xl border transition-all ${method.isDefault ? "border-[#E85239]/30 shadow-sm" : "border-stone-200"}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0ED] flex items-center justify-center shrink-0">
                      {METHOD_ICONS[method.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-stone-900 truncate">{method.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-stone-400 capitalize">{method.type === "netbanking" ? "Net Banking" : method.type === "upi" ? "UPI" : "Card"}</p>
                        {method.isDefault && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-[#E85239] uppercase tracking-wider">
                            <Star size={8} fill="currentColor" />Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method._id)}
                          disabled={settingDefault === method._id}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-[#E85239] hover:bg-orange-50 transition-colors"
                          title="Set as default"
                        >
                          {settingDefault === method._id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <CheckCircle2 size={14} />
                          }
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(method._id)}
                        disabled={deletingId === method._id}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        {deletingId === method._id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              id="add-payment-method-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-[#E85239] hover:bg-orange-50 rounded-xl transition-colors border border-orange-200 hover:border-[#E85239]"
            >
              + Add Payment Method
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-3">
              <Shield size={11} />All transactions secured by PhonePe
            </p>
          </motion.div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddPaymentModal
            onClose={() => setIsAddModalOpen(false)}
            onSaved={fetchMethods}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
