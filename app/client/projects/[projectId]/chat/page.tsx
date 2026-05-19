"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Button, Card } from "@/components/ui";

const SidebarIcons = {
  home: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projects: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  new: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

export default function ClientProjectChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;

  const sidebarItems = [
    { label: "Dashboard", href: "/client/dashboard", icon: SidebarIcons.home },
    { label: "My Projects", href: "/client/projects", icon: SidebarIcons.projects, active: true },
    { label: "New Project", href: "/client/onboarding", icon: SidebarIcons.new },
  ];

  const fetchMessages = () => {
    fetch(`/api/projects/${projectId}/chat`)
      .then((r) => r.json())
      .then((d) => {
        if (d.messages) setMessages(d.messages);
        if (d.projectTitle) setProjectTitle(d.projectTitle);
      })
      .catch((err) => console.error("Error loading chat messages", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for mock real-time
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputText })
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Client" }} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 shrink-0 bg-white border-b border-border px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/client/projects/${projectId}`} className="text-text-secondary hover:text-text-primary text-xs font-semibold">
                &larr; Project Details
              </Link>
              <span className="text-text-tertiary">/</span>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Internal Secure Channel</span>
            </div>
            <h1 className="text-sm font-bold text-text-primary truncate max-w-md">{projectTitle || "Loading project chat…"}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-text-secondary font-medium">Anonymized Expert Connected</span>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-surface/30 space-y-4 font-sans">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-xs text-text-secondary animate-pulse">Initializing channel...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-4 border border-accent/10">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-accent"><path d="M8 2a6 6 0 100 12h1v-1.5a1.5 1.5 0 011.5-1.5H13a1 1 0 001-1V5a3 3 0 00-3-3H8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-xs font-semibold text-text-primary">Your secure workspace chat is ready</p>
              <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
                Send a message to sync with the matched talent. Your real identity is completely private.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m._id} className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-text-tertiary mb-1 font-semibold">{m.senderDisplayName}</span>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                  m.isMe ? "bg-accent text-white" : "bg-white text-text-primary border border-border"
                }`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-4 bg-white border-t border-border shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message securely..."
              disabled={sending}
              className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 font-sans"
            />
            <Button type="submit" variant="primary" className="px-6 py-2.5 rounded-xl text-xs font-semibold" loading={sending}>
              Send Securely
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
