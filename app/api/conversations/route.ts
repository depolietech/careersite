import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { candidateCode } from "@/lib/masking";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id!;
  const role = session.user.role;

  if (role === "JOB_SEEKER") {
    const conversations = await db.conversation.findMany({
      where: { application: { userId } },
      include: {
        application: { include: { job: { select: { title: true } } } },
        messages: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      conversations.map((c) => ({
        id: c.id,
        jobTitle: c.application.job.title,
        lastMessage: c.messages[0]?.body ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unread: c.messages.filter((m) => m.senderId !== userId).length,
      }))
    );
  }

  if (role === "EMPLOYER") {
    const conversations = await db.conversation.findMany({
      where: { application: { job: { postedById: userId } } },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            profile: { select: { id: true } },
          },
        },
        messages: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      conversations.map((c) => ({
        id: c.id,
        jobTitle: c.application.job.title,
        candidateCode: c.application.profile
          ? candidateCode(c.application.profile.id)
          : "Unknown",
        revealed: c.application.revealed,
        lastMessage: c.messages[0]?.body ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unread: c.messages.filter((m) => m.senderId !== userId).length,
      }))
    );
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
