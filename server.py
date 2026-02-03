from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 메인 페이지 (index.html) 서빙
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# CSS 파일 서빙
@app.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('css', filename)

# 자바스크립트 파일 서빙
@app.route('/js/<path:filename>')
def send_js(filename):
    return send_from_directory('js', filename)

if __name__ == '__main__':
    print("체스 웹 서비스가 5000번 포트에서 시작되었습니다.")
    print("브라우저에서 http://localhost:5000 접속 후, 데이터는 iwinv 서버에 저장됩니다.")
    app.run(port=5000)