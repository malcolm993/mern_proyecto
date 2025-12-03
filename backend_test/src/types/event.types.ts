// backend/src/types/event.types.ts
export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: 'activo' | 'cancelado' | 'finalizado' | 'agotado';
  interestCategory: 'tecnología' | 'negocios' | 'artes' | 'deportes' | 'educacion' | 'networking';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDateTime: string; // string para requests HTTP
  endDateTime: string;   // string para requests HTTP
  maxParticipants: number;
  interestCategory: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  maxParticipants?: number;
  interestCategory?: string;
  currentParticipants?:number
  status?: 'activo' | 'cancelado' | 'finalizado' | 'agotado';
}

export interface EventsFilter {
  page?: string;
  limit?: string;
  interestCategory?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  myReservation?: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleEventResponse {
  success: boolean;
  message: string;
  data: Event;
}