import { InferSchemaType, model, Schema } from "mongoose";

const eventSchema = new Schema({
  title: { type: String, required: true ,trim: true, maxlength: 100},
  description: { type: String, required: true , maxlength: 1000},
  location: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true,
    validate:{validator:function(this: any, value: Date){
      return value > this.startDateTime;
    }, message: 'End date must be after start date'}
   },
  maxParticipants: { type: Number, required: true, min: 1 , max:10},
  currentParticipants: { type: Number, required: true, default: 0 , min: 0 ,
    validate:{validator:function(this: any){
      return this.currentParticipants <= this.maxParticipants;
    }, message: 'Current participants cannot exceed max participants'}
  },
  //analizar si es mejor importar un enum de otro archivo
  status: { type: String, required: true,
    'enum': ['pre-activo', 'activo', 'cancelado', 'finalizado', 'agotado'],
   },
  interestCategory: { type: String, required: true,
    'enum': ['tecnología', 'negocios', 'artes', 'deportes', 'educacion', 'networking'],
   },
},{timestamps: true});

type EventType = InferSchemaType<typeof eventSchema>;

export default model<EventType>("Event", eventSchema);