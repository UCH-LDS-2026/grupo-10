@echo off
setlocal

@REM ============================================================
@REM Maven Wrapper - Portable
@REM Busca Maven en el PATH o en ubicaciones comunes
@REM ============================================================

@REM 1. Verificar si mvn esta en el PATH del sistema
where mvn.cmd >nul 2>&1
if %ERRORLEVEL% == 0 (
    mvn.cmd %*
    goto end
)

where mvn >nul 2>&1
if %ERRORLEVEL% == 0 (
    mvn %*
    goto end
)

@REM 2. Buscar en ubicaciones comunes de instalacion
if exist "%ProgramFiles%\Apache Maven\bin\mvn.cmd" (
    "%ProgramFiles%\Apache Maven\bin\mvn.cmd" %*
    goto end
)

if exist "%ProgramFiles%\Maven\bin\mvn.cmd" (
    "%ProgramFiles%\Maven\bin\mvn.cmd" %*
    goto end
)

if exist "%ProgramFiles%\Apache NetBeans\java\maven\bin\mvn.cmd" (
    "%ProgramFiles%\Apache NetBeans\java\maven\bin\mvn.cmd" %*
    goto end
)

if exist "%ProgramFiles%\NetBeans-25\netbeans\java\maven\bin\mvn.cmd" (
    "%ProgramFiles%\NetBeans-25\netbeans\java\maven\bin\mvn.cmd" %*
    goto end
)

if exist "%ProgramFiles(x86)%\Apache Maven\bin\mvn.cmd" (
    "%ProgramFiles(x86)%\Apache Maven\bin\mvn.cmd" %*
    goto end
)

if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6\bin\mvn.cmd" (
    "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6\bin\mvn.cmd" %*
    goto end
)

if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9\bin\mvn.cmd" (
    "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9\bin\mvn.cmd" %*
    goto end
)

if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.11\bin\mvn.cmd" (
    "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.11\bin\mvn.cmd" %*
    goto end
)

@REM 3. Intentar descargar Maven automaticamente
echo Maven no encontrado. Intentando descargar Maven 3.9.6...
set MAVEN_ZIP=%TEMP%\apache-maven-3.9.6-bin.zip
set MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6

powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile '%MAVEN_ZIP%' -UseBasicParsing"
if %ERRORLEVEL% NEQ 0 goto downloadError

powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIR%' -Force"
del "%MAVEN_ZIP%" >nul 2>&1

if exist "%MAVEN_DIR%\apache-maven-3.9.6\bin\mvn.cmd" (
    "%MAVEN_DIR%\apache-maven-3.9.6\bin\mvn.cmd" %*
    goto end
)

:downloadError
echo.
echo ERROR: Maven no encontrado ni descargado.
echo Por favor instala Maven desde: https://maven.apache.org/download.cgi
echo O con IntelliJ / NetBeans / Eclipse (incluyen Maven).
echo.
exit /b 1

:end
endlocal
