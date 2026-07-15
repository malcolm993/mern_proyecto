import { Event } from './event.types';

export interface EventReviewUser {
  _id: string;
  name: string;
  email: string;
}

export interface EventReview {
  _id: string;
  event: string | Event;
  user: string | EventReviewUser;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventReviewRequest {
  rating: number;
  comment?: string;
}

export interface EventReviewResponse {
  success: boolean;
  message: string;
  data: {
    review: EventReview;
    event: Event | null;
  };
}

export interface EventReviewsResponse {
  success: boolean;
  data: EventReview[];
}

export interface MyEventReviewResponse {
  success: boolean;
  data: EventReview | null;
}
