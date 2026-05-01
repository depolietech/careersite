import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId, scheduledAt, duration, type, meetingLink, notes } = await req.json();

    if (!applicationId || !scheduledAt || !type) {
      return NextResponse.json({ error: "applicationId, scheduledAt, and type are required" }, { status: 400 });
    }

    // Verify the employer owns the job for this application
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { postedById: true } } },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Reveal profile, create interview, and ensure conversation exists — all in one transaction
    const [updatedApp, interview] = await db.$transaction([
      db.application.update({
        where: { id: applicationId },
        data: { status: "INTERVIEW_SCHEDULED", revealed: true },
      }),
      db.interview.create({
        data: {
          applicationId,
          scheduledById: session.user.id!,
          scheduledAt: new Date(scheduledAt),
          duration: Number(duration ?? 60),
          type,
          meetingLink: meetingLink || null,
          notes: notes || null,
        },
      }),
      db.employerProfile.update({
        where: { userId: session.user.id },
        data: { interviewsScheduled: { increment: 1 } },
      }),
    ]);

    // Auto-create conversation if one doesn't exist yet
    await db.conversation.upsert({
      where: { applicationId },
      create: { applicationId },
      update: {},
    });

    return NextResponse.json({ application: updatedApp, interview }, { status: 201 });
  } catch (err) {
    console.error("[schedule] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
