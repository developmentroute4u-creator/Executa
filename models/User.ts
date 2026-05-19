import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: any;
  name: string;
  email: string;
  password: string;
  role: "client" | "freelancer" | "admin";
  avatar?: string;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["client", "freelancer", "admin"], required: true },
    avatar: { type: String },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
