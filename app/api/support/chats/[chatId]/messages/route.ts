import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SupportChat } from "@/models/SupportChat";

// GET: poll for new messages in a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;

  const chat = await (SupportChat as any).findOne({ _id: params.chatId, userId }).lean();
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ messages: (chat as any).messages, status: (chat as any).status });
}

// POST: send a new user message to an existing chat
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    await connectDB();
    const user = session.user as any;

    const chat = await (SupportChat as any).findOne({ _id: params.chatId, userId: user.id });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    if (chat.status === "resolved") {
      return NextResponse.json({ error: "This support session is resolved" }, { status: 400 });
    }

    chat.messages.push({
      sender: "user",
      senderName: `${user.name} (${user.role === "client" ? "Client" : "Expert"})`,
      content: content.trim(),
      createdAt: new Date(),
    });
    await chat.save();

    return NextResponse.json({ success: true, messages: chat.messages });
  } catch (err: any) {
    console.error("[SUPPORT_MESSAGE_POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
