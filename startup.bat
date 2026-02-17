@echo off
echo ========================================
echo   GameHub Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Node.js found - OK

REM Start backend server (uses MySQL with phpMyAdmin - see PHPMYADMIN_SETUP.md)
echo [2/3] Starting backend server...

REM Install dependencies if needed
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo [3/3] Installing dependencies...
    call npm install
) else (
    echo [3/3] Dependencies found - OK
)

REM Start the server (MySQL database - make sure XAMPP MySQL is running)
echo.
echo ========================================
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.
node server.js
