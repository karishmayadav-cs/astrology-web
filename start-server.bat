@echo off
title CosmicSoul - Backend Server
echo.
echo ==========================================
echo   CosmicSoul Backend Server
echo   URL: http://localhost:3000
echo   Press Ctrl+C to stop
echo ==========================================
echo.
cd /d "%~dp0backend"
node server.js
pause
