import { api } from './api';
import {
  CreateEventReviewRequest,
  EventReview,
  EventReviewResponse,
  EventReviewsResponse,
  MyEventReviewResponse
} from '../types/eventsReview.types';

export const eventReviewService = {
  getEventReviewsByEventId: async (eventId: string): Promise<EventReview[]> => {
    const response = await api.get<EventReviewsResponse>(`/events/${eventId}/reviews`);
    return response.data.data;
  },

  getMyEventReview: async (eventId: string): Promise<EventReview | null> => {
    const response = await api.get<MyEventReviewResponse>(`/events/${eventId}/reviews/my-review`);
    return response.data.data;
  },

  createEventReview: async (
    eventId: string,
    reviewData: CreateEventReviewRequest
  ): Promise<EventReviewResponse['data']> => {
    const response = await api.post<EventReviewResponse>(
      `/events/${eventId}/reviews`,
      reviewData
    );
    return response.data.data;
  },

  deleteEventReview: async (eventId: string): Promise<EventReviewResponse['data']> => {
    const response = await api.delete<EventReviewResponse>(`/events/${eventId}/reviews`);
    return response.data.data;
  }
};
