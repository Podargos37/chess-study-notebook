@echo off
echo JM Chess Book을 실행하는 중...

if exist .venv (
    call .venv\Scripts\activate
)

echo checking lab
pip install flask flask-cors

start /b python server.py

timeout /t 2 /nobreak > nul

start index.html

exit