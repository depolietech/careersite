import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { note } = await req.json().catch(() => ({ note: "" }));

  const profile = await db.employerProfile.findUnique({ where: { id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.employerProfile.update({
    where: { id },
    data: {
      verificationStatus: "REJECTED",
      verificationNote: note?.trim() || null,
    },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "REJECT_EMPLOYER",
      targetId: profile.userId,
      targetType: "USER",
      note: `Rejected employer: ${profile.companyName}${note ? ` — ${note}` : ""}`,
    },
  });

  return NextResponse.json({ verificationStatus: "REJECTED" });
}
