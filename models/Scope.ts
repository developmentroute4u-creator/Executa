import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEffortDriver {
  name: string;
  logicDepth: number;
  interactionDensity: number;
  dataHandling: number;
  dependencyLevel: number;
  variations: number;
  outputExpectation: number;
  totalScore: number;
}

export interface IFunctionalUnit {
  id: string;
  name: string;
  description: string;
  effortDrivers: IEffortDriver;
  unitScore: number;
  included: string[];
  excluded: string[];
  deliverables: string[];
  addedByClient?: boolean;
}

export interface IScope extends Document {
  projectId: mongoose.Types.ObjectId;
  projectSummary: {
    overview: string;
    businessGoal: string;
    primaryUsers: string[];
  };
  functionalUnits: IFunctionalUnit[];
  overallIncluded: string[];
  overallExcluded: string[];
  expectedDeliverables: string[];
  requiredCapabilities: string[]; // INTERNAL
  totalEffortScore: number;
  effortLevel: 1 | 2 | 3;
  timeline: {
    estimated: number;
    unit: "days" | "weeks";
  };
  revisionRules: string[];
  upgradeRules: string[];
  status: "draft" | "confirmed" | "locked";
  version: number;
  previousScopeId?: mongoose.Types.ObjectId;
  generatedAt: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EffortDriverSchema = new Schema({
  name: String,
  logicDepth: { type: Number, min: 1, max: 10 },
  interactionDensity: { type: Number, min: 1, max: 10 },
  dataHandling: { type: Number, min: 1, max: 10 },
  dependencyLevel: { type: Number, min: 1, max: 10 },
  variations: { type: Number, min: 1, max: 10 },
  outputExpectation: { type: Number, min: 1, max: 10 },
  totalScore: Number,
}, { _id: false });

const FunctionalUnitSchema = new Schema({
  id: String,
  name: String,
  description: String,
  effortDrivers: EffortDriverSchema,
  unitScore: Number,
  included: [String],
  excluded: [String],
  deliverables: [String],
  addedByClient: { type: Boolean, default: false },
}, { _id: false, strict: false });

const ScopeSchema = new Schema<IScope>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    projectSummary: {
      overview: { type: String, required: true },
      businessGoal: { type: String, required: true },
      primaryUsers: [{ type: String }],
    },
    functionalUnits: [FunctionalUnitSchema],
    overallIncluded: [{ type: String }],
    overallExcluded: [{ type: String }],
    expectedDeliverables: [{ type: String }],
    requiredCapabilities: [{ type: String }],
    totalEffortScore: { type: Number, required: true },
    effortLevel: { type: Number, enum: [1, 2, 3], required: true },
    timeline: {
      estimated: Number,
      unit: { type: String, enum: ["days", "weeks"], default: "weeks" },
    },
    revisionRules: [String],
    upgradeRules: [String],
    status: { type: String, enum: ["draft", "confirmed", "locked"], default: "draft" },
    version: { type: Number, default: 1 },
    previousScopeId: { type: Schema.Types.ObjectId, ref: "Scope" },
    generatedAt: { type: Date, default: Date.now },
    confirmedAt: Date,
  },
  { timestamps: true }
);

ScopeSchema.index({ projectId: 1 });

export const Scope: Model<IScope> =
  mongoose.models.Scope || mongoose.model<IScope>("Scope", ScopeSchema);
