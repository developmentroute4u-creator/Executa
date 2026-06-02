"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LayoutDashboard, Briefcase, Zap, CreditCard, Building, HelpCircle, LogOut } from "lucide-react";
import ExecutaLogo from "@/components/layout/ExecutaLogo";

// All possible nav items with their feature-flag keys
const ALL_NAV_ITEMS = [
  { path: "/client/workspace",     label: "Workspace",     icon: <LayoutDashboard size={18} strokeWidth={2} />, flagKey: "cl_workspace"      },
  { path: "/client/projects",      label: "Projects",      icon: <Briefcase       size={18} strokeWidth={2} />, flagKey: "cl_projects"       },
  { path: "/client/execution",     label: "Execution",     icon: <Zap             size={18} strokeWidth={2} />, flagKey: "cl_execution"      },
  { path: "/client/billing",       label: "Billing",       icon: <CreditCard      size={18} strokeWidth={2} />, flagKey: "cl_billing"        },
  { path: "/client/organization",  label: "Organization",  icon: <Building        size={18} strokeWidth={2} />, flagKey: "cl_organization"   },
  { path: "/client/support",       label: "Support",       icon: <HelpCircle      size={18} strokeWidth={2} />, flagKey: "cl_support"        },
];

export default function ClientWorkspaceRail() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [enabledKeys, setEnabledKeys] = useState<Set<string>>(new Set(ALL_NAV_ITEMS.map(i => i.flagKey)));

  // Fetch feature flags once on mount
  useEffect(() => {
    fetch("/api/feature-flags?role=client")
      .then(r => r.json())
      .then(data => {
        if (data.flags) {
          setEnabledKeys(new Set(data.flags.filter((f: any) => f.enabled).map((f: any) => f.key)));
        }
      })
      .catch(() => {/* Fail silently — show all items if API unreachable */});
  }, []);

  // Filter nav items by enabled feature flags
  const visibleItems = ALL_NAV_ITEMS.filter(item => enabledKeys.has(item.flagKey));

  return (
    <motion.nav
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(232,82,57,0.06)] border border-border/60"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={{ opacity: 0, x: -20, y: "-50%" }}
      animate={{ opacity: 1, x: 0, width: isExpanded ? 240 : 66, y: "-50%" }}
      transition={{
        width: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        opacity: { duration: 0.5 }
      }}
    >
      <div className="flex flex-col gap-2 overflow-hidden w-full">

        {/* ── Logo Block ── */}
        <div className="w-full flex items-center pb-3 border-b border-border/30" style={{ minHeight: "52px" }}>
          <ExecutaLogo expanded={isExpanded} />
        </div>

        {/* ── Nav Items (filtered by feature flags) ── */}
        {visibleItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`h-12 w-full flex items-center justify-start rounded-xl px-0 transition-all duration-300 overflow-hidden ${
                isActive
                  ? "bg-accent text-white shadow-[0_4px_12px_rgba(232,82,57,0.18)]"
                  : "text-text-tertiary hover:text-accent hover:bg-accent/5"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-[42px] h-full">
                {item.icon}
              </div>

              {isExpanded && (
                <motion.span
                  className="font-sans text-[11px] font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap shrink-0 text-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 120 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
        {/* ── Bottom Section ── */}
        <div className="pt-2 border-t border-border/30 w-full mt-auto">
          <button
            onClick={() => {
              document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/";
            }}
            className="h-12 w-full flex items-center justify-start rounded-xl px-0 transition-all duration-300 overflow-hidden text-red-500 hover:bg-red-50"
          >
            <div className="shrink-0 flex items-center justify-center w-[42px] h-full">
              <LogOut size={18} strokeWidth={2} />
            </div>
            {isExpanded && (
              <motion.span
                className="font-sans text-[11px] font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap shrink-0 text-left"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 120 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                Sign Out
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
