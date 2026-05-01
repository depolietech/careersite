import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getConversation(id: string) {
  return db.conversation.findUnique({
    where: { id },
    include: {
      application: { include: { job: true } },
      messages: {
        include: { sender: { select: { id: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id!;

  const conversation = await getConversation(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    conversation.application.userId === userId ||
    conversation.application.job.postedById === userId;

  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(
    conversation.messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      isOwn: m.senderId === userId,
      senderRole: m.sender.role,
    }))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id!;
  const { body } = await req.json();

  if (!body?.trim()) return NextResponse.json({ error: "Message body required" }, { status: 400 });

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { application: { include: { job: true } } },
  });

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    conversation.application.userId === userId ||
    conversation.application.job.postedById === userId;

  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await db.message.create({
    data: { conversationId: id, senderId: userId, body: body.trim() },
  });

  await db.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    isOwn: true,
    senderRole: session.user.role,
  }, { status: 201 });
}
