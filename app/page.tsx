export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { HomePageClient } from "@/components/home/HomePageClient";

export default async function HomePage() {
  const recentJobs = await db.job.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      employerProfile: { select: { companyName: true, industry: true } },
      _count: { select: { applications: true } },
    },
  });

  const serializedJobs = recentJobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    jobType: job.jobType,
    createdAt: job.createdAt.toISOString(),
    employerProfile: job.employerProfile,
    _count: job._count,
  }));

  return <HomePageClient recentJobs={serializedJobs} />;
}
