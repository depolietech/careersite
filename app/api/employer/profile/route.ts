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

  const { companyName, companyLegalName, companySize, industry, website, businessAddress, phone, businessRegistrationNumber, linkedinUrl, description, location } = await req.json();

  // If key identity fields changed after a rejection, reset to INCOMPLETE so they re-submit
  const existing = await db.employerProfile.findUnique({ where: { userId: session.user.id } });
  const identityChanged =
    existing?.verificationStatus === "REJECTED" &&
    (companyName !== existing.companyName ||
      website !== existing.website ||
      businessAddress !== existing.businessAddress);

  const profile = await db.employerProfile.update({
    where: { userId: session.user.id },
    data: {
      companyName:                companyName                ?? undefined,
      companyLegalName:           companyLegalName           ?? undefined,
      companySize:                companySize                ?? undefined,
      industry:                   industry                   ?? undefined,
      website:                    website                    ?? undefined,
      businessAddress:            businessAddress            ?? undefined,
      phone:                      phone                      ?? undefined,
      businessRegistrationNumber: businessRegistrationNumber ?? undefined,
      linkedinUrl:                linkedinUrl                ?? undefined,
      description:                description                ?? undefined,
      location:                   location                   ?? undefined,
      ...(identityChanged && { verificationStatus: "INCOMPLETE", verificationNote: null }),
    },
  });

  return NextResponse.json(profile);
}
