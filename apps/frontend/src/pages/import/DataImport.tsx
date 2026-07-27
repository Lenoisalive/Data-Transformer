import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Typography,
  Space,
  Modal,
  Upload,
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
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { datasourceService, DataSource } from '../../services/datasource.service';
import { useProject } from '../../contexts/ProjectContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const DataImport: React.FC = () => {
  const [datasources, setDatasources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedDatasource, setSelectedDatasource] = useState<DataSource | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const { activeProject } = useProject();

  useEffect(() => {
    void loadDatasources();
  }, [activeProject?.id]);

  const loadDatasources = async () => {
    try {
      setLoading(true);
      if (!activeProject) {
        setDatasources([]);
        return;
      }
      const data = await datasourceService.getAll(activeProject.id);
      setDatasources(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please select a file');
      return;
    }

    const file = fileList[0].originFileObj as File;
    try {
      setLoading(true);
      await datasourceService.uploadFile({
        file,
        name: values.name,
        type: values.type,
        description: values.description,
        projectId: activeProject?.id,
      });
      message.success('File uploaded successfully!');
      setUploadModalVisible(false);
      form.resetFields();
      setFileList([]);
      await loadDatasources();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (datasource: DataSource) => {
    try {
      setLoading(true);
      setSelectedDatasource(datasource);
      const data = await datasourceService.getPreview(datasource.id, 10);
      setPreviewData(data);
      setPreviewModalVisible(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await datasourceService.delete(id);
      message.success('Data source deleted successfully');
      await loadDatasources();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete data source');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // 只保留最新的一个文件
    setFileList(newFileList);

    if (info.file.status === 'done') {
      const fileName = info.file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase();
      
      // 自动设置名称
      form.setFieldsValue({ name: fileName.replace(/\.[^/.]+$/, '') });
      
      // 自动设置类型
      if (fileExt === 'csv') {
        form.setFieldsValue({ type: 'csv' });
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        form.setFieldsValue({ type: 'excel' });
      }
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

  const columns: ColumnsType<DataSource> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: DataSource) => (
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
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
      render: (_: any, record: DataSource) => (
        <Space>
          <Tooltip title="Preview Data">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
              disabled={record.status !== 'completed'}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Data Source"
            description="Are you sure you want to delete this data source?"
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

  const expandedRowRender = (record: DataSource) => {
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
      {
        title: 'Nullable',
        dataIndex: 'nullable',
        key: 'nullable',
        render: (nullable: boolean) => (nullable ? 'Yes' : 'No'),
      },
      {
        title: 'Example',
        dataIndex: 'example',
        key: 'example',
        render: (example: any) => (
          <Text type="secondary">
            {example !== null && example !== undefined ? String(example) : 'N/A'}
          </Text>
        ),
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
          <UploadOutlined /> Data Import
        </Title>
        <Space direction="vertical" size={0}>
          <Text type="secondary">Current project: {activeProject?.name || 'None selected'}</Text>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<UploadOutlined />}
          disabled={!activeProject}
          onClick={() => setUploadModalVisible(true)}
        >
          Import Data
        </Button>
      </div>

      {/* Data Sources Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={datasources}
          loading={loading}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
          }}
          locale={{
            emptyText: (
              <Empty
                image={<CloudUploadOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
                description={activeProject
                  ? `No input tables in ${activeProject.name}.`
                  : 'Select a project before importing data.'}
              />
            ),
          }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Import Data File"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item name="file" label="Select File" rules={[{ required: true, message: 'Please select a file' }]}>
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              fileList={fileList}
              accept=".csv,.xlsx,.xls"
              maxCount={1}
            >
              <Button icon={<CloudUploadOutlined />} block style={{ height: 100 }}>
                Click to select CSV or Excel file
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="name"
            label="Data Source Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter a name for this data source" />
          </Form.Item>

          <Form.Item name="type" label="File Type" rules={[{ required: true, message: 'Please select a type' }]}>
            <Select placeholder="Select file type">
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <TextArea rows={3} placeholder="Enter a description for this data source" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setUploadModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<UploadOutlined />}>
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Data Preview - ${selectedDatasource?.name}`}
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
        {selectedDatasource && (
          <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Total Rows">{selectedDatasource.rowCount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="File Size">{formatFileSize(selectedDatasource.fileSize)}</Descriptions.Item>
            <Descriptions.Item label="Columns">{selectedDatasource.schema?.columns?.length || 0}</Descriptions.Item>
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
