"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "bfc_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept(all: boolean) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: all ? true : analytics }));
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <Cookie size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">We use cookies</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Essential cookies keep the platform working. With your consent, we also use analytics cookies to improve your experience.{" "}
                <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
          <button onClick={reject} className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Reject all">
            <X size={16} />
          </button>
        </div>

        {expanded && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Essential cookies</p>
                <p className="text-gray-500 text-xs mt-0.5">Required for authentication and core functionality. Always active.</p>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Always on</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Analytics cookies</p>
                <p className="text-gray-500 text-xs mt-0.5">Help us understand how people use the platform so we can improve it.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${analytics ? "bg-brand-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${analytics ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => accept(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Accept all
          </button>
          <button
            onClick={reject}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reject non-essential
          </button>
          <button
            onClick={() => {
              if (expanded) accept(false);
              else setExpanded(true);
            }}
            className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            {expanded ? (
              <>Save preferences <ChevronUp size={14} /></>
            ) : (
              <>Manage preferences <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
