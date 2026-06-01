import mongoose, { Schema, Document, Model } from "mongoose";

export type ProjectStatus =
  | "scoping"
  | "scope_review"
  | "pricing"
  | "matching"
  | "pending"
  | "active"
  | "review"
  | "completed"
  | "disputed"
  | "cancelled";

export interface IProject extends Document {
  clientId: mongoose.Types.ObjectId;
  freelancerId?: mongoose.Types.ObjectId; // Kept for backwards compatibility
  assignedFreelancers?: {
    userId: mongoose.Types.ObjectId;
    role: "design" | "development" | "fullstack";
    splitPrice?: number;
    accepted?: boolean;
  }[];
  scopeId?: mongoose.Types.ObjectId;
  title: string;
  field: "development" | "design" | "design_development"; // This acts as Domain
  
  // Discovery Questions
  projectDescription: string;
  projectProblem: string;
  targetUsers: string;
  userJourney: string;
  managedEntities: string;
  specialRequirements?: string;
  successCriteria: string;

  priority: "low" | "medium" | "high" | "critical";
  deadline?: Date;
  status: ProjectStatus;
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
    assignedFreelancers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["design", "development", "fullstack"] },
        splitPrice: { type: Number },
        accepted: { type: Boolean, default: false }
      }
    ],
    scopeId: { type: Schema.Types.ObjectId, ref: "Scope" },
    title: { type: String, required: true, trim: true },
    field: { type: String, enum: ["development", "design", "design_development"], required: true },

    projectDescription: { type: String, required: true },
    projectProblem: { type: String, required: true },
    targetUsers: { type: String, required: true },
    userJourney: { type: String, required: true },
    managedEntities: { type: String, required: true },
    specialRequirements: { type: String, default: "" },
    successCriteria: { type: String, required: true },

    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["scoping", "scope_review", "pricing", "matching", "pending", "active", "review", "completed", "disputed", "cancelled"],
      default: "scoping",
    },
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
