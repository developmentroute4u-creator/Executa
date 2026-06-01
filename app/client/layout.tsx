import GlobalCommandSystem from "@/components/shared/GlobalCommandSystem";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF7F6] flex flex-col relative selection:bg-[#E85239]/10 selection:text-[#E85239]">
      <GlobalCommandSystem />
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </div>
  );
}
