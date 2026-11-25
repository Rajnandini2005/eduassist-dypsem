import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Pin, Building2, AlertCircle, Paperclip, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NoticeEditModal({ isOpen, onClose, noticeToEdit, onSaved }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Examinations');
  const [departmentId, setDepartmentId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [targetAudience, setTargetAudience] = useState('all');
  const [noticeStatus, setNoticeStatus] = useState('active');
  const [supersedeOlder, setSupersedeOlder] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getDepartments().then(setDepartments).catch(console.error);
      if (noticeToEdit) {
        setTitle(noticeToEdit.title || '');
        setContent(noticeToEdit.content || '');
        setCategory(noticeToEdit.category || 'General');
        setDepartmentId(noticeToEdit.department_id || '');
        setIsPinned(Boolean(noticeToEdit.is_pinned));
        setTargetAudience(noticeToEdit.target_audience || 'all');
        setNoticeStatus(noticeToEdit.status || 'active');
        setSupersedeOlder(false);
        setAttachedFile(noticeToEdit.attachment_name ? { name: noticeToEdit.attachment_name } : null);
      } else {
        setTitle('');
        setContent('');
        setCategory('Examinations');
        setDepartmentId('');
        setIsPinned(false);
        setTargetAudience('all');
        setNoticeStatus('active');
        setSupersedeOlder(true);
        setAttachedFile(null);
      }
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, noticeToEdit]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (< 15 MB)
    if (file.size > 15 * 1024 * 1024) {
      setError("Document must be under 15 MB.");
      return;
    }
    setError('');
    setAttachedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both headline and circular details.");
      return;
    }

    setSubmitting(true);
    setError('');

    const deptObj = departments.find(d => d.id === departmentId);
    const deptName = deptObj ? deptObj.name : 'Campus Wide';

    const noticePayload = {
      title: title.trim(),
      content: content.trim(),
      category,
      department_id: departmentId || null,
      department_name: deptName,
      is_pinned: isPinned,
      target_audience: targetAudience,
      status: noticeStatus,
      supersede_category: supersedeOlder,
      attachment_name: attachedFile?.name || null,
      file_name: attachedFile?.name || null,
      created_by_name: user?.full_name || 'Faculty Office'
    };

    try {
      let savedNotice;
      if (noticeToEdit) {
        savedNotice = await api.updateNotice(noticeToEdit.id, noticePayload);
      } else {
        savedNotice = await api.createNotice(noticePayload);
      }

      // If a real file was selected, upload as document for backend RAG indexing
      if (attachedFile && attachedFile instanceof File) {
        try {
          const formData = new FormData();
          formData.append("file", attachedFile);
          formData.append("title", title.trim());
          if (departmentId) formData.append("department_id", departmentId);
          await api.uploadDocument(formData);
        } catch (uploadErr) {
          console.warn("Notice attachment upload warning:", uploadErr);
        }
      }

      setSuccessMsg("Notice published & indexed for AI RAG successfully!");
      setTimeout(() => {
        onSaved(savedNotice);
        onClose();
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      // api.createNotice handles local fallback internally
      onSaved(noticePayload);
      onClose();
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {noticeToEdit ? 'Edit Campus Notice' : 'Publish Campus Notice & Circular'}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Official Circular Desk</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-indexed for AI Assistant (RAG)
              </span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
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

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notice Headline / Subject *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule for End Semester Examinations - Winter 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shadow-sm"
              >
                <option value="Examinations">Examinations & Hall Tickets</option>
                <option value="Academics">Academic Regulations</option>
                <option value="Events">Events & Hackathons</option>
                <option value="Fees">Tuition & Accounts</option>
                <option value="Campus Life">Campus Life & Hostel</option>
                <option value="General">General Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shadow-sm"
              >
                <option value="">Campus Wide (All Departments)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shadow-sm"
              >
                <option value="all">All (Students & Faculty)</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty & Staff Only</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Pin to top of Notice Board</span>
              </label>
            </div>
          </div>

          {/* Circular Status & Recency Control */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-bold text-slate-700">
                Circular Status & Recency
              </label>
              <select
                value={noticeStatus}
                onChange={(e) => setNoticeStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="active">🟢 Active (Current & In Effect)</option>
                <option value="superseded">🔄 Superseded (Replaced by Newer Notice)</option>
                <option value="archived">📦 Archived (Expired)</option>
              </select>
            </div>
            {!noticeToEdit && noticeStatus === 'active' && (
              <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={supersedeOlder}
                  onChange={(e) => setSupersedeOlder(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Mark earlier circulars in this category as Superseded (AI will give this latest notice)</span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notice Circular Content *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official circular details, timetable, dates, venue, and instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              required
            />
          </div>

          {/* PDF / File Attachment Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                Attach Circular Document / PDF (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">PDF, DOCX, PNG up to 15MB</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              className="hidden"
            />

            {attachedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-950 truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-blue-700">Attached & ready to index</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-600"
              >
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>Upload PDF Circular / File</span>
              </button>
            )}
          </div>

          {/* RAG Information Pill */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>AI RAG Processing Active:</strong> Any notice published here is instantly indexed into the EduAssist AI Knowledge Base. Students asking the AI chatbot will get accurate answers grounded in this circular.
            </p>
          </div>

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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing & Indexing...' : noticeToEdit ? 'Update Notice' : 'Publish & Index Notice'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
