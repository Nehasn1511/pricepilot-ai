import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const PageLoader = ({ text = 'Loading...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 400, gap: 16,
  }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#1677ff' }} spin />} />
    <span style={{ color: '#888', fontSize: 14 }}>{text}</span>
  </div>
);

export const TableSkeleton = () => (
  <div style={{ padding: '16px 0' }}>
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{
        display: 'flex', gap: 16, padding: '12px 0',
        borderBottom: '1px solid #f0f0f0', alignItems: 'center',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f0f0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginBottom: 6, width: `${60 + i * 8}%` }} />
          <div style={{ height: 11, background: '#f5f5f5', borderRadius: 4, width: `${40 + i * 5}%` }} />
        </div>
        <div style={{ width: 80, height: 14, background: '#f0f0f0', borderRadius: 4 }} />
        <div style={{ width: 60, height: 24, background: '#f0f0f0', borderRadius: 12 }} />
      </div>
    ))}
  </div>
);

export default PageLoader;