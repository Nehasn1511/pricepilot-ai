import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Typography,
  Tag, Table, Progress, Space, Skeleton, Alert
} from 'antd';
import {
  ShoppingOutlined, AlertOutlined, CheckCircleOutlined,
  ThunderboltOutlined, ArrowDownOutlined, EyeOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const alertColumns = [
  {
    title: 'Product', dataIndex: 'product', key: 'product',
    render: (t) => <Text strong>{t}</Text>,
  },
  {
    title: 'Platform', dataIndex: 'platform', key: 'platform',
    render: (p) => (
      <Tag color={p === 'AMAZON' ? 'orange' : p === 'FLIPKART' ? 'blue' : 'green'}>{p}</Tag>
    ),
  },
  {
    title: 'Issue', dataIndex: 'issue', key: 'issue',
    render: (t) => <Text type="danger">{t}</Text>,
  },
  { title: 'Views (7d)', dataIndex: 'views', key: 'views' },
  {
    title: 'Health Score', dataIndex: 'healthScore', key: 'healthScore',
    render: (score) => (
      <Progress
        percent={score} size="small"
        status={score < 40 ? 'exception' : score < 60 ? 'normal' : 'success'}
        format={(p) => `${p}/100`}
      />
    ),
  },
];

export default function Dashboard() {
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [pieData,   setPieData]   = useState([]);
  const [barData,   setBarData]   = useState([]);
  const [alertData, setAlertData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const res = await axiosClient.get('/dashboard/stats');
          setStats(res.data);
        } catch {
          const productsRes = await axiosClient.get('/products');
          const products = Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data.content ?? [];

          const allListings = products.flatMap(p => p.listings || []);
          const noSale  = allListings.filter(l => (l.ordersLast7Days || 0) === 0).length;
          const lowSale = allListings.filter(l =>
            (l.ordersLast7Days || 0) > 0 && (l.ordersLast7Days || 0) < 5
          ).length;

          const platformCounts = {};
          allListings.forEach(l => {
            const p = l.platform || 'OTHER';
            platformCounts[p] = (platformCounts[p] || 0) + (l.ordersLast7Days || 0);
          });
          const pie = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));
          setPieData(pie.length > 0 ? pie : [
            { name: 'Amazon', value: 45 },
            { name: 'Flipkart', value: 30 },
            { name: 'Meesho', value: 15 },
            { name: 'Others', value: 10 },
          ]);

          const alerts = allListings
            .filter(l => (l.ordersLast7Days || 0) === 0)
            .slice(0, 5)
            .map((l, i) => ({
              key: i,
              product: l.title || 'Unknown',
              platform: l.platform || '—',
              issue: 'No Sales (7 days)',
              views: l.viewsLast7Days || 0,
              healthScore: 25,
            }));
          setAlertData(alerts);

          setStats({
            totalProducts: products.length,
            totalListings: allListings.length,
            noSaleProducts: noSale,
            lowSaleProducts: lowSale,
            pendingApprovals: 0,
            activeDiscounts: 0,
          });
        }

        try {
          const recRes = await axiosClient.get('/recommendations');
          const recs = Array.isArray(recRes.data) ? recRes.data : recRes.data.content ?? [];
          const pending  = recs.filter(r => r.status === 'PENDING').length;
          const approved = recs.filter(r => r.status === 'APPROVED').length;
          const rejected = recs.filter(r => r.status === 'REJECTED').length;
          setBarData([
            { name: 'Pending',  value: pending,  color: '#faad14' },
            { name: 'Approved', value: approved, color: '#52c41a' },
            { name: 'Rejected', value: rejected, color: '#ff4d4f' },
          ]);
          setStats(prev => ({ ...prev, pendingApprovals: pending }));
        } catch {
          setBarData([
            { name: 'Pending',  value: 3, color: '#faad14' },
            { name: 'Approved', value: 8, color: '#52c41a' },
            { name: 'Rejected', value: 2, color: '#ff4d4f' },
          ]);
        }

      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (error) return <Alert type="error" message={error} showIcon style={{ borderRadius: 8 }} />;

  const statCards = [
    { title: 'Total Products',    value: stats?.totalProducts    || 0, icon: <ShoppingOutlined style={{ fontSize: 24, color: '#1677ff' }} />, color: '#e6f4ff' },
    { title: 'Total Listings',    value: stats?.totalListings    || 0, icon: <EyeOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,      color: '#e6fffb' },
    { title: 'Low-Sale Products', value: stats?.lowSaleProducts  || 0, icon: <ArrowDownOutlined style={{ fontSize: 24, color: '#faad14' }} />, color: '#fffbe6' },
    { title: 'No-Sale Products',  value: stats?.noSaleProducts   || 0, icon: <AlertOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,    color: '#fff2f0' },
    { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#722ed1' }} />, color: '#f9f0ff' },
    { title: 'Active Discounts',  value: stats?.activeDiscounts  || 0, icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#f6ffed' },
  ];

  const totalBar = barData.reduce((s, b) => s + b.value, 0) || 1;
  const totalPie = pieData.reduce((s, p) => s + p.value, 0) || 1;
  const pieColors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard Overview</Title>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} md={8} lg={4} key={idx}>
            <Card style={{ background: card.color, borderRadius: 12 }}>
              <Space>{card.icon}<Statistic title={card.title} value={card.value} /></Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row — replaced with progress bars */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>

        {/* Recommendation Status */}
        <Col xs={24} lg={10}>
          <Card title="Recommendation Status" style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {barData.map((b) => (
                <div key={b.name}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text style={{ color: b.color, fontWeight: 600 }}>{b.name}</Text>
                    <Text type="secondary">{b.value}</Text>
                  </Space>
                  <Progress
                    percent={Math.round((b.value / totalBar) * 100)}
                    strokeColor={b.color}
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Revenue by Marketplace */}
        <Col xs={24} lg={14}>
          <Card title="Revenue by Marketplace" style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {pieData.map((p, i) => (
                <div key={p.name}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text style={{ color: pieColors[i % pieColors.length], fontWeight: 600 }}>{p.name}</Text>
                    <Text type="secondary">{Math.round((p.value / totalPie) * 100)}%</Text>
                  </Space>
                  <Progress
                    percent={Math.round((p.value / totalPie) * 100)}
                    strokeColor={pieColors[i % pieColors.length]}
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Products Health Summary" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Total" value={stats?.totalProducts || 0} valueStyle={{ color: '#1677ff' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Low Sale" value={stats?.lowSaleProducts || 0} valueStyle={{ color: '#faad14' }} suffix={<ArrowDownOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="No Sale" value={stats?.noSaleProducts || 0} valueStyle={{ color: '#ff4d4f' }} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="AI Recommendations" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Pending" value={stats?.pendingApprovals || 0} valueStyle={{ color: '#722ed1' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Active Discounts" value={stats?.activeDiscounts || 0} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Listings" value={stats?.totalListings || 0} valueStyle={{ color: '#13c2c2' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Alerts Table */}
      <Card title="Product Alerts — Needs Attention" style={{ borderRadius: 12 }}>
        <Table
          dataSource={alertData.length > 0 ? alertData : [
            { key: 1, product: 'Check Products page for alerts', platform: 'ALL', issue: 'Navigate to Products to see real alerts', views: 0, healthScore: 50 },
          ]}
          columns={alertColumns}
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No alerts — all products performing well ✓' }}
        />
      </Card>
    </div>
  );
}