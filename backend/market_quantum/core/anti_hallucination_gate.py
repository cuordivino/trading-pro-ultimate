from typing import Dict, Any, Tuple

class FactCheckingGate:
    @classmethod
    def validate_earnings(cls, raw_feed: Dict[str, Any], ai_output: Dict[str, Any]) -> Tuple[bool, str]:
        actual = raw_feed.get("actual_eps")
        est = raw_feed.get("estimated_eps")
        action = ai_output.get("action", "")
        if actual is not None and est is not None:
            if (actual > est and action == "SELL_SETUP") or (actual < est and action == "BUY_SETUP"):
                return False, "Discordanza numerica rilevata tra trimestrale e segnale IA!"
        return True, "Validato"

    @classmethod
    def sanitize(cls, raw_data: Dict[str, Any], ai_payload: Dict[str, Any]) -> Dict[str, Any]:
        ok, msg = cls.validate_earnings(raw_data, ai_payload)
        if not ok:
            ai_payload["action"] = "SECURITY_HOLD"
            ai_payload["confidence_score"] = 0.0
            ai_payload["trader_narrative"] = f"Bloccato da Fact-Checking Gate: {msg}"
        return ai_payload
