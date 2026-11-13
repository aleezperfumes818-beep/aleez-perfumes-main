@echo off
title Rojo Server
cd /d "%~dp0"
echo Starting Rojo Server in %CD% on port 34872...
rojo.exe serve
pause
