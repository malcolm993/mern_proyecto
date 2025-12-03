// src/components/reservations/ReservationsGrid.tsx
import React from 'react';
import { Spin, Alert, Empty, Card, Typography, Space, Tag } from 'antd';
import { ReservationWithEvent } from '../../types/reservation.types';
import ReservationCard from './ReservationCard';

const { Title, Text } = Typography;

interface ReservationsGridProps {
  reservations: ReservationWithEvent[];
  loading?: boolean;
  error?: string | null;
  onCancel?: (reservationId: string) => void;
  cancellingId?: string | null;
}

const ReservationsGrid: React.FC<ReservationsGridProps> = ({ 
  reservations, 
  loading, 
  error,
  onCancel,
  cancellingId
}) => {
  // Estados de carga y error
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Cargando reservas..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error" 
        description={error} 
        type="error" 
        showIcon 
        style={{ margin: '20px 0' }}
      />
    );
  }

  if (!reservations?.length) {
    return (
      <Empty 
        description="No tienes reservas activas" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ margin: '50px 0' }}
      >
        <Text type="secondary">Cuando reserves eventos, aparecerán aquí.</Text>
      </Empty>
    );
  }

  // Agrupar por estado
  const activeReservations = reservations.filter(r => r.status === 'active');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');
  const completedReservations = reservations.filter(r => r.status === 'completed');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Info de resultados */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            Mostrando {reservations.length} reservas
          </Text>
          <Space>
            {activeReservations.length > 0 && (
              <Tag color="green">{activeReservations.length} activas</Tag>
            )}
            {cancelledReservations.length > 0 && (
              <Tag color="red">{cancelledReservations.length} canceladas</Tag>
            )}
            {completedReservations.length > 0 && (
              <Tag color="blue">{completedReservations.length} completadas</Tag>
            )}
          </Space>
        </div>
      </Card>

      {/* Reservas activas */}
      {activeReservations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            📅 Reservas Activas ({activeReservations.length})
          </Title>
          {activeReservations.map(reservation => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onCancel={onCancel}
              isCancelling={cancellingId === reservation._id}
            />
          ))}
        </div>
      )}

      {/* Reservas completadas */}
      {completedReservations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            ✅ Reservas Completadas ({completedReservations.length})
          </Title>
          {completedReservations.map(reservation => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}

      {/* Reservas canceladas */}
      {cancelledReservations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            ❌ Reservas Canceladas ({cancelledReservations.length})
          </Title>
          {cancelledReservations.map(reservation => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsGrid;