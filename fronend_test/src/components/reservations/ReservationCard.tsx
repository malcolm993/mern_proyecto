// src/components/reservations/ReservationCard.tsx - CORREGIDO
import React from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ReservationWithEvent } from '../../types/reservation.types';

const { Title, Text } = Typography;

interface ReservationCardProps {
  reservation: ReservationWithEvent;
  onCancel?: (reservationId: string) => void;
  isCancelling?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  isCancelling = false
}) => {
  const navigate = useNavigate();
  const event = reservation.eventData; // 

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Colores según estado
  const statusColors = {
    active: 'green',
    cancelled: 'red',
    completed: 'blue'
  };

  const statusText = {
    active: 'Activa',
    cancelled: 'Cancelada',
    completed: 'Completada'
  };

  // Navegar al detalle del evento
  const handleViewEvent = () => {
    if (event?._id) {
      navigate(`/events/${event._id}`);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (onCancel && reservation.status === 'active') {
      onCancel(reservation._id);
    }
  };

  if (!event) {
    return (
      <Card style={{ marginBottom: 16, opacity: 0.6 }}>
        <Text type="secondary">
          ID Evento: {reservation.event}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 8,
        borderLeft: `4px solid ${
          reservation.status === 'active' ? '#52c41a' :
          reservation.status === 'cancelled' ? '#ff4d4f' : '#1890ff'
        }`
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Información del evento */}
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: '0 0 8px 0' }}>
            {event.title}
          </Title>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text>
                {formatDate(event.startDateTime)} a las {formatTime(event.startDateTime)}
              </Text>
            </div>

            {event.location && (
              <div>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text>{event.location}</Text>
              </div>
            )}

            <div>
              <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text>Reserva: {formatDate(reservation.createdAt)}</Text>
            </div>
          </Space>

          {/* Tags */}
          <Space style={{ marginTop: 12 }}>
            <Tag color={statusColors[reservation.status]}>
              {statusText[reservation.status]}
            </Tag>
            <Tag color={event.status === 'activo' ? 'green' : 'red'}>
              {event.status}
            </Tag>
            {event.interestCategory && (
              <Tag color="blue">{event.interestCategory}</Tag>
            )}
          </Space>
        </div>

        {/* Acciones */}
        <Space direction="vertical" style={{ marginLeft: 16 }}>
          <Button
            type="default"
            size="small"
            onClick={handleViewEvent}
          >
            Ver Evento
          </Button>

          {reservation.status === 'active' && event.status === 'activo' && (
            <Button
              type="default"
              danger
              size="small"
              loading={isCancelling}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default ReservationCard;