import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  industry: string;
  website?: string;
  projectIds: mongoose.Types.ObjectId[];
  onboardingStep: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    company: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String },
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    onboardingStep: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ClientProfileSchema.index({ userId: 1 });

export const ClientProfile: Model<IClientProfile> =
  mongoose.models.ClientProfile ||
  mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);
