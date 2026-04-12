@echo off
setlocal
title AgenticDev - Local AI App

echo ========================================
echo Checking for Node.js Environment...
echo ========================================

:: Check if node is accessible globally
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Node.js not found in global path.
    echo [INFO] Downloading a portable Node.js instance ^(this may take a few minutes^)...
    
    if not exist "%~dp0.portable_node" mkdir "%~dp0.portable_node"
    
    :: Safe, minimal URL for nodejs windows zip (LTS version)
    set "NODE_URL=https://nodejs.org/dist/v20.13.1/node-v20.13.1-win-x64.zip"
    set "ZIP_DEST=%~dp0.portable_node\node.zip"
    
    if not exist "%~dp0.portable_node\node-v20.13.1-win-x64\node.exe" (
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%ZIP_DEST%'"
        echo [INFO] Extracting Node.js...
        powershell -Command "Expand-Archive -Path '%ZIP_DEST%' -DestinationPath '%~dp0.portable_node' -Force"
        del "%ZIP_DEST%"
    )
    
    :: Add local Node instance to PATH strictly for this script block 
    set "PATH=%~dp0.portable_node\node-v20.13.1-win-x64;%PATH%"
    echo [OK] Using portable Node.js!
) else (
    echo [OK] Node.js is already installed!
)

echo.
call node -v
call npm -v

echo.
echo ========================================
echo Installing Backend Dependencies...
echo ========================================
cd /d "%~dp0backend"
if not exist "node_modules" (
    call npm install
)

echo.
echo ========================================
echo Installing Frontend Dependencies and Building...
echo ========================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
)

:: Rebuild the static site so the backend can serve it cleanly
echo [INFO] Building Frontend static files...
call npm run build

echo.
echo ========================================
echo Starting Backend Server...
echo ========================================
cd /d "%~dp0backend"

:: Wait 3 seconds to ensure port releases if previously opened
timeout /t 3 /nobreak >nul

echo [OK] Starting Server. Please view http://localhost:8080 in your browser.
start http://localhost:8080

:: Start the backend!
call node server.js

pause
