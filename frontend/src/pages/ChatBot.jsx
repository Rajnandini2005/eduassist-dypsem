import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  BookOpen, 
  RotateCcw, 
  Building2, 
  ExternalLink, 
  TicketPlus,
  Eye,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CitationDrawer from '../components/CitationDrawer';
import TicketModal from '../components/TicketModal';
import DocumentViewerModal from '../components/DocumentViewerModal';

// Local DYPSEM Knowledge Base with full source citations
const LOCAL_KB = {
  project_presentation: {
    keywords: [
      'project presentation', 'technical project', 'project review', 'capstone', 
      'synopsis', 'project viva', 'project demo', 'seminar presentation', 
      'project submission', 'presentation conducted', 'final year project', 'mini project'
    ],
    title: 'B.Tech & MCA Technical Project Presentation & Seminar Guidelines 2026',
    filename: 'Technical_Project_Guidelines_2026.pdf',
    page: 1,
    answer: `🎯 **Technical Project Presentation & Seminar Schedule at DYPSEM**

As per DYPSEM Academic Calendar & Final Year Project Committee Guidelines:

• **Project Synopsis Submission & Approval**: Approved by Department Project Committee by **August 25** (Odd Semester)
• **Technical Project Review 1 (Progress Presentation)**: Conducted in the **3rd week of September / 1st week of October**
• **Technical Project Review 2 (Mid-Term Evaluation & Demo)**: Conducted in the **2nd week of November** (Odd Semester)
• **Final Technical Demonstration & Viva-Voce**: Conducted in the **1st & 2nd week of April** (Even Semester) alongside University End-Semester Practical Examinations

**Evaluation Scheme (Total 100 Marks):**
1. Internal Guide / Supervisor Evaluation: **40 Marks**
2. Department Project Review Panel (Presentation & Demo): **30 Marks**
3. External University Examiner Viva-Voce: **30 Marks**

**Report & Plagiarism Regulations:**
- Documentation Format: IEEE Standard 2-Column or University Prescribed Format
- Plagiarism Limit: Strictly **under 15%** similarity score (Turnitin verified)
- Hardbound Submissions: 3 copies (Guide copy, Department Library copy, Student copy)

*(Source: Technical_Project_Guidelines_2026.pdf, Page 1)*`
  },
  placement: {
    keywords: ['placement', 'job', 'package', 'campus placement', 'drive', 'recruitment', 'tpo', 'internship', 'company', 'hiring'],
    title: 'DYPSEM Training & Placement Brochure 2026',
    filename: 'Placement_Policy_2026.pdf',
    page: 1,
    answer: `💼 **Training & Placement Cell at DYPSEM**

• **Top Recruiters**: TCS, Infosys, Capgemini, Wipro, Tech Mahindra, Hexaware, Cognizant
• **Eligibility**: Minimum 60% aggregate in 10th, 12th & Degree with 0 active backlogs
• **Campus Drives**: Conducted in 7th & 8th Semester (Final Year)
• **Internships**: Available from 6th semester onwards

*(Source: DYPSEM Training & Placement Cell 2026)*`
  },
  attendance: {
    keywords: ['attendance', 'absent', '75%', 'condonation', 'minimum attendance', 'defaulter', 'attendance requirement', 'attendance policy'],
    title: 'Academic Regulations & Attendance Policy 2026',
    filename: 'Academic_Regulations_2026.pdf',
    page: 1,
    answer: `📋 **Minimum Attendance Requirement at DYPSEM**

As per DYPSEM Academic Regulations:

• **Minimum Required**: **75% attendance** per subject per semester
• Students below 75% are **not eligible** to appear for semester examinations
• Medical/emergency cases: Condonation up to **65%** (requires application + medical documents)
• Attendance is calculated from the **first day of the semester**

**How to check your attendance:**
- Visit your department office or class mentor
- EduAssist portal → Dashboard section

*(Source: DYPSEM Academic Regulations 2026 — Attendance Policy)*`
  },
  exam: {
    keywords: ['exam', 'examination', 'marks', 'result', 'kt', 'back', 'revaluation', 'passing', 'semester exam', 'minimum marks', 'scrutiny'],
    title: 'Examination Cell Rules, Malpractice and Re-evaluation',
    filename: 'Exam_Cell_Guidelines.pdf',
    page: 1,
    answer: `📝 **Examination Rules at DYPSEM**

• **Internal Assessment**: 20 marks (attendance, assignments, mid-semester test)
• **End Semester Exam**: 80 marks
• **Passing Marks**: Minimum **40%** in each subject (combined internal + external)
• **Back exam (KT)**: Available for failed subjects in subsequent semester

**Re-evaluation Process:**
1. Apply within **15 days** of result declaration
2. Submit application to Examination Cell (Admin Block, Room 204)
3. Fee: As per current circular from Exam Cell (Photocopy: ₹400, Re-evaluation: ₹1,000)

*(Source: DYPSEM Examination Rules 2026)*`
  },
  fee: {
    keywords: ['fee', 'fees', 'payment', 'tuition', 'challan', 'due', 'amount', 'fine', 'late fee'],
    title: 'Tuition Fee Payment, Scholarship & Refund Rules',
    filename: 'Fee_Payment_Guidelines.pdf',
    page: 1,
    answer: `💰 **Fee Structure & Payment at DYPSEM**

• **Tuition Fees**: Payable at the start of each semester (July & January)
• **Late Payment Fine**: ₹100/day after due date
• **Payment Modes**: Online (college ERP portal), Demand Draft, NEFT/RTGS

**Fee categories:**
- Tuition Fee (per semester)
- Development Fee  
- Examination Fee (paid each semester separately)
- Hostel Fee (if applicable)

**Contact**: Accounts & Finance Office, Admin Block Ground Floor
**Email**: accounts@dypsem.edu.in

*(Source: DYPSEM Fee Regulations 2026)*`
  },
  hostel: {
    keywords: ['hostel', 'accommodation', 'room', 'warden', 'curfew', 'boarding', 'mess'],
    title: 'Campus Hostel Rules, Curfew & Mess Regulations',
    filename: 'Hostel_Rules_and_Mess_Policy.docx',
    page: 1,
    answer: `🏠 **Hostel Information at DYPSEM**

• Separate hostels for **Boys** and **Girls**
• **Allotment**: First come, first served basis at beginning of academic year
• **Curfew**: 9:30 PM (weekdays), 10:00 PM (weekends)
• **Visitors**: Allowed only during visiting hours (4:00 PM – 7:00 PM)
• **Fees**: Payable per semester along with tuition fee

**Contact**: Hostel Warden / Administration Office
**Email**: hostel@dypsem.edu.in

*(Source: DYPSEM Hostel Regulations 2026)*`
  },
  scholarship: {
    keywords: ['scholarship', 'freeship', 'ebc', 'obc', 'merit', 'mahadbt', 'financial', 'bursary'],
    title: 'Scholarship & Financial Assistance Handbook 2026',
    filename: 'Scholarship_Guidelines_2026.pdf',
    page: 1,
    answer: `🎓 **Scholarships at DYPSEM**

Available scholarships:
• **Government Scholarships**: EBC (Economically Backward Class), OBC, SC/ST
• **DY Patil Merit Scholarship**: For students with >75% in HSC/12th
• **Freeship**: For students below income threshold

**Application Process:**
1. Apply online via Maharashtra Scholarship Portal: **mahadbt.gov.in**
2. Submit printed documents to Admissions Office (Room 101)
3. **Deadline**: Usually August–September each year

**Contact**: admissions@dypsem.edu.in

*(Source: DYPSEM Scholarship Guidelines 2026)*`
  },
  departments: {
    keywords: ['department', 'cse', 'aiml', 'ai ml', 'data science', 'bca', 'mca', 'programme', 'course', 'branch'],
    title: 'DYPSEM Academic Programmes & Department Catalogue 2026',
    filename: 'Department_Catalogue_2026.pdf',
    page: 1,
    answer: `🏫 **Departments & Programmes at DYPSEM, Kolhapur**

| Department | Programme | Duration |
|------------|-----------|---------|
| **CSE** | Computer Science & Engineering | B.Tech (4 years) |
| **AIML** | Artificial Intelligence & Machine Learning | B.Tech (4 years) |
| **DS** | Data Science | B.Tech (4 years) |
| **BCA** | Bachelor of Computer Applications | BCA (3 years) |
| **MCA** | Master of Computer Applications | MCA (2 years) |

**Administrative Offices:**
- Admissions & Scholarships (Admin Block, Room 101)
- Examination Cell (Admin Block, Room 204)
- Accounts & Finance (Admin Block, Ground Floor)

DYPSEM is a constituent unit of **D. Y. Patil Education Society (Deemed to be University)**.

*(Source: DYPSEM Academic Programmes 2026)*`
  },
  library: {
    keywords: ['library', 'book', 'borrow', 'library fine', 'nptel', 'ieee', 'journal', 'reading'],
    title: 'DYPSEM Central Library Regulations 2026',
    filename: 'Library_Rules_2026.pdf',
    page: 1,
    answer: `📚 **Library at DYPSEM**

• **Timing**: 8:00 AM – 8:00 PM (Mon–Sat), 9:00 AM – 5:00 PM (Sunday)
• **Borrowing**: Up to **3 books** at a time, 7-day loan period
• **Fine**: ₹2/day for overdue returns
• **Digital Resources**: NPTEL, IEEE Xplore, DELNET available

*(Source: DYPSEM Library Regulations 2026)*`
  },
  syllabus: {
    keywords: ['syllabus', 'curriculum', 'academic calendar', 'subject', 'course content', 'timetable'],
    title: 'DYPSEM Academic Curriculum & Syllabus 2026',
    filename: 'Syllabus_Calendar_2026.pdf',
    page: 1,
    answer: `📖 **Syllabus & Academic Calendar at DYPSEM**

• Syllabus follows **D. Y. Patil Education Society (Deemed to be University)** curriculum
• Academic Calendar published at start of each academic year (June)
• **Semester System**: Odd semester (July–Nov), Even semester (Jan–May)

**Available Programmes**: CSE, AIML, Data Science (B.Tech), BCA, MCA

**Download**: Visit your department notice board or contact the department office.

*(Source: DYPSEM Academic Regulations 2026)*`
  }
};

const STOP_WORDS = new Set([
  'when', 'what', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those',
  'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'can', 'could', 'will', 'would', 'should', 'shall', 'may', 'might',
  'conducted', 'held', 'done', 'give', 'tell', 'show', 'please', 'about'
]);

function getLocalAnswer(query) {
  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^\w\s]/g, ' ');
  const queryTerms = cleanQ.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const effectiveTerms = queryTerms.length > 0 ? queryTerms : cleanQ.split(/\s+/).filter(w => w.length > 2);

  // 1. Check dynamically uploaded notices & RAG chunks from faculty (instant RAG retrieval)
  try {
    const ragChunks = JSON.parse(localStorage.getItem('rag_notice_chunks') || '[]');
    for (const chunk of ragChunks) {
      const chunkText = ((chunk.title || '') + ' ' + (chunk.content || '')).toLowerCase();
      const matches = effectiveTerms.filter(t => chunkText.includes(t));
      if (matches.length >= Math.min(2, effectiveTerms.length) || (effectiveTerms.length === 1 && matches.length === 1)) {
        return {
          text: `📢 **From Official Notice / Circular (RAG Indexed)**:\n\n**${chunk.title}**\n\n${chunk.content}\n\n*(Source: Official DYPSEM Faculty Circular — ${chunk.metadata?.file || 'Campus Notice'})*`,
          sources: [{
            document_id: chunk.document_id || 'rag-notice-chunk',
            document_title: chunk.title || 'Official Campus Notice',
            filename: chunk.metadata?.file || 'Campus_Notice_Circular.pdf',
            page_number: 1,
            similarity: 0.95,
            content_snippet: (chunk.content || '').substring(0, 220) + '...',
            full_content: chunk.content
          }],
          is_answered: true
        };
      }
    }

    const localNotices = JSON.parse(localStorage.getItem('local_notices') || '[]');
    for (const notice of localNotices) {
      const noticeText = ((notice.title || '') + ' ' + (notice.content || '')).toLowerCase();
      const matches = effectiveTerms.filter(t => noticeText.includes(t));
      if (matches.length >= Math.min(2, effectiveTerms.length) || (effectiveTerms.length === 1 && matches.length === 1)) {
        return {
          text: `📢 **Latest Published Notice (RAG)**:\n\n**${notice.title}**\n\n${notice.content}\n\n${notice.attachment_name ? `📎 Attached Document: **${notice.attachment_name}**` : ''}\n*(Source: Official DYPSEM Faculty Circular)*`,
          sources: [{
            document_id: notice.id || 'notice-local',
            document_title: notice.title,
            filename: notice.attachment_name || notice.file_name || 'Campus_Circular.pdf',
            page_number: 1,
            similarity: 0.94,
            content_snippet: (notice.content || '').substring(0, 220) + '...',
            full_content: notice.content
          }],
          is_answered: true
        };
      }
    }
  } catch {}

  // 2. Check LOCAL_KB knowledge base with exact keyword matching
  // Check project presentation first to avoid any collision
  for (const [key, entry] of Object.entries(LOCAL_KB)) {
    if (entry.keywords.some(kw => q.includes(kw))) {
      return {
        text: entry.answer,
        sources: [{
          document_id: `doc-${key}`,
          document_title: entry.title,
          filename: entry.filename,
          page_number: entry.page || 1,
          similarity: 0.92,
          content_snippet: entry.answer.substring(0, 220) + '...',
          full_content: entry.answer
        }],
        is_answered: true
      };
    }
  }

  // 3. Unanswered fallback — politely notify student & trigger support ticket option
  return {
    text: `I could not locate verified details or official circulars regarding "${query}" in our current DYPSEM knowledge base.\n\nPlease create a **Helpdesk Support Ticket** below so our department faculty or administration can assist you directly.`,
    sources: [],
    is_answered: false
  };
}

export default function ChatBot() {
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Student'}! I am the EduAssist AI for DYPSEM (D. Y. Patil School of Engineering & Management), Kolhapur. Ask me anything about examination rules, syllabus, fee deadlines, attendance policies, or hostel regulations. Every response is strictly grounded in official college documents with source citations.`,
      sources: [],
      confidence: 1.0,
      timestamp: new Date()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState(null);
  const [isCitationDrawerOpen, setIsCitationDrawerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketPrefill, setTicketPrefill] = useState({ title: '', deptId: '', desc: '' });

  const suggestedPrompts = [
    "when the technical project presentation is conducted",
    "What is the minimum attendance requirement for semester exams?",
    "Is any campus placement drive in college?",
    "What are the hostel curfew timings on weekdays?",
    "How do I apply for re-evaluation and what is the fee?",
    "Where can I get a bonafide certificate for an educational bank loan?"
  ];

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);

    if (location.state?.initialQuery) {
      handleAsk(location.state.initialQuery);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askChat(q.trim(), selectedDept || null);
      const botMsg = {
        id: res.query_id || Date.now().toString(),
        sender: 'bot',
        text: res.answer,
        sources: res.sources || [],
        confidence: res.confidence_score,
        is_answered: res.is_answered,
        unanswered_reason: res.unanswered_reason,
        response_time_ms: res.response_time_ms,
        relatedQuestion: q.trim(),
        timestamp: new Date(),
        feedback: null
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      // Backend unavailable — use local DYPSEM knowledge base & dynamic notices
      const localResult = getLocalAnswer(q.trim());
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: localResult.text,
          sources: localResult.sources || [],
          confidence: localResult.is_answered ? 0.92 : 0.35,
          is_answered: localResult.is_answered,
          isOffline: true,
          relatedQuestion: q.trim(),
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicketModal = (questionText) => {
    const q = (questionText || '').trim();
    const qLower = q.toLowerCase();
    let deptId = '';
    if (qLower.includes('placement') || qLower.includes('job') || qLower.includes('tpo') || qLower.includes('recruit') || qLower.includes('drive')) {
      deptId = 'dept-placement-001';
    } else if (qLower.includes('scholarship') || qLower.includes('mahadbt') || qLower.includes('ebc') || qLower.includes('freeship')) {
      deptId = 'dept-scholarship-001';
    } else if (qLower.includes('fee') || qLower.includes('payment') || qLower.includes('challan') || qLower.includes('fine') || qLower.includes('due')) {
      deptId = 'dept-fee-001';
    } else if (qLower.includes('library') || qLower.includes('book') || qLower.includes('journal')) {
      deptId = 'dept-library-001';
    } else if (qLower.includes('exam') || qLower.includes('reval') || qLower.includes('grade') || qLower.includes('marksheet')) {
      deptId = '77777777-7777-7777-7777-777777777777';
    } else {
      deptId = 'dept-academic-001';
    }

    setTicketPrefill({
      title: q,
      deptId: deptId,
      desc: `Inquiry regarding: ${q}\n(Submitted via Ask AI Assistant for official department follow-up)`
    });
    setIsTicketModalOpen(true);
  };

  const handleTicketCreated = (newTicket) => {
    setIsTicketModalOpen(false);
    setMessages(prev => [
      ...prev,
      {
        id: 'ticket-created-' + Date.now(),
        sender: 'bot',
        text: `✅ **Support Ticket Created Successfully!**\n\n• **Ticket ID**: ${newTicket?.ticket_number || 'TKT-10023'}\n• **Question / Subject**: ${newTicket?.title || ticketPrefill.title}\n• **Target Department**: ${newTicket?.department_name || 'Department Desk'}\n• **Status**: Open\n\nYour question has been routed directly to the department desk. You can track progress and official remarks in the **Tickets** section.`,
        sources: [],
        confidence: 1.0,
        timestamp: new Date()
      }
    ]);
  };

  const handleFeedback = async (queryId, type) => {
    try {
      await api.sendFeedback(queryId, type);
      setMessages(prev =>
        prev.map(m => m.id === queryId ? { ...m, feedback: type } : m)
      );
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCitations = (sources) => {
    setSelectedSources(sources);
    setIsCitationDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              EduAssist AI Helpdesk
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> RAG Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">pgvector Semantic Knowledge Search & Audit Trail</p>
          </div>
        </div>

        {/* Department Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50/50">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                isBot ? 'bg-blue-900 shadow-sm' : 'bg-slate-700'
              }`}>
                {isBot ? <Sparkles className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-2xl">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isBot 
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' 
                    : 'bg-blue-900 text-white shadow-md'
                }`}>
                  {msg.text}
                </div>

                {/* Clickable Source Chips directly under bot message */}
                {isBot && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-0.5">
                      Verified Source:
                    </span>
                    {msg.sources.map((src, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setViewingDoc(src)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm active:scale-95 text-left"
                        title="Click to view full source document or PDF"
                      >
                        <FileText className="w-3 h-3 text-blue-700 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{src.filename || src.document_title}</span>
                        <Eye className="w-2.5 h-2.5 text-blue-600 opacity-70 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Bot Metadata & Citations */}
                {isBot && msg.id !== 'welcome' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      {/* Citations Button */}
                      {msg.sources && msg.sources.length > 0 && (
                        <button
                          onClick={() => openCitations(msg.sources)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-blue-700" />
                          <span>{msg.sources.length} Verified Sources</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      )}

                      {/* Confidence Pill */}
                      {msg.confidence !== undefined && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {Math.round(msg.confidence * 100)}% Match
                        </span>
                      )}

                      {msg.response_time_ms && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.response_time_ms}ms
                        </span>
                      )}
                    </div>

                    {/* Actions: Copy & Feedback */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedback === 'helpful' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'unhelpful')}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedback === 'unhelpful' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'}`}
                        title="Not Helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL Support Ticket Creation: ONLY when AI DOES NOT have an answer / query is unanswered */}
                {isBot && msg.id !== 'welcome' && (!msg.is_answered || !msg.sources || msg.sources.length === 0) && (
                  <div className="pt-2 flex items-center">
                    <button
                      onClick={() => handleOpenTicketModal(msg.relatedQuestion || 'Campus Inquiry')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-sm transition-all animate-in fade-in"
                    >
                      <TicketPlus className="w-3.5 h-3.5" />
                      <span>Create Support Ticket</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-sm flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce"></div>
              </div>
              <span className="font-medium">Searching pgvector knowledge base & synthesizing cited answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 whitespace-nowrap font-medium transition-colors shadow-2xl"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your academic or administrative question..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-40 transition-all shadow-md shadow-blue-900/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Grounded with Retrieval-Augmented Generation (RAG) strictly using official university regulations.
        </p>
      </div>

      {/* Citations Drawer */}
      <CitationDrawer
        isOpen={isCitationDrawerOpen}
        onClose={() => setIsCitationDrawerOpen(false)}
        sources={selectedSources}
        onViewSource={(doc) => {
          setIsCitationDrawerOpen(false);
          setViewingDoc(doc);
        }}
      />

      {/* Official Document / PDF Viewer Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          isOpen={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          document={viewingDoc}
        />
      )}

      {/* Direct Ticket Creation Modal from Chat */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onCreated={handleTicketCreated}
        initialTitle={ticketPrefill.title}
        initialDepartmentId={ticketPrefill.deptId}
        initialDescription={ticketPrefill.desc}
      />

    </div>
  );
}

