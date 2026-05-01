"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Plus, Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Video, phone: Phone, "in-person": MapPin,
};

const CANCEL_REASONS = [
  { value: "",                     label: "Select a reason" },
  { value: "Emergency",            label: "Emergency" },
  { value: "Position closed",      label: "Position closed" },
  { value: "Candidate unavailable",label: "Candidate unavailable" },
  { value: "Reschedule needed",    label: "Reschedule needed" },
  { value: "Other",                label: "Other" },
];

type Interview = {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  meetingLink: string | null;
  notes: string | null;
  application: { job: { id: string; title: string } };
};

export default function EmployerCalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
      const res = await fetch(`/api/interviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInterviews((prev) => prev.filter((iv) => iv.id !== id));
        setCancellingId(null);
        setCancelReason("");
      }
    } finally {
      setCancelling(false);
    }
  }

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
            return (
              <div key={iv.id} className="card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div>
                      <Link href={`/employer/applicants/${iv.application.job.id}`} className="font-bold text-gray-900 hover:text-brand-600">
                        {iv.application.job.title}
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{fmtDate(iv.scheduledAt)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} />{fmtTime(iv.scheduledAt, iv.duration)}</span>
                      <span className="flex items-center gap-1.5 capitalize"><Icon size={13} />{iv.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {iv.meetingLink && (
                      <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors">
                        <Video size={13} /> Join
                      </a>
                    )}
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Confirmed</span>
                    {!isCancelling && (
                      <button
                        onClick={() => { setCancellingId(iv.id); setCancelReason(""); }}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {isCancelling && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">Cancel this interview?</p>
                    <p className="text-xs text-red-600">Cancelling will reset the application to Shortlisted status. Frequent cancellations affect your trust score.</p>
                    <div className="flex items-center gap-3">
                      <select
                        className="input flex-1 text-sm"
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

                {iv.notes && (
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
