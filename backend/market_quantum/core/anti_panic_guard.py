import time
from typing import Dict, Any

class AntiPanicGuard:
    def __init__(self, initial_balance: float = 10000.0):
        self.initial_balance = initial_balance
        self.current_balance = initial_balance
        self.consecutive_losses = 0
        self.cooldown_until: float = 0.0

    def check_kill_switch(self) -> Dict[str, Any]:
        drawdown_pct = ((self.initial_balance - self.current_balance) / self.initial_balance) * 100.0
        if drawdown_pct >= 3.0:
            return {"allowed": False, "message": "Kill-Switch Attivato (-3%). Trading sospeso per oggi."}
        return {"allowed": True}

    def calculate_position(self, entry: float, stop: float) -> Dict[str, Any]:
        risk_cash = self.current_balance * 0.01  # Regola 1%
        dist = abs(entry - stop)
        if dist <= 0: return {"valid": False}
        units = risk_cash / dist
        return {"valid": True, "units": round(units, 4), "risk_cash": round(risk_cash, 2)}
