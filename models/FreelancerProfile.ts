import mongoose, { Schema, Document, Model } from "mongoose";

export type FreelancerField = "development" | "design";
export type FreelancerDomain =
  | "frontend" | "backend" | "fullstack" | "mobile" | "devops" | "data_ai" | "cms"
  | "ui_ux" | "graphic" | "branding" | "motion" | "product";

export type FreelancerLevel = 1 | 2 | 3;
export type TestStatus = "not_started" | "in_progress" | "submitted" | "under_review" | "approved" | "rejected";

export interface IFreelancerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  field: FreelancerField;
  domain: FreelancerDomain;
  specializations: string[];
  bio: string;
  level: FreelancerLevel | null;
  testStatus: TestStatus;
  testScore: number | null;
  scoreBreakdown: {
    functionalCoverage: number;
    logic: number;
    usability: number;
    edgeCases: number;
    outputQuality: number;
  } | null;
  ratePerPoint: number | null;
  available: boolean;
  portfolio: { title: string; url: string; description: string }[];
  totalEarnings: number;
  withdrawnEarnings?: number;
  activeProjectIds: mongoose.Types.ObjectId[];
  completedProjectIds: mongoose.Types.ObjectId[];
  onboardingStep: number;
  bankDetails?: {
    payoutMethod?: "upi_id" | "upi_mobile" | "bank_transfer";
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    upiMobile?: string;
  };
  payoutMethods?: Array<{
    id: string;
    type: "upi_id" | "upi_mobile" | "bank_transfer";
    accountHolderName: string;
    upiId?: string;
    upiMobile?: string;
    accountNumber?: string;
    ifscCode?: string;
    isDefault: boolean;
    addedAt?: string;
  }>;
  payouts?: Array<{
    id: string;
    amount: number;
    methodType: "upi_id" | "upi_mobile" | "bank_transfer";
    accountDetails: string;
    status: "completed" | "processing" | "failed";
    transactionId: string;
    razorpayPayoutId?: string;
    phonePeRefId?: string;
    createdAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    field: { type: String, enum: ["development", "design"] },
    domain: { type: String },
    specializations: [{ type: String }],
    bio: { type: String, default: "" },
    level: { type: Number, default: null },
    testStatus: {
      type: String,
      enum: ["not_started", "in_progress", "submitted", "under_review", "approved", "rejected"],
      default: "not_started",
    },
    testScore: { type: Number, default: null },
    scoreBreakdown: {
      functionalCoverage: { type: Number },
      logic: { type: Number },
      usability: { type: Number },
      edgeCases: { type: Number },
      outputQuality: { type: Number },
    },
    ratePerPoint: { type: Number, default: null },
    available: { type: Boolean, default: true },
    portfolio: [
      {
        title: { type: String },
        url: { type: String },
        description: { type: String },
      },
    ],
    totalEarnings: { type: Number, default: 0 },
    withdrawnEarnings: { type: Number, default: 0 },
    activeProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    completedProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    onboardingStep: { type: Number, default: 1 },
    bankDetails: {
      payoutMethod: { type: String, default: "bank_transfer" },
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" },
      upiMobile: { type: String, default: "" },
    },
    payoutMethods: [
      {
        id: { type: String },
        type: { type: String, enum: ["upi_id", "upi_mobile", "bank_transfer"] },
        accountHolderName: { type: String, default: "" },
        upiId: { type: String, default: "" },
        upiMobile: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
        addedAt: { type: String },
      },
    ],
    payouts: [
      {
        id: { type: String },
        amount: { type: Number, required: true },
        methodType: { type: String, enum: ["upi_id", "upi_mobile", "bank_transfer"] },
        accountDetails: { type: String },
        status: { type: String, enum: ["completed", "processing", "failed"], default: "completed" },
        transactionId: { type: String },
        razorpayPayoutId: { type: String },
        phonePeRefId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

FreelancerProfileSchema.index({ field: 1, domain: 1, level: 1, available: 1 });

if (mongoose.models.FreelancerProfile) {
  delete mongoose.models.FreelancerProfile;
}

export const FreelancerProfile: Model<IFreelancerProfile> =
  mongoose.model<IFreelancerProfile>("FreelancerProfile", FreelancerProfileSchema);
