import mongoose from "mongoose";

// src/types/reservation.types.ts
export interface CreateReservationRequest {
  eventId: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  data?: {
    reservation: {
      _id: string;
      user: string;
      event: string;
      status: 'active' | 'cancelled' | 'completed';
      createdAt: Date;
    };
    event?: {
      currentParticipants: number;
      maxParticipants: number;
      status: string;
    };
  };
  error?: string;
}

export interface UserReservationsResponse {
  success: boolean;
  data: {
    reservations: Array<{
      _id: string;
      user: string;
      event: string;
      status: 'active'| 'cancelled' | 'completed';
      createdAt: string;
      eventDetails: {
        _id: string;
        title: string;
        startDateTime: string;
        endDateTime: string;
        location: string;
        status: string;
        interestCategory: string;
      };
    }>;
  };
}

export interface PopulatedReservation {
  _id: mongoose.Types.ObjectId;
  status: string;
  createdAt: Date;
  event: {
    _id: mongoose.Types.ObjectId;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    status: string;
  };
}

export interface EventReservationItem {
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
    reservations: EventReservationItem[];
  };
}
