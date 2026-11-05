"""
Real-Time Multi-Asset Tracker & Engine.
Gestione buffer O(1) in memoria e specifiche per FTSE MIB, Mid-Cap, US, FX, Commodities.
"""

from collections import deque
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
import numpy as np


class AssetClass(Enum):
    US_EQUITY = "US_EQUITY"
    IT_EQUITY = "IT_EQUITY"
    FOREX = "FOREX"
    COMMODITY = "COMMODITY"


@dataclass
class MarketTick:
    symbol: str
    asset_class: AssetClass
    timestamp: datetime
    price: float
    volume: float
    bid: float
    ask: float


@dataclass
class MacroContext:
    fed_net_liquidity_growing: bool
    ecb_liquidity_growing: bool
    btp_bund_spread_bps: float
    us_vix_ratio: float  # VIX / VIX3M
    eu_vstoxx_ratio: float
    dxy_trend_bullish: bool


class RealTimeAssetTracker:
    """Mantiene lo stato statistico, volumetrico e di liquidita in memoria."""

    def __init__(self, symbol: str, asset_class: AssetClass, window_size: int = 500, anchor_timestamp: Optional[datetime] = None):
        self.symbol = symbol
        self.asset_class = asset_class
        self.window_size = window_size
        self.anchor_timestamp = anchor_timestamp or datetime.min

        self.prices = deque(maxlen=window_size)
        self.volumes = deque(maxlen=window_size)
        self.timestamps = deque(maxlen=window_size)
        self.spreads = deque(maxlen=window_size)

        self.cum_pv = 0.0
        self.cum_vol = 0.0

    def update_tick(self, tick: MarketTick):
        self.prices.append(tick.price)
        self.volumes.append(tick.volume)
        self.timestamps.append(tick.timestamp)
        self.spreads.append(tick.ask - tick.bid)

        if tick.timestamp >= self.anchor_timestamp:
            self.cum_pv += tick.price * tick.volume
            self.cum_vol += tick.volume

    def get_realtime_avwap(self) -> float:
        return self.cum_pv / self.cum_vol if self.cum_vol > 0 else 0.0

    def get_zscore(self, period: int = 50) -> float:
        if len(self.prices) < period:
            return 0.0
        p_slice = list(self.prices)[-period:]
        mean = float(np.mean(p_slice))
        std = float(np.std(p_slice))
        return (p_slice[-1] - mean) / std if std > 1e-6 else 0.0

    def get_amihud_liquidity(self) -> float:
        if len(self.prices) < 2:
            return 0.0
        p = list(self.prices)
        v = list(self.volumes)
        ret = abs((p[-1] - p[-2]) / p[-2])
        dollar_vol = p[-1] * v[-1]
        return float((ret / dollar_vol) * 1e6) if dollar_vol > 0 else 999.0

    def get_bid_ask_spread_pct(self) -> float:
        if not self.spreads or not self.prices:
            return 0.0
        return float((self.spreads[-1] / self.prices[-1]) * 100.0)


@dataclass
class ExecutionOrderIntent:
    symbol: str
    action: str  # BUY_CONFIRM, SHORT_CONFIRM, BLOCKED, WAIT
    quantity: int
    limit_price: float
    stop_loss: float
    take_profit: float
    confidence_score: int
    validation_reasons: List[str]


class RealTimeMultiAssetEngine:
    """Valutatore tick-by-tick multi-asset con circuit breaker settoriali."""

    def __init__(self, account_equity: float = 100000.0, risk_factor: float = 0.01):
        self.equity = account_equity
        self.risk_factor = risk_factor
        self.trackers: Dict[str, RealTimeAssetTracker] = {}

    def register_asset(self, symbol: str, asset_class: AssetClass, anchor_date: Optional[datetime] = None):
        self.trackers[symbol] = RealTimeAssetTracker(symbol, asset_class, anchor_timestamp=anchor_date)

    def process_tick_and_evaluate(self, tick: MarketTick, macro: MacroContext) -> ExecutionOrderIntent:
        tracker = self.trackers[tick.symbol]
        tracker.update_tick(tick)

        reasons = []
        score = 50

        # Filtro Liquidita / Spread (Mid-Cap IT / US)
        if tracker.asset_class in [AssetClass.IT_EQUITY, AssetClass.US_EQUITY]:
            spread_pct = tracker.get_bid_ask_spread_pct()
            if spread_pct > 0.40:
                return ExecutionOrderIntent(
                    symbol=tick.symbol,
                    action="BLOCKED",
                    quantity=0,
                    limit_price=0.0,
                    stop_loss=0.0,
                    take_profit=0.0,
                    confidence_score=0,
                    validation_reasons=[f"SPREAD ELEVATO ({spread_pct:.2f}%): Rischio Slippage Inaccettabile"]
                )

        # Filtro Rischio Sovrano Italia (BTP/Bund)
        if tracker.asset_class == AssetClass.IT_EQUITY:
            if macro.btp_bund_spread_bps > 190.0:
                score -= 30
                reasons.append(f"Rischio Paese: Spread BTP/Bund elevato ({macro.btp_bund_spread_bps} bps)")
            if not macro.ecb_liquidity_growing:
                score -= 15
                reasons.append("Contrazione Liquidita BCE")

        # Filtro Volatilita USA
        if tracker.asset_class == AssetClass.US_EQUITY:
            if macro.us_vix_ratio > 1.02:
                return ExecutionOrderIntent(
                    symbol=tick.symbol,
                    action="BLOCKED",
                    quantity=0,
                    limit_price=0.0,
                    stop_loss=0.0,
                    take_profit=0.0,
                    confidence_score=0,
                    validation_reasons=[f"CIRCUIT BREAKER: VIX in Backwardation ({macro.us_vix_ratio:.2f})"]
                )
            if macro.fed_net_liquidity_growing:
                score += 15
                reasons.append("Fed Net Liquidity Positiva")

        # Filtro Dollaro per Commodities
        if tracker.asset_class == AssetClass.COMMODITY:
            if macro.dxy_trend_bullish and tick.symbol != "USOIL":
                score -= 15
                reasons.append("Pressione ribassista da Dollar Index (DXY)")

        # AVWAP & Z-Score
        avwap = tracker.get_realtime_avwap()
        z_score = tracker.get_zscore(period=30)

        if avwap > 0:
            if tick.price > avwap:
                score += 15
                reasons.append(f"Prezzo sopra AVWAP Istituzionale ({avwap:.2f})")
            else:
                score -= 15
                reasons.append(f"Prezzo sotto AVWAP Istituzionale ({avwap:.2f})")

        if -1.8 <= z_score <= -0.8:
            score += 20
            reasons.append(f"Pullback Statistico Ottimale (Z-Score: {z_score:.2f})")
        elif z_score > 2.0:
            score -= 25
            reasons.append(f"Rifiuto Chasing: Eccesso rialzista (Z-Score: {z_score:.2f})")

        # Sizing
        prices_list = list(tracker.prices)
        vol_stdev = float(np.std(prices_list)) if len(prices_list) > 20 else tick.price * 0.01
        stop_distance = max(vol_stdev * 2.5, tick.price * 0.005)

        risk_capital = self.equity * self.risk_factor
        raw_quantity = risk_capital / stop_distance
        quantity = int(np.floor(raw_quantity))

        action = "WAIT"
        limit_price = tick.bid
        stop_loss = tick.price - stop_distance
        take_profit = tick.price + (stop_distance * 2.0)

        if score >= 75 and quantity > 0:
            action = "BUY_CONFIRM"

        return ExecutionOrderIntent(
            symbol=tick.symbol,
            action=action,
            quantity=quantity,
            limit_price=round(limit_price, 4),
            stop_loss=round(stop_loss, 4),
            take_profit=round(take_profit, 4),
            confidence_score=int(np.clip(score, 0, 100)),
            validation_reasons=reasons
        )
