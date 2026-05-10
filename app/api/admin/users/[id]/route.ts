import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function isAdmin(role: string | undefined) {
  return role === "ADMIN";
}

// PATCH /api/admin/users/[id] — block/unblock/approve
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, note } = body;

  const user = await db.user.findUnique({
    where: { id },
    include: { employerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let result: Record<string, unknown> = {};

  if (action === "block") {
    if (user.employerProfile) {
      await db.employerProfile.update({
        where: { userId: id },
        data: { isBlocked: true, trustScore: 0 },
      });
    }
    result = { blocked: true };
  } else if (action === "unblock") {
    if (user.employerProfile) {
      await db.employerProfile.update({
        where: { userId: id },
        data: { isBlocked: false, interviewsCancelled: 0, trustScore: 100 },
      });
    }
    result = { blocked: false };
  } else if (action === "approve") {
    await db.user.update({
      where: { id },
      data: { emailVerified: new Date() },
    });
    result = { approved: true };
  } else if (action === "reinstate") {
    await db.user.update({
      where: { id },
      data: { deletedAt: null, emailVerified: null },
    });
    result = { reinstated: true };
  } else if (action === "purge") {
    await db.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "PURGE_USER",
        targetId: id,
        targetType: "USER",
        note: note ?? "Admin hard-deleted deleted user",
      },
    });
    await db.user.delete({ where: { id } });
    return NextResponse.json({ purged: true });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: action.toUpperCase(),
      targetId: id,
      targetType: "USER",
      note: note ?? null,
    },
  });

  return NextResponse.json(result);
}

// DELETE /api/admin/users/[id] — soft-delete account
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const note = searchParams.get("note") ?? "";

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await db.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "DELETE_USER",
      targetId: id,
      targetType: "USER",
      note: note || "Admin soft-deleted user",
    },
  });

  return NextResponse.json({ ok: true });
}
