@echo off
title KARTO
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org then run this file again. & pause & exit /b)
start "" http://localhost:4000
node server\server.js
pause
