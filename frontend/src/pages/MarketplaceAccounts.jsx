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
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const PLATFORM_CONFIG = {
  AMAZON: {
    label: 'Amazon',
    color: '#fa8c16',
    bg: '#fff7e6',
    emoji: '🟠',
  },
  FLIPKART: {
    label: 'Flipkart',
    color: '#1677ff',
    bg: '#e6f4ff',
    emoji: '🔵',
  },
  MEESHO: {
    label: 'Meesho',
    color: '#eb2f96',
    bg: '#fff0f6',
    emoji: '🩷',
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

function AccountCard({ account, onSync }) {
  const platform = PLATFORM_CONFIG[account.platform] || PLATFORM_CONFIG.AMAZON;

  return (
    <Card 
      className="ai-glow-card" 
      styles={{ body: { padding: '24px' } }}
      style={{ border: 'none' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <Space size="middle">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: platform.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            {platform.emoji}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
              {platform.label}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {account.accountName}
            </Text>
          </div>
        </Space>

        {/* Replaced Ant Tag with Custom Premium Badges */}
        <span 
          className={`badge ${account.isActive ? 'badge-success' : 'badge-error'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {account.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {account.isActive ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          <span style={{ color: '#94a3b8', marginRight: 8 }}>Added:</span>
          <span style={{ fontWeight: 500, color: '#475569' }}>
            {new Date(account.createdAt).toLocaleDateString('en-IN')}
          </span>
        </Text>
        
        <Text type="secondary" style={{ fontSize: 13 }}>
          <span style={{ color: '#94a3b8', marginRight: 8 }}>Last Sync:</span>
          <span style={{ fontWeight: 500, color: '#475569' }}>
            {account.lastSync
              ? new Date(account.lastSync).toLocaleString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short'
                })
              : 'Never'}
          </span>
        </Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Button
          block
          icon={<SyncOutlined />}
          onClick={() => onSync(account.id)}
          disabled={!account.isActive}
          style={{ 
            borderRadius: 8, 
            height: 38,
            fontWeight: 600,
            background: account.isActive ? 'transparent' : '#f8fafc',
            borderColor: '#e2e8f0',
            color: account.isActive ? '#475569' : '#cbd5e1'
          }}
        >
          Sync Now
        </Button>
      </div>
    </Card>
  );
}

export default function MarketplaceAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    axiosClient
      .get('/marketplace-accounts')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.content || [];

        setAccounts(data.length ? data : mockAccounts);
      })
      .catch(() => {
        setAccounts(mockAccounts);
      });
  }, []);

  const handleSync = (id) => {
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

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Marketplace Accounts
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Manage your connected store accounts
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Connect Marketplace
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {accounts.map((account) => (
          <Col xs={24} md={12} xl={8} key={account.id}>
            <AccountCard account={account} onSync={handleSync} />
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Connect New Marketplace
          </span>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Connect"
        cancelText="Cancel"
        okButtonProps={{ type: 'primary', size: 'large' }}
        cancelButtonProps={{ size: 'large' }}
        centered
        styles={{
          content: { borderRadius: 16, padding: '24px 32px' }
        }}
      >
        <div style={{ marginTop: 24 }}>
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <Form.Item
              name="platform"
              label={<span style={{ fontWeight: 500 }}>Platform</span>}
              rules={[{ required: true, message: 'Please select a platform' }]}
            >
              <Select size="large" placeholder="Select marketplace">
                <Select.Option value="AMAZON">Amazon</Select.Option>
                <Select.Option value="FLIPKART">Flipkart</Select.Option>
                <Select.Option value="MEESHO">Meesho</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="accountName"
              label={<span style={{ fontWeight: 500 }}>Store Name</span>}
              rules={[{ required: true, message: 'Please enter a store name' }]}
              style={{ marginBottom: 8 }}
            >
              <Input size="large" placeholder="e.g., My Amazon Store" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}