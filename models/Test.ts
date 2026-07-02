import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestDeliverable {
  label: string;
  description: string;
  required: boolean;
  type: "link" | "file_url" | "notes" | "repository";
}

export interface ITestProgressCheckpoint {
  id: string;
  label: string;
  completed: boolean;
}

export interface ITestSubmission {
  repositoryLink?: string;
  designFileUrl?: string;
  prototypeLink?: string;
  documentationUrl?: string;
  supportingFilesUrl?: string;
  notes?: string;
  files?: Array<{ label: string; url: string }>;
  submittedAt?: Date;
}

export interface ITestProjectOverview {
  background: string;
  currentSituation: string;
  businessProblem: string;
  expectedOutcome: string;
}

export interface ITestInternalArtifacts {
  expectedSolution: string;
  expectedFunctionalUnits: string[];
  referenceOutcome: string;
  evaluationRubric: Record<string, string>;
  capabilityIndicators: string[];
  decisionPoints: string[];
  levelRecommendation: string;
}

export interface ITest extends Document {
  freelancerId: mongoose.Types.ObjectId;
  field: "development" | "design";
  domain: string;
  specialization: string; // Kept for legacy compatibility
  specializations: string[]; // Micro-capabilities selected
  level: 1 | 2 | 3;
  
  // Legacy fields kept for backward compatibility
  taskPrompt: string;
  taskRequirements: string[];
  projectContext?: string;
  businessProblem?: string;
  constraints?: string[];
  deliverables?: any[]; // Can be string[] (legacy) or ITestDeliverable[] (new)
  submissionUrl?: string;
  submissionNotes?: string;
  submittedAt?: Date;

  // New 11-section fields
  assignmentTitle?: string;
  capabilityArea?: string;
  assignmentSummary?: string;
  projectOverview?: ITestProjectOverview;
  yourRole?: string;
  projectObjectives?: string[];
  exceptions?: string[];
  successCriteria?: string;
  commonMistakes?: string[];
  importantNotes?: string[];
  internalArtifacts?: ITestInternalArtifacts;
  
  status: "assigned" | "in_progress" | "submitted" | "under_review" | "evaluated";
  locked?: boolean;
  timerStartedAt?: Date;
  
  progressCheckpoints?: ITestProgressCheckpoint[];
  savedProgress?: string;
  submission?: ITestSubmission;

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
    
    // Legacy fields
    taskPrompt: { type: String, required: true },
    taskRequirements: [{ type: String }],
    projectContext: { type: String },
    businessProblem: { type: String },
    constraints: [{ type: String }],
    
    // Legacy submission
    submissionUrl: { type: String },
    submissionNotes: { type: String },
    submittedAt: { type: Date },

    // New 11-section fields
    assignmentTitle: { type: String },
    capabilityArea: { type: String },
    assignmentSummary: { type: String },
    projectOverview: {
      background: { type: String },
      currentSituation: { type: String },
      businessProblem: { type: String },
      expectedOutcome: { type: String },
    },
    yourRole: { type: String },
    projectObjectives: [{ type: String }],
    exceptions: [{ type: String }],
    successCriteria: { type: String },
    deliverables: { type: Schema.Types.Mixed }, // Allows string[] or deliverables objects
    commonMistakes: [{ type: String }],
    importantNotes: [{ type: String }],
    internalArtifacts: {
      expectedSolution: { type: String },
      expectedFunctionalUnits: [{ type: String }],
      referenceOutcome: { type: String },
      evaluationRubric: { type: Schema.Types.Mixed },
      capabilityIndicators: [{ type: String }],
      decisionPoints: [{ type: String }],
      levelRecommendation: { type: String, default: "Level 2" },
    },

    status: {
      type: String,
      enum: ["assigned", "in_progress", "submitted", "under_review", "evaluated"],
      default: "assigned",
    },
    locked: { type: Boolean, default: false },
    timerStartedAt: { type: Date },

    progressCheckpoints: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    savedProgress: { type: String },
    submission: {
      repositoryLink: { type: String },
      designFileUrl: { type: String },
      prototypeLink: { type: String },
      documentationUrl: { type: String },
      supportingFilesUrl: { type: String },
      notes: { type: String },
      files: [
        {
          label: { type: String },
          url: { type: String },
        }
      ],
      submittedAt: { type: Date },
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

if (mongoose.models.Test) {
  delete mongoose.models.Test;
}

export const Test: Model<ITest> = mongoose.model<ITest>("Test", TestSchema);
