// src/components/layout/Header.tsx
import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import Navbar from './Navbar';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  return (
    <AntHeader style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '40px'
    }}>
      {/* Logo y Título */}
      <Space>
        <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          Eventos App
        </Title>
      </Space>

      {/* Navbar */}
      <Navbar />
    </AntHeader>
  );
};

export default Header;