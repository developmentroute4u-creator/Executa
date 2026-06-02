"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";

export default function ProjectsEnvironment() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch("/api/freelancer/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingComplete === false) {
          router.push("/freelancer/onboarding");
          return;
        }
        if (data.test && data.test.status === "assigned") {
          router.push("/freelancer/test");
          return;
        }
        setProjects(data.activeProjects || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleAcceptScope = async (id: string) => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_scope" }),
      });
      if (res.ok) {
        router.push(`/freelancer/execution/${id}`);
      }
    } finally {
      setAccepting(false);
    }
  };

  const getPhaseLabel = (p: any) => {
    if (p.status === "pending") return "Pending Approval";
    if (p.status === "active") return "In Execution";
    if (p.status === "completed") return "Completed";
    return p.status;
  };

  return (
    <main className="flex-1 overflow-y-auto pb-32 bg-background min-h-screen pl-24">
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 pt-24 md:pt-32">
        <header className="mb-16 border-b border-border/40 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-2.5">
              <FileText className="text-accent" size={18} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Project Discovery</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Your Projects
            </h1>
            <p className="text-text-secondary font-sans text-sm mt-2">
              Review pending project requests, track active execution, and explore completed work.
            </p>
          </motion.div>
        </header>

        <motion.div 
          className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(232,82,57,0.01)]"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
        >
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-background rounded-2xl border border-border/50 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center text-accent/40 mb-6">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-text-primary tracking-tight mb-3">
                No matching projects yet
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                When clients post projects that align with your verified skills and tier, they will appear here. Make sure your skills evaluation is up to date.
              </p>
              <Link href="/freelancer/capability">
                <button className="mt-8 px-6 py-3 bg-white border border-border/60 hover:border-accent/40 rounded-full text-sm font-semibold text-text-primary hover:text-accent transition-all shadow-sm">
                  View Skill Tier
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((p) => {
                const isPending = p.status === "pending";
                return (
                  <div key={p._id} className="group bg-background border border-border/50 rounded-2xl p-8 hover:border-accent/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-xs text-text-primary font-semibold uppercase tracking-wider px-3 py-1 bg-white rounded-md border border-border/50 shadow-sm">{p.clientName}</span>
                          <span className="text-xs text-accent font-semibold uppercase tracking-wider">{getPhaseLabel(p)}</span>
                        </div>
                        
                        <h3 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight mb-4 group-hover:text-accent transition-colors">
                          {p.title}
                        </h3>
                      </div>

                      <div className="flex flex-col items-end gap-6 shrink-0">
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-text-primary">{formatCurrency(p.pricing?.freelancerPrice || 0)}</p>
                        </div>
                        
                        {isPending ? (
                          <button
                            onClick={() => handleAcceptScope(p._id)}
                            disabled={accepting}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-[0_4px_16px_rgba(232,82,57,0.2)]"
                          >
                            {accepting ? "Authorizing..." : "Accept Scope"} <ArrowRight size={14} strokeWidth={3} />
                          </button>
                        ) : (
                          <Link
                            href={`/freelancer/execution/${p._id}`}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-white text-text-primary hover:text-accent border border-border/80 hover:border-accent/50 transition-all shadow-sm"
                          >
                            Enter Room <ArrowRight size={14} strokeWidth={3} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
