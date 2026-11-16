import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('vainneram_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.getCurrentUser()
      .then(res => {
        setUser(res.user);
        setStats(res.stats);
      })
      .catch(err => {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('vainneram_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (identifier, password) => {
    const res = await api.login(identifier, password);
    localStorage.setItem('vainneram_token', res.token);
    setUser(res.user);
    refreshUser();
    return res.user;
  };

  const register = async (username, email, password, displayName) => {
    const res = await api.register(username, email, password, displayName);
    localStorage.setItem('vainneram_token', res.token);
    setUser(res.user);
    refreshUser();
    return res.user;
  };

  const loginAsDemo = async () => {
    const res = await api.demoLogin();
    localStorage.setItem('vainneram_token', res.token);
    setUser(res.user);
    refreshUser();
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('vainneram_token');
    setUser(null);
    setStats(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
      setStats(res.stats);
    } catch (err) {
      console.warn('Refresh user error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      stats,
      login,
      register,
      loginAsDemo,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
