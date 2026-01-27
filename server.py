from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # HTML 파일이 파이썬 서버에 접근할 수 있게 허용합니다.

FILE_PATH = 'storage.json'

# 1. 저장된 데이터 불러오기
@app.route('/api/load', methods=['GET'])
def load_data():
    if not os.path.exists(FILE_PATH):
        return jsonify({"start": {"note": "체스 연구 시작"}})
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

# 2. 데이터 저장하기 (파일 덮어쓰기)
@app.route('/api/save', methods=['POST'])
def save_data():
    data = request.json
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return jsonify({"status": "success"})

if __name__ == '__main__':
    print("🚀 체스 저장 서버가 5000번 포트에서 시작되었습니다!")
    app.run(port=5000)