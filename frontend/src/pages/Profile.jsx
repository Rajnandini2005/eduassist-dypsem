import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, TicketCheck, FileText, Bell, Settings,
  Info, LogOut, ChevronRight, Mail, Phone,
  BookOpen, Award, Hash, Edit3, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const role = user?.role || 'student';

  const roleConfig = {
    student: {
      label: 'Student',
      badge: 'B.Tech CSE · 4th Year',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: <GraduationCap className="w-5 h-5" />,
      iconBg: 'bg-blue-100 text-blue-700',
    },
    faculty: {
      label: 'Faculty',
      badge: 'Department Coordinator',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: <User className="w-5 h-5" />,
      iconBg: 'bg-amber-100 text-amber-700',
    },
    admin: {
      label: 'Administrator',
      badge: 'System Admin',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: <Settings className="w-5 h-5" />,
      iconBg: 'bg-rose-100 text-rose-700',
    },
  };

  const config = roleConfig[role] || roleConfig.student;

  const displayName = user?.full_name || user?.name || (role === 'student' ? 'Student User' : role === 'faculty' ? 'Faculty Member' : 'Administrator');
  const displayEmail = user?.email || `${role}@dypsem.edu.in`;
  const rollNo = user?.roll_no || (role === 'student' ? '12345' : '—');

  const menuItems = [
    {
      icon: <TicketCheck className="w-5 h-5" />,
      label: 'My Tickets',
      sublabel: 'View your support tickets',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => navigate('/tickets'),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'My Documents',
      sublabel: 'Access uploaded documents',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      action: () => navigate('/documents'),
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      sublabel: 'View all notifications',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => navigate('/notices'),
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      sublabel: 'App preferences',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      action: () => {},
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: 'About EduAssist',
      sublabel: 'Version 1.0 · DYPSEM',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      action: () => {},
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-[#0f2d52] px-5 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">My Profile</h1>
            <p className="text-blue-200 text-xs mt-0.5">EduAssist · DYPSEM</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile card — overlapping header */}
      <div className="px-4 -mt-14 relative z-10 mb-5">
        <div className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0f2d52] to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-3xl font-black select-none">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg ${config.iconBg} flex items-center justify-center border-2 border-white shadow`}>
                {config.icon}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-black text-slate-900 text-lg leading-tight truncate">{displayName}</h2>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                </div>
                <button className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="truncate text-xs">{displayEmail}</span>
            </div>
            {role === 'student' && (
              <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-xs">Roll No: {rollNo}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs">D. Y. Patil School of Engg. & Mgmt., Kolhapur</span>
            </div>
          </div>

          {/* Role badge pill */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as {config.label}</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Stats row (student only) */}
      {role === 'student' && (
        <div className="px-4 mb-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tickets', value: '—', color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Resolved', value: '—', color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Open', value: '—', color: 'text-amber-700', bg: 'bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 mb-5">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-50">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sublabel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <div className="px-4">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm transition-colors border border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900 text-center mb-1">Sign out of EduAssist?</p>
            <p className="text-xs text-slate-400 text-center mb-4">You'll need to sign in again to access your portal.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 px-4 text-center">
        <p className="text-xs text-slate-300 font-medium">EduAssist v1.0</p>
        <p className="text-xs text-slate-300">D. Y. Patil Education Society (Deemed to be University)</p>
      </div>
    </div>
  );
}
