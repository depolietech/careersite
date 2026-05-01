"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Users, Briefcase, Building2, UserCog, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "JOB_SEEKER" | "EMPLOYER";
type RecruiterType = "COMPANY" | "AGENCY";

const roles: { id: Role; icon: React.ElementType; title: string; desc: string; color: string }[] = [
  {
    id: "JOB_SEEKER",
    icon: Users,
    title: "Job Seeker",
    desc: "Find jobs where you're evaluated on skills and experience alone.",
    color: "border-brand-500 bg-brand-50",
  },
  {
    id: "EMPLOYER",
    icon: Briefcase,
    title: "Recruiter",
    desc: "Post jobs and review candidates — as a company or on behalf of one.",
    color: "border-violet-500 bg-violet-50",
  },
];

const recruiterTypes: { id: RecruiterType; icon: React.ElementType; title: string; desc: string }[] = [
  {
    id: "COMPANY",
    icon: Building2,
    title: "We're a company",
    desc: "We hire directly for our own open roles.",
  },
  {
    id: "AGENCY",
    icon: UserCog,
    title: "We're a recruiter / agency",
    desc: "We recruit and place candidates on behalf of client companies.",
  },
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
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
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck size={18} />
          </span>
          EqualHire
        </Link>
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {step === "role" ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Join EqualHire</h1>
                <p className="mt-2 text-gray-500">How will you be using EqualHire?</p>
              </div>

              <div className="space-y-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRole(r.id); setStep("details"); }}
                    className={`w-full text-left rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                      role === r.id ? r.color : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <r.icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{r.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{r.desc}</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-gray-400 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <button onClick={() => setStep("role")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
                  <ArrowLeft size={14} /> Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
                <p className="mt-2 text-gray-500">
                  Joining as{" "}
                  <span className="font-medium text-gray-800">
                    {roles.find((r) => r.id === role)?.title}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="card p-8 space-y-5">
                {role === "JOB_SEEKER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" required value={form.firstName} onChange={field("firstName")} placeholder="Alex" />
                    <Input label="Last name" required value={form.lastName} onChange={field("lastName")} placeholder="Smith" />
                  </div>
                )}

                {role === "EMPLOYER" && (
                  <>
                    {/* Recruiter type selector */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">How do you hire?</p>
                      <div className="grid grid-cols-2 gap-3">
                        {recruiterTypes.map((rt) => (
                          <button
                            key={rt.id}
                            type="button"
                            onClick={() => setRecruiterType(rt.id)}
                            className={`text-left rounded-xl border-2 p-3 transition-all ${
                              recruiterType === rt.id
                                ? "border-violet-500 bg-violet-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <rt.icon size={16} className={recruiterType === rt.id ? "text-violet-600 mb-1" : "text-gray-400 mb-1"} />
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
                    />
                  </>
                )}

                <Input
                  label="Email address"
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  placeholder="you@example.com"
                />
                <Input
                  label="Password"
                  type="password"
                  showToggle
                  required
                  value={form.password}
                  onChange={field("password")}
                  placeholder="Min 8 characters"
                  hint="Use at least 8 characters"
                />
                <Input
                  label="Confirm password"
                  type="password"
                  showToggle
                  required
                  value={form.confirmPassword}
                  onChange={field("confirmPassword")}
                  placeholder="Repeat your password"
                />

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Create account <ArrowRight size={16} />
                </Button>

                <p className="text-center text-xs text-gray-400">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
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
