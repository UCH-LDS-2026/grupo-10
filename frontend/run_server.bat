@echo off
echo ===================================================
echo   ITERA - NOTA IMPORTANTE
echo ===================================================
echo.
echo   Este servidor ya NO se usa por separado.
echo   El backend FastAPI sirve el frontend automaticamente.
echo.
echo   Ejecuta en su lugar:  backend\run_backend.bat
echo.
echo   Redirigiendo al backend...
echo ===================================================
echo.

cd /d "%~dp0..\backend"
call run_backend.bat
