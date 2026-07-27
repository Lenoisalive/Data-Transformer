import React from 'react';
import { Typography, Card, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const UserManagement: React.FC = () => {
  return (
    <div>
      <Title level={2}>
        <UserOutlined /> User Management
      </Title>
      <Paragraph>
        Manage system users and permissions.
      </Paragraph>
      
      <Card style={{ marginTop: 24 }}>
        <Empty
          description={
            <span>
              User Management features will be implemented here.
              <br />
              This page is ready for development.
            </span>
          }
        />
      </Card>
    </div>
  );
};
