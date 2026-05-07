import { NextResponse } from "next/server";
import { verifySync } from "otplib";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const TOTP_OPTIONS = { algorithm: "sha1" as const, digits: 6, period: 30 };

// Verify a 2FA code during login (TOTP, email OTP, or backup code)
export async function POST(req: Request) {
  try {
    const { email, code, isBackupCode } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await db.user.findUnique({
      where: { email },
      include: {
        twoFactorBackupCodes: { where: { used: false } },
        otpCodes: { where: { type: "2fa_login", used: false } },
      },
    });

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
    }

    if (isBackupCode) {
      const matched = await Promise.all(
        user.twoFactorBackupCodes.map(async (bc) => ({
          id: bc.id,
          match: await bcrypt.compare(code.toUpperCase(), bc.codeHash),
        }))
      );
      const found = matched.find((m) => m.match);
      if (!found) return NextResponse.json({ error: "Invalid backup code" }, { status: 400 });
      await db.twoFactorBackupCode.update({ where: { id: found.id }, data: { used: true } });
      return NextResponse.json({ ok: true });
    }

    if (user.twoFactorMethod === "totp") {
      if (!user.twoFactorSecret) return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
      const result = verifySync({ secret: user.twoFactorSecret, token: code, ...TOTP_OPTIONS });
      if (!result.valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    } else {
      // Email OTP
      const otpRecord = user.otpCodes.find((o) => o.expires > new Date());
      if (!otpRecord) return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
      const valid = await bcrypt.compare(code, otpRecord.codeHash);
      if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      await db.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
