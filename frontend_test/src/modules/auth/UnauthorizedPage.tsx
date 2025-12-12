// src/modules/auth/UnauthorizedPage.tsx
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
        status="403"
        title="403 - Acceso Denegado"
        subTitle="Lo sentimos, no tienes permisos para acceder a esta página."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        }
      />
    </div>
  );
};

export default UnauthorizedPage;