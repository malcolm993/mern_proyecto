// backend/src/models/event.ts - ACTUALIZAR
import { model, Schema } from "mongoose";
import { Event } from "../types";

const eventSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  location: { type: String, required: true },
  startDateTime: { type: Date, required: true,
    validate: {
      validator: function (value: Date) {
        return value > new Date();
      },
      message: "La fecha y hora de inicio tiene que ser posterior a la fecha actual"
    }
  },
  endDateTime: {
    type: Date, required: true,
    validate: {
      validator: function (this: any, value: Date) {
        return value > this.startDateTime;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  maxParticipants: { type: Number, required: true, min: 1, max: 10 },
  currentParticipants: {
    type: Number, required: true, default: 0, min: 0,
    validate: {
      validator: function (this: any) {
        return this.currentParticipants <= this.maxParticipants;
      },
      message: 'Los participantes actuales no pueden exceder el máximo'
    }
  },
  status: {
    type: String, required: true,
    enum: ['activo', 'cancelado', 'finalizado', 'agotado'],
    default: 'activo',
  },
  interestCategory: {
    type: String, required: true,
    enum: ['tecnología', 'negocios', 'artes', 'deportes', 'educacion', 'networking'],
  },
  createdBy: { // ✅ AGREGAR ESTE CAMPO
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default model<Event>("Event", eventSchema);