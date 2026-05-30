import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ROUTES } from '../../utils/constants';
import PricePilotLogo from '../common/Logo';

const menuItems = [
  {
    key: 'main',
    type: 'group',
    label: (
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        Main
      </span>
    ),
    children: [
      { key: ROUTES.DASHBOARD,       icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: ROUTES.PRODUCTS,        icon: <ShoppingOutlined />,  label: 'Products' },
      { key: ROUTES.RECOMMENDATIONS, icon: <RobotOutlined />,     label: 'AI Recommendations' },
      { key: ROUTES.APPROVALS,       icon: <CheckCircleOutlined />,label: 'Approvals' },
      { key: ROUTES.REPORTS,         icon: <BarChartOutlined />,  label: 'Reports' },
    ],
  },
  {
    key: 'manage',
    type: 'group',
    label: (
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        Manage
      </span>
    ),
    children: [
      { key: ROUTES.USERS,               icon: <TeamOutlined />,  label: 'Users' },
      { key: ROUTES.MARKETPLACE_ACCOUNTS,icon: <ShopOutlined />,  label: 'Marketplaces' },
      { key: ROUTES.SETTINGS,            icon: <SettingOutlined />,label: 'Settings' },
    ],
  },
];

// When sidebar is collapsed, groups break the layout — use flat list instead
const flatMenuItems = [
  { key: ROUTES.DASHBOARD,              icon: <DashboardOutlined />,  label: 'Dashboard' },
  { key: ROUTES.PRODUCTS,               icon: <ShoppingOutlined />,   label: 'Products' },
  { key: ROUTES.RECOMMENDATIONS,        icon: <RobotOutlined />,      label: 'Recommendations' },
  { key: ROUTES.APPROVALS,              icon: <CheckCircleOutlined />, label: 'Approvals' },
  { key: ROUTES.REPORTS,                icon: <BarChartOutlined />,   label: 'Reports' },
  { type: 'divider' },
  { key: ROUTES.USERS,                  icon: <TeamOutlined />,       label: 'Users' },
  { key: ROUTES.MARKETPLACE_ACCOUNTS,   icon: <ShopOutlined />,       label: 'Marketplaces' },
  { key: ROUTES.SETTINGS,               icon: <SettingOutlined />,    label: 'Settings' },
];

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = '/' + location.pathname.split('/')[1];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',    // Deep navy — more premium than default Ant dark
    }}>

      {/* ── Logo area ────────────────────────────────────── */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <PricePilotLogo size={34} collapsed={collapsed} />
      </div>

      {/* ── Navigation menu ──────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 8 }}>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={collapsed ? flatMenuItems : menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          theme="dark"
        />
      </div>

      {/* ── Bottom version tag ───────────────────────────── */}
      {!collapsed && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.5px',
        }}>
          PricePilot AI · v1.0.0
        </div>
      )}

    </div>
  );
};

export default Sidebar;