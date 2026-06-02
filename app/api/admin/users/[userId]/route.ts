import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { ClientProfile } from "@/models/ClientProfile";
import { Project } from "@/models/Project";

function isAdminRequest(req: NextRequest, session: any) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  return adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
}

/** PATCH /api/admin/users/[userId] — suspend/unsuspend or change role */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminRequest(req, session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = params;
  const body = await req.json();

  await connectDB();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (typeof body.suspended === "boolean") {
    user.suspended = body.suspended;
  }
  if (body.role && ["client", "freelancer", "admin"].includes(body.role)) {
    user.role = body.role;
  }

  await user.save();
  return NextResponse.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, suspended: user.suspended, role: user.role } });
}

/** GET /api/admin/users/[userId] — full user detail with profile + projects */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminRequest(req, session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = params;
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const freelancerProfile = await FreelancerProfile.findOne({ userId }).lean();
  const clientProfile = await ClientProfile.findOne({ userId }).lean();
  const projects = await Project.find({
    $or: [{ clientId: userId }, { freelancerId: userId }]
  }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ user, freelancerProfile, clientProfile, projects });
}
