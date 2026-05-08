import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const employers = await db.employerProfile.findMany({
    where: { isBlocked: false, companyName: { not: "" } },
    select: { id: true, companyName: true, industry: true },
    orderBy: { companyName: "asc" },
  });
  return NextResponse.json(employers);
}
