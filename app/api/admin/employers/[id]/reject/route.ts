import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationDeclinedEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { note, reasons } = await req.json().catch(() => ({ note: "", reasons: [] }));

  const profile = await db.employerProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reasonsArray: string[] = Array.isArray(reasons) ? reasons : [];

  await db.employerProfile.update({
    where: { id },
    data: {
      verificationStatus: "REJECTED",
      verificationNote: note?.trim() || null,
      verificationDeclineReasons: reasonsArray.length > 0 ? JSON.stringify(reasonsArray) : null,
    },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "REJECT_EMPLOYER",
      targetId: profile.userId,
      targetType: "USER",
      note: `Rejected employer: ${profile.companyName}${note ? ` — ${note}` : ""}${reasonsArray.length ? ` Reasons: ${reasonsArray.join(", ")}` : ""}`,
    },
  });

  // In-app notification to employer
  await db.notification.create({
    data: {
      userId: profile.userId,
      type: "STATUS_CHANGED",
      title: "Verification declined",
      body: `Your verification for ${profile.companyName} was declined. Please review the reasons and update your company details.`,
    },
  }).catch(() => {});

  // Email to employer (fire-and-forget)
  sendVerificationDeclinedEmail(
    profile.user.email,
    profile.companyName,
    reasonsArray,
    note?.trim() || null
  ).catch((err) => console.error("[reject] email failed:", err));

  return NextResponse.json({ verificationStatus: "REJECTED" });
}
