import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScopeUpgrade extends Document {
  projectId: mongoose.Types.ObjectId;
  originalScopeId: mongoose.Types.ObjectId;
  status: "draft" | "pending_freelancer_approval" | "approved" | "rejected";
  
  // Client Input
  requestDetails: {
    whatToAdd: string;
    howItWorks: string;
    whyNeeded?: string;
  };
  
  // AI Generated Proposal
  proposedUnit: any;
  scopeImpactSummary: string;
  deliverableImpact: string[];
  
  // Internal Processing Impact
  costImpact: number;
  effortImpact: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ScopeUpgradeSchema = new Schema<IScopeUpgrade>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    originalScopeId: { type: Schema.Types.ObjectId, ref: "Scope", required: true },
    status: { type: String, enum: ["draft", "pending_freelancer_approval", "approved", "rejected"], default: "draft" },
    
    requestDetails: {
      whatToAdd: { type: String, required: true },
      howItWorks: { type: String, required: true },
      whyNeeded: { type: String, default: "" },
    },
    
    proposedUnit: { type: Schema.Types.Mixed, required: true },
    scopeImpactSummary: { type: String, required: true },
    deliverableImpact: [{ type: String }],
    
    costImpact: { type: Number, required: true },
    effortImpact: { type: Number, required: true },
  },
  { timestamps: true }
);

ScopeUpgradeSchema.index({ projectId: 1, status: 1 });

export const ScopeUpgrade: Model<IScopeUpgrade> =
  mongoose.models.ScopeUpgrade || mongoose.model<IScopeUpgrade>("ScopeUpgrade", ScopeUpgradeSchema);
