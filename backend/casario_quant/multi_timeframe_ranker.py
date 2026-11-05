"""
Multi-Timeframe Ranker & Screener Engine.
Calcolo di Ranking Long/Short per griglia interattiva da 1m a 1 mese con tolleranza al rischio.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, List
import numpy as np


class TimeHorizon(Enum):
    SCALP_1M = "1m"
    INTRADAY_15M = "15m"
    INTRADAY_1H = "1h"
    SWING_4H = "4h"
    SWING_1D = "1d"
    POSITION_1W = "1w"
    MACRO_1M = "1M"


class RiskTolerance(Enum):
    CONSERVATIVE = 0.005  # 0.5% del capitale per trade
    MODERATE = 0.010      # 1.0% del capitale per trade
    AGGRESSIVE = 0.020    # 2.0% del capitale per trade


@dataclass
class ScreenerInput:
    symbol: str
    asset_class: str
    price: float
    atr: float
    bid_ask_spread_pct: float
    z_score: float
    trend_momentum: float   # da -1.0 a +1.0
    volume_imbalance: float # da -1.0 a +1.0
    macro_alignment: float  # da -1.0 a +1.0


@dataclass
class RankedCandidate:
    symbol: str
    direction: str          # 'LONG', 'SHORT', 'NEUTRAL'
    rank_score: float       # da -100 a +100
    confidence: float       # in %
    suggested_shares: int
    stop_distance: float
    take_profit: float


class MultiTimeframeRanker:
    """Applica pesi dinamici per timeframe e calcola la griglia di opportunita Long/Short."""

    WEIGHT_PROFILES = {
        TimeHorizon.SCALP_1M: {"macro": 0.00, "trend": 0.20, "volume": 0.50, "zscore": 0.30},
        TimeHorizon.INTRADAY_15M: {"macro": 0.10, "trend": 0.30, "volume": 0.40, "zscore": 0.20},
        TimeHorizon.INTRADAY_1H: {"macro": 0.20, "trend": 0.35, "volume": 0.25, "zscore": 0.20},
        TimeHorizon.SWING_4H: {"macro": 0.30, "trend": 0.35, "volume": 0.20, "zscore": 0.15},
        TimeHorizon.SWING_1D: {"macro": 0.40, "trend": 0.35, "volume": 0.15, "zscore": 0.10},
        TimeHorizon.POSITION_1W: {"macro": 0.60, "trend": 0.30, "volume": 0.05, "zscore": 0.05},
        TimeHorizon.MACRO_1M: {"macro": 0.70, "trend": 0.20, "volume": 0.05, "zscore": 0.05},
    }

    def __init__(self, capital: float = 100000.0, risk_profile: RiskTolerance = RiskTolerance.MODERATE):
        self.capital = capital
        self.risk_pct = risk_profile.value

    def rank_universe(self, universe: List[ScreenerInput], timeframe: TimeHorizon) -> List[RankedCandidate]:
        weights = self.WEIGHT_PROFILES.get(timeframe, self.WEIGHT_PROFILES[TimeHorizon.SWING_1D])
        ranked_list = []

        for item in universe:
            # Filtro esecuzione spread
            max_allowed_spread = 0.08 if timeframe == TimeHorizon.SCALP_1M else 0.35
            if item.bid_ask_spread_pct > max_allowed_spread:
                continue

            # Sub-Scores standardizzati via tanh / lineari
            s_macro = item.macro_alignment * 100.0
            s_trend = item.trend_momentum * 100.0
            s_volume = item.volume_imbalance * 100.0
            s_zscore = -float(np.clip(item.z_score / 2.5, -1.0, 1.0)) * 100.0

            raw_score = (
                (weights["macro"] * s_macro) +
                (weights["trend"] * s_trend) +
                (weights["volume"] * s_volume) +
                (weights["zscore"] * s_zscore)
            )
            final_score = float(np.clip(raw_score, -100.0, 100.0))

            # Moltiplicatore ATR frattale
            atr_mult = 1.2 if timeframe in [TimeHorizon.SCALP_1M, TimeHorizon.INTRADAY_15M] else 2.0
            stop_dist = max(item.atr * atr_mult, item.price * 0.002)

            risk_amount = self.capital * self.risk_pct
            shares = int(np.floor(risk_amount / stop_dist))

            if final_score >= 65:
                direction = "LONG"
                tp = item.price + (stop_dist * 2.5)
            elif final_score <= -65:
                direction = "SHORT"
                tp = item.price - (stop_dist * 2.5)
            else:
                direction = "NEUTRAL"
                shares = 0
                tp = 0.0

            ranked_list.append(
                RankedCandidate(
                    symbol=item.symbol,
                    direction=direction,
                    rank_score=round(final_score, 1),
                    confidence=round(abs(final_score), 1),
                    suggested_shares=shares,
                    stop_distance=round(stop_dist, 4),
                    take_profit=round(tp, 4)
                )
            )

        return sorted(ranked_list, key=lambda x: abs(x.rank_score), reverse=True)
