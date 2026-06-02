"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, ClipboardList, Users, UserCheck, Briefcase, AlertTriangle, ToggleLeft, Settings, LogOut } from "lucide-react";
import ExecutaLogo from "@/components/layout/ExecutaLogo";

export function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <Home size={18} strokeWidth={2} /> },
    { id: "tests", label: "Test Review", icon: <ClipboardList size={18} strokeWidth={2} /> },
    { id: "freelancers", label: "Freelancers", icon: <UserCheck size={18} strokeWidth={2} /> },
    { id: "clients", label: "Clients", icon: <Users size={18} strokeWidth={2} /> },
    { id: "projects", label: "Projects", icon: <Briefcase size={18} strokeWidth={2} /> },
    { id: "disputes", label: "Disputes", icon: <AlertTriangle size={18} strokeWidth={2} /> },
    { id: "features", label: "Feature Controls", icon: <ToggleLeft size={18} strokeWidth={2} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} /> },
  ];

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  return (
    <motion.nav
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(232,82,57,0.06)] border border-border/60"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={{ opacity: 0, x: -20, y: "-50%" }}
      animate={{ opacity: 1, x: 0, width: isExpanded ? 230 : 66, y: "-50%" }}
      transition={{
        width: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        opacity: { duration: 0.5 }
      }}
    >
      <div className="flex flex-col gap-2 overflow-hidden w-full h-full">

        {/* ── Logo Block ── */}
        <div className="w-full flex items-center pb-3 border-b border-border/30" style={{ minHeight: "52px" }}>
          <ExecutaLogo expanded={isExpanded} />
        </div>
        


        {/* ── Nav Items ── */}
        <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pb-4">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`h-12 w-full flex items-center rounded-xl transition-all duration-300 overflow-hidden justify-start px-0 ${
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
              </button>
            );
          })}
        </div>

        {/* ── Bottom Section ── */}
        <div className="pt-2 border-t border-border/30 w-full">
          <button
            onClick={handleLogout}
            className="h-12 w-full flex items-center rounded-xl transition-all duration-300 overflow-hidden justify-start px-0 text-red-500 hover:bg-red-50"
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
