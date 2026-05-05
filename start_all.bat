@echo off
echo ==========================================
echo   SECURE PROCTORING - ONE-CLICK STARTUP
echo ==========================================
echo.

:: 1. Check and install Root Dependencies
if not exist node_modules (
    echo [1/4] Installing Root Dependencies...
    call npm install
) else (
    echo [1/4] Root Dependencies already installed.
)

:: 2. Check and install Backend Dependencies
echo [2/4] Checking Backend Dependencies...
cd backend
if not exist node_modules (
    echo [INFO] Missing backend modules. Installing now...
    call npm install
) else (
    echo [INFO] Backend dependencies already installed.
)
cd ..

:: 3. Start the Backend Server in a new window
echo [3/4] Starting Backend Server (Port 3000 with nodemon)...
start "Proctor Backend" cmd /c "cd backend && npm run dev"

:: 4. Start the Frontend Dev Server
echo [4/4] Starting Frontend Dev Server...
echo The app will open at: http://localhost:5173
echo.
npm run dev

pause
