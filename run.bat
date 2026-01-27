@echo off

if exist .venv (
    call .venv\Scripts\activate
)


pip install -r requirements.txt

start /b python server.py

timeout /t 2 /nobreak > nul


start http://localhost:5000

exit