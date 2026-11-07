import numpy as np
from typing import Dict, Any

class MonteCarloSimulator:
    @staticmethod
    def run_simulation(entry: float, stop: float, target: float, win_rate: float = 0.55) -> Dict[str, Any]:
        r_mult = abs(target - entry) / max(0.0001, abs(entry - stop))
        outcomes = np.random.choice([r_mult, -1.0], size=(1000, 20), p=[win_rate, 1.0 - win_rate])
        cum = np.cumsum(outcomes, axis=1)[:, -1]
        return {
            "risk_reward_ratio": round(r_mult, 2),
            "win_probability_pct": round(float(np.mean(cum > 0) * 100), 1),
            "var_95_r": round(float(np.percentile(cum, 5)), 2)
        }
