import { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi } from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';

// ─── Create the context ────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider — wraps your entire app ─────────────────────────
export const AuthProvider = ({ children }) => {

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token on startup

  // On app startup — check if a token exists in localStorage
  // If yes, verify it with the backend and restore the user session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!token) {
        setLoading(false); // No token — go straight to login
        return;
      }

      try {
        const userData = await getMeApi(); // Verify token is still valid
        setUser(userData);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Called after successful login API response
  const login = (token, userData) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
  };

  // Called when user clicks logout
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom hook — use this in every component that needs auth ─
// Instead of: useContext(AuthContext)
// You write:  useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};