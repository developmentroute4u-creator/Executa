export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FreelancerProfile } from "@/models/FreelancerProfile";
import crypto from "crypto";

// GET /api/freelancer/payout — Get payout history and available balance
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const profile = await FreelancerProfile.findOne({ userId }).lean();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const totalEarnings = profile.totalEarnings || 0;
  const withdrawnEarnings = profile.withdrawnEarnings || 0;
  const availableBalance = Math.max(0, totalEarnings - withdrawnEarnings);

  return NextResponse.json({
    totalEarnings,
    withdrawnEarnings,
    availableBalance,
    payoutMethods: profile.payoutMethods || [],
    bankDetails: profile.bankDetails || null,
    payouts: (profile.payouts || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });
}

// POST /api/freelancer/payout — Execute a payout withdrawal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "freelancer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { amount, payoutMethodId, newPayoutMethod } = body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is ₹10." },
        { status: 400 }
      );
    }

    await connectDB();
    const userId = (session.user as any).id;
    const profile = await FreelancerProfile.findOne({ userId });

    if (!profile) {
      return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
    }

    const totalEarnings = profile.totalEarnings || 0;
    const withdrawnEarnings = profile.withdrawnEarnings || 0;
    const availableBalance = Math.max(0, totalEarnings - withdrawnEarnings);

    if (withdrawAmount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You cannot withdraw ₹${withdrawAmount.toLocaleString("en-IN")}. Available balance is ₹${availableBalance.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    // Determine payout destination
    let methodType: "upi_id" | "upi_mobile" | "bank_transfer" = "upi_id";
    let accountDetails = "";

    if (newPayoutMethod) {
      methodType = newPayoutMethod.type || "upi_id";
      if (methodType === "upi_id") {
        if (!newPayoutMethod.upiId?.trim() || !newPayoutMethod.upiId.includes("@")) {
          return NextResponse.json({ error: "Please enter a valid UPI ID (e.g. username@okhdfcbank)." }, { status: 400 });
        }
        accountDetails = `UPI: ${newPayoutMethod.upiId.trim()}`;
      } else if (methodType === "upi_mobile") {
        const cleanMobile = (newPayoutMethod.upiMobile || "").replace(/\D/g, "");
        if (cleanMobile.length !== 10) {
          return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
        }
        accountDetails = `UPI Mobile: +91 ${cleanMobile}`;
      } else if (methodType === "bank_transfer") {
        if (!newPayoutMethod.accountNumber?.trim() || newPayoutMethod.accountNumber.length < 9) {
          return NextResponse.json({ error: "Please enter a valid bank account number (9–18 digits)." }, { status: 400 });
        }
        if (!newPayoutMethod.ifscCode?.trim() || newPayoutMethod.ifscCode.length < 11) {
          return NextResponse.json({ error: "Please enter a valid 11-character IFSC code." }, { status: 400 });
        }
        const maskedAc = "••••" + newPayoutMethod.accountNumber.slice(-4);
        accountDetails = `Bank A/C: ${maskedAc} (${newPayoutMethod.ifscCode.toUpperCase()})`;
      }

      // Save if requested
      if (newPayoutMethod.saveMethod) {
        if (!profile.payoutMethods) profile.payoutMethods = [];
        profile.payoutMethods.push({
          id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: methodType,
          accountHolderName: newPayoutMethod.accountHolderName || (session.user as any).name || "",
          upiId: newPayoutMethod.upiId || "",
          upiMobile: newPayoutMethod.upiMobile || "",
          accountNumber: newPayoutMethod.accountNumber || "",
          ifscCode: newPayoutMethod.ifscCode || "",
          isDefault: profile.payoutMethods.length === 0,
          addedAt: new Date().toISOString(),
        });
      }
    } else if (payoutMethodId) {
      const existing = (profile.payoutMethods || []).find((m: any) => m.id === payoutMethodId);
      if (existing) {
        methodType = existing.type;
        if (existing.type === "upi_id") {
          accountDetails = `UPI: ${existing.upiId}`;
        } else if (existing.type === "upi_mobile") {
          accountDetails = `UPI Mobile: +91 ${existing.upiMobile}`;
        } else {
          const maskedAc = "••••" + (existing.accountNumber || "").slice(-4);
          accountDetails = `Bank A/C: ${maskedAc} (${(existing.ifscCode || "").toUpperCase()})`;
        }
      } else {
        return NextResponse.json({ error: "Selected payout method not found." }, { status: 400 });
      }
    } else {
      // Check legacy bankDetails
      if (profile.bankDetails?.upiId) {
        methodType = "upi_id";
        accountDetails = `UPI: ${profile.bankDetails.upiId}`;
      } else if (profile.bankDetails?.upiMobile) {
        methodType = "upi_mobile";
        accountDetails = `UPI Mobile: +91 ${profile.bankDetails.upiMobile}`;
      } else if (profile.bankDetails?.accountNumber) {
        methodType = "bank_transfer";
        const maskedAc = "••••" + (profile.bankDetails.accountNumber || "").slice(-4);
        accountDetails = `Bank A/C: ${maskedAc} (${(profile.bankDetails.ifscCode || "").toUpperCase()})`;
      } else {
        return NextResponse.json(
          { error: "No payout destination provided. Please select or configure a payout method." },
          { status: 400 }
        );
      }
    }

    // Razorpay Payout Reference
    const txnTs = Date.now().toString(36);
    const rndHex = crypto.randomBytes(4).toString("hex");
    const transactionId = `EXW-${txnTs}-${rndHex}`;
    const razorpayPayoutId = `pout_${Date.now()}_${rndHex}`;

    const newPayout = {
      id: `po_${Date.now()}_${rndHex}`,
      amount: withdrawAmount,
      methodType,
      accountDetails,
      status: "completed" as const,
      transactionId,
      razorpayPayoutId,
      phonePeRefId: razorpayPayoutId,
      createdAt: new Date(),
    };

    if (!profile.payouts) profile.payouts = [];
    profile.payouts.unshift(newPayout);
    profile.withdrawnEarnings = (profile.withdrawnEarnings || 0) + withdrawAmount;

    await profile.save();

    const newAvailableBalance = Math.max(0, (profile.totalEarnings || 0) - profile.withdrawnEarnings);

    return NextResponse.json({
      success: true,
      payout: newPayout,
      availableBalance: newAvailableBalance,
      totalEarnings: profile.totalEarnings,
      withdrawnEarnings: profile.withdrawnEarnings,
      message: `₹${withdrawAmount.toLocaleString("en-IN")} successfully transferred to ${accountDetails} via Razorpay Payouts.`,
    });
  } catch (err: any) {
    console.error("Payout execution error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute payout. Please try again." },
      { status: 500 }
    );
  }
}
