import { Card, Skeleton, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatCard = ({ title, value, prefix, icon, trend, trendUp, loading, suffix }) => {

  if (loading) {
    return <Card><Skeleton active paragraph={{ rows: 2 }} /></Card>;
  }

  return (
    <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '20px 24px' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
            {prefix && <span style={{ fontSize: 18, marginRight: 2 }}>{prefix}</span>}
            {value ?? '—'}
            {suffix && <span style={{ fontSize: 16, marginLeft: 4, color: '#888' }}>{suffix}</span>}
          </div>
        </div>

        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: '#f0f5ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div style={{ marginTop: 10 }}>
          <Tag
            color={trendUp ? 'success' : 'error'}
            icon={trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            {trend}
          </Tag>
          <span style={{ fontSize: 12, color: '#aaa', marginLeft: 6 }}>vs last week</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;