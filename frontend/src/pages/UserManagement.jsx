import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Card, Typography } from 'antd';
import { UserAddOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const API = 'http://localhost:8080';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`, { headers });
      const data = await res.json();
      setUsers(data);
    } catch {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (values) => {
    try {
      const res = await fetch(`${API}/api/users/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        message.success(`User invited! Temp password: ${data.temporaryPassword}`);
        form.resetFields();
        setModalOpen(false);
        fetchUsers();
      } else {
        message.error(data.error || 'Failed to invite user');
      }
    } catch {
      message.error('Failed to invite user');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/users/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        message.success('User removed');
        fetchUsers();
      } else {
        message.error('Failed to remove user');
      }
    } catch {
      message.error('Failed to remove user');
    }
  };

  const roleColors = {
    TENANT_ADMIN: 'red',
    PRICING_MANAGER: 'blue',
    ANALYST: 'green',
    SELLER: 'orange',
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color={roleColors[role] || 'default'}>{role}</Tag>,
    },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Remove this user?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes" cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} size="small">Remove</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}><TeamOutlined /> User Management</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setModalOpen(true)}>
          Invite User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Invite Team Member"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              <Option value="TENANT_ADMIN">Tenant Admin</Option>
              <Option value="PRICING_MANAGER">Pricing Manager</Option>
              <Option value="ANALYST">Analyst</Option>
              <Option value="SELLER">Seller</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Send Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}