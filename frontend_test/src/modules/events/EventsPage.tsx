// Opción 2: Botón flotante (si prefieres ese diseño)
import React, { useState } from 'react';
import { Typography, FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { EventsFilter } from '../../types/event.types';
import { useEvents } from './useEvents';
import EventFilters from '../../components/events/EventFilters';
import EventsGrid from '../../components/events/EventsGrid';

const { Title } = Typography;

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventsFilter>({
    page: 1,
    limit: 6
  });

  const { data, isLoading, error } = useEvents(filters);

  const handleFilterChange = (newFilters: EventsFilter) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Título de la página */}
      <Title level={1} style={{ textAlign: 'center', marginBottom: 32 }}>
        Eventos Disponibles
      </Title>

      {/* Botón flotante en esquina inferior derecha */}
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreateEvent}
        tooltip="Crear nuevo evento"
        style={{ right: 24, bottom: 24 }}
      />

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