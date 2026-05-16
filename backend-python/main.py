from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from config.risk_profiles import PROFILES
from core.risk_manager import RiskManager
from brokerage.bybit_client import BybitClient
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

bybit = BybitClient(testnet=True)
risk_manager = None

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "testnet": bybit.testnet})

@app.route("/api/profiles")
def get_profiles():
    return jsonify({k: {"name": v.name} for k, v in PROFILES.items()})

@app.route("/api/risk/init", methods=["POST"])
def init_risk():
    global risk_manager
    data = request.json
    profile = PROFILES.get(data.get("profile", "moderate"))
    risk_manager = RiskManager(profile)
    risk_manager.init_capital(float(data.get("capital", 25000)))
    return jsonify({"message": "Risk Manager avviato"})

@app.route("/api/trade/execute", methods=["POST"])
def execute_trade():
    if not risk_manager:
        return jsonify({"error": "Non inizializzato"}), 400
    can_trade, reason = risk_manager.check_circuit_breakers()
    if not can_trade:
        return jsonify({"blocked": True, "reason": reason}), 403
    data = request.json
    result = bybit.place_order(**data)
    return jsonify(result)

@app.route("/api/account/balance")
def get_balance():
    return jsonify(bybit.get_balance())

@app.route('/')
def home():
    return "Trading Pro Ultimate - Backend Online! 🚀"

if __name__ == "__main__":
    print("🚀 TRADING PRO ULTIMATE - BACKEND AVVIATO")
    print("🌐 Server: http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
