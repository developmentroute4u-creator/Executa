"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === "client" ? "/client/dashboard" :
    role === "freelancer" ? "/freelancer/dashboard" :
    role === "admin" ? "/admin/dashboard" : null;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">Executa</span>
        </Link>

        {/* Center nav — only on landing */}
        {!session && (
          <div className="hidden md:flex items-center gap-7">
            <a href="#systems" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Systems</a>
            <a href="#workflow" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Workflow</a>
            <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm px-4 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors shadow-sm"
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

// Sidebar for dashboard layouts
interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  user?: { name?: string | null; email?: string | null; role?: string };
}

export function Sidebar({ items, user }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Executa</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              item.active
                ? "bg-white text-text-primary font-medium shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary hover:bg-white/70"
            )}
          >
            <span className={cn("w-4 h-4 shrink-0", item.active ? "text-accent" : "text-text-tertiary")}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-muted rounded-full flex items-center justify-center text-accent text-xs font-semibold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-secondary truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 w-full text-xs text-text-secondary hover:text-error transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
