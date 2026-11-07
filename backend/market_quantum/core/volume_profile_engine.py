import numpy as np
from typing import List, Dict, Any

class VolumeProfileEngine:
    @staticmethod
    def calculate_profile(trades: List[Dict[str, float]], num_bins: int = 50) -> Dict[str, Any]:
        if not trades:
            return {"error": "Nessun trade"}
        prices = np.array([t["price"] for t in trades])
        volumes = np.array([t["volume"] for t in trades])
        bins = np.linspace(np.min(prices), np.max(prices), num_bins)
        digitized = np.digitize(prices, bins)
        vol_per_bin = np.zeros(num_bins)
        for i, b in enumerate(digitized):
            vol_per_bin[min(b-1, num_bins-1)] += volumes[i]
        poc_idx = int(np.argmax(vol_per_bin))
        return {
            "poc": float(bins[poc_idx]),
            "vah": float(bins[min(num_bins-1, poc_idx + 8)]),
            "val": float(bins[max(0, poc_idx - 8)])
        }
