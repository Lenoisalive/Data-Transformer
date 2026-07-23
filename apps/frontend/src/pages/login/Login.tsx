import { Card, Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import './Login.css'

const { Title } = Typography

function Login() {
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    try {
      console.log('Login:', values)
      message.success('Login feature under development...')
    } catch (error) {
      message.error('Login failed, please try again')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>🏥 Medical Data Transformation Workbench</Title>
          <p>Professional data query and transformation service for healthcare enterprises</p>
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
