import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    // Always return success — never reveal if email exists
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: true });
    }

    // Delete any existing reset token for this email
    await db.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: `password-reset:${email}`,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
