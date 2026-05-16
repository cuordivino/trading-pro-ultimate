class BybitClient:
    def __init__(self, testnet=True):
        self.testnet = testnet
    
    def place_order(self, symbol, side, qty, price=None, sl=None, tp=None):
        return {"result": {"orderId": "test_123"}, "error": None}
    
    def get_balance(self):
        return {"USDT": {"available": "10000"}}
    
    def get_positions(self):
        return []
