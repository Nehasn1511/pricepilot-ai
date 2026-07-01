import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Tag,
  Empty,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  AmazonOutlined,
  ShoppingCartOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PLATFORM_CONFIG = {
  AMAZON: {
    label: 'Amazon',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    Icon: AmazonOutlined,
  },
  FLIPKART: {
    label: 'Flipkart',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    Icon: ShoppingCartOutlined,
  },
  MEESHO: {
    label: 'Meesho',
    color: '#db2777',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    Icon: ShopOutlined,
  },
};

const mockAccounts = [
  {
    id: 1,
    platform: 'AMAZON',
    accountName: 'My Amazon Store',
    isActive: true,
    createdAt: '2025-01-01',
    lastSync: '2026-06-01T10:30:00',
  },
  {
    id: 2,
    platform: 'FLIPKART',
    accountName: 'My Flipkart Shop',
    isActive: true,
    createdAt: '2025-01-05',
    lastSync: '2026-06-01T09:15:00',
  },
  {
    id: 3,
    platform: 'MEESHO',
    accountName: 'Meesho Boutique',
    isActive: false,
    createdAt: '2025-01-10',
    lastSync: null,
  },
];

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatSyncTime = (value) => {
  if (!value) return 'Never synced';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function AccountCard({ account, onSync }) {
  const platform = PLATFORM_CONFIG[account.platform] || PLATFORM_CONFIG.AMAZON;
  const PlatformIcon = platform.Icon;

  return (
    <Card className="marketplace-card" bordered={false}>
      <div className="account-card-header">
        <Space size="middle" align="start">
          <div
            className="platform-icon"
            style={{
              color: platform.color,
              background: platform.bg,
              borderColor: platform.border,
            }}
          >
            <PlatformIcon />
          </div>

          <div>
            <Text className="platform-name">{platform.label}</Text>
            <Text className="store-name">{account.accountName}</Text>
          </div>
        </Space>

        <Tag
          className={`status-tag ${
            account.isActive ? 'status-connected' : 'status-disconnected'
          }`}
          icon={account.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {account.isActive ? 'Connected' : 'Disconnected'}
        </Tag>
      </div>

      <div className="account-meta">
        <div className="meta-row">
          <span className="meta-label">Added</span>
          <span className="meta-value">{formatDate(account.createdAt)}</span>
        </div>

        <div className="meta-row">
          <span className="meta-label">Last Sync</span>
          <span className="meta-value">{formatSyncTime(account.lastSync)}</span>
        </div>
      </div>

      <Button
        block
        icon={<SyncOutlined />}
        onClick={() => onSync(account.id)}
        disabled={!account.isActive}
        className={account.isActive ? 'sync-btn' : 'sync-btn disabled'}
      >
        Sync Now
      </Button>
    </Card>
  );
}

export default function MarketplaceAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAccounts(mockAccounts);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleSync = (id) => {
    setSyncingId(id);

    message.loading({
      content: 'Syncing marketplace...',
      key: 'sync',
    });

    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id
            ? {
                ...acc,
                lastSync: new Date().toISOString(),
              }
            : acc
        )
      );

      message.success({
        content: 'Marketplace synced successfully',
        key: 'sync',
      });

      setSyncingId(null);
    }, 1500);
  };

  const handleAdd = (values) => {
    const newAccount = {
      id: Date.now(),
      platform: values.platform,
      accountName: values.accountName,
      isActive: false,
      createdAt: new Date().toISOString(),
      lastSync: null,
    };

    setAccounts((prev) => [...prev, newAccount]);
    message.success('Marketplace account added');
    form.resetFields();
    setOpen(false);
  };

  const connectedCount = accounts.filter((account) => account.isActive).length;
  const disconnectedCount = accounts.length - connectedCount;

  return (
    <div className="marketplace-page">
      <Card className="marketplace-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <GlobalOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                Marketplace Accounts
              </Title>
              <Text className="page-subtitle">
                Manage connected store accounts and synchronize marketplace data.
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            className="primary-btn"
          >
            Connect Marketplace
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon total">
              <ShopOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Total Accounts</span>}
              value={accounts.length}
              valueStyle={{
                fontWeight: 900,
                color: '#0f172a',
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon connected">
              <CheckCircleOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Connected</span>}
              value={connectedCount}
              valueStyle={{
                fontWeight: 900,
                color: '#0f172a',
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon disconnected">
              <CloseCircleOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Disconnected</span>}
              value={disconnectedCount}
              valueStyle={{
                fontWeight: 900,
                color: '#0f172a',
              }}
            />
          </Card>
        </Col>
      </Row>

      {accounts.length === 0 && !loading ? (
        <Card className="empty-card" bordered={false}>
          <Empty
            image={<ShopOutlined style={{ fontSize: 46, color: '#94a3b8' }} />}
            description="No marketplace accounts connected yet"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              className="primary-btn"
            >
              Connect Marketplace
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {accounts.map((account) => (
            <Col xs={24} md={12} xl={8} key={account.id}>
              <AccountCard
                account={{
                  ...account,
                  syncing: syncingId === account.id,
                }}
                onSync={handleSync}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon">
              <LinkOutlined />
            </div>

            <div>
              <Title level={4}>Connect New Marketplace</Title>
              <Text>Add a store account to sync marketplace pricing data.</Text>
            </div>
          </div>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Connect"
        cancelText="Cancel"
        okButtonProps={{
          type: 'primary',
          size: 'large',
          className: 'primary-btn',
        }}
        cancelButtonProps={{
          size: 'large',
          className: 'secondary-btn',
        }}
        centered
        width={520}
        styles={{
          content: {
            borderRadius: 22,
            padding: '28px 32px',
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          className="marketplace-form"
        >
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: 'Please select a platform' }]}
          >
            <Select
              size="large"
              placeholder="Select marketplace"
              className="form-select"
              options={[
                {
                  value: 'AMAZON',
                  label: 'Amazon',
                },
                {
                  value: 'FLIPKART',
                  label: 'Flipkart',
                },
                {
                  value: 'MEESHO',
                  label: 'Meesho',
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Store Name"
            rules={[{ required: true, message: 'Please enter a store name' }]}
          >
            <Input
              size="large"
              placeholder="e.g. My Amazon Store"
              prefix={<ShopOutlined />}
              className="form-input"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .marketplace-page {
          width: 100%;
        }

        .marketplace-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .marketplace-hero .ant-card-body {
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

        .primary-btn {
          height: 42px !important;
          border-radius: 11px !important;
          background: #2563eb !important;
          border-color: #2563eb !important;
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
          font-weight: 800 !important;
        }

        .primary-btn:hover {
          background: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
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

        .stat-icon.connected {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-icon.disconnected {
          color: #dc2626;
          background: #fef2f2;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .marketplace-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          transition: all 0.2s ease;
          height: 100%;
        }

        .marketplace-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 52px rgba(15, 23, 42, 0.09);
        }

        .marketplace-card .ant-card-body {
          padding: 24px !important;
        }

        .account-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 22px;
        }

        .platform-icon {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
        }

        .platform-name {
          display: block;
          color: #0f172a !important;
          font-size: 16px;
          font-weight: 900;
        }

        .store-name {
          display: block;
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
          margin-top: 3px;
        }

        .status-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin: 0;
          flex-shrink: 0;
        }

        .status-connected {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .status-disconnected {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .account-meta {
          display: grid;
          gap: 10px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .meta-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .meta-value {
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
          text-align: right;
        }

        .sync-btn {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
          font-weight: 800 !important;
          background: #ffffff !important;
        }

        .sync-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
        }

        .sync-btn.disabled {
          color: #cbd5e1 !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }

        .empty-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          padding: 34px;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-title-wrap h4 {
          margin: 0 0 2px !important;
          color: #0f172a !important;
          font-weight: 900 !important;
        }

        .modal-title-wrap span {
          color: #64748b !important;
          font-size: 13px;
        }

        .modal-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .marketplace-form {
          margin-top: 26px;
        }

        .marketplace-form .ant-form-item-label > label {
          color: #0f172a;
          font-weight: 800;
          font-size: 13px;
        }

        .form-input,
        .form-select .ant-select-selector {
          height: 46px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
        }

        .form-input:hover,
        .form-select:hover .ant-select-selector {
          border-color: #93c5fd !important;
        }

        .form-input:focus,
        .form-input-focused,
        .form-select.ant-select-focused .ant-select-selector {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .form-input .anticon {
          color: #64748b;
          margin-right: 4px;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-left {
            align-items: flex-start;
          }

          .primary-btn {
            width: 100%;
          }

          .account-card-header {
            flex-direction: column;
          }

          .status-tag {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}