import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import { ClientProfile } from "@/models/ClientProfile";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!["client", "freelancer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password complexity: min 8 chars, uppercase and lowercase required
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain both uppercase and lowercase letters" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({ name, email, password, role });

    // Create profile
    if (role === "freelancer") {
      await FreelancerProfile.create({ userId: user._id });
    } else {
      await ClientProfile.create({ userId: user._id });
    }

    return NextResponse.json({ success: true, userId: user._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
