import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { role } = await req.json();
  const validRole = role === "EMPLOYER" ? "EMPLOYER" : "JOB_SEEKER";

  const cookieStore = await cookies();
  cookieStore.set("oauth_pending_role", validRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.json({ ok: true });
}
