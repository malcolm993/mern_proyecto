// src/components/reservations/ReservationButton.tsx
import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/authContext';
import { reservationService } from '../../services/reservationService';
import { useNavigate } from 'react-router-dom';

interface ReservationButtonProps {
  eventId: string;
  status: 'activo' | 'cancelado' | 'finalizado' | 'agotado';
}

const ReservationButton: React.FC<ReservationButtonProps> = ({ eventId, status }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasReservation, setHasReservation] = useState(false);

  useEffect(() => {
    const checkExistingReservation = async () => {
      // Los admins no tienen reservas — no verificar
      if (user && user.role !== 'admin') {
        try {
          const hasRes = await reservationService.checkUserReservation(eventId);
          setHasReservation(hasRes);
        } catch (error) {
          console.log('Error verificando reserva:', error);
        }
      }
      setIsChecking(false);
    };

    checkExistingReservation();
  }, [user, eventId]);

  // Los organizadores no pueden reservar — no renderizar nada
  if (user?.role === 'admin') {
    return null;
  }

  const isDisabled =
    status !== 'activo' ||
    !user ||
    hasReservation ||
    isLoading ||
    isChecking;

  const handleClick = async () => {
    if (!user) {
      message.warning('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    if (hasReservation) {
      message.warning('Ya tienes una reserva activa para este evento');
      return;
    }

    if (status !== 'activo') {
      message.warning(`Este evento está ${status}. No disponible para reservas.`);
      return;
    }

    setIsLoading(true);

    try {
      await reservationService.createReservation(eventId);
      message.success('¡Reserva creada exitosamente!');
      setHasReservation(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let errorMsg = 'Error al crear reserva';

      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      if (errorMsg.includes('Ya tienes una reserva activa')) {
        message.error('Ya tienes una reserva activa para este evento');
        setHasReservation(true);
      } else {
        message.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button type="default" size="large" loading disabled style={{ minWidth: '200px', marginTop: '16px', width: '100%' }}>
        Verificando...
      </Button>
    );
  }

  if (hasReservation) {
    return (
      <Button
        type="primary"
        size="large"
        icon={<CheckCircleOutlined />}
        disabled
        style={{
          backgroundColor: '#52c41a',
          borderColor: '#52c41a',
          opacity: 0.8,
          minWidth: '200px',
          marginTop: '16px',
          width: '100%'
        }}
      >
        ✅ Ya tienes reserva
      </Button>
    );
  }

  return (
    <Button
      type="primary"
      size="large"
      icon={status === 'activo' ? <BookOutlined /> : <CheckCircleOutlined />}
      loading={isLoading}
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        minWidth: '200px',
        marginTop: '16px',
        width: '100%',
        backgroundColor: status !== 'activo' ? '#d9d9d9' : undefined,
        borderColor: status !== 'activo' ? '#d9d9d9' : undefined
      }}
    >
      {isLoading ? 'Procesando...' :
        status !== 'activo' ? 'Reservas No Disponibles' : 'Reservar Entrada'}
    </Button>
  );
};

export default ReservationButton;
