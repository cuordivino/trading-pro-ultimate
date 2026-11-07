from typing import Dict, Any

class MultiAgentEnsemble:
    def __init__(self):
        self.weights = {
            "macro_fundamental": 0.25,
            "order_flow_microstructure": 0.35,
            "cross_asset_correlation": 0.20,
            "technical_momentum": 0.20
        }
        self.CONFIRMATION_THRESHOLD = 0.70

    def evaluate_consensus(self, scores: Dict[str, float], veto_conditions: Dict[str, bool]) -> Dict[str, Any]:
        for veto_name, is_active in veto_conditions.items():
            if is_active:
                return {"action": "VETO_HALT", "approved": False, "reason": f"VETO ATTIVATO: {veto_name}."}
        total_score = sum(max(-1.0, min(1.0, scores.get(k, 0.0))) * w for k, w in self.weights.items())
        total_score = round(total_score, 4)
        approved = abs(total_score) >= self.CONFIRMATION_THRESHOLD
        action = "BUY_SETUP" if total_score >= self.CONFIRMATION_THRESHOLD else ("SELL_SETUP" if total_score <= -self.CONFIRMATION_THRESHOLD else "WATCHLIST_NEUTRAL")
        return {"action": action, "approved": approved, "total_score": total_score, "confidence": round(abs(total_score) * 100, 2)}
