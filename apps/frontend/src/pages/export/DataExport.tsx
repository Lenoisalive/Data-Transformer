import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tooltip,
  Descriptions,
  Empty,
} from 'antd';
import {
  ExportOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { exportTableService, ExportTable } from '../../services/export.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const DataExport: React.FC = () => {
  const [exportTables, setExportTables] = useState<ExportTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ExportTable | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadExportTables();
  }, []);

  const loadExportTables = async () => {
    try {
      setLoading(true);
      const data = await exportTableService.getAll();
      setExportTables(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load export tables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      setLoading(true);
      
      // 将schema字符串转换为数组
      const schema = values.schema.split(',').map((col: string) => {
        const trimmed = col.trim();
        return {
          name: trimmed,
          type: 'string',
        };
      });

      // 将data字符串转换为数组
      const dataRows = values.data.trim().split('\n').filter((line: string) => line.trim());
      const data = dataRows.map((row: string) => {
        const values = row.split(',').map((v: string) => v.trim());
        const rowObj: any = {};
        schema.forEach((col: any, index: number) => {
          rowObj[col.name] = values[index] || '';
        });
        return rowObj;
      });

      await exportTableService.create({
        name: values.name,
        format: values.format,
        schema,
        data,
        description: values.description,
      });

      message.success('Export table created successfully!');
      setCreateModalVisible(false);
      form.resetFields();
      await loadExportTables();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create export table');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (table: ExportTable) => {
    try {
      setLoading(true);
      setSelectedTable(table);
      const data = await exportTableService.getPreview(table.id, 10);
      setPreviewData(data);
      setPreviewModalVisible(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (table: ExportTable) => {
    try {
      setLoading(true);
      await exportTableService.download(table.id, table.fileName || `${table.name}.${table.format}`);
      message.success('Download started');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await exportTableService.delete(id);
      message.success('Export table deleted successfully');
      await loadExportTables();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete export table');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const columns: ColumnsType<ExportTable> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ExportTable) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            <TableOutlined /> {name}
          </Text>
          {record.fileName && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.fileName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => <Tag color="blue">{format.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Rows',
      dataIndex: 'rowCount',
      key: 'rowCount',
      align: 'right',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      align: 'right',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_: any, record: ExportTable) => (
        <Space>
          <Tooltip title="Preview Data">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              disabled={record.status !== 'completed'}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Export Table"
            description="Are you sure you want to delete this export table?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: ExportTable) => {
    if (!record.schema?.columns) {
      return <Empty description="No schema information" />;
    }

    const schemaColumns: ColumnsType<any> = [
      { title: 'Column Name', dataIndex: 'name', key: 'name' },
      {
        title: 'Data Type',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => <Tag color="blue">{type}</Tag>,
      },
    ];

    return (
      <Table
        columns={schemaColumns}
        dataSource={record.schema.columns}
        pagination={false}
        size="small"
        rowKey="name"
      />
    );
  };

  const previewColumns =
    previewData.length > 0
      ? Object.keys(previewData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
        }))
      : [];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <ExportOutlined /> Data Export
        </Title>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Create Export Table
        </Button>
      </div>

      {/* Export Tables Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={exportTables}
          loading={loading}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          }}
          locale={{
            emptyText: (
              <Empty
                image={<ExportOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
                description="No export tables yet. Click 'Create Export Table' to get started."
              />
            ),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create Export Table"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Table Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter export table name" />
          </Form.Item>

          <Form.Item name="format" label="Export Format" rules={[{ required: true, message: 'Please select a format' }]} initialValue="csv">
            <Select placeholder="Select export format">
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="schema"
            label="Column Names (comma-separated)"
            rules={[{ required: true, message: 'Please enter column names' }]}
            extra="Example: id,name,age,email"
          >
            <Input placeholder="id,name,age,email" />
          </Form.Item>

          <Form.Item
            name="data"
            label="Data Rows (one row per line, comma-separated values)"
            rules={[{ required: true, message: 'Please enter data' }]}
            extra="Example: 1,John Doe,30,john@example.com"
          >
            <TextArea 
              rows={8} 
              placeholder="1,John Doe,30,john@example.com&#10;2,Jane Smith,25,jane@example.com" 
            />
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <TextArea rows={2} placeholder="Enter a description for this export table" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Data Preview - ${selectedTable?.name}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
      >
        {selectedTable && (
          <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Total Rows">{selectedTable.rowCount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="File Size">{formatFileSize(selectedTable.fileSize)}</Descriptions.Item>
            <Descriptions.Item label="Columns">{selectedTable.schema?.columns?.length || 0}</Descriptions.Item>
          </Descriptions>
        )}
        <Table
          columns={previewColumns}
          dataSource={previewData}
          pagination={false}
          scroll={{ x: true }}
          size="small"
          bordered
        />
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          Showing first 10 rows
        </Text>
      </Modal>
    </div>
  );
};
