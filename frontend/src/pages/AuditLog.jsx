import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Select, Input, Button, Space } from 'antd';
import { AuditOutlined, FilterOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const API = 'http://localhost:8080';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchLogs = async (action, performedBy) => {
    setLoading(true);
    try {
      let url = `${API}/api/audit-log`;
      if (action) url = `${API}/api/audit-log/filter?action=${action}`;
      else if (performedBy) url = `${API}/api/audit-log/filter?performedBy=${performedBy}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColors = {
    LOGIN: 'blue',
    APPROVE: 'green',
    REJECT: 'red',
    PRICE_CHANGE: 'orange',
    CREATE: 'cyan',
    UPDATE: 'purple',
    DELETE: 'red',
    INVITE: 'gold',
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => val ? new Date(val).toLocaleString() : '-',
      width: 180,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={actionColors[action] || 'default'}>{action}</Tag>
      ),
    },
    { title: 'Performed By', dataIndex: 'performedBy', key: 'performedBy' },
    { title: 'Entity Type', dataIndex: 'entityType', key: 'entityType' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (val) => val || '-',
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (val) => val || '-',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}><AuditOutlined /> Audit Log</Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="Filter by action"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => { setFilterAction(val || ''); fetchLogs(val || '', filterUser); }}
          >
            <Option value="LOGIN">Login</Option>
            <Option value="APPROVE">Approve</Option>
            <Option value="REJECT">Reject</Option>
            <Option value="PRICE_CHANGE">Price Change</Option>
            <Option value="CREATE">Create</Option>
            <Option value="UPDATE">Update</Option>
            <Option value="DELETE">Delete</Option>
            <Option value="INVITE">Invite</Option>
          </Select>
          <Input
            placeholder="Filter by user email"
            style={{ width: 220 }}
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            onPressEnter={() => fetchLogs(filterAction, filterUser)}
          />
          <Button icon={<FilterOutlined />} onClick={() => fetchLogs(filterAction, filterUser)}>
            Apply Filter
          </Button>
          <Button onClick={() => { setFilterAction(''); setFilterUser(''); fetchLogs(); }}>
            Clear
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}