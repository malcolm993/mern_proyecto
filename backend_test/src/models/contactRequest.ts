import { Schema, model, Document, Types } from "mongoose";

export interface ContactRequest extends Document {
  requester: Types.ObjectId;
  receiver: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema<ContactRequest>({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, { timestamps: true });

contactRequestSchema.index(
  { requester: 1, receiver: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default model<ContactRequest>("ContactRequest", contactRequestSchema);
