// En modules/events/useEvents.tss
import { useQuery } from '@tanstack/react-query';
import { eventService, EventsFilter, EventsResponse } from '../../services/eventService';

export const useEvents = (filters: EventsFilter = {}) => {
  return useQuery<EventsResponse, Error>({
    queryKey: ['events', filters], // La clave cambia con los filtros
    queryFn: () => eventService.getEventFiltered(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};