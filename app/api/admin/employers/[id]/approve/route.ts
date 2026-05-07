import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationApprovedEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await db.employerProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.employerProfile.update({
    where: { id },
    data: {
      verificationStatus: "APPROVED",
      verificationNote: null,
      trustScore: Math.max(profile.trustScore, 80),
    },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "APPROVE_EMPLOYER",
      targetId: profile.userId,
      targetType: "USER",
      note: `Approved employer profile for company: ${profile.companyName}`,
    },
  });

  // Notify the recruiter so they know they can now log in and post jobs
  await sendVerificationApprovedEmail(profile.user.email, profile.companyName).catch((err) =>
    console.error("[approve] email failed:", err)
  );

  return NextResponse.json({ verificationStatus: updated.verificationStatus, trustScore: updated.trustScore });
}
