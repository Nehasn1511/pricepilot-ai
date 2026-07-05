import React, { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  DatePicker,
  Select,
  Space,
  Progress,
  Statistic,
  Table,
  Tag,
  Empty,
  Spin,
  Alert,
  Tooltip,
  notification,
} from 'antd';
import {
  DownloadOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const getTenantId = () => localStorage.getItem('tenantId') || 1;

const getArrayData = (res) => {
  if (Array.isArray(res.data)) return res.data;
  return res.data?.content || [];
};

const firstValue = (...values) => {
  return values.find((v) => v !== undefined && v !== null && v !== '');
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(value));
};

const formatShortCurrency = (value) => {
  const amount = toNumber(value);

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }

  return `₹${amount}`;
};

const csvEscape = (value) => {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
};

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    className: 'tag-pending',
    icon: <ClockCircleOutlined />,
  },
  APPROVED: {
    label: 'Approved',
    className: 'tag-approved',
    icon: <CheckCircleOutlined />,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'tag-rejected',
    icon: <CloseCircleOutlined />,
  },
  APPLIED: {
    label: 'Applied',
    className: 'tag-applied',
    icon: <SafetyCertificateOutlined />,
  },
};

const TYPE_CONFIG = {
  PRICE_MATCH: 'Price Match',
  TEMPORARY_DISCOUNT: 'Temporary Discount',
  STOCK_CLEARANCE: 'Stock Clearance',
  MARGIN_PROTECTION: 'Margin Protection',
  BUNDLE_RECOMMENDATION: 'Bundle Recommendation',
  BUNDLE_OFFER: 'Bundle Offer',
  PRICE_INCREASE: 'Price Increase',
};

const PLATFORM_CONFIG = {
  AMAZON: 'platform-amazon',
  FLIPKART: 'platform-flipkart',
  MEESHO: 'platform-meesho',
  MYNTRA: 'platform-myntra',
  SHOPIFY: 'platform-shopify',
};

const demoSalesData = [
  { date: '25 May', revenue: 28000, orders: 24 },
  { date: '26 May', revenue: 35000, orders: 31 },
  { date: '27 May', revenue: 22000, orders: 19 },
  { date: '28 May', revenue: 41000, orders: 38 },
  { date: '29 May', revenue: 38000, orders: 35 },
  { date: '30 May', revenue: 52000, orders: 47 },
  { date: '31 May', revenue: 47000, orders: 43 },
];

export default function Reports() {
  const [notificationApi, contextHolder] = notification.useNotification();

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [recommendations, setRecommendations] = useState([]);
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);

  const buildProductMap = (productRows = []) => {
    const map = {};

    productRows.forEach((p) => {
      const productData = {
        id: p.id,
        name: firstValue(p.name, p.productName, p.title, `Product #${p.id}`),
        brand: firstValue(p.brand, '—'),
        category: firstValue(p.category, '—'),
        costPrice: toNumber(firstValue(p.costPrice, p.minSafePrice, p.minimumSafePrice)),
      };

      [p.id, p.productId, p.masterProductId, p.master_product_id].forEach((id) => {
        if (id !== undefined && id !== null) {
          map[String(id)] = productData;
        }
      });
    });

    return map;
  };

  const buildListingMap = (listingRows = []) => {
    const map = {};

    listingRows.forEach((item) => {
      const listing = item.listing || {};
      const product = item.product || {};

      [
        listing.id,
        listing.marketplaceProductId,
        listing.marketplace_product_id,
        listing.listingId,
        listing.listing_id,
      ].forEach((id) => {
        if (id !== undefined && id !== null) {
          map[String(id)] = {
            listing,
            product,
          };
        }
      });
    });

    return map;
  };

  const normalizeRecommendation = (rec, productMap, listingMap) => {
    const listingId = firstValue(
      rec.marketplaceProductId,
      rec.marketplace_product_id,
      rec.marketplaceListingId,
      rec.listingId
    );

    const productId = firstValue(
      rec.masterProductId,
      rec.productId,
      rec.master_product_id,
      rec.product_id
    );

    const mappedProduct = productId ? productMap[String(productId)] : null;
    const mappedListing = listingId ? listingMap[String(listingId)] : null;

    const isLinkedToCurrentProduct = Boolean(
      mappedProduct ||
      mappedListing?.product?.id ||
      mappedListing?.product?.name
    );

    const productName = firstValue(
      mappedProduct?.name,
      mappedListing?.product?.name,
      mappedListing?.product?.productName,
      rec.productName,
      rec.masterProductName,
      `Product #${productId || 'Unknown'}`
    );

    const platform = firstValue(
      rec.platform,
      rec.marketplace,
      mappedListing?.listing?.platform,
      mappedListing?.listing?.marketplace,
      'AMAZON'
    );

    return {
      id: rec.id,
      isLinkedToCurrentProduct,
      productName,
      platform,
      recommendationType: firstValue(rec.recommendationType, rec.type, 'PRICE_MATCH'),
      status: firstValue(rec.status, 'PENDING'),
      currentPrice: toNumber(rec.currentPrice),
      recommendedPrice: toNumber(rec.recommendedPrice),
      minimumSafePrice: toNumber(firstValue(rec.minimumSafePrice, rec.minSafePrice)),
      discountPercent: toNumber(rec.discountPercent),
      healthScore: toNumber(rec.healthScore),
      riskLevel: firstValue(rec.riskLevel, 'LOW'),
      expectedImpact: firstValue(rec.expectedImpact, 'Not calculated'),
      reason: firstValue(rec.reason, 'No reason provided'),
      durationDays: firstValue(rec.durationDays, null),
      createdAt: rec.createdAt,
      expiresAt: rec.expiresAt,
    };
  };

  const removeDuplicateRecommendations = (items = []) => {
    const seen = new Set();

    return items.filter((item) => {
      const key = [
        item.productName,
        item.platform,
        item.recommendationType,
        item.currentPrice,
        item.recommendedPrice,
        item.status,
      ].join('|');

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setApiError('');

      const tenantId = getTenantId();

      const [recommendationsRes, productsRes] = await Promise.all([
        axiosClient.get('/recommendations', {
          params: { tenantId },
        }),
        axiosClient.get('/products', {
          params: { tenantId },
        }),
      ]);

      const recommendationRows = getArrayData(recommendationsRes);
      const productRows = getArrayData(productsRes);

      const listingResults = await Promise.allSettled(
        productRows.map((product) =>
          axiosClient.get(`/products/${product.id}/listings`, {
            params: { tenantId },
          })
        )
      );

      const listingRows = [];

      listingResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const product = productRows[index];

          const productListings = Array.isArray(result.value.data)
            ? result.value.data
            : result.value.data?.content || [];

          productListings.forEach((listing) => {
            listingRows.push({
              product,
              listing,
            });
          });
        }
      });

      const productMap = buildProductMap(productRows);
      const listingMap = buildListingMap(listingRows);

      const mappedRecommendations = recommendationRows.map((rec) =>
        normalizeRecommendation(rec, productMap, listingMap)
      );

      const linkedRecommendations = mappedRecommendations.filter(
        (rec) => rec.isLinkedToCurrentProduct
      );

      const dedupedRecommendations = removeDuplicateRecommendations(linkedRecommendations);

      setProducts(productRows);
      setListings(listingRows);
      setRecommendations(dedupedRecommendations);
    } catch (error) {
      console.error('Reports fetch error:', error.response?.data || error.message);

      setApiError('Failed to load reports data. Please check the backend API.');
      setRecommendations([]);
      setProducts([]);
      setListings([]);

      notificationApi.error({
        message: 'Failed to load reports',
        description: error.response?.data?.message || 'Check backend and browser console.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const filteredRecommendations = useMemo(() => {
    let rows = [...recommendations];

    if (reportType !== 'all' && reportType !== 'recommendations') {
      rows = rows.filter((rec) => rec.status === reportType);
    }

    if (dateRange?.length === 2 && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');

      rows = rows.filter((rec) => {
        if (!rec.createdAt) return true;

        const created = dayjs(rec.createdAt);

        return (
          created.isAfter(start) ||
          created.isSame(start, 'day')
        ) && (
          created.isBefore(end) ||
          created.isSame(end, 'day')
        );
      });
    }

    return rows;
  }, [recommendations, reportType, dateRange]);

  const stats = useMemo(() => {
    const pending = recommendations.filter((r) => r.status === 'PENDING').length;
    const approved = recommendations.filter((r) => r.status === 'APPROVED').length;
    const rejected = recommendations.filter((r) => r.status === 'REJECTED').length;
    const applied = recommendations.filter((r) => r.status === 'APPLIED').length;

    const total = recommendations.length;

    const approvalRate = total > 0
      ? Math.round(((approved + applied) / total) * 100)
      : 0;

    const potentialImpact = recommendations.reduce((sum, rec) => {
      const diff = Math.abs(toNumber(rec.recommendedPrice) - toNumber(rec.currentPrice));
      return sum + diff;
    }, 0);

    const protectedMargin = recommendations
      .filter((rec) => rec.recommendationType === 'MARGIN_PROTECTION')
      .reduce((sum, rec) => {
        const diff = Math.max(0, toNumber(rec.minimumSafePrice) - toNumber(rec.currentPrice));
        return sum + diff;
      }, 0);

    return {
      pending,
      approved,
      rejected,
      applied,
      total,
      approvalRate,
      potentialImpact,
      protectedMargin,
      products: products.length,
      listings: listings.length,
    };
  }, [recommendations, products, listings]);

  const summaryCards = [
    {
      title: 'Pending Actions',
      value: stats.pending,
      caption: 'open recommendations',
      icon: <ClockCircleOutlined />,
      className: 'pending',
    },
    {
      title: 'Approved Decisions',
      value: stats.approved,
      caption: 'approved actions',
      icon: <CheckCircleOutlined />,
      className: 'approved',
    },
    {
      title: 'Rejected Suggestions',
      value: stats.rejected,
      caption: 'rejected suggestions',
      icon: <CloseCircleOutlined />,
      className: 'rejected',
    },
    {
      title: 'Potential Impact',
      value: formatShortCurrency(stats.potentialImpact || stats.protectedMargin),
      caption: 'estimated value',
      icon: <DollarOutlined />,
      className: 'impact',
    },
  ];

  const maxRevenue = Math.max(1, ...demoSalesData.map((item) => item.revenue));
  const maxOrders = Math.max(1, ...demoSalesData.map((item) => item.orders));

  const handleExport = async () => {
    try {
      setExporting(true);

      const headers = [
        'Date',
        'Product',
        'Platform',
        'Type',
        'Current Price',
        'Recommended Price',
        'Minimum Safe Price',
        'Risk',
        'Status',
        'Reason',
      ];

      const rows = filteredRecommendations.map((rec) => [
        rec.createdAt ? dayjs(rec.createdAt).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        rec.productName,
        rec.platform,
        rec.recommendationType,
        rec.currentPrice,
        rec.recommendedPrice,
        rec.minimumSafePrice,
        rec.riskLevel,
        rec.status,
        rec.reason,
      ]);

      const csv = [
        headers.map(csvEscape),
        ...rows.map((row) => row.map(csvEscape)),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `pricepilot-report-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
      link.click();

      URL.revokeObjectURL(url);

      notificationApi.success({
        message: 'Report exported successfully',
        description: `${rows.length} recommendation row(s) exported as CSV.`,
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Export error:', error);

      notificationApi.error({
        message: 'Export failed',
        description: 'Could not export the report.',
        placement: 'topRight',
      });
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      fixed: 'left',
      render: (_, record) => (
        <div className="product-cell">
          <Text className="product-name">{record.productName}</Text>
          <div>
            <Tag className={`platform-tag ${PLATFORM_CONFIG[record.platform] || ''}`}>
              {record.platform}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Recommendation',
      key: 'recommendationType',
      render: (_, record) => (
        <Tag className="type-tag">
          {TYPE_CONFIG[record.recommendationType] ||
            record.recommendationType?.replaceAll('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Current',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right',
      render: (value) => <Text className="price-text">{formatCurrency(value)}</Text>,
    },
    {
      title: 'Suggested',
      dataIndex: 'recommendedPrice',
      key: 'recommendedPrice',
      align: 'right',
      render: (value) => (
        <Text className="suggested-price">
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Safe Price',
      dataIndex: 'minimumSafePrice',
      key: 'minimumSafePrice',
      align: 'right',
      render: (value) => (
        <Text className="safe-price">
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Risk',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk) => (
        <Tag
          className={`risk-tag ${
            risk === 'HIGH'
              ? 'risk-high'
              : risk === 'MEDIUM'
                ? 'risk-medium'
                : 'risk-low'
          }`}
        >
          {risk}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

        return (
          <Tag className={`status-tag ${cfg.className}`} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Card
        style={{
          borderRadius: 20,
          textAlign: 'center',
          padding: 54,
          border: '1px solid #e2e8f0',
          boxShadow: '0 16px 42px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading reports and analytics...</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="reports-page">
      {contextHolder}

      <Card className="reports-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <FileTextOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                Reports & Analytics
              </Title>
              <Text className="page-subtitle">
                Track pricing decisions, margin protection, and recommendation impact.
              </Text>
            </div>
          </div>

          <Space wrap className="hero-actions">
            <Tooltip title="Refresh report data">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReportData}
                className="secondary-btn"
              >
                Refresh
              </Button>
            </Tooltip>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExport}
              className="primary-btn"
            >
              Export CSV
            </Button>
          </Space>
        </div>
      </Card>

      {apiError && (
        <Alert
          type="error"
          showIcon
          message={apiError}
          className="reports-alert"
        />
      )}

      <Row gutter={[16, 16]} className="summary-row">
        {summaryCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <Card className="summary-card" bordered={false}>
              <div className={`summary-icon ${card.className}`}>
                {card.icon}
              </div>

              <div>
                <Text className="summary-label">{card.title}</Text>
                <div className="summary-value">{card.value}</div>
                <Text className="summary-caption">{card.caption}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="filter-card" bordered={false}>
        <Space wrap className="filter-left">
          <RangePicker
            size="large"
            value={dateRange}
            onChange={(value) => setDateRange(value || [])}
            format="DD MMM YYYY"
            className="modern-picker"
          />

          <Select
            size="large"
            value={reportType}
            onChange={setReportType}
            className="modern-select"
            options={[
              { label: 'Comprehensive Report', value: 'all' },
              { label: 'AI Recommendations', value: 'recommendations' },
              { label: 'Pending Only', value: 'PENDING' },
              { label: 'Approved Only', value: 'APPROVED' },
              { label: 'Rejected Only', value: 'REJECTED' },
            ]}
          />
        </Space>

        <Space wrap className="filter-tags">
          <Tag className="info-pill blue">
            {stats.products} products
          </Tag>

          <Tag className="info-pill purple">
            {stats.listings} marketplace listings
          </Tag>

          <Tag className="info-pill green">
            {stats.approvalRate}% approval rate
          </Tag>
        </Space>
      </Card>

      <Row gutter={[20, 20]} className="analytics-row">
        <Col xs={24} lg={15}>
          <Card
            className="analytics-card"
            bordered={false}
            title={
              <Space>
                <RiseOutlined className="title-icon blue" />
                <span>Revenue Velocity</span>
              </Space>
            }
            extra={<Text className="card-extra">Demo 7-day trend</Text>}
          >
            <div className="chart-list">
              {demoSalesData.map((item) => (
                <div key={item.date} className="chart-row">
                  <div className="chart-row-top">
                    <Text className="chart-date">{item.date}</Text>
                    <Text className="chart-value blue">
                      {formatShortCurrency(item.revenue)}
                    </Text>
                  </div>

                  <Progress
                    percent={Math.round((item.revenue / maxRevenue) * 100)}
                    showInfo={false}
                    strokeColor="#2563eb"
                    trailColor="#eff6ff"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            className="analytics-card"
            bordered={false}
            title={
              <Space>
                <BarChartOutlined className="title-icon green" />
                <span>Order Volume</span>
              </Space>
            }
            extra={<Text className="card-extra">Demo 7-day trend</Text>}
          >
            <div className="chart-list">
              {demoSalesData.map((item) => (
                <div key={item.date} className="chart-row compact">
                  <div className="chart-row-top">
                    <Text className="chart-date">{item.date}</Text>
                    <Text className="chart-value green">
                      {item.orders} orders
                    </Text>
                  </div>

                  <Progress
                    percent={Math.round((item.orders / maxOrders) * 100)}
                    showInfo={false}
                    strokeColor="#059669"
                    trailColor="#ecfdf5"
                  />
                </div>
              ))}
            </div>

            <div className="mini-stats">
              <div className="mini-stat-card">
                <Statistic
                  title="Total Recs"
                  value={stats.total}
                  valueStyle={{
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                />
              </div>

              <div className="mini-stat-card">
                <Statistic
                  title="Protected Margin"
                  value={formatShortCurrency(stats.protectedMargin)}
                  valueStyle={{
                    fontWeight: 800,
                    color: '#7c3aed',
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        className="report-table-card"
        bordered={false}
        title={
          <Space>
            <ThunderboltOutlined className="title-icon purple" />
            <span>Recommendation Report</span>
          </Space>
        }
        extra={
          <Text className="card-extra">
            {filteredRecommendations.length} row(s)
          </Text>
        }
      >
        {filteredRecommendations.length === 0 ? (
          <Empty description="No recommendation data available for this report." />
        ) : (
          <Table
            dataSource={filteredRecommendations}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showTotal: (total) => `${total} recommendations`,
            }}
            scroll={{ x: 980 }}
            className="reports-table"
          />
        )}
      </Card>

      <style>{`
        .reports-page {
          width: 100%;
        }

        .reports-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .reports-hero .ant-card-body {
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

        .reports-alert {
          margin-bottom: 18px;
          border-radius: 14px !important;
        }

        .summary-row {
          margin-bottom: 20px;
        }

        .summary-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
        }

        .summary-card .ant-card-body {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px !important;
        }

        .summary-icon {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .summary-icon.pending {
          color: #d97706;
          background: #fffbeb;
        }

        .summary-icon.approved {
          color: #059669;
          background: #ecfdf5;
        }

        .summary-icon.rejected {
          color: #dc2626;
          background: #fef2f2;
        }

        .summary-icon.impact {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .summary-label {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 800;
        }

        .summary-value {
          color: #0f172a;
          font-size: 28px;
          font-weight: 900;
          line-height: 1.1;
          margin-top: 4px;
        }

        .summary-caption {
          color: #94a3b8 !important;
          font-size: 12px;
          font-weight: 600;
        }

        .filter-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 20px;
        }

        .filter-card .ant-card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 20px !important;
        }

        .modern-picker,
        .modern-select .ant-select-selector {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
        }

        .modern-picker:hover,
        .modern-select:hover .ant-select-selector {
          border-color: #93c5fd !important;
        }

        .modern-select {
          min-width: 230px;
        }

        .info-pill {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
        }

        .info-pill.blue {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .info-pill.purple {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .info-pill.green {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .analytics-row {
          margin-bottom: 20px;
        }

        .analytics-card,
        .report-table-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          height: 100%;
        }

        .analytics-card .ant-card-head,
        .report-table-card .ant-card-head {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 0 22px !important;
        }

        .analytics-card .ant-card-head-title,
        .report-table-card .ant-card-head-title {
          color: #0f172a;
          font-weight: 900;
        }

        .analytics-card .ant-card-body,
        .report-table-card .ant-card-body {
          padding: 22px !important;
        }

        .title-icon {
          font-size: 18px;
        }

        .title-icon.blue {
          color: #2563eb;
        }

        .title-icon.green {
          color: #059669;
        }

        .title-icon.purple {
          color: #7c3aed;
        }

        .card-extra {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
        }

        .chart-list {
          display: grid;
          gap: 16px;
        }

        .chart-row.compact {
          gap: 10px;
        }

        .chart-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 7px;
        }

        .chart-date {
          color: #334155 !important;
          font-size: 13px;
          font-weight: 800;
        }

        .chart-value {
          font-size: 13px;
          font-weight: 900;
        }

        .chart-value.blue {
          color: #2563eb !important;
        }

        .chart-value.green {
          color: #059669 !important;
        }

        .mini-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        .mini-stat-card {
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px;
        }

        .mini-stat-card .ant-statistic-title {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .reports-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 900 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .reports-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 16px !important;
        }

        .reports-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .product-cell {
          display: grid;
          gap: 6px;
        }

        .product-name {
          color: #0f172a !important;
          font-weight: 900;
        }

        .price-text {
          color: #0f172a !important;
          font-weight: 800;
        }

        .suggested-price {
          color: #2563eb !important;
          font-weight: 900;
        }

        .safe-price {
          color: #7c3aed !important;
          font-weight: 900;
        }

        .platform-tag,
        .type-tag,
        .risk-tag,
        .status-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
        }

        .platform-tag {
          color: #475569;
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

        .type-tag {
          color: #334155;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .risk-high {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .risk-medium {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .risk-low {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .tag-pending {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .tag-approved {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .tag-rejected {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .tag-applied {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .ant-pagination-item-active {
          border-color: #2563eb !important;
        }

        .ant-pagination-item-active a {
          color: #2563eb !important;
        }

        @media (max-width: 900px) {
          .hero-content,
          .filter-card .ant-card-body {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-actions,
          .filter-left,
          .filter-tags {
            width: 100%;
          }

          .hero-actions .ant-btn {
            flex: 1;
          }

          .modern-picker,
          .modern-select {
            width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          .reports-hero .ant-card-body {
            padding: 22px !important;
          }

          .hero-left {
            align-items: flex-start;
          }

          .page-title {
            font-size: 22px !important;
          }

          .summary-card .ant-card-body {
            padding: 18px !important;
          }

          .mini-stats {
            grid-template-columns: 1fr;
          }

          .report-table-card {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}