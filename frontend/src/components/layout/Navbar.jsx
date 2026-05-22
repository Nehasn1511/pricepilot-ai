import { Avatar, Dropdown, Badge, Button, Typography, Space } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ─── Logout handler ─────────────────────────────────────────
  const handleLogout = () => {
    logout();                          // Clears token + user from context and localStorage
    navigate(ROUTES.LOGIN, { replace: true }); // Redirect to login
  };

  // ─── User dropdown menu items ────────────────────────────────
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {user?.email || ''}
          </div>
        </div>
      ),
      disabled: true, // Info only — not clickable
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
      label: <span style={{ color: '#ff4d4f' }}>Logout</span>,
      onClick: handleLogout,
    },
  ];

  // ─── Get initials for avatar ─────────────────────────────────
  // "Suraj Shenoy" → "SS"
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>

      {/* ── Left side — Page title (optional) ─────────────── */}
      <div />

      {/* ── Right side — Notifications + User ─────────────── */}
      <Space size={8} align="center">

        {/* Notification bell */}
        <Badge count={3} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            style={{ width: 40, height: 40 }}
          />
        </Badge>

        {/* User avatar + name dropdown */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space
            align="center"
            style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
            className="navbar-user"
          >
            <Avatar
              style={{ backgroundColor: '#1677ff', fontSize: 13, fontWeight: 600 }}
              size={34}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Text style={{ fontSize: 14, fontWeight: 500, maxWidth: 120 }}
              ellipsis>
              {user?.name || 'User'}
            </Text>
            <DownOutlined style={{ fontSize: 10, color: '#999' }} />
          </Space>
        </Dropdown>

      </Space>
    </div>
  );
};

export default Navbar;