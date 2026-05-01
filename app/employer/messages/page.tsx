"use client";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, EyeOff, Send, Loader2, ChevronDown, ChevronUp, User } from "lucide-react";

type Conversation = {
  id: string;
  jobTitle: string;
  candidateCode: string;
  revealed: boolean;
  lastMessage: string | null;
  lastMessageAt: string;
  unread: number;
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  senderRole: string;
};

function fmtTime(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Thread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((d) => { setMessages(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!reply.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply.trim() }),
    });
    if (res.ok) {
      const m = await res.json();
      setMessages((prev) => [...prev, m]);
      setReply("");
    }
    setSending(false);
  }

  if (loading) return <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-gray-400" /></div>;

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No messages yet. Start the conversation.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.isOwn
                ? "bg-brand-500 text-white rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
            }`}>
              <p>{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.isOwn ? "text-brand-200" : "text-gray-400"}`}>{fmtTime(m.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Type a message..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button
          onClick={send}
          disabled={sending || !reply.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function EmployerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => { setConversations(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Conversations with candidates.</p>
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-800 flex items-center gap-2">
        <EyeOff size={15} className="shrink-0" />
        Candidate identities are shown only after an interview has been scheduled.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : conversations.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <MessageSquare size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No messages yet</p>
          <p className="text-sm text-gray-500">
            Conversations with candidates will appear here once an interview is scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <button
                className="w-full p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setOpen(open === c.id ? null : c.id)}
              >
                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  {c.revealed ? <User size={18} className="text-brand-600" /> : <EyeOff size={18} className="text-brand-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{c.candidateCode}</p>
                      <p className="text-xs text-gray-500 truncate">{c.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{fmtTime(c.lastMessageAt)}</span>
                      {open === c.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </div>
                  </div>
                  {c.lastMessage && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.lastMessage}</p>
                  )}
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {c.unread}
                  </span>
                )}
              </button>
              {open === c.id && <Thread conversationId={c.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
