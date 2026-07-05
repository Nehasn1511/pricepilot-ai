import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Statistic,
  Input,
  Badge,
  Tabs,
  Select,
  Checkbox,
  notification,
  Spin,
  Empty,
  Alert,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  SafetyOutlined,
  RobotOutlined,
  ExperimentOutlined,
  AimOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  GiftOutlined,
  RiseOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const getTenantId = () => {
  return localStorage.getItem('tenantId') || 1;
};

const typeConfig = {
  PRICE_MATCH: {
    label: 'Price Match',
    Icon: AimOutlined,
    className: 'type-price-match',
  },
  TEMPORARY_DISCOUNT: {
    label: 'Temporary Discount',
    Icon: ClockCircleOutlined,
    className: 'type-discount',
  },
  STOCK_CLEARANCE: {
    label: 'Stock Clearance',
    Icon: InboxOutlined,
    className: 'type-clearance',
  },
  MARGIN_PROTECTION: {
    label: 'Margin Protection',
    Icon: SafetyCertificateOutlined,
    className: 'type-margin',
  },
  BUNDLE_OFFER: {
    label: 'Bundle Offer',
    Icon: GiftOutlined,
    className: 'type-bundle',
  },
  PRICE_INCREASE: {
    label: 'Price Increase',
    Icon: RiseOutlined,
    className: 'type-increase',
  },
};

const riskConfig = {
  LOW: {
    text: 'Low Risk',
    className: 'risk-low',
  },
  MEDIUM: {
    text: 'Medium Risk',
    className: 'risk-medium',
  },
  HIGH: {
    text: 'High Risk',
    className: 'risk-high',
  },
};

const platformConfig = {
  AMAZON: 'platform-amazon',
  FLIPKART: 'platform-flipkart',
  MEESHO: 'platform-meesho',
  MYNTRA: 'platform-myntra',
  SHOPIFY: 'platform-shopify',
  OTHER: 'platform-default',
};

const firstValue = (...values) => {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ''
  );
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

const getArrayData = (res) => {
  if (Array.isArray(res.data)) return res.data;
  return res.data?.content || [];
};

const buildMaps = (products = [], listings = []) => {
  const productMap = {};
  const listingMap = {};

  products.forEach((p) => {
    const productData = {
      id: p.id,
      name: firstValue(
        p.name,
        p.productName,
        p.title,
        `Product #${p.id}`
      ),
      brand: p.brand || '—',
      category: p.category || '—',
      minSafePrice: p.minSafePrice || p.minimumSafePrice || p.costPrice || 0,
    };

    [
      p.id,
      p.productId,
      p.masterProductId,
      p.master_product_id,
    ].forEach((id) => {
      if (id !== undefined && id !== null) {
        productMap[String(id)] = productData;
      }
    });
  });

  listings.forEach((item) => {
    const listing = item.listing || {};
    const product = item.product || {};

    [
      listing.id,
      listing.marketplaceProductId,
      listing.marketplace_product_id,
      listing.marketplaceListingId,
      listing.marketplace_listing_id,
      listing.listingId,
      listing.listing_id,
    ].forEach((id) => {
      if (id !== undefined && id !== null) {
        listingMap[String(id)] = {
          listing,
          product,
        };
      }
    });
  });

  return { productMap, listingMap };
};

const normalizeRecommendation = (r, productMap = {}, listingMap = {}) => {
  const marketplaceProduct =
    r.marketplaceProduct ||
    r.marketplaceListing ||
    r.listing ||
    {};

  const possibleListingId = firstValue(
    r.marketplaceProductId,
    r.marketplace_product_id,
    r.marketplaceListingId,
    r.marketplace_listing_id,
    r.listingId,
    r.listing_id,
    marketplaceProduct.id,
    marketplaceProduct.marketplaceProductId,
    marketplaceProduct.marketplace_product_id,
    marketplaceProduct.marketplaceListingId,
    marketplaceProduct.marketplace_listing_id,
    marketplaceProduct.listingId,
    marketplaceProduct.listing_id
  );

  const mappedListing = possibleListingId
    ? listingMap[String(possibleListingId)]
    : null;

  const masterProduct =
    r.masterProduct ||
    r.product ||
    marketplaceProduct.masterProduct ||
    marketplaceProduct.product ||
    mappedListing?.product ||
    {};

  const possibleProductId = firstValue(
    r.productId,
    r.masterProductId,
    r.product_id,
    r.master_product_id,
    r.masterProduct?.id,
    r.product?.id,
    marketplaceProduct.productId,
    marketplaceProduct.masterProductId,
    marketplaceProduct.product_id,
    marketplaceProduct.master_product_id,
    marketplaceProduct.product?.id,
    marketplaceProduct.masterProduct?.id,
    mappedListing?.product?.id
  );

  const mappedProduct = possibleProductId
    ? productMap[String(possibleProductId)]
    : null;

  const productName = firstValue(
    r.productName,
    r.masterProductName,
    r.product_name,
    r.master_product_name,
    masterProduct.name,
    masterProduct.productName,
    marketplaceProduct.productName,
    marketplaceProduct.name,
    mappedProduct?.name,
    mappedListing?.product?.name,
    mappedListing?.product?.productName
  );

  const isLinkedToRealProduct = Boolean(
    productName ||
    mappedProduct ||
    mappedListing?.product?.id ||
    mappedListing?.product?.name
  );

  return {
    id: r.id,

    isLinkedToRealProduct,

    productName: productName || 'Unlinked Recommendation',

    platform: firstValue(
      r.platform,
      r.marketplace,
      marketplaceProduct.platform,
      marketplaceProduct.marketplace,
      mappedListing?.listing?.platform,
      mappedListing?.listing?.marketplace,
      'AMAZON'
    ),

    recommendationType: firstValue(
      r.recommendationType,
      r.type,
      'PRICE_MATCH'
    ),

    currentPrice: toNumber(
      firstValue(
        r.currentPrice,
        marketplaceProduct.currentPrice,
        marketplaceProduct.price,
        marketplaceProduct.sellingPrice,
        mappedListing?.listing?.currentPrice,
        mappedListing?.listing?.price,
        mappedListing?.listing?.sellingPrice
      )
    ),

    recommendedPrice: toNumber(r.recommendedPrice),

    minimumSafePrice: toNumber(
      firstValue(
        r.minimumSafePrice,
        r.minSafePrice,
        masterProduct.minimumSafePrice,
        masterProduct.minSafePrice,
        masterProduct.costPrice,
        mappedProduct?.minSafePrice,
        mappedListing?.product?.minSafePrice,
        mappedListing?.product?.minimumSafePrice,
        mappedListing?.product?.costPrice
      )
    ),

    lowestMarketPrice: toNumber(
      firstValue(
        r.lowestMarketPrice,
        r.marketLowPrice,
        r.competitorPrice,
        marketplaceProduct.lowestMarketPrice,
        mappedListing?.listing?.lowestMarketPrice
      )
    ),

    discountPercent: toNumber(r.discountPercent),

    reason: firstValue(
      r.reason,
      r.message,
      'No reason provided.'
    ),

    aiExplanation: firstValue(
      r.aiExplanation,
      r.explanation,
      r.aiReason,
      ''
    ),

    riskLevel: firstValue(r.riskLevel, 'LOW'),

    expectedImpact: firstValue(
      r.expectedImpact,
      'Not calculated'
    ),

    durationDays: firstValue(r.durationDays, null),

    status: firstValue(r.status, 'PENDING'),

    viewsLast7Days: toNumber(
      firstValue(
        r.viewsLast7Days,
        marketplaceProduct.viewsLast7Days,
        marketplaceProduct.views,
        mappedListing?.listing?.viewsLast7Days
      )
    ),

    ordersLast7Days: toNumber(
      firstValue(
        r.ordersLast7Days,
        marketplaceProduct.ordersLast7Days,
        marketplaceProduct.orders,
        mappedListing?.listing?.ordersLast7Days
      )
    ),

    stockQuantity: toNumber(
      firstValue(
        r.stockQuantity,
        marketplaceProduct.stockQuantity,
        marketplaceProduct.stock,
        marketplaceProduct.inventory,
        mappedListing?.listing?.stockQuantity,
        mappedListing?.listing?.stock,
        mappedListing?.listing?.inventory
      )
    ),
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

export default function Recommendations() {
  const [notificationApi, contextHolder] = notification.useNotification();

  const [recs, setRecs] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [comments, setComments] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [hiddenStaleCount, setHiddenStaleCount] = useState(0);
  const [hiddenDuplicateCount, setHiddenDuplicateCount] = useState(0);
  const [marketplaceListingCount, setMarketplaceListingCount] = useState(0);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      setApiError('');
      setHiddenStaleCount(0);
      setHiddenDuplicateCount(0);

      const tenantId = getTenantId();

      const [recommendationsRes, productsRes] = await Promise.all([
        axiosClient.get('/recommendations', {
          params: { tenantId },
        }),
        axiosClient.get('/products', {
          params: { tenantId },
        }),
      ]);

      const recommendations = getArrayData(recommendationsRes);
      const products = getArrayData(productsRes);

      const listingsResults = await Promise.allSettled(
        products.map((product) =>
          axiosClient.get(`/products/${product.id}/listings`, {
            params: { tenantId },
          })
        )
      );

      const allListings = [];

      listingsResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const product = products[index];

          const listings = Array.isArray(result.value.data)
            ? result.value.data
            : result.value.data?.content || [];

          listings.forEach((listing) => {
            allListings.push({
              product,
              listing,
            });
          });
        }
      });

      setMarketplaceListingCount(allListings.length);

      const { productMap, listingMap } = buildMaps(products, allListings);

      const mapped = recommendations.map((rec) =>
        normalizeRecommendation(rec, productMap, listingMap)
      );

      const linkedOnly = mapped.filter((rec) => rec.isLinkedToRealProduct);
      const deduped = removeDuplicateRecommendations(linkedOnly);

      setHiddenStaleCount(mapped.length - linkedOnly.length);
      setHiddenDuplicateCount(linkedOnly.length - deduped.length);

      console.log('Recommendations API:', recommendations);
      console.log('Products API:', products);
      console.log('All Listings:', allListings);
      console.log('Mapped Recommendations:', mapped);
      console.log('Visible Recommendations:', deduped);

      setRecs(deduped);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error.response?.data || error.message);

      setApiError('Failed to load recommendations from backend. Check backend API.');

      notificationApi.error({
        message: 'Failed to load recommendations',
        description: error.response?.data?.message || 'Check backend API and console.',
        placement: 'topRight',
      });

      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const filtered = useMemo(() => {
    return recs.filter((r) => {
      const statusMatch = activeTab === 'ALL' || r.status === activeTab;
      const typeMatch = !typeFilter || r.recommendationType === typeFilter;

      return statusMatch && typeMatch;
    });
  }, [recs, activeTab, typeFilter]);

  const counts = useMemo(() => ({
    ALL: recs.length,
    PENDING: recs.filter((r) => r.status === 'PENDING').length,
    APPROVED: recs.filter((r) => r.status === 'APPROVED').length,
    REJECTED: recs.filter((r) => r.status === 'REJECTED').length,
  }), [recs]);

  const updateStatus = (id, status) => {
    setRecs((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );
  };

  const handleApprove = async (id) => {
    if (!id) return;

    const tenantId = getTenantId();

    updateStatus(id, 'APPROVED');

    try {
      await axiosClient.patch(
        `/recommendations/${id}/approve`,
        { comments },
        { params: { tenantId } }
      );

      notificationApi.success({
        message: 'Recommendation approved',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Approval failed:', error.response?.data || error.message);

      updateStatus(id, 'PENDING');

      notificationApi.error({
        message: 'Approval failed',
        description: error.response?.data?.message || 'Try again.',
        placement: 'topRight',
      });
    }

    setApproveModal(null);
    setComments('');
  };

  const handleReject = async (id) => {
    if (!id) return;

    const tenantId = getTenantId();

    updateStatus(id, 'REJECTED');

    try {
      await axiosClient.patch(
        `/recommendations/${id}/reject`,
        { comments },
        { params: { tenantId } }
      );

      notificationApi.info({
        message: 'Recommendation rejected',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Rejection failed:', error.response?.data || error.message);

      updateStatus(id, 'PENDING');

      notificationApi.error({
        message: 'Rejection failed',
        description: error.response?.data?.message || 'Try again.',
        placement: 'topRight',
      });
    }

    setRejectModal(null);
    setComments('');
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;

    const tenantId = getTenantId();

    setBulkLoading(true);

    selectedIds.forEach((id) => updateStatus(id, 'APPROVED'));

    let success = 0;
    const failed = [];

    await Promise.allSettled(
      selectedIds.map((id) =>
        axiosClient.patch(
          `/recommendations/${id}/approve`,
          {},
          { params: { tenantId } }
        )
          .then(() => {
            success += 1;
          })
          .catch(() => {
            failed.push(id);
          })
      )
    );

    failed.forEach((id) => updateStatus(id, 'PENDING'));

    setSelectedIds([]);
    setBulkLoading(false);

    if (success > 0) {
      notificationApi.success({
        message: `${success} recommendation(s) approved`,
        placement: 'topRight',
      });
    }

    if (failed.length > 0) {
      notificationApi.error({
        message: `${failed.length} recommendation(s) failed`,
        placement: 'topRight',
      });
    }
  };

  const handleGenerateNew = async () => {
    try {
      if (marketplaceListingCount === 0) {
        notificationApi.warning({
          message: 'No marketplace listing found',
          description:
            'Add Amazon/Flipkart/Meesho listing for your product first. Recommendations need platform price data.',
          placement: 'topRight',
        });
        return;
      }

      setGenerateLoading(true);

      const tenantId = getTenantId();

      await axiosClient.post('/recommendations/actions/generate-all', null, {
        params: { tenantId },
      });

      notificationApi.success({
        message: 'Recommendations generated successfully',
        placement: 'topRight',
      });

      await fetchRecs();
    } catch (error) {
      console.error('Generate recommendations failed:', error.response?.data || error.message);

      notificationApi.error({
        message: 'Failed to generate recommendations',
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Check backend generate API.',
        placement: 'topRight',
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const pendingInFiltered = filtered.filter((r) => r.status === 'PENDING');

  const tabItems = [
    {
      key: 'ALL',
      label: (
        <span className="tab-label">
          All <Badge count={counts.ALL} className="tab-badge neutral" />
        </span>
      ),
    },
    {
      key: 'PENDING',
      label: (
        <span className="tab-label">
          Pending <Badge count={counts.PENDING} className="tab-badge pending" />
        </span>
      ),
    },
    {
      key: 'APPROVED',
      label: (
        <span className="tab-label">
          Approved <Badge count={counts.APPROVED} className="tab-badge approved" />
        </span>
      ),
    },
    {
      key: 'REJECTED',
      label: (
        <span className="tab-label">
          Rejected <Badge count={counts.REJECTED} className="tab-badge rejected" />
        </span>
      ),
    },
  ];

  return (
    <div className="recommendations-page">
      {contextHolder}

      <Card className="recommendations-hero" bordered={false}>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-icon">
              <RobotOutlined />
            </div>

            <div>
              <Title level={3} className="page-title">
                AI Recommendations
              </Title>

              <Text className="page-subtitle">
                Review, approve, or reject automated pricing optimizations.
              </Text>
            </div>
          </div>

          <Space wrap className="hero-actions">
            <Tooltip title="Refresh recommendations">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRecs}
                loading={loading}
                className="secondary-btn"
              >
                Refresh
              </Button>
            </Tooltip>

            {selectedIds.length > 0 && (
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={bulkLoading}
                onClick={handleBulkApprove}
                className="success-btn"
              >
                Approve {selectedIds.length} Selected
              </Button>
            )}

            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={handleGenerateNew}
              loading={generateLoading}
              className="primary-btn"
            >
              Generate New
            </Button>
          </Space>
        </div>
      </Card>

      {apiError && (
        <Alert
          type="error"
          showIcon
          message={apiError}
          className="page-alert"
        />
      )}

      {hiddenStaleCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${hiddenStaleCount} old/unlinked recommendation(s) hidden`}
          description="These recommendations exist in backend but are not linked to your current product or marketplace listing. Clear old recommendations from DB or regenerate after adding product listings."
          className="page-alert"
        />
      )}

      {hiddenDuplicateCount > 0 && (
        <Alert
          type="info"
          showIcon
          message={`${hiddenDuplicateCount} duplicate recommendation(s) hidden`}
          description="Duplicate recommendations were generated by backend. The UI is showing only one copy."
          className="page-alert"
        />
      )}

      {marketplaceListingCount === 0 && !loading && (
        <Alert
          type="info"
          showIcon
          message="No marketplace listing connected"
          description="Your Products page may show a product, but recommendations need marketplace listing data such as Amazon price, stock, views, and orders."
          className="page-alert"
        />
      )}

      <Row gutter={[16, 16]} className="stats-row">
        {[
          {
            label: 'Pending',
            value: counts.PENDING,
            icon: <ClockCircleOutlined />,
            className: 'pending',
          },
          {
            label: 'Approved',
            value: counts.APPROVED,
            icon: <CheckCircleOutlined />,
            className: 'approved',
          },
          {
            label: 'Rejected',
            value: counts.REJECTED,
            icon: <CloseCircleOutlined />,
            className: 'rejected',
          },
          {
            label: 'Total',
            value: counts.ALL,
            icon: <DatabaseOutlined />,
            className: 'total',
          },
        ].map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.label}>
            <Card className="stat-card" bordered={false}>
              <div className={`stat-icon ${item.className}`}>
                {item.icon}
              </div>

              <Statistic
                title={<span className="stat-label">{item.label}</span>}
                value={item.value}
                valueStyle={{
                  color: '#0f172a',
                  fontWeight: 900,
                  fontSize: 28,
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="tabs-card" bordered={false}>
        <div className="tabs-toolbar">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setSelectedIds([]);
            }}
            items={tabItems}
            className="recommendation-tabs"
          />

          <Select
            placeholder="All Types"
            allowClear
            size="large"
            value={typeFilter || undefined}
            className="type-select"
            onChange={(value) => setTypeFilter(value || '')}
            options={Object.entries(typeConfig).map(([key, value]) => ({
              label: value.label,
              value: key,
            }))}
          />
        </div>
      </Card>

      {activeTab === 'PENDING' && pendingInFiltered.length > 0 && (
        <Card className="selection-card" bordered={false}>
          <div className="selection-content">
            <Checkbox
              checked={selectedIds.length === pendingInFiltered.length}
              indeterminate={
                selectedIds.length > 0 &&
                selectedIds.length < pendingInFiltered.length
              }
              onChange={(e) =>
                setSelectedIds(
                  e.target.checked
                    ? pendingInFiltered.map((r) => r.id)
                    : []
                )
              }
            />

            <Text className="selection-text">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${pendingInFiltered.length} pending selected`
                : `Select all ${pendingInFiltered.length} pending recommendations`}
            </Text>

            {selectedIds.length > 0 && (
              <Tag className="active-filter-tag" icon={<FilterOutlined />}>
                Bulk action enabled
              </Tag>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="loading-card" bordered={false}>
          <Spin size="large" />

          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading recommendations...</Text>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="empty-card" bordered={false}>
          <Empty
            image={
              <RobotOutlined
                style={{
                  fontSize: 44,
                  marginBottom: 12,
                  color: '#94a3b8',
                }}
              />
            }
            description={
              marketplaceListingCount === 0
                ? 'No marketplace listing found. Add a platform listing for your product first.'
                : activeTab === 'ALL'
                  ? 'No linked AI recommendations found. Click Generate New after adding listings.'
                  : `No ${activeTab.toLowerCase()} recommendations.`
            }
          >
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={handleGenerateNew}
              loading={generateLoading}
              className="primary-btn"
            >
              Generate New
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="recommendation-list">
          {filtered.map((rec) => {
            const typeMeta = typeConfig[rec.recommendationType];
            const TypeIcon = typeMeta?.Icon;
            const riskMeta = riskConfig[rec.riskLevel] || riskConfig.LOW;
            const priceDirection = rec.recommendedPrice < rec.currentPrice ? 'down' : 'up';

            return (
              <Card
                key={rec.id}
                className={`recommendation-card ${
                  rec.status !== 'PENDING' ? 'completed' : ''
                } ${
                  rec.riskLevel === 'HIGH'
                    ? 'risk-border-high'
                    : rec.riskLevel === 'MEDIUM'
                      ? 'risk-border-medium'
                      : ''
                }`}
                bordered={false}
              >
                <Row gutter={[24, 20]}>
                  <Col xs={24} lg={16}>
                    <div className="rec-header">
                      <div className="rec-title-wrap">
                        {rec.status === 'PENDING' && (
                          <Checkbox
                            checked={selectedIds.includes(rec.id)}
                            onChange={() => toggleSelect(rec.id)}
                          />
                        )}

                        <div className="rec-product-icon">
                          <ShoppingOutlined />
                        </div>

                        <div>
                          <Title level={5} className="rec-title">
                            {rec.productName}
                          </Title>

                          <div className="rec-tags">
                            <Tag
                              className={`platform-tag ${
                                platformConfig[rec.platform] || 'platform-default'
                              }`}
                            >
                              {rec.platform}
                            </Tag>

                            <Tag className={`type-tag ${typeMeta?.className || ''}`}>
                              {TypeIcon && <TypeIcon />}
                              {typeMeta?.label || rec.recommendationType}
                            </Tag>

                            <Tag className={`risk-tag ${riskMeta.className}`}>
                              {riskMeta.text || rec.riskLevel}
                            </Tag>

                            {rec.status !== 'PENDING' && (
                              <Tag
                                className={`status-tag ${
                                  rec.status === 'APPROVED'
                                    ? 'status-approved'
                                    : 'status-rejected'
                                }`}
                              >
                                {rec.status}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="price-panel">
                      <div className="price-box">
                        <Text className="price-label">Current</Text>
                        <Text className="price-value">
                          {formatCurrency(rec.currentPrice)}
                        </Text>
                      </div>

                      <div className="price-arrow">→</div>

                      <div className="price-box highlighted">
                        <Text className="price-label">Recommended</Text>
                        <Text
                          className={`price-value ${
                            priceDirection === 'down' ? 'price-down' : 'price-up'
                          }`}
                        >
                          {formatCurrency(rec.recommendedPrice)}

                          {rec.discountPercent > 0 && (
                            <ArrowDownOutlined className="price-trend" />
                          )}

                          {rec.discountPercent < 0 && (
                            <ArrowUpOutlined className="price-trend" />
                          )}
                        </Text>
                      </div>

                      <div className="price-box">
                        <Text className="price-label">Safe Price</Text>
                        <Text className="price-value safe">
                          {formatCurrency(rec.minimumSafePrice)}
                        </Text>
                      </div>

                      <div className="price-box">
                        <Text className="price-label">Market Low</Text>
                        <Text className="price-value">
                          {formatCurrency(rec.lowestMarketPrice)}
                        </Text>
                      </div>
                    </div>

                    <div className="reason-box">
                      <SafetyOutlined />
                      <Text>{rec.reason}</Text>
                    </div>

                    {rec.aiExplanation && (
                      <Card className="ai-analysis-card" bordered={false}>
                        <Space align="start">
                          <div className="ai-icon">
                            <RobotOutlined />
                          </div>

                          <div>
                            <Text className="ai-title">AI Analysis</Text>

                            <Paragraph className="ai-copy">
                              {rec.aiExplanation}
                            </Paragraph>
                          </div>
                        </Space>
                      </Card>
                    )}
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card className="metrics-card" bordered={false}>
                      <Row gutter={[12, 12]}>
                        <Col span={8}>
                          <Statistic
                            title="Views"
                            value={rec.viewsLast7Days}
                            valueStyle={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#0f172a',
                            }}
                          />
                        </Col>

                        <Col span={8}>
                          <Statistic
                            title="Orders"
                            value={rec.ordersLast7Days}
                            valueStyle={{
                              fontSize: 17,
                              fontWeight: 900,
                              color:
                                rec.ordersLast7Days === 0
                                  ? '#dc2626'
                                  : '#0f172a',
                            }}
                          />
                        </Col>

                        <Col span={8}>
                          <Statistic
                            title="Stock"
                            value={rec.stockQuantity}
                            valueStyle={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#0f172a',
                            }}
                          />
                        </Col>
                      </Row>
                    </Card>

                    <div className="impact-box">
                      <div className="impact-row">
                        <Text className="impact-label">Impact</Text>
                        <Text className="impact-value">{rec.expectedImpact}</Text>
                      </div>

                      {rec.durationDays && (
                        <div className="impact-row">
                          <Text className="impact-label">Duration</Text>
                          <Text className="impact-value">{rec.durationDays} days</Text>
                        </div>
                      )}
                    </div>

                    {rec.status === 'PENDING' ? (
                      <Space direction="vertical" className="action-stack">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          block
                          onClick={() => setApproveModal(rec)}
                          className="approve-btn"
                        >
                          Approve
                        </Button>

                        <Button
                          danger
                          icon={<CloseOutlined />}
                          block
                          onClick={() => setRejectModal(rec)}
                          className="reject-btn"
                        >
                          Reject
                        </Button>
                      </Space>
                    ) : (
                      <Tag
                        className={`final-status-tag ${
                          rec.status === 'APPROVED'
                            ? 'status-approved'
                            : 'status-rejected'
                        }`}
                      >
                        {rec.status}
                      </Tag>
                    )}
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon approve">
              <CheckOutlined />
            </div>

            <div>
              <Title level={4}>Approve Recommendation</Title>
              <Text>Confirm this price recommendation before applying it.</Text>
            </div>
          </div>
        }
        open={!!approveModal}
        onOk={() => handleApprove(approveModal?.id)}
        onCancel={() => {
          setApproveModal(null);
          setComments('');
        }}
        okText="Yes, Approve"
        okButtonProps={{
          className: 'approve-btn',
          size: 'large',
        }}
        cancelButtonProps={{
          className: 'secondary-btn',
          size: 'large',
        }}
        width={560}
        centered
        styles={{
          content: {
            borderRadius: 22,
            padding: '28px 32px',
          },
        }}
      >
        <div className="modal-body-wrap">
          <div className="approval-summary">
            <Text className="modal-small-label">Price change for</Text>

            <Text className="modal-product-name">
              {approveModal?.productName}
            </Text>

            <div className="modal-price-grid">
              <div>
                <Text className="price-label">Current</Text>
                <Text className="modal-price">
                  {formatCurrency(approveModal?.currentPrice)}
                </Text>
              </div>

              <div className="modal-arrow">→</div>

              <div>
                <Text className="price-label">Recommended</Text>
                <Text className="modal-price approved">
                  {formatCurrency(approveModal?.recommendedPrice)}
                </Text>
              </div>

              <div>
                <Text className="price-label">Safe Price</Text>
                <Text className="modal-price safe">
                  {formatCurrency(approveModal?.minimumSafePrice)}
                </Text>
              </div>
            </div>
          </div>

          <TextArea
            placeholder="Optional approval comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="comment-area"
          />
        </div>
      </Modal>

      <Modal
        title={
          <div className="modal-title-wrap">
            <div className="modal-icon reject">
              <CloseOutlined />
            </div>

            <div>
              <Title level={4}>Reject Recommendation</Title>
              <Text>Add an optional reason before rejecting this recommendation.</Text>
            </div>
          </div>
        }
        open={!!rejectModal}
        onOk={() => handleReject(rejectModal?.id)}
        onCancel={() => {
          setRejectModal(null);
          setComments('');
        }}
        okText="Yes, Reject"
        okButtonProps={{
          danger: true,
          size: 'large',
          className: 'reject-btn',
        }}
        cancelButtonProps={{
          className: 'secondary-btn',
          size: 'large',
        }}
        width={520}
        centered
        styles={{
          content: {
            borderRadius: 22,
            padding: '28px 32px',
          },
        }}
      >
        <div className="modal-body-wrap">
          <Paragraph className="reject-copy">
            Reject recommendation for{' '}
            <Text strong>{rejectModal?.productName}</Text>?
          </Paragraph>

          <TextArea
            placeholder="Reason for rejection optional..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="comment-area"
          />
        </div>
      </Modal>

      <style>{`
        .recommendations-page {
          width: 100%;
        }

        .recommendations-hero {
          border-radius: 22px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .recommendations-hero .ant-card-body {
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

        .primary-btn,
        .success-btn,
        .approve-btn {
          height: 42px !important;
          border-radius: 11px !important;
          font-weight: 800 !important;
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.16);
        }

        .primary-btn {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        .primary-btn:hover {
          background: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
        }

        .success-btn,
        .approve-btn {
          background: #059669 !important;
          border-color: #059669 !important;
          color: #ffffff !important;
        }

        .success-btn:hover,
        .approve-btn:hover {
          background: #047857 !important;
          border-color: #047857 !important;
          color: #ffffff !important;
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

        .reject-btn {
          height: 42px !important;
          border-radius: 11px !important;
          font-weight: 800 !important;
        }

        .page-alert {
          border-radius: 14px !important;
          margin-bottom: 18px;
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

        .stat-icon.pending {
          color: #d97706;
          background: #fffbeb;
        }

        .stat-icon.approved {
          color: #059669;
          background: #ecfdf5;
        }

        .stat-icon.rejected {
          color: #dc2626;
          background: #fef2f2;
        }

        .stat-icon.total {
          color: #2563eb;
          background: #eff6ff;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .tabs-card {
          border-radius: 18px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 16px;
        }

        .tabs-card .ant-card-body {
          padding: 0 20px !important;
        }

        .tabs-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .recommendation-tabs {
          flex: 1;
          min-width: 320px;
        }

        .recommendation-tabs .ant-tabs-nav {
          margin: 0 !important;
        }

        .recommendation-tabs .ant-tabs-tab {
          font-weight: 800;
        }

        .recommendation-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #2563eb !important;
        }

        .recommendation-tabs .ant-tabs-ink-bar {
          background: #2563eb !important;
          height: 3px !important;
          border-radius: 999px;
        }

        .tab-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .tab-badge .ant-badge-count {
          box-shadow: none;
          font-weight: 800;
        }

        .tab-badge.neutral .ant-badge-count {
          background: #64748b;
        }

        .tab-badge.pending .ant-badge-count {
          background: #d97706;
        }

        .tab-badge.approved .ant-badge-count {
          background: #059669;
        }

        .tab-badge.rejected .ant-badge-count {
          background: #dc2626;
        }

        .type-select {
          width: 240px;
          margin: 12px 0;
        }

        .type-select .ant-select-selector {
          height: 42px !important;
          border-radius: 11px !important;
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }

        .type-select:hover .ant-select-selector {
          border-color: #93c5fd !important;
        }

        .type-select.ant-select-focused .ant-select-selector {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .selection-card {
          border-radius: 16px !important;
          border: 1px solid #bfdbfe !important;
          background: #eff6ff !important;
          margin-bottom: 16px;
        }

        .selection-card .ant-card-body {
          padding: 14px 18px !important;
        }

        .selection-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .selection-text {
          color: #334155 !important;
          font-size: 13px;
          font-weight: 700;
        }

        .active-filter-tag {
          color: #2563eb;
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 11px;
        }

        .loading-card,
        .empty-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          text-align: center;
          padding: 42px;
        }

        .recommendation-list {
          display: grid;
          gap: 16px;
        }

        .recommendation-card {
          border-radius: 20px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
          transition: all 0.2s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 52px rgba(15, 23, 42, 0.09);
        }

        .recommendation-card.completed {
          opacity: 0.88;
        }

        .recommendation-card.risk-border-high {
          border-color: #fecaca !important;
        }

        .recommendation-card.risk-border-medium {
          border-color: #fde68a !important;
        }

        .recommendation-card .ant-card-body {
          padding: 24px !important;
        }

        .rec-header {
          margin-bottom: 16px;
        }

        .rec-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .rec-product-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .rec-title {
          margin: 0 0 8px !important;
          color: #0f172a !important;
          font-weight: 900 !important;
        }

        .rec-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .platform-tag,
        .type-tag,
        .risk-tag,
        .status-tag,
        .final-status-tag {
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .platform-default {
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

        .type-price-match {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .type-discount {
          color: #ea580c;
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .type-clearance {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .type-margin {
          color: #7c3aed;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .type-bundle {
          color: #0891b2;
          background: #ecfeff;
          border-color: #a5f3fc;
        }

        .type-increase {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .risk-low {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .risk-medium {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .risk-high {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .status-approved {
          color: #059669;
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .status-rejected {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .price-panel {
          display: grid;
          grid-template-columns: 1fr auto 1fr 1fr 1fr;
          gap: 14px;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
        }

        .price-box {
          display: grid;
          gap: 4px;
        }

        .price-box.highlighted {
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
        }

        .price-label {
          color: #64748b !important;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .price-value {
          color: #0f172a !important;
          font-size: 18px;
          font-weight: 900;
        }

        .price-value.safe {
          color: #7c3aed !important;
        }

        .price-down {
          color: #059669 !important;
        }

        .price-up {
          color: #dc2626 !important;
        }

        .price-trend {
          font-size: 12px;
          margin-left: 5px;
        }

        .price-arrow {
          color: #94a3b8;
          font-size: 20px;
          font-weight: 900;
        }

        .reason-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .reason-box .anticon {
          color: #2563eb;
          margin-top: 3px;
        }

        .ai-analysis-card {
          background: #eff6ff !important;
          border: 1px solid #bfdbfe !important;
          border-radius: 16px !important;
        }

        .ai-analysis-card .ant-card-body {
          padding: 16px !important;
        }

        .ai-icon {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: #ffffff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .ai-title {
          color: #2563eb !important;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .ai-copy {
          margin: 4px 0 0 !important;
          color: #334155 !important;
          font-size: 13px;
          line-height: 1.6;
        }

        .metrics-card {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          margin-bottom: 14px;
        }

        .metrics-card .ant-card-body {
          padding: 16px !important;
        }

        .metrics-card .ant-statistic-title {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .impact-box {
          display: grid;
          gap: 9px;
          margin-bottom: 14px;
        }

        .impact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }

        .impact-label {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 800;
        }

        .impact-value {
          color: #0f172a !important;
          font-size: 13px;
          font-weight: 900;
          text-align: right;
        }

        .action-stack {
          width: 100%;
          margin-top: 8px;
        }

        .final-status-tag {
          margin-top: 10px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .modal-icon.approve {
          color: #059669;
          background: #ecfdf5;
        }

        .modal-icon.reject {
          color: #dc2626;
          background: #fef2f2;
        }

        .modal-body-wrap {
          margin-top: 24px;
        }

        .approval-summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .modal-small-label {
          color: #64748b !important;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .modal-product-name {
          display: block;
          color: #0f172a !important;
          font-size: 16px;
          font-weight: 900;
          margin: 4px 0 14px;
        }

        .modal-price-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr 1fr;
          gap: 14px;
          align-items: center;
        }

        .modal-arrow {
          color: #94a3b8;
          font-size: 20px;
          font-weight: 900;
        }

        .modal-price {
          display: block;
          color: #0f172a !important;
          font-size: 19px;
          font-weight: 900;
          margin-top: 3px;
        }

        .modal-price.approved {
          color: #059669 !important;
        }

        .modal-price.safe {
          color: #7c3aed !important;
        }

        .comment-area {
          border-radius: 12px !important;
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }

        .comment-area:hover {
          border-color: #93c5fd !important;
        }

        .comment-area:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .reject-copy {
          color: #334155 !important;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .price-panel {
            grid-template-columns: 1fr 1fr;
          }

          .price-arrow {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .hero-content,
          .tabs-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-left {
            align-items: flex-start;
          }

          .hero-actions,
          .hero-actions .ant-btn,
          .type-select {
            width: 100%;
          }

          .recommendation-tabs {
            width: 100%;
            min-width: 0;
          }

          .price-panel {
            grid-template-columns: 1fr;
          }

          .modal-price-grid {
            grid-template-columns: 1fr;
          }

          .modal-arrow {
            display: none;
          }

          .page-title {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}