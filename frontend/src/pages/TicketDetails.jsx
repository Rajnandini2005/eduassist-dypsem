import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  Lock,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
  Building2,
  Check,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'student';

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);

  const fetchTicket = async () => {
    try {
      const data = await api.getTicketById(id);
      setTicket(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    const handleSync = () => fetchTicket();
    window.addEventListener('eduassist_comment_added', handleSync);
    window.addEventListener('eduassist_ticket_updated', handleSync);
    window.addEventListener('storage', handleSync);
    if (role !== 'student') {
      api.getUsers().then(users => {
        setFacultyList(users.filter(u => u.role === 'faculty' || u.role === 'admin'));
      }).catch(console.error);
    }
    return () => {
      window.removeEventListener('eduassist_comment_added', handleSync);
      window.removeEventListener('eduassist_ticket_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [id, user]);

  const handleStatusChange = async (newStatus, notes = null) => {
    setUpdating(true);
    try {
      const updated = await api.updateTicketStatus(id, newStatus, notes || resolutionNotes || undefined);
      setTicket(prev => ({
        ...prev,
        status: newStatus,
        resolution_notes: notes || resolutionNotes || prev?.resolution_notes
      }));
      setResolutionNotes('');
      setShowResolutionInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (staffId) => {
    setUpdating(true);
    try {
      const staffMember = facultyList.find(f => f.id === staffId);
      await api.assignTicket(id, staffId, staffMember?.full_name);
      setTicket(prev => ({
        ...prev,
        assigned_to: staffId,
        assigned_to_name: staffMember?.full_name || prev?.assigned_to_name
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newComment = await api.addComment(id, commentText.trim(), user);
      setTicket(prev => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment]
      }));
      setCommentText('');
    } catch (err) {
      console.error("Comment post error:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading ticket #{id}...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-xs text-rose-600 font-semibold">
        Ticket not found or unauthorized access.
      </div>
    );
  }

  // All comments are visible to student and faculty
  const allComments = Array.isArray(ticket.comments) ? ticket.comments : [];

  const getStatusBadge = (s) => {
    switch (s) {
      case 'open':
        return <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold capitalize">🟡 Open - Queued</span>;
      case 'in_progress':
        return <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold capitalize">🔵 In Progress - Under Review</span>;
      case 'resolved':
        return <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold capitalize">🟢 Resolved by Faculty</span>;
      case 'closed':
        return <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold capitalize">⚪ Closed & Archived</span>;
      default:
        return <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all tickets</span>
      </button>

      {/* Role-Specific Banner */}
      {role === 'student' ? (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold">Student Ticket Tracking View</span>
            <span className="text-blue-600">• You can view progress, department remarks, and close when satisfied.</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
            Student: {user?.full_name}
          </span>
        </div>
      ) : role === 'faculty' ? (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span className="font-bold">Faculty Department Desk • {user?.department || 'Assigned Department'}</span>
            <span className="text-amber-800">• You have authorization to post remarks, adjust status, and submit official resolutions.</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
            Faculty: {user?.full_name}
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Central University Operations • Full Administrative Oversight</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Administrator: {user?.full_name}
          </span>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                {ticket.ticket_number}
              </span>
              <span className="text-xs text-slate-500">Category: <strong className="text-slate-800">{ticket.category}</strong></span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">Department: <strong className="text-slate-800">{ticket.department_name}</strong></span>
            </div>

            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 mt-2">{ticket.title}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Submitted by <strong className="text-slate-700">{ticket.student_name}</strong> ({ticket.student_roll || ticket.student_email})</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </p>
          </div>

          {/* Role Differentiated Status & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {role === 'student' ? (
              // Student: Read-only status badge
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</label>
                <div>{getStatusBadge(ticket.status)}</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigned Staff: <strong className="text-slate-600">{ticket.assigned_to_name || 'Department Office'}</strong>
                </p>
              </div>
            ) : (
              // Faculty & Admin: Interactive controls
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Update Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => {
                      if (e.target.value === 'resolved') {
                        setShowResolutionInput(true);
                      } else {
                        handleStatusChange(e.target.value);
                      }
                    }}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold capitalize text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Assignee</label>
                    {ticket.assigned_to !== user?.id && role === 'faculty' && (
                      <button
                        onClick={() => handleAssign(user?.id)}
                        className="text-[10px] text-blue-900 font-bold hover:underline ml-2"
                      >
                        (Assign to Me)
                      </button>
                    )}
                  </div>
                  <select
                    value={ticket.assigned_to || ""}
                    onChange={(e) => handleAssign(e.target.value)}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Unassigned</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resolution Remarks Modal Box if Faculty clicks Resolved */}
        {showResolutionInput && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Provide Official Resolution Statement for the Student:
            </h4>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Hall ticket issue verified with exam cell. Condonation approved with 80% attendance. You may collect revised ticket from Room 102."
              className="w-full px-3 py-2 rounded-lg bg-white border border-emerald-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResolutionInput(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-emerald-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('resolved')}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        )}

        {/* Problem Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Issue Description</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Resolution Notes Banner */}
        {ticket.resolution_notes && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Department Resolution Note
              </h4>
              <span className="text-[10px] text-emerald-700 font-mono">Status: {ticket.status.toUpperCase()}</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">{ticket.resolution_notes}</p>

            {/* Student Action: Accept & Close or Reopen */}
            {role === 'student' && ticket.status === 'resolved' && (
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <p className="text-[11px] text-emerald-800">
                  Are you satisfied with this resolution? You can officially close this ticket:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange('in_progress', 'Student requested reopening for clarification.')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Reopening</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('closed')}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Close Ticket</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official Discussion & Faculty Responses Thread */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Responses & Discussion ({allComments.length})
            </h3>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Visible to Student & Faculty
            </span>
          </div>

          <div className="space-y-3">
            {allComments.length > 0 ? (
              allComments.map((comm, idx) => {
                const isStaff = comm.user_role === 'faculty' || comm.user_role === 'admin';
                return (
                  <div
                    key={comm.id || idx}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 shadow-sm ${
                      isStaff
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-blue-50/60 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{comm.user_name || (isStaff ? 'Faculty Member' : 'Student')}</span>
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                          isStaff ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {isStaff ? '👨‍🏫 Faculty / Staff Response' : '🎓 Student Query'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {comm.created_at ? new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{comm.message || comm.text}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400">No responses recorded on this ticket yet. Post a message below.</p>
              </div>
            )}
          </div>

          {/* Add Reply Form */}
          <form onSubmit={handlePostComment} className="pt-2 space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={role === 'student' 
                ? "Type your message or follow-up question for the faculty coordinator..." 
                : "Type your official response to the student..."}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              required
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Response</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
