import time
import hmac
import hashlib
import requests
from datetime import datetime

# Enable Windows system certs
try:
    import pip_system_certs.wrapt_requests
except Exception:
    pass

class BrokerageClient:
    def __init__(self, settings: dict):
        self.bybit_key = settings.get('bybit_key', '')
        self.bybit_secret = settings.get('bybit_secret', '')
        self.alpaca_key = settings.get('alpaca_key', '')
        self.alpaca_secret = settings.get('alpaca_secret', '')
        self.telegram_token = settings.get('telegram_token', '')
        self.telegram_chat_id = settings.get('telegram_chat_id', '')

        # Base URLs
        self.bybit_base_url = 'https://api-testnet.bybit.com' if not self.bybit_key else 'https://api.bybit.com'
        self.alpaca_base_url = 'https://paper-api.alpaca.markets'

    def sign_bybit(self, params: dict) -> str:
        param_str = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        return hmac.new(self.bybit_secret.encode(), param_str.encode(), hashlib.sha256).hexdigest()

    def get_bybit_balance(self):
        if not self.bybit_key or not self.bybit_secret:
            return {'demo': True, 'USDT': {'available': 25000.0, 'total': 25000.0}}
        try:
            ts = int(time.time() * 1000)
            params = {'api_key': self.bybit_key, 'timestamp': ts, 'recv_window': 5000}
            params['sign'] = self.sign_bybit(params)
            r = requests.get(f"{self.bybit_base_url}/v2/private/wallet/balance", params=params, timeout=5)
            return r.json()
        except Exception as e:
            return {'error': str(e)}

    def place_bybit_order(self, symbol: str, side: str, qty: float, order_type: str = 'Market', price: float = None):
        if not self.bybit_key or not self.bybit_secret:
            # Paper execution
            return {
                'demo': True,
                'order_id': f"paper_{int(time.time())}",
                'symbol': symbol,
                'side': side,
                'qty': qty,
                'price': price,
                'status': 'Filled (Paper Simulator)'
            }
        try:
            ts = int(time.time() * 1000)
            params = {
                'side': side,
                'symbol': symbol,
                'order_type': order_type,
                'qty': qty,
                'price': price or 0,
                'time_in_force': 'GoodTillCancel',
                'timestamp': ts,
                'api_key': self.bybit_key,
                'recv_window': 5000
            }
            params['sign'] = self.sign_bybit(params)
            r = requests.post(f"{self.bybit_base_url}/private/linear/order/create", data=params, timeout=5)
            return r.json()
        except Exception as e:
            return {'error': str(e)}

    def get_alpaca_account(self):
        if not self.alpaca_key or not self.alpaca_secret:
            return {'demo': True, 'portfolio_value': 25000.0, 'cash': 25000.0, 'buying_power': 100000.0}
        try:
            headers = {
                'APCA-API-KEY-ID': self.alpaca_key,
                'APCA-API-SECRET-KEY': self.alpaca_secret
            }
            r = requests.get(f"{self.alpaca_base_url}/v2/account", headers=headers, timeout=5)
            return r.json()
        except Exception as e:
            return {'error': str(e)}

    def send_telegram_alert(self, message: str) -> bool:
        if not self.telegram_token or not self.telegram_chat_id:
            return False
        try:
            url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
            payload = {
                'chat_id': self.telegram_chat_id,
                'text': message,
                'parse_mode': 'Markdown'
            }
            r = requests.post(url, json=payload, timeout=5)
            return r.status_code == 200
        except Exception:
            return False
