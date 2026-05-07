import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["FAKE_JOB", "SCAM", "MISLEADING_ROLE", "OTHER"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;
  const { category, description } = await req.json();

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid report category." }, { status: 400 });
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { employerProfile: true },
  });

  if (!job || !job.employerProfileId) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // Prevent duplicate reports from same user on same job
  const existing = await db.recruiterReport.findFirst({
    where: { reporterId: session.user.id, jobId },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reported this job." }, { status: 409 });
  }

  await db.recruiterReport.create({
    data: {
      reporterId: session.user.id,
      employerProfileId: job.employerProfileId,
      jobId,
      category,
      description: description?.trim() || null,
    },
  });

  // Reduce trust score on each report (-10, min 0)
  const current = job.employerProfile?.trustScore ?? 100;
  await db.employerProfile.update({
    where: { id: job.employerProfileId },
    data: { trustScore: Math.max(0, current - 10) },
  });

  return NextResponse.json({ success: true });
}
