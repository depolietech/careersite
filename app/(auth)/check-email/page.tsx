"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
              <Mail size={28} className="text-brand-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              We sent a verification link to{" "}
              {email && <strong className="text-gray-800">{email}</strong>}
              {!email && "your email address"}
              . Click the link to activate your account.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800 text-left">
            <strong>Didn&apos;t receive it?</strong> Check your spam folder, or resend below. The link expires in 24 hours.
          </div>

          {resent ? (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle size={16} /> Verification email resent!
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending…" : "Resend verification email"}
            </button>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <p className="text-xs text-gray-400">
            Wrong email?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">
              Start over
            </Link>
            {" · "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
