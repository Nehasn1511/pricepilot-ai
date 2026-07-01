import React, { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Alert,
  Skeleton,
  Tag,
  Button,
  Empty,
} from 'antd';
import {
  ShoppingOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowRightOutlined,
  ShopOutlined,
  RobotOutlined,
  BulbOutlined,
  HeartOutlined,
  SafetyOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const chartColors = ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed'];

const getTenantId = () => localStorage.getItem('tenantId') || 1;

const getArrayData = (res) => {
  if (Array.isArray(res.data)) return res.data;
  return res.data?.content || [];
};

const firstValue = (...values) => {
  return values.find((value) => value !== undefined && value !== null && value !== '');
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

const StatCard = ({ title, value, subtitle, icon, className, trend, loading }) => {
  if (loading) {
    return (
      <Card className="metric-card" bordered={false}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card className="metric-card" bordered={false}>
      <div className="metric-content">
        <div className="metric-copy">
          <Text className="metric-label">{title}</Text>

          <div className="metric-value">
            {value}
          </div>

          {subtitle && (
            <Text className="metric-subtitle">
              {subtitle}
            </Text>
          )}

          {trend !== null && trend !== undefined && (
            <Tag
              className={`trend-tag ${trend >= 0 ? 'trend-up' : 'trend-down'}`}
              icon={trend >= 0 ? <RiseOutlined /> : <FallOutlined />}
            >
              {Math.abs(trend)}%
            </Tag>
          )}
        </div>

        <div className={`metric-icon ${className}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const ChartCardTitle = ({ icon, label, className }) => (
  <Space size={8}>
    <span className={`chart-title-icon ${className}`}>{icon}</span>
    <span>{label}</span>
  </Space>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const buildProductMap = (productRows = []) => {
    const map = {};

    productRows.forEach((p) => {
      const productData = {
        id: p.id,
        name: firstValue(p.name, p.productName, `Product #${p.id}`),
        brand: firstValue(p.brand, '—'),
        category: firstValue(p.category, '—'),
        costPrice: toNumber(firstValue(p.costPrice, p.minSafePrice, p.minimumSafePrice)),
        healthScore: toNumber(p.healthScore, 0),
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
    const productId = firstValue(
      rec.masterProductId,
      rec.productId,
      rec.master_product_id,
      rec.product_id
    );

    const listingId = firstValue(
      rec.marketplaceProductId,
      rec.marketplace_product_id,
      rec.marketplaceListingId,
      rec.listingId
    );

    const mappedProduct = productId ? productMap[String(productId)] : null;
    const mappedListing = listingId ? listingMap[String(listingId)] : null;

    const isLinkedToCurrentData = Boolean(
      mappedProduct ||
      mappedListing?.product?.id ||
      mappedListing?.product?.name
    );

    return {
      id: rec.id,
      isLinkedToCurrentData,
      productName: firstValue(
        mappedProduct?.name,
        mappedListing?.product?.name,
        rec.productName,
        rec.masterProductName,
        `Product #${productId || 'Unknown'}`
      ),
      platform: firstValue(
        rec.platform,
        rec.marketplace,
        mappedListing?.listing?.platform,
        mappedListing?.listing?.marketplace,
        'UNKNOWN'
      ),
      recommendationType: firstValue(rec.recommendationType, rec.type, 'PRICE_MATCH'),
      status: firstValue(rec.status, 'PENDING'),
      currentPrice: toNumber(rec.currentPrice),
      recommendedPrice: toNumber(rec.recommendedPrice),
      minimumSafePrice: toNumber(firstValue(rec.minimumSafePrice, rec.minSafePrice)),
      riskLevel: firstValue(rec.riskLevel, 'LOW'),
      healthScore: toNumber(rec.healthScore),
      createdAt: rec.createdAt,
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const tenantId = getTenantId();

      const [productsRes, recommendationsRes, discountsRes] = await Promise.allSettled([
        axiosClient.get('/products', {
          params: { tenantId, size: 1000 },
        }),
        axiosClient.get('/recommendations', {
          params: { tenantId },
        }),
        axiosClient.get('/discounts', {
          params: { tenantId },
        }),
      ]);

      const productRows =
        productsRes.status === 'fulfilled'
          ? getArrayData(productsRes.value)
          : [];

      const recommendationRows =
        recommendationsRes.status === 'fulfilled'
          ? getArrayData(recommendationsRes.value)
          : [];

      const discountRows =
        discountsRes.status === 'fulfilled'
          ? getArrayData(discountsRes.value)
          : [];

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

      const mappedRecommendations = recommendationRows
        .map((rec) => normalizeRecommendation(rec, productMap, listingMap))
        .filter((rec) => rec.isLinkedToCurrentData);

      setProducts(productRows);
      setListings(listingRows);
      setRecommendations(mappedRecommendations);
      setDiscounts(discountRows);
    } catch (err) {
      console.error('Dashboard load error:', err.response?.data || err.message);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    const totalListings = listings.length;

    const lowSaleProducts = products.filter((p) => toNumber(p.healthScore) < 50).length;
    const noSaleProducts = products.filter((p) => toNumber(p.healthScore) < 25).length;

    const pending = recommendations.filter((r) => r.status === 'PENDING').length;
    const approved = recommendations.filter((r) => r.status === 'APPROVED').length;
    const rejected = recommendations.filter((r) => r.status === 'REJECTED').length;
    const applied = recommendations.filter((r) => r.status === 'APPLIED').length;

    const activeDiscounts = discounts.filter((d) => d.status === 'ACTIVE').length;

    const listingValue = listings.reduce((sum, item) => {
      return sum + toNumber(item.listing?.price || item.listing?.currentPrice);
    }, 0);

    const marginProtected = recommendations
      .filter((r) => r.recommendationType === 'MARGIN_PROTECTION')
      .reduce((sum, r) => {
        return sum + Math.max(0, toNumber(r.minimumSafePrice) - toNumber(r.currentPrice));
      }, 0);

    return {
      totalProducts,
      totalListings,
      lowSaleProducts,
      noSaleProducts,
      pending,
      approved,
      rejected,
      applied,
      activeDiscounts,
      listingValue,
      marginProtected,
    };
  }, [products, listings, recommendations, discounts]);

  const recommendationStatusData = useMemo(() => {
    return [
      { name: 'Pending', value: dashboardStats.pending, color: '#d97706' },
      { name: 'Approved', value: dashboardStats.approved, color: '#059669' },
      { name: 'Applied', value: dashboardStats.applied, color: '#2563eb' },
      { name: 'Rejected', value: dashboardStats.rejected, color: '#dc2626' },
    ];
  }, [dashboardStats]);

  const platformData = useMemo(() => {
    const totals = {};

    listings.forEach((item) => {
      const platform = firstValue(item.listing?.platform, item.listing?.marketplace, 'UNKNOWN');
      const price = toNumber(item.listing?.price || item.listing?.currentPrice);

      totals[platform] = (totals[platform] || 0) + price;
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [listings]);

  const productValueData = useMemo(() => {
    return products.map((product) => {
      const productListings = listings.filter(
        (item) => String(item.product?.id) === String(product.id)
      );

      const listingValue = productListings.reduce((sum, item) => {
        return sum + toNumber(item.listing?.price || item.listing?.currentPrice);
      }, 0);

      return {
        name: firstValue(product.name, product.productName, `Product #${product.id}`),
        value: listingValue || toNumber(product.costPrice),
      };
    });
  }, [products, listings]);

  const statCards = [
    {
      title: 'Total Products',
      value: dashboardStats.totalProducts,
      subtitle: 'Fetched from products API',
      icon: <ShoppingOutlined />,
      className: 'products',
      trend: null,
    },
    {
      title: 'Active Listings',
      value: dashboardStats.totalListings,
      subtitle: 'Connected marketplace listings',
      icon: <EyeOutlined />,
      className: 'listings',
      trend: null,
    },
    {
      title: 'Low-Sale Products',
      value: dashboardStats.lowSaleProducts,
      subtitle: 'Health score below 50',
      icon: <FallOutlined />,
      className: 'warning',
      trend: null,
    },
    {
      title: 'No-Sale Products',
      value: dashboardStats.noSaleProducts,
      subtitle: 'Health score below 25',
      icon: <AlertOutlined />,
      className: 'danger',
      trend: null,
    },
    {
      title: 'Pending Approvals',
      value: dashboardStats.pending,
      subtitle: 'Linked recommendations only',
      icon: <ThunderboltOutlined />,
      className: 'ai',
      trend: null,
    },
    {
      title: 'Active Discounts',
      value: dashboardStats.activeDiscounts,
      subtitle: 'Fetched from discounts API',
      icon: <CheckCircleOutlined />,
      className: 'discounts',
      trend: null,
    },
  ];

  if (error) {
    return (
      <Alert
        type="error"
        message={error}
        showIcon
        className="dashboard-alert"
      />
    );
  }

  return (
    <div className="dashboard-page">
      <Card className="dashboard-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <AppstoreOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                Dashboard Overview
              </Title>

              <Text className="page-subtitle">
                Live pricing intelligence from products, listings, discounts, and AI recommendations.
              </Text>
            </div>
          </div>

          <Space wrap className="hero-actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
              className="secondary-btn"
            >
              Refresh
            </Button>

            <Link to="/recommendations">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                className="primary-btn"
              >
                Review Recommendations
              </Button>
            </Link>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={index}>
            <StatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card
            className="chart-card"
            bordered={false}
            title={
              <ChartCardTitle
                icon={<RiseOutlined />}
                label="Product Listing Value"
                className="blue"
              />
            }
            extra={
              <Tag className="value-pill">
                {formatShortCurrency(dashboardStats.listingValue)} total
              </Tag>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : productValueData.length === 0 ? (
              <Empty description="No product listing value available" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={productValueData}
                  margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="listingValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatShortCurrency(value)}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                    }}
                    formatter={(value) => [formatShortCurrency(value), 'Value']}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#listingValue)"
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            bordered={false}
            title={
              <ChartCardTitle
                icon={<ShopOutlined />}
                label="Listing Value by Platform"
                className="green"
              />
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : platformData.length === 0 ? (
              <Empty description="No platform data available" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {platformData.map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                      }}
                      formatter={(value) => [formatShortCurrency(value), 'Listing Value']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="platform-legend">
                  {platformData.map((platform, index) => (
                    <div key={platform.name} className="legend-row">
                      <Space size={8}>
                        <span
                          className="legend-dot"
                          style={{
                            background: chartColors[index % chartColors.length],
                          }}
                        />

                        <Text className="legend-name">
                          {platform.name}
                        </Text>
                      </Space>

                      <Text className="legend-value">
                        {formatShortCurrency(platform.value)}
                      </Text>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card
            className="chart-card"
            bordered={false}
            title={
              <ChartCardTitle
                icon={<ThunderboltOutlined />}
                label="AI Recommendation Status"
                className="orange"
              />
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={recommendationStatusData}
                  margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                    }}
                  />

                  <Bar dataKey="value" radius={[9, 9, 0, 0]}>
                    {recommendationStatusData.map((bar, index) => (
                      <Cell key={index} fill={bar.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className="insight-card" bordered={false}>
                <Space className="insight-title">
                  <HeartOutlined className="insight-icon cyan" />
                  <Text>Product Health</Text>
                </Space>

                <Row gutter={8}>
                  <Col span={8}>
                    <div className="insight-number">
                      {dashboardStats.totalProducts}
                    </div>
                    <Text className="insight-label">Total</Text>
                  </Col>

                  <Col span={8}>
                    <div className="insight-number warning">
                      {dashboardStats.lowSaleProducts}
                    </div>
                    <Text className="insight-label">Low Sale</Text>
                  </Col>

                  <Col span={8}>
                    <div className="insight-number danger">
                      {dashboardStats.noSaleProducts}
                    </div>
                    <Text className="insight-label">No Sale</Text>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card className="insight-card" bordered={false}>
                <Space className="insight-title">
                  <RobotOutlined className="insight-icon green" />
                  <Text>AI Intelligence</Text>
                </Space>

                <Row gutter={8}>
                  <Col span={8}>
                    <div className="insight-number purple">
                      {dashboardStats.pending}
                    </div>
                    <Text className="insight-label">Pending</Text>
                  </Col>

                  <Col span={8}>
                    <div className="insight-number green">
                      {dashboardStats.approved}
                    </div>
                    <Text className="insight-label">Approved</Text>
                  </Col>

                  <Col span={8}>
                    <div className="insight-number">
                      {dashboardStats.totalListings}
                    </div>
                    <Text className="insight-label">Listings</Text>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card className="insight-card" bordered={false}>
                <Space className="insight-title">
                  <SafetyOutlined className="insight-icon purple" />
                  <Text>Margin Protection</Text>
                </Space>

                <div className="big-value">
                  {formatShortCurrency(dashboardStats.marginProtected)}
                </div>

                <Text className="insight-label">
                  Estimated margin protected from linked recommendations
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card className="insight-card" bordered={false}>
                <Space className="insight-title">
                  <CheckCircleOutlined className="insight-icon blue" />
                  <Text>Discounts</Text>
                </Space>

                <div className="big-value">
                  {dashboardStats.activeDiscounts}
                </div>

                <Text className="insight-label">
                  Active discounts from discounts API
                </Text>
              </Card>
            </Col>

            <Col span={24}>
              <Card className="quick-actions-card" bordered={false}>
                <Space className="insight-title">
                  <BulbOutlined className="insight-icon purple" />
                  <Text>Quick Actions</Text>
                </Space>

                <Space wrap size={[10, 10]}>
                  {[
                    { label: 'Review Pending', href: '/recommendations' },
                    { label: 'Import Products', href: '/products' },
                    { label: 'View Reports', href: '/reports' },
                    { label: 'Marketplaces', href: '/marketplace-accounts' },
                  ].map((action) => (
                    <Link key={action.href} to={action.href}>
                      <Button className="quick-action-btn">
                        {action.label}
                        <ArrowRightOutlined />
                      </Button>
                    </Link>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <style>{`
        .dashboard-page {
          width: 100%;
        }

        .dashboard-alert {
          border-radius: 14px !important;
        }

        .dashboard-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .dashboard-hero .ant-card-body {
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

        .stats-row,
        .charts-row {
          margin-bottom: 20px;
        }

        .metric-card,
        .chart-card,
        .insight-card,
        .quick-actions-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          height: 100%;
        }

        .metric-card .ant-card-body {
          padding: 20px !important;
        }

        .metric-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .metric-copy {
          flex: 1;
          min-width: 0;
        }

        .metric-label {
          color: #64748b !important;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .metric-value {
          color: #0f172a;
          font-size: 28px;
          font-weight: 900;
          line-height: 1.15;
          margin-top: 7px;
        }

        .metric-subtitle {
          display: block;
          color: #94a3b8 !important;
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
        }

        .metric-icon {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .metric-icon.products {
          color: #2563eb;
          background: #eff6ff;
        }

        .metric-icon.listings {
          color: #059669;
          background: #ecfdf5;
        }

        .metric-icon.warning {
          color: #d97706;
          background: #fffbeb;
        }

        .metric-icon.danger {
          color: #dc2626;
          background: #fef2f2;
        }

        .metric-icon.ai {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .metric-icon.discounts {
          color: #0891b2;
          background: #ecfeff;
        }

        .trend-tag {
          margin-top: 9px;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid;
        }

        .trend-up {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .trend-down {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .chart-card .ant-card-head {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 0 22px !important;
        }

        .chart-card .ant-card-head-title {
          color: #0f172a;
          font-weight: 900;
        }

        .chart-card .ant-card-body {
          padding: 22px !important;
        }

        .chart-title-icon {
          font-size: 18px;
        }

        .chart-title-icon.blue {
          color: #2563eb;
        }

        .chart-title-icon.green {
          color: #059669;
        }

        .chart-title-icon.orange {
          color: #d97706;
        }

        .value-pill {
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
        }

        .platform-legend {
          display: grid;
          gap: 9px;
          margin-top: 8px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          display: inline-block;
        }

        .legend-name {
          color: #334155 !important;
          font-size: 12px;
          font-weight: 700;
        }

        .legend-value {
          color: #0f172a !important;
          font-size: 12px;
          font-weight: 900;
        }

        .insight-card .ant-card-body,
        .quick-actions-card .ant-card-body {
          padding: 20px !important;
        }

        .insight-title {
          margin-bottom: 12px;
        }

        .insight-title span:last-child {
          color: #0f172a !important;
          font-size: 13px;
          font-weight: 900;
        }

        .insight-icon {
          font-size: 16px;
        }

        .insight-icon.cyan {
          color: #0891b2;
        }

        .insight-icon.green {
          color: #059669;
        }

        .insight-icon.purple {
          color: #7c3aed;
        }

        .insight-icon.blue {
          color: #2563eb;
        }

        .insight-number {
          color: #0f172a;
          font-size: 25px;
          font-weight: 900;
          line-height: 1.1;
        }

        .insight-number.warning {
          color: #d97706;
        }

        .insight-number.danger {
          color: #dc2626;
        }

        .insight-number.purple {
          color: #7c3aed;
        }

        .insight-number.green {
          color: #059669;
        }

        .insight-label {
          display: block;
          color: #64748b !important;
          font-size: 11px;
          font-weight: 700;
          margin-top: 4px;
        }

        .big-value {
          color: #0f172a;
          font-size: 30px;
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 6px;
        }

        .quick-action-btn {
          border-radius: 999px !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
          font-weight: 800 !important;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .quick-action-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
          background: #eff6ff !important;
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
          .hero-actions a {
            width: 100%;
          }

          .hero-actions a .ant-btn {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .dashboard-hero .ant-card-body {
            padding: 22px !important;
          }

          .page-title {
            font-size: 22px !important;
          }

          .metric-value {
            font-size: 25px;
          }
        }
      `}</style>
    </div>
  );
}