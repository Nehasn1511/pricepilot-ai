import { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; // You will build this on Day 6

const { Sider, Header, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        breakpoint="lg"           // Auto-collapses on tablets
        style={{
          position: 'fixed',      // Fixed so it doesn't scroll with content
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* ── Main area (shifts right when sidebar is open) ───── */}
      <Layout style={{
        marginLeft: collapsed ? 64 : 220,
        transition: 'margin-left 0.2s',  // Smooth shift when toggling
      }}>

        {/* ── Navbar ────────────────────────────────────────── */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <Navbar />
        </Header>

        {/* ── Page content ──────────────────────────────────── */}
        <Content style={{
          margin: '24px',
          minHeight: 'calc(100vh - 64px - 48px)',
        }}>
          {/* Every page drops in here */}
          {children}
        </Content>

      </Layout>
    </Layout>
  );
};

export default DashboardLayout;