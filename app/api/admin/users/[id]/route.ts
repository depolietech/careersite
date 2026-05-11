import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail, sendNewAccountApprovedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function isAdmin(role: string | undefined) {
  return role === "ADMIN";
}

// PATCH /api/admin/users/[id] — block/unblock/approve
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, note } = body;

  const user = await db.user.findUnique({
    where: { id },
    include: { employerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let result: Record<string, unknown> = {};

  if (action === "block") {
    if (user.employerProfile) {
      await db.employerProfile.update({
        where: { userId: id },
        data: { isBlocked: true, trustScore: 0 },
      });
    }
    result = { blocked: true };
  } else if (action === "unblock") {
    if (user.employerProfile) {
      await db.employerProfile.update({
        where: { userId: id },
        data: { isBlocked: false, interviewsCancelled: 0, trustScore: 100 },
      });
    }
    result = { blocked: false };
  } else if (action === "approve") {
    await db.user.update({
      where: { id },
      data: { emailVerified: new Date() },
    });
    result = { approved: true };
  } else if (action === "reinstate") {
    if (user.reinstateType === "new_account") {
      // Approve new-account request: purge the old record, email user that they can now register
      const originalEmail = user.email;
      await db.user.update({
        where: { id },
        data: {
          email: `purged-${user.id}@deleted.equalhires.internal`,
          reinstateRequestedAt: null,
          reinstateType: null,
        },
      });
      try {
        await sendNewAccountApprovedEmail(originalEmail);
      } catch {
        // Don't block if email fails
      }
      result = { approvedNewAccount: true };
    } else {
      // Approve restore request: reactivate account and send verification email
      await db.user.update({
        where: { id },
        data: { deletedAt: null, emailVerified: null, reinstateRequestedAt: null, reinstateType: null },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await db.verificationToken.create({
        data: {
          identifier: user.email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      const verifyCode = String(Math.floor(100000 + crypto.randomInt(900000)));
      const codeHash = crypto.createHash("sha256").update(verifyCode).digest("hex");
      await db.otpCode.create({
        data: {
          userId: user.id,
          codeHash,
          type: "email_verify",
          expires: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      try {
        await sendVerificationEmail(user.email, token, verifyCode);
      } catch {
        // Don't block reinstatement if email fails
      }
      result = { reinstated: true };
    }
  } else if (action === "reject_reinstate") {
    // Dismiss the request — account stays deleted
    await db.user.update({
      where: { id },
      data: { reinstateRequestedAt: null, reinstateType: null },
    });
    result = { rejected: true };
  } else if (action === "purge") {
    await db.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "PURGE_USER",
        targetId: id,
        targetType: "USER",
        note: note ?? "Admin hard-deleted deleted user",
      },
    });
    await db.user.delete({ where: { id } });
    return NextResponse.json({ purged: true });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: action.toUpperCase(),
      targetId: id,
      targetType: "USER",
      note: note ?? null,
    },
  });

  return NextResponse.json(result);
}

// DELETE /api/admin/users/[id] — soft-delete account
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const note = searchParams.get("note") ?? "";

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "DELETE_USER",
      targetId: id,
      targetType: "USER",
      note: note || "Admin soft-deleted user",
    },
  });

  return NextResponse.json({ ok: true });
}
