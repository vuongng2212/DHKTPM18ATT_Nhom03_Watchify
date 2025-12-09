import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TagsOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  StarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCurrentApp } from '../../context/app.context';
import { logoutApi } from '../../services/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, setIsAuthenticated, messageApi } = useCurrentApp();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      messageApi.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý sản phẩm',
      onClick: () => navigate('/admin/products'),
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý đơn hàng',
      onClick: () => navigate('/admin/orders'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/brands',
      icon: <TagsOutlined />,
      label: 'Quản lý thương hiệu',
      onClick: () => navigate('/admin/brands'),
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Quản lý đánh giá',
      onClick: () => navigate('/admin/reviews'),
    },
    {
      key: '/admin/inventory',
      icon: <InboxOutlined />,
      label: 'Quản lý tồn kho',
      onClick: () => navigate('/admin/inventory'),
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: 'Thống kê',
      onClick: () => navigate('/admin/analytics'),
    },
    {
      type: 'divider',
    },
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Về trang chủ',
      onClick: () => navigate('/'),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return '/admin';
    if (path.startsWith('/admin/products')) return '/admin/products';
    if (path.startsWith('/admin/orders')) return '/admin/orders';
    if (path.startsWith('/admin/users')) return '/admin/users';
    if (path.startsWith('/admin/brands')) return '/admin/brands';
    if (path.startsWith('/admin/reviews')) return '/admin/reviews';
    if (path.startsWith('/admin/analytics')) return '/admin/analytics';
    return '/admin';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        theme="dark"
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: '16px',
            borderRadius: '8px',
          }}
        >
          {!collapsed ? (
            <Text
              strong
              style={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              WATCHIFY ADMIN
            </Text>
          ) : (
            <Text
              strong
              style={{
                color: '#fff',
                fontSize: '18px',
              }}
            >
              WF
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text strong>Xin chào, {user?.fullName || 'Admin'}</Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Avatar
                size="large"
                icon={<UserOutlined />}
                src={user?.avatar}
                style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#f0f2f5',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;