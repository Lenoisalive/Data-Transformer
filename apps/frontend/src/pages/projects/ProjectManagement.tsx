import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  DatabaseOutlined,
  DeleteOutlined,
  ExportOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { CreateProjectDto, Project, projectService } from '../../services/project.service';
import { authService } from '../../services/auth.service';
import { useProject } from '../../contexts/ProjectContext';
import './ProjectManagement.css';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

interface UserOption {
  id: string;
  username: string;
  email: string;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [form] = Form.useForm<CreateProjectDto>();
  const currentUser = authService.getUser();
  const { activeProject, selectProject, refreshProjects: refreshProjectContext } = useProject();

  useEffect(() => {
    void loadProjects();
    void loadUsers();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      setProjects(await projectService.getProjects());
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch {
      setUsers([]);
    }
  };

  const createProject = async (values: CreateProjectDto) => {
    try {
      const created = await projectService.createProject(values);
      setProjectModalOpen(false);
      form.resetFields();
      selectProject(created.id);
      await Promise.all([loadProjects(), refreshProjectContext(created.id)]);
      message.success('Project created');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      await Promise.all([loadProjects(), refreshProjectContext()]);
      message.success('Project deleted');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="project-management">
      <div className="page-header">
        <div>
          <Title level={2}><FolderOpenOutlined /> Projects</Title>
          <Paragraph>Select a project to make it the current workspace.</Paragraph>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setProjectModalOpen(true)}>
          New Project
        </Button>
      </div>

      {projects.length === 0 && !loading ? (
        <Card className="projects-empty">
          <Empty description="No projects yet">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setProjectModalOpen(true)}>
              Create project
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const isActive = activeProject?.id === project.id;
            const inputCount = project.inputTables?.length || 0;
            const outputCount = project.outputTables?.length || 0;
            const members = project.members || [];

            return (
              <Badge.Ribbon
                key={project.id}
                text="Current project"
                color="blue"
                style={{ display: isActive ? undefined : 'none' }}
              >
                <Card
                  hoverable
                  loading={loading}
                  className={`project-card ${isActive ? 'active' : ''}`}
                  onClick={() => selectProject(project)}
                >
                  <div className="project-card-header">
                    <div className="project-title">
                      <span className="project-folder-icon">
                        {isActive ? <FolderOpenOutlined /> : <FolderOutlined />}
                      </span>
                      <div>
                        <Title level={4}>{project.name}</Title>
                        <Text type="secondary">
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                    <Popconfirm
                      title="Delete this project?"
                      description="Its tables will become unassigned."
                      disabled={project.ownerId !== currentUser?.id}
                      onConfirm={(event) => {
                        event?.stopPropagation();
                        void deleteProject(project.id);
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={project.ownerId !== currentUser?.id}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>

                  <Paragraph className="project-description" ellipsis={{ rows: 3 }}>
                    {project.description || 'No project notes'}
                  </Paragraph>

                  <div className="project-stats">
                    <div className="project-stat input">
                      <DatabaseOutlined />
                      <span><strong>{inputCount}</strong> Input tables</span>
                    </div>
                    <div className="project-stat output">
                      <ExportOutlined />
                      <span><strong>{outputCount}</strong> Output tables</span>
                    </div>
                    <div className="project-stat members">
                      <TeamOutlined />
                      <span><strong>{members.length}</strong> Members</span>
                    </div>
                  </div>

                  <div className="project-members">
                    {members.length ? (
                      <Avatar.Group maxCount={5}>
                        {members.map((member) => (
                          <Tooltip key={member.id} title={`${member.username} (${member.email})`}>
                            <Avatar>{member.username.slice(0, 1).toUpperCase()}</Avatar>
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                    ) : (
                      <Tag>No additional members</Tag>
                    )}
                  </div>
                </Card>
              </Badge.Ribbon>
            );
          })}
        </div>
      )}

      <Modal
        title="Create project"
        open={projectModalOpen}
        footer={null}
        onCancel={() => {
          setProjectModalOpen(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={createProject}>
          <Form.Item name="name" label="Project name" rules={[{ required: true, message: 'Enter a project name' }]}>
            <Input placeholder="Project name" />
          </Form.Item>
          <Form.Item name="description" label="Project notes">
            <TextArea rows={4} placeholder="Describe the purpose of this project" />
          </Form.Item>
          <Form.Item name="memberIds" label="Members">
            <Select
              mode="multiple"
              placeholder="Select project members"
              options={users.map((user) => ({
                value: user.id,
                label: `${user.username} (${user.email})`,
              }))}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Create</Button>
            <Button onClick={() => setProjectModalOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
