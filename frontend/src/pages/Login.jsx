import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, message, notification } from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, RobotOutlined,
  LineChartOutlined, ShoppingCartOutlined, SafetyCertificateOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const PricePilotLogo = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="92" height="92" rx="24" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
    <path d="M50 22 L74 36.5 L74 63.5 L50 78 L26 63.5 L26 36.5 Z"
      fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" strokeWidth="2" />
    <path d="M 34 62 L 46 48 L 54 54 L 66 38"
      stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="34" cy="62" r="3" fill="#60a5fa" />
    <circle cx="46" cy="48" r="3" fill="#60a5fa" />
    <circle cx="54" cy="54" r="3" fill="#60a5fa" />
    <circle cx="66" cy="38" r="3" fill="#f8fafc" />
  </svg>
);

const features = [
  { icon: <LineChartOutlined />,       title: 'Maximize Profits'   },
  { icon: <RobotOutlined />,            title: 'AI Recommendations' },
  { icon: <ShoppingCartOutlined />,     title: 'Multi-Marketplace'  },
  { icon: <SafetyCertificateOutlined />, title: 'Secure & Reliable'  },
];

export default function Login() {
  const navigate       = useNavigate();
  const [loginLoading, setLoginLoading]   = useState(false);
  const [regLoading,   setRegLoading]     = useState(false);
  const [loginForm]    = Form.useForm();
  const [regForm]      = Form.useForm();

  // ── Login handler ──────────────────────────────────────────
  const handleLogin = async (values) => {
    try {
      setLoginLoading(true);

      const res = await axiosClient.post('/auth/login', {
        email:    values.email,
        password: values.password,
      });

      const token = res.data?.token || res.data?.accessToken || res.data;
      const user  = res.data?.user  || res.data?.userDetails || {
        email: values.email,
        name:  values.email.split('@')[0],
        role:  'TENANT_ADMIN',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user',  JSON.stringify(user));

      notification.success({
        message:     'Welcome back!',
        description: `Logged in as ${user.name || values.email}`,
        placement:   'topRight',
      });

      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'Invalid email or password';
      message.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register handler ───────────────────────────────────────
  const handleRegister = async (values) => {
    try {
      setRegLoading(true);

      await axiosClient.post('/auth/register', {
        name:        values.name,
        email:       values.email,
        password:    values.password,
        companyName: values.companyName,
      });

      notification.success({
        message:     'Registration successful!',
        description: 'Please login with your new account.',
        placement:   'topRight',
      });

      regForm.resetFields();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'Registration failed. Please try again.';
      message.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const tabItems = [
    {
      key:   'login',
      label: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Login</span>,
      children: (
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          initialValues={{
            email: 'demo@pricepilot.com',
            password: 'password123'
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email',  message: 'Enter a valid email'     },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Email address"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Password"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginLoading}
              className="gradient-btn"
              size="large"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
              {!loginLoading && <ArrowRightOutlined />}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key:   'register',
      label: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Register</span>,
      children: (
        <Form
          form={regForm}
          layout="vertical"
          onFinish={handleRegister}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Full Name"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="companyName"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input
              prefix={<ShoppingCartOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Company Name"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email',  message: 'Enter a valid email'     },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Email address"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6,         message: 'Minimum 6 characters'     },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Password (min 6 chars)"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#60a5fa' }} />}
              placeholder="Confirm Password"
              className="glass-input"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={regLoading}
              className="gradient-btn"
              size="large"
            >
              {regLoading ? 'Registering...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="login-wrapper">
      <div className="main-layout">
        <div className="left-side">
          {features.map((f, i) => (
            <div className="glass-point" key={i}>
              <span style={{ color: '#60a5fa', marginRight: 12, fontSize: 18 }}>
                {f.icon}
              </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{f.title}</span>
            </div>
          ))}
        </div>

        <div className="center-branding">
          <PricePilotLogo size={100} />
          <Title level={1} style={{ color: '#fff', margin: '20px 0 5px', fontWeight: 800 }}>
            PricePilot AI
          </Title>
          <Text style={{ color: '#60a5fa', letterSpacing: '3px', fontSize: 12 }}>
            AI POWERED PRICING PLATFORM
          </Text>
        </div>

        <Card className="glass-auth-card" variant="borderless">
          <Tabs centered items={tabItems} />
        </Card>
      </div>

      <style>{`
        .login-wrapper {
          height: 100vh; width: 100vw;
          display: flex; align-items: center; justify-content: center;
          background: #090e1a; overflow: hidden;
        }
        .main-layout {
          display: grid;
          grid-template-columns: 240px 1fr 380px;
          gap: 40px; align-items: center;
          width: 100%; max-width: 1100px; padding: 20px;
        }
        .center-branding {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .glass-point {
          padding: 14px 20px; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(10px); margin-bottom: 12px;
          display: flex; align-items: center;
          transition: background 0.2s;
        }
        .glass-point:hover { background: rgba(255,255,255,0.06); }
        .glass-auth-card {
          background: rgba(30, 41, 59, 0.5) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 24px !important;
          padding: 8px !important;
        }
        .glass-input {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          border-radius: 10px !important;
          color: #f1f5f9 !important;
        }
        .glass-input input { color: #f1f5f9 !important; }
        .glass-input input::placeholder { color: #64748b !important; }
        .gradient-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          border: none !important;
          height: 46px !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 15px !important;
        }
        .gradient-btn:hover {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          transform: translateY(-1px);
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn { color: #60a5fa !important; }
        .ant-tabs-ink-bar { background: #4f46e5 !important; }
        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; }
          .left-side { display: none; }
          .center-branding { margin-bottom: 20px; }
        }
      `}</style>
    </div>
  );
}