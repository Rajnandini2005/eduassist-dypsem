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
    id: 'user-rajnandini-001',
    email: 'rajnandini@dypsem.edu.in',
    password: 'EduAssist@2025#Dyp',
    full_name: 'rajnandini',
    role: 'student',
    gender: 'female',
    avatar: '/avatar-girl.jpg',
    department: 'Computer Science & Engineering',
    roll_no: '22CS0199',
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

  // ── LOGIN — tries local store FIRST, then backend ──────────────
  // This ensures 24/7 login even when Render backend is sleeping
  const login = async (email, password) => {
    setLoading(true);
    try {
      // ✅ ALWAYS try local store first (instant, 24/7)
      const localUser = findLocalUser(email, password);
      if (localUser) {
        const token = makeLocalToken(localUser);
        localStorage.setItem(LOCAL_SESSION_KEY, token);
        localStorage.removeItem('demo_user');
        localStorage.removeItem('helpdesk_token');
        const { password: _pw, ...safeUser } = localUser;
        setIsDemoMode(false);
        setUser(safeUser);
        // Also try backend in background (non-blocking) to sync
        api.login(email, password).then(res => {
          if (res?.access_token) {
            localStorage.setItem('helpdesk_token', res.access_token);
          }
        }).catch(() => {/* backend unavailable — local login already done */});
        return safeUser;
      }

      // Not in local store — try backend (for users registered only on backend)
      try {
        const res = await api.login(email, password);
        // Backend success → save user locally too for future offline access
        if (res?.user) {
          saveLocalUser({ ...res.user, password });
          localStorage.setItem('helpdesk_token', res.access_token);
          localStorage.removeItem('demo_user');
          localStorage.removeItem(LOCAL_SESSION_KEY);
          setIsDemoMode(false);
          setUser(res.user);
          return res.user;
        }
      } catch (backendErr) {
        const msg = backendErr.message || '';
        // Backend down or slow — user not found anywhere
        if (msg === 'BACKEND_UNAVAILABLE' || msg === 'BACKEND_SLOW' || msg.includes('fetch') || msg.includes('network')) {
          throw new Error('BACKEND_UNAVAILABLE');
        }
        // Backend returned wrong credentials
        throw new Error('WRONG_CREDENTIALS');
      }

      throw new Error('WRONG_CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER — ALWAYS SUCCEEDS locally, backend is optional ───
  const register = async (userData) => {
    // Only fail if email already exists
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
      gender: userData.gender || (userData.avatar?.includes('girl') ? 'female' : 'male'),
      avatar: userData.avatar || (userData.gender === 'female' ? '/avatar-girl.jpg' : '/avatar-boy.jpg'),
      created_at: new Date().toISOString(),
    };

    // 1. Save locally (always works, 24/7, no server needed)
    try { saveLocalUser(newUser); } catch { /* ignore */ }

    // 2. Try backend silently in background — also saves token when received!
    setTimeout(() => {
      try {
        api.register({ 
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          role: newUser.role,
          department_id: "11111111-1111-1111-1111-111111111111",
          roll_no: newUser.roll_no,
          avatar_url: newUser.avatar,
          gender: newUser.gender
        }).then(res => {
          if (res?.access_token) {
            localStorage.setItem('helpdesk_token', res.access_token);
          }
        }).catch(() => { /* backend unavailable — ignore */ });
      } catch { /* ignore */ }
    }, 100);

    // 3. Create local session and log in immediately
    try {
      const token = makeLocalToken(newUser);
      localStorage.setItem(LOCAL_SESSION_KEY, token);
      localStorage.removeItem('demo_user');
    } catch { /* ignore storage errors */ }

    const { password: _pw, ...safeUser } = newUser;
    setIsDemoMode(false);
    setUser(safeUser);
    return safeUser;  // ✅ Always returns success
  };

  // ── QUICK ACCESS (Demo Role Buttons) ──────────────────────────
  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      // Check local registered users first to pick real account
      const localUsers = getLocalUsers();
      if (role === 'student') {
        const student = localUsers.find(u => u.role === 'student' && u.email !== 'aarav.mehta@student.college.edu') || DEMO_USERS.student;
        if (student && student.email !== 'aarav.mehta@student.college.edu') {
          const token = makeLocalToken(student);
          localStorage.setItem(LOCAL_SESSION_KEY, token);
          localStorage.removeItem('demo_user');
          const { password: _pw, ...safeUser } = student;
          setIsDemoMode(false);
          setUser(safeUser);
          api.switchRole(role).then(res => {
            if (res?.access_token) localStorage.setItem('helpdesk_token', res.access_token);
          }).catch(() => {});
          return safeUser;
        }
      } else if (role === 'admin') {
        const adminUser = localUsers.find(u => u.email === 'madhura@dypsem.edu.in') || DEMO_USERS.admin;
        const token = makeLocalToken(adminUser);
        localStorage.setItem(LOCAL_SESSION_KEY, token);
        localStorage.removeItem('demo_user');
        const { password: _pw, ...safeUser } = adminUser;
        setIsDemoMode(false);
        setUser(safeUser);
        api.switchRole(role).then(res => {
          if (res?.access_token) localStorage.setItem('helpdesk_token', res.access_token);
        }).catch(() => {});
        return safeUser;
      }

      // Try real backend
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
