import { Avatar, Dropdown, Badge, Button, Breadcrumb, Space, Typography } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const { Text } = Typography;

// Maps route paths to readable breadcrumb names
const BREADCRUMB_MAP = {
  '/dashboard':           'Dashboard',
  '/products':            'Products',
  '/recommendations':     'AI Recommendations',
  '/approvals':           'Approvals',
  '/reports':             'Reports',
  '/users':               'Users',
  '/marketplace-accounts':'Marketplace Accounts',
  '/settings':            'Settings',
};

const Navbar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Avatar background color based on user initials — consistent per user
  const avatarColors = ['#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96'];
  const colorIndex   = (user?.name?.charCodeAt(0) || 0) % avatarColors.length;

  const currentPage  = '/' + location.pathname.split('/')[1];
  const pageName     = BREADCRUMB_MAP[currentPage] || 'Dashboard';

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '6px 4px', minWidth: 180 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {user?.email || 'user@example.com'}
          </div>
          <div style={{
            marginTop: 6,
            display: 'inline-block',
            fontSize: 11,
            background: '#f0f5ff',
            color: '#1677ff',
            borderRadius: 4,
            padding: '1px 8px',
            fontWeight: 500,
          }}>
            {user?.role || 'ADMIN'}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      label: <span style={{ color: '#ff4d4f' }}>Sign out</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>

      {/* ── Left — Collapse toggle + Breadcrumb ─────────── */}
      <Space align="center" size={16}>

        {/* Sidebar collapse toggle button */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        />

        {/* Current page breadcrumb */}
        <Breadcrumb
          items={[
            { title: <span style={{ fontSize: 12, color: '#999' }}>PricePilot AI</span> },
            { title: <span style={{ fontSize: 12, fontWeight: 500 }}>{pageName}</span> },
          ]}
        />
      </Space>

      {/* ── Right — Notifications + User ─────────────────── */}
      <Space size={4} align="center">

        {/* Notification bell */}
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 17 }} />}
            style={{ width: 38, height: 38, color: '#555' }}
          />
        </Badge>

        {/* Divider */}
        <div style={{
          width: 1,
          height: 24,
          background: '#e8e8e8',
          margin: '0 6px',
        }} />

        {/* User avatar dropdown */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 8,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar
              size={32}
              style={{
                background: avatarColors[colorIndex],
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>
                {user?.role || 'Admin'}
              </div>
            </div>
            <DownOutlined style={{ fontSize: 10, color: '#bbb', marginLeft: 2 }} />
          </div>
        </Dropdown>

      </Space>
    </div>
  );
};

export default Navbar;