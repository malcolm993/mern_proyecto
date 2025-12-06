// src/components/layout/AppLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <div className="container">
          <Outlet /> {/* Aquí se renderizan las páginas */}
        </div>
      </Content>
    </Layout>
  );
};

export default AppLayout;