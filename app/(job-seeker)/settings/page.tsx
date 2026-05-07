"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2, X, AlertTriangle, Globe } from "lucide-react";
import { signOut } from "next-auth/react";
import { TwoFactorSettings } from "@/components/shared/TwoFactorSettings";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { useI18n, type Locale } from "@/lib/i18n";

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirm !== "DELETE") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete account");
      }
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0" aria-hidden="true">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <h2 id="delete-dialog-title" className="text-xl font-bold text-gray-900">Delete account</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Close dialog">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800 space-y-1">
          <p className="font-semibold">This action is permanent and cannot be undone.</p>
          <p>All your applications, profile data, and account information will be deleted immediately.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="delete-confirm" className="block text-sm font-medium text-gray-700">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            id="delete-confirm"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            aria-describedby={error ? "delete-error" : undefined}
          />
        </div>

        {error && (
          <div id="delete-error" role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            disabled={confirm !== "DELETE" || loading}
            loading={loading}
            onClick={handleDelete}
          >
            Delete my account
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

const LANGUAGE_OPTIONS: { code: Locale; label: string }[] = [
  { code: "en",    label: "English" },
  { code: "fr-CA", label: "Français (Canada)" },
  { code: "es-MX", label: "Español (México)" },
];

export default function SettingsPage() {
  const { locale, setLocale } = useI18n();

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function pwField(k: keyof typeof pwForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPwForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    setPwError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

      <main id="main-content" className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your security and account preferences.</p>
        </div>

        {/* Language */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center" aria-hidden="true">
              <Globe size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Language</h2>
          </div>
          <p className="text-sm text-gray-500">Choose your preferred language for the interface.</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Select language">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                aria-pressed={locale === l.code}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  locale === l.code
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-factor authentication */}
        <TwoFactorSettings />

        {/* Change password */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center" aria-hidden="true">
              <ShieldCheck size={16} className="text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>

          {pwSuccess && (
            <div role="status" className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Password updated successfully.
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <Input
              label="Current password"
              type="password"
              showToggle
              required
              value={pwForm.current}
              onChange={pwField("current")}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <div className="space-y-2">
              <Input
                label="New password"
                type="password"
                showToggle
                required
                value={pwForm.next}
                onChange={pwField("next")}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={pwForm.next} />
            </div>
            <Input
              label="Confirm new password"
              type="password"
              showToggle
              required
              value={pwForm.confirm}
              onChange={pwField("confirm")}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />

            {pwError && (
              <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {pwError}
              </div>
            )}

            <Button type="submit" loading={pwLoading}>
              Update password
            </Button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-6 space-y-4 border-red-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center" aria-hidden="true">
              <Trash2 size={16} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-500">
            Deleting your account is permanent. All your applications and profile data will be removed immediately.
          </p>
          <Button variant="danger" type="button" onClick={() => setShowDeleteModal(true)}>
            Delete account
          </Button>
        </div>
      </main>
    </>
  );
}
