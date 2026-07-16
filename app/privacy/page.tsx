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
            <Lock size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Privacy Policy
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
              Executa (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by <strong>DevelopmentRoute4U</strong>, based in Ahmedabad, Gujarat, India. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use the Executa platform at <a href="https://executa-sigma.vercel.app" className="text-[#E85239] font-medium hover:underline">executa-sigma.vercel.app</a>.
            </p>

            <h2>1. Who We Are</h2>
            <p>
              Executa is an AI-powered freelance project management platform that connects Clients (businesses and individuals) with verified independent Experts (freelancers) for scoped, milestone-based projects. All payments are processed via <strong>PhonePe Payment Gateway</strong> (PhonePe Private Limited).
            </p>
            <p>
              <strong>Business Name:</strong> DevelopmentRoute4U (operating as Executa)<br />
              <strong>Registered Address:</strong> Ahmedabad, Gujarat — 380001, India<br />
              <strong>Contact Email:</strong> <a href="mailto:privacy@executa.in" className="text-[#E85239] font-medium hover:underline">privacy@executa.in</a><br />
              <strong>Support:</strong> <a href="mailto:support@executa.in" className="text-[#E85239] font-medium hover:underline">support@executa.in</a>
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, profile picture, and professional details (skills, experience, portfolio).</li>
              <li><strong>Identity Verification:</strong> For Experts, we may collect government ID or professional verification documents.</li>
              <li><strong>Payment &amp; Financial Information:</strong> UPI ID, bank account number, IFSC code, and card details (processed and stored securely by PhonePe — we do not store raw card data). Platform fee and milestone transaction records are stored on our servers.</li>
              <li><strong>Project Data:</strong> Project descriptions, scope documents, messages, uploaded files, deliverables, milestone status, and AI-generated scope content.</li>
              <li><strong>Usage Data:</strong> Device type, browser, IP address, pages visited, session duration, and interaction patterns, collected via standard web server logs and analytics.</li>
              <li><strong>Cookies &amp; Tracking:</strong> We use essential session cookies for authentication and optional analytics cookies to understand platform usage. You may disable non-essential cookies via your browser settings.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Create and manage your account and authenticate your sessions.</li>
              <li>Match Clients with suitable verified Experts based on project requirements.</li>
              <li>Process payments, manage escrow funds, and generate transaction records via PhonePe Payment Gateway.</li>
              <li>Generate AI-powered project scopes, effort estimates, and functional unit breakdowns.</li>
              <li>Facilitate communication between Clients and Experts within the platform workspace.</li>
              <li>Investigate disputes and mediate between Clients and Experts in the event of disagreements.</li>
              <li>Send transactional notifications (payment confirmations, milestone approvals, project updates).</li>
              <li>Comply with applicable Indian laws, RBI digital payment regulations, and legal obligations.</li>
            </ul>

            <h2>4. Payment Processing via PhonePe</h2>
            <p>
              Executa uses <strong>PhonePe Payment Gateway</strong> (operated by PhonePe Private Limited, Bengaluru) for all payment processing. When you make a payment on Executa:
            </p>
            <ul>
              <li>You are redirected to PhonePe&apos;s secure hosted checkout page.</li>
              <li>PhonePe collects and processes your payment details (UPI, card, net banking). We do not receive or store your raw card or UPI PIN.</li>
              <li>PhonePe may store your payment instrument details for faster future payments, subject to their own <a href="https://www.phonepe.com/privacy-policy/" className="text-[#E85239] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
              <li>We receive a transaction ID and payment confirmation from PhonePe to update your project status.</li>
            </ul>

            <h2>5. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We share your data only in the following circumstances:</p>
            <ul>
              <li><strong>Between Users:</strong> Your name, profile, and project-related communications are shared with the other party (Client or Expert) on a project to facilitate work.</li>
              <li><strong>PhonePe (Payment Processor):</strong> Transaction metadata is shared with PhonePe for payment processing. This is governed by PhonePe&apos;s Privacy Policy.</li>
              <li><strong>Service Providers:</strong> We use MongoDB Atlas (database hosting), Vercel (web hosting), and OpenRouter/Google Gemini (AI services). These partners process data under strict confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> We may disclose information if required by Indian law, a court order, or in response to a valid request by government authorities.</li>
              <li><strong>Business Transfer:</strong> In the event of a merger or acquisition, user data may be transferred. We will notify users in advance.</li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide our services. Specifically:
            </p>
            <ul>
              <li><strong>Account data:</strong> Retained until you delete your account or request deletion.</li>
              <li><strong>Transaction &amp; payment records:</strong> Retained for 7 years in compliance with Indian financial regulations and tax laws.</li>
              <li><strong>Project data (messages, files):</strong> Retained for 3 years after project completion, then archived or deleted.</li>
              <li><strong>Log data:</strong> Retained for up to 90 days.</li>
            </ul>

            <h2>7. Data Security</h2>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul>
              <li>HTTPS (TLS 1.2+) encryption on all pages and API endpoints.</li>
              <li>Secure authentication via NextAuth.js with hashed passwords.</li>
              <li>Payments handled by PhonePe&apos;s PCI-DSS compliant infrastructure — we do not store card numbers.</li>
              <li>Access controls that limit employee access to personal data on a need-to-know basis.</li>
            </ul>
            <p>
              No internet transmission is 100% secure. While we do our best to protect your data, we cannot guarantee absolute security against all threats.
            </p>

            <h2>8. Your Privacy Rights</h2>
            <p>As a user, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention obligations).</li>
              <li><strong>Data Portability:</strong> Request your project and account data in a portable format.</li>
              <li><strong>Opt-out:</strong> Unsubscribe from promotional communications at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email <a href="mailto:privacy@executa.in" className="text-[#E85239] font-medium hover:underline">privacy@executa.in</a>. We will respond within 30 days.
            </p>

            <h2>9. Cookies Policy</h2>
            <p>We use the following cookies:</p>
            <ul>
              <li><strong>Session cookies (Essential):</strong> Required for login and authenticated navigation. Cannot be disabled without affecting platform functionality.</li>
              <li><strong>Analytics cookies (Optional):</strong> Used to understand how users interact with our platform. You can disable these in your browser settings.</li>
            </ul>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Executa is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a child under 18 has provided us with personal information, we will delete it immediately.
            </p>

            <h2>11. Grievance Officer (Data Protection)</h2>
            <p>
              In accordance with the Information Technology Act, 2000 and applicable rules thereunder, if you have any grievances regarding the processing of your personal data, please contact our Grievance Officer:
            </p>
            <p>
              <strong>Grievance Officer:</strong> Jay Thaker<br />
              <strong>Designation:</strong> Data Protection &amp; Grievance Officer<br />
              <strong>Email:</strong> <a href="mailto:grievance@executa.in" className="text-[#E85239] font-medium hover:underline">grievance@executa.in</a><br />
              <strong>Address:</strong> Executa (DevelopmentRoute4U), Ahmedabad, Gujarat — 380001, India<br />
              <strong>Response Time:</strong> Within 30 days of receipt of complaint.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email and post a notice on the platform at least 7 days before the changes take effect. Continued use of the platform after changes constitutes acceptance of the revised policy.
            </p>

            <hr className="my-10 border-stone-200" />
            <p className="text-sm text-stone-500">
              For privacy-related questions, contact our Data Protection Officer at{" "}
              <a href="mailto:privacy@executa.in" className="text-[#E85239] font-medium hover:underline">privacy@executa.in</a>. View our{" "}
              <Link href="/refund" className="text-[#E85239] font-medium hover:underline">Refund &amp; Cancellation Policy</Link> and{" "}
              <Link href="/terms" className="text-[#E85239] font-medium hover:underline">Terms of Service</Link>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
