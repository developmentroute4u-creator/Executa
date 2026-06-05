import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PaymentMethod } from "@/models/PaymentMethod";
import mongoose from "mongoose";

// ── GET: list all payment methods for the logged-in client ──────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const methods = await PaymentMethod.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  return NextResponse.json({ methods });
}

// ── POST: save a new payment method ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, upiId, cardLast4, cardBrand, cardExpiry, bank, accountHolderName, consentGiven, label } = body;

  if (!type || !["upi", "card", "netbanking"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!consentGiven) {
    return NextResponse.json({ error: "Consent required" }, { status: 400 });
  }

  // Validate required fields per type
  if (type === "upi" && !upiId) {
    return NextResponse.json({ error: "UPI ID required" }, { status: 400 });
  }
  if (type === "card" && (!cardLast4 || !cardBrand || !cardExpiry)) {
    return NextResponse.json({ error: "Card details incomplete" }, { status: 400 });
  }
  if (type === "netbanking" && !bank) {
    return NextResponse.json({ error: "Bank name required" }, { status: 400 });
  }

  await connectDB();
  const userId = (session.user as any).id;

  // Check if this is the first method → mark as default
  const existingCount = await PaymentMethod.countDocuments({ userId });
  const isDefault = existingCount === 0;

  // Build label
  let resolvedLabel = label;
  if (!resolvedLabel) {
    if (type === "upi") resolvedLabel = upiId;
    else if (type === "card") resolvedLabel = `${cardBrand} •••• ${cardLast4}`;
    else resolvedLabel = `${bank} Net Banking`;
  }

  const method = await PaymentMethod.create({
    userId: new mongoose.Types.ObjectId(userId),
    type,
    label: resolvedLabel,
    upiId: type === "upi" ? upiId : undefined,
    cardLast4: type === "card" ? cardLast4 : undefined,
    cardBrand: type === "card" ? cardBrand : undefined,
    cardExpiry: type === "card" ? cardExpiry : undefined,
    bank: type === "netbanking" ? bank : undefined,
    accountHolderName: accountHolderName || undefined,
    isDefault,
    consentGiven: true,
  });

  return NextResponse.json({ method }, { status: 201 });
}

// ── DELETE: remove a payment method by ID ──────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await connectDB();
  const userId = (session.user as any).id;

  const method = await PaymentMethod.findOneAndDelete({ _id: id, userId });
  if (!method) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If the deleted method was default, promote the next one
  if (method.isDefault) {
    const next = await PaymentMethod.findOne({ userId }).sort({ createdAt: 1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  return NextResponse.json({ success: true });
}

// ── PATCH: set a method as default ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await connectDB();
  const userId = (session.user as any).id;

  // Unset all defaults for this user then set the chosen one
  await PaymentMethod.updateMany({ userId }, { isDefault: false });
  await PaymentMethod.findOneAndUpdate({ _id: id, userId }, { isDefault: true });

  return NextResponse.json({ success: true });
}
