"use client";

import { usePathname } from "next/navigation";
import ClientWorkspaceRail from "./ClientWorkspaceRail";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not show the rail in the deep execution room or onboarding, as they require absolute focus.
  const hideRail = pathname.includes("/execution/") || 
                   pathname.startsWith("/client/onboarding");

  return (
    <>
      {!hideRail && <ClientWorkspaceRail />}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!hideRail ? 'pl-[100px]' : ''}`}>
        {children}
      </div>
    </>
  );
}
