import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scoreSeekerForJob, type RecruiterMatchBreakdown } from "@/lib/matching";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const skill    = searchParams.get("skill")?.trim()    ?? "";
  const minExp   = searchParams.get("minExp") ? Number(searchParams.get("minExp")) : null;
  const location = searchParams.get("location")?.trim() ?? "";
  const cert     = searchParams.get("cert")?.trim()     ?? "";
  const remote   = searchParams.get("remote") === "true";
  const jobId    = searchParams.get("jobId")?.trim()    ?? "";

  const profiles = await db.jobSeekerProfile.findMany({
    where: {
      ...(skill    && { skills: { contains: skill, mode: "insensitive" } }),
      ...(minExp !== null && { yearsExperience: { gte: minExp } }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      ...(remote   && { jobType: "remote" }),
      ...(cert     && {
        certifications: { some: { name: { contains: cert, mode: "insensitive" } } },
      }),
    },
    select: {
      id: true,
      headline: true,
      summary: true,
      skills: true,
      yearsExperience: true,
      jobType: true,
      salaryMin: true,
      salaryMax: true,
      location: true,
      workExperiences: {
        select: {
          id: true,
          title: true,
          roleCategory: true,
          durationYears: true,
          current: true,
          description: true,
          skills: true,
        },
      },
      educations: {
        select: {
          id: true,
          degree: true,
          field: true,
          durationYears: true,
        },
      },
      certifications: {
        select: {
          id: true,
          name: true,
          issuer: true,
          dateObtained: true,
          verificationLevel: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Load job for ranking if jobId provided (must belong to this employer)
  let rankingJob: {
    title: string; skills: string; experience: number | null;
    certificateRequired: string | null; jobType: string; location: string;
  } | null = null;

  if (jobId) {
    const job = await db.job.findFirst({
      where: { id: jobId, postedById: session.user.id },
      select: { title: true, skills: true, experience: true, certificateRequired: true, jobType: true, location: true },
    });
    rankingJob = job ?? null;
  }

  const parseSkills = (raw: string) => {
    try { return JSON.parse(raw) as string[]; } catch { return [] as string[]; }
  };

  const masked = profiles.map((p, i) => {
    const skills = parseSkills(p.skills);
    const workExps = p.workExperiences.map((w) => ({
      ...w,
      skills: parseSkills(w.skills),
    }));

    let matchScore: number | null = null;
    let matchedSkills: string[] = [];
    let skillGaps: string[] = [];
    let matchBreakdown: RecruiterMatchBreakdown | null = null;

    if (rankingJob) {
      const result = scoreSeekerForJob(rankingJob, {
        skills: p.skills,
        yearsExperience: p.yearsExperience,
        jobType: p.jobType,
        location: p.location,
        workExperiences: p.workExperiences.map((w) => ({ title: w.title, skills: w.skills })),
        certifications: p.certifications.map((c) => ({ name: c.name, verificationLevel: c.verificationLevel })),
      });
      matchScore    = result.score;
      matchedSkills = result.matchedSkills;
      skillGaps     = result.skillGaps;
      matchBreakdown = result.breakdown;
    }

    return {
      ...p,
      candidateCode: `CAND-${String(i + 1).padStart(4, "0")}`,
      skills,
      workExperiences: workExps,
      matchScore,
      matchedSkills,
      skillGaps,
      matchBreakdown,
    };
  });

  // Sort by match score when a job is selected
  if (rankingJob) {
    masked.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  return NextResponse.json(masked.slice(0, 50));
}
