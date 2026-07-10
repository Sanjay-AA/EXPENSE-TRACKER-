@echo off
echo Starting Frontend Development Server...
cd /d "d:\expense-tracker-with-bank\frontend"
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Starting Vite development server...
call npm run dev
pause
