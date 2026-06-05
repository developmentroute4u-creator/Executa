"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF7F5] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#E85239]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#E85239]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl w-full">

        {/* Executa Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 w-48 md:w-56"
        >
          <svg viewBox="0 0 160 40" className="w-full h-auto drop-shadow-sm overflow-visible">
            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-sans font-black text-stone-900" style={{ fontSize: "32px", letterSpacing: "-0.05em" }}>
              EXECUTA<tspan fill="#E85239">.</tspan>
            </text>
          </svg>
        </motion.div>

        {/* 404 Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-12"
        >
          <h1 className="text-[120px] md:text-[180px] font-black text-stone-900 leading-none tracking-tighter select-none relative z-10">
            4<span className="text-[#E85239]">0</span>4
          </h1>
          {/* Subtle reflection/shadow for the 404 */}
          <h1 className="absolute top-4 left-0 right-0 text-[120px] md:text-[180px] font-black text-[#E85239]/10 leading-none tracking-tighter select-none z-0 blur-xl">
            404
          </h1>
        </motion.div>

        {/* Text & Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-4">
            Page completely <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85239] to-[#FF5B3A]">out of scope.</span>
          </h2>

          <p className="text-stone-600 text-[15px] md:text-[16px] leading-relaxed mb-10 max-w-md mx-auto">
            The URL you entered doesn't exist, has been moved, or is outside your current access level. Let's get you back on track.
          </p>

          <Link href="/">
            <button className="group inline-flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-[#E85239] text-white font-bold text-[14px] px-8 py-4 rounded-full shadow-[0_8px_24px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-6px_rgba(232,82,57,0.4)] transition-all duration-300 hover:-translate-y-1">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Platform
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
