import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q")      ?? "";
  const status = searchParams.get("status") ?? "";

  const jobs = await db.job.findMany({
    where: {
      ...(q && { OR: [
        { title: { contains: q } },
        { employerProfile: { companyName: { contains: q } } },
      ]}),
      ...(status && { status }),
    },
    select: {
      id: true,
      title: true,
      location: true,
      jobType: true,
      status: true,
      createdAt: true,
      employerProfile: { select: { companyName: true, trustScore: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(jobs);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  const VALID = ["ACTIVE", "PAUSED", "CLOSED"];
  if (!id || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const job = await db.job.update({ where: { id }, data: { status } });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "UPDATE_JOB_STATUS",
      targetId: id,
      targetType: "JOB",
      note: `Job "${job.title}" set to ${status}`,
    },
  });

  return NextResponse.json(job);
}
