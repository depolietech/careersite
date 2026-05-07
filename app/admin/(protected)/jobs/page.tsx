"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Briefcase, PauseCircle, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Job = {
  id: string;
  title: string;
  location: string;
  jobType: string;
  status: string;
  createdAt: string;
  employerProfile: { companyName: string; trustScore: number } | null;
  _count: { applications: number };
};

const STATUS_OPTIONS = [
  { value: "",       label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
  { value: "DRAFT",  label: "Draft" },
];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-amber-100 text-amber-700",
  CLOSED: "bg-gray-100 text-gray-500",
  DRAFT:  "bg-orange-100 text-orange-700",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("q",      search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/jobs?${params}`);
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function setJobStatus(id: string, status: string) {
    setActionLoading(id + status);
    await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setActionLoading(null);
    fetchJobs();
  }

  return (
    <div className="px-8 py-10 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input placeholder="Search by title or company…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button size="sm" onClick={fetchJobs}><Search size={14} /> Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">No jobs found.</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Job", "Company", "Type / Location", "Applications", "Status", "Posted", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Briefcase size={14} className="text-gray-500" />
                      </div>
                      <p className="font-medium text-gray-900 max-w-[160px] truncate">{job.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {job.employerProfile?.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 capitalize">{job.jobType.replace("-", " ")}</p>
                    <p className="text-xs text-gray-400">{job.location}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{job._count.applications}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {job.status !== "ACTIVE" && (
                        <button onClick={() => setJobStatus(job.id, "ACTIVE")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">
                          <CheckCircle size={11} /> Activate
                        </button>
                      )}
                      {job.status === "ACTIVE" && (
                        <button onClick={() => setJobStatus(job.id, "PAUSED")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                          <PauseCircle size={11} /> Pause
                        </button>
                      )}
                      {job.status !== "CLOSED" && (
                        <button onClick={() => setJobStatus(job.id, "CLOSED")} disabled={!!actionLoading} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                          <XCircle size={11} /> Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
