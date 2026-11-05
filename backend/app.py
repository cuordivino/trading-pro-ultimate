import os
import sys
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime

# Local imports
from database import (
    init_db, get_trades, add_trade, close_trade, delete_trade,
    get_alerts, add_alert, delete_alert, get_settings, update_settings
)
import market_data
import skills_engine
from risk_manager import risk_manager, PROFILES
from brokerage import BrokerageClient

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
frontend_candidate = os.path.join(BASE_DIR, '..', 'frontend')
FRONTEND_DIR = os.path.abspath(frontend_candidate if os.path.exists(frontend_candidate) else os.path.join(BASE_DIR, '..'))

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

# ==========================================
# STATIC FRONTEND ROUTES
# ==========================================
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

# ==========================================
# SYSTEM & HEALTH
# ==========================================
@app.route('/api/health')
def health():
    skills = skills_engine.load_all_skills()
    return jsonify({
        'status': 'online',
        'version': '2.0.0-pro-investor',
        'skills_loaded': len(skills),
        'timestamp': datetime.now().isoformat()
    })

# ==========================================
# MARKET DATA ENDPOINTS
# ==========================================
@app.route('/api/quote/<symbol>')
@app.route('/api/market/ticker')
def get_quote(symbol=None):
    if not symbol:
        symbol = request.args.get('symbol', 'BTCUSDT')
    quote = market_data.get_ticker_quote(symbol)
    return jsonify(quote)

@app.route('/api/kline/<symbol>')
@app.route('/api/market/candles')
def get_klines(symbol=None):
    if not symbol:
        symbol = request.args.get('symbol', 'BTCUSDT')
    interval = request.args.get('interval', '15m')
    limit = int(request.args.get('limit', 180))
    candles = market_data.get_klines(symbol, interval=interval, limit=limit)
    return jsonify(candles)

@app.route('/api/symbols/search/<query>')
def search_symbols(query):
    results = market_data.search_symbols(query)
    return jsonify(results)

@app.route('/api/symbols/curated')
def get_curated_symbols():
    symbols = [
        {'symbol': 'BTCUSDT', 'name': 'Bitcoin', 'cat': 'crypto'},
        {'symbol': 'ETHUSDT', 'name': 'Ethereum', 'cat': 'crypto'},
        {'symbol': 'SOLUSDT', 'name': 'Solana', 'cat': 'crypto'},
        {'symbol': 'NVDA', 'name': 'NVIDIA', 'cat': 'us_stock'},
        {'symbol': 'AAPL', 'name': 'Apple', 'cat': 'us_stock'},
        {'symbol': 'TSLA', 'name': 'Tesla', 'cat': 'us_stock'},
        {'symbol': 'MSFT', 'name': 'Microsoft', 'cat': 'us_stock'},
        {'symbol': 'ENEL.MI', 'name': 'Enel', 'cat': 'eu_stock'},
        {'symbol': 'ENI.MI', 'name': 'Eni', 'cat': 'eu_stock'},
        {'symbol': 'ISP.MI', 'name': 'Intesa Sanpaolo', 'cat': 'eu_stock'},
        {'symbol': 'RACE.MI', 'name': 'Ferrari', 'cat': 'eu_stock'},
        {'symbol': 'SPY', 'name': 'S&P 500 ETF', 'cat': 'etf'}
    ]
    return jsonify(symbols)

# ==========================================
# INVESTOR SKILLS ENGINE
# ==========================================
@app.route('/api/skills')
def list_skills():
    skills = skills_engine.load_all_skills()
    # Return light metadata for catalog
    catalog = []
    for s in skills.values():
        catalog.append({
            'slug': s['slug'],
            'name': s['name'],
            'investor': s['investor'],
            'style': s['style'],
            'category': s['category'],
            'timeHorizon': s['timeHorizon'],
            'description': s['description'],
            'has_invest': s['has_invest']
        })
    return jsonify(catalog)

@app.route('/api/skills/<slug>')
def get_skill(slug):
    skill = skills_engine.get_skill_details(slug)
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
    return jsonify(skill)

@app.route('/api/skills/consensus/<symbol>')
def run_consensus(symbol):
    interval = request.args.get('interval', '15m')
    quote = market_data.get_ticker_quote(symbol)
    candles = market_data.get_klines(symbol, interval=interval, limit=120)
    result = skills_engine.run_investor_committee(symbol, quote, candles)
    return jsonify(result)

@app.route('/api/skills/chat', methods=['POST'])
def chat_persona():
    data = request.json or {}
    investor_slug = data.get('slug', 'buffett')
    message = data.get('message', '')
    symbol = data.get('symbol', 'BTCUSDT')
    quote = market_data.get_ticker_quote(symbol)
    reply = skills_engine.generate_investor_chat_reply(investor_slug, message, symbol, quote)
    return jsonify({'reply': reply, 'timestamp': datetime.now().isoformat()})

# ==========================================
# RISK MANAGEMENT & POSITION SIZER
# ==========================================
@app.route('/api/calculate-position', methods=['POST'])
def calc_position():
    data = request.json or {}
    capital = float(data.get('capital', 25000))
    entry = float(data.get('entry', 0))
    sl = float(data.get('sl', 0))
    tp = float(data.get('tp', 0)) if data.get('tp') else None
    risk_pct = float(data.get('risk_pct', 1.5))
    leverage = int(data.get('leverage', 1))
    mode = data.get('mode', 'standard')
    atr = float(data.get('atr', 0)) if data.get('atr') else None

    res = risk_manager.calculate_position(
        capital=capital, entry=entry, sl=sl, tp=tp,
        risk_pct=risk_pct, leverage=leverage, mode=mode, atr=atr
    )
    return jsonify(res)

@app.route('/api/risk/status')
def risk_status():
    ok, msg = risk_manager.check_circuit_breakers()
    return jsonify({
        'circuit_breaker_ok': ok,
        'status_message': msg,
        'profile': risk_manager.profile.name,
        'daily_pnl_pct': risk_manager.daily_pnl_pct,
        'consecutive_losses': risk_manager.consecutive_losses
    })

# ==========================================
# TRADES & JOURNAL
# ==========================================
@app.route('/api/trades', methods=['GET', 'POST'])
def handle_trades():
    if request.method == 'POST':
        trade_data = request.json or {}
        trade_id = add_trade(trade_data)
        
        # Check if telegram alert should be dispatched
        settings = get_settings()
        broker = BrokerageClient(settings)
        symbol = trade_data.get('symbol')
        side = trade_data.get('side')
        entry = trade_data.get('entry_price')
        skill = trade_data.get('investor_skill', 'Discretionary')
        msg = (
            f"⚡ *TRADING PRO ULTIMATE™* (© cuordivino)\n"
            f"🚀 *NUOVA POSIZIONE APERTA*\n\n"
            f"• *Asset:* #{symbol}\n"
            f"• *Direzione:* {side}\n"
            f"• *Prezzo Entry:* ${entry}\n"
            f"• *Stop Loss:* ${trade_data.get('stop_loss', 'N/A')}\n"
            f"• *Take Profit:* ${trade_data.get('take_profit', 'N/A')}\n"
            f"• *Strategia / Mentor:* {skill}\n"
            f"• *Rischio:* {trade_data.get('risk_usd', '$0.00')}\n\n"
            f"🤖 *Motori Quant:* Freqtrade, Hummingbot, Nautilus, OpenBB Online\n"
            f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC"
        )
        broker.send_telegram_alert(msg)

        return jsonify({'id': trade_id, 'status': 'created'})
    
    trades = get_trades()
    return jsonify(trades)

@app.route('/api/trades/<int:trade_id>/close', methods=['POST'])
def handle_close_trade(trade_id):
    data = request.json or {}
    exit_price = float(data.get('exit_price', 0))
    pnl = float(data.get('pnl', 0))
    close_trade(trade_id, exit_price, pnl)

    # Update risk manager stats
    if pnl < 0:
        risk_manager.consecutive_losses += 1
    else:
        risk_manager.consecutive_losses = 0

    return jsonify({'status': 'closed', 'id': trade_id})

@app.route('/api/trades/<int:trade_id>', methods=['DELETE'])
def handle_delete_trade(trade_id):
    delete_trade(trade_id)
    return jsonify({'status': 'deleted', 'id': trade_id})

# ==========================================
# ALERTS
# ==========================================
@app.route('/api/alerts', methods=['GET', 'POST'])
def handle_alerts():
    if request.method == 'POST':
        data = request.json or {}
        alert_id = add_alert(data)
        return jsonify({'id': alert_id, 'status': 'created'})
    
    alerts = get_alerts()
    return jsonify(alerts)

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def handle_delete_alert(alert_id):
    delete_alert(alert_id)
    return jsonify({'status': 'deleted', 'id': alert_id})

# ==========================================
# BROKER & SETTINGS
# ==========================================
@app.route('/api/broker/balance')
def broker_balance():
    settings = get_settings()
    broker = BrokerageClient(settings)
    return jsonify(broker.get_bybit_balance())

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'POST':
        data = request.json or {}
        update_settings(data)
        if 'risk_profile' in data and data['risk_profile'] in PROFILES:
            risk_manager.profile = PROFILES[data['risk_profile']]
        return jsonify({'status': 'updated'})
    
    return jsonify(get_settings())

@app.route('/api/telegram/test', methods=['POST'])
def test_telegram():
    settings = get_settings()
    broker = BrokerageClient(settings)
    ok = broker.send_telegram_alert("🔔 *Trading Pro Ultimate™ by cuordivino*: Notifica di test riuscita!")
    return jsonify({'success': ok})

@app.route('/api/telegram/send', methods=['POST'])
def send_telegram():
    data = request.json or {}
    msg = data.get('message', '')
    if not msg:
        return jsonify({'error': 'No message provided'}), 400
    settings = get_settings()
    broker = BrokerageClient(settings)
    ok = broker.send_telegram_alert(msg)
    return jsonify({'success': ok})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting Trading Pro Ultimate + InvestorSkills AI on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
