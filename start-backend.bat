@echo off
echo.
echo ================================
echo Smart Waste System - Backend
echo ================================
echo.
echo Installing dependencies...
cd server
call npm install
echo.
echo Seeding database (first time only)...
call node seed.js
echo.
echo Starting backend server...
call node index.js
pause
