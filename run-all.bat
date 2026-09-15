@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo Teacher Schedule - Full Stack + Public Link
echo ========================================
echo.
echo Starting backend...
start "Teacher Schedule Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting frontend...
start "Teacher Schedule Frontend" cmd /k "cd /d "%~dp0" && npm run dev -- --host 0.0.0.0"

timeout /t 3 /nobreak >nul

echo.
echo Starting Cloudflare Tunnel...
echo A public HTTPS link will appear below.
echo Share the https://....trycloudflare.com link with others.
echo.
cloudflared tunnel --url http://localhost:5173
