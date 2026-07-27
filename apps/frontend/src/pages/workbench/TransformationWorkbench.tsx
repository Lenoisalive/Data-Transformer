import React from 'react';
import { Typography, Card, Empty } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const TransformationWorkbench: React.FC = () => {
  return (
    <div>
      <Title level={2}>
        <ToolOutlined /> Transformation Workbench
      </Title>
      <Paragraph>
        Visual interface for data transformation operations.
      </Paragraph>
      
      <Card style={{ marginTop: 24 }}>
        <Empty
          description={
            <span>
              Transformation Workbench features will be implemented here.
              <br />
              This page is ready for development.
            </span>
          }
        />
      </Card>
    </div>
  );
};
