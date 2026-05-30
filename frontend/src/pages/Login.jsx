import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import PricePilotLogo from '../components/common/Logo';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const data = await loginApi(values.email, values.password);

      login(data.token, data.user);

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >

      {/* ───────── LEFT PANEL ───────── */}
      <div
        className="login-brand-panel"
        style={{
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
        }}
      >

        {/* Logo */}
        <PricePilotLogo size={40} />

        {/* Center Content */}
        <div>

          {/* Badge */}
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 600,
              color: '#1677ff',
              background: 'rgba(22,119,255,0.12)',
              borderRadius: 6,
              padding: '4px 12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: 20,
              border: '1px solid rgba(22,119,255,0.2)',
            }}
          >
            AI-Powered Pricing
          </div>

          {/* Heading */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
              marginBottom: 16,
            }}
          >
            Smarter pricing.
            <br />
            Bigger margins.
            <br />
            <span style={{ color: '#1677ff' }}>
              More sales.
            </span>
          </div>

          {/* Description */}
          <Text
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.7,
            }}
          >
            Monitor products across Amazon, Flipkart, Meesho and more.
            Let AI find pricing gaps before your competitors do.
          </Text>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 40,
            }}
          >
            {[
              { value: '6+', label: 'Marketplaces' },
              { value: '94%', label: 'Approval rate' },
              { value: '34%', label: 'Avg sales lift' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          © 2025 PricePilot AI · All rights reserved
        </div>

      </div>

      {/* ───────── RIGHT PANEL ───────── */}
      <div
        className="login-form-panel"
        style={{
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 56px',
        }}
      >

        <div
          style={{
            width: '100%',
            maxWidth: 380,
          }}
        >

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <Title
              level={3}
              style={{
                margin: '0 0 6px',
                fontWeight: 800,
              }}
            >
              Welcome back
            </Title>

            <Text
              style={{
                color: '#888',
                fontSize: 14,
              }}
            >
              Sign in to your PricePilot AI account
            </Text>
          </div>

          {/* Error */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{
                marginBottom: 20,
                borderRadius: 8,
              }}
            />
          )}

          {/* Form */}
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            requiredMark={false}
          >

            <Form.Item
              name="email"
              label={
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  Email address
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter your email',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bbb' }} />}
                placeholder="you@example.com"
                style={{
                  borderRadius: 8,
                  height: 44,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  Password
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter your password',
                },
              ]}
              style={{
                marginBottom: 24,
              }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                placeholder="Enter your password"
                style={{
                  borderRadius: 8,
                  height: 44,
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 46,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                background: '#0f172a',
                border: 'none',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </Button>

          </Form>

          {/* Footer */}
          <Divider style={{ margin: '28px 0 20px' }} />

          <Text
            style={{
              fontSize: 12,
              color: '#bbb',
              display: 'block',
              textAlign: 'center',
            }}
          >
            Having trouble? Contact your team administrator.
          </Text>

        </div>

      </div>

    </div>
  );
};

export default Login;