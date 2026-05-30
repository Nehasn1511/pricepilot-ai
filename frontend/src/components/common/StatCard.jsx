import { Card, Statistic, Tag, Skeleton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatCard = ({
  title,        // "Total Products"
  value,        // 245
  prefix,       // "₹" or icon
  icon,         // emoji or icon element shown in top-right
  trend,        // "12%" — the change percentage
  trendUp,      // true = green arrow up, false = red arrow down
  loading,      // shows skeleton while data loads
  suffix,       // optional unit like "units"
}) => {

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <Card
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

        {/* Left — number and label */}
        <Statistic
          title={
            <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
              {title}
            </span>
          }
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}
        />

        {/* Right — icon */}
        {icon && (
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#f0f5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Trend badge — shown only if trend prop is provided */}
      {trend !== undefined && (
        <div style={{ marginTop: 10 }}>
          <Tag
            color={trendUp ? 'success' : 'error'}
            icon={trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            {trend}
          </Tag>
          <span style={{ fontSize: 12, color: '#aaa', marginLeft: 6 }}>
            vs last week
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;