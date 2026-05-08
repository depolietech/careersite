import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9\-_%]+\/?$/;
const GITHUB_RE   = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-_.]+\/?$/;

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

  if (linkedinUrl?.trim() && !LINKEDIN_RE.test(linkedinUrl.trim())) {
    return NextResponse.json(
      { error: "LinkedIn URL must be https://www.linkedin.com/in/username or /company/name" },
      { status: 400 }
    );
  }
  if (githubUrl?.trim() && !GITHUB_RE.test(githubUrl.trim())) {
    return NextResponse.json(
      { error: "GitHub URL must be https://github.com/username" },
      { status: 400 }
    );
  }

  const data = {
    firstName: firstName || "",
    lastName:  lastName  || "",
    phone:     phone     || null,
    linkedinUrl: linkedinUrl?.trim() || null,
    githubUrl:   githubUrl?.trim()   || null,
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
