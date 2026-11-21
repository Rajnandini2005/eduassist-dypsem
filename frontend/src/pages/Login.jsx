import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  GraduationCap, UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSignIn = async (roleId) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg === 'BACKEND_UNAVAILABLE') {
        setError('Backend server unavailable. Use the role buttons below to enter Demo Mode.');
      } else {
        setError(msg || 'Invalid credentials. Use role buttons below for demo access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'student',
      label: 'Student',
      sublabel: 'B.Tech / M.Tech Portal',
      desc: 'Attendance, CGPA, AI Assistant, Tickets',
      icon: <GraduationCap className="w-5 h-5" />,
      iconBg: 'bg-blue-100 text-blue-700',
      btnClass: 'bg-[#0f2d52] hover:bg-blue-900 text-white shadow-blue-900/20',
    },
    {
      id: 'faculty',
      label: 'Faculty',
      sublabel: 'Department Coordinator',
      desc: 'Grievances, Circulars, Syllabus Management',
      icon: <UserCheck className="w-5 h-5" />,
      iconBg: 'bg-amber-100 text-amber-700',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
    },
    {
      id: 'admin',
      label: 'Admin',
      sublabel: 'System Administrator',
      desc: 'User Management, Analytics, Full Access',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-rose-100 text-rose-700',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f2d52] flex flex-col">

      {/* Top header area */}
      <div className="relative bg-[#0f2d52] px-6 pt-10 pb-16 text-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -top-8 -left-12 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center gap-3">

          {/* Official DYPSEM College Logo */}
          <div className="w-28 h-16 flex items-center justify-center">
            <img
              src="/dypsem-logo.jpg"
              alt="D. Y. Patil School of Engineering & Management"
              className="max-h-16 max-w-full object-contain drop-shadow-lg"
              style={{ filter: 'brightness(1.08) contrast(1.05)' }}
            />
          </div>

          {/* App name below logo */}
          <div className="mt-2 flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">
            {/* EduAssist mini logo */}
            <img src="/logo.svg" alt="" className="w-5 h-5" />
            <span className="text-white font-black text-sm tracking-wide">EduAssist</span>
            <span className="text-blue-200 text-xs">· Your Smart College Helpdesk</span>
          </div>

          <div className="mt-1">
            <p className="text-white/90 text-base font-semibold">Welcome Back! 👋</p>
            <p className="text-blue-200 text-xs mt-0.5">Sign in to continue</p>
          </div>
        </div>
      </div>

      {/* White card */}
      <div className="flex-1 bg-slate-50 rounded-t-3xl -mt-6 px-5 pt-6 pb-8 overflow-y-auto">

        {/* College name strip */}
        <div className="flex items-center gap-3 mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-[#0f2d52] flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
            <img src="/dypsem-logo.jpg" alt="" className="w-full h-full object-contain" style={{ filter: 'brightness(10)' }} />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#0f2d52] leading-tight">
              D. Y. Patil School of Engineering & Management
            </p>
            <p className="text-[10px] text-slate-500">
              Kasaba Bawada, Kolhapur · D. Y. Patil Education Society (Deemed to be University)
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email / Roll Number</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@dypsem.edu.in"
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
                className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input type="checkbox" className="rounded w-3.5 h-3.5 accent-[#0f2d52]" />
              Remember Me
            </label>
            <span className="text-[#0f2d52] font-bold cursor-pointer hover:underline">Forgot Password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#0f2d52] hover:bg-blue-900 text-white text-sm font-black shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && !selectedRole ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-semibold">OR SELECT YOUR ROLE</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Role buttons */}
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.iconBg}`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{role.label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                      {role.sublabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{role.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleRoleSignIn(role.id)}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${role.btnClass}`}
              >
                {loading && selectedRole === role.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {role.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          AI-Powered Helpdesk · DYPSEM · Kolhapur
        </p>
      </div>
    </div>
  );
}
