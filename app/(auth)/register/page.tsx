"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Users, Briefcase, Building2, UserCog, ArrowRight, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { useI18n } from "@/lib/i18n";

type Role = "JOB_SEEKER" | "EMPLOYER";
type RecruiterType = "COMPANY" | "AGENCY";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();

  const roles = [
    {
      id: "JOB_SEEKER" as Role,
      icon: Users,
      title: t("auth.jobSeeker"),
      desc: "Find jobs where you're evaluated on skills and experience alone.",
      color: "border-brand-500 bg-brand-50",
    },
    {
      id: "EMPLOYER" as Role,
      icon: Briefcase,
      title: t("auth.recruiter"),
      desc: "Post jobs and review candidates — as a company or on behalf of one.",
      color: "border-violet-500 bg-violet-50",
    },
  ];

  const recruiterTypes = [
    {
      id: "COMPANY" as RecruiterType,
      icon: Building2,
      title: "We're a company",
      desc: "We hire directly for our own open roles.",
    },
    {
      id: "AGENCY" as RecruiterType,
      icon: UserCog,
      title: "We're a recruiter / agency",
      desc: "We recruit and place candidates on behalf of client companies.",
    },
  ];
  async function handleOAuth(provider: string) {
    await fetch("/api/auth/pending-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const paramCallback = params.get("callbackUrl");
    const dest = (paramCallback && paramCallback !== "/")
      ? paramCallback
      : role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard";
    await signIn(provider, { callbackUrl: dest });
  }

  const paramRole = params.get("role");

  const initialRole: Role | null =
    paramRole === "job-seeker" ? "JOB_SEEKER" :
    paramRole === "employer"   ? "EMPLOYER"   :
    paramRole === "recruiter"  ? "EMPLOYER"   :
    paramRole === "contractor" ? "EMPLOYER"   : null;

  const [step, setStep] = useState<"role" | "details">(initialRole ? "details" : "role");
  const [role, setRole] = useState<Role | null>(initialRole);
  const [recruiterType, setRecruiterType] = useState<RecruiterType>("COMPANY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedRecruiterTerms, setAgreedRecruiterTerms] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
  });

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email)) {
      setError("Please enter a valid email address (e.g. you@example.com)");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to create an account.");
      return;
    }
    if (role === "EMPLOYER" && !agreedRecruiterTerms) {
      setError("Recruiters must also agree to the Recruiter Agreement to create an account.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role,
          recruiterType: role === "EMPLOYER" ? recruiterType : undefined,
          agreedToTerms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      router.push(`/check-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900" aria-label="Equalhires home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white" aria-hidden="true">
            <ShieldCheck size={18} />
          </span>
          Equalhires
        </Link>
        <p className="text-sm text-gray-500">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {step === "role" ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">{t("auth.joinEqualhires")}</h1>
                <p className="mt-2 text-gray-500">How will you be using Equalhires?</p>
              </div>

              <div className="space-y-3" role="group" aria-label="Select account type">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRole(r.id); setStep("details"); }}
                    aria-label={`${r.title}: ${r.desc}`}
                    className={`w-full text-left rounded-2xl border-2 p-5 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      role === r.id ? r.color : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0" aria-hidden="true">
                        <r.icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{r.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{r.desc}</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-gray-400 shrink-0" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <button
                  onClick={() => setStep("role")}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  aria-label="Go back to role selection"
                >
                  <ArrowLeft size={14} aria-hidden="true" /> {t("common.back")}
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{t("auth.createAccount")}</h1>
                <p className="mt-2 text-gray-500">
                  Joining as{" "}
                  <span className="font-medium text-gray-800">
                    {roles.find((r) => r.id === role)?.title}
                  </span>
                </p>
              </div>

              {/* OAuth options */}
              <div className="card p-6 space-y-3">
                <p className="text-sm font-medium text-gray-700 text-center">Continue with</p>
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                {role === "EMPLOYER" && (
                  <button
                    type="button"
                    onClick={() => handleOAuth("microsoft-entra-id")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21" aria-hidden="true">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    Microsoft
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOAuth("linkedin")}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">or sign up with email</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="card p-8 space-y-5" noValidate>
                {role === "JOB_SEEKER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" required value={form.firstName} onChange={field("firstName")} placeholder="Alex" autoComplete="given-name" />
                    <Input label="Last name" required value={form.lastName} onChange={field("lastName")} placeholder="Smith" autoComplete="family-name" />
                  </div>
                )}

                {role === "EMPLOYER" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700" id="recruiter-type-label">How do you hire?</p>
                      <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="recruiter-type-label">
                        {recruiterTypes.map((rt) => (
                          <button
                            key={rt.id}
                            type="button"
                            onClick={() => setRecruiterType(rt.id)}
                            aria-pressed={recruiterType === rt.id}
                            className={`text-left rounded-xl border-2 p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                              recruiterType === rt.id
                                ? "border-violet-500 bg-violet-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <rt.icon size={16} className={recruiterType === rt.id ? "text-violet-600 mb-1" : "text-gray-400 mb-1"} aria-hidden="true" />
                            <p className="text-xs font-semibold text-gray-900">{rt.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{rt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label={recruiterType === "COMPANY" ? "Company name" : "Agency or firm name"}
                      required
                      value={form.companyName}
                      onChange={field("companyName")}
                      placeholder={recruiterType === "COMPANY" ? "Acme Inc." : "Talent Partners LLC"}
                      autoComplete="organization"
                    />
                  </>
                )}

                <Input
                  label={t("auth.email")}
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <div className="space-y-2">
                  <Input
                    label={t("auth.password")}
                    type="password"
                    showToggle
                    required
                    value={form.password}
                    onChange={field("password")}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    aria-describedby="password-strength"
                  />
                  <div id="password-strength">
                    <PasswordStrengthMeter password={form.password} />
                  </div>
                </div>

                <Input
                  label={t("auth.confirmPassword")}
                  type="password"
                  showToggle
                  required
                  value={form.confirmPassword}
                  onChange={field("confirmPassword")}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />

                <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-brand-500"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link href="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">
                        Terms &amp; Conditions
                      </Link>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedPrivacy}
                      onChange={(e) => setAgreedPrivacy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-brand-500"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link href="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {role === "EMPLOYER" && (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedRecruiterTerms}
                        onChange={(e) => setAgreedRecruiterTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-brand-500"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link href="/recruiter-agreement" target="_blank" className="font-medium text-brand-600 hover:underline">
                          Recruiter Agreement
                        </Link>
                      </span>
                    </label>
                  )}
                </div>

                {error && (
                  <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                  disabled={!agreedTerms || !agreedPrivacy || (role === "EMPLOYER" && !agreedRecruiterTerms)}
                  aria-busy={loading}
                >
                  {loading ? t("auth.creatingAccount") : t("auth.signUp")} <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
