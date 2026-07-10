import { Schema, model } from "mongoose";
import { Message } from "../types/message.types";

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

messageSchema.index({ from: 1, to: 1, createdAt: 1 });
messageSchema.index({ to: 1, read: 1, createdAt: -1 });

export default model<Message>("Message", messageSchema);