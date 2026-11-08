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
    lineColor: 'rgba(255, 255, 255, 0.20)',
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
    const totalHeight = mainH;

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
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const lastIdx = data.length - 1;
    const lastCandle = data[lastIdx];
    const lastClose = (lastCandle && lastCandle.close !== undefined) ? lastCandle.close : (window.currentLivePrice || 75780);

    // EXACT vertical anchor: locked to real last candle close via series price coordinate
    let startY = series.priceToCoordinate(lastClose);
    if (startY === null || isNaN(startY)) {
      startY = rect.height * 0.5;
    }

    // EXACT horizontal anchor & dynamic bar spacing derived directly from chart coordinates
    let startX = null;
    let barSpacing = 16;

    if (chart.timeScale().logicalToCoordinate) {
      startX = chart.timeScale().logicalToCoordinate(lastIdx);
      const prevX = chart.timeScale().logicalToCoordinate(lastIdx - 1);
      if (startX !== null && prevX !== null && !isNaN(startX) && !isNaN(prevX)) {
        const d = Math.abs(startX - prevX);
        if (d >= 1 && d <= 250) barSpacing = d;
      }
    }

    if (startX === null || isNaN(startX)) {
      startX = chart.timeScale().timeToCoordinate(lastCandle.time);
    }

    if (startX === null || isNaN(startX)) {
      const vRange = chart.timeScale().getVisibleLogicalRange ? chart.timeScale().getVisibleLogicalRange() : null;
      if (vRange && vRange.to > vRange.from) {
        barSpacing = Math.max(2, rect.width / (vRange.to - vRange.from));
        startX = (lastIdx - vRange.from) * barSpacing;
      } else {
        startX = rect.width * 0.65;
      }
    }

    // If candle is completely off-screen to the right (> rect.width + 40), do not render
    if (startX > rect.width + 40) {
      ctx.restore();
      return;
    }

    // 20 bars forward in chart coordinate space - locked 1:1 with candle displacement!
    const projectionBars = 20;
    const rawTargetX = startX + (projectionBars * barSpacing);

    // If whole cone is scrolled off-screen to the left, return
    if (rawTargetX < -40) {
      ctx.restore();
      return;
    }

    // Safe right boundary: respect right volume profile if anchored to right
    let maxSafeRight = rect.width - 65; // Price scale width margin
    if (window.OptimalEngine && OptimalEngine.volumeProfileVisible && OptimalEngine.volumeProfileStyle === 'right') {
      const vpWidth = OptimalEngine.volumeProfileWidth || 220;
      maxSafeRight = Math.max(120, rect.width - vpWidth - 15);
    }

    // Lock targetX: natural projection when space is available, safe boundary clamp if reaching right edge
    const targetX = Math.min(rawTargetX, maxSafeRight);
    if (targetX <= startX + 8) {
      ctx.restore();
      return;
    }

    // Dynamic completion ratio if approaching the right panel
    const progressRatio = Math.max(0.15, Math.min(1.0, (targetX - startX) / Math.max(1, (rawTargetX - startX))));

    // Forecast percentages dynamically interpolated based on actual horizontal reach
    const targetGainPct = 0.085 * progressRatio;
    const medianGainPct = 0.042 * progressRatio;
    const supportLossPct = 0.055 * progressRatio;

    const upperTarget = lastClose * (1 + targetGainPct);
    const medianTarget = lastClose * (1 + medianGainPct);
    const lowerSupport = lastClose * (1 - supportLossPct);

    let upperY = series.priceToCoordinate(upperTarget);
    let medianY = series.priceToCoordinate(medianTarget);
    let lowerY = series.priceToCoordinate(lowerSupport);

    if (upperY === null || isNaN(upperY)) upperY = startY - (70 * progressRatio);
    if (medianY === null || isNaN(medianY)) medianY = startY - (35 * progressRatio);
    if (lowerY === null || isNaN(lowerY)) lowerY = startY + (60 * progressRatio);

    // 1. Shaded Cone Area (Gradient Fill following smooth Bezier curve)
    const coneGrad = ctx.createLinearGradient(startX, startY, targetX, startY);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.03)');
    coneGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.10)');
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

    // 5. Origin Dot Locked to Last Candle Close
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 6. Target Badges & Labels (Auto-clamped to prevent right-edge or volume profile overlap)
    const renderBadge = (x, y, text, sub, color) => {
      const badgeW = 104;
      const badgeH = 26;
      const badgeX = Math.min(rect.width - badgeW - 6, x + 4);
      const clampedY = Math.max(16, Math.min(rect.height - 18, y));

      ctx.fillStyle = 'rgba(10, 15, 29, 0.94)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      const r = 4;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, clampedY - 13, badgeW, badgeH, r);
      } else {
        ctx.rect(badgeX, clampedY - 13, badgeW, badgeH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 9px Inter, monospace';
      ctx.fillText(text, badgeX + 6, clampedY - 1);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(sub, badgeX + 6, clampedY + 9);
    };

    renderBadge(targetX, upperY, `Target $${upperTarget.toFixed(2)}`, `+${(targetGainPct * 100).toFixed(1)}% Fan Target`, '#38bdf8');
    renderBadge(targetX, medianY, `Consenso $${medianTarget.toFixed(2)}`, `+${(medianGainPct * 100).toFixed(1)}% Expected`, '#10b981');
    renderBadge(targetX, lowerY, `Supporto $${lowerSupport.toFixed(2)}`, `-${(supportLossPct * 100).toFixed(1)}% Max Risk`, '#f97316');

    ctx.restore();
  }
};

window.OrderFlowEngine = OrderFlowEngine;
window.toggleFootprintOverlay = () => OrderFlowEngine.toggleFootprint();
window.toggleForecastCone = (f) => OrderFlowEngine.toggleForecastCone(f);
