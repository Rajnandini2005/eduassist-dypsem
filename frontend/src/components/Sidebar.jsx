import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  TicketCheck, 
  FileText, 
  Building2, 
  Bell, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Sparkles, 
  ClipboardList, 
  BookOpen, 
  Briefcase,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (role === 'student') {
      return [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Ask AI Assistant', path: '/chat', icon: Bot, highlight: true },
        { name: 'My Grievances', path: '/tickets', icon: TicketCheck },
        { name: 'Handbooks & Docs', path: '/documents', icon: FileText },
        { name: 'Departments & FAQs', path: '/departments', icon: Building2 },
        { name: 'Campus Circulars', path: '/notices', icon: Bell },
      ];
    } else if (role === 'faculty') {
      return [
        { name: 'Faculty Workspace', path: '/', icon: Briefcase },
        { name: 'AI Staff Assistant', path: '/chat', icon: Bot, highlight: true },
        { name: 'Assigned Grievances', path: '/tickets', icon: ClipboardList },
        { name: 'Course Handbooks', path: '/documents', icon: BookOpen },
        { name: 'Department FAQs', path: '/departments', icon: Building2 },
        { name: 'Class Circulars', path: '/notices', icon: Bell },
        { name: 'Department Analytics', path: '/analytics', icon: BarChart3 },
      ];
    } else {
      return [
        { name: 'Executive Command', path: '/', icon: LayoutDashboard },
        { name: 'AI Assistant (RAG)', path: '/chat', icon: Bot, highlight: true },
        { name: 'All Campus Tickets', path: '/tickets', icon: TicketCheck },
        { name: 'Knowledge Repository', path: '/documents', icon: FileText },
        { name: 'Departments & FAQs', path: '/departments', icon: Building2 },
        { name: 'Circulars Manager', path: '/notices', icon: Bell },
        { name: 'University Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'User & Role Directory', path: '/admin/users', icon: Users },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleSectionLabel = () => {
    if (role === 'student') return 'Student Services';
    if (role === 'faculty') return 'Faculty Tools';
    return 'Administrative Operations';
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 shadow-xl
      transition-transform duration-300 ease-in-out
      md:translate-x-0 md:w-64 md:shadow-sm
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">

        {/* DYPSEM Header */}
        <div className="bg-[#1e3a5f] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
              <img src="/logo.svg" alt="DYPSEM" className="w-9 h-9 object-contain" onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="text-blue-900 font-black text-sm">EA</div>';
              }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-white text-sm tracking-tight">EduAssist</h1>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider truncate">DYPSEM · Kolhapur</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* College Info Strip */}
        <div className="px-4 py-2.5 bg-blue-950/5 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Academic Year 2026–27</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="text-emerald-700 font-bold text-[10px]">Live</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">D. Y. Patil School of Engg. & Mgmt.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {getRoleSectionLabel()}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-blue-50 text-[#1e3a5f] font-bold border-l-4 border-[#1e3a5f] shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-all ${item.highlight ? 'text-blue-600' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0 ${
                role === 'admin' ? 'bg-blue-900' : role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-700'
              }`}>
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    role === 'admin' ? 'bg-rose-500' : role === 'faculty' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    {role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
