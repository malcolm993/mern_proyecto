import { Types } from "mongoose";

export interface Notification extends Document {
  user: Types.ObjectId;
  type: 'event_cancelled' | 'contact_request_received' | 'contact_request_accepted' | 'upcoming_event';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
