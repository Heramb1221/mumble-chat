import mongoose, { Schema, type Document } from "mongoose";

export interface ISupport extends Document {
  user: mongoose.Types.ObjectId;
  category: "bug" | "feature" | "help" | "other";
  subject: string;
  message: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema = new Schema<ISupport>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["bug", "feature", "help", "other"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

SupportSchema.index({ user: 1, createdAt: -1 });
SupportSchema.index({ status: 1, createdAt: -1 });

export const Support = mongoose.model<ISupport>("Support", SupportSchema);