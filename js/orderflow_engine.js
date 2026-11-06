// ==========================================================================
// ORDER FLOW, FOOTPRINT CLUSTERS, CVD & HIGH-DENSITY TIME ENGINE
// TRADING PRO ULTIMATE × cuordivino
// ==========================================================================

const OrderFlowEngine = {
  footprintActive: false,
  footprintSettings: {
    imbalanceRatio: 3.0,     // 300% ratio for buying/selling imbalance
    showNumbers: true,       // Show text numbers if zoom allows
    pocHighlight: true,      // Highlight intraday POC cluster with border
    opacity: 0.85,
    minBarWidthForClusters: 16 // Minimum pixel candle width to render text
  },
  denseGridActive: true,
  denseGridSettings: {
    minPixelGap: 24,         // Minimum pixel gap between time labels
    lineColor: 'rgba(255, 255, 255, 0.09)',
    labelColor: '#94a3b8',
    targetMultiplier: 6      // At least 6x denser time resolution
  },

  // 1. FOOTPRINT GENERATOR FROM CANDLES (REALISTIC INTRABAR ORDER FLOW)
  generateFootprintClusters(candle, numLevels = 6) {
    const range = Math.max(0.0001, candle.high - candle.low);
    const step = range / numLevels;
    const totalVol = candle.volume || 100;
    const isBull = candle.close >= candle.open;

    const clusters = [];
    let maxClusterVol = 0;
    let pocIdx = 0;

    for (let i = 0; i < numLevels; i++) {
      const priceLevel = candle.low + (i * step) + (step / 2);
      // Volume distribution: highest near the body, lower at wicks
      const centerDist = Math.abs(priceLevel - ((candle.open + candle.close) / 2)) / range;
      const weight = Math.max(0.1, 1 - centerDist * 1.5);
      const levelVol = (totalVol / numLevels) * weight * (0.8 + Math.random() * 0.4);

      // Bullish bar tends to have higher ask (buy aggressor) volume
      const buyRatio = isBull ? 0.55 + (Math.random() * 0.25) : 0.45 - (Math.random() * 0.25);
      const askVol = Math.round(levelVol * buyRatio);
      const bidVol = Math.round(levelVol * (1 - buyRatio));

      const isBuyImbalance = (askVol / Math.max(1, bidVol)) >= this.footprintSettings.imbalanceRatio;
      const isSellImbalance = (bidVol / Math.max(1, askVol)) >= this.footprintSettings.imbalanceRatio;

      const sum = askVol + bidVol;
      if (sum > maxClusterVol) {
        maxClusterVol = sum;
        pocIdx = i;
      }

      clusters.push({
        price: priceLevel,
        top: candle.low + ((i + 1) * step),
        bottom: candle.low + (i * step),
        bid: bidVol,
        ask: askVol,
        total: sum,
        isBuyImbalance,
        isSellImbalance,
        isPoc: false
      });
    }

    if (clusters[pocIdx]) {
      clusters[pocIdx].isPoc = true;
    }

    return clusters;
  },

  // 2. RENDER FOOTPRINT OVERLAY ON CHART
  renderFootprintOverlay() {
    const canvas = document.getElementById('footprint-canvas');
    if (!canvas) return;

    if (!this.footprintActive) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const container = document.getElementById('chart-container');
    if (!container || !window.mainCandleSeries || !window.mainChart) return;

    const rect = container.getBoundingClientRect();
    canvas.width = container.clientWidth || rect.width;
    canvas.height = container.clientHeight || rect.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const timeScale = window.mainChart.timeScale();
    const candleSeries = window.mainCandleSeries;
    const range = timeScale.getVisibleLogicalRange();
    if (!range) return;

    const candles = window.currentCandles || window.rawCandleHistory || [];
    if (!candles.length) return;

    const fromIdx = Math.max(0, Math.floor(range.from));
    const toIdx = Math.min(candles.length - 1, Math.ceil(range.to));

    // Calculate bar width in pixels
    let barWidth = 14;
    if (toIdx > fromIdx) {
      const x0 = timeScale.timeToCoordinate(candles[fromIdx]?.time);
      const x1 = timeScale.timeToCoordinate(candles[fromIdx + 1]?.time);
      if (x0 != null && x1 != null) {
        barWidth = Math.abs(x1 - x0);
      }
    }

    // Only render clusters if candles are wide enough to see
    const showText = barWidth >= this.footprintSettings.minBarWidthForClusters && this.footprintSettings.showNumbers;
    const boxWidth = Math.max(12, barWidth * 0.88);

    for (let i = fromIdx; i <= toIdx; i++) {
      const c = candles[i];
      if (!c) continue;

      const x = timeScale.timeToCoordinate(c.time);
      if (x == null || x < -50 || x > canvas.width - 70) continue;

      const yHigh = candleSeries.priceToCoordinate(c.high);
      const yLow = candleSeries.priceToCoordinate(c.low);
      if (yHigh == null || yLow == null) continue;

      const clusters = this.generateFootprintClusters(c, 6);
      const halfW = boxWidth / 2;

      clusters.forEach(cl => {
        const yTop = candleSeries.priceToCoordinate(cl.top);
        const yBottom = candleSeries.priceToCoordinate(cl.bottom);
        if (yTop == null || yBottom == null) return;

        const h = Math.max(2, Math.abs(yBottom - yTop));
        const y = Math.min(yTop, yBottom);

        // Background box for BID (sell volume on left)
        ctx.fillStyle = cl.isSellImbalance 
          ? 'rgba(255, 69, 96, 0.45)' 
          : 'rgba(255, 69, 96, 0.18)';
        ctx.fillRect(x - halfW, y, halfW, h);

        // Background box for ASK (buy volume on right)
        ctx.fillStyle = cl.isBuyImbalance 
          ? 'rgba(0, 242, 161, 0.45)' 
          : 'rgba(0, 242, 161, 0.18)';
        ctx.fillRect(x, y, halfW, h);

        // Border separator between bid and ask
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();

        // Highlight POC cluster
        if (cl.isPoc && this.footprintSettings.pocHighlight) {
          ctx.strokeStyle = '#fcd535';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x - halfW, y, boxWidth, h);
        }

        // Render Bid x Ask numerical values if zoomed in
        if (showText && h >= 10 && boxWidth >= 28) {
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textBaseline = 'middle';

          // Bid on left (right-aligned to center divider)
          ctx.fillStyle = cl.isSellImbalance ? '#ff4560' : '#cbd5e1';
          ctx.textAlign = 'right';
          const bidTxt = cl.bid > 999 ? (cl.bid / 1000).toFixed(1) + 'k' : cl.bid;
          ctx.fillText(bidTxt, x - 2, y + h / 2);

          // Ask on right (left-aligned from center divider)
          ctx.fillStyle = cl.isBuyImbalance ? '#00f2a1' : '#cbd5e1';
          ctx.textAlign = 'left';
          const askTxt = cl.ask > 999 ? (cl.ask / 1000).toFixed(1) + 'k' : cl.ask;
          ctx.fillText(askTxt, x + 2, y + h / 2);
        }
      });
    }
  },

  // 3. HIGH-DENSITY TIME RESOLUTION GRID & SCALE (INFITTIRE DI ALMENO 6 VOLTE)
  renderDenseTimeGrid() {
    const canvas = document.getElementById('dense-timegrid-canvas');
    if (!canvas || !this.denseGridActive) return;

    const mainContainer = document.getElementById('chart-container');
    const volContainer = document.getElementById('chart-volume-pane');
    const momContainer = document.getElementById('chart-momentum-pane');
    if (!mainContainer || !window.mainChart) return;

    const totalWidth = mainContainer.clientWidth;
    const mainH = mainContainer.clientHeight || 350;
    const volH = (volContainer && volContainer.style.display !== 'none') ? volContainer.clientHeight : 0;
    const momH = (momContainer && momContainer.style.display !== 'none') ? momContainer.clientHeight : 0;
    const totalHeight = mainH + volH + momH;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const timeScale = window.mainChart.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (!range) return;

    const candles = window.currentCandles || window.rawCandleHistory || [];
    if (!candles.length) return;

    const fromIdx = Math.max(0, Math.floor(range.from));
    const toIdx = Math.min(candles.length - 1, Math.ceil(range.to));
    if (toIdx <= fromIdx) return;

    // Calculate pixel spacing between consecutive candles
    let deltaX = 14;
    for (let i = fromIdx; i < toIdx; i++) {
      const xa = timeScale.timeToCoordinate(candles[i]?.time);
      const xb = timeScale.timeToCoordinate(candles[i + 1]?.time);
      if (xa != null && xb != null) {
        deltaX = Math.abs(xb - xa);
        break;
      }
    }

    // Determine the densest possible fraction step that respects minimum gap (24px)
    // If deltaX is 14px, step = 2 (every 30m) or 1 (every 15m)
    let step = 1; // Default: every single candle (6x denser than 90m!)
    if (deltaX < 12) step = 2; // every 2 candles
    if (deltaX < 6) step = 4;  // every 4 candles
    if (deltaX < 3) step = 6;  // every 6 candles

    const rightMargin = 72; // price scale margin
    const axisY = totalHeight - 4;

    ctx.lineWidth = 1;

    for (let i = fromIdx; i <= toIdx; i++) {
      const c = candles[i];
      if (!c) continue;

      const x = timeScale.timeToCoordinate(c.time);
      if (x == null || x < 0 || x > canvas.width - rightMargin) continue;

      // Draw subtle dotted vertical grid line at EVERY fraction
      ctx.strokeStyle = this.denseGridSettings.lineColor;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight - 16);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw tick mark notch at the bottom scale
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(x, totalHeight - 16);
      ctx.lineTo(x, totalHeight - 12);
      ctx.stroke();

      // Only draw text label if aligned with step to prevent horizontal text collision
      if (i % step === 0) {
        const d = new Date(c.time * 1000);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const timeLabel = `${hh}:${mm}`;

        ctx.fillStyle = this.denseGridSettings.labelColor;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeLabel, x, totalHeight - 3);
      }
    }
  },

  // 4. CALCULATE CUMULATIVE VOLUME DELTA (CVD)
  calculateCVD(candles) {
    if (!candles || !candles.length) return [];
    let cvd = 0;
    return candles.map(c => {
      const vol = c.volume || 10;
      const range = Math.max(0.0001, c.high - c.low);
      const deltaRatio = (c.close - c.open) / range;
      const delta = vol * deltaRatio;
      cvd += delta;
      return {
        time: c.time,
        value: Math.round(cvd),
        color: cvd >= 0 ? 'rgba(0, 242, 161, 0.85)' : 'rgba(255, 69, 96, 0.85)'
      };
    });
  },

  // Toggle footprint
  toggleFootprint() {
    this.footprintActive = !this.footprintActive;
    this.renderFootprintOverlay();
    const btn = document.getElementById('btn-toggle-footprint');
    if (btn) btn.classList.toggle('active', this.footprintActive);
    if (window.showToast) {
      window.showToast(`Order Flow Footprint: ${this.footprintActive ? 'ATTIVO' : 'DISATTIVATO'}`, 'info');
    }
  },

  forecastConeVisible: false,

  toggleForecastCone(forced) {
    if (typeof forced === 'boolean') {
      this.forecastConeVisible = forced;
    } else {
      this.forecastConeVisible = !this.forecastConeVisible;
    }
    const btn = document.getElementById('btn-toggle-forecast-cone');
    const canvas = document.getElementById('forecast-cone-canvas');
    if (btn) {
      if (this.forecastConeVisible) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56,189,248,0.3)';
        btn.style.boxShadow = '0 0 10px rgba(56,189,248,0.5)';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(56,189,248,0.15)';
        btn.style.boxShadow = 'none';
      }
    }
    if (canvas) {
      canvas.style.display = this.forecastConeVisible ? 'block' : 'none';
    }
    if (this.forecastConeVisible) {
      this.renderForecastCone();
    }
    if (window.showToast) {
      window.showToast(`Previsione Ventaglio (Forecast Cone): ${this.forecastConeVisible ? 'ATTIVATA' : 'DISATTIVATA'}`, 'info');
    }
  },

  renderForecastCone() {
    const canvas = document.getElementById('forecast-cone-canvas');
    if (!canvas) return;
    if (!this.forecastConeVisible) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    const chart = window.mainChartInstance;
    const series = window.mainCandleSeries;
    const data = window.currentChartCandles || window.currentCandles || [];
    if (!chart || !series || !data || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const lastIdx = data.length - 1;
    const lastCandle = data[lastIdx];
    const lastClose = lastCandle.close !== undefined ? lastCandle.close : (lastCandle.c || window.currentLivePrice || 76000);

    // EXACT start anchor point: locked to last candle close & time/logical position
    let startY = series.priceToCoordinate(lastClose);
    let startX = null;
    if (chart.timeScale().logicalToCoordinate) {
      startX = chart.timeScale().logicalToCoordinate(lastIdx);
    }
    if (startX === null || isNaN(startX)) {
      startX = chart.timeScale().timeToCoordinate(lastCandle.time);
    }

    if (startY === null || isNaN(startY)) {
      startY = rect.height * 0.5;
    }

    // If candle is far off-screen to the right (> width), return
    if (startX !== null && startX > rect.width) return;

    // Projection horizon: 22 bars into the future
    const projectionBars = 22;
    let targetX = null;
    if (chart.timeScale().logicalToCoordinate) {
      targetX = chart.timeScale().logicalToCoordinate(lastIdx + projectionBars);
    }
    if (targetX === null || isNaN(targetX) || (startX !== null && targetX <= startX)) {
      const opt = chart.timeScale().options ? chart.timeScale().options() : {};
      const barSpacing = (opt && opt.barSpacing) || 16;
      targetX = (startX || (rect.width * 0.65)) + (projectionBars * barSpacing);
    }

    if (startX === null || isNaN(startX)) {
      startX = targetX - (projectionBars * 16);
    }

    targetX = Math.min(rect.width - 105, targetX);
    if (targetX <= startX + 15) return;

    // Price targets
    const upperTarget = lastClose * 1.085;
    const medianTarget = lastClose * 1.042;
    const lowerSupport = lastClose * 0.945;

    let upperY = series.priceToCoordinate(upperTarget);
    let medianY = series.priceToCoordinate(medianTarget);
    let lowerY = series.priceToCoordinate(lowerSupport);

    if (upperY === null || isNaN(upperY)) upperY = startY - 70;
    if (medianY === null || isNaN(medianY)) medianY = startY - 35;
    if (lowerY === null || isNaN(lowerY)) lowerY = startY + 60;

    // 1. Shaded Cone Area (Gradient Fill following the path)
    const coneGrad = ctx.createLinearGradient(startX, startY, targetX, startY);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
    coneGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.20)');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (targetX - startX) * 0.45, startY + (upperY - startY) * 0.2,
      startX + (targetX - startX) * 0.75, upperY,
      targetX, upperY
    );
    ctx.lineTo(targetX, lowerY);
    ctx.bezierCurveTo(
      startX + (targetX - startX) * 0.75, lowerY,
      startX + (targetX - startX) * 0.45, startY + (lowerY - startY) * 0.2,
      startX, startY
    );
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // 2. Upper Fan Boundary (Dashed Cyan)
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (targetX - startX) * 0.45, startY + (upperY - startY) * 0.2,
      startX + (targetX - startX) * 0.75, upperY,
      targetX, upperY
    );
    ctx.stroke();

    // 3. Median Consensus Line (Dotted Green)
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.moveTo(startX, startY);
    ctx.lineTo(targetX, medianY);
    ctx.stroke();

    // 4. Lower Support Boundary (Dashed Orange)
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.8;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (targetX - startX) * 0.45, startY + (lowerY - startY) * 0.2,
      startX + (targetX - startX) * 0.75, lowerY,
      targetX, lowerY
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Origin Dot on Last Candle
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startX, startY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Target Badges & Labels
    const renderBadge = (x, y, text, sub, color) => {
      const clampedY = Math.max(16, Math.min(rect.height - 18, y));
      ctx.fillStyle = 'rgba(10, 15, 29, 0.94)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const w = 100;
      const h = 24;
      const r = 4;
      ctx.beginPath();
      ctx.roundRect(x + 4, clampedY - 12, w, h, r);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 9px Inter, monospace';
      ctx.fillText(text, x + 8, clampedY - 1);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(sub, x + 8, clampedY + 8);
    };

    renderBadge(targetX, upperY, `Target $${upperTarget.toFixed(2)}`, '+8.5% Fan Target', '#38bdf8');
    renderBadge(targetX, medianY, `Consenso $${medianTarget.toFixed(2)}`, '+4.2% Expected', '#10b981');
    renderBadge(targetX, lowerY, `Supporto $${lowerSupport.toFixed(2)}`, '-5.5% Max Risk', '#f97316');
  }
};

window.OrderFlowEngine = OrderFlowEngine;
window.toggleFootprintOverlay = () => OrderFlowEngine.toggleFootprint();
window.toggleForecastCone = (f) => OrderFlowEngine.toggleForecastCone(f);
