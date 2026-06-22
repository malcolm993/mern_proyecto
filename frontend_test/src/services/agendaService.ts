// front_end/src/services/agendaService.ts
import { api } from './api';
import { AgendaItem } from '../types/event.types';
import { AgendaResponse, SingleAgendaResponse, CreateAgendaItemRequest, UpdateAgendaItemRequest } from '../types/agenda.types';



export const agendaService = {
  // Obtener agenda de un evento (público)
  getEventAgenda: async (eventId: string): Promise<AgendaItem[]> => {
    const response = await api.get<AgendaResponse>(`/events/${eventId}/agenda`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener la agenda');
    }
    return response.data.data;
  },

  // Crear item de agenda (solo admin creador del evento)
  createAgendaItem: async (
    eventId: string,
    itemData: CreateAgendaItemRequest
  ): Promise<AgendaItem> => {
    const response = await api.post<SingleAgendaResponse>(
      `/events/${eventId}/agenda`,
      itemData
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al crear item de agenda');
    }
    return response.data.data;
  },

  // Editar item de agenda (solo admin creador del evento)
  updateAgendaItem: async (
    agendaItemId: string,
    itemData: UpdateAgendaItemRequest
  ): Promise<AgendaItem> => {
    const response = await api.patch<SingleAgendaResponse>(
      `/agenda/${agendaItemId}`,
      itemData
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al actualizar item de agenda');
    }
    return response.data.data;
  },

  // Eliminar item de agenda (solo admin creador del evento)
  deleteAgendaItem: async (agendaItemId: string): Promise<void> => {
    const response = await api.delete<{ success: boolean; error?: string }>(
      `/agenda/${agendaItemId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al eliminar item de agenda');
    }
  }
};
