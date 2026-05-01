import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const base = new URL(req.url).origin;

  if (!token) {
    return NextResponse.redirect(`${base}/login?error=invalid-token`);
  }

  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(`${base}/login?error=expired-token`);
  }

  await db.$transaction([
    db.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(`${base}/login?verified=true`);
}
