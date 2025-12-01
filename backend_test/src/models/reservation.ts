// src/models/reservation.ts
import { Schema, model, Document, Types } from "mongoose";

export interface Reservation extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event', 
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar reservas duplicadas
reservationSchema.index({ user: 1, event: 1 }, { unique: true });

export default model<Reservation>("Reservation", reservationSchema);