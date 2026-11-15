@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 goto failed

where uv >nul 2>nul
if errorlevel 1 goto missing_uv
where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>nul
if errorlevel 1 goto missing_node

node -e "const [m,n]=process.versions.node.split('.').map(Number); if (!((m===20 && n>=19) || (m===22 && n>=12) || m>22)) { console.error('Node.js 20.19+ on v20, or 22.12+, is required.'); process.exit(1); }"
if errorlevel 1 goto failed
node -e "const net=require('node:net'); async function check(){ for(const port of [8000,5173]){ await new Promise((resolve,reject)=>{ const s=net.createServer(); s.once('error',e=>{ console.error('Cannot use port '+port+': '+e.message); console.error('Stop the service using that port, then run launch.bat again.'); reject(e); }); s.listen(port,'127.0.0.1',()=>s.close(resolve)); }); }} check().catch(()=>{process.exitCode=1;});"
if errorlevel 1 goto failed

echo.
echo Installing backend dependencies with your existing uv installation...
cd /d "%~dp0backend"
uv sync --frozen --no-dev
if errorlevel 1 goto failed

echo.
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm.cmd ci --include=dev --no-audit --no-fund
if errorlevel 1 goto failed

start "MeteoPark Backend" /D "%~dp0backend" "%ComSpec%" /d /k "uv run --frozen --no-dev uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
if errorlevel 1 goto failed
start "MeteoPark Frontend" /D "%~dp0frontend" "%ComSpec%" /d /k "npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort"
if errorlevel 1 goto failed

echo.
echo Open http://localhost:5173 once Vite reports that it is ready.
echo Keep both server windows open while using MeteoPark.
echo To stop, press Ctrl+C in EACH server window, or close both windows.
echo Press any key to close this launcher window. The servers will keep running.
pause >nul
exit /b 0

:missing_uv
echo uv was not found. Install uv, reopen this terminal, and try again.
goto failed

:missing_node
echo Node.js and npm were not found. Install Node.js 24, reopen this terminal, and try again.
goto failed

:failed
echo.
echo MeteoPark could not finish starting. Check the error above.
echo If a server window opened, close it before retrying.
pause
exit /b 1
