import { Row, Col, Typography } from 'antd';
import {
  ShoppingOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import StatCard from '../components/common/StatCard';

const { Title, Text } = Typography;

// ─── Mock data (replaced with real API on Day 8) ───────────────
const mockStats = {
  totalProducts:        245,
  pendingRecommendations: 8,
  approvedThisWeek:     23,
  revenueRecovered:     84000,
};

const Dashboard = () => {
  return (
    <div>

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Overview of your pricing performance across all marketplaces
        </Text>
      </div>

      {/* ── Stat cards row ────────────────────────────────── */}
      {/* xs=24: 1 column on mobile, sm=12: 2 columns on tablet, lg=6: 4 columns on desktop */}
      <Row gutter={[16, 16]}>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Products"
            value={mockStats.totalProducts}
            icon={<ShoppingOutlined style={{ color: '#1677ff' }} />}
            trend="12%"
            trendUp={true}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Recommendations"
            value={mockStats.pendingRecommendations}
            icon={<RobotOutlined style={{ color: '#fa8c16' }} />}
            trend="3"
            trendUp={false}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Approved This Week"
            value={mockStats.approvedThisWeek}
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            trend="8%"
            trendUp={true}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Revenue Recovered"
            value={mockStats.revenueRecovered}
            prefix="₹"
            icon={<DollarOutlined style={{ color: '#722ed1' }} />}
            trend="24%"
            trendUp={true}
          />
        </Col>

      </Row>

      {/* ── Charts placeholder (built on Day 18) ──────────── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            border: '1px dashed #d9d9d9',
            textAlign: 'center',
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontSize: 14,
          }}>
            📈 Sales Trend Chart — coming Day 18
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            border: '1px dashed #d9d9d9',
            textAlign: 'center',
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontSize: 14,
          }}>
            🥧 Marketplace Pie — coming Day 18
          </div>
        </Col>
      </Row>

    </div>
  );
};

export default Dashboard;