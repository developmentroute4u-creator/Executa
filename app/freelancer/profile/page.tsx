"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, LogOut, Sparkles, Camera, Edit3, Save, X, ArrowRight, CreditCard, AlertTriangle, Plus, CheckCircle2, Trash2 } from "lucide-react";

// ─── Validation helpers ────────────────────────────────────────────────────────
function validateEmail(val: string): string {
  if (!val.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
    return "Please enter a valid email address format.";
  return "";
}
function validateName(val: string): string {
  if (!val.trim()) return "Full name is required.";
  if (val.trim().length < 2) return "Must be at least 2 characters.";
  if (!/^[a-zA-Z\s.]+$/.test(val.trim())) return "Only letters, spaces, and dots are allowed.";
  return "";
}

function validateUpiId(val: string): string {
  if (!val.trim()) return "UPI ID is required.";
  if (!/^[a-zA-Z0-9._\-]+@[a-zA-Z]{2,}$/.test(val.trim()))
    return "Invalid format. Example: username@ybl  or  name@okicici";
  return "";
}
function validateMobile(val: string): string {
  if (!val.trim()) return "Mobile number is required.";
  if (!/^[6-9][0-9]{9}$/.test(val.trim()))
    return "Must be exactly 10 digits starting with 6, 7, 8, or 9.";
  return "";
}
function validateAccountNumber(val: string): string {
  if (!val.trim()) return "Account number is required.";
  if (!/^[0-9]{9,18}$/.test(val.trim()))
    return "Must be 9–18 digits only — no letters, spaces, or dashes.";
  return "";
}
function validateIfsc(val: string): string {
  if (!val.trim()) return "IFSC code is required.";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.trim().toUpperCase()))
    return "Invalid IFSC. Format: 4 bank letters + 0 + 6 branch chars (e.g. HDFC0001234)";
  return "";
}
function validateHolderName(val: string): string {
  if (!val.trim()) return "Account holder name is required.";
  if (val.trim().length < 2) return "Must be at least 2 characters.";
  if (!/^[a-zA-Z\s.]+$/.test(val.trim())) return "Only letters, spaces, and dots are allowed.";
  return "";
}

export default function ProfileEnvironment() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Multi-payout methods state
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalView, setModalView] = useState<"list" | "select-type" | "configure">("list");
  const [addingType, setAddingType] = useState("upi_id");
  const [addForm, setAddForm] = useState({ accountHolderName: "", upiId: "", upiMobile: "", accountNumber: "", ifscCode: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [savingMethod, setSavingMethod] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const user = session?.user as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = () => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        const liveUser = d.user || (session?.user as any);
        setUserData(liveUser);
        setNameInput(liveUser?.name || "");
        setEmailInput(liveUser?.email || "");
        setBioInput(d.profile?.bio || "");
        setPayoutMethods(d.profile?.payoutMethods || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setUserData((prev: any) => ({ ...prev, avatar: base64String }));
      try {
        const res = await fetch("/api/freelancer/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64String }),
        });
        if (!res.ok) throw new Error("Failed to save avatar image");
        fetchProfile();
      } catch (err) {
        console.error(err);
        alert("Could not update profile avatar.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    const nameErr = validateName(nameInput);
    const emailErr = validateEmail(emailInput);
    if (nameErr || emailErr) {
      setErrorMsg(nameErr || emailErr);
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, email: emailInput, bio: bioInput }),
      });
      if (!res.ok) throw new Error("Failed to save profile modifications");
      fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── Payout method actions ────────────────────────────────────────────────────
  function validateAddForm(): Record<string, string> {
    const errs: Record<string, string> = {};
    const nameErr = validateHolderName(addForm.accountHolderName);
    if (nameErr) errs.accountHolderName = nameErr;
    if (addingType === "upi_id") {
      const e = validateUpiId(addForm.upiId); if (e) errs.upiId = e;
    }
    if (addingType === "upi_mobile") {
      const e = validateMobile(addForm.upiMobile); if (e) errs.upiMobile = e;
    }
    if (addingType === "bank_transfer") {
      const ae = validateAccountNumber(addForm.accountNumber); if (ae) errs.accountNumber = ae;
      const ie = validateIfsc(addForm.ifscCode); if (ie) errs.ifscCode = ie;
    }
    return errs;
  }

  const handleAddMethod = async () => {
    const errs = validateAddForm();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingMethod(true);
    const newMethod = {
      id: `pm_${Date.now()}`,
      type: addingType,
      accountHolderName: addForm.accountHolderName.trim(),
      upiId: addingType === "upi_id" ? addForm.upiId.trim() : "",
      upiMobile: addingType === "upi_mobile" ? addForm.upiMobile.trim() : "",
      accountNumber: addingType === "bank_transfer" ? addForm.accountNumber.trim() : "",
      ifscCode: addingType === "bank_transfer" ? addForm.ifscCode.trim().toUpperCase() : "",
      isDefault: payoutMethods.length === 0,
      addedAt: new Date().toISOString(),
    };
    const updated = [...payoutMethods, newMethod];
    try {
      const res = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutMethods: updated }),
      });
      if (res.ok) {
        setPayoutMethods(updated);
        setModalView("list");
        setAddForm({ accountHolderName: "", upiId: "", upiMobile: "", accountNumber: "", ifscCode: "" });
        setAddErrors({});
      } else {
        alert("Failed to save payout method.");
      }
    } catch (e) { console.error(e); }
    finally { setSavingMethod(false); }
  };

  const handleSetDefault = async (methodId: string) => {
    const updated = payoutMethods.map(m => ({ ...m, isDefault: m.id === methodId }));
    setPayoutMethods(updated);
    await fetch("/api/freelancer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutMethods: updated }),
    });
  };

  const handleRemoveMethod = async (methodId: string) => {
    setRemovingId(methodId);
    const wasDefault = payoutMethods.find(m => m.id === methodId)?.isDefault;
    let updated = payoutMethods.filter(m => m.id !== methodId);
    if (wasDefault && updated.length > 0) {
      updated = updated.map((m, i) => ({ ...m, isDefault: i === 0 }));
    }
    setPayoutMethods(updated);
    try {
      await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutMethods: updated }),
      });
    } catch (e) { console.error(e); }
    finally { setRemovingId(null); }
  };

  const firstLetter = (userData?.name || user?.name || "J").trim().charAt(0).toUpperCase();

  const getDomainDisplayName = (domain?: string, field?: string) => {
    if (!domain) return field === "design" ? "Product Design" : "Software Engineering";
    const mapping: { [key: string]: string } = {
      frontend: "Frontend Development", backend: "Backend Development",
      fullstack: "Fullstack Development", mobile: "Mobile Development",
      devops: "DevOps Engineering", data_ai: "Data & AI Engineering",
      cms: "CMS Development", ui_ux: "UI/UX Design", graphic: "Graphic Design",
      branding: "Branding Design", motion: "Motion Design", product: "Product Design",
    };
    return mapping[domain.toLowerCase()] || domain.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const methodTypeLabel = (type: string) =>
    type === "upi_id" ? "UPI ID" : type === "upi_mobile" ? "PhonePe Mobile" : "Bank Transfer";

  const methodValue = (m: any) =>
    m.type === "upi_id" ? m.upiId : m.type === "upi_mobile" ? m.upiMobile : m.accountNumber;

  return (
    <main className="flex-1 overflow-y-auto bg-background min-h-screen font-sans flex flex-col justify-center py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 w-full">
        
        <header className="mb-10 pb-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-2">
              <User className="text-[#E85239] w-4 h-4" strokeWidth={2.5} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E85239]">Profile & Configuration</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Profile
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Manage your identity, view your verified skills directory, and control your active platform session.
            </p>
          </motion.div>
        </header>

        {loading ? (
          <div className="h-96 bg-white/50 backdrop-blur-xl border border-border/40 rounded-3xl animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#E85239] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-tertiary">Loading profile settings...</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6 max-w-[800px]"
          >
            {/* ── Main Profile Card ── */}
            <div className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85239]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="absolute top-8 right-8 z-20">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSaveChanges} disabled={saving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(232,82,57,0.15)] active:scale-[0.98] select-none">
                      {saving ? "Saving..." : "Save"} <Save size={13} />
                    </button>
                    <button onClick={() => { setNameInput(userData?.name || ""); setEmailInput(userData?.email || ""); setBioInput(profile?.bio || ""); setIsEditing(false); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary text-xs font-semibold uppercase tracking-wider rounded-xl transition-all select-none">
                      Cancel <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 border border-border text-text-primary hover:border-[#E85239]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow select-none">
                    Edit Profile <Edit3 size={13} className="text-[#E85239]" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                <div onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E85239] to-[#ff7d66] text-white flex items-center justify-center font-display font-semibold text-3xl shadow-[0_6px_20px_rgba(232,82,57,0.15)] ring-4 ring-[#FCE1DC]/20 shrink-0 cursor-pointer overflow-hidden relative group"
                  title="Upload profile photo">
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                </div>
                
                {isEditing ? (
                  <div className="space-y-3 w-full sm:max-w-xs relative z-10 pt-2 sm:pt-0">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Full Name</label>
                      <input 
                        type="text" 
                        value={nameInput} 
                        onChange={(e) => setNameInput(e.target.value)}
                        className={`w-full mt-1 px-4 py-2 bg-stone-50/50 border rounded-xl font-sans text-sm text-text-primary outline-none transition-colors focus:ring-1 focus:ring-[#E85239] ${
                          nameInput && validateName(nameInput) ? "border-red-500 focus:border-red-500" : "border-border focus:border-[#E85239]"
                        }`} 
                      />
                      {nameInput && validateName(nameInput) && (
                        <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{validateName(nameInput)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Email Address</label>
                      <input 
                        type="email" 
                        value={emailInput} 
                        onChange={(e) => setEmailInput(e.target.value)}
                        className={`w-full mt-1 px-4 py-2 bg-stone-50/50 border rounded-xl font-sans text-sm text-text-primary outline-none transition-colors focus:ring-1 focus:ring-[#E85239] ${
                          emailInput && validateEmail(emailInput) ? "border-red-500 focus:border-red-500" : "border-border focus:border-[#E85239]"
                        }`} 
                      />
                      {emailInput && validateEmail(emailInput) && (
                        <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{validateEmail(emailInput)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E85239] bg-[#FCE1DC]/30 border border-[#E85239]/20 px-2.5 py-0.5 rounded-full">
                        {getDomainDisplayName(profile?.domain, profile?.field)}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight font-semibold leading-none">
                      {userData?.name || user?.name || "Expert Freelancer"}
                    </h2>
                    <p className="font-sans text-sm text-text-secondary">{userData?.email || user?.email}</p>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-border/40 my-8" />

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold font-sans">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Professional Overview</p>
                {isEditing ? (
                  <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} rows={5}
                    placeholder="Write a brief professional overview showcasing your engineering domains, tools, and technical experience..."
                    className="w-full px-4 py-3 bg-stone-50/50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-2xl font-sans text-xs text-text-primary outline-none transition-colors resize-y leading-relaxed" />
                ) : (
                  <p className="font-sans text-[13px] text-text-secondary leading-relaxed bg-stone-50/50 border border-border/30 rounded-2xl p-5">
                    {profile?.bio || "No professional biography has been configured yet. Customize your onboarding workspace profile to add a premium technical summary showcasing your capabilities to platform clients."}
                  </p>
                )}
              </div>

              <div className="w-full h-px bg-border/40 my-8" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Verified Specializations</p>
                  <Link href="/freelancer/capability"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#E85239] hover:text-[#d44127] hover:bg-[#FCE1DC]/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none group">
                    Add Specialist Skill <ArrowRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(profile?.specializations && profile.specializations.length > 0
                    ? profile.specializations
                    : ["Software Engineering", "Systems Design", "Technical Writing"]
                  ).map((spec: string, i: number) => (
                    <span key={i} className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FCE1DC]/20 border border-[#E85239]/10 text-[#E85239] tracking-wide hover:bg-[#FCE1DC]/30 hover:border-[#E85239]/20 transition-all cursor-default shadow-sm">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="flex items-start gap-2.5 mt-4 text-[11px] text-text-secondary leading-relaxed font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] mt-1.5 shrink-0 animate-pulse" />
                  <p>
                    <strong className="text-text-primary font-semibold">Specializations lock:</strong> Verified specializations represent successfully evaluated capabilities. To expand your portfolio or verify new specialist tags, use the button above to request a capabilities assessment.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Payout Methods Card ── */}
            <div className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)] relative overflow-hidden">
              <div className="absolute top-8 right-8 z-20">
                <button
                  onClick={() => { setModalView("list"); setShowPaymentModal(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 border border-border text-text-primary hover:border-[#E85239]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow select-none"
                >
                  {payoutMethods.length > 0 ? "Manage" : "Configure"} <CreditCard size={13} className="text-[#E85239]" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">Payout Methods</p>
              </div>

              {payoutMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/50 rounded-2xl bg-stone-50/30">
                  <CreditCard size={30} className="text-text-tertiary/30 mb-3" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-text-secondary mb-1">No payout method configured</p>
                  <p className="text-[11px] text-text-tertiary">Add a bank account or UPI to receive milestone escrow payouts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutMethods.map((method: any) => (
                    <div key={method.id}
                      className={`rounded-2xl p-4 border flex items-center justify-between gap-4 ${method.isDefault ? "border-[#E85239]/25 bg-[#FCE1DC]/10" : "border-border/30 bg-stone-50/40"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${method.isDefault ? "bg-[#E85239]" : "bg-stone-100 border border-stone-200"}`}>
                          {method.isDefault
                            ? <CheckCircle2 size={14} className="text-white" />
                            : <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-[11px] font-bold uppercase tracking-wide ${method.isDefault ? "text-[#E85239]" : "text-text-secondary"}`}>
                              {methodTypeLabel(method.type)}
                            </p>
                            {method.isDefault && (
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-[#E85239] text-white px-1.5 py-0.5 rounded-full">Active Default</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-text-primary truncate font-mono">{methodValue(method)}</p>
                          <p className="text-[11px] text-text-tertiary">{method.accountHolderName}</p>
                          {method.type === "bank_transfer" && method.ifscCode && (
                            <p className="text-[10px] text-text-tertiary font-mono">IFSC: {method.ifscCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Account Security Card ── */}
            <div className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(232,82,57,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#E85239] w-4 h-4" strokeWidth={2.5} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Account Security</p>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
                  You are securely connected as an expert professional. To close this browser session and protect your active workspace details, proceed with sign-out.
                </p>
              </div>
              <button
                onClick={() => { fetch("/api/auth/signout", { method: "POST" }).then(() => window.location.href = "/"); }}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(232,82,57,0.15)] active:scale-[0.98] select-none text-center">
                Sign Out of Session <LogOut size={13} strokeWidth={2.5} className="text-white" />
              </button>
            </div>

          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          PAYOUT METHODS MODAL (3 views)
          ══════════════════════════════════════════════ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-border"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200/50 flex justify-between items-center bg-stone-50/50 font-sans">
              <div className="flex items-center gap-2">
                {modalView !== "list" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalView === "configure") setModalView("select-type");
                      else setModalView("list");
                      setAddErrors({});
                    }}
                    className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors mr-0.5"
                  >
                    <ArrowRight size={12} className="rotate-180" />
                  </button>
                )}
                <CreditCard className="text-[#E85239]" size={17} strokeWidth={2.5} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  {modalView === "list" ? "Payout Methods" :
                   modalView === "select-type" ? "Choose Method Type" : "Add Payout Method"}
                </h2>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setAddErrors({}); setModalView("list"); }}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 font-sans">

              {/* ── VIEW 1: Methods List ── */}
              {modalView === "list" && (
                <>
                  {payoutMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CreditCard size={30} className="text-stone-300 mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-semibold text-stone-700 mb-1">No payout methods yet</p>
                      <p className="text-[11px] text-stone-400">Add a method to receive milestone escrow payouts via PhonePe.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {payoutMethods.map((method: any) => (
                        <div key={method.id}
                          className={`rounded-xl border p-3.5 ${method.isDefault ? "border-[#E85239]/25 bg-[#FCE1DC]/10" : "border-stone-200 bg-white"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${method.isDefault ? "bg-[#E85239]" : "bg-stone-100 border border-stone-200"}`}>
                                {method.isDefault
                                  ? <CheckCircle2 size={13} className="text-white" />
                                  : <div className="w-2 h-2 rounded-full bg-stone-300" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">{methodTypeLabel(method.type)}</p>
                                  {method.isDefault && (
                                    <span className="text-[9px] font-bold bg-[#E85239] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Active Default</span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-stone-900 truncate font-mono">{methodValue(method)}</p>
                                <p className="text-[10px] text-stone-500 mt-0.5">{method.accountHolderName}</p>
                                {method.type === "bank_transfer" && method.ifscCode && (
                                  <p className="text-[10px] text-stone-400 font-mono">IFSC: {method.ifscCode}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0">
                              {!method.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(method.id)}
                                  className="text-[10px] font-bold text-[#E85239] hover:text-[#d44127] bg-[#FCE1DC]/20 hover:bg-[#FCE1DC]/40 border border-[#E85239]/20 hover:border-[#E85239]/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMethod(method.id)}
                                disabled={removingId === method.id}
                                className="text-[10px] font-bold text-stone-400 hover:text-red-500 bg-stone-50 hover:bg-red-50 border border-stone-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap disabled:opacity-50 flex items-center gap-1 justify-center"
                              >
                                <Trash2 size={9} />
                                {removingId === method.id ? "..." : "Remove"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setModalView("select-type")}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-[#E85239]/30 hover:bg-[#FCE1DC]/5 text-stone-500 hover:text-[#E85239] transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    <Plus size={14} /> Add New Payout Method
                  </button>
                </>
              )}

              {/* ── VIEW 2: Select Method Type ── */}
              {modalView === "select-type" && (
                <>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Choose how you want to receive your milestone escrow payouts. You can add multiple methods and set one as the active default.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        id: "upi_id",
                        title: "UPI ID",
                        desc: "Any UPI address like username@ybl or name@okicici. Works with PhonePe, GPay, Paytm, and all UPI apps.",
                      },
                      {
                        id: "upi_mobile",
                        title: "PhonePe Mobile Number",
                        desc: "10-digit Indian mobile number actively registered and linked on PhonePe.",
                      },
                      {
                        id: "bank_transfer",
                        title: "Direct Bank Transfer",
                        desc: "Bank account number + IFSC code. Paid via IMPS/NEFT directly to your account. No CVV required.",
                      },
                    ].map((opt) => (
                      <button key={opt.id} type="button"
                        onClick={() => { setAddingType(opt.id); setModalView("configure"); setAddErrors({}); }}
                        className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-[#E85239]/30 hover:bg-stone-50/50 transition-all flex items-center justify-between gap-4 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#E85239] transition-colors">{opt.title}</p>
                          <p className="text-[11px] text-stone-500 mt-1 leading-normal">{opt.desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-stone-400 group-hover:text-[#E85239] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── VIEW 3: Configure Form with Validation ── */}
              {modalView === "configure" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase bg-stone-100 px-2.5 py-1 rounded-full">
                      {addingType === "upi_id" ? "UPI ID" : addingType === "upi_mobile" ? "PhonePe Mobile Number" : "Direct Bank Transfer"}
                    </span>
                    {payoutMethods.length === 0 && (
                      <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Will be set as default</span>
                    )}
                  </div>

                  {/* Account Holder Name — always shown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Account Holder / Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      value={addForm.accountHolderName}
                      onChange={(e) => {
                        setAddForm(f => ({ ...f, accountHolderName: e.target.value }));
                        if (addErrors.accountHolderName) setAddErrors(prev => ({ ...prev, accountHolderName: validateHolderName(e.target.value) }));
                      }}
                      onBlur={(e) => setAddErrors(prev => ({ ...prev, accountHolderName: validateHolderName(e.target.value) }))}
                      placeholder="e.g. John Doe"
                      className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl font-sans text-xs text-stone-800 outline-none transition-colors ${
                        addErrors.accountHolderName
                          ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
                          : "border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]/20"
                      }`}
                    />
                    {addErrors.accountHolderName ? (
                      <p className="text-[10px] text-red-500 flex items-center gap-1">
                        <AlertTriangle size={10} />{addErrors.accountHolderName}
                      </p>
                    ) : (
                      <p className="text-[10px] text-stone-400">Letters, spaces, and dots only (e.g. John Doe, R.K. Sharma)</p>
                    )}
                  </div>

                  {/* UPI ID */}
                  {addingType === "upi_id" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        UPI Virtual Payment Address (VPA) *
                      </label>
                      <input
                        type="text"
                        value={addForm.upiId}
                        onChange={(e) => {
                          setAddForm(f => ({ ...f, upiId: e.target.value }));
                          if (addErrors.upiId) setAddErrors(prev => ({ ...prev, upiId: validateUpiId(e.target.value) }));
                        }}
                        onBlur={(e) => setAddErrors(prev => ({ ...prev, upiId: validateUpiId(e.target.value) }))}
                        placeholder="e.g. username@ybl  or  name@okicici"
                        className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl font-sans text-xs text-stone-800 outline-none transition-colors ${
                          addErrors.upiId
                            ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
                            : "border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]/20"
                        }`}
                      />
                      {addErrors.upiId ? (
                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} />{addErrors.upiId}
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-400">Must contain @ followed by a provider (ybl, okicici, okaxis, oksbi, paytm...)</p>
                      )}
                    </div>
                  )}

                  {/* PhonePe Mobile */}
                  {addingType === "upi_mobile" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        PhonePe Registered Mobile Number *
                      </label>
                      <input
                        type="text"
                        value={addForm.upiMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setAddForm(f => ({ ...f, upiMobile: val }));
                          if (addErrors.upiMobile) setAddErrors(prev => ({ ...prev, upiMobile: validateMobile(val) }));
                        }}
                        onBlur={(e) => setAddErrors(prev => ({ ...prev, upiMobile: validateMobile(e.target.value) }))}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl font-sans text-xs text-stone-800 outline-none transition-colors ${
                          addErrors.upiMobile
                            ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
                            : "border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]/20"
                        }`}
                      />
                      {addErrors.upiMobile ? (
                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} />{addErrors.upiMobile}
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-400">Exactly 10 digits. Must start with 6, 7, 8, or 9. Must be an active PhonePe number.</p>
                      )}
                    </div>
                  )}

                  {/* Bank Transfer Fields */}
                  {addingType === "bank_transfer" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          Bank Account Number *
                        </label>
                        <input
                          type="text"
                          value={addForm.accountNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 18);
                            setAddForm(f => ({ ...f, accountNumber: val }));
                            if (addErrors.accountNumber) setAddErrors(prev => ({ ...prev, accountNumber: validateAccountNumber(val) }));
                          }}
                          onBlur={(e) => setAddErrors(prev => ({ ...prev, accountNumber: validateAccountNumber(e.target.value) }))}
                          placeholder="e.g. 50100239485612"
                          className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl font-sans text-xs text-stone-800 outline-none transition-colors font-mono ${
                            addErrors.accountNumber
                              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
                              : "border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]/20"
                          }`}
                        />
                        {addErrors.accountNumber ? (
                          <p className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertTriangle size={10} />{addErrors.accountNumber}
                          </p>
                        ) : (
                          <p className="text-[10px] text-stone-400">9–18 digits only. No CVV needed — CVV is for cards only, not bank transfers.</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          value={addForm.ifscCode}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
                            setAddForm(f => ({ ...f, ifscCode: val }));
                            if (addErrors.ifscCode) setAddErrors(prev => ({ ...prev, ifscCode: validateIfsc(val) }));
                          }}
                          onBlur={(e) => setAddErrors(prev => ({ ...prev, ifscCode: validateIfsc(e.target.value) }))}
                          placeholder="e.g. HDFC0001234"
                          maxLength={11}
                          className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl font-sans text-xs text-stone-800 outline-none transition-colors font-mono uppercase ${
                            addErrors.ifscCode
                              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100"
                              : "border-stone-200 focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239]/20"
                          }`}
                        />
                        {addErrors.ifscCode ? (
                          <p className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertTriangle size={10} />{addErrors.ifscCode}
                          </p>
                        ) : (
                          <p className="text-[10px] text-stone-400">11 characters: 4 bank letters + 0 + 6 branch alphanumeric (e.g. HDFC0001234, SBIN0012345)</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200/50 bg-stone-50/50 flex justify-between items-center gap-3 shrink-0 font-sans">
              <button type="button"
                onClick={() => { setShowPaymentModal(false); setAddErrors({}); setModalView("list"); }}
                className="px-4 py-2 bg-white border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-50 transition-colors select-none">
                {modalView === "list" ? "Close" : "Cancel"}
              </button>
              {modalView === "configure" && (
                <button type="button" onClick={handleAddMethod} disabled={savingMethod}
                  className="px-5 py-2 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 select-none">
                  {savingMethod ? "Saving..." : "Save Method"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
