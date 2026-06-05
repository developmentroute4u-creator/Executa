import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SupportChat } from "@/models/SupportChat";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

// GET: list all support chats (optionally filtered by status query param)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "active" | "resolved" | null (all)

  const filter: Record<string, unknown> = {};
  if (status === "active" || status === "resolved") filter.status = status;

  const chats = await (SupportChat as any).find(filter)
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ chats });
}
