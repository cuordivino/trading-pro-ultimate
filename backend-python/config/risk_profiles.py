from dataclasses import dataclass

@dataclass
class RiskProfile:
    name: str
    leverage: int
    stake_amount_pct: float
    stop_loss: float
    take_profit: float
    max_drawdown_stop: float
    timeframe: str
    cooldown_period_hours: float
    expected_daily_return: float

PROFILES = {
    "conservative": RiskProfile("Conservativo", 2, 0.01, -0.005, 0.01, -0.05, "1h", 2, 0.002),
    "moderate": RiskProfile("Moderato", 5, 0.02, -0.01, 0.02, -0.10, "4h", 4, 0.005),
    "aggressive": RiskProfile("Aggressivo", 10, 0.03, -0.015, 0.03, -0.15, "1d", 8, 0.01)
}
