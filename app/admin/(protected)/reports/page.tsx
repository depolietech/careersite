"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle, XCircle, Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Report = {
  id: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { email: string };
  employerProfile: { companyName: string; trustScore: number };
  job: { title: string } | null;
};

const STATUS_OPTIONS = [
  { value: "",         label: "All" },
  { value: "PENDING",  label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "DISMISSED",label: "Dismissed" },
];

const CATEGORY_LABEL: Record<string, string> = {
  FAKE_JOB:        "Fake Job",
  SCAM:            "Scam",
  MISLEADING_ROLE: "Misleading Role",
  OTHER:           "Other",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  REVIEWED:  "bg-blue-50 text-blue-700 border-blue-200",
  DISMISSED: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function updateStatus(id: string, status: "REVIEWED" | "DISMISSED") {
    setActionLoading(id + status);
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setActionLoading(null);
    fetchReports();
  }

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="px-8 py-10 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Reports</h1>
        <p className="text-gray-500 mt-1">
          Community reports filed by job seekers.
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
              <AlertTriangle size={10} /> {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === o.value ? "bg-forest text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="secondary" onClick={fetchReports}><Search size={14} /> Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">No reports found.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
                    <Flag size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{CATEGORY_LABEL[report.category] ?? report.category}</span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[report.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Against <span className="font-medium text-gray-700">{report.employerProfile.companyName}</span>
                      {report.job && <> · Job: <span className="font-medium text-gray-700">{report.job.title}</span></>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Reported by {report.reporter.email} · {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {report.description && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{report.description}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="h-1.5 w-12 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${report.employerProfile.trustScore >= 80 ? "bg-green-500" : report.employerProfile.trustScore >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                          style={{ width: `${report.employerProfile.trustScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">Trust {report.employerProfile.trustScore}%</span>
                    </div>
                  </div>
                </div>

                {report.status === "PENDING" && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => updateStatus(report.id, "REVIEWED")}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap"
                    >
                      <CheckCircle size={12} /> Mark Reviewed
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, "DISMISSED")}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                    >
                      <XCircle size={12} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
