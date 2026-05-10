import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

// POST /api/auth/recover-account
// body: { email: string; action: "restore" | "new" }
//
// restore — reactivates the soft-deleted account, clears emailVerified so the
//           user must re-verify before logging in, then sends a verification email.
//
// new     — anonymises the deleted account's email address so the same email can
//           be used to register a completely fresh account.

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: "email and action are required" }, { status: 400 });
    }
    if (action !== "restore" && action !== "new") {
      return NextResponse.json({ error: "action must be 'restore' or 'new'" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { email, deletedAt: { not: null } },
    });

    if (!user) {
      return NextResponse.json({ error: "No deleted account found for this email" }, { status: 404 });
    }

    if (action === "restore") {
      // Reactivate — force email re-verification for security
      await db.user.update({
        where: { id: user.id },
        data: { deletedAt: null, emailVerified: null },
      });

      // Create a verification token (link-based)
      const token = crypto.randomBytes(32).toString("hex");
      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Create a 6-digit OTP code as well (some email templates use this)
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
        await sendVerificationEmail(email, token, verifyCode);
      } catch {
        // Don't block recovery if email fails — user can resend from check-email page
      }

      // Notify admins about the reinstatement
      const admins = await db.user.findMany({
        where: { role: "ADMIN", deletedAt: null },
        select: { id: true },
      });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "ACCOUNT_REINSTATED",
            title: "Account reinstated by user",
            body: `${email} self-reinstated their deleted account and will re-verify their email.`,
          })),
        });
      }

      return NextResponse.json({
        ok: true,
        redirectTo: `/check-email?email=${encodeURIComponent(email)}`,
      });
    }

    // action === "new": free the email for a fresh registration
    await db.user.update({
      where: { id: user.id },
      data: { email: `purged-${user.id}@deleted.equalhires.internal` },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recover-account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
