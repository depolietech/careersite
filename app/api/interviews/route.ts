import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  sendInterviewResponseToRecruiterEmail,
  sendInterviewCancelledToSeekerEmail,
  sendInterviewRescheduledToSeekerEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "JOB_SEEKER") {
    const interviews = await db.interview.findMany({
      where: { application: { userId: session.user.id } },
      include: {
        application: {
          include: { job: { select: { title: true, location: true } } },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(interviews);
  }

  if (session.user.role === "EMPLOYER") {
    const interviews = await db.interview.findMany({
      where: { application: { job: { postedById: session.user.id } } },
      include: {
        application: {
          include: { job: { select: { id: true, title: true } } },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(interviews);
  }

  return NextResponse.json([]);
}

// PATCH — update interview (recruiter reschedule OR job seeker response)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { interviewId } = body;

  if (!interviewId) return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: {
          job: { select: { postedById: true, title: true } },
          user: { select: { id: true, email: true } },
        },
      },
    },
  });

  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Recruiter reschedule ─────────────────────────────────────────────────
  if (session.user.role === "EMPLOYER") {
    if (interview.application.job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { scheduledAt, duration, type, meetingLink, notes } = body;
    if (!scheduledAt) return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });

    const newDate = new Date(scheduledAt);

    const updated = await db.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: newDate,
        duration: duration ? Number(duration) : interview.duration,
        type: type ?? interview.type,
        meetingLink: meetingLink !== undefined ? (meetingLink || null) : interview.meetingLink,
        notes: notes !== undefined ? (notes || null) : interview.notes,
        seekerStatus: "PENDING", // reset seeker status on reschedule
      },
    });

    // Notify job seeker of reschedule via email (fire-and-forget)
    const seekerEmail = interview.application.user.email;
    if (seekerEmail) {
      sendInterviewRescheduledToSeekerEmail(
        seekerEmail,
        interview.application.job.title,
        newDate,
        type ?? interview.type,
        meetingLink !== undefined ? (meetingLink || null) : interview.meetingLink
      ).catch(() => {});
    }

    // In-app notification to job seeker
    await db.notification.create({
      data: {
        userId: interview.application.user.id,
        type: "STATUS_CHANGED",
        title: "Interview rescheduled",
        body: `Your interview for "${interview.application.job.title}" has been rescheduled.`,
      },
    });

    return NextResponse.json(updated);
  }

  // ── Job seeker response ──────────────────────────────────────────────────
  if (session.user.role === "JOB_SEEKER") {
    if (interview.application.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, rejectionReason, rescheduleProposedAt, rescheduleNote } = body;

    if (!["ACCEPTED", "REJECTED", "RESCHEDULE_REQUESTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await db.interview.update({
      where: { id: interviewId },
      data: {
        seekerStatus: action,
        seekerRejectionReason: action === "REJECTED" ? (rejectionReason ?? null) : null,
        seekerRescheduleProposedAt: action === "RESCHEDULE_REQUESTED" && rescheduleProposedAt
          ? new Date(rescheduleProposedAt)
          : null,
        seekerRescheduleNote: action === "RESCHEDULE_REQUESTED" ? (rescheduleNote ?? null) : null,
      },
    });

    // Notify recruiter via email (fire-and-forget)
    const recruiterId = interview.application.job.postedById;
    if (recruiterId) {
      const recruiter = await db.user.findUnique({ where: { id: recruiterId }, select: { email: true } });
      if (recruiter?.email) {
        const noteForRecruiter =
          action === "REJECTED" ? rejectionReason :
          action === "RESCHEDULE_REQUESTED" ? rescheduleNote :
          null;
        sendInterviewResponseToRecruiterEmail(
          recruiter.email,
          interview.application.job.title,
          action as "ACCEPTED" | "REJECTED" | "RESCHEDULE_REQUESTED",
          noteForRecruiter ?? null
        ).catch(() => {});
      }

      // In-app notification to recruiter
      const actionLabels: Record<string, string> = {
        ACCEPTED: "accepted",
        REJECTED: "declined",
        RESCHEDULE_REQUESTED: "requested a reschedule for",
      };
      await db.notification.create({
        data: {
          userId: recruiterId,
          type: "STATUS_CHANGED",
          title: `Interview ${actionLabels[action] ?? action.toLowerCase()}`,
          body: `A candidate has ${actionLabels[action] ?? action.toLowerCase()} the interview for "${interview.application.job.title}".`,
        },
      });
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// DELETE — recruiter cancels interview
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get("id");
  const cancelReason = searchParams.get("reason") ?? "Not specified";

  if (!interviewId) return NextResponse.json({ error: "Missing interview id" }, { status: 400 });

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: {
          job: { select: { postedById: true, title: true } },
          user: { select: { id: true, email: true } },
        },
      },
    },
  });

  if (!interview || interview.application.job.postedById !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if recruiter is already blocked
  const employerProfile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { interviewsCancelled: true, isBlocked: true },
  });

  if (employerProfile?.isBlocked) {
    return NextResponse.json({ error: "Your account has been blocked due to excessive interview cancellations." }, { status: 403 });
  }

  const newCancelCount = (employerProfile?.interviewsCancelled ?? 0) + 1;
  const shouldBlock = newCancelCount >= 3;

  const seekerUserId = interview.application.user.id;
  const seekerEmail = interview.application.user.email;
  const jobTitle = interview.application.job.title;

  await db.$transaction([
    db.interview.delete({ where: { id: interviewId } }),
    db.application.update({
      where: { id: interview.applicationId },
      data: { status: "SHORTLISTED" },
    }),
    db.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        interviewsCancelled: { increment: 1 },
        ...(shouldBlock && { isBlocked: true, trustScore: 0 }),
      },
    }),
    db.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "CANCEL_INTERVIEW",
        targetId: interviewId,
        targetType: "INTERVIEW",
        note: `Reason: ${cancelReason}. Total cancellations: ${newCancelCount}.${shouldBlock ? " BLOCKED." : ""}`,
      },
    }),
  ]);

  // Notify job seeker of cancellation
  await db.notification.create({
    data: {
      userId: seekerUserId,
      type: "STATUS_CHANGED",
      title: "Interview cancelled",
      body: `The recruiter cancelled the interview for "${jobTitle}".`,
    },
  });

  if (seekerEmail) {
    sendInterviewCancelledToSeekerEmail(seekerEmail, jobTitle, cancelReason).catch(() => {});
  }

  // Notify admin if blocked
  if (shouldBlock) {
    const adminUsers = await db.user.findMany({ where: { role: "ADMIN" } });
    if (adminUsers.length > 0) {
      await db.notification.createMany({
        data: adminUsers.map((admin) => ({
          userId: admin.id,
          type: "EMPLOYER_BLOCKED",
          title: "Employer blocked for excessive cancellations",
          body: `Employer ${session.user.id} has been automatically blocked after ${newCancelCount} interview cancellations.`,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true, blocked: shouldBlock });
}
