from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json(rel_path):
    full_path = os.path.join(BASE_DIR, rel_path)
    with open(full_path, encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/estruturas")
def api_estruturas():
    return jsonify(load_json("static/data/estruturas.json"))

@app.route("/api/questoes")
def api_questoes():
    return jsonify(load_json("static/data/questoes.json"))

@app.route("/api/casos")
def api_casos():
    return jsonify(load_json("static/data/casos.json"))

if __name__ == "__main__":
    app.run(debug=True)