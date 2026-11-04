# ⚡ TRADING PRO ULTIMATE™

> **Piattaforma Web Istituzionale di Trading Quantitativo, Analisi Multimercato & Investor Intelligence**  
> **Autore & Sviluppatore:** `cuordivino`  
> **Copyright:** © Tutti i diritti riservati — All Rights Reserved  
> **Sito Live su GitHub Pages:** [https://cuordivino.github.io/trading-pro-ultimate/](https://cuordivino.github.io/trading-pro-ultimate/)

---

## 🏛️ Paternità dell'Opera & Note Legali
Questo software e la sua architettura grafica e algoritmica sono stati ideati e sviluppati da **cuordivino**.  
Tutti i diritti di proprietà intellettuale, logiche di interfacciamento, modelli di position sizing, visualizzatori e connettori istituzionali sono protetti da copyright.

---

## 🌟 Panoramica & Moduli Integrati

La piattaforma unisce l'operatività discrezionale e tecnica ad alta fedeltà con i più potenti motori di finanza quantitativa e machine learning open-source e istituzionali al mondo:

### 1. 🤖 I 4 Motori Quantitativi Istituzionali
- **Freqtrade (Crypto & Machine Learning):**
  - Strategie Trend Following & FreqAI: *Supertrend Alpha v3*, *FreqAI XGBoost TrendRider*, *TWAP & Almgren-Chriss Execution*, *CustomStoploss PSAR & Trailing Lock*.
  - Calcolo live di segnali, win rate atteso, profit factor e stop loss algoritmico.
- **Hummingbot (High-Frequency Trading & Market Making):**
  - Modello di riserva accademico *Avellaneda-Stoikov* ($r(s, q) = s - q \gamma \sigma^2 (T - t)$) per la cattura sistematica dello spread bid-ask.
  - Simulatore e visualizzatore in tempo reale di **Order Book Imbalance (OBI)** e profondità di book.
- **NautilusTrader (Multi-Asset: Azioni, Crypto, Forex):**
  - Architettura event-driven a bassissima latenza (microsecondi).
  - Matrice di correlazione multi-asset (Crypto, S&P 500, Oro, DXY, Borsa Italiana Milano).
  - Indice di tossicità del flusso d'ordini **VPIN** (Volume-Synchronized Probability of Toxicity) e **Smart Order Routing (SOR)** fra venue multiple.
- **OpenBB Platform (Ricerca Quantitativa, Fondamentali e Dati Macro):**
  - Scorecard di bilancio: **Altman Z-Score** (probabilità di insolvenza), **Piotroski F-Score** (salute fondamentale), multipli EV/EBITDA, P/E e Free Cash Flow Yield.
  - Cruscotto Macro: **Curva dei Rendimenti USA (Treasury 10Y - 2Y Spread)**, disinversione, Fed Funds Rate e inflazione CPI.

---

### 2. 📲 Bot Telegram Ufficiale & Segnali Motivati
- Connessione integrata con il Bot Telegram ufficiale di **cuordivino**:
  - **Token Telegram:** preconfigurato e protetto nel terminale.
  - **Chat ID:** collegato direttamente al canale dedicato.
- **Segnali Motivati:** Ogni ordine generato o delibera del comitato può essere inviato con un click tramite il pulsante `📲 Invia Segnale Motivano su Telegram`.
- Il segnale include:
  - Asset, direzione (LONG/SHORT) e leva
  - Prezzi precisi di Entry, Stop Loss, Target 1 e Target 2 (Runner)
  - Rapporto Rischio/Rendimento (R/R)
  - Punteggio di Consensus e verdetto
  - **Motivazione tecnica e mentor dettagliata**
  - Stato e convalida dei 4 motori quantitativi

---

### 3. 🧠 Comitato Investitori AI (63 Grandi Maestri)
- **Consiglio Decisionale:** Delibera corale in tempo reale convocando *Warren Buffett, Mark Minervini, Ray Dalio, Jim Simons, Michael Burry e Jesse Livermore*.
- **I 6 Pilastri Decisionali:** Moat & Intrinsic Value, Trend VCP, Ciclo Macro & Risk Parity, Anomalia Quant Z-Score, Asimmetria Contrarian, Punti Pivot & Tape Reading.
- **Chat 1-on-1 interattiva:** Dialogo diretto con ogni singola personalità per testare le tesi d'investimento.
- **Hub Enciclopedia delle 63 Skills:** Catalogo completo con filtri e schede metodologiche approfondite.

---

### 4. 📈 Terminale Operativo & Grafica Istituzionale Dark Glass
- **Lightweight Charts TradingView** professionali con supporto multi-timeframe (1m, 5m, 15m, 1h, 4h, 1D).
- Overlay indicatori tecnici dinamici (EMA 20/50/200, Bande di Bollinger, Parabolic SAR, RSI, MACD).
- Calcolatore di **Position Sizing Scientifico** (Half-Kelly, Minervini Strict -7%, Volatility Parity).
- Scaglioni Multi-Target TP1, TP2, TP3.
- Diario di trading con metriche di rendimento (Win Rate %, Profit Factor, Realized PnL).

---

## 🚀 Utilizzo

### Modalità Static Web (GitHub Pages)
L'applicazione è interamente fruibile in modalità client-side ad alta velocità:
[https://cuordivino.github.io/trading-pro-ultimate/](https://cuordivino.github.io/trading-pro-ultimate/)

### Modalità Server Locale (Python Flask)
```bash
# Installa le dipendenze
pip install -r requirements.txt

# Avvia la piattaforma
python run.py
```
Il terminale sarà accessibile all'indirizzo `http://127.0.0.1:5000`.

---
*Trading Pro Ultimate™ © by cuordivino — Tutti i diritti riservati.*
