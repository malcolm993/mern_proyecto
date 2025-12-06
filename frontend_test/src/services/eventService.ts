// src/services/eventService.ts
import { api } from './api';
import { Event, EventsResponse, EventsFilter, CreateEventRequest, EventResponse } from '../types/event.types';


export const eventService = {
  // Obtener todos los eventos 
  getEventsAll: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
    return response.data;
  },

  //  Obtener un evento por ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get<EventResponse>(`/events/${id}`);
    return response.data.data;
  },


  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    const response = await api.put<Event>(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

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



};