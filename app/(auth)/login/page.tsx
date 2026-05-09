"use client";
import { useState, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ShieldCheck, RefreshCw, Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/Logo";
import { Starburst } from "@/components/shared/Starburst";
import { useI18n } from "@/lib/i18n";

const DECORATION_COLORS = ["bg-blue-400", "bg-purple-400", "bg-blue-300", "bg-purple-300"];

function OAuthButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

type Role = "JOB_SEEKER" | "EMPLOYER";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const verifiedParam  = params.get("verified");
  const errorParam     = params.get("error");

  const [role, setRole]             = useState<Role>("JOB_SEEKER");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);

  // Email verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // 2FA state
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "email">("totp");
  const [otpCode, setOtpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(
    errorParam === "invalid-token"  ? "That verification link is invalid." :
    errorParam === "expired-token"  ? "That verification link has expired. Please request a new one." :
    null
  );

  function selectRole(r: Role) {
    setRole(r);
    setError(null);
    setNeedsVerification(false);
  }

  async function handleOAuth(provider: string) {
    await fetch("/api/auth/pending-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    // Preserve callbackUrl from params (e.g. a specific job page), fall back to dashboard
    const dest = (callbackUrl && callbackUrl !== "/")
      ? callbackUrl
      : role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard";
    await signIn(provider, { callbackUrl: dest });
  }

  async function handleResendVerification() {
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSendEmailOtp() {
    setLoading(true);
    try {
      await fetch("/api/auth/2fa/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "2fa_login" }),
      });
      setOtpSent(true);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (twoFactorStep) {
      // Verify 2FA code
      try {
        const res = await fetch("/api/auth/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otpCode, isBackupCode: useBackupCode }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Invalid code");
          return;
        }
        // 2FA verified — proceed to redirect
        await doRedirect();
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // Step 1: Check account state before attempting password validation.
      // NextAuth v5 beta swallows custom errors from authorize(), so we do
      // the state checks here first to show specific messages to the user.
      const preCheck = await fetch("/api/auth/pre-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (preCheck.status === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        return;
      }
      if (preCheck.status === "ACCOUNT_PENDING_APPROVAL") {
        setError("Your account is awaiting approval by the platform administrator.");
        return;
      }
      if (preCheck.status === "ACCOUNT_DELETED") {
        setError("This account has been deleted. Contact support if you need to reactivate it.");
        return;
      }
      if (preCheck.status === "ACCOUNT_SUSPENDED") {
        setError("Your account has been temporarily suspended. Contact support for assistance.");
        return;
      }

      // Step 2: Validate credentials
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      // Check if user has 2FA enabled
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionData?.user?.twoFactorEnabled) {
        const method = sessionData.user.twoFactorMethod ?? "totp";
        setTwoFactorMethod(method);
        setTwoFactorStep(true);
        if (method === "email") {
          await handleSendEmailOtp();
        }
        return;
      }

      await doRedirect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function doRedirect() {
    if (callbackUrl && callbackUrl !== "/") {
      router.push(callbackUrl);
    } else {
      const session = await fetch("/api/auth/session").then((r) => r.json());
      const userRole = session?.user?.role;
      if (userRole === "ADMIN") router.push("/admin");
      else if (userRole === "JOB_SEEKER") router.push("/dashboard");
      else router.push("/employer/dashboard");
    }
    router.refresh();
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center">
            <ShieldCheck size={24} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-500">
            Your account email <strong>{email}</strong> has not been verified yet. Please check your inbox for a verification link.
          </p>

          {resendSent ? (
            <div role="status" className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              {t("auth.resendSuccess")}
            </div>
          ) : (
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResendVerification}
              className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {resendLoading ? "Sending…" : t("auth.resendEmail")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setNeedsVerification(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            {t("common.back")} {t("auth.signIn").toLowerCase()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest flex-col justify-between p-12 relative overflow-hidden" aria-hidden="true">
        <div className="absolute top-8 left-8">
          <Starburst />
        </div>
        <div className="absolute bottom-48 left-8 flex gap-2 flex-wrap w-20">
          {DECORATION_COLORS.map((c, i) => (
            <div key={i} className={`h-5 w-5 rounded-sm ${c} opacity-80`} />
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-72 h-80">
            <div className="absolute inset-0 rounded-2xl bg-forest/60 rotate-3 shadow-xl" />
            <div className="absolute inset-0 rounded-2xl bg-forest/40 rotate-1 shadow-xl" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/signin1.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>

        <p className="text-xl font-semibold text-white leading-snug">
          Get connected to the best talents without distractions
        </p>
      </div>

      {/* Right panel */}
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>

          {twoFactorStep ? (
            /* ── 2FA Challenge ── */
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-brand-600" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t("auth.twoFactorTitle")}</h1>
                <p className="mt-2 text-sm text-gray-500">
                  {useBackupCode
                    ? "Enter one of your backup codes."
                    : twoFactorMethod === "email"
                    ? otpSent ? "Enter the code we sent to your email." : "We'll send a code to your email."
                    : "Enter the 6-digit code from your authenticator app."}
                </p>
              </div>

              {otpSent && twoFactorMethod === "email" && (
                <div role="status" className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                  {t("auth.codeSent")}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">
                    {useBackupCode ? "Backup code" : t("auth.otpCode")}
                  </label>
                  <input
                    ref={otpInputRef}
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={useBackupCode ? "XXXXX-XXXXX" : "000000"}
                    maxLength={useBackupCode ? 11 : 6}
                    className="input text-center text-lg tracking-widest font-mono"
                    aria-label={useBackupCode ? "Backup code" : t("auth.otpCode")}
                  />
                </div>

                {error && (
                  <div role="alert" className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpCode}
                  className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-busy={loading}
                >
                  {loading ? "Verifying…" : t("auth.verifyCode")}
                </button>
              </form>

              <div className="space-y-2 text-center text-sm">
                {twoFactorMethod === "email" && !useBackupCode && (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={loading}
                    className="flex items-center gap-1 mx-auto text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  >
                    <RefreshCw size={13} aria-hidden="true" /> Resend code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setUseBackupCode((b) => !b); setOtpCode(""); setError(null); }}
                  className="text-gray-500 hover:text-gray-700 block mx-auto"
                >
                  {useBackupCode ? "Use authenticator / email code" : t("auth.useBackupCode")}
                </button>
              </div>
            </div>
          ) : (
            /* ── Standard Login ── */
            <>
              <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">{t("auth.signIn")}</h1>

              {/* Role selector */}
              <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1" role="group" aria-label="Select account type">
                <button
                  type="button"
                  onClick={() => selectRole("JOB_SEEKER")}
                  aria-pressed={role === "JOB_SEEKER"}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    role === "JOB_SEEKER"
                      ? "bg-forest text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Search size={13} aria-hidden="true" />
                  {t("auth.jobSeeker")}
                </button>
                <button
                  type="button"
                  onClick={() => selectRole("EMPLOYER")}
                  aria-pressed={role === "EMPLOYER"}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    role === "EMPLOYER"
                      ? "bg-forest text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Building2 size={13} aria-hidden="true" />
                  {t("auth.recruiter")}
                </button>
              </div>

              {verifiedParam === "true" && (
                <div role="status" className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                  {t("auth.emailVerified")}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label={t("auth.email")}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@gmail.com"
                  autoComplete="email"
                />

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">{t("auth.password")}</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                    >
                      {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-brand-500"
                    />
                    {t("auth.rememberMe")}
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                {error && (
                  <div role="alert" className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {loading ? t("auth.signingIn") : t("auth.signIn")}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">{t("auth.orContinueWith")}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="space-y-2.5">
                <OAuthButton onClick={() => handleOAuth("google")}>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </OAuthButton>

                {role === "EMPLOYER" && (
                  <OAuthButton onClick={() => handleOAuth("microsoft-entra-id")}>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21" aria-hidden="true">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    Continue with Microsoft
                  </OAuthButton>
                )}

                <OAuthButton onClick={() => handleOAuth("linkedin")}>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </OAuthButton>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                {t("auth.noAccount")}{" "}
                <Link href="/register" className="font-semibold text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">{t("auth.signUp")}</Link>
              </p>

            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
