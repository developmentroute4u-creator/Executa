"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, Send, RefreshCw, ArrowLeft,
} from "lucide-react";

type Priority = "low" | "medium" | "high";
type ChatStatus = "active" | "resolved";

interface SupportMessage {
  _id: string;
  sender: "user" | "admin";
  senderName: string;
  content: string;
  createdAt: string;
}

interface SupportChat {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: "client" | "freelancer";
  status: ChatStatus;
  priority: Priority;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: "Low",    color: "text-green-600",  bg: "bg-green-50 border-green-200" },
  medium: { label: "Medium", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  high:   { label: "High",   color: "text-red-600",    bg: "bg-red-50 border-red-200" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SupportTab() {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | ChatStatus>("all");
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const url = filterStatus === "all"
        ? "/api/admin/support/chats"
        : `/api/admin/support/chats?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setChats(data.chats || []);
      // If we have a selected chat, refresh it too
      if (selectedChat) {
        const updated = (data.chats || []).find((c: SupportChat) => c._id === selectedChat._id);
        if (updated) setSelectedChat(updated);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchChats(); }, [filterStatus]);

  // Poll every 8 seconds for new messages when a chat is open
  useEffect(() => {
    const interval = setInterval(() => fetchChats(true), 8000);
    return () => clearInterval(interval);
  }, [filterStatus, selectedChat?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChat || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/chats/${selectedChat._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat(prev => prev ? { ...prev, messages: data.messages } : prev);
        setChats(prev => prev.map(c => c._id === selectedChat._id
          ? { ...c, messages: data.messages, updatedAt: new Date().toISOString() }
          : c
        ));
        setReplyText("");
      }
    } finally {
      setSending(false);
    }
  };

  const updateChat = async (chatId: string, patch: { status?: ChatStatus; priority?: Priority }) => {
    const res = await fetch(`/api/admin/support/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.success) {
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, ...patch } : c));
      if (selectedChat?._id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, ...patch } : prev);
      }
    }
  };

  const filteredChats = chats.filter(c =>
    filterStatus === "all" ? true : c.status === filterStatus
  );
  const activeCount = chats.filter(c => c.status === "active").length;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">

      {/* ── LEFT PANEL: Chat List ── */}
      <div className="w-[340px] shrink-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-black text-stone-900 tracking-tight">Support Chats</h2>
            {activeCount > 0 && (
              <p className="text-[12px] text-[#E85239] font-bold mt-0.5">
                {activeCount} active {activeCount === 1 ? "session" : "sessions"}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchChats(true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex p-1 bg-stone-100/80 rounded-xl mb-4 gap-1">
          {(["all", "active", "resolved"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition-all ${
                filterStatus === s
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <span className="text-sm text-stone-400 animate-pulse">Loading support chats…</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-stone-400 gap-2">
              <MessageSquare size={28} strokeWidth={1.5} />
              <p className="text-[13px] font-medium">No chats yet</p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const isSelected = selectedChat?._id === chat._id;
              const lastMsg = chat.messages[chat.messages.length - 1];
              const pm = PRIORITY_META[chat.priority];
              return (
                <button
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-[#E85239]/30 bg-[#FFF7F5] shadow-sm"
                      : "border-stone-100 bg-white hover:border-stone-200 hover:bg-stone-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-stone-900 truncate">{chat.userName}</p>
                      <p className="text-[11px] text-stone-400 truncate">{chat.userEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${pm.bg} ${pm.color}`}>
                        {pm.label}
                      </span>
                      {chat.status === "active" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mt-0.5" />
                      ) : (
                        <CheckCircle2 size={10} className="text-stone-300 mt-0.5" />
                      )}
                    </div>
                  </div>
                  {lastMsg && (
                    <p className="text-[11px] text-stone-500 truncate">
                      <span className="font-semibold">{lastMsg.sender === "admin" ? "You: " : ""}</span>
                      {lastMsg.content}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-400 mt-1">{timeAgo(chat.updatedAt)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat Detail ── */}
      <div className="flex-1 bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedChat ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-300"
            >
              <MessageSquare size={48} strokeWidth={1} />
              <p className="text-[15px] font-semibold">Select a support thread</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div>
                    <p className="text-[14px] font-black text-stone-900">{selectedChat.userName}</p>
                    <p className="text-[11px] text-stone-400">{selectedChat.userEmail} · {selectedChat.userRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Priority Selector */}
                  <div className="flex items-center gap-1">
                    {(["low", "medium", "high"] as Priority[]).map(p => {
                      const pm = PRIORITY_META[p];
                      return (
                        <button
                          key={p}
                          onClick={() => updateChat(selectedChat._id, { priority: p })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize transition-all ${
                            selectedChat.priority === p
                              ? `${pm.bg} ${pm.color} border-current`
                              : "bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Resolve button — once resolved, stays resolved */}
                  {selectedChat.status === "active" ? (
                    <button
                      onClick={() => updateChat(selectedChat._id, { status: "resolved" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Resolve Ticket
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold">
                      <CheckCircle2 size={12} /> Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Resolved Banner */}
              {selectedChat.status === "resolved" && (
                <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 border-b border-green-100 text-green-700 shrink-0">
                  <CheckCircle2 size={13} />
                  <span className="text-[12px] font-bold">This ticket has been permanently resolved. The client can open a new ticket if needed.</span>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {selectedChat.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-300 text-sm">No messages yet.</div>
                ) : (
                  selectedChat.messages.map((msg, i) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div key={i} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                          isAdmin ? "bg-[#E85239] text-white" : "bg-stone-100 text-stone-500"
                        }`}>
                          {isAdmin ? "A" : msg.senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`max-w-[72%] ${isAdmin ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          <p className="text-[10px] font-bold text-stone-400">{msg.senderName}</p>
                          <div className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${
                            isAdmin
                              ? "bg-[#E85239] text-white rounded-tr-sm"
                              : "bg-stone-100 text-stone-800 rounded-tl-sm"
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-[9px] text-stone-300">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input — disabled for resolved tickets */}
              <div className={`border-t border-stone-100 px-5 py-4 shrink-0 ${selectedChat.status === "resolved" ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="flex gap-3 items-end">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder={selectedChat.status === "resolved" ? "Chat is resolved" : "Type your reply… (Enter to send)"}
                    rows={2}
                    className="flex-1 resize-none text-[13px] font-medium text-stone-800 placeholder-stone-300 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-[#E85239]/40 focus:ring-1 focus:ring-[#E85239]/20 transition-all"
                    disabled={selectedChat.status === "resolved"}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="w-11 h-11 rounded-2xl bg-[#E85239] text-white flex items-center justify-center hover:bg-[#d44127] active:scale-95 transition-all disabled:opacity-40 shadow-[0_4px_14px_rgba(232,82,57,0.3)]"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
