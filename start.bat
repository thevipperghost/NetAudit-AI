@echo off
title NetAudit AI - Launch
echo ============================================
echo    NetAudit AI - Starting full stack...
echo ============================================

start "NetAudit Backend (port 8001)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

timeout /t 3 /nobreak >nul

start "NetAudit Frontend (port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
start "" http://localhost:5173

echo.
echo Backend : http://127.0.0.1:8001  (API docs at /docs)
echo Frontend: http://localhost:5173
echo Login   : any email + password
echo.
pause
