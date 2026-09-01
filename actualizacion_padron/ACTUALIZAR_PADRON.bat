@echo off
cd /d "%~dp0"
py ACTUALIZAR_PADRON.py
if errorlevel 1 python ACTUALIZAR_PADRON.py
