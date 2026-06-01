"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data
const DUMMY_PROJECT = {
  _id: "p1",
  title: "Core Architecture Refactoring",
  status: "active",
  milestones: [
    { id: "m1", title: "System Audit", state: "approved" },
    { id: "m2", title: "Implementation", state: "active" },
    { id: "m3", title: "Testing & Handover", state: "pending" },
  ],
  messages: [
    { id: "msg1", role: "client", content: "Are we still on track for the Architecture delivery today?", timestamp: "10:42 AM" },
    { id: "msg2", role: "freelancer", content: "Yes, pushing the final structural changes to the repository now. I'll create a submission via the canvas shortly.", timestamp: "10:45 AM" }
  ]
};

export default function ExecutionRoom() {
  const [view, setView] = useState("canvas"); // canvas | submissions

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-background font-sans selection:bg-accent/10 selection:text-accent">
      
      {/* ── Editorial Top Navigation ── */}
      <header className="shrink-0 border-b border-border/40 px-8 md:px-12 py-8 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10 bg-background/80 backdrop-blur-xl">
        <div>
          <Link href="/freelancer/workspace" className="inline-flex items-center gap-2 mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary hover:text-accent transition-colors group">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Exit to Workspace
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <p className="font-mono text-[10px] text-accent uppercase tracking-[0.2em]">Live Execution State</p>
          </div>
          <h1 className="font-display text-4xl text-text-primary tracking-tight">{DUMMY_PROJECT.title}</h1>
        </div>
        
        {/* Typographic Tabs */}
        <div className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em]">
          <button 
            onClick={() => setView("canvas")}
            className={cn("transition-colors pb-1 border-b-2", view === "canvas" ? "text-text-primary border-text-primary font-bold" : "text-text-tertiary border-transparent hover:text-text-secondary")}
          >
            Operational Canvas
          </button>
          <button 
            onClick={() => setView("submissions")}
            className={cn("transition-colors pb-1 border-b-2", view === "submissions" ? "text-text-primary border-text-primary font-bold" : "text-text-tertiary border-transparent hover:text-text-secondary")}
          >
            Submissions
          </button>
        </div>
      </header>

      {/* ── Split Environmental Canvas ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: The Work Environment */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 relative bg-surface">
          
          {view === "canvas" && (
            <div className="max-w-3xl animate-fade-in">
              <h2 className="font-display text-2xl font-semibold text-text-primary tracking-tight mb-12">Implementation Phase</h2>
              
              <div className="space-y-12 border-l border-border/50 pl-6">
                <div className="relative">
                  <div className="absolute -left-[27.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                  <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-[0.2em] mb-3">Current Objective</p>
                  <p className="text-lg text-text-primary leading-relaxed">
                    Refactor the core routing architecture to support dynamic middleware injection. All tests must pass before submission.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[27.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                  <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-[0.2em] mb-3">Technical Requirements</p>
                  <ul className="text-sm text-text-secondary leading-relaxed space-y-2 list-disc list-inside">
                    <li>Maintain 100% backwards compatibility with v1 API.</li>
                    <li>Update Jest configuration to cover new paths.</li>
                    <li>Document middleware injection patterns in README.md.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {view === "submissions" && (
            <div className="max-w-3xl animate-fade-in">
              <h2 className="font-display text-2xl font-semibold text-text-primary tracking-tight mb-12">Submission Protocol</h2>
              
              <div className="border-t border-border/50 pt-16 mt-8">
                <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-[0.2em] mb-4">Upload Deliverables</p>
                <div className="py-24 text-center border border-dashed border-border/60 hover:border-accent/40 transition-colors bg-background/50 cursor-pointer">
                  <p className="text-sm text-text-secondary mb-6">Drag and drop assets or paste repository links.</p>
                  <button className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-primary hover:text-accent transition-colors font-bold">
                    Initialize Upload →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Communications Stream */}
        <div className="w-80 md:w-96 shrink-0 bg-background border-l border-border/40 flex flex-col">
          <div className="p-6 border-b border-border/40">
            <h3 className="font-mono text-[10px] text-text-tertiary uppercase tracking-[0.2em]">Comms Stream</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {DUMMY_PROJECT.messages.map((m) => (
              <div key={m.id} className="space-y-2">
                <div className={`flex items-baseline justify-between ${m.role === 'freelancer' ? 'flex-row-reverse' : ''}`}>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-bold ${m.role === 'freelancer' ? 'text-accent' : 'text-text-primary'}`}>
                    {m.role === 'freelancer' ? 'You' : 'Client'}
                  </span>
                  <span className="font-mono text-[9px] text-text-tertiary">{m.timestamp}</span>
                </div>
                <p className={`text-sm leading-relaxed ${m.role === 'freelancer' ? 'text-right text-text-primary' : 'text-text-secondary'}`}>
                  {m.content}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-border/40">
            <input 
              type="text"
              placeholder="Transmit message..." 
              className="w-full bg-transparent border-b border-border/50 focus:border-accent outline-none py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary transition-colors"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
