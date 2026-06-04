import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Typography, Button, DatePicker,
  Select, Space, notification, Progress
} from 'antd';
import {
  DownloadOutlined, BarChartOutlined,
  CheckCircleOutlined, PercentageOutlined, DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const salesData = [
  { date: '25 May', revenue: 28000, orders: 24 },
  { date: '26 May', revenue: 35000, orders: 31 },
  { date: '27 May', revenue: 22000, orders: 19 },
  { date: '28 May', revenue: 41000, orders: 38 },
  { date: '29 May', revenue: 38000, orders: 35 },
  { date: '30 May', revenue: 52000, orders: 47 },
  { date: '31 May', revenue: 47000, orders: 43 },
];

const maxRevenue = Math.max(...salesData.map(d => d.revenue));
const maxOrders = Math.max(...salesData.map(d => d.orders));

export default function Reports() {
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [reportType, setReportType] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [recommendationStats, setRecommendationStats] = useState({
    pending: 3,
    approved: 8,
    rejected: 2,
  });

  useEffect(() => {
    const loadRecommendationStats = async () => {
      try {
        const res = await axiosClient.get('/recommendations');
        const recs = Array.isArray(res.data) ? res.data : (res.data.content ?? []);

        if (recs.length > 0) {
          setRecommendationStats({
            pending: recs.filter(r => r.status === 'PENDING').length,
            approved: recs.filter(r => r.status === 'APPROVED').length,
            rejected: recs.filter(r => r.status === 'REJECTED').length,
          });
        }
      } catch (err) {
        console.error("Failed to load stats, using demo data", err);
      }
    };
    loadRecommendationStats();
  }, []);

  const summaryStats = [
    {
      title: 'Pending Recommendations',
      value: recommendationStats.pending,
      icon: <BarChartOutlined style={{ fontSize: 24, color: '#f59e0b' }} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
    },
    {
      title: 'Approved Recommendations',
      value: recommendationStats.approved,
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.06)',
    },
    {
      title: 'Rejected Recommendations',
      value: recommendationStats.rejected,
      icon: <PercentageOutlined style={{ fontSize: 24, color: '#ef4444' }} />,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.06)',
    },
    {
      title: 'Revenue Recovered',
      value: '₹1.84L',
      icon: <DollarOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.06)',
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axiosClient.get('/reports/export', {
        responseType: 'blob',
        params: {
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD'),
          type: reportType,
        },
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `pricepilot-report-${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notification.success({ message: 'Report downloaded successfully' });
    } catch (err) {
      if (err.response?.status === 403) {
        handleLocalExport();
      } else {
        notification.error({ message: 'Export failed. Please try again.' });
      }
    } finally {
      setExporting(false);
    }
  };

  const handleLocalExport = () => {
    const headers = ['Date', 'Product', 'Platform', 'Action', 'Old Price', 'New Price', 'Status'];
    const rows = [
      ['2026-06-01', 'Wireless Keyboard Pro', 'AMAZON', 'PRICE_MATCH', '1499', '1299', 'APPROVED'],
      ['2026-06-01', 'USB-C Hub 7-in-1', 'AMAZON', 'STOCK_CLEARANCE', '2499', '2124', 'PENDING'],
      ['2026-05-31', 'Samsung 25W Charger', 'AMAZON', 'PRICE_INCREASE', '899', '944', 'APPROVED'],
    ];
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricepilot-report-demo.csv`;
    link.click();
    notification.success({ message: 'Report exported successfully', description: 'Demo data exported as CSV' });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--ant-color-text)' }}>Reports & Analytics</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>Analyze pricing impact and revenue generation strategies</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryStats.map((s, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card className="floating-card" style={{ borderRadius: 16, background: s.bg, border: '1px solid var(--ant-color-border-secondary)', boxShadow: 'none' }} styles={{ body: { padding: '20px 24px' } }}>
              <Space size="large" align="center">
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--ant-color-bg-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)', fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ant-color-text)' }}>{s.value}</div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="floating-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', background: 'var(--ant-color-bg-container)', padding: '20px 24px', borderRadius: 16, border: '1px solid var(--ant-color-border-secondary)', marginBottom: 24 }}>
        <Space wrap>
          <RangePicker size="large" value={dateRange} onChange={setDateRange} format="DD MMM YYYY" />
          <Select size="large" value={reportType} onChange={setReportType} style={{ width: 220 }} options={[{ label: 'Comprehensive Report', value: 'all' }, { label: 'AI Recommendations', value: 'recommendations' }]} />
        </Space>
        <Button type="primary" icon={<DownloadOutlined />} loading={exporting} onClick={handleExport} size="large" className="gradient-btn" style={{ borderRadius: 10 }}>Export CSV Data</Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={15}>
          <Card className="ai-glow-card" title="Revenue Velocity (7 Days)" style={{ border: 'none', height: '100%' }}>
            {salesData.map((d) => (
              <div key={d.date} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>{d.date}</Text>
                  <Text strong style={{ color: '#6366f1' }}>₹{(d.revenue / 1000).toFixed(0)}k</Text>
                </div>
                <Progress percent={Math.round((d.revenue / maxRevenue) * 100)} showInfo={false} strokeColor="#6366f1" />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="floating-card" title="Order Volume" style={{ height: '100%' }}>
             {salesData.map((d) => (
              <div key={d.date} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>{d.date}</Text>
                  <Text strong style={{ color: '#10b981' }}>{d.orders} orders</Text>
                </div>
                <Progress percent={Math.round((d.orders / maxOrders) * 100)} showInfo={false} strokeColor="#10b981" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}