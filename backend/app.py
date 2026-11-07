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
    try:
        data = request.get_json(silent=True) or {}
        investor_slug = data.get('slug', 'buffett')
        message = data.get('message', '')
        symbol = data.get('symbol', 'BTCUSDT')
        try:
            quote = market_data.get_ticker_quote(symbol)
        except Exception:
            quote = None
        reply = skills_engine.generate_investor_chat_reply(investor_slug, message, symbol, quote)
        return jsonify({'reply': reply, 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        default_reply = f"Analisi strategica per {symbol}: il modello di investimento suggerisce prudenza, rigoroso controllo del rischio e Margine di Sicurezza."
        return jsonify({'reply': default_reply, 'timestamp': datetime.now().isoformat()})

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

# ==========================================
# CASARIO QUANTITATIVE TOP-DOWN ENGINE APIS
# ==========================================
from casario_quant_service import casario_quant_service

@app.route('/api/quant/casario/macro-regime', methods=['GET'])
def get_casario_macro():
    return jsonify(casario_quant_service.get_macro_regime_summary())

@app.route('/api/quant/casario/evaluate/<symbol>', methods=['GET'])
def evaluate_casario_symbol(symbol):
    return jsonify(casario_quant_service.evaluate_symbol(symbol))

@app.route('/api/quant/casario/screener', methods=['GET'])
def get_casario_screener():
    tf = request.args.get('timeframe', '15m')
    risk = request.args.get('risk', 'moderate')
    return jsonify(casario_quant_service.rank_universe(tf, risk))

@app.route('/api/quant/casario/order-proposal', methods=['POST'])
def create_casario_proposal():
    data = request.json or {}
    sym = data.get('symbol', 'BTCUSDT')
    side = data.get('side', 'LONG')
    tf = data.get('timeframe', '15m')
    return jsonify(casario_quant_service.create_order_proposal(sym, side, tf))

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

# ==========================================
# REPORT & SUBSCRIBER ENDPOINTS
# ==========================================
SUBSCRIBERS_FILE = os.path.join(BASE_DIR, 'subscribers.json')

def load_subscribers():
    if os.path.exists(SUBSCRIBERS_FILE):
        try:
            import json
            with open(SUBSCRIBERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_subscribers(subs):
    try:
        import json
        with open(SUBSCRIBERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(subs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("[!] Error saving subscribers:", e)

@app.route('/api/subscribe', methods=['POST'])
def handle_subscribe():
    data = request.json or {}
    email = data.get('email', '').strip()
    if not email:
        return jsonify({'error': 'Email required'}), 400
    
    subs = load_subscribers()
    existing = next((s for s in subs if s.get('email') == email), None)
    if existing:
        existing.update(data)
    else:
        subs.append(data)
    save_subscribers(subs)
    
    try:
        settings = get_settings()
        broker = BrokerageClient(settings)
        name = data.get('name', 'N/D')
        phone = data.get('phone', 'N/D')
        broker.send_telegram_alert(f"Nuovo Iscritto TRADING PRO ULTIMATE - Nome: {name} - Email: {email} - Tel: {phone}")
    except Exception:
        pass
        
    return jsonify({
        'status': 'success',
        'message': 'Iscrizione completata con successo! Notifiche attive.',
        'subscriber': data,
        'copyright': 'TRADING PRO ULTIMATE (c) by cuordivino'
    })

@app.route('/api/subscribers', methods=['GET'])
def get_subscribers():
    return jsonify(load_subscribers())

@app.route('/api/send-report-email', methods=['POST'])
def handle_send_report_email():
    data = request.json or {}
    email = data.get('email', '').strip()
    report_title = data.get('reportTitle', 'Report Istituzionale TRADING PRO ULTIMATE')
    cert_id = data.get('certId', 'TPU-CERT-LIVE')
    name = data.get('name', 'Gentile Investitore')
    
    if not email:
        return jsonify({'error': 'Email required'}), 400
        
    print(f"[*] Sending report email: '{report_title}' to {email} ({name}) - Cert: {cert_id}")
    
    return jsonify({
        'status': 'success',
        'recipient': email,
        'report': report_title,
        'certId': cert_id,
        'thanks': f"Gentile {name}, ti ringraziamo per la fiducia in TRADING PRO ULTIMATE.",
        'copyright': 'TRADING PRO ULTIMATE (c) by cuordivino - Tutti i diritti riservati.'
    })




# =========================================================================
# MARKET QUANTUM CO-PILOT - COMMERCIAL MULTI-AGENT QUANT ENGINE API
# (c) TRADING PRO ULTIMATE by cuordivino - Tutti i diritti riservati
# =========================================================================
try:
    from backend.market_quantum_service import QuantumServiceInstance
except Exception as e:
    print("[!] Warning: Could not import QuantumServiceInstance:", e)
    QuantumServiceInstance = None

@app.route('/api/quantum-copilot/overview', methods=['GET'])
def get_quantum_overview():
    if not QuantumServiceInstance:
        return jsonify({'error': 'Market Quantum Service not initialized'}), 500
    try:
        overview = QuantumServiceInstance.get_service_overview()
        return jsonify(overview)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum-copilot/evaluate', methods=['POST'])
def evaluate_quantum_asset():
    if not QuantumServiceInstance:
        return jsonify({'error': 'Market Quantum Service not initialized'}), 500
    try:
        data = request.json or {}
        symbol = data.get('symbol', 'BTCUSDT')
        live_quote = data.get('quote', None)
        result = QuantumServiceInstance.evaluate_live_asset(symbol, live_quote)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum-copilot/history/<category>', methods=['GET'])
def get_quantum_history(category):
    if not QuantumServiceInstance:
        return jsonify({'error': 'Market Quantum Service not initialized'}), 500
    try:
        records = QuantumServiceInstance.get_category_history(category)
        return jsonify({'category': category, 'count': len(records), 'records': records})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum-copilot/monte-carlo', methods=['POST'])
def run_quantum_monte_carlo():
    try:
        from backend.market_quantum.core.monte_carlo_simulator import MonteCarloSimulator
        data = request.json or {}
        entry = float(data.get('entry', 100.0))
        stop = float(data.get('stop', 98.0))
        target = float(data.get('target', 106.0))
        win_rate = float(data.get('win_rate', 0.58))
        res = MonteCarloSimulator.run_simulation(entry, stop, target, win_rate)
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum-copilot/volume-profile', methods=['POST'])
def calculate_quantum_volume_profile():
    try:
        from backend.market_quantum.core.volume_profile_engine import VolumeProfileEngine
        data = request.json or {}
        trades = data.get('trades', [])
        num_bins = int(data.get('num_bins', 40))
        if not trades:
            base_p = float(data.get('base_price', 100.0))
            import random
            trades = [{"price": base_p + (random.random() - 0.48) * (base_p * 0.02), "volume": random.uniform(10, 500)} for _ in range(30)]
        res = VolumeProfileEngine.calculate_profile(trades, num_bins)
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum-copilot/anti-panic/calculate-size', methods=['POST'])
def calculate_quantum_size():
    if not QuantumServiceInstance:
        return jsonify({'error': 'Market Quantum Service not initialized'}), 500
    try:
        data = request.json or {}
        entry = float(data.get('entry', 100.0))
        stop = float(data.get('stop', 98.0))
        res = QuantumServiceInstance.guard.calculate_position(entry, stop)
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting Trading Pro Ultimate + InvestorSkills AI on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
