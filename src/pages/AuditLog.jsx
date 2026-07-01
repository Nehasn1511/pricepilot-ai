import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Alert,
  Empty,
  Tooltip,
  Avatar,
  Badge,
  notification,
} from 'antd';
import {
  FilterOutlined,
  ClearOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const getTenantId = () => localStorage.getItem('tenantId') || 1;

const getArrayData = (res) => {
  if (Array.isArray(res.data)) return res.data;
  return res.data?.content || [];
};

const firstValue = (...values) => {
  return values.find((value) => value !== undefined && value !== null && value !== '');
};

const ACTION_OPTIONS = [
  { label: 'All Actions', value: '' },
  { label: 'Recommendation Generated', value: 'RECOMMENDATION_GENERATED' },
  { label: 'Recommendation Approved', value: 'RECOMMENDATION_APPROVED' },
  { label: 'Recommendation Rejected', value: 'RECOMMENDATION_REJECTED' },
  { label: 'Recommendation Applied', value: 'RECOMMENDATION_APPLIED' },
  { label: 'Price Change', value: 'PRICE_CHANGE' },
  { label: 'Product Created', value: 'PRODUCT_CREATED' },
  { label: 'Product Updated', value: 'PRODUCT_UPDATED' },
];

const ACTION_META = {
  RECOMMENDATION_GENERATED: {
    className: 'action-generated',
    icon: <ThunderboltOutlined />,
    label: 'Generated',
  },
  RECOMMENDATION_APPROVED: {
    className: 'action-approved',
    icon: <CheckCircleOutlined />,
    label: 'Approved',
  },
  RECOMMENDATION_REJECTED: {
    className: 'action-rejected',
    icon: <CloseCircleOutlined />,
    label: 'Rejected',
  },
  RECOMMENDATION_APPLIED: {
    className: 'action-applied',
    icon: <SafetyCertificateOutlined />,
    label: 'Applied',
  },
  PRICE_CHANGE: {
    className: 'action-price',
    icon: <EditOutlined />,
    label: 'Price Change',
  },
  PRODUCT_CREATED: {
    className: 'action-created',
    icon: <PlusOutlined />,
    label: 'Created',
  },
  PRODUCT_UPDATED: {
    className: 'action-updated',
    icon: <EditOutlined />,
    label: 'Updated',
  },
  DEFAULT: {
    className: 'action-default',
    icon: <FileTextOutlined />,
    label: 'Event',
  },
};

const ENTITY_META = {
  Recommendation: {
    className: 'entity-recommendation',
    icon: <ThunderboltOutlined />,
  },
  Product: {
    className: 'entity-product',
    icon: <ShoppingOutlined />,
  },
  Listing: {
    className: 'entity-listing',
    icon: <DatabaseOutlined />,
  },
  User: {
    className: 'entity-user',
    icon: <UserOutlined />,
  },
  System: {
    className: 'entity-system',
    icon: <DatabaseOutlined />,
  },
};

const avatarColors = ['#2563eb', '#059669', '#7c3aed', '#ea580c', '#db2777'];

const formatCurrency = (value) => {
  const num = Number(value || 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatTime = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitial = (email) => {
  return email?.charAt(0)?.toUpperCase() || 'U';
};

const formatActionName = (actionName) => {
  return actionName?.replaceAll('_', ' ') || 'SYSTEM EVENT';
};

const normalizeAuditLog = (log) => ({
  id: log.id,
  action: firstValue(log.action, log.eventType, 'SYSTEM_EVENT'),
  entityType: firstValue(log.entityType, log.entity, 'System'),
  entityId: firstValue(log.entityId, log.referenceId, null),
  performedBy: firstValue(
    log.performedBy,
    log.userEmail,
    log.actorEmail,
    'system@pricepilot.ai'
  ),
  description: firstValue(log.description, log.message, 'System activity recorded.'),
  createdAt: firstValue(log.createdAt, log.timestamp, log.date, new Date().toISOString()),
});

const convertRecommendationToAudit = (rec, index) => {
  const productName = firstValue(
    rec.productName,
    rec.masterProductName,
    rec.product?.name,
    rec.masterProduct?.name,
    rec.masterProductId ? `Product #${rec.masterProductId}` : 'Product'
  );

  const status = firstValue(rec.status, 'PENDING');

  let action = 'RECOMMENDATION_GENERATED';

  if (status === 'APPROVED') {
    action = 'RECOMMENDATION_APPROVED';
  } else if (status === 'REJECTED') {
    action = 'RECOMMENDATION_REJECTED';
  } else if (status === 'APPLIED') {
    action = 'RECOMMENDATION_APPLIED';
  }

  const type = firstValue(rec.recommendationType, rec.type, 'PRICE_RECOMMENDATION')
    ?.replaceAll('_', ' ');

  const currentPrice = formatCurrency(rec.currentPrice);
  const recommendedPrice = formatCurrency(rec.recommendedPrice);

  return {
    id: `rec-${rec.id || index}`,
    action,
    entityType: 'Recommendation',
    entityId: rec.id,
    performedBy: 'system@pricepilot.ai',
    description: `${type} generated for ${productName}: ${currentPrice} → ${recommendedPrice}`,
    createdAt: firstValue(
      rec.createdAt,
      rec.updatedAt,
      new Date(Date.now() - index * 1800000).toISOString()
    ),
  };
};

const convertProductToAudit = (product, index) => ({
  id: `product-${product.id || index}`,
  action: 'PRODUCT_CREATED',
  entityType: 'Product',
  entityId: product.id,
  performedBy: 'admin@pricepilot.ai',
  description: `Product added: ${firstValue(
    product.name,
    product.productName,
    `Product #${product.id}`
  )}`,
  createdAt: firstValue(
    product.createdAt,
    new Date(Date.now() - (index + 20) * 1800000).toISOString()
  ),
});

export default function AuditLog() {
  const [notificationApi, contextHolder] = notification.useNotification();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [email, setEmail] = useState('');
  const [entity, setEntity] = useState('');
  const [source, setSource] = useState('backend');
  const [apiError, setApiError] = useState('');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setApiError('');

      const tenantId = getTenantId();

      try {
        const auditRes = await axiosClient.get('/audit-logs', {
          params: { tenantId },
        });

        const auditRows = getArrayData(auditRes).map(normalizeAuditLog);

        if (auditRows.length > 0) {
          setLogs(auditRows);
          setSource('audit-api');
          return;
        }
      } catch {
        console.log('Audit API not available. Building audit trail from existing backend data.');
      }

      const [recommendationsRes, productsRes] = await Promise.allSettled([
        axiosClient.get('/recommendations', {
          params: { tenantId },
        }),
        axiosClient.get('/products', {
          params: { tenantId },
        }),
      ]);

      const recommendationRows =
        recommendationsRes.status === 'fulfilled'
          ? getArrayData(recommendationsRes.value)
          : [];

      const productRows =
        productsRes.status === 'fulfilled'
          ? getArrayData(productsRes.value)
          : [];

      const recommendationLogs = recommendationRows.map(convertRecommendationToAudit);
      const productLogs = productRows.map(convertProductToAudit);

      const generatedLogs = [...recommendationLogs, ...productLogs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setLogs(generatedLogs);
      setSource(generatedLogs.length > 0 ? 'generated' : 'empty');
    } catch (error) {
      console.error('Audit log load error:', error.response?.data || error.message);

      setApiError('Failed to load audit log. Please check the backend API.');
      setLogs([]);
      setSource('empty');

      notificationApi.error({
        message: 'Failed to load audit log',
        description: 'Check backend API and console.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = !action || log.action === action;

      const matchesEmail =
        !email ||
        log.performedBy?.toLowerCase().includes(email.toLowerCase()) ||
        log.description?.toLowerCase().includes(email.toLowerCase());

      const matchesEntity = !entity || log.entityType === entity;

      return matchesAction && matchesEmail && matchesEntity;
    });
  }, [logs, action, email, entity]);

  const stats = useMemo(() => {
    const approvals = logs.filter((log) => log.action?.includes('APPROVED')).length;
    const rejections = logs.filter((log) => log.action?.includes('REJECTED')).length;
    const generated = logs.filter((log) => log.action?.includes('GENERATED')).length;
    const productEvents = logs.filter((log) => log.entityType === 'Product').length;

    return {
      total: logs.length,
      approvals,
      rejections,
      generated,
      productEvents,
    };
  }, [logs]);

  const entityOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((log) => log.entityType).filter(Boolean)));

    return [
      { label: 'All Entities', value: '' },
      ...unique.map((item) => ({
        label: item,
        value: item,
      })),
    ];
  }, [logs]);

  const activeFilterCount = [action, email, entity].filter(Boolean).length;

  const handleClear = () => {
    setAction('');
    setEmail('');
    setEntity('');
  };

  const sourceConfig = {
    'audit-api': {
      label: 'Live audit API',
      className: 'source-live',
    },
    generated: {
      label: 'Generated from backend data',
      className: 'source-generated',
    },
    empty: {
      label: 'No events found',
      className: 'source-empty',
    },
    backend: {
      label: 'Backend source',
      className: 'source-generated',
    },
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      width: 210,
      render: (time) => (
        <div className="time-cell">
          <ClockCircleOutlined />
          <div>
            <Text className="time-main">{formatTime(time)}</Text>
            <Text className="time-sub">Activity timestamp</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 240,
      render: (actionName) => {
        const meta = ACTION_META[actionName] || ACTION_META.DEFAULT;

        return (
          <Tag className={`audit-action-tag ${meta.className}`} icon={meta.icon}>
            {formatActionName(actionName)}
          </Tag>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'by',
      width: 250,
      render: (userEmail) => {
        const colorIndex = (userEmail?.charCodeAt(0) || 0) % avatarColors.length;

        return (
          <Space size="middle">
            <Avatar
              size={38}
              style={{
                background: avatarColors[colorIndex],
                fontWeight: 800,
              }}
            >
              {getInitial(userEmail)}
            </Avatar>

            <div>
              <Text className="actor-email">{userEmail}</Text>
              <div>
                <Text className="actor-role">PricePilot user</Text>
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entity',
      width: 170,
      render: (entityName, record) => {
        const meta = ENTITY_META[entityName] || ENTITY_META.System;

        return (
          <Space direction="vertical" size={4}>
            <Tag className={`entity-tag ${meta.className}`} icon={meta.icon}>
              {entityName}
            </Tag>

            {record.entityId && (
              <Text className="entity-id">
                ID: {record.entityId}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'desc',
      render: (description) => (
        <Text className="description-text">
          {description}
        </Text>
      ),
    },
  ];

  return (
    <div className="audit-page">
      {contextHolder}

      <Card className="audit-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <AuditOutlined />
            </div>

            <div>
              <Space wrap size={10}>
                <Title level={3} className="page-title">
                  Audit Log
                </Title>

                <Tag
                  className={`source-tag ${sourceConfig[source]?.className || 'source-generated'}`}
                >
                  {sourceConfig[source]?.label || 'Backend source'}
                </Tag>
              </Space>

              <Text className="page-subtitle">
                Track recommendation approvals, product changes, and system activity.
              </Text>
            </div>
          </div>

          <Tooltip title="Refresh audit data">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadAuditLogs}
              loading={loading}
              className="secondary-btn"
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      </Card>

      {apiError && (
        <Alert
          type="error"
          showIcon
          message={apiError}
          className="audit-alert"
        />
      )}

      <Row gutter={[16, 16]} className="stats-row">
        {[
          {
            label: 'Total Events',
            value: stats.total,
            icon: <DatabaseOutlined />,
            className: 'total',
          },
          {
            label: 'Generated',
            value: stats.generated,
            icon: <ThunderboltOutlined />,
            className: 'generated',
          },
          {
            label: 'Approvals',
            value: stats.approvals,
            icon: <CheckCircleOutlined />,
            className: 'approved',
          },
          {
            label: 'Rejections',
            value: stats.rejections,
            icon: <CloseCircleOutlined />,
            className: 'rejected',
          },
        ].map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.label}>
            <Card className="stat-card" bordered={false}>
              <div className={`stat-icon ${item.className}`}>
                {item.icon}
              </div>

              <Statistic
                title={<span className="stat-label">{item.label}</span>}
                value={item.value}
                valueStyle={{
                  fontWeight: 900,
                  fontSize: 28,
                  color: '#0f172a',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="filter-card" bordered={false}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              value={action}
              onChange={setAction}
              className="modern-select"
              size="large"
              placeholder="Filter by action"
              options={ACTION_OPTIONS}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              value={entity}
              onChange={setEntity}
              className="modern-select"
              size="large"
              placeholder="Filter by entity"
              options={entityOptions}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Search by email or description"
              allowClear
              size="large"
              prefix={<UserOutlined />}
              className="modern-input"
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClear}
              disabled={activeFilterCount === 0}
              className="clear-btn"
              block
            >
              Clear
            </Button>
          </Col>
        </Row>

        <div className="filter-footer">
          <Badge
            color="#2563eb"
            text={
              <Text className="filter-summary">
                Showing <Text strong>{filtered.length}</Text> of{' '}
                <Text strong>{logs.length}</Text> events
              </Text>
            }
          />

          {activeFilterCount > 0 && (
            <Tag className="active-filter-tag" icon={<FilterOutlined />}>
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </Tag>
          )}
        </div>
      </Card>

      <Card className="audit-table-card" bordered={false}>
        <div className="table-heading">
          <div>
            <Title level={4}>Activity Timeline</Title>
            <Text>Complete record of pricing and product-related activity.</Text>
          </div>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} event(s)`,
            showSizeChanger: true,
          }}
          scroll={{ x: 1050 }}
          className="audit-table"
          locale={{
            emptyText: (
              <Empty
                image={
                  <FileTextOutlined
                    style={{
                      fontSize: 42,
                      color: '#94a3b8',
                    }}
                  />
                }
                description="No audit events found"
              />
            ),
          }}
        />
      </Card>

      <style>{`
        .audit-page {
          width: 100%;
        }

        .audit-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .audit-hero .ant-card-body {
          padding: 26px 28px !important;
          background: #ffffff;
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .page-title {
          margin: 0 !important;
          color: #0f172a !important;
          font-weight: 900 !important;
          letter-spacing: -0.4px;
        }

        .page-subtitle {
          color: #64748b !important;
          font-size: 14px;
        }

        .source-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
        }

        .source-live {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .source-generated {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .source-empty {
          color: #64748b;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .secondary-btn {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
          font-weight: 800 !important;
        }

        .secondary-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
        }

        .audit-alert {
          margin-bottom: 18px;
          border-radius: 14px !important;
        }

        .stats-row {
          margin-bottom: 20px;
        }

        .stat-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
        }

        .stat-card .ant-card-body {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px !important;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .stat-icon.total {
          color: #2563eb;
          background: #eff6ff;
        }

        .stat-icon.generated {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .stat-icon.approved {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-icon.rejected {
          color: #dc2626;
          background: #fef2f2;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .filter-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 20px;
        }

        .filter-card .ant-card-body {
          padding: 20px !important;
        }

        .modern-select {
          width: 100%;
        }

        .modern-select .ant-select-selector,
        .modern-input {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }

        .modern-input .anticon {
          color: #64748b;
        }

        .modern-select:hover .ant-select-selector,
        .modern-input:hover {
          border-color: #93c5fd !important;
        }

        .modern-select.ant-select-focused .ant-select-selector,
        .modern-input:focus,
        .modern-input-focused {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .clear-btn {
          height: 42px !important;
          border-radius: 11px !important;
          font-weight: 800 !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
        }

        .clear-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
        }

        .filter-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .filter-summary {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
        }

        .active-filter-tag {
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 11px;
        }

        .audit-table-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .audit-table-card .ant-card-body {
          padding: 0 !important;
        }

        .table-heading {
          padding: 22px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .table-heading h4 {
          margin: 0 0 4px !important;
          color: #0f172a !important;
          font-weight: 900 !important;
        }

        .table-heading span {
          color: #64748b !important;
          font-size: 13px;
        }

        .audit-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 900 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .audit-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 17px 16px !important;
        }

        .audit-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .time-cell {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .time-cell .anticon {
          color: #64748b;
          margin-top: 3px;
        }

        .time-main {
          display: block;
          color: #0f172a !important;
          font-size: 13px;
          font-weight: 800;
        }

        .time-sub {
          display: block;
          color: #94a3b8 !important;
          font-size: 11px;
          font-weight: 600;
          margin-top: 2px;
        }

        .actor-email {
          color: #0f172a !important;
          font-size: 13px;
          font-weight: 800;
        }

        .actor-role {
          color: #64748b !important;
          font-size: 11px;
          font-weight: 600;
        }

        .entity-id {
          color: #94a3b8 !important;
          font-size: 11px;
          font-weight: 700;
        }

        .description-text {
          color: #334155 !important;
          font-size: 13px;
          font-weight: 500;
        }

        .audit-action-tag,
        .entity-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
        }

        .action-generated {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .action-approved {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .action-rejected {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .action-applied {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .action-price {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .action-created {
          color: #0891b2;
          background: #ecfeff;
          border-color: #a5f3fc;
        }

        .action-updated {
          color: #ea580c;
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .action-default {
          color: #475569;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .entity-recommendation {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .entity-product {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .entity-listing {
          color: #ea580c;
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .entity-user {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .entity-system {
          color: #475569;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .ant-pagination-item-active {
          border-color: #2563eb !important;
        }

        .ant-pagination-item-active a {
          color: #2563eb !important;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-left {
            align-items: flex-start;
          }

          .secondary-btn {
            width: 100%;
          }

          .page-title {
            font-size: 22px !important;
          }

          .filter-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .audit-table-card {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}