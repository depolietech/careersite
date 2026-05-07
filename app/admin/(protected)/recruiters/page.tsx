"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Briefcase, Shield, ShieldOff, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Recruiter = {
  id: string;
  email: string;
  isPublicEmail: boolean;
  emailVerified: string | null;
  createdAt: string;
  employerProfile: {
    id: string;
    companyName: string;
    industry: string | null;
    website: string | null;
    trustScore: number;
    isBlocked: boolean;
    verificationStatus: string;
    interviewsScheduled: number;
    interviewsCancelled: number;
  } | null;
  _count: { postedJobs: number };
};

const VERIFICATION_BADGE: Record<string, string> = {
  INCOMPLETE:     "bg-gray-100 text-gray-600",
  PENDING_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED:       "bg-green-100 text-green-700",
  REJECTED:       "bg-red-100 text-red-700",
};

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockedFilter, setBlockedFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("q",       search);
    if (blockedFilter) params.set("blocked", blockedFilter);
    const res = await fetch(`/api/admin/recruiters?${params}`);
    const data = await res.json();
    setRecruiters(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, blockedFilter]);

  useEffect(() => { fetchRecruiters(); }, [fetchRecruiters]);

  async function doAction(userId: string, action: "block" | "unblock" | "approve") {
    setActionLoading(userId + action);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    fetchRecruiters();
  }

  async function doDelete(userId: string) {
    setActionLoading(userId + "delete");
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    setConfirmDelete(null);
    setRecruiters((p) => p.filter((r) => r.id !== userId));
  }

  return (
    <div className="px-8 py-10 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruiters</h1>
        <p className="text-gray-500 mt-1">{recruiters.length} recruiter{recruiters.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input placeholder="Search by company or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)}>
          <option value="">All recruiters</option>
          <option value="true">Blocked only</option>
        </select>
        <Button size="sm" onClick={fetchRecruiters}><Search size={14} /> Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : recruiters.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">No recruiters found.</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Company", "Email", "Trust Score", "Verification", "Jobs Posted", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recruiters.map((r) => {
                const ep = r.employerProfile;
                const isBlocked = ep?.isBlocked ?? false;
                const vStatus = ep?.verificationStatus ?? "INCOMPLETE";

                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <Briefcase size={14} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ep?.companyName ?? "—"}</p>
                          {ep?.industry && <p className="text-xs text-gray-400">{ep.industry}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-700">{r.email}</p>
                      {r.isPublicEmail && (
                        <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 mt-0.5">Public email</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(ep?.trustScore ?? 0) >= 80 ? "bg-green-500" : (ep?.trustScore ?? 0) >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                            style={{ width: `${ep?.trustScore ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{ep?.trustScore ?? 0}%</span>
                      </div>
                      {ep && ep.interviewsCancelled > 0 && (
                        <p className="text-[10px] text-red-500 mt-0.5">{ep.interviewsCancelled} cancellation{ep.interviewsCancelled !== 1 ? "s" : ""}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${VERIFICATION_BADGE[vStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {vStatus.replace("_", " ")}
                      </span>
                      {isBlocked && (
                        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                          <AlertTriangle size={9} /> Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{r._count.postedJobs}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vStatus === "PENDING_REVIEW" && (
                          <Link href="/admin/verifications" className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50">
                            Review
                          </Link>
                        )}
                        {!isBlocked ? (
                          <button onClick={() => doAction(r.id, "block")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                            <Shield size={11} /> Block
                          </button>
                        ) : (
                          <button onClick={() => doAction(r.id, "unblock")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">
                            <ShieldOff size={11} /> Unblock
                          </button>
                        )}
                        {!r.emailVerified && (
                          <button onClick={() => doAction(r.id, "approve")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">
                            <CheckCircle size={11} /> Verify
                          </button>
                        )}
                        {confirmDelete === r.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => doDelete(r.id)} disabled={!!actionLoading} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(r.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
