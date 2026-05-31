import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ShopOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      const res = await authAPI.login(values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      message.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    setLoading(true);
    try {
      const res = await authAPI.register(values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      message.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <Form onFinish={onLogin} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form>
      )
    },
    {
      key: 'register',
      label: 'Register',
      children: (
        <Form onFinish={onRegister} layout="vertical" size="large">
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" />
          </Form.Item>
          <Form.Item name="companyName" rules={[{ required: true }]}>
            <Input prefix={<ShopOutlined />} placeholder="Company Name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form>
      )
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <Space direction="vertical" align="center" style={{ width: '100%', marginBottom: 24 }}>
          <RocketOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={2} style={{ margin: 0 }}>PricePilot AI</Title>
          <Text type="secondary">Intelligent Multi-Marketplace Pricing</Text>
        </Space>
        <Tabs items={tabItems} centered />
      </Card>
    </div>
  );
}
