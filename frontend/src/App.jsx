import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PWAInstallBanner from './components/PWAInstallBanner';
import { wakeUpBackend } from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import Documents from './pages/Documents';
import Departments from './pages/Departments';
import Notices from './pages/Notices';
import Analytics from './pages/Analytics';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Wake up backend on app start (Render free tier cold start)
wakeUpBackend().then(ok => {
  if (ok) console.log('✅ EduAssist Backend is online');
  else console.warn('⚠️ Backend warming up — using local fallback data');
});

function MainLayout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f] flex items-center justify-center shadow-xl">
            <svg className="w-9 h-9 text-amber-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 text-sm">EduAssist</p>
            <p className="text-xs text-slate-500">Loading DYPSEM Portal...</p>
          </div>
          <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar (desktop always visible, mobile toggle) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page content — extra bottom padding on mobile to avoid bottom nav overlap */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<ChatBot />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav (hidden on md+) */}
      <BottomNav />

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
