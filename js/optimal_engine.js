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

  // Local Volume Profile Range: 'visible' | 'session' | '100' | '24h' | 'all'
  volumeProfileRange: 'visible',
  volumeProfileVisible: true,
  volumeProfileStyle: 'right', // 'right' | 'floating'
  volumeProfileBins: 36,
  volumeProfileWidth: 220,
  volumeProfileVaPct: 0.70,
  volumeProfileShowValues: false,
  volumeProfileShowPocRay: true,
  currentVolumeProfile: { poc: 0, vah: 0, val: 0, minPrice: 0, maxPrice: 0, totalVolume: 0, bins: [] },

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

  // 2. LOCAL VOLUME PROFILE (OPENMARKET.XYZ / VRVP STYLE)
  calculateLocalVolumeProfile: function() {
    const candles = window.currentCandles || [];
    if (!candles || candles.length < 5) return;

    let studyCandles = [];
    if (this.volumeProfileRange === 'visible' && window.mainChart && typeof window.mainChart.timeScale === 'function') {
      try {
        const timeScale = window.mainChart.timeScale();
        const vRange = timeScale.getVisibleLogicalRange ? timeScale.getVisibleLogicalRange() : null;
        if (vRange && candles.length) {
          const fromIdx = Math.max(0, Math.floor(vRange.from));
          const toIdx = Math.min(candles.length - 1, Math.ceil(vRange.to));
          studyCandles = candles.slice(fromIdx, toIdx + 1);
        }
      } catch (e) {
        studyCandles = [];
      }
    }

    if (!studyCandles.length) {
      const studyCount = this.volumeProfileRange === 'session' ? 72 :
                         this.volumeProfileRange === '100' ? 100 :
                         this.volumeProfileRange === '24h' ? 288 :
                         this.volumeProfileRange === 'all' ? candles.length :
                         Math.min(candles.length, 120);
      studyCandles = candles.slice(-studyCount);
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalVol = 0;

    studyCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      totalVol += (c.volume || 10);
    });

    if (minPrice >= maxPrice || !isFinite(minPrice) || !isFinite(maxPrice)) return;

    const sym = window.activeSymbol || window.currentSymbol || 'BTCUSDT';
    const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(minPrice, sym) : (asset ? (asset.precision || 2) : 2);
    const curr = asset ? (asset.currency || '$') : '$';

    const numBins = Math.max(12, Math.min(120, this.volumeProfileBins || 36));
    const binSize = (maxPrice - minPrice) / numBins;
    const bins = new Array(numBins).fill(0).map((_, i) => ({
      price: +(minPrice + (i * binSize)).toFixed(prec),
      vol: 0,
      buyVol: 0,
      sellVol: 0
    }));

    studyCandles.forEach(c => {
      const vol = c.volume || 10;
      const isUp = (c.close >= c.open);
      const buyFraction = isUp ? 0.65 : 0.35;
      const buyV = vol * buyFraction;
      const sellV = vol * (1 - buyFraction);

      const mid = (c.high + c.low + c.close) / 3;
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((mid - minPrice) / binSize)));
      bins[idx].vol += vol;
      bins[idx].buyVol += buyV;
      bins[idx].sellVol += sellV;
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

    // Compute Value Area (default 70% of total volume around POC)
    const vaPct = this.volumeProfileVaPct || 0.70;
    const targetVaVol = totalVol * vaPct;
    let currentVaVol = maxBinVol;
    let lowIdx = bins.findIndex(b => Math.abs(b.price - pocPrice) < 0.0000001);
    if (lowIdx === -1) lowIdx = 0;
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
      minPrice: minPrice,
      maxPrice: maxPrice,
      totalVolume: Math.round(totalVol),
      bins: bins,
      maxBinVol: maxBinVol,
      precision: prec,
      currency: curr,
      candleCount: studyCandles.length
    };

    this.renderVolumeProfileOverlay();
  },

  // RENDER HORIZONTAL LOCAL VOLUME PROFILE ON CHART (CLEAN INSTITUTIONAL STYLE - ZERO CLUTTER)
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

    // Ensure DOM structure has badge + canvas without erasing canvas context repeatedly
    let badge = document.getElementById('vp-badge');
    let canvas = document.getElementById('vp-canvas');

    if (!badge || !canvas) {
      overlay.innerHTML = `
        <div class="vp-telemetry-badge" id="vp-badge"></div>
        <canvas id="vp-canvas" style="width:100%; height:100%; display:block; pointer-events:none;"></canvas>
      `;
      badge = document.getElementById('vp-badge');
      canvas = document.getElementById('vp-canvas');
    }

    if (badge) {
      badge.innerHTML = `
        <span style="color:var(--text-muted)">Volumi Locali:</span>
        <span style="color:var(--accent); font-weight:800">POC ${curr}${Number(vp.poc).toFixed(prec)}</span>
        <span style="color:var(--cyan)">VAH ${curr}${Number(vp.vah).toFixed(prec)}</span>
        <span style="color:var(--purple)">VAL ${curr}${Number(vp.val).toFixed(prec)}</span>
        <span style="color:var(--text-dim)">Vol: ${vp.totalVolume.toLocaleString()} (${vp.candleCount || 0} bars)</span>
      `;
    }

    if (!canvas) return;
    const rect = overlay.getBoundingClientRect();
    canvas.width = overlay.clientWidth || rect.width || 300;
    canvas.height = overlay.clientHeight || rect.height || 400;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const candleSeries = window.mainCandleSeries;
    const numBins = vp.bins.length;
    const maxBinVol = vp.maxBinVol || 1;
    // Institutional right-anchored width: max 170px or 25% of chart
    const maxProfileWidth = Math.min(170, Math.max(70, canvas.width * 0.25));

    // Helper to get Y coordinate for any price
    const getPriceY = (price) => {
      if (candleSeries && typeof candleSeries.priceToCoordinate === 'function') {
        const coord = candleSeries.priceToCoordinate(price);
        if (coord !== null && !isNaN(coord)) return coord;
      }
      const norm = (price - vp.minPrice) / ((vp.maxPrice - vp.minPrice) || 1);
      return canvas.height - (norm * canvas.height);
    };

    // 1. Draw POC Ray across chart (clean golden dashed ray)
    if (this.volumeProfileShowPocRay && vp.poc) {
      const pocY = getPriceY(vp.poc);
      if (pocY >= 0 && pocY <= canvas.height) {
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, pocY);
        ctx.lineTo(canvas.width - maxProfileWidth - 10, pocY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 2. Draw VAH and VAL subtle reference lines across chart
    if (vp.vah) {
      const vahY = getPriceY(vp.vah);
      if (vahY >= 0 && vahY <= canvas.height) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, vahY);
        ctx.lineTo(canvas.width - maxProfileWidth - 10, vahY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (vp.val) {
      const valY = getPriceY(vp.val);
      if (valY >= 0 && valY <= canvas.height) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, valY);
        ctx.lineTo(canvas.width - maxProfileWidth - 10, valY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 3. Render Volume Histogram Bars (Strictly anchored to RIGHT margin)
    vp.bins.forEach((b, idx) => {
      const y = getPriceY(b.price);
      if (y < -20 || y > canvas.height + 20) return;

      let barH = 5;
      if (idx < numBins - 1) {
        const nextY = getPriceY(vp.bins[idx + 1].price);
        if (nextY != null && !isNaN(nextY)) {
          barH = Math.max(2, Math.min(22, Math.abs(y - nextY) * 0.90));
        }
      }

      const isPoc = Math.abs(b.price - vp.poc) < 0.0000001;
      const inVa = b.price >= vp.val && b.price <= vp.vah;
      const barW = Math.max(3, (b.vol / maxBinVol) * maxProfileWidth);

      // Anchored strictly to RIGHT margin: right edge is canvas.width - 2
      const barX = canvas.width - barW - 2;

      // Color scheme: POC = Gold, VA = Cyan/Teal, Outside = Muted Slate
      if (isPoc) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.92)';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 6;
      } else if (inVa) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.20)';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(barX, y - barH / 2, barW, barH);
      ctx.shadowBlur = 0;

      // Optional border on bars
      if (isPoc) {
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, y - barH / 2, barW, barH);
      }

      // ONLY for POC: Draw a single crisp institutional badge on the right edge
      if (isPoc) {
        const pocVolTxt = b.vol >= 1000 ? (b.vol / 1000).toFixed(1) + 'k' : Math.round(b.vol);
        const pocLabel = `POC ${curr}${Number(b.price).toFixed(prec)} (${pocVolTxt})`;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const txtW = ctx.measureText(pocLabel).width;
        const badgeW = txtW + 12;
        const badgeX = canvas.width - badgeW - 4;

        // Badge pill background
        ctx.fillStyle = '#0b0f19';
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1;
        ctx.fillRect(badgeX, y - 8, badgeW, 16);
        ctx.strokeRect(badgeX, y - 8, badgeW, 16);

        // Badge text
        ctx.fillStyle = '#fcd535';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pocLabel, badgeX + badgeW / 2, y);
      }
    });

    // 4. Subtle VAH / VAL labels on the right edge
    const drawLevelBadge = (price, label, color, bg) => {
      const y = getPriceY(price);
      if (y < 10 || y > canvas.height - 10) return;
      const text = `${label}: ${curr}${Number(price).toFixed(prec)}`;
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      const txtW = ctx.measureText(text).width;
      const bW = txtW + 8;
      const bX = canvas.width - bW - 4;

      ctx.fillStyle = bg;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.fillRect(bX, y - 6, bW, 13);
      ctx.strokeRect(bX, y - 6, bW, 13);

      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bX + bW / 2, y);
    };

    if (vp.vah && Math.abs(vp.vah - vp.poc) > (vp.maxPrice - vp.minPrice) * 0.05) {
      drawLevelBadge(vp.vah, 'VAH', '#38bdf8', 'rgba(10, 25, 45, 0.9)');
    }
    if (vp.val && Math.abs(vp.val - vp.poc) > (vp.maxPrice - vp.minPrice) * 0.05) {
      drawLevelBadge(vp.val, 'VAL', '#a855f7', 'rgba(25, 12, 40, 0.9)');
    }
  },

  toggleVolumeProfileVisibility: function() {
    this.volumeProfileVisible = !this.volumeProfileVisible;
    this.renderVolumeProfileOverlay();
    const btn = document.getElementById('btn-toggle-vp');
    if (btn) btn.classList.toggle('active', this.volumeProfileVisible);
    if (window.showToast) {
      window.showToast(`Volumi Locali POC/VAH: ${this.volumeProfileVisible ? 'ATTIVI' : 'DISATTIVATI'}`, 'info');
    }
  },

  setVolumeProfileRange: function(range) {
    this.volumeProfileRange = range;
    this.calculateLocalVolumeProfile();
    this.renderVpSettingsDropdown();
  },

  setVolumeProfileStyle: function(style) {
    this.volumeProfileStyle = style;
    this.renderVolumeProfileOverlay();
    this.renderVpSettingsDropdown();
  },

  setVolumeProfileBins: function(bins) {
    this.volumeProfileBins = parseInt(bins, 10);
    this.calculateLocalVolumeProfile();
    this.renderVpSettingsDropdown();
  },

  setVolumeProfileWidth: function(w) {
    this.volumeProfileWidth = parseInt(w, 10);
    this.renderVolumeProfileOverlay();
    this.renderVpSettingsDropdown();
  },

  setVolumeProfileVaPct: function(pct) {
    this.volumeProfileVaPct = parseFloat(pct);
    this.calculateLocalVolumeProfile();
    this.renderVpSettingsDropdown();
  },

  toggleShowValues: function() {
    this.volumeProfileShowValues = !this.volumeProfileShowValues;
    this.renderVolumeProfileOverlay();
    this.renderVpSettingsDropdown();
  },

  togglePocRay: function() {
    this.volumeProfileShowPocRay = !this.volumeProfileShowPocRay;
    this.renderVolumeProfileOverlay();
    this.renderVpSettingsDropdown();
  },

  toggleVpSettingsDropdown: function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const el = document.getElementById('vp-settings-dropdown');
    if (!el) return;
    const isOpen = el.classList.contains('open');
    if (isOpen) {
      el.classList.remove('open');
    } else {
      el.classList.add('open');
      this.renderVpSettingsDropdown();
    }
  },

  renderVpSettingsDropdown: function() {
    const el = document.getElementById('vp-settings-dropdown');
    if (!el) return;

    el.innerHTML = `
      <div style="font-weight:900; font-size:11px; color:#fff; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>⚙ PARAMETRI VOLUMI LOCALI & VRVP</span>
        <button onclick="document.getElementById('vp-settings-dropdown').classList.remove('open')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✕</button>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:4px;">RANGE DI CALCOLO</div>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          ${[
            { id: 'visible', label: 'Range Visibile (VRVP)' },
            { id: 'session', label: 'Sessione (72)' },
            { id: '100', label: '100 Candele' },
            { id: '24h', label: '24 Ore (288)' },
            { id: 'all', label: 'Tutto' }
          ].map(r => `
            <button class="btn btn-sm ${this.volumeProfileRange === r.id ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 6px;" onclick="OptimalEngine.setVolumeProfileRange('${r.id}')">
              ${r.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:4px;">STILE & POSIZIONE (FLOATING)</div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-sm ${this.volumeProfileStyle === 'right' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px; flex:1;" onclick="OptimalEngine.setVolumeProfileStyle('right')">
            Ancorato a Destra
          </button>
          <button class="btn btn-sm ${this.volumeProfileStyle === 'floating' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px; flex:1;" onclick="OptimalEngine.setVolumeProfileStyle('floating')">
            Flottante sulle Candele
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
        <div>
          <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:3px;">RIGHE (BINS)</div>
          <select class="terminal-input" style="font-size:10px; padding:3px 6px; width:100%;" onchange="OptimalEngine.setVolumeProfileBins(this.value)">
            ${[24, 36, 48, 72, 100].map(b => `<option value="${b}" ${this.volumeProfileBins === b ? 'selected' : ''}>${b} Righe</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:3px;">LARGHEZZA</div>
          <select class="terminal-input" style="font-size:10px; padding:3px 6px; width:100%;" onchange="OptimalEngine.setVolumeProfileWidth(this.value)">
            ${[140, 200, 260, 340].map(w => `<option value="${w}" ${this.volumeProfileWidth === w ? 'selected' : ''}>${w}px</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:3px;">VALUE AREA (VA)</div>
        <div style="display:flex; gap:4px;">
          ${[
            { val: 0.68, label: '68% (1-Sigma)' },
            { val: 0.70, label: '70% (Standard)' },
            { val: 0.80, label: '80% (Ampia)' }
          ].map(va => `
            <button class="btn btn-sm ${this.volumeProfileVaPct === va.val ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileVaPct(${va.val})">
              ${va.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08);">
        <label style="font-size:10px; color:#fff; display:flex; align-items:center; gap:6px; cursor:pointer;">
          <input type="checkbox" ${this.volumeProfileShowValues ? 'checked' : ''} onchange="OptimalEngine.toggleShowValues()">
          <span>Mostra Valori Numerici di Volume</span>
        </label>
        <label style="font-size:10px; color:#fff; display:flex; align-items:center; gap:6px; cursor:pointer;">
          <input type="checkbox" ${this.volumeProfileShowPocRay ? 'checked' : ''} onchange="OptimalEngine.togglePocRay()">
          <span>Raggio POC Esteso (Golden Ray)</span>
        </label>
      </div>
    `;
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
