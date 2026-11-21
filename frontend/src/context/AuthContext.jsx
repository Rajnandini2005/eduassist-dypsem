import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// Demo users — used when backend is unreachable
const DEMO_USERS = {
  student: {
    id: 'demo-student-1',
    role: 'student',
    full_name: 'Demo Student',
    email: 'student@dypsem.edu.in',
    roll_no: '12345',
    department: 'Computer Science & Engineering',
  },
  faculty: {
    id: 'demo-faculty-1',
    role: 'faculty',
    full_name: 'Demo Faculty',
    email: 'faculty@dypsem.edu.in',
    department: 'Computer Science & Engineering',
  },
  admin: {
    id: 'demo-admin-1',
    role: 'admin',
    full_name: 'Admin User',
    email: 'admin@dypsem.edu.in',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Check demo session first
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('helpdesk_token');
      if (savedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('Saved token expired or invalid, clearing session.');
          localStorage.removeItem('helpdesk_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('helpdesk_token', res.access_token);
      setIsDemoMode(false);
      setUser(res.user);
      return res.user;
    } catch (err) {
      // If backend unavailable, offer demo mode based on email hint
      const msg = err.message || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        // Fall through — let Login page handle demo role selection
        throw new Error('BACKEND_UNAVAILABLE');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      // Try real backend first
      const res = await api.switchRole(role);
      localStorage.setItem('helpdesk_token', res.access_token);
      localStorage.removeItem('demo_user');
      setIsDemoMode(false);
      setUser(res.user);
      return res.user;
    } catch (err) {
      // Backend unavailable — use demo mode
      console.warn('Backend unavailable, using demo mode for role:', role);
      const demoUser = DEMO_USERS[role] || DEMO_USERS.student;
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      localStorage.removeItem('helpdesk_token');
      setIsDemoMode(true);
      setUser(demoUser);
      return demoUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('helpdesk_token');
    localStorage.removeItem('demo_user');
    setIsDemoMode(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
