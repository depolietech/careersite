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
  const status = searchParams.get("status") ?? "";
  const q      = searchParams.get("q") ?? "";

  const employers = await db.employerProfile.findMany({
    where: {
      ...(status && { verificationStatus: status }),
      ...(q && {
        OR: [
          { companyName: { contains: q } },
          { user: { email: { contains: q } } },
        ],
      }),
    },
    include: {
      user: { select: { id: true, email: true, isPublicEmail: true, emailVerified: true, createdAt: true } },
      _count: { select: { postedJobs: true, reports: true } },
    },
    orderBy: [
      // Pending first, then incomplete, then others
      { verificationSubmittedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(employers);
}
