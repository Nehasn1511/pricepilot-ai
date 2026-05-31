import React, { useState } from 'react';
import {
  Card, Button, Tag, Space, Typography, Row, Col, Modal,
  Statistic, Divider, Input, message, Badge, Steps
} from 'antd';
import {
  ThunderboltOutlined, CheckOutlined, CloseOutlined,
  ArrowDownOutlined, ArrowUpOutlined, SafetyOutlined,
  RobotOutlined, ExperimentOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Demo recommendations
const demoRecommendations = [
  {
    id: 1,
    productName: 'Wireless Keyboard Pro',
    platform: 'AMAZON',
    recommendationType: 'PRICE_MATCH',
    currentPrice: 1499,
    recommendedPrice: 1299,
    minimumSafePrice: 1100,
    lowestMarketPrice: 1299,
    discountPercent: 13.3,
    reason: 'Product is priced ₹200 higher than the lowest marketplace price (₹1299). The recommended price is above the minimum safe price (₹1100), so profit is protected.',
    aiExplanation: 'Your Wireless Keyboard Pro on Amazon has received 900 views but only 2 orders in the last 7 days — a conversion rate of just 0.2%. The same product is selling at ₹1299 on Flipkart with 12 orders. Reducing your Amazon price to ₹1299 would still give you ₹199 above your minimum safe price of ₹1100. Based on the Flipkart conversion data, you can expect 8-15 additional orders in the next 5 days at this price point.',
    riskLevel: 'LOW',
    expectedImpact: 'Medium to High - good visibility, price adjustment likely to convert',
    durationDays: 5,
    status: 'PENDING',
    viewsLast7Days: 900,
    ordersLast7Days: 2,
    stockQuantity: 120,
  },
  {
    id: 2,
    productName: 'USB-C Hub 7-in-1',
    platform: 'AMAZON',
    recommendationType: 'STOCK_CLEARANCE',
    currentPrice: 2499,
    recommendedPrice: 2124,
    minimumSafePrice: 1680,
    lowestMarketPrice: 2199,
    discountPercent: 15.0,
    reason: 'High inventory with low sales velocity. A clearance discount will help free up capital. Recommended price remains above safe price (₹1680).',
    aiExplanation: 'Your USB-C Hub has 80 units in stock but zero orders this week despite 450 page views. With the current pricing gap of ₹300 vs Flipkart (₹2199), customers are likely purchasing elsewhere. A 15% markdown to ₹2124 remains well above your floor of ₹1680, preserving ₹444 in margin per unit while significantly improving competitiveness. At this price, clearing 20-30 units in 5 days is realistic based on category benchmarks.',
    riskLevel: 'LOW',
    expectedImpact: 'High - strong demand signals with pricing gap',
    durationDays: 5,
    status: 'PENDING',
    viewsLast7Days: 450,
    ordersLast7Days: 0,
    stockQuantity: 80,
  },
  {
    id: 3,
    productName: 'Phone Case Clear',
    platform: 'AMAZON',
    recommendationType: 'MARGIN_PROTECTION',
    currentPrice: 799,
    recommendedPrice: 799,
    minimumSafePrice: 380,
    lowestMarketPrice: 499,
    discountPercent: 0,
    reason: 'Competitor price (₹499) is still profitable to match. However, product has 1200 views and 0 sales suggesting the issue may not be price alone.',
    aiExplanation: 'While the ₹300 price gap vs Meesho (₹499) looks concerning, your product has 1200 views with zero conversions — which suggests the problem may not be purely pricing. Before dropping price, consider: (1) your listing may need better images or bullet points, (2) competitors at ₹499 have 3.8 stars vs your 4.1, so your quality positioning supports the premium. Recommendation: Improve listing quality first, then reassess after 7 days before any price cut.',
    riskLevel: 'MEDIUM',
    expectedImpact: 'Consider alternative strategies',
    durationDays: null,
    status: 'PENDING',
    viewsLast7Days: 1200,
    ordersLast7Days: 0,
    stockQuantity: 500,
  },
  {
    id: 4,
    productName: 'Samsung 25W Charger',
    platform: 'AMAZON',
    recommendationType: 'PRICE_INCREASE',
    currentPrice: 899,
    recommendedPrice: 944,
    minimumSafePrice: 700,
    lowestMarketPrice: 799,
    discountPercent: -5.0,
    reason: 'Sales are strong at current price. Market demand supports a price increase.',
    aiExplanation: 'Your Samsung 25W Charger is outperforming the category with 65 orders from 2100 views (3.1% conversion). Despite being priced ₹100 above Meesho, Amazon buyers are choosing your listing — likely due to faster delivery and trust. A modest 5% increase to ₹944 should have minimal impact on volume while adding ₹45 profit per unit. At 65 units/week, that is an extra ₹2,925 weekly profit.',
    riskLevel: 'LOW',
    expectedImpact: 'Increased profit per unit',
    durationDays: null,
    status: 'PENDING',
    viewsLast7Days: 2100,
    ordersLast7Days: 65,
    stockQuantity: 200,
  },
];

export default function Recommendations() {
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [comments, setComments] = useState('');
  const [recommendations, setRecommendations] = useState(demoRecommendations);

  const typeConfig = {
    PRICE_MATCH: { color: 'blue', label: 'Price Match', icon: '🎯' },
    TEMPORARY_DISCOUNT: { color: 'orange', label: 'Temporary Discount', icon: '⏰' },
    STOCK_CLEARANCE: { color: 'red', label: 'Stock Clearance', icon: '📦' },
    MARGIN_PROTECTION: { color: 'purple', label: 'Margin Protection', icon: '🛡️' },
    BUNDLE_OFFER: { color: 'cyan', label: 'Bundle Offer', icon: '🎁' },
    PRICE_INCREASE: { color: 'green', label: 'Price Increase', icon: '📈' },
  };

  const riskConfig = {
    LOW: { color: 'success', text: 'Low Risk' },
    MEDIUM: { color: 'warning', text: 'Medium Risk' },
    HIGH: { color: 'error', text: 'High Risk' },
  };

  const handleApprove = (id) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    message.success('Recommendation approved! Price will be updated.');
    setApproveModal(null);
    setComments('');
  };

  const handleReject = (id) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    message.info('Recommendation rejected.');
    setRejectModal(null);
    setComments('');
  };

  const pendingCount = recommendations.filter(r => r.status === 'PENDING').length;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>AI Recommendations</Title>
          <Badge count={pendingCount} style={{ backgroundColor: '#1677ff' }} />
        </Space>
        <Button type="primary" icon={<ExperimentOutlined />}>
          Generate New Recommendations
        </Button>
      </Row>

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="Pending" value={pendingCount} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Approved" value={recommendations.filter(r => r.status === 'APPROVED').length} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Avg Discount" value="11.2%" valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Projected Savings" value="₹45,200" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      {/* Recommendation Cards */}
      {recommendations.map(rec => (
        <Card
          key={rec.id}
          className={`recommendation-card risk-${rec.riskLevel.toLowerCase()}`}
          style={{ marginBottom: 16, borderRadius: 12, opacity: rec.status !== 'PENDING' ? 0.7 : 1 }}
        >
          <Row gutter={24}>
            {/* Left: Product Info */}
            <Col xs={24} md={16}>
              <Space style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>{typeConfig[rec.recommendationType]?.icon}</Text>
                <Title level={5} style={{ margin: 0 }}>{rec.productName}</Title>
                <Tag color={rec.platform === 'AMAZON' ? 'orange' : 'blue'}>{rec.platform}</Tag>
                <Tag color={typeConfig[rec.recommendationType]?.color}>
                  {typeConfig[rec.recommendationType]?.label}
                </Tag>
                <Tag color={riskConfig[rec.riskLevel]?.color}>
                  {riskConfig[rec.riskLevel]?.text}
                </Tag>
                {rec.status !== 'PENDING' && (
                  <Tag color={rec.status === 'APPROVED' ? 'success' : 'default'}>{rec.status}</Tag>
                )}
              </Space>

              {/* Price Comparison */}
              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col>
                  <Statistic title="Current Price" value={rec.currentPrice} prefix="₹" valueStyle={{ fontSize: 18 }} />
                </Col>
                <Col>
                  <Statistic
                    title="Recommended"
                    value={rec.recommendedPrice}
                    prefix="₹"
                    valueStyle={{ fontSize: 18, color: rec.recommendedPrice < rec.currentPrice ? '#52c41a' : '#ff4d4f' }}
                    suffix={rec.discountPercent > 0 ? <ArrowDownOutlined /> : rec.discountPercent < 0 ? <ArrowUpOutlined /> : null}
                  />
                </Col>
                <Col>
                  <Statistic title="Safe Price" value={rec.minimumSafePrice} prefix="₹" valueStyle={{ fontSize: 18, color: '#722ed1' }} />
                </Col>
                <Col>
                  <Statistic title="Lowest Market" value={rec.lowestMarketPrice} prefix="₹" valueStyle={{ fontSize: 18 }} />
                </Col>
              </Row>

              {/* Rule-based reason */}
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                <SafetyOutlined /> {rec.reason}
              </Text>

              {/* AI Explanation */}
              <Card size="small" style={{ background: '#f6f8ff', marginTop: 8 }}>
                <Space align="start">
                  <RobotOutlined style={{ color: '#1677ff', fontSize: 16, marginTop: 4 }} />
                  <div>
                    <Text strong style={{ color: '#1677ff' }}>AI Analysis (Gemini)</Text>
                    <Paragraph style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                      {rec.aiExplanation}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Right: Metrics & Actions */}
            <Col xs={24} md={8}>
              <Card size="small" style={{ marginBottom: 12 }}>
                <Row gutter={8}>
                  <Col span={8}><Statistic title="Views" value={rec.viewsLast7Days} valueStyle={{ fontSize: 14 }} /></Col>
                  <Col span={8}><Statistic title="Orders" value={rec.ordersLast7Days} valueStyle={{ fontSize: 14, color: rec.ordersLast7Days === 0 ? '#ff4d4f' : undefined }} /></Col>
                  <Col span={8}><Statistic title="Stock" value={rec.stockQuantity} valueStyle={{ fontSize: 14 }} /></Col>
                </Row>
              </Card>

              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                Expected Impact: <Text strong>{rec.expectedImpact}</Text>
              </Text>
              {rec.durationDays && (
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  Duration: <Text strong>{rec.durationDays} days</Text>
                </Text>
              )}

              {rec.status === 'PENDING' && (
                <Space style={{ marginTop: 8 }}>
                  <Button type="primary" icon={<CheckOutlined />} onClick={() => setApproveModal(rec)}>
                    Approve
                  </Button>
                  <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal(rec)}>
                    Reject
                  </Button>
                </Space>
              )}
            </Col>
          </Row>
        </Card>
      ))}

      {/* Approve Modal */}
      <Modal
        title="Approve Recommendation"
        open={!!approveModal}
        onOk={() => handleApprove(approveModal?.id)}
        onCancel={() => setApproveModal(null)}
        okText="Confirm Approval"
      >
        <Paragraph>
          Approve price change for <Text strong>{approveModal?.productName}</Text> from
          ₹{approveModal?.currentPrice} to ₹{approveModal?.recommendedPrice}?
        </Paragraph>
        <TextArea
          placeholder="Optional comments..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Recommendation"
        open={!!rejectModal}
        onOk={() => handleReject(rejectModal?.id)}
        onCancel={() => setRejectModal(null)}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>
          Reject the AI recommendation for <Text strong>{rejectModal?.productName}</Text>?
        </Paragraph>
        <TextArea
          placeholder="Reason for rejection..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
