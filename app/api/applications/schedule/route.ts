import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendInterviewScheduledEmail } from "@/lib/email";

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

    const VALID_TYPES = ["video", "phone", "in-person"];
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "type must be video, phone, or in-person" }, { status: 400 });
    }

    const durationMin = Number(duration ?? 60);
    if (!Number.isInteger(durationMin) || durationMin < 15 || durationMin > 480) {
      return NextResponse.json({ error: "duration must be between 15 and 480 minutes" }, { status: 400 });
    }

    if (new Date(scheduledAt) <= new Date()) {
      return NextResponse.json({ error: "Interview must be scheduled in the future." }, { status: 400 });
    }

    // Verify the employer owns the job for this application
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { postedById: true, title: true } },
        user: { select: { email: true } },
      },
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
          duration: durationMin,
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

    // In-app notification to job seeker
    await db.notification.create({
      data: {
        userId: application.userId,
        type: "STATUS_CHANGED",
        title: "Interview scheduled",
        body: `A recruiter has scheduled an interview for "${application.job.title}". Check your calendar for details.`,
      },
    });

    // Send interview notification email to job seeker (fire-and-forget)
    if (application.user?.email) {
      sendInterviewScheduledEmail(
        application.user.email,
        application.job.title,
        new Date(scheduledAt),
        type,
        meetingLink || null
      ).catch(() => {});
    }

    return NextResponse.json({ application: updatedApp, interview }, { status: 201 });
  } catch (err) {
    console.error("[schedule] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
