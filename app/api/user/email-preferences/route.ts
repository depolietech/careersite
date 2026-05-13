import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailMarketing: true, emailJobAlerts: true, emailAppUpdates: true },
  });

  return NextResponse.json(user ?? { emailMarketing: true, emailJobAlerts: true, emailAppUpdates: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { emailMarketing, emailJobAlerts, emailAppUpdates } = await req.json();

  await db.user.update({
    where: { id: session.user.id },
    data: {
      emailMarketing:  typeof emailMarketing  === "boolean" ? emailMarketing  : undefined,
      emailJobAlerts:  typeof emailJobAlerts  === "boolean" ? emailJobAlerts  : undefined,
      emailAppUpdates: typeof emailAppUpdates === "boolean" ? emailAppUpdates : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
