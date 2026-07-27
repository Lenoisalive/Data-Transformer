import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar, Select, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  ImportOutlined,
  ExportOutlined,
  ToolOutlined,
  ControlOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './MainLayout.css';
import { useProject } from '../contexts/ProjectContext';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();
  const { projects, activeProject, selectProject, loading: projectsLoading } = useProject();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Project Management',
      onClick: () => navigate('/projects'),
    },
    {
      key: '/import',
      icon: <ImportOutlined />,
      label: 'Data Import',
      onClick: () => navigate('/import'),
    },
    {
      key: '/export',
      icon: <ExportOutlined />,
      label: 'Data Export',
      onClick: () => navigate('/export'),
    },
    {
      key: '/workbench',
      icon: <ToolOutlined />,
      label: 'Transformation Workbench',
      onClick: () => navigate('/workbench'),
    },
    {
      key: '/rules',
      icon: <ControlOutlined />,
      label: 'Rule Management',
      onClick: () => navigate('/rules'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Management',
      onClick: () => navigate('/users'),
    },
  ];

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="main-sider"
        width={250}
      >
        <div className="logo">
          <div className="logo-icon">🏥</div>
          {!collapsed && <div className="logo-text">Medical Data</div>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="main-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-button"
          />
          <div className="active-project-switcher">
            <ProjectOutlined />
            <Typography.Text type="secondary">Current project</Typography.Text>
            <Select
              value={activeProject?.id}
              loading={projectsLoading}
              placeholder="Select a project"
              options={projects.map((project) => ({ value: project.id, label: project.name }))}
              onChange={selectProject}
              popupMatchSelectWidth={240}
            />
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" className="user-button">
                <Space>
                  <Avatar
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<UserOutlined />}
                    size="small"
                  />
                  <span className="user-name">{user?.username || 'User'}</span>
                  <span className="user-role">({user?.role})</span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
