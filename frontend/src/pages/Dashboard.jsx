import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Tag, Table, Progress, Space } from 'antd';
import {
  ShoppingOutlined, AlertOutlined, CheckCircleOutlined,
  ThunderboltOutlined, ArrowUpOutlined, ArrowDownOutlined,
  EyeOutlined, DollarOutlined
} from '@ant-design/icons';
import { dashboardAPI } from '../services/api';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      // Use demo data if API not ready
      setStats({
        totalProducts: 245,
        totalListings: 612,
        lowSaleProducts: 38,
        noSaleProducts: 12,
        pendingApprovals: 8,
        activeDiscounts: 15,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <ShoppingOutlined style={{ fontSize: 24, color: '#1677ff' }} />,
      color: '#e6f4ff'
    },
    {
      title: 'Low-Sale Products',
      value: stats.lowSaleProducts || 0,
      icon: <ArrowDownOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      color: '#fffbe6'
    },
    {
      title: 'No-Sale Products',
      value: stats.noSaleProducts || 0,
      icon: <AlertOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,
      color: '#fff2f0'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff'
    },
    {
      title: 'Active Discounts',
      value: stats.activeDiscounts || 0,
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#f6ffed'
    },
    {
      title: 'Total Listings',
      value: stats.totalListings || 0,
      icon: <EyeOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      color: '#e6fffb'
    },
  ];

  // Demo data for the alerts table
  const alertData = [
    { key: 1, product: 'Bluetooth Speaker X', platform: 'Amazon', issue: 'No Sales (7 days)', views: 520, healthScore: 28 },
    { key: 2, product: 'Wireless Keyboard Pro', platform: 'Amazon', issue: 'Price 25% higher than Flipkart', views: 340, healthScore: 35 },
    { key: 3, product: 'USB-C Hub 7-in-1', platform: 'Flipkart', issue: 'High stock, low sales', views: 180, healthScore: 42 },
    { key: 4, product: 'Gaming Mouse RGB', platform: 'Meesho', issue: 'Competitor price ₹200 lower', views: 890, healthScore: 45 },
    { key: 5, product: 'Phone Case Clear', platform: 'Amazon', issue: 'No Sales (14 days)', views: 1200, healthScore: 22 },
  ];

  const alertColumns = [
    { title: 'Product', dataIndex: 'product', key: 'product', render: (t) => <Text strong>{t}</Text> },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (p) => <Tag color={p === 'Amazon' ? 'orange' : p === 'Flipkart' ? 'blue' : 'green'}>{p}</Tag>
    },
    { title: 'Issue', dataIndex: 'issue', key: 'issue', render: (t) => <Text type="danger">{t}</Text> },
    { title: 'Views (7d)', dataIndex: 'views', key: 'views' },
    {
      title: 'Health Score',
      dataIndex: 'healthScore',
      key: 'healthScore',
      render: (score) => (
        <Progress
          percent={score}
          size="small"
          status={score < 40 ? 'exception' : score < 60 ? 'normal' : 'success'}
          format={(p) => `${p}/100`}
        />
      )
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard Overview</Title>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} md={8} lg={4} key={idx}>
            <Card className="stat-card" style={{ background: card.color }}>
              <Space>
                {card.icon}
                <Statistic title={card.title} value={card.value} loading={loading} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue Recovery Card */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Revenue Recovered This Month" style={{ borderRadius: 12 }}>
            <Statistic
              value={840000}
              prefix={<DollarOutlined />}
              suffix="₹"
              valueStyle={{ color: '#52c41a', fontSize: 36 }}
            />
            <Text type="secondary">+23% vs last month</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="AI Recommendations Performance" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Generated" value={47} valueStyle={{ color: '#1677ff' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Approved" value={32} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Avg Sales Lift" value="34%" suffix={<ArrowUpOutlined />} valueStyle={{ color: '#52c41a' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Alerts Table */}
      <Card title="Product Alerts - Needs Attention" style={{ borderRadius: 12 }}>
        <Table
          dataSource={alertData}
          columns={alertColumns}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
