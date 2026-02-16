@echo off
echo ========================================
echo   MySQL Diagnostic Script
echo ========================================
echo.

echo [1/5] Checking if port 3306 is in use...
netstat -ano | findstr :3306
if %ERRORLEVEL% NEQ 0 (
    echo     Port 3306 is NOT in use
) else (
    echo     WARNING: Port 3306 is in use!
    echo     Run the following to find the process:
    echo     netstat -ano | findstr :3306
)
echo.

echo [2/5] Checking for MySQL processes...
tasklist | findstr mysqld
if %ERRORLEVEL% NEQ 0 (
    echo     No MySQL process found running
) else (
    echo     MySQL process is running
)
echo.

echo [3/5] Checking XAMPP installation...
set "xampp路径="
for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\XAMPP" /v Install_Dir 2^>nul') do set "xampp路径=%%b"
if defined xampp路径 (
    echo     XAMPP found at: %xampp路径%
) else (
    echo     XAMPP not found in registry
    echo     Checking common locations...
    if exist "C:\xampp" (
        echo     XAMPP found at C:\xampp
    ) else if exist "D:\xampp" (
        echo     XAMPP found at D:\xampp
    ) else (
        echo     XAMPP not found in common locations
    )
)
echo.

echo [4/5] Checking MySQL data directory...
if defined xampp路径 (
    if exist "%xampp路径%\mysql\data" (
        echo     MySQL data directory exists
        dir "%xampp路径%\mysql\data" | findstr ibdata
        if %ERRORLEVEL% NEQ 0 (
            echo     WARNING: ibdata files may be missing or corrupted
        )
    ) else (
        echo     MySQL data directory not found
    )
)
echo.

echo [5/5] Checking for common MySQL error files...
if defined xampp路径 (
    if exist "%xampp路径%\mysql\data\mysql_error.log" (
        echo     Error log found:
        type "%xampp路径%\mysql\data\mysql_error.log"
    )
    if exist "%xampp路径%\mysql\data\*.err" (
        echo     Error files found in data directory
        dir "%xampp路径%\mysql\data\*.err"
    )
)
echo.

echo ========================================
echo   Diagnostic Complete
echo ========================================
echo.
echo RECOMMENDATIONS:
echo 1. If port 3306 is in use, stop that service or change MySQL port
echo 2. If MySQL data is corrupted, see FIX_MYSQL.md for recovery steps
echo 3. Try running XAMPP as Administrator
echo 4. Check XAMPP Control Panel for detailed error messages
echo.

pause
