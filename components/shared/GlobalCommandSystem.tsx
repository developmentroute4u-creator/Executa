"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, UserPlus, HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalCommandSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide on onboarding, scope review, match pages, payment, execution, and support — user needs distraction-free focus
  if (
    pathname.startsWith("/client/onboarding") ||
    pathname.includes("/scope") ||
    pathname.includes("/match") ||
    pathname.includes("/execution") ||
    pathname.includes("/pay") ||
    pathname.startsWith("/client/support") ||
    pathname.startsWith("/freelancer/support")
  ) {
    return null;
  }

  const actions = [
    { label: "Create new project", icon: <Briefcase size={16} />, href: "/client/onboarding" },
    { label: "Invite Team Member", icon: <UserPlus size={16} />, href: "/client/organization?invite=true" },
    { label: "Contact Support", icon: <HelpCircle size={16} />, href: "/client/support" }
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="hidden lg:block fixed inset-0 bg-stone-900/20 backdrop-blur-[2px] z-[55]"
          />
        )}
      </AnimatePresence>

      <div className="hidden lg:flex fixed bottom-8 right-8 z-[60] flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="mb-4 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden min-w-[220px] flex flex-col p-2"
            >
              <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">
                Fast Actions
              </div>
              {actions.map((action, i) => (
                <Link 
                  key={i} 
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-stone-700 hover:text-[#E85239] hover:bg-orange-50/50 rounded-xl transition-colors"
                >
                  <span className="text-stone-400">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 flex items-center justify-center rounded-full shadow-[0_8px_32px_rgba(232,82,57,0.25)] text-white transition-all duration-300 hover:scale-105 ${
            isOpen ? "w-14 bg-stone-900" : "px-6 bg-[#E85239] hover:bg-[#d44127] gap-2"
          }`}
          layout
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus size={20} strokeWidth={2.5} />
          </motion.div>
          
          {!isOpen && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="font-bold text-[14px] tracking-wide"
            >
              New
            </motion.span>
          )}
        </motion.button>
      </div>
    </>
  );
}
