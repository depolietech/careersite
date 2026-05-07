import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorMethod: true },
  });

  return NextResponse.json({
    enabled: user?.twoFactorEnabled ?? false,
    method: user?.twoFactorMethod ?? null,
  });
}
