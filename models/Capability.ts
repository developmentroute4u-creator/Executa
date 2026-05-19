import mongoose, { Schema, Document, Model } from "mongoose";

// Layer 3: Capability Lake Schema
export interface ICapabilityLake extends Document {
  name: string; // e.g. "UX Writing", "API Architecture"
  field: "development" | "design";
  domain: string; // e.g. "ui_ux", "backend"
  description: string;
  evaluations: string[]; // Dynamically generated capability-specific dimensions
  createdAt: Date;
}

const CapabilityLakeSchema = new Schema<ICapabilityLake>({
  name: { type: String, required: true, unique: true },
  field: { type: String, enum: ["development", "design"], required: true },
  domain: { type: String, required: true },
  description: { type: String },
  evaluations: [{ type: String }]
}, { timestamps: true });

export const CapabilityLake: Model<ICapabilityLake> =
  mongoose.models.CapabilityLake || mongoose.model<ICapabilityLake>("CapabilityLake", CapabilityLakeSchema);

// Scoring Dimension Schema
export interface IScoringDimension extends Document {
  capabilityName: string;
  dimensionName: string; // e.g. "clarity", "maintainability"
  description: string;
  weight: number; // weight in evaluation out of 10
}

const ScoringDimensionSchema = new Schema<IScoringDimension>({
  capabilityName: { type: String, required: true },
  dimensionName: { type: String, required: true },
  description: { type: String },
  weight: { type: Number, default: 1 }
});

export const ScoringDimension: Model<IScoringDimension> =
  mongoose.models.ScoringDimension || mongoose.model<IScoringDimension>("ScoringDimension", ScoringDimensionSchema);

// Assignment Template Schema (Pre-canned contextual templates if needed)
export interface IAssignmentTemplate extends Document {
  title: string;
  field: "development" | "design";
  domain: string;
  businessProblem: string;
  context: string;
  constraints: string[];
  deliverables: string[];
}

const AssignmentTemplateSchema = new Schema<IAssignmentTemplate>({
  title: { type: String, required: true },
  field: { type: String, enum: ["development", "design"], required: true },
  domain: { type: String, required: true },
  businessProblem: { type: String, required: true },
  context: { type: String, required: true },
  constraints: [{ type: String }],
  deliverables: [{ type: String }]
});

export const AssignmentTemplate: Model<IAssignmentTemplate> =
  mongoose.models.AssignmentTemplate || mongoose.model<IAssignmentTemplate>("AssignmentTemplate", AssignmentTemplateSchema);
