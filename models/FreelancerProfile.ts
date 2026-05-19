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
  activeProjectIds: mongoose.Types.ObjectId[];
  completedProjectIds: mongoose.Types.ObjectId[];
  onboardingStep: number;
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
    activeProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    completedProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    onboardingStep: { type: Number, default: 1 },
  },
  { timestamps: true }
);

FreelancerProfileSchema.index({ userId: 1 });
FreelancerProfileSchema.index({ field: 1, domain: 1, level: 1, available: 1 });

export const FreelancerProfile: Model<IFreelancerProfile> =
  mongoose.models.FreelancerProfile ||
  mongoose.model<IFreelancerProfile>("FreelancerProfile", FreelancerProfileSchema);
