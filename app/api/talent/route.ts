import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const skill    = searchParams.get("skill")?.trim() ?? "";
  const minExp   = searchParams.get("minExp") ? Number(searchParams.get("minExp")) : null;
  const location = searchParams.get("location")?.trim() ?? "";

  const profiles = await db.jobSeekerProfile.findMany({
    where: {
      ...(skill && { skills: { contains: skill } }),
      ...(minExp !== null && { yearsExperience: { gte: minExp } }),
      ...(location && { location: { contains: location } }),
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
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // Assign deterministic anonymous codes
  const masked = profiles.map((p, i) => ({
    ...p,
    candidateCode: `CAND-${String(i + 1).padStart(4, "0")}`,
    skills: (() => { try { return JSON.parse(p.skills); } catch { return []; } })(),
    workExperiences: p.workExperiences.map((w) => ({
      ...w,
      skills: (() => { try { return JSON.parse(w.skills); } catch { return []; } })(),
    })),
  }));

  return NextResponse.json(masked);
}
