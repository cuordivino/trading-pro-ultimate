import os
from pybit.unified_trading import HTTP
from typing import Dict, Any, Optional

class BybitClient:
    def __init__(self, testnet: bool = True):
        self.testnet = testnet
        self.api_key = os.getenv("BYBIT_API_KEY")
        self.api_secret = os.getenv("BYBIT_API_SECRET")
        
        # Connessione al server Bybit (Testnet o Live)
        self.session = HTTP(
            testnet=testnet,
            api_key=self.api_key,
            api_secret=self.api_secret,
            log_requests=False
        )

    def get_balance(self) -> Dict[str, Any]:
        """Controlla il saldo del portafoglio UNIFIED"""
        try:
            return self.session.get_wallet_balance(accountType="UNIFIED")
        except Exception as e:
            return {"error": str(e)}

    def get_positions(self, category: str = "linear") -> Dict[str, Any]:
        """Controlla le posizioni aperte"""
        try:
            return self.session.get_positions(category=category)
        except Exception as e:
            return {"error": str(e)}

    def place_order(self, symbol: str, side: str, qty: float, price: Optional[float] = None, 
                    sl: Optional[float] = None, tp: Optional[float] = None) -> Dict[str, Any]:
        """
        Piazza un ordine su Bybit.
        side: "Buy" o "Sell"
        qty: Quantità (es. 0.1 BTC)
        price: Se inserito diventa ordine Limit, altrimenti Market
        sl: Stop Loss opzionale
        tp: Take Profit opzionale
        """
        params = {
            "category": "linear", # Per contratti USDT perpetual
            "symbol": symbol,
            "side": side,
            "qty": str(qty),
            "timeInForce": "GTC" # Good Till Cancel
        }
        
        if price:
            params["price"] = str(price)
            params["orderType"] = "Limit"
        else:
            params["orderType"] = "Market"
            
        if sl: params["stopLoss"] = str(sl)
        if tp: params["takeProfit"] = str(tp)
        
        try:
            return self.session.place_order(**params)
        except Exception as e:
            return {"error": str(e)}

    def cancel_all_orders(self, category: str = "linear") -> Dict[str, Any]:
        """Cancella tutti gli ordini pendenti"""
        try:
            return self.session.cancel_all_orders(category=category)
        except Exception as e:
            return {"error": str(e)}
