"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
            <Shield size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Terms of Service
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
              Welcome to Executa. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2>1. Platform Overview</h2>
            <p>
              Executa operates an online marketplace that connects businesses and individuals ("Clients") with verified independent professionals ("Freelancers"). We provide the infrastructure for project scoping, matching, communication, and secure payment processing via escrow.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              To use Executa, you must register for an account. You must provide accurate, current, and complete information during registration. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
            </p>

            <h2>3. Escrow and Payments</h2>
            <ul>
              <li><strong>Milestone Funding:</strong> Clients must deposit funds into Executa's secure escrow system before a Freelancer begins work on a milestone.</li>
              <li><strong>Release of Funds:</strong> Escrowed funds are released to the Freelancer upon the Client's approval of the submitted work. If a Client fails to review submitted work within 14 days, the funds may be automatically released to the Freelancer.</li>
              <li><strong>Service Fees:</strong> Executa charges a platform fee on transactions. Fee structures are communicated at the time of project creation and payment.</li>
            </ul>

            <h2>4. Freelancer-Client Relationship</h2>
            <p>
              Executa is not a party to the contract between the Client and the Freelancer. Freelancers are independent contractors, not employees of Executa or the Client. Executa does not supervise, direct, or control the Freelancer's work.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              Unless otherwise agreed upon in writing between the Client and Freelancer, all intellectual property rights in the final work product transfer to the Client entirely <strong>only upon full release of payment from escrow</strong>. Until payment is released, the Freelancer retains ownership of the work.
            </p>

            <h2>6. Prohibited Conduct</h2>
            <p>Users may not use Executa to:</p>
            <ul>
              <li>Circumvent the platform's payment system to pay for projects outside of Executa.</li>
              <li>Post fraudulent, misleading, or illegal project requirements.</li>
              <li>Harass, abuse, or harm other users.</li>
              <li>Attempt to compromise the security of the platform.</li>
            </ul>

            <h2>7. Dispute Resolution</h2>
            <p>
              In the event of a dispute over escrowed funds or project deliverables, Executa provides a mediation process. If the parties cannot resolve the dispute, Executa's arbitration team will review the communications and deliverables to make a binding decision regarding the release or refund of funds.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              Executa is provided "as is" without warranty of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, the failure of a user to perform their obligations, or any disputes between users.
            </p>

            <hr className="my-10 border-stone-200" />
            <p className="text-sm text-stone-500">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@executa.com" className="text-[#E85239] font-medium hover:underline">legal@executa.com</a>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
