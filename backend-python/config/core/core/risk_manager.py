import time
import math
from config.risk_profiles import RiskProfile, RiskProfileType
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

    def update_metrics(self, current_capital: float, trade_pnl_pct: float, is_win: bool):
        self.daily_pnl_pct += trade_pnl_pct
        if current_capital > self.peak_capital:
            self.peak_capital = current_capital
        if self.peak_capital > 0:
            self.total_drawdown_pct = (current_capital - self.peak_capital) / self.peak_capital
        if not is_win:
            self.consecutive_losses += 1
            self.last_loss_ts = time.time()
        else:
            self.consecutive_losses = 0

    def check_circuit_breakers(self) -> Tuple[bool, str]:
        # Blocco per Drawdown massimo configurato
        if self.profile.max_drawdown_stop and self.total_drawdown_pct <= self.profile.max_drawdown_stop:
            return False, f"MAX DRAWDOWN: {self.total_drawdown_pct:.2%}"
        
        # Blocco per perdita giornaliera (fisso al 2% per sicurezza)
        if self.daily_pnl_pct <= -0.02:
            return False, f"PERDITA GIORNALIERA: {self.daily_pnl_pct:.2%}"
        
        # Cooldown dopo perdita
        if self.last_loss_ts and self.profile.cooldown_period_hours > 0:
            hours_passed = (time.time() - self.last_loss_ts) / 3600
            if hours_passed < self.profile.cooldown_period_hours:
                return False, f"COOLDOWN: {self.profile.cooldown_period_hours - hours_passed:.1f}h rimanenti"
        
        return True, "OK"

    def calculate_position_size(self, entry_price: float, stop_price: float, capital: float) -> float:
        risk_amount = capital * self.profile.stake_amount_pct * abs(self.profile.stop_loss)
        price_dist = abs(entry_price - stop_price)
        if price_dist == 0: return 0
        size = risk_amount / price_dist
        
        # Limiti minimi/massimi per Bybit
        min_notional = 10.0
        max_size = (capital * self.profile.stake_amount_pct) / entry_price
        return max(min_notional / entry_price, min(size, max_size))

    def get_trailing_stop_price(self, current_price: float, highest_price: float, entry: float, is_long: bool) -> Optional[float]:
        ts = self.profile.trailing_stop
        if not ts.enabled: return None
        
        profit = (current_price - entry) / entry if is_long else (entry - current_price) / entry
        if profit < ts.activation_pct: return None
        
        new_stop = highest_price * (1 - ts.distance_pct) if is_long else highest_price * (1 + ts.distance_pct)
        original_sl = entry * (1 + self.profile.stop_loss) if is_long else entry * (1 - self.profile.stop_loss)
        
        return max(new_stop, original_sl) if is_long else min(new_stop, original_sl)
