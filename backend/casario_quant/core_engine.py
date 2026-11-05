"""
Core Engine: Calcolo indicatori statistici, macro e scoring di base.
Replicazione analitica del framework quantitativo di Marco Casario.
"""

import numpy as np
import pandas as pd
import yfinance as yf
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta


class QuantitativeMetrics:
    """Funzioni pure per calcolo indicatori quantitativi e volumetrici."""

    @staticmethod
    def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
        high_low = df["High"] - df["Low"]
        high_close = (df["High"] - df["Close"].shift()).abs()
        low_close = (df["Low"] - df["Close"].shift()).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        return tr.rolling(window=period).mean()

    @staticmethod
    def calculate_zscore(series: pd.Series, window: int = 20) -> Tuple[pd.Series, pd.Series]:
        rolling_mean = series.rolling(window=window).mean()
        rolling_std = series.rolling(window=window).std()
        zscore = (series - rolling_mean) / rolling_std
        return zscore, rolling_mean

    @staticmethod
    def calculate_anchored_vwap(df: pd.DataFrame, anchor_date: str) -> pd.Series:
        typical_price = (df["High"] + df["Low"] + df["Close"]) / 3.0
        pv = typical_price * df["Volume"]

        mask = df.index >= pd.to_datetime(anchor_date)
        pv_anchored = pv.where(mask).fillna(0)
        v_anchored = df["Volume"].where(mask).fillna(0)

        cum_pv = pv_anchored.cumsum()
        cum_vol = v_anchored.cumsum()

        avwap = cum_pv / cum_vol
        return avwap.where(mask)

    @staticmethod
    def calculate_volume_profile(df: pd.DataFrame, bins: int = 50) -> Dict[str, float]:
        price_min = df["Low"].min()
        price_max = df["High"].max()
        if price_min == price_max or np.isnan(price_min) or np.isnan(price_max):
            return {"POC": 0.0, "VAL": 0.0, "VAH": 0.0}

        price_bins = np.linspace(price_min, price_max, bins)
        typical_price = (df["High"] + df["Low"] + df["Close"]) / 3.0
        hist, bin_edges = np.histogram(typical_price, bins=price_bins, weights=df["Volume"])

        max_idx = int(np.argmax(hist))
        poc = float((bin_edges[max_idx] + bin_edges[max_idx + 1]) / 2.0)

        total_vol = np.sum(hist)
        target_vol = total_vol * 0.70
        accum_vol = hist[max_idx]

        up_idx = max_idx
        down_idx = max_idx

        while accum_vol < target_vol:
            next_up = hist[up_idx + 1] if up_idx + 1 < len(hist) else 0
            next_down = hist[down_idx - 1] if down_idx - 1 >= 0 else 0

            if next_up == 0 and next_down == 0:
                break

            if next_up >= next_down and up_idx + 1 < len(hist):
                up_idx += 1
                accum_vol += next_up
            elif down_idx - 1 >= 0:
                down_idx -= 1
                accum_vol += next_down

        val = float(bin_edges[down_idx])
        vah = float(bin_edges[up_idx + 1])

        return {"POC": poc, "VAL": val, "VAH": vah}


@dataclass
class TradeSignal:
    timestamp: datetime
    action: str  # BUY_CONFIRMED, HOLD, DEFENSIVE_EXIT, REJECT
    score: int
    current_price: float
    target_shares: int
    stop_loss: float
    reasons: list


class CasarioSystemEngine:
    """Motore con logica a 4 quadranti, Fed net liquidity e gestione del rischio."""

    def __init__(self, capital: float = 100000.0, risk_per_trade: float = 0.01, anchor_date: Optional[str] = None):
        self.capital = capital
        self.risk_per_trade = risk_per_trade
        self.anchor_date = anchor_date if anchor_date else (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    def evaluate(self, df: pd.DataFrame, net_liquidity_growing: bool = True, macro_quadrant: int = 1) -> TradeSignal:
        reasons = []

        df["ATR"] = QuantitativeMetrics.calculate_atr(df)
        df["Z_Score"], df["SMA_20"] = QuantitativeMetrics.calculate_zscore(df["Close"])
        df["AVWAP"] = QuantitativeMetrics.calculate_anchored_vwap(df, self.anchor_date)
        df["VIX_Ratio"] = df["VIX"] / df["VIX3M"]

        last = df.iloc[-1]
        score = 50

        # Filtro Liquidita Fed
        if net_liquidity_growing:
            score += 15
            reasons.append("Net Liquidity Fed in espansione (+15)")
        else:
            score -= 20
            reasons.append("Net Liquidity Fed in contrazione (-20)")

        # Filtro Quadrante Macro
        if macro_quadrant == 1:
            score += 15
            reasons.append("Macro Quadrante 1 (Goldilocks: Growth+, Inf-) (+15)")
        elif macro_quadrant == 4:
            score -= 25
            reasons.append("Macro Quadrante 4 (Deflation/Recession) (-25)")

        # Term structure VIX
        if last["VIX_Ratio"] < 0.92:
            score += 10
            reasons.append(f"VIX Term Structure in sano Contango ({last['VIX_Ratio']:.2f}) (+10)")
        elif last["VIX_Ratio"] > 1.00:
            score -= 30
            reasons.append(f"ALERT: VIX in Backwardation ({last['VIX_Ratio']:.2f}) (-30)")

        # Posizione rispetto all'AVWAP
        is_above_avwap = last["Close"] > last["AVWAP"]
        if is_above_avwap:
            score += 10
            reasons.append("Prezzo sopra AVWAP di ancoraggio (+10)")
        else:
            score -= 10
            reasons.append("Prezzo sotto AVWAP di ancoraggio (-10)")

        # Controllo Z-Score (anti-chasing)
        if last["Z_Score"] > 2.0:
            score -= 25
            reasons.append(f"Eccesso statistico ipercomprato (Z-Score: {last['Z_Score']:.2f}) (-25)")
        elif -2.0 <= last["Z_Score"] <= -0.8 and is_above_avwap:
            score += 15
            reasons.append(f"Pullback statistico ottimale su AVWAP (Z-Score: {last['Z_Score']:.2f}) (+15)")

        # Position Sizing
        current_atr = last["ATR"] if not np.isnan(last["ATR"]) else last["Close"] * 0.02
        stop_distance = 2.0 * current_atr
        stop_loss_price = last["Close"] - stop_distance

        regime_multipliers = {1: 1.2, 2: 0.8, 3: 0.4, 4: 0.0}
        regime_mult = regime_multipliers.get(macro_quadrant, 0.5)

        monetary_risk = self.capital * self.risk_per_trade * regime_mult
        raw_shares = monetary_risk / stop_distance if stop_distance > 0 else 0.0
        shares = int(np.floor(raw_shares))

        # Definizione Azione
        if score >= 75 and last["VIX_Ratio"] < 1.0 and last["Z_Score"] < 1.5:
            action = "BUY_CONFIRMED"
        elif score <= 35 or last["VIX_Ratio"] >= 1.05:
            action = "DEFENSIVE_EXIT"
            shares = 0
        else:
            action = "HOLD"
            shares = 0

        return TradeSignal(
            timestamp=df.index[-1],
            action=action,
            score=int(np.clip(score, 0, 100)),
            current_price=round(float(last["Close"]), 2),
            target_shares=shares,
            stop_loss=round(float(stop_loss_price), 2),
            reasons=reasons
        )
