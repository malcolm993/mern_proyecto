// frontend/src/modules/profile/ProfilePage.tsx
import React from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col, 
  Avatar, 
  Tag,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/authContext';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Title level={2}>Debes iniciar sesión</Title>
        <Text type="secondary">
          Por favor inicia sesión para ver tu perfil
        </Text>
      </div>
    );
  }

  const roleLabels = {
    admin: { label: 'Organizador', color: 'blue' },
    user: { label: 'Participante', color: 'green' }
  };

  const roleInfo = roleLabels[user.role] || roleLabels.user;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={1}>
          <UserOutlined /> Mi Perfil
        </Title>
        <Text type="secondary">
          Información básica de tu cuenta
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Columna izquierda - Información personal */}
        <Col xs={24} md={16}>
          <Card title="Datos del Usuario">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar 
                  size={64} 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {user.name}
                  </Title>
                  <Tag color={roleInfo.color}>
                    {roleInfo.label}
                  </Tag>
                </div>
              </div>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small">
                    <Space>
                      <MailOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                      <div>
                        <Text strong style={{ display: 'block' }}>Email</Text>
                        <Text type="secondary">{user.email}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small">
                    <Space>
                      <SettingOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                      <div>
                        <Text strong style={{ display: 'block' }}>Rol</Text>
                        <Text>{roleInfo.label}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Información adicional según rol */}
              {user.role === 'admin' && (
                <>
                  <Divider />
                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px' }}>
                    <Title level={4} style={{ marginTop: 0 }}>
                      Permisos de Organizador
                    </Title>
                    <Space direction="vertical" size="small">
                      <Text>✓ Crear eventos empresariales</Text>
                      <Text>✓ Gestionar inscripciones</Text>
                      <Text>✓ Descargar listados de participantes</Text>
                      <div style={{ marginTop: '16px' }}>
                        <Button type="primary" href="/events/create">
                          Ir a Crear Evento
                        </Button>
                      </div>
                    </Space>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Columna derecha - Acciones rápidas */}
        <Col xs={24} md={8}>
          <Card title="Acciones Disponibles">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<CalendarOutlined />}
                href="/events"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                Explorar Eventos
              </Button>
              
              <Button 
                block 
                icon={<CalendarOutlined />}
                href="/reservations"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                Mis Reservas
              </Button>
              
              {user.role === 'admin' && (
                <Button 
                  block 
                  type="primary"
                  icon={<CalendarOutlined />}
                  href="/events/create"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Crear Nuevo Evento
                </Button>
              )}
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Button 
                block 
                danger
                onClick={logout}
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                Cerrar Sesión
              </Button>
            </Space>
          </Card>

          {/* Info del sistema */}
          <Card title="Estado del Sistema" style={{ marginTop: 24 }}>
            <Space direction="vertical" size="middle">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Versión</Text>
                <Text type="secondary">1.0.0</Text>
              </div>
              
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Estado de la cuenta</Text>
                <Tag color="green">Activa</Tag>
              </div>
              
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Tipo de usuario</Text>
                <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;