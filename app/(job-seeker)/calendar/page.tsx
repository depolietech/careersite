"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Loader2 } from "lucide-react";

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
  application: { job: { title: string; location: string } };
};

export default function CalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">Your upcoming interviews and events.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : interviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No upcoming interviews</p>
          <p className="text-sm text-gray-500">Scheduled interviews will appear here once a recruiter books time with you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => {
            const Icon = TYPE_ICON[iv.type] ?? Video;
            return (
              <div key={iv.id} className="card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{iv.application.job.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar size={14} />{fmtDate(iv.scheduledAt)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} />{fmtTime(iv.scheduledAt, iv.duration)}</span>
                      <span className="flex items-center gap-1.5 capitalize"><Icon size={14} />{iv.type}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 shrink-0">Confirmed</span>
                </div>
                {iv.notes && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
                    <strong className="text-gray-700">Note from recruiter: </strong>{iv.notes}
                  </div>
                )}
                {iv.meetingLink && (
                  <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                    <Video size={14} /> Join meeting
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
