// src/modules/auth/RegisterPage.tsx
import React from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/authContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { 
    name: string; 
    email: string; 
    password: string;
    confirmPassword: string;
    role?: 'user' | 'admin';
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      message.success('¡Cuenta creada exitosamente!');
      navigate('/events');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 450, 
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
            Crear Cuenta
          </Title>
          <Text type="secondary">Únete a la comunidad de Eventos App</Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Tu nombre completo"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Email no válido' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="tu@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mínimo 6 caracteres"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            rules={[{ required: true, message: 'Por favor confirma tu contraseña' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Repite tu contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Tipo de Cuenta"
            initialValue="user"
          >
            <Select size="large" suffixIcon={<IdcardOutlined />}>
              <Option value="user">Usuario</Option>
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              style={{ width: '100%', height: '45px' }}
            >
              Crear Cuenta
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Inicia sesión aquí
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;