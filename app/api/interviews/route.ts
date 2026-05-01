import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get("id");
  if (!interviewId) return NextResponse.json({ error: "Missing interview id" }, { status: 400 });

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: { application: { include: { job: { select: { postedById: true } } } } },
  });

  if (!interview || interview.application.job.postedById !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.$transaction([
    db.interview.delete({ where: { id: interviewId } }),
    db.application.update({
      where: { id: interview.applicationId },
      data: { status: "SHORTLISTED" },
    }),
    db.employerProfile.update({
      where: { userId: session.user.id },
      data: { interviewsCancelled: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
