import { NextResponse } from "next/server";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { send2FAChangedEmail } from "@/lib/email";

const TOTP_OPTIONS = { algorithm: "sha1" as const, digits: 6, period: 30 };

// GET  — generate a new TOTP secret + QR code (method=totp) or initiate email OTP setup
// POST — verify the code and enable 2FA
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const method = searchParams.get("method") ?? "totp";

  if (method === "email") {
    await db.user.update({
      where: { id: session.user.id },
      data: { twoFactorMethod: "email" },
    });
    return NextResponse.json({ method: "email", ok: true });
  }

  // TOTP setup: generate secret and QR code
  const secret = generateSecret();
  const otpauth = generateURI({
    secret,
    label: session.user.email,
    issuer: "Equalhires",
    ...TOTP_OPTIONS,
  });
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret, twoFactorMethod: "totp" },
  });

  return NextResponse.json({ method: "totp", secret, qrDataUrl });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code, method } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { otpCodes: { where: { type: "2fa_setup", used: false } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (method === "totp") {
      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: "Setup not started" }, { status: 400 });
      }
      const result = verifySync({ secret: user.twoFactorSecret, token: code, ...TOTP_OPTIONS });
      if (!result.valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    } else {
      // Email OTP verification
      const otpRecord = user.otpCodes.find((o) => o.expires > new Date());
      if (!otpRecord) return NextResponse.json({ error: "Code expired or not found" }, { status: 400 });
      const valid = await bcrypt.compare(code, otpRecord.codeHash);
      if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      await db.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
    }

    // Generate 8 backup codes
    const rawCodes: string[] = [];
    const hashedCodes: { codeHash: string; userId: string }[] = [];
    for (let i = 0; i < 8; i++) {
      const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
      const formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
      rawCodes.push(formatted);
      hashedCodes.push({ codeHash: await bcrypt.hash(formatted, 10), userId: session.user.id });
    }

    await db.$transaction([
      db.twoFactorBackupCode.deleteMany({ where: { userId: session.user.id } }),
      db.twoFactorBackupCode.createMany({ data: hashedCodes }),
      db.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: method ?? "totp",
        },
      }),
    ]);

    // Security email (fire-and-forget)
    if (user.email) {
      send2FAChangedEmail(user.email, "enabled").catch(() => {});
    }

    return NextResponse.json({ ok: true, backupCodes: rawCodes });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
