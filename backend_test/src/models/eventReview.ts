import { EventReview } from "../types/eventReview.types";
import { Schema, model } from "mongoose";

const eventReviewSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

eventReviewSchema.index({ event: 1, user: 1 }, { unique: true });
eventReviewSchema.index({ event: 1, createdAt: -1 });

export default model<EventReview>("EventReview", eventReviewSchema);
