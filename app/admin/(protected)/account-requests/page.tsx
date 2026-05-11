"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, RotateCcw, Flame, CheckCircle, ShieldOff, RefreshCw } from "lucide-react";

type RequestRecord = {
  id: string;
  email: string;
  role: string;
  deletedAt: string;
  reinstateRequestedAt: string;
  reinstateType: string | null;
  jobSeekerProfile: { firstName: string; lastName: string } | null;
  employerProfile: { companyName: string } | null;
};

const TYPE_LABELS: Record<string, { label: string; color: string; description: string }> = {
  restore:     { label: "Reinstate account",  color: "bg-blue-50 text-blue-700 border-blue-200",   description: "User wants to restore their old profile, applications, and history." },
  new_account: { label: "New account request", color: "bg-purple-50 text-purple-700 border-purple-200", description: "User wants to permanently delete old data and start a fresh account." },
  contact:     { label: "Support contact",     color: "bg-amber-50 text-amber-700 border-amber-200",    description: "User contacted support for manual review." },
};

export default function AccountRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users?pending=true");
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function doAction(userId: string, action: "reinstate" | "reject_reinstate" | "purge") {
    setActionLoading(userId + action);
    await fetch(`/api/admin/users/${userId}`, {
      method: action === "purge" ? "PATCH" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    setConfirmPurge(null);
    fetchRequests();
  }

  const pending = requests.filter((r) => r.reinstateType !== "contact");
  const contacts = requests.filter((r) => r.reinstateType === "contact");

  return (
    <div className="px-8 py-10 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Requests</h1>
        <p className="text-gray-500 mt-1">
          {pending.length} pending request{pending.length !== 1 ? "s" : ""}{contacts.length > 0 ? `, ${contacts.length} support contact${contacts.length !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">No pending requests</p>
          <p className="text-xs text-gray-400 mt-1">All account requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const typeInfo = TYPE_LABELS[r.reinstateType ?? "contact"] ?? TYPE_LABELS.contact;
            const displayName = r.jobSeekerProfile
              ? `${r.jobSeekerProfile.firstName} ${r.jobSeekerProfile.lastName}`.trim() || r.email
              : r.employerProfile?.companyName || r.email;
            const isContact = r.reinstateType === "contact";

            return (
              <div
                key={r.id}
                className={`rounded-2xl border bg-white p-5 space-y-3 shadow-sm ${isContact ? "opacity-80" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{r.role.replace("_", " ")}</span>
                    </div>
                    <p className="text-sm text-gray-500">{r.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested {new Date(r.reinstateRequestedAt).toLocaleString()} · Account deleted {new Date(r.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{typeInfo.description}</p>

                {!isContact && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {/* Approve */}
                    <button
                      onClick={() => doAction(r.id, "reinstate")}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      {r.reinstateType === "new_account" ? "Approve & purge old data" : "Approve & reinstate"}
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => doAction(r.id, "reject_reinstate")}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <ShieldOff size={12} /> Reject request
                    </button>

                    {/* Purge (hard delete) */}
                    {confirmPurge === r.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => doAction(r.id, "purge")}
                          disabled={!!actionLoading}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm Purge
                        </button>
                        <button
                          onClick={() => setConfirmPurge(null)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmPurge(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Flame size={12} /> Purge account
                      </button>
                    )}
                  </div>
                )}

                {isContact && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => doAction(r.id, "reject_reinstate")}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RotateCcw size={12} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
    </div>
  );
}
