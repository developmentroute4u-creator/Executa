import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDispute extends Document {
  projectId: mongoose.Types.ObjectId;
  proposerId: mongoose.Types.ObjectId;
  proposerRole: "client" | "freelancer";
  reason: string;
  details: string;
  status: "active" | "resolved";
  resolutionNotes?: string;
  platformAudit: {
    milestonesTotal: number;
    milestonesOverdue: number;
    overdueDaysMax: number;
    lastFreelancerMessageAt?: Date;
    lastClientMessageAt?: Date;
    freelancerInactivityHours: number;
    clientInactivityHours: number;
    auditVerdict: string;
  };
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    proposerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    proposerRole: { type: String, enum: ["client", "freelancer"], required: true },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    resolutionNotes: { type: String, default: "" },
    platformAudit: {
      milestonesTotal: { type: Number, default: 0 },
      milestonesOverdue: { type: Number, default: 0 },
      overdueDaysMax: { type: Number, default: 0 },
      lastFreelancerMessageAt: { type: Date },
      lastClientMessageAt: { type: Date },
      freelancerInactivityHours: { type: Number, default: 0 },
      clientInactivityHours: { type: Number, default: 0 },
      auditVerdict: { type: String, default: "" },
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models.Dispute) {
  delete mongoose.models.Dispute;
}

export const Dispute: Model<IDispute> =
  mongoose.model<IDispute>("Dispute", DisputeSchema);
