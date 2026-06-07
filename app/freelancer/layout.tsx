"use client";
import FloatingWorkspaceRail from "@/components/layout/FloatingWorkspaceRail";
import { usePathname } from "next/navigation";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideRail = pathname.includes("/execution/") || pathname.includes("/freelancer/onboarding") || pathname.includes("/freelancer/test");

  return (
    <div className="min-h-screen bg-background flex flex-col relative selection:bg-accent/10 selection:text-accent">
      <FloatingWorkspaceRail />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!hideRail ? "lg:pl-[100px] pb-20 lg:pb-0" : ""
        }`}>
        {children}
      </div>
    </div>
  );
}