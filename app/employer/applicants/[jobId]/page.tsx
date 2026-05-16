"use client";
import { useState, use, useEffect, useMemo } from "react";
import {
  EyeOff, Calendar, ChevronDown, ChevronUp,
  ArrowLeft, MapPin, Clock, Star, StarOff, X, Loader2, User, BarChart2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, TextArea } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

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

// ─── Schedule Interview Modal ──────────────────────────────────────────────
const MEETING_LINK_PATTERN =
  /^https?:\/\/([\w-]+\.)?((zoom\.us|us\d+web\.zoom\.us)\/(j|my|wc)\/|(meet\.google\.com|hangouts\.google\.com)\/([\w-]+)|teams\.microsoft\.com\/l\/meetup-join\/|teams\.live\.com\/meet\/|gotomeeting\.com\/join\/|webex\.com\/meet\/|whereby\.com\/)/i;

function validateMeetingLink(url: string): boolean {
  if (!url) return true; // optional field
  return MEETING_LINK_PATTERN.test(url);
}

function ScheduleModal({ candidateCode, applicationId, onClose, onScheduled }: {
  candidateCode: string;
  applicationId: string;
  onClose: () => void;
  onScheduled: (id: string) => void;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [interviewType, setInterviewType] = useState("video");
  const [submitError, setSubmitError] = useState("");

  const INTERVIEW_TYPES = [
    { value: "video",     label: t("interview.videoCall") },
    { value: "phone",     label: t("interview.phoneCall") },
    { value: "in-person", label: t("interview.inPerson") },
  ];

  const isVideoType = interviewType === "video";

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setMeetingLink(v);
    if (v && !validateMeetingLink(v)) {
      setLinkError(t("interview.invalidMeetingLink"));
    } else {
      setLinkError("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    if (isVideoType && !meetingLink.trim()) {
      setLinkError("A meeting link is required for video interviews.");
      return;
    }
    if (meetingLink && !validateMeetingLink(meetingLink)) {
      setLinkError(t("interview.invalidMeetingLink"));
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/applications/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          scheduledAt: fd.get("scheduledAt"),
          duration: Number(fd.get("duration") ?? 60),
          type: interviewType,
          meetingLink: meetingLink || null,
          notes: fd.get("notes"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "Failed to schedule interview.");
        setLoading(false);
        return;
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    onScheduled(applicationId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-lg overflow-y-auto max-h-[90vh] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("interview.schedule")}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("interview.schedule")} — <strong>{candidateCode}</strong>
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>

        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800 flex items-start gap-2">
          <EyeOff size={15} className="shrink-0 mt-0.5" />
          {t("interview.scheduleRevealNote")}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="scheduledAt" label={t("interview.dateTime")} type="datetime-local" required />
            <Select
              name="type"
              label={t("interview.interviewFormat")}
              options={INTERVIEW_TYPES}
              value={interviewType}
              onChange={(e) => { setInterviewType(e.target.value); setLinkError(""); }}
              required
            />
          </div>
          <Select name="duration" label={t("interview.interviewDuration")} options={[
            { value: "30", label: t("interview.duration30") },
            { value: "45", label: t("interview.duration45") },
            { value: "60", label: t("interview.duration60") },
            { value: "90", label: t("interview.duration90") },
          ]} />
          <div className="space-y-1">
            <Input
              label={`${t("interview.meetingLink")}${isVideoType ? " *" : " (optional)"}`}
              placeholder="https://meet.google.com/... or Zoom/Teams link"
              value={meetingLink}
              onChange={handleLinkChange}
              required={isVideoType}
            />
            {linkError && <p className="text-xs text-red-600">{linkError}</p>}
            {isVideoType && !linkError && (
              <p className="text-xs text-amber-600">Required for video interviews. Supported: Zoom, Google Meet, Microsoft Teams, Webex, GoToMeeting, Whereby.</p>
            )}
            {!isVideoType && <p className="text-xs text-gray-400">{t("interview.supportedLinks")}</p>}
          </div>
          <TextArea name="notes" label={t("interview.notesForCandidate")} placeholder={t("interview.notesForCandidatePlaceholder")} />

          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">{submitError}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" loading={loading}>
              <Calendar size={16} /> {t("interview.confirmReveal")}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Candidate Card ────────────────────────────────────────────────────────
function CandidateCard({
  candidate,
  onStatusChange,
}: {
  candidate: Candidate;
  jobId: string;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { profile } = candidate;
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [localStatus, setLocalStatus] = useState(candidate.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancellingInterview, setCancellingInterview] = useState(false);

  const STATUS_LABELS: Record<string, string> = {
    PENDING:              t("status.pending"),
    REVIEWING:            t("status.reviewing"),
    SHORTLISTED:          t("status.shortlisted"),
    FORWARDED:            t("status.forwarded"),
    INTERVIEW_SCHEDULED:  t("status.interviewStage"),
    INTERVIEW_COMPLETED:  "Interview Completed",
    OFFER_MADE:           t("status.offerMade"),
    HIRED:                t("status.hired"),
    REJECTED:             t("status.rejected"),
  };

  const STATUS_OPTIONS = [
    { value: "PENDING",              label: t("status.pending") },
    { value: "REVIEWING",            label: t("status.reviewing") },
    { value: "SHORTLISTED",          label: t("status.shortlisted") },
    { value: "FORWARDED",            label: t("status.forwarded") },
    { value: "INTERVIEW_COMPLETED",  label: "Interview Completed" },
    { value: "OFFER_MADE",           label: t("status.offerMade") },
    { value: "HIRED",                label: t("status.hired") },
    { value: "REJECTED",             label: t("status.rejected") },
  ];

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
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t("employer.identityRevealed")}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{profile.headline}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("employer.appliedOn")} {appliedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStarred((s) => !s)}
                className={`btn-ghost p-2 rounded-xl ${starred ? "text-amber-500" : "text-gray-400"}`}
                title={starred ? "Remove from shortlist" : "Add to shortlist"}
                aria-label={starred ? "Remove from shortlist" : "Add to shortlist"}
              >
                {starred ? <Star size={18} className="fill-amber-400" /> : <StarOff size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-label={expanded ? "Collapse candidate details" : "Expand candidate details"}
                className="btn-ghost p-2 rounded-xl text-gray-400"
              >
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
            {profile.yearsExperience != null && <span>{profile.yearsExperience} {t("employer.yrsExp")}</span>}
            {profile.location && <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>}
            {profile.jobType && <span className="flex items-center gap-1"><Clock size={12} />{profile.jobType}</span>}
            {profile.salaryMin != null && (
              <span>${(profile.salaryMin / 1000).toFixed(0)}k–${(profile.salaryMax! / 1000).toFixed(0)}k {t("employer.salaryExpected")}</span>
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
              <label htmlFor={`status-${candidate.id}`} className="text-xs font-medium text-gray-500">{t("employer.statusLabel")}:</label>
              <select
                id={`status-${candidate.id}`}
                value={localStatus}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updatingStatus}
                aria-label="Update application status"
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {updatingStatus && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>

            {/* Schedule interview button — show unless already at terminal/interview state */}
            {!["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "REJECTED", "OFFER_MADE", "HIRED"].includes(localStatus) && (
              <Button type="button" size="sm" onClick={() => setShowSchedule(true)}>
                <Calendar size={14} /> {t("interview.scheduleInterview")}
              </Button>
            )}
            {localStatus === "INTERVIEW_SCHEDULED" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl px-3 py-1.5">
                  <Calendar size={14} /> {t("employer.interviewScheduledBadge")}
                </div>
                <button
                  type="button"
                  onClick={cancelInterview}
                  disabled={cancellingInterview}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancellingInterview ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  {t("interview.cancel")}
                </button>
              </div>
            )}
          </div>

          {/* Post-interview action prompt */}
          {localStatus === "INTERVIEW_COMPLETED" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Interview completed — what's next?</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => updateStatus("OFFER_MADE")}
                  loading={updatingStatus}
                >
                  🎉 Send Offer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => updateStatus("SHORTLISTED")}
                  loading={updatingStatus}
                >
                  Shortlist for Later
                </Button>
                <button
                  type="button"
                  onClick={() => updateStatus("REJECTED")}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Not a Fit
                </button>
              </div>
            </div>
          )}

          {localStatus === "OFFER_MADE" && (
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 flex items-center gap-2 text-sm text-green-800">
              🎉 <span>Offer sent — the candidate has been notified and will respond from their dashboard.</span>
            </div>
          )}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-6">
            {/* Cover letter */}
            {candidate.coverLetter && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{t("profile.coverLetter")}</p>
                <p className="text-sm text-gray-600 italic">&ldquo;{candidate.coverLetter}&rdquo;</p>
              </div>
            )}

            {/* Work experience */}
            {profile.workExperiences.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t("profile.workExperience")}</p>
                <div className="space-y-4">
                  {profile.workExperiences.map((w) => (
                    <div key={w.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900">{w.title}</p>
                        {revealed && w.company ? (
                          <span className="text-xs text-gray-500">{w.company}</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <EyeOff size={11} /> {t("employer.companyHidden")}
                          </div>
                        )}
                      </div>
                      {w.current && <span className="badge bg-green-100 text-green-700">{t("profile.current")}</span>}
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
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t("profile.education")}</p>
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
                        <EyeOff size={11} /> {t("employer.schoolHidden")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Revealed contact info */}
            {revealed && (profile.firstName || (profile as { phone?: string | null }).phone) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{t("employer.contact")}</p>
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
const PIPELINE_LABELS: Record<string, { label: string; cls: string }> = {
  OPEN:            { label: "Actively Hiring",          cls: "text-green-700 bg-green-50 border border-green-200" },
  IN_REVIEW:       { label: "Reviewing Applications",   cls: "text-amber-700 bg-amber-50 border border-amber-200" },
  INTERVIEW_STAGE: { label: "Interview Stage",          cls: "text-blue-700 bg-blue-50 border border-blue-200" },
  OFFERED:         { label: "Offer Sent",               cls: "text-purple-700 bg-purple-50 border border-purple-200" },
  FILLED:          { label: "Position Filled",          cls: "text-gray-600 bg-gray-100 border border-gray-300" },
  CLOSED:          { label: "Closed",                   cls: "text-red-700 bg-red-50 border border-red-200" },
};

export default function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { t } = useI18n();
  const [filter, setFilter] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState("OPEN");
  const [updatingPipeline, setUpdatingPipeline] = useState(false);

  useEffect(() => {
    fetch(`/api/applications?jobId=${jobId}`)
      .then((r) => r.json())
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.title) setJobTitle(data.title);
        if (data.pipelineStatus) setPipelineStatus(data.pipelineStatus);
      })
      .catch(() => {});
  }, [jobId]);

  function handleStatusChange(id: string, status: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }

  const stats = useMemo(() => ({
    total:      candidates.length,
    reviewing:  candidates.filter((c) => ["REVIEWING", "SHORTLISTED", "FORWARDED"].includes(c.status)).length,
    interviews: candidates.filter((c) => ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED"].includes(c.status)).length,
    offers:     candidates.filter((c) => ["OFFER_MADE", "HIRED"].includes(c.status)).length,
  }), [candidates]);

  async function updatePipeline(newStatus: string, jobStatus?: string) {
    setUpdatingPipeline(true);
    const body: Record<string, string> = { pipelineStatus: newStatus };
    if (jobStatus) body.status = jobStatus;
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) setPipelineStatus(newStatus);
    setUpdatingPipeline(false);
  }

  const filtered = filter === "all"
    ? candidates
    : candidates.filter((c) => c.status.toLowerCase() === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> {t("employer.backToDashboard")}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("employer.applicantsTitle")}</h1>
            <p className="text-gray-500 mt-1">
              {candidates.length} · {t("employer.identitiesMasked")}
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { value: "all",        label: t("employer.all") },
              { value: "pending",    label: t("status.pending") },
              { value: "reviewing",  label: t("status.reviewing") },
              { value: "shortlisted",label: t("status.shortlisted") },
            ].map((f) => (
              <button
                type="button"
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  filter === f.value ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Stats Panel */}
      {!loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Hiring Pipeline</p>
                {jobTitle && <p className="text-xs text-gray-400 mt-0.5">{jobTitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const pipe = PIPELINE_LABELS[pipelineStatus] ?? PIPELINE_LABELS["OPEN"];
                return (
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${pipe.cls}`}>
                    {pipe.label}
                  </span>
                );
              })()}
              {pipelineStatus === "FILLED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={updatingPipeline}
                  onClick={() => updatePipeline("OPEN")}
                >
                  {updatingPipeline ? <Loader2 size={13} className="animate-spin" /> : null}
                  Reopen Position
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={updatingPipeline}
                  onClick={() => updatePipeline("FILLED")}
                >
                  {updatingPipeline ? <Loader2 size={13} className="animate-spin" /> : null}
                  Mark as Filled
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Applicants", value: stats.total,      color: "text-gray-900" },
              { label: "In Review",        value: stats.reviewing,   color: "text-amber-700" },
              { label: "Interviews",       value: stats.interviews,  color: "text-blue-700" },
              { label: "Offers Made",      value: stats.offers,      color: "text-green-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bias info banner */}
      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800 flex items-center gap-3">
        <EyeOff size={16} className="text-brand-600 shrink-0" />
        <span>
          {t("employer.anonymousCandidatesDesc")}
          <strong className="ml-1">{t("employer.schedulingReveals")}</strong>
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
          <p className="font-semibold text-gray-900">{t("employer.noApplicantsYet")}</p>
          <p className="text-sm text-gray-500">{t("employer.applicantsAppear")}</p>
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
