import React, { useState } from 'react';
import {
  Table, Card, Button, Tag, Space, Modal, Form, Input, InputNumber,
  Select, Typography, Row, Col, Progress, Descriptions, Badge
} from 'antd';
import { PlusOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Demo data - replace with API calls
const demoProducts = [
  {
    id: 1, name: 'boAt Rockerz 255 Pro', brand: 'boAt', category: 'Audio',
    costPrice: 900, healthScore: 72,
    listings: [
      { platform: 'AMAZON', title: 'boAt Rockerz 255 Pro Wireless Neckband', currentPrice: 1499, stockQuantity: 85, viewsLast7Days: 1200, ordersLast7Days: 28, rating: 4.2 },
      { platform: 'FLIPKART', title: 'Boat 255 Pro Bluetooth Earphones', currentPrice: 1299, stockQuantity: 60, viewsLast7Days: 890, ordersLast7Days: 35, rating: 4.3 },
    ]
  },
  {
    id: 2, name: 'Wireless Keyboard Pro', brand: 'Logitech', category: 'Accessories',
    costPrice: 800, healthScore: 34,
    listings: [
      { platform: 'AMAZON', title: 'Logitech Wireless Keyboard K380', currentPrice: 1499, stockQuantity: 120, viewsLast7Days: 900, ordersLast7Days: 2, rating: 4.0 },
      { platform: 'FLIPKART', title: 'Logitech K380 Multi-Device Keyboard', currentPrice: 1299, stockQuantity: 45, viewsLast7Days: 450, ordersLast7Days: 12, rating: 4.1 },
    ]
  },
  {
    id: 3, name: 'Samsung 25W Charger', brand: 'Samsung', category: 'Mobile Accessories',
    costPrice: 500, healthScore: 85,
    listings: [
      { platform: 'AMAZON', title: 'Samsung 25W Type-C Fast Charger', currentPrice: 899, stockQuantity: 200, viewsLast7Days: 2100, ordersLast7Days: 65, rating: 4.5 },
      { platform: 'MEESHO', title: 'Samsung Original 25W Charger', currentPrice: 799, stockQuantity: 150, viewsLast7Days: 1500, ordersLast7Days: 42, rating: 4.3 },
    ]
  },
  {
    id: 4, name: 'USB-C Hub 7-in-1', brand: 'Anker', category: 'Accessories',
    costPrice: 1200, healthScore: 28,
    listings: [
      { platform: 'AMAZON', title: 'Anker USB-C Hub 7-in-1 Adapter', currentPrice: 2499, stockQuantity: 80, viewsLast7Days: 450, ordersLast7Days: 0, rating: 4.4 },
      { platform: 'FLIPKART', title: 'Anker 7 in 1 USB C Hub', currentPrice: 2199, stockQuantity: 30, viewsLast7Days: 280, ordersLast7Days: 3, rating: 4.2 },
    ]
  },
  {
    id: 5, name: 'Phone Case Clear', brand: 'Spigen', category: 'Mobile Accessories',
    costPrice: 200, healthScore: 22,
    listings: [
      { platform: 'AMAZON', title: 'Spigen Ultra Hybrid Clear Case', currentPrice: 799, stockQuantity: 500, viewsLast7Days: 1200, ordersLast7Days: 0, rating: 4.1 },
      { platform: 'FLIPKART', title: 'Spigen Crystal Clear Phone Case', currentPrice: 599, stockQuantity: 300, viewsLast7Days: 800, ordersLast7Days: 5, rating: 4.0 },
      { platform: 'MEESHO', title: 'Spigen Clear Back Cover', currentPrice: 499, stockQuantity: 200, viewsLast7Days: 2000, ordersLast7Days: 15, rating: 3.8 },
    ]
  },
];

export default function Products() {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addVisible, setAddVisible] = useState(false);

  const platformColor = {
    AMAZON: 'orange', FLIPKART: 'blue', SHOPIFY: 'green',
    MEESHO: 'pink', MYNTRA: 'purple', WOOCOMMERCE: 'cyan'
  };

  const columns = [
    { title: 'Product', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (t) => <Tag>{t}</Tag> },
    { title: 'Cost Price', dataIndex: 'costPrice', key: 'costPrice', render: (v) => `₹${v}` },
    {
      title: 'Platforms',
      key: 'platforms',
      render: (_, record) => (
        <Space>
          {record.listings.map((l, i) => (
            <Tag key={i} color={platformColor[l.platform]}>{l.platform}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Health Score',
      dataIndex: 'healthScore',
      key: 'healthScore',
      sorter: (a, b) => a.healthScore - b.healthScore,
      render: (score) => (
        <Progress
          type="circle"
          percent={score}
          size={45}
          status={score < 40 ? 'exception' : score < 60 ? 'normal' : 'success'}
          format={(p) => p}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedProduct(record); setDetailVisible(true); }}>
            View
          </Button>
          <Button type="primary" icon={<ThunderboltOutlined />} ghost>
            Get AI Advice
          </Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Product Catalog</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
          Add Product
        </Button>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={demoProducts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Product Detail Modal */}
      <Modal
        title={selectedProduct?.name}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={null}
      >
        {selectedProduct && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Brand">{selectedProduct.brand}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedProduct.category}</Descriptions.Item>
              <Descriptions.Item label="Cost Price">₹{selectedProduct.costPrice}</Descriptions.Item>
              <Descriptions.Item label="Health Score">
                <Badge status={selectedProduct.healthScore < 40 ? 'error' : selectedProduct.healthScore < 60 ? 'warning' : 'success'} />
                {selectedProduct.healthScore}/100
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Marketplace Listings</Title>
            <Table
              dataSource={selectedProduct.listings}
              rowKey="platform"
              pagination={false}
              columns={[
                { title: 'Platform', dataIndex: 'platform', render: (p) => <Tag color={platformColor[p]}>{p}</Tag> },
                { title: 'Price', dataIndex: 'currentPrice', render: (v) => <Text strong>₹{v}</Text> },
                { title: 'Stock', dataIndex: 'stockQuantity' },
                { title: 'Views (7d)', dataIndex: 'viewsLast7Days' },
                { title: 'Orders (7d)', dataIndex: 'ordersLast7Days',
                  render: (v) => <Text type={v === 0 ? 'danger' : undefined}>{v}</Text> },
                { title: 'Rating', dataIndex: 'rating', render: (v) => `⭐ ${v}` },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        title="Add New Product"
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g., boAt Rockerz 255 Pro" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Brand" name="brand">
                <Input placeholder="Brand name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" name="category">
                <Select placeholder="Select category">
                  <Select.Option value="Audio">Audio</Select.Option>
                  <Select.Option value="Mobile Accessories">Mobile Accessories</Select.Option>
                  <Select.Option value="Accessories">Accessories</Select.Option>
                  <Select.Option value="Electronics">Electronics</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Cost Price (₹)" name="costPrice" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Commission (₹)" name="marketplaceCommission">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Shipping (₹)" name="shippingCost">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Min Margin %" name="minimumMarginPercent">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Button type="primary" block>Add Product</Button>
        </Form>
      </Modal>
    </div>
  );
}
