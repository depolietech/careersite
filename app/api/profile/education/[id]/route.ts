import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getOwnedEdu(id: string, userId: string) {
  return db.education.findFirst({
    where: { id, profile: { userId } },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const edu = await getOwnedEdu(id, session.user.id);
  if (!edu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { degree, field, institution, startYear, endYear } = await req.json();

  const updated = await db.education.update({
    where: { id },
    data: {
      degree,
      field: field || null,
      institution,
      startYear: Number(startYear),
      endYear: endYear ? Number(endYear) : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const edu = await getOwnedEdu(id, session.user.id);
  if (!edu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.education.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
