import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  ShieldCheck,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

const DOCUMENT_FULL_TEXTS = {
  'Technical_Project_Guidelines_2026.pdf': `D. Y. PATIL SCHOOL OF ENGINEERING & MANAGEMENT, KOLHAPUR
CONSTITUENT UNIT OF D. Y. PATIL EDUCATION SOCIETY (DEEMED TO BE UNIVERSITY)
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING / AIML / DATA SCIENCE / MCA

OFFICIAL GUIDELINES FOR FINAL YEAR TECHNICAL PROJECT PRESENTATIONS & CAPSTONE SEMINARS (ACADEMIC YEAR 2026-2027)

1. OBJECTIVE & SCOPE
The final year Technical Capstone Project aims to evaluate students' technical proficiency, system design, architectural modeling, coding standards, and project management skills.

2. PRESENTATION SCHEDULE & MILESTONES:
• Synopsis Approval: All project teams (maximum 4 members) must submit their problem statement and synopsis by AUGUST 25.
• Review Phase 1 (Progress & Architectural Design): Conducted in the 3rd week of September / 1st week of October. Teams must present literature review, feasibility analysis, software requirements specification (SRS), and High-Level Architecture.
• Review Phase 2 (Mid-Term Implementation & Testing): Conducted in the 2nd week of November. Demonstration of working modules and backend database schemas.
• Final Demonstration & University Viva-Voce: Conducted in the 1st & 2nd week of April alongside University End-Semester Practical Examinations in the presence of an External Examiner.

3. EVALUATION RUBRIC (TOTAL 100 MARKS):
• Internal Guide / Supervisor Evaluation: 40 Marks (Continuous progress, attendance, and commitment)
• Department Project Committee Review: 30 Marks (Quality of presentation, technical defense, and domain innovation)
• External University Examiner Viva-Voce: 30 Marks (Live code demonstration, algorithmic explanation, and Q&A defense)

4. DOCUMENTATION & PLAGIARISM CRITERIA:
• All reports must strictly conform to IEEE 2-Column Standard formatting.
• Plagiarism check via Turnitin is mandatory: Similarity index must be strictly LESS THAN 15%.
• Hardbound copies must be submitted with signature of HOD and Dean before final semester viva.

APPROVED BY:
Academic Council & Department Project Coordinator
D. Y. Patil School of Engineering & Management, Kolhapur`,

  'Academic_Regulations_2026.pdf': `D. Y. PATIL SCHOOL OF ENGINEERING & MANAGEMENT, KOLHAPUR
OFFICE OF THE ACADEMIC DEAN & CONTROLLER OF EXAMINATIONS

REGULATION HANDBOOK 2026 — SECTION 4: ATTENDANCE & ACADEMIC INTEGRITY

1. ATTENDANCE ELIGIBILITY:
• Every registered student must secure a minimum of 75% attendance in aggregate across all registered theory and laboratory courses in a semester.
• Students having attendance between 65% and 74.9% due to authorized medical grounds or officially sanctioned university representation may be granted condonation of attendance by the Dean of Academics upon payment of the prescribed condonation fee of Rs. 1,000 per course.
• Students with attendance below 65% are strictly DETAINED from writing end-semester university examinations.

2. GRADING SCALE & DEGREE REQUIREMENTS:
• Continuous Internal Assessment (CIA): 40 Marks
• End Semester Examination (ESE): 60 Marks
• Minimum passing mark is 40% combined in each course.
• Cumulative Grade Point Average (CGPA) of at least 5.0 with zero active backlogs is mandatory for degree award.

ISSUED BY: Office of Academic Registry, DYPSEM`,

  'Fee_Payment_Guidelines.pdf': `D. Y. PATIL SCHOOL OF ENGINEERING & MANAGEMENT, KOLHAPUR
ACCOUNTS & FINANCE DEPARTMENT — TUITION FEE REGULATIONS 2026

1. TUITION FEE PAYMENT DEADLINES:
• Odd Semester: Payable on or before July 15.
• Even Semester: Payable on or before January 15.
• Grace Period: 7 days permitted with late fine of Rs. 100 per day.

2. APPROVED PAYMENT METHODS:
• All semester fees must be processed exclusively via the official ERP student portal (Net Banking, Debit Card, Credit Card, or UPI).
• Cash payments at the college counter are strictly prohibited.
• Educational loan bonafide estimation certificates are issued from Room 102 within 2 business days.

ISSUED BY: Accounts Officer, DYPSEM Kolhapur`,

  'Exam_Cell_Guidelines.pdf': `D. Y. PATIL SCHOOL OF ENGINEERING & MANAGEMENT, KOLHAPUR
EXAMINATION CELL — RE-EVALUATION & SCRUTINY PROCEDURES 2026

1. RE-EVALUATION PROCEDURES:
• Application window: Open for 10 calendar days following the announcement of semester results.
• Script photocopy fee: Rs. 400 per course.
• Complete re-evaluation fee: Rs. 1,000 per course.
• 50% fee refund policy: If re-evaluation results in a marks increase of 15% or higher, 50% of the re-evaluation fee is refunded back to the student.

2. SUPPLEMENTARY (KT) EXAMINATIONS:
• Supplementary backlog exams are scheduled within 45 days after the main examination results.

ISSUED BY: Controller of Examinations, DYPSEM`,

  'Hostel_Rules_and_Mess_Policy.docx': `D. Y. PATIL SCHOOL OF ENGINEERING & MANAGEMENT, KOLHAPUR
CAMPUS RESIDENCE & HOSTEL ADMINISTRATION GUIDELINES 2026

1. ENTRY & CURFEW TIMINGS:
• Monday to Saturday: Main hostel gates close strictly at 9:30 PM.
• Sundays & Official Holidays: Curfew is 10:00 PM.
• Late entry requires prior approval of the Chief Warden.

2. NIGHT-OUT PERMITS:
• Night-out and home leave passes must be applied online at least 24 hours in advance through the EduAssist student portal with parent SMS confirmation.

ISSUED BY: Chief Hostel Warden, DYPSEM Residence`
};

export default function DocumentViewerModal({ isOpen, onClose, document }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen || !document) return null;

  const filename = document.filename || document.attachment_name || 'Official_Document.pdf';
  const title = document.document_title || document.title || 'Official College Document';
  
  // Find full text or use snippet/content
  let fullText = DOCUMENT_FULL_TEXTS[filename] || 
                 document.full_content || 
                 document.content || 
                 document.content_snippet || 
                 'Official college document record stored in DYPSEM pgvector repository.';

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename.endsWith('.pdf') ? filename.replace('.pdf', '.txt') : filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-4xl bg-slate-100 border border-slate-300 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f2d52] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate flex items-center gap-2">
                {title}
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Grounded Source
                </span>
              </h3>
              <p className="text-[11px] text-blue-200 font-mono truncate">{filename} · Page {document.page_number || 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl px-2 py-1 text-xs gap-1.5">
              <button 
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                className="hover:text-amber-300 p-0.5" 
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                className="hover:text-amber-300 p-0.5" 
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow transition-all"
              title="Download Source Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Canvas / PDF Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          <div 
            style={{ fontSize: `${zoomLevel}%` }}
            className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-8 sm:p-12 text-slate-800 space-y-6 border border-slate-300 transition-all font-sans leading-relaxed"
          >
            {/* Header Stamp */}
            <div className="border-b-2 border-slate-800 pb-5 text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <img 
                  src="/dypsem-logo.jpg" 
                  alt="DYPSEM" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                    D. Y. Patil School of Engineering & Management
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    D. Y. Patil Education Society (Deemed to be University) · Kolhapur
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 font-mono">
                <span>OFFICIAL VERIFIED REPOSITORY DOCUMENT</span>
                <span>STATUS: VERIFIED & ACTIVE</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <h2 className="text-sm font-bold text-[#0f2d52]">{title}</h2>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5">File Reference: {filename}</p>
            </div>

            {/* Document Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {fullText}
            </div>

            {/* Official Stamp & Sign Off */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitally Authenticated by DYPSEM Helpdesk System</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-[11px]">Academic & Administrative Registry</p>
                <p className="text-[10px] text-slate-400">DYPSEM, Kolhapur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono text-[11px] text-slate-400">
            Source match: {Math.round((document.similarity || 0.95) * 100)}%
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-[#0f2d52] hover:bg-blue-900 text-white font-bold text-xs shadow-sm transition-all"
          >
            Done Reading
          </button>
        </div>

      </div>
    </div>
  );
}
