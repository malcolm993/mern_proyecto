// src/modules/events/EventsPage.tsx
import React, { useState } from 'react';
import { Typography } from 'antd';
import { EventsFilter } from '../../services/eventService';
import { useEvents } from './useEvents';
import EventFilters from '../../components/events/EventFilters';
import EventsGrid from '../../components/events/EventsGrid';

const { Title } = Typography;

const EventsPage: React.FC = () => {
  const [filters, setFilters] = useState<EventsFilter>({
    page: 1,
    limit: 6 // Debe coincidir con el pageSize del Pagination
  });

  const { data, isLoading, error } = useEvents(filters);

  const handleFilterChange = (newFilters: EventsFilter) => {
    setFilters({ ...newFilters, page: 1 }); // Reset a página 1 al filtrar
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Título de la página */}
      <Title level={1} style={{ textAlign: 'center', marginBottom: 32 }}>
        Eventos Disponibles
      </Title>

      {/* Componente de filtros */}
      <EventFilters onFilterChange={handleFilterChange} />
      
      {/* Grid de eventos con paginación */}
      <EventsGrid 
        events={data?.data || []}
        loading={isLoading}
        error={error?.message}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default EventsPage;