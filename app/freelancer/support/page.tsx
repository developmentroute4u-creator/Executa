"use client";
import { motion } from "framer-motion";
import { MessageSquare, Mail, BookOpen, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { SupportChatWidget } from "@/components/SupportChatWidget";

const faqs = [
  {
    q: "How do I get paid?",
    a: "When clients approve your milestones, the funds (which are securely held in escrow) are released immediately to your wallet. You can withdraw them to your linked bank account anytime from the Earnings tab."
  },
  {
    q: "How does the skill evaluation work?",
    a: "New freelancers must pass a Level 2 assignment to start taking projects. Your verified skill tier determines the complexity and budget of the projects you are eligible to claim."
  },
  {
    q: "What is the platform fee for freelancers?",
    a: "Executa does not charge freelancers any fees. You keep 100% of your earnings. The client covers all platform, support, and escrow costs."
  },
  {
    q: "How do I update my skills?",
    a: "Navigate to your Skills section from the sidebar. From there, you can view your current tier, request a re-evaluation, or add new technical proficiencies to unlock more project opportunities."
  },
  {
    q: "What happens if a client is unresponsive?",
    a: "If a client does not respond to a submitted milestone or project delivery within 7 days, the escrowed funds will be automatically released to your account."
  },
  {
    q: "How do I communicate with my client?",
    a: "You can use the built-in workspace chat available inside each active project to communicate directly with your client, share updates, and ask clarifying questions."
  }
];

export default function FreelancerSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Freelancer Support
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          We're here to help you succeed. Reach out or find answers in our help center.
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
                <p className="text-[13px] text-stone-500 mb-3">Average response time: 2–4 hours.</p>
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
                <button
                  onClick={() => setChatOpen(true)}
                  className="px-4 py-2 bg-[#E85239] text-white text-[12px] font-bold rounded-lg hover:bg-[#d44127] transition-colors"
                >
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
                <p className="text-[13px] text-stone-400 mb-4">Browse our full documentation and guides for freelancers.</p>
                <Link href="/freelancer/articles">
                  <button className="px-4 py-2 bg-white text-stone-900 text-[12px] font-bold rounded-lg hover:bg-stone-100 transition-colors">
                    Browse Articles
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SupportChatWidget userRole="freelancer" triggerOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
