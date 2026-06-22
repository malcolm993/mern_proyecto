import {AgendaItem} from './event.types';

export interface AgendaResponse {
  success: boolean;
  data: AgendaItem[];
  error?: string;
}

export interface SingleAgendaResponse {
  success: boolean;
  message?: string;
  data: AgendaItem;
  error?: string;
}

export interface CreateAgendaItemRequest {
  title: string;
  description?: string;
  speaker?: string;
  startTime: string;
  endTime: string;
  order?: number;
}

export interface UpdateAgendaItemRequest {
  title?: string;
  description?: string;
  speaker?: string;
  startTime?: string;
  endTime?: string;
  order?: number;
}