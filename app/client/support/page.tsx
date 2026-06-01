"use client";
import { motion } from "framer-motion";
import { MessageSquare, Mail, BookOpen, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How does the escrow payment system work?",
    a: "When you fund a project, your payment is securely held in escrow by Executa. Funds are only released to the freelancer once you approve each milestone. This protects you as the client at every stage of the project."
  },
  {
    q: "How do I review and approve my project scope?",
    a: "Once our AI generates your project scope, you'll receive a notification to review it. Navigate to your project and open the 'Scope' tab. You can approve, request changes, or reject items directly from that page."
  },
  {
    q: "What are the platform fees?",
    a: "Executa charges a transparent total of 10% on the project value, broken down as: Support Fee (5%), Continuity Fee (3%), and Execution Fee (2%). There are no hidden charges."
  },
  {
    q: "How do I invite team members to my organization?",
    a: "Go to the Organization page using the building icon in the left rail. Click '+ Invite Member', enter the email address, assign a role (Admin, Member, or Viewer), and send the invite."
  },
  {
    q: "Can I cancel a project after it has started?",
    a: "Projects can be cancelled before the execution phase begins. Once execution has started and milestones are approved, cancellation is handled on a case-by-case basis. Please contact our support team for assistance."
  },
  {
    q: "How long does AI scope generation take?",
    a: "Our AI Scope Discovery Engine typically generates a comprehensive scope within 30–90 seconds after you complete the onboarding questionnaire."
  }
];

export default function ClientSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Customer Support
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          We're here to help. Reach out or find answers in our help center.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: FAQ */}
        <div className="lg:col-span-8">
          <h2 className="text-[13px] font-bold tracking-widest text-stone-400 uppercase mb-6">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50/50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-stone-900 pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-[#E85239] shrink-0" />
                    : <ChevronDown size={18} className="text-stone-400 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-[14px] font-medium text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT: Contact Options */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h2 className="text-[13px] font-bold tracking-widest text-stone-400 uppercase mb-0">
            Contact Us
          </h2>

          <div className="bg-[#FFF7F6] border border-orange-100 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#E85239]/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#E85239]" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-stone-900 mb-1">Email Support</h3>
                <p className="text-[13px] text-stone-500 mb-3">Average response time: 4–8 hours.</p>
                <a
                  href="mailto:support@executa.in"
                  className="text-[13px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors"
                >
                  support@executa.in
                </a>
              </div>
            </div>

            <div className="w-full h-px bg-orange-100" />

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#E85239]/10 flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-[#E85239]" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-stone-900 mb-1">Live Chat</h3>
                <p className="text-[13px] text-stone-500 mb-3">Available Mon–Fri, 10am–7pm IST.</p>
                <button className="px-4 py-2 bg-[#E85239] text-white text-[12px] font-bold rounded-lg hover:bg-[#d44127] transition-colors">
                  Start Chat
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-orange-100" />

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#E85239]/10 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-[#E85239]" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-stone-900 mb-1">Call Us</h3>
                <p className="text-[13px] text-stone-500 mb-3">Mon–Fri, 10am–6pm IST.</p>
                <a
                  href="tel:+918000000000"
                  className="text-[13px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors"
                >
                  +91 80000 00000
                </a>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 text-white rounded-3xl p-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-white mb-1">Help Center</h3>
                <p className="text-[13px] text-stone-400 mb-4">Browse our full documentation and guides.</p>
                <button className="px-4 py-2 bg-white text-stone-900 text-[12px] font-bold rounded-lg hover:bg-stone-100 transition-colors">
                  Browse Articles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
