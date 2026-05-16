from dataclasses import dataclass, field
from typing import Optional, Dict
from enum import Enum

class RiskProfileType(Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    HYPER_AGGRESSIVE = "hyper_aggressive"

@dataclass
class TrailingStopConfig:
    enabled: bool
    activation_pct: float = 0.0
    distance_pct: float = 0.0

@dataclass
class RiskProfile:
    name: str
    target_market: str
    leverage: float
    stake_amount_pct: float
    max_open_trades: int
    stop_loss: float
    trailing_stop: TrailingStopConfig
    take_profit: float
    max_drawdown_stop: Optional[float]
    cooldown_period_hours: int
    volume_filter_min: float
    volatility_threshold: str
    timeframe: str
    expected_daily_return: float
    target_sharpe: float
    max_acceptable_drawdown: float

PROFILES: Dict[str, RiskProfile] = {
    "conservative": RiskProfile(
        name="🛡️ Conservativo", target_market="forex_largecap", leverage=1.0,
        stake_amount_pct=0.01, max_open_trades=4, stop_loss=-0.01,
        trailing_stop=TrailingStopConfig(enabled=True, activation_pct=0.008, distance_pct=0.002),
        take_profit=0.01, max_drawdown_stop=-0.05, cooldown_period_hours=24,
        volume_filter_min=10_000_000, volatility_threshold="low", timeframe="1h",
        expected_daily_return=0.0005, target_sharpe=2.0, max_acceptable_drawdown=0.05
    ),
    "moderate": RiskProfile(
        name="️ Moderato", target_market="crypto_top", leverage=2.0,
        stake_amount_pct=0.02, max_open_trades=6, stop_loss=-0.02,
        trailing_stop=TrailingStopConfig(enabled=True, activation_pct=0.02, distance_pct=0.005),
        take_profit=0.03, max_drawdown_stop=-0.12, cooldown_period_hours=4,
        volume_filter_min=2_000_000, volatility_threshold="medium", timeframe="15m",
        expected_daily_return=0.001, target_sharpe=1.5, max_acceptable_drawdown=0.12
    ),
    "aggressive": RiskProfile(
        name="🔥 Aggressivo", target_market="crypto_altcoins", leverage=5.0,
        stake_amount_pct=0.04, max_open_trades=10, stop_loss=-0.05,
        trailing_stop=TrailingStopConfig(enabled=True, activation_pct=0.05, distance_pct=0.015),
        take_profit=0.07, max_drawdown_stop=-0.25, cooldown_period_hours=1,
        volume_filter_min=500_000, volatility_threshold="high", timeframe="5m",
        expected_daily_return=0.0015, target_sharpe=1.2, max_acceptable_drawdown=0.25
    ),
    "hyper_aggressive": RiskProfile(
        name="☠️ Iper-Aggressivo", target_market="meme_lowcap", leverage=20.0,
        stake_amount_pct=0.15, max_open_trades=2, stop_loss=-0.10,
        trailing_stop=TrailingStopConfig(enabled=False),
        take_profit=0.15, max_drawdown_stop=None, cooldown_period_hours=0,
        volume_filter_min=0, volatility_threshold="extreme", timeframe="1m",
        expected_daily_return=0.003, target_sharpe=0.8, max_acceptable_drawdown=1.0
    )
}
