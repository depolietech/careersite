import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAdminAccountRequestEmail, sendReinstatementRequestedEmail } from "@/lib/email";

// POST /api/auth/recover-account
// body: { email: string; action: "request" | "new" | "contact" }
//
// request — marks account with reinstateRequestedAt + reinstateType="restore".
//            Account stays deleted. Admin approves → reactivates + sends verification email.
//
// new     — marks account with reinstateRequestedAt + reinstateType="new_account".
//            Email is NOT freed yet. Admin approves → purges email + notifies user to register.
//
// contact — no account change. Creates admin notifications + sends admin email.

async function notifyAdmins(
  type: string,
  title: string,
  body: string,
  email: string,
  requestType: "restore" | "new_account" | "contact"
) {
  const admins = await db.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true, email: true },
  });

  if (admins.length > 0) {
    await db.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type,
        title,
        body,
      })),
    });

    // Send email to each admin (fire-and-forget, don't block the response)
    for (const admin of admins) {
      sendAdminAccountRequestEmail(admin.email, email, requestType).catch(() => {});
    }
  }
}

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: "email and action are required" }, { status: 400 });
    }
    if (!["request", "new", "contact"].includes(action)) {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }

    // "contact" doesn't need a deleted account — just notify admins
    if (action === "contact") {
      await notifyAdmins(
        "CONTACT_REQUEST",
        "Support contact from deleted account",
        `${email} contacted support about their deleted Equalhires account and is requesting manual review.`,
        email,
        "contact"
      );
      return NextResponse.json({ ok: true });
    }

    const user = await db.user.findFirst({
      where: { email, deletedAt: { not: null } },
    });

    if (!user) {
      return NextResponse.json({ error: "No deleted account found for this email" }, { status: 404 });
    }

    if (action === "request") {
      // Already has a pending request — don't spam admins
      if (user.reinstateRequestedAt) {
        return NextResponse.json({ ok: true, alreadyPending: true });
      }

      await db.user.update({
        where: { id: user.id },
        data: { reinstateRequestedAt: new Date(), reinstateType: "restore" },
      });

      await notifyAdmins(
        "REINSTATE_REQUESTED",
        "Account reinstatement request",
        `${email} is requesting to reinstate their deleted Equalhires account. Review in Admin → Account Requests.`,
        email,
        "restore"
      );

      // Send confirmation to the user (fire-and-forget)
      sendReinstatementRequestedEmail(email).catch(() => {});

      return NextResponse.json({ ok: true });
    }

    // action === "new": request to purge data and start fresh — requires admin approval
    if (user.reinstateRequestedAt) {
      return NextResponse.json({ ok: true, alreadyPending: true });
    }

    await db.user.update({
      where: { id: user.id },
      data: { reinstateRequestedAt: new Date(), reinstateType: "new_account" },
    });

    await notifyAdmins(
      "NEW_ACCOUNT_REQUESTED",
      "New account request (after data purge)",
      `${email} wants to permanently delete their old account data and start fresh with a new account. They cannot register until you approve. Review in Admin → Account Requests.`,
      email,
      "new_account"
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recover-account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
