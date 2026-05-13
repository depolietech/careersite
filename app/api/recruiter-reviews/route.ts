import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — list reviews for an employer profile (public)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employerProfileId = searchParams.get("employerProfileId");

  if (!employerProfileId) {
    return NextResponse.json({ error: "employerProfileId required" }, { status: 400 });
  }

  const reviews = await db.recruiterReview.findMany({
    where: { employerProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      communication: true,
      professionalism: true,
      transparency: true,
      fairness: true,
      comment: true,
      isAnonymous: true,
      createdAt: true,
    },
  });

  const total = reviews.length;
  const avg = total > 0
    ? {
        rating:          Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10,
        communication:   Math.round((reviews.reduce((s, r) => s + r.communication, 0) / total) * 10) / 10,
        professionalism: Math.round((reviews.reduce((s, r) => s + r.professionalism, 0) / total) * 10) / 10,
        transparency:    Math.round((reviews.reduce((s, r) => s + r.transparency, 0) / total) * 10) / 10,
        fairness:        Math.round((reviews.reduce((s, r) => s + r.fairness, 0) / total) * 10) / 10,
      }
    : null;

  return NextResponse.json({ reviews, total, averages: avg });
}

// POST — job seeker submits a review (must have applied to this employer)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Only job seekers can submit recruiter reviews" }, { status: 403 });
  }

  const { employerProfileId, rating, communication, professionalism, transparency, fairness, comment, isAnonymous } = await req.json();

  if (!employerProfileId || !rating) {
    return NextResponse.json({ error: "employerProfileId and rating are required" }, { status: 400 });
  }

  for (const [field, val] of [["rating", rating], ["communication", communication], ["professionalism", professionalism], ["transparency", transparency], ["fairness", fairness]] as [string, unknown][]) {
    if (val !== undefined && (typeof val !== "number" || val < 1 || val > 5)) {
      return NextResponse.json({ error: `${field} must be a number between 1 and 5` }, { status: 400 });
    }
  }

  // Verify the job seeker has applied to a job from this employer
  const hasInteraction = await db.application.findFirst({
    where: {
      userId: session.user.id,
      job: { employerProfileId },
    },
  });

  if (!hasInteraction) {
    return NextResponse.json(
      { error: "You can only review recruiters you have applied to or interacted with." },
      { status: 403 }
    );
  }

  try {
    const review = await db.recruiterReview.create({
      data: {
        reviewerId:        session.user.id,
        employerProfileId,
        rating:            Number(rating),
        communication:     Number(communication ?? rating),
        professionalism:   Number(professionalism ?? rating),
        transparency:      Number(transparency ?? rating),
        fairness:          Number(fairness ?? rating),
        comment:           comment?.trim() || null,
        isAnonymous:       isAnonymous !== false,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "You have already submitted a review for this recruiter" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
