import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/recover-account
// body: { email: string; action: "request" | "new" }
//
// request — marks the account with reinstateRequestedAt so admin can approve.
//            The account stays deleted; admin sends the verification email upon approval.
//
// new     — anonymises the deleted account's email address so the same email can
//            be used to register a completely fresh account.

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: "email and action are required" }, { status: 400 });
    }
    if (action !== "request" && action !== "new") {
      return NextResponse.json({ error: "action must be 'request' or 'new'" }, { status: 400 });
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
        data: { reinstateRequestedAt: new Date() },
      });

      // Notify all admins
      const admins = await db.user.findMany({
        where: { role: "ADMIN", deletedAt: null },
        select: { id: true },
      });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "REINSTATE_REQUESTED",
            title: "Reinstatement request",
            body: `${email} is requesting to reinstate their deleted Equalhires account. Review in the admin panel → Deleted Users.`,
          })),
        });
      }

      return NextResponse.json({ ok: true });
    }

    // action === "new": free the email for a fresh registration
    await db.user.update({
      where: { id: user.id },
      data: { email: `purged-${user.id}@deleted.equalhires.internal` },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recover-account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
