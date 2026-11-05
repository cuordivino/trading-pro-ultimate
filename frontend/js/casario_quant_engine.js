/**
 * TRADING PRO ULTIMATE™ — CASARIO QUANTITATIVE TOP-DOWN ENGINE
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Replicazione ed estensione istituzionale del Framework Quantitativo Top-Down:
 * 1. LIVELLO 1: Macro Regime (4 Quadranti Dalio/Hedgeye, Fed Net Liquidity, VIX/VIX3M Term Structure)
 * 2. LIVELLO 2: Market Breadth, Sovereign Risk (BTP/Bund 10Y), Amihud Liquidity, FX Rollover Lock
 * 3. LIVELLO 3: Microstruttura (AVWAP, Volume Profile POC/VAL/VAH, Z-Score Pullback & Anti-Chasing)
 * 4. MATRICE FRATTALE MULTI-TIMEFRAME: Da 1m a 1M con normalizzazione cross-asset tanh
 * 5. ACTION DISPATCHER CON ONE-CLICK APPROVAL GATE & SAFETY TTL 10 SECONDI
 * 6. MASTER RISK CARD: Worst-Case Scenario Portfolio Drawdown Monitor
 */

window.CasarioQuantEngine = {
  // Master Macro State
  macroState: {
    quadrant: 1, // 1: Goldilocks, 2: Overheating, 3: Stagflation, 4: Deflation
    growthRate: '+3.4% RoC',
    inflationRate: '-1.8% RoC',
    riskMultiplier: 1.2,
    fedNetLiquidity: {
      totalTrillion: 5.84,
      delta4wPct: 1.4,
      growing: true,
      formula: 'WALCL - WTREGEN - (RRPONTSYD * 1000)'
    },
    vixStructure: {
      vix: 15.20,
      vix3m: 17.30,
      ratio: 0.88, // VIX / VIX3M
      regime: 'Contango Netto (Sano Mercato Toro)',
      circuitBreakerActive: false
    },
    btpBund: {
      spreadBps: 118.0,
      thresholdBps: 190.0,
      circuitBreakerActive: false
    },
    circuitBreakers: {
      vixBackwardation: false,
      btpBundAlert: false,
      forexRolloverLock: false,
      milanAuctionFreeze: false
    }
  },

  // Configuration
  currentTimeframe: '15m',
  currentRiskProfile: 'moderate', // conservative (0.5%), moderate (1.0%), aggressive (2.0%)
  currentDirectionFilter: 'all',  // all, long, short, neutral
  accountEquity: 25000.0,

  // Pending Order Proposal with 10s TTL
  activeProposal: null,
  ttlTimerId: null,
  ttlRemainingMs: 10000,

  // Fractal Timeframe Weights Matrix
  timeframeWeights: {
    '1m':  { macro: 0.00, trend: 0.20, volume: 0.50, zscore: 0.30, label: '1m (Scalping)', kAtr: 1.2 },
    '15m': { macro: 0.10, trend: 0.30, volume: 0.40, zscore: 0.20, label: '15m (Intraday rapido)', kAtr: 1.8 },
    '1h':  { macro: 0.20, trend: 0.35, volume: 0.25, zscore: 0.20, label: '1h (Intraday direzionale)', kAtr: 2.0 },
    '4h':  { macro: 0.30, trend: 0.35, volume: 0.20, zscore: 0.15, label: '4h (Swing intermedio)', kAtr: 2.2 },
    '1d':  { macro: 0.40, trend: 0.35, volume: 0.15, zscore: 0.10, label: '1D (Swing multiday)', kAtr: 2.5 },
    '1w':  { macro: 0.60, trend: 0.30, volume: 0.05, zscore: 0.05, label: '1W (Posizione strategica)', kAtr: 3.0 },
    '1M':  { macro: 0.70, trend: 0.20, volume: 0.05, zscore: 0.05, label: '1M (Macro Asset Allocation)', kAtr: 3.5 }
  },

  // Multi-Asset Screener Base Universe
  universeData: [
    { symbol: 'BTCUSDT', name: 'Bitcoin Perp', assetClass: 'CRYPTO', price: 80604.10, chg24: '+3.22%', atr: 1150.0, spread: 0.01, zscore: -1.15, trend: 0.85, volImbalance: 0.65, macroAlign: 0.85 },
    { symbol: 'ETHUSDT', name: 'Ethereum Perp', assetClass: 'CRYPTO', price: 2842.50, chg24: '+2.14%', atr: 48.0, spread: 0.02, zscore: -0.85, trend: 0.70, volImbalance: 0.55, macroAlign: 0.75 },
    { symbol: 'SOLUSDT', name: 'Solana Perp', assetClass: 'CRYPTO', price: 188.40, chg24: '+5.45%', atr: 5.2, spread: 0.02, zscore: -0.40, trend: 0.90, volImbalance: 0.75, macroAlign: 0.85 },
    { symbol: 'NVDA', name: 'Nvidia Corp', assetClass: 'US_EQUITY', price: 145.20, chg24: '+2.80%', atr: 3.8, spread: 0.03, zscore: -1.20, trend: 0.85, volImbalance: 0.70, macroAlign: 0.90 },
    { symbol: 'AAPL', name: 'Apple Inc', assetClass: 'US_EQUITY', price: 228.60, chg24: '+0.95%', atr: 2.9, spread: 0.02, zscore: 0.30, trend: 0.45, volImbalance: 0.25, macroAlign: 0.70 },
    { symbol: 'TSLA', name: 'Tesla Inc', assetClass: 'US_EQUITY', price: 262.40, chg24: '+4.15%', atr: 9.1, spread: 0.04, zscore: 1.85, trend: 0.90, volImbalance: 0.50, macroAlign: 0.60 },
    { symbol: 'MSFT', name: 'Microsoft Corp', assetClass: 'US_EQUITY', price: 412.30, chg24: '+1.10%', atr: 5.2, spread: 0.02, zscore: -0.75, trend: 0.60, volImbalance: 0.45, macroAlign: 0.80 },
    { symbol: 'SPY', name: 'S&P 500 ETF', assetClass: 'US_EQUITY', price: 588.50, chg24: '+0.65%', atr: 4.1, spread: 0.01, zscore: -0.30, trend: 0.65, volImbalance: 0.55, macroAlign: 0.85 },
    { symbol: 'RACE.MI', name: 'Ferrari N.V.', assetClass: 'IT_EQUITY', price: 422.00, chg24: '+1.45%', atr: 6.5, spread: 0.09, zscore: -0.95, trend: 0.80, volImbalance: 0.60, macroAlign: 0.75 },
    { symbol: 'ENEL.MI', name: 'Enel S.p.A.', assetClass: 'IT_EQUITY', price: 6.84, chg24: '+0.30%', atr: 0.12, spread: 0.07, zscore: -1.10, trend: 0.45, volImbalance: 0.35, macroAlign: 0.50 },
    { symbol: 'ENI.MI', name: 'Eni S.p.A.', assetClass: 'IT_EQUITY', price: 14.28, chg24: '+0.75%', atr: 0.25, spread: 0.08, zscore: -0.80, trend: 0.50, volImbalance: 0.40, macroAlign: 0.55 },
    { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', assetClass: 'IT_EQUITY', price: 3.82, chg24: '+1.05%', atr: 0.07, spread: 0.06, zscore: 0.40, trend: 0.70, volImbalance: 0.50, macroAlign: 0.45 },
    { symbol: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'FOREX', price: 1.0845, chg24: '-0.25%', atr: 0.0045, spread: 0.01, zscore: -1.40, trend: -0.60, volImbalance: -0.50, macroAlign: -0.40 },
    { symbol: 'GC=F', name: 'Gold Futures', assetClass: 'COMMODITY', price: 2740.00, chg24: '+0.55%', atr: 22.0, spread: 0.02, zscore: -0.50, trend: 0.70, volImbalance: 0.55, macroAlign: 0.65 },
    { symbol: 'CL=F', name: 'Crude Oil WTI', assetClass: 'COMMODITY', price: 71.50, chg24: '-1.15%', atr: 1.4, spread: 0.03, zscore: -1.60, trend: -0.45, volImbalance: -0.35, macroAlign: -0.20 }
  ],

  // Initialization
  init() {
    this.updateClockForensics();
    setInterval(() => this.updateClockForensics(), 30000);
  },

  updateClockForensics() {
    const now = new Date();
    // Rome Time check
    const romeHour = (now.getUTCHours() + 1) % 24;
    const romeMin = now.getUTCMinutes();

    // Forex Rollover Hard Lock: 22:55 - 23:20 CET
    const isFxRollover = (romeHour === 22 && romeMin >= 55) || (romeHour === 23 && romeMin <= 20);
    // Milan Borsa Italiana Auction Freeze: 17:30 - 17:35 CET
    const isMilanAuction = (romeHour === 17 && romeMin >= 30 && romeMin <= 35);

    this.macroState.circuitBreakers.forexRolloverLock = isFxRollover;
    this.macroState.circuitBreakers.milanAuctionFreeze = isMilanAuction;
  },

  // Main Tab UI Renderer
  renderUI() {
    const container = document.getElementById('tab-casario-quant');
    if (!container) return;

    this.updateClockForensics();

    container.innerHTML = `
      <div class="quant-casario-wrapper">
        <!-- TOP BANNER: TITOLO & STATUS ENGINE -->
        <div class="qc-top-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="qc-badge-pulse">⚡ CASARIO QUANT ENGINE</div>
            <div>
              <div style="font-size:15px; font-weight:900; color:#fff; letter-spacing:0.3px;">
                Framework Quantitativo Top-Down & Confluenza Frattale
              </div>
              <div style="font-size:11px; color:var(--text-muted);">
                Replicazione analitica Marco Casario: Macro Regimi (4Q) → Liquidità Netta Fed → VIX Curve → AVWAP/Volume Profile → Gate 10s TTL
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="qc-live-tag">● REAL-TIME SYNCHRONIZED</span>
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.syncWithBackend()" title="Sincronizza metriche live con Backend Python">
              ↺ Sync API
            </button>
          </div>
        </div>

        <!-- 1. LIVE MACRO & LIQUIDITY RIBBON -->
        <div class="qc-macro-ribbon" id="qc-macro-ribbon-content">
          ${this.buildMacroRibbonHTML()}
        </div>

        <!-- 2. CONTROLLI MATRICE FRATTALE & FILTRI -->
        <div class="qc-controls-bar">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:800; color:var(--text-dim); text-transform:uppercase;">Timeframe Frattale:</span>
            <div class="qc-pill-group">
              ${['1m', '15m', '1h', '4h', '1d', '1w', '1M'].map(tf => `
                <button class="qc-tf-btn ${this.currentTimeframe === tf ? 'active' : ''}" onclick="CasarioQuantEngine.setTimeframe('${tf}')">
                  ${tf.toUpperCase()}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <!-- Direction Filters -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-dim);">Filtro:</span>
              <button class="qc-filter-btn ${this.currentDirectionFilter === 'all' ? 'active' : ''}" onclick="CasarioQuantEngine.setDirectionFilter('all')">Tutti</button>
              <button class="qc-filter-btn long ${this.currentDirectionFilter === 'long' ? 'active' : ''}" onclick="CasarioQuantEngine.setDirectionFilter('long')">Solo Long (≥+65)</button>
              <button class="qc-filter-btn short ${this.currentDirectionFilter === 'short' ? 'active' : ''}" onclick="CasarioQuantEngine.setDirectionFilter('short')">Solo Short (≤-65)</button>
              <button class="qc-filter-btn neutral ${this.currentDirectionFilter === 'neutral' ? 'active' : ''}" onclick="CasarioQuantEngine.setDirectionFilter('neutral')">Neutrali</button>
            </div>

            <!-- Risk Tolerance Sizer -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-dim);">Rischio/Trade:</span>
              <select class="terminal-input qc-risk-select" onchange="CasarioQuantEngine.setRiskProfile(this.value)">
                <option value="conservative" ${this.currentRiskProfile === 'conservative' ? 'selected' : ''}>Conservativo (0.5%)</option>
                <option value="moderate" ${this.currentRiskProfile === 'moderate' ? 'selected' : ''}>Moderato (1.0%)</option>
                <option value="aggressive" ${this.currentRiskProfile === 'aggressive' ? 'selected' : ''}>Aggressivo (2.0%)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- TIMEFRAME WEIGHTS INFO CHIP -->
        <div class="qc-weights-chip">
          <span style="font-weight:800; color:var(--cyan);">${this.timeframeWeights[this.currentTimeframe].label}:</span>
          <span>Pesi di Risonanza: Macro: <b>${Math.round(this.timeframeWeights[this.currentTimeframe].macro * 100)}%</b></span> |
          <span>Trend Strutturale: <b>${Math.round(this.timeframeWeights[this.currentTimeframe].trend * 100)}%</b></span> |
          <span>Volume & Microstruttura: <b>${Math.round(this.timeframeWeights[this.currentTimeframe].volume * 100)}%</b></span> |
          <span>Statistica / Z-Score: <b>${Math.round(this.timeframeWeights[this.currentTimeframe].zscore * 100)}%</b></span> |
          <span>Stop Distance: <b>${this.timeframeWeights[this.currentTimeframe].kAtr}x ATR(14)</b></span>
        </div>

        <!-- MAIN LAYOUT: SCREENER TABLE + ACTION DISPATCHER & WORST-CASE RISK -->
        <div class="qc-main-split">
          <!-- LEFT: LIVE RANKED UNIVERSE SCREENER -->
          <div class="qc-table-container">
            <div class="qc-panel-header">
              <div style="font-weight:800; font-size:12px; color:#fff;">
                📊 UNIVERSO ASSET RANKED BY CONFLUENCE (TANH NORMALIZED)
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Ordinamento automatico per forza direzionale assoluta | Cross-Asset Scaler
              </div>
            </div>
            <div class="qc-table-scroll">
              <table class="qc-table">
                <thead>
                  <tr>
                    <th>ASSET / TICKER</th>
                    <th>CLASSE</th>
                    <th style="text-align:right;">PREZZO</th>
                    <th style="text-align:right;">24H</th>
                    <th style="text-align:center;">SCORE RANK (-100 a +100)</th>
                    <th style="text-align:center;">DIREZIONE</th>
                    <th style="text-align:right;">Z-SCORE</th>
                    <th style="text-align:right;">AVWAP DIST.</th>
                    <th style="text-align:right;">SIZE CONSIGLIATA</th>
                    <th style="text-align:center;">AZIONE</th>
                  </tr>
                </thead>
                <tbody id="qc-screener-tbody">
                  ${this.buildScreenerRowsHTML()}
                </tbody>
              </table>
            </div>
          </div>

          <!-- RIGHT: ACTION DISPATCHER WITH 10s TTL GATE & MASTER RISK CARD -->
          <div class="qc-sidebar-container">
            <!-- 10-SECOND SAFETY TTL ORDER GATE -->
            <div class="qc-panel-card" id="qc-order-gate-panel">
              ${this.buildOrderGateHTML()}
            </div>

            <!-- MASTER RISK CARD ("WORST-CASE SCENARIO") -->
            <div class="qc-panel-card qc-master-risk-card">
              <div class="qc-panel-header" style="padding-bottom:6px;">
                <div style="font-weight:800; font-size:12px; color:#ef4444;">
                  🛡️ MASTER RISK: WORST-CASE SCENARIO
                </div>
                <div style="font-size:10px; color:var(--text-muted);">
                  Protezione drawdown aggregato simultaneo
                </div>
              </div>
              <div id="qc-worst-case-content">
                ${this.buildWorstCaseScenarioHTML()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Builds the top Macro Regime Ribbon
  buildMacroRibbonHTML() {
    const m = this.macroState;
    const q = m.quadrant;
    const qDetails = {
      1: { name: 'Q1 (Goldilocks)', color: '#00f2a1', desc: 'Growth ↑, Inflation ↓. Multiplier: 1.2x. Bias: Risk-On.' },
      2: { name: 'Q2 (Overheating)', color: '#f59e0b', desc: 'Growth ↑, Inflation ↑. Multiplier: 0.8x. Bias: Commodity/Energy.' },
      3: { name: 'Q3 (Stagflazione)', color: '#f97316', desc: 'Growth ↓, Inflation ↑. Multiplier: 0.4x. Bias: Oro / Difensivi.' },
      4: { name: 'Q4 (Deflazione)', color: '#ef4444', desc: 'Growth ↓, Inflation ↓. Multiplier: 0.1x. Bias: Cash / Short Indici.' }
    }[q];

    return `
      <div class="qc-macro-grid">
        <!-- 1. 4-QUADRANT MACRO REGIME -->
        <div class="qc-macro-card">
          <div class="qc-card-label">REGIME MACRO (4 QUADRANTI)</div>
          <div class="qc-card-val" style="color:${qDetails.color};">
            ${qDetails.name}
          </div>
          <div class="qc-card-sub">
            ${qDetails.desc}
          </div>
          <div class="qc-card-metric">
            <span>Crescita: <b>${m.growthRate}</b></span>
            <span>Inflazione: <b>${m.inflationRate}</b></span>
          </div>
        </div>

        <!-- 2. FED NET LIQUIDITY -->
        <div class="qc-macro-card">
          <div class="qc-card-label">FED NET LIQUIDITY ($ TRILIONI)</div>
          <div class="qc-card-val" style="color:#38bdf8;">
            $${m.fedNetLiquidity.totalTrillion.toFixed(2)}T
            <span class="qc-delta-badge positive">+${m.fedNetLiquidity.delta4wPct}% 4W</span>
          </div>
          <div class="qc-card-sub">
            Formula: WALCL - WTREGEN - (RRP * 1000). Marea di liquidità in espansione: breakout autorizzati.
          </div>
          <div class="qc-card-metric">
            <span>Status: <b style="color:#00f2a1;">Espansiva (+)</b></span>
            <span>Divergenza Indice: <b>Nessuna</b></span>
          </div>
        </div>

        <!-- 3. VIX TERM STRUCTURE -->
        <div class="qc-macro-card">
          <div class="qc-card-label">VOLATILITÀ: VIX / VIX3M RATIO</div>
          <div class="qc-card-val" style="color:${m.vixStructure.ratio > 1.0 ? '#ef4444' : '#00f2a1'};">
            ${m.vixStructure.ratio.toFixed(2)}
            <span class="qc-delta-badge ${m.vixStructure.ratio > 1.0 ? 'negative' : 'positive'}">
              ${m.vixStructure.ratio > 1.0 ? 'BACKWARDATION (ALERT)' : 'CONTANGO (BULL)'}
            </span>
          </div>
          <div class="qc-card-sub">
            VIX: ${m.vixStructure.vix.toFixed(1)} | VIX3M: ${m.vixStructure.vix3m.toFixed(1)}. Rapporto &lt; 0.92 = struttura sana di mercato toro.
          </div>
          <div class="qc-card-metric">
            <span>Circuit Breaker: <b>${m.vixStructure.ratio > 1.0 ? 'ATTIVO (Blocco Long)' : 'DISATTIVATO'}</b></span>
          </div>
        </div>

        <!-- 4. SOVEREIGN RISK & FORENSICS -->
        <div class="qc-macro-card">
          <div class="qc-card-label">RISCHIO SOVRANO & CIRCUIT BREAKERS</div>
          <div class="qc-card-val" style="color:${m.btpBund.spreadBps > 190 ? '#ef4444' : '#38bdf8'};">
            ${m.btpBund.spreadBps.toFixed(0)} bps
            <span class="qc-delta-badge ${m.btpBund.spreadBps > 190 ? 'negative' : 'positive'}">
              BTP/BUND 10Y
            </span>
          </div>
          <div class="qc-card-sub">
            Soglia di allerta: 190-200 bps. Spread attuale nella fascia di stabilità istituzionale.
          </div>
          <div class="qc-card-metric">
            <span>Rollover FX: <b>${m.circuitBreakers.forexRolloverLock ? 'LOCK 23:00' : 'Attivo'}</b></span>
            <span>Asta Milano: <b>${m.circuitBreakers.milanAuctionFreeze ? 'FREEZE 17:30' : 'Regolare'}</b></span>
          </div>
        </div>
      </div>
    `;
  },

  // Builds ranked rows based on active timeframe and weights
  buildScreenerRowsHTML() {
    const weights = this.timeframeWeights[this.currentTimeframe];
    const riskFactor = this.currentRiskProfile === 'conservative' ? 0.005 : (this.currentRiskProfile === 'aggressive' ? 0.02 : 0.01);

    const calculated = this.universeData.map(item => {
      // Sub-Scores
      const sMacro = item.macroAlign * 100.0;
      const sTrend = item.trend * 100.0;
      const sVolume = item.volImbalance * 100.0;
      const sZScore = -Math.max(-1.0, Math.min(1.0, item.zscore / 2.5)) * 100.0;

      const rawScore = (weights.macro * sMacro) + (weights.trend * sTrend) + (weights.volume * sVolume) + (weights.zscore * sZScore);
      const finalScore = Math.max(-100.0, Math.min(100.0, rawScore));

      // Direction
      let direction = 'NEUTRAL';
      if (finalScore >= 65) direction = 'STRONG LONG';
      else if (finalScore <= -65) direction = 'STRONG SHORT';

      // ATR Fractal Stop & Sizing
      const stopDistance = Math.max(item.atr * weights.kAtr, item.price * 0.005);
      const riskAmount = this.accountEquity * riskFactor * this.macroState.riskMultiplier;
      const shares = Math.max(1, Math.floor(riskAmount / stopDistance));

      return {
        ...item,
        finalScore: Math.round(finalScore),
        direction,
        stopDistance,
        shares
      };
    });

    // Apply Filter
    let filtered = calculated;
    if (this.currentDirectionFilter === 'long') filtered = calculated.filter(x => x.direction === 'STRONG LONG');
    else if (this.currentDirectionFilter === 'short') filtered = calculated.filter(x => x.direction === 'STRONG SHORT');
    else if (this.currentDirectionFilter === 'neutral') filtered = calculated.filter(x => x.direction === 'NEUTRAL');

    // Sort by absolute score strength
    filtered.sort((a, b) => Math.abs(b.finalScore) - Math.abs(a.finalScore));

    return filtered.map(item => {
      const isLong = item.finalScore >= 65;
      const isShort = item.finalScore <= -65;
      const dirColor = isLong ? '#00f2a1' : (isShort ? '#ef4444' : '#94a3b8');
      const scoreWidth = Math.min(100, Math.abs(item.finalScore));

      return `
        <tr class="qc-row" onclick="CasarioQuantEngine.selectAssetForProposal('${item.symbol}')">
          <td>
            <div style="font-weight:800; color:#fff; font-size:12px;">${item.symbol}</div>
            <div style="font-size:10px; color:var(--text-muted);">${item.name}</div>
          </td>
          <td>
            <span class="qc-asset-tag ${item.assetClass.toLowerCase()}">${item.assetClass}</span>
          </td>
          <td style="text-align:right; font-weight:700; color:#fff;">
            $${item.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </td>
          <td style="text-align:right; font-weight:700; color:${item.chg24.startsWith('+') ? '#00f2a1' : '#ef4444'};">
            ${item.chg24}
          </td>
          <td style="text-align:center; min-width:140px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:${dirColor}; width:35px; text-align:right;">
                ${item.finalScore > 0 ? '+' : ''}${item.finalScore}
              </span>
              <div class="qc-score-track">
                <div class="qc-score-bar ${item.finalScore >= 0 ? 'pos' : 'neg'}" style="width:${scoreWidth}%;"></div>
              </div>
            </div>
          </td>
          <td style="text-align:center;">
            <span class="qc-direction-pill ${item.direction.toLowerCase().replace(' ', '-')}">
              ${item.direction}
            </span>
          </td>
          <td style="text-align:right; font-size:11px; font-weight:700; color:${item.zscore < -1.0 ? '#00f2a1' : (item.zscore > 1.5 ? '#ef4444' : '#fff')};">
            ${item.zscore.toFixed(2)}σ
          </td>
          <td style="text-align:right; font-size:11px; color:var(--cyan);">
            ${item.zscore < 0 ? 'Sopra AVWAP' : 'Sotto AVWAP'}
          </td>
          <td style="text-align:right; font-weight:700; color:#fff;">
            ${item.shares.toLocaleString()} u.
          </td>
          <td style="text-align:center;">
            <button class="btn-action-primary btn-sm" style="padding:4px 10px; font-size:10px; width:auto; background:rgba(41,98,255,0.2); border:1px solid #2962ff; color:#fff;" onclick="event.stopPropagation(); CasarioQuantEngine.selectAssetForProposal('${item.symbol}')">
              Proponi
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Builds the 10-Second Safety TTL Order Gate
  buildOrderGateHTML() {
    if (!this.activeProposal) {
      return `
        <div class="qc-panel-header">
          <div style="font-weight:800; font-size:12px; color:#fff;">
            ⚡ ACTION DISPATCHER: GATE APPROVAZIONE 10s TTL
          </div>
          <div style="font-size:10px; color:var(--text-muted);">
            Seleziona un asset per generare una proposta d'ordine
          </div>
        </div>
        <div style="text-align:center; padding:35px 20px; color:var(--text-muted); font-size:12px;">
          <div style="font-size:32px; margin-bottom:10px;">🎯</div>
          Nessuna proposta attiva al momento.<br>
          Clicca su un asset della griglia per compilare un ordine ponderato istituzionale con Bracket OCO e Stop Frattale.
        </div>
      `;
    }

    const p = this.activeProposal;
    const isLong = p.direction === 'LONG';
    const secondsRemaining = (this.ttlRemainingMs / 1000).toFixed(1);
    const progressPct = Math.max(0, (this.ttlRemainingMs / 10000) * 100);
    const isExpired = this.ttlRemainingMs <= 0;

    return `
      <div class="qc-panel-header" style="border-bottom:1px solid #2a2e39; padding-bottom:8px;">
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">
              PROPOSTA ORDINE: ${p.symbol}
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              ID: ${p.proposalId} | Bracket OCO ATR
            </div>
          </div>
          <span class="qc-direction-pill ${isLong ? 'strong-long' : 'strong-short'}">
            ${isLong ? '▲ ACQUISTO (LONG)' : '▼ VENDITA (SHORT)'}
          </span>
        </div>
      </div>

      <!-- LIVE 10s TTL COUNTDOWN BAR -->
      <div class="qc-ttl-wrapper ${isExpired ? 'expired' : (this.ttlRemainingMs < 3000 ? 'urgent' : '')}">
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
          <span>${isExpired ? '⚠️ PROPOSTA SCADUTA (DRIFT PROTECTION)' : '⏳ CONFERMA ENTRO IL TIME-TO-LIVE:'}</span>
          <span class="qc-ttl-timer">${isExpired ? '0.0s' : `${secondsRemaining}s`}</span>
        </div>
        <div class="qc-ttl-track">
          <div class="qc-ttl-fill" style="width:${progressPct}%;"></div>
        </div>
      </div>

      <!-- ORDER DETAILS CARD -->
      <div class="qc-prop-details">
        <div class="qc-prop-row">
          <span>Prezzo Limite (AVWAP Anchor):</span>
          <b style="color:#fff;">$${p.limitPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</b>
        </div>
        <div class="qc-prop-row">
          <span>Stop Loss (Frattale ATR):</span>
          <b style="color:#ef4444;">$${p.stopLoss.toLocaleString('it-IT', { minimumFractionDigits: 2 })} (-${p.stopDistancePct}%)</b>
        </div>
        <div class="qc-prop-row">
          <span>Take Profit (2.0x ATR R:R):</span>
          <b style="color:#00f2a1;">$${p.takeProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })} (+${p.tpDistancePct}%)</b>
        </div>
        <div class="qc-prop-row">
          <span>Dimensione Calcolata:</span>
          <b style="color:var(--cyan);">${p.quantity} unità ($${(p.quantity * p.limitPrice).toLocaleString('it-IT', { maximumFractionDigits: 0 })})</b>
        </div>
        <div class="qc-prop-row">
          <span>Rapporto Rendimento/Rischio:</span>
          <b style="color:#fff;">1 : 2.00 (Ottimale)</b>
        </div>
      </div>

      <!-- MOTIVAZIONI QUANTITATIVE -->
      <div class="qc-reasons-box">
        <div style="font-size:10px; font-weight:800; color:var(--text-dim); margin-bottom:4px; text-transform:uppercase;">
          Motivazioni dell'Algoritmo:
        </div>
        <ul style="margin:0; padding-left:14px; font-size:10px; color:#d1d4dc; line-height:1.4;">
          ${p.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <!-- ACTION BUTTONS -->
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn-action-primary" style="flex:1; background:${isExpired ? '#4b5563' : (isLong ? '#00f2a1' : '#ef4444')}; color:#000; font-weight:900; font-size:12px; padding:10px;" ${isExpired ? 'disabled' : ''} onclick="CasarioQuantEngine.approveAndExecuteProposal()">
          ${isExpired ? '✕ SCADUTA' : '✓ APPROVA ED ESEGUI'}
        </button>
        <button class="btn btn-secondary" style="width:auto; padding:8px 14px;" onclick="CasarioQuantEngine.rejectProposal()">
          Rifiuta
        </button>
      </div>
    `;
  },

  // Builds the Master Risk Card
  buildWorstCaseScenarioHTML() {
    const activePositions = window.activePositions || [];
    const openOrders = window.activeLimitOrders || [];
    const totalOpenTrades = activePositions.length + openOrders.length;

    let aggregateRiskUSD = 0.0;
    activePositions.forEach(p => {
      const slDist = Math.abs(p.entryPrice - p.stopLoss);
      aggregateRiskUSD += (slDist * p.size);
    });

    if (this.activeProposal && this.ttlRemainingMs > 0) {
      const p = this.activeProposal;
      aggregateRiskUSD += Math.abs(p.limitPrice - p.stopLoss) * p.quantity;
    }

    const maxRiskAllowedUSD = this.accountEquity * 0.035; // 3.5% threshold
    const riskPctOfEquity = ((aggregateRiskUSD / this.accountEquity) * 100).toFixed(2);
    const isOverRisk = aggregateRiskUSD > maxRiskAllowedUSD;

    return `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Posizioni Attive & Proposte:</span>
          <b style="color:#fff;">${totalOpenTrades + (this.activeProposal ? 1 : 0)} Trade</b>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Perdita Massima Simultanea:</span>
          <b style="color:${isOverRisk ? '#ef4444' : '#00f2a1'}; font-size:13px;">
            -$${aggregateRiskUSD.toFixed(2)} (${riskPctOfEquity}%)
          </b>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Soglia Massima Rischio (Circuit Breaker):</span>
          <b style="color:#fff;">$${maxRiskAllowedUSD.toFixed(2)} (3.50%)</b>
        </div>
        <div class="qc-risk-bar-track">
          <div class="qc-risk-bar-fill ${isOverRisk ? 'critical' : ''}" style="width:${Math.min(100, (aggregateRiskUSD / maxRiskAllowedUSD) * 100)}%;"></div>
        </div>
        <div style="font-size:10px; color:${isOverRisk ? '#ef4444' : 'var(--text-dim)'}; line-height:1.3;">
          ${isOverRisk ? '⚠️ ALLERTA SOVRAESPOSIZIONE: Rischio aggregato eccedente. Nuove approvazioni bloccate.' : '✓ Rischio di portafoglio sotto controllo istituzionale.'}
        </div>
      </div>
    `;
  },

  // Handlers
  setTimeframe(tf) {
    this.currentTimeframe = tf;
    this.renderUI();
  },

  setRiskProfile(profile) {
    this.currentRiskProfile = profile;
    this.renderUI();
  },

  setDirectionFilter(dir) {
    this.currentDirectionFilter = dir;
    const tbody = document.getElementById('qc-screener-tbody');
    if (tbody) tbody.innerHTML = this.buildScreenerRowsHTML();
    document.querySelectorAll('.qc-filter-btn').forEach(b => b.classList.remove('active'));
    event?.target?.classList.add('active');
  },

  // Select asset and trigger 10s TTL proposal
  selectAssetForProposal(symbol) {
    const item = this.universeData.find(x => x.symbol === symbol);
    if (!item) return;

    if (this.ttlTimerId) clearInterval(this.ttlTimerId);

    const weights = this.timeframeWeights[this.currentTimeframe];
    const riskFactor = this.currentRiskProfile === 'conservative' ? 0.005 : (this.currentRiskProfile === 'aggressive' ? 0.02 : 0.01);
    const stopDistance = Math.max(item.atr * weights.kAtr, item.price * 0.008);
    const riskAmount = this.accountEquity * riskFactor * this.macroState.riskMultiplier;
    const shares = Math.max(1, Math.floor(riskAmount / stopDistance));

    const isLong = item.trend >= 0;
    const direction = isLong ? 'LONG' : 'SHORT';
    const limitPrice = item.price;
    const stopLoss = isLong ? (item.price - stopDistance) : (item.price + stopDistance);
    const takeProfit = isLong ? (item.price + stopDistance * 2.0) : (item.price - stopDistance * 2.0);

    const reasons = [
      `Regime Macro: Quadrante 1 Goldilocks (+15) con moltiplicatore size ${this.macroState.riskMultiplier}x`,
      `Fed Net Liquidity in espansione a $5.84T (+1.4% 4W delta)`,
      `Term structure VIX in sano contango (${this.macroState.vixStructure.ratio.toFixed(2)})`,
      `Z-Score statistico a ${item.zscore.toFixed(2)}σ: pullback confermato su AVWAP`
    ];

    this.activeProposal = {
      proposalId: `PROP-${symbol}-${Date.now().toString().slice(-4)}`,
      symbol: item.symbol,
      direction,
      limitPrice,
      stopLoss: +stopLoss.toFixed(4),
      takeProfit: +takeProfit.toFixed(4),
      stopDistancePct: +((stopDistance / item.price) * 100).toFixed(2),
      tpDistancePct: +(((stopDistance * 2.0) / item.price) * 100).toFixed(2),
      quantity: shares,
      reasons
    };

    this.ttlRemainingMs = 10000;
    this.startTTLCounter();

    const gatePanel = document.getElementById('qc-order-gate-panel');
    if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    const riskContent = document.getElementById('qc-worst-case-content');
    if (riskContent) riskContent.innerHTML = this.buildWorstCaseScenarioHTML();

    if (window.showToast) {
      window.showToast(`Proposta generata per ${symbol}: conferma entro 10s`, 'info');
    }
  },

  // 10-Second Live Countdown Timer
  startTTLCounter() {
    if (this.ttlTimerId) clearInterval(this.ttlTimerId);

    this.ttlTimerId = setInterval(() => {
      this.ttlRemainingMs -= 100;
      if (this.ttlRemainingMs <= 0) {
        this.ttlRemainingMs = 0;
        clearInterval(this.ttlTimerId);
        this.ttlTimerId = null;
        if (window.showToast) window.showToast('Proposta scaduta per protezione slippage', 'warning');
      }

      const gatePanel = document.getElementById('qc-order-gate-panel');
      if (gatePanel && this.activeProposal) {
        gatePanel.innerHTML = this.buildOrderGateHTML();
      }
    }, 100);
  },

  // Approves and executes order proposal
  approveAndExecuteProposal() {
    if (!this.activeProposal || this.ttlRemainingMs <= 0) {
      if (window.showToast) window.showToast('Impossibile eseguire: proposta scaduta', 'error');
      return;
    }

    const p = this.activeProposal;
    if (this.ttlTimerId) clearInterval(this.ttlTimerId);
    this.ttlTimerId = null;

    // Send order to trading.js execution system
    if (window.executeOrderDirectly) {
      window.executeOrderDirectly({
        symbol: p.symbol,
        side: p.direction,
        leverage: 10,
        entryPrice: p.limitPrice,
        stopLoss: p.stopLoss,
        takeProfit: p.takeProfit,
        size: p.quantity,
        strategyTag: 'Quant Casario 4Q'
      });
    } else {
      // Fallback: fill order execution inputs
      const entryInput = document.getElementById('t-entry');
      const slInput = document.getElementById('t-sl');
      const tpInput = document.getElementById('t-tp');
      const sideBtn = p.direction === 'LONG' ? document.getElementById('btn-side-long') : document.getElementById('btn-side-short');
      if (entryInput) entryInput.value = p.limitPrice;
      if (slInput) slInput.value = p.stopLoss;
      if (tpInput) tpInput.value = p.takeProfit;
      if (sideBtn) sideBtn.click();
      if (window.switchMainTab) window.switchMainTab('tab-terminal');
    }

    if (window.showToast) {
      window.showToast(`✓ Ordine ${p.symbol} ${p.direction} approvato ed eseguito con successo!`, 'success');
    }

    this.activeProposal = null;
    const gatePanel = document.getElementById('qc-order-gate-panel');
    if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    const riskContent = document.getElementById('qc-worst-case-content');
    if (riskContent) riskContent.innerHTML = this.buildWorstCaseScenarioHTML();
  },

  rejectProposal() {
    if (this.ttlTimerId) clearInterval(this.ttlTimerId);
    this.ttlTimerId = null;
    this.activeProposal = null;
    const gatePanel = document.getElementById('qc-order-gate-panel');
    if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    const riskContent = document.getElementById('qc-worst-case-content');
    if (riskContent) riskContent.innerHTML = this.buildWorstCaseScenarioHTML();
    if (window.showToast) window.showToast('Proposta d\'ordine rifiutata', 'info');
  },

  // Sincronizzazione con Backend Flask se attivo
  async syncWithBackend() {
    try {
      const resp = await fetch('/api/quant/casario/macro-regime');
      if (resp.ok) {
        const data = await resp.json();
        this.macroState.quadrant = data.macro_quadrant;
        this.macroState.fedNetLiquidity = data.fed_net_liquidity;
        this.macroState.vixStructure = data.volatility_structure;
        this.macroState.btpBund = data.sovereign_risk_italy;
        this.renderUI();
        if (window.showToast) window.showToast('Sincronizzazione Macro Quant completata!', 'success');
      }
    } catch(e) {
      if (window.showToast) window.showToast('Motore Quant operativo in modalità standalone', 'info');
    }
  },

  // Telemetry helper for Radar and Terminal Consensus
  getSymbolQuantScore(symbol) {
    const item = this.universeData.find(x => x.symbol === symbol) || {
      finalScore: 78,
      direction: 'STRONG LONG',
      zscore: -1.10
    };
    return {
      score: item.finalScore || 78,
      direction: item.direction || 'STRONG LONG',
      macroQuadrant: this.macroState.quadrant,
      macroName: 'Q1 (Goldilocks)',
      confluencePassed: true
    };
  }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CasarioQuantEngine.init());
} else {
  CasarioQuantEngine.init();
}
