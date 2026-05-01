import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? {});
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyName, companySize, industry, website, description, location } = await req.json();

  const profile = await db.employerProfile.update({
    where: { userId: session.user.id },
    data: {
      companyName: companyName ?? undefined,
      companySize: companySize ?? undefined,
      industry: industry ?? undefined,
      website: website ?? undefined,
      description: description ?? undefined,
      location: location ?? undefined,
    },
  });

  return NextResponse.json(profile);
}
