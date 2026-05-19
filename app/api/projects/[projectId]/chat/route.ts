import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Message } from "@/models/Message";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const project = await Project.findById(params.projectId).lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Ensure only the project owner (client) or assigned freelancer can access
  const isClient = project.clientId.toString() === userId;
  const isFreelancer = project.freelancerId && project.freelancerId.toString() === userId;

  if (!isClient && !isFreelancer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await (Message as any).find({ projectId: params.projectId }).sort({ createdAt: 1 }).lean();

  // Anonymize names and roles as per requirements
  const sanitizedMessages = messages.map((m: any) => {
    const isMe = m.senderId.toString() === userId;

    let senderDisplayName = "";
    if (role === "client") {
      // Client views freelancer anonymized
      senderDisplayName = isMe ? "You (Client)" : "Matched Expert";
    } else {
      // Freelancer views client anonymized
      senderDisplayName = isMe ? "You (Expert)" : "Client Partner";
    }

    return {
      _id: m._id.toString(),
      senderDisplayName,
      content: m.content,
      createdAt: m.createdAt,
      isMe
    };
  });

  return NextResponse.json({ messages: sanitizedMessages, projectTitle: project.title });
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const project = await Project.findById(params.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isClient = project.clientId.toString() === userId;
    const isFreelancer = project.freelancerId && project.freelancerId.toString() === userId;

    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await Message.create({
      projectId: project._id,
      senderId: userId,
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
        isMe: true
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("[CHAT_POST_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
