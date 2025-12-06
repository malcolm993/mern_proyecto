// src/modules/reservations/MyReservationsPage.tsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import { Typography, message, Space, Card, Statistic, Row, Col } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/authContext';
import { reservationService } from '../../services/reservationService';
import ReservationsGrid from '../../components/reservations/ReservationGrid';
import { ReservationWithEvent } from '../../types/reservation.types';

const { Title, Text } = Typography;

const MyReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cargar reservas al montar el componente
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    if (!user) {
      setError('Debes iniciar sesión para ver tus reservas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err: unknown) { // ✅ Cambiado de any a unknown
      console.error('Error cargando reservas:', err);
      
      // Extraer mensaje de error
      let errorMessage = 'Error al cargar tus reservas. Por favor, intenta nuevamente.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      message.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      message.success('Reserva cancelada exitosamente');
      
      // Recargar reservas
      await loadReservations();
    } catch (err: unknown) { // ✅ Cambiado de any a unknown
      console.error('Error cancelando reserva:', err);
      
      // Extraer mensaje de error
      let errorMessage = 'Error al cancelar la reserva';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      message.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  // Estadísticas
  const stats = {
    active: reservations.filter(r => r.status === 'active').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    total: reservations.length
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Title level={2}>Acceso no autorizado</Title>
        <Text type="secondary">
          Debes iniciar sesión para ver tus reservas
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header con estadísticas */}
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ marginBottom: 8 }}>
          <CalendarOutlined /> Mis Reservas
        </Title>
        <Text type="secondary">
          Gestiona todas tus reservas de eventos en un solo lugar
        </Text>

        {/* Estadísticas */}
        {!loading && !error && reservations.length > 0 && (
          <Card style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Total Reservas"
                  value={stats.total}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Activas"
                  value={stats.active}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Completadas"
                  value={stats.completed}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Canceladas"
                  value={stats.cancelled}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        )}
      </div>

      {/* Grid de reservas */}
      <ReservationsGrid
        reservations={reservations}
        loading={loading}
        error={error}
        onCancel={handleCancelReservation}
        cancellingId={cancellingId}
      />

      {/* Información adicional */}
      {!loading && !error && reservations.length === 0 && (
        <Card style={{ textAlign: 'center', marginTop: 24 }}>
          <Space direction="vertical" size="middle">
            <Title level={3} type="secondary">
              No tienes reservas aún
            </Title>
            <Text type="secondary">
              Explora eventos y haz tu primera reserva
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default MyReservationsPage;