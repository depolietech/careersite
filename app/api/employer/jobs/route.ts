import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/employer/jobs
// Returns the authenticated employer's posted jobs (id + title only) for UI selectors.
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await db.job.findMany({
    where: { postedById: session.user.id, status: { not: "CLOSED" } },
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}
