import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { validatePasswordOrThrow } from "@/lib/password";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    try {
      validatePasswordOrThrow(password);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const record = await db.verificationToken.findFirst({
      where: { token, identifier: { startsWith: "password-reset:" } },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const email = record.identifier.replace("password-reset:", "");
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });
    await db.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token } } });

    await sendPasswordChangedEmail(email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
