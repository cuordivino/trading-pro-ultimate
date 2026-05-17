from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import hashlib
import hmac
import time
import os
from datetime import datetime

app = Flask(__name__)  # CORRETTO: __name__
CORS(app)

# === CONFIGURAZIONE BROKER ===
BYBIT_API_KEY = os.environ.get('BYBIT_API_KEY', '')
BYBIT_API_SECRET = os.environ.get('BYBIT_API_SECRET', '')
ALPACA_API_KEY = os.environ.get('ALPACA_API_KEY', '')
ALPACA_API_SECRET = os.environ.get('ALPACA_API_SECRET', '')
ALPHA_VANTAGE_KEY = os.environ.get('ALPHA_VANTAGE_KEY', '')

# Testnet o Live
BYBIT_TESTNET = os.environ.get('BYBIT_TESTNET', 'true').lower() == 'true'
BYBIT_BASE_URL = 'https://api-testnet.bybit.com' if BYBIT_TESTNET else 'https://api.bybit.com'
ALPACA_BASE_URL = 'https://paper-api.alpaca.markets' if os.environ.get('ALPACA_PAPER', 'true').lower() == 'true' else 'https://api.alpaca.markets'

# === HELPER PER BYBIT ===
def sign_bybit_request(params, secret):
    param_str = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
    return hmac.new(secret.encode(), param_str.encode(), hashlib.sha256).hexdigest()

# === API ENDPOINTS ===

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'testnet': BYBIT_TESTNET})

@app.route('/api/market/<symbol>')
def get_market_data(symbol):
    """Ottieni dati di mercato REALI"""
    if ALPHA_VANTAGE_KEY:
        try:
            resp = requests.get(
                f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_KEY}'
            )
            data = resp.json()
            if 'Global Quote' in data:
                quote = data['Global Quote']
                return jsonify({
                    'symbol': symbol,
                    'price': float(quote.get('05. price', 0)),
                    'change': float(quote.get('10. change percent', '0%').replace('%', '')),
                    'high': float(quote.get('03. high', 0)),
                    'low': float(quote.get('04. low', 0)),
                    'volume': int(quote.get('06. volume', 0)),
                    'timestamp': datetime.now().isoformat()
                })
        except Exception as e:
            print(f"Alpha Vantage error: {e}")
    
    # Fallback: dati simulati se API non configurata
    return jsonify({
        'symbol': symbol,
        'price': 100.0,
        'change': 0.5,
        'high': 102.0,
        'low': 98.0,
        'volume': 1000000,
        'timestamp': datetime.now().isoformat(),
        'warning': 'Mock data - API not configured'
    })

# === CALCOLO POSITION SIZE (MOTORE DI CALCOLO) ===
@app.route('/api/calculate-position', methods=['POST'])
def calculate_position():
    data = request.json
    capitale = float(data.get('capitale', 25000))
    rischio_pct = float(data.get('rischio_pct', 1))
    entry = float(data.get('entry', 0))
    stop_loss = float(data.get('stop_loss', 0))
    take_profit = float(data.get('take_profit', 0))
    
    if not entry or not stop_loss:
        return jsonify({'error': 'Entry e Stop Loss sono obbligatori'}), 400
    
    rischio_euro = capitale * (rischio_pct / 100)
    distanza_sl = abs(entry - stop_loss)
    position_size = int(rischio_euro / distanza_sl) if distanza_sl > 0 else 0
    
    profitto_potenziale = position_size * abs(take_profit - entry) if take_profit else 0
    rr_ratio = abs(take_profit - entry) / distanza_sl if take_profit and distanza_sl > 0 else 0
    
    return jsonify({
        'position_size': position_size,
        'rischio_euro': round(rischio_euro, 2),
        'profitto_potenziale': round(profitto_potenziale, 2),
        'rr_ratio': round(rr_ratio, 2),
        'valore_posizione': round(position_size * entry, 2)
    })

@app.route('/api/bybit/place-order', methods=['POST'])
def bybit_place_order():
    if not BYBIT_API_KEY or not BYBIT_API_SECRET:
        return jsonify({'error': 'API keys not configured'}), 400
    data = request.json
    timestamp = int(time.time() * 1000)
    params = {
        'side': data.get('side', 'Buy'),
        'symbol': data.get('symbol', 'BTCUSDT'),
        'order_type': data.get('type', 'Market'),
        'qty': float(data.get('qty', 0.001)),
        'price': float(data.get('price', 0)) if data.get('type') == 'Limit' else 0,
        'time_in_force': 'GoodTillCancel',
        'timestamp': timestamp,
        'api_key': BYBIT_API_KEY,
        'recv_window': 5000
    }
    params['sign'] = sign_bybit_request(params, BYBIT_API_SECRET)
    try:
        resp = requests.post(f'{BYBIT_BASE_URL}/private/linear/order/create', data=params)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':  # CORRETTO: __name__
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
