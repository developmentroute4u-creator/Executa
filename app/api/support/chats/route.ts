import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SupportChat } from "@/models/SupportChat";

// GET: fetch the active support chat for current user (or null)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;

  const chat = await (SupportChat as any).findOne({ userId, status: "active" }).lean();
  return NextResponse.json({ chat: chat || null });
}

// POST: create a new support chat session with an opening message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    await connectDB();
    const user = session.user as any;

    // If an active chat already exists, just append the message
    let chat = await (SupportChat as any).findOne({ userId: user.id, status: "active" });
    if (chat) {
      chat.messages.push({
        sender: "user",
        senderName: `${user.name} (${user.role === "client" ? "Client" : "Expert"})`,
        content: content.trim(),
        createdAt: new Date(),
      });
      await chat.save();
      return NextResponse.json({ chat });
    }

    // Create fresh chat session
    chat = await SupportChat.create({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      messages: [
        {
          sender: "user",
          senderName: `${user.name} (${user.role === "client" ? "Client" : "Expert"})`,
          content: content.trim(),
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (err: any) {
    console.error("[SUPPORT_CHAT_POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
