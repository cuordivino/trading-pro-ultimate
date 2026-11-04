# ⚡ TRADING PRO ULTIMATE × INVESTOR SKILLS AI TERMINAL

> **Sito e Piattaforma Web Interattiva per Trading e Analisi degli Investimenti**, integrando il motore di trading e position sizing di **Trading Pro Ultimate** (`cuordivino/trading-pro-ultimate`) con l'intelligenza di giudizio dei 63 modelli mentali dei grandi investitori della storia di **Investor Skills** (`questflowai/investorskills`).

---

## 🌟 Panoramica del Progetto

Il progetto unisce:
1. **L'architettura operativa di Trading Pro Ultimate**:
   - Grafici professionali in tempo reale con **TradingView Lightweight Charts**.
   - Analisi tecnica multi-timeframe (1m, 5m, 15m, 1h, 4h, 1D).
   - Indicatori tecnici: **EMA (20/50/200), Bande di Bollinger, Parabolic SAR, RSI (14), MACD**.
   - Motore di calcolo del **Position Sizing**, Risk/Reward (R:R), margine richiesto e stop loss dinamico.
   - Simulatore Paper Trading e connettività broker (**Bybit, Alpaca, TwelveData**).
   - Gestione del rischio con **Circuit Breakers** (limite perdita giornaliera, drawdown stop, cooldown).
   - **Diario di Trading** (Trade Journal) con statistiche di performance (Win Rate %, Profit Factor, Net PnL).
   - Sistema di **Allarmi di Prezzo e Notifiche Telegram**.

2. **La suite di giudizio di InvestorSkills (63 Grandi Investitori)**:
   - **Comitato di Investimento AI (Consensus Committee)**: delibera corale in tempo reale su qualsiasi titolo o crypto convocando Warren Buffett, Mark Minervini, Ray Dalio, Jim Simons, Michael Burry e Jesse Livermore.
   - **Consensus Scorecard (0-100)** con livello di Conviction, Target Price di consenso e Stop Loss di invalidazione.
   - **Chat 1-on-1 con i Grandi Maestri**: conversazione interattiva con le singole personalità (Buffett, Minervini, Dalio, Simons, Burry, Lynch, Hayes, Wood, Ackman, ecc.) applicando le loro regole mentali e formule all'asset selezionato.
   - **Hub Enciclopedia delle 63 Skills**: catalogo navigabile con filtri per categoria (*Value & Moat*, *Macro & Cicli*, *Momentum / VCP*, *Quant & Stat-Arb*, *Short & Forensic*, *Attivismo*, *Crypto Native*, *VC & Tech*), schemi d'investimento YAML `invest.md` e trigger d'ingresso/uscita.

---

## 🏛️ Struttura della Cartella

```text
trading-platform/
├── backend/
│   ├── app.py              # Server Flask REST API + Servizio Statico Frontend
│   ├── skills_engine.py    # Motore di valutazione multi-persona e chat InvestorSkills
│   ├── market_data.py      # Flussi dati in tempo reale (Crypto, Borsa Italiana MTA, USA Tech, ETF)
│   ├── risk_manager.py     # Gestione del rischio, circuit breakers e modelli di sizing
│   ├── database.py         # Database SQLite persistente (trades, allarmi, impostazioni)
│   └── brokerage.py        # Connettore Broker (Paper Trading, Bybit, Alpaca, Telegram)
├── frontend/
│   ├── index.html          # Applicazione Web ad alta densità informativa (Bloomberg Terminal style)
│   ├── css/
│   │   └── terminal.css    # Stile istituzionale dark theme con finiture al neon e glassmorphism
│   └── js/
│       ├── app.js          # Inizializzazione, marquee ticker tape, ricerca rapida Ctrl+K
│       ├── chart.js        # Grafici a candele e indicatori tecnici (Lightweight Charts)
│       ├── skills.js       # Comitato di consenso, hub 63 skills e chat interattiva
│       ├── trading.js      # Esecuzione ordini e position sizing reattivo
│       ├── journal.js      # Diario di bordo con statistiche e calcolo del PnL
│       └── alerts.js       # Allarmi e test webhook Telegram
├── skills_repo/            # Archivio completo delle 63 Investor Skills (invest.md, SKILL.md, docs)
├── run.py                  # Script di avvio con apertura automatica del browser
└── README.md
```

---

## 🚀 Come Avviare la Piattaforma

1. Apri un terminale nella cartella del progetto:
   ```powershell
   cd C:\Users\User\.gemini\antigravity\scratch\trading-platform
   ```

2. Avvia la piattaforma con il comando:
   ```powershell
   python run.py
   ```

3. Lo script avvierà il server Flask locale sulla porta `5000` e aprirà automaticamente il browser predefinito all'indirizzo:
   👉 **`http://localhost:5000`**

---

## 💡 Guida Rapida alle Sezioni della Piattaforma

### 1. 📈 Terminale Pro
- **Grafico Principale**: candele giapponesi in tempo reale con volumi integrati.
- **Barra Intervalli**: cambia al volo tra `1m`, `5m`, `15m`, `1h`, `4h`, `1D`.
- **Indicatori On/Off**: attiva o disattiva con un click le **EMA (20, 50, 200)**, **Bande di Bollinger**, **Parabolic SAR**, o apri i sotto-grafici per **RSI (14)** e **MACD**.
- **Pannello d'Ordine**: imposta la leva (da `1x` a `30x`), scegli `LONG` o `SHORT`, definisci Entry, Stop Loss e Take Profit. Il calcolatore mostrerà all'istante le unità da acquistare, il margine necessario, il rischio in euro e il rapporto R:R.
- **Widget Quick Consensus**: sintesi immediata del punteggio del Comitato sul titolo visualizzato.

### 2. 🧠 Comitato Investitori (Consensus AI)
- Seleziona un titolo (es. `BTCUSDT`, `NVDA`, `AAPL`, `ENEL.MI`) e apri questa scheda.
- L'algoritmo valuta i prezzi, le medie mobili, le contrazioni di volatilità (VCP), i volumi e la distanza dai massimi.
- Visualizza i verdetti dettagliati di:
  - **Warren Buffett** (Moat, Owner Earnings, Margine di Sicurezza)
  - **Mark Minervini** (Stage 2 Uptrend, VCP, Volume Dry-up, Pivot Breakout)
  - **Ray Dalio** (Regime Macro, Ciclo del Debito, Risk Parity)
  - **Jim Simons** (Z-Score Quantitativo, Mean Reversion probabilistica)
  - **Michael Burry** (Scommessa Asimmetrica Contrarian, Anomalie di prezzo)
  - **Jesse Livermore** (Punto Pivot Chiave, Linea di Minor Resistenza)
- Con un click su **"Applica Parametri al Trade"**, i target price e stop loss del comitato vengono trasferiti direttamente nel modulo d'ordine!

### 3. 💬 Chat Interattiva con i Grandi Maestri
- Scegli un maestro dalla barra laterale (Buffett, Minervini, Dalio, Simons, Burry, Livermore, Lynch, Hayes, ecc.).
- Fai domande dirette sull'asset selezionato:
  - *"Cosa ne pensi del trend attuale?"*
  - *"Quale sarebbe il tuo stop loss matematico?"*
  - *"Cosa invaliderebbe la tua tesi d'investimento?"*
- Il motore risponderà applicando fedelmente il modello mentale codificato nello schema `invest.md` di quella skill.

### 4. 📚 Hub 63 Investor Skills
- Catalogo completo dei 63 modelli mentali d'investimento.
- Filtra per stile di trading (*Value*, *Macro*, *Momentum/VCP*, *Quant*, *Short*, *Attivismo*, *Crypto*, *VC*).
- Clicca su **"Dettagli & Regole"** per ispezionare i segnali d'ingresso, i filtri di esclusione e le formule di dimensionamento della posizione.

### 5. 📐 Position Sizer & Risk Management
- Studio dedicato al calcolo della size ideale secondo 3 diverse filosofie:
  1. **Standard Fixed Fractional** (percentuale fissa sul capitale di Trading Pro)
  2. **Minervini Strict Cut** (taglio rigido al -7% con incremento sui trade vincenti)
  3. **Parità di Volatilità / ATR** (dimensionamento inversamente proporzionale all'ATR)

### 6. 📓 Diario di Trading & Performance
- Registro di tutte le posizioni aperte e chiuse.
- Calcolo automatico di **Win Rate %**, **Profit Factor** e **PnL Netto cumulativo**.
- Possibilità di chiudere le posizioni aperte al prezzo di mercato con un click.

### 7. 🔔 Allarmi & Impostazioni
- Configura allarmi sonori e visivi per rotture di livelli chiave.
- Collega il tuo **Bot Telegram** per ricevere notifiche istantanee all'apertura dei trade o al raggiungimento dei target.
- Imposta le chiavi API opzionali per **Bybit** o **Alpaca** se desideri operare in Live o Testnet.
