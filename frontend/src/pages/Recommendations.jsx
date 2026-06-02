import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Statistic,
  Input,
  message,
  Badge,
  Tabs,
  Select,
  Checkbox,
  notification
} from 'antd';
import {
  ThunderboltOutlined, CheckOutlined, CloseOutlined,
  ArrowDownOutlined, ArrowUpOutlined, SafetyOutlined,
  RobotOutlined, ExperimentOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const demoRecommendations = [
  {
    id: 1, productName: 'Wireless Keyboard Pro', platform: 'AMAZON',
    recommendationType: 'PRICE_MATCH', currentPrice: 1499,
    recommendedPrice: 1299, minimumSafePrice: 1100,
    lowestMarketPrice: 1299, discountPercent: 13.3,
    reason: 'Product is priced ₹200 higher than the lowest marketplace price.',
    aiExplanation: 'Your Wireless Keyboard Pro on Amazon has 900 views but only 2 orders in 7 days. Reducing to ₹1299 gives ₹199 above your safe price of ₹1100.',
    riskLevel: 'LOW', expectedImpact: 'Medium to High',
    durationDays: 5, status: 'PENDING',
    viewsLast7Days: 900, ordersLast7Days: 2, stockQuantity: 120,
  },
  {
    id: 2, productName: 'USB-C Hub 7-in-1', platform: 'AMAZON',
    recommendationType: 'STOCK_CLEARANCE', currentPrice: 2499,
    recommendedPrice: 2124, minimumSafePrice: 1680,
    lowestMarketPrice: 2199, discountPercent: 15.0,
    reason: 'High inventory with low sales velocity.',
    aiExplanation: 'Your USB-C Hub has 80 units in stock but zero orders this week. A 15% markdown to ₹2124 stays well above your floor of ₹1680.',
    riskLevel: 'LOW', expectedImpact: 'High',
    durationDays: 5, status: 'PENDING',
    viewsLast7Days: 450, ordersLast7Days: 0, stockQuantity: 80,
  },
  {
    id: 3, productName: 'Samsung 25W Charger', platform: 'AMAZON',
    recommendationType: 'PRICE_INCREASE', currentPrice: 899,
    recommendedPrice: 944, minimumSafePrice: 700,
    lowestMarketPrice: 799, discountPercent: -5.0,
    reason: 'Sales are strong. Market demand supports a price increase.',
    aiExplanation: 'Your Samsung 25W Charger achieves 65 orders from 2100 views. A 5% increase adds ₹2,925 weekly profit.',
    riskLevel: 'LOW', expectedImpact: 'Increased profit per unit',
    durationDays: null, status: 'APPROVED',
    viewsLast7Days: 2100, ordersLast7Days: 65, stockQuantity: 200,
  },
  {
    id: 4, productName: 'Phone Case Clear', platform: 'MEESHO',
    recommendationType: 'MARGIN_PROTECTION', currentPrice: 799,
    recommendedPrice: 799, minimumSafePrice: 380,
    lowestMarketPrice: 499, discountPercent: 0,
    reason: 'Price cut risky — listing quality should be improved first.',
    aiExplanation: 'While the ₹300 price gap vs Meesho looks concerning, 1200 views with zero conversions suggests a listing quality issue, not a pricing issue.',
    riskLevel: 'MEDIUM', expectedImpact: 'Consider alternative strategies',
    durationDays: null, status: 'REJECTED',
    viewsLast7Days: 1200, ordersLast7Days: 0, stockQuantity: 500,
  },
  {
    id: 5, productName: 'boAt Rockerz 255 Pro', platform: 'FLIPKART',
    recommendationType: 'TEMPORARY_DISCOUNT', currentPrice: 1299,
    recommendedPrice: 1099, minimumSafePrice: 1050,
    lowestMarketPrice: 1150, discountPercent: 15.4,
    reason: 'High views with declining orders. A temporary discount should recover sales.',
    aiExplanation: 'Product had 890 views last week but orders dropped from 35 to 12. A 15% temporary discount for 7 days should recover momentum.',
    riskLevel: 'MEDIUM', expectedImpact: 'Sales recovery expected',
    durationDays: 7, status: 'PENDING',
    viewsLast7Days: 890, ordersLast7Days: 12, stockQuantity: 60,
  },
];

const typeConfig = {
  PRICE_MATCH:        { color: 'blue',   label: 'Price Match',       icon: '🎯' },
  TEMPORARY_DISCOUNT: { color: 'orange', label: 'Temp Discount',     icon: '⏰' },
  STOCK_CLEARANCE:    { color: 'red',    label: 'Stock Clearance',   icon: '📦' },
  MARGIN_PROTECTION:  { color: 'purple', label: 'Margin Protection', icon: '🛡️' },
  BUNDLE_OFFER:       { color: 'cyan',   label: 'Bundle Offer',      icon: '🎁' },
  PRICE_INCREASE:     { color: 'green',  label: 'Price Increase',    icon: '📈' },
};

const riskConfig = {
  LOW:    { color: 'success', text: 'Low Risk'    },
  MEDIUM: { color: 'warning', text: 'Medium Risk' },
  HIGH:   { color: 'error',   text: 'High Risk'   },
};

export default function Recommendations() {
  const [recs,         setRecs]         = useState([]);
  const [activeTab,    setActiveTab]    = useState('ALL');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);
  const [comments,     setComments]     = useState('');
  const [bulkLoading,  setBulkLoading]  = useState(false);

  // ── Fetch recommendations ──────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosClient.get('/recommendations');
        const data = Array.isArray(res.data)
          ? res.data : res.data.content ?? [];
        const mapped = data.map(r => ({
          id:                 r.id,
          productName:        r.masterProduct?.name    || r.productName    || 'Unknown',
          platform:           r.marketplaceProduct?.platform || r.platform || 'AMAZON',
          recommendationType: r.recommendationType     || 'PRICE_MATCH',
          currentPrice:       r.currentPrice           || 0,
          recommendedPrice:   r.recommendedPrice       || 0,
          minimumSafePrice:   r.minimumSafePrice       || 0,
          lowestMarketPrice:  r.lowestMarketPrice      || 0,
          discountPercent:    r.discountPercent        || 0,
          reason:             r.reason                 || '',
          aiExplanation:      r.aiExplanation          || '',
          riskLevel:          r.riskLevel              || 'LOW',
          expectedImpact:     r.expectedImpact         || '',
          durationDays:       r.durationDays           || null,
          status:             r.status                 || 'PENDING',
          viewsLast7Days:     r.marketplaceProduct?.viewsLast7Days  || 0,
          ordersLast7Days:    r.marketplaceProduct?.ordersLast7Days || 0,
          stockQuantity:      r.marketplaceProduct?.stockQuantity   || 0,
        }));
        setRecs(mapped.length > 0 ? mapped : demoRecommendations);
      } catch {
        setRecs(demoRecommendations);
      }
    };
    fetch();
  }, []);

  // ── Filtered list ──────────────────────────────────────
  const filtered = useMemo(() => recs.filter(r => {
    const statusMatch = activeTab === 'ALL' || r.status === activeTab;
    const typeMatch   = !typeFilter || r.recommendationType === typeFilter;
    return statusMatch && typeMatch;
  }), [recs, activeTab, typeFilter]);

  // ── Counts for tabs ────────────────────────────────────
  const counts = useMemo(() => ({
    ALL:      recs.length,
    PENDING:  recs.filter(r => r.status === 'PENDING').length,
    APPROVED: recs.filter(r => r.status === 'APPROVED').length,
    REJECTED: recs.filter(r => r.status === 'REJECTED').length,
  }), [recs]);

  const updateStatus = (id, status) =>
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  // ── Single approve ─────────────────────────────────────
  const handleApprove = async (id) => {
    updateStatus(id, 'APPROVED');
    try {
      await axiosClient.patch(`/recommendations/${id}/approve`, { comments });
      notification.success({ message: 'Recommendation Approved', placement: 'topRight' });
    } catch {
      updateStatus(id, 'PENDING');
      notification.error({ message: 'Approval failed. Try again.', placement: 'topRight' });
    }
    setApproveModal(null);
    setComments('');
  };

  // ── Single reject ──────────────────────────────────────
  const handleReject = async (id) => {
    updateStatus(id, 'REJECTED');
    try {
      await axiosClient.patch(`/recommendations/${id}/reject`, { comments });
      notification.info({ message: 'Recommendation Rejected', placement: 'topRight' });
    } catch {
      updateStatus(id, 'PENDING');
      notification.error({ message: 'Action failed. Try again.', placement: 'topRight' });
    }
    setRejectModal(null);
    setComments('');
  };

  // ── Bulk approve ───────────────────────────────────────
  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    selectedIds.forEach(id => updateStatus(id, 'APPROVED'));
    let success = 0;
    const failed = [];
    await Promise.allSettled(
      selectedIds.map(id =>
        axiosClient.patch(`/recommendations/${id}/approve`)
          .then(() => success++)
          .catch(() => failed.push(id))
      )
    );
    failed.forEach(id => updateStatus(id, 'PENDING'));
    setSelectedIds([]);
    setBulkLoading(false);
    if (success > 0) notification.success({ message: `${success} recommendations approved` });
    if (failed.length > 0) notification.error({ message: `${failed.length} failed` });
  };

  const toggleSelect = (id) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const pendingInFiltered = filtered.filter(r => r.status === 'PENDING');

  const tabItems = [
    { key: 'ALL',      label: <span>All <Badge count={counts.ALL} style={{ background: '#8c8c8c' }} /></span> },
    { key: 'PENDING',  label: <span>Pending <Badge count={counts.PENDING} style={{ background: '#1677ff' }} /></span> },
    { key: 'APPROVED', label: <span>Approved <Badge count={counts.APPROVED} style={{ background: '#52c41a' }} /></span> },
    { key: 'REJECTED', label: <span>Rejected <Badge count={counts.REJECTED} style={{ background: '#ff4d4f' }} /></span> },
  ];

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>AI Recommendations</Title>
        <Space>
          {selectedIds.length > 0 && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              loading={bulkLoading}
              onClick={handleBulkApprove}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Approve {selectedIds.length} Selected
            </Button>
          )}
          <Button type="primary" icon={<ExperimentOutlined />}>
            Generate New
          </Button>
        </Space>
      </Row>

      {/* Summary stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Pending',  value: counts.PENDING,  color: '#1677ff' },
          { label: 'Approved', value: counts.APPROVED, color: '#52c41a' },
          { label: 'Rejected', value: counts.REJECTED, color: '#ff4d4f' },
          { label: 'Total',    value: counts.ALL,       color: '#722ed1' },
        ].map(s => (
          <Col span={6} key={s.label}>
            <Card size="small" style={{ borderRadius: 10 }}>
              <Statistic title={s.label} value={s.value} valueStyle={{ color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '0 20px' } }}>
        <Row justify="space-between" align="center">
          <Tabs
            activeKey={activeTab}
            onChange={(k) => { setActiveTab(k); setSelectedIds([]); }}
            items={tabItems}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All Types"
            allowClear
            style={{ width: 200, margin: '12px 0' }}
            onChange={(v) => setTypeFilter(v || '')}
            options={[
              { label: 'All Types', value: '' },
              ...Object.entries(typeConfig).map(([k, v]) => ({
                label: `${v.icon} ${v.label}`, value: k,
              })),
            ]}
          />
        </Row>
      </Card>

      {/* Select all for pending */}
      {activeTab === 'PENDING' && pendingInFiltered.length > 0 && (
        <div style={{
          background: '#f0f9ff', borderRadius: 8, padding: '8px 16px',
          marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Checkbox
            checked={selectedIds.length === pendingInFiltered.length}
            indeterminate={selectedIds.length > 0 && selectedIds.length < pendingInFiltered.length}
            onChange={(e) =>
              setSelectedIds(e.target.checked ? pendingInFiltered.map(r => r.id) : [])
            }
          />
          <Text style={{ fontSize: 13 }}>
            {selectedIds.length > 0
              ? `${selectedIds.length} of ${pendingInFiltered.length} selected`
              : `Select all ${pendingInFiltered.length} pending`}
          </Text>
        </div>
      )}

      {/* Recommendation cards */}
      {filtered.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <Text type="secondary">No recommendations match your filters</Text>
        </Card>
      ) : (
        filtered.map(rec => (
          <div key={rec.id} style={{ position: 'relative' }}>
            {rec.status === 'PENDING' && (
              <div style={{ position: 'absolute', top: 20, left: -28, zIndex: 1 }}>
                <Checkbox
                  checked={selectedIds.includes(rec.id)}
                  onChange={() => toggleSelect(rec.id)}
                />
              </div>
            )}
            <Card
              style={{
                marginBottom: 16, borderRadius: 12,
                opacity: rec.status !== 'PENDING' ? 0.8 : 1,
                border: rec.riskLevel === 'HIGH' ? '1px solid #ffccc7'
                  : rec.riskLevel === 'MEDIUM' ? '1px solid #ffe58f'
                  : '1px solid #f0f0f0',
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Space style={{ marginBottom: 8 }} wrap>
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
                      <Tag color={rec.status === 'APPROVED' ? 'success' : 'default'}>
                        {rec.status}
                      </Tag>
                    )}
                  </Space>

                  <Row gutter={16} style={{ marginBottom: 12 }}>
                    <Col><Statistic title="Current" value={rec.currentPrice} prefix="₹" valueStyle={{ fontSize: 16 }} /></Col>
                    <Col>
                      <Statistic
                        title="Recommended" value={rec.recommendedPrice} prefix="₹"
                        valueStyle={{ fontSize: 16, color: rec.recommendedPrice < rec.currentPrice ? '#52c41a' : '#ff4d4f' }}
                        suffix={rec.discountPercent > 0 ? <ArrowDownOutlined /> : rec.discountPercent < 0 ? <ArrowUpOutlined /> : null}
                      />
                    </Col>
                    <Col><Statistic title="Safe Price" value={rec.minimumSafePrice} prefix="₹" valueStyle={{ fontSize: 16, color: '#722ed1' }} /></Col>
                    <Col><Statistic title="Market Low" value={rec.lowestMarketPrice} prefix="₹" valueStyle={{ fontSize: 16 }} /></Col>
                  </Row>

                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    <SafetyOutlined /> {rec.reason}
                  </Text>

                  {rec.aiExplanation && (
                    <Card size="small" style={{ background: '#f6f8ff', marginTop: 8 }}>
                      <Space align="start">
                        <RobotOutlined style={{ color: '#1677ff', fontSize: 16, marginTop: 4 }} />
                        <div>
                          <Text strong style={{ color: '#1677ff' }}>AI Analysis (Gemini)</Text>
                          <Paragraph style={{ margin: '4px 0 0', fontSize: 13 }}>{rec.aiExplanation}</Paragraph>
                        </div>
                      </Space>
                    </Card>
                  )}
                </Col>

                <Col xs={24} md={8}>
                  <Card size="small" style={{ marginBottom: 12 }}>
                    <Row gutter={8}>
                      <Col span={8}><Statistic title="Views" value={rec.viewsLast7Days} valueStyle={{ fontSize: 14 }} /></Col>
                      <Col span={8}>
                        <Statistic title="Orders" value={rec.ordersLast7Days}
                          valueStyle={{ fontSize: 14, color: rec.ordersLast7Days === 0 ? '#ff4d4f' : undefined }} />
                      </Col>
                      <Col span={8}><Statistic title="Stock" value={rec.stockQuantity} valueStyle={{ fontSize: 14 }} /></Col>
                    </Row>
                  </Card>

                  <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                    Impact: <Text strong>{rec.expectedImpact}</Text>
                  </Text>
                  {rec.durationDays && (
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                      Duration: <Text strong>{rec.durationDays} days</Text>
                    </Text>
                  )}

                  {rec.status === 'PENDING' && (
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        type="primary" icon={<CheckOutlined />}
                        onClick={() => setApproveModal(rec)}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      >
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
          </div>
        ))
      )}

      {/* Approve Modal */}
      <Modal
        title="Approve Recommendation"
        open={!!approveModal}
        onOk={() => handleApprove(approveModal?.id)}
        onCancel={() => { setApproveModal(null); setComments(''); }}
        okText="Confirm Approval"
        okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
      >
        <Paragraph>
          Approve price change for <Text strong>{approveModal?.productName}</Text> from{' '}
          <Text strong>₹{approveModal?.currentPrice}</Text> →{' '}
          <Text strong style={{ color: '#52c41a' }}>₹{approveModal?.recommendedPrice}</Text>?
        </Paragraph>
        <TextArea
          placeholder="Optional comments..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3} style={{ marginTop: 8 }}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Recommendation"
        open={!!rejectModal}
        onOk={() => handleReject(rejectModal?.id)}
        onCancel={() => { setRejectModal(null); setComments(''); }}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>
          Reject recommendation for <Text strong>{rejectModal?.productName}</Text>?
        </Paragraph>
        <TextArea
          placeholder="Reason for rejection..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3} style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}