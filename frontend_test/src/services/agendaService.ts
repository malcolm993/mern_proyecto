import { api } from './api';
import { AgendaItem } from '../types/networking.types';

interface AgendaResponse {
  success: boolean;
  data: AgendaItem[];
  error?: string;
}

export const agendaService = {
  getEventAgenda: async (eventId: string): Promise<AgendaItem[]> => {
    const response = await api.get<AgendaResponse>(`/events/${eventId}/agenda`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener la agenda');
    }
    return response.data.data;
  }
};
