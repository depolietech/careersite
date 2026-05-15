"use client";
import { useEffect, useState } from "react";
import {
  Calendar, Clock, Video, Phone, MapPin, Plus, Loader2, ArrowLeft,
  X, RefreshCw, AlertTriangle, CalendarPlus, Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, TextArea } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { buildGoogleCalendarUrl, buildOutlookCalendarUrl } from "@/lib/calendarUtils";

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Video, phone: Phone, "in-person": MapPin,
};

type Interview = {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  meetingLink: string | null;
  notes: string | null;
  seekerStatus: string;
  application: { job: { id: string; title: string } };
};

const MEETING_LINK_PATTERN =
  /^https?:\/\/([\w-]+\.)?((zoom\.us|us\d+web\.zoom\.us)\/(j|my|wc)\/|(meet\.google\.com|hangouts\.google\.com)\/([\w-]+)|teams\.microsoft\.com\/l\/meetup-join\/|teams\.live\.com\/meet\/|gotomeeting\.com\/join\/|webex\.com\/meet\/|whereby\.com\/)/i;

function validateMeetingLink(url: string) {
  if (!url) return true;
  return MEETING_LINK_PATTERN.test(url);
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function toLocalInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EmployerCalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tz, setTz] = useState("");
  const { t } = useI18n();

  const INTERVIEW_TYPES = [
    { value: "video",     label: t("interview.videoCall") },
    { value: "phone",     label: t("interview.phoneCall") },
    { value: "in-person", label: t("interview.inPerson") },
  ];

  const CANCEL_REASONS = [
    { value: "",                    label: t("interview.selectReason") },
    { value: "Role cancelled",      label: t("interview.reasonRoleCancelled") },
    { value: "Candidate mismatch",  label: t("interview.reasonCandidateMismatch") },
    { value: "Scheduling conflict", label: t("interview.reasonSchedulingConflict") },
    { value: "Other",               label: t("profile.other") },
  ];

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledAt: "", duration: "60", type: "video", meetingLink: "", notes: "",
  });
  const [rescheduleLinkError, setRescheduleLinkError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    fetch("/api/interviews")
      .then((r) => r.json())
      .then((d) => { setInterviews(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));

    const tzName = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "";
    setTz(tzName);
  }, []);

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function fmtTime(s: string, duration: number) {
    const start = new Date(s);
    const end = new Date(start.getTime() + duration * 60000);
    const timeStr = `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return tz ? `${timeStr} (${tz})` : timeStr;
  }
  function fmtSlot(d: Date) {
    return (
      d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      " at " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  }

  function hasConflict(proposedAtStr: string, durationMin: number, excludeId: string): boolean {
    if (!proposedAtStr) return false;
    const proposed = new Date(proposedAtStr);
    const proposedEnd = new Date(proposed.getTime() + durationMin * 60000);
    return interviews.some((iv) => {
      if (iv.id === excludeId) return false;
      const ivStart = new Date(iv.scheduledAt);
      const ivEnd = new Date(ivStart.getTime() + iv.duration * 60000);
      return proposed < ivEnd && proposedEnd > ivStart;
    });
  }

  function getSuggestedSlots(excludeId: string, durationMin: number): Date[] {
    const slots: Date[] = [];
    const now = new Date();
    const hours = [9, 11, 13, 15];
    for (let day = 1; slots.length < 4 && day <= 14; day++) {
      const base = new Date();
      base.setDate(base.getDate() + day);
      if (base.getDay() === 0 || base.getDay() === 6) continue;
      for (const h of hours) {
        if (slots.length >= 4) break;
        const slot = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, 0, 0);
        if (slot <= now) continue;
        const slotEnd = new Date(slot.getTime() + durationMin * 60000);
        const conflict = interviews.some((iv) => {
          if (iv.id === excludeId) return false;
          const ivStart = new Date(iv.scheduledAt);
          const ivEnd = new Date(ivStart.getTime() + iv.duration * 60000);
          return slot < ivEnd && slotEnd > ivStart;
        });
        if (!conflict) slots.push(slot);
      }
    }
    return slots;
  }

  async function handleCancel(id: string) {
    if (!cancelReason) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/interviews?id=${id}&reason=${encodeURIComponent(cancelReason)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setInterviews((prev) => prev.filter((iv) => iv.id !== id));
        setCancellingId(null);
        setCancelReason("");
        if (data.blocked) alert(t("employer.accountBlocked"));
      }
    } finally {
      setCancelling(false);
    }
  }

  function openReschedule(iv: Interview) {
    const local = new Date(iv.scheduledAt);
    setRescheduleForm({
      scheduledAt: toLocalInputValue(local),
      duration: String(iv.duration),
      type: iv.type,
      meetingLink: iv.meetingLink ?? "",
      notes: iv.notes ?? "",
    });
    setRescheduleLinkError("");
    setReschedulingId(iv.id);
  }

  async function handleReschedule(id: string) {
    if (!rescheduleForm.scheduledAt) return;
    if (rescheduleForm.meetingLink && !validateMeetingLink(rescheduleForm.meetingLink)) {
      setRescheduleLinkError(t("interview.invalidMeetingLink"));
      return;
    }
    setRescheduling(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: id,
          scheduledAt: rescheduleForm.scheduledAt,
          duration: Number(rescheduleForm.duration),
          type: rescheduleForm.type,
          meetingLink: rescheduleForm.meetingLink || null,
          notes: rescheduleForm.notes || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInterviews((prev) =>
          prev.map((iv) => iv.id === id ? { ...iv, ...updated, seekerStatus: "PENDING" } : iv)
        );
        setReschedulingId(null);
      }
    } finally {
      setRescheduling(false);
    }
  }

  const seekerBadge = (status: string) => {
    if (status === "ACCEPTED") return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{t("interview.acceptedByCandidate")}</span>;
    if (status === "REJECTED") return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{t("interview.declinedByCandidate")}</span>;
    if (status === "RESCHEDULE_REQUESTED") return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{t("interview.rescheduleRequestedStatus")}</span>;
    return <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t("interview.awaitingCandidateResponse")}</span>;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={14} /> {t("employer.backToDashboard")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("interview.calendarTitle")}</h1>
          <p className="text-gray-500 mt-1">{t("interview.employerCalendarDesc")}</p>
        </div>
        <Link
          href="/employer/applicants"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <Plus size={14} /> {t("interview.scheduleInterview")}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : interviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">{t("interview.noInterviews")}</p>
          <p className="text-sm text-gray-500">{t("interview.noInterviewsEmployer")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => {
            const Icon = TYPE_ICON[iv.type] ?? Video;
            const isCancelling = cancellingId === iv.id;
            const isRescheduling = reschedulingId === iv.id;

            const calEvent = {
              title: `Interview: ${iv.application.job.title}`,
              start: new Date(iv.scheduledAt),
              durationMinutes: iv.duration,
              description: iv.notes ?? undefined,
              location: iv.meetingLink ?? undefined,
            };

            const conflictDetected = isRescheduling
              ? hasConflict(rescheduleForm.scheduledAt, Number(rescheduleForm.duration), iv.id)
              : false;

            const suggestedSlots = isRescheduling
              ? getSuggestedSlots(iv.id, Number(rescheduleForm.duration))
              : [];

            return (
              <div key={iv.id} className="card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/employer/applicants/${iv.application.job.id}`} className="font-bold text-gray-900 hover:text-brand-600">
                        {iv.application.job.title}
                      </Link>
                      {seekerBadge(iv.seekerStatus ?? "PENDING")}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{fmtDate(iv.scheduledAt)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} />{fmtTime(iv.scheduledAt, iv.duration)}</span>
                      <span className="flex items-center gap-1.5 capitalize"><Icon size={13} />{iv.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {iv.meetingLink && (
                      <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors">
                        <Video size={13} /> Join
                      </a>
                    )}
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{t("interview.confirmed")}</span>
                    {!isCancelling && !isRescheduling && (
                      <>
                        <button
                          type="button"
                          onClick={() => openReschedule(iv)}
                          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> {t("interview.reschedule")}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCancellingId(iv.id); setCancelReason(""); setReschedulingId(null); }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <X size={12} /> {t("interview.cancel")}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Add to Calendar buttons */}
                {!isCancelling && !isRescheduling && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                      <CalendarPlus size={12} /> Add to calendar:
                    </span>
                    <a
                      href={buildGoogleCalendarUrl(calEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Google Calendar
                    </a>
                    <a
                      href={buildOutlookCalendarUrl(calEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Outlook
                    </a>
                    <a
                      href={`/api/calendar/ics?id=${iv.id}`}
                      download="interview.ics"
                      className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Apple / Other (.ics)
                    </a>
                  </div>
                )}

                {/* Reschedule form */}
                {isRescheduling && (
                  <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-4">
                    <p className="text-sm font-semibold text-brand-800">{t("interview.reschedulePanel")}</p>

                    {/* Suggested slots */}
                    {suggestedSlots.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1 text-xs font-medium text-brand-700">
                          <Lightbulb size={12} /> Suggested available slots:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedSlots.map((slot) => (
                            <button
                              key={slot.toISOString()}
                              type="button"
                              onClick={() => setRescheduleForm((f) => ({ ...f, scheduledAt: toLocalInputValue(slot) }))}
                              className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                            >
                              {fmtSlot(slot)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label={t("interview.newDateTime")}
                        type="datetime-local"
                        value={rescheduleForm.scheduledAt}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                        required
                      />
                      <Select
                        label={t("interview.format")}
                        options={INTERVIEW_TYPES}
                        value={rescheduleForm.type}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, type: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        label={t("interview.interviewDuration")}
                        options={[
                          { value: "30", label: t("interview.duration30") },
                          { value: "45", label: t("interview.duration45") },
                          { value: "60", label: t("interview.duration60") },
                          { value: "90", label: t("interview.duration90") },
                        ]}
                        value={rescheduleForm.duration}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, duration: e.target.value }))}
                      />
                      <div className="space-y-1">
                        <Input
                          label={t("interview.meetingLink")}
                          placeholder={t("interview.meetingLinkPlaceholder")}
                          value={rescheduleForm.meetingLink}
                          onChange={(e) => {
                            setRescheduleForm((f) => ({ ...f, meetingLink: e.target.value }));
                            setRescheduleLinkError(e.target.value && !validateMeetingLink(e.target.value) ? t("interview.invalidMeetingLink") : "");
                          }}
                        />
                        {rescheduleLinkError && <p className="text-xs text-red-600">{rescheduleLinkError}</p>}
                      </div>
                    </div>
                    <TextArea
                      label={t("interview.notesForCandidate")}
                      placeholder={t("interview.notesForCandidatePlaceholder")}
                      value={rescheduleForm.notes}
                      onChange={(e) => setRescheduleForm((f) => ({ ...f, notes: e.target.value }))}
                    />

                    {/* Conflict warning */}
                    {conflictDetected && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                        <span>This time overlaps with another scheduled interview. Consider a different slot.</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" loading={rescheduling} onClick={() => handleReschedule(iv.id)}>
                        <RefreshCw size={13} /> {t("interview.confirmReschedule")}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setReschedulingId(null)}>
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cancel form */}
                {isCancelling && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">{t("interview.cancelPanel")}</p>
                    <p className="text-xs text-red-600">{t("interview.cancelWarning")}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        aria-label={t("interview.selectReason")}
                        className="input flex-1 text-sm min-w-[180px]"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      >
                        {CANCEL_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!cancelReason || cancelling}
                        onClick={() => handleCancel(iv.id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cancelling ? t("interview.cancelling") : t("interview.confirmCancel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCancellingId(null); setCancelReason(""); }}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {t("interview.keep")}
                      </button>
                    </div>
                  </div>
                )}

                {iv.notes && !isRescheduling && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
                    <strong className="text-gray-700">{t("interview.notes")}</strong>{iv.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
