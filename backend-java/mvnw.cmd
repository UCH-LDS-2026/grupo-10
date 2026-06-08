@echo off
setlocal

set "MVN_EXE=C:\Users\santi\.m2\wrapper\dists\apache-maven-3.9.11\03d7e36a140982eea48e22c1dcac01d8862b2550b2939e09a0809bbc5182a5bc\bin\mvn.cmd"

if not exist "%MVN_EXE%" (
    echo ERROR - No se encontro Maven en la ruta esperada.
    echo Ruta buscada: %MVN_EXE%
    pause
    exit /b 1
)

:run
"%MVN_EXE%" %*
