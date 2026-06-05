import mongoose, { Schema, Document } from "mongoose";

export interface ISupportMessage {
  sender: "user" | "admin";
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ISupportChat extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: "client" | "freelancer";
  status: "active" | "resolved";
  priority: "low" | "medium" | "high";
  messages: ISupportMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SupportChatSchema = new Schema<ISupportChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, enum: ["client", "freelancer"], required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    messages: { type: [SupportMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const SupportChat =
  mongoose.models.SupportChat ||
  mongoose.model<ISupportChat>("SupportChat", SupportChatSchema);
