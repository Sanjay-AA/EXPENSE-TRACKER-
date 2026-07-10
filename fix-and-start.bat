@echo off
echo ===== Expense Tracker Setup and Start =====
echo.

echo [1/4] Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Starting Backend Server...
cd /d "d:\expense-tracker-with-bank\backend"
start "Backend Server" cmd /k "echo Starting Backend on Port 5001... && node server.js"

echo [3/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server...
cd /d "d:\expense-tracker-with-bank\frontend"
start "Frontend Server" cmd /k "echo Starting Frontend on Port 5173... && npm run dev"

echo.
echo ===== Servers Starting =====
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Check the opened terminal windows for any errors.
pause
