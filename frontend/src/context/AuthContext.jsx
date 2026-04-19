import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // On mount: hydrate session token if present
  useEffect(() => {
    const stored = localStorage.getItem('sessionToken');
    if (stored) {
      setSessionToken(stored);
      apiService.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
      // Try to fetch current user profile from backend
      apiService
        .get('/auth/me')
        .then((res) => {
          if (res.data?.user) setUserProfile(res.data.user);
        })
        .catch((err) => {
          console.warn('Failed to hydrate session from token:', err?.message || err);
          localStorage.removeItem('sessionToken');
          delete apiService.defaults.headers.common['Authorization'];
          setSessionToken(null);
        });
    }

    // no-op: social auth removed. hydration handled above via stored JWT.
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiService.post('/auth/login', { email, password });
      if (res.data?.sessionToken) {
        setSessionToken(res.data.sessionToken);
        localStorage.setItem('sessionToken', res.data.sessionToken);
        apiService.defaults.headers.common['Authorization'] = `Bearer ${res.data.sessionToken}`;
      }
      if (res.data?.user) setUserProfile(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    setLoading(true);
    try {
      const res = await apiService.post('/auth/signup', { email, password, displayName });
      if (res.data?.sessionToken) {
        setSessionToken(res.data.sessionToken);
        localStorage.setItem('sessionToken', res.data.sessionToken);
        apiService.defaults.headers.common['Authorization'] = `Bearer ${res.data.sessionToken}`;
      }
      if (res.data?.user) setUserProfile(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Stateless JWT: simply clear client session
      setUser(null);
      setUserProfile(null);
      setSessionToken(null);
      localStorage.removeItem('sessionToken');
      delete apiService.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  const value = {
    user,
    userProfile,
    setUserProfile,
    sessionToken,
    loading,
    error,
    logout,
    loginWithEmail,
    signupWithEmail,
    isAuthenticated: !!sessionToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
