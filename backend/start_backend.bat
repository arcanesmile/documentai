@echo off
cd /d C:\Users\DTG\codes\real\realAI\backend
start /B /MIN "" venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000