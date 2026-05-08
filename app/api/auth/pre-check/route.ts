import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Checks account state (verification, suspension, pending approval) BEFORE
 * the client attempts signIn. Required because NextAuth v5 beta swallows
 * custom Error messages from authorize(), always returning "CredentialsSignin".
 *
 * Does NOT validate the password — that is still handled by NextAuth.
 * Returns "ok" for unknown emails to avoid revealing user existence.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ status: "ok" });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employerProfile: true },
    });

    // Unknown email or OAuth-only account — let signIn return invalid credentials
    if (!user || !user.passwordHash) {
      return NextResponse.json({ status: "ok" });
    }

    if (user.deletedAt) {
      return NextResponse.json({ status: "ACCOUNT_DELETED" });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ status: "EMAIL_NOT_VERIFIED" });
    }

    if (user.role === "EMPLOYER" && user.employerProfile) {
      if (user.employerProfile.isBlocked) {
        return NextResponse.json({ status: "ACCOUNT_SUSPENDED" });
      }
      if (user.employerProfile.verificationStatus === "PENDING_REVIEW") {
        return NextResponse.json({ status: "ACCOUNT_PENDING_APPROVAL" });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "ok" });
  }
}
