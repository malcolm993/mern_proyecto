// Tipos específicos para controllers
import { Request } from 'express';
import { JwtPayload } from './auth.types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export interface GetEventsQuery {
  page?: string;
  limit?: string;
  interestCategory?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  myReservation?:string
}