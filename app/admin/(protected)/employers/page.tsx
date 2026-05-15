"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle, XCircle, Globe, Linkedin, MapPin, ShieldCheck, ShieldAlert, Clock, AlertTriangle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmployerRecord = {
  id: string;
  companyName: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  businessAddress: string | null;
  linkedinUrl: string | null;
  verificationStatus: string;
  verificationSubmittedAt: string | null;
  verificationNote: string | null;
  verificationDeclineReasons: string | null;
  requestedDocuments: string | null;
  websiteCheckPassed: boolean | null;
  domainMatchPassed: boolean | null;
  trustScore: number;
  isBlocked: boolean;
  interviewsCancelled: number;
  user: {
    id: string;
    email: string;
    isPublicEmail: boolean;
    emailVerified: string | null;
    createdAt: string;
  };
  _count: { postedJobs: number; reports: number };
};

const DECLINE_REASONS = [
  "Business email domain mismatch",
  "Website recently created or unverifiable",
  "Company cannot be verified (no public records)",
  "Missing business registration documents",
  "Suspicious activity detected",
  "Incomplete application — missing required information",
  "LinkedIn company page not found or mismatch",
  "Other",
];

const DOCUMENT_TYPES = [
  "Business registration certificate",
  "Tax certificate or EIN/BN letter",
  "Corporate website ownership proof",
  "LinkedIn company page link",
  "Government-issued business registration",
  "Utility or business invoice (showing company address)",
  "Corporate email verification",
  "Incorporation documents",
];

const STATUS_OPTIONS = [
  { value: "",                 label: "All statuses" },
  { value: "PENDING_REVIEW",  label: "Pending Review" },
  { value: "MORE_INFO_REQUIRED", label: "More Info Required" },
  { value: "INCOMPLETE",      label: "Incomplete" },
  { value: "APPROVED",        label: "Approved" },
  { value: "REJECTED",        label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  INCOMPLETE:          "bg-gray-100 text-gray-600",
  PENDING_REVIEW:      "bg-blue-100 text-blue-700",
  APPROVED:            "bg-green-100 text-green-700",
  REJECTED:            "bg-red-100 text-red-700",
  MORE_INFO_REQUIRED:  "bg-amber-100 text-amber-700",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  INCOMPLETE:         ShieldAlert,
  PENDING_REVIEW:     Clock,
  APPROVED:           ShieldCheck,
  REJECTED:           XCircle,
  MORE_INFO_REQUIRED: FileText,
};

function RejectModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (reasons: string[], note: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [note, setNote] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  function toggleReason(r: string) {
    setSelectedReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Reject Verification</h3>
        <p className="text-sm text-gray-500">Select decline reason(s) and optionally add a note.</p>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Decline reason(s):</p>
          {DECLINE_REASONS.map((r) => (
            <label key={r} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600"
                checked={selectedReasons.includes(r)}
                onChange={() => toggleReason(r)}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{r}</span>
            </label>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Additional note (optional):</p>
          <textarea
            className="input resize-none w-full"
            rows={3}
            placeholder="e.g. Website domain does not match email domain."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={() => onConfirm(selectedReasons, note)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

function RequestDocsModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (documents: string[], note: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [note, setNote] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  function toggleDoc(d: string) {
    setSelectedDocs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Request Additional Documents</h3>
        <p className="text-sm text-gray-500">
          The employer will be notified and their status set to &ldquo;More Info Required&rdquo;.
        </p>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Required documents:</p>
          {DOCUMENT_TYPES.map((d) => (
            <label key={d} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600"
                checked={selectedDocs.includes(d)}
                onChange={() => toggleDoc(d)}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{d}</span>
            </label>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Additional instructions (optional):</p>
          <textarea
            className="input resize-none w-full"
            rows={3}
            placeholder="e.g. Please ensure documents are dated within the last 3 months."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button
            loading={loading}
            onClick={() => onConfirm(selectedDocs, note)}
            disabled={selectedDocs.length === 0}
          >
            Send Request
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmployerRow({ emp, onAction }: { emp: EmployerRecord; onAction: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false);
  const StatusIcon = STATUS_ICON[emp.verificationStatus] ?? ShieldAlert;

  async function approve() {
    setActionLoading("approve");
    await fetch(`/api/admin/employers/${emp.id}/approve`, { method: "POST" });
    setActionLoading(null);
    onAction();
  }

  async function reject(reasons: string[], note: string) {
    setActionLoading("reject");
    await fetch(`/api/admin/employers/${emp.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reasons, note }),
    });
    setActionLoading(null);
    setShowRejectModal(false);
    onAction();
  }

  async function requestDocs(documents: string[], note: string) {
    setActionLoading("request-docs");
    await fetch(`/api/admin/employers/${emp.id}/request-docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents, note }),
    });
    setActionLoading(null);
    setShowRequestDocsModal(false);
    onAction();
  }

  let declineReasons: string[] = [];
  let requestedDocuments: string[] = [];
  try { declineReasons = emp.verificationDeclineReasons ? JSON.parse(emp.verificationDeclineReasons) : []; } catch { /* ignore */ }
  try { requestedDocuments = emp.requestedDocuments ? JSON.parse(emp.requestedDocuments) : []; } catch { /* ignore */ }

  return (
    <>
      {showRejectModal && (
        <RejectModal
          onConfirm={reject}
          onCancel={() => setShowRejectModal(false)}
          loading={actionLoading === "reject"}
        />
      )}
      {showRequestDocsModal && (
        <RequestDocsModal
          onConfirm={requestDocs}
          onCancel={() => setShowRequestDocsModal(false)}
          loading={actionLoading === "request-docs"}
        />
      )}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Summary row */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{emp.companyName}</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[emp.verificationStatus] ?? "bg-gray-100 text-gray-600"}`}>
                <StatusIcon size={11} />
                {emp.verificationStatus.replace(/_/g, " ")}
              </span>
              {emp.user.isPublicEmail && (
                <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Public email
                </span>
              )}
              {emp._count.reports > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">
                  <AlertTriangle size={10} /> {emp._count.reports} report{emp._count.reports !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{emp.user.email} · Trust {emp.trustScore}%</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {(emp.verificationStatus === "PENDING_REVIEW" || emp.verificationStatus === "MORE_INFO_REQUIRED") && (
              <>
                <button
                  type="button"
                  onClick={approve}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestDocsModal(true)}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                >
                  <FileText size={13} /> Request Docs
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
            {emp.verificationStatus === "APPROVED" && (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Revoke
              </button>
            )}
            {(emp.verificationStatus === "INCOMPLETE" || emp.verificationStatus === "REJECTED") && (
              <button
                type="button"
                onClick={approve}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={13} /> Approve anyway
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="ml-1 text-gray-400 hover:text-gray-600 p-1"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {emp.industry && (
                  <div>
                    <p className="text-xs text-gray-400">Industry</p>
                    <p className="text-gray-700">{emp.industry}</p>
                  </div>
                )}
                {emp.description && (
                  <div>
                    <p className="text-xs text-gray-400">About</p>
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-4">{emp.description}</p>
                  </div>
                )}
                {emp.website && (
                  <div className="flex items-start gap-2">
                    <Globe size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={emp.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">{emp.website}</a>
                      {emp.websiteCheckPassed !== null && (
                        <span className={`ml-2 text-xs font-medium ${emp.websiteCheckPassed ? "text-green-600" : "text-red-500"}`}>
                          {emp.websiteCheckPassed ? "✓ reachable" : "✗ unreachable"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {emp.businessAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Business Address</p>
                      <p className="text-gray-700">{emp.businessAddress}</p>
                    </div>
                  </div>
                )}
                {emp.linkedinUrl && (
                  <div className="flex items-start gap-2">
                    <Linkedin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">LinkedIn</p>
                      <a href={emp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">{emp.linkedinUrl}</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Auto checks</p>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className={`text-xs ${emp.domainMatchPassed ? "text-green-600" : emp.domainMatchPassed === false ? "text-amber-600" : "text-gray-400"}`}>
                      {emp.domainMatchPassed === null ? "—" : emp.domainMatchPassed ? "✓ Email domain matches website" : "⚠ Domain mismatch (may be public email)"}
                    </span>
                    <span className={`text-xs ${emp.websiteCheckPassed ? "text-green-600" : emp.websiteCheckPassed === false ? "text-red-500" : "text-gray-400"}`}>
                      {emp.websiteCheckPassed === null ? "—" : emp.websiteCheckPassed ? "✓ Website reachable" : "✗ Website unreachable"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Activity</p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {emp._count.postedJobs} jobs · {emp.interviewsCancelled} cancellations · {emp._count.reports} reports
                  </p>
                </div>
                {emp.verificationSubmittedAt && (
                  <div>
                    <p className="text-xs text-gray-400">Submitted</p>
                    <p className="text-xs text-gray-700">
                      {new Date(emp.verificationSubmittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                )}
                {declineReasons.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Decline reasons</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {declineReasons.map((r) => (
                        <li key={r} className="text-xs text-red-600">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {requestedDocuments.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Requested documents</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {requestedDocuments.map((d) => (
                        <li key={d} className="text-xs text-amber-700">• {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {emp.verificationNote && (
                  <div>
                    <p className="text-xs text-gray-400">Admin note</p>
                    <p className="text-xs text-red-600">{emp.verificationNote}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile action buttons */}
            <div className="flex sm:hidden gap-2 pt-1 flex-wrap">
              {(emp.verificationStatus === "PENDING_REVIEW" || emp.verificationStatus === "MORE_INFO_REQUIRED") && (
                <>
                  <button type="button" onClick={approve} disabled={!!actionLoading} className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button type="button" onClick={() => setShowRequestDocsModal(true)} disabled={!!actionLoading} className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                    <FileText size={13} /> Docs
                  </button>
                  <button type="button" onClick={() => setShowRejectModal(true)} disabled={!!actionLoading} className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <XCircle size={13} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<EmployerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("q",      search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/employers?${params}`);
    const data = await res.json();
    setEmployers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

  const pendingCount = employers.filter((e) => e.verificationStatus === "PENDING_REVIEW").length;
  const moreInfoCount = employers.filter((e) => e.verificationStatus === "MORE_INFO_REQUIRED").length;

  return (
    <div className="px-8 py-10 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Verification</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
          Review and approve employer accounts before they can post jobs.
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5">
              {pendingCount} pending
            </span>
          )}
          {moreInfoCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
              {moreInfoCount} awaiting docs
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by company or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by verification status"
          className="input w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button size="sm" onClick={fetchEmployers}>
          <Search size={14} /> Search
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : employers.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">
          No employers found.
        </div>
      ) : (
        <div className="space-y-3">
          {employers.map((emp) => (
            <EmployerRow key={emp.id} emp={emp} onAction={fetchEmployers} />
          ))}
        </div>
      )}
    </div>
  );
}
