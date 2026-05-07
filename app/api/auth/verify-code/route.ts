import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || typeof code !== "string") {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Return generic error to avoid user enumeration
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const record = await db.otpCode.findFirst({
      where: {
        userId: user.id,
        type: "email_verify",
        used: false,
        expires: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    const submittedHash = crypto.createHash("sha256").update(trimmedCode).digest("hex");
    const storedHash = Buffer.from(record.codeHash, "hex");
    const inputHash  = Buffer.from(submittedHash, "hex");

    const match =
      storedHash.length === inputHash.length &&
      crypto.timingSafeEqual(storedHash, inputHash);

    if (!match) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.otpCode.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-code]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
