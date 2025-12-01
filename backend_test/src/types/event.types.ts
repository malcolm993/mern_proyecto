// Tipos relacionados con eventos
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  maxParticipants: number;
  interestCategory: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  maxParticipants?: number;
  interestCategory?: string;
  status?: string;
  currentParticipants?:number;
}

export interface EventsFilter {
  page?: string;
  limit?: string;
  interestCategory?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  myReservation?: string
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