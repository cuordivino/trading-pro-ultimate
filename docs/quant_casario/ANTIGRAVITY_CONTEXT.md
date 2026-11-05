# Antigravity Context: Quantitative Semi-Automatic Trading Engine

## Obiettivo del Progetto
Sviluppare un'applicazione di trading semi-automatico multi-asset con esecuzione su approvazione dell'utente (One-Click Approval Gate con TTL 10s).
L'algoritmo replica ed estende il framework quantitativo top-down di Marco Casario: Macro Regimi -> Breadth & Volatility -> Volume Profile/AVWAP -> Position Sizing ATR.

## Universo Investibile
- **Azioni Italiane:** FTSE MIB e STAR Mid-Cap (Borsa Italiana MTA).
- **Azioni USA:** S&P 500, Nasdaq 100, Mid-Cap.
- **Forex:** EUR/USD, cross G10 (Volumi da Futures CME o TPO).
- **Commodities:** Oro (GC), Petrolio (CL), Rame (HG) con analisi di Term Structure (Contango/Backwardation).

## Regole di Business e Vincoli Critici (Do Not Violate)
1. **Regime Macro a 4 Quadranti:** Calcolato su RoC a 6 mesi di Crescita e Inflazione.
2. **Fed Net Liquidity:** WALCL - WTREGEN - (RRPONTSYD * 1000). Se divergente dall'indice, bloccare acquisti a breakout.
3. **Volatilità e Term Structure:** Rapporto VIX/VIX3M (e VSTOXX). Se > 1.00 (Backwardation/Panico), scatta il Circuit Breaker: bloccare ordini Long.
4. **Specifiche Italia:**
   - Filtro Amihud e Spread Bid-Ask (> 0.35% = solo ordini Limit passivi sul Bid).
   - Congelamento tick asta di chiusura (17:30 - 17:35 CET).
   - Blocco bancari e Mid-Cap se Spread BTP/Bund 10Y > 190-200 bps.
5. **Specifiche Forex:** Hard Lock esecuzioni durante il Rollover notturno (22:55 - 23:20 CET).
6. **Matrice Frattale Multi-Timeframe:**
   - 1m - 5m: Peso primario su Microstruttura, Orderbook Imbalance e Session AVWAP.
   - 1h - 1D: Peso su VIX Curve, Market Breadth e Livelli Macro.
   - 1W - 1M: Peso su Modello a 4 Quadranti e Ciclo Liquidità Banche Centrali.
7. **Rischio Frattale:** Position Sizing parametrato su Stop Loss = k * ATR(14), modulato sul profilo utente (0.5% - 2.0% di rischio capitale).

## File di Riferimento nel Repository
- `docs/01_architettura_e_studio_completo.md`: Modelli matematici e formule esatte.
- `docs/02_multi_asset_realtime_spec.md`: Regole microstrutturali per IT, US, FX, Commodities.
- `docs/03_matrice_frattale_timeframe.md`: Pesi dinamici e matrice di correlazione temporale.
- `docs/04_antigravity_integration_guide.md`: Guida all'architettura per Antigravity.
- `src/`: Moduli Python di calcolo real-time e ranking screener.
