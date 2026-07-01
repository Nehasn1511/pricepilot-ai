import { Table, Tag, Progress, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyShort, getHealthScoreColor } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

const MARKETPLACE_COLORS = {
  amazon:      { color: '#fa8c16', bg: '#fff7e6' },
  flipkart:    { color: '#1677ff', bg: '#e6f4ff' },
  shopify:     { color: '#52c41a', bg: '#f6ffed' },
  woocommerce: { color: '#722ed1', bg: '#f9f0ff' },
  myntra:      { color: '#eb2f96', bg: '#fff0f6' },
  meesho:      { color: '#13c2c2', bg: '#e6fffb' },
};

const MarketplaceBadge = ({ marketplace }) => {
  const m = marketplace?.toLowerCase();
  const cfg = MARKETPLACE_COLORS[m] || { color: '#666', bg: '#f5f5f5' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      color: cfg.color, background: cfg.bg, textTransform: 'capitalize',
    }}>
      {marketplace}
    </span>
  );
};

const columns = [
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    render: (text) => (
      <Tooltip title={text}>
        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    width: 130,
    render: (sku) => (
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#666' }}>{sku}</span>
    ),
  },
  {
    title: 'Marketplace',
    dataIndex: 'marketplace',
    key: 'marketplace',
    width: 130,
    render: (m) => <MarketplaceBadge marketplace={m} />,
  },
  {
    title: 'Price',
    dataIndex: 'currentPrice',
    key: 'currentPrice',
    width: 110,
    align: 'right',
    render: (price) => (
      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
        {formatCurrencyShort(price)}
      </span>
    ),
  },
  {
    title: 'Health Score',
    dataIndex: 'healthScore',
    key: 'healthScore',
    width: 160,
    render: (score) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={score}
          size="small"
          showInfo={false}
          strokeColor={getHealthScoreColor(score)}
          style={{ flex: 1, margin: 0 }}
        />
        <span style={{
          fontSize: 12, fontWeight: 700, width: 28, textAlign: 'right',
          color: getHealthScoreColor(score),
        }}>
          {score}
        </span>
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (status) => <StatusBadge status={status} />,
  },
];

const ProductTable = ({ data, loading, pagination, onChange }) => {
  const navigate = useNavigate();

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={{
        current:   pagination.page + 1,   // Ant Design is 1-based, Spring is 0-based
        pageSize:  pagination.size,
        total:     pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `${total} products`,
        pageSizeOptions: ['10', '20', '50'],
      }}
      onChange={(pag) => onChange({ page: pag.current - 1, size: pag.pageSize })}
      onRow={(record) => ({
        onClick: () => navigate(`/products/${record.id}`),
        style: { cursor: 'pointer' },
      })}
      style={{ borderRadius: 8 }}
      scroll={{ x: 800 }}  // Horizontal scroll on mobile
    />
  );
};

export default ProductTable;