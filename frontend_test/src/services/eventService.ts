// src/services/eventService.ts
import { api } from './api';
import { Event, EventsResponse, EventsFilter, CreateEventRequest, EventResponse, UpdateEventRequest } from '../types/event.types';

export const eventService = {
  // Obtener todos los eventos
  getEventsAll: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
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
  exportReservationsCSV: (eventId: string): void => {
    // Obtener el token del localStorage para enviarlo en la URL
    // El backend valida el token y verifica que sea el creador del evento
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/reservations/event/${eventId}/export?token=${token}`;

    // Crear un link temporal y hacer click para descargar el archivo
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
