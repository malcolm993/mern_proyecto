// src/components/layout/Navbar.tsx
import React from 'react';
import { Menu } from 'antd';
import { CalendarOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Eventos',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{ 
        flex: 1, 
        justifyContent: 'center',
        borderBottom: 'none'
      }}
    />
  );
};

export default Navbar;