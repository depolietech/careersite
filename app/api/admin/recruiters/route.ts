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
  const q       = searchParams.get("q")       ?? "";
  const blocked = searchParams.get("blocked")  ?? "";

  const recruiters = await db.user.findMany({
    where: {
      role: "EMPLOYER",
      ...(q && { OR: [
        { email: { contains: q } },
        { employerProfile: { companyName: { contains: q } } },
      ]}),
      ...(blocked === "true" && { employerProfile: { isBlocked: true } }),
    },
    select: {
      id: true,
      email: true,
      isPublicEmail: true,
      emailVerified: true,
      createdAt: true,
      employerProfile: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          website: true,
          trustScore: true,
          isBlocked: true,
          verificationStatus: true,
          interviewsScheduled: true,
          interviewsCancelled: true,
        },
      },
      _count: { select: { postedJobs: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(recruiters);
}
