import FloatingWorkspaceRail from "@/components/layout/FloatingWorkspaceRail";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative selection:bg-accent/10 selection:text-accent">
      <FloatingWorkspaceRail />
      <div className="flex-1 flex flex-col pl-0 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}