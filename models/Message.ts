import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: "client" | "freelancer";
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["client", "freelancer"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
