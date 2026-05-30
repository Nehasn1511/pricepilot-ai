import { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi } from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';

// ─── Create Context ────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider Component ───────────────────────────────────────
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ─── Restore session on app startup ─────────────────────────
  useEffect(() => {

    const restoreSession = async () => {

      const token = localStorage.getItem(
        STORAGE_KEYS.TOKEN
      );

      // No token found
      if (!token) {
        setLoading(false);
        return;
      }

      try {

        // Real backend validation
        const userData = await getMeApi();

        setUser(userData);

      } catch {

        // ─── TEMPORARY FRONTEND TEST MODE ───
        // Backend not ready yet, so use mock user

        setUser({
          name: 'Neha S N',
          email: 'neha@gmail.com',
        });

      } finally {

        setLoading(false);

      }
    };

    restoreSession();

  }, []);

  // ─── Login function ─────────────────────────────────────────
  const login = (token, userData) => {

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      token
    );

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  // ─── Logout function ────────────────────────────────────────
  const logout = () => {

    localStorage.removeItem(
      STORAGE_KEYS.TOKEN
    );

    localStorage.removeItem(
      STORAGE_KEYS.USER
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ──────────────────────────────────────────────
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};