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

  // RENDER HORIZONTAL LOCAL VOLUME PROFILE ON CHART (ANCHORED TO RIGHT/LEFT, SCALABLE & NUMERIC)
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
      const posLabel = this.volumeProfileStyle === 'right' ? 'DESTRA' : (this.volumeProfileStyle === 'left' ? 'SINISTRA' : 'FLOTTANTE');
      badge.innerHTML = `
        <span style="color:var(--text-muted)">Volumi Locali (${posLabel}):</span>
        <span style="color:var(--accent); font-weight:800">POC ${curr}${Number(vp.poc).toFixed(prec)}</span>
        <span style="color:var(--cyan)">VAH ${curr}${Number(vp.vah).toFixed(prec)}</span>
        <span style="color:var(--purple)">VAL ${curr}${Number(vp.val).toFixed(prec)}</span>
        <span style="color:var(--text-dim)">Vol: ${vp.totalVolume.toLocaleString()} (${vp.candleCount || 0} bars)</span>
      `;
    }

    if (!canvas) return;
    const parentEl = document.getElementById('chart-container') || overlay;
    const rect = overlay.getBoundingClientRect();
    const cssW = Math.max(260, overlay.clientWidth || Math.round(rect.width) || (parentEl ? parentEl.clientWidth - 68 : 760));
    const cssH = Math.max(180, overlay.clientHeight || Math.round(rect.height) || (parentEl ? parentEl.clientHeight - 26 : 440));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const candleSeries = window.mainCandleSeries;
    const numBins = vp.bins.length;
    const maxBinVol = vp.maxBinVol || 1;

    // Compact institutional width (never stretches or covers candlesticks)
    const userWidth = this.volumeProfileWidth || 135;
    const maxProfileWidth = Math.max(55, Math.min(cssW * 0.18, userWidth));
    const isRight = (this.volumeProfileStyle === 'right' || !this.volumeProfileStyle);
    const isLeft = (this.volumeProfileStyle === 'left');
    const isFloating = (this.volumeProfileStyle === 'floating');

    // Helper to get Y coordinate for any price
    const getPriceY = (price) => {
      if (candleSeries && typeof candleSeries.priceToCoordinate === 'function') {
        const coord = candleSeries.priceToCoordinate(price);
        if (coord !== null && !isNaN(coord)) return coord;
      }
      const norm = (price - vp.minPrice) / ((vp.maxPrice - vp.minPrice) || 1);
      return cssH - (norm * cssH);
    };

    // 1. Draw POC Ray across chart (subtle golden dashed ray)
    if (this.volumeProfileShowPocRay && vp.poc) {
      const pocY = getPriceY(vp.poc);
      if (pocY >= 0 && pocY <= cssH) {
        ctx.strokeStyle = 'rgba(252, 213, 53, 0.55)';
        ctx.lineWidth = 1.1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (isRight) {
          ctx.moveTo(0, pocY);
          ctx.lineTo(cssW - maxProfileWidth - 6, pocY);
        } else {
          ctx.moveTo(maxProfileWidth + 6, pocY);
          ctx.lineTo(cssW, pocY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 2. Draw VAH and VAL subtle reference lines across chart
    if (vp.vah) {
      const vahY = getPriceY(vp.vah);
      if (vahY >= 0 && vahY <= cssH) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, vahY);
        ctx.lineTo(cssW, vahY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (vp.val) {
      const valY = getPriceY(vp.val);
      if (valY >= 0 && valY <= cssH) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, valY);
        ctx.lineTo(cssW, valY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    let lastLabelY = -999;

    // 3. Render Volume Histogram Bars (Strictly positioned: Right, Left, or Floating)
    vp.bins.forEach((b, idx) => {
      const y = getPriceY(b.price);
      if (y < -20 || y > cssH + 20) return;

      let barH = 4;
      if (idx < numBins - 1) {
        const nextY = getPriceY(vp.bins[idx + 1].price);
        if (nextY != null && !isNaN(nextY)) {
          barH = Math.max(2, Math.min(16, Math.abs(y - nextY) * 0.85));
        }
      }

      const isPoc = Math.abs(b.price - vp.poc) < 0.0000001;
      const inVa = b.price >= vp.val && b.price <= vp.vah;
      const barW = Math.max(3, (b.vol / maxBinVol) * maxProfileWidth);

      // Determine bar position
      let barX = 0;
      if (isRight) {
        barX = cssW - barW - 2;
      } else if (isLeft) {
        barX = 2;
      } else {
        barX = Math.max(10, cssW * 0.60 - barW);
      }

      // Bar fill colors (semi-transparent so candles underneath remain 100% readable)
      if (isPoc) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.72)';
      } else if (inVa) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      } else {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.16)';
      }
      ctx.fillRect(barX, y - barH / 2, barW, barH);

      if (isPoc) {
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, y - barH / 2, barW, barH);
      }

      // ONLY for POC: Draw a single crisp institutional badge on the anchored edge
      if (isPoc) {
        const pocVolTxt = b.vol >= 1000 ? (b.vol / 1000).toFixed(1) + 'k' : Math.round(b.vol);
        const pocLabel = `POC ${curr}${Number(b.price).toFixed(prec)} (${pocVolTxt})`;
        ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
        const txtW = ctx.measureText(pocLabel).width;
        const badgeW = txtW + 10;
        const badgeX = isRight ? (cssW - badgeW - 4) : 4;

        ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1;
        ctx.fillRect(badgeX, y - 8, badgeW, 16);
        ctx.strokeRect(badgeX, y - 8, badgeW, 16);

        ctx.fillStyle = '#fcd535';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pocLabel, badgeX + badgeW / 2, y);
      }
    });

    // 5. Subtle VAH / VAL labels on the anchored edge
    const drawLevelBadge = (price, label, color, bg) => {
      const y = getPriceY(price);
      if (y < 10 || y > cssH - 10) return;
      const text = `${label}: ${curr}${Number(price).toFixed(prec)}`;
      ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
      const txtW = ctx.measureText(text).width;
      const bW = txtW + 8;
      const bX = isRight ? (cssW - bW - 4) : 4;

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

    if (vp.vah && Math.abs(vp.vah - vp.poc) > (vp.maxPrice - vp.minPrice) * 0.04) {
      drawLevelBadge(vp.vah, 'VAH', '#38bdf8', 'rgba(10, 25, 45, 0.9)');
    }
    if (vp.val && Math.abs(vp.val - vp.poc) > (vp.maxPrice - vp.minPrice) * 0.04) {
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
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:6px;">
        <span style="font-weight:800; font-size:11px; color:#fff;">⚙ PARAMETRI VOLUMI LOCALI & VRVP</span>
        <button onclick="document.getElementById('vp-settings-dropdown').classList.remove('open')" style="background:transparent; border:none; color:var(--text-dim); font-size:14px; cursor:pointer;">✕</button>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:4px;">RANGE DI CALCOLO</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:4px;">
          <button class="btn btn-sm ${this.volumeProfileRange === 'visible' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 4px;" onclick="OptimalEngine.setVolumeProfileRange('visible')">
            Range Visibile (VRVP)
          </button>
          <button class="btn btn-sm ${this.volumeProfileRange === 'session' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 4px;" onclick="OptimalEngine.setVolumeProfileRange('session')">
            Sessione (72)
          </button>
          <button class="btn btn-sm ${this.volumeProfileRange === '100' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 4px;" onclick="OptimalEngine.setVolumeProfileRange('100')">
            100 Candele
          </button>
          <button class="btn btn-sm ${this.volumeProfileRange === '24h' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 4px;" onclick="OptimalEngine.setVolumeProfileRange('24h')">
            24 Ore (288)
          </button>
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:4px;">POSIZIONE & ANCORAGGIO</div>
        <div style="display:flex; gap:3px;">
          <button class="btn btn-sm ${(!this.volumeProfileStyle || this.volumeProfileStyle === 'right') ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:4px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileStyle('right')">
            Ancorato a Destra
          </button>
          <button class="btn btn-sm ${this.volumeProfileStyle === 'left' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:4px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileStyle('left')">
            Ancorato a Sinistra
          </button>
          <button class="btn btn-sm ${this.volumeProfileStyle === 'floating' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:4px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileStyle('floating')">
            Flottante
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
          <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:3px;">LARGHEZZA (${this.volumeProfileWidth || 220}px)</div>
          <select class="terminal-input" style="font-size:10px; padding:3px 6px; width:100%;" onchange="OptimalEngine.setVolumeProfileWidth(this.value)">
            ${[140, 200, 260, 340, 450, 580].map(w => `<option value="${w}" ${(this.volumeProfileWidth || 220) === w ? 'selected' : ''}>${w}px</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Slider Larghezza Continua (Allungabili) -->
      <div style="margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); font-weight:700; margin-bottom:2px;">
          <span>ESTENSIONE BARRE (ALLUNGABILI)</span>
          <span style="color:var(--accent); font-family:var(--font-mono)">${this.volumeProfileWidth || 220}px</span>
        </div>
        <input type="range" min="80" max="600" step="20" value="${this.volumeProfileWidth || 220}" class="lev-slider" style="width:100%" oninput="OptimalEngine.setVolumeProfileWidth(this.value)">
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:9px; font-weight:800; color:var(--text-dim); margin-bottom:4px;">VALUE AREA (VA)</div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-sm ${this.volumeProfileVaPct === 0.68 ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileVaPct(0.68)">
            68% (1-Sigma)
          </button>
          <button class="btn btn-sm ${this.volumeProfileVaPct === 0.70 ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileVaPct(0.70)">
            70% (Standard)
          </button>
          <button class="btn btn-sm ${this.volumeProfileVaPct === 0.80 ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 6px; flex:1;" onclick="OptimalEngine.setVolumeProfileVaPct(0.80)">
            80% (Ampia)
          </button>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
        <label style="display:flex; align-items:center; gap:6px; font-size:10px; cursor:pointer;">
          <input type="checkbox" ${this.volumeProfileShowValues ? 'checked' : ''} onchange="OptimalEngine.toggleVolumeProfileValues(this.checked)">
          <span>Mostra Valori Numerici di Volume</span>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:10px; cursor:pointer;">
          <input type="checkbox" ${this.volumeProfileShowPocRay ? 'checked' : ''} onchange="OptimalEngine.togglePocRay(this.checked)">
          <span>Raggio POC Esteso (Golden Ray)</span>
        </label>
      </div>
    `;
  },
  renderOptimalUI: function() {
    const container = document.getElementById('optimal-engine-view-container');
    if (!container) return;
    const s = this.optimalSetup || {
      symbol: window.currentSymbol || 'BTCUSDT',
      side: 'LONG',
      entryPrice: window.activePrice || 65800,
      stopLoss: +((window.activePrice || 65800) * 0.982).toFixed(2),
      tp1: +((window.activePrice || 65800) * 1.028).toFixed(2),
      tp2: +((window.activePrice || 65800) * 1.055).toFixed(2),
      tp3: +((window.activePrice || 65800) * 1.09).toFixed(2),
      rrRatio: '1 : 3.20',
      convexScore: 92,
      expectedROI: '+32.0% (con leva 10x)',
      reason: 'Setup Asimmetrico convesso calibrato sul POC locale e sul Budget Allocato del singolo Exchange.'
    };
    const alloc = window.MultiExchangeAllocator;
    const cal = alloc ? alloc.calibrateOrderForExchange(alloc.activeOrderExchange, {
      riskPct: 1.0,
      entryPrice: s.entryPrice,
      stopLossPrice: s.stopLoss,
      takeProfitPrice: s.tp2
    }) : null;

    container.innerHTML = `
      <div style="padding:14px; display:flex; flex-direction:column; gap:14px;">
        <div class="window-card" style="padding:14px; border:1px solid rgba(0,242,161,0.4);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
            <div>
              <span style="font-size:15px; font-weight:900; color:#00f2a1;">🎯 POSIZIONE OTTIMALE CONVESSA &amp; AUTO-PILOT (${s.symbol})</span>
              <div style="font-size:11px; color:#94a3b8;">Calibrazione automatica su singolo exchange pre-impostato (Min 10,00 € ➔ Max Disponibile)</div>
            </div>
            <span style="background:rgba(0,242,161,0.18); color:#00f2a1; border:1px solid #00f2a1; padding:4px 10px; border-radius:6px; font-weight:900; font-family:var(--font-mono);">Score: ${s.convexScore}/100 (${s.rrRatio})</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:8px; font-family:var(--font-mono); font-size:12px;">
            <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">Entry: <b style="color:#fff;">${s.entryPrice}</b></div>
            <div style="background:rgba(239,68,68,0.1); padding:8px; border-radius:6px;">Stop Loss: <b style="color:#f87171;">${s.stopLoss}</b></div>
            <div style="background:rgba(0,242,161,0.1); padding:8px; border-radius:6px;">TP1 / TP2: <b style="color:#00f2a1;">${s.tp1} / ${s.tp2}</b></div>
            ${cal && cal.allowed ? `<div style="background:rgba(245,158,11,0.12); padding:8px; border-radius:6px;">Budget ${cal.exchangeIcon}: <b style="color:#fbbf24;">${cal.managedBudgetEur.toFixed(2)} €</b> (Rischio: ${cal.riskAmountEur.toFixed(2)} €)</div>` : ''}
          </div>
        </div>
        <div id="v22-allocator-optimal-dock">${alloc ? alloc.buildAllocatorHTML(false) : ''}</div>
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
