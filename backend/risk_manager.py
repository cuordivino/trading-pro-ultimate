from dataclasses import dataclass
from typing import Tuple, Dict, Any, List

@dataclass
class RiskProfile:
    name: str
    max_leverage: int
    stake_amount_pct: float
    max_stop_loss_pct: float
    take_profit_target_pct: float
    max_daily_drawdown_pct: float
    cooldown_period_hours: float

PROFILES = {
    "conservative": RiskProfile("Conservativo (Buffett/Graham)", 2, 0.01, -0.05, 0.15, -0.02, 2.0),
    "moderate": RiskProfile("Moderato (Dalio/Lynch)", 10, 0.02, -0.07, 0.18, -0.03, 1.0),
    "aggressive": RiskProfile("Aggressivo (Druckenmiller/Minervini)", 30, 0.03, -0.08, 0.25, -0.05, 0.5)
}

class RiskManager:
    def __init__(self, profile_name: str = "moderate"):
        self.profile = PROFILES.get(profile_name, PROFILES["moderate"])
        self.daily_pnl_pct = 0.0
        self.total_drawdown_pct = 0.0
        self.consecutive_losses = 0

    def check_circuit_breakers(self) -> Tuple[bool, str]:
        # Circuit breaker 1: Daily loss limit
        if self.daily_pnl_pct <= self.profile.max_daily_drawdown_pct:
            return False, f"CIRCUIT BREAKER ATTIVO: Limite di perdita giornaliera ({abs(self.profile.max_daily_drawdown_pct)*100:.1f}%) raggiunto!"
        
        # Circuit breaker 2: Consecutive loss cooldown
        if self.consecutive_losses >= 3:
            return False, "CIRCUIT BREAKER ATTIVO: 3 perdite consecutive. Periodo di cooldown obbligatorio di 1h."

        return True, "PARAMETRI DI RISCHIO OTTIMALI - TRADING CONSENTITO"

    def calculate_position(self, capital: float, entry: float, sl: float, tp: float = None, 
                           risk_pct: float = 1.5, leverage: int = 1, mode: str = "standard", 
                           atr: float = None, win_rate: float = 55.0) -> Dict[str, Any]:
        if entry <= 0 or sl <= 0:
            return {"error": "Entry e Stop Loss devono essere maggiori di 0"}

        side = "LONG" if entry > sl else "SHORT"
        distanza_sl = abs(entry - sl)
        distanza_pct = (distanza_sl / entry) * 100

        # Enforce maximum stop loss per risk profile
        max_allowed_sl_pct = abs(self.profile.max_stop_loss_pct) * 100
        warning = None
        if distanza_pct > max_allowed_sl_pct:
            warning = f"Attenzione: Lo stop loss ({distanza_pct:.1f}%) supera il limite prudenziale del profilo ({max_allowed_sl_pct:.1f}%)."

        # Capital at risk in currency
        rischio_valuta = capital * (risk_pct / 100.0)

        def format_units(raw_val: float) -> float:
            if raw_val <= 0: return 0.0
            if raw_val < 1.0:
                return round(raw_val, 4)
            elif raw_val < 10.0:
                return round(raw_val, 2)
            else:
                return round(raw_val, 1)

        # Mode calculation
        if mode == "minervini":
            distanza_sl = max(distanza_sl, entry * 0.04)
            units = format_units(rischio_valuta / distanza_sl) if distanza_sl > 0 else 0.0
        elif mode == "volatility" and atr and atr > 0:
            units = format_units(rischio_valuta / (atr * 1.5))
        elif mode == "kelly":
            rr_est = (abs(tp - entry) / distanza_sl) if tp and distanza_sl > 0 else 2.0
            p = win_rate / 100.0
            q = 1.0 - p
            kelly_f = max(0.005, min(0.05, ((p * rr_est) - q) / rr_est * 0.5))
            rischio_valuta = capital * kelly_f
            units = format_units(rischio_valuta / distanza_sl) if distanza_sl > 0 else 0.0
        else:
            units = format_units(rischio_valuta / distanza_sl) if distanza_sl > 0 else 0.0

        valore_nominale = units * entry
        margine_richiesto = valore_nominale / max(1, leverage)

        # Multi-Target Take Profits (TP1, TP2, TP3)
        multi_tp = []
        if side == "LONG":
            tp1_price = round(entry + (distanza_sl * 1.5), 2)
            tp2_price = round(entry + (distanza_sl * 2.5), 2)
            tp3_price = round(entry + (distanza_sl * 4.0), 2)
        else:
            tp1_price = round(entry - (distanza_sl * 1.5), 2)
            tp2_price = round(entry - (distanza_sl * 2.5), 2)
            tp3_price = round(entry - (distanza_sl * 4.0), 2)

        multi_tp = [
            {'tier': 'TP1 (50% Size - Breakeven Lock)', 'price': tp1_price, 'rr': '1:1.5', 'profit': round(units * 0.5 * abs(tp1_price - entry), 2)},
            {'tier': 'TP2 (30% Size - Main Target)', 'price': tp2_price, 'rr': '1:2.5', 'profit': round(units * 0.3 * abs(tp2_price - entry), 2)},
            {'tier': 'TP3 (20% Size - Trend Runner)', 'price': tp3_price, 'rr': '1:4.0', 'profit': round(units * 0.2 * abs(tp3_price - entry), 2)}
        ]

        profitto_target = 0.0
        rr_ratio = 0.0
        if tp and tp > 0:
            profitto_target = units * abs(tp - entry)
            rr_ratio = abs(tp - entry) / distanza_sl if distanza_sl > 0 else 0.0

        # Liquidation price estimation
        # Liq for long = Entry * (1 - (1 / Leverage))
        # Liq for short = Entry * (1 + (1 / Leverage))
        if leverage > 1:
            liq_price = round(entry * (1 - (0.95 / leverage)), 2) if side == "LONG" else round(entry * (1 + (0.95 / leverage)), 2)
        else:
            liq_price = 0.0

        return {
            'side': side,
            'position_size_units': units,
            'valore_posizione': round(valore_nominale, 2),
            'margine_richiesto': round(margine_richiesto, 2),
            'rischio_valuta': round(rischio_valuta, 2),
            'profitto_potenziale': round(profitto_target, 2),
            'rr_ratio': round(rr_ratio, 2),
            'distanza_sl_pct': round(distanza_pct, 2),
            'liquidation_price': liq_price,
            'multi_tp': multi_tp,
            'warning': warning
        }

risk_manager = RiskManager("moderate")
