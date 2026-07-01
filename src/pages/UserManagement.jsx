import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Avatar,
  Space,
  message,
  Alert,
  Card,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  MailOutlined,
  SyncOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  BarChartOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: <CrownOutlined />,
  },
  TENANT_ADMIN: {
    label: 'Admin',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: <SafetyCertificateOutlined />,
  },
  PRICING_MANAGER: {
    label: 'Pricing Manager',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: <BarChartOutlined />,
  },
  SELLER: {
    label: 'Seller',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: <ShopOutlined />,
  },
  ANALYST: {
    label: 'Analyst',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: <BarChartOutlined />,
  },
};

const avatarColors = ['#2563eb', '#059669', '#7c3aed', '#ea580c', '#db2777'];

const getInitials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

const mockUsers = [
  {
    id: 1,
    name: 'Demo Admin',
    email: 'demo@pricepilot.com',
    role: 'TENANT_ADMIN',
    createdAt: '2025-12-01T00:00:00',
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLoad, setInviteLoad] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (values) => {
    try {
      setInviteLoad(true);

      const newUser = {
        id: Date.now(),
        name: values.name || values.email.split('@')[0],
        email: values.email,
        role: values.role,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);

      message.success(`User added: ${values.email}`);
      setModalOpen(false);
      form.resetFields();
    } finally {
      setInviteLoad(false);
    }
  };

  const totalUsers = users.length;
  const adminUsers = users.filter((user) =>
    ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role)
  ).length;
  const managerUsers = users.filter((user) => user.role === 'PRICING_MANAGER').length;

  const columns = [
    {
      title: 'Team Member',
      key: 'user',
      render: (_, record) => {
        const colorIndex = (record.name?.charCodeAt(0) || 0) % avatarColors.length;

        return (
          <Space size="middle">
            <Avatar
              size={42}
              style={{
                background: avatarColors[colorIndex],
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {getInitials(record.name)}
            </Avatar>

            <div>
              <div className="user-name">
                {record.name || record.email?.split('@')[0] || 'User'}
              </div>
              <div className="user-email">{record.email}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const cfg = ROLE_CONFIG[role] || {
          label: role || 'User',
          color: '#475569',
          bg: '#f8fafc',
          border: '#e2e8f0',
          icon: <UserOutlined />,
        };

        return (
          <Tag
            className="role-tag"
            style={{
              color: cfg.color,
              background: cfg.bg,
              borderColor: cfg.border,
            }}
            icon={cfg.icon}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag className="status-tag" icon={<CheckCircleOutlined />}>
          Active
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'joined',
      render: (date) => (
        <Text className="joined-date">
          {date
            ? new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </Text>
      ),
    },
  ];

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <Title level={3} className="page-title">
            User Management
          </Title>
          <Text className="page-subtitle">
            Manage team members, roles, and workspace access.
          </Text>
        </div>

        <Space size="middle" className="header-actions">
          <Button
            icon={<SyncOutlined />}
            onClick={fetchUsers}
            loading={loading}
            size="large"
            className="secondary-btn"
          >
            Refresh
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            size="large"
            className="primary-btn"
          >
            Invite User
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon total">
              <TeamOutlined />
            </div>
            <div>
              <Text className="stat-label">Total Users</Text>
              <Title level={3} className="stat-value">
                {totalUsers}
              </Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon admin">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <Text className="stat-label">Admins</Text>
              <Title level={3} className="stat-value">
                {adminUsers}
              </Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon manager">
              <BarChartOutlined />
            </div>
            <div>
              <Text className="stat-label">Managers</Text>
              <Title level={3} className="stat-value">
                {managerUsers}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          closable
          className="users-alert"
          onClose={() => setError(null)}
        />
      )}

      <Card className="users-table-card" bordered={false}>
        <div className="table-heading">
          <div>
            <Title level={4}>Workspace Members</Title>
            <Text>View and manage all users added to PricePilot AI.</Text>
          </div>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey={(record) => record.id || record.email}
          loading={loading}
          className="users-table"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} members`,
          }}
          locale={{
            emptyText: 'No team members found',
          }}
        />
      </Card>

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon">
              <UserOutlined />
            </div>
            <div>
              <Title level={4}>Invite Team Member</Title>
              <Text>Add a new user and assign their workspace role.</Text>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Send Invite"
        confirmLoading={inviteLoad}
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
          onFinish={handleInvite}
          className="invite-form"
        >
          <Form.Item
            name="name"
            label="Full Name"
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="e.g. John Smith"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="colleague@example.com"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              size="large"
              placeholder="Select a role"
              className="form-select"
              options={Object.entries(ROLE_CONFIG).map(([key, value]) => ({
                label: value.label,
                value: key,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .users-page {
          width: 100%;
        }

        .users-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-title {
          margin: 0 !important;
          color: #0f172a !important;
          font-weight: 800 !important;
          letter-spacing: -0.4px;
        }

        .page-subtitle {
          color: #64748b !important;
          font-size: 14px;
        }

        .header-actions {
          flex-shrink: 0;
        }

        .primary-btn {
          height: 42px !important;
          border-radius: 11px !important;
          background: #2563eb !important;
          border-color: #2563eb !important;
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
          font-weight: 700 !important;
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
          font-weight: 700 !important;
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
          width: 48px;
          height: 48px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .stat-icon.total {
          color: #2563eb;
          background: #eff6ff;
        }

        .stat-icon.admin {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .stat-icon.manager {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-label {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 700;
        }

        .stat-value {
          margin: 2px 0 0 !important;
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        .users-alert {
          margin-bottom: 16px;
          border-radius: 14px;
          border: 1px solid #fde68a;
          background: #fffbeb;
        }

        .users-table-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .users-table-card .ant-card-body {
          padding: 0 !important;
        }

        .table-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .table-heading h4 {
          margin: 0 0 4px !important;
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        .table-heading span {
          color: #64748b !important;
          font-size: 13px;
        }

        .users-table .ant-table {
          background: #ffffff;
        }

        .users-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 800 !important;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .users-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 18px 16px !important;
        }

        .users-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .user-name {
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
        }

        .user-email {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          margin-top: 2px;
        }

        .role-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid;
        }

        .status-tag {
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
        }

        .joined-date {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-title-wrap h4 {
          margin: 0 0 2px !important;
          color: #0f172a !important;
          font-weight: 800 !important;
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
        }

        .invite-form {
          margin-top: 26px;
        }

        .invite-form .ant-form-item-label > label {
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

        .ant-pagination-item-active {
          border-color: #2563eb !important;
        }

        .ant-pagination-item-active a {
          color: #2563eb !important;
        }

        @media (max-width: 768px) {
          .users-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .header-actions .ant-btn {
            width: 100%;
          }

          .users-table-card {
            overflow-x: auto;
          }

          .table-heading {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .header-actions {
            grid-template-columns: 1fr;
          }

          .stat-card .ant-card-body {
            padding: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}