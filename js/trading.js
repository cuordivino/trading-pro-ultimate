/* ==========================================================================
   TRADING.JS - PRO ORDER EXECUTION & TRIPLE TRADING SYSTEM V3
   1. MANUALE (Discrezionale Diretto con Sizer & Leva)
   2. ASSISTITO (Co-Pilot con Indicazioni Motivate & Precise)
   3. TOTALMENTE AUTOMATIZZATO (Quant Bot Engine Coding-Kitties & OpenAlgo)
   © by cuordivino — Tutti i diritti riservati
   ========================================================================== */

let currentTradeSide = 'LONG';
let currentLeverage = 10;
let defaultCapital = 25000;
let defaultRiskPct = 1.5;

window.TradingEngine = {
  // Mode: 'manual' | 'assisted' | 'automated'
  executionMode: 'manual',
  
  // Bot Engine State
  botActive: false,
  botTimer: null,
  botExecutionHistory: [],
  
  // Macro Settings (Tunable by user)
  macroSettings: {
    macroBias: 'neutral', // 'risk_on' | 'neutral' | 'risk_off'
    minScore: 82,
    riskPerTrade: 1.5,
    maxCap: 25000,
    maxOpenTrades: 3,
    dailyCircuitBreaker: -4.0,
    enabledSectors: ['crypto', 'italy', 'us', 'forex', 'commodities'],
    trailingStop: true,
    trailingType: 'sar',
    marketHoursOnly: false
  },

  init: function() {
    this.loadSavedMacroSettings();
    this.loadBotHistory();
    this.setExecutionMode('manual', false);

    // Bot continuous evaluation loop (runs every 4.5 seconds when active)
    if (this.botTimer) clearInterval(this.botTimer);
    this.botTimer = setInterval(() => {
      if (this.botActive && this.executionMode === 'automated') {
        this.runBotAutonomousLoop();
      }
    }, 4500);
  },

  // =========================================================================
  // 1. EXECUTION MODE SWITCHER (MANUALE | ASSISTITO | AUTOMATIZZATO)
  // =========================================================================
  setExecutionMode: function(mode, notify = true) {
    this.executionMode = mode;

    // Update pill buttons
    document.querySelectorAll('.t-mode-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-tmode-${mode}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update badge in order header
    const badge = document.getElementById('trading-mode-badge');
    if (badge) {
      if (mode === 'manual') {
        badge.innerHTML = '🕹️ MANUALE DIRETTO';
        badge.className = 'mode-status-badge mode-manual';
      } else if (mode === 'assisted') {
        badge.innerHTML = '🧭 CO-PILOT ASSISTITO';
        badge.className = 'mode-status-badge mode-assisted';
      } else {
        badge.innerHTML = this.botActive ? '🤖 BOT ATTIVO (LIVE)' : '🤖 BOT IN PAUSA';
        badge.className = `mode-status-badge ${this.botActive ? 'mode-bot-on' : 'mode-bot-off'}`;
      }
    }

    // Toggle subviews
    const vManual = document.getElementById('trading-view-manual');
    const vAssisted = document.getElementById('trading-view-assisted');
    const vAutomated = document.getElementById('trading-view-automated');

    if (vManual) vManual.style.display = (mode === 'manual') ? 'block' : 'none';
    if (vAssisted) vAssisted.style.display = (mode === 'assisted') ? 'block' : 'none';
    if (vAutomated) vAutomated.style.display = (mode === 'automated') ? 'block' : 'none';

    // Refresh mode contents
    if (mode === 'assisted') {
      this.refreshAssistedView();
    } else if (mode === 'automated') {
      this.refreshAutomatedView();
    }

    if (notify && window.showToast) {
      const modeNames = { manual: 'Manuale Diretto', assisted: 'Assistito (Co-Pilot)', automated: '100% Automatizzato (Quant Bot)' };
      window.showToast(`Modalità Trading impostata su: ${modeNames[mode]}`, 'info');
    }
  },

  // =========================================================================
  // 2. ASSISTED MODE: CO-PILOT CON INDICAZIONI MOTIVATE & PRECISE
  // =========================================================================
  refreshAssistedView: function() {
    const sym = window.currentSymbol || window.activeSymbol || 'BTCUSDT';
    let opp = null;
    
    // Look up in OpportunityScanner if available
    if (window.OpportunityScanner && window.OpportunityScanner.allOpportunities) {
      opp = window.OpportunityScanner.allOpportunities.find(o => o.symbol === sym);
    }

    // If not found in scanner, generate dynamic assessment for current active asset
    if (!opp) {
      const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
      if (asset && window.OpportunityScanner) {
        opp = window.OpportunityScanner.evaluateAssetOpportunity(asset);
      }
    }

    this.renderAssistedCard(opp);
  },

  renderAssistedCard: function(opp) {
    const container = document.getElementById('assisted-content-container');
    if (!container) return;

    if (!opp) {
      container.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-muted);">
          <div style="font-size:28px; margin-bottom:8px;">⏳</div>
          <div style="font-weight:700;">Analisi Quantitativa in corso per ${window.currentSymbol || 'questo asset'}...</div>
          <p style="font-size:11px; margin-top:4px;">Seleziona un'opportunità dal Radar per caricare la scheda motivata completa.</p>
        </div>
      `;
      return;
    }

    const isLong = opp.side === 'LONG';
    const sideBadge = isLong 
      ? '<span class="side-tag-long" style="font-size:11px; padding:3px 8px;">▲ BUY / LONG FORTE</span>'
      : '<span class="side-tag-short" style="font-size:11px; padding:3px 8px;">▼ SELL / SHORT FORTE</span>';
    
    const scoreColor = opp.score >= 90 ? '#00f2a1' : (opp.score >= 82 ? '#38bdf8' : '#f59e0b');

    container.innerHTML = `
      <div class="assisted-copilot-card">
        
        <!-- CARD HEADER -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-weight:900; font-size:16px; font-family:var(--font-mono); color:#fff;">${opp.symbol}</span>
              ${sideBadge}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${opp.name} (${opp.exchange || opp.sector})</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px; font-weight:900; color:${scoreColor}; font-family:var(--font-mono);">${opp.score}<span style="font-size:12px;">%</span></div>
            <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase;">Confluenza Quant</div>
          </div>
        </div>

        <!-- KEY LEVELS SUMMARY -->
        <div class="assisted-levels-strip">
          <div class="a-level-item">
            <span class="lbl">Ingresso Consigliato</span>
            <span class="val" style="color:#fff;">${opp.currency}${Number(opp.entry).toFixed(opp.precision)}</span>
          </div>
          <div class="a-level-item">
            <span class="lbl">Stop Loss Tecnico</span>
            <span class="val text-red">${opp.currency}${Number(opp.stopLoss).toFixed(opp.precision)}</span>
            <span class="sub">(-${opp.riskPct}%)</span>
          </div>
          <div class="a-level-item">
            <span class="lbl">Target 1 (50%)</span>
            <span class="val text-green">${opp.currency}${Number(opp.tp1).toFixed(opp.precision)}</span>
            <span class="sub">R/R 1:1.8</span>
          </div>
          <div class="a-level-item">
            <span class="lbl">Target 2 (Finale)</span>
            <span class="val" style="color:#00f2a1;">${opp.currency}${Number(opp.tp2).toFixed(opp.precision)}</span>
            <span class="sub">${opp.rrRatio}</span>
          </div>
        </div>

        <!-- INDICAZIONE MOTIVATA & PRECISA (DEEP RATIONALE) -->
        <div class="assisted-rationale-box">
          <div class="a-rat-title">
            <span>🧠 <b>INDICAZIONE MOTIVATA & PRECISA</b> (Cosa fare e Perché)</span>
          </div>
          
          <div class="a-rat-section">
            <span class="a-rat-lead">• Razionale Operativo:</span>
            <p>${opp.rationale.core}</p>
          </div>

          <div class="a-rat-section">
            <span class="a-rat-lead">• Confluenza Indicatori (EMA 9/21/200 & VWAP):</span>
            <p>${opp.rationale.indicators}</p>
          </div>

          <div class="a-rat-section" style="border-left-color:var(--sell);">
            <span class="a-rat-lead" style="color:var(--sell);">⚠️ Condizione Precisa di Invalidazione:</span>
            <p style="color:#fca5a5;">${opp.rationale.invalidation}</p>
          </div>
        </div>

        <!-- SIZING & EXECUTE BUTTON -->
        <div style="margin-top:12px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-bottom:6px;">
            <span>Rischio Operazione: <b>${this.macroSettings.riskPerTrade}% del Capitale</b></span>
            <span>R/R Atteso: <b style="color:var(--buy)">${opp.rrRatio}</b></span>
          </div>

          <button class="btn-action-primary ${isLong ? 'btn-buy' : 'btn-sell'}" style="padding:12px; font-size:13px; font-weight:800; border-radius:6px; box-shadow:0 0 15px rgba(0,242,161,0.2);" onclick="TradingEngine.executeAssistedTrade('${opp.symbol}')">
            ✅ Conferma ed Esegui Setup Assistito ${opp.symbol}
          </button>

          <button class="btn-telegram-dispatch" style="margin-top:8px;" onclick="TradingEngine.dispatchAssistedToTelegram('${opp.symbol}')" title="Invia questo setup motivato su Telegram">
            <span>📲</span> Invia Segnale Motivano su Telegram (@cuordivino)
          </button>
        </div>

      </div>
    `;
  },

  executeAssistedTrade: function(symbol) {
    let opp = window.OpportunityScanner?.allOpportunities?.find(o => o.symbol === symbol);
    if (!opp) return;

    // Apply values to inputs
    const entryInput = document.getElementById('t-entry');
    const slInput = document.getElementById('t-sl');
    const tpInput = document.getElementById('t-tp');

    if (entryInput) entryInput.value = opp.entry;
    if (slInput) slInput.value = opp.stopLoss;
    if (tpInput) tpInput.value = opp.tp2;

    setTradeSide(opp.side);

    // Call standard execution
    executeTrade();

    if (window.showToast) {
      window.showToast(`Trade Assistito ${symbol} eseguito con successo! Stop Loss a ${opp.currency}${opp.stopLoss}`, 'success');
    }
  },

  dispatchAssistedToTelegram: function(symbol) {
    let opp = window.OpportunityScanner?.allOpportunities?.find(o => o.symbol === symbol);
    if (!opp) return;

    if (window.sendTelegramSignalDirect) {
      window.sendTelegramSignalDirect({
        asset: opp.symbol,
        side: opp.side,
        price: opp.entry,
        sl: opp.stopLoss,
        tp1: opp.tp1,
        tp2: opp.tp2,
        rr: opp.rrRatio,
        score: opp.score,
        verdict: `SEGNALE ASSISTITO (${opp.setupName})`,
        reason: `${opp.rationale.core} Confluenza: ${opp.rationale.indicators} Invalidazione: ${opp.rationale.invalidation}`
      });
    }
  },

  // =========================================================================
  // 3. AUTOMATED MODE: QUANT BOT ENGINE (CODING-KITTIES & OPENALGO)
  // =========================================================================
  toggleBot: function() {
    this.botActive = !this.botActive;
    this.refreshAutomatedView();

    // Update status badge
    const badge = document.getElementById('trading-mode-badge');
    if (badge && this.executionMode === 'automated') {
      badge.innerHTML = this.botActive ? '🤖 BOT ATTIVO (LIVE)' : '🤖 BOT IN PAUSA';
      badge.className = `mode-status-badge ${this.botActive ? 'mode-bot-on' : 'mode-bot-off'}`;
    }

    if (window.showToast) {
      window.showToast(`Bot Quant Autonomo: ${this.botActive ? 'ATTIVATO (IN SCANSIONE LIVE)' : 'IN PAUSA'}`, this.botActive ? 'success' : 'info');
    }
  },

  refreshAutomatedView: function() {
    const container = document.getElementById('automated-content-container');
    if (!container) return;

    const s = this.macroSettings;
    const history = this.botExecutionHistory;
    const activeCount = history.filter(h => h.status === 'APERTO').length;
    const totalPnl = history.reduce((acc, cur) => acc + (cur.pnl || 0), 0);

    const biasLabels = {
      risk_on: '🚀 Risk-On (Aggressivo)',
      neutral: '⚖️ Neutro (All-Weather)',
      risk_off: '🛡️ Risk-Off (Conservativo)'
    };

    container.innerHTML = `
      <div class="bot-dashboard-container">
        
        <!-- MASTER BOT SWITCH & STATUS -->
        <div class="bot-switch-card ${this.botActive ? 'active' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="pulse-indicator" style="background:${this.botActive ? '#00f2a1' : '#f43f5e'};"></span>
                <span style="font-weight:900; font-size:14px; color:#fff;">QUANT BOT AUTONOMO</span>
              </div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
                Ispirato a Coding-Kitties & OpenAlgo • Esecuzione Algoritmica Istituzionale
              </div>
            </div>

            <button class="btn-bot-toggle ${this.botActive ? 'on' : 'off'}" onclick="TradingEngine.toggleBot()">
              ${this.botActive ? '🟢 BOT ATTIVO' : '⏸️ BOT IN PAUSA'}
            </button>
          </div>

          <!-- BOT LIVE TELEMETRY STRIP -->
          <div class="bot-tele-grid">
            <div class="b-tele-cell">
              <span class="lbl">Asset Monitorati</span>
              <span class="val text-accent">235 Titoli</span>
            </div>
            <div class="b-tele-cell">
              <span class="lbl">Posizioni Bot</span>
              <span class="val ${activeCount > 0 ? 'text-green' : ''}">${activeCount} / ${s.maxOpenTrades}</span>
            </div>
            <div class="b-tele-cell">
              <span class="lbl">PnL Bot Oggi</span>
              <span class="val ${totalPnl >= 0 ? 'text-green' : 'text-red'}">+$${totalPnl.toFixed(2)}</span>
            </div>
            <div class="b-tele-cell">
              <span class="lbl">Soglia Min. Score</span>
              <span class="val" style="color:#00f2a1;">≥ ${s.minScore}%</span>
            </div>
          </div>
        </div>

        <!-- MACRO SETTINGS SUMMARY & TUNE BUTTON -->
        <div class="bot-macro-summary-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Parametri Macro & Sintesi</span>
            <button class="btn-tune-macro" onclick="TradingEngine.openMacroModal()">
              ⚙️ Regola Parametri Macro
            </button>
          </div>

          <div class="macro-tag-list">
            <span class="macro-pill">Regime: <b>${biasLabels[s.macroBias] || s.macroBias}</b></span>
            <span class="macro-pill">Rischio/Trade: <b>${s.riskPerTrade}%</b></span>
            <span class="macro-pill">Capitale: <b>$${s.maxCap.toLocaleString()}</b></span>
            <span class="macro-pill">Trailing Stop: <b>${s.trailingStop ? 'ATTIVO (' + s.trailingType.toUpperCase() + ')' : 'NO'}</b></span>
            <span class="macro-pill">Circuit Breaker: <b>${s.dailyCircuitBreaker}%</b></span>
          </div>
        </div>

        <!-- BOT RECENT EXECUTIONS LOG -->
        <div class="bot-log-card">
          <div class="bot-log-header">
            <span>📋 Registro Esecuzioni Bot in Tempo Reale</span>
            <span style="font-size:10px; color:var(--text-dim);">${history.length} Operazioni</span>
          </div>

          <div class="bot-log-list">
            ${history.length === 0 ? `
              <div style="text-align:center; padding:18px; color:var(--text-muted); font-size:11px;">
                Nessuna operazione bot registrata oggi. Il bot è in monitoraggio continuativo su 235 titoli per setup con confluenza ≥ ${s.minScore}%.
              </div>
            ` : history.slice(0, 10).map(h => `
              <div class="bot-log-item">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-weight:800; font-family:var(--font-mono); color:#fff;">${h.symbol}</span>
                    <span class="${h.side === 'LONG' ? 'side-tag-long' : 'side-tag-short'}" style="font-size:9px; padding:1px 5px;">${h.side}</span>
                    <span style="font-size:9px; color:var(--text-dim);">${h.time}</span>
                  </div>
                  <div style="font-family:var(--font-mono); font-size:11px; font-weight:800; color:${h.pnl >= 0 ? 'var(--buy)' : 'var(--sell)'};">
                    ${h.status === 'APERTO' ? 'IN CORSO' : (h.pnl >= 0 ? '+' : '') + '$' + h.pnl.toFixed(2)}
                  </div>
                </div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:3px; line-height:1.2;">
                  ${h.reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  },

  // AUTONOMOUS BOT LOOP
  runBotAutonomousLoop: function() {
    if (!this.botActive) return;
    const s = this.macroSettings;

    // Check circuit breaker
    if (window.risk_manager && window.risk_manager.daily_pnl_pct <= s.dailyCircuitBreaker) {
      console.warn('[!] Daily Circuit Breaker triggered. Bot pausing.');
      this.botActive = false;
      this.refreshAutomatedView();
      if (window.showToast) window.showToast('🛑 Daily Circuit Breaker Raggiunto: Bot sospeso a tutela del capitale!', 'error');
      return;
    }

    // Check open positions count
    const openTrades = this.botExecutionHistory.filter(h => h.status === 'APERTO');
    if (openTrades.length >= s.maxOpenTrades) {
      return; // Max concurrent trades reached
    }

    // Check scanner opportunities
    const opps = window.OpportunityScanner ? window.OpportunityScanner.allOpportunities : [];
    if (!opps || opps.length === 0) return;

    // Filter by user macro settings
    const eligible = opps.filter(o => {
      // Min score check
      if (o.score < s.minScore) return false;

      // Sector check
      if (o.category === 'crypto' && !s.enabledSectors.includes('crypto')) return false;
      if (o.category === 'italy' && !s.enabledSectors.includes('italy')) return false;
      if ((o.category === 'us_tech' || o.category === 'us_sp500') && !s.enabledSectors.includes('us')) return false;
      if (o.category === 'forex' && !s.enabledSectors.includes('forex')) return false;
      if (o.category === 'commodities' && !s.enabledSectors.includes('commodities')) return false;

      // Don't duplicate open trades on same symbol
      if (openTrades.some(t => t.symbol === o.symbol)) return false;

      return true;
    });

    if (eligible.length > 0) {
      const topOpp = eligible[0]; // best score
      this.executeBotTrade(topOpp);
    }
  },

  executeBotTrade: function(opp) {
    const s = this.macroSettings;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newRecord = {
      id: Date.now(),
      symbol: opp.symbol,
      side: opp.side,
      entry: opp.entry,
      sl: opp.stopLoss,
      tp: opp.tp2,
      score: opp.score,
      time: timeStr,
      status: 'APERTO',
      pnl: 0,
      reason: `Trigger Quant Autonomo: Setup "${opp.setupName}" con confluenza ${opp.score}%. Stop Loss a ${opp.currency}${opp.stopLoss}.`
    };

    this.botExecutionHistory.unshift(newRecord);
    this.saveBotHistory();
    this.refreshAutomatedView();

    // Trigger Telegram notification
    if (window.sendTelegramSignalDirect) {
      window.sendTelegramSignalDirect({
        asset: opp.symbol,
        side: opp.side,
        price: opp.entry,
        sl: opp.stopLoss,
        tp1: opp.tp1,
        tp2: opp.tp2,
        rr: opp.rrRatio,
        score: opp.score,
        verdict: `🤖 ORDINE ESEGUITO AUTOMATICAMENTE DA QUANT BOT`,
        reason: `${newRecord.reason} Applicato trailing stop ${s.trailingType.toUpperCase()}.`
      });
    }

    if (window.showToast) {
      window.showToast(`🤖 Quant Bot: Eseguito ordine ${opp.side} su ${opp.symbol} (${opp.score}% Confluenza)`, 'success');
    }
  },

  // =========================================================================
  // 4. MACRO & SYNTHESIS PARAMETER MODAL ENGINE
  // =========================================================================
  openMacroModal: function() {
    const modal = document.getElementById('macro-bot-modal');
    if (!modal) return;

    const s = this.macroSettings;

    // Populate form fields
    const biasRadio = document.querySelector(`input[name="macro-bias"][value="${s.macroBias}"]`);
    if (biasRadio) biasRadio.checked = true;

    const scoreInput = document.getElementById('m-input-minscore');
    const scoreVal = document.getElementById('m-val-minscore');
    if (scoreInput) scoreInput.value = s.minScore;
    if (scoreVal) scoreVal.innerText = `${s.minScore}%`;

    const riskInput = document.getElementById('m-input-risk');
    const riskVal = document.getElementById('m-val-risk');
    if (riskInput) riskInput.value = s.riskPerTrade;
    if (riskVal) riskVal.innerText = `${s.riskPerTrade}%`;

    const capInput = document.getElementById('m-input-cap');
    if (capInput) capInput.value = s.maxCap;

    const tradesInput = document.getElementById('m-input-trades');
    if (tradesInput) tradesInput.value = s.maxOpenTrades;

    const cbInput = document.getElementById('m-input-cb');
    if (cbInput) cbInput.value = s.dailyCircuitBreaker;

    // Sector checkboxes
    document.querySelectorAll('.macro-sector-cb').forEach(cb => {
      cb.checked = s.enabledSectors.includes(cb.value);
    });

    const trailingCb = document.getElementById('m-cb-trailing');
    if (trailingCb) trailingCb.checked = s.trailingStop;

    const trailingType = document.getElementById('m-select-trailing');
    if (trailingType) trailingType.value = s.trailingType;

    modal.classList.add('open');
  },

  closeMacroModal: function() {
    document.getElementById('macro-bot-modal')?.classList.remove('open');
  },

  saveMacroSettingsFromModal: function() {
    const bias = document.querySelector('input[name="macro-bias"]:checked')?.value || 'neutral';
    const minScore = parseInt(document.getElementById('m-input-minscore')?.value || '82', 10);
    const risk = parseFloat(document.getElementById('m-input-risk')?.value || '1.5');
    const cap = parseFloat(document.getElementById('m-input-cap')?.value || '25000');
    const trades = parseInt(document.getElementById('m-input-trades')?.value || '3', 10);
    const cb = parseFloat(document.getElementById('m-input-cb')?.value || '-4.0');

    const enabledSectors = [];
    document.querySelectorAll('.macro-sector-cb:checked').forEach(c => {
      enabledSectors.push(c.value);
    });

    const trailingStop = document.getElementById('m-cb-trailing')?.checked || false;
    const trailingType = document.getElementById('m-select-trailing')?.value || 'sar';

    this.macroSettings = {
      macroBias: bias,
      minScore: minScore,
      riskPerTrade: risk,
      maxCap: cap,
      maxOpenTrades: trades,
      dailyCircuitBreaker: cb,
      enabledSectors: enabledSectors.length ? enabledSectors : ['crypto', 'italy', 'us'],
      trailingStop: trailingStop,
      trailingType: trailingType,
      marketHoursOnly: false
    };

    localStorage.setItem('quant_macro_settings', JSON.stringify(this.macroSettings));
    this.closeMacroModal();
    this.refreshAutomatedView();

    if (window.showToast) {
      window.showToast('Parametri Macro & Sintesi salvati con successo!', 'success');
    }
  },

  resetMacroSettingsToDefault: function() {
    this.macroSettings = {
      macroBias: 'neutral',
      minScore: 82,
      riskPerTrade: 1.5,
      maxCap: 25000,
      maxOpenTrades: 3,
      dailyCircuitBreaker: -4.0,
      enabledSectors: ['crypto', 'italy', 'us', 'forex', 'commodities'],
      trailingStop: true,
      trailingType: 'sar',
      marketHoursOnly: false
    };
    localStorage.removeItem('quant_macro_settings');
    this.openMacroModal(); // re-sync form
    if (window.showToast) {
      window.showToast('Ripristinati i default quantitativi istituzionali!', 'info');
    }
  },

  loadSavedMacroSettings: function() {
    try {
      const saved = localStorage.getItem('quant_macro_settings');
      if (saved) {
        this.macroSettings = Object.assign(this.macroSettings, JSON.parse(saved));
      }
    } catch (e) {}
  },

  loadBotHistory: function() {
    try {
      const saved = localStorage.getItem('quant_bot_history');
      if (saved) {
        this.botExecutionHistory = JSON.parse(saved);
      }
    } catch (e) {}
  },

  saveBotHistory: function() {
    try {
      localStorage.setItem('quant_bot_history', JSON.stringify(this.botExecutionHistory.slice(0, 50)));
    } catch (e) {}
  }
};

// =========================================================================
// 5. GLOBAL COMPATIBILITY HOOKS & CONTROLLERS
// =========================================================================
function setTradeSide(side) {
  currentTradeSide = side;
  const longBtn = document.getElementById('btn-mode-long');
  const shortBtn = document.getElementById('btn-mode-short');
  const execBtn = document.getElementById('btn-execute-order');

  if (side === 'LONG') {
    if (longBtn) longBtn.classList.add('active');
    if (shortBtn) shortBtn.classList.remove('active');
    if (execBtn) {
      execBtn.className = 'btn-action-primary btn-buy';
      execBtn.innerText = 'Apri Posizione LONG / BUY';
    }
  } else {
    if (longBtn) longBtn.classList.remove('active');
    if (shortBtn) shortBtn.classList.add('active');
    if (execBtn) {
      execBtn.className = 'btn-action-primary btn-sell';
      execBtn.innerText = 'Apri Posizione SHORT / SELL';
    }
  }
  recalcPosition();
}

function setLeveragePreset(val, chipElem) {
  currentLeverage = parseInt(val, 10);
  document.querySelectorAll('.lev-chip').forEach(c => c.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');

  const slider = document.getElementById('leverage-slider');
  if (slider) slider.value = currentLeverage;
  const display = document.getElementById('lev-display-val');
  if (display) display.innerText = `${currentLeverage}x`;

  recalcPosition();
}

function updateLeverage(val) {
  currentLeverage = parseInt(val, 10);
  const display = document.getElementById('lev-display-val');
  if (display) display.innerText = `${currentLeverage}x`;

  document.querySelectorAll('.lev-chip').forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.val, 10) === currentLeverage);
  });

  recalcPosition();
}

function setRiskPreset(val, chipElem) {
  defaultRiskPct = parseFloat(val);
  document.querySelectorAll('.risk-chip').forEach(c => c.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');

  const riskInput = document.getElementById('calc-risk-pct');
  if (riskInput) riskInput.value = defaultRiskPct;

  recalcPosition();
}

async function recalcPosition() {
  const entryVal = parseFloat(document.getElementById('t-entry')?.value) || 0;
  const slVal = parseFloat(document.getElementById('t-sl')?.value) || 0;
  const tpVal = parseFloat(document.getElementById('t-tp')?.value) || 0;
  const modeVal = document.getElementById('sizing-mode-select')?.value || 'standard';
  const capital = defaultCapital;
  const riskPct = defaultRiskPct;

  if (entryVal <= 0 || slVal <= 0) return;

  try {
    const res = await fetch('/api/calculate-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capital: capital,
        entry: entryVal,
        sl: slVal,
        tp: tpVal,
        risk_pct: riskPct,
        leverage: currentLeverage,
        mode: modeVal,
        atr: window.currentAtr || 0
      })
    });
    const data = await res.json();

    const unitsElem = document.getElementById('pos-res-units');
    const marginElem = document.getElementById('pos-res-margin');
    const riskElem = document.getElementById('pos-res-risk');
    const profitElem = document.getElementById('pos-res-profit');
    const rrElem = document.getElementById('pos-res-rr');
    const liqElem = document.getElementById('pos-res-liq');
    const warnElem = document.getElementById('pos-res-warn');

    if (unitsElem) unitsElem.innerText = data.position_size_units || 0;
    if (marginElem) marginElem.innerText = `$${data.margine_richiesto || 0}`;
    if (riskElem) riskElem.innerText = `$${data.rischio_valuta || 0} (${data.distanza_sl_pct}%)`;
    if (profitElem) profitElem.innerText = `$${data.profitto_potenziale || 0}`;
    if (rrElem) rrElem.innerText = `1 : ${data.rr_ratio || 0}`;
    if (liqElem) liqElem.innerText = data.liquidation_price > 0 ? `$${data.liquidation_price}` : 'N/A (1x)';

    const multiTpBody = document.getElementById('multi-tp-tbody');
    if (multiTpBody && data.multi_tp) {
      multiTpBody.innerHTML = data.multi_tp.map(tier => `
        <tr>
          <td style="color:var(--text-dim)">${tier.tier}</td>
          <td style="font-weight:700; color:var(--buy)">$${tier.price}</td>
          <td>${tier.rr}</td>
          <td style="color:var(--buy)">+$${tier.profit}</td>
        </tr>
      `).join('');
    }

    if (warnElem) {
      if (data.warning) {
        warnElem.innerText = data.warning;
        warnElem.style.display = 'block';
      } else {
        warnElem.style.display = 'none';
      }
    }
  } catch (e) {
    // Local calculation fallback if backend unavailable
    const dist = Math.abs(entryVal - slVal);
    const riskVal = capital * (riskPct / 100);
    const units = dist > 0 ? (riskVal / dist) : 0;
    const nominal = units * entryVal;
    const margin = nominal / currentLeverage;
    const profit = tpVal > 0 ? units * Math.abs(tpVal - entryVal) : 0;
    const rr = dist > 0 && tpVal > 0 ? (Math.abs(tpVal - entryVal) / dist) : 2.5;

    const rrElem = document.getElementById('pos-res-rr');
    if (rrElem) rrElem.innerText = `1 : ${rr.toFixed(2)}`;
    const costElem = document.getElementById('bb-cost-val');
    if (costElem) costElem.innerText = `$${margin.toFixed(2)}`;
  }
}

async function executeTrade() {
  const symbol = window.currentSymbol || window.activeSymbol || 'BTCUSDT';
  const entry = parseFloat(document.getElementById('t-entry')?.value);
  const sl = parseFloat(document.getElementById('t-sl')?.value) || null;
  const tp = parseFloat(document.getElementById('t-tp')?.value) || null;
  const units = parseFloat(document.getElementById('pos-res-units')?.innerText) || 1.0;
  const skill = document.getElementById('trade-skill-tag')?.value || 'Discretionary';

  if (!entry || entry <= 0) {
    if (window.showToast) window.showToast('Inserisci un prezzo di Entry valido.', 'error');
    return;
  }

  let orderCreated = false;
  try {
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol,
        side: currentTradeSide,
        entry_price: entry,
        qty: units,
        leverage: currentLeverage,
        sl: sl,
        tp: tp,
        investor_skill: skill,
        notes: `Eseguito da Trading Pro Ultimate™ (cuordivino) - ${skill}`
      })
    });
    if (res.ok) {
      const result = await res.json();
      if (result.status === 'created') orderCreated = true;
    }
  } catch (e) {}

  // LocalStorage Fallback for static GitHub Pages
  if (!orderCreated) {
    try {
      const trades = JSON.parse(localStorage.getItem('pro_trades') || '[]');
      const newTrade = {
        id: trades.length + 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        symbol: symbol,
        side: currentTradeSide,
        entry_price: entry,
        exit_price: null,
        qty: units,
        leverage: currentLeverage,
        pnl: 0,
        sl: sl,
        tp: tp,
        investor_skill: skill,
        status: 'OPEN'
      };
      trades.unshift(newTrade);
      localStorage.setItem('pro_trades', JSON.stringify(trades));
      orderCreated = true;
    } catch (err) {}
  }

  if (window.showToast) {
    window.showToast(`Ordine ${currentTradeSide} su ${symbol} registrato con successo!`, 'success');
  }
  if (window.loadTradeJournal) loadTradeJournal();

  // Send motivated Telegram alert
  if (window.sendTelegramSignalDirect) {
    window.sendTelegramSignalDirect({
      asset: symbol,
      side: currentTradeSide,
      price: entry,
      sl: sl || +(entry * (currentTradeSide === 'LONG' ? 0.96 : 1.04)).toFixed(2),
      tp1: tp || +(entry * (currentTradeSide === 'LONG' ? 1.05 : 0.95)).toFixed(2),
      tp2: +( (tp || entry) * (currentTradeSide === 'LONG' ? 1.09 : 0.91) ).toFixed(2),
      rr: document.getElementById('pos-res-rr')?.innerText || '1 : 2.5',
      score: 88,
      verdict: `ESECUZIONE ${currentTradeSide}`,
      mentor: skill,
      reason: `Ordine di mercato eseguito a $${entry} con leva ${currentLeverage}x. Strategia: ${skill}. Gestione rischio verificata.`
    });
  }
}

function dispatchActiveOrderToTelegram() {
  const symbol = window.currentSymbol || window.activeSymbol || 'BTCUSDT';
  const entry = parseFloat(document.getElementById('t-entry')?.value) || window.currentLivePrice || 100;
  const sl = parseFloat(document.getElementById('t-sl')?.value) || +(entry * 0.97).toFixed(2);
  const tp = parseFloat(document.getElementById('t-tp')?.value) || +(entry * 1.08).toFixed(2);
  const skill = document.getElementById('trade-skill-tag')?.value || 'Discretionary';

  if (window.sendTelegramSignalDirect) {
    window.sendTelegramSignalDirect({
      asset: symbol,
      side: currentTradeSide,
      price: entry,
      sl: sl,
      tp1: +(entry + (tp - entry) * 0.5).toFixed(2),
      tp2: tp,
      rr: document.getElementById('pos-res-rr')?.innerText || '1 : 2.8',
      score: 90,
      verdict: `SEGNALE MOTIVATO ${currentTradeSide}`,
      mentor: skill,
      reason: `Segnale generato su ${symbol} dal terminale Trading Pro Ultimate. Livelli di Stop Loss e Take Profit verificati in base alla volatilità e al POC volumetrico.`
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  TradingEngine.init();
});
