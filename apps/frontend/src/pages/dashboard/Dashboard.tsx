import { Layout, Card, Row, Col, Statistic, Typography } from 'antd'
import { DatabaseOutlined, UserOutlined, FileTextOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import './Dashboard.css'

const { Header, Content } = Layout
const { Title } = Typography

function Dashboard() {
  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <div className="header-content">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            🏥 Medical Data Transformation Workbench
          </Title>
          <div>Welcome back</div>
        </div>
      </Header>
      <Content className="dashboard-content">
        <div className="content-wrapper">
          <Title level={4}>Data Overview</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Data Sources"
                  value={0}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Users"
                  value={0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Query Templates"
                  value={0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Export Jobs"
                  value={0}
                  prefix={<CloudDownloadOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
          
          <div className="welcome-section">
            <Card>
              <Title level={4}>🚀 Quick Start</Title>
              <p>Welcome to the Medical Data Transformation Workbench!</p>
              <p>This is a data query and transformation platform built for healthcare enterprises.</p>
              <ul>
                <li>✅ Project infrastructure completed</li>
                <li>🔧 Developing user authentication system</li>
                <li>📊 Data source management coming soon</li>
                <li>🎨 Visual workbench in development</li>
              </ul>
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default Dashboard
