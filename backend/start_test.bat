@echo off
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
set TRANSFORMERS_CACHE=C:\Users\DTG\codes\real\realAI\backend\model_cache
set SENTENCE_TRANSFORMERS_HOME=C:\Users\DTG\codes\real\realAI\backend\model_cache
cd /d C:\Users\DTG\codes\real\realAI\backend
start /B pythonw -m uvicorn app.main:app --host 0.0.0.0 --port 8001 > server.log 2>&1
echo Server starting on port 8001...
timeout /t 8 > nul
curl -s --connect-timeout 3 http://localhost:8001/
