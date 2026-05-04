"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ChatLink {
  label: string;
  href: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: string[];
  links?: ChatLink[];
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your Equalhires assistant.\n\nI can help with job searching, applications, profile tips, navigation, and more. What would you like to know?",
  suggestions: [
    "How does it work?",
    "Find jobs",
    "Track my applications",
    "I'm an employer",
  ],
};

function BotText({ text }: { text: string }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  const nodes: React.ReactNode[] = [];

  segments.forEach((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      nodes.push(<strong key={i}>{seg.slice(2, -2)}</strong>);
    } else {
      seg.split("\n").forEach((line, j, arr) => {
        nodes.push(line);
        if (j < arr.length - 1) nodes.push(<br key={`${i}-br-${j}`} />);
      });
    }
  });

  return <span>{nodes}</span>;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        const data = await res.json();

        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: typeof data.reply === "string" ? data.reply : "I couldn't find an answer. Please try again.",
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          links: Array.isArray(data.links) ? data.links : [],
        };

        setMessages((prev) => [...prev, botMsg]);

        if (!isOpen) setHasNewMessage(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-err-${Date.now()}`,
            role: "bot",
            text: "Sorry, I'm having trouble right now. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isOpen]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-brand-500 text-white shadow-xl hover:bg-brand-600 transition-all hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle size={24} />
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
          style={{ width: "360px", maxWidth: "calc(100vw - 32px)", height: "520px", maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Header */}
          <div className="bg-forest px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Careers Assistant</p>
                <p className="text-xs text-gray-400">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col gap-2 max-w-[88%]">
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-500 text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "bot" ? <BotText text={msg.text} /> : msg.text}
                  </div>

                  {/* CTA links */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          {link.label}
                          <ExternalLink size={10} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggestion chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          disabled={isLoading}
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white px-3 py-3 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              autoComplete="off"
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
