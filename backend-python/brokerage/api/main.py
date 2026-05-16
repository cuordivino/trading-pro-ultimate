from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from config.risk_profiles import PROFILES
from core.risk_manager import RiskManager
from brokerage.bybit_client import BybitClient
import os

# Carica variabili da .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permetti chiamate dal frontend

# Inizializza client Bybit
testnet_mode = os.getenv("BYBIT_TESTNET", "true").lower() == "true"
bybit = BybitClient(testnet=testnet_mode)

# Risk Manager (inizializzato dopo la chiamata API)
risk_manager = None

@app.route("/api/health")
def health():
    """Verifica che il server sia attivo"""
    return jsonify({
        "status": "ok", 
        "testnet": bybit.testnet,
        "message": "Trading Pro Backend Active"
    })

@app.route("/api/profiles")
def get_profiles():
    """Restituisce tutti i profili di rischio disponibili"""
    return jsonify({
        key: {
            "name": profile.name,
            "leverage": profile.leverage,
            "stake_pct": profile.stake_amount_pct,
            "stop_loss": profile.stop_loss,
            "take_profit": profile.take_profit,
            "max_drawdown": profile.max_drawdown_stop,
            "timeframe": profile.timeframe,
            "expected_daily": profile.expected_daily_return
        }
        for key, profile in PROFILES.items()
    })

@app.route("/api/risk/init", methods=["POST"])
def init_risk():
    """Inizializza il Risk Manager con il profilo scelto"""
    global risk_manager
    data = request.json
    profile_key = data.get("profile", "moderate")
    capital = float(data.get("capital", 25000))
    
    if profile_key not in PROFILES:
        return jsonify({"error": "Profilo non valido"}), 400
    
    profile = PROFILES[profile_key]
    risk_manager = RiskManager(profile)
    risk_manager.init_capital(capital)
    
    return jsonify({
        "message": f"Risk Manager avviato: {profile.name}",
        "testnet": bybit.testnet,
        "profile": profile_key,
        "capital": capital
    })

@app.route("/api/trade/execute", methods=["POST"])
def execute_trade():
    """Esegui un ordine con controlli di rischio"""
    global risk_manager
    
    if not risk_manager:
        return jsonify({"error": "Risk Manager non inizializzato. Chiama /api/risk/init prima."}), 400
    
    # Controlla circuit breaker
    can_trade, reason = risk_manager.check_circuit_breakers()
    if not can_trade:
        return jsonify({"blocked": True, "reason": reason}), 403
    
    data = request.json
    symbol = data.get("symbol", "BTCUSDT")
    side = data.get("side", "Buy")  # Buy o Sell
    qty = float(data.get("qty", 0.001))
    price = data.get("price")  # None = Market order
    sl = data.get("sl")  # Stop Loss
    tp = data.get("tp")  # Take Profit
    
    try:
        result = bybit.place_order(
            symbol=symbol,
            side=side,
            qty=qty,
            price=price,
            sl=sl,
            tp=tp
        )
        
        # Aggiorna metriche se l'ordine è andato a buon fine
        if "error" not in result:
            return jsonify({
                "success": True,
                "order": result.get("result", {}),
                "message": f"Ordine {side} {symbol} eseguito"
            })
        else:
            return jsonify({"error": result["error"]}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/account/balance")
def get_balance():
    """Ottieni saldo account Bybit"""
    return jsonify(bybit.get_balance())

@app.route("/api/account/positions")
def get_positions():
    """Ottieni posizioni aperte"""
    return jsonify(bybit.get_positions())

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    
    print("=" * 60)
    print("🚀 TRADING PRO ULTIMATE - BACKEND AVVIATO")
    print("=" * 60)
    print(f"🌐 Server: http://{host}:{port}")
    print(f"🔌 Testnet: {bybit.testnet}")
    print(f"📊 Profilo default: MODERATO")
    print("=" * 60)
    print("Endpoints disponibili:")
    print("  GET  /api/health")
    print("  GET  /api/profiles")
    print("  POST /api/risk/init")
    print("  POST /api/trade/execute")
    print("  GET  /api/account/balance")
    print("=" * 60)
    
    app.run(host=host, port=port, debug=False)
