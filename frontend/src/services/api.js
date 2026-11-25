// Backend URL — permanently hardcoded
// Render free tier wakes up in 30-60 seconds after inactivity
export const BACKEND_URL = "https://eduassist-dypsem-backend.onrender.com";
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("helpdesk_token") || localStorage.getItem("eduassist_session");
  let userEmail = '';
  let userId = '';
  let userName = '';
  let userRole = '';
  try {
    const session = localStorage.getItem("eduassist_session");
    if (session && session.startsWith("local_")) {
      const p = JSON.parse(atob(session.slice(6)));
      userEmail = p.email || '';
      userId = p.id || '';
      userRole = p.role || '';
    }
    const demo = localStorage.getItem("demo_user");
    if (demo) {
      const du = JSON.parse(demo);
      userEmail = du.email || userEmail;
      userId = du.id || userId;
      userName = du.full_name || userName;
      userRole = du.role || userRole;
    }
  } catch {}

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userEmail ? { "X-User-Email": userEmail } : {}),
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(userName ? { "X-User-Name": userName } : {}),
    ...(userRole ? { "X-User-Role": userRole } : {}),
  };
};

// Ping backend silently — wakes up Render free tier
export async function wakeUpBackend() {
  try {
    await fetch(`${BACKEND_URL}/health`, { method: "GET", signal: AbortSignal.timeout(60000) });
    return true;
  } catch {
    return false;
  }
}

// Smart fetch with 60s timeout for Render cold start
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
    return res;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('BACKEND_SLOW');
    }
    throw new Error('BACKEND_UNAVAILABLE');
  }
}

// ── FALLBACK DATA ──────────────────────────────────────────────
const DEMO_TICKETS = [
  {
    id: 'demo-1',
    ticket_number: 'TKT-10021',
    title: 'Grade card discrepancy in Semester 4',
    description: 'My ML subject shows F but I passed the exam. Please check.',
    category: 'Examinations',
    priority: 'high',
    status: 'open',
    department_name: 'Computer Science & Engineering',
    department_id: '1',
    student_name: 'Rajnandini Patil',
    student_email: 'rajnandini@dypsem.edu.in',
    created_by: 'demo-user',
    assigned_to_name: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-2',
    ticket_number: 'TKT-10022',
    title: 'Bonafide certificate required urgently',
    description: 'Need bonafide for bank account opening. Deadline tomorrow.',
    category: 'Certificates',
    priority: 'urgent',
    status: 'in_progress',
    department_name: 'Admissions & Scholarships',
    department_id: '6',
    student_name: 'Rahul Sharma',
    student_email: 'rahul@dypsem.edu.in',
    created_by: 'demo-user-2',
    assigned_to_name: 'Prof. Suresh Kulkarni',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-3',
    ticket_number: 'TKT-10020',
    title: 'Campus Wi-Fi not connecting in Lab 302',
    description: 'Wi-Fi drops every 10 minutes in computer lab 302.',
    category: 'Technical',
    priority: 'medium',
    status: 'resolved',
    department_name: 'Computer Science & Engineering',
    department_id: '1',
    student_name: 'Priya Desai',
    student_email: 'priya@dypsem.edu.in',
    created_by: 'demo-user-3',
    assigned_to_name: 'IT Department',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    isDemo: true
  }
];

const DEMO_NOTICES = [
  {
    id: 'notice-1',
    title: 'End Semester Examination Schedule — Dec 2025',
    body: 'End semester examinations for all departments will commence from December 15, 2025. Students are advised to check the detailed timetable on the notice board and report 30 minutes before each exam.',
    category: 'Examination',
    pinned: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author_name: 'Examination Controller'
  },
  {
    id: 'notice-2',
    title: 'Last Date for Fee Payment — Semester 5',
    body: 'Students of Semester 5 are informed that the last date for tuition fee payment is November 30, 2025. Late payment will attract a fine of Rs. 100/- per day.',
    category: 'Finance',
    pinned: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author_name: 'Accounts Department'
  },
  {
    id: 'notice-3',
    title: 'Campus Placement Drive — TCS & Infosys',
    body: 'TCS and Infosys campus recruitment drive scheduled for Dec 10-11, 2025. All eligible B.Tech final year students (CSE, AIML, DS) with CGPA ≥ 6.0 must register by December 5.',
    category: 'Placement',
    pinned: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    author_name: 'Training & Placement Cell'
  },
  {
    id: 'notice-4',
    title: 'Minimum 75% Attendance Mandatory',
    body: 'As per university norms, minimum 75% attendance is mandatory for all subjects. Students falling below 75% will not be allowed to appear in end semester examinations. Contact your HOD immediately.',
    category: 'Academic',
    pinned: false,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    author_name: 'Dean Academics'
  }
];

export const api = {
  // ── Auth ──────────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
    return res.json();
  },

  register: async (userData) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
    return res.json();
  },

  switchRole: async (role) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/demo-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error("Role switch failed");
    return res.json();
  },

  getMe: async () => {
    const res = await apiFetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Session expired");
    return res.json();
  },

  getUsers: async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/users`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  updateUser: async (userId, data) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ── Chat ──────────────────────────────────────────────────────
  askChat: async (query, departmentId = null) => {
    const res = await apiFetch(`${API_BASE_URL}/chat/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, department_id: departmentId })
    });
    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },

  sendFeedback: async (queryId, feedback, comment = null) => {
    const res = await apiFetch(`${API_BASE_URL}/chat/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query_id: queryId, feedback, comment })
    });
    return res.json();
  },

  getChatHistory: async () => {
    const res = await apiFetch(`${API_BASE_URL}/chat/history`, { headers: getAuthHeaders() });
    return res.json();
  },

  // ── Documents ─────────────────────────────────────────────────
  getDocuments: async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/documents`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  uploadDocument: async (formData) => {
    const token = localStorage.getItem("helpdesk_token");
    const res = await apiFetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  deleteDocument: async (docId) => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // ── Tickets ───────────────────────────────────────────────────
  getTickets: async (filters = {}) => {
    // Always load local tickets first (these are the user's real tickets)
    const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);
      if (filters.department_id) params.append("department_id", filters.department_id);
      const res = await apiFetch(`${API_BASE_URL}/tickets?${params.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        // Backend error — return only local tickets (never Aarav's demo tickets)
        return localTickets;
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Merge: real tickets + any local-only tickets not synced
        const realIds = new Set(data.map(t => t.id));
        const unsynced = localTickets.filter(t => !realIds.has(t.id));
        return [...unsynced, ...data];
      }
      // Backend returned empty — return only local tickets (not demo data)
      return localTickets;
    } catch {
      // Backend unavailable — return only local tickets
      return localTickets;
    }
  },

  getTicketById: async (ticketId) => {
    // Check local tickets first
    const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
    const local = localTickets.find(t => t.id === ticketId);
    if (local) {
      return {
        ...local,
        comments: Array.isArray(local.comments) ? local.comments : []
      };
    }

    // Check demo tickets
    const demo = DEMO_TICKETS.find(t => t.id === ticketId);
    if (demo) return { ...demo, comments: demo.comments || [] };

    try {
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      return res.json();
    } catch (err) {
      // Check again if local ticket was created with a matching number
      const fallback = localTickets.find(t => t.ticket_number === ticketId);
      if (fallback) return { ...fallback, comments: fallback.comments || [] };
      throw err;
    }
  },

  createTicket: async (ticketData) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(ticketData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to create ticket");
    return res.json();
  },

  updateTicket: async (ticketId, updateData) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  updateTicketStatus: async (ticketId, status, resolutionNotes = null) => {
    // Update local_tickets immediately
    try {
      const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
      const idx = localTickets.findIndex(t => t.id === ticketId);
      if (idx >= 0) {
        localTickets[idx].status = status;
        if (resolutionNotes) {
          localTickets[idx].resolution_notes = resolutionNotes;
        }
        if (status === 'resolved' || status === 'closed') {
          localTickets[idx].resolved_at = new Date().toISOString();
        }
        localStorage.setItem('local_tickets', JSON.stringify(localTickets));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('eduassist_ticket_updated', {
      detail: { id: ticketId, status, resolution_notes: resolutionNotes }
    }));

    try {
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, resolution_notes: resolutionNotes })
      });
      if (res.ok) return res.json();
    } catch {}

    return { id: ticketId, status, resolution_notes: resolutionNotes };
  },

  assignTicket: async (ticketId, staffId, staffName = null) => {
    try {
      const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
      const idx = localTickets.findIndex(t => t.id === ticketId);
      if (idx >= 0) {
        localTickets[idx].assigned_to = staffId;
        if (staffName) localTickets[idx].assigned_to_name = staffName;
        localStorage.setItem('local_tickets', JSON.stringify(localTickets));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('eduassist_ticket_updated', {
      detail: { id: ticketId, assigned_to: staffId }
    }));

    try {
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ assigned_to: staffId })
      });
      if (res.ok) return res.json();
    } catch {}

    return { id: ticketId, assigned_to: staffId };
  },

  // Ticket Comments
  getTicketComments: async (ticketId) => {
    try {
      const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
      const local = localTickets.find(t => t.id === ticketId);
      if (local && Array.isArray(local.comments) && local.comments.length > 0) {
        return local.comments;
      }
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, { headers: getAuthHeaders() });
      if (!res.ok) return local?.comments || [];
      return res.json();
    } catch {
      const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
      const local = localTickets.find(t => t.id === ticketId);
      return local?.comments || [];
    }
  },

  addComment: async (ticketId, messageText, currentUser = null) => {
    const newComment = {
      id: 'comment-' + Date.now(),
      ticket_id: ticketId,
      user_id: currentUser?.id || 'staff',
      user_name: currentUser?.full_name || 'Faculty Member',
      user_role: currentUser?.role || 'faculty',
      message: messageText,
      text: messageText,
      is_internal: false, // ALWAYS visible to the student!
      created_at: new Date().toISOString()
    };

    // Save into local_tickets immediately
    try {
      const localTickets = JSON.parse(localStorage.getItem('local_tickets') || '[]');
      const idx = localTickets.findIndex(t => t.id === ticketId);
      if (idx >= 0) {
        if (!Array.isArray(localTickets[idx].comments)) {
          localTickets[idx].comments = [];
        }
        localTickets[idx].comments.push(newComment);
        localStorage.setItem('local_tickets', JSON.stringify(localTickets));
      }
    } catch {}

    // Dispatch global event for instant UI sync
    window.dispatchEvent(new CustomEvent('eduassist_comment_added', { detail: newComment }));

    // Sync to backend if possible
    try {
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: messageText, is_internal: false })
      });
      if (res.ok) {
        const data = await res.json();
        return { ...newComment, ...data, message: data.message || messageText };
      }
    } catch {}

    return newComment;
  },

  // Ticket PDF attachment upload
  uploadTicketAttachment: async (ticketId, file) => {
    try {
      const token = localStorage.getItem("helpdesk_token");
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch(`${API_BASE_URL}/tickets/${ticketId}/attachments`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (!res.ok) throw new Error("Attachment upload failed");
      return res.json();
    } catch {
      // Return a mock success if backend doesn't support it yet
      return { filename: file.name, url: null, local: true };
    }
  },

  // ── Departments ───────────────────────────────────────────────
  getDepartments: async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Departments fetch failed");
      return res.json();
    } catch {
      return [
        { id: '1', code: 'CSE', name: 'Computer Science & Engineering' },
        { id: '2', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
        { id: '3', code: 'DS', name: 'Data Science' },
        { id: '4', code: 'BCA', name: 'Bachelor of Computer Applications' },
        { id: '5', code: 'MCA', name: 'Master of Computer Applications' },
        { id: '6', code: 'ADM', name: 'Admissions & Scholarships' },
        { id: '7', code: 'EXAM', name: 'Examination Cell' },
        { id: '8', code: 'ACC', name: 'Accounts & Finance' },
      ];
    }
  },

  // ── Notices ───────────────────────────────────────────────────
  getNotices: async (filters = {}) => {
    const localNotices = JSON.parse(localStorage.getItem('local_notices') || '[]');
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.pinned !== undefined) params.append("pinned", filters.pinned);
      const res = await apiFetch(`${API_BASE_URL}/notices?${params.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        const localIds = new Set(localNotices.map(n => n.id));
        return [...localNotices, ...DEMO_NOTICES.filter(n => !localIds.has(n.id))];
      }
      const data = await res.json();
      const backendNotices = Array.isArray(data) && data.length > 0 ? data : DEMO_NOTICES;
      const bIds = new Set(backendNotices.map(n => n.id));
      const unsynced = localNotices.filter(n => !bIds.has(n.id));
      return [...unsynced, ...backendNotices];
    } catch {
      const localIds = new Set(localNotices.map(n => n.id));
      return [...localNotices, ...DEMO_NOTICES.filter(n => !localIds.has(n.id))];
    }
  },

  createNotice: async (data) => {
    const localNotice = {
      id: 'notice-' + Date.now(),
      title: data.title,
      content: data.content,
      category: data.category || 'General',
      department_id: data.department_id || null,
      department_name: data.department_name || 'Campus Wide',
      attachment_name: data.attachment_name || null,
      attachment_url: data.attachment_url || null,
      file_name: data.file_name || data.attachment_name || null,
      author_name: data.author_name || data.created_by_name || 'Faculty / Staff',
      created_by_name: data.created_by_name || 'Faculty / Staff',
      is_pinned: Boolean(data.is_pinned || data.pinned),
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      is_local: true
    };

    // Save locally with supersede handling for same-category updates
    try {
      const existing = JSON.parse(localStorage.getItem('local_notices') || '[]');
      if (data.supersede_category && localNotice.status === 'active') {
        existing.forEach(n => {
          if (n.category?.toLowerCase() === localNotice.category?.toLowerCase()) {
            n.status = 'superseded';
          }
        });
      }
      existing.unshift(localNotice);
      localStorage.setItem('local_notices', JSON.stringify(existing));
    } catch {}

    // Auto RAG indexing locally for AI ChatBot with status & recency
    try {
      const ragChunks = JSON.parse(localStorage.getItem('rag_notice_chunks') || '[]');
      if (data.supersede_category && localNotice.status === 'active') {
        ragChunks.forEach(c => {
          if (c.metadata?.category?.toLowerCase() === localNotice.category?.toLowerCase()) {
            c.status = 'superseded';
          }
        });
      }
      ragChunks.unshift({
        id: 'chunk-' + Date.now(),
        document_id: localNotice.id,
        title: localNotice.title,
        content: `NOTICE: ${localNotice.title}\nCATEGORY: ${localNotice.category}\nSTATUS: ${localNotice.status}\nDATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\nATTACHED FILE: ${localNotice.attachment_name || 'None'}\nDETAILS:\n${localNotice.content}`,
        status: localNotice.status,
        created_at: localNotice.created_at,
        metadata: { category: localNotice.category, file: localNotice.attachment_name, status: localNotice.status }
      });
      localStorage.setItem('rag_notice_chunks', JSON.stringify(ragChunks));
    } catch {}

    window.dispatchEvent(new CustomEvent('eduassist_notice_created', { detail: localNotice }));

    try {
      const res = await apiFetch(`${API_BASE_URL}/notices`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) return res.json();
    } catch {}
    return localNotice;
  },

  updateNotice: async (noticeId, data) => {
    const res = await apiFetch(`${API_BASE_URL}/notices/${noticeId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteNotice: async (noticeId) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/notices/${noticeId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return res.json();
    } catch { return {}; }
  },

  togglePinNotice: async (noticeId) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/notices/${noticeId}/pin`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        // Fallback: toggle via PATCH
        const res2 = await apiFetch(`${API_BASE_URL}/notices/${noticeId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ pinned: true })
        });
        return res2.json();
      }
      return res.json();
    } catch {
      return { id: noticeId };
    }
  },

  // ── FAQs ──────────────────────────────────────────────────────
  getFaqs: async (departmentId = null) => {
    try {
      const url = departmentId
        ? `${API_BASE_URL}/faqs?department_id=${departmentId}`
        : `${API_BASE_URL}/faqs`;
      const res = await apiFetch(url, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  createFaq: async (data) => {
    const res = await apiFetch(`${API_BASE_URL}/faqs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateFaq: async (faqId, data) => {
    const res = await apiFetch(`${API_BASE_URL}/faqs/${faqId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteFaq: async (faqId) => {
    const res = await apiFetch(`${API_BASE_URL}/faqs/${faqId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // ── Analytics ─────────────────────────────────────────────────
  getAnalytics: async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/analytics/dashboard`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  },

  // ── System ────────────────────────────────────────────────────
  getSupabaseStatus: async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/system/supabase-status`);
      return res.json();
    } catch { return { status: 'unknown' }; }
  },

  configureSupabase: async (config) => {
    const res = await apiFetch(`${API_BASE_URL}/system/supabase-config`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return res.json();
  }
};
