import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITest extends Document {
  freelancerId: mongoose.Types.ObjectId;
  field: "development" | "design";
  domain: string;
  specialization: string; // Kept for legacy compatibility
  specializations: string[]; // Micro-capabilities selected
  level: 1 | 2 | 3;
  taskPrompt: string;
  taskRequirements: string[];
  
  // Real-world dynamic assignment context
  projectContext?: string;
  businessProblem?: string;
  constraints?: string[];
  deliverables?: string[];
  
  submissionUrl?: string;
  submissionNotes?: string;
  submittedAt?: Date;
  status: "assigned" | "in_progress" | "submitted" | "under_review" | "evaluated";
  
  evaluation?: {
    functionalCoverage: number;
    logic: number;
    usability: number;
    edgeCases: number;
    outputQuality: number;
    total: number;
    assignedLevel: 1 | 2 | 3;
    evaluatorNotes: string;
    evaluatedAt: Date;
    
    // Dynamically evaluated capability-specific dimensions
    capabilityScores?: Array<{
      capabilityName: string;
      dimensionName: string;
      score: number; // 0-10
      feedback?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITest>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    field: { type: String, enum: ["development", "design"], required: true },
    domain: { type: String, required: true },
    specialization: { type: String },
    specializations: [{ type: String }],
    level: { type: Number, enum: [1, 2, 3], default: 2 },
    taskPrompt: { type: String, required: true },
    taskRequirements: [{ type: String }],
    
    projectContext: { type: String },
    businessProblem: { type: String },
    constraints: [{ type: String }],
    deliverables: [{ type: String }],
    
    submissionUrl: { type: String },
    submissionNotes: { type: String },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ["assigned", "in_progress", "submitted", "under_review", "evaluated"],
      default: "assigned",
    },
    evaluation: {
      functionalCoverage: { type: Number, min: 0, max: 10, default: 0 },
      logic: { type: Number, min: 0, max: 10, default: 0 },
      usability: { type: Number, min: 0, max: 10, default: 0 },
      edgeCases: { type: Number, min: 0, max: 10, default: 0 },
      outputQuality: { type: Number, min: 0, max: 10, default: 0 },
      total: { type: Number, min: 0, max: 50, default: 0 },
      assignedLevel: { type: Number, enum: [1, 2, 3], default: 1 },
      evaluatorNotes: { type: String },
      evaluatedAt: { type: Date },
      capabilityScores: [
        {
          capabilityName: { type: String, required: true },
          dimensionName: { type: String, required: true },
          score: { type: Number, min: 0, max: 10, default: 0 },
          feedback: { type: String }
        }
      ]
    },
  },
  { timestamps: true }
);

TestSchema.index({ freelancerId: 1 });
TestSchema.index({ status: 1 });

export const Test: Model<ITest> =
  mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);
