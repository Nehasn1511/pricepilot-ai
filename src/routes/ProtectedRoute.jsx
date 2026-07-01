import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Still checking token validity on startup — show nothing yet
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: 16,
        color: '#888'
      }}>
        Loading...
      </div>
    );
  }

  // No user — send to login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // User is authenticated — render the page
  return children;
};

export default ProtectedRoute;