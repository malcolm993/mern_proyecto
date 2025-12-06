// src/modules/auth/LoginPage.tsx
import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/authContext'  
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('¡Bienvenido!');
      navigate('/events');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error en login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400, padding: 24 }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          Iniciar Sesión
        </Title>
        
        <Form name="login" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: 'Por favor ingresa tu email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Ingresar
            </Button>
          </Form.Item>
        </Form>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </Text>
      </Card>
    </div>
  );
};

export default LoginPage;