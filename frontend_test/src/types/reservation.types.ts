// src/types/reservation.types.ts
export interface Reservation {
  _id: string;
  user: string; // userId
  event: string; // eventId
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ReservationWithEvent extends Reservation {
  eventDetails?: {
    _id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    location: string;
    status: string;
    interestCategory: string;
  };
}

export interface CreateReservationRequest {
  eventId: string;
}

export interface ReservationsResponse {
  success: boolean;
  data: Reservation[];
  message?: string;
  error?: string;
}

export interface ReservationStats {
  total: number;
  active: number;
  cancelled: number;
  completed: number;
}

export interface EventReservationsResponse {
  success: boolean;
  data: {
    event: {
      _id: string;
      title: string;
      startDateTime: string;
      maxParticipants: number;
      currentParticipants: number;
    };
    reservations: Array<{
      reservationId: string;
      status: 'active' | 'cancelled' | 'completed';
      registeredAt: string;
      participant: {
        _id: string;
        name: string;
        email: string;
        company?: string;
        businessArea?: string;
      };
    }>;
  };
}