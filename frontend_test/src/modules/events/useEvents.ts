// En modules/events/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { eventService} from '../../services/eventService';
import { EventsFilter, EventsResponse } from '../../types/event.types';

export const useEvents = (filters: EventsFilter = {}) => {
  return useQuery<EventsResponse, Error>({
    queryKey: ['events', filters], // La clave cambia con los filtros
    queryFn: () => eventService.getEventFiltered(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};