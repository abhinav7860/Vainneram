import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'shared_library_user',
    username: 'kattan_chaya_listener',
    display_name: 'ചായക്കട ലൈബ്രറി (Tea Stall Library)'
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Auto-load library session on mount (no login required)
  useEffect(() => {
    api.getCurrentUser()
      .then(res => {
        if (res.user) setUser(res.user);
        if (res.stats) setStats(res.stats);
      })
      .catch(err => {
        console.warn('Auto guest session init:', err.message);
      });
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.user) setUser(res.user);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.warn('Refresh user error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      stats,
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
