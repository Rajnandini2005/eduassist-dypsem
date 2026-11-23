@echo off
title EduAssist DYPSEM - Google Chrome Launcher
color 0A
echo ========================================================
echo   EduAssist DYPSEM - Launching in Google Chrome
echo ========================================================
echo.
cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo [SETUP] Installing dependencies...
    npm install
)

echo [START] Opening EduAssist in Google Chrome (Full Screen)...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --new-window --start-maximized "http://localhost:5173"
) else (
    start "" "http://localhost:5173"
)

npm run dev
pause
