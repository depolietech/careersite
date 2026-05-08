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

  const { name, issuer, dateObtained, expiryDate } = await req.json();

  if (!name || !issuer) {
    return NextResponse.json({ error: "name and issuer are required" }, { status: 400 });
  }

  const YYYYMM = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (dateObtained && !YYYYMM.test(dateObtained)) {
    return NextResponse.json({ error: "Date obtained must be in YYYY-MM format (e.g. 2022-06)" }, { status: 400 });
  }
  if (expiryDate && !YYYYMM.test(expiryDate)) {
    return NextResponse.json({ error: "Expiry date must be in YYYY-MM format (e.g. 2025-06)" }, { status: 400 });
  }
  if (dateObtained && expiryDate) {
    if (expiryDate <= dateObtained) {
      return NextResponse.json({ error: "Expiry date must be after the date obtained" }, { status: 400 });
    }
  }

  const cert = await db.certification.create({
    data: {
      profileId: profile.id,
      name,
      issuer,
      dateObtained: dateObtained || null,
      expiryDate: expiryDate || null,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}
