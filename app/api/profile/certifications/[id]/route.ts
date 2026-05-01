import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getOwnedCert(id: string, userId: string) {
  return db.certification.findFirst({
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
  const cert = await getOwnedCert(id, session.user.id);
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, issuer, dateObtained, expiryDate } = await req.json();

  const updated = await db.certification.update({
    where: { id },
    data: {
      name,
      issuer,
      dateObtained: dateObtained || null,
      expiryDate: expiryDate || null,
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
  const cert = await getOwnedCert(id, session.user.id);
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.certification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
