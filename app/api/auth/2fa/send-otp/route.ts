import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

// Send a 6-digit email OTP for either login 2FA or setup confirmation
export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });
    // Silent success to avoid user enumeration
    if (!user) return NextResponse.json({ ok: true });

    const otpType = (type === "2fa_setup" ? "2fa_setup" : "2fa_login") as "2fa_login" | "2fa_setup";

    // Invalidate existing OTPs of this type
    await db.otpCode.updateMany({
      where: { userId: user.id, type: otpType, used: false },
      data: { used: true },
    });

    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    await db.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        type: otpType,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendOtpEmail(email, code);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
