// src/components/events/EventDetailCard.tsx
import React from 'react';
import { Card, Typography, Tag, Button, Divider, Space, Row, Col } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Event } from '../../types/event.types';

const { Title, Text, Paragraph } = Typography;

interface EventDetailCardProps {
  event: Event;
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({ event }) => {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular duración
  const calculateDuration = () => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}m` : ''}`;
    }
    return `${durationMinutes}m`;
  };

  // Calcular entradas disponibles
  const availableTickets = event.maxParticipants - event.currentParticipants;

  // Mapeo de colores para categorías
  const categoryColors: Record<string, string> = {
    'tecnología': 'blue',
    'negocios': 'green',
    'artes': 'purple',
    'deportes': 'red',
    'educacion': 'orange',
    'networking': 'cyan'
  };

  // Mapeo de colores para estados
  const statusColors: Record<string, string> = {
    'activo': 'green',
    'cancelado': 'red',
    'finalizado': 'gray',
    'agotado': 'volcano'
  };

  return (
    <Card 
      style={{ 
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header con imagen (placeholder por ahora) */}
      <div 
        style={{
          height: '300px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px'
        }}
      >
        📅
      </div>

      {/* Contenido */}
      <div style={{ padding: '32px' }}>
        {/* Título principal */}
        <Title level={1} style={{ marginBottom: '16px', fontSize: '2.5rem' }}>
          {event.title}
        </Title>

        {/* Información básica en fila */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <Text strong>{formatDate(event.startDateTime)}</Text>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>
                {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              <Text strong>{event.location}</Text>
            </Space>
          </Col>
        </Row>

        {/* Tags de categoría y estado */}
        <Space size="middle" style={{ marginBottom: '24px' }}>
          <Tag 
            icon={<TagOutlined />} 
            color={categoryColors[event.interestCategory] || 'blue'}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {event.interestCategory.charAt(0).toUpperCase() + event.interestCategory.slice(1)}
          </Tag>
          <Tag 
            color={statusColors[event.status] || 'blue'}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Tag>
        </Space>

        <Divider />

        {/* Descripción */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3}>Descripción del Evento</Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {event.description || 'Este evento no tiene una descripción disponible.'}
          </Paragraph>
        </div>

        <Divider />

        {/* Información adicional */}
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>📊 Información Adicional</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Entradas disponibles: </Text>
                <Text>
                  {availableTickets} / {event.maxParticipants}
                </Text>
                {availableTickets === 0 && (
                  <Tag color="red" style={{ marginLeft: '8px' }}>Agotado</Tag>
                )}
              </div>
              
              <div>
                <Text strong>Duración: </Text>
                <Text>{calculateDuration()}</Text>
              </div>
              
              <div>
                <Text strong>Participantes actuales: </Text>
                <Text>
                  <UserOutlined style={{ marginRight: '4px' }} />
                  {event.currentParticipants}
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4}>🎟️ Reservas</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Las entradas están {availableTickets > 0 ? 'disponibles' : 'agotadas'} para este evento.
              </Text>
              <Button 
                type="primary" 
                size="large" 
                disabled={availableTickets === 0 || event.status !== 'activo'}
                style={{ 
                  marginTop: '16px',
                  minWidth: '200px'
                }}
              >
                {availableTickets === 0 ? 'Entradas Agotadas' : 
                 event.status !== 'activo' ? 'Reservas No Disponibles' : 'Reservar Entrada'}
              </Button>
              {(availableTickets === 0 || event.status !== 'activo') && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {event.status !== 'activo' 
                    ? `El evento está actualmente ${event.status}.`
                    : 'Todas las entradas han sido reservadas.'
                  }
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* Información de creación */}
        <Divider />
        <Text type="secondary">
          Evento creado el {new Date(event.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </div>
    </Card>
  );
};

export default EventDetailCard;