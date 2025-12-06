// src/services/reservationService.ts - CORREGIDO
import { api } from './api';
import { 
  Reservation, 
  ReservationWithEvent, 
  ReservationStats 
} from '../types/reservation.types';

// Interfaz para la respuesta de creación
interface CreateReservationResponse {
  success: boolean;
  message: string;
  data: {
    reservation: Reservation;
    event: {
      currentParticipants: number;
      maxParticipants: number;
      status: string;
    };
  };
  error?:string
}

//  Interfaz para la respuesta de mis reservas
interface MyReservationsResponse {
  success: boolean;
  data: {
    reservations: ReservationWithEvent[];
  };
  error?: string
}

export const reservationService = {
  // Crear nueva reserva - CORREGIDO
  createReservation: async (eventId: string): Promise<Reservation> => {
    const response = await api.post<CreateReservationResponse>('/reservation', { eventId }); // 
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al crear reserva');
    }
    return response.data.data.reservation; // ✅ Acceder a .reservation
  },

  // Obtener reservas del usuario actual - CORREGIDO
  getMyReservations: async (): Promise<ReservationWithEvent[]> => {
    const response = await api.get<MyReservationsResponse>('/reservation/my-reservations');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener reservas');
    }
    return response.data.data.reservations; // ✅ Acceder a .reservations
  },

  // Cancelar reserva - CORREGIDO
  cancelReservation: async (reservationId: string): Promise<void> => {
    const response = await api.delete(`/reservations/${reservationId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al cancelar reserva');
    }
  },

  // Obtener estadísticas
  getStats: async (): Promise<ReservationStats> => {
    const response = await api.get<{ success: boolean; data: ReservationStats }>('/reservation/stats');
    if (!response.data.success) {
      throw new Error('Error al obtener estadísticas');
    }
    return response.data.data;
  },

  // Verificar si el usuario ya tiene reserva para un evento
  checkUserReservation: async (eventId: string): Promise<boolean> => {
    try {
      const reservations = await reservationService.getMyReservations();
      return reservations.some(res => res.event === eventId && res.status === 'active');
    } catch {
      return false;
    }
  }
};