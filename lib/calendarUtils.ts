export interface CalendarEvent {
  title: string;
  start: Date;
  durationMinutes: number;
  description?: string;
  location?: string;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function toUTCStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  const end = new Date(ev.start.getTime() + ev.durationMinutes * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${toUTCStamp(ev.start)}/${toUTCStamp(end)}`,
    details: ev.description ?? "",
    location: ev.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(ev: CalendarEvent): string {
  const end = new Date(ev.start.getTime() + ev.durationMinutes * 60000);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: ev.title,
    startdt: ev.start.toISOString(),
    enddt: end.toISOString(),
    body: ev.description ?? "",
    location: ev.location ?? "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function buildICSContent(ev: CalendarEvent): string {
  const end = new Date(ev.start.getTime() + ev.durationMinutes * 60000);
  const now = new Date();
  const uid = `interview-${ev.start.getTime()}@equalhires.com`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Equalhires//Interview//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUTCStamp(now)}`,
    `DTSTART:${toUTCStamp(ev.start)}`,
    `DTEND:${toUTCStamp(end)}`,
    `SUMMARY:${ev.title}`,
    ev.description ? `DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}` : "",
    ev.location ? `LOCATION:${ev.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}
