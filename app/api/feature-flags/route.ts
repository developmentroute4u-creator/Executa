import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FeatureFlag } from "@/models/FeatureFlag";
import { seedFeatureFlags } from "@/lib/featureFlags";

/**
 * Public GET endpoint — returns enabled feature keys for a role.
 * Used by FloatingWorkspaceRail and ClientWorkspaceRail on the client side.
 * No authentication required (flags are not sensitive).
 */
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") as "freelancer" | "client" | null;
  if (!role || !["freelancer", "client"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    await connectDB();
    await seedFeatureFlags();
    const flags = await FeatureFlag.find({ role }).lean();
    return NextResponse.json(
      { flags: flags.map((f) => ({ key: f.key, enabled: f.enabled })) },
      {
        headers: {
          // Cache for 30 seconds — cheap invalidation without extra overhead
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
