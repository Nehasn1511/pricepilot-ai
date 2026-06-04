import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Typography, Space, Tooltip, Progress, Modal, Form, message } from 'antd';
import { 
  PlusOutlined, 
  SyncOutlined, 
  SearchOutlined, 
  UploadOutlined,
  EyeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Mock Data
const mockProducts = [
  { id: 1, name: 'boAt Rockerz 255 Pro', brand: 'boAt', category: 'Audio', costPrice: 900, platforms: ['AMAZON', 'FLIPKART'], healthScore: 85 },
  { id: 2, name: 'Wireless Keyboard Pro', brand: 'Logitech', category: 'Accessories', costPrice: 800, platforms: ['AMAZON'], healthScore: 42 },
  { id: 3, name: 'USB-C Hub 7-in-1', brand: 'Anker', category: 'Electronics', costPrice: 1200, platforms: ['AMAZON', 'MEESHO'], healthScore: 92 },
  { id: 4, name: 'Phone Case Clear', brand: 'Spigen', category: 'Accessories', costPrice: 150, platforms: ['FLIPKART'], healthScore: 15 },
];

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData(mockProducts);
      setLoading(false);
    }, 600);
  }, []);

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ant-color-text)', fontSize: 14 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>{record.brand}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <span style={{ 
          background: 'var(--ant-color-bg-layout)', 
          padding: '4px 10px', 
          borderRadius: 6, 
          fontSize: 12, 
          fontWeight: 500,
          color: 'var(--ant-color-text-secondary)'
        }}>
          {cat}
        </span>
      ),
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (price) => <span style={{ fontWeight: 600 }}>₹{price}</span>,
    },
    {
      title: 'Platforms',
      key: 'platforms',
      render: (_, record) => (
        <Space size={4} wrap>
          {record.platforms.map(p => (
            <span 
              key={p} 
              className={`badge ${p === 'AMAZON' ? 'badge-pending' : p === 'FLIPKART' ? 'badge-info' : 'badge-error'}`}
              style={{ fontSize: 10, padding: '2px 8px' }}
            >
              {p}
            </span>
          ))}
        </Space>
      ),
    },
    {
      title: 'Health Score',
      key: 'healthScore',
      width: 140,
      render: (_, record) => {
        const strokeColor = record.healthScore > 70 ? '#10b981' : record.healthScore > 40 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress 
              percent={record.healthScore} 
              size="small" 
              showInfo={false} 
              strokeColor={strokeColor} 
              trailColor="var(--ant-color-bg-layout)"
              style={{ flex: 1, margin: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: strokeColor, width: 24 }}>
              {record.healthScore}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/products/${record.id}`)}
            style={{ borderRadius: 6, color: 'var(--ant-color-text-secondary)' }}
          >
            View
          </Button>
          <Tooltip title="Quick AI Insight">
            <Button 
              size="small" 
              icon={<ThunderboltOutlined />} 
              style={{ borderRadius: 6, color: '#8b5cf6', borderColor: '#e9d5ff', background: 'rgba(139,92,246,0.05)' }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--ant-color-text)' }}>Product Catalog</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Manage your master inventory and health scores</Text>
        </div>
        <Space size="middle">
          <Button icon={<SyncOutlined />} size="large" style={{ borderRadius: 8 }}>Refresh</Button>
          <Button icon={<UploadOutlined />} size="large" style={{ borderRadius: 8 }}>Import CSV</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="gradient-btn"
            onClick={() => setOpenModal(true)}
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Floating Filter Bar */}
      <div className="floating-card" style={{ 
        background: 'var(--ant-color-bg-container)', 
        padding: '16px 20px', 
        borderRadius: 16, 
        border: '1px solid var(--ant-color-border-secondary)', 
        marginBottom: 20, 
        display: 'flex', 
        gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
      }}>
        <Input 
          size="large" 
          placeholder="Search products by name, brand, or SKU..." 
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
          style={{ maxWidth: 400, borderRadius: 10, background: 'var(--ant-color-bg-layout)' }} 
          bordered={false}
        />
        <Select
          size="large"
          placeholder="All Marketplaces"
          style={{ width: 200 }}
          options={[
            { value: 'all', label: 'All Marketplaces' },
            { value: 'amazon', label: 'Amazon' },
            { value: 'flipkart', label: 'Flipkart' },
            { value: 'meesho', label: 'Meesho' },
          ]}
        />
      </div>

      {/* Main Floating Table */}
      <div className="floating-card">
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Product Modal */}
      <Modal
        title="Add Product"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const newProduct = {
              id: Date.now(),
              ...values,
              platforms: ['AMAZON'],
              healthScore: 80,
            };
            setData(prev => [...prev, newProduct]);
            message.success('Product added');
            form.resetFields();
            setOpenModal(false);
          }}
        >
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="costPrice" label="Cost Price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}