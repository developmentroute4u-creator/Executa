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
  payment?: {
    status: "pending" | "initiated" | "paid" | "failed";
    transactionId?: string;
    merchantTransactionId?: string;
    amount?: number;
    paidAt?: Date;
  };
  accountabilityMode: "basic" | "accountability";
  milestones: {
    title: string;
    dueDate?: Date;
    status: "pending" | "submitted" | "approved";
    deliverables?: string[];
    percentage?: number;
    amount?: number;
    submissionUrl?: string;
    submissionNotes?: string;
    submittedAt?: Date;
    payment?: {
      status: "pending" | "initiated" | "paid" | "failed";
      transactionId?: string;
      merchantTransactionId?: string;
      paidAt?: Date;
    };
  }[];
  pendingCustomUnit?: {
    id?: string;
    name: string;
    description?: string;
    included?: string[];
    excluded?: string[];
    deliverables?: string[];
    unitScore?: number;
    effortDrivers?: Record<string, number>;
    addedByClient?: boolean;
    platformFee?: number;
    unitPrice?: number;
    merchantTransactionId?: string;
    paymentStatus?: "initiated" | "paid" | "failed";
    transactionId?: string;
    paidAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  freelancerAccepted?: boolean;
  clientAcknowledgedAcceptance?: boolean;
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
    payment: {
      status: { type: String, enum: ["pending", "initiated", "paid", "failed"], default: "pending" },
      transactionId: { type: String },
      merchantTransactionId: { type: String },
      amount: { type: Number },
      paidAt: { type: Date },
    },
    accountabilityMode: { type: String, enum: ["basic", "accountability"], default: "basic" },
    milestones: [
      {
        title: String,
        dueDate: Date,
        status: { type: String, enum: ["pending", "submitted", "approved"], default: "pending" },
        deliverables: [String],
        percentage: Number,
        amount: Number,
        submissionUrl: String,
        submissionNotes: String,
        submittedAt: Date,
        payment: {
          status: { type: String, enum: ["pending", "initiated", "paid", "failed"], default: "pending" },
          transactionId: String,
          merchantTransactionId: String,
          paidAt: Date,
        }
      },
    ],
    freelancerAccepted: { type: Boolean, default: false },
    clientAcknowledgedAcceptance: { type: Boolean, default: false },
    pendingCustomUnit: {
      id: { type: String },
      name: { type: String },
      description: { type: String },
      included: [{ type: String }],
      excluded: [{ type: String }],
      deliverables: [{ type: String }],
      unitScore: { type: Number },
      effortDrivers: { type: Schema.Types.Mixed },
      addedByClient: { type: Boolean },
      platformFee: { type: Number },
      unitPrice: { type: Number },
      merchantTransactionId: { type: String },
      paymentStatus: { type: String, enum: ["initiated", "paid", "failed"] },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ freelancerId: 1, status: 1 });
ProjectSchema.index({ status: 1, field: 1, requiredLevel: 1 });

if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export const Project: Model<IProject> =
  mongoose.model<IProject>("Project", ProjectSchema);
