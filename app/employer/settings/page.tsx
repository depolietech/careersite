"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Building2, Trash2, X, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete account</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800 space-y-1">
          <p className="font-semibold">This action is permanent and cannot be undone.</p>
          <p>Your company profile, all posted jobs, and all associated data will be deleted immediately.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
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

export default function EmployerSettingsPage() {
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
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
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

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your company profile and security settings.</p>
        </div>

        {/* Company profile link */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Building2 size={16} className="text-violet-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Company Profile</h2>
          </div>
          <p className="text-sm text-gray-500">
            Update your company name, industry, size, website, and description to attract the right candidates.
          </p>
          <Link href="/employer/company/edit">
            <Button variant="secondary" type="button">Edit company profile</Button>
          </Link>
        </div>

        {/* Change password */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <ShieldCheck size={16} className="text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>

          {pwSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Password updated successfully.
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input label="Current password" type="password" showToggle required value={pwForm.current} onChange={pwField("current")} placeholder="••••••••" />
            <Input label="New password" type="password" showToggle required value={pwForm.next} onChange={pwField("next")} placeholder="Min 8 characters" />
            <Input label="Confirm new password" type="password" showToggle required value={pwForm.confirm} onChange={pwField("confirm")} placeholder="Repeat new password" />

            {pwError && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {pwError}
              </div>
            )}

            <Button type="submit" loading={pwLoading}>Update password</Button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 size={16} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-500">
            Deleting your account will permanently remove your company profile, all posted jobs, and associated data.
          </p>
          <Button variant="danger" type="button" onClick={() => setShowDeleteModal(true)}>
            Delete account
          </Button>
        </div>
      </div>
    </>
  );
}
