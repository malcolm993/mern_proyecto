import { Schema, model, Document, Types } from "mongoose";


export interface AgendaItem extends Document {
  event: Types.ObjectId;
  title: string;
  description?: string;
  speaker?: string;
  startTime: Date;
  endTime: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const agendaItemSchema = new Schema<AgendaItem>({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  speaker: {
    type: String,
    trim: true,
    maxlength: 100
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: any, value: Date) {
        return value > this.startTime;
      },
      message: 'La hora de fin debe ser posterior a la hora de inicio'
    }
  },
  order: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, { timestamps: true });

agendaItemSchema.index({ event: 1, order: 1 });

export default model<AgendaItem>("AgendaItem", agendaItemSchema);
