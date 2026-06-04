import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Select, Input, Button,
  Typography, Space, Row, Col, DatePicker, Badge
} from 'antd';
import {
  FilterOutlined, ClearOutlined, AuditOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  EditOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Demo data — shown when API returns empty
const generateMockData = () => {
  const actions = [
    { action: 'RECOMMENDATION_APPROVED', entity: 'Recommendation', color: 'success',  icon: <CheckCircleOutlined />, desc: 'Approved price change for Wireless Keyboard Pro' },
    { action: 'RECOMMENDATION_REJECTED', entity: 'Recommendation', color: 'error',    icon: <CloseCircleOutlined />, desc: 'Rejected price change for USB-C Hub 7-in-1' },
    { action: 'PRICE_CHANGE',            entity: 'Product',        color: 'blue',     icon: <EditOutlined />,        desc: 'Price updated from ₹1499 to ₹1299 on Amazon' },
    { action: 'PRODUCT_CREATED',         entity: 'Product',        color: 'purple',   icon: <PlusOutlined />,        desc: 'Added new product: Samsung 25W Charger' },
    { action: 'RECOMMENDATION_APPROVED', entity: 'Recommendation', color: 'success',  icon: <CheckCircleOutlined />, desc: 'Approved stock clearance for Phone Case Clear' },
    { action: 'PRICE_CHANGE',            entity: 'Product',        color: 'blue',     icon: <EditOutlined />,        desc: 'Price updated from ₹899 to ₹944 on Amazon' },
    { action: 'PRODUCT_CREATED',         entity: 'Product',        color: 'purple',   icon: <PlusOutlined />,        desc: 'Imported 5 products via CSV' },
    { action: 'RECOMMENDATION_REJECTED', entity: 'Recommendation', color: 'error',    icon: <CloseCircleOutlined />, desc: 'Rejected margin protection for boAt Rockerz' },
  ];

  return actions.map((item, idx) => ({
    id:          idx + 1,
    action:      item.action,
    entityType:  item.entity,
    entityId:    idx + 1,
    performedBy: 'demo@pricepilot.com',
    description: item.desc,
    color:       item.color,
    icon:        item.icon,
    createdAt:   new Date(Date.now() - idx * 1800000).toISOString(),
  }));
};

const ACTION_OPTIONS = [
  { label: 'All Actions',              value: ''                      },
  { label: 'Recommendation Approved',  value: 'RECOMMENDATION_APPROVED' },
  { label: 'Recommendation Rejected',  value: 'RECOMMENDATION_REJECTED' },
  { label: 'Price Change',             value: 'PRICE_CHANGE'          },
  { label: 'Product Created',          value: 'PRODUCT_CREATED'       },
  { label: 'Product Updated',          value: 'PRODUCT_UPDATED'       },
];

const ACTION_COLOR = {
  RECOMMENDATION_APPROVED: 'success',
  RECOMMENDATION_REJECTED: 'error',
  PRICE_CHANGE:            'blue',
  PRODUCT_CREATED:         'purple',
  PRODUCT_UPDATED:         'orange',
  DEFAULT:                 'default',
};

export default function AuditLog() {
  const [logs,       setLogs]       = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [action,     setAction]     = useState('');
  const [email,      setEmail]      = useState('');
  const [usingMock,  setUsingMock]  = useState(false);

  // ── Fetch audit logs ──────────────────────────────────
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/audit-log');
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.content ?? res.data.logs ?? [];

        if (data.length === 0) {
          // API returned empty — use mock data for demo
          const mock = generateMockData();
          setLogs(mock);
          setFiltered(mock);
          setUsingMock(true);
        } else {
          // Real data — map fields
          const mapped = data.map(log => ({
            id:          log.id,
            action:      log.action       || log.actionType || 'ACTION',
            entityType:  log.entityType   || '—',
            entityId:    log.entityId     || '—',
            performedBy: log.performedBy  || log.userEmail || '—',
            description: log.description  || log.details   || '—',
            color:       ACTION_COLOR[log.action] || ACTION_COLOR.DEFAULT,
            createdAt:   log.createdAt    || log.timestamp  || new Date().toISOString(),
          }));
          setLogs(mapped);
          setFiltered(mapped);
          setUsingMock(false);
        }
      } catch {
        // 403 or network error — use mock data
        const mock = generateMockData();
        setLogs(mock);
        setFiltered(mock);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // ── Apply filters ─────────────────────────────────────
  const handleFilter = () => {
    let result = [...logs];
    if (action) result = result.filter(l => l.action === action);
    if (email)  result = result.filter(l =>
      l.performedBy?.toLowerCase().includes(email.toLowerCase())
    );
    setFiltered(result);
  };

  const handleClear = () => {
    setAction('');
    setEmail('');
    setFiltered(logs);
  };

  // ── Table columns ─────────────────────────────────────
  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      width: 160,
      render: (t) => (
        <Text style={{ fontSize: 12, color: '#888' }}>
          {t ? new Date(t).toLocaleString('en-IN', {
            day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit',
          }) : '—'}
        </Text>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (a) => (
        <Tag
          color={ACTION_COLOR[a] || 'default'}
          style={{ borderRadius: 6, fontWeight: 500, fontSize: 11 }}
        >
          {a?.replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'by',
      width: 200,
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#6366f1', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <Text style={{ fontSize: 12 }}>{email}</Text>
        </div>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entity',
      width: 130,
      render: (e) => (
        <Tag style={{ borderRadius: 6, fontSize: 11 }}>{e}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'desc',
      render: (d) => (
        <Text style={{ fontSize: 13 }}>{d}</Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Space>
            <Title level={3} style={{ margin: 0 }}>
              <AuditOutlined style={{ marginRight: 8, color: '#6366f1' }} />
              Audit Log
            </Title>
            {usingMock && (
              <Tag color="orange" style={{ borderRadius: 6, fontSize: 11 }}>
                Demo Data
              </Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Track all pricing actions and system events
          </Text>
        </div>

        {/* Stats */}
        <Space size={12}>
          {[
            { label: 'Total Events', value: logs.length,    color: '#6366f1' },
            { label: 'Approvals',    value: logs.filter(l => l.action?.includes('APPROVED')).length, color: '#22c55e' },
            { label: 'Price Changes',value: logs.filter(l => l.action === 'PRICE_CHANGE').length,    color: '#3b82f6' },
          ].map(s => (
            <Card key={s.label} size="small" style={{ borderRadius: 10, minWidth: 90, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#888' }}>{s.label}</div>
            </Card>
          ))}
        </Space>
      </div>

      {/* Filter bar */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              value={action}
              onChange={setAction}
              style={{ width: '100%' }}
              placeholder="Filter by action"
              options={ACTION_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Filter by email"
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Space>
              <Button
                type="primary" icon={<FilterOutlined />}
                onClick={handleFilter} style={{ borderRadius: 8 }}
              >
                Apply Filter
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear} style={{ borderRadius: 8 }}
              >
                Clear
              </Button>
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Showing {filtered.length} of {logs.length} events
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Audit table */}
      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} events`,
            showSizeChanger: true,
          }}
          style={{ borderRadius: 16, overflow: 'hidden' }}
          locale={{
            emptyText: (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
                  No audit events yet
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  Perform actions like approving recommendations to see events here.
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}