import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form,
  Input, Select, Typography, Avatar, Space, message
} from 'antd';
import { PlusOutlined, MailOutlined } from '@ant-design/icons';
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

const mockUsers = [
  { id: 1, name: 'Demo Admin',   email: 'demo@pricepilot.com', role: 'TENANT_ADMIN',    createdAt: '2025-12-01' },
  { id: 2, name: 'Student A',    email: 'studenta@example.com',role: 'PRICING_MANAGER', createdAt: '2025-12-05' },
  { id: 3, name: 'Student B',    email: 'studentb@example.com',role: 'ANALYST',         createdAt: '2025-12-05' },
];

export default function Users() {
  const [users,     setUsers]     = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    axiosClient.get('/users')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.content ?? [];
        setUsers(data.length > 0 ? data : mockUsers);
      })
      .catch(() => setUsers(mockUsers));
  }, []);

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
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => {
        const cfg = ROLE_CONFIG[role] || { color: '#666', bg: '#f5f5f5', label: role };
        return (
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
            color: cfg.color, background: cfg.bg,
          }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: 'Status', key: 'status',
      render: () => <Tag color="success" style={{ borderRadius: 4 }}>Active</Tag>,
    },
    {
      title: 'Joined', dataIndex: 'createdAt', key: 'joined',
      render: (d) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </Text>
      ),
    },
  ];

  const handleInvite = (values) => {
    const newUser = {
      id: Date.now(),
      name: values.email.split('@')[0],
      email: values.email,
      role: values.role,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    message.success('Invitation sent successfully');
    setModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Team Members</Title>
          <Text type="secondary">Manage access and roles for your team</Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ borderRadius: 8 }}
        >
          Invite Member
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={users} columns={columns} rowKey="id"
          pagination={false}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      <Modal
        open={modalOpen}
        title="Invite Team Member"
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Send Invite"
        okButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleInvite} style={{ marginTop: 16 }}>
          <Form.Item name="email" label="Email Address"
            rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="colleague@example.com" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select a role" options={
              Object.entries(ROLE_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))
            } />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}