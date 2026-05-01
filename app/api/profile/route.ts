import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.jobSeekerProfile.findUnique({
    where: { userId: session.user.id },
    include: { workExperiences: true, educations: true, certifications: true },
  });

  return NextResponse.json(profile ?? null);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    firstName, lastName, phone, linkedinUrl, githubUrl,
    headline, summary, skills,
    yearsExperience, jobType, salaryMin, salaryMax, location,
  } = body;

  const data = {
    firstName: firstName || "",
    lastName:  lastName  || "",
    phone:     phone     || null,
    linkedinUrl: linkedinUrl || null,
    githubUrl:   githubUrl   || null,
    headline:  headline  || null,
    summary:   summary   || null,
    skills:    JSON.stringify(Array.isArray(skills) ? skills : []),
    yearsExperience: yearsExperience ? Number(yearsExperience) : null,
    jobType:   jobType   || null,
    salaryMin: salaryMin ? Number(salaryMin) : null,
    salaryMax: salaryMax ? Number(salaryMax) : null,
    location:  location  || null,
  };

  const profile = await db.jobSeekerProfile.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(profile);
}
