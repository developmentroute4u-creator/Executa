import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Deliverable ────────────────────────────────────────────────────────────
export interface IDeliverable {
  label: string;
  description: string;
  required: boolean;
  type: "link" | "file_url" | "notes" | "repository";
}

// ─── Progress Checkpoint ────────────────────────────────────────────────────
export interface IProgressCheckpoint {
  id: string;
  label: string;
  completed: boolean;
}

// ─── Submission ─────────────────────────────────────────────────────────────
export interface IAssessmentSubmission {
  repositoryLink?: string;
  designFileUrl?: string;
  prototypeLink?: string;
  documentationUrl?: string;
  supportingFilesUrl?: string;
  notes?: string;
  submittedAt?: Date;
}

// ─── Project Overview (Section 2) ───────────────────────────────────────────
export interface IProjectOverview {
  background: string;
  currentSituation: string;
  businessProblem: string;
  expectedOutcome: string;
}

// ─── Internal Artifacts (server-only, NEVER sent to client) ─────────────────
export interface IInternalArtifacts {
  expectedSolution: string;
  expectedFunctionalUnits: string[];
  referenceOutcome: string;
  evaluationRubric: Record<string, string>;
  capabilityIndicators: string[];
  decisionPoints: string[];
  levelRecommendation: string;
}

// ─── Assessment Document Interface ──────────────────────────────────────────
export interface IAssessment extends Document {
  freelancerId: mongoose.Types.ObjectId;
  field: "development" | "design";
  domain: string;
  specialization: string;
  specializations: string[];
  level: 1 | 2 | 3;

  // ── Section 1: Assignment ──────────────────────────────────────────────────
  assignmentTitle: string;       // displayed heading
  capabilityArea: string;        // e.g. "UI/UX Design", "API Architecture"
  assignmentSummary: string;     // short 2-sentence summary

  // ── Section 2: Project Overview ───────────────────────────────────────────
  projectOverview: IProjectOverview;

  // ── Section 3: Your Role ──────────────────────────────────────────────────
  yourRole: string;

  // ── Section 4: Project Objectives ────────────────────────────────────────
  projectObjectives: string[];

  // ── Section 5: Constraints ────────────────────────────────────────────────
  constraints: string[];

  // ── Section 6: Exceptions ────────────────────────────────────────────────
  exceptions: string[];

  // ── Section 7: Success Criteria ──────────────────────────────────────────
  successCriteria: string;

  // ── Section 8: Deliverables ───────────────────────────────────────────────
  deliverables: IDeliverable[];

  // ── Section 9: Common Mistakes to Avoid ──────────────────────────────────
  commonMistakes: string[];

  // ── Section 10: Important Notes ──────────────────────────────────────────
  importantNotes: string[];

  // ── Internal artifacts (evaluation team only) ─────────────────────────────
  internalArtifacts: IInternalArtifacts;

  // ── State ─────────────────────────────────────────────────────────────────
  status: "assigned" | "in_progress" | "submitted" | "under_review" | "evaluated";
  locked: boolean;
  timerStartedAt?: Date;

  // ── Progress & auto-save ──────────────────────────────────────────────────
  progressCheckpoints: IProgressCheckpoint[];
  savedProgress?: string;

  // ── Submission ────────────────────────────────────────────────────────────
  submission: IAssessmentSubmission;

  // ── Evaluation ────────────────────────────────────────────────────────────
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
  };

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const AssessmentSchema = new Schema<IAssessment>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    field: { type: String, enum: ["development", "design"], required: true },
    domain: { type: String, required: true },
    specialization: { type: String },
    specializations: [{ type: String }],
    level: { type: Number, enum: [1, 2, 3], default: 2 },

    // Section 1
    assignmentTitle: { type: String, required: true },
    capabilityArea:  { type: String, required: true },
    assignmentSummary: { type: String },

    // Section 2
    projectOverview: {
      background:       { type: String },
      currentSituation: { type: String },
      businessProblem:  { type: String },
      expectedOutcome:  { type: String },
    },

    // Section 3
    yourRole: { type: String },

    // Section 4
    projectObjectives: [{ type: String }],

    // Section 5
    constraints: [{ type: String }],

    // Section 6
    exceptions: [{ type: String }],

    // Section 7
    successCriteria: { type: String },

    // Section 8
    deliverables: [
      {
        label:       { type: String, required: true },
        description: { type: String },
        required:    { type: Boolean, default: true },
        type: {
          type: String,
          enum: ["link", "file_url", "notes", "repository"],
          default: "link",
        },
      },
    ],

    // Section 9
    commonMistakes: [{ type: String }],

    // Section 10
    importantNotes: [{ type: String }],

    // Internal (never exposed)
    internalArtifacts: {
      expectedSolution:       { type: String },
      expectedFunctionalUnits:[{ type: String }],
      referenceOutcome:       { type: String },
      evaluationRubric:       { type: Schema.Types.Mixed },
      capabilityIndicators:   [{ type: String }],
      decisionPoints:         [{ type: String }],
      levelRecommendation:    { type: String, default: "Level 2" },
    },

    status: {
      type: String,
      enum: ["assigned", "in_progress", "submitted", "under_review", "evaluated"],
      default: "assigned",
    },
    locked:          { type: Boolean, default: false },
    timerStartedAt:  { type: Date },

    progressCheckpoints: [
      {
        id:        { type: String, required: true },
        label:     { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    savedProgress: { type: String },

    submission: {
      repositoryLink:    { type: String },
      designFileUrl:     { type: String },
      prototypeLink:     { type: String },
      documentationUrl:  { type: String },
      supportingFilesUrl:{ type: String },
      notes:             { type: String },
      submittedAt:       { type: Date },
    },

    evaluation: {
      functionalCoverage: { type: Number, min: 0, max: 10, default: 0 },
      logic:              { type: Number, min: 0, max: 10, default: 0 },
      usability:          { type: Number, min: 0, max: 10, default: 0 },
      edgeCases:          { type: Number, min: 0, max: 10, default: 0 },
      outputQuality:      { type: Number, min: 0, max: 10, default: 0 },
      total:              { type: Number, min: 0, max: 50, default: 0 },
      assignedLevel:      { type: Number, enum: [1, 2, 3], default: 1 },
      evaluatorNotes:     { type: String },
      evaluatedAt:        { type: Date },
    },
  },
  { timestamps: true }
);

AssessmentSchema.index({ freelancerId: 1 });
AssessmentSchema.index({ status: 1 });

export const Assessment: Model<IAssessment> =
  mongoose.models.Assessment ||
  mongoose.model<IAssessment>("Assessment", AssessmentSchema);
