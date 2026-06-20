import React from 'react';
import { Menu, Button, Dropdown, Space, Avatar } from 'antd';
import {
  CalendarOutlined,
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  BookOutlined,
  TeamOutlined,
  AppstoreOutlined
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

  // Items del dropdown de usuario según rol
  const userMenuItems = user?.role === 'admin'
    ? [
        {
          key: '/my-events',
          icon: <AppstoreOutlined />,
          label: 'Mis Eventos',
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
        },
      ]
    : [
        {
          key: '/my-reservations',
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
        },
      ];

  // Items del menú principal según rol
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
    // Networking solo visible para participantes (role: 'user')
    ...(user?.role !== 'admin' ? [{
      key: '/networking',
      icon: <TeamOutlined />,
      label: 'Networking',
    }] : []),
    // Crear evento solo visible para admins
    ...(user?.role === 'admin' ? [{
      key: '/events/create',
      icon: <CalendarOutlined />,
      label: 'Crear Evento',
    }] : []),
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={baseMenuItems}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, borderBottom: 'none' }}
      />

      <Space>
        {user ? (
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  handleLogout();
                } else {
                  navigate(key);
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
