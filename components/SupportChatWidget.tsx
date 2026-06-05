"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from "lucide-react";

interface ChatMessage {
  _id?: string;
  sender: "user" | "admin";
  senderName: string;
  content: string;
  createdAt: string;
}

interface SupportChatWidgetProps {
  userRole: "client" | "freelancer";
  triggerOpen?: boolean;
  onClose?: () => void;
}

export function SupportChatWidget({ userRole, triggerOpen, onClose }: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"active" | "resolved" | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing active chat on mount
  useEffect(() => {
    fetch("/api/support/chats")
      .then(r => r.json())
      .then(data => {
        if (data.chat) {
          setChatId(data.chat._id);
          setMessages(data.chat.messages || []);
          setStatus(data.chat.status);
        }
      });
  }, []);

  // Open widget when parent triggers it (e.g. "Start Chat" button clicked)
  useEffect(() => {
    if (triggerOpen) {
      setIsOpen(true);
      setHasNewMessage(false);
    }
  }, [triggerOpen]);

  // Poll for new messages only while chat is active
  useEffect(() => {
    if (!chatId || status !== "active") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/support/chats/${chatId}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(prev => {
          const hasNew = data.messages.length > prev.length;
          if (hasNew && !isOpen) setHasNewMessage(true);
          return data.messages;
        });
        setStatus(data.status);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [chatId, status, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  // Start a completely fresh ticket — previous resolved session untouched
  const startNewTicket = () => {
    setChatId(null);
    setMessages([]);
    setStatus(null);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      if (!chatId) {
        // Start a new chat
        setInitializing(true);
        const res = await fetch("/api/support/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (data.chat) {
          setChatId(data.chat._id);
          setMessages(data.chat.messages || []);
          setStatus(data.chat.status);
        }
        setInitializing(false);
      } else {
        // Append to existing chat
        const res = await fetch(`/api/support/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } finally {
      setSending(false);
      setInitializing(false);
    }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#E85239] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(232,82,57,0.45)] hover:scale-105 active:scale-95 transition-transform"
          >
            <MessageSquare size={22} />
            {hasNewMessage && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-3xl shadow-[0_24px_72px_rgba(0,0,0,0.14)] border border-stone-100 flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#E85239] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare size={17} />
                </div>
                <div>
                  <p className="text-[13px] font-black">Executa Support</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <p className="text-[10px] text-white/80">Available Mon–Fri, 10am–7pm IST</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); onClose?.(); }}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Resolved Banner */}
            {status === "resolved" && (
              <div className="flex items-center gap-2 px-5 py-2 bg-green-50 border-b border-green-100 text-green-700 shrink-0">
                <CheckCircle2 size={12} />
                <span className="text-[11px] font-bold">This ticket has been resolved.</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {!chatId && messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-[#E85239]" />
                  </div>
                  <p className="text-[14px] font-bold text-stone-700 mb-1">Hi there! 👋</p>
                  <p className="text-[12px] text-stone-400 font-medium leading-relaxed">
                    Our support team is ready to help. Send your first message to get started.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={i} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${
                      isUser ? "bg-stone-200 text-stone-600" : "bg-[#E85239] text-white"
                    }`}>
                      {isUser ? "U" : "S"}
                    </div>
                    <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"} gap-1`}>
                      <div className={`px-3.5 py-2 rounded-2xl text-[13px] font-medium leading-relaxed ${
                        isUser ? "bg-stone-100 text-stone-800 rounded-tr-sm" : "bg-[#E85239] text-white rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[9px] text-stone-300">{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              {initializing && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-[#E85239] flex items-center justify-center">
                    <Loader2 size={12} className="text-white animate-spin" />
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-[#E85239]/10 text-[12px] font-medium text-stone-500">
                    Connecting you to support…
                  </div>
                </div>
              )}
              {status === "resolved" && (
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50/50 border border-orange-100/60 text-center my-2 space-y-1">
                  <p className="text-[12px] text-stone-500 font-medium">
                    This support session has been closed.
                  </p>
                  <button
                    onClick={startNewTicket}
                    className="text-[12px] font-bold text-[#E85239] hover:underline"
                  >
                    Click here to start a new chat session.
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input OR New Ticket CTA */}
            {status === "resolved" ? (
              <div className="border-t border-stone-100 px-5 py-4 shrink-0 bg-stone-50/60">
                <p className="text-[11px] text-stone-400 font-medium text-center mb-3">
                  Have a new issue? Open a fresh support ticket.
                </p>
                <button
                  onClick={startNewTicket}
                  className="w-full py-2.5 rounded-2xl bg-[#E85239] text-white text-[13px] font-bold hover:bg-[#d44127] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(232,82,57,0.25)]"
                >
                  + Start New Support Request
                </button>
              </div>
            ) : (
              <div className="border-t border-stone-100 px-4 py-3 shrink-0">
                <div className="flex gap-2 items-end">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Type a message…"
                    className="flex-1 text-[13px] font-medium text-stone-800 placeholder-stone-300 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 outline-none focus:border-[#E85239]/40 focus:ring-1 focus:ring-[#E85239]/20 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-2xl bg-[#E85239] text-white flex items-center justify-center hover:bg-[#d44127] active:scale-95 transition-all disabled:opacity-40"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
