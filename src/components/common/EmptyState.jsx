import { Button } from 'antd';
import {
  InboxOutlined,
  RobotOutlined,
  SearchOutlined,
  TeamOutlined,
  BarChartOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';

const ICONS = {
  products:        { Icon: InboxOutlined,      color: '#e6f4ff', border: '#91caff', iconColor: '#1677ff' },
  recommendations: { Icon: RobotOutlined,      color: '#f9f0ff', border: '#d3adf7', iconColor: '#9254de' },
  search:          { Icon: SearchOutlined,     color: '#fff7e6', border: '#ffd591', iconColor: '#fa8c16' },
  users:           { Icon: TeamOutlined,       color: '#f6ffed', border: '#b7eb8f', iconColor: '#52c41a' },
  reports:         { Icon: BarChartOutlined,   color: '#fff0f6', border: '#ffadd2', iconColor: '#eb2f96' },
  default:         { Icon: FolderOpenOutlined, color: '#fafafa', border: '#d9d9d9', iconColor: '#8c8c8c' },
};

export default function EmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const cfg = ICONS[type] || ICONS.default;
  const Icon = cfg.Icon;

  const defaultTitles = {
    products:        'No products yet',
    recommendations: 'All caught up!',
    search:          'No results found',
    users:           'No team members',
    reports:         'No data available',
    default:         'Nothing here yet',
  };

  const defaultDescs = {
    products:        'Upload a CSV or add products manually to get started.',
    recommendations: 'No pending recommendations. Your pricing looks great!',
    search:          'Try adjusting your search or clearing the filters.',
    users:           'Invite team members to collaborate.',
    reports:         'Generate a report to see analytics here.',
    default:         'Nothing to show at the moment.',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: cfg.color, border: `2px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon style={{ fontSize: 36, color: cfg.iconColor }} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ant-color-text)', marginBottom: 8 }}>
        {title || defaultTitles[type]}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ant-color-text-secondary)', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
        {description || defaultDescs[type]}
      </div>
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction} style={{ borderRadius: 8 }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
