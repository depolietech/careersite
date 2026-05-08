import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const employers = await db.employerProfile.findMany({
    where: { verificationStatus: "APPROVED", isBlocked: false },
    select: { id: true, companyName: true, industry: true },
    orderBy: { companyName: "asc" },
  });
  return NextResponse.json(employers);
}
