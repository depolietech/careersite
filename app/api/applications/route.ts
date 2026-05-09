import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maskProfile, revealProfile } from "@/lib/masking";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  const role = session.user.role;

  if (role === "JOB_SEEKER") {
    const applications = await db.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          select: {
            title: true, location: true, jobType: true, status: true,
            employerProfile: { select: { companyName: true } },
          },
        },
        resume: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Parse profileSnapshot from string to object before returning
    return NextResponse.json(
      applications.map((a) => ({
        ...a,
        profileSnapshot: a.profileSnapshot ? JSON.parse(a.profileSnapshot) : null,
      }))
    );
  }

  if (role === "EMPLOYER" && jobId) {
    // Verify the employer owns this job
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });
    if (!job || job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await db.application.findMany({
      where: { jobId },
      include: {
        profile: {
          include: { workExperiences: true, educations: true },
        },
        interview: true,
        // Resume intentionally excluded — raw files bypass masking
      },
      orderBy: { createdAt: "desc" },
    });

    const result = applications.map((app) => ({
      id: app.id,
      status: app.status,
      createdAt: app.createdAt,
      revealed: app.revealed,
      coverLetter: app.coverLetter,
      interview: app.interview,
      profile: app.revealed
        ? revealProfile(app.profile)
        : maskProfile(app.profile),
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Only job seekers can apply" }, { status: 403 });
  }

  const userId = session.user.id;

  try {
    const { jobId, coverLetter, resumeId } = await req.json();

    const profile = await db.jobSeekerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Complete your profile before applying" }, { status: 400 });
    }

    // Minimum profile requirements
    let skills: string[] = [];
    try { skills = JSON.parse(profile.skills ?? "[]"); } catch { /* ignore */ }

    if (skills.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one skill to your profile before applying." },
        { status: 400 }
      );
    }

    const hasYearsExp = (profile.yearsExperience ?? 0) > 0;
    if (!hasYearsExp) {
      const workCount = await db.workExperience.count({ where: { profileId: profile.id } });
      if (workCount === 0) {
        return NextResponse.json(
          { error: "Please add your years of experience or work history to your profile before applying." },
          { status: 400 }
        );
      }
    }

    // Validate resume belongs to this user (if provided)
    let resumeName: string | null = null;
    if (resumeId) {
      const resume = await db.resume.findUnique({ where: { id: resumeId } });
      if (!resume || resume.userId !== userId) {
        return NextResponse.json({ error: "Invalid resume" }, { status: 400 });
      }
      resumeName = resume.name;
    }

    // Fetch work experience for snapshot
    const workExperiences = await db.workExperience.findMany({
      where: { profileId: profile.id },
      select: { title: true, company: true, startDate: true, endDate: true, current: true },
    });
    const educations = await db.education.findMany({
      where: { profileId: profile.id },
      select: { degree: true, institution: true, startYear: true, endYear: true },
    });

    const profileSnapshot = JSON.stringify({
      skills,
      headline: profile.headline,
      summary: profile.summary,
      yearsExperience: profile.yearsExperience,
      jobType: profile.jobType,
      workExperiences,
      educations,
      resumeName,
      snapshotAt: new Date().toISOString(),
    });

    const application = await db.application.create({
      data: {
        jobId,
        userId,
        profileId: profile.id,
        coverLetter,
        resumeId: resumeId ?? null,
        profileSnapshot,
      },
      include: {
        job: { select: { title: true, postedById: true } },
      },
    });

    // Notification: job seeker confirmation
    await db.notification.create({
      data: {
        userId,
        type: "APPLICATION_SUBMITTED",
        title: "Application submitted",
        body: `Your application for "${application.job.title}" has been submitted successfully.`,
      },
    });

    // Notification: employer alert
    if (application.job.postedById) {
      await db.notification.create({
        data: {
          userId: application.job.postedById,
          type: "NEW_APPLICATION",
          title: "New application received",
          body: `A new candidate applied for "${application.job.title}".`,
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { job: _job, ...applicationData } = application;
    return NextResponse.json(applicationData, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
