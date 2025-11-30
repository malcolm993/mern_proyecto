// Tipos específicos para controllers
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface GetEventsQuery {
  page?: string;
  limit?: string;
  interestCategory?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}