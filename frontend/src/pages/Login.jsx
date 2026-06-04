import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, Checkbox } from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, RobotOutlined, 
  LineChartOutlined, ShoppingCartOutlined, SafetyCertificateOutlined, ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

const PricePilotLogo = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="92" height="92" rx="24" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
    <path d="M50 22 L74 36.5 L74 63.5 L50 78 L26 63.5 L26 36.5 Z" fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" strokeWidth="2" />
    <path className="graph-path" d="M 34 62 L 46 48 L 54 54 L 66 38" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
    <style>{`
      .graph-path { animation: jump 4s infinite ease-in-out; }
      @keyframes jump { 0%, 100% { d: path('M 34 62 L 46 48 L 54 54 L 66 38'); } 50% { d: path('M 34 62 L 46 58 L 54 44 L 66 38'); } }
    `}</style>
  </svg>
);

export default function Login() {
  const features = [
    { icon: <LineChartOutlined />, title: "Maximize Profits" },
    { icon: <RobotOutlined />, title: "AI Recommendations" },
    { icon: <ShoppingCartOutlined />, title: "Multi-Marketplace" },
    { icon: <SafetyCertificateOutlined />, title: "Secure & Reliable" },
  ];

  return (
    <div className="login-wrapper">
      <div className="main-layout">
        
        {/* Left: Features */}
        <div className="left-side">
          {features.map((f, i) => (
            <div className="glass-point" key={i}>
              <span style={{ color: '#60a5fa', marginRight: 12 }}>{f.icon}</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{f.title}</span>
            </div>
          ))}
        </div>

        {/* Center: Branding (Centered) */}
        <div className="center-branding">
          <PricePilotLogo size={100} />
          <Title level={1} style={{ color: '#fff', margin: '20px 0 5px' }}>PricePilot AI</Title>
          <Text style={{ color: '#60a5fa', letterSpacing: '3px', fontSize: '12px' }}>AI POWERED PRICING PLATFORM</Text>
        </div>

        {/* Right: Login Card */}
        <Card className="glass-auth-card" bordered={false}>
          <Tabs centered items={[
            { key: 'login', label: <span style={{ color: '#e2e8f0' }}>Login</span>, children: (
              <Form layout="vertical">
                <Form.Item name="email"><Input prefix={<MailOutlined />} placeholder="Email address" className="glass-input" /></Form.Item>
                <Form.Item name="password"><Input.Password prefix={<LockOutlined />} placeholder="Password" className="glass-input" /></Form.Item>
                <Button type="primary" block className="gradient-btn">Sign In <ArrowRightOutlined /></Button>
              </Form>
            )},
            { key: 'register', label: <span style={{ color: '#e2e8f0' }}>Register</span>, children: (
              <Form layout="vertical">
                <Form.Item name="name"><Input prefix={<UserOutlined />} placeholder="Full Name" className="glass-input" /></Form.Item>
                <Form.Item name="email"><Input prefix={<MailOutlined />} placeholder="Email address" className="glass-input" /></Form.Item>
                <Button type="primary" block className="gradient-btn">Register</Button>
              </Form>
            )}
          ]} />
        </Card>
      </div>

      <style>{`
        .login-wrapper { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: #090e1a; overflow: hidden; }
        /* Grid refined: Branding column takes 1fr to sit center */
        .main-layout { display: grid; grid-template-columns: 240px 1fr 380px; gap: 40px; align-items: center; width: 100%; max-width: 1100px; padding: 20px; }
        .center-branding { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .glass-point { padding: 16px 20px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); margin-bottom: 12px; }
        .glass-auth-card { background: rgba(30, 41, 59, 0.4) !important; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 24px !important; }
        .glass-input { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #fff !important; }
        .gradient-btn { background: #4f46e5 !important; height: 44px !important; border-radius: 12px !important; }
      `}</style>
    </div>
  );
}