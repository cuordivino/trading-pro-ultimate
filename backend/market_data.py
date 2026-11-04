import time
import math
import random
from datetime import datetime, timezone, timedelta
import requests

# Enable Windows system certificates if available
try:
    import pip_system_certs.wrapt_requests
except Exception:
    pass

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Cache for tickers and klines to avoid API throttling
_cache = {}
_cache_ttl = 4 # seconds

def is_crypto(symbol: str) -> bool:
    sym = symbol.upper()
    return sym.endswith('USDT') or sym.endswith('BUSD') or sym.endswith('BTC') or sym in ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE']

def normalize_symbol(symbol: str) -> str:
    sym = symbol.strip().upper()
    if sym in ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX']:
        return f"{sym}USDT"
    return sym

def get_ticker_quote(symbol: str):
    symbol = normalize_symbol(symbol)
    now = time.time()
    cache_key = f"quote_{symbol}"
    if cache_key in _cache and (now - _cache[cache_key]['ts']) < _cache_ttl:
        return _cache[cache_key]['data']

    # 1. Crypto path
    if is_crypto(symbol):
        try:
            url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
            r = requests.get(url, headers=HEADERS, timeout=4)
            if r.status_code == 200:
                d = r.json()
                price = float(d.get('lastPrice', 0))
                change_pct = float(d.get('priceChangePercent', 0))
                high = float(d.get('highPrice', price))
                low = float(d.get('lowPrice', price))
                volume = float(d.get('volume', 0))
                quote = {
                    'symbol': symbol,
                    'price': price,
                    'change': round(change_pct, 2),
                    'high': high,
                    'low': low,
                    'volume': volume,
                    'currency': 'USDT',
                    'type': 'crypto',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
                _cache[cache_key] = {'data': quote, 'ts': now}
                return quote
        except Exception as e:
            pass
        
        # Bybit fallback for crypto
        try:
            url = f"https://api.bybit.com/v5/market/tickers?category=spot&symbol={symbol}"
            r = requests.get(url, headers=HEADERS, timeout=4)
            if r.status_code == 200:
                data = r.json()
                if data.get('retCode') == 0 and data.get('result', {}).get('list'):
                    t = data['result']['list'][0]
                    price = float(t.get('lastPrice', 0))
                    prev24 = float(t.get('prevPrice24h', price))
                    change = ((price - prev24) / prev24 * 100) if prev24 > 0 else 0
                    quote = {
                        'symbol': symbol,
                        'price': price,
                        'change': round(change, 2),
                        'high': float(t.get('highPrice24h', price)),
                        'low': float(t.get('lowPrice24h', price)),
                        'volume': float(t.get('volume24h', 0)),
                        'currency': 'USDT',
                        'type': 'crypto',
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    _cache[cache_key] = {'data': quote, 'ts': now}
                    return quote
        except Exception:
            pass

    # 2. Stocks / Indices / Forex path (via Yahoo Finance)
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=1d&interval=5m"
        r = requests.get(url, headers=HEADERS, timeout=4)
        if r.status_code == 200:
            res = r.json().get('chart', {}).get('result', [])
            if res:
                meta = res[0].get('meta', {})
                price = float(meta.get('regularMarketPrice', 0))
                prev = float(meta.get('chartPreviousClose', meta.get('previousClose', price)))
                change = round(((price - prev) / prev * 100), 2) if prev > 0 else 0.0
                quote = {
                    'symbol': symbol,
                    'price': price,
                    'change': change,
                    'high': float(meta.get('regularMarketDayHigh', price)),
                    'low': float(meta.get('regularMarketDayLow', price)),
                    'volume': float(meta.get('regularMarketVolume', 0)),
                    'currency': meta.get('currency', 'USD'),
                    'type': 'stock',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
                _cache[cache_key] = {'data': quote, 'ts': now}
                return quote
    except Exception:
        pass

    # 3. High quality fallback quote if completely disconnected
    default_base = 65000.0 if 'BTC' in symbol else (350.0 if 'AAPL' in symbol else 100.0)
    return {
        'symbol': symbol,
        'price': default_base,
        'change': 1.25,
        'high': default_base * 1.02,
        'low': default_base * 0.98,
        'volume': 1500000,
        'currency': 'USD',
        'type': 'stock' if not is_crypto(symbol) else 'crypto',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'fallback': True
    }


def get_klines(symbol: str, interval: str = '15m', limit: int = 150):
    symbol = normalize_symbol(symbol)
    now = time.time()
    cache_key = f"kline_{symbol}_{interval}_{limit}"
    if cache_key in _cache and (now - _cache[cache_key]['ts']) < _cache_ttl:
        return _cache[cache_key]['data']

    # Map intervals to standard formats
    # Binance format: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    # Yahoo format: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo
    binance_tf = interval.lower()
    if binance_tf in ['15', '15m']: binance_tf = '15m'
    elif binance_tf in ['5', '5m']: binance_tf = '5m'
    elif binance_tf in ['1', '1m']: binance_tf = '1m'
    elif binance_tf in ['60', '1h', '60m']: binance_tf = '1h'
    elif binance_tf in ['240', '4h']: binance_tf = '4h'
    elif binance_tf in ['d', '1d', 'day']: binance_tf = '1d'

    candles = []

    # 1. Crypto from Binance
    if is_crypto(symbol):
        try:
            url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={binance_tf}&limit={limit}"
            r = requests.get(url, headers=HEADERS, timeout=5)
            if r.status_code == 200:
                raw = r.json()
                for c in raw:
                    candles.append({
                        'time': int(c[0] // 1000), # Unix timestamp in seconds
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

    # 2. Stocks / ETFs / Crypto fallback from Yahoo Finance
    # Map range for Yahoo:
    y_interval = '15m'
    y_range = '5d'
    if binance_tf in ['1m']: y_interval, y_range = '1m', '1d'
    elif binance_tf in ['5m']: y_interval, y_range = '5m', '2d'
    elif binance_tf in ['15m']: y_interval, y_range = '15m', '5d'
    elif binance_tf in ['1h']: y_interval, y_range = '1h', '1mo'
    elif binance_tf in ['4h']: y_interval, y_range = '1h', '3mo'
    elif binance_tf in ['1d']: y_interval, y_range = '1d', '1y'

    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={y_range}&interval={y_interval}"
        r = requests.get(url, headers=HEADERS, timeout=6)
        if r.status_code == 200:
            res = r.json().get('chart', {}).get('result', [])
            if res:
                timestamps = res[0].get('timestamp', [])
                quote = res[0].get('indicators', {}).get('quote', [{}])[0]
                opens = quote.get('open', [])
                highs = quote.get('high', [])
                lows = quote.get('low', [])
                closes = quote.get('close', [])
                volumes = quote.get('volume', [])

                for i in range(len(timestamps)):
                    if opens[i] is not None and closes[i] is not None and highs[i] is not None and lows[i] is not None:
                        candles.append({
                            'time': int(timestamps[i]),
                            'open': round(float(opens[i]), 4),
                            'high': round(float(highs[i]), 4),
                            'low': round(float(lows[i]), 4),
                            'close': round(float(closes[i]), 4),
                            'volume': round(float(volumes[i] or 0), 2)
                        })
                if candles:
                    _cache[cache_key] = {'data': candles[-limit:], 'ts': now}
                    return candles[-limit:]
    except Exception:
        pass

    # 3. Deterministic synthetic candle generator if completely offline or rate limited
    base_price = 65000.0 if 'BTC' in symbol else (350.0 if 'AAPL' in symbol else 150.0)
    current_time = int(time.time()) - (limit * 900)
    curr = base_price
    random.seed(symbol + interval)
    candles = []
    for i in range(limit):
        dt = 900
        t = current_time + (i * dt)
        step = (random.random() - 0.49) * (curr * 0.008)
        o = curr
        c = curr + step
        h = max(o, c) + random.random() * (curr * 0.004)
        l = min(o, c) - random.random() * (curr * 0.004)
        vol = round(random.uniform(500, 15000), 2)
        candles.append({
            'time': t,
            'open': round(o, 2),
            'high': round(h, 2),
            'low': round(l, 2),
            'close': round(c, 2),
            'volume': vol
        })
        curr = c
    return candles


def search_symbols(query: str):
    query = query.strip().upper()
    if not query:
        return []

    # Curated universe with Italian stocks, US Big Tech, Crypto, Commodities
    catalog = [
        # Cryptos
        {'symbol': 'BTCUSDT', 'name': 'Bitcoin / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        {'symbol': 'ETHUSDT', 'name': 'Ethereum / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        {'symbol': 'SOLUSDT', 'name': 'Solana / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        {'symbol': 'BNBUSDT', 'name': 'BNB / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        {'symbol': 'XRPUSDT', 'name': 'Ripple XRP / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        {'symbol': 'DOGEUSDT', 'name': 'Dogecoin / Tether USDT', 'exchange': 'Binance/Bybit', 'type': 'crypto', 'currency': 'USDT'},
        # US Tech Leaders
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc. (Google)', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'exchange': 'NASDAQ', 'type': 'stock', 'currency': 'USD'},
        {'symbol': 'BRK-B', 'name': 'Berkshire Hathaway Inc.', 'exchange': 'NYSE', 'type': 'stock', 'currency': 'USD'},
        # Borsa Italiana (MTA)
        {'symbol': 'ENEL.MI', 'name': 'Enel S.p.A.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'ENI.MI', 'name': 'Eni S.p.A.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'ISP.MI', 'name': 'Intesa Sanpaolo S.p.A.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'UCG.MI', 'name': 'UniCredit S.p.A.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'RACE.MI', 'name': 'Ferrari N.V.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'STMMI.MI', 'name': 'STMicroelectronics N.V.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        {'symbol': 'SRG.MI', 'name': 'Snam S.p.A.', 'exchange': 'Borsa Italiana (MTA)', 'type': 'stock', 'currency': 'EUR'},
        # ETFs & Macro
        {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'exchange': 'NYSE Arca', 'type': 'etf', 'currency': 'USD'},
        {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust (Nasdaq 100)', 'exchange': 'NASDAQ', 'type': 'etf', 'currency': 'USD'},
        {'symbol': 'GLD', 'name': 'SPDR Gold Shares', 'exchange': 'NYSE Arca', 'type': 'etf', 'currency': 'USD'}
    ]

    matches = []
    for item in catalog:
        if query in item['symbol'] or query in item['name'].upper():
            matches.append(item)

    # If user searches something custom not in the curated catalog, also offer it as a custom symbol
    if not any(m['symbol'] == query for m in matches):
        matches.append({
            'symbol': query,
            'name': f"{query} (Custom Asset)",
            'exchange': 'Global',
            'type': 'crypto' if is_crypto(query) else 'stock',
            'currency': 'USDT' if is_crypto(query) else 'USD'
        })

    return matches
