"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function RefundPage() {
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
            <RefreshCw size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Refund &amp; Cancellation Policy
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
              At Executa, we are committed to fair and transparent payment practices. This policy outlines our
              refund and cancellation terms for all payments made on our platform, including platform fees,
              milestone payments, and scope upgrade charges.
            </p>

            <h2>1. Types of Payments on Executa</h2>
            <p>Executa processes three categories of payments:</p>
            <ul>
              <li><strong>Platform Fees</strong> — One-time fees charged at project onboarding (Scope Fee + Accountability Fee + Execution Fee).</li>
              <li><strong>Milestone Payments</strong> — Payments made by Clients to release funds to the assigned Expert upon completion of a project milestone.</li>
              <li><strong>Scope Upgrade / Custom Unit Fees</strong> — Fees charged when a Client adds new functionality to an in-progress project (5% of unit price).</li>
            </ul>

            <h2>2. Platform Fee Refunds</h2>
            <p>Platform fees are charged to set up and manage the intelligent project scoping, expert matching, and accountability infrastructure. The following refund rules apply:</p>
            <ul>
              <li><strong>Before expert matching:</strong> If no expert has been matched or assigned to your project within 7 days of payment, you are eligible for a full refund of the platform fee. Contact us at <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a>.</li>
              <li><strong>After expert matching:</strong> Platform fees are non-refundable once an expert has been successfully matched and accepted the project, as significant platform resources have been deployed.</li>
              <li><strong>Technical errors:</strong> If your payment was processed but the platform failed to complete the transaction on our end, you will receive a full refund within 5–7 business days.</li>
            </ul>

            <h2>3. Milestone Payment Refunds</h2>
            <p>Milestone payments are held in a secure escrow system and released to the Expert only after Client approval. The following terms apply:</p>
            <ul>
              <li><strong>Before release (in escrow):</strong> If a milestone is disputed and the Expert fails to deliver the agreed scope, Executa's dispute team will review the case. If the dispute is upheld in the Client's favour, funds will be refunded to the Client within 7–10 business days.</li>
              <li><strong>After release:</strong> Once a Client has approved and released a milestone payment to the Expert, the transaction is final and cannot be reversed. Ensure you are satisfied with the deliverables before approving.</li>
              <li><strong>Auto-release:</strong> If a Client does not approve or dispute a submitted milestone within 14 days of submission, funds are automatically released to the Expert. No refund is available after auto-release.</li>
            </ul>

            <h2>4. Scope Upgrade Fee Refunds</h2>
            <p>The 5% platform fee charged for adding a new functional unit or scope upgrade is non-refundable once the payment has been successfully processed and the upgrade request has been sent to the Expert for approval.</p>
            <p>If the Expert rejects the scope upgrade after payment, the upgrade fee will be refunded within 5–7 business days, as the service was not rendered.</p>

            <h2>5. Cancellation Policy</h2>
            <ul>
              <li><strong>Cancel before matching:</strong> A Client may cancel a project at any time before an Expert is matched. The platform fee will be refunded as per Section 2 above.</li>
              <li><strong>Cancel after matching:</strong> If a project is cancelled after an Expert has been matched and has begun work, milestone funds already in escrow will be handled via the dispute resolution process. Platform fees are non-refundable at this stage.</li>
              <li><strong>Expert-initiated cancellation:</strong> If an Expert cancels after accepting a project, the Client will not be charged any further fees and any platform fees may be eligible for a partial refund at Executa's discretion.</li>
            </ul>

            <h2>6. Payment Gateway — Failed or Duplicate Payments</h2>
            <p>
              All payments on Executa are processed securely via <strong>PhonePe Payment Gateway</strong> (a service of PhonePe Private Limited). In the event of:
            </p>
            <ul>
              <li><strong>Failed transaction:</strong> If your bank account or card has been debited but the payment has not been confirmed on Executa, please wait up to 5 business days. The amount will be automatically reversed by your bank or PhonePe. If not received, contact us at <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a> with your transaction ID.</li>
              <li><strong>Duplicate payment:</strong> If you have been charged twice for the same transaction, contact us immediately with both transaction IDs. Duplicate charges will be refunded within 5–7 business days.</li>
            </ul>

            <h2>7. Refund Process &amp; Timelines</h2>
            <p>Approved refunds will be processed as follows:</p>
            <ul>
              <li><strong>Original payment method:</strong> Refunds are credited back to the same UPI ID, bank account, or card used for the original payment.</li>
              <li><strong>Timeline:</strong> 5–10 business days from the date of refund approval, depending on your bank or payment provider.</li>
              <li><strong>Notification:</strong> You will receive an email confirmation when the refund is initiated.</li>
            </ul>

            <h2>8. How to Request a Refund</h2>
            <p>To request a refund, please:</p>
            <ol>
              <li>Email us at <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a> with the subject line: <strong>Refund Request — [Your Project ID]</strong>.</li>
              <li>Include your registered email address, the PhonePe or Executa Transaction ID, and a brief description of the reason.</li>
              <li>Our team will respond within 2 business days and initiate the refund if eligible.</li>
            </ol>

            <h2>9. Grievance Redressal</h2>
            <p>
              If you are not satisfied with our refund decision, you may escalate the matter to our Grievance Officer:
            </p>
            <p>
              <strong>Grievance Officer:</strong> Jay Thaker<br />
              <strong>Email:</strong> <a href="mailto:grievance@executa.in" className="text-[#E85239] font-medium hover:underline">grievance@executa.in</a><br />
              <strong>Address:</strong> Executa (DevelopmentRoute4U), Ahmedabad, Gujarat — 380001, India<br />
              <strong>Response Time:</strong> Within 5 business days of receipt of complaint.
            </p>
            <p>
              We are committed to resolving all grievances fairly and promptly in accordance with applicable Indian laws and RBI guidelines for digital payments.
            </p>

            <hr className="my-10 border-stone-200" />
            <p className="text-sm text-stone-500">
              For refund inquiries, contact us at{" "}
              <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a>
              {" "}or call{" "}
              <a href="tel:+918000000000" className="text-[#E85239] font-medium hover:underline">+91 80000 00000</a>
              {" "}(Mon–Fri, 10am–6pm IST).
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
