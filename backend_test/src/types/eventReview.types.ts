import { Types } from "mongoose";

export interface EventReview {
  _id: string;
  event: Types.ObjectId | string;
  user: Types.ObjectId | string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventReviewRequest {
  rating: number;
  comment?: string;
}