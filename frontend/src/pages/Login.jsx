import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  GraduationCap, UserCheck, ShieldCheck, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Password strength checker
function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One symbol (e.g. @#$%!)');
  return errors;
}

export default function Login() {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('home'); // 'home' | 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const passwordStrength = getPasswordStrength(password);
  const passwordErrors = mode === 'signup' ? validatePassword(password) : [];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg === 'BACKEND_UNAVAILABLE') {
        setError('Server unavailable. Use Quick Access below to enter Demo Mode.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError('Password must have: ' + pwdErrors.join(', '));
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { api } = await import('../services/api');
      const res = await api.register({ email: email.trim(), password, full_name: fullName.trim(), role: 'student' });
      if (res.access_token) {
        localStorage.setItem('helpdesk_token', res.access_token);
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already exists')) {
        setError('This email is already registered. Please login instead.');
      } else if (msg === 'BACKEND_UNAVAILABLE' || msg.includes('fetch') || msg.includes('network')) {
        setError('Server unavailable. Please try again later or use Quick Access below.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRole = async (roleId) => {
    setError('');
    setSelectedRole(roleId);
    setLoading(true);
    try {
      await switchDemoRole(roleId);
      navigate('/');
    } catch (err) {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  const roles = [
    {
      id: 'student',
      label: 'Student',
      sublabel: 'B.Tech / M.Tech',
      icon: <GraduationCap className="w-5 h-5" />,
      iconBg: 'bg-blue-100 text-blue-700',
      btnClass: 'bg-[#0f2d52] hover:bg-blue-900 text-white',
    },
    {
      id: 'faculty',
      label: 'Faculty',
      sublabel: 'Department',
      icon: <UserCheck className="w-5 h-5" />,
      iconBg: 'bg-amber-100 text-amber-700',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    {
      id: 'admin',
      label: 'Admin',
      sublabel: 'System',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-rose-100 text-rose-700',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f2d52] flex flex-col">

      {/* Top Header */}
      <div className="relative bg-[#0f2d52] px-6 pt-10 pb-16 text-center overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -top-8 -left-12 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-40 h-24 flex items-center justify-center">
            <img
              src="/eduassist-logo-new.jpg"
              alt="EduAssist"
              className="max-h-24 max-w-full object-contain drop-shadow-lg rounded-xl"
              onError={(e) => { e.target.style.display='none'; }}
            />
          </div>
          <div className="mt-1 flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">
            <img src="/dypsem-logo.jpg" alt="" className="w-5 h-5 object-contain rounded" style={{filter:'brightness(2)'}}
              onError={(e) => { e.target.style.display='none'; }} />
            <span className="text-white font-bold text-xs tracking-wide">DYPSEM · Kolhapur</span>
          </div>
          <div className="mt-1">
            <p className="text-white/90 text-base font-semibold">
              {mode === 'signup' ? 'Create Account 📝' : 'Welcome Back! 👋'}
            </p>
            <p className="text-blue-200 text-xs mt-0.5">
              {mode === 'signup' ? 'Register as a new user' : 'Sign in to continue'}
            </p>
          </div>
        </div>
      </div>

      {/* White card */}
      <div className="flex-1 bg-slate-50 rounded-t-3xl -mt-6 px-5 pt-6 pb-8 overflow-y-auto">

        {/* College strip */}
        <div className="flex items-center gap-3 mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow border border-blue-100">
            <img src="/dypsem-logo.jpg" alt="DYPSEM" className="w-full h-full object-contain p-0.5"
              onError={(e) => { e.target.style.display='none'; }} />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#0f2d52] leading-tight">
              D. Y. Patil School of Engineering & Management
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              D. Y. Patil Education Society (Deemed to be University) · Kolhapur
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {(mode === 'home' || mode === 'login') && (
          <form onSubmit={handleLogin} className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@dypsem.edu.in"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-[#0f2d52] hover:bg-blue-900 text-white text-sm font-black shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && !selectedRole ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing In...</span></>
              ) : (
                <><span>Login</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              New user?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                className="text-[#0f2d52] font-bold hover:underline">
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@dypsem.edu.in"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Password
                <span className="ml-2 text-[9px] font-normal text-slate-400">
                  (8+ chars, uppercase, lowercase, number, symbol)
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. EduAssist@2025"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score === 3 ? 'text-yellow-500' : passwordStrength.score === 4 ? 'text-blue-500' : 'text-green-500'}`}>
                    {passwordStrength.label} Password
                  </p>
                  {passwordErrors.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {passwordErrors.map((e, i) => (
                        <li key={i} className="flex items-center gap-1 text-[10px] text-red-500">
                          <AlertCircle className="w-3 h-3" /> {e}
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordErrors.length === 0 && (
                    <p className="flex items-center gap-1 text-[10px] text-green-500 mt-1">
                      <CheckCircle className="w-3 h-3" /> Password meets all requirements ✓
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-[#0f2d52] focus:ring-blue-100'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <p className="mt-1 text-[10px] text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match ✓
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-[#0f2d52] hover:bg-blue-900 text-white text-sm font-black shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Creating Account...</span></>
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }}
                className="text-[#0f2d52] font-bold hover:underline">
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-semibold">QUICK ACCESS</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Role buttons — demo mode */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleDemoRole(role.id)}
              disabled={loading}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold shadow transition-all disabled:opacity-60 ${role.btnClass}`}
            >
              {loading && selectedRole === role.id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.iconBg}`}>
                  {role.icon}
                </div>
              )}
              <span>{role.label}</span>
              <span className="text-[8px] opacity-70 font-normal">{role.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400">
          AI-Powered Helpdesk · DYPSEM · Kolhapur
        </p>
      </div>
    </div>
  );
}
