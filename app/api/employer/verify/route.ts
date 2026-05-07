import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "me.com", "aol.com", "protonmail.com", "proton.me",
  "ymail.com", "mail.com", "zoho.com", "gmx.com", "tutanota.com",
]);

function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

async function checkWebsiteReachable(url: string): Promise<boolean> {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(normalized, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Already pending or approved — no re-submit needed
  if (profile.verificationStatus === "PENDING_REVIEW") {
    return NextResponse.json({ error: "Verification already submitted and under review." }, { status: 409 });
  }
  if (profile.verificationStatus === "APPROVED") {
    return NextResponse.json({ error: "Already verified." }, { status: 409 });
  }

  // All identity fields must be filled before submission
  const missing: string[] = [];
  if (!profile.companyName?.trim())      missing.push("Company name");
  if (!profile.companyLegalName?.trim()) missing.push("Company legal name");
  if (!profile.website?.trim())          missing.push("Website");
  if (!profile.businessAddress?.trim())  missing.push("Business address");
  if (!profile.phone?.trim())            missing.push("Business phone");
  if (!profile.linkedinUrl?.trim())      missing.push("LinkedIn company page");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Please fill in all required fields before submitting: ${missing.join(", ")}.` },
      { status: 400 }
    );
  }

  // Auto-checks
  const emailDomain = profile.user.email.split("@")[1]?.toLowerCase() ?? "";
  const isPublicEmail = PUBLIC_EMAIL_DOMAINS.has(emailDomain);
  const websiteDomain = extractDomain(profile.website!);
  const domainMatchPassed = !isPublicEmail && websiteDomain !== "" && websiteDomain === emailDomain;
  const websiteCheckPassed = await checkWebsiteReachable(profile.website!);

  const updated = await db.employerProfile.update({
    where: { userId: session.user.id },
    data: {
      verificationStatus: "PENDING_REVIEW",
      verificationSubmittedAt: new Date(),
      websiteCheckPassed,
      domainMatchPassed,
      verificationNote: null,
    },
  });

  return NextResponse.json({
    verificationStatus: updated.verificationStatus,
    websiteCheckPassed,
    domainMatchPassed,
  });
}
