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

  if (startYear !== undefined) {
    const sy = Number(startYear);
    const ey = endYear !== undefined && endYear !== null ? Number(endYear) : null;
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(sy) || sy < 1900 || sy > currentYear + 1) {
      return NextResponse.json({ error: "Start year must be a valid year between 1900 and next year" }, { status: 400 });
    }
    if (ey !== null && ey < sy) {
      return NextResponse.json({ error: "End year must be equal to or after start year" }, { status: 400 });
    }
  }

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
