import { db } from "./db";

// Compute and persist pipelineStatus based on live application statuses.
// Skips update if the employer manually set CLOSED (manual override is respected).
export async function syncPipelineStatus(jobId: string): Promise<string> {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { pipelineStatus: true },
  });

  if (job?.pipelineStatus === "CLOSED") return "CLOSED";

  const apps = await db.application.findMany({
    where: { jobId },
    select: { status: true },
  });

  const statuses = apps.map((a) => a.status);

  let pipelineStatus = "OPEN";
  if (statuses.includes("HIRED")) {
    pipelineStatus = "FILLED";
  } else if (statuses.some((s) => s === "OFFER_MADE")) {
    pipelineStatus = "OFFERED";
  } else if (statuses.some((s) => s === "INTERVIEW_SCHEDULED" || s === "INTERVIEW_COMPLETED")) {
    pipelineStatus = "INTERVIEW_STAGE";
  } else if (statuses.length > 0) {
    pipelineStatus = "IN_REVIEW";
  }

  await db.job.update({ where: { id: jobId }, data: { pipelineStatus } });
  return pipelineStatus;
}
