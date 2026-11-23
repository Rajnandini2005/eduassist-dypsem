@echo off
title EduAssist DYPSEM - 1-Click Launcher
color 0A
echo ========================================================
echo   EduAssist DYPSEM - College Helpdesk & Assistance
echo ========================================================
echo.
cd /d "%~dp0frontend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [SETUP] First time setup: Installing dependencies...
    npm install
)

echo [START] Starting EduAssist in your browser...
echo [LINK ] http://localhost:5173
echo.
start "" "http://localhost:5173"
npm run dev
pause
