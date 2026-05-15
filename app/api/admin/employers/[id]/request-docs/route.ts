import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationDocsRequestedEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { documents, note } = await req.json().catch(() => ({ documents: [], note: "" }));

  const profile = await db.employerProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docsArray: string[] = Array.isArray(documents) ? documents : [];

  await db.employerProfile.update({
    where: { id },
    data: {
      verificationStatus: "MORE_INFO_REQUIRED",
      verificationNote: note?.trim() || null,
      requestedDocuments: docsArray.length > 0 ? JSON.stringify(docsArray) : null,
    },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "REQUEST_EMPLOYER_DOCS",
      targetId: profile.userId,
      targetType: "USER",
      note: `Requested additional documents from ${profile.companyName}: ${docsArray.join(", ")}${note ? ` — ${note}` : ""}`,
    },
  });

  sendVerificationDocsRequestedEmail(
    profile.user.email,
    profile.companyName,
    docsArray,
    note?.trim() || null
  ).catch((err) => console.error("[request-docs] email failed:", err));

  return NextResponse.json({ verificationStatus: "MORE_INFO_REQUIRED" });
}
