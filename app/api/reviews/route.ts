import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerProfileId = searchParams.get("employerProfileId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const where = employerProfileId ? { employerProfileId } : {};

  const [reviews, total] = await Promise.all([
    db.companyReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        employerProfile: { select: { id: true, companyName: true, industry: true } },
        reviewer: { select: { email: true } },
      },
    }),
    db.companyReview.count({ where }),
  ]);

  const payload = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isAnonymous: r.isAnonymous,
    createdAt: r.createdAt,
    reviewerEmail: r.isAnonymous ? null : r.reviewer.email,
    company: r.employerProfile,
  }));

  return NextResponse.json({ reviews: payload, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Only job seekers can leave reviews." }, { status: 401 });
  }

  const { employerProfileId, rating, title, body, isAnonymous } = await req.json();

  if (!employerProfileId || typeof employerProfileId !== "string") {
    return NextResponse.json({ error: "Company is required." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }
  if (!title || typeof title !== "string" || title.trim().length < 3 || title.length > 120) {
    return NextResponse.json({ error: "Title must be 3–120 characters." }, { status: 400 });
  }
  if (!body || typeof body !== "string" || body.trim().length < 10 || body.length > 3000) {
    return NextResponse.json({ error: "Review must be 10–3000 characters." }, { status: 400 });
  }

  const employer = await db.employerProfile.findUnique({ where: { id: employerProfileId } });
  if (!employer) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const existing = await db.companyReview.findUnique({
    where: { reviewerId_employerProfileId: { reviewerId: session.user.id, employerProfileId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this company." }, { status: 409 });
  }

  const review = await db.companyReview.create({
    data: {
      reviewerId: session.user.id,
      employerProfileId,
      rating,
      title: title.trim(),
      body: body.trim(),
      isAnonymous: isAnonymous !== false,
    },
    include: {
      employerProfile: { select: { id: true, companyName: true, industry: true } },
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
