import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Form,
  Input,
  Select,
  message
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/authContext';
import { profileService } from '../../services/profileService';

const { Title, Text, Paragraph } = Typography;

const businessAreaOptions = ['tecnologia', 'negocios', 'artes', 'deportes', 'educacion', 'networking'];

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        company: user.company,
        businessArea: user.businessArea,
        interests: user.interests || [],
        bio: user.bio
      });
    }
  }, [form, user]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Title level={2}>Debes iniciar sesiÃ³n</Title>
        <Text type="secondary">Por favor inicia sesiÃ³n para ver tu perfil</Text>
      </div>
    );
  }

  const roleLabels = {
    admin: { label: 'Organizador', color: 'blue' },
    user: { label: 'Participante', color: 'green' }
  };

  const roleInfo = roleLabels[user.role] || roleLabels.user;

  const handleSaveProfile = async (values: {
    name: string;
    company?: string;
    businessArea?: string;
    interests?: string[];
    bio?: string;
  }) => {
    setSaving(true);
    try {
      const updatedUser = await profileService.updateProfile(values);
      updateUser(updatedUser);
      message.success('Perfil actualizado');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={1}>
          <UserOutlined /> Mi Perfil
        </Title>
        <Text type="secondary">InformaciÃ³n de cuenta y datos de networking</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card title="Datos del Usuario">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
                  <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
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

              <Divider />

              <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa tu nombre' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="company" label="Empresa">
                      <Input placeholder="Nombre de empresa o emprendimiento" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="businessArea" label="Rubro">
                      <Select allowClear placeholder="Selecciona un rubro">
                        {businessAreaOptions.map((area) => (
                          <Select.Option key={area} value={area}>{area}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="interests" label="Intereses">
                      <Select mode="tags" placeholder="Ej: IA, ventas, networking" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="bio" label="DescripciÃ³n breve">
                      <Input.TextArea rows={3} maxLength={300} showCount />
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" htmlType="submit" loading={saving}>
                  Guardar perfil
                </Button>
              </Form>

              {user.role === 'admin' && (
                <>
                  <Divider />
                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px' }}>
                    <Title level={4} style={{ marginTop: 0 }}>Permisos de Organizador</Title>
                    <Space direction="vertical" size="small">
                      <Text>Crear eventos empresariales</Text>
                      <Text>Gestionar inscripciones</Text>
                      <Text>Descargar listados de participantes</Text>
                      <div style={{ marginTop: '16px' }}>
                        <Button type="primary" href="/events/create">Ir a Crear Evento</Button>
                      </div>
                    </Space>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Networking">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph type="secondary">
                CompletÃ¡ empresa, rubro e intereses para recibir sugerencias de participantes afines.
              </Paragraph>
              <Button block icon={<TeamOutlined />} href="/networking">
                Ver sugerencias
              </Button>
            </Space>
          </Card>

          <Card title="Acciones Disponibles" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<CalendarOutlined />} href="/events">
                Explorar Eventos
              </Button>
              <Button block icon={<CalendarOutlined />} href="/my-reservations">
                Mis Reservas
              </Button>
              {user.role === 'admin' && (
                <Button block type="primary" icon={<CalendarOutlined />} href="/events/create">
                  Crear Nuevo Evento
                </Button>
              )}
              <Divider style={{ margin: '16px 0' }} />
              <Button block danger onClick={logout}>
                Cerrar SesiÃ³n
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
