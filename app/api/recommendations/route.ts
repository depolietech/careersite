import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scoreJobForSeeker } from "@/lib/matching";

export const dynamic = "force-dynamic";

// GET /api/recommendations
// Returns top 8 active jobs ranked by match score for the authenticated job seeker.
// Excludes jobs the seeker has already applied to.
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.jobSeekerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      workExperiences: { select: { skills: true } },
      certifications:  { select: { name: true, verificationLevel: true } },
      educations:      { select: { id: true } },
    },
  });

  if (!profile) return NextResponse.json([]);

  const [resumeCount, appliedJobIds] = await Promise.all([
    db.resume.count({ where: { userId: session.user.id } }),
    db.application.findMany({
      where: { userId: session.user.id },
      select: { jobId: true },
    }).then((apps) => apps.map((a) => a.jobId)),
  ]);

  const jobs = await db.job.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: appliedJobIds.length > 0 ? appliedJobIds : undefined },
    },
    select: {
      id: true, title: true, location: true, jobType: true,
      skills: true, experience: true, certificateRequired: true,
      employerProfile: { select: { industry: true, companySize: true } },
      createdAt: true,
    },
    take: 100, // score a broad pool, then return top 8
    orderBy: { createdAt: "desc" },
  });

  const scored = jobs.map((job) => {
    const result = scoreJobForSeeker(job, profile, resumeCount);
    return { job, ...result };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 8);

  return NextResponse.json(
    top.map(({ job, score, breakdown, matchedSkills, skillGaps, certRecommendations }) => ({
      id:                  job.id,
      title:               job.title,
      location:            job.location,
      jobType:             job.jobType,
      industry:            job.employerProfile?.industry ?? null,
      companySize:         job.employerProfile?.companySize ?? null,
      requiredSkills:      (() => { try { return JSON.parse(job.skills); } catch { return []; } })(),
      matchScore:          score,
      breakdown,
      matchedSkills,
      skillGaps,
      certRecommendations,
    }))
  );
}
