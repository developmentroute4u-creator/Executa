"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";

const NavIcons = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  projects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5C2 4.672 2.672 4 3.5 4H6.5L7.5 5.5H12.5C13.328 5.5 14 6.172 14 7V12.5C14 13.328 13.328 14 12.5 14H3.5C2.672 14 2 13.328 2 12.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  earnings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 2.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  skillProfile: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 14c0-2.21 2.686-4 6-4s6 1.79 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.5v1.75M8 12.75V14.5M1.5 8h1.75M12.75 8H14.5M3.4 3.4l1.237 1.237M11.363 11.363l1.237 1.237M3.4 12.6l1.237-1.237M11.363 4.637l1.237-1.237" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function FreelancerProjectChatPage() {
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
    { label: "Overview", href: "/freelancer/dashboard", icon: NavIcons.overview },
    { label: "My Projects", href: "/freelancer/projects", icon: NavIcons.projects, active: true },
    { label: "Earnings", href: "/freelancer/earnings", icon: NavIcons.earnings },
    { label: "Skill Profile", href: "/freelancer/capability", icon: NavIcons.skillProfile },
    { label: "Settings", href: "/freelancer/settings", icon: NavIcons.settings },
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
    const interval = setInterval(fetchMessages, 3000);
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
        body: JSON.stringify({ content: inputText }),
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F2F2EF" }}>
      <Sidebar items={sidebarItems} user={{ name: user?.name, email: user?.email, role: "Freelancer" }} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Chat Header */}
        <div
          style={{
            height: "60px",
            flexShrink: 0,
            background: "white",
            borderBottom: "1px solid #E2E8F0",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            {/* Back button */}
            <button
              onClick={() => router.back()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "7px",
                fontSize: "11px",
                fontWeight: 700,
                background: "#F1F5F9",
                color: "#475569",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>

            <div style={{ width: "1px", height: "18px", background: "#E2E8F0" }} />

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6366F1",
                  }}
                >
                  Workspace Channel
                </span>
              </div>
              <h1
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0D0D0D",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "400px",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {projectTitle || "Loading…"}
              </h1>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
            <span
              className="animate-pulse"
              style={{
                width: "8px",
                height: "8px",
                background: "#22C55E",
                borderRadius: "50%",
                boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              }}
            />
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>
              Secure Connection
            </span>
          </div>
        </div>

        {/* Messaging Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px",
            background: "#F8F8F6",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {loading && messages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>Initializing channel…</span>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                maxWidth: "360px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(99,102,241,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0D0D0D", margin: "0 0 6px 0" }}>
                Workspace chat is ready
              </p>
              <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                Connect with your client regarding scope and deliverables. Do not share private contact details.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.isMe ? "flex-end" : "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#94A3B8",
                    fontWeight: 600,
                    marginBottom: "4px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.senderDisplayName}
                </span>
                <div
                  style={{
                    maxWidth: "68%",
                    borderRadius: m.isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    background: m.isMe ? "#6366F1" : "white",
                    color: m.isMe ? "white" : "#0D0D0D",
                    border: m.isMe ? "none" : "1px solid #E2E8F0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div
          style={{
            padding: "14px 24px",
            background: "white",
            borderTop: "1px solid #E2E8F0",
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={handleSendMessage}
            style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message…"
              disabled={sending}
              style={{
                flex: 1,
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                padding: "10px 16px",
                fontSize: "13px",
                outline: "none",
                color: "#0D0D0D",
              }}
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "white",
                border: "none",
                cursor: sending || !inputText.trim() ? "not-allowed" : "pointer",
                opacity: sending || !inputText.trim() ? 0.7 : 1,
                letterSpacing: "-0.01em",
                boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
              }}
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
