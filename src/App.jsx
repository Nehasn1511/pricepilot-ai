import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Typography, Space, ConfigProvider, theme as antTheme, Menu, Button, App as AntdApp } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  AuditOutlined,
  RocketOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
} from '@ant-design/icons';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Recommendations from './pages/Recommendations';
import UserManagement from './pages/UserManagement';
import AuditLog from './pages/AuditLog';
import Landing from './pages/Landing';
import Reports from './pages/Reports';
import MarketplaceAccounts from './pages/MarketplaceAccounts';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function AppLayout({ isDark, toggleDark }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: '/recommendations', icon: <ThunderboltOutlined />, label: 'AI Recommendations' },
    { key: '/marketplace-accounts', icon: <AppstoreOutlined />, label: 'Marketplaces' },
    { key: '/users', icon: <TeamOutlined />, label: 'User Management' },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Reports' },
    { key: '/audit-log', icon: <AuditOutlined />, label: 'Audit Log' },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: `${user.name || 'User'} (${user.role || 'Admin'})`,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: isDark
            ? 'linear-gradient(180deg,#0f172a,#020617)'
            : 'linear-gradient(180deg,#1e293b,#0f172a)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="logo"
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}
          >
            <RocketOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          {!collapsed && (
            <span
              style={{
                color: '#fff',
                marginLeft: 12,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 0.2,
              }}
            >
              PricePilot AI
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: isDark
              ? 'linear-gradient(90deg,#111827,#1f2937)'
              : '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid #f1f5f9',
            height: 64,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: isDark ? '#fff' : '#0f172a',
            }}
          >
            {user.tenantName || 'PricePilot AI'}
          </Text>

          <Space size={8}>
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined />}
              style={{ color: isDark ? '#cbd5e1' : '#475569' }}
            />
            <Button
              type="text"
              shape="circle"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleDark}
              style={{ color: isDark ? '#fbbf24' : '#475569' }}
              title="Toggle theme"
            />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            minHeight: 280,
            borderRadius: 12,
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/marketplace-accounts" element={<MarketplaceAccounts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkLogin);
    const interval = setInterval(checkLogin, 500);
    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 10,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <AppLayout isDark={isDark} toggleDark={toggleDark} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
