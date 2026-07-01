import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Tooltip,
  Progress,
  Modal,
  Form,
  message,
  Alert,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  SearchOutlined,
  UploadOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  DollarOutlined,
  LinkOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';

const { Title, Text } = Typography;

const getArrayData = (res) => {
  if (Array.isArray(res.data)) return res.data;
  return res.data?.content || [];
};

const normalizePlatform = (value) => {
  if (!value) return null;
  return String(value).toUpperCase();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const PLATFORM_TAG_CLASS = {
  AMAZON: 'platform-amazon',
  FLIPKART: 'platform-flipkart',
  MEESHO: 'platform-meesho',
  MYNTRA: 'platform-myntra',
  SHOPIFY: 'platform-shopify',
};

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const [form] = Form.useForm();
  const [listingForm] = Form.useForm();

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setApiError('');

      const res = await productAPI.getAll();

      const products = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      const listingResults = await Promise.allSettled(
        products.map((product) => productAPI.getListings(product.id))
      );

      const mappedProducts = products.map((p, index) => {
        let listings = [];

        const listingResult = listingResults[index];

        if (listingResult?.status === 'fulfilled') {
          listings = getArrayData(listingResult.value);
        }

        const platformsFromListings = listings
          .map((item) =>
            normalizePlatform(
              item.platform ||
              item.marketplace ||
              item.marketplaceName
            )
          )
          .filter(Boolean);

        const platformsFromProduct =
          p.platforms ||
          p.marketplacePrices?.map((m) => normalizePlatform(m.marketplace)) ||
          p.marketplaceProducts?.map((m) => normalizePlatform(m.platform)) ||
          [];

        const platforms = Array.from(
          new Set([
            ...platformsFromProduct.filter(Boolean),
            ...platformsFromListings,
          ])
        );

        return {
          id: p.id,
          name: p.name || p.productName || 'Unknown Product',
          brand: p.brand || '—',
          category: p.category || '—',
          costPrice: p.costPrice || p.minSafePrice || p.minimumSafePrice || 0,
          healthScore: p.healthScore || 0,
          platforms,
          listings,
        };
      });

      setData(mappedProducts);
    } catch (error) {
      console.error('Product fetch error:', error.response?.data || error.message);
      setApiError('Product backend API failed. Check backend server, endpoint, or CORS.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((product) => {
      const q = searchText.toLowerCase().trim();

      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q);

      const matchesPlatform =
        platformFilter === 'all' ||
        product.platforms?.some((p) => p.toLowerCase() === platformFilter);

      return matchesSearch && matchesPlatform;
    });
  }, [data, searchText, platformFilter]);

  const totalProducts = data.length;
  const linkedProducts = data.filter((product) => product.platforms?.length > 0).length;
  const totalListings = data.reduce((sum, product) => sum + (product.listings?.length || 0), 0);
  const avgHealth =
    data.length > 0
      ? Math.round(data.reduce((sum, product) => sum + Number(product.healthScore || 0), 0) / data.length)
      : 0;

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleImportCsv = () => {
    message.info('CSV import API not connected yet.');
  };

  const handleQuickInsight = (record) => {
    if (!record.platforms?.length) {
      message.warning('Add a marketplace listing first to generate proper insight.');
      return;
    }

    message.success(`AI insight generated for ${record.name}`);
  };

  const handleAddProduct = async (values) => {
    try {
      const payload = {
        name: values.name,
        brand: values.brand,
        category: values.category,
        costPrice: Number(values.costPrice),
      };

      await productAPI.create(payload);

      message.success('Product added successfully');
      form.resetFields();
      setOpenModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Add product error:', error.response?.data || error.message);
      message.error('Failed to add product. Check backend API.');
    }
  };

  const handleAddListing = async (values) => {
    if (!selectedProduct?.id) {
      message.error('No product selected.');
      return;
    }

    try {
      const payload = {
        platform: values.platform,
        price: Number(values.currentPrice),
        url: values.url || '',
        externalSku: values.externalSku || '',
      };

      await productAPI.addListing(selectedProduct.id, payload);

      message.success('Marketplace listing added successfully');
      listingForm.resetFields();
      setListingModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Add listing error:', error.response?.data || error.message);
      message.error('Failed to add marketplace listing. Check backend API.');
    }
  };

  const openListingModal = (record) => {
    setSelectedProduct(record);
    listingForm.setFieldsValue({
      platform: 'AMAZON',
      currentPrice: '',
      stockQuantity: '',
      viewsLast7Days: 0,
      ordersLast7Days: 0,
    });
    setListingModalOpen(true);
  };

  const getHealthStatus = (score) => {
    if (score > 70) return 'healthy';
    if (score > 40) return 'warning';
    return 'danger';
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      fixed: 'left',
      render: (_, record) => (
        <Space size="middle">
          <div className="product-icon">
            <ShoppingOutlined />
          </div>

          <div>
            <div className="product-name">{record.name}</div>
            <div className="product-brand">{record.brand}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <Tag className="category-tag">
          {cat}
        </Tag>
      ),
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (price) => (
        <Text className="price-text">
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Platforms',
      key: 'platforms',
      render: (_, record) => (
        <Space size={6} wrap>
          {record.platforms?.length > 0 ? (
            record.platforms.map((p) => (
              <Tag
                key={p}
                className={`platform-tag ${PLATFORM_TAG_CLASS[p] || 'platform-default'}`}
              >
                {p}
              </Tag>
            ))
          ) : (
            <Tag className="platform-empty">
              No platform
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Health Score',
      key: 'healthScore',
      width: 160,
      render: (_, record) => {
        const status = getHealthStatus(record.healthScore);

        const strokeColor =
          status === 'healthy'
            ? '#059669'
            : status === 'warning'
              ? '#d97706'
              : '#dc2626';

        return (
          <div className="health-cell">
            <Progress
              percent={record.healthScore}
              size="small"
              showInfo={false}
              strokeColor={strokeColor}
              trailColor="#f1f5f9"
              className="health-progress"
            />

            <span className={`health-score ${status}`}>
              {record.healthScore}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
            className="table-btn"
          >
            View
          </Button>

          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openListingModal(record)}
            className="table-primary-btn"
          >
            Add Listing
          </Button>

          <Tooltip title="Quick AI Insight">
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => handleQuickInsight(record)}
              className="insight-btn"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="products-page">
      <Card className="products-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <AppstoreOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                Product Catalog
              </Title>

              <Text className="page-subtitle">
                Manage master inventory, marketplace listings, and product health scores.
              </Text>
            </div>
          </div>

          <Space wrap className="hero-actions">
            <Button
              icon={<SyncOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="secondary-btn"
            >
              Refresh
            </Button>

            <Button
              icon={<UploadOutlined />}
              onClick={handleImportCsv}
              className="secondary-btn"
            >
              Import CSV
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenModal(true)}
              className="primary-btn"
            >
              Add Product
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon total">
              <DatabaseOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Total Products</span>}
              value={totalProducts}
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon linked">
              <LinkOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Linked Products</span>}
              value={linkedProducts}
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon listings">
              <ShopOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Marketplace Listings</span>}
              value={totalListings}
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon health">
              <SafetyCertificateOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Avg Health Score</span>}
              value={avgHealth}
              suffix="%"
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>
      </Row>

      {apiError && (
        <Alert
          type="error"
          showIcon
          className="page-alert"
          message={apiError}
        />
      )}

      {!apiError && !loading && (
        <Alert
          type="success"
          showIcon
          className="page-alert"
          message="Products and marketplace listings are fetched from backend API."
        />
      )}

      <Card className="filter-card" bordered={false}>
        <Input
          size="large"
          placeholder="Search products by name, brand, or category..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          allowClear
        />

        <Select
          size="large"
          placeholder="All Marketplaces"
          value={platformFilter}
          onChange={setPlatformFilter}
          className="platform-select"
          options={[
            { value: 'all', label: 'All Marketplaces' },
            { value: 'amazon', label: 'Amazon' },
            { value: 'flipkart', label: 'Flipkart' },
            { value: 'meesho', label: 'Meesho' },
          ]}
        />
      </Card>

      <Card className="products-table-card" bordered={false}>
        <div className="table-heading">
          <div>
            <Title level={4}>Inventory Products</Title>
            <Text>
              Showing {filteredData.length} of {data.length} products
            </Text>
          </div>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} product(s)`,
          }}
          scroll={{ x: 950 }}
          className="products-table"
          locale={{
            emptyText: (
              <Empty
                image={<ShoppingOutlined style={{ fontSize: 44, color: '#94a3b8' }} />}
                description="No products found"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon">
              <PlusOutlined />
            </div>

            <div>
              <Title level={4}>Add Product</Title>
              <Text>Create a new master product in your catalog.</Text>
            </div>
          </div>
        }
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Add Product"
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
          onFinish={handleAddProduct}
          className="product-form"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input
              placeholder="e.g., Samsung S25 Ultra"
              size="large"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Please enter brand' }]}
          >
            <Input
              placeholder="e.g., Samsung"
              size="large"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input
              placeholder="e.g., Electronics"
              size="large"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="costPrice"
            label="Cost Price / Minimum Safe Price"
            rules={[{ required: true, message: 'Please enter cost price' }]}
          >
            <Input
              type="number"
              placeholder="e.g., 86000"
              size="large"
              prefix={<DollarOutlined />}
              className="form-input"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon listing">
              <LinkOutlined />
            </div>

            <div>
              <Title level={4}>Add Marketplace Listing</Title>
              <Text>
                {selectedProduct
                  ? `Connect listing for ${selectedProduct.name}`
                  : 'Connect a marketplace listing'}
              </Text>
            </div>
          </div>
        }
        open={listingModalOpen}
        onCancel={() => {
          setListingModalOpen(false);
          setSelectedProduct(null);
          listingForm.resetFields();
        }}
        onOk={() => listingForm.submit()}
        okText="Add Listing"
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
        width={540}
        styles={{
          content: {
            borderRadius: 22,
            padding: '28px 32px',
          },
        }}
      >
        <Form
          form={listingForm}
          layout="vertical"
          onFinish={handleAddListing}
          className="product-form"
        >
          <Form.Item
            name="platform"
            label="Marketplace"
            rules={[{ required: true, message: 'Please select marketplace' }]}
          >
            <Select
              placeholder="Select marketplace"
              size="large"
              className="form-select"
              options={[
                { value: 'AMAZON', label: 'Amazon' },
                { value: 'FLIPKART', label: 'Flipkart' },
                { value: 'MEESHO', label: 'Meesho' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="currentPrice"
            label="Current Selling Price"
            rules={[{ required: true, message: 'Enter current selling price' }]}
          >
            <Input
              type="number"
              placeholder="e.g., 92000"
              size="large"
              prefix={<DollarOutlined />}
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Enter stock quantity' }]}
          >
            <Input
              type="number"
              placeholder="e.g., 15"
              size="large"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="viewsLast7Days"
            label="Views Last 7 Days"
          >
            <Input
              type="number"
              placeholder="e.g., 800"
              size="large"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="ordersLast7Days"
            label="Orders Last 7 Days"
          >
            <Input
              type="number"
              placeholder="e.g., 5"
              size="large"
              className="form-input"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .products-page {
          width: 100%;
        }

        .products-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .products-hero .ant-card-body {
          padding: 26px 28px !important;
          background: #ffffff;
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .page-title {
          margin: 0 !important;
          color: #0f172a !important;
          font-weight: 900 !important;
          letter-spacing: -0.4px;
        }

        .page-subtitle {
          color: #64748b !important;
          font-size: 14px;
        }

        .hero-actions {
          flex-shrink: 0;
        }

        .primary-btn {
          height: 42px !important;
          border-radius: 11px !important;
          background: #2563eb !important;
          border-color: #2563eb !important;
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
          font-weight: 800 !important;
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
          font-weight: 800 !important;
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
          width: 50px;
          height: 50px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .stat-icon.total {
          color: #2563eb;
          background: #eff6ff;
        }

        .stat-icon.linked {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-icon.listings {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .stat-icon.health {
          color: #ea580c;
          background: #fff7ed;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .page-alert {
          border-radius: 14px !important;
          margin-bottom: 18px;
        }

        .filter-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 20px;
        }

        .filter-card .ant-card-body {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px !important;
          flex-wrap: wrap;
        }

        .search-input {
          max-width: 430px;
          height: 42px;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }

        .search-input .anticon {
          color: #64748b;
        }

        .platform-select {
          width: 220px;
        }

        .platform-select .ant-select-selector {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }

        .search-input:hover,
        .platform-select:hover .ant-select-selector {
          border-color: #93c5fd !important;
        }

        .search-input:focus,
        .search-input-focused,
        .platform-select.ant-select-focused .ant-select-selector {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .products-table-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .products-table-card .ant-card-body {
          padding: 0 !important;
        }

        .table-heading {
          padding: 22px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .table-heading h4 {
          margin: 0 0 4px !important;
          color: #0f172a !important;
          font-weight: 900 !important;
        }

        .table-heading span {
          color: #64748b !important;
          font-size: 13px;
        }

        .products-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 900 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .products-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 17px 16px !important;
        }

        .products-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .product-icon {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .product-name {
          color: #0f172a;
          font-size: 14px;
          font-weight: 900;
        }

        .product-brand {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          margin-top: 2px;
        }

        .category-tag,
        .platform-tag,
        .platform-empty {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
        }

        .category-tag {
          color: #475569;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .platform-default,
        .platform-empty {
          color: #64748b;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .platform-amazon {
          color: #ea580c;
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .platform-flipkart {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .platform-meesho {
          color: #db2777;
          background: #fdf2f8;
          border-color: #fbcfe8;
        }

        .platform-myntra {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .platform-shopify {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .price-text {
          color: #0f172a !important;
          font-size: 14px;
          font-weight: 900;
        }

        .health-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .health-progress {
          flex: 1;
          margin: 0;
        }

        .health-score {
          width: 28px;
          font-size: 12px;
          font-weight: 900;
          text-align: right;
        }

        .health-score.healthy {
          color: #059669;
        }

        .health-score.warning {
          color: #d97706;
        }

        .health-score.danger {
          color: #dc2626;
        }

        .table-btn,
        .table-primary-btn,
        .insight-btn {
          border-radius: 9px !important;
          font-weight: 800 !important;
        }

        .table-btn {
          color: #334155 !important;
          border-color: #e2e8f0 !important;
        }

        .table-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
        }

        .table-primary-btn {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        .insight-btn {
          color: #7c3aed !important;
          border-color: #ddd6fe !important;
          background: #f5f3ff !important;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-title-wrap h4 {
          margin: 0 0 2px !important;
          color: #0f172a !important;
          font-weight: 900 !important;
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
          flex-shrink: 0;
        }

        .modal-icon.listing {
          color: #059669;
          background: #ecfdf5;
        }

        .product-form {
          margin-top: 26px;
        }

        .product-form .ant-form-item-label > label {
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

        @media (max-width: 900px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-left {
            align-items: flex-start;
          }

          .hero-actions,
          .hero-actions .ant-btn,
          .search-input,
          .platform-select {
            width: 100%;
            max-width: 100%;
          }

          .filter-card .ant-card-body {
            flex-direction: column;
            align-items: stretch;
          }

          .products-table-card {
            overflow-x: auto;
          }
        }

        @media (max-width: 640px) {
          .products-hero .ant-card-body {
            padding: 22px !important;
          }

          .page-title {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}