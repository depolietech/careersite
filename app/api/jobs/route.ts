import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const jobType = searchParams.get("type") ?? "";

  const jobs = await db.job.findMany({
    where: {
      status: "ACTIVE",
      ...(q && { OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { skills: { contains: q } },
      ]}),
      ...(location && { location: { contains: location } }),
      ...(jobType && { jobType }),
    },
    include: {
      employerProfile: { select: { companyName: true, industry: true, companySize: true, verificationStatus: true } },
      _count: { select: { applications: true } },
      applications: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const result = jobs.map(({ applications, ...job }) => ({
    ...job,
    shortlistedCount: applications.filter((a) => ["SHORTLISTED", "FORWARDED"].includes(a.status)).length,
    interviewCount:   applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, location, jobType, salaryMin, salaryMax, skills, experience, educationRequired, certificateRequired } = body;

    if (!title || !description || !location || !jobType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const minSalary = salaryMin ? Number(salaryMin) : null;
    const maxSalary = salaryMax ? Number(salaryMax) : null;
    if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
      return NextResponse.json({ error: "Minimum salary cannot exceed maximum salary." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { employerProfile: true },
    });

    if (!user?.employerProfile || user.employerProfile.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Your account must be verified by an admin before you can post jobs." },
        { status: 403 }
      );
    }

    if (user.employerProfile.isBlocked) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }

    const job = await db.job.create({
      data: {
        title,
        description,
        location,
        jobType,
        salaryMin: minSalary,
        salaryMax: maxSalary,
        skills: JSON.stringify(skills ?? []),
        experience: experience ? Number(experience) : null,
        educationRequired: educationRequired || null,
        certificateRequired: certificateRequired || null,
        postedById: session.user.id,
        employerProfileId: user?.employerProfile?.id ?? null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
