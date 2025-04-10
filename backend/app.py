from flask import Flask, request, jsonify, send_from_directory
from parser import handle_package
from collections import Counter
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
received_data = []

@app.route('/receive', methods=['GET'])
def receive():
    data = request.get_json()
    handle_package(data)
    received_data.append({
        'lat': data['lat'],
        'lon': data['lon'],
        'suspicious': data['suspicious'] == 1.0,
        'country': data['country']
    })
    return "OK", 200

@app.route('/data')
def data():
    return jsonify(received_data[-50:])

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('../frontend', path)

@app.route('/top_countries')
def top_countries():
    counts = Counter([d['country'] for d in received_data])
    return jsonify(counts.most_common(5))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
