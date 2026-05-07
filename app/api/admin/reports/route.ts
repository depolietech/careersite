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

  const reports = await db.recruiterReport.findMany({
    where: {
      ...(status && { status }),
    },
    include: {
      reporter: { select: { email: true } },
      employerProfile: { select: { companyName: true, trustScore: true } },
      job: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(reports);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !["REVIEWED", "DISMISSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const report = await db.recruiterReport.update({ where: { id }, data: { status } });

  // If dismissed, restore some trust score to the employer (+5, max 100)
  if (status === "DISMISSED") {
    const profile = await db.employerProfile.findUnique({
      where: { id: report.employerProfileId },
    });
    if (profile) {
      await db.employerProfile.update({
        where: { id: profile.id },
        data: { trustScore: Math.min(100, profile.trustScore + 5) },
      });
    }
  }

  return NextResponse.json(report);
}
