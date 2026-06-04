import { Button } from 'antd';

const ICONS = {
  products:        { emoji: '📦', color: '#e6f4ff', border: '#91caff' },
  recommendations: { emoji: '🤖', color: '#f9f0ff', border: '#d3adf7' },
  search:          { emoji: '🔍', color: '#fff7e6', border: '#ffd591' },
  users:           { emoji: '👥', color: '#f6ffed', border: '#b7eb8f' },
  reports:         { emoji: '📊', color: '#fff0f6', border: '#ffadd2' },
  default:         { emoji: '🗂️', color: '#fafafa', border: '#d9d9d9' },
};

export default function EmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const cfg = ICONS[type] || ICONS.default;

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
        fontSize: 36, marginBottom: 20,
      }}>
        {cfg.emoji}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>
        {title || defaultTitles[type]}
      </div>
      <div style={{ fontSize: 14, color: '#888', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
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