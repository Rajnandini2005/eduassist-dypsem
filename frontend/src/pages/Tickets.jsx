import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TicketCheck, 
  Plus, 
  Search, 
  Clock, 
  ChevronRight,
  Filter,
  UserCheck,
  Building2,
  ListFilter,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';

const FALLBACK_DEPTS = [
  { id: 'dept-placement-001', code: 'PLACE', name: 'Placement Department (Placement Dept)' },
  { id: 'dept-scholarship-001', code: 'SCHOL', name: 'Scholarship Department (Scholarship Dept)' },
  { id: 'dept-academic-001', code: 'ACAD', name: 'Academic Department (Academic Dept)' },
  { id: 'dept-fee-001', code: 'FEE', name: 'Fee Department (Accounts & Fee Dept)' },
  { id: 'dept-library-001', code: 'LIB', name: 'Library Department (Library Dept)' },
  { id: '11111111-1111-1111-1111-111111111111', code: 'CSE', name: 'Computer Science & Engineering' },
  { id: '22222222-2222-2222-2222-222222222222', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
  { id: '33333333-3333-3333-3333-333333333333', code: 'DS', name: 'Data Science' },
  { id: '44444444-4444-4444-4444-444444444444', code: 'BCA', name: 'Bachelor of Computer Applications' },
  { id: '55555555-5555-5555-5555-555555555555', code: 'MCA', name: 'Master of Computer Applications' },
  { id: '77777777-7777-7777-7777-777777777777', code: 'EXAM', name: 'Examination Cell' },
];

export default function Tickets() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [facultyTab, setFacultyTab] = useState('my_department'); // 'my_department', 'assigned_to_me', 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    // Load local tickets first
    const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
    try {
      const [ticketsData, deptsData] = await Promise.all([
        api.getTickets({
          status: statusFilter,
          category: categoryFilter,
          department_id: deptFilter || undefined
        }),
        api.getDepartments()
      ]);
      // Merge: real tickets + any local-only tickets not synced
      const realIds = new Set(ticketsData.map(t => t.id));
      const unsynced = localTickets.filter(t => !realIds.has(t.id));
      setTickets([...unsynced, ...ticketsData]);
      setDepartments(deptsData && deptsData.length > 0 ? deptsData : FALLBACK_DEPTS);
    } catch (err) {
      console.error('Tickets fetch error:', err);
      // Show local tickets when backend unavailable
      setTickets(localTickets);
      setDepartments(FALLBACK_DEPTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const handleCreated = () => fetchTickets();
    window.addEventListener('eduassist_ticket_created', handleCreated);
    window.addEventListener('storage', handleCreated);
    return () => {
      window.removeEventListener('eduassist_ticket_created', handleCreated);
      window.removeEventListener('storage', handleCreated);
    };
  }, [statusFilter, categoryFilter, deptFilter, user]);

  // Apply Role Filtering
  const myEmail = (user?.email || '').toLowerCase().trim();
  const myName = (user?.full_name || '').toLowerCase().trim();
  const myId = user?.id;

  const roleFilteredTickets = tickets.filter(t => {
    if (role === 'student') {
      const tEmail = (t.student_email || '').toLowerCase().trim();
      const tName = (t.student_name || '').toLowerCase().trim();
      const tCreated = t.created_by;
      const tStudentId = t.student_id;
      return (
        (myEmail && tEmail === myEmail) ||
        (myId && (tCreated === myId || tStudentId === myId)) ||
        (myName && tName === myName) ||
        (myName && tName.includes(myName)) ||
        (myName && myName.includes(tName))
      );
    }
    if (role === 'faculty') {
      const userDept = user?.department_id || user?.department || '';
      const ticketDept = (t.department_id || '') + ' ' + (t.department_name || '');
      if (facultyTab === 'assigned_to_me') {
        return t.assigned_to === user?.id;
      }
      if (facultyTab === 'my_department') {
        // Specific department only
        if (!userDept) return true;
        return t.department_id === userDept ||
               ticketDept.toLowerCase().includes(userDept.toLowerCase()) ||
               userDept.toLowerCase().includes((t.department_name || '').toLowerCase());
      }
      return true; // all campus tickets
    }
    return true; // admin sees all
  });

  const finalFilteredTickets = roleFilteredTickets.filter(t => {
    if (!t.ticket_number || !t.title) return false; // skip malformed
    const q = search.toLowerCase();
    return (
      (t.ticket_number || '').toLowerCase().includes(q) ||
      (t.title || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.student_name && t.student_name.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (s) => {
    switch (s) {
      case 'open': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TicketCheck className="w-5 h-5 text-blue-700" />
            {role === 'student' 
              ? 'My Support Tickets & Requests'
              : role === 'faculty'
              ? 'Faculty Ticket Resolution Desk'
              : 'Central University Ticket Operations'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'student' 
              ? `Logged in as ${user?.full_name} • Track responses, department remarks, and resolution notes`
              : role === 'faculty'
              ? 'Review assigned department tickets, submit official remarks, or resolve issues'
              : 'University-wide ticketing console with departmental routing and coordinator assignments'}
          </p>
        </div>

        {/* Student or Admin can create tickets */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{role === 'student' ? '+ Raise Support Ticket' : '+ Create Ticket'}</span>
        </button>
      </div>

      {/* Faculty Work Tabs */}
      {role === 'faculty' && (
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setFacultyTab('my_department')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'my_department'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Department Tickets ({tickets.filter(t => {
              const uDept = user?.department_id || user?.department || '';
              return !uDept || t.department_id === uDept || (t.department_name && t.department_name.toLowerCase().includes(uDept.toLowerCase()));
            }).length})
          </button>
          <button
            onClick={() => setFacultyTab('assigned_to_me')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'assigned_to_me'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assigned to Me ({tickets.filter(t => t.assigned_to === user?.id).length})
          </button>
          <button
            onClick={() => setFacultyTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'all'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All College Tickets ({tickets.length})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID, title, student name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>
            <option value="Placement">Placement</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Academics">Academics</option>
            <option value="Fees">Fees & Accounts</option>
            <option value="Library">Library</option>
            <option value="Examinations">Examinations</option>
            <option value="Certificates">Certificates</option>
          </select>

          {(role === 'admin' || role === 'faculty') && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : finalFilteredTickets.length > 0 ? (
          finalFilteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="p-4 md:p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                    {ticket.ticket_number}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    🏛️ {ticket.department_name || 'General Helpdesk'}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 hover:text-blue-900 transition-colors">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-1">
                  <span className="font-semibold text-slate-700">{ticket.department_name}</span>
                  <span>•</span>
                  <span>Category: {ticket.category}</span>
                  <span>•</span>
                  <span>Student: <strong className="text-slate-700">{ticket.student_name}</strong></span>
                  {ticket.assigned_to_name && (
                    <>
                      <span>•</span>
                      <span className="text-blue-800 font-medium">Assigned: {ticket.assigned_to_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-blue-900 flex-shrink-0 self-end md:self-center">
                <span className="text-blue-900 font-bold hidden md:inline">
                  {role === 'student' ? 'View Status →' : 'Resolve Ticket →'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <p>No tickets match the selected criteria.</p>
            {role === 'student' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                + Raise a new ticket
              </button>
            )}
          </div>
        )}
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => fetchTickets()}
      />

    </div>
  );
}
