"use client";

import { usePathname } from "next/navigation";
import ClientWorkspaceRail from "./ClientWorkspaceRail";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not show the rail in the deep execution room, onboarding, payment, or scope review step — all require absolute focus.
  const hideRail = pathname.includes("/execution/") ||
    pathname.startsWith("/client/onboarding") ||
    pathname.includes("/pay") ||
    pathname.includes("/scope") ||
    pathname.includes("/match");

  return (
    <>
      {!hideRail && <ClientWorkspaceRail />}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        !hideRail
          ? 'lg:pl-[100px] pb-20 lg:pb-0'  // mobile: bottom padding for tab bar; desktop: left padding for rail
          : ''
      }`}>
        {children}
      </div>
    </>
  );
}
