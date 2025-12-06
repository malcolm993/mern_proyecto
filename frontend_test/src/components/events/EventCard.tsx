// src/components/events/EventCard.tsx
import React from 'react';
import { Card, Typography, Tag, Button } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types/event.types';

const { Title, Text } = Typography;

interface EventCardProps {
  event: Event;
}


const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate(); // 🆕 Hook de navegación

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };


  const handleViewDetails = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 8,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: 'flex', minHeight: 120 }}>
        {/* Sección Imagen Simple */}
        <div
          style={{
            width: '120px',
            background: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px 0 0 8px'
          }}
        >
          📅
        </div>

        {/* Sección Contenido */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Título y Categoría */}
          <div>
            <Title level={4} style={{ margin: '0 0 8px 0' }}>
              {event.title}
            </Title>

            {/* Información básica */}
            <div style={{ marginBottom: 8 }}>
              <Text style={{ display: 'block', marginBottom: 4 }}>
                <CalendarOutlined /> {formatDate(event.startDateTime)}
              </Text>
              <Text style={{ display: 'block' }}>
                <EnvironmentOutlined /> {event.location}
              </Text>
            </div>

            {/* Tags */}
            <div>
              <Tag color="blue">{event.interestCategory}</Tag>
              <Tag color={event.status === 'activo' ? 'green' : 'blue'}>
                {event.status}
              </Tag>
            </div>
          </div>

          {/* Botón simple */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              {event.currentParticipants}/{event.maxParticipants}
            </Text>
            <Button type="primary" size="small" onClick={handleViewDetails}>
              Ver más
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;