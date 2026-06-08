@echo off
setlocal

set "MVN_EXE=%~dp0apache-maven-3.9.6\bin\mvn.cmd"

if not exist "%MVN_EXE%" (
    echo ERROR - No se encontro Maven en la ruta esperada.
    echo Ruta buscada: %MVN_EXE%
    pause
    exit /b 1
)

:run
"%MVN_EXE%" %*
