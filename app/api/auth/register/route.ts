import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, recruiterType, firstName, lastName, companyName } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role,
        recruiterType: role === "EMPLOYER" ? (recruiterType ?? "COMPANY") : null,
        ...(role === "JOB_SEEKER" && {
          jobSeekerProfile: {
            create: {
              firstName: firstName ?? "",
              lastName: lastName ?? "",
              skills: "[]",
            },
          },
        }),
        ...(role === "EMPLOYER" && {
          employerProfile: {
            create: {
              companyName: companyName ?? "",
            },
          },
        }),
      },
    });

    // Create email verification token
    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    console.log(`[EMAIL VERIFICATION] Verify link for ${email}: ${appUrl}/api/auth/verify-email?token=${token}`);

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
