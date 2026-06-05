import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ── Role group constants ──────────────────────────────────────────────────────
const ADMIN_ROLES    = ['super_admin', 'admin', 'owner'];
const ENGINEER_ROLES = ['super_admin', 'admin', 'owner', 'engineer', 'supervisor', 'manager'];

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const _persist = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      _persist(data.token, data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (form) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      _persist(data.token, data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update local user state (e.g. after profile save)
  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  // ── Role helper functions ──────────────────────────────────────────────────
  const isAdmin    = () => user && ADMIN_ROLES.includes(user.role);
  const isEngineer = () => user && ENGINEER_ROLES.includes(user.role);
  const isWorker   = () => user?.role === 'worker';
  const isClient   = () => user?.role === 'client';

  // Returns true if the role can access any admin/engineer pages
  const canAccessApp = () => user && user.role !== 'client';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isAdmin, isEngineer, isWorker, isClient, canAccessApp,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
