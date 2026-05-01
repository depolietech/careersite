"use client";
import { useState } from "react";
import { Mail, X, CheckCircle } from "lucide-react";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (dismissed) return null;

  async function handleResend() {
    setResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResent(true);
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <Mail size={15} className="shrink-0" />
        <span>
          Please verify your email address.{" "}
          {resent ? (
            <span className="inline-flex items-center gap-1 font-medium text-green-700">
              <CheckCircle size={13} /> Link resent!
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold underline hover:no-underline disabled:opacity-60"
            >
              {resending ? "Resending…" : "Resend verification email"}
            </button>
          )}
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-800 shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}
