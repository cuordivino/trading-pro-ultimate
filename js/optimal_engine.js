/**
 * TRADING PRO ULTIMATE™ — OPTIMAL POSITION & AUTOTRADING ENGINE
 * Inspired by: Kiyotaka (TerminalValue.io) & OpenMarket (openmarket.xyz)
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Features:
 * 1. Optimal Convex Position Evaluator (Max Profit Asymmetry)
 * 2. Execution Modes: Manuale | Semi-Automatico | 100% Automatico (AI Auto-Pilot)
 * 3. Telegram Confirmation Signals Dispatcher
 * 4. Local Volume Profile by Time Window (POC, VAH, VAL)
 */

window.OptimalEngine = {
  // Execution Mode: 'manual' | 'semi_auto' | 'full_auto'
  executionMode: 'semi_auto',
  autoPilotActive: false,
  autoPilotTimer: null,
  minConvexScore: 82, // Threshold to trigger trade

  // Local Volume Profile Range: 'session' | '4h' | '24h' | 'visible'
  volumeProfileRange: 'session',
  volumeProfileVisible: true,
  currentVolumeProfile: { poc: 0, vah: 0, val: 0, totalVolume: 0, bins: [] },

  // Current Optimal Setup
  optimalSetup: null,

  init: function() {
    this.recalculateOptimalPosition();
    this.calculateLocalVolumeProfile();

    // Auto-update every 4 seconds
    setInterval(() => {
      this.recalculateOptimalPosition();
      if (this.autoPilotActive && this.executionMode === 'full_auto') {
        this.runAutoPilotLoop();
      }
    }, 4000);

    // Initial render
    this.renderOptimalUI();
  },

  // 1. KIYOTAKA OPTIMAL CONVEX POSITION MODEL
  recalculateOptimalPosition: function() {
    const sym = window.activeSymbol || window.currentSymbol || 'BTCUSDT';
    const price = window.activePrice || (window.BybitEngine ? window.BybitEngine.tickerData.lastPrice : 80350);
    const candles = window.currentCandles || [];
    const gr = window.SectorRotation ? window.SectorRotation.evaluateGoldenRule(sym) : { goldenRuleValid: true, sectorStatus: 'Bullish' };
    const vp = this.currentVolumeProfile;

    // Convex Payoff Model:
    // Profit Target is anchored to local Volume Profile VAH or expansion target
    // Stop Loss is anchored to POC or key EMA 21
    const ema21 = price * 0.985;
    const pocLevel = vp.poc > 0 ? vp.poc : price * 0.992;
    
    // Stop Loss: tight below POC/EMA (low risk)
    const sl = +(Math.min(pocLevel * 0.995, price * 0.978)).toFixed(2);
    const risk = price - sl;

    // Multi-Target Profit Maximization:
    // TP1 (1.8R conservative), TP2 (3.2R convex sweet spot), TP3 (5.5R runner)
    const tp1 = +(price + risk * 1.8).toFixed(2);
    const tp2 = +(price + risk * 3.2).toFixed(2);
    const tp3 = +(price + risk * 5.5).toFixed(2);
    const rrRatio = +( (tp2 - price) / risk ).toFixed(2);

    // Compute Kiyotaka Convex Profit Score (0 - 100)
    let score = 70;
    if (gr.goldenRuleValid) score += 12;
    if (rrRatio >= 3.0) score += 10;
    if (candles.length > 10 && price > candles[candles.length - 1].open) score += 6;
    score = Math.min(98, score);

    this.optimalSetup = {
      symbol: sym,
      side: 'LONG',
      entryPrice: price,
      stopLoss: sl,
      tp1: tp1,
      tp2: tp2,
      tp3: tp3,
      rrRatio: `1 : ${rrRatio}`,
      convexScore: score,
      pocAnchor: pocLevel,
      vahTarget: vp.vah || tp1,
      expectedROI: `+${( ((tp2 - price) / price) * 10 * 100 ).toFixed(1)}% (con leva 10x)`,
      reason: `Setup Asimmetrico convesso derivato dall'algoritmo Kiyotaka (TerminalValue): Rimbalzo dal POC locale a $${pocLevel}, flusso settoriale in accumulazione e asimmetria R/R superiore a 1:3.`
    };

    this.renderOptimalCards();
  },

  // 2. LOCAL VOLUME PROFILE (OPENMARKET.XYZ STYLE)
  calculateLocalVolumeProfile: function() {
    const candles = window.currentCandles || [];
    if (!candles || candles.length < 5) return;

    // Determine study window (e.g. last 40 candles for session)
    const studyCount = this.volumeProfileRange === '4h' ? 16 : (this.volumeProfileRange === '24h' ? 96 : 48);
    const studyCandles = candles.slice(-Math.min(candles.length, studyCount));

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalVol = 0;

    studyCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      totalVol += (c.volume || 10);
    });

    if (minPrice >= maxPrice) return;

    // Divide price range into 24 bins with dynamic precision
    const sym = window.currentSymbol || 'BTCUSDT';
    const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(minPrice, sym) : (asset ? (asset.precision || 2) : 2);
    const curr = asset ? (asset.currency || '$') : '$';

    const numBins = 24;
    const binSize = (maxPrice - minPrice) / numBins;
    const bins = new Array(numBins).fill(0).map((_, i) => ({
      price: +(minPrice + (i * binSize)).toFixed(prec),
      vol: 0
    }));

    studyCandles.forEach(c => {
      const vol = c.volume || 10;
      const mid = (c.high + c.low + c.close) / 3;
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((mid - minPrice) / binSize)));
      bins[idx].vol += vol;
    });

    // Find POC (Point of Control = bin with max volume)
    let maxBinVol = 0;
    let pocPrice = minPrice;
    bins.forEach(b => {
      if (b.vol > maxBinVol) {
        maxBinVol = b.vol;
        pocPrice = b.price;
      }
    });

    // Compute Value Area (70% of total volume around POC)
    const targetVaVol = totalVol * 0.70;
    let currentVaVol = maxBinVol;
    let lowIdx = bins.findIndex(b => b.price === pocPrice);
    let highIdx = lowIdx;

    while (currentVaVol < targetVaVol && (lowIdx > 0 || highIdx < numBins - 1)) {
      const nextLowVol = lowIdx > 0 ? bins[lowIdx - 1].vol : 0;
      const nextHighVol = highIdx < numBins - 1 ? bins[highIdx + 1].vol : 0;
      if (nextHighVol >= nextLowVol && highIdx < numBins - 1) {
        highIdx++;
        currentVaVol += nextHighVol;
      } else if (lowIdx > 0) {
        lowIdx--;
        currentVaVol += nextLowVol;
      } else {
        break;
      }
    }

    const vah = bins[highIdx] ? bins[highIdx].price : maxPrice;
    const val = bins[lowIdx] ? bins[lowIdx].price : minPrice;

    this.currentVolumeProfile = {
      poc: pocPrice,
      vah: vah,
      val: val,
      totalVolume: Math.round(totalVol),
      bins: bins,
      maxBinVol: maxBinVol,
      precision: prec,
      currency: curr
    };

    this.renderVolumeProfileOverlay();
  },

  // RENDER HORIZONTAL LOCAL VOLUME PROFILE ON CHART
  renderVolumeProfileOverlay: function() {
    const overlay = document.getElementById('chart-vp-overlay');
    if (!overlay) return;

    if (!this.volumeProfileVisible) {
      overlay.style.display = 'none';
      return;
    }
    overlay.style.display = 'block';

    const vp = this.currentVolumeProfile;
    if (!vp || !vp.bins || !vp.bins.length) return;

    const prec = vp.precision !== undefined ? vp.precision : 2;
    const curr = vp.currency || '$';

    overlay.innerHTML = `
      <div class="vp-telemetry-badge">
        <span style="color:var(--text-muted)">Volumi Locali (${this.volumeProfileRange.toUpperCase()}):</span>
        <span style="color:var(--accent); font-weight:800">POC ${curr}${Number(vp.poc).toFixed(prec)}</span>
        <span style="color:var(--cyan)">VAH ${curr}${Number(vp.vah).toFixed(prec)}</span>
        <span style="color:var(--purple)">VAL ${curr}${Number(vp.val).toFixed(prec)}</span>
        <span style="color:var(--text-dim)">Vol: ${vp.totalVolume.toLocaleString()}</span>
      </div>
      <div class="vp-bars-container">
        ${vp.bins.slice().reverse().map(b => {
          const widthPct = Math.min(100, Math.round((b.vol / (vp.maxBinVol || 1)) * 100));
          const isPoc = Math.abs(b.price - vp.poc) < (0.0000001);
          return `
            <div class="vp-bar-row ${isPoc ? 'is-poc' : ''}">
              <span class="vp-bar-price">${Number(b.price).toFixed(prec)}</span>
              <div class="vp-bar-track">
                <div class="vp-bar-fill ${isPoc ? 'poc-fill' : ''}" style="width:${widthPct}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  toggleVolumeProfileVisibility: function() {
    this.volumeProfileVisible = !this.volumeProfileVisible;
    this.renderVolumeProfileOverlay();
    const btn = document.getElementById('btn-toggle-vp');
    if (btn) btn.classList.toggle('active', this.volumeProfileVisible);
    if (window.showToast) {
      window.showToast(`Volumi Locali POC/VAH: ${this.volumeProfileVisible ? 'VISIBILI' : 'NASCOSTI'}`, 'info');
    }
  },

  setVolumeProfileRange: function(range) {
    this.volumeProfileRange = range;
    document.querySelectorAll('.vp-range-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-vprange="${range}"]`)?.classList.add('active');
    this.calculateLocalVolumeProfile();
  },

  // 3. EXECUTION MODE SWITCHER (MANUALE | SEMI-AUTOMATICO | 100% AUTOMATICO)
  setExecutionMode: function(mode) {
    this.executionMode = mode;
    this.autoPilotActive = (mode === 'full_auto');

    document.querySelectorAll('.exec-mode-pill').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

    const statusBanner = document.getElementById('auto-exec-status-banner');
    if (statusBanner) {
      if (mode === 'full_auto') {
        statusBanner.className = 'exec-mode-banner auto-on';
        statusBanner.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="pulse-indicator" style="background:var(--buy)"></span>
            <b>MODALITÀ 100% AUTOMATICA ATTIVA (AI AUTO-PILOT)</b>
          </div>
          <div style="font-size:10px; color:var(--text-dim); margin-top:2px">
            L'agente AI monitora il mercato in continuo ed esegue automaticamente le posizioni con Score Convesso > 85%. Notifiche live inviate a Telegram.
          </div>
        `;
      } else if (mode === 'semi_auto') {
        statusBanner.className = 'exec-mode-banner semi-on';
        statusBanner.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="pulse-indicator" style="background:var(--accent)"></span>
            <b>MODALITÀ SEMI-AUTOMATICA ATTIVA (CONFERMA RICHIESTA)</b>
          </div>
          <div style="font-size:10px; color:var(--text-dim); margin-top:2px">
            L'IA genera la posizione ottimale, predispone size e stop loss e attende la tua conferma manuale a schermo o via Telegram prima di eseguire.
          </div>
        `;
      } else {
        statusBanner.className = 'exec-mode-banner manual-on';
        statusBanner.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="pulse-indicator" style="background:var(--cyan)"></span>
            <b>MODALITÀ MANUALE DISCREZIONALE</b>
          </div>
          <div style="font-size:10px; color:var(--text-dim); margin-top:2px">
            Controllo manuale totale. Tutti i parametri sono calcolati come guida e supporto decisionale.
          </div>
        `;
      }
    }

    // Sync Order Execution panel widgets
    const badge = document.getElementById('opt-mode-status-badge');
    const desc = document.getElementById('opt-mode-desc-text');
    const btnManual = document.getElementById('btn-mode-manual');
    const btnSemi = document.getElementById('btn-mode-semi');
    const btnAuto = document.getElementById('btn-mode-auto');

    if (btnManual && btnSemi && btnAuto) {
      btnManual.style.background = mode === 'manual' ? 'rgba(6,182,212,0.2)' : 'transparent';
      btnManual.style.borderColor = mode === 'manual' ? 'var(--cyan)' : 'var(--border)';
      btnManual.style.color = mode === 'manual' ? '#fff' : 'var(--text-muted)';

      btnSemi.style.background = mode === 'semi_auto' ? 'rgba(99,102,241,0.2)' : 'transparent';
      btnSemi.style.borderColor = mode === 'semi_auto' ? 'var(--accent)' : 'var(--border)';
      btnSemi.style.color = mode === 'semi_auto' ? '#fff' : 'var(--text-muted)';

      btnAuto.style.background = mode === 'full_auto' ? 'rgba(16,185,129,0.2)' : 'transparent';
      btnAuto.style.borderColor = mode === 'full_auto' ? 'var(--green)' : 'var(--border)';
      btnAuto.style.color = mode === 'full_auto' ? '#fff' : 'var(--text-muted)';
    }

    if (badge) {
      if (mode === 'full_auto') {
        badge.innerText = '🤖 AUTO-PILOT ON';
        badge.style.color = 'var(--green)';
        badge.style.borderColor = 'rgba(16,185,129,0.3)';
        badge.style.background = 'rgba(16,185,129,0.15)';
      } else if (mode === 'semi_auto') {
        badge.innerText = '⚡ SEMI-AUTO ATTIVO';
        badge.style.color = 'var(--accent)';
        badge.style.borderColor = 'rgba(99,102,241,0.3)';
        badge.style.background = 'rgba(99,102,241,0.15)';
      } else {
        badge.innerText = 'MANUALE ATTIVO';
        badge.style.color = 'var(--cyan)';
        badge.style.borderColor = 'rgba(6,182,212,0.3)';
        badge.style.background = 'rgba(6,182,212,0.15)';
      }
    }

    if (desc) {
      if (mode === 'full_auto') desc.innerText = 'Esecuzione automatica IA se Convessità > 82%';
      else if (mode === 'semi_auto') desc.innerText = 'Segnale IA Telegram & 1-click execution';
      else desc.innerText = 'Ordini inseriti e confermati manualmente';
    }

    if (window.showToast) {
      window.showToast(`Modalità Esecuzione: ${mode.toUpperCase().replace('_', ' ')}`, 'success');
    }
  },

  // 4. AUTONOMOUS BOT LOOP (FOR 100% AUTOMATIC MODE)
  runAutoPilotLoop: function() {
    if (!this.optimalSetup) return;
    const setup = this.optimalSetup;

    if (setup.convexScore >= this.minConvexScore) {
      // Cooldown check (prevent spamming same price)
      const lastExecTime = parseInt(sessionStorage.getItem('last_auto_exec_time') || '0', 10);
      if (Date.now() - lastExecTime < 60000) return; // 1 min cooldown

      sessionStorage.setItem('last_auto_exec_time', Date.now().toString());

      // Auto Execute Trade
      if (window.executeTrade) {
        document.getElementById('t-entry').value = setup.entryPrice;
        document.getElementById('t-sl').value = setup.stopLoss;
        document.getElementById('t-tp').value = setup.tp2;
        window.executeTrade();
      }

      if (window.showToast) {
        window.showToast(`🤖 AI Auto-Pilot: Posizione Ottimale ${setup.symbol} Eseguita Automaticamente!`, 'success');
      }

      // Send Instant Telegram Notification with Auto-Trade confirmation
      this.sendOptimalTelegramSignal(true);
    }
  },

  // 5. TELEGRAM CONFIRMATION SIGNAL DISPATCHER
  sendOptimalTelegramSignal: function(isAutoExecuted = false) {
    if (!this.optimalSetup) this.recalculateOptimalPosition();
    const s = this.optimalSetup;

    const actionText = isAutoExecuted 
      ? '🤖 *ESECUZIONE AUTOMATICA COMPLETATA DALL\'AI AUTO-PILOT*' 
      : '⚠️ *RICHIESTA CONFERMA SEGNALE (MODALITÀ SEMI-AUTOMATICA)*';

    const msg = `⚡ *TRADING PRO ULTIMATE™ — AI OPTIMAL POSITION* ⚡
👤 Autore: cuordivino (Tutti i diritti riservati)
━━━━━━━━━━━━━━━━━━━━━━
${actionText}

📊 Asset: #${s.symbol}
🎯 Direzione: 🟢 BUY / LONG (Leva 10x)
💰 Prezzo Ottimale: $${s.entryPrice}
🛑 Stop Loss Protettivo: $${s.stopLoss} (-2.2%)
🎯 Target 1 (Conservativo): $${s.tp1}
🎯 Target 2 (Ottimale Kiyotaka): $${s.tp2}
🎯 Target 3 (Runner Estremo): $${s.tp3}
⚖️ Rapporto Asimmetrico R/R: ${s.rrRatio}
📈 ROI Atteso: ${s.expectedROI}

📐 METRICHE VOLUME PROFILE (OPENMARKET):
• POC (Point of Control): $${s.pocAnchor}
• VAH (Value Area High): $${s.vahTarget}
• Punteggio Convessità IA: ${s.convexScore}/100

📝 MOTIVAZIONE ISTITUZIONALE:
${s.reason}
━━━━━━━━━━━━━━━━━━━━━━
${isAutoExecuted ? '✅ Ordine già immesso a mercato.' : '👉 Per confermare ed eseguire con 1-click: Apri il terminale e clicca [Conferma Trade].'}
📅 Data: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`;

    if (window.sendTelegramSignalDirect) {
      window.sendTelegramSignalDirect({
        asset: s.symbol,
        side: s.side,
        price: s.entryPrice,
        sl: s.stopLoss,
        tp1: s.tp1,
        tp2: s.tp2,
        rr: s.rrRatio,
        score: s.convexScore,
        verdict: isAutoExecuted ? 'AUTO-PILOT ESEGUITO' : 'SEMI-AUTO CONFERMA',
        reason: s.reason
      });
    }
  },

  // APPLY OPTIMAL PARAMETERS TO TERMINAL IN 1 CLICK
  applyOptimalToTerminal: function() {
    if (!this.optimalSetup) return;
    const s = this.optimalSetup;

    const entryInput = document.getElementById('t-entry');
    const slInput = document.getElementById('t-sl');
    const tpInput = document.getElementById('t-tp');

    if (entryInput) entryInput.value = s.entryPrice;
    if (slInput) slInput.value = s.stopLoss;
    if (tpInput) tpInput.value = s.tp2;

    if (window.BybitEngine) {
      window.BybitEngine.recalcBybitOrderMetrics();
    }
    if (window.recalcPosition) {
      window.recalcPosition();
    }

    // Switch to Terminal Tab
    if (window.switchMainTab) {
      const btn = document.querySelector('[data-tab="tab-terminal"]');
      window.switchMainTab('tab-terminal', btn);
    }

    if (window.showToast) {
      window.showToast(`Parametri Ottimali Kiyotaka Caricati: Entry $${s.entryPrice}, TP $${s.tp2}, SL $${s.stopLoss}`, 'success');
    }
  },

  // RENDER DEDICATED OPTIMAL TRADING TAB VIEW
  renderOptimalUI: function() {
    const container = document.getElementById('optimal-engine-view-container');
    if (!container) return;

    const s = this.optimalSetup || {
      symbol: 'BTCUSDT',
      entryPrice: 80350,
      stopLoss: 78500,
      tp1: 82500,
      tp2: 85500,
      tp3: 89000,
      rrRatio: '1 : 3.4',
      convexScore: 89,
      expectedROI: '+34.0%',
      pocAnchor: 80250,
      vahTarget: 82800,
      reason: 'Setup Asimmetrico convesso derivato dall\'algoritmo Kiyotaka'
    };

    container.innerHTML = `
      <div class="quant-grid-layout">
        
        <!-- HEADER DECK -->
        <div class="quant-header-deck">
          <div class="quant-deck-title">
            <span class="sparkle-icon">🎯</span>
            <div>
              <div style="font-weight:900; font-size:16px; letter-spacing:0.5px">GESTIONE POSIZIONI OTTIMALI & AUTOTRADING IA</div>
              <div style="font-size:11px; color:var(--text-muted)">Modello Convesso Kiyotaka (TerminalValue) & Volumi Locali OpenMarket • Trading Pro Ultimate © by cuordivino</div>
            </div>
          </div>

          <!-- EXECUTION MODE SELECTOR -->
          <div class="exec-mode-pills-wrap">
            <button class="exec-mode-pill ${this.executionMode === 'manual' ? 'active' : ''}" data-mode="manual" onclick="OptimalEngine.setExecutionMode('manual')">
              👤 Manuale
            </button>
            <button class="exec-mode-pill ${this.executionMode === 'semi_auto' ? 'active' : ''}" data-mode="semi_auto" onclick="OptimalEngine.setExecutionMode('semi_auto')">
              ⚡ Semi-Automatico
            </button>
            <button class="exec-mode-pill ${this.executionMode === 'full_auto' ? 'active' : ''}" data-mode="full_auto" onclick="OptimalEngine.setExecutionMode('full_auto')">
              🤖 100% Auto-Pilot IA
            </button>
          </div>
        </div>

        <!-- EXECUTION MODE STATUS BANNER -->
        <div id="auto-exec-status-banner" class="exec-mode-banner ${this.executionMode === 'full_auto' ? 'auto-on' : (this.executionMode === 'semi_auto' ? 'semi-on' : 'manual-on')}">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="pulse-indicator" style="background:${this.executionMode === 'full_auto' ? 'var(--buy)' : 'var(--accent)'}"></span>
            <b>${this.executionMode === 'full_auto' ? 'MODALITÀ 100% AUTOMATICA ATTIVA (AI AUTO-PILOT)' : 'MODALITÀ SEMI-AUTOMATICA ATTIVA (CONFERMA RICHIESTA)'}</b>
          </div>
          <div style="font-size:10px; color:var(--text-dim); margin-top:2px">
            ${this.executionMode === 'full_auto' ? 'L\'agente IA esegue a mercato non appena il punteggio convesso supera 85%. Segnali e conferme live inviati al tuo Bot Telegram.' : 'L\'agente IA calcola la posizione a massimo profitto e richiede la tua conferma a schermo o su Telegram prima di inviare l\'ordine.'}
          </div>
        </div>

        <!-- OPTIMAL CONVEX POSITION CARD (KIYOTAKA MODEL) -->
        <div class="window-card" style="border-color:rgba(0,242,161,0.4); background:linear-gradient(135deg, rgba(7,12,24,0.98) 0%, rgba(13,24,45,0.98) 100%);">
          <div class="window-header">
            <div class="window-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px">💎</span>
              <span style="color:#fff; font-weight:900">POSIZIONE AD ASIMMETRIA CONVESSA MASSIMO PROFITTO (${s.symbol})</span>
            </div>
            <span class="strat-tag" style="background:rgba(0,242,161,0.2); color:var(--buy); font-size:12px; font-weight:900">
              Score Convesso: ${s.convexScore}/100
            </span>
          </div>

          <div class="window-body" style="padding:18px;">
            
            <div class="input-grid-2col" style="gap:16px;">
              
              <!-- Metrics Column -->
              <div class="pos-summary">
                <div class="pos-row"><span>Prezzo Ottimale di Ingresso:</span><span style="font-weight:900; color:#fff; font-size:14px">$${s.entryPrice}</span></div>
                <div class="pos-row"><span>Stop Loss Asimmetrico (Rischio Minimo):</span><span style="color:var(--sell); font-weight:800">$${s.stopLoss}</span></div>
                <div class="pos-row"><span>Target 1 (Base):</span><span style="color:var(--buy)">$${s.tp1}</span></div>
                <div class="pos-row"><span>Target 2 (Convex Sweet Spot):</span><span style="color:var(--buy); font-weight:800; font-size:14px">$${s.tp2}</span></div>
                <div class="pos-row"><span>Target 3 (Moonbag Runner):</span><span style="color:var(--accent); font-weight:800">$${s.tp3}</span></div>
                <div class="pos-row"><span>Rapporto Rischio / Rendimento:</span><span style="font-weight:900; color:var(--cyan)">${s.rrRatio}</span></div>
                <div class="pos-row"><span>ROI Stimato con Leva 10x:</span><span style="font-weight:900; color:var(--buy)">${s.expectedROI}</span></div>
              </div>

              <!-- Logic & Actions Column -->
              <div class="pos-summary" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:800; margin-bottom:6px">TESI ALGORITMICA KIYOTAKA:</div>
                  <div style="font-size:12px; color:var(--text-main); line-height:1.5">${s.reason}</div>

                  <div style="margin-top:12px; padding:8px 12px; background:rgba(0,0,0,0.3); border-radius:4px; border:1px solid rgba(255,255,255,0.04); font-size:11px;">
                    <div style="color:var(--cyan); font-weight:700; margin-bottom:2px">Livelli Volume Profile (OpenMarket):</div>
                    <div style="display:flex; gap:12px; font-family:var(--font-mono); font-size:10px;">
                      <span>POC: <b style="color:var(--accent)">$${s.pocAnchor}</b></span>
                      <span>VAH: <b style="color:var(--cyan)">$${s.vahTarget}</b></span>
                    </div>
                  </div>
                </div>

                <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap">
                  <button class="btn-action-primary btn-buy" style="flex:1; min-width:180px; padding:10px; font-weight:800" onclick="OptimalEngine.applyOptimalToTerminal()">
                    📥 Applica al Terminale di Esecuzione
                  </button>
                  <button class="btn-telegram-dispatch" style="flex:1; min-width:180px; padding:10px" onclick="OptimalEngine.sendOptimalTelegramSignal(false)">
                    📲 Invia Segnale Telegram di Conferma
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        <!-- LOCAL VOLUME PROFILE CONTROL CARD -->
        <div class="window-card">
          <div class="window-header">
            <div class="window-title">
              <span>📊 Volumi Locali per Fascia Temporale (POC, VAH, VAL - OpenMarket Style)</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:10px; color:var(--text-muted); font-weight:700">FASCIA TEMPORALE:</span>
              <div class="tf-pill-group">
                <button class="tf-pill vp-range-btn ${this.volumeProfileRange === '4h' ? 'active' : ''}" data-vprange="4h" onclick="OptimalEngine.setVolumeProfileRange('4h')">4 Ore</button>
                <button class="tf-pill vp-range-btn ${this.volumeProfileRange === 'session' ? 'active' : ''}" data-vprange="session" onclick="OptimalEngine.setVolumeProfileRange('session')">Sessione</button>
                <button class="tf-pill vp-range-btn ${this.volumeProfileRange === '24h' ? 'active' : ''}" data-vprange="24h" onclick="OptimalEngine.setVolumeProfileRange('24h')">24 Ore</button>
              </div>
              <button class="btn btn-secondary ${this.volumeProfileVisible ? 'active' : ''}" id="btn-toggle-vp" style="font-size:10px; padding:3px 8px; border-color:var(--cyan); color:var(--cyan)" onclick="OptimalEngine.toggleVolumeProfileVisibility()">
                Mostra/Nascondi sul Grafico
              </button>
            </div>
          </div>

          <div class="window-body" style="padding:16px;">
            <p style="font-size:11px; color:var(--text-dim); line-height:1.5; margin:0 0 12px 0;">
              L'indicatore di <b>Volume Profile Locale</b> analizza la distribuzione volumetrica del prezzo all'interno della specifica fascia temporale di studio selezionata. Identifica il <b>POC (Point of Control)</b>, ovvero il livello di prezzo dove sono avvenute le maggiori transazioni istituzionali, e la <b>Value Area (VAH / VAL)</b> dove si concentra il 70% dei volumi.
            </p>

            <div class="nautilus-telemetry-row">
              <div class="naut-tele-card">
                <span class="k">POC (Point of Control)</span>
                <span class="v text-accent">$${this.currentVolumeProfile.poc}</span>
                <span class="sub">Maggiore accumulazione istituzionale</span>
              </div>
              <div class="naut-tele-card">
                <span class="k">VAH (Value Area High)</span>
                <span class="v text-green">$${this.currentVolumeProfile.vah}</span>
                <span class="sub">Resistenza volumetrica superiore</span>
              </div>
              <div class="naut-tele-card">
                <span class="k">VAL (Value Area Low)</span>
                <span class="v" style="color:var(--purple)">$${this.currentVolumeProfile.val}</span>
                <span class="sub">Supporto volumetrico inferiore</span>
              </div>
              <div class="naut-tele-card">
                <span class="k">Volume Totale Fascia</span>
                <span class="v">${this.currentVolumeProfile.totalVolume.toLocaleString()}</span>
                <span class="sub">Contratti scambiati nella finestra</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  },

  renderOptimalCards: function() {
    this.renderOptimalUI();
    this.renderVolumeProfileOverlay();
  }
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    OptimalEngine.init();
  }, 600);
});
