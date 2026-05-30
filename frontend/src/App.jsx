import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
const Products            = () => <div>📦 Products — coming Day 10</div>;
const ProductDetail       = () => <div>🔍 Product Detail — coming Day 13</div>;
const Recommendations     = () => <div>🤖 Recommendations — coming Day 15</div>;
const RecommendationDetail= () => <div>🤖 Recommendation Detail</div>;
const Approvals           = () => <div>✅ Approvals — coming Day 16</div>;
const Reports             = () => <div>📈 Reports — coming Day 18</div>;
const Users               = () => <div>👥 Users — coming Day 20</div>;
const MarketplaceAccounts = () => <div>🛍️ Marketplace Accounts</div>;
const Settings            = () => <div>⚙️ Settings</div>;

// ─── Helper: wraps ProtectedRoute + DashboardLayout together ──
// Saves you repeating both wrappers on every single route
const PrivatePage = ({ element }) => (
  <ProtectedRoute>
    <DashboardLayout>
      {element}
    </DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route path={ROUTES.DASHBOARD}             element={<PrivatePage element={<Dashboard />} />} />
        <Route path={ROUTES.PRODUCTS}              element={<PrivatePage element={<Products />} />} />
        <Route path={ROUTES.PRODUCT_DETAIL}        element={<PrivatePage element={<ProductDetail />} />} />
        <Route path={ROUTES.RECOMMENDATIONS}       element={<PrivatePage element={<Recommendations />} />} />
        <Route path={ROUTES.RECOMMENDATION_DETAIL} element={<PrivatePage element={<RecommendationDetail />} />} />
        <Route path={ROUTES.APPROVALS}             element={<PrivatePage element={<Approvals />} />} />
        <Route path={ROUTES.REPORTS}               element={<PrivatePage element={<Reports />} />} />
        <Route path={ROUTES.USERS}                 element={<PrivatePage element={<Users />} />} />
        <Route path={ROUTES.MARKETPLACE_ACCOUNTS}  element={<PrivatePage element={<MarketplaceAccounts />} />} />
        <Route path={ROUTES.SETTINGS}              element={<PrivatePage element={<Settings />} />} />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;