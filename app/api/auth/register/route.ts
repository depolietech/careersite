import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { validatePasswordOrThrow } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "me.com", "aol.com", "protonmail.com", "proton.me",
  "ymail.com", "mail.com", "zoho.com", "gmx.com", "tutanota.com",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, recruiterType, firstName, lastName, companyName, agreedToTerms, emailMarketing } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!agreedToTerms) {
      return NextResponse.json({ error: "You must accept the Terms & Conditions and Privacy Policy" }, { status: 400 });
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    try {
      validatePasswordOrThrow(password);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.deletedAt) {
        // Notify all admin users so they can track recovery attempts
        const admins = await db.user.findMany({
          where: { role: "ADMIN", deletedAt: null },
          select: { id: true },
        });
        if (admins.length > 0) {
          await db.notification.createMany({
            data: admins.map((a) => ({
              userId: a.id,
              type: "DELETED_USER_SIGNUP",
              title: "Deleted user attempted signup",
              body: `${email} attempted to register a new account. Their previous account was soft-deleted.`,
            })),
          });
        }
        return NextResponse.json(
          { code: "ACCOUNT_DELETED", error: "This email was previously associated with an Equalhires account." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
    const isPublicEmail = PUBLIC_EMAIL_DOMAINS.has(emailDomain);
    // Public-email recruiters start with lower trust score
    const initialTrustScore = role === "EMPLOYER" ? (isPublicEmail ? 60 : 100) : 100;

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role,
        isPublicEmail,
        recruiterType: role === "EMPLOYER" ? (recruiterType ?? "COMPANY") : null,
        emailMarketing: emailMarketing === true,
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
              trustScore: initialTrustScore,
            },
          },
        }),
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Generate a 6-digit verification code (expires in 15 min)
    const verifyCode = String(Math.floor(100000 + crypto.randomInt(900000)));
    const codeHash = crypto.createHash("sha256").update(verifyCode).digest("hex");
    await db.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        type: "email_verify",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendVerificationEmail(email, token, verifyCode);
    } catch (emailErr) {
      console.error("[register] verification email failed:", emailErr);
      // Registration succeeded — don't block the user, they can resend from the check-email page
    }

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
