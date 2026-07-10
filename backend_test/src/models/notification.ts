import { Schema, model } from "mongoose";
import { Notification } from "../types/notifaction.types";

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_cancelled',
      'contact_request_received',
      'contact_request_accepted',
      'upcoming_event'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default model<Notification>("Notification", notificationSchema);
