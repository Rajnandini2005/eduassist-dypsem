import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  LogOut,
  ChevronDown,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SupabaseModal from './SupabaseModal';
import { getAvatarUrl } from '../utils/avatar';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false); // reset on user change
    api.getSupabaseStatus().then(setSupabaseStatus).catch(() => {});
  }, [user]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const avatarUrl = getAvatarUrl(user);

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'faculty':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Faculty</span>
          </span>
        );
      case 'admin':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
            <span className="hidden sm:inline">Admin</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Student</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Left: Mobile toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-xl md:hidden hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-black text-[#1e3a5f]">DYPSEM</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-700 capitalize">{user?.role || 'Helpdesk'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-mono text-[11px]">AY 2026–27</span>
        </div>

        {/* Mobile: Show app name */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-black text-sm text-slate-900">EduAssist</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">

        {/* Supabase status */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            supabaseStatus?.connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Database connection status"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {supabaseStatus?.connected ? 'DB Connected' : 'Local Mode'}
          </span>
          <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        {/* Mobile DB dot */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`sm:hidden flex items-center justify-center w-8 h-8 rounded-xl border ${
            supabaseStatus?.connected ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        {/* Role badge */}
        {getRoleBadge()}

        {/* User dropdown with AVATAR */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            {/* Avatar image */}
            {!avatarError ? (
              <img
                src={avatarUrl}
                alt={user?.full_name || 'User'}
                onError={() => setAvatarError(true)}
                className="w-8 h-8 rounded-lg object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                user?.role === 'admin' ? 'bg-blue-900' : user?.role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-700'
              }`}>
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[90px] truncate">
              {user?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                {/* Profile header with big avatar */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  {!avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={user?.full_name}
                      onError={() => setAvatarError(true)}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0 ${
                      user?.role === 'admin' ? 'bg-blue-900' : user?.role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-700'
                    }`}>
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 mt-1 inline-block">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* College info */}
                <div className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 border-b border-slate-100">
                  <p className="font-semibold text-[#1e3a5f]">DYPSEM, Kolhapur</p>
                  <p className="text-[10px] text-slate-400">D. Y. Patil School of Engg. & Mgmt.</p>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 rounded-xl hover:bg-rose-50 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supabase Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => {
          setSupabaseModalOpen(false);
          api.getSupabaseStatus().then(setSupabaseStatus).catch(() => {});
        }}
      />
    </header>
  );
}
import { 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  LogOut,
  ChevronDown,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SupabaseModal from './SupabaseModal';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  useEffect(() => {
    api.getSupabaseStatus().then(setSupabaseStatus).catch(console.error);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'faculty':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Faculty</span>
          </span>
        );
      case 'admin':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
            <span className="hidden sm:inline">Admin</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Student</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Left: Mobile toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-xl md:hidden hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-black text-[#1e3a5f]">DYPSEM</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-700 capitalize">{user?.role || 'Helpdesk'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-mono text-[11px]">AY 2026–27</span>
        </div>

        {/* Mobile: Show app name */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-black text-sm text-slate-900">EduAssist</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">

        {/* Supabase status (compact on mobile) */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            supabaseStatus?.connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Database connection status"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {supabaseStatus?.connected ? 'DB Connected' : 'Local Mode'}
          </span>
          <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        {/* Mobile DB dot only */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`sm:hidden flex items-center justify-center w-8 h-8 rounded-xl border ${
            supabaseStatus?.connected
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'
          }`}
          title="Database status"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        {/* Role badge */}
        {getRoleBadge()}

        {/* User dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${
              user?.role === 'admin' ? 'bg-blue-900' : user?.role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-700'
            }`}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[100px] truncate">
              {user?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {user?.role} role
                    </span>
                    <span className="text-[10px] text-slate-400">Role locked</span>
                  </div>
                </div>

                {/* College info */}
                <div className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 border-b border-slate-100">
                  <p className="font-semibold text-[#1e3a5f]">DYPSEM, Kolhapur</p>
                  <p className="text-[10px] text-slate-400">D. Y. Patil School of Engg. & Mgmt.</p>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 rounded-xl hover:bg-rose-50 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supabase Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => {
          setSupabaseModalOpen(false);
          api.getSupabaseStatus().then(setSupabaseStatus).catch(console.error);
        }}
      />
    </header>
  );
}
