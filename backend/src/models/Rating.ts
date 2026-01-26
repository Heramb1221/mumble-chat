import mongoose, { Schema, type Document } from "mongoose";

export interface IRating extends Document {
  user: mongoose.Types.ObjectId;
  rating: number;
  feedback?: string;
  version?: string;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    platform: {
      type: String,
      enum: ["ios", "android", "web"],
    },
  },
  { timestamps: true }
);

// Each user can only have one rating (will update if they rate again)
RatingSchema.index({ user: 1 }, { unique: true });
RatingSchema.index({ rating: 1, createdAt: -1 });

export const Rating = mongoose.model<IRating>("Rating", RatingSchema);