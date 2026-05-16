import time
from config.risk_profiles import RiskProfile
from typing import Optional, Tuple

class RiskManager:
    def __init__(self, profile: RiskProfile):
        self.profile = profile
        self.daily_pnl_pct = 0.0
        self.total_drawdown_pct = 0.0
        self.consecutive_losses = 0
        self.last_loss_ts: Optional[float] = None
        self.start_capital = 0.0
        self.peak_capital = 0.0

    def init_capital(self, capital: float):
        self.start_capital = capital
        self.peak_capital = capital

    def check_circuit_breakers(self) -> Tuple[bool, str]:
        if self.profile.max_drawdown_stop and self.total_drawdown_pct <= self.profile.max_drawdown_stop:
            return False, "MAX DRAWDOWN"
        if self.daily_pnl_pct <= -0.02:
            return False, "PERDITA GIORNALIERA"
        return True, "OK"

    def calculate_position_size(self, entry_price: float, stop_price: float, capital: float) -> float:
        risk_amount = capital * self.profile.stake_amount_pct * abs(self.profile.stop_loss)
        price_dist = abs(entry_price - stop_price)
        if price_dist == 0: return 0
        size = risk_amount / price_dist
        return max(10.0 / entry_price, min(size, (capital * self.profile.stake_amount_pct) / entry_price))
