"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Shield, ShieldOff, Trash2, CheckCircle, User, Briefcase, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRecord = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: string | null;
  jobSeekerProfile: { firstName: string; lastName: string; headline: string | null } | null;
  employerProfile: {
    companyName: string;
    isBlocked: boolean;
    interviewsScheduled: number;
    interviewsCancelled: number;
    trustScore: number;
  } | null;
  _count: { applications: number; postedJobs: number };
};

const ROLE_OPTIONS = [
  { value: "",           label: "All roles" },
  { value: "JOB_SEEKER", label: "Job Seekers" },
  { value: "EMPLOYER",   label: "Employers" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)     params.set("q",    search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function doAction(userId: string, action: "block" | "unblock" | "approve") {
    setActionLoading(userId + action);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    fetchUsers();
  }

  async function doDelete(userId: string) {
    setActionLoading(userId + "delete");
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    setConfirmDelete(null);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <div className="px-8 py-10 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">{users.length} user{users.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-44"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button size="sm" onClick={fetchUsers}>
          <Search size={14} /> Search
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">No users found.</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["User", "Role", "Stats", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isBlocked = u.employerProfile?.isBlocked ?? false;
                const isVerified = !!u.emailVerified;
                const displayName = u.jobSeekerProfile
                  ? `${u.jobSeekerProfile.firstName} ${u.jobSeekerProfile.lastName}`.trim() || u.email
                  : u.employerProfile?.companyName || u.email;

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {u.role === "EMPLOYER" ? <Briefcase size={14} className="text-gray-500" /> : <User size={14} className="text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                        u.role === "EMPLOYER" ? "bg-purple-100 text-purple-700" :
                        u.role === "ADMIN"    ? "bg-red-100 text-red-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {u.role === "JOB_SEEKER" && <span>{u._count.applications} apps</span>}
                      {u.role === "EMPLOYER" && (
                        <div className="space-y-0.5">
                          <p>{u._count.postedJobs} jobs posted</p>
                          {u.employerProfile && (
                            <p>{u.employerProfile.interviewsCancelled} cancels · Trust {u.employerProfile.trustScore}%</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {isBlocked && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={10} /> Blocked
                          </span>
                        )}
                        {!isVerified && (
                          <span className="inline-flex text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}
                        {!isBlocked && isVerified && (
                          <span className="inline-flex text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!isVerified && (
                          <button
                            onClick={() => doAction(u.id, "approve")}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            <CheckCircle size={11} /> Approve
                          </button>
                        )}
                        {u.role === "EMPLOYER" && !isBlocked && (
                          <button
                            onClick={() => doAction(u.id, "block")}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            <Shield size={11} /> Block
                          </button>
                        )}
                        {u.role === "EMPLOYER" && isBlocked && (
                          <button
                            onClick={() => doAction(u.id, "unblock")}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            <ShieldOff size={11} /> Unblock
                          </button>
                        )}
                        {u.role !== "ADMIN" && (
                          confirmDelete === u.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => doDelete(u.id)}
                                disabled={!!actionLoading}
                                className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          )
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
