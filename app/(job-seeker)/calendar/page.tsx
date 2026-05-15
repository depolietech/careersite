"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Loader2, CheckCircle, XCircle, RefreshCw, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, TextArea } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
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
  seekerRescheduleProposedAt: string | null;
  seekerRescheduleNote: string | null;
  application: { job: { title: string; location: string } };
};

type ActionPanel = "reject" | "reschedule" | null;

function InterviewCard({ interview, tz, onUpdated }: { interview: Interview; tz: string; onUpdated: (iv: Interview) => void }) {
  const Icon = TYPE_ICON[interview.type] ?? Video;
  const { t } = useI18n();
  const [panel, setPanel] = useState<ActionPanel>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [saving, setSaving] = useState(false);

  const REJECT_REASONS = [
    { value: "",                       label: t("interview.selectReason") },
    { value: "Schedule conflict",      label: t("interview.reasonScheduleConflict") },
    { value: "No longer interested",   label: t("interview.reasonNoLongerInterested") },
    { value: "Accepted another offer", label: t("interview.reasonAnotherOffer") },
    { value: "Role not a good fit",    label: t("interview.reasonRoleNotFit") },
    { value: "Other",                  label: t("profile.other") },
  ];

  const status = interview.seekerStatus ?? "PENDING";

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function fmtTime(s: string, duration: number) {
    const start = new Date(s);
    const end = new Date(start.getTime() + duration * 60000);
    const timeStr = `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return tz ? `${timeStr} (${tz})` : timeStr;
  }

  const calEvent = {
    title: `Interview: ${interview.application.job.title}`,
    start: new Date(interview.scheduledAt),
    durationMinutes: interview.duration,
    description: interview.notes ?? undefined,
    location: interview.meetingLink ?? undefined,
  };

  async function sendAction(action: "ACCEPTED" | "REJECTED" | "RESCHEDULE_REQUESTED") {
    if (action === "REJECTED" && !rejectReason) return;
    if (action === "RESCHEDULE_REQUESTED" && !rescheduleAt) return;
    setSaving(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.id,
          action,
          rejectionReason: rejectReason || undefined,
          rescheduleProposedAt: rescheduleAt || undefined,
          rescheduleNote: rescheduleNote || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdated({ ...interview, ...updated });
        setPanel(null);
      }
    } finally {
      setSaving(false);
    }
  }

  const statusBadge = () => {
    if (status === "ACCEPTED")
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{t("interview.acceptedStatus")}</span>;
    if (status === "REJECTED")
      return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">{t("interview.declinedStatus")}</span>;
    if (status === "RESCHEDULE_REQUESTED")
      return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{t("interview.rescheduleRequestedStatus")}</span>;
    return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{t("interview.awaitingResponseStatus")}</span>;
  };

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-lg">{interview.application.job.title}</p>
            {statusBadge()}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{fmtDate(interview.scheduledAt)}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{fmtTime(interview.scheduledAt, interview.duration)}</span>
            <span className="flex items-center gap-1.5 capitalize"><Icon size={14} />{interview.type}</span>
          </div>
        </div>
      </div>

      {interview.notes && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
          <strong className="text-gray-700">{t("interview.noteFromRecruiter")}</strong>{interview.notes}
        </div>
      )}

      {interview.meetingLink && (
        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
          <Video size={14} /> {t("interview.joinMeeting")}
        </a>
      )}

      {/* Add to Calendar buttons */}
      {panel === null && (
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
            href={`/api/calendar/ics?id=${interview.id}`}
            download="interview.ics"
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Apple / Other (.ics)
          </a>
        </div>
      )}

      {/* Action buttons — only show if pending */}
      {status === "PENDING" && panel === null && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={() => sendAction("ACCEPTED")} loading={saving}>
            <CheckCircle size={14} /> {t("interview.accept")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setPanel("reschedule"); }}
          >
            <RefreshCw size={14} /> {t("interview.rescheduleTitle")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setPanel("reject"); }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle size={14} /> {t("interview.decline")}
          </Button>
        </div>
      )}

      {/* Re-respond if previously acted */}
      {status !== "PENDING" && panel === null && (
        <button
          type="button"
          onClick={() => setPanel("reject")}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {t("interview.changeResponse")}
        </button>
      )}

      {/* Reject panel */}
      {panel === "reject" && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700">{t("interview.declinePanel")}</p>
          <Select
            label={t("interview.selectReason")}
            options={REJECT_REASONS}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={() => sendAction("REJECTED")} disabled={!rejectReason}>
              {t("interview.confirmDecline")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPanel(null)}>{t("common.back")}</Button>
          </div>
        </div>
      )}

      {/* Reschedule panel */}
      {panel === "reschedule" && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">{t("interview.requestDifferentTime")}</p>
          <Input
            label={t("interview.proposedDate")}
            type="datetime-local"
            value={rescheduleAt}
            onChange={(e) => setRescheduleAt(e.target.value)}
            required
          />
          <TextArea
            label={t("interview.noteToRecruiterLabel")}
            placeholder={t("interview.noteToRecruiterPlaceholder")}
            value={rescheduleNote}
            onChange={(e) => setRescheduleNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={() => sendAction("RESCHEDULE_REQUESTED")} disabled={!rescheduleAt}>
              {t("interview.sendRequest")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPanel(null)}>{t("common.back")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tz, setTz] = useState("");
  const { t } = useI18n();

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

  function handleUpdated(updated: Interview) {
    setInterviews((prev) => prev.map((iv) => (iv.id === updated.id ? updated : iv)));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("interview.calendarTitle")}</h1>
        <p className="text-gray-500 mt-1">{t("interview.seekerCalendarDesc")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : interviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">{t("interview.noInterviews")}</p>
          <p className="text-sm text-gray-500">{t("interview.noInterviewsSeeker")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <InterviewCard key={iv.id} interview={iv} tz={tz} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
