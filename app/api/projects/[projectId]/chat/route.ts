export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Message } from "@/models/Message";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  let session = await getServerSession(authOptions);
  let userId = session ? (session.user as any).id : null;
  let role = session ? (session.user as any).role : "client";

  if (!userId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userId = token.id as string;
      role = (token.role as string) || "client";
    }
  }

  const isAdmin = adminCookie === "authenticated" || role === "admin";

  await connectDB();
  const project = await Project.findById(params.projectId).lean() as any;
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const messages = await (Message as any).find({ projectId: params.projectId }).sort({ createdAt: 1 }).lean();

  const sanitizedMessages = messages.map((m: any) => {
    const isMe = isAdmin ? (m.senderRole === "admin") : (m.senderId && userId && m.senderId.toString() === userId);

    let senderDisplayName = "";
    if (m.senderRole === "admin") {
      senderDisplayName = "Findade System Alert";
    } else if (isAdmin) {
      senderDisplayName = m.senderRole === "client" ? "Client" : "Expert";
    } else if (role === "client") {
      senderDisplayName = isMe ? "You (Client)" : "Matched Expert";
    } else {
      senderDisplayName = isMe ? "You (Expert)" : "Client Partner";
    }

    return {
      _id: m._id.toString(),
      senderDisplayName,
      content: m.content,
      createdAt: m.createdAt,
      isMe,
      senderRole: m.senderRole
    };
  });

  return NextResponse.json({ messages: sanitizedMessages, projectTitle: project.title });
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  let session = await getServerSession(authOptions);
  let userId = session ? (session.user as any).id : null;
  let role = session ? (session.user as any).role : "client";

  if (!userId) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userId = token.id as string;
      role = (token.role as string) || "client";
    }
  }

  try {
    const { content } = await req.json();
    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const effectiveUserId = userId || project.clientId;

    const message = await Message.create({
      projectId: project._id,
      senderId: effectiveUserId,
      senderRole: role as "client" | "freelancer",
      content: content.trim()
    });

    return NextResponse.json({
      success: true,
      message: {
        _id: message._id.toString(),
        senderDisplayName: role === "client" ? "You (Client)" : "You (Expert)",
        content: message.content,
        createdAt: message.createdAt,
        isMe: true,
        senderRole: message.senderRole
      }
    });
  } catch (err: any) {
    console.error("[CHAT_POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
