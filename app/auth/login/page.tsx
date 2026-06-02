"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Role comes from ?role=freelancer|client (set by landing page buttons)
  const initialRole = searchParams.get("role") === "freelancer" ? "freelancer" : "client";
  // Mode: landing page buttons pass ?mode=signup to open sign-up by default
  const initialMode = searchParams.get("mode") === "signup";

  const [activeRole, setActiveRole] = useState<"client" | "freelancer">(initialRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Typewriter Effect State
  const words = ["clear goals.", "expert talent.", "safe payments.", "fast delivery."];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && currentText === word) {
      typingSpeed = 2500; // Pause at end of word
      setTimeout(() => setIsDeleting(true), typingSpeed);
      return;
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      typingSpeed = 500; // Pause before typing next word
    }

    const timeout = setTimeout(() => {
      setCurrentText((prev) => 
        isDeleting ? word.substring(0, prev.length - 1) : word.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    try {
      if (isSignUp) {

        // Register the user first
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${firstName} ${lastName}`.trim(),
            email,
            password,
            role: activeRole
          })
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          setIsSubmitting(false);
          // If email already exists, guide them to sign in instead
          if (registerRes.status === 409) {
            setAuthError("An account with this email already exists. Switch to Sign In to access your account.");
          } else {
            setAuthError(registerData.error || "Registration failed. Please try again.");
          }
          return;
        }
      }

      // Automatically sign in after registration OR if just signing in
      const res = await signIn("credentials", {
        email,
        password,
        role: activeRole,
        redirect: false,
      });

      if (res?.error) {
        setIsSubmitting(false);
        // Only show the role-mismatch guidance on the sign-in form, not after a failed registration
        if (!isSignUp) {
          setAuthError(
            activeRole === "client"
              ? "No client account found. Check your credentials, or sign up to create a new client account."
              : "No freelancer account found. Check your credentials, or sign up to create a new freelancer account."
          );
        } else {
          setAuthError("Account created but sign-in failed. Please try signing in manually.");
        }
        return;
      }

      // If successful, redirect to the correct dashboard based on selected role
      if (activeRole === "freelancer" && isSignUp) {
        router.push("/freelancer/onboarding");
      } else {
        router.push(activeRole === "client" ? "/client/dashboard" : "/freelancer/workspace");
      }
    } catch (err) {
      setIsSubmitting(false);
      setAuthError("An unexpected error occurred. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsFormLoading(true);
    // Clear errors when switching modes — sign-in and sign-up errors are independent
    setAuthError("");
    // Swap the layout while the full screen loader is covering the screen
    setTimeout(() => {
      setIsSignUp(!isSignUp);
    }, 400);
    // Remove the loader
    setTimeout(() => {
      setIsFormLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* FULL SCREEN LOADER */}
      <AnimatePresence>
        {isFormLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          >
            <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E85239] animate-spin" />
            </div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-black text-stone-900 tracking-tight mb-2"
            >
              {isSignUp ? "Loading Login Portal..." : "Preparing Registration..."}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-stone-500 font-medium"
            >
              Securing connection to Executa
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`h-screen w-full bg-white flex overflow-hidden font-sans ${isSignUp ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* GLOBAL NAVIGATION (Absolute so it doesn't move when layout flips) */}
        <nav className="absolute top-0 inset-x-0 w-full px-8 md:px-16 py-10 flex items-center justify-between z-50 pointer-events-none">
          <Link href="/" className="font-black text-2xl tracking-tighter text-stone-900 flex items-center gap-1 pointer-events-auto">
            EXECUTA<span className="text-[#E85239]">.</span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[13px] font-bold tracking-wide text-stone-400 hover:text-stone-900 transition-all pointer-events-auto bg-white/50 backdrop-blur-md px-4 py-2 rounded-full"
          >
            <ArrowLeft size={16} className="text-stone-400 group-hover:text-[#E85239] transition-colors" /> Back
          </Link>
        </nav>

        {/* FORM SECTION */}
        <div className="w-full lg:w-1/2 h-full flex flex-col relative bg-white z-20 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex-1 flex items-center justify-center px-8 md:px-16 pb-12 pt-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="w-full max-w-[440px] mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl md:text-[40px] font-black text-stone-900 tracking-tight mb-4 leading-tight">
                  {isSignUp ? "Create an account" : "Welcome back"}
                </h1>
                <p className="text-stone-500 font-medium text-[16px] mb-8 leading-relaxed">
                  {isSignUp 
                    ? `Join Executa as a ${activeRole === 'client' ? 'client to lock scopes' : 'freelancer to execute flawlessly'}.` 
                    : `Sign in to manage your ${activeRole === 'client' ? 'projects and escrow' : 'freelance profile'}.`
                  }
                </p>

                {/* Role Toggle */}
                <div className="flex bg-stone-50 p-1.5 rounded-2xl mb-8 border border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveRole("client")}
                    className={`flex-1 py-3.5 px-4 rounded-xl text-[14px] font-bold transition-all duration-300 ${activeRole === "client" ? "bg-white text-stone-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-stone-200/50" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    I'm a Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole("freelancer")}
                    className={`flex-1 py-3.5 px-4 rounded-xl text-[14px] font-bold transition-all duration-300 ${activeRole === "freelancer" ? "bg-white text-stone-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-stone-200/50" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    I'm a Freelancer
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 mb-2">
                          <AlertCircle size={18} className="shrink-0" />
                          <p className="text-[13px] font-bold tracking-wide">{authError}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2.5 relative group">
                        <label className="text-[12px] font-bold tracking-[0.05em] text-stone-400 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">First Name</label>
                        <input 
                          type="text" 
                          required 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John" 
                          className="w-full bg-stone-50 border border-stone-200 rounded-[1.25rem] px-5 py-4 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-300 font-medium text-stone-800" 
                        />
                      </div>
                      <div className="space-y-2.5 relative group">
                        <label className="text-[12px] font-bold tracking-[0.05em] text-stone-400 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Last Name</label>
                        <input 
                          type="text" 
                          required 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe" 
                          className="w-full bg-stone-50 border border-stone-200 rounded-[1.25rem] px-5 py-4 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-300 font-medium text-stone-800" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 relative group">
                    <label className="text-[12px] font-bold tracking-[0.05em] text-stone-400 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#E85239] transition-colors" size={20} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-[1.25rem] pl-14 pr-5 py-4 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-300 font-medium text-stone-800" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 relative group">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[12px] font-bold tracking-[0.05em] text-stone-400 uppercase transition-colors group-focus-within:text-[#E85239]">Password</label>
                      {!isSignUp && <a href="#" className="text-[12px] font-bold text-stone-400 hover:text-[#E85239] transition-colors">Forgot?</a>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#E85239] transition-colors" size={20} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-[1.25rem] pl-14 pr-5 py-4 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-300 font-medium text-stone-800" 
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group relative flex items-center justify-center gap-3 bg-stone-900 hover:bg-[#E85239] text-white font-black text-[15px] tracking-wide px-7 py-[18px] rounded-[1.25rem] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-6px_rgba(232,82,57,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 overflow-hidden"
                    >
                      <span className={`transition-all duration-300 ${isSubmitting ? "opacity-0" : "opacity-100"}`}>
                        {isSignUp ? "Create Account" : "Sign in to Dashboard"}
                      </span>
                      {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                      
                      {isSubmitting && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center pb-8">
                  <p className="text-[14px] text-stone-500 font-medium">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button 
                      type="button"
                      onClick={toggleMode}
                      className="text-stone-900 font-bold hover:text-[#E85239] transition-colors underline underline-offset-4"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* TYPOGRAPHY SECTION */}
        <div className="hidden lg:flex flex-1 relative bg-[#FFF7F6] items-center justify-center overflow-hidden z-10 pt-28 pb-12">
          {/* Subtle cinematic glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#E85239]/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-300/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none mix-blend-overlay"></div>
          
          <div className="relative z-10 w-full max-w-[500px] px-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[32px] lg:text-[40px] font-black text-stone-900 tracking-tight leading-[1.2] mb-6 min-h-[100px] flex flex-col justify-end">
                <span>We guarantee</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85239] to-orange-400 block mt-1">
                  {currentText}
                  <span className="text-[#E85239] animate-[pulse_1s_ease-in-out_infinite] ml-1 font-light">|</span>
                </span>
              </h2>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "3.5rem" }} 
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="h-1.5 bg-gradient-to-r from-[#E85239] to-orange-400 rounded-full mb-6" 
              />
              <p className="text-stone-500 text-[15px] font-medium leading-[1.8] max-w-[400px]">
                Join the platform that eliminates guesswork. Lock your scope, secure payments in escrow, and execute your vision with absolute certainty.
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#E85239]/20 border-t-[#E85239] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
