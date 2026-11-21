@echo off
title EduAssist Frontend – DYPSEM Helpdesk PWA
color 2F
echo.
echo =========================================================
echo   EduAssist – DYPSEM Helpdesk Frontend (React PWA)
echo   D. Y. Patil School of Engineering ^& Management
echo =========================================================
echo.

cd /d "%~dp0frontend"

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

:: Install dependencies if missing
if not exist "node_modules\" (
    echo [SETUP] Installing Node.js dependencies...
    npm install
)

:: Create .env if missing
if not exist ".env" (
    echo [SETUP] Creating frontend .env from example...
    copy ".env.example" ".env" >nul
)

echo.
echo [START] Starting Vite dev server...
echo [URL  ] Open: http://localhost:5173
echo [NOTE ] On mobile: use your PC's local IP, e.g. http://192.168.x.x:5173
echo.
npm run dev

pause
