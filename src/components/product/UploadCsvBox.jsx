import { Upload, Typography, Button, Space, Alert } from 'antd';
import {
  InboxOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { uploadCsv } from '../../api/productApi';

const { Dragger } = Upload;
const { Text } = Typography;

const UploadCsvBox = ({ onSuccess, onCancel }) => {
  const [uploading,  setUploading]  = useState(false);
  const [uploadMsg,  setUploadMsg]  = useState(null);  // { type: 'success'|'error', text: '...' }

  const handleUpload = async ({ file }) => {
    try {
      setUploading(true);
      setUploadMsg(null);
      const result = await uploadCsv(file);
      setUploadMsg({
        type: 'success',
        text: `Successfully imported ${result.imported ?? 'all'} products.`,
      });
      setTimeout(() => onSuccess(), 1500); // Short delay so user sees success
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: err.response?.data?.message || 'Upload failed. Please check your CSV format.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #f0f0f0', padding: 20,
    }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14 }}>Import Products via CSV</Text>
        <Space>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            href="/sample-products.csv"   // Link to sample file — ask Student A for the correct URL
            download
          >
            Download Template
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
            Cancel
          </Button>
        </Space>
      </div>

      {/* Status message */}
      {uploadMsg && (
        <Alert
          type={uploadMsg.type}
          message={uploadMsg.text}
          showIcon
          icon={uploadMsg.type === 'success' ? <CheckCircleOutlined /> : undefined}
          style={{ marginBottom: 12, borderRadius: 8 }}
        />
      )}

      {/* Drag and drop area */}
      <Dragger
        name="file"
        accept=".csv"
        multiple={false}
        showUploadList={false}
        customRequest={handleUpload}   // Takes control of upload — no automatic Ant Design upload
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#1677ff', fontSize: 40 }} />
        </p>
        <p style={{ fontWeight: 500 }}>
          {uploading ? 'Uploading...' : 'Click or drag a CSV file here to upload'}
        </p>
        <p style={{ fontSize: 12, color: '#888' }}>
          Only .csv files supported · Maximum file size 5MB
        </p>
      </Dragger>

    </div>
  );
};

export default UploadCsvBox;