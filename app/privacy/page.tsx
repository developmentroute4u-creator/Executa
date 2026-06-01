"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F6] flex flex-col relative overflow-hidden font-sans">
      {/* Glow blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E85239]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-300/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar Minimal */}
      <nav className="relative z-20 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter text-stone-900">
          EXECUTA<span className="text-[#E85239]">.</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-bold tracking-wide text-stone-500 hover:text-[#E85239] transition-colors bg-white/50 px-4 py-2 rounded-full border border-stone-200/50 backdrop-blur-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Content wrapper */}
      <main className="relative z-10 w-full max-w-[860px] mx-auto px-6 py-12 md:py-20 flex-1">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 mb-6 text-[#E85239]">
            <Lock size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-stone-500 font-medium">
            Effective Date: May 30, 2026
          </p>
        </motion.div>

        {/* Content Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-stone-100"
        >
          <div className="prose prose-stone max-w-none text-stone-600 prose-headings:text-stone-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-[1.7] prose-li:leading-[1.7]">
            <p className="lead text-lg font-medium text-stone-700">
              At Executa, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you use our platform, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, and professional profile details.</li>
              <li><strong>Payment Information:</strong> Bank account details, credit card numbers, and tax identification (processed securely via our third-party payment partners).</li>
              <li><strong>Project Data:</strong> Communications, files, deliverables, and scope definitions shared between Clients and Freelancers.</li>
              <li><strong>Usage Data:</strong> Device information, IP addresses, browser types, and interaction metrics on the platform.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide, maintain, and improve the Executa matching and escrow platform.</li>
              <li>Process transactions and send related information, including confirmations and invoices.</li>
              <li>Verify user identities and conduct background checks (when applicable) to maintain platform trust.</li>
              <li>Resolve disputes and mediate project disagreements.</li>
              <li>Send technical notices, updates, security alerts, and administrative messages.</li>
            </ul>

            <h2>3. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Between Users:</strong> Profile information and project communications are shared between Clients and Freelancers to facilitate work.</li>
              <li><strong>Service Providers:</strong> We share data with third-party vendors (e.g., payment processors, hosting services) who perform services on our behalf under strict confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to secure your personal data from unauthorized access, use, or disclosure. Escrow funds and payment details are handled securely via PCI-compliant infrastructure. However, no internet transmission is entirely secure, and we cannot guarantee absolute security.
            </p>

            <h2>5. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you.</li>
              <li>Request the correction of inaccurate data.</li>
              <li>Request the deletion of your account and personal data.</li>
              <li>Opt-out of promotional communications at any time.</li>
            </ul>

            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through a notice on the platform prior to the changes taking effect.
            </p>

            <hr className="my-10 border-stone-200" />
            <p className="text-sm text-stone-500">
              For privacy-related questions or data requests, please contact our Data Protection Officer at <a href="mailto:privacy@executa.com" className="text-[#E85239] font-medium hover:underline">privacy@executa.com</a>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
