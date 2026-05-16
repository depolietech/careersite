import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendApplicationStatusEmail } from "@/lib/email";
import { syncPipelineStatus } from "@/lib/job-status";

export const dynamic = "force-dynamic";

// INTERVIEW_SCHEDULED is intentionally excluded — it must go through /api/applications/schedule
// which creates the Interview record and reveals the profile atomically.
const VALID_STATUSES = [
  "PENDING", "REVIEWING", "SHORTLISTED", "FORWARDED",
  "INTERVIEW_COMPLETED", "REJECTED", "OFFER_MADE", "HIRED",
];

const STATUS_MESSAGES: Record<string, string> = {
  PENDING:              "is pending review",
  REVIEWING:            "is being reviewed",
  SHORTLISTED:          "has been shortlisted",
  FORWARDED:            "has been forwarded to the next stage",
  INTERVIEW_SCHEDULED:  "has an interview scheduled — check your calendar",
  INTERVIEW_COMPLETED:  "interview has been completed — the recruiter will be in touch soon",
  REJECTED:             "was not selected for this role",
  OFFER_MADE:           "has received an offer — check your dashboard",
  HIRED:                "resulted in a hire — congratulations!",
};

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId, status } = await req.json();

  if (!applicationId || !status) {
    return NextResponse.json({ error: "applicationId and status required" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify employer owns the job
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job:  { select: { postedById: true, title: true } },
      user: { select: { email: true, emailAppUpdates: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.job.postedById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: { status },
  });

  // Notify the job seeker of the status change
  await db.notification.create({
    data: {
      userId: application.userId,
      type: "STATUS_CHANGED",
      title: "Application status updated",
      body: `Your application for "${application.job.title}" ${STATUS_MESSAGES[status] ?? "has been updated"}.`,
    },
  });

  // Send email notification (fire-and-forget, respects emailAppUpdates preference)
  if (application.user?.email && application.user.emailAppUpdates !== false) {
    sendApplicationStatusEmail(
      application.user.email,
      application.job.title,
      status
    ).catch(() => {});
  }

  // Sync job pipeline status (fire-and-forget)
  syncPipelineStatus(application.jobId).catch(() => {});

  return NextResponse.json(updated);
}
