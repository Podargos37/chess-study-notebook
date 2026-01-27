from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

FILE_PATH = 'storage.json'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def send_js(filename):
    return send_from_directory('js', filename)

@app.route('/api/load', methods=['GET'])
def load_data():
    if not os.path.exists(FILE_PATH):
        return jsonify({"start": {"note": "체스 연구 시작"}})
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))


@app.route('/api/save', methods=['POST'])
def save_data():
    data = request.json
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return jsonify({"status": "success"})

if __name__ == '__main__':
    print("체스 저장 서버가 5000번 포트에서 시작되었습니다")
    app.run(port=5000)