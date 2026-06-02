import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
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
  const platform =
    PLATFORM_CONFIG[account.platform] || PLATFORM_CONFIG.AMAZON;

  return (
    <Card style={{ borderRadius: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <Space>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              background: platform.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            {platform.emoji}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {platform.label}
            </div>

            <Text type="secondary">{account.accountName}</Text>
          </div>
        </Space>

        <Tag
          color={account.isActive ? 'success' : 'error'}
          icon={
            account.isActive ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {account.isActive ? 'Connected' : 'Disconnected'}
        </Tag>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">
          Added:{' '}
          {new Date(account.createdAt).toLocaleDateString('en-IN')}
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Last Sync:{' '}
          {account.lastSync
            ? new Date(account.lastSync).toLocaleString('en-IN')
            : 'Never'}
        </Text>
      </div>

      <Button
        block
        icon={<SyncOutlined />}
        onClick={() => onSync(account.id)}
        disabled={!account.isActive}
      >
        Sync Now
      </Button>
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
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2}>Marketplace Accounts</Title>

          <Text type="secondary">
            Manage your connected store accounts
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Connect Marketplace
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {accounts.map((account) => (
          <Col xs={24} md={12} lg={8} key={account.id}>
            <AccountCard account={account} onSync={handleSync} />
          </Col>
        ))}
      </Row>

      <Modal
        title="Connect New Marketplace"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select marketplace">
              <Select.Option value="AMAZON">Amazon</Select.Option>
              <Select.Option value="FLIPKART">Flipkart</Select.Option>
              <Select.Option value="MEESHO">Meesho</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Store Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Store name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}