import Reports from './pages/Reports';
import MarketplaceAccounts from './pages/MarketplaceAccounts';
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
  UserOutlined,
  RocketOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Recommendations from './pages/Recommendations';
import UserManagement from './pages/UserManagement';
import AuditLog from './pages/AuditLog';
import Landing from './pages/Landing';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function AppLayout() {
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
  { key: '/marketplace-accounts', icon: <ShoppingOutlined />, label: 'Marketplace Accounts' },
  { key: '/users', icon: <TeamOutlined />, label: 'User Management' },
  { key: '/reports', icon: <AuditOutlined />, label: 'Reports' },
  { key: '/audit-log', icon: <AuditOutlined />, label: 'Audit Log' },
];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: `${user.name} (${user.role})` },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#001529' }}
      >
        <div className="logo">
          <RocketOutlined style={{ fontSize: 24 }} />
          {!collapsed && <span>PricePilot AI</span>}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <Text strong style={{ fontSize: 16 }}>
            {user.tenantName || 'PricePilot AI'}
          </Text>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route path="/marketplace-accounts" element={<MarketplaceAccounts />} />
<Route path="/reports" element={<Reports />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkLogin);
    const interval = setInterval(checkLogin, 500);
    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
