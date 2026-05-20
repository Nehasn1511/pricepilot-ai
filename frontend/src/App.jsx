import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import ProtectedRoute from './routes/ProtectedRoute';

// ─── Real page (built today) ───────────────────────────────────
import Login from './pages/Login';

// ─── Placeholder pages (built in coming days) ─────────────────
const Dashboard           = () => <div style={{ padding: 40 }}>📊 Dashboard — coming Day 5</div>;
const Products            = () => <div style={{ padding: 40 }}>📦 Products — coming Day 10</div>;
const ProductDetail       = () => <div style={{ padding: 40 }}>🔍 Product Detail — coming Day 13</div>;
const Recommendations     = () => <div style={{ padding: 40 }}>🤖 Recommendations — coming Day 15</div>;
const RecommendationDetail= () => <div style={{ padding: 40 }}>🤖 Recommendation Detail</div>;
const Approvals           = () => <div style={{ padding: 40 }}>✅ Approvals — coming Day 16</div>;
const Reports             = () => <div style={{ padding: 40 }}>📈 Reports — coming Day 18</div>;
const Users               = () => <div style={{ padding: 40 }}>👥 Users — coming Day 20</div>;
const MarketplaceAccounts = () => <div style={{ padding: 40 }}>🛍️ Marketplace Accounts</div>;
const Settings            = () => <div style={{ padding: 40 }}>⚙️ Settings</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public — no auth needed */}
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Protected — ProtectedRoute checks token before rendering */}
        <Route path={ROUTES.DASHBOARD} element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path={ROUTES.PRODUCTS} element={
          <ProtectedRoute><Products /></ProtectedRoute>
        } />
        <Route path={ROUTES.PRODUCT_DETAIL} element={
          <ProtectedRoute><ProductDetail /></ProtectedRoute>
        } />
        <Route path={ROUTES.RECOMMENDATIONS} element={
          <ProtectedRoute><Recommendations /></ProtectedRoute>
        } />
        <Route path={ROUTES.RECOMMENDATION_DETAIL} element={
          <ProtectedRoute><RecommendationDetail /></ProtectedRoute>
        } />
        <Route path={ROUTES.APPROVALS} element={
          <ProtectedRoute><Approvals /></ProtectedRoute>
        } />
        <Route path={ROUTES.REPORTS} element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />
        <Route path={ROUTES.USERS} element={
          <ProtectedRoute><Users /></ProtectedRoute>
        } />
        <Route path={ROUTES.MARKETPLACE_ACCOUNTS} element={
          <ProtectedRoute><MarketplaceAccounts /></ProtectedRoute>
        } />
        <Route path={ROUTES.SETTINGS} element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        {/* Any unknown URL → login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;