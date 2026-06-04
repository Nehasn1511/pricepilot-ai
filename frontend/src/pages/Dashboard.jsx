import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Space, Alert, Skeleton, Progress } from 'antd';
import {
  ShoppingOutlined, AlertOutlined, CheckCircleOutlined,
  ThunderboltOutlined, EyeOutlined, RiseOutlined, FallOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const salesTrendData = [
  { date: '25 May', revenue: 28000 },
  { date: '26 May', revenue: 35000 },
  { date: '27 May', revenue: 22000 },
  { date: '28 May', revenue: 41000 },
  { date: '29 May', revenue: 38000 },
  { date: '30 May', revenue: 52000 },
  { date: '31 May', revenue: 47000 },
];

const pieColors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];
const maxRevenue = Math.max(...salesTrendData.map(d => d.revenue));

const GradientStatCard = ({ title, value, subtitle, icon, gradient, loading }) => {
  if (loading) return (
    <Card style={{ borderRadius: 16, minHeight: 124 }}>
      <Skeleton active paragraph={{ rows: 1 }} />
    </Card>
  );
  return (
    <Card
      className="floating-card"
      style={{
        borderRadius: 16, 
        border: 'none',
        background: gradient,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        minHeight: 124,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
      styles={{ body: { padding: '16px 14px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: 13, 
            color: 'rgba(255,255,255,0.95)', 
            fontWeight: 600, 
            marginBottom: 8,
            lineHeight: 1.2 
          }}>
            {title}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ 
              fontSize: 11, 
              color: 'rgba(255,255,255,0.8)', 
              marginTop: 8,
              lineHeight: 1.2
            }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#fff',
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

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
            ? productsRes.data : productsRes.data.content ?? [];
          const allListings = products.flatMap(p => p.listings || []);
          const noSale  = allListings.filter(l => (l.ordersLast7Days || 0) === 0).length;
          const lowSale = allListings.filter(l =>
            (l.ordersLast7Days || 0) > 0 && (l.ordersLast7Days || 0) < 5
          ).length;
          const platformMap = {};
          allListings.forEach(l => {
            const p = l.platform || 'OTHER';
            platformMap[p] = (platformMap[p] || 0) + (l.ordersLast7Days || 1);
          });
          const pie = Object.entries(platformMap).map(([name, value]) => ({ name, value }));
          setPieData(pie.length > 0 ? pie : [
            { name: 'Amazon', value: 45 }, { name: 'Flipkart', value: 30 },
            { name: 'Meesho', value: 15 }, { name: 'Others', value: 10 },
          ]);
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
          setBarData([
            { name: 'Pending',  value: recs.filter(r => r.status === 'PENDING').length,  color: '#f59e0b' },
            { name: 'Approved', value: recs.filter(r => r.status === 'APPROVED').length, color: '#22c55e' },
            { name: 'Rejected', value: recs.filter(r => r.status === 'REJECTED').length, color: '#ef4444' },
          ]);
          setStats(prev => ({
            ...prev,
            pendingApprovals: recs.filter(r => r.status === 'PENDING').length,
          }));
        } catch {
          setBarData([
            { name: 'Pending',  value: 3, color: '#f59e0b' },
            { name: 'Approved', value: 8, color: '#22c55e' },
            { name: 'Rejected', value: 2, color: '#ef4444' },
          ]);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (error) return <Alert type="error" message={error} showIcon style={{ borderRadius: 12 }} />;

  const statCards = [
    { title: 'Total Products',    value: stats?.totalProducts    ?? '—', subtitle: 'Across all marketplaces',    icon: <ShoppingOutlined />,    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Total Listings',    value: stats?.totalListings    ?? '—', subtitle: 'Active marketplace listings', icon: <EyeOutlined />,         gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { title: 'Low-Sale Products', value: stats?.lowSaleProducts  ?? '—', subtitle: 'Need attention',             icon: <FallOutlined />,        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'No-Sale Products',  value: stats?.noSaleProducts   ?? '—', subtitle: 'Zero orders this week',      icon: <AlertOutlined />,       gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Pending Approvals', value: stats?.pendingApprovals ?? '—', subtitle: 'Awaiting your review',       icon: <ThunderboltOutlined />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Active Discounts',  value: stats?.activeDiscounts  ?? '—', subtitle: 'Currently running',          icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  ];

  const totalBar = barData.reduce((s, b) => s + b.value, 0) || 1;
  const totalPie = pieData.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Dashboard Overview</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Monitor your pricing performance across all marketplaces
        </Text>
      </div>

      {/* Gradient Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={4} key={idx}>
            <GradientStatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>

        {/* Sales Trend */}
        <Col xs={24} lg={16}>
          <Card
            className="ai-glow-card"
            title={<Space><RiseOutlined style={{ color: '#6366f1' }} /><span style={{ fontWeight: 600 }}>Sales Revenue Trend</span></Space>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>Last 7 days</Text>}
            style={{ border: 'none' }}
          >
            {loading ? <div style={{ height: 240, background: 'var(--ant-color-bg-layout)', borderRadius: 8 }} /> : (
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                {salesTrendData.map((d) => (
                  <div key={d.date}>
                    <Space style={{ marginBottom: 2 }}>
                      <Text style={{ width: 60, display: 'inline-block', fontSize: 12 }}>{d.date}</Text>
                      <Text strong style={{ color: '#6366f1', fontSize: 12 }}>₹{(d.revenue / 1000).toFixed(0)}k</Text>
                    </Space>
                    <Progress percent={Math.round((d.revenue / maxRevenue) * 100)} strokeColor="#6366f1" showInfo={false} size="small" />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        {/* Platform Distribution */}
        <Col xs={24} lg={8}>
          <Card
            className="ai-glow-card"
            title={<Space><span>🛍️</span><span style={{ fontWeight: 600 }}>Revenue by Platform</span></Space>}
            style={{ border: 'none' }}
          >
            {loading ? <div style={{ height: 240, background: 'var(--ant-color-bg-layout)', borderRadius: 8 }} /> : (
              <Space direction="vertical" style={{ width: '100%' }} size={14}>
                {pieData.map((p, i) => (
                  <div key={p.name}>
                    <Space style={{ marginBottom: 2 }}>
                      <Text style={{ color: pieColors[i % pieColors.length], fontWeight: 600, fontSize: 12 }}>{p.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{Math.round((p.value / totalPie) * 100)}%</Text>
                    </Space>
                    <Progress percent={Math.round((p.value / totalPie) * 100)} strokeColor={pieColors[i % pieColors.length]} showInfo={false} size="small" />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]}>

        {/* Recommendation Status */}
        <Col xs={24} lg={10}>
          <Card
            className="ai-glow-card"
            title={<Space><ThunderboltOutlined style={{ color: '#f59e0b' }} /><span style={{ fontWeight: 600 }}>AI Recommendation Status</span></Space>}
            style={{ border: 'none' }}
          >
            {loading ? <div style={{ height: 200, background: 'var(--ant-color-bg-layout)', borderRadius: 8 }} /> : (
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {barData.map((b) => (
                  <div key={b.name}>
                    <Space style={{ marginBottom: 4 }}>
                      <Text style={{ color: b.color, fontWeight: 600 }}>{b.name}</Text>
                      <Text type="secondary">{b.value}</Text>
                    </Space>
                    <Progress percent={Math.round((b.value / totalBar) * 100)} strokeColor={b.color} showInfo={false} />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        {/* Summary Cards */}
        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className="ai-glow-card" style={{ border: 'none' }}>
                <div style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600, marginBottom: 12 }}>📦 Product Health</div>
                <Row gutter={8}>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ant-color-text)' }}>{stats?.totalProducts || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>Total</div></Col>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{stats?.lowSaleProducts || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>Low Sale</div></Col>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{stats?.noSaleProducts || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>No Sale</div></Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="ai-glow-card" style={{ border: 'none' }}>
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600, marginBottom: 12 }}>🤖 AI Intelligence</div>
                <Row gutter={8}>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>{stats?.pendingApprovals || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>Pending</div></Col>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{stats?.activeDiscounts || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>Active</div></Col>
                  <Col span={8}><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ant-color-text)' }}>{stats?.totalListings || 0}</div><div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>Listings</div></Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card className="ai-glow-card" style={{ border: 'none' }}>
                <div style={{ fontSize: 13, color: '#c084fc', fontWeight: 600, marginBottom: 8 }}>💡 Quick Actions</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '→ Review Pending', href: '/recommendations' },
                    { label: '→ Import Products', href: '/products' },
                    { label: '→ View Reports',    href: '/reports' },
                  ].map(a => (
                    <a key={a.href} href={a.href} style={{
                      fontSize: 12, fontWeight: 500, color: '#8b5cf6',
                      background: 'rgba(139, 92, 246, 0.1)', padding: '4px 12px',
                      borderRadius: 20, border: '1px solid rgba(139, 92, 246, 0.2)',
                      textDecoration: 'none',
                    }}>
                      {a.label}
                    </a>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}