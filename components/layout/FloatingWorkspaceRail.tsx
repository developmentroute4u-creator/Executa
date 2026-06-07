"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LayoutDashboard, Briefcase, Award, IndianRupee, User, HelpCircle, LogOut } from "lucide-react";
import ExecutaLogo from "@/components/layout/ExecutaLogo";

// All possible nav items with their feature-flag keys
const ALL_NAV_ITEMS = [
  { path: "/freelancer/workspace", label: "Workspace", icon: <LayoutDashboard size={18} strokeWidth={2} />, flagKey: "fl_workspace" },
  { path: "/freelancer/projects", label: "Projects", icon: <Briefcase size={18} strokeWidth={2} />, flagKey: "fl_projects" },
  { path: "/freelancer/capability", label: "Skills", icon: <Award size={18} strokeWidth={2} />, flagKey: "fl_capability" },
  { path: "/freelancer/earnings", label: "Earnings", icon: <IndianRupee size={18} strokeWidth={2} />, flagKey: "fl_earnings" },
  { path: "/freelancer/profile", label: "Profile", icon: <User size={18} strokeWidth={2} />, flagKey: "fl_profile" },
  { path: "/freelancer/support", label: "Support", icon: <HelpCircle size={18} strokeWidth={2} />, flagKey: "fl_support" },
];

export default function FloatingWorkspaceRail() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [enabledKeys, setEnabledKeys] = useState<Set<string>>(new Set(ALL_NAV_ITEMS.map(i => i.flagKey)));

  // Fetch feature flags once on mount
  useEffect(() => {
    fetch("/api/feature-flags?role=freelancer")
      .then(r => r.json())
      .then(data => {
        if (data.flags) {
          setEnabledKeys(new Set(data.flags.filter((f: any) => f.enabled).map((f: any) => f.key)));
        }
      })
      .catch(() => {/* Fail silently — show all items if API unreachable */ });
  }, []);

  // Hide rail in deep execution rooms, onboarding, or testing pages
  if (
    pathname.includes("/execution/") ||
    pathname.includes("/freelancer/onboarding") ||
    pathname.includes("/freelancer/test")
  ) {
    return null;
  }

  // Filter nav items to only those with flags enabled
  const visibleItems = ALL_NAV_ITEMS.filter(item => enabledKeys.has(item.flagKey));

  return (
    <>
      {/* ── Desktop: Floating side rail (unchanged) ── */}
      <motion.nav
        className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 p-3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(232,82,57,0.06)] border border-border/60"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        initial={{ opacity: 0, x: -20, y: "-50%" }}
        animate={{ opacity: 1, x: 0, width: isExpanded ? 230 : 66, y: "-50%" }}
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

          {visibleItems.map((item) => {
            const isActive = pathname === item.path ||
              pathname.startsWith(`${item.path}/`) ||
              (item.path === "/freelancer/support" && (pathname === "/freelancer/articles" || pathname.startsWith("/freelancer/articles/")));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`h-12 w-full flex items-center rounded-xl transition-all duration-300 overflow-hidden justify-start px-0 ${isActive
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

      {/* ── Mobile / Tablet: Bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {visibleItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.path ||
              pathname.startsWith(`${item.path}/`) ||
              (item.path === "/freelancer/support" && (pathname === "/freelancer/articles" || pathname.startsWith("/freelancer/articles/")));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${isActive
                    ? "text-[#E85239]"
                    : "text-stone-400 hover:text-stone-600"
                  }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-[#FFF7F6]" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Sign out */}
          <button
            onClick={() => {
              document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/";
            }}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] text-red-400 hover:text-red-600"
          >
            <div className="p-1.5 rounded-xl">
              <LogOut size={18} strokeWidth={2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
              Out
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
