import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  senderRole: "client" | "freelancer" | "admin";
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  senderRole: { type: String, enum: ["client", "freelancer", "admin"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Message) {
  delete mongoose.models.Message;
}

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
