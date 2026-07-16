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

      {/* Navbar */}
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
          <p className="text-stone-500 font-medium">Effective Date: July 16, 2026 &nbsp;·&nbsp; Last Updated: July 16, 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-stone-100"
        >
          <div className="prose prose-stone max-w-none text-stone-600 prose-headings:text-stone-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-[1.7] prose-li:leading-[1.7]">

            <p className="lead text-lg font-medium text-stone-700">
              Welcome to Executa. These Terms of Service (&quot;Terms&quot;) govern your use of the Executa platform, operated by <strong>DevelopmentRoute4U</strong> (&quot;Executa&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By creating an account or using our services, you agree to be bound by these Terms.
            </p>

            <h2>1. About Executa</h2>
            <p>
              Executa is an AI-powered freelance marketplace that connects Clients (businesses and individuals seeking services) with verified independent Experts (freelancers). Executa provides the infrastructure for AI-generated project scoping, intelligent Expert matching, milestone-based project management, secure payment escrow via PhonePe, and an execution workspace.
            </p>
            <p>
              <strong>Operated by:</strong> DevelopmentRoute4U<br />
              <strong>Platform URL:</strong> <a href="https://executa-sigma.vercel.app" className="text-[#E85239] font-medium hover:underline">executa-sigma.vercel.app</a><br />
              <strong>Registered Address:</strong> Ahmedabad, Gujarat — 380001, India<br />
              <strong>Contact:</strong> <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a>
            </p>

            <h2>2. Eligibility &amp; User Accounts</h2>
            <ul>
              <li>You must be at least 18 years of age to use Executa.</li>
              <li>You must provide accurate, current, and complete information at registration.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account at <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a>.</li>
              <li>Executa reserves the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>

            <h2>3. Platform Services &amp; Pricing</h2>
            <p>Executa offers the following services:</p>
            <ul>
              <li><strong>Project Scoping (AI-Powered):</strong> Multi-step AI assessment that generates a complete scope document including functional units, effort scores, and milestone breakdowns.</li>
              <li><strong>Expert Matching:</strong> Algorithm-based matching of Clients with verified Experts based on skill tags, experience, and project requirements.</li>
              <li><strong>Execution Workspace:</strong> A dedicated project room with milestone tracking, file sharing, messaging, and delivery management.</li>
              <li><strong>Secure Escrow:</strong> Milestone payments are held securely and released only upon Client approval.</li>
            </ul>
            <p><strong>Platform Fees (charged to Clients):</strong></p>
            <ul>
              <li><strong>Scope Fee:</strong> A one-time fee for AI-powered scope generation (amount shown at time of payment).</li>
              <li><strong>Accountability Fee:</strong> A flat fee for platform oversight, dispute resolution coverage, and delivery accountability.</li>
              <li><strong>Execution Fee:</strong> 5% of the project&apos;s Expert cost for platform operations, escrow management, and workspace infrastructure.</li>
              <li><strong>Scope Upgrade Fee:</strong> 5% of the new unit&apos;s price when a Client adds a new functional unit to an in-progress project.</li>
            </ul>
            <p>All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</p>

            <h2>4. Payments, Escrow &amp; PhonePe</h2>
            <ul>
              <li><strong>Payment Gateway:</strong> All payments on Executa are processed via <strong>PhonePe Payment Gateway</strong> (PhonePe Private Limited). By making a payment, you also agree to <a href="https://www.phonepe.com/terms-conditions/" className="text-[#E85239] font-medium hover:underline" target="_blank" rel="noopener noreferrer">PhonePe&apos;s Terms &amp; Conditions</a>.</li>
              <li><strong>Milestone Funding:</strong> Clients must pay the milestone amount before an Expert begins work on that milestone. Funds are held in escrow until the Client approves the deliverables.</li>
              <li><strong>Release of Funds:</strong> Escrowed funds are released to the Expert upon the Client&apos;s explicit approval of submitted work.</li>
              <li><strong>Auto-release:</strong> If a Client does not approve or raise a dispute within <strong>14 days</strong> of milestone submission, funds are automatically released to the Expert.</li>
              <li><strong>Accepted Payment Methods:</strong> UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), and Net Banking — all via PhonePe.</li>
            </ul>

            <h2>5. Refunds &amp; Cancellations</h2>
            <p>
              Our complete refund and cancellation terms are detailed in our{" "}
              <Link href="/refund" className="text-[#E85239] font-medium hover:underline">Refund &amp; Cancellation Policy</Link>.
              In summary:
            </p>
            <ul>
              <li>Platform fees are non-refundable after Expert matching, except in cases of platform error.</li>
              <li>Milestone payments in escrow may be refunded via the dispute resolution process if deliverables are not met.</li>
              <li>Released milestone payments are final and non-reversible.</li>
              <li>Failed transactions will be auto-reversed by PhonePe within 5 business days.</li>
            </ul>

            <h2>6. Freelancer–Client Relationship</h2>
            <p>
              Executa is not a party to the contract between the Client and the Expert. Experts are independent contractors, not employees of Executa. Executa does not supervise, direct, or control the Expert&apos;s work beyond what is defined in the project scope document.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All intellectual property rights in the final delivered work transfer to the Client <strong>only upon full release of all milestone payments from escrow</strong>. Until payment is fully released, the Expert retains ownership of the work product. The AI-generated scope documents are owned by Executa and licensed to the Client for use on their specific project.
            </p>

            <h2>8. Prohibited Conduct</h2>
            <p>Users may not use Executa to:</p>
            <ul>
              <li>Circumvent the platform&apos;s payment system to conduct transactions outside Executa.</li>
              <li>Post fraudulent, misleading, or illegal project requirements.</li>
              <li>Harass, threaten, abuse, or harm other users.</li>
              <li>Attempt to compromise the security, integrity, or availability of the platform.</li>
              <li>Use the platform for money laundering, fraud, or any illegal activity.</li>
              <li>Upload malicious code, viruses, or harmful software.</li>
              <li>Misrepresent your identity, qualifications, or portfolio.</li>
            </ul>

            <h2>9. Dispute Resolution</h2>
            <p>
              If a Client and Expert have a disagreement regarding deliverables or milestone payment:
            </p>
            <ol>
              <li>Either party may raise a dispute within the platform workspace within <strong>14 days</strong> of milestone submission.</li>
              <li>Both parties must submit evidence (messages, files, scope agreement).</li>
              <li>Executa&apos;s mediation team will review within <strong>5–7 business days</strong> and issue a binding decision on fund release or refund.</li>
              <li>Executa&apos;s decision is final for platform-related disputes. Legal disputes are subject to Clause 12.</li>
            </ol>

            <h2>10. Platform Availability &amp; Modifications</h2>
            <p>
              Executa strives for 99% uptime but does not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any feature of the platform with reasonable notice. We are not liable for losses resulting from platform downtime.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable Indian law, Executa shall not be liable for:
            </p>
            <ul>
              <li>Indirect, incidental, punitive, or consequential damages arising from your use of the platform.</li>
              <li>The failure of a Client or Expert to fulfil their obligations under their agreement.</li>
              <li>Losses resulting from unauthorized access to your account due to your failure to safeguard credentials.</li>
              <li>Delays or failures in payment processing caused by third-party payment providers (PhonePe, banks).</li>
            </ul>
            <p>
              Our maximum liability to you for any claim arising from these Terms shall not exceed the amount of platform fees paid by you in the 3 months preceding the claim.
            </p>

            <h2>12. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, the Indian Contract Act, 1872, and applicable RBI regulations. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in <strong>Ahmedabad, Gujarat, India</strong>.
            </p>

            <h2>13. Grievance Officer</h2>
            <p>
              In accordance with the Information Technology Act, 2000, the following is the designated Grievance Officer for Executa:
            </p>
            <p>
              <strong>Grievance Officer:</strong> Jay Thaker<br />
              <strong>Email:</strong> <a href="mailto:grievance@executa.in" className="text-[#E85239] font-medium hover:underline">grievance@executa.in</a><br />
              <strong>Address:</strong> Executa (DevelopmentRoute4U), Ahmedabad, Gujarat — 380001, India<br />
              <strong>Response Time:</strong> Within 30 days of receipt of complaint.
            </p>

            <h2>14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be notified via email or a platform announcement at least 7 days before taking effect. Continued use of Executa after the effective date constitutes acceptance of the revised Terms.
            </p>

            <hr className="my-10 border-stone-200" />
            <p className="text-sm text-stone-500">
              If you have questions about these Terms, contact us at{" "}
              <a href="mailto:legal@executa.in" className="text-[#E85239] font-medium hover:underline">legal@executa.in</a>. Also read our{" "}
              <Link href="/privacy" className="text-[#E85239] font-medium hover:underline">Privacy Policy</Link> and{" "}
              <Link href="/refund" className="text-[#E85239] font-medium hover:underline">Refund &amp; Cancellation Policy</Link>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
