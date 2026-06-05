import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupportChat } from "@/models/SupportChat";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

// POST: admin sends a reply in a specific chat
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    await connectDB();
    const chat = await (SupportChat as any).findById(params.chatId);
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    chat.messages.push({
      sender: "admin",
      senderName: "Support Agent",
      content: content.trim(),
      createdAt: new Date(),
    });
    await chat.save();

    return NextResponse.json({ success: true, messages: chat.messages });
  } catch (err: any) {
    console.error("[ADMIN_SUPPORT_REPLY]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: update status (resolve) or priority of a chat
export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};
    // Only allow resolving — once resolved, a ticket is permanently closed
    if (body.status === "resolved") update.status = body.status;
    if (["low", "medium", "high"].includes(body.priority)) update.priority = body.priority;

    await connectDB();
    const chat = await (SupportChat as any).findByIdAndUpdate(params.chatId, update, { new: true });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    return NextResponse.json({ success: true, chat });
  } catch (err: any) {
    console.error("[ADMIN_SUPPORT_PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
