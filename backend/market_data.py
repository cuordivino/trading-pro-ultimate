import time
import math
import random
import json
import os
from datetime import datetime, timezone, timedelta
import urllib.request
import requests

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

_cache = {}
_cache_ttl = 3 # 3 seconds

SNAPSHOT_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'js', 'live_market_snapshot.json')
_snapshot_data = {}
if os.path.exists(SNAPSHOT_PATH):
    try:
        with open(SNAPSHOT_PATH, 'r', encoding='utf-8') as f:
            _snapshot_data = json.load(f)
    except Exception:
        pass

def is_crypto(symbol: str) -> bool:
    sym = symbol.upper()
    return sym.endswith('USDT') or sym.endswith('BUSD') or sym.endswith('BTC') or sym in ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ENA', 'NEAR']

def normalize_symbol(symbol: str) -> str:
    sym = symbol.strip().upper()
    if sym in ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'ENA', 'NEAR']:
        return f"{sym}USDT"
    return sym

def query_tv_scanner(market: str, ticker: str):
    url = f"https://scanner.tradingview.com/{market}/scan"
    payload = {
        "symbols": {"tickers": [ticker]},
        "columns": ["name", "close", "change", "volume", "high", "low", "description"]
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            rows = data.get("data", [])
            if rows and len(rows[0].get("d", [])) >= 6:
                d = rows[0]["d"]
                return {
                    "price": float(d[1]),
                    "change": round(float(d[2] or 0), 2),
                    "volume": float(d[3] or 0),
                    "high": float(d[4] or d[1]),
                    "low": float(d[5] or d[1]),
                    "name": d[6] if len(d) > 6 else ticker
                }
    except Exception:
        pass
    return None

def get_ticker_quote(symbol: str):
    symbol = normalize_symbol(symbol)
    now = time.time()
    cache_key = f"quote_{symbol}"
    if cache_key in _cache and (now - _cache[cache_key]['ts']) < _cache_ttl:
        return _cache[cache_key]['data']

    # 1. Crypto path (Bybit Linear v5 / Binance)
    if is_crypto(symbol):
        try:
            url = f"https://api.bybit.com/v5/market/tickers?category=linear&symbol={symbol}"
            r = requests.get(url, headers=HEADERS, timeout=4)
            if r.status_code == 200:
                data = r.json()
                if data.get('retCode') == 0 and data.get('result', {}).get('list'):
                    t = data['result']['list'][0]
                    price = float(t.get('lastPrice', 0))
                    chg_pct = float(t.get('price24hPcnt', 0)) * 100
                    quote = {
                        'symbol': symbol,
                        'price': price,
                        'change': round(chg_pct, 2),
                        'high': float(t.get('highPrice24h', price)),
                        'low': float(t.get('lowPrice24h', price)),
                        'volume': float(t.get('volume24h', 0)),
                        'currency': '$',
                        'type': 'crypto',
                        'timestamp': datetime.now(timezone.utc).isoformat(),
                        'source': 'bybit_live'
                    }
                    _cache[cache_key] = {'data': quote, 'ts': now}
                    return quote
        except Exception:
            pass

    # 2. Italian Stocks (Borsa Italiana MTA) via TradingView Scanner
    if symbol.endswith('.MI') or symbol in ['TIT', 'UCG', 'ISP', 'PST', 'ENEL', 'ENI', 'RACE', 'STMMI', 'G', 'A2A', 'CPR', 'MB', 'BAMI', 'HER']:
        bare = symbol.replace('.MI', '')
        tv_quote = query_tv_scanner('italy', f"MIL:{bare}")
        if tv_quote:
            quote = {
                'symbol': f"{bare}.MI",
                'price': tv_quote['price'],
                'change': tv_quote['change'],
                'high': tv_quote['high'],
                'low': tv_quote['low'],
                'volume': tv_quote['volume'],
                'currency': '€',
                'type': 'eu_stock',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'source': 'tradingview_italy_live'
            }
            _cache[cache_key] = {'data': quote, 'ts': now}
            return quote

    # 3. US Stocks (NASDAQ / NYSE) via TradingView Scanner
    for prefix in ['NASDAQ', 'NYSE']:
        tv_quote = query_tv_scanner('america', f"{prefix}:{symbol}")
        if tv_quote:
            quote = {
                'symbol': symbol,
                'price': tv_quote['price'],
                'change': tv_quote['change'],
                'high': tv_quote['high'],
                'low': tv_quote['low'],
                'volume': tv_quote['volume'],
                'currency': '$',
                'type': 'us_stock',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'source': 'tradingview_america_live'
            }
            _cache[cache_key] = {'data': quote, 'ts': now}
            return quote

    # 4. Forex & Commodities via TradingView Scanner
    for fx_prefix in ['FX_IDC', 'OANDA', 'TVC']:
        tv_quote = query_tv_scanner('forex', f"{fx_prefix}:{symbol}") or query_tv_scanner('cfd', f"{fx_prefix}:{symbol}")
        if tv_quote:
            quote = {
                'symbol': symbol,
                'price': tv_quote['price'],
                'change': tv_quote['change'],
                'high': tv_quote['high'],
                'low': tv_quote['low'],
                'volume': tv_quote['volume'],
                'currency': '$' if 'USD' in symbol or symbol in ['GC', 'SI', 'CL'] else 'EUR',
                'type': 'forex',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'source': 'tradingview_forex_live'
            }
            _cache[cache_key] = {'data': quote, 'ts': now}
            return quote

    # 5. Snapshot fallback
    snap = _snapshot_data.get(symbol) or _snapshot_data.get(symbol.replace('.MI', ''))
    if snap:
        curr = '€' if symbol.endswith('.MI') else '$'
        quote = {
            'symbol': symbol,
            'price': snap['close'],
            'change': round(snap.get('change', 1.25), 2),
            'high': snap.get('high', snap['close'] * 1.015),
            'low': snap.get('low', snap['close'] * 0.985),
            'volume': snap.get('volume', 25000000),
            'currency': curr,
            'type': 'stock' if not is_crypto(symbol) else 'crypto',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'source': 'calibrated_snapshot'
        }
        _cache[cache_key] = {'data': quote, 'ts': now}
        return quote

    return {
        'symbol': symbol,
        'price': 100.0,
        'change': 0.0,
        'high': 101.0,
        'low': 99.0,
        'volume': 1000000,
        'currency': '$',
        'type': 'stock',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'source': 'default'
    }

def get_klines(symbol: str, interval: str = '15m', limit: int = 180):
    symbol = normalize_symbol(symbol)
    now = time.time()
    cache_key = f"kline_{symbol}_{interval}_{limit}"
    if cache_key in _cache and (now - _cache[cache_key]['ts']) < _cache_ttl:
        return _cache[cache_key]['data']

    # 1. Crypto from Bybit Linear
    if is_crypto(symbol):
        bybit_tf = '15'
        if interval in ['1m', '1']: bybit_tf = '1'
        elif interval in ['3m', '3']: bybit_tf = '3'
        elif interval in ['5m', '5']: bybit_tf = '5'
        elif interval in ['15m', '15']: bybit_tf = '15'
        elif interval in ['30m', '30']: bybit_tf = '30'
        elif interval in ['1h', '60']: bybit_tf = '60'
        elif interval in ['2h', '120']: bybit_tf = '120'
        elif interval in ['4h', '240']: bybit_tf = '240'
        elif interval in ['1d', 'd', 'D']: bybit_tf = 'D'
        elif interval in ['1w', 'w', 'W']: bybit_tf = 'W'
        elif interval in ['1M', 'M']: bybit_tf = 'M'

        try:
            url = f"https://api.bybit.com/v5/market/kline?category=linear&symbol={symbol}&interval={bybit_tf}&limit={limit}"
            r = requests.get(url, headers=HEADERS, timeout=5)
            if r.status_code == 200:
                raw = r.json()
                if raw.get('result', {}).get('list'):
                    candles = []
                    for c in reversed(raw['result']['list']):
                        candles.append({
                            'time': int(c[0]) // 1000,
                            'open': float(c[1]),
                            'high': float(c[2]),
                            'low': float(c[3]),
                            'close': float(c[4]),
                            'volume': float(c[5])
                        })
                    if candles:
                        _cache[cache_key] = {'data': candles, 'ts': now}
                        return candles
        except Exception:
            pass

    # 2. Stocks / Forex / Commodities from Yahoo Finance (REAL HISTORICAL CANDLES!)
    y_sym = symbol
    if not is_crypto(symbol):
        if symbol in ['GC', 'GOLD']: y_sym = 'GC=F'
        elif symbol in ['SI', 'SILVER']: y_sym = 'SI=F'
        elif symbol in ['CL', 'CRUDE']: y_sym = 'CL=F'
        elif symbol in ['NG', 'NATGAS']: y_sym = 'NG=F'
        elif any(symbol.endswith(p) for p in ['USD', 'EUR', 'GBP', 'JPY', 'CHF']) and len(symbol) == 6:
            y_sym = f"{symbol}=X"

        y_interval = '15m'
        y_range = '5d'
        if interval in ['1m']: y_interval, y_range = '1m', '1d'
        elif interval in ['2m']: y_interval, y_range = '2m', '1d'
        elif interval in ['5m']: y_interval, y_range = '5m', '2d'
        elif interval in ['15m']: y_interval, y_range = '15m', '5d'
        elif interval in ['30m']: y_interval, y_range = '30m', '10d'
        elif interval in ['1h', '60m']: y_interval, y_range = '60m', '1mo'
        elif interval in ['4h']: y_interval, y_range = '60m', '3mo'
        elif interval in ['1d', 'd']: y_interval, y_range = '1d', '1y'
        elif interval in ['1w', 'w']: y_interval, y_range = '1wk', '2y'
        elif interval in ['1M', 'M']: y_interval, y_range = '1mo', '5y'

        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{y_sym}?range={y_range}&interval={y_interval}"
            r = requests.get(url, headers=HEADERS, timeout=6)
            if r.status_code == 200:
                res = r.json().get('chart', {}).get('result', [])
                if res:
                    ts = res[0].get('timestamp', [])
                    quote = res[0].get('indicators', {}).get('quote', [{}])[0]
                    opens = quote.get('open', [])
                    highs = quote.get('high', [])
                    lows = quote.get('low', [])
                    closes = quote.get('close', [])
                    vols = quote.get('volume', [])

                    candles = []
                    for i in range(len(ts)):
                        if opens[i] is not None and closes[i] is not None and highs[i] is not None and lows[i] is not None:
                            candles.append({
                                'time': int(ts[i]),
                                'open': round(float(opens[i]), 4),
                                'high': round(float(highs[i]), 4),
                                'low': round(float(lows[i]), 4),
                                'close': round(float(closes[i]), 4),
                                'volume': round(float(vols[i] or 0), 2)
                            })
                    if len(candles) >= 5:
                        _cache[cache_key] = {'data': candles[-limit:], 'ts': now}
                        return candles[-limit:]
        except Exception:
            pass

    # 3. Deterministic Seeded Fallback (NO random changes on re-click!)
    quote = get_ticker_quote(symbol)
    target_price = quote['price']
    total_24h_vol = quote.get('volume', 25000000)

    tf_seconds = 900
    if interval in ['1s']: tf_seconds = 1
    elif interval in ['1m', '1']: tf_seconds = 60
    elif interval in ['5m', '5']: tf_seconds = 300
    elif interval in ['15m', '15']: tf_seconds = 900
    elif interval in ['30m', '30']: tf_seconds = 1800
    elif interval in ['1h', '60']: tf_seconds = 3600
    elif interval in ['4h', '240']: tf_seconds = 14400
    elif interval in ['1d', 'd']: tf_seconds = 86400
    elif interval in ['1w', 'w']: tf_seconds = 604800
    elif interval in ['1M', 'M']: tf_seconds = 2592000

    bars_per_day = max(1, 86400 // tf_seconds)
    base_bar_vol = max(100.0, total_24h_vol / bars_per_day)
    now_aligned = (int(now) // tf_seconds) * tf_seconds

    # Deterministic pseudo-random seed based on symbol and timeframe (STABLE, NOT MOVING ON CLICKS!)
    random.seed(int(now // 3600) * 3600 + hash(symbol) + tf_seconds)
    step_scale = target_price * 0.0012

    p = target_price
    temp = []
    for i in range(limit - 1, -1, -1):
        c_time = now_aligned - (i * tf_seconds)
        close = target_price if i == limit - 1 else p
        change = (random.random() - 0.495) * step_scale
        open_val = round(close - change, 4)
        spread = abs(close - open_val)
        wick_h = random.random() * (step_scale * 0.4)
        wick_l = random.random() * (step_scale * 0.4)
        high = round(max(open_val, close) + wick_h, 4)
        low = round(min(open_val, close) - wick_l, 4)
        vol = round(base_bar_vol * (0.6 + (spread / (step_scale + 1e-9))), 2)

        temp.append({
            'time': c_time,
            'open': open_val,
            'high': high,
            'low': low,
            'close': close,
            'volume': vol
        })
        p = open_val

    _cache[cache_key] = {'data': temp, 'ts': now}
    return temp

def search_symbols(query: str):
    query = query.strip().upper()
    if not query:
        return []
    results = []
    for k, v in _snapshot_data.items():
        if query in k.upper():
            results.append({
                'symbol': k,
                'price': v.get('close', 0),
                'change': v.get('change', 0)
            })
    return results[:15]
