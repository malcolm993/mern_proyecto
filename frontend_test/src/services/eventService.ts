// src/services/eventService.ts
import { api } from './api';
import { Event, EventsResponse, EventsFilter, CreateEventRequest, EventResponse, UpdateEventRequest } from '../types/event.types';

export const eventService = {
  // Obtener todos los eventos actualmente no tiene uso
  getEventsAll: async (): Promise<EventResponse[]> => {
    const response = await api.get<EventResponse[]>('/events');
    return response.data;
  },

  // Obtener un evento por ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<EventResponse>(`/events/${id}`);
    return response.data.data;
  },

  // Crear evento (solo admin)
  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    const response = await api.post<{ success: boolean; message: string; data: Event }>(
      '/events',
      eventData
    );
    return response.data.data;  // ← extraer el evento del wrapper
  },

  // Actualizar evento (solo admin creador)
  updateEvent: async (id: string, eventData: UpdateEventRequest): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}`, eventData);
    return response.data;
  },

  // Cancelar evento (solo admin creador)
  cancelEvent: async (id: string): Promise<Event> => {
    const response = await api.patch<{ success: boolean; message: string; data: Event }>(
      `/events/${id}/cancel`
    );
    return response.data.data;
  },

  // Eliminar evento (solo admin creador)
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Obtener eventos filtrados (vista pública)
  getEventFiltered: async (filters: EventsFilter): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.category) queryParams.append('interestCategory', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await api.get<EventsResponse>(`/events?${queryParams}`);
    return response.data;
  },

  // Obtener eventos creados por el admin logueado (para MyEventsPage)
  getMyEvents: async (): Promise<Event[]> => {
    const response = await api.get<{ success: boolean; data: Event[] }>('/events/my-events');
    return response.data.data;
  },

  // Descargar listado de inscriptos en CSV (solo admin creador del evento)
exportReservationsCSV: async (eventId: string): Promise<void> => {
  const response = await api.get(`/reservations/event/${eventId}/export`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `inscriptos_${eventId}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
}
