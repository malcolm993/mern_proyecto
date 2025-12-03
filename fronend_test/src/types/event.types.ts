// src/types/event.ts
export interface Event {
  _id: string
  title: string
  description: string
  location: string
  startDateTime: string
  endDateTime: string
  maxParticipants: number
  currentParticipants: number
  status: 'activo' | 'cancelado' | 'finalizado' | 'agotado'
  interestCategory: 'tecnología' | 'negocios' | 'artes' | 'deportes' | 'educacion' | 'networking'
  createdAt: string
  updatedAt: string
}


export interface EventResponse {
  success: boolean
  data: Event
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  maxParticipants: number;
  interestCategory: string;
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
  error?: string;
}