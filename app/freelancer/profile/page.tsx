"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, LogOut, Sparkles, Camera, Edit3, Save, X, ArrowRight } from "lucide-react";

export default function ProfileEnvironment() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const user = session?.user as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = () => {
    fetch("/api/freelancer/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        const liveUser = d.user || (session?.user as any);
        setUserData(liveUser);

        // Prepopulate editing inputs
        setNameInput(liveUser?.name || "");
        setEmailInput(liveUser?.email || "");
        setBioInput(d.profile?.bio || "");
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
      
      // Update local state instantly for visual satisfaction
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
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          bio: bioInput,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile modifications");
      }

      fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  // Guarantee single-letter circular avatar logic
  const firstLetter = (userData?.name || user?.name || "J").trim().charAt(0).toUpperCase();

  const getDomainDisplayName = (domain?: string, field?: string) => {
    if (!domain) return field === "design" ? "Product Design" : "Software Engineering";
    
    const mapping: { [key: string]: string } = {
      frontend: "Frontend Development",
      backend: "Backend Development",
      fullstack: "Fullstack Development",
      mobile: "Mobile Development",
      devops: "DevOps Engineering",
      data_ai: "Data & AI Engineering",
      cms: "CMS Development",
      ui_ux: "UI/UX Design",
      graphic: "Graphic Design",
      branding: "Branding Design",
      motion: "Motion Design",
      product: "Product Design",
    };

    return mapping[domain.toLowerCase()] || domain.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen pl-24 font-sans">
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 pt-24 md:pt-32">
        
        {/* Sleek, Left-Aligned Header Matching Other Pages */}
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
            {/* Main Profile Details Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85239]/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Floating Editor Controls */}
              <div className="absolute top-8 right-8 z-20">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(232,82,57,0.15)] active:scale-[0.98] select-none"
                    >
                      {saving ? "Saving..." : "Save"} <Save size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setNameInput(userData?.name || "");
                        setEmailInput(userData?.email || "");
                        setBioInput(profile?.bio || "");
                        setIsEditing(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary text-xs font-semibold uppercase tracking-wider rounded-xl transition-all select-none"
                    >
                      Cancel <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 border border-border text-text-primary hover:border-[#E85239]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow select-none"
                  >
                    Edit Profile <Edit3 size={13} className="text-[#E85239]" />
                  </button>
                )}
              </div>

              {/* Profile Detail Header Block */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                
                {/* Interactive Profile Photo / Logo circular container */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E85239] to-[#ff7d66] text-white flex items-center justify-center font-display font-semibold text-3xl shadow-[0_6px_20px_rgba(232,82,57,0.15)] ring-4 ring-[#FCE1DC]/20 shrink-0 cursor-pointer overflow-hidden relative group"
                  title="Upload profile photo"
                >
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                
                {isEditing ? (
                  <div className="space-y-3 w-full sm:max-w-xs relative z-10 pt-2 sm:pt-0">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Full Name</label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full mt-1 px-4 py-2 bg-stone-50/50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-xl font-sans text-sm text-text-primary outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Email Address</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full mt-1 px-4 py-2 bg-stone-50/50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-xl font-sans text-sm text-text-primary outline-none transition-colors"
                      />
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

              {/* 1. Professional Biography / Profile Overview (Positioned Up First) */}
              <div className="space-y-3 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Professional Overview</p>
                
                {isEditing ? (
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={5}
                    placeholder="Write a brief professional overview showcasing your engineering domains, tools, and technical experience..."
                    className="w-full px-4 py-3 bg-stone-50/50 border border-border focus:border-[#E85239] focus:ring-1 focus:ring-[#E85239] rounded-2xl font-sans text-xs text-text-primary outline-none transition-colors resize-y leading-relaxed"
                  />
                ) : (
                  <p className="font-sans text-[13px] text-text-secondary leading-relaxed bg-stone-50/50 border border-border/30 rounded-2xl p-5">
                    {profile?.bio || "No professional biography has been configured yet. Customize your onboarding workspace profile to add a premium technical summary showcasing your capabilities to platform clients."}
                  </p>
                )}
              </div>

              <div className="w-full h-px bg-border/40 my-8" />

              {/* 2. Verified Specializations Tag Directory (Positioned Second) */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Verified Specializations</p>
                  
                  <Link 
                    href="/freelancer/capability"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#E85239] hover:text-[#d44127] hover:bg-[#FCE1DC]/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none group"
                  >
                    Add Specialist Skill <ArrowRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {(profile?.specializations && profile.specializations.length > 0
                    ? profile.specializations
                    : ["Software Engineering", "Systems Design", "Technical Writing"]
                  ).map((spec: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FCE1DC]/20 border border-[#E85239]/10 text-[#E85239] tracking-wide hover:bg-[#FCE1DC]/30 hover:border-[#E85239]/20 transition-all cursor-default shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Simplified Vetting Alert Warning Note (No solid background highlight) */}
                <div className="flex items-start gap-2.5 mt-4 text-[11px] text-text-secondary leading-relaxed font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E85239] mt-1.5 shrink-0 animate-pulse" />
                  <p>
                    <strong className="text-text-primary font-semibold">Specializations lock:</strong> Verified specializations represent successfully evaluated capabilities. To expand your portfolio or verify new specialist tags, use the button above to request a capabilities assessment.
                  </p>
                </div>
              </div>

            </div>

            {/* Account Security Card (Positioned Cleanly in Single-Column Flow) */}
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
                onClick={() => {
                  fetch("/api/auth/signout", { method: "POST" })
                    .then(() => window.location.href = "/");
                }}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#E85239] hover:bg-[#d44127] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(232,82,57,0.15)] active:scale-[0.98] select-none text-center"
              >
                Sign Out of Session <LogOut size={13} strokeWidth={2.5} className="text-white" />
              </button>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
