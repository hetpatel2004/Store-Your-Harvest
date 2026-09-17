import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agricold_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agricold_token'));
  const [loading, setLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('agricold_user', JSON.stringify(res.data.user));
            setIsSessionValid(true);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
      setIsSessionValid(!token);
    };

    checkUser();
  }, [token]);

  // Login: receives email & password, validates, stores JWT token
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('agricold_user', JSON.stringify(res.data.user));
      localStorage.setItem('agricold_token', res.data.token);
      setIsSessionValid(true);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Register: owner registers first, must then login with their credentials
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  // Forgot password: sends reset link to email
  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agricold_user');
    localStorage.removeItem('agricold_token');
    setIsSessionValid(false);
  };

  // Role check helpers
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const canAccessFeature = (feature) => {
    // Define feature permissions based on role
    const permissions = {
      manageStorages: isOwner,
      viewAdminDashboard: isAdmin,
      bookStorage: isAuthenticated,
      addReviews: isAuthenticated,
      submitInquiries: isAuthenticated,
    };
    return permissions[feature];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isSessionValid,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        isAuthenticated: !!user,
        isFarmer: hasRole('farmer'),
        isOwner: hasRole('owner'),
        isAdmin: hasRole('admin'),
        hasRole,
        hasAnyRole,
        canAccessFeature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
