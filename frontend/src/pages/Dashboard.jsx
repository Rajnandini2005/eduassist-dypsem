import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, PlusCircle, TicketCheck, Bell, Building2, FileText,
  HelpCircle, User, ArrowRight, Pin, CheckCircle2, Clock,
  AlertCircle, Users, BarChart3, Sparkles, ShieldCheck,
  UserCheck, GraduationCap, Briefcase, ClipboardList, BookOpen,
  Activity, Award, TrendingUp, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import TicketModal from '../components/TicketModal';
import NoticeEditModal from '../components/NoticeEditModal';
import FaqModal from '../components/FaqModal';
import StatCard from '../components/StatCard';
import { getAvatarUrl } from '../utils/avatar';

// ─── Shared helpers ──────────────────────────────────────────
const getPriorityColor = (p) => {
  switch (p) {
    case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'high':   return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200';
    default:       return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};
const getStatusColor = (s) => {
  switch (s) {
    case 'open':        return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'resolved':    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    default:            return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// ─── Quick Action Grid Item ───────────────────────────────────
function QuickAction({ icon: Icon, label, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Ticket Row ───────────────────────────────────────────────
function TicketRow({ ticket, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
    >
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-100">
            {ticket.ticket_number}
          </span>
          <span className="text-xs font-bold text-slate-800 truncate">{ticket.title}</span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">{ticket.department_name} · {ticket.category}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(ticket.status)}`}>
          {ticket.status.replace('_', ' ')}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════
function StudentDashboard({ user, tickets, notices, loading, navigate, setIsTicketModalOpen }) {
  // Only show THIS user's tickets — never show demo tickets from other students
  const myTickets = tickets.filter(t => 
    t.created_by === user?.id || 
    t.student_email === user?.email ||
    (t.isLocal && (t.created_by === user?.id || t.student_email === user?.email))
  );
  const openCount = myTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const avatarUrl = getAvatarUrl(user);
  const [avatarErr, setAvatarErr] = useState(false);

  const quickActions = [
    { icon: PlusCircle,  label: 'Create Ticket',  color: 'text-blue-700',    bg: 'bg-blue-50',    action: () => setIsTicketModalOpen(true) },
    { icon: TicketCheck, label: 'My Tickets',      color: 'text-purple-700',  bg: 'bg-purple-50',  action: () => navigate('/tickets') },
    { icon: Bell,        label: 'Notices',         color: 'text-amber-700',   bg: 'bg-amber-50',   action: () => navigate('/notices') },
    { icon: HelpCircle,  label: 'FAQs',            color: 'text-green-700',   bg: 'bg-green-50',   action: () => navigate('/departments') },
    { icon: Building2,   label: 'Departments',     color: 'text-indigo-700',  bg: 'bg-indigo-50',  action: () => navigate('/departments') },
    { icon: FileText,    label: 'Handbooks',       color: 'text-rose-700',    bg: 'bg-rose-50',    action: () => navigate('/documents') },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2d52] via-[#1e3a5f] to-[#1e4080] text-white p-5 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-blue-200 text-xs font-medium">DYPSEM Student Portal</p>
              <h2 className="text-xl font-black text-white mt-0.5">Hello, {user?.full_name?.split(' ')[0]} 🎓</h2>
              <p className="text-blue-200 text-xs mt-1">B.Tech · D. Y. Patil School of Engg. & Mgmt.</p>
            </div>
            {/* Gender-based avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
              {!avatarErr ? (
                <img
                  src={avatarUrl}
                  alt={user?.full_name}
                  onError={() => setAvatarErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center font-black text-lg text-amber-300">
                  {user?.full_name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
          </div>

          {/* AI Help banner */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Need Help?</p>
                <p className="text-[10px] text-blue-200">Ask our AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-900 text-xs font-black transition-all flex items-center gap-1.5"
            >
              Chat Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Tickets', value: openCount, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Total Tickets', value: myTickets.length, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Notices', value: notices.length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-3 text-center`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-black text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ icon, label, color, bg, action }) => (
            <QuickAction key={label} icon={icon} label={label} color={color} bg={bg} onClick={action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Recent Activity</h3>
          <button onClick={() => navigate('/tickets')} className="text-xs text-[#0f2d52] font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {myTickets.length > 0 ? (
            myTickets.slice(0, 4).map(t => (
              <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} />
            ))
          ) : (
            <div className="p-8 text-center">
              <TicketCheck className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No tickets yet</p>
              <button onClick={() => setIsTicketModalOpen(true)} className="text-xs text-[#0f2d52] font-bold hover:underline mt-1">
                + Create your first ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Notices */}
      {notices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Campus Notices
            </h3>
            <button onClick={() => navigate('/notices')} className="text-xs text-[#0f2d52] font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {notices.slice(0, 3).map(n => (
              <div key={n.id} className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800 leading-snug flex-1">{n.title}</p>
                  {n.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FACULTY DASHBOARD
// ═══════════════════════════════════════════════════════════════
function FacultyDashboard({ user, tickets, notices, analytics, navigate, setIsNoticeModalOpen, setIsFaqModalOpen }) {
  const assigned = tickets.filter(t => t.assigned_to === user?.id || t.assigned_to_name?.includes('Priya'));

  const quickActions = [
    { icon: ClipboardList, label: 'Assigned Queue',    color: 'text-amber-700',  bg: 'bg-amber-50',  action: () => navigate('/tickets') },
    { icon: Bot,           label: 'AI Assistant',      color: 'text-blue-700',   bg: 'bg-blue-50',   action: () => navigate('/chat') },
    { icon: Bell,          label: 'Post Notice',       color: 'text-green-700',  bg: 'bg-green-50',  action: () => setIsNoticeModalOpen(true) },
    { icon: HelpCircle,    label: 'Add FAQ',           color: 'text-purple-700', bg: 'bg-purple-50', action: () => setIsFaqModalOpen(true) },
    { icon: BookOpen,      label: 'Handbooks',         color: 'text-indigo-700', bg: 'bg-indigo-50', action: () => navigate('/documents') },
    { icon: BarChart3,     label: 'Analytics',         color: 'text-rose-700',   bg: 'bg-rose-50',   action: () => navigate('/analytics') },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-5 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-blue-200 text-xs font-medium flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Faculty Workspace</p>
            <h2 className="text-xl font-black text-white mt-0.5">Hello, {user?.full_name?.split(' ')[0]} 👨‍🏫</h2>
            <p className="text-blue-200 text-xs mt-1">DYPSEM · Department Coordinator</p>
          </div>
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-lg flex-shrink-0">
            <img
              src={getAvatarUrl(user)}
              alt={user?.full_name}
              onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              className="w-full h-full object-cover"
            />
            <div className="w-full h-full bg-amber-500/20 items-center justify-center font-black text-lg text-amber-300 hidden">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-bold">
            {assigned.length} Assigned
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-[10px] font-bold">
            {analytics?.total_documents || 0} Documents
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-black text-slate-800 mb-3">Faculty Tools</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ icon, label, color, bg, action }) => (
            <QuickAction key={label} icon={icon} label={label} color={color} bg={bg} onClick={action} />
          ))}
        </div>
      </div>

      {/* Assigned tickets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Assigned to Me ({assigned.length})</h3>
          <button onClick={() => navigate('/tickets')} className="text-xs text-[#0f2d52] font-bold hover:underline flex items-center gap-1">
            Full Queue <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {assigned.length > 0 ? assigned.slice(0, 4).map(t => (
            <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} />
          )) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No tickets assigned. All clear!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
function AdminDashboard({ user, tickets, notices, analytics, navigate, setIsTicketModalOpen, setIsNoticeModalOpen, setIsFaqModalOpen }) {

  const quickActions = [
    { icon: TicketCheck,  label: 'All Tickets',    color: 'text-blue-700',   bg: 'bg-blue-50',   action: () => navigate('/tickets') },
    { icon: Bot,          label: 'AI Console',     color: 'text-purple-700', bg: 'bg-purple-50', action: () => navigate('/chat') },
    { icon: Bell,         label: 'Post Notice',    color: 'text-amber-700',  bg: 'bg-amber-50',  action: () => setIsNoticeModalOpen(true) },
    { icon: Users,        label: 'User Directory', color: 'text-indigo-700', bg: 'bg-indigo-50', action: () => navigate('/admin/users') },
    { icon: BarChart3,    label: 'Analytics',      color: 'text-green-700',  bg: 'bg-green-50',  action: () => navigate('/analytics') },
    { icon: FileText,     label: 'Knowledge Base', color: 'text-rose-700',   bg: 'bg-rose-50',   action: () => navigate('/documents') },
  ];

  const stats = [
    { label: 'Open Tickets',  value: analytics?.open_tickets ?? '—',    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Total Queries', value: analytics?.total_queries ?? '—',   color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-100'  },
    { label: 'AI Accuracy',   value: `${analytics?.satisfaction_rate ?? 95}%`, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-5">
      {/* Admin hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2d52] via-[#1e3a5f] to-indigo-900 text-white p-5 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-blue-200 text-xs font-medium flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Admin Console</p>
            <h2 className="text-xl font-black text-white mt-0.5">Executive Command 🏛️</h2>
            <p className="text-blue-200 text-xs mt-1">DYPSEM Central Administrator</p>
          </div>
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
            <img
              src={getAvatarUrl(user)}
              alt={user?.full_name}
              onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              className="w-full h-full object-cover"
            />
            <div className="w-full h-full bg-white/10 items-center justify-center font-black text-lg text-amber-300 hidden">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button onClick={() => navigate('/admin/users')} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5">
            <Users className="w-3 h-3" /> User Directory
          </button>
          <button onClick={() => setIsNoticeModalOpen(true)} className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-900 text-[11px] font-bold transition-colors flex items-center gap-1.5">
            <Bell className="w-3 h-3" /> Post Notice
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-3 text-center`}>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-black text-slate-800 mb-3">Admin Operations</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ icon, label, color, bg, action }) => (
            <QuickAction key={label} icon={icon} label={label} color={color} bg={bg} onClick={action} />
          ))}
        </div>
      </div>

      {/* All tickets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800">Recent Campus Tickets</h3>
          <button onClick={() => navigate('/tickets')} className="text-xs text-[#0f2d52] font-bold hover:underline flex items-center gap-1">
            Full Queue <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {tickets.length > 0 ? tickets.slice(0, 4).map(t => (
            <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} />
          )) : (
            <div className="p-8 text-center">
              <TicketCheck className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No tickets yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge gaps */}
      <div>
        <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" /> AI Knowledge Gaps
        </h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <p className="text-xs text-slate-500">Questions where AI confidence was low — convert to FAQs:</p>
          {[
            'Can I get a duplicate hall ticket on exam day?',
            'What are the hostel late entry fines?',
          ].map((q, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-[11px] font-bold text-rose-900 flex-1">"{q}"</p>
              <button
                onClick={() => setIsFaqModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-bold flex-shrink-0"
              >
                + FAQ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const navigate = useNavigate();

  const [analytics, setAnalytics]           = useState(null);
  const [tickets, setTickets]               = useState([]);
  const [notices, setNotices]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen]   = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen]   = useState(false);
  const [isFaqModalOpen,    setIsFaqModalOpen]       = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, noticesData] = await Promise.allSettled([
          api.getTickets(),
          api.getNotices(),
        ]);
        setTickets(ticketsData.status === 'fulfilled' ? ticketsData.value : []);
        setNotices(noticesData.status === 'fulfilled' ? noticesData.value.slice(0, 5) : []);
        // Analytics is optional — try separately
        api.getAnalytics().then(d => { if (d) setAnalytics(d); }).catch(() => {});
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-3 border-[#0f2d52] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const sharedProps = { user, tickets, notices, analytics, navigate };

  return (
    <>
      {role === 'student' && (
        <StudentDashboard {...sharedProps} setIsTicketModalOpen={setIsTicketModalOpen} />
      )}
      {role === 'faculty' && (
        <FacultyDashboard {...sharedProps} setIsNoticeModalOpen={setIsNoticeModalOpen} setIsFaqModalOpen={setIsFaqModalOpen} />
      )}
      {role === 'admin' && (
        <AdminDashboard {...sharedProps} setIsTicketModalOpen={setIsTicketModalOpen} setIsNoticeModalOpen={setIsNoticeModalOpen} setIsFaqModalOpen={setIsFaqModalOpen} />
      )}

      <TicketModal   isOpen={isTicketModalOpen}  onClose={() => setIsTicketModalOpen(false)}  onCreated={() => api.getTickets().then(setTickets)} />
      <NoticeEditModal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} onSaved={() => api.getNotices().then(setNotices)} />
      <FaqModal      isOpen={isFaqModalOpen}     onClose={() => setIsFaqModalOpen(false)}     onSaved={() => {}} />
    </>
  );
}
