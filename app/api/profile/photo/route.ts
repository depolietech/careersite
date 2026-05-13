import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, or GIF images are supported" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }

  const userId = session.user.id;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const uploadDir = path.join(process.cwd(), "public", "uploads", "photos", userId);
  await mkdir(uploadDir, { recursive: true });

  const filename = `photo-${Date.now()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const photoUrl = `/uploads/photos/${userId}/${filename}`;

  await db.jobSeekerProfile.upsert({
    where: { userId },
    create: { userId, firstName: "", lastName: "", skills: "[]", photoUrl },
    update: { photoUrl },
  });

  return NextResponse.json({ photoUrl });
}
