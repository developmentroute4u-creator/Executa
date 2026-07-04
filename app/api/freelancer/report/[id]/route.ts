import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Test } from "@/models/Test";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    await connectDB();
    const test = await Test.findOne({ _id: params.id, freelancerId: userId }).lean() as any;
    if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Strip internal artifacts — never expose to freelancer
    delete test.internalArtifacts;

    return NextResponse.json({ test });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
