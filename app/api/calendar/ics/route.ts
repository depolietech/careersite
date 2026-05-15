import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildICSContent } from "@/lib/calendarUtils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const interview = await db.interview.findUnique({
    where: { id },
    include: {
      application: {
        select: {
          userId: true,
          job: { select: { title: true, location: true, postedById: true } },
        },
      },
    },
  });

  if (!interview) return new NextResponse("Not found", { status: 404 });

  const isSeeker = interview.application.userId === session.user.id;
  const isRecruiter = interview.application.job.postedById === session.user.id;
  if (!isSeeker && !isRecruiter) return new NextResponse("Forbidden", { status: 403 });

  const description = [
    interview.type === "video" && interview.meetingLink ? `Meeting link: ${interview.meetingLink}` : null,
    interview.notes ? `Notes: ${interview.notes}` : null,
  ].filter(Boolean).join("\n");

  const ics = buildICSContent({
    title: `Interview: ${interview.application.job.title}`,
    start: new Date(interview.scheduledAt),
    durationMinutes: interview.duration,
    description: description || undefined,
    location:
      interview.type === "in-person"
        ? (interview.application.job.location ?? undefined)
        : (interview.meetingLink ?? undefined),
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="interview-${id}.ics"`,
    },
  });
}
