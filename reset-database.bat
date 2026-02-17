@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   GameHub Database Reset Script
echo ========================================
echo.

REM Check if MySQL is running
echo [1/4] Checking MySQL service...
net start | findstr /i "mysql" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MySQL service not found via net start
    echo Trying to check XAMPP MySQL...
)

REM Check if MySQL is accessible
echo [2/4] Testing MySQL connection...
C:/xampp/mysql/bin/mysql.exe -u root -e "SELECT 1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Cannot connect to MySQL
    echo Please make sure:
    echo   1. XAMPP MySQL is running (open XAMPP Control Panel and start MySQL)
    echo   2. MySQL credentials are correct (root / no password)
    echo.
    echo To start MySQL in XAMPP:
    echo   1. Open XAMPP Control Panel
    echo   2. Click "Start" next to MySQL
    echo   3. Wait for it to show green
    pause
    exit /b 1
)
echo ✓ MySQL is running and accessible

REM Drop and recreate the database
echo [3/4] Resetting database...
C:/xampp/mysql/bin/mysql.exe -u root -e "DROP DATABASE IF EXISTS gamehub; CREATE DATABASE gamehub CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo ✓ Database 'gamehub' created fresh

REM Install dependencies if needed
echo [4/4] Starting backend server...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo ========================================
echo Starting GameHub Backend Server...
echo The database will be auto-initialized with tables and sample products
echo ========================================
echo.

REM Start the server (this will auto-create tables and insert sample products)
node server.js
