# Sistema Quantitativo Semi-Automatico Multi-Asset (Antigravity Integration)

Questo archivio racchiude in modo esaustivo l'intero studio, le architetture logico-matematiche, i modelli quantitativi, i filtri macro/volatilità e il codice sorgente Python sviluppati per replicare ed estendere il framework quantitativo di Marco Casario (e piattaforme come Quantaste) all'interno del progetto Antigravity.

---

## Struttura del Progetto nel Pacchetto ZIP

1. **`ANTIGRAVITY_CONTEXT.md`**
   - File master di contesto / system prompt da caricare direttamente nell'agente di Antigravity per avviare il progetto senza dispersione di contesto.

2. **`docs/01_architettura_e_studio_completo.md`**
   - Studio completo e trascrizione logico-matematica di tutte le componenti.
   - Modello top-down a 3 livelli: Macro Regime, Market Breadth / Cross-Asset, Execution & Risk Management.
   - Modello a 4 quadranti (Growth/Inflation).
   - Indice Fed Net Liquidity (formula esatta, serie FRED: WALCL, WTREGEN, RRPONTSYD).
   - Term structure della volatilità (VIX vs VIX3M, VSTOXX, curve di rischio).
   - Microstruttura volumetrica: Anchored VWAP (AVWAP), Volume Profile (POC, VAH, VAL), Z-Score.

3. **`docs/02_multi_asset_realtime_spec.md`**
   - Specifiche per Borsa Italiana (FTSE MIB e Mid-Cap: ratio Amihud, asta 17:30, dividend washing).
   - Specifiche US Equities (S&P 500, Nasdaq, Dark Pool, GEX & Zero Gamma).
   - Specifiche Forex (EUR/USD, OTC vs CME Futures 6E, Rollover 23:00 CET, Swap fee).
   - Specifiche Commodities (Roll Yield, Curve Futures Contango vs Backwardation, Continuous back-adjustments).
   - Specifiche Rischio Sovrano Italia (Spread BTP/Bund a 10Y con blocco a 190-200 bps).

4. **`docs/03_matrice_frattale_timeframe.md`**
   - Sistema multi-timeframe da 1 minuto (scalping/order flow) a 1 mese (macro asset allocation).
   - Ricalibrazione dinamica dei pesi di scoring (W_macro, W_trend, W_volume, W_zscore).
   - Matrice di confluenza e allineamento dei vettori di tendenza.
   - Regole di normalizzazione universale tramite tangente iperbolica tanh.

5. **`docs/04_antigravity_integration_guide.md`**
   - Guida passo-passo per agganciare questo codice all'ambiente Antigravity.
   - Gestione code asincrone (ZeroMQ/Redis/IPC), interfacce WebSocket, layout della griglia UI e OCO safety-gate con TTL.

6. **`src/core_engine.py`**
   - Motore quantitativo di base con calcolo indicatori (ATR, Z-Score, AVWAP, Volume Profile, VIX Ratio).
   - Scoring composito da 0 a 100 e gate semi-automatico.

7. **`src/realtime_multi_asset_engine.py`**
   - Architettura ad anello in memoria (Circular Deque Buffers O(1)) per tick ad altissima frequenza.
   - Tracciamento real-time differenziato per US_EQUITY, IT_EQUITY, FOREX, COMMODITY.
   - Circuit breakers, filtri spread e calcolo esatto della size con Money Management.

8. **`src/multi_timeframe_ranker.py`**
   - Motore di ranking dinamico per griglia/screener interattivo con supporto Long/Short.
   - Parametrizzazione su orizzonti temporali (1m, 15m, 1h, 1d, 1w) e profili di rischio (Conservativo, Moderato, Aggressivo).
