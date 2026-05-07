import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return NextResponse.json({ ok: true });

    await db.verificationToken.deleteMany({ where: { identifier: email } });

    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Invalidate old email-verify OTP codes and generate a fresh one
    await db.otpCode.deleteMany({ where: { userId: user.id, type: "email_verify" } });
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

    await sendVerificationEmail(email, token, verifyCode);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
