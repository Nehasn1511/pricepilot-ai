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

const sectionLabel = (text) => (
  <span className="sidebar-section-label">{text}</span>
);

const menuItems = [
  {
    key: 'main',
    type: 'group',
    label: sectionLabel('Main'),
    children: [
      {
        key: ROUTES.DASHBOARD,
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: ROUTES.PRODUCTS,
        icon: <ShoppingOutlined />,
        label: 'Products',
      },
      {
        key: ROUTES.RECOMMENDATIONS,
        icon: <RobotOutlined />,
        label: 'AI Recommendations',
      },
      {
        key: ROUTES.APPROVALS,
        icon: <CheckCircleOutlined />,
        label: 'Approvals',
      },
      {
        key: ROUTES.REPORTS,
        icon: <BarChartOutlined />,
        label: 'Reports',
      },
    ],
  },
  {
    key: 'manage',
    type: 'group',
    label: sectionLabel('Manage'),
    children: [
      {
        key: ROUTES.USERS,
        icon: <TeamOutlined />,
        label: 'Users',
      },
      {
        key: ROUTES.MARKETPLACE_ACCOUNTS,
        icon: <ShopOutlined />,
        label: 'Marketplaces',
      },
      {
        key: ROUTES.SETTINGS,
        icon: <SettingOutlined />,
        label: 'Settings',
      },
    ],
  },
];

const flatMenuItems = [
  {
    key: ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: ROUTES.PRODUCTS,
    icon: <ShoppingOutlined />,
    label: 'Products',
  },
  {
    key: ROUTES.RECOMMENDATIONS,
    icon: <RobotOutlined />,
    label: 'Recommendations',
  },
  {
    key: ROUTES.APPROVALS,
    icon: <CheckCircleOutlined />,
    label: 'Approvals',
  },
  {
    key: ROUTES.REPORTS,
    icon: <BarChartOutlined />,
    label: 'Reports',
  },
  {
    type: 'divider',
  },
  {
    key: ROUTES.USERS,
    icon: <TeamOutlined />,
    label: 'Users',
  },
  {
    key: ROUTES.MARKETPLACE_ACCOUNTS,
    icon: <ShopOutlined />,
    label: 'Marketplaces',
  },
  {
    key: ROUTES.SETTINGS,
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = `/${location.pathname.split('/')[1]}`;

  return (
    <>
      <aside className={`pricepilot-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo-area">
          <PricePilotLogo size={34} collapsed={collapsed} />
        </div>

        <div className="sidebar-menu-wrap">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[activeKey]}
            items={collapsed ? flatMenuItems : menuItems}
            onClick={({ key }) => navigate(key)}
            className="pricepilot-menu"
          />
        </div>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-version-title">PricePilot AI</div>
            <div className="sidebar-version-text">Version 1.0.0</div>
          </div>
        )}
      </aside>

      <style>{`
        .pricepilot-sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0f172a;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .sidebar-logo-area {
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }

        .pricepilot-sidebar.collapsed .sidebar-logo-area {
          justify-content: center;
          padding: 0;
        }

        .sidebar-menu-wrap {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 10px;
        }

        .sidebar-menu-wrap::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu-wrap::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 999px;
        }

        .pricepilot-menu {
          background: transparent !important;
          border-inline-end: none !important;
        }

        .sidebar-section-label {
          font-size: 10px;
          font-weight: 800;
          color: rgba(203, 213, 225, 0.38);
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .pricepilot-menu .ant-menu-item-group-title {
          padding: 16px 14px 8px !important;
          line-height: 1 !important;
        }

        .pricepilot-menu .ant-menu-item {
          height: 44px !important;
          line-height: 44px !important;
          margin: 4px 0 !important;
          padding-inline: 14px !important;
          border-radius: 12px !important;
          color: #94a3b8 !important;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .pricepilot-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #e2e8f0 !important;
        }

        .pricepilot-menu .ant-menu-item-selected {
          background: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
        }

        .pricepilot-menu .ant-menu-item-selected::after {
          display: none !important;
        }

        .pricepilot-menu .ant-menu-item .anticon {
          font-size: 17px !important;
          color: inherit !important;
        }

        .pricepilot-menu .ant-menu-title-content {
          margin-inline-start: 12px !important;
        }

        .pricepilot-sidebar.collapsed .pricepilot-menu {
          padding-inline: 0 !important;
        }

        .pricepilot-sidebar.collapsed .pricepilot-menu .ant-menu-item {
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          margin: 6px auto !important;
          padding-inline: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pricepilot-sidebar.collapsed .pricepilot-menu .ant-menu-item .anticon {
          margin: 0 !important;
        }

        .pricepilot-sidebar.collapsed .pricepilot-menu .ant-menu-title-content {
          display: none !important;
        }

        .pricepilot-menu .ant-menu-item-divider {
          background: rgba(255, 255, 255, 0.08) !important;
          margin: 14px 10px !important;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(15, 23, 42, 0.72);
          flex-shrink: 0;
        }

        .sidebar-version-title {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .sidebar-version-text {
          margin-top: 3px;
          color: rgba(148, 163, 184, 0.7);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;