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
      status: string;
      createdAt: Date;
      eventDetails: {
        _id: string;
        title: string;
        startDateTime: Date;
        endDateTime: Date;
        location: string;
        status: string;
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