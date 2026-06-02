import React, { useState } from 'react';
import {
  Row, Col, Card, Typography, Button, DatePicker,
  Select, Space, Statistic, notification, Progress
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

const summaryStats = [
  { title: 'Total Recommendations', value: 48,      icon: <BarChartOutlined style={{ fontSize: 20, color: '#1677ff' }} />, color: '#e6f4ff' },
  { title: 'Approval Rate',         value: '77.8%',  icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />, color: '#f6ffed' },
  { title: 'Avg Discount Applied',  value: '18.4%',  icon: <PercentageOutlined style={{ fontSize: 20, color: '#fa8c16' }} />, color: '#fff7e6' },
  { title: 'Revenue Recovered',     value: '₹1.84L', icon: <DollarOutlined style={{ fontSize: 20, color: '#722ed1' }} />, color: '#f9f0ff' },
];

const maxRevenue = Math.max(...salesData.map(d => d.revenue));
const maxOrders  = Math.max(...salesData.map(d => d.orders));

export default function Reports() {
  const [dateRange,  setDateRange]  = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [reportType, setReportType] = useState('all');
  const [exporting,  setExporting]  = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axiosClient.get('/reports/export', {
        responseType: 'blob',
        params: {
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate:   dateRange[1]?.format('YYYY-MM-DD'),
          type:      reportType,
        },
      });
      const url  = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `pricepilot-report-${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notification.success({ message: 'Report downloaded successfully' });
    } catch {
      notification.error({ message: 'Export failed — endpoint may not be ready yet' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Reports & Analytics</Title>

      {/* Summary stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryStats.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card style={{ borderRadius: 12, background: s.color }}>
              <Space>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <Statistic title={s.title} value={s.value} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Export Panel */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Title level={5} style={{ margin: '0 0 16px' }}>Export Report</Title>
        <Row gutter={12} align="middle" wrap>
          <Col>
            <Text style={{ marginRight: 8 }}>Date range:</Text>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD MMM YYYY"
              style={{ borderRadius: 8 }}
              presets={[
                { label: 'Last 7 days',  value: [dayjs().subtract(7,  'day'), dayjs()] },
                { label: 'Last 30 days', value: [dayjs().subtract(30, 'day'), dayjs()] },
                { label: 'Last 90 days', value: [dayjs().subtract(90, 'day'), dayjs()] },
              ]}
            />
          </Col>
          <Col>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 200 }}
              options={[
                { label: 'All Data',        value: 'all'             },
                { label: 'Recommendations', value: 'recommendations' },
                { label: 'Sales Data',      value: 'sales'           },
                { label: 'Price Changes',   value: 'price-changes'   },
              ]}
            />
          </Col>
          <Col>
            <Button
              type="primary" icon={<DownloadOutlined />}
              loading={exporting} onClick={handleExport}
              style={{ borderRadius: 8 }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts replaced with progress bars */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Sales Revenue — Last 7 Days" style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {salesData.map((d) => (
                <div key={d.date}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text style={{ width: 60, display: 'inline-block' }}>{d.date}</Text>
                    <Text strong style={{ color: '#1677ff' }}>₹{(d.revenue / 1000).toFixed(0)}k</Text>
                  </Space>
                  <Progress
                    percent={Math.round((d.revenue / maxRevenue) * 100)}
                    strokeColor="#1677ff"
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Orders by Day" style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {salesData.map((d) => (
                <div key={d.date}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text style={{ width: 60, display: 'inline-block' }}>{d.date}</Text>
                    <Text strong style={{ color: '#52c41a' }}>{d.orders} orders</Text>
                  </Space>
                  <Progress
                    percent={Math.round((d.orders / maxOrders) * 100)}
                    strokeColor="#52c41a"
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}