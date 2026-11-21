# EduAssist â€“ DYPSEM AI Helpdesk Mobile PWA

> **D. Y. Patil School of Engineering & Management**  
> Kasaba Bawada, Kolhapur â€“ 416006, Maharashtra  
> 8th Constituent Unit Â· D. Y. Patil Education Society (Deemed to be University)

---

## ðŸŽ“ About

**EduAssist** is a modern, installable Progressive Web App (PWA) for the D. Y. Patil School of Engineering & Management (DYPSEM), Kolhapur. It provides students, faculty, and administrators with an AI-powered helpdesk, grievance ticketing system, campus notices, and academic resources â€” all accessible as a native-like mobile app.

**Live Backend:** https://college-helpdesk-frontend.onrender.com  
**App Name:** EduAssist  
**Tagline:** Your Smart College Helpdesk

---

## ðŸ—ï¸ Technology Stack

| Layer        | Technology                              |
|-------------|------------------------------------------|
| Frontend     | React 19 + Vite 8 + TailwindCSS 3       |
| Icons        | Lucide React                             |
| Charts       | Recharts                                 |
| Backend      | FastAPI (Python)                         |
| Database     | Supabase (PostgreSQL + pgvector)         |
| AI / LLM     | Google Gemini 1.5 Flash + Embedding-004  |
| Auth         | JWT (python-jose) + Role-based access    |
| PWA          | Web App Manifest + Service Worker        |
| Hosting      | Render.com (backend) + any static host   |

---

## ðŸ“± Features

### Mobile PWA
- âœ… Installable on Android (Add to Home Screen)
- âœ… Works on desktop browsers too
- âœ… Offline fallback page
- âœ… Mobile bottom navigation bar
- âœ… Safe area support (notch/punch-hole phones)
- âœ… PWA install prompt banner
- âœ… App manifest with EduAssist branding

### Application Modules
| Module                  | Student | Faculty | Admin |
|------------------------|---------|---------|-------|
| Dashboard               | âœ…      | âœ…      | âœ…    |
| AI Assistant (RAG)      | âœ…      | âœ…      | âœ…    |
| Grievance Tickets       | âœ…      | âœ…      | âœ…    |
| College Handbooks       | âœ…      | âœ…      | âœ…    |
| Departments & FAQs      | âœ…      | âœ…      | âœ…    |
| Campus Notices          | âœ…      | âœ…      | âœ…    |
| Analytics Dashboard     | âŒ      | âœ…      | âœ…    |
| User Management         | âŒ      | âŒ      | âœ…    |
| Document Upload         | âŒ      | âœ…      | âœ…    |
| Notice Publishing       | âŒ      | âœ…      | âœ…    |

---

## ðŸš€ Running Locally (Windows)

### Prerequisites
- **Node.js** 18+ â†’ https://nodejs.org
- **Python** 3.10+ â†’ https://python.org
- **Git** (optional)

### Option A: One-Click Launch
```
Double-click: start_all.bat
```

### Option B: Manual

**Terminal 1 â€” Backend:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
:: Edit .env and add your Supabase + Gemini keys
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 â€” Frontend:**
```cmd
cd frontend
npm install
copy .env.example .env
npm run dev
```

**Open in browser:** http://localhost:5173

**Open on your phone:** http://YOUR_PC_IP:5173  
*(Find your IP: `ipconfig` â†’ IPv4 Address)*

---

## ðŸ”‘ Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```
For production: `VITE_API_URL=https://your-backend.onrender.com/api/v1`

---

## ðŸ—„ï¸ Database Setup (Supabase)

1. Create a free project at https://app.supabase.com
2. Enable **pgvector** extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run all migration files in order:
   ```
   database/01_schema.sql
   database/02_functions.sql
   database/03_rls_policies.sql
   database/04_seed_data.sql
   ```
   Or run: `database/setup_all.sql`

---

## ðŸ“² Installing on Android

### Method 1: Chrome Browser (Recommended)
1. Open the app URL in **Chrome for Android**
2. Tap the **three-dot menu** (â‹®)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. EduAssist appears on your home screen like a native app

### Method 2: PWA Install Banner
- When you first visit the app, a banner appears at the bottom
- Tap **"Install App"** in the banner

---

## ðŸŒ Deployment (Independent)

### Frontend (Render Static Site)
```
Build Command: npm run build
Publish Directory: dist
Environment Variable: VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### Frontend (Netlify / Vercel)
```
Build: npm run build
Output: frontend/dist
```

Add `frontend/public/_redirects` for SPA routing:
```
/*  /index.html  200
```

### Backend (Render Web Service)
```
Root Directory: backend
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment: Add all variables from .env
```

---

## ðŸ” Demo Login Roles

| Role    | Action                              |
|---------|-------------------------------------|
| Student | Click "Sign In as Student" on login |
| Faculty | Click "Sign In as Faculty" on login |
| Admin   | Click "Sign In as Admin" on login   |

---

## ðŸ“ Project Structure

```
CollegeHelpdeskMobile/
â”œâ”€â”€ frontend/                    # React PWA
â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â”œâ”€â”€ manifest.json        # PWA manifest
â”‚   â”‚   â”œâ”€â”€ sw.js               # Service worker
â”‚   â”‚   â”œâ”€â”€ offline.html        # Offline fallback
â”‚   â”‚   â”œâ”€â”€ logo.svg            # EduAssist logo
â”‚   â”‚   â”œâ”€â”€ favicon.svg         # App favicon
â”‚   â”‚   â””â”€â”€ icons/              # App icons (192, 512, maskable)
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ components/
â”‚       â”‚   â”œâ”€â”€ Sidebar.jsx      # Desktop sidebar nav
â”‚       â”‚   â”œâ”€â”€ Navbar.jsx       # Top navigation bar
â”‚       â”‚   â”œâ”€â”€ BottomNav.jsx    # Mobile bottom nav (NEW)
â”‚       â”‚   â”œâ”€â”€ PWAInstallBanner.jsx  # PWA install prompt (NEW)
â”‚       â”‚   â”œâ”€â”€ StatCard.jsx
â”‚       â”‚   â”œâ”€â”€ TicketModal.jsx
â”‚       â”‚   â”œâ”€â”€ SupabaseModal.jsx
â”‚       â”‚   â””â”€â”€ ...
â”‚       â”œâ”€â”€ pages/
â”‚       â”‚   â”œâ”€â”€ Login.jsx        # DYPSEM-branded login
â”‚       â”‚   â”œâ”€â”€ Dashboard.jsx    # Role-based dashboard
â”‚       â”‚   â”œâ”€â”€ ChatBot.jsx      # AI RAG chatbot
â”‚       â”‚   â”œâ”€â”€ Tickets.jsx      # Grievance system
â”‚       â”‚   â”œâ”€â”€ Documents.jsx    # Knowledge repository
â”‚       â”‚   â”œâ”€â”€ Departments.jsx  # Dept. directory & FAQs
â”‚       â”‚   â”œâ”€â”€ Notices.jsx      # Campus circulars
â”‚       â”‚   â”œâ”€â”€ Analytics.jsx    # Admin analytics
â”‚       â”‚   â””â”€â”€ AdminUsers.jsx   # User management
â”‚       â”œâ”€â”€ context/AuthContext.jsx
â”‚       â””â”€â”€ services/api.js
â”œâ”€â”€ backend/                     # FastAPI backend
â”‚   â”œâ”€â”€ .env                    # Your environment variables
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ main.py
â”‚       â”œâ”€â”€ api/                # All API endpoints
â”‚       â”œâ”€â”€ core/               # Config, auth, DB
â”‚       â”œâ”€â”€ models/             # Pydantic schemas
â”‚       â””â”€â”€ rag/                # AI RAG pipeline
â”œâ”€â”€ database/                   # Supabase SQL migrations
â”œâ”€â”€ start_backend.bat           # Windows: start backend
â”œâ”€â”€ start_frontend.bat          # Windows: start frontend
â””â”€â”€ start_all.bat               # Windows: start both
```

---

## ðŸ‘¥ Roles & Permissions

- **Student** â€“ Submit tickets, chat with AI, view handbooks, read notices
- **Faculty** â€“ Resolve assigned tickets, publish department notices, add FAQs, view analytics
- **Admin** â€“ Full access: user management, all tickets, analytics, document upload, notice publishing

---

*EduAssist Â· DYPSEM Â· Kolhapur Â· Built with â¤ï¸ using React + FastAPI + Google Gemini*
