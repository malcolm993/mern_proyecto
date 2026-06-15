import { api } from './api';
import { ContactRequest, NetworkingUser } from '../types/networking.types';

interface SuggestionsResponse {
  success: boolean;
  data: NetworkingUser[];
  error?: string;
}

interface ContactRequestsResponse {
  success: boolean;
  data: ContactRequest[];
  error?: string;
}

interface ContactRequestResponse {
  success: boolean;
  data: ContactRequest;
  message?: string;
  error?: string;
}

export const networkingService = {
  getSuggestions: async (): Promise<NetworkingUser[]> => {
    const response = await api.get<SuggestionsResponse>('/users/suggestions');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener sugerencias');
    }
    return response.data.data;
  },

  createContactRequest: async (receiverId: string, message?: string): Promise<ContactRequest> => {
    const response = await api.post<ContactRequestResponse>('/contact-requests', { receiverId, message });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al enviar solicitud');
    }
    return response.data.data;
  },

  getReceivedRequests: async (): Promise<ContactRequest[]> => {
    const response = await api.get<ContactRequestsResponse>('/contact-requests/received');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener solicitudes recibidas');
    }
    return response.data.data;
  },

  getSentRequests: async (): Promise<ContactRequest[]> => {
    const response = await api.get<ContactRequestsResponse>('/contact-requests/sent');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener solicitudes enviadas');
    }
    return response.data.data;
  },

  acceptRequest: async (requestId: string): Promise<ContactRequest> => {
    const response = await api.patch<ContactRequestResponse>(`/contact-requests/${requestId}/accept`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al aceptar solicitud');
    }
    return response.data.data;
  },

  rejectRequest: async (requestId: string): Promise<ContactRequest> => {
    const response = await api.patch<ContactRequestResponse>(`/contact-requests/${requestId}/reject`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al rechazar solicitud');
    }
    return response.data.data;
  }
};
