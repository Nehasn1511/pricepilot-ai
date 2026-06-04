import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Typography, Space, ConfigProvider, theme as antTheme, Menu } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  AuditOutlined,
  RocketOutlined
} from '@ant-design/icons';

// Pages & Components
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

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Restored your inline menu items
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
      { key: 'profile', icon: <UserOutlined />, label: `${user.name || 'User'} (${user.role || 'Admin'})` },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      {/* ── Custom Sider Container with Inline Menu ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          background: 'linear-gradient(180deg,#0f172a,#020617)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        <div className="logo" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <RocketOutlined style={{ fontSize: 24, color: '#fff' }} />
          {!collapsed && <span style={{ color: '#fff', marginLeft: 8, fontWeight: 600 }}>PricePilot AI</span>}
        </div>
        
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Sider>

      <Layout>
        {/* ── Custom Header Container ── */}
        <Header
          style={{
            padding: '0 24px',
            background: isDark
              ? 'linear-gradient(90deg,#111827,#1f2937)'
              : '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid #f1f5f9',
          }}
        >
          <Text
            strong
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: isDark ? '#fff' : '#111827',
            }}
          >
            {user.tenantName || 'PricePilot AI'}
          </Text>

          <Space size={12}>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                const next = !isDark;
                setIsDark(next);
                localStorage.setItem('theme', next ? 'dark' : 'light');
                window.location.reload();
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: 'none',
                background: isDark
                  ? 'linear-gradient(135deg,#f59e0b,#fbbf24)'
                  : 'linear-gradient(135deg,#1e293b,#334155)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              title="Toggle Dark Mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* User Dropdown Profile */}
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
        
        {/* ── Main Routing Content ── */}
        <Content 
          style={{ 
            margin: 24, 
            minHeight: 280,
            borderRadius: 16
          }}
        >
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
  const [isDark, setIsDark] = React.useState(
    localStorage.getItem('theme') === 'dark'
  );

  React.useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkLogin);
    const interval = setInterval(checkLogin, 500);
    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, []);

  window.__toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };
  window.__isDark = isDark;

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;