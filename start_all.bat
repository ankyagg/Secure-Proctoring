@echo off
echo ==========================================
echo   SECURE PROCTORING - STARTUP SCRIPT
echo ==========================================
echo.
echo [INFO] Code execution is handled by Wandbox (cloud).
echo [INFO] No Docker / Judge0 required for development.
echo.

:: Check for internet connection (ping Wandbox)
echo [1/2] Checking internet connection to Wandbox...
ping -n 1 wandbox.org >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Cannot reach wandbox.org - code execution may not work!
    echo           Check your internet connection.
    echo.
) else (
    echo [OK] Wandbox is reachable. Code execution will work.
)

:: Start the Frontend Dev Server
echo [2/2] Starting Frontend Dev Server...
echo The app will open at: http://localhost:5173
echo.
npm run dev

pause
