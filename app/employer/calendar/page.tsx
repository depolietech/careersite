"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Plus, Loader2, ArrowLeft, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, TextArea } from "@/components/ui/input";

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Video, phone: Phone, "in-person": MapPin,
};

const INTERVIEW_TYPES = [
  { value: "video",     label: "Video call" },
  { value: "phone",     label: "Phone call" },
  { value: "in-person", label: "In person" },
];

const CANCEL_REASONS = [
  { value: "",                    label: "Select a reason" },
  { value: "Role cancelled",      label: "Role cancelled" },
  { value: "Candidate mismatch",  label: "Candidate mismatch" },
  { value: "Scheduling conflict", label: "Scheduling conflict" },
  { value: "Other",               label: "Other" },
];

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

export default function EmployerCalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // reschedule state
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
  }, []);

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function fmtTime(s: string, duration: number) {
    const start = new Date(s);
    const end = new Date(start.getTime() + duration * 60000);
    return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
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
        if (data.blocked) {
          alert("Your account has been blocked due to 3 or more interview cancellations. Please contact admin.");
        }
      }
    } finally {
      setCancelling(false);
    }
  }

  function openReschedule(iv: Interview) {
    const local = new Date(iv.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const localStr = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
    setRescheduleForm({
      scheduledAt: localStr,
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
      setRescheduleLinkError("Please enter a valid Zoom, Google Meet, or Microsoft Teams link.");
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
          prev.map((iv) =>
            iv.id === id ? { ...iv, ...updated, seekerStatus: "PENDING" } : iv
          )
        );
        setReschedulingId(null);
      }
    } finally {
      setRescheduling(false);
    }
  }

  const seekerBadge = (status: string) => {
    if (status === "ACCEPTED") return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Accepted by candidate</span>;
    if (status === "REJECTED") return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Declined by candidate</span>;
    if (status === "RESCHEDULE_REQUESTED") return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Reschedule requested</span>;
    return <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Awaiting response</span>;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Upcoming interviews and scheduled sessions.</p>
        </div>
        <Link
          href="/employer/applicants"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <Plus size={14} /> Schedule interview
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : interviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No upcoming interviews</p>
          <p className="text-sm text-gray-500">Schedule an interview from the applicants page to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => {
            const Icon = TYPE_ICON[iv.type] ?? Video;
            const isCancelling = cancellingId === iv.id;
            const isRescheduling = reschedulingId === iv.id;
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
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Confirmed</span>
                    {!isCancelling && !isRescheduling && (
                      <>
                        <button
                          onClick={() => openReschedule(iv)}
                          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Reschedule
                        </button>
                        <button
                          onClick={() => { setCancellingId(iv.id); setCancelReason(""); setReschedulingId(null); }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reschedule form */}
                {isRescheduling && (
                  <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-4">
                    <p className="text-sm font-semibold text-brand-800">Reschedule interview</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="New date & time"
                        type="datetime-local"
                        value={rescheduleForm.scheduledAt}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                        required
                      />
                      <Select
                        label="Format"
                        options={INTERVIEW_TYPES}
                        value={rescheduleForm.type}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, type: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        label="Duration"
                        options={[
                          { value: "30", label: "30 minutes" },
                          { value: "45", label: "45 minutes" },
                          { value: "60", label: "1 hour" },
                          { value: "90", label: "90 minutes" },
                        ]}
                        value={rescheduleForm.duration}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, duration: e.target.value }))}
                      />
                      <div className="space-y-1">
                        <Input
                          label="Meeting link"
                          placeholder="Zoom / Google Meet / Teams"
                          value={rescheduleForm.meetingLink}
                          onChange={(e) => {
                            setRescheduleForm((f) => ({ ...f, meetingLink: e.target.value }));
                            setRescheduleLinkError(e.target.value && !validateMeetingLink(e.target.value) ? "Invalid meeting link" : "");
                          }}
                        />
                        {rescheduleLinkError && <p className="text-xs text-red-600">{rescheduleLinkError}</p>}
                      </div>
                    </div>
                    <TextArea
                      label="Notes for candidate"
                      placeholder="Any updates the candidate should know…"
                      value={rescheduleForm.notes}
                      onChange={(e) => setRescheduleForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={rescheduling}
                        onClick={() => handleReschedule(iv.id)}
                      >
                        <RefreshCw size={13} /> Confirm reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setReschedulingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cancel form */}
                {isCancelling && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">Cancel this interview?</p>
                    <p className="text-xs text-red-600">Cancelling resets the application to Shortlisted. After 3 cancellations your account will be blocked.</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        className="input flex-1 text-sm min-w-[180px]"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      >
                        {CANCEL_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        disabled={!cancelReason || cancelling}
                        onClick={() => handleCancel(iv.id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cancelling ? "Cancelling…" : "Confirm cancel"}
                      </button>
                      <button
                        onClick={() => { setCancellingId(null); setCancelReason(""); }}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                )}

                {iv.notes && !isRescheduling && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
                    <strong className="text-gray-700">Notes: </strong>{iv.notes}
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
