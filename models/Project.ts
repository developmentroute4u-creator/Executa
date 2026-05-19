import mongoose, { Schema, Document, Model } from "mongoose";

export type ProjectStatus =
  | "scoping"
  | "scope_review"
  | "pricing"
  | "matching"
  | "active"
  | "review"
  | "completed"
  | "disputed"
  | "cancelled";

export interface IProject extends Document {
  clientId: mongoose.Types.ObjectId;
  freelancerId?: mongoose.Types.ObjectId;
  scopeId?: mongoose.Types.ObjectId;
  title: string;
  industry: string;
  goal: string;
  businessName?: string;
  businessWebsite?: string;
  businessModel?: string;
  usageContext: string;
  targetAudience: string;
  requiredFunctionality: string[];
  references: string[];
  priority: "low" | "medium" | "high" | "critical";
  deadline?: Date;
  status: ProjectStatus;
  field?: "development" | "design";
  requiredLevel?: 1 | 2 | 3;
  pricing?: {
    freelancerPrice: number;
    scopeFee: number;
    accountabilityFee: number;
    executionFee: number;
    total: number;
    ratePerPoint: number;
    accountabilityMode: "basic" | "accountability";
  };
  accountabilityMode: "basic" | "accountability";
  milestones: {
    title: string;
    dueDate: Date;
    status: "pending" | "submitted" | "approved";
    deliverables: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
  freelancerAccepted?: boolean;
}

const ProjectSchema = new Schema<IProject>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User" },
    scopeId: { type: Schema.Types.ObjectId, ref: "Scope" },
    title: { type: String, required: true, trim: true },
    industry: { type: String, required: true },
    goal: { type: String, required: true },
    businessName: { type: String, default: "" },
    businessWebsite: { type: String, default: "" },
    businessModel: { type: String, default: "" },
    usageContext: { type: String, default: "" },
    targetAudience: { type: String, default: "" },
    requiredFunctionality: [{ type: String }],
    references: [{ type: String }],
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["scoping", "scope_review", "pricing", "matching", "active", "review", "completed", "disputed", "cancelled"],
      default: "scoping",
    },
    field: { type: String, enum: ["development", "design"] },
    requiredLevel: { type: Number, enum: [1, 2, 3] },
    pricing: {
      freelancerPrice: Number,
      scopeFee: Number,
      accountabilityFee: Number,
      executionFee: Number,
      total: Number,
      ratePerPoint: Number,
      accountabilityMode: { type: String, enum: ["basic", "accountability"] },
    },
    accountabilityMode: { type: String, enum: ["basic", "accountability"], default: "basic" },
    milestones: [
      {
        title: String,
        dueDate: Date,
        status: { type: String, enum: ["pending", "submitted", "approved"], default: "pending" },
        deliverables: [String],
      },
    ],
    freelancerAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ freelancerId: 1, status: 1 });
ProjectSchema.index({ status: 1, field: 1, requiredLevel: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
