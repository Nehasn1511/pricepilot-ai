import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, message, notification } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  RobotOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const PricePilotLogo = ({ size = 72 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="6" width="88" height="88" rx="24" fill="#0f172a" />
    <rect x="6" y="6" width="88" height="88" rx="24" stroke="#2563eb" strokeWidth="3" />

    <path
      d="M50 21 L75 36 L75 64 L50 79 L25 64 L25 36 Z"
      fill="#1e293b"
      stroke="#3b82f6"
      strokeWidth="2"
    />

    <path
      d="M34 62 L46 49 L55 55 L67 38"
      stroke="#f8fafc"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle cx="34" cy="62" r="4" fill="#60a5fa" />
    <circle cx="46" cy="49" r="4" fill="#60a5fa" />
    <circle cx="55" cy="55" r="4" fill="#60a5fa" />
    <circle cx="67" cy="38" r="4" fill="#ffffff" />
  </svg>
);

const features = [
  {
    icon: <LineChartOutlined />,
    title: 'Profit Intelligence',
    desc: 'Track margin opportunities with clear pricing insights.',
  },
  {
    icon: <RobotOutlined />,
    title: 'AI Recommendations',
    desc: 'Get smarter pricing suggestions backed by data.',
  },
  {
    icon: <ShoppingCartOutlined />,
    title: 'Marketplace Ready',
    desc: 'Built for modern multi-channel commerce teams.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Secure Access',
    desc: 'Reliable authentication for business users.',
  },
];

const trustPoints = [
  'Demo-ready authentication flow',
  'Role-based tenant admin access',
  'Clean dashboard handoff',
];

export default function Login() {
  const navigate = useNavigate();

  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const [loginForm] = Form.useForm();
  const [regForm] = Form.useForm();

  const handleLogin = async (values) => {
    try {
      setLoginLoading(true);

      const demoUser = {
        email: values.email,
        name: values.email.split('@')[0],
        role: 'TENANT_ADMIN',
        companyName: 'Demo Company',
      };

      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));

      notification.success({
        message: 'Welcome back',
        description: `Logged in as ${demoUser.name || values.email}`,
        placement: 'topRight',
      });

      navigate('/dashboard');
    } catch (err) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values) => {
    try {
      setRegLoading(true);

      const demoUser = {
        email: values.email,
        name: values.name,
        role: 'TENANT_ADMIN',
        companyName: values.companyName,
      };

      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));

      notification.success({
        message: 'Registration successful',
        description: 'Demo account created. Redirecting to dashboard.',
        placement: 'topRight',
      });

      navigate('/dashboard');
    } catch (err) {
      message.error('Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: 'Sign in',
      children: (
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          initialValues={{
            email: 'demo@pricepilot.com',
            password: 'password123',
          }}
          className="auth-form"
        >
          <Form.Item
            label="Email address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="demo@pricepilot.com"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loginLoading}
            className="primary-auth-btn"
            size="large"
          >
            {loginLoading ? 'Signing in...' : 'Sign in'}
            {!loginLoading && <ArrowRightOutlined />}
          </Button>
        </Form>
      ),
    },
    {
      key: 'register',
      label: 'Create account',
      children: (
        <Form
          form={regForm}
          layout="vertical"
          onFinish={handleRegister}
          autoComplete="off"
          className="auth-form"
        >
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter full name"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Company name"
            name="companyName"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Enter company name"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="name@company.com"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Minimum 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Minimum 6 characters"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirm password"
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
              prefix={<LockOutlined />}
              placeholder="Re-enter password"
              className="auth-input"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={regLoading}
            className="primary-auth-btn"
            size="large"
          >
            {regLoading ? 'Creating account...' : 'Create account'}
            {!regLoading && <ArrowRightOutlined />}
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="brand-panel">
          <div className="brand-top">
            <PricePilotLogo size={76} />

            <div>
              <Title level={1} className="brand-title">
                PricePilot AI
              </Title>
              <Text className="brand-kicker">AI-powered pricing platform</Text>
            </div>
          </div>

          <Paragraph className="brand-description">
            Professional pricing intelligence for businesses that want faster decisions,
            cleaner margin tracking, and smarter product-level recommendations.
          </Paragraph>

          <div className="feature-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <div>
                  <Text className="feature-title">{feature.title}</Text>
                  <Paragraph className="feature-desc">{feature.desc}</Paragraph>
                </div>
              </div>
            ))}
          </div>

          <div className="trust-box">
            <div className="trust-header">
              <ThunderboltOutlined />
              <span>Built for SaaS pricing teams</span>
            </div>

            <div className="trust-list">
              {trustPoints.map((item) => (
                <div className="trust-item" key={item}>
                  <CheckCircleOutlined />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <Card className="auth-card" bordered={false}>
            <div className="auth-heading">
              <Title level={2}>Welcome</Title>
              <Text>Sign in or create your PricePilot workspace.</Text>
            </div>

            <Tabs centered items={tabItems} className="auth-tabs" />
          </Card>

          <Text className="auth-footer">
            Protected demo access for PricePilot AI dashboard.
          </Text>
        </section>
      </div>

      <style>{`
        :root {
          --bg-main: #f8fafc;
          --bg-panel: #ffffff;
          --bg-soft: #f1f5f9;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --primary-soft: #eff6ff;
          --navy: #0f172a;
          --navy-light: #1e293b;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 32%),
            var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          overflow-x: hidden;
        }

        .login-shell {
          width: 100%;
          max-width: 1180px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 30px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
          overflow: hidden;
        }

        .brand-panel {
          background: var(--navy);
          color: #ffffff;
          padding: 54px;
          position: relative;
          overflow: hidden;
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.16);
          right: -140px;
          top: -120px;
        }

        .brand-panel::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(96, 165, 250, 0.08);
          left: -90px;
          bottom: -80px;
        }

        .brand-top,
        .brand-description,
        .feature-grid,
        .trust-box {
          position: relative;
          z-index: 1;
        }

        .brand-top {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 32px;
        }

        .brand-title {
          color: #ffffff !important;
          margin: 0 !important;
          font-size: 36px !important;
          font-weight: 800 !important;
          letter-spacing: -0.8px;
        }

        .brand-kicker {
          color: #93c5fd !important;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          font-size: 12px;
          font-weight: 700;
        }

        .brand-description {
          color: #cbd5e1 !important;
          font-size: 16px;
          line-height: 1.75;
          max-width: 560px;
          margin-bottom: 34px !important;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.085);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.18);
          color: #93c5fd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .feature-title {
          color: #ffffff !important;
          font-size: 14px;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
        }

        .feature-desc {
          color: #94a3b8 !important;
          font-size: 13px;
          line-height: 1.5;
          margin: 0 !important;
        }

        .trust-box {
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.22);
          padding: 20px;
        }

        .trust-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #bfdbfe;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .trust-list {
          display: grid;
          gap: 10px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #cbd5e1;
          font-size: 14px;
        }

        .trust-item .anticon {
          color: #60a5fa;
        }

        .auth-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 44px;
          background: #ffffff;
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          border-radius: 24px !important;
          border: 1px solid var(--border) !important;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        .auth-card .ant-card-body {
          padding: 34px !important;
        }

        .auth-heading {
          text-align: center;
          margin-bottom: 22px;
        }

        .auth-heading h2 {
          color: var(--text-main) !important;
          margin-bottom: 6px !important;
          font-weight: 800 !important;
          letter-spacing: -0.4px;
        }

        .auth-heading span {
          color: var(--text-muted) !important;
        }

        .auth-tabs .ant-tabs-nav {
          margin-bottom: 26px !important;
        }

        .auth-tabs .ant-tabs-tab {
          font-weight: 700;
          color: var(--text-muted);
        }

        .auth-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--primary) !important;
        }

        .auth-tabs .ant-tabs-ink-bar {
          background: var(--primary) !important;
          height: 3px !important;
          border-radius: 999px;
        }

        .auth-form .ant-form-item {
          margin-bottom: 18px;
        }

        .auth-form .ant-form-item-label > label {
          color: var(--text-main);
          font-weight: 700;
          font-size: 13px;
        }

        .auth-input {
          height: 46px;
          border-radius: 12px !important;
          border: 1px solid var(--border) !important;
          background: #ffffff !important;
          box-shadow: none !important;
        }

        .auth-input:hover {
          border-color: #93c5fd !important;
        }

        .auth-input:focus,
        .auth-input-focused,
        .ant-input-affix-wrapper-focused {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }

        .auth-input .anticon {
          color: #64748b;
          margin-right: 4px;
        }

        .auth-input input::placeholder {
          color: #94a3b8 !important;
        }

        .primary-auth-btn {
          height: 48px !important;
          border-radius: 13px !important;
          background: var(--primary) !important;
          border: none !important;
          font-weight: 800 !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
          transition: all 0.2s ease;
          margin-top: 4px;
        }

        .primary-auth-btn:hover {
          background: var(--primary-dark) !important;
          transform: translateY(-1px);
          box-shadow: 0 16px 30px rgba(37, 99, 235, 0.28);
        }

        .auth-footer {
          color: var(--text-muted) !important;
          margin-top: 18px;
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .login-shell {
            grid-template-columns: 1fr;
          }

          .brand-panel {
            padding: 42px;
          }

          .auth-panel {
            padding: 38px 28px;
          }
        }

        @media (max-width: 640px) {
          .login-page {
            padding: 18px;
            align-items: flex-start;
          }

          .login-shell {
            border-radius: 22px;
          }

          .brand-panel {
            padding: 30px 24px;
          }

          .brand-top {
            align-items: flex-start;
          }

          .brand-title {
            font-size: 28px !important;
          }

          .brand-description {
            font-size: 14px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .auth-panel {
            padding: 26px 18px 30px;
          }

          .auth-card .ant-card-body {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}