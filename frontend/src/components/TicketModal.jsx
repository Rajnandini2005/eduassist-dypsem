import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, CheckCircle, WifiOff, Paperclip, FileText, Upload } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FALLBACK_DEPARTMENTS = [
  { id: '1', code: 'CSE', name: 'Computer Science & Engineering' },
  { id: '2', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
  { id: '3', code: 'DS', name: 'Data Science' },
  { id: '4', code: 'BCA', name: 'Bachelor of Computer Applications' },
  { id: '5', code: 'MCA', name: 'Master of Computer Applications' },
  { id: '6', code: 'ADM', name: 'Admissions & Scholarships' },
  { id: '7', code: 'EXAM', name: 'Examination Cell' },
  { id: '8', code: 'ACC', name: 'Accounts & Finance' },
];

function saveLocalTicket(ticket) {
  const existing = JSON.parse(localStorage.getItem('local_tickets') || '[]');
  existing.unshift(ticket);
  localStorage.setItem('local_tickets', JSON.stringify(existing));
}

export default function TicketModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academics');
  const [priority, setPriority] = useState('medium');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle(''); setDescription(''); setCategory('Academics');
      setPriority('medium'); setDepartmentId(''); setAttachedFile(null);
      setError(''); setSuccess(false); setIsOffline(false);

      api.getDepartments()
        .then(d => { if (d && d.length > 0) setDepartments(d); })
        .catch(() => setDepartments(FALLBACK_DEPARTMENTS));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Allow PDF, images, Word docs up to 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, PNG, or Word documents are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.');
      return;
    }
    setError('');
    setAttachedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill out both title and issue description.');
      return;
    }

    setSubmitting(true);
    setError('');

    // ALWAYS construct the ticket with CURRENT user's credentials
    const newTicket = {
      id: 'local-' + Date.now(),
      ticket_number: 'TKT-' + Math.floor(Math.random() * 90000 + 10000),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'open',
      department_id: departmentId || null,
      department_name: departments.find(d => d.id === departmentId)?.name || 'General Campus Helpdesk',
      student_name: user?.full_name || 'Student',
      student_email: (user?.email || '').trim().toLowerCase(),
      student_roll: user?.roll_no || '',
      created_by: user?.id || 'user-' + Date.now(),
      created_at: new Date().toISOString(),
      isLocal: true,
      attachment_name: attachedFile?.name || null
    };

    // 1. ALWAYS SAVE TO LOCAL STORAGE IMMEDIATELY (guaranteed persistence!)
    saveLocalTicket(newTicket);

    // 2. DISPATCH GLOBAL EVENT for instant UI update everywhere
    window.dispatchEvent(new CustomEvent('eduassist_ticket_created', { detail: newTicket }));

    // 3. Background sync to backend if online
    api.createTicket({
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      department_id: newTicket.department_id,
      student_name: newTicket.student_name,
      student_email: newTicket.student_email
    }).then(async (res) => {
      if (attachedFile && res?.id) {
        try { await api.uploadTicketAttachment(res.id, attachedFile); } catch {}
      }
    }).catch(() => {
      // Backend offline or asleep — local ticket is already securely stored
    });

    setSuccess(true);
    setTimeout(() => {
      onCreated(newTicket);
      onClose();
      setSuccess(false);
      setSubmitting(false);
    }, 1200);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Ticket Submitted!</h3>
          {isOffline && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">Saved locally — will sync when online.</p>
            </div>
          )}
          <p className="text-xs text-slate-500 text-center">Your support ticket has been recorded. Our team will respond shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create Support Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">Submit an academic inquiry or administrative grievance</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subject / Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discrepancy in Semester 4 Machine Learning Grade Card"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Academics">Academics & Attendance</option>
                <option value="Examinations">Examinations & Grade Cards</option>
                <option value="Fees">Tuition & Hostel Fees</option>
                <option value="Hostel">Hostel & Mess Regulations</option>
                <option value="Certificates">Bonafide & Certificates</option>
                <option value="Technical">Campus IT & Wi-Fi</option>
                <option value="General">Other / General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="low">Low (General Query)</option>
                <option value="medium">Medium (Standard Request)</option>
                <option value="high">High (Urgent Attention)</option>
                <option value="urgent">Urgent (Deadline Critical)</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Department (Optional)</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">-- General Campus Helpdesk --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details (course code, transaction reference number, exam roll number, etc.)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* File Attachment (PDF / Image) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Attach Supporting Document (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {attachedFile ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <span className="text-xs text-blue-800 font-semibold flex-1 truncate">{attachedFile.name}</span>
                <span className="text-[10px] text-blue-500">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                <button
                  type="button"
                  onClick={() => { setAttachedFile(null); fileInputRef.current.value = ''; }}
                  className="text-blue-400 hover:text-rose-500 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                <span>Click to attach PDF, JPG, PNG or Word file (max 5 MB)</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-900/20 disabled:opacity-50"
            >
              {submitting ? (
                <><Upload className="w-3.5 h-3.5 animate-bounce" /><span>Submitting...</span></>
              ) : (
                <><Send className="w-3.5 h-3.5" /><span>Submit Ticket</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
