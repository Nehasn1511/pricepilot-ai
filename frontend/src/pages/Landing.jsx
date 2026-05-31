import React from 'react';
import { Button, Typography, Card, Row, Col } from 'antd';
import {
  RocketOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShoppingOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      title: 'Multi-Marketplace Management',
      desc: 'Manage products across Amazon, Flipkart, Shopify, and Meesho from one place.',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: 'AI-Powered Recommendations',
      desc: 'Gemini AI analyzes your sales data and recommends optimal pricing actions.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Profit-Safe Pricing',
      desc: 'Never sell below cost. Our engine calculates minimum safe price automatically.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Team Management',
      desc: 'Invite team members with roles like Pricing Manager, Analyst, or Seller.',
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      title: 'Price History & Analytics',
      desc: 'Track every price change over time with full audit trail.',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      title: 'CSV Bulk Import',
      desc: 'Upload hundreds of products at once using a simple CSV file.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #001529 0%, #1677ff 100%)',
        padding: '80px 40px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <RocketOutlined style={{ fontSize: 64, marginBottom: 24 }} />
        <Title style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
          PricePilot AI
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, marginBottom: 40 }}>
          AI-Based Dynamic Pricing & Sales Recovery Platform for E-Commerce Sellers
        </Paragraph>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            style={{ background: '#fff', color: '#1677ff', border: 'none', fontWeight: 600 }}
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          <Button
            size="large"
            ghost
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '60px 40px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Why PricePilot AI?
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((f, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%', borderRadius: 12 }}
              >
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Paragraph style={{ color: '#666' }}>{f.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div style={{
        background: '#001529',
        padding: '60px 40px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
          Ready to boost your sales?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>
          Join sellers who use PricePilot AI to stay competitive and protect their margins.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/login')}
        >
          Start Now
        </Button>
      </div>
    </div>
  );
}