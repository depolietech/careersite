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
  const q = searchParams.get("q") ?? "";

  const seekers = await db.user.findMany({
    where: {
      role: "JOB_SEEKER",
      ...(q && { OR: [
        { email: { contains: q } },
        { jobSeekerProfile: { firstName: { contains: q } } },
        { jobSeekerProfile: { lastName: { contains: q } } },
      ]}),
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      jobSeekerProfile: {
        select: {
          firstName: true,
          lastName: true,
          headline: true,
          skills: true,
          yearsExperience: true,
          jobType: true,
        },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(seekers);
}
