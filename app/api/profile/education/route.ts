import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.jobSeekerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found — save your profile first" }, { status: 404 });
  }

  const { degree, field, institution, startYear, endYear } = await req.json();

  if (!degree || !institution || !startYear) {
    return NextResponse.json({ error: "degree, institution, and startYear are required" }, { status: 400 });
  }

  const sy = Number(startYear);
  const ey = endYear ? Number(endYear) : null;
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(sy) || sy < 1900 || sy > currentYear + 1) {
    return NextResponse.json({ error: "Start year must be a valid year between 1900 and next year" }, { status: 400 });
  }
  if (ey !== null) {
    if (!Number.isInteger(ey) || ey < sy) {
      return NextResponse.json({ error: "End year must be equal to or after start year" }, { status: 400 });
    }
  }

  const edu = await db.education.create({
    data: {
      profileId: profile.id,
      degree,
      field: field || null,
      institution,
      startYear: Number(startYear),
      endYear: endYear ? Number(endYear) : null,
    },
  });

  return NextResponse.json(edu, { status: 201 });
}
