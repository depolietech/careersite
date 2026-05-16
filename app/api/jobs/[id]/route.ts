import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_PIPELINE = ["OPEN", "IN_REVIEW", "INTERVIEW_STAGE", "OFFERED", "FILLED", "CLOSED"];
const VALID_STATUS   = ["ACTIVE", "PAUSED", "CLOSED"];

// GET /api/jobs/[id] — public basic info (used by employer applicants page)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const job = await db.job.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, pipelineStatus: true, postedById: true },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Employers can only fetch their own jobs
  if (session?.user?.role === "EMPLOYER" && job.postedById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(job);
}

// PATCH /api/jobs/[id] — employer updates pipelineStatus or status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { pipelineStatus, status } = await req.json();

  const job = await db.job.findUnique({ where: { id }, select: { postedById: true } });
  if (!job || job.postedById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: Record<string, string> = {};
  if (pipelineStatus && VALID_PIPELINE.includes(pipelineStatus)) data.pipelineStatus = pipelineStatus;
  if (status        && VALID_STATUS.includes(status))            data.status = status;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await db.job.update({ where: { id }, data });
  return NextResponse.json(updated);
}
