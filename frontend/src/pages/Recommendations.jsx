import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Button, Tag, Space, Typography, Row, Col, Modal,
  Statistic, Input, Badge, Tabs, Select, Checkbox, notification
} from 'antd';
import {
  ThunderboltOutlined, CheckOutlined, CloseOutlined,
  ArrowDownOutlined, ArrowUpOutlined, SafetyOutlined,
  RobotOutlined, ExperimentOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Config maps ────────────────────────────────────────────────
const typeConfig = {
  PRICE_MATCH:       { color: 'blue',  label: 'Price Match',     icon: '🎯' },
  TEMPORARY_DISCOUNT: { color: 'orange', label: 'Temp Discount',    icon: '⏰' },
  STOCK_CLEARANCE:    { color: 'red',    label: 'Stock Clearance',  icon: '📦' },
  MARGIN_PROTECTION:  { color: 'purple', label: 'Margin Protection', icon: '🛡️' },
  BUNDLE_OFFER:       { color: 'cyan',  label: 'Bundle Offer',      icon: '🎁' },
  PRICE_INCREASE:     { color: 'green',  label: 'Price Increase',    icon: '📈' },
};

const riskConfig = {
  LOW:   { color: 'success', text: 'Low Risk'    },
  MEDIUM: { color: 'warning', text: 'Medium Risk' },
  HIGH:   { color: 'error',   text: 'High Risk'   },
};

const platformColor = {
  AMAZON: 'orange', FLIPKART: 'blue', MEESHO: 'pink',
  MYNTRA: 'purple', SHOPIFY: 'green', OTHER: 'default',
};

// ── Main component ─────────────────────────────────────────────
export default function Recommendations() {
  const [recs,         setRecs]         = useState([]);
  const [activeTab,    setActiveTab]    = useState('ALL');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);
  const [comments,     setComments]     = useState('');
  const [bulkLoading,  setBulkLoading]  = useState(false);

  // ── Fetch recommendations ────────────────────────────────────
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await axiosClient.get('/recommendations');
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.content ?? [];

        if (data.length > 0) {
          const mapped = data.map(r => ({
            id:                 r.id,
            productName:        r.masterProduct?.name || r.productName || 'Unknown',
            platform:           r.marketplaceProduct?.platform || r.platform || 'AMAZON',
            recommendationType: r.recommendationType || 'PRICE_MATCH',
            currentPrice:       r.currentPrice       || 0,
            recommendedPrice:   r.recommendedPrice   || 0,
            minimumSafePrice:   r.minimumSafePrice   || 0,
            lowestMarketPrice:  r.lowestMarketPrice  || 0,
            discountPercent:    r.discountPercent    || 0,
            reason:             r.reason             || '',
            aiExplanation:      r.aiExplanation      || '',
            riskLevel:          r.riskLevel          || 'LOW',
            expectedImpact:     r.expectedImpact     || '',
            durationDays:       r.durationDays       || null,
            status:             r.status             || 'PENDING',
            viewsLast7Days:     r.marketplaceProduct?.viewsLast7Days  || 0,
            ordersLast7Days:    r.marketplaceProduct?.ordersLast7Days || 0,
            stockQuantity:      r.marketplaceProduct?.stockQuantity   || 0,
          }));
          setRecs(mapped);
        } else {
          setRecs([]); // Clear state if no data
        }
      } catch (err) {
        console.error(err);
        setRecs([]); // Clear state on error
      }
    };
    fetchRecs();
  }, []);

  // ── Filtered list ──────────────────────────────────────────
  const filtered = useMemo(() => recs.filter(r => {
    const statusMatch = activeTab === 'ALL' || r.status === activeTab;
    const typeMatch   = !typeFilter || r.recommendationType === typeFilter;
    return statusMatch && typeMatch;
  }), [recs, activeTab, typeFilter]);

  // ── Counts for tabs ────────────────────────────────────────
  const counts = useMemo(() => ({
    ALL:      recs.length,
    PENDING:  recs.filter(r => r.status === 'PENDING').length,
    APPROVED: recs.filter(r => r.status === 'APPROVED').length,
    REJECTED: recs.filter(r => r.status === 'REJECTED').length,
  }), [recs]);

  // ── Status update helper ───────────────────────────────────
  const updateStatus = (id, status) =>
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  // ── Single approve ─────────────────────────────────────────
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

  // ── Single reject ──────────────────────────────────────────
  const handleReject = async (id) => {
    updateStatus(id, 'REJECTED');
    try {
      await axiosClient.patch(`/recommendations/${id}/reject`, { comments });
      notification.info({ message: 'Recommendation Rejected', placement: 'topRight' });
    } catch {
      updateStatus(id, 'PENDING');
      notification.error({ message: 'Rejection failed. Try again.', placement: 'topRight' });
    }
    setRejectModal(null);
    setComments('');
  };

  // ── Bulk approve ───────────────────────────────────────────
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
    { key: 'ALL',     label: <span>All <Badge count={counts.ALL} style={{ background: '#64748b' }} /></span> },
    { key: 'PENDING',  label: <span>Pending <Badge count={counts.PENDING} style={{ background: '#6366f1' }} /></span> },
    { key: 'APPROVED', label: <span>Approved <Badge count={counts.APPROVED} style={{ background: '#10b981' }} /></span> },
    { key: 'REJECTED', label: <span>Rejected <Badge count={counts.REJECTED} style={{ background: '#ef4444' }} /></span> },
  ];

  return (
    <div>
      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            AI Recommendations
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Approve or reject automated pricing optimizations
          </Text>
        </div>
        <Space size="middle">
          {selectedIds.length > 0 && (
            <Button
              type="primary" icon={<ThunderboltOutlined />}
              loading={bulkLoading} onClick={handleBulkApprove}
              style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8 }}
            >
              Approve {selectedIds.length} Selected
            </Button>
          )}
        </Space>
      </div>

      {/* ── Summary stats ─────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Pending',  value: counts.PENDING,  color: '#6366f1', bg: 'rgba(99,102,241,0.06)'  },
          { label: 'Approved', value: counts.APPROVED, color: '#10b981', bg: 'rgba(16,185,129,0.06)'  },
          { label: 'Rejected', value: counts.REJECTED, color: '#ef4444', bg: 'rgba(239,68,68,0.06)'   },
          { label: 'Total',    value: counts.ALL,      color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)'   },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <Card
              style={{ borderRadius: 14, background: s.bg, border: '1px solid rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Statistic
                title={<span style={{ fontWeight: 500, fontSize: 13 }}>{s.label}</span>}
                value={s.value}
                valueStyle={{ color: s.color, fontWeight: 800, fontSize: 26 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Filters bar ───────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, marginBottom: 20, border: '1px solid rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: '0 20px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => { setActiveTab(k); setSelectedIds([]); }}
            items={tabItems}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All Types"
            allowClear
            size="middle"
            style={{ width: 220, margin: '12px 0' }}
            onChange={(v) => setTypeFilter(v || '')}
            options={[
              { label: 'All Types', value: '' },
              ...Object.entries(typeConfig).map(([k, v]) => ({
                label: `${v.icon} ${v.label}`, value: k,
              })),
            ]}
          />
        </div>
      </Card>

      {/* ── Select all bar ────────────────────────────────── */}
      {activeTab === 'PENDING' && pendingInFiltered.length > 0 && (
        <div style={{
          background: '#eff6ff', borderRadius: 8, padding: '8px 16px',
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
              : `Select all ${pendingInFiltered.length} pending`
            }
          </Text>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {filtered.length === 0 && (
        <Card style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
            No recommendations found
          </div>
          <Text type="secondary">
            {activeTab === 'ALL'
              ? 'No AI recommendations available at this time.'
              : `No ${activeTab.toLowerCase()} recommendations.`
            }
          </Text>
        </Card>
      )}

      {/* ── Recommendation cards ──────────────────────────── */}
      {filtered.map(rec => (
        <div key={rec.id} style={{ marginBottom: 16 }}>
          <Card
            style={{
              borderRadius: 14,
              border: rec.riskLevel === 'HIGH' ? '1px solid #fecaca'
                : rec.riskLevel === 'MEDIUM' ? '1px solid #fde68a'
                : '1px solid rgba(0,0,0,0.06)',
              opacity: rec.status !== 'PENDING' ? 0.8 : 1,
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  {rec.status === 'PENDING' && (
                    <Checkbox
                      checked={selectedIds.includes(rec.id)}
                      onChange={() => toggleSelect(rec.id)}
                    />
                  )}
                  <Text style={{ fontSize: 20 }}>
                    {typeConfig[rec.recommendationType]?.icon}
                  </Text>
                  <Title level={5} style={{ margin: 0 }}>{rec.productName}</Title>
                  <Tag color={platformColor[rec.platform] || 'default'}>
                    {rec.platform}
                  </Tag>
                  <Tag color={typeConfig[rec.recommendationType]?.color}>
                    {typeConfig[rec.recommendationType]?.label}
                  </Tag>
                  <Tag color={riskConfig[rec.riskLevel]?.color}>
                    {riskConfig[rec.riskLevel]?.text}
                  </Tag>
                </div>

                <div style={{
                  display: 'flex', gap: 20, flexWrap: 'wrap',
                  background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Current</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>₹{rec.currentPrice}</div>
                  </div>
                  <div style={{ fontSize: 18, color: '#bbb', alignSelf: 'flex-end' }}>→</div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Recommended</div>
                    <div style={{
                      fontSize: 18, fontWeight: 700,
                      color: rec.recommendedPrice < rec.currentPrice ? '#10b981' : '#ef4444',
                    }}>
                      ₹{rec.recommendedPrice}
                      {rec.discountPercent > 0 && <ArrowDownOutlined style={{ fontSize: 12, marginLeft: 4 }} />}
                      {rec.discountPercent < 0 && <ArrowUpOutlined style={{ fontSize: 12, marginLeft: 4 }} />}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Safe Price</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>
                      ₹{rec.minimumSafePrice}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Market Low</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>₹{rec.lowestMarketPrice}</div>
                  </div>
                </div>

                <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                  <SafetyOutlined style={{ marginRight: 4 }} />
                  {rec.reason}
                </Text>

                {rec.aiExplanation && (
                  <Card
                    size="small"
                    style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 10 }}
                  >
                    <Space align="start">
                      <RobotOutlined style={{ color: '#6366f1', fontSize: 16, marginTop: 2 }} />
                      <div>
                        <Text strong style={{ color: '#6366f1', fontSize: 12 }}>
                          AI Analysis (Gemini)
                        </Text>
                        <Paragraph style={{ margin: '4px 0 0', fontSize: 13, color: '#374151' }}>
                          {rec.aiExplanation}
                        </Paragraph>
                      </div>
                    </Space>
                  </Card>
                )}
              </Col>
              <Col xs={24} md={8}>
                <Card
                  size="small"
                  style={{ borderRadius: 10, marginBottom: 12, background: '#fafafa' }}
                >
                  <Row gutter={8}>
                    <Col span={8}>
                      <Statistic title="Views" value={rec.viewsLast7Days} valueStyle={{ fontSize: 16, fontWeight: 700 }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Orders" value={rec.ordersLast7Days} valueStyle={{ fontSize: 16, fontWeight: 700, color: rec.ordersLast7Days === 0 ? '#ef4444' : undefined }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Stock" value={rec.stockQuantity} valueStyle={{ fontSize: 16, fontWeight: 700 }} />
                    </Col>
                  </Row>
                </Card>
                
                {rec.status === 'PENDING' && (
                  <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                    <Button type="primary" icon={<CheckOutlined />} block onClick={() => setApproveModal(rec)} style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 40, fontWeight: 600 }}>Approve</Button>
                    <Button danger icon={<CloseOutlined />} block onClick={() => setRejectModal(rec)} style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>Reject</Button>
                  </Space>
                )}
              </Col>
            </Row>
          </Card>
        </div>
      ))}

      {/* ── Modals ─────────────────────────────────────────── */}
      <Modal open={!!approveModal} onOk={() => handleApprove(approveModal?.id)} onCancel={() => { setApproveModal(null); setComments(''); }}>
        <TextArea placeholder="Optional comments..." value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
      </Modal>
      <Modal open={!!rejectModal} onOk={() => handleReject(rejectModal?.id)} onCancel={() => { setRejectModal(null); setComments(''); }}>
        <TextArea placeholder="Reason for rejection..." value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
      </Modal>
    </div>
  );
}