import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentMethodType = "upi" | "card" | "netbanking";

export interface IPaymentMethod extends Document {
  _id: any;
  userId: mongoose.Types.ObjectId;
  type: PaymentMethodType;
  label: string;          // human-readable: "arjun@okicici" / "HDFC •••• 4321"
  // UPI fields
  upiId?: string;
  // Card fields
  cardLast4?: string;
  cardBrand?: string;     // "VISA" | "Mastercard" | "RuPay" | "Amex"
  cardExpiry?: string;    // "MM/YY"
  // Net Banking
  bank?: string;          // "HDFC" | "ICICI" | "SBI" | "Axis" | "Kotak"
  accountHolderName?: string;
  // Meta
  isDefault: boolean;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["upi", "card", "netbanking"], required: true },
    label: { type: String, required: true, trim: true },
    // UPI
    upiId: { type: String, trim: true },
    // Card
    cardLast4: { type: String },
    cardBrand: { type: String },
    cardExpiry: { type: String },
    // Net Banking
    bank: { type: String },
    accountHolderName: { type: String, trim: true },
    // Meta
    isDefault: { type: Boolean, default: false },
    consentGiven: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);
