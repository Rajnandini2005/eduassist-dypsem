import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// ── Local User Store (localStorage) ─────────────────────────────
// Persists all registered users locally so login works 24/7
// even when Render backend is sleeping or restarted

const LOCAL_USERS_KEY = 'eduassist_users';
const LOCAL_SESSION_KEY = 'eduassist_session';

// Pre-seeded DYPSEM users (always available)
const SEED_USERS = [
  {
    id: 'admin-madhura-001',
    email: 'madhura@dypsem.edu.in',
    password: 'EduAssist@2025#Dyp',
    full_name: 'Madhura',
    role: 'admin',
    department: 'Computer Science & Engineering',
    roll_no: 'DYPSEM-ADMIN-01',
  },
  {
    id: 'admin-college-001',
    email: 'admin@college.edu',
    password: 'password123',
    full_name: 'Dr. Ramesh Sharma',
    role: 'admin',
    department: 'Administration',
    roll_no: 'EMP-ADM-01',
  },
  {
    id: 'faculty-verma-001',
    email: 'faculty.verma@college.edu',
    password: 'password123',
    full_name: 'Prof. Priya Verma',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    roll_no: 'EMP-CSE-104',
  },
  {
    id: 'student-aarav-001',
    email: 'aarav.mehta@student.college.edu',
    password: 'password123',
    full_name: 'Aarav Mehta',
    role: 'student',
    department: 'Computer Science & Engineering',
    roll_no: '22CS0104',
  },
];

function getLocalUsers() {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    // Merge seed users (seed takes priority by email)
    const userEmails = new Set(users.map(u => u.email.toLowerCase()));
    const merged = [...users];
    for (const seed of SEED_USERS) {
      if (!userEmails.has(seed.email.toLowerCase())) {
        merged.push(seed);
      }
    }
    return merged;
  } catch {
    return [...SEED_USERS];
  }
}

function saveLocalUser(user) {
  try {
    const users = getLocalUsers();
    const existing = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existing >= 0) {
      users[existing] = { ...users[existing], ...user };
    } else {
      users.push(user);
    }
    // Save without seed users (they're always added fresh)
    const nonSeed = users.filter(u => !SEED_USERS.find(s => s.email.toLowerCase() === u.email.toLowerCase()));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...nonSeed, ...SEED_USERS]));
    return user;
  } catch {
    return user;
  }
}

function findLocalUser(email, password) {
  const users = getLocalUsers();
  return users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) || null;
}

function findLocalUserByEmail(email) {
  const users = getLocalUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function makeLocalToken(user) {
  // Simple base64 token for local sessions (not a real JWT — just for session persistence)
  return 'local_' + btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 7 * 86400000 }));
}

function decodeLocalToken(token) {
  try {
    if (!token || !token.startsWith('local_')) return null;
    return JSON.parse(atob(token.slice(6)));
  } catch { return null; }
}

// Demo users when clicking Quick Access buttons
const DEMO_USERS = {
  student: {
    id: 'student-aarav-001',
    role: 'student',
    full_name: 'Aarav Mehta',
    email: 'aarav.mehta@student.college.edu',
    roll_no: '22CS0104',
    department: 'Computer Science & Engineering',
  },
  faculty: {
    id: 'faculty-verma-001',
    role: 'faculty',
    full_name: 'Prof. Priya Verma',
    email: 'faculty.verma@college.edu',
    department: 'Computer Science & Engineering',
  },
  admin: {
    id: 'admin-madhura-001',
    role: 'admin',
    full_name: 'Madhura',
    email: 'madhura@dypsem.edu.in',
  },
};

// ── AuthProvider ─────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check demo session
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      // 2. Check local session token
      const session = localStorage.getItem(LOCAL_SESSION_KEY);
      if (session) {
        const payload = decodeLocalToken(session);
        if (payload && payload.exp > Date.now()) {
          const localUser = findLocalUserByEmail(payload.email);
          if (localUser) {
            const { password, ...safeUser } = localUser;
            setUser(safeUser);
            setIsDemoMode(false);
            setLoading(false);
            return;
          }
        } else {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      }

      // 3. Check backend JWT token
      const savedToken = localStorage.getItem('helpdesk_token');
      if (savedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setIsDemoMode(false);
        } catch {
          // Backend down — try to restore from local store using token email
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

  // ── LOGIN — tries backend first, falls back to local store ──────
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Try backend first
      const res = await api.login(email, password);
      localStorage.setItem('helpdesk_token', res.access_token);
      localStorage.removeItem('demo_user');
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setIsDemoMode(false);
      setUser(res.user);
      return res.user;
    } catch (err) {
      const msg = err.message || '';

      // Backend unavailable OR wrong credentials on backend?
      // Try local store (always works offline)
      const localUser = findLocalUser(email, password);
      if (localUser) {
        const token = makeLocalToken(localUser);
        localStorage.setItem(LOCAL_SESSION_KEY, token);
        localStorage.removeItem('demo_user');
        localStorage.removeItem('helpdesk_token');
        const { password: _pw, ...safeUser } = localUser;
        setIsDemoMode(false);
        setUser(safeUser);
        return safeUser;
      }

      // If backend error (not wrong password), rethrow for UI
      if (msg.includes('fetch') || msg.includes('network') || msg === 'BACKEND_UNAVAILABLE' || msg === 'BACKEND_SLOW') {
        throw new Error('BACKEND_UNAVAILABLE');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER — saves locally + tries backend ───────────────────
  const register = async (userData) => {
    // Check if email already taken locally
    const existing = findLocalUserByEmail(userData.email);
    if (existing) {
      throw new Error('This email is already registered. Please sign in.');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      full_name: userData.full_name.trim(),
      role: userData.role || 'student',
      department: userData.department || 'Computer Science & Engineering',
      roll_no: userData.roll_no || '',
      created_at: new Date().toISOString(),
    };

    // Save locally FIRST (works offline)
    saveLocalUser(newUser);

    // Try backend in background (non-blocking)
    api.register({ ...userData, email: newUser.email }).catch(() => {
      // Backend unavailable — that's OK, local save is done
      console.info('Backend unavailable during registration, saved locally.');
    });

    // Log in immediately with local session
    const token = makeLocalToken(newUser);
    localStorage.setItem(LOCAL_SESSION_KEY, token);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('helpdesk_token');
    const { password: _pw, ...safeUser } = newUser;
    setIsDemoMode(false);
    setUser(safeUser);
    return safeUser;
  };

  // ── QUICK ACCESS (Demo Role Buttons) ──────────────────────────
  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      // Try real backend first
      const res = await api.switchRole(role);
      localStorage.setItem('helpdesk_token', res.access_token);
      localStorage.removeItem('demo_user');
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setIsDemoMode(false);
      setUser(res.user);
      return res.user;
    } catch {
      // Backend unavailable — use local demo user
      const demoUser = DEMO_USERS[role] || DEMO_USERS.student;
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem(LOCAL_SESSION_KEY);
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
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setIsDemoMode(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, switchDemoRole, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
