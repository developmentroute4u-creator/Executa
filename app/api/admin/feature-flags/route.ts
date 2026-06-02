import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FeatureFlag } from "@/models/FeatureFlag";
import { seedFeatureFlags } from "@/lib/featureFlags";

function isAdminRequest(req: NextRequest, session: any) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  return adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
}

/** GET — returns all flags (admin view) */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRequest(req, session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  await seedFeatureFlags();
  const flags = await FeatureFlag.find({}).sort({ role: 1, key: 1 }).lean();
  return NextResponse.json({ flags });
}

/** PATCH — toggle a single flag */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRequest(req, session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, enabled } = await req.json();
  if (!key || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Missing key or enabled" }, { status: 400 });
  }

  await connectDB();
  const flag = await FeatureFlag.findOneAndUpdate(
    { key },
    { enabled },
    { new: true }
  );
  if (!flag) {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }
  return NextResponse.json({ flag });
}
