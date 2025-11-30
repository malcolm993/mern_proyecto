// src/components/events/EventsGrid.tsx - VERSIÓN MÁXIMA OPTIMIZACIÓN
import React from 'react';
import { Spin, Alert, Empty, Pagination, Card, Typography } from 'antd';
import { Event } from '../../types/event.types';
import EventCard from './EventCard';

const { Text } = Typography;

interface EventsGridProps {
  events: Event[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
}

const EventsGrid: React.FC<EventsGridProps> = ({ 
  events, 
  loading, 
  error,
  pagination,
  onPageChange
}) => {
  // Estados de carga y error
  if (loading) return <Spin size="large" tip="Cargando eventos..." style={{ display: 'block', margin: '50px auto' }} />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;
  if (!events?.length) return <Empty description="No se encontraron eventos" />;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Info de resultados */}
      {pagination && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Mostrando {events.length} de {pagination.totalEvents} eventos
            {pagination.totalPages > 1 && ` - Página ${pagination.currentPage}/${pagination.totalPages}`}
          </Text>
        </Card>
      )}

      {/* Lista de eventos */}
      {events.map(event => <EventCard key={event._id} event={event} />)}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          current={pagination.currentPage}
          total={pagination.totalEvents}
          pageSize={6}
          onChange={onPageChange}
          style={{ marginTop: 32, textAlign: 'center' }}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} de ${total}`}
        />
      )}
    </div>
  );
};

export default EventsGrid;