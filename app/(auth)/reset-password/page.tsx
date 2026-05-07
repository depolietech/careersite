"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Invalid link</h1>
          <p className="text-gray-500">This password reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="inline-block text-brand-600 hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Password updated</h1>
          <p className="text-gray-500">Your password has been reset. You can now sign in with your new password.</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
          <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Input
              label="New password"
              type="password"
              showToggle
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <Input
            label="Confirm new password"
            type="password"
            showToggle
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}{" "}
              {error.toLowerCase().includes("expired") && (
                <Link href="/forgot-password" className="font-medium underline">
                  Request a new link
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
