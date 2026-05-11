import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function isAdmin(role: string | undefined) {
  return role === "ADMIN";
}

// GET /api/admin/users — list all users with summary
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role    = searchParams.get("role") ?? "";
  const q       = searchParams.get("q") ?? "";
  const status  = searchParams.get("status") ?? ""; // "active" | "blocked"
  const deleted     = searchParams.get("deleted") === "true";
  const pendingOnly = searchParams.get("pending") === "true";

  const users = await db.user.findMany({
    where: {
      deletedAt: (deleted || pendingOnly) ? { not: null } : null,
      ...(pendingOnly && { reinstateRequestedAt: { not: null } }),
      ...(role && { role }),
      ...(q && {
        OR: [
          { email: { contains: q } },
        ],
      }),
      ...(status === "blocked" && { employerProfile: { isBlocked: true } }),
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      deletedAt: true,
      reinstateRequestedAt: true,
      reinstateType: true,
      emailVerified: true,
      jobSeekerProfile: { select: { firstName: true, lastName: true, headline: true } },
      employerProfile: {
        select: {
          companyName: true, isBlocked: true,
          interviewsScheduled: true, interviewsCancelled: true, trustScore: true,
        },
      },
      _count: {
        select: { applications: true, postedJobs: true },
      },
    },
    orderBy: deleted
      ? [{ reinstateRequestedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json(users);
}
