// src/modules/home/HomePage.tsx
import React from 'react';
import { Space, Typography, Divider } from 'antd';
import  EventsGrid  from '../../components/events/EventsGrid';
import { useEvents } from '../events/useEvents';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { data: events, isLoading, error } = useEvents();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Title level={1}>🎉 Bienvenido a Eventos App</Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Descubre y participa en los mejores eventos de tu comunidad. 
          Desde talleres tecnológicos hasta actividades deportivas y networking.
        </Paragraph>
      </div>

      <Divider />

      {/* 🆕 Lista de Eventos con nuevo diseño */}
      <div>
        <Title level={2}>📅 Próximos Eventos</Title>
        <EventsGrid 
          events={events || []} 
          loading={isLoading}
          error={error ? 'Error al cargar eventos' : null}
        />
      </div>
    </Space>
  );
};

export default HomePage;