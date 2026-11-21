@echo off
title EduAssist – DYPSEM Full Stack
color 3F
echo.
echo =========================================================
echo   EduAssist – DYPSEM Helpdesk (Full Stack Launcher)
echo   Backend: FastAPI on :8000
echo   Frontend: Vite React PWA on :5173
echo =========================================================
echo.
echo Starting Backend in new window...
start "EduAssist Backend" call "%~dp0start_backend.bat"

timeout /t 4 /nobreak >nul

echo Starting Frontend in new window...
start "EduAssist Frontend" call "%~dp0start_frontend.bat"

echo.
echo Both servers starting. Check the opened windows.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
