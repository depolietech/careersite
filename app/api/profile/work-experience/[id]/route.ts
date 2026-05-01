import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getOwnedExp(id: string, userId: string) {
  return db.workExperience.findFirst({
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
  const exp = await getOwnedExp(id, session.user.id);
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, company, roleCategory, startDate, endDate, current, description, skills } = await req.json();

  const updated = await db.workExperience.update({
    where: { id },
    data: {
      title,
      company,
      roleCategory: roleCategory || null,
      startDate,
      endDate: current ? null : (endDate || null),
      current: Boolean(current),
      description: description || null,
      skills: JSON.stringify(Array.isArray(skills) ? skills : []),
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
  const exp = await getOwnedExp(id, session.user.id);
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.workExperience.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
