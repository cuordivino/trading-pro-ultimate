---
name: market-quantum-copilot
investor: "Market Quantum Co-Pilot (Autonomous Multi-Agent)"
style: "Multi-Agent Quantitative Consensus, Volume Profile & Anti-Panic Execution"
category: "Quantitative & Algorithmic Execution"
timeHorizon: "Intraday & Swing (1h - Daily)"
has_invest: true
description: "Architettura ensemble a 4 agenti (Macro, Flow, Cross-Asset, Momentum) con soglia minima |S| >= 0.70, Volume Profile (POC/VAH/VAL), simulatore Monte Carlo 1.000 run e guardiano anti-panico con kill-switch -3% e regola dell'1% di rischio."
---

# Market Quantum Co-Pilot™

Sistema deterministico ad alta confidenza per trading quantitativo e disciplina comportamentale.

## 1. Architettura Multi-Agente
- **Agente Macro & Fondamentale (Peso 0.25):** Tassi, bilanci societari, utili EPS, dati SEC EDGAR e guidance.
- **Agente Microstruttura & Order Flow (Peso 0.35):** Assorbimento ordini, POC (Point of Control) e squilibrio bid/ask.
- **Agente Correlazioni Cross-Asset (Peso 0.20):** DXY Dollar Index, rendimenti Treasury bond e indici settoriali.
- **Agente Momentum & Analisi Tecnica (Peso 0.20):** Compressione EMA Ribbon (9/21/200), VWAP di sessione e asimmetria convessa.

## 2. Regola del Consenso e Veto Asimmetrico
- Soglia minima di emissione del segnale: Score >= +0.70 (BUY) oppure Score <= -0.70 (SELL).
- Valori compresi tra -0.69 e +0.69 forzano lo stato **WATCHLIST / FLAT**: nessun capitale viene esposto al rumore di mercato.
- **Veto Immediato (Halt):** News ad alto impatto entro 15 minuti, spread > 0.30% o allucinazione numerica sui bilanci bloccano all'istante l'operazione.

## 3. Volume Profile & Simulatore Monte Carlo (1.000 Run)
- Mappatura continua del Point of Control (POC), Value Area High (VAH) e Value Area Low (VAL).
- Test stocastico su 1.000 iterazioni forward: calcolo del Win Rate %, Value at Risk (VaR 95%) e rapporto R/R.

## 4. Guardiano Mentale Anti-Panico & Protezione Patrimoniale
- **Regola Rigida dell'1%:** Dimensione della posizione dimensionata esattamente sull'1% di capitale a rischio sul conto.
- **Kill-Switch a -3.00%:** Se il drawdown giornaliero raggiunge il 3%, l'operatività viene congelata per 24 ore.
- **Cooldown Anti-Revenge (60 Min):** Dopo 3 perdite consecutive, pausa forzata per disattivare l'eccitazione dell'amigdala e prevenire l'overtrading.

© TRADING PRO ULTIMATE™ by cuordivino - Tutti i diritti riservati.
