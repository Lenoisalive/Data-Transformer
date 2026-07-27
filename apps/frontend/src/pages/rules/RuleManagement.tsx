import React from 'react';
import { Typography, Card, Empty } from 'antd';
import { ControlOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const RuleManagement: React.FC = () => {
  return (
    <div>
      <Title level={2}>
        <ControlOutlined /> Rule Management
      </Title>
      <Paragraph>
        Manage transformation rules and configurations.
      </Paragraph>
      
      <Card style={{ marginTop: 24 }}>
        <Empty
          description={
            <span>
              Rule Management features will be implemented here.
              <br />
              This page is ready for development.
            </span>
          }
        />
      </Card>
    </div>
  );
};
