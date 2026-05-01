"use client";
import { useState, use, useEffect } from "react";
import {
  EyeOff, Calendar, Send, ChevronDown, ChevronUp,
  ArrowLeft, MapPin, Clock, Star, StarOff, X, Loader2, User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, TextArea } from "@/components/ui/input";

type WorkExp = {
  id: string; title: string; roleCategory: string | null;
  description: string | null; skills: string[]; current: boolean;
  durationYears: number | null;
  company?: string; startDate?: string; endDate?: string | null;
};
type Education = {
  id: string; degree: string; field: string | null; durationYears: number | null;
  institution?: string; startYear?: number; endYear?: number | null;
};
type Profile = {
  id: string; candidateCode: string; headline: string | null; summary: string | null;
  skills: string[]; yearsExperience: number | null; jobType: string | null;
  salaryMin: number | null; salaryMax: number | null; location: string | null;
  firstName?: string; lastName?: string;
  workExperiences: WorkExp[]; educations: Education[];
};
type Candidate = {
  id: string; status: string; createdAt: string; revealed: boolean;
  coverLetter?: string | null;
  interview: { id: string; scheduledAt: string; meetingLink: string | null } | null;
  profile: Profile;
};

const STATUS_COLORS: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  PENDING:             "default",
  REVIEWING:           "info",
  SHORTLISTED:         "success",
  FORWARDED:           "info",
  INTERVIEW_SCHEDULED: "success",
  OFFER_MADE:          "success",
  HIRED:               "success",
  REJECTED:            "danger",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:             "Pending",
  REVIEWING:           "Reviewing",
  SHORTLISTED:         "Shortlisted",
  FORWARDED:           "Forwarded",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  OFFER_MADE:          "Offer Made",
  HIRED:               "Hired",
  REJECTED:            "Rejected",
};

const INTERVIEW_TYPES = [
  { value: "video",      label: "Video call" },
  { value: "phone",      label: "Phone call" },
  { value: "in-person",  label: "In person" },
];

const STATUS_OPTIONS = [
  { value: "PENDING",    label: "Pending" },
  { value: "REVIEWING",  label: "Reviewing" },
  { value: "SHORTLISTED",label: "Shortlisted" },
  { value: "FORWARDED",  label: "Forwarded" },
  { value: "OFFER_MADE", label: "Offer Made" },
  { value: "HIRED",      label: "Hired" },
  { value: "REJECTED",   label: "Rejected" },
];

// ─── Schedule Interview Modal ──────────────────────────────────────────────
function ScheduleModal({ candidateCode, applicationId, onClose, onScheduled }: {
  candidateCode: string;
  applicationId: string;
  onClose: () => void;
  onScheduled: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/applications/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        scheduledAt: fd.get("scheduledAt"),
        duration: Number(fd.get("duration") ?? 60),
        type: fd.get("type"),
        meetingLink: fd.get("meetingLink"),
        notes: fd.get("notes"),
      }),
    });
    setLoading(false);
    onScheduled(applicationId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Scheduling will reveal <strong>{candidateCode}</strong>&apos;s identity.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>

        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800 flex items-start gap-2">
          <EyeOff size={15} className="shrink-0 mt-0.5" />
          Once scheduled, the candidate&apos;s name, photo, and contact details will be revealed to you automatically.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input name="scheduledAt" label="Date & time" type="datetime-local" required />
            <Select name="type" label="Interview format" options={INTERVIEW_TYPES} required />
          </div>
          <Select name="duration" label="Duration" options={[
            { value: "30", label: "30 minutes" },
            { value: "45", label: "45 minutes" },
            { value: "60", label: "1 hour" },
            { value: "90", label: "90 minutes" },
          ]} />
          <Input name="meetingLink" label="Meeting link" placeholder="https://meet.google.com/..." />
          <TextArea name="notes" label="Notes for candidate" placeholder="Anything the candidate should prepare or know beforehand..." />

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" loading={loading}>
              <Calendar size={16} /> Confirm & reveal identity
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Candidate Card ────────────────────────────────────────────────────────
function CandidateCard({
  candidate,
  jobId,
  onStatusChange,
}: {
  candidate: Candidate;
  jobId: string;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { profile } = candidate;
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [localStatus, setLocalStatus] = useState(candidate.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancellingInterview, setCancellingInterview] = useState(false);

  const revealed = candidate.revealed;
  const displayName = revealed && profile.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : profile.candidateCode;

  async function updateStatus(newStatus: string) {
    if (newStatus === localStatus) return;
    setUpdatingStatus(true);
    await fetch("/api/applications/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: candidate.id, status: newStatus }),
    });
    setLocalStatus(newStatus);
    onStatusChange(candidate.id, newStatus);
    setUpdatingStatus(false);
  }

  function handleScheduled() {
    setLocalStatus("INTERVIEW_SCHEDULED");
    onStatusChange(candidate.id, "INTERVIEW_SCHEDULED");
  }

  async function cancelInterview() {
    if (!candidate.interview) return;
    setCancellingInterview(true);
    await fetch(`/api/interviews?id=${candidate.interview.id}`, { method: "DELETE" });
    setLocalStatus("SHORTLISTED");
    onStatusChange(candidate.id, "SHORTLISTED");
    setCancellingInterview(false);
  }

  const appliedAt = new Date(candidate.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <>
      {showSchedule && (
        <ScheduleModal
          candidateCode={profile.candidateCode}
          applicationId={candidate.id}
          onClose={() => setShowSchedule(false)}
          onScheduled={handleScheduled}
        />
      )}

      <div className="card overflow-hidden">
        {/* Card header */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                {revealed
                  ? <User size={18} className="text-brand-600" />
                  : <EyeOff size={18} className="text-brand-500" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-lg">{displayName}</p>
                  <Badge variant={STATUS_COLORS[localStatus] ?? "default"}>
                    {STATUS_LABELS[localStatus] ?? localStatus}
                  </Badge>
                  {revealed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Identity revealed</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{profile.headline}</p>
                <p className="text-xs text-gray-400 mt-0.5">Applied {appliedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setStarred((s) => !s)}
                className={`btn-ghost p-2 rounded-xl ${starred ? "text-amber-500" : "text-gray-400"}`}
                title="Shortlist"
              >
                {starred ? <Star size={18} className="fill-amber-400" /> : <StarOff size={18} />}
              </button>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="btn-ghost p-2 rounded-xl text-gray-400"
              >
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
            {profile.yearsExperience != null && <span>{profile.yearsExperience} yrs exp</span>}
            {profile.location && <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>}
            {profile.jobType && <span className="flex items-center gap-1"><Clock size={12} />{profile.jobType}</span>}
            {profile.salaryMin != null && (
              <span>${(profile.salaryMin / 1000).toFixed(0)}k–${(profile.salaryMax! / 1000).toFixed(0)}k expected</span>
            )}
          </div>

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
              ))}
            </div>
          )}

          {/* Summary */}
          {profile.summary && (
            <p className="text-sm text-gray-600 leading-relaxed">{profile.summary}</p>
          )}

          {/* Status change */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Status:</label>
              <select
                value={localStatus}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updatingStatus}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {updatingStatus && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>

            {/* Actions */}
            {localStatus !== "INTERVIEW_SCHEDULED" && localStatus !== "REJECTED" && localStatus !== "OFFER_MADE" && localStatus !== "HIRED" && (
              <Button size="sm" onClick={() => setShowSchedule(true)}>
                <Calendar size={14} /> Schedule Interview
              </Button>
            )}
            {localStatus === "INTERVIEW_SCHEDULED" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl px-3 py-1.5">
                  <Calendar size={14} /> Interview scheduled
                </div>
                <button
                  onClick={cancelInterview}
                  disabled={cancellingInterview}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancellingInterview ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  Cancel interview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-6">
            {/* Cover letter */}
            {candidate.coverLetter && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Cover Letter</p>
                <p className="text-sm text-gray-600 italic">&ldquo;{candidate.coverLetter}&rdquo;</p>
              </div>
            )}

            {/* Work experience */}
            {profile.workExperiences.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Work Experience</p>
                <div className="space-y-4">
                  {profile.workExperiences.map((w) => (
                    <div key={w.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900">{w.title}</p>
                        {revealed && w.company ? (
                          <span className="text-xs text-gray-500">{w.company}</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <EyeOff size={11} /> Company hidden
                          </div>
                        )}
                      </div>
                      {w.current && <span className="badge bg-green-100 text-green-700">Current</span>}
                      {w.durationYears != null && (
                        <p className="text-xs text-gray-400">{w.durationYears} yr{w.durationYears !== 1 ? "s" : ""}</p>
                      )}
                      {w.description && <p className="text-sm text-gray-600">{w.description}</p>}
                      <div className="flex flex-wrap gap-1">
                        {w.skills.map((s) => <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.educations.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Education</p>
                {profile.educations.map((e) => (
                  <div key={e.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                      {revealed && e.institution && (
                        <p className="text-sm text-gray-500">{e.institution}{e.startYear ? ` · ${e.startYear}–${e.endYear ?? "Present"}` : ""}</p>
                      )}
                    </div>
                    {!revealed && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                        <EyeOff size={11} /> School & dates hidden
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Revealed contact info */}
            {revealed && (profile.firstName || (profile as { phone?: string | null }).phone) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Contact</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{profile.firstName} {profile.lastName}</p>
                  {(profile as { phone?: string | null }).phone && <p>{(profile as { phone?: string | null }).phone}</p>}
                  {(profile as { linkedinUrl?: string | null }).linkedinUrl && (
                    <a href={(profile as { linkedinUrl?: string | null }).linkedinUrl!} className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [filter, setFilter] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applications?jobId=${jobId}`)
      .then((r) => r.json())
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  function handleStatusChange(id: string, status: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }

  const filtered = filter === "all"
    ? candidates
    : candidates.filter((c) => c.status.toLowerCase() === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
            <p className="text-gray-500 mt-1">
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} · Identities masked until interview
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {["all", "pending", "reviewing", "shortlisted"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bias info banner */}
      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800 flex items-center gap-3">
        <EyeOff size={16} className="text-brand-600 shrink-0" />
        <span>
          Candidates are shown as anonymous codes. Names, photos, school names, company names, and dates are hidden.
          <strong className="ml-1">Scheduling an interview reveals the full profile.</strong>
        </span>
      </div>

      {/* Candidate list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <EyeOff size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No applicants yet</p>
          <p className="text-sm text-gray-500">Applications will appear here once candidates apply.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} jobId={jobId} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
