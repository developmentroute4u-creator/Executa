"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      // Show navbar after scrolling 50vh (halfway down hero)
      setIsScrolled(window.scrollY > window.innerHeight * 0.5);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const dashboardHref =
    role === "client" ? "/client/dashboard" :
      role === "freelancer" ? "/freelancer/workspace" :
        role === "admin" ? "/admin/dashboard" : null;

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 bg-white/65 backdrop-blur-2xl border-b border-border/30 transition-all duration-500 shadow-[0_2px_20px_rgba(0,0,0,0.01)]",
      pathname === "/" && !isScrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-md shadow-accent/15 transition-transform duration-300 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors duration-300">
            Executa
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="text-sm font-semibold tracking-wide text-stone-700 hover:text-stone-950 transition-colors uppercase px-4 py-2"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all duration-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl border border-stone-200 bg-white/40 text-stone-750 hover:bg-white hover:text-stone-950 transition-all duration-300 shadow-sm"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all duration-300 shadow-md shadow-accent/10 hover:shadow-accent/20"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Sidebar for dashboard layouts ───────────────────────────────────────────

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  user?: { name?: string | null; email?: string | null; role?: string };
}

export function Sidebar({ items, user }: SidebarProps) {
  return (
    <aside
      className="shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        width: "250px",
        background: "#FFFFFF",
        borderRight: "1px solid rgba(230, 62, 0, 0.1)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center px-6"
        style={{ height: "72px", borderBottom: "1px solid rgba(230, 62, 0, 0.08)" }}
      >
        <Link href="/" className="flex items-center gap-3 w-full">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #E63E00 0%, #FF6B35 100%)",
              boxShadow: "0 4px 12px rgba(230,62,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.7" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.7" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontSize: "15px",
                fontWeight: 800,
                color: "#1C1917",
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              Executa
            </span>
            <span style={{ fontSize: "10px", color: "#E63E00", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Truth Engine
            </span>
          </div>
        </Link>
      </div>

      {/* ── Section label ── */}
      <div style={{ padding: "24px 24px 8px" }}>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: "#8D8D8D",
            textTransform: "uppercase",
          }}
        >
          Freelancer Workspace
        </span>
      </div>

      {/* ── Nav Items ── */}
      <nav
        className="overflow-y-auto"
        style={{ flex: 1, padding: "8px 12px" }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: item.active ? 600 : 500,
              color: item.active ? "#E63E00" : "#57534E",
              background: item.active ? "rgba(230, 62, 0, 0.08)" : "transparent",
              position: "relative",
              textDecoration: "none",
              marginBottom: "4px",
              transition: "all 0.2s ease",
            }}
            className={!item.active ? "hover:bg-orange-50/50 hover:text-orange-900" : ""}
          >
            {/* Active left bar */}
            {item.active && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3px",
                  height: "18px",
                  background: "#E63E00",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            )}

            {/* Icon */}
            <span
              style={{
                width: "18px",
                height: "18px",
                color: item.active ? "#E63E00" : "#8D8D8D",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span style={{ flex: 1, letterSpacing: "-0.01em" }}>{item.label}</span>

            {/* Badge */}
            {item.badge != null && item.badge > 0 && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "99px",
                  background: "#E63E00",
                  color: "white",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── User Section ── */}
      {user && (
        <div style={{ padding: "16px", borderTop: "1px solid rgba(230, 62, 0, 0.08)", background: "#FFF7F5" }}>
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1C1917 0%, #3a332f 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1C1917",
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#57534E",
                  textTransform: "capitalize",
                  margin: 0,
                  lineHeight: "1.4",
                  fontWeight: 500,
                }}
              >
                Freelancer Profile
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              width: "100%",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "6px",
              color: "#57534E",
              background: "white",
              border: "1px solid rgba(230, 62, 0, 0.1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
          >
            <span>Sign Out</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
