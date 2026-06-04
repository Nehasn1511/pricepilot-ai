import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography, Avatar, Space, message, Alert } from 'antd';
import { PlusOutlined, MailOutlined, SyncOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  SUPER_ADMIN:     { badge: 'badge-error',   label: 'Super Admin'     },
  TENANT_ADMIN:    { badge: 'badge-info',    label: 'Admin'           },
  PRICING_MANAGER: { badge: 'badge-neutral', label: 'Pricing Manager' },
  SELLER:          { badge: 'badge-pending', label: 'Seller'          },
  ANALYST:         { badge: 'badge-success', label: 'Analyst'         },
};

const avatarColors = ['#1677ff', '#10b981', '#8b5cf6', '#fa8c16', '#ec4899'];

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

const mockUsers = [
  { id: 1, name: 'Demo Admin', email: 'demo@pricepilot.com', role: 'TENANT_ADMIN', createdAt: '2025-12-01T00:00:00' },
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
      setLoading(true); setError(null);
      const res = await axiosClient.get('/users');
      let userList = Array.isArray(res.data) ? res.data : res.data?.content || res.data?.users || res.data?.data || [];
      setUsers(userList.length > 0 ? userList : mockUsers);
    } catch (err) {
      setError('You have view-only access to user management. Showing demo data.');
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (values) => {
    try {
      setInviteLoad(true);
      await axiosClient.post('/users/invite', { email: values.email, role: values.role, name: values.name || values.email.split('@')[0] });
      message.success(`Invitation sent to ${values.email}`);
      setModalOpen(false); form.resetFields(); fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviteLoad(false);
    }
  };

  const columns = [
    {
      title: 'User', key: 'user',
      render: (_, r) => (
        <Space size="middle">
          <Avatar size={40} style={{ background: avatarColors[(r.name?.charCodeAt(0) || 0) % avatarColors.length], fontSize: 14, fontWeight: 700 }}>
            {getInitials(r.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ant-color-text)' }}>{r.name || r.email?.split('@')[0] || 'User'}</div>
            <div style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => {
        const cfg = ROLE_CONFIG[role] || { badge: 'badge-neutral', label: role || 'User' };
        return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
      },
    },
    {
      title: 'Status', key: 'status',
      render: () => <span className="badge badge-success">Active</span>,
    },
    {
      title: 'Joined', dataIndex: 'createdAt', key: 'joined',
      render: (d) => (
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
          {d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--ant-color-text)' }}>User Management</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Manage team members and their access levels</Text>
        </div>
        <Space size="middle">
          <Button icon={<SyncOutlined />} onClick={fetchUsers} loading={loading} size="large" style={{ borderRadius: 8 }}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} size="large" className="gradient-btn">
            Invite User
          </Button>
        </Space>
      </div>

      {error && <Alert message={error} type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 12, border: 'none', background: 'rgba(245, 158, 11, 0.1)' }} onClose={() => setError(null)} />}

      {/* Floating Users Table */}
      <div className="floating-card" style={{ marginTop: 16 }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey={(r) => r.id || r.email}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `${total} members` }}
          locale={{ emptyText: 'No team members found' }}
        />
      </div>

      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Invite Team Member</span>}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Send Invite"
        confirmLoading={inviteLoad}
        okButtonProps={{ type: 'primary', size: 'large', className: 'gradient-btn' }}
        cancelButtonProps={{ size: 'large', style: { borderRadius: 10 } }}
        centered
        styles={{ content: { borderRadius: 16, padding: '24px 32px' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleInvite} style={{ marginTop: 24 }}>
          <Form.Item name="name" label={<span style={{ fontWeight: 500 }}>Full Name</span>}>
            <Input size="large" placeholder="e.g. John Smith" style={{ borderRadius: 10, background: 'var(--ant-color-bg-layout)' }} bordered={false} />
          </Form.Item>
          <Form.Item name="email" label={<span style={{ fontWeight: 500 }}>Email Address</span>} rules={[{ required: true }, { type: 'email' }]}>
            <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: 8 }} />} placeholder="colleague@example.com" style={{ borderRadius: 10, background: 'var(--ant-color-bg-layout)' }} bordered={false} />
          </Form.Item>
          <Form.Item name="role" label={<span style={{ fontWeight: 500 }}>Role</span>} rules={[{ required: true }]}>
            <Select size="large" placeholder="Select a role" options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}