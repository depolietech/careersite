"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, User, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Seeker = {
  id: string;
  email: string;
  emailVerified: string | null;
  createdAt: string;
  jobSeekerProfile: {
    firstName: string;
    lastName: string;
    headline: string | null;
    skills: string;
    yearsExperience: number | null;
    jobType: string | null;
  } | null;
  _count: { applications: number };
};

export default function AdminJobSeekersPage() {
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchSeekers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/job-seekers?${params}`);
    const data = await res.json();
    setSeekers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchSeekers(); }, [fetchSeekers]);

  async function doDelete(userId: string) {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    setConfirmDelete(null);
    setSeekers((p) => p.filter((s) => s.id !== userId));
  }

  async function doApprove(userId: string) {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setActionLoading(null);
    fetchSeekers();
  }

  return (
    <div className="px-8 py-10 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Seekers</h1>
        <p className="text-gray-500 mt-1">{seekers.length} seeker{seekers.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" onClick={fetchSeekers}><Search size={14} /> Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : seekers.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">No job seekers found.</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Seeker", "Skills / Headline", "Experience", "Applications", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {seekers.map((s) => {
                const name = s.jobSeekerProfile
                  ? `${s.jobSeekerProfile.firstName} ${s.jobSeekerProfile.lastName}`.trim()
                  : "—";
                const skills = s.jobSeekerProfile?.skills
                  ? (() => { try { return JSON.parse(s.jobSeekerProfile.skills) as string[]; } catch { return []; } })()
                  : [];
                const isVerified = !!s.emailVerified;

                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <User size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{name || s.email}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {s.jobSeekerProfile?.headline && (
                        <p className="text-xs text-gray-600 truncate">{s.jobSeekerProfile.headline}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skills.slice(0, 3).map((sk) => (
                          <span key={sk} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{sk}</span>
                        ))}
                        {skills.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {s.jobSeekerProfile?.yearsExperience != null ? `${s.jobSeekerProfile.yearsExperience} yr${s.jobSeekerProfile.yearsExperience !== 1 ? "s" : ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s._count.applications}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!isVerified && (
                          <button
                            onClick={() => doApprove(s.id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            <CheckCircle size={11} /> Verify
                          </button>
                        )}
                        {confirmDelete === s.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => doDelete(s.id)} disabled={!!actionLoading} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(s.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
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
