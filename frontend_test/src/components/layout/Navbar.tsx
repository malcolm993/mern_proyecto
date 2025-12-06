// src/components/layout/Navbar.tsx - AGREGAR ENLACE
import React from 'react';
import { Menu, Button, Dropdown, Space, Avatar } from 'antd';
import {
  CalendarOutlined,
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  BookOutlined // 🆕
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: '/my-reservations', // 🆕
      icon: <BookOutlined />,
      label: 'Mis Reservas',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  const baseMenuItems = [
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
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {/* Menú principal */}
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={baseMenuItems}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, borderBottom: 'none' }}
      />

      {/* Sección de usuario */}
      <Space>
        {user ? (
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  handleLogout();
                } else {
                  navigate(key); // Esto navegará a '/my-reservations'
                }
              }
            }}
            placement="bottomRight"
          >
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              {user.name}
            </Button>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Navbar;