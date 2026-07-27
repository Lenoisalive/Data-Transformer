import React, { useState } from 'react';
import { Form, Input, Button, message, Tabs, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials, RegisterData, ResetPasswordData } from '../../services/auth.service';
import './LoginPage.css';

const { TabPane } = Tabs;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form handler
  const handleLogin = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      message.success(response.message || 'Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register form handler
  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const registerData: RegisterData = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role || 'analyst',
      };

      await authService.register(registerData);
      message.success('Account created successfully! Please login.');
      setActiveTab('login');
    } catch (error: any) {
      message.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Reset password form handler
  const handleResetPassword = async (values: ResetPasswordData) => {
    setLoading(true);
    try {
      await authService.resetPassword(values);
      message.success('Password reset successfully! Please login with your new password.');
      setActiveTab('login');
    } catch (error: any) {
      message.error(error.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>
      
      <div className="login-container">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <h1 className="login-title">🏥 Medical Data Transformer</h1>
            <p className="login-subtitle">Healthcare Data Analysis Platform</p>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
            className="login-tabs"
          >
            {/* Login Tab */}
            <TabPane tab="Login" key="login">
              <Form
                name="login"
                onFinish={handleLogin}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="login-button"
                  >
                    Login
                  </Button>
                </Form.Item>

                <div className="login-footer">
                  <Button type="link" onClick={() => setActiveTab('reset')}>
                    Forgot Password?
                  </Button>
                  <Button type="link" onClick={() => setActiveTab('register')}>
                    Create Account
                  </Button>
                </div>
              </Form>
            </TabPane>

            {/* Register Tab */}
            <TabPane tab="Register" key="register">
              <Form
                name="register"
                onFinish={handleRegister}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: 'Please input your username!' },
                    { min: 3, message: 'Username must be at least 3 characters!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Username"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="login-button"
                  >
                    Create Account
                  </Button>
                </Form.Item>

                <div className="login-footer">
                  <Button type="link" onClick={() => setActiveTab('login')}>
                    Already have an account? Login
                  </Button>
                </div>
              </Form>
            </TabPane>

            {/* Reset Password Tab */}
            <TabPane tab="Reset Password" key="reset">
              <Form
                name="reset"
                onFinish={handleResetPassword}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                <div className="reset-info">
                  <p>Enter your email and new password to reset your account password.</p>
                </div>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please input your new password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="New Password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmNewPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm New Password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="login-button"
                  >
                    Reset Password
                  </Button>
                </Form.Item>

                <div className="login-footer">
                  <Button type="link" onClick={() => setActiveTab('login')}>
                    Back to Login
                  </Button>
                </div>
              </Form>
            </TabPane>
          </Tabs>

          <div className="login-demo-info">
            <p className="demo-title">📋 Demo Accounts:</p>
            <div className="demo-accounts">
              <div className="demo-account">
                <strong>Admin:</strong> admin@datatransformer.com / admin123
              </div>
              <div className="demo-account">
                <strong>Engineer:</strong> engineer@datatransformer.com / engineer123
              </div>
              <div className="demo-account">
                <strong>Analyst:</strong> analyst@datatransformer.com / analyst123
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
