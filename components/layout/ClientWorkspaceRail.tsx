"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { LayoutDashboard, Briefcase, FileText, Zap, CreditCard, Building } from "lucide-react";

const NAV_ITEMS = [
  {
    path: "/client/workspace",
    label: "Workspace",
    icon: <LayoutDashboard size={18} strokeWidth={2} />
  },
  {
    path: "/client/projects",
    label: "Projects",
    icon: <Briefcase size={18} strokeWidth={2} />
  },

  {
    path: "/client/execution",
    label: "Execution",
    icon: <Zap size={18} strokeWidth={2} />
  },
  {
    path: "/client/billing",
    label: "Billing",
    icon: <CreditCard size={18} strokeWidth={2} />
  },
  {
    path: "/client/organization",
    label: "Organization",
    icon: <Building size={18} strokeWidth={2} />
  }
];

export default function ClientWorkspaceRail() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // The rail visibility is now controlled by ClientLayoutWrapper

  return (
    <motion.nav 
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(232,82,57,0.03)] border border-border/60"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={{ opacity: 0, x: -20, y: "-50%" }}
      animate={{ opacity: 1, x: 0, width: isExpanded ? 240 : 74, y: "-50%" }}
      transition={{ 
        width: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        opacity: { duration: 0.5 }
      }}
    >
      <div className="flex flex-col gap-3 overflow-hidden w-full">
        {NAV_ITEMS.map((item) => {
          // Special case for execution to match base path but avoid deep rooms handled above
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`h-12 w-full flex items-center justify-start rounded-xl p-3 transition-all duration-300 overflow-hidden ${
                isActive 
                  ? "bg-accent text-white shadow-[0_4px_12px_rgba(232,82,57,0.18)]" 
                  : "text-text-tertiary hover:text-accent hover:bg-accent/5"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6 animate-fade-in">
                {item.icon}
              </div>
              
              {isExpanded && (
                <motion.span 
                  className="font-sans text-[11px] font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap shrink-0"
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ 
                    opacity: 1,
                    width: 140,
                    marginLeft: 12
                  }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
