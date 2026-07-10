@echo off
echo Starting Backend Server...
cd /d "d:\expense-tracker-with-bank\backend"
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Starting Express server on port 5001...
call node server.js
pause
