import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";
import { User } from "@/models/User";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { Project } from "@/models/Project";
import { Scope } from "@/models/Scope";
import { ClientProfile } from "@/models/ClientProfile";

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const session = await getServerSession(authOptions);
  
  const isAdmin = adminCookie === "authenticated" || (session && (session.user as any).role === "admin");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    await connectDB();
    const tests = await Test.find({ status: "under_review" }).sort({ createdAt: 1 }).lean();
    const withNames = await Promise.all(
      tests.map(async (t) => {
        const u = await User.findById(t.freelancerId).lean();
        return { ...t, freelancerName: (u as any)?.name };
      })
    );
    return NextResponse.json({ tests: withNames });
  } catch (err: any) {
    console.error("[ADMIN_TESTS_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
