from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import hashlib
import hmac
import time
import os
from datetime import datetime
import yfinance as yf
# CORRETTO: __name__
app = Flask(__name__)
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
    """Ottieni dati di mercato reali"""
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

# === MOTORE DI CALCOLO POSITION SIZE ===
@app.route('/api/calculate-position', methods=['POST'])
def calculate_position():
    data = request.json
    capitale = float(data.get('capitale', 25000))
    rischio_pct = float(data.get('rischio_pct', 1))
    entry = float(data.get('entry', 0))
    stop_loss = float(data.get('stop_loss', 0))
    take_profit = float(data.get('take_profit', 0))
    
    if not entry or not stop_loss:
        return jsonify({'error': 'Entry e Stop Loss obbligatori'}), 400
    
    rischio_euro = capitale * (rischio_pct / 100)
    distanza_sl = abs(entry - stop_loss)
    position_size = int(rischio_euro / distanza_sl) if distanza_sl > 0 else 0
    
    profitto = position_size * abs(take_profit - entry) if take_profit else 0
    rr = abs(take_profit - entry) / distanza_sl if take_profit and distanza_sl > 0 else 0
    
    return jsonify({
        'position_size': position_size,
        'rischio_euro': round(rischio_euro, 2),
        'profitto_potenziale': round(profitto, 2),
        'rr_ratio': round(rr, 2),
        'valore_posizione': round(position_size * entry, 2)
    })

@app.route('/api/bybit/ticker/<symbol>')
def bybit_ticker(symbol):
    try:
        resp = requests.get(f'{BYBIT_BASE_URL}/v2/public/tickers?symbol={symbol}')
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bybit/kline', methods=['GET'])
def bybit_kline():
    symbol = request.args.get('symbol', 'BTCUSDT')
    interval = request.args.get('interval', '15')
    try:
        resp = requests.get(
            f'{BYBIT_BASE_URL}/public/linear/kline',
            params={'symbol': symbol, 'interval': interval, 'limit': 100}
        )
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/api/bybit/balance')
def bybit_balance():
    if not BYBIT_API_KEY or not BYBIT_API_SECRET:
        return jsonify({'error': 'API keys not configured'}), 400
    
    timestamp = int(time.time() * 1000)
    params = {
        'api_key': BYBIT_API_KEY,
        'timestamp': timestamp,
        'recv_window': 5000
    }
    params['sign'] = sign_bybit_request(params, BYBIT_API_SECRET)
    
    try:
        resp = requests.get(f'{BYBIT_BASE_URL}/v2/private/wallet/balance', params=params)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alpaca/account')
def alpaca_account():
    if not ALPACA_API_KEY or not ALPACA_API_SECRET:
        return jsonify({'error': 'API keys not configured'}), 400
    
    headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET
    }
    
    try:
        resp = requests.get(f'{ALPACA_BASE_URL}/v2/account', headers=headers)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alpaca/positions')
def alpaca_positions():
    if not ALPACA_API_KEY or not ALPACA_API_SECRET:
        return jsonify({'error': 'API keys not configured'}), 400
    
    headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET
    }
    
    try:
        resp = requests.get(f'{ALPACA_BASE_URL}/v2/positions', headers=headers)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# === NUOVO ENDPOINT CON TWELVEDATA (Intraday Reale) ===
@app.route('/api/kline/<symbol>')
def get_kline_data(symbol):
    """Scarica lo storico delle candele (5 min) da TwelveData"""
    # LA TUA CHIAVE TWELVEDATA
    TWELVEDATA_KEY = '9f793095b1004638b251baa4013e667d'
    
    try:
        # Chiede 100 candele a 5 minuti
        url = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=5min&outputsize=100&apikey={TWELVEDATA_KEY}"
        
        resp = requests.get(url)
        data = resp.json()
        
        # Controlla errori
        if 'code' in data and data['code'] == 400:
            print(f"TwelveData Error: {data}")
            return jsonify({'error': data['message']}), 400
            
        if 'values' in data:
            candles = []
            # TwelveData dà dati dal più NUOVO al più VECCHIO
            # Il grafico vuole dal più VECCHIO al più NUOVO, quindi invertiamo
            for k in data['values'][::-1]: 
                candles.append({
                    'time': int(datetime.strptime(k['datetime'], '%Y-%m-%d %H:%M:%S').timestamp()),
                    'open': float(k['open']),
                    'high': float(k['high']),
                    'low': float(k['low']),
                    'close': float(k['close']),
                    'volume': float(k['volume'])
                })
            return jsonify(candles)
        else:
            return jsonify([])
            
    except Exception as e:
        print(f"TwelveData Exception: {e}")
        return jsonify({'error': str(e)}), 500
# CORRETTO: __name__ == '__main__'
# === GESTIONE SIMBOLI MULTI-EXCHANGE ===
# Cache per non sprecare crediti API
symbols_cache = {
    'italy': None,
    'nasdaq': None,
    'nyse': None,
    'bybit_crypto': None
}
cache_timestamps = {
    'italy': 0,
    'nasdaq': 0,
    'nyse': 0,
    'bybit_crypto': 0
}

TWELVEDATA_KEY = '9f793095b1004638b251baa4013e667d'

def download_symbols(exchange_name, exchange_code, instrument_type='Common Stock'):
    """Scarica simboli da TwelveData per un exchange specifico"""
    import time
    
    # Cache di 24 ore (86400 secondi)
    if symbols_cache[exchange_name] and (time.time() - cache_timestamps[exchange_name]) < 86400:
        return symbols_cache[exchange_name]
    
    try:
        url = f'https://api.twelvedata.com/symbols?exchange={exchange_code}&apikey={TWELVEDATA_KEY}'
        resp = requests.get(url)
        data = resp.json()
        
        if 'data' in data:
            symbols = [s for s in data['data'] if s['instrument_type'] == instrument_type]
            
            symbols_cache[exchange_name] = {
                'exchange': exchange_code,
                'count': len(symbols),
                'symbols': [
                    {
                        'symbol': s['symbol'],
                        'name': s['description'],
                        'currency': s['currency'],
                        'exchange': s['exchange'],
                        'type': 'stock'
                    }
                    for s in symbols
                ]
            }
            
            cache_timestamps[exchange_name] = time.time()
            print(f"Scaricati {len(symbols)} simboli da {exchange_code}")
            return symbols_cache[exchange_name]
        else:
            return {'error': f'Nessun dato da {exchange_code}'}
    except Exception as e:
        print(f"Error downloading {exchange_code}: {e}")
        return {'error': str(e)}


def download_bybit_crypto():
    """Scarica tutte le crypto da Bybit"""
    import time
    
    # Cache di 6 ore (21600 secondi)
    if symbols_cache['bybit_crypto'] and (time.time() - cache_timestamps['bybit_crypto']) < 21600:
        return symbols_cache['bybit_crypto']
    
    try:
        url = 'https://api.bybit.com/v5/market/tickers?category=spot'
        resp = requests.get(url)
        data = resp.json()
        
        if data['retCode'] == 0:
            crypto_list = data['result']['list']
            
            # Filtra solo USDT
            usdt_pairs = [c for c in crypto_list if c['quoteCoin'] == 'USDT']
            
            symbols_cache['bybit_crypto'] = {
                'exchange': 'BYBIT',
                'count': len(usdt_pairs),
                'symbols': [
                    {
                        'symbol': c['symbol'],
                        'name': f"{c['baseCoin']} / USDT",
                        'currency': 'USDT',
                        'exchange': 'Bybit',
                        'type': 'crypto',
                        'baseCoin': c['baseCoin'],
                        'quoteCoin': c['quoteCoin']
                    }
                    for c in usdt_pairs
                ]
            }
            
            cache_timestamps['bybit_crypto'] = time.time()
            print(f"Scaricate {len(usdt_pairs)} crypto da Bybit")
            return symbols_cache['bybit_crypto']
        else:
            return {'error': f'Bybit error: {data["retMsg"]}'}, 500
    except Exception as e:
        print(f"Error downloading Bybit crypto: {e}")
        return {'error': str(e)}, 500


# === ENDPOINT PER SCARICARE SIMBOLI ===

@app.route('/api/symbols/italy')
def get_italy_symbols():
    """Tutti i titoli della Borsa Italiana (MTA)"""
    return jsonify(download_symbols('italy', 'MTA'))


@app.route('/api/symbols/nasdaq')
def get_nasdaq_symbols():
    """Tutti i titoli NASDAQ (USA)"""
    return jsonify(download_symbols('nasdaq', 'NASDAQ'))


@app.route('/api/symbols/nyse')
def get_nyse_symbols():
    """Tutti i titoli NYSE (USA)"""
    return jsonify(download_symbols('nyse', 'NYSE'))


@app.route('/api/symbols/sp500')
def get_sp500_symbols():
    """S&P 500 - I 500 titoli più importanti USA"""
    nasdaq = download_symbols('nasdaq', 'NASDAQ')
    nyse = download_symbols('nyse', 'NYSE')
    
    if 'symbols' in nasdaq and 'symbols' in nyse:
        all_symbols = nasdaq['symbols'] + nyse['symbols']
        unique_symbols = {s['symbol']: s for s in all_symbols}
        
        return jsonify({
            'count': len(unique_symbols),
            'symbols': list(unique_symbols.values()),
            'note': 'NASDAQ + NYSE (include S&P 500)'
        })
    else:
        return jsonify({'error': 'Impossibile caricare simboli'})


@app.route('/api/symbols/bybit')
def get_bybit_crypto():
    """Tutte le crypto su Bybit (coppie USDT)"""
    result = download_bybit_crypto()
    if isinstance(result, tuple):
        return result
    return jsonify(result)
@app.route('/api/symbols/search/<query>')
def search_all_symbols(query):
    """Cerca in TUTTI gli exchange (senza cache globale)"""
    TWELVEDATA_KEY = '9f793095b1004638b251baa4013e667d'
    query = query.upper().strip()
    
    if len(query) < 2:
        return jsonify({'error': 'Query troppo corta'}), 400
    
    results = []
    exchanges = ['MTA', 'NASDAQ', 'NYSE']
    
    # Cerca in ogni exchange
    for exchange in exchanges:
        for exchange in exchanges:
        try:
            print(f"Chiamando {exchange}...")
            url = f'https://api.twelvedata.com/symbols?exchange={exchange}&apikey={TWELVEDATA_KEY}'
            resp = requests.get(url, timeout=60)
            print(f"Status: {resp.status_code}")
            data = resp.json()
            
            if 'data' in data:
                print(f"Ricevuti {len(data['data'])} simboli da {exchange}")
                for symbol in data['data']:
                    if query in symbol['symbol'].upper() or query in symbol['description'].upper():
                        results.append({
                            'symbol': symbol['symbol'],
                            'name': symbol['description'],
                            'exchange': exchange,
                            'type': 'stock',
                            'currency': symbol.get('currency', 'USD')
                        })
        except Exception as e:
            print(f"Errore cercando {exchange}: {e}")
            continue
    try:
        url = 'https://api.bybit.com/v5/market/tickers?category=spot'
        resp = requests.get(url, timeout=30)
        data = resp.json()
        
        if data['retCode'] == 0:
            for crypto in data['result']['list']:
                if crypto['quoteCoin'] == 'USDT':
                    if query in crypto['symbol'].upper() or query in crypto['baseCoin'].upper():
                        results.append({
                            'symbol': crypto['symbol'],
                            'name': f"{crypto['baseCoin']} / USDT",
                            'exchange': 'Bybit',
                            'type': 'crypto',
                            'currency': 'USDT'
                        })
    except Exception as e:
        print(f"Error searching Bybit: {e}")
    
    # Ordina e limita
    results.sort(key=lambda x: (x['symbol'] != query, x['symbol'].startswith(query)))
    
    return jsonify({
        'query': query,
        'count': len(results),
        'results': results[:50]
    })
# === ENDPOINT PER OTTENERE TUTTI GLI EXCHANGE DISPONIBILI ===

@app.route('/api/symbols/exchanges')
def get_available_exchanges():
    """Lista tutti gli exchange disponibili"""
    return jsonify({
        'exchanges': [
            {'name': 'Borsa Italiana', 'code': 'MTA', 'endpoint': '/api/symbols/italy'},
            {'name': 'NASDAQ (USA)', 'code': 'NASDAQ', 'endpoint': '/api/symbols/nasdaq'},
            {'name': 'NYSE (USA)', 'code': 'NYSE', 'endpoint': '/api/symbols/nyse'},
            {'name': 'S&P 500', 'code': 'SP500', 'endpoint': '/api/symbols/sp500'},
            {'name': 'Bybit Crypto', 'code': 'BYBIT', 'endpoint': '/api/symbols/bybit'}
        ]
    })
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
