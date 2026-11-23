import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  TicketCheck, 
  Bell, 
  User,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const location = useLocation();

  // Don't show on login page
  if (location.pathname === '/login') return null;

  const getNavItems = () => {
    if (role === 'student') {
      return [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'AI Chat', path: '/chat', icon: Bot, highlight: true },
        { name: 'Tickets', path: '/tickets', icon: TicketCheck },
        { name: 'Notices', path: '/notices', icon: Bell },
        { name: 'Profile', path: '/profile', icon: User },
      ];
    } else if (role === 'faculty') {
      return [
        { name: 'Workspace', path: '/', icon: LayoutDashboard },
        { name: 'AI Chat', path: '/chat', icon: Bot, highlight: true },
        { name: 'Tickets', path: '/tickets', icon: TicketCheck },
        { name: 'Notices', path: '/notices', icon: Bell },
        { name: 'Profile', path: '/profile', icon: User },
      ];
    } else {
      return [
        { name: 'Command', path: '/', icon: LayoutDashboard },
        { name: 'AI Chat', path: '/chat', icon: Bot, highlight: true },
        { name: 'Tickets', path: '/tickets', icon: TicketCheck },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Profile', path: '/profile', icon: User },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-30 
      md:hidden
      bg-white/95 backdrop-blur-md 
      border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
      pb-safe
    ">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full bg-[#0f2d52]" />
              )}

              <div className={`
                relative flex items-center justify-center rounded-xl transition-all
                ${item.highlight 
                  ? 'w-10 h-10 bg-[#0f2d52] shadow-lg shadow-blue-900/25 -mt-2 ring-4 ring-white' 
                  : 'w-7 h-7'}
              `}>
                <Icon className={`
                  transition-colors
                  ${item.highlight 
                    ? 'w-5 h-5 text-amber-300' 
                    : isActive 
                      ? 'w-5 h-5 text-[#0f2d52]' 
                      : 'w-5 h-5 text-slate-400'}
                `} />
              </div>
              
              <span className={`
                text-[10px] font-bold tracking-tight transition-colors
                ${item.highlight 
                  ? 'text-[#0f2d52]' 
                  : isActive 
                    ? 'text-[#0f2d52]' 
                    : 'text-slate-400'}
              `}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
