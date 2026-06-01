"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, MapPin, MessageSquare, Send, ChevronDown, Phone, Globe } from "lucide-react";

export default function ContactPage() {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Select a topic");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subjects = [
    "General Inquiry",
    "Escrow & Milestone Payments",
    "Freelancer Matching Help",
    "Enterprise Solutions",
    "Report an Issue"
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSubjectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF7F6] flex flex-col relative overflow-hidden font-sans selection:bg-[#E85239]/20">
      {/* Premium Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#E85239]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-300/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none mix-blend-overlay"></div>

      {/* Navbar Minimal */}
      <nav className="relative z-20 w-full px-8 py-6 md:px-16 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter text-stone-900 flex items-center gap-1">
          EXECUTA<span className="text-[#E85239]">.</span>
        </Link>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[13px] font-bold tracking-wide text-stone-500 hover:text-stone-900 transition-all bg-white/60 px-5 py-2.5 rounded-full border border-stone-200/60 backdrop-blur-md shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={16} className="text-stone-400 group-hover:text-[#E85239] transition-colors" /> Back
        </Link>
      </nav>

      {/* Content wrapper */}
      <main className="relative z-10 w-full max-w-[1240px] mx-auto px-8 md:px-16 py-12 md:py-24 flex-1 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center lg:items-start">
        
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 lg:pt-8 w-full"
        >
          <h1 className="text-5xl md:text-[64px] font-black text-stone-900 tracking-tight leading-[1.05] mb-6">
            How can we <br />
            <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#FF5B3A] pr-2">
              help you?
            </span>
          </h1>
          <p className="text-stone-500 font-medium leading-[1.8] max-w-[400px] mb-16 text-[16px]">
            We&apos;re here to ensure your projects run smoothly. Reach out to our team in Bengaluru for support with matching, escrow, or enterprise solutions.
          </p>

          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">Email Support</h3>
              <a href="mailto:support@executa.com" className="text-stone-900 font-semibold text-lg hover:text-[#E85239] transition-colors">
                support@executa.com
              </a>
            </div>

            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">Office Headquarters</h3>
              <p className="text-stone-900 font-semibold text-lg">
                Bengaluru, India
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">Phone Inquiries</h3>
              <p className="text-stone-900 font-semibold text-lg">
                +91 80 4123 5678
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form (Premium UI) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[580px]"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white relative">
            <h3 className="text-3xl font-black text-stone-900 mb-8 tracking-tight">Drop us a line</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 relative group">
                  <label className="text-[12px] font-bold tracking-[0.05em] text-stone-500 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">First Name</label>
                  <input type="text" placeholder="e.g. Rahul" className="w-full bg-stone-50/70 border border-stone-200/80 rounded-2xl px-5 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm" />
                </div>
                <div className="space-y-2 relative group">
                  <label className="text-[12px] font-bold tracking-[0.05em] text-stone-500 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Last Name</label>
                  <input type="text" placeholder="e.g. Sharma" className="w-full bg-stone-50/70 border border-stone-200/80 rounded-2xl px-5 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm" />
                </div>
              </div>

              <div className="space-y-2 relative group">
                <label className="text-[12px] font-bold tracking-[0.05em] text-stone-500 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Email Address</label>
                <input type="email" placeholder="rahul@company.com" className="w-full bg-stone-50/70 border border-stone-200/80 rounded-2xl px-5 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm" />
              </div>

              {/* Custom Select Dropdown */}
              <div className="space-y-2 relative group" ref={dropdownRef}>
                <label className="text-[12px] font-bold tracking-[0.05em] text-stone-500 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Subject</label>
                <div 
                  onClick={() => setSubjectOpen(!subjectOpen)}
                  className={`w-full bg-stone-50/70 border ${subjectOpen ? 'border-[#E85239] bg-white ring-4 ring-[#E85239]/10' : 'border-stone-200/80'} rounded-2xl px-5 py-3.5 text-[15px] font-medium ${selectedSubject === "Select a topic" ? "text-stone-400" : "text-stone-800"} cursor-pointer shadow-sm flex items-center justify-between transition-all`}
                >
                  {selectedSubject}
                  <ChevronDown size={18} className={`text-stone-400 transition-transform duration-300 ${subjectOpen ? "rotate-180 text-[#E85239]" : ""}`} />
                </div>
                
                <AnimatePresence>
                  {subjectOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden"
                    >
                      {subjects.map((sub, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setSelectedSubject(sub);
                            setSubjectOpen(false);
                          }}
                          className="px-5 py-3.5 hover:bg-stone-50 cursor-pointer text-[14px] font-medium text-stone-700 hover:text-[#E85239] transition-colors border-b border-stone-50 last:border-0"
                        >
                          {sub}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2 relative group">
                <label className="text-[12px] font-bold tracking-[0.05em] text-stone-500 uppercase ml-1 transition-colors group-focus-within:text-[#E85239]">Message</label>
                <textarea rows={5} placeholder="How can we help you execute your project?" className="w-full bg-stone-50/70 border border-stone-200/80 rounded-2xl px-5 py-4 text-[15px] outline-none focus:bg-white focus:border-[#E85239] focus:ring-4 focus:ring-[#E85239]/10 transition-all placeholder:text-stone-400 font-medium text-stone-800 resize-none shadow-sm"></textarea>
              </div>

              <div className="pt-2">
                <button className="w-full group inline-flex items-center justify-center gap-3 bg-[#E85239] text-white font-black text-[15px] tracking-wide px-7 py-4 rounded-2xl shadow-[0_8px_24px_-6px_rgba(232,82,57,0.5)] hover:shadow-[0_16px_32px_-6px_rgba(232,82,57,0.6)] transition-all duration-300 hover:-translate-y-1">
                  Send Message <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
