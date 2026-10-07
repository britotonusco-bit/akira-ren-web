@echo off
cd /d "%~dp0"
where code >nul 2>nul
if %errorlevel%==0 (
  code .
) else (
  echo No se encontro el comando code. Abre Visual Studio Code y usa Archivo ^> Abrir carpeta.
  pause
)
