import re
from typing import List, Dict, Any, Tuple
from app.core.config import settings

SYSTEM_PROMPT = """You are EduAssist AI — the official Student Assistant for DYPSEM (D. Y. Patil School of Engineering & Management), Kolhapur, under D. Y. Patil Education Society (Deemed to be University).
Your purpose is to answer students, faculty, and visitors with 100% accuracy based strictly on the official college documents provided in the context.

Guidelines:
1. Rely ONLY on the provided context. Do NOT hallucinate rules, dates, or fee amounts.
2. Formulate clear, empathetic, and structured answers using bullet points where helpful.
3. Explicitly cite your sources at the relevant points in your response, e.g.: "(Source: Academic Regulations 2026, Page 1)".
4. If the context does NOT contain enough information to answer the query, politely inform the user:
   "I could not locate verified details for this query in our current college knowledge base. Please create a Helpdesk ticket so our faculty or administration can assist you directly."
"""

# Built-in DYPSEM knowledge base for common questions (used when no Gemini key)
DYPSEM_KNOWLEDGE: Dict[str, str] = {
    "attendance": """📋 **Minimum Attendance Requirement at DYPSEM**

As per DYPSEM Academic Regulations:

• **Minimum Required**: **75% attendance** per subject per semester
• Students below 75% are **not eligible** to appear for semester examinations
• Medical/emergency cases: Condonation up to **65%** (requires application + documents)
• Attendance is calculated from the **first day of the semester**

**How to check your attendance:**
- Login to the EduAssist portal → Dashboard → View Attendance
- Contact your Class Mentor or Department Office

*(Source: DYPSEM Academic Regulations 2026 — Attendance Policy, Section 3)*""",

    "fee": """💰 **Fee Structure & Payment Deadlines at DYPSEM**

• **Tuition Fees**: Payable at start of each semester (July & January)
• **Late Fee**: ₹500/day after due date
• **Payment Modes**: Online (college portal), DD, or NEFT/RTGS

**Fee categories:**
- Tuition Fee (per semester)
- Development Fee
- Exam Fee (paid separately per semester)
- Hostel Fee (if applicable)

**For exact fee amounts**: Visit Accounts & Finance office (Admin Block, Ground Floor) or contact accounts@dypsem.edu.in

*(Source: DYPSEM Fee Regulations 2026)*""",

    "exam": """📝 **Examination Rules at DYPSEM**

• **Semester exams** are conducted at end of each semester
• **Internal Assessment**: 20 marks (attendance, assignments, mid-sem)
• **End Semester Exam**: 80 marks
• **Passing Marks**: Minimum 40% in each subject (internal + external combined)
• **Back exam (KT)**: Available for failed subjects in next semester

**Re-evaluation**: Apply within 15 days of result declaration at Examination Cell (Admin Block, Room 204)

*(Source: DYPSEM Examination Rules 2026)*""",

    "hostel": """🏠 **Hostel Information at DYPSEM**

• Separate hostels for Boys and Girls
• **Allotment**: First come, first served basis at beginning of academic year
• **Rules**: Curfew timings apply; visitors allowed only during visiting hours
• **Fees**: Payable per semester along with tuition fee

**Contact**: Hostel Warden / Administration Office
**Email**: hostel@dypsem.edu.in

*(Source: DYPSEM Hostel Regulations 2026)*""",

    "scholarship": """🎓 **Scholarships at DYPSEM**

Available scholarships:
• **Government Scholarships**: EBC (Economically Backward Class), OBC, SC/ST scholarships
• **DY Patil Merit Scholarship**: For students with >75% in HSC
• **Freeship**: For students below income threshold

**Application Process**:
1. Apply online via Maharashtra Scholarship Portal (mahadbt.gov.in)
2. Submit documents to Admissions Office

**Deadline**: Usually August-September each year
**Contact**: admissions@dypsem.edu.in | Admin Block, Room 101

*(Source: DYPSEM Scholarship Guidelines 2026)*""",

    "library": """📚 **Library Rules at DYPSEM**

• **Timing**: 8:00 AM – 8:00 PM (Mon–Sat), 9:00 AM – 5:00 PM (Sunday)
• **Books**: Students can borrow up to 3 books at a time (7-day loan period)
• **Fine**: ₹2/day for late returns
• **Digital Access**: NPTEL, IEEE Xplore, DELNET available via library portal

*(Source: DYPSEM Library Regulations 2026)*""",

    "syllabus": """📖 **Syllabus & Academic Calendar at DYPSEM**

• Syllabus follows **D. Y. Patil Education Society (Deemed to be University)** curriculum
• Academic Calendar is published at the start of each academic year

**Available programmes:**
- B.Tech: CSE, AI/ML, Data Science
- BCA (3 years)
- MCA (2 years)

**Download syllabus**: Visit your department's notice board or EduAssist portal → Handbooks & Docs section

*(Source: DYPSEM Academic Regulations 2026)*""",

    "departments": """🏫 **Departments at DYPSEM, Kolhapur**

DYPSEM offers the following programmes:

| Department | Programme | Duration |
|------------|-----------|---------|
| **CSE** | Computer Science & Engineering | B.Tech (4 years) |
| **AIML** | Artificial Intelligence & Machine Learning | B.Tech (4 years) |
| **DS** | Data Science | B.Tech (4 years) |
| **BCA** | Bachelor of Computer Applications | BCA (3 years) |
| **MCA** | Master of Computer Applications | MCA (2 years) |

**Administrative Departments:**
- Admissions & Scholarships
- Examination Cell
- Accounts & Finance

For department-specific queries, contact the respective HOD or visit EduAssist → Departments & FAQs.

*(Source: DYPSEM Academic Programmes 2026)*"""
}

def _get_builtin_answer(query: str) -> Tuple[str, float, bool, str]:
    """Smart built-in answers from DYPSEM knowledge base."""
    q_lower = query.lower()

    # Keyword mapping
    keyword_map = {
        "attendance": ["attendance", "absent", "present", "75%", "eligib", "minimum attend"],
        "fee": ["fee", "fees", "payment", "tuition", "challan", "due date", "late fee", "amount"],
        "exam": ["exam", "examination", "marks", "result", "kt", "back", "revaluation", "passing", "semester exam"],
        "hostel": ["hostel", "accommodation", "room", "warden", "curfew", "boarding"],
        "scholarship": ["scholarship", "freeship", "ebc", "obc", "merit", "mahadbt", "financial aid"],
        "library": ["library", "book", "borrow", "fine", "nptel", "ieee", "journal"],
        "syllabus": ["syllabus", "curriculum", "academic calendar", "subjects", "course"],
        "departments": ["department", "cse", "aiml", "ai ml", "data science", "bca", "mca", "programme", "course offered"],
    }

    for topic, keywords in keyword_map.items():
        if any(kw in q_lower for kw in keywords):
            answer = DYPSEM_KNOWLEDGE[topic]
            return (answer, 0.85, True, None)

    # Generic helpful response
    return (
        "I am EduAssist AI for DYPSEM, Kolhapur. I can help you with:\n\n"
        "• 📋 **Attendance** requirements and policies\n"
        "• 💰 **Fees** structure and payment deadlines\n"
        "• 📝 **Examination** rules, results, and re-evaluation\n"
        "• 🏠 **Hostel** rules and facilities\n"
        "• 🎓 **Scholarships** and financial aid\n"
        "• 📚 **Library** timings and rules\n"
        "• 🏫 **Departments** — CSE, AIML, DS, BCA, MCA\n"
        "• 📖 **Syllabus** and academic calendar\n\n"
        "Please ask your specific question, or create a **Helpdesk Support Ticket** for personalized assistance from our staff.",
        0.5,
        True,
        None
    )


def generate_rag_answer(query: str, retrieved_chunks: List[Dict[str, Any]]) -> Tuple[str, float, bool, str]:
    """
    Synthesizes an answer grounded in the retrieved chunks.
    Returns: (answer_text, confidence_score, is_answered, unanswered_reason)
    """
    # Try Gemini API first if key is configured
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10 and "your-gemini" not in settings.GEMINI_API_KEY:
        try:
            context_str = ""
            if retrieved_chunks:
                context_blocks = []
                for idx, chunk in enumerate(retrieved_chunks, 1):
                    context_blocks.append(
                        f"--- CONTEXT CHUNK {idx} ---\n"
                        f"Document: {chunk['document_title']}\n"
                        f"Page: {chunk['page_number']}\n"
                        f"Content:\n{chunk['content']}\n"
                    )
                context_str = "\n".join(context_blocks)

            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt_content = f"{SYSTEM_PROMPT}\n\nCollege Context:\n{context_str if context_str else 'No specific documents retrieved — use general DYPSEM knowledge.'}\n\nStudent Query: {query}\n\nAnswer:"
            payload = {
                "contents": [{"parts": [{"text": prompt_content}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 800
                }
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text_part.strip():
                            is_answered = "could not locate verified details" not in text_part.lower()
                            confidence = 0.92 if retrieved_chunks else 0.75
                            return (text_part.strip(), confidence, is_answered, None if is_answered else "out_of_scope")
        except Exception as e:
            print(f"⚠️ Gemini API generation failed: {e}. Using built-in DYPSEM knowledge base.")

    # If chunks found — use them directly (no Gemini)
    if retrieved_chunks:
        top_score = retrieved_chunks[0]["similarity"]
        confidence = round(min(0.90, max(0.45, top_score + 0.25)), 2)

        if top_score >= 0.20:
            primary_chunk = retrieved_chunks[0]
            doc_title = primary_chunk["document_title"]
            page_num = primary_chunk["page_number"]
            content = primary_chunk["content"].strip()
            paragraphs = content.split('\n')
            main_body = "\n".join([p for p in paragraphs if len(p.strip()) > 20])
            if not main_body:
                main_body = content

            answer = (
                f"Based on official DYPSEM college records:\n\n"
                f"{main_body}\n\n"
                f"*(Source: {doc_title}, Page {page_num})*"
            )
            return (answer, confidence, True, None)

    # Fallback: Use built-in DYPSEM knowledge
    return _get_builtin_answer(query)
