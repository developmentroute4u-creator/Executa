import mongoose, { Schema, Document, Model } from "mongoose";

export type FeatureFlagRole = "freelancer" | "client" | "global";

export interface IFeatureFlag extends Document {
  key: string;
  role: FeatureFlagRole;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, unique: true },
    role: { type: String, enum: ["freelancer", "client", "global"], required: true },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FeatureFlagSchema.index({ role: 1, enabled: 1 });

export const FeatureFlag: Model<IFeatureFlag> =
  mongoose.models.FeatureFlag ||
  mongoose.model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
