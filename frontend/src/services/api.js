// Backend URL — permanently hardcoded
// Render free tier wakes up in 30-60 seconds after inactivity
export const BACKEND_URL = "https://eduassist-dypsem-backend.onrender.com";
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("helpdesk_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
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

export const api = {
  // Auth
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
    const res = await apiFetch(`${API_BASE_URL}/auth/users`, { headers: getAuthHeaders() });
    return res.json();
  },

  updateUser: async (userId, data) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Chat
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

  // Documents
  getDocuments: async () => {
    const res = await apiFetch(`${API_BASE_URL}/documents`, { headers: getAuthHeaders() });
    return res.json();
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

  // Tickets
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category) params.append("category", filters.category);
    if (filters.department_id) params.append("department_id", filters.department_id);
    const res = await apiFetch(`${API_BASE_URL}/tickets?${params.toString()}`, { headers: getAuthHeaders() });
    return res.json();
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

  // Departments
  getDepartments: async () => {
    const res = await apiFetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Departments fetch failed");
    return res.json();
  },

  // Notices
  getNotices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.pinned !== undefined) params.append("pinned", filters.pinned);
    const res = await apiFetch(`${API_BASE_URL}/notices?${params.toString()}`, { headers: getAuthHeaders() });
    return res.json();
  },

  createNotice: async (data) => {
    const res = await apiFetch(`${API_BASE_URL}/notices`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
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
    const res = await apiFetch(`${API_BASE_URL}/notices/${noticeId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // FAQs
  getFaqs: async (departmentId = null) => {
    const url = departmentId
      ? `${API_BASE_URL}/faqs?department_id=${departmentId}`
      : `${API_BASE_URL}/faqs`;
    const res = await apiFetch(url, { headers: getAuthHeaders() });
    return res.json();
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

  // Analytics
  getAnalytics: async () => {
    const res = await apiFetch(`${API_BASE_URL}/analytics/dashboard`, { headers: getAuthHeaders() });
    return res.json();
  },

  // System
  getSupabaseStatus: async () => {
    const res = await apiFetch(`${API_BASE_URL}/system/supabase-status`);
    return res.json();
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
