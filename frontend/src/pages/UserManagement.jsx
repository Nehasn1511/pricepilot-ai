import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form,
  Input, Select, Typography, Avatar, Space,
  message, Alert
} from 'antd';
import { PlusOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  SUPER_ADMIN:     { color: '#f5222d', bg: '#fff1f0', label: 'Super Admin'     },
  TENANT_ADMIN:    { color: '#722ed1', bg: '#f9f0ff', label: 'Admin'           },
  PRICING_MANAGER: { color: '#1677ff', bg: '#e6f4ff', label: 'Pricing Manager' },
  SELLER:          { color: '#fa8c16', bg: '#fff7e6', label: 'Seller'          },
  ANALYST:         { color: '#52c41a', bg: '#f6ffed', label: 'Analyst'         },
};

const avatarColors = ['#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96'];

const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

// Fallback data — shown when API returns 403 or fails
const mockUsers = [
  {
    id: 1, name: 'Demo Admin',
    email: 'demo@pricepilot.com',
    role: 'TENANT_ADMIN',
    createdAt: '2025-12-01T00:00:00',
  },
];

export default function UserManagement() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [inviteLoad, setInviteLoad] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get('/users');

      // Handle all possible response shapes from backend
      let userList = [];
      if (Array.isArray(res.data)) {
        userList = res.data;
      } else if (res.data?.content) {
        userList = res.data.content;          // Spring Page object
      } else if (res.data?.users) {
        userList = res.data.users;            // Custom wrapper
      } else if (res.data?.data) {
        userList = res.data.data;             // Another wrapper
      } else {
        userList = [];
      }

      setUsers(userList.length > 0 ? userList : mockUsers);

    } catch (err) {
      const status = err.response?.status;

      if (status === 403) {
        // Current user role cannot see all users — show own user only
        setError('You have view-only access to user management. Showing your account.');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUsers(storedUser?.email ? [storedUser] : mockUsers);
      } else if (status === 404) {
        setError('Users endpoint not found. Check if backend is running correctly.');
        setUsers(mockUsers);
      } else {
        setError(`Failed to load users (${status || 'Network error'}). Showing demo data.`);
        setUsers(mockUsers);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (values) => {
    try {
      setInviteLoad(true);
      await axiosClient.post('/users/invite', {
        email: values.email,
        role:  values.role,
        name:  values.name || values.email.split('@')[0],
      });
      message.success(`Invitation sent to ${values.email}`);
      setModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'Failed to send invitation';
      message.error(msg);
    } finally {
      setInviteLoad(false);
    }
  };

  const columns = [
    {
      title: 'User', key: 'user',
      render: (_, r) => (
        <Space>
          <Avatar
            size={36}
            style={{
              background: avatarColors[(r.name?.charCodeAt(0) || 0) % avatarColors.length],
              fontSize: 13, fontWeight: 700,
            }}
          >
            {getInitials(r.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {r.name || r.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => {
        const cfg = ROLE_CONFIG[role] || { color: '#666', bg: '#f5f5f5', label: role || 'User' };
        return (
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px',
            borderRadius: 6, color: cfg.color, background: cfg.bg,
          }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: 'Status', key: 'status',
      render: () => (
        <Tag color="success" style={{ borderRadius: 4, fontWeight: 500 }}>Active</Tag>
      ),
    },
    {
      title: 'Joined', dataIndex: 'createdAt', key: 'joined',
      render: (d) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {d
            ? new Date(d).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : '—'
          }
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
      }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">
            Manage team members and their access levels
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            style={{ borderRadius: 8 }}
          >
            Invite User
          </Button>
        </Space>
      </div>

      {/* Error message — shown when API fails but we have fallback data */}
      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16, borderRadius: 8 }}
          onClose={() => setError(null)}
        />
      )}

      {/* Users table */}
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey={(r) => r.id || r.email}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} members`,
          }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
          locale={{ emptyText: 'No team members found' }}
        />
      </Card>

      {/* Invite Modal */}
      <Modal
        open={modalOpen}
        title="Invite Team Member"
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Send Invite"
        confirmLoading={inviteLoad}
        okButtonProps={{ style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInvite}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Full Name"
          >
            <Input
              placeholder="e.g. John Smith"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bbb' }} />}
              placeholder="colleague@example.com"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({
                label: v.label,
                value: k,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}