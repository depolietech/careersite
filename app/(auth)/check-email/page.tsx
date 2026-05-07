"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, RefreshCw, CheckCircle, KeyRound } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useI18n } from "@/lib/i18n";

function CheckEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const email = params.get("email") ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  async function handleResend() {
    setResending(true);
    setResendError(null);
    setResent(false);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      setResendError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError("Please enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error ?? "Invalid code");
        return;
      }
      router.push("/login?verified=true");
    } catch {
      setCodeError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
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
            <h1 className="text-2xl font-bold text-gray-900">{t("auth.checkEmail")}</h1>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              {t("auth.checkEmailDesc")}{" "}
              {email && <strong className="text-gray-800">{email}</strong>}
              {!email && "your email address"}
              . Click the link to activate your account.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800 text-left">
            <strong>Didn&apos;t receive it?</strong> Check your spam folder, or resend below. The link expires in 24 hours.
          </div>

          {/* ── Code entry ── */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <KeyRound size={15} className="text-brand-600 shrink-0" aria-hidden="true" />
              Or enter the 6-digit code from your email
            </div>
            <form onSubmit={handleVerifyCode} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setCodeError(null); }}
                placeholder="000000"
                aria-label={t("auth.otpCode")}
                className="input flex-1 text-center text-lg tracking-widest font-mono"
              />
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {verifying ? "…" : t("auth.verifyCode")}
              </button>
            </form>
            {codeError && (
              <p role="alert" className="text-xs text-red-600">{codeError}</p>
            )}
            <p className="text-xs text-gray-400">The code expires in 15 minutes.</p>
          </div>

          {/* ── Resend ── */}
          {resent ? (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle size={16} /> {t("auth.resendSuccess")}
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending…" : t("auth.resendEmail")}
            </button>
          )}

          {resendError && (
            <p className="text-sm text-red-600">{resendError}</p>
          )}

          <p className="text-xs text-gray-400">
            Wrong email?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">
              Start over
            </Link>
            {" · "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              {t("auth.signIn")}
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
