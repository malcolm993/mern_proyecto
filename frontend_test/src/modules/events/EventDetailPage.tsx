// src/modules/events/pages/EventDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Alert, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Event } from '../../types/event.types';
import { eventService } from '../../services/eventService';
import EventDetailCard from '../../components/events/EventDetailCard';


const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError('ID de evento no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await eventService.getEventById(eventId);

        console.log('📦 eventData recibido:', eventData);
        console.log('📦 Tipo de eventData:', typeof eventData);
        console.log('📦 Es objeto?', typeof eventData === 'object');
        console.log('📦 Tiene interestCategory?', 'interestCategory' in eventData);
        console.log('📦 interestCategory valor:', eventData.interestCategory);
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError('Error al cargar el evento. Por favor, intenta nuevamente.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBack = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Volver a eventos
          </Button>
          <Alert message="Error" description={error} type="error" showIcon />
        </Space>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Volver a eventos
          </Button>
          <Alert
            message="Evento no encontrado"
            description="El evento que buscas no existe o ha sido eliminado."
            type="warning"
            showIcon
          />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Botón de regreso */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: '20px' }}
      >
        Volver a eventos
      </Button>

      {/* Componente de detalle */}
      <EventDetailCard event={event} />
    </div>
  );
};

export default EventDetailPage;