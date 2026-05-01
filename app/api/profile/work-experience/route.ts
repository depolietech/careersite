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

  const { title, company, roleCategory, startDate, endDate, current, description, skills } = await req.json();

  if (!title || !company || !startDate) {
    return NextResponse.json({ error: "title, company, and startDate are required" }, { status: 400 });
  }

  const exp = await db.workExperience.create({
    data: {
      profileId: profile.id,
      title,
      company,
      roleCategory: roleCategory || null,
      startDate,
      endDate: current ? null : (endDate || null),
      current: Boolean(current),
      description: description || null,
      skills: JSON.stringify(Array.isArray(skills) ? skills : []),
    },
  });

  return NextResponse.json(exp, { status: 201 });
}
