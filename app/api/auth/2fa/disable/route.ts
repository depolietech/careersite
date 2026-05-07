import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Disable 2FA — requires current password for confirmation
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.passwordHash) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });

    await db.$transaction([
      db.twoFactorBackupCode.deleteMany({ where: { userId: session.user.id } }),
      db.otpCode.deleteMany({ where: { userId: session.user.id } }),
      db.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorMethod: null,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
