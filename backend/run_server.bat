@echo off
cd /d C:\Users\DTG\codes\real\realAI\backend
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
set TRANSFORMERS_CACHE=%cd%\model_cache
set SENTENCE_TRANSFORMERS_HOME=%cd%\model_cache
start /B venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > server_output.log 2>&1
echo Server PID: %ERRORLEVEL%
