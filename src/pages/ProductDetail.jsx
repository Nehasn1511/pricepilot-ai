import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Progress,
  Descriptions,
  Tag,
  Empty,
  Table,
  Alert,
  Statistic,
  Space,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  DollarOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import StatusBadge from '../components/common/StatusBadge';
import {
  formatCurrencyShort,
  formatDate,
  getHealthScoreColor,
} from '../utils/formatters';
import { ROUTES } from '../utils/constants';
import { productAPI } from '../services/api';

const { Title, Text } = Typography;

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizePlatform = (value) => {
  if (!value) return 'UNKNOWN';
  return String(value).toUpperCase();
};

const normalizeProduct = (p, listings = []) => {
  const marketplacePrices =
    listings.length > 0
      ? listings
      : p.marketplacePrices ||
        p.marketplaceProducts ||
        [];

  return {
    id: p.id,
    name: p.name || p.productName || 'Unknown Product',
    sku: p.sku || p.productCode || `SKU-${p.id}`,
    brand: p.brand || '—',
    category: p.category || '—',
    minSafePrice: toNumber(
      p.minSafePrice || p.minimumSafePrice || p.costPrice || p.baseCost
    ),
    costPrice: toNumber(p.costPrice || p.baseCost || p.minSafePrice),
    status: p.status || 'ACTIVE',
    healthScore: p.healthScore,
    updatedAt: p.updatedAt || p.modifiedAt || p.createdAt,

    marketplacePrices: marketplacePrices.map((m) => ({
      id: m.id,
      marketplace: normalizePlatform(m.marketplace || m.platform || 'Unknown'),
      price: toNumber(m.price || m.currentPrice || m.sellingPrice),
      stock: toNumber(m.stock || m.inventory || m.stockQuantity),
      productUrl: m.productUrl || m.url,
      lastCheckedAt: m.lastCheckedAt,
    })),

    recommendations: p.recommendations || p.aiRecommendations || [],
  };
};

const analyzeProduct = (product) => {
  const prices = product.marketplacePrices || [];
  const validPrices = prices.filter((p) => p.price > 0);
  const minSafePrice = toNumber(product.minSafePrice);

  if (!validPrices.length) {
    return {
      hasData: false,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceSpread: 0,
      spreadPercentage: 0,
      totalStock: 0,
      belowSafeCount: 0,
      healthScore: 0,
      verdict: 'Not enough data',
      recommendedPrice: minSafePrice,
      insights: [
        {
          type: 'DATA_REQUIRED',
          title: 'Marketplace data required',
          description:
            'Add marketplace prices from Amazon, Flipkart, Meesho, or other platforms to generate pricing insights.',
          status: 'PENDING',
        },
      ],
    };
  }

  const totalPrice = validPrices.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = Math.round(totalPrice / validPrices.length);

  const minEntry = validPrices.reduce((min, item) =>
    item.price < min.price ? item : min
  );

  const maxEntry = validPrices.reduce((max, item) =>
    item.price > max.price ? item : max
  );

  const priceSpread = maxEntry.price - minEntry.price;
  const spreadPercentage = averagePrice
    ? Math.round((priceSpread / averagePrice) * 100)
    : 0;

  const totalStock = validPrices.reduce((sum, item) => sum + toNumber(item.stock), 0);
  const belowSafeItems = validPrices.filter((item) => item.price < minSafePrice);

  const marginScore = belowSafeItems.length > 0 ? 35 : 95;
  const consistencyScore =
    spreadPercentage > 30 ? 35 : spreadPercentage > 15 ? 70 : 95;
  const stockScore = totalStock > 150 ? 65 : totalStock > 40 ? 85 : 75;

  const calculatedHealthScore = Math.round(
    marginScore * 0.45 + consistencyScore * 0.35 + stockScore * 0.2
  );

  let recommendedPrice = averagePrice;
  let verdict = 'Healthy pricing';

  if (belowSafeItems.length > 0) {
    recommendedPrice = Math.ceil(minSafePrice * 1.1);
    verdict = 'Margin risk detected';
  } else if (spreadPercentage > 25) {
    recommendedPrice = averagePrice;
    verdict = 'Price inconsistency detected';
  } else if (totalStock > 150) {
    recommendedPrice = Math.max(minSafePrice, Math.round(averagePrice * 0.95));
    verdict = 'High stock, discount possible';
  } else if (minEntry.price > minSafePrice * 1.4) {
    recommendedPrice = Math.round(averagePrice * 0.97);
    verdict = 'Slight price optimization possible';
  }

  const insights = [];

  if (belowSafeItems.length > 0) {
    insights.push({
      type: 'MARGIN_PROTECTION',
      title: 'Price below minimum safe price',
      description: `${belowSafeItems.length} marketplace price is below your safe price. Increase price to protect margin.`,
      currentPrice: minEntry.price,
      recommendedPrice,
      status: 'PENDING',
    });
  }

  if (spreadPercentage > 25) {
    insights.push({
      type: 'PRICE_CONSISTENCY',
      title: 'Large price difference across marketplaces',
      description: `There is a ${spreadPercentage}% price gap between lowest and highest marketplace price.`,
      currentPrice: averagePrice,
      recommendedPrice,
      status: 'PENDING',
    });
  }

  if (totalStock > 150) {
    insights.push({
      type: 'STOCK_CLEARANCE',
      title: 'High stock detected',
      description:
        'Stock level is high. A small discount can help improve movement without going below safe price.',
      currentPrice: averagePrice,
      recommendedPrice,
      status: 'PENDING',
    });
  }

  if (!insights.length) {
    insights.push({
      type: 'HEALTHY_PRODUCT',
      title: 'Product pricing looks healthy',
      description:
        'Marketplace prices are above safe price and price difference is within a manageable range.',
      currentPrice: averagePrice,
      recommendedPrice,
      status: 'APPROVED',
    });
  }

  return {
    hasData: true,
    averagePrice,
    minPrice: minEntry.price,
    maxPrice: maxEntry.price,
    lowestMarketplace: minEntry.marketplace,
    highestMarketplace: maxEntry.marketplace,
    priceSpread,
    spreadPercentage,
    totalStock,
    belowSafeCount: belowSafeItems.length,
    healthScore: product.healthScore ?? calculatedHealthScore,
    verdict,
    recommendedPrice,
    insights,
  };
};

const getHealthLabel = (score) => {
  if (score >= 70) return 'Healthy';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
};

const getHealthClass = (score) => {
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'warning';
  return 'critical';
};

const HealthScoreCard = ({ score, verdict }) => {
  const color = getHealthScoreColor(score);
  const label = getHealthLabel(score);
  const healthClass = getHealthClass(score);

  return (
    <Card className="health-score-card" bordered={false}>
      <Text className="card-eyebrow">Product Health Score</Text>

      <div className="health-progress-wrap">
        <Progress
          type="circle"
          percent={score}
          strokeColor={color}
          trailColor="#f1f5f9"
          size={112}
          format={() => (
            <span style={{ fontSize: 24, fontWeight: 900, color }}>
              {score}
            </span>
          )}
        />
      </div>

      <Tag className={`health-tag ${healthClass}`}>
        {label}
      </Tag>

      <Text className="health-verdict">
        {verdict}
      </Text>
    </Card>
  );
};

const AnalysisSummary = ({ analysis }) => {
  return (
    <Card
      className="analysis-card"
      bordered={false}
      title={
        <Space>
          <BarChartOutlined className="title-icon blue" />
          <span>Pricing Analysis</span>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic
            title="Average Price"
            value={analysis.averagePrice}
            prefix="₹"
            valueStyle={{ fontWeight: 900, color: '#0f172a' }}
          />
        </Col>

        <Col xs={12} md={6}>
          <Statistic
            title="Lowest Price"
            value={analysis.minPrice}
            prefix="₹"
            valueStyle={{ fontWeight: 900, color: '#0f172a' }}
          />
        </Col>

        <Col xs={12} md={6}>
          <Statistic
            title="Highest Price"
            value={analysis.maxPrice}
            prefix="₹"
            valueStyle={{ fontWeight: 900, color: '#0f172a' }}
          />
        </Col>

        <Col xs={12} md={6}>
          <Statistic
            title="Suggested Price"
            value={analysis.recommendedPrice}
            prefix="₹"
            valueStyle={{ fontWeight: 900, color: '#2563eb' }}
          />
        </Col>
      </Row>

      {analysis.hasData && (
        <Alert
          className="analysis-alert"
          type={
            analysis.belowSafeCount > 0
              ? 'error'
              : analysis.spreadPercentage > 25
                ? 'warning'
                : 'success'
          }
          showIcon
          message={analysis.verdict}
          description={`Price spread is ${analysis.spreadPercentage}%. Total available stock is ${analysis.totalStock} units.`}
        />
      )}
    </Card>
  );
};

const PriceComparisonCard = ({ prices = [], minSafePrice }) => {
  const columns = [
    {
      title: 'Marketplace',
      dataIndex: 'marketplace',
      key: 'marketplace',
      render: (marketplace) => (
        <Tag className={`platform-tag platform-${String(marketplace).toLowerCase()}`}>
          {marketplace}
        </Tag>
      ),
    },
    {
      title: 'Current Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <Text className="table-price">
          {formatCurrencyShort(price)}
        </Text>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      render: (stock) => (
        <Tag
          className={`stock-tag ${
            stock > 50 ? 'stock-good' : stock > 10 ? 'stock-mid' : 'stock-low'
          }`}
        >
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Margin Status',
      dataIndex: 'price',
      key: 'margin',
      align: 'right',
      render: (price) => {
        const diff = price - minSafePrice;
        const isSafe = diff >= 0;

        return (
          <Space>
            {isSafe ? (
              <RiseOutlined className="margin-up" />
            ) : (
              <FallOutlined className="margin-down" />
            )}

            <Text className={isSafe ? 'margin-safe' : 'margin-risk'}>
              {isSafe ? '+' : ''}
              {formatCurrencyShort(diff)}
            </Text>
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      className="comparison-card"
      bordered={false}
      title={
        <Space>
          <ShopOutlined className="title-icon purple" />
          <span>Marketplace Price Comparison</span>
        </Space>
      }
    >
      {minSafePrice > 0 && (
        <div className="safe-price-box">
          <SafetyOutlined />
          <span>
            Minimum Safe Price: <strong>{formatCurrencyShort(minSafePrice)}</strong>
            &nbsp;— pricing below this risks profit loss.
          </span>
        </div>
      )}

      <Table
        dataSource={prices}
        columns={columns}
        rowKey={(record) => record.id || record.marketplace}
        pagination={false}
        size="middle"
        className="comparison-table"
        locale={{ emptyText: 'No marketplace price data available' }}
      />
    </Card>
  );
};

const ProductRecommendations = ({ analysis }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="recommendations-card"
      bordered={false}
      title={
        <Space>
          <ThunderboltOutlined className="title-icon purple" />
          <span>AI Recommendations</span>
        </Space>
      }
    >
      {analysis.insights.map((rec, index) => (
        <div
          key={`${rec.type}-${index}`}
          className="recommendation-item"
          onClick={() => navigate('/recommendations')}
        >
          <div className="recommendation-main">
            <div className="recommendation-icon">
              <ThunderboltOutlined />
            </div>

            <div>
              <Text className="recommendation-title">
                {rec.title}
              </Text>

              <Text className="recommendation-desc">
                {rec.description}
              </Text>

              {rec.currentPrice > 0 && (
                <div className="recommendation-price">
                  {formatCurrencyShort(rec.currentPrice)} →{' '}
                  <strong>{formatCurrencyShort(rec.recommendedPrice)}</strong>
                </div>
              )}
            </div>
          </div>

          <StatusBadge status={rec.status} />
        </div>
      ))}
    </Card>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setApiError('');

      const [productRes, listingsRes] = await Promise.all([
        productAPI.getById(id),
        productAPI.getListings(id),
      ]);

      const listings = Array.isArray(listingsRes.data)
        ? listingsRes.data
        : listingsRes.data?.content || [];

      const normalized = normalizeProduct(productRes.data, listings);

      setProduct(normalized);
    } catch (error) {
      console.error('Product detail fetch error:', error.response?.data || error.message);
      setApiError('Product detail API failed. Check /products/{id} and /products/{id}/listings.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const analysis = useMemo(() => {
    if (!product) return null;
    return analyzeProduct(product);
  }, [product]);

  if (loading) {
    return (
      <Card className="state-card" bordered={false}>
        <Spin size="large" />

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading product analysis...</Text>
        </div>
      </Card>
    );
  }

  if (apiError) {
    return (
      <Card className="state-card" bordered={false}>
        <Alert type="error" showIcon message={apiError} />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="secondary-btn"
          >
            Back to Products
          </Button>
        </div>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="state-card" bordered={false}>
        <Empty description="Product not found" />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="secondary-btn"
          >
            Back to Products
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="product-detail-page">
      <Card className="detail-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="back-btn"
            >
              Back
            </Button>

            <div className="hero-product-icon">
              <ShoppingOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                {product.name}
              </Title>

              <Text className="page-subtitle">
                SKU: {product.sku} · Last updated:{' '}
                {product.updatedAt ? formatDate(product.updatedAt) : '—'}
              </Text>
            </div>
          </div>

          <StatusBadge status={product.status} />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="quick-stats-row">
        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon price">
              <DollarOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Cost Price</span>}
              value={product.costPrice}
              prefix="₹"
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon safe">
              <SafetyOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Min Safe Price</span>}
              value={product.minSafePrice}
              prefix="₹"
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon marketplaces">
              <DatabaseOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Marketplaces</span>}
              value={product.marketplacePrices.length}
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-icon spread">
              <LineChartOutlined />
            </div>

            <Statistic
              title={<span className="stat-label">Price Spread</span>}
              value={analysis.spreadPercentage}
              suffix="%"
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            className="info-card"
            bordered={false}
            title={
              <Space>
                <ShoppingOutlined className="title-icon blue" />
                <span>Product Information</span>
              </Space>
            }
          >
            <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
              <Descriptions.Item label="Product Name">
                <Text strong>{product.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="SKU">
                {product.sku}
              </Descriptions.Item>

              <Descriptions.Item label="Category">
                <Tag className="category-tag">{product.category || '—'}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Brand">
                {product.brand || '—'}
              </Descriptions.Item>

              <Descriptions.Item label="Cost Price">
                <Text className="value-strong">{formatCurrencyShort(product.costPrice)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Min Safe Price">
                <Text className="value-safe">{formatCurrencyShort(product.minSafePrice)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <StatusBadge status={product.status} />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <AnalysisSummary analysis={analysis} />

          <PriceComparisonCard
            prices={product.marketplacePrices}
            minSafePrice={product.minSafePrice}
          />
        </Col>

        <Col xs={24} lg={8}>
          <HealthScoreCard
            score={analysis.healthScore ?? 0}
            verdict={analysis.verdict}
          />

          <ProductRecommendations analysis={analysis} />
        </Col>
      </Row>

      <style>{`
        .product-detail-page {
          width: 100%;
        }

        .detail-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .detail-hero .ant-card-body {
          padding: 24px 28px !important;
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

        .back-btn,
        .secondary-btn {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
          font-weight: 800 !important;
        }

        .back-btn:hover,
        .secondary-btn:hover {
          color: #2563eb !important;
          border-color: #93c5fd !important;
        }

        .hero-product-icon {
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
          font-size: 13px;
          font-weight: 600;
        }

        .quick-stats-row {
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

        .stat-icon.price {
          color: #2563eb;
          background: #eff6ff;
        }

        .stat-icon.safe {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-icon.marketplaces {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .stat-icon.spread {
          color: #ea580c;
          background: #fff7ed;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .info-card,
        .analysis-card,
        .comparison-card,
        .health-score-card,
        .recommendations-card,
        .state-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 16px;
        }

        .state-card {
          text-align: center;
          padding: 46px;
        }

        .info-card .ant-card-head,
        .analysis-card .ant-card-head,
        .comparison-card .ant-card-head,
        .recommendations-card .ant-card-head {
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .info-card .ant-card-head-title,
        .analysis-card .ant-card-head-title,
        .comparison-card .ant-card-head-title,
        .recommendations-card .ant-card-head-title {
          color: #0f172a;
          font-weight: 900;
        }

        .title-icon {
          font-size: 18px;
        }

        .title-icon.blue {
          color: #2563eb;
        }

        .title-icon.purple {
          color: #7c3aed;
        }

        .category-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .value-strong {
          color: #0f172a !important;
          font-weight: 900;
        }

        .value-safe {
          color: #059669 !important;
          font-weight: 900;
        }

        .analysis-card .ant-statistic-title {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .analysis-alert {
          margin-top: 18px;
          border-radius: 14px !important;
        }

        .safe-price-box {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 16px;
          color: #92400e;
          font-size: 13px;
          font-weight: 600;
        }

        .safe-price-box .anticon {
          color: #d97706;
          margin-top: 3px;
        }

        .comparison-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 12px;
          font-weight: 900 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .comparison-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 15px 16px !important;
        }

        .comparison-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .platform-tag,
        .stock-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
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

        .platform-unknown {
          color: #64748b;
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .table-price {
          color: #0f172a !important;
          font-weight: 900;
        }

        .stock-good {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .stock-mid {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .stock-low {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .margin-up,
        .margin-safe {
          color: #059669 !important;
          font-weight: 900;
        }

        .margin-down,
        .margin-risk {
          color: #dc2626 !important;
          font-weight: 900;
        }

        .health-score-card {
          text-align: center;
        }

        .health-score-card .ant-card-body {
          padding: 26px 22px !important;
        }

        .card-eyebrow {
          display: block;
          color: #64748b !important;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .health-progress-wrap {
          margin: 18px 0;
        }

        .health-tag {
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid;
          margin-bottom: 10px;
        }

        .health-tag.healthy {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .health-tag.warning {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .health-tag.critical {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .health-verdict {
          display: block;
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
          margin-top: 4px;
        }

        .recommendations-card .ant-card-body {
          padding: 14px !important;
        }

        .recommendation-item {
          padding: 14px;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .recommendation-item:hover {
          background: #f8fafc;
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .recommendation-main {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .recommendation-icon {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .recommendation-title {
          display: block;
          color: #0f172a !important;
          font-size: 13px;
          font-weight: 900;
        }

        .recommendation-desc {
          display: block;
          color: #64748b !important;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
          margin-top: 3px;
        }

        .recommendation-price {
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          margin-top: 6px;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-left {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .back-btn {
            width: 100%;
          }

          .page-title {
            font-size: 22px !important;
          }

          .comparison-card {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;