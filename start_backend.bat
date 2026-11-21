@echo off
title EduAssist Backend – DYPSEM Helpdesk
color 1F
echo.
echo =========================================================
echo   EduAssist – DYPSEM Helpdesk Backend
echo   D. Y. Patil School of Engineering ^& Management
echo   Kasaba Bawada, Kolhapur
echo =========================================================
echo.

cd /d "%~dp0backend"

:: Check Python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

:: Check .env file
if not exist ".env" (
    echo [WARNING] .env file not found. Copying .env.example to .env ...
    copy ".env.example" ".env" >nul
    echo [ACTION REQUIRED] Please edit backend\.env and add your Supabase + Gemini API keys.
    echo.
    pause
)

:: Create virtual environment if missing
if not exist "venv\" (
    echo [SETUP] Creating Python virtual environment...
    python -m venv venv
)

:: Activate venv and install requirements
call venv\Scripts\activate.bat
echo [SETUP] Installing Python dependencies...
pip install -r requirements.txt --quiet

:: Create uploads directory
if not exist "uploads\" mkdir uploads

echo.
echo [START] Starting FastAPI backend on http://localhost:8000
echo [DOCS ] API Docs available at: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
