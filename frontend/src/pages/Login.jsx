import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight,
  GraduationCap, UserCheck, ShieldCheck, MessageSquare
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
      setError('Authentication failed. Check backend connection.');
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
      setError(err.message || 'Invalid credentials. Use role buttons below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f2d52] flex flex-col">

      {/* Top wave/header area */}
      <div className="relative bg-[#0f2d52] px-6 pt-12 pb-16 text-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -top-8 -left-12 w-36 h-36 rounded-full bg-white/5" />
        
        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            <img src="/logo.svg" alt="EduAssist" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">EduAssist</h1>
            <p className="text-blue-200 text-sm font-medium">Your Smart College Helpdesk</p>
          </div>
          <div className="mt-1">
            <p className="text-white/80 text-base font-semibold">Welcome Back! 👋</p>
            <p className="text-blue-200 text-xs mt-0.5">Sign in to continue</p>
          </div>
        </div>
      </div>

      {/* White card area */}
      <div className="flex-1 bg-slate-50 rounded-t-3xl -mt-6 px-5 pt-7 pb-8 overflow-y-auto">

        {/* College name strip */}
        <div className="flex items-center gap-3 mb-6 p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-[#0f2d52] flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/logo.svg" alt="" className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-[11px] font-black text-[#0f2d52] leading-tight">D. Y. Patil School of Engg. & Mgmt.</p>
            <p className="text-[10px] text-slate-500">Kasaba Bawada, Kolhapur · D.Y.P.E.S. (Deemed Univ.)</p>
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
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Role quick-sign-in buttons */}
        <p className="text-xs font-bold text-slate-500 text-center mb-3 uppercase tracking-wider">Sign in directly as</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: 'student', label: 'Student', icon: GraduationCap, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', iconColor: 'text-emerald-700' },
            { id: 'faculty', label: 'Faculty', icon: UserCheck, color: 'bg-amber-50 border-amber-200 text-amber-800', iconColor: 'text-amber-700' },
            { id: 'admin',   label: 'Admin',   icon: ShieldCheck, color: 'bg-blue-50 border-blue-200 text-blue-800',   iconColor: 'text-blue-800' },
          ].map(({ id, label, icon: Icon, color, iconColor }) => (
            <button
              key={id}
              onClick={() => handleRoleSignIn(id)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border-2 ${color} transition-all disabled:opacity-50 hover:shadow-md active:scale-95`}
            >
              {loading && selectedRole === id
                ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Icon className={`w-6 h-6 ${iconColor}`} />
              }
              <span className="text-[11px] font-black">{label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">D. Y. Patil School of Engineering & Management</p>
          <p className="text-[10px] text-slate-300">Powered by Google Gemini AI · FastAPI · Supabase</p>
        </div>

      </div>
    </div>
  );
}
