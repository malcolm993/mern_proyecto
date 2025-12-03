// src/components/reservations/ReservationButton.tsx - CON VERIFICACIÓN PREVIA
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
  const [isChecking, setIsChecking] = useState(true); // ✅ Nuevo estado
  const [hasReservation, setHasReservation] = useState(false); // ✅ Nuevo estado
  
  // ✅ 1. VERIFICAR RESERVA AL CARGAR
  useEffect(() => {
    const checkExistingReservation = async () => {
      if (user) {
        try {
          console.log('🔍 Verificando si ya tienes reserva...');
          const hasRes = await reservationService.checkUserReservation(eventId);
          console.log('📊 Resultado:', hasRes ? 'TIENE reserva' : 'NO tiene reserva');
          setHasReservation(hasRes);
        } catch (error) {
          console.log('⚠️ Error verificando reserva:', error);
        }
      }
      setIsChecking(false);
    };
    
    checkExistingReservation();
  }, [user, eventId]);

  // ✅ 2. BOTÓN DESHABILITADO SI:
  const isDisabled = 
    status !== 'activo' || // Evento no activo
    !user ||               // Usuario no logueado
    hasReservation ||      // ✅ YA TIENE RESERVA
    isLoading ||           // Está procesando
    isChecking;            // Está verificando

  const handleClick = async () => {
    if (!user) {
      message.warning('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    if (hasReservation) { // ✅ EVITA CLICK INNECESARIO
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
      setHasReservation(true); // ✅ ACTUALIZAR ESTADO LOCAL
      
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
      
      // ✅ SI EL ERROR ES DE DUPLICADO, ACTUALIZAR ESTADO
      if (errorMsg.includes('Ya tienes una reserva activa')) {
        message.error('Ya tienes una reserva activa para este evento');
        setHasReservation(true); // ✅ IMPORTANTE: Actualizar estado
      } else {
        message.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 3. ESTADOS VISUALES MEJORADOS
  if (isChecking) {
    return (
      <Button
        type="default"
        size="large"
        loading
        disabled
        style={{
          minWidth: '200px',
          marginTop: '16px',
          width: '100%'
        }}
      >
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