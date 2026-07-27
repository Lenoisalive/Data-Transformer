import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Tag,
  Popconfirm,
  Tabs,
  Typography,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { projectService, Project, CreateProjectDto, CreateProjectTableDto } from '../../services/project.service';
import { authService } from '../../services/auth.service';
import axios from 'axios';
import './ProjectManagement.css';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface UserOption {
  id: string;
  username: string;
  email: string;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [form] = Form.useForm();
  const [tableForm] = Form.useForm();
  const currentUser = authService.getUser();

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateProject = async (values: CreateProjectDto) => {
    try {
      await projectService.createProject(values);
      message.success('Project created successfully');
      setModalVisible(false);
      form.resetFields();
      loadProjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      message.success('Project deleted successfully');
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      loadProjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleAddTable = async (values: CreateProjectTableDto) => {
    if (!selectedProject) return;

    try {
      await projectService.addProjectTable(selectedProject.id, values);
      message.success('Table added successfully');
      setTableModalVisible(false);
      tableForm.resetFields();
      const updated = await projectService.getProject(selectedProject.id);
      setSelectedProject(updated);
      loadProjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!selectedProject) return;

    try {
      await projectService.deleteProjectTable(selectedProject.id, tableId);
      message.success('Table deleted successfully');
      const updated = await projectService.getProject(selectedProject.id);
      setSelectedProject(updated);
      loadProjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete table');
    }
  };

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => setSelectedProject(record)}>
          <FolderOpenOutlined /> {text}
        </a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      render: (members: UserOption[]) => (
        <span>
          <TeamOutlined /> {members?.length || 0}
        </span>
      ),
    },
    {
      title: 'Tables',
      dataIndex: 'tables',
      key: 'tables',
      render: (tables: any[]) => (
        <span>
          <DatabaseOutlined /> {tables?.length || 0}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDeleteProject(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.ownerId !== currentUser?.id}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.ownerId !== currentUser?.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tableColumns = [
    {
      title: 'Table Name',
      dataIndex: 'tableName',
      key: 'tableName',
    },
    {
      title: 'Type',
      dataIndex: 'tableType',
      key: 'tableType',
      render: (type: string) => (
        <Tag color={type === 'INPUT' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Are you sure you want to delete this table?"
          onConfirm={() => handleDeleteTable(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const inputTables = selectedProject?.tables?.filter((t) => t.tableType === 'INPUT') || [];
  const outputTables = selectedProject?.tables?.filter((t) => t.tableType === 'OUTPUT') || [];

  return (
    <div className="project-management">
      <div className="page-header">
        <div>
          <Title level={2}>
            <FolderOpenOutlined /> Project Management
          </Title>
          <Paragraph>Manage your data transformation projects</Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          size="large"
        >
          New Project
        </Button>
      </div>

      <div className="content-layout">
        <div className="projects-list">
          <Card title="All Projects" bordered={false}>
            <Table
              columns={projectColumns}
              dataSource={projects}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) =>
                record.id === selectedProject?.id ? 'selected-row' : ''
              }
            />
          </Card>
        </div>

        {selectedProject && (
          <div className="project-details">
            <Card
              title={
                <Space>
                  <FolderOpenOutlined />
                  <span>{selectedProject.name}</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setTableModalVisible(true)}
                >
                  Add Table
                </Button>
              }
            >
              <div className="project-info">
                <Paragraph>
                  <strong>Description:</strong>{' '}
                  {selectedProject.description || 'No description'}
                </Paragraph>
                <Paragraph>
                  <strong>Members:</strong>{' '}
                  <Space>
                    {selectedProject.members?.map((member) => (
                      <Tag key={member.id} icon={<TeamOutlined />}>
                        {member.username}
                      </Tag>
                    ))}
                  </Space>
                </Paragraph>
              </div>

              <Tabs defaultActiveKey="input">
                <TabPane
                  tab={
                    <span>
                      <DatabaseOutlined />
                      Input Tables <Badge count={inputTables.length} />
                    </span>
                  }
                  key="input"
                >
                  {inputTables.length > 0 ? (
                    <Table
                      columns={tableColumns}
                      dataSource={inputTables}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="No input tables yet" />
                  )}
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <DatabaseOutlined />
                      Output Tables <Badge count={outputTables.length} />
                    </span>
                  }
                  key="output"
                >
                  {outputTables.length > 0 ? (
                    <Table
                      columns={tableColumns}
                      dataSource={outputTables}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="No output tables yet" />
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        )}
      </div>

      <Modal
        title="Create New Project"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProject}>
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter project description" />
          </Form.Item>

          <Form.Item label="Team Members" name="memberIds">
            <Select
              mode="multiple"
              placeholder="Select team members"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={Array.isArray(users) ? users.map((user) => ({
                value: user.id,
                label: `${user.username} (${user.email})`,
              })) : []}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Table"
        open={tableModalVisible}
        onCancel={() => {
          setTableModalVisible(false);
          tableForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={tableForm} layout="vertical" onFinish={handleAddTable}>
          <Form.Item
            label="Table Name"
            name="tableName"
            rules={[{ required: true, message: 'Please enter table name' }]}
          >
            <Input placeholder="Enter table name" />
          </Form.Item>

          <Form.Item
            label="Table Type"
            name="tableType"
            rules={[{ required: true, message: 'Please select table type' }]}
          >
            <Select placeholder="Select table type">
              <Select.Option value="INPUT">Input Table</Select.Option>
              <Select.Option value="OUTPUT">Output Table</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Enter table description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Table
              </Button>
              <Button onClick={() => setTableModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
