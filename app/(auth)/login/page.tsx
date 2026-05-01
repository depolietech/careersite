"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/Logo";
import { Starburst } from "@/components/shared/Starburst";

const DECORATION_COLORS = ["bg-blue-400", "bg-purple-400", "bg-blue-300", "bg-purple-300"];

interface SocialButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}
function SocialButton({ onClick, children }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-brand-100 bg-brand-50 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
    >
      {children}
    </button>
  );
}

type Role = "JOB_SEEKER" | "EMPLOYER";

const ROLE_DEMOS: Record<Role, { email: string; password: string }> = {
  JOB_SEEKER: { email: "seeker.active@demo.com",    password: "demo1234" },
  EMPLOYER:   { email: "recruiter.active@demo.com", password: "demo1234" },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const verifiedParam  = params.get("verified");
  const errorParam     = params.get("error");

  const [role, setRole]             = useState<Role>("JOB_SEEKER");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(
    errorParam === "invalid-token"  ? "That verification link is invalid." :
    errorParam === "expired-token"  ? "That verification link has expired. Please request a new one." :
    null
  );

  function selectRole(r: Role) {
    setRole(r);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      if (callbackUrl && callbackUrl !== "/") {
        router.push(callbackUrl);
      } else {
        const session = await fetch("/api/auth/session").then((r) => r.json());
        const role = session?.user?.role;
        router.push(role === "JOB_SEEKER" ? "/dashboard" : "/employer/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest flex-col justify-between p-12 relative overflow-hidden">
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
              <Image src="/images/signin1.jpg" alt="Connect with top talent" fill className="object-cover" />
            </div>
          </div>
        </div>

        <p className="text-xl font-semibold text-white leading-snug">
          Get connected to the best talents without distractions
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>

          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Sign in</h1>

          {/* Role selector */}
          <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
            {(["JOB_SEEKER", "EMPLOYER"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRole(r)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === r
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "JOB_SEEKER" ? "Job Seeker" : "Recruiter"}
              </button>
            ))}
          </div>

          {verifiedParam === "true" && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Email verified! You can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
                Forgot your password?
              </Link>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">OR</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="space-y-3">
            <SocialButton>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </SocialButton>
            <SocialButton>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </SocialButton>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">Sign up</Link>
          </p>

          <div className="mt-8">
            <p className="text-center text-xs text-gray-400 mb-3">
              Try a demo {role === "JOB_SEEKER" ? "Job Seeker" : "Recruiter"} account
            </p>
            <button
              type="button"
              onClick={() => {
                const demo = ROLE_DEMOS[role];
                setEmail(demo.email);
                setPassword(demo.password);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
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
