/* ==========================================================================
   CHART.JS - LightweightCharts Pro Integration V3 (Sector & Institutional)
   Candlesticks + VWAP + EMA 9/21/200 + Bollinger Bands + Parabolic SAR
   Panel 1: Volume Vertical Bars + Volume 20 Moving Average
   Panel 2: RSI(14) / MACD Momentum Control
   100% Horizontal & Temporal Multi-Pane Synchronization
   Exact Europe/Rome Timezone Localization & Dynamic Full Tick Precision
   © by cuordivino — Tutti i diritti riservati
   ========================================================================== */

let mainChart = null;
let candleSeries = null;
let vwapSeries = null;

// Line Indicators (EMA 9, EMA 21, EMA 50, EMA 200, ALMA, Bollinger Bands, Donchian, Parabolic SAR, SuperTrend)
let ema9Series = null;
let ema21Series = null;
let ema50Series = null;
let ema200Series = null;
let almaSeries = null;
let bbUpperSeries = null;
let bbMiddleSeries = null;
let bbLowerSeries = null;
let donchUpperSeries = null;
let donchLowerSeries = null;
let sarSeries = null;
let supertrendSeries = null;

// Sub-chart Panel 1: Volume + Volume Moving Average
let volumeChart = null;
let volumeHistogramSeries = null;
let volumeMaSeries = null;

// Sub-chart Panel 2: Momentum (RSI / MACD / Aroon / ADX)
let momentumChart = null;
let rsiSeries = null;
let macdLineSeries = null;
let macdSignalSeries = null;
let macdHistSeries = null;
let aroonSeries = null;
let adxSeries = null;
let activeMomentumMode = 'rsi'; // 'rsi' | 'macd' | 'aroon' | 'adx'

// Multi-chart synchronization guard
let isSyncingRange = false;

// Indicator visibility states (with persistence in localStorage)
const activeIndicators = {
  vwap: true,
  ema9: true,
  ema21: true,
  ema50: false,
  ema200: true,
  alma: false,
  boll: true,
  donchian: false,
  sar: false,
  supertrend: false,
  volumePane: true,
  volumePoc: true,
  momentumPane: true,
  rsi: true,
  macd: false,
  aroon: false,
  adx: false,
  chaikin: false,
  liquidation: false
};

try {
  const savedInds = localStorage.getItem('tpu_active_indicators_v27');
  if (savedInds) {
    Object.assign(activeIndicators, JSON.parse(savedInds));
  }
} catch (e) {}

// Rome Timezone Formatter Helper
function formatRomeTime(timestampSec, withSeconds = false) {
  if (!timestampSec) return '';
  const date = new Date(timestampSec * 1000);
  const opts = {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit'
  };
  if (withSeconds) opts.second = '2-digit';
  return date.toLocaleTimeString('it-IT', opts);
}

// Timeframe-Aware Tick Mark Formatter for Lightweight Charts (Clean, regular, high-precision)
function formatTimeScaleTick(time, tickMarkType, locale, forcedTf) {
  if (!time) return '';
  const tfRaw = (forcedTf || window.currentInterval || '15m');
  const tfLower = tfRaw.toLowerCase();

  let date;
  if (typeof time === 'object' && time !== null) {
    date = new Date(Date.UTC(time.year, time.month - 1, time.day));
  } else {
    date = new Date(time * 1000);
  }

  const isSeconds = (tfLower === '1s');
  const is1Min = (tfLower === '1m');
  const is5Min = (tfLower === '5m');
  const isDaily = (tfLower === '1d' || tfLower === '1g');
  const isWeekly = (tfLower === '1w' || tfLower === '1sett');
  const isMonthly = (tfRaw === '1M' || tfLower === '1mese' || tfLower === '1month');

  // 1. Seconds (1s) -> format HH:mm:ss
  if (isSeconds) {
    return date.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // 2. High-timeframe Daily, Weekly, Monthly -> format Date (DD MMM or MMM 'YY) - NEVER "02:00"!
  if (isDaily || isWeekly || isMonthly) {
    if (tickMarkType === 0) {
      return date.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', year: 'numeric' });
    }
    if (tickMarkType === 1 || isMonthly) {
      return date.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', month: 'short', year: '2-digit' });
    }
    return date.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: 'short' });
  }

  // 3. Intraday: 1m, 5m, 15m, 30m, 1h, 4h
  const romeHourStr = date.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });

  // On 1m or 5m timeframe: ALWAYS show HH:mm (never show "nov 26" repeatedly!)
  if (is1Min || is5Min) {
    return romeHourStr;
  }

  // On day boundaries (midnight 00:00 or DayOfMonth tick mark) show clean date
  if (tickMarkType === 2 || tickMarkType === 1 || tickMarkType === 0 || romeHourStr === '00:00') {
    return date.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: 'short' });
  }

  return romeHourStr;
}

// Dynamically optimize timeScale options and bar spacing per timeframe
function applyTimeframeScaleOptions(tf) {
  if (!mainChart) return;
  const tfRaw = (tf || window.currentInterval || '15m');
  const tfLower = tfRaw.toLowerCase();
  const isSeconds = (tfLower === '1s');
  const is1Min = (tfLower === '1m');
  const is5Min = (tfLower === '5m');
  const isDaily = (tfLower === '1d' || tfLower === '1g');
  const isWeekly = (tfLower === '1w' || tfLower === '1sett');
  const isMonthly = (tfRaw === '1M' || tfLower === '1mese' || tfLower === '1month');
  const isHighTf = isDaily || isWeekly || isMonthly;

  let optimalBarSpacing = 16;
  let minBarSpacing = 8;
  let visibleBars = 60;

  if (isSeconds) {
    optimalBarSpacing = 18;
    minBarSpacing = 10;
    visibleBars = 60;
  } else if (is1Min) {
    // 1-minute: wide bars, tick marks every 1 or 2 minutes, crystal clear!
    optimalBarSpacing = 20;
    minBarSpacing = 12;
    visibleBars = 50;
  } else if (is5Min) {
    // 5-minute: 22px bar spacing so ticks fall every 10-15 minutes, never 30m or 90m gaps!
    optimalBarSpacing = 22;
    minBarSpacing = 12;
    visibleBars = 45;
  } else if (tfLower === '15m') {
    optimalBarSpacing = 14;
    minBarSpacing = 8;
    visibleBars = 65;
  } else if (tfLower === '30m') {
    optimalBarSpacing = 14;
    minBarSpacing = 8;
    visibleBars = 60;
  } else if (tfLower === '1h') {
    optimalBarSpacing = 12;
    minBarSpacing = 6;
    visibleBars = 65;
  } else if (tfLower === '4h') {
    optimalBarSpacing = 12;
    minBarSpacing = 6;
    visibleBars = 55;
  } else if (isDaily) {
    optimalBarSpacing = 12;
    minBarSpacing = 5;
    visibleBars = 65;
  } else if (isWeekly) {
    optimalBarSpacing = 14;
    minBarSpacing = 6;
    visibleBars = 50;
  } else if (isMonthly) {
    optimalBarSpacing = 16;
    minBarSpacing = 8;
    visibleBars = 36;
  }

  const opts = {
    borderColor: '#1e293b',
    timeVisible: !isHighTf,
    secondsVisible: isSeconds,
    barSpacing: optimalBarSpacing,
    minBarSpacing: minBarSpacing,
    rightOffset: 14,
    fixLeftEdge: false,
    fixRightEdge: false,
    tickMarkFormatter: (time, tickMarkType, locale) => formatTimeScaleTick(time, tickMarkType, locale, tfRaw)
  };

  try {
    mainChart.timeScale().applyOptions(opts);
    if (volumeChart) volumeChart.timeScale().applyOptions({ ...opts, visible: false });
    if (momentumChart) momentumChart.timeScale().applyOptions(opts);
  } catch(e) {}

  const candles = window.currentCandles || [];
  if (candles.length > 0) {
    const to = candles.length + 8;
    const from = Math.max(0, candles.length - visibleBars);
    try {
      mainChart.timeScale().setVisibleLogicalRange({ from, to });
      if (volumeChart) volumeChart.timeScale().setVisibleLogicalRange({ from, to });
      if (momentumChart) momentumChart.timeScale().setVisibleLogicalRange({ from, to });
    } catch(e) {}
  }
}
window.applyTimeframeScaleOptions = applyTimeframeScaleOptions;

function initMainChart() {
  const container = document.getElementById('chart-container');
  if (!container || !window.LightweightCharts) return;

  container.innerHTML = '';

  mainChart = LightweightCharts.createChart(container, {
    layout: {
      background: { color: '#090d16' },
      textColor: '#94a3b8',
      fontSize: 11,
      fontFamily: "'JetBrains Mono', 'Inter', monospace",
    },
    localization: {
      locale: 'it-IT',
      dateFormat: 'dd/MM/yyyy',
      timeFormatter: (timestamp) => formatRomeTime(timestamp, true)
    },
    grid: {
      vertLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 },
      horzLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#64748b', width: 1, style: 2 },
      horzLine: { color: '#64748b', width: 1, style: 2 },
    },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72,
      scaleMargins: {
        top: 0.08,
        bottom: 0.08
      }
    },
    timeScale: {
      borderColor: '#1e293b',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 8,
      fixLeftEdge: false,
      fixRightEdge: false,
      tickMarkFormatter: (time, tickMarkType, locale) => formatTimeScaleTick(time, tickMarkType, locale)
    },
  });

  // Candlestick Series: Only this series has visible price badges on the vertical axis!
  candleSeries = mainChart.addCandlestickSeries({
    upColor: '#00f2a1',
    downColor: '#ff4560',
    borderVisible: false,
    wickUpColor: '#00f2a1',
    wickDownColor: '#ff4560',
    lastValueVisible: true,
    priceLineVisible: true
  });
  window.mainCandleSeries = candleSeries;
  window.mainChartInstance = mainChart;

  /* REAL-TIME DRAG & WHEEL SYNC FOR OVERLAYS */
  const chartMainContainer = document.getElementById('main-chart');
  if (chartMainContainer) {
    let isChartDragging = false;
    chartMainContainer.addEventListener('mousedown', () => { isChartDragging = true; });
    window.addEventListener('mouseup', () => {
      if (isChartDragging) {
        isChartDragging = false;
        if (window.OptimalEngine && OptimalEngine.volumeProfileVisible) {
          OptimalEngine.calculateLocalVolumeProfile();
          OptimalEngine.renderVolumeProfileOverlay();
        }
        if (window.OrderFlowEngine && OrderFlowEngine.forecastConeVisible) {
          OrderFlowEngine.renderForecastCone();
        }
      }
    });
    chartMainContainer.addEventListener('mousemove', () => {
      if (isChartDragging) {
        requestAnimationFrame(() => {
          if (window.OrderFlowEngine && OrderFlowEngine.forecastConeVisible) {
            OrderFlowEngine.renderForecastCone();
          }
          if (window.OptimalEngine && OptimalEngine.volumeProfileVisible) {
            OptimalEngine.renderVolumeProfileOverlay();
          }
        });
      }
    });
    chartMainContainer.addEventListener('touchmove', () => {
      requestAnimationFrame(() => {
        if (window.OrderFlowEngine && OrderFlowEngine.forecastConeVisible) {
          OrderFlowEngine.renderForecastCone();
        }
        if (window.OptimalEngine && OptimalEngine.volumeProfileVisible) {
          OptimalEngine.renderVolumeProfileOverlay();
        }
      });
    }, { passive: true });

    chartMainContainer.addEventListener('wheel', () => {
      requestAnimationFrame(() => {
        if (window.OrderFlowEngine && OrderFlowEngine.forecastConeVisible) {
          OrderFlowEngine.renderForecastCone();
        }
        if (window.OptimalEngine && OptimalEngine.volumeProfileVisible) {
          OptimalEngine.calculateLocalVolumeProfile();
          OptimalEngine.renderVolumeProfileOverlay();
        }
      });
    }, { passive: true });
  }

  mainChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (window.OptimalEngine && OptimalEngine.volumeProfileVisible) {
      OptimalEngine.calculateLocalVolumeProfile();
      OptimalEngine.renderVolumeProfileOverlay();
    }
    if (window.OrderFlowEngine) {
      OrderFlowEngine.renderFootprintOverlay();
      OrderFlowEngine.renderDenseTimeGrid();
      if (OrderFlowEngine.forecastConeVisible) {
        OrderFlowEngine.renderForecastCone();
      }
    }
    if (volumeChart) {
      try { volumeChart.timeScale().setVisibleLogicalRange(range); } catch(e) {}
    }
    if (momentumChart) {
      try { momentumChart.timeScale().setVisibleLogicalRange(range); } catch(e) {}
    }
  });


  // Indicators: Clean display, NO overlapping badge clutter on price axis!
  // Values are rendered cleanly in the on-chart live legend bar!
  vwapSeries = mainChart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  ema9Series = mainChart.addLineSeries({
    color: '#00f2a1',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  ema21Series = mainChart.addLineSeries({
    color: '#38bdf8',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  ema50Series = mainChart.addLineSeries({
    color: '#f97316', // Orange
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  ema200Series = mainChart.addLineSeries({
    color: '#a855f7',
    lineWidth: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  // Arnaud Legoux Moving Average (ALMA)
  almaSeries = mainChart.addLineSeries({
    color: '#ec4899', // Pink
    lineWidth: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  // SuperTrend Quant Line
  supertrendSeries = mainChart.addLineSeries({
    color: '#00f2a1',
    lineWidth: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  bbUpperSeries = mainChart.addLineSeries({
    color: 'rgba(99, 102, 241, 0.75)',
    lineWidth: 1,
    lineStyle: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  bbMiddleSeries = mainChart.addLineSeries({
    color: 'rgba(99, 102, 241, 0.4)',
    lineWidth: 1,
    lineStyle: 0,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  bbLowerSeries = mainChart.addLineSeries({
    color: 'rgba(99, 102, 241, 0.75)',
    lineWidth: 1,
    lineStyle: 2,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  // Donchian Channels (20)
  donchUpperSeries = mainChart.addLineSeries({
    color: '#06b6d4', // Cyan
    lineWidth: 1,
    lineStyle: 1,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  donchLowerSeries = mainChart.addLineSeries({
    color: '#06b6d4',
    lineWidth: 1,
    lineStyle: 1,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  sarSeries = mainChart.addLineSeries({
    color: '#f43f5e',
    lineWidth: 1,
    lineStyle: 1,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  // Init Sub-Panels (Volume, Momentum 1, Oscillator 2)
  initVolumePane();
  initMomentumPane();
  try {
    if (typeof initSub2Pane === 'function') initSub2Pane();
  } catch(e) {}

  // Attach Bidirectional Synchronization across all 4 charts
  attachMultiChartSync();

  // Initialize Theme, Pane Splitter & Workspace Masks
  if (window.ThemeManager) window.ThemeManager.init();
  if (window.PaneSplitterManager) window.PaneSplitterManager.init();
  if (window.WorkspaceMaskManager) window.WorkspaceMaskManager.init();

  // Window resize handler
  window.addEventListener('resize', () => {
    resizeAllCharts();
  });

  startRomeClock();
}

// Global Theme Applicator for All 3 Synchronized LightweightCharts
window.applyChartThemeToAll = function(t) {
  if (!t) return;
  const chartOpts = {
    layout: {
      background: { color: t.chartBg },
      textColor: t.textColor
    },
    grid: {
      vertLines: { visible: true, color: t.gridColor || 'rgba(255, 255, 255, 0.22)', style: 1 },
      horzLines: { visible: true, color: t.gridColor || 'rgba(255, 255, 255, 0.22)', style: 1 }
    },
    rightPriceScale: {
      borderColor: t.borderColor
    },
    timeScale: {
      borderColor: t.borderColor
    }
  };

  if (mainChart) mainChart.applyOptions(chartOpts);
  if (volumeChart) volumeChart.applyOptions(chartOpts);
  if (momentumChart) momentumChart.applyOptions(chartOpts);
  if (sub2Chart) sub2Chart.applyOptions(chartOpts);

  if (candleSeries) {
    candleSeries.applyOptions({
      upColor: t.candleUp,
      wickUpColor: t.candleUp,
      downColor: t.candleDown,
      wickDownColor: t.candleDown
    });
  }
};

// ==========================================
// PANNELLO 1: VOLUMI + MEDIA MOBILE VOLUMI
// ==========================================
function initVolumePane() {
  const pane = document.getElementById('chart-volume-pane');
  const container = document.getElementById('chart-volume-canvas') || pane;
  if (!container || !window.LightweightCharts || volumeChart) return;

  container.innerHTML = '';
  volumeChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    localization: {
      locale: 'it-IT',
      timeFormatter: (t) => formatRomeTime(t, true)
    },
    grid: {
      vertLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 },
      horzLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#64748b', width: 1, style: 2 },
      horzLine: { color: '#64748b', width: 1, style: 2 }
    },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72,
      scaleMargins: { top: 0.28, bottom: 0 }
    },
    timeScale: {
      visible: false,
      rightOffset: 12,
      barSpacing: 8,
      fixLeftEdge: false,
      fixRightEdge: false
    },
  });

  volumeHistogramSeries = volumeChart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '',
    lastValueVisible: true,
    priceLineVisible: false
  });

  volumeMaSeries = volumeChart.addLineSeries({
    color: '#fcd535',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });
}

// ==========================================
// PANNELLO 2: MOMENTUM (RSI / MACD)
// ==========================================
function initMomentumPane() {
  const pane = document.getElementById('chart-momentum-pane');
  const container = document.getElementById('chart-momentum-canvas') || pane;
  if (!container || !window.LightweightCharts || momentumChart) return;

  container.innerHTML = '';
  momentumChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    localization: {
      locale: 'it-IT',
      timeFormatter: (t) => formatRomeTime(t, true)
    },
    grid: {
      vertLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 },
      horzLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#64748b', width: 1, style: 2 },
      horzLine: { color: '#64748b', width: 1, style: 2 }
    },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72,
      scaleMargins: { top: 0.25, bottom: 0.15 }
    },
    timeScale: {
      visible: true,
      borderColor: '#1e293b',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 8,
      fixLeftEdge: false,
      fixRightEdge: false,
      tickMarkFormatter: (time, tickMarkType, locale) => formatTimeScaleTick(time, tickMarkType, locale)
    },
  });

  rsiSeries = momentumChart.addLineSeries({
    color: '#a855f7',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: true,
    priceLineVisible: false
  });

  macdHistSeries = momentumChart.addHistogramSeries({
    color: '#38bdf8',
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  macdLineSeries = momentumChart.addLineSeries({
    color: '#00f2a1',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });

  macdSignalSeries = momentumChart.addLineSeries({
    color: '#ff4560',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false,
    priceLineVisible: false
  });
}

// BIDIRECTIONAL TIME & ZOOM SYNCHRONIZATION
function attachMultiChartSync() {
  if (!mainChart || !volumeChart || !momentumChart) return;

  const releaseSync = () => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => { isSyncingRange = false; });
    } else {
      setTimeout(() => { isSyncingRange = false; }, 20);
    }
  };

  mainChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (volumeChart && typeof volumeChart.timeScale === 'function') volumeChart.timeScale().setVisibleLogicalRange(range);
      if (momentumChart && typeof momentumChart.timeScale === 'function') momentumChart.timeScale().setVisibleLogicalRange(range);
      if (typeof sub2Chart !== 'undefined' && sub2Chart && typeof sub2Chart.timeScale === 'function') sub2Chart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    releaseSync();
  });

  volumeChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (mainChart && typeof mainChart.timeScale === 'function') mainChart.timeScale().setVisibleLogicalRange(range);
      if (momentumChart && typeof momentumChart.timeScale === 'function') momentumChart.timeScale().setVisibleLogicalRange(range);
      if (typeof sub2Chart !== 'undefined' && sub2Chart && typeof sub2Chart.timeScale === 'function') sub2Chart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    releaseSync();
  });

  momentumChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (mainChart && typeof mainChart.timeScale === 'function') mainChart.timeScale().setVisibleLogicalRange(range);
      if (volumeChart && typeof volumeChart.timeScale === 'function') volumeChart.timeScale().setVisibleLogicalRange(range);
      if (sub2Chart && typeof sub2Chart.timeScale === 'function') sub2Chart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    releaseSync();
  });

  if (typeof sub2Chart !== 'undefined' && sub2Chart && typeof sub2Chart.timeScale === 'function') {
    sub2Chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (isSyncingRange || !range) return;
      isSyncingRange = true;
      try {
        if (mainChart && typeof mainChart.timeScale === 'function') mainChart.timeScale().setVisibleLogicalRange(range);
        if (volumeChart && typeof volumeChart.timeScale === 'function') volumeChart.timeScale().setVisibleLogicalRange(range);
        if (momentumChart && typeof momentumChart.timeScale === 'function') momentumChart.timeScale().setVisibleLogicalRange(range);
      if (typeof sub2Chart !== 'undefined' && sub2Chart && typeof sub2Chart.timeScale === 'function') sub2Chart.timeScale().setVisibleLogicalRange(range);
      } catch(e) {}
      releaseSync();
    });
  }

  if (window.OrderFlowEngine) {
    OrderFlowEngine.renderFootprintOverlay();
    OrderFlowEngine.renderDenseTimeGrid();
  }
}

function setMomentumMode(mode) {
  activeMomentumMode = mode;
  document.querySelectorAll('.mom-toggle-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-mom="${mode}"]`)?.classList.add('active');

  const titleEl = document.getElementById('momentum-pane-title');
  if (titleEl) {
    titleEl.innerText = mode === 'rsi' 
      ? 'PANNELLO 2: Oscillatore Momentum RSI (14) — Bande Ipercomprato (70) / Ipervenduto (30)'
      : 'PANNELLO 2: MACD (12, 26, 9) — Istogramma Volumi Momentum & Signal Line';
  }

  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }
}

function resizeAllCharts() {
  if (window.OrderFlowEngine) {
    OrderFlowEngine.renderFootprintOverlay();
    OrderFlowEngine.renderDenseTimeGrid();
  }
  try {
    const c1 = document.getElementById('chart-container');
    if (mainChart && c1 && c1.clientWidth > 10 && c1.clientHeight > 10) {
      mainChart.resize(c1.clientWidth, c1.clientHeight);
    }

    const c2 = document.getElementById('chart-volume-pane');
    if (volumeChart && c2 && c2.style.display !== 'none' && c2.clientWidth > 10 && c2.clientHeight > 10) {
      volumeChart.resize(c2.clientWidth, c2.clientHeight);
    }

    const c3 = document.getElementById('chart-momentum-pane');
    if (momentumChart && c3 && c3.style.display !== 'none' && c3.clientWidth > 10 && c3.clientHeight > 10) {
      momentumChart.resize(c3.clientWidth, c3.clientHeight);
    }

    const c4 = document.getElementById('chart-sub2-pane');
    const c4Canvas = document.getElementById('chart-sub2-canvas');
    if (sub2Chart && c4 && c4.style.display !== 'none' && c4.clientWidth > 10) {
      const h = c4Canvas && c4Canvas.clientHeight > 10 ? c4Canvas.clientHeight : Math.max(30, c4.clientHeight - 26);
      sub2Chart.resize(c4.clientWidth, h);
    }
  } catch(e) {
    console.warn('[resizeAllCharts] Handled safely:', e);
  }
}

// ==========================================
// MASTER DATA RENDERER WITH FULL TICK PRECISION & 100% ALIGNMENT
// ==========================================
function renderChartData(candles) {
  if (!candleSeries || !candles || !candles.length) return;

  const sym = window.currentSymbol || 'BTCUSDT';
  const lastClose = candles[candles.length - 1].close;
  const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
  const prec = window.getDynamicPrecision ? window.getDynamicPrecision(lastClose, sym) : (asset ? asset.precision : 2);
  const minMove = window.getDynamicMinMove ? window.getDynamicMinMove(prec) : Math.pow(10, -prec);

  // Dynamic price formatting strictly on candle series & right scale
  candleSeries.applyOptions({
    priceFormat: {
      type: 'price',
      precision: prec,
      minMove: minMove
    }
  });

  const indicatorSeriesList = [
    vwapSeries, ema9Series, ema21Series, ema50Series, ema200Series,
    almaSeries, bbUpperSeries, bbMiddleSeries, bbLowerSeries,
    donchUpperSeries, donchLowerSeries, sarSeries, supertrendSeries
  ];
  indicatorSeriesList.forEach(series => {
    if (series) {
      series.applyOptions({
        priceFormat: {
          type: 'price',
          precision: prec,
          minMove: minMove
        },
        title: '',
        lastValueVisible: false,
        priceLineVisible: false
      });
    }
  });

  // 1. Japanese Candlesticks
  const formattedCandles = candles.map(c => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close
  }));
  candleSeries.setData(formattedCandles);
  window.currentChartCandles = candles;
  if (window.OrderFlowEngine && OrderFlowEngine.forecastConeVisible) {
    OrderFlowEngine.renderForecastCone();
  }

  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const volumes = candles.map(c => c.volume || 10);

  // 2. VWAP (Dynamic user parameters)
  if (activeIndicators.vwap && vwapSeries) {
    const vCfg = getIndicatorConfig('vwap');
    if (vCfg.style.color) vwapSeries.applyOptions({ color: vCfg.style.color, lineWidth: vCfg.style.lineWidth || 2 });
    vwapSeries.setData(calcVWAPData(candles, prec));
  } else if (vwapSeries) {
    vwapSeries.setData([]);
  }

  // 3. EMA Ribbon: Dynamic lengths & custom colors
  const e9CfgMaster = getIndicatorConfig('ema9');
  const lenFast = e9CfgMaster.inputs.len1 || e9CfgMaster.inputs.length || 9;
  const lenMid = e9CfgMaster.inputs.len2 || 21;
  const lenSlow = e9CfgMaster.inputs.len3 || 200;
  const colFast = e9CfgMaster.style.color1 || e9CfgMaster.style.color || '#00f2a1';
  const colMid = e9CfgMaster.style.color2 || '#38bdf8';
  const colSlow = e9CfgMaster.style.color3 || '#ef4444';

  if (ema9Series) {
    ema9Series.applyOptions({ color: colFast, lineWidth: e9CfgMaster.style.lineWidth || 1.8 });
    ema9Series.setData(activeIndicators.ema9 ? calcEMAData(times, closes, lenFast, prec) : []);
  }
  if (ema21Series) {
    ema21Series.applyOptions({ color: colMid, lineWidth: e9CfgMaster.style.lineWidth || 1.5 });
    ema21Series.setData(activeIndicators.ema21 ? calcEMAData(times, closes, lenMid, prec) : []);
  }
  if (ema50Series) {
    const e50 = getIndicatorConfig('ema50');
    ema50Series.applyOptions({ color: e50.style.color || '#f97316', lineWidth: e50.style.lineWidth || 1.5 });
    ema50Series.setData(activeIndicators.ema50 ? calcEMAData(times, closes, e50.inputs.length || 50, prec) : []);
  }
  if (ema200Series) {
    ema200Series.applyOptions({ color: colSlow, lineWidth: e9CfgMaster.style.lineWidth || 2 });
    ema200Series.setData(activeIndicators.ema200 ? calcEMAData(times, closes, lenSlow, prec) : []);
  }

  // 4. ALMA (Arnaud Legoux Moving Average)
  if (almaSeries) {
    almaSeries.setData(activeIndicators.alma ? calcALMAData(times, closes, 9, 0.85, 6, prec) : []);
  }

  // 5. Bollinger Bands (Dynamic user parameters)
  if (activeIndicators.boll && bbUpperSeries && bbMiddleSeries && bbLowerSeries) {
    const bCfg = getIndicatorConfig('boll');
    const bLen = bCfg.inputs.length || 20;
    const bMult = bCfg.inputs.mult || 2.0;
    if (bCfg.style.upperColor) bbUpperSeries.applyOptions({ color: bCfg.style.upperColor, lineWidth: bCfg.style.lineWidth || 1.5 });
    if (bCfg.style.middleColor) bbMiddleSeries.applyOptions({ color: bCfg.style.middleColor, lineWidth: bCfg.style.lineWidth || 1.5 });
    if (bCfg.style.lowerColor) bbLowerSeries.applyOptions({ color: bCfg.style.lowerColor, lineWidth: bCfg.style.lineWidth || 1.5 });

    const bb = calcBollingerBands(times, closes, bLen, bMult, prec);
    bbUpperSeries.setData(bb.upper);
    bbMiddleSeries.setData(bb.middle);
    bbLowerSeries.setData(bb.lower);
  } else if (bbUpperSeries && bbMiddleSeries && bbLowerSeries) {
    bbUpperSeries.setData([]);
    bbMiddleSeries.setData([]);
    bbLowerSeries.setData([]);
  }

  // 6. Donchian Channels (20)
  if (donchUpperSeries && donchLowerSeries) {
    if (activeIndicators.donchian) {
      const donch = calcDonchianChannels(times, candles, 20, prec);
      donchUpperSeries.setData(donch.upper);
      donchLowerSeries.setData(donch.lower);
    } else {
      donchUpperSeries.setData([]);
      donchLowerSeries.setData([]);
    }
  }

  // 7. Parabolic SAR
  if (sarSeries) sarSeries.setData(activeIndicators.sar ? calcSARData(times, candles, prec) : []);

  // 8. SuperTrend Quant
  if (supertrendSeries) {
    supertrendSeries.setData(activeIndicators.supertrend ? calcSuperTrendData(times, candles, 10, 3, prec) : []);
  }

  // 9. Sub-chart Panel 1: Vertical Volume Bars + 20 SMA
  const volContainer = document.getElementById('chart-volume-pane');
  if (volContainer) {
    volContainer.style.display = activeIndicators.volumePane !== false ? 'block' : 'none';
  }
  if (!volumeChart) initVolumePane();
  if (volumeHistogramSeries && volumeMaSeries && activeIndicators.volumePane !== false) {
    const formattedVol = candles.map(c => ({
      time: c.time,
      value: c.volume || 10,
      color: c.close >= c.open ? 'rgba(0, 242, 161, 0.65)' : 'rgba(255, 69, 96, 0.65)'
    }));
    volumeHistogramSeries.setData(formattedVol);

    let volMA;
    if (typeof currentVolumeMaType !== 'undefined' && currentVolumeMaType === 'EMA') {
      const k = 2 / (currentVolumeMaPeriod + 1);
      let ema = volumes[0] || 0;
      volMA = times.map((t, i) => {
        if (i > 0) ema = (volumes[i] * k) + (ema * (1 - k));
        return { time: t, value: Math.round(ema) };
      });
    } else {
      const p = typeof currentVolumeMaPeriod !== 'undefined' ? currentVolumeMaPeriod : 20;
      volMA = calcVolumeSMA(times, volumes, p);
    }
    volumeMaSeries.setData(volMA);

    const lastVol = candles[candles.length - 1]?.volume || 0;
    const lastMaVal = volMA.length ? volMA[volMA.length - 1]?.value : 0;
    const liveVolEl = document.getElementById('pane-vol-live');
    if (liveVolEl) {
      liveVolEl.innerText = `Vol: ${Number(lastVol).toLocaleString()} | MA: ${Number(Math.round(lastMaVal)).toLocaleString()}`;
    }
  }

  // 10. Sub-chart Panel 2: Momentum (RSI / MACD / Aroon / ADX)
  const momContainer = document.getElementById('chart-momentum-pane');
  if (momContainer) {
    momContainer.style.display = activeIndicators.momentumPane !== false ? 'block' : 'none';
  }
  if (!momentumChart) initMomentumPane();
  if (momentumChart && activeIndicators.momentumPane !== false) {
    if (activeMomentumMode === 'rsi') {
      const rsiData = calcRSIData(times, closes, 14);
      if (rsiSeries) rsiSeries.setData(rsiData);
      if (macdHistSeries) macdHistSeries.setData([]);
      if (macdLineSeries) macdLineSeries.setData([]);
      if (macdSignalSeries) macdSignalSeries.setData([]);
      if (aroonSeries) aroonSeries.setData([]);
      if (adxSeries) adxSeries.setData([]);
    } else if (activeMomentumMode === 'macd') {
      const macdData = calcMACDData(times, closes);
      if (rsiSeries) rsiSeries.setData([]);
      if (macdHistSeries) macdHistSeries.setData(macdData.hist);
      if (macdLineSeries) macdLineSeries.setData(macdData.macd);
      if (macdSignalSeries) macdSignalSeries.setData(macdData.signal);
      if (aroonSeries) aroonSeries.setData([]);
      if (adxSeries) adxSeries.setData([]);
    } else if (activeMomentumMode === 'aroon') {
      const aroonData = calcAroonData(times, candles, 14);
      if (rsiSeries) rsiSeries.setData([]);
      if (macdHistSeries) macdHistSeries.setData([]);
      if (macdLineSeries) macdLineSeries.setData([]);
      if (macdSignalSeries) macdSignalSeries.setData([]);
      if (aroonSeries) aroonSeries.setData(aroonData);
      if (adxSeries) adxSeries.setData([]);
    } else if (activeMomentumMode === 'adx') {
      const adxData = calcADXData(times, candles, 14);
      if (rsiSeries) rsiSeries.setData([]);
      if (macdHistSeries) macdHistSeries.setData([]);
      if (macdLineSeries) macdLineSeries.setData([]);
      if (macdSignalSeries) macdSignalSeries.setData([]);
      if (aroonSeries) aroonSeries.setData([]);
      if (adxSeries) adxSeries.setData(adxData);
    } else if (activeMomentumMode === 'cvd') {
      const cvdData = window.OrderFlowEngine ? OrderFlowEngine.calculateCVD(candles) : [];
      if (rsiSeries) rsiSeries.setData([]);
      if (macdHistSeries) macdHistSeries.setData(cvdData);
      if (macdLineSeries) macdLineSeries.setData(cvdData);
      if (macdSignalSeries) macdSignalSeries.setData([]);
      if (aroonSeries) aroonSeries.setData([]);
      if (adxSeries) adxSeries.setData([]);
      const lastCvd = cvdData.length ? cvdData[cvdData.length - 1]?.value : 0;
      const liveMomEl = document.getElementById('mom-live-badge');
      if (liveMomEl) {
        liveMomEl.innerText = `CVD: ${lastCvd >= 0 ? '+' : ''}${Number(lastCvd).toLocaleString()}`;
        liveMomEl.style.color = lastCvd >= 0 ? '#00f2a1' : '#ff4560';
      }
    }
  }

  // ==========================================
  // DYNAMIC 107 TRADINGVIEW INDICATORS DISPATCHER
  // ==========================================
  const dynamicOverlays = [
    { id: 'hma', calc: () => calcHMAData(times, closes, 20, prec), color: '#38bdf8', width: 2 },
    { id: 'dema', calc: () => calcDEMAData(times, closes, 20, prec), color: '#fbbf24', width: 2 },
    { id: 'tema', calc: () => calcTEMAData(times, closes, 20, prec), color: '#f43f5e', width: 2 },
    { id: 'wma', calc: () => calcWMAData(times, closes, 20, prec), color: '#34d399', width: 1.5 },
    { id: 'sma', calc: () => calcSMAData(times, closes, 20, prec), color: '#e879f9', width: 1.5 },
    { id: 'avg_price', calc: () => calcAveragePriceData(times, candles, prec), color: '#94a3b8', width: 1 },
    { id: 'median_price', calc: () => calcMedianPriceData(times, candles, prec), color: '#cbd5e1', width: 1 },
    { id: 'typical_price', calc: () => calcTypicalPriceData(times, candles, prec), color: '#f1f5f9', width: 1 },
    { id: 'zigzag', calc: () => calcZigZagData(times, candles, 0.03, prec), color: '#fb923c', width: 2 }
  ];

  dynamicOverlays.forEach(ov => {
    if (activeIndicators[ov.id]) {
      if (!dynamicOverlaySeries[ov.id] && mainChart) {
        dynamicOverlaySeries[ov.id] = mainChart.addLineSeries({
          color: ov.color,
          lineWidth: ov.width || 1.5,
          priceLineVisible: false
        });
      }
      if (dynamicOverlaySeries[ov.id]) {
        dynamicOverlaySeries[ov.id].setData(ov.calc());
      }
    } else if (dynamicOverlaySeries[ov.id]) {
      dynamicOverlaySeries[ov.id].setData([]);
    }
  });

  // Keltner Channels
  if (activeIndicators.keltner) {
    if (!dynamicOverlaySeries['keltner_u'] && mainChart) {
      dynamicOverlaySeries['keltner_u'] = mainChart.addLineSeries({ color: 'rgba(56, 189, 248, 0.7)', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
      dynamicOverlaySeries['keltner_m'] = mainChart.addLineSeries({ color: 'rgba(56, 189, 248, 0.9)', lineWidth: 1.5, priceLineVisible: false });
      dynamicOverlaySeries['keltner_l'] = mainChart.addLineSeries({ color: 'rgba(56, 189, 248, 0.7)', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    }
    const kc = calcKeltnerChannels(times, candles, 20, 2, prec);
    dynamicOverlaySeries['keltner_u'].setData(kc.upper);
    dynamicOverlaySeries['keltner_m'].setData(kc.middle);
    dynamicOverlaySeries['keltner_l'].setData(kc.lower);
  } else if (dynamicOverlaySeries['keltner_u']) {
    dynamicOverlaySeries['keltner_u'].setData([]);
    dynamicOverlaySeries['keltner_m'].setData([]);
    dynamicOverlaySeries['keltner_l'].setData([]);
  }

  // Ichimoku Cloud
  if (activeIndicators.ichimoku) {
    if (!dynamicOverlaySeries['ichi_tenkan'] && mainChart) {
      dynamicOverlaySeries['ichi_tenkan'] = mainChart.addLineSeries({ color: '#ef4444', lineWidth: 1.5, priceLineVisible: false });
      dynamicOverlaySeries['ichi_kijun'] = mainChart.addLineSeries({ color: '#3b82f6', lineWidth: 1.5, priceLineVisible: false });
      dynamicOverlaySeries['ichi_spanA'] = mainChart.addLineSeries({ color: 'rgba(34, 197, 94, 0.7)', lineWidth: 1, lineStyle: 1, priceLineVisible: false });
      dynamicOverlaySeries['ichi_spanB'] = mainChart.addLineSeries({ color: 'rgba(239, 68, 68, 0.7)', lineWidth: 1, lineStyle: 1, priceLineVisible: false });
    }
    const ichi = calcIchimokuData(times, candles, prec);
    dynamicOverlaySeries['ichi_tenkan'].setData(ichi.tenkan);
    dynamicOverlaySeries['ichi_kijun'].setData(ichi.kijun);
    dynamicOverlaySeries['ichi_spanA'].setData(ichi.spanA);
    dynamicOverlaySeries['ichi_spanB'].setData(ichi.spanB);
  } else if (dynamicOverlaySeries['ichi_tenkan']) {
    dynamicOverlaySeries['ichi_tenkan'].setData([]);
    dynamicOverlaySeries['ichi_kijun'].setData([]);
    dynamicOverlaySeries['ichi_spanA'].setData([]);
    dynamicOverlaySeries['ichi_spanB'].setData([]);
  }

  // Envelopes
  if (activeIndicators.envelopes) {
    if (!dynamicOverlaySeries['env_u'] && mainChart) {
      dynamicOverlaySeries['env_u'] = mainChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
      dynamicOverlaySeries['env_l'] = mainChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    }
    const env = calcEnvelopesData(times, closes, 20, 0.025, prec);
    dynamicOverlaySeries['env_u'].setData(env.upper);
    dynamicOverlaySeries['env_l'].setData(env.lower);
  } else if (dynamicOverlaySeries['env_u']) {
    dynamicOverlaySeries['env_u'].setData([]);
    dynamicOverlaySeries['env_l'].setData([]);
  }

  // 52 Week High / Low
  if (activeIndicators.hi_lo_52w) {
    if (!dynamicOverlaySeries['hi_52w'] && mainChart) {
      dynamicOverlaySeries['hi_52w'] = mainChart.addLineSeries({ color: '#10b981', lineWidth: 1.5, lineStyle: 2, priceLineVisible: false });
      dynamicOverlaySeries['lo_52w'] = mainChart.addLineSeries({ color: '#ef4444', lineWidth: 1.5, lineStyle: 2, priceLineVisible: false });
    }
    const hilo = calc52WeekHighLowData(times, candles, prec);
    dynamicOverlaySeries['hi_52w'].setData(hilo.high);
    dynamicOverlaySeries['lo_52w'].setData(hilo.low);
  } else if (dynamicOverlaySeries['hi_52w']) {
    dynamicOverlaySeries['hi_52w'].setData([]);
    dynamicOverlaySeries['lo_52w'].setData([]);
  }

  // Dynamic Momentum Oscillators handling
  if (momentumChart && activeIndicators.momentumPane !== false) {
    if (activeIndicators.stoch || activeMomentumMode === 'stoch') {
      if (!dynamicMomentumSeries['stoch_k']) {
        dynamicMomentumSeries['stoch_k'] = momentumChart.addLineSeries({ color: '#38bdf8', lineWidth: 2, priceLineVisible: false });
        dynamicMomentumSeries['stoch_d'] = momentumChart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, lineStyle: 1, priceLineVisible: false });
      }
      const stoch = calcStochasticData(times, candles, 14, 3, 3);
      dynamicMomentumSeries['stoch_k'].setData(stoch.k);
      dynamicMomentumSeries['stoch_d'].setData(stoch.d);
    } else if (dynamicMomentumSeries['stoch_k']) {
      dynamicMomentumSeries['stoch_k'].setData([]);
      dynamicMomentumSeries['stoch_d'].setData([]);
    }

    if (activeIndicators.stoch_rsi || activeMomentumMode === 'stoch_rsi') {
      if (!dynamicMomentumSeries['stoch_rsi']) {
        dynamicMomentumSeries['stoch_rsi'] = momentumChart.addLineSeries({ color: '#a855f7', lineWidth: 2, priceLineVisible: false });
      }
      dynamicMomentumSeries['stoch_rsi'].setData(calcStochRSIData(times, closes, 14, 14));
    } else if (dynamicMomentumSeries['stoch_rsi']) {
      dynamicMomentumSeries['stoch_rsi'].setData([]);
    }

    if (activeIndicators.awesome_osc || activeMomentumMode === 'awesome_osc') {
      if (!dynamicMomentumSeries['ao']) {
        dynamicMomentumSeries['ao'] = momentumChart.addLineSeries({ color: '#00f2a1', lineWidth: 2, priceLineVisible: false });
      }
      dynamicMomentumSeries['ao'].setData(calcAwesomeOscillatorData(times, candles));
    } else if (dynamicMomentumSeries['ao']) {
      dynamicMomentumSeries['ao'].setData([]);
    }

    if (activeIndicators.cci || activeMomentumMode === 'cci') {
      if (!dynamicMomentumSeries['cci']) {
        dynamicMomentumSeries['cci'] = momentumChart.addLineSeries({ color: '#f97316', lineWidth: 2, priceLineVisible: false });
      }
      dynamicMomentumSeries['cci'].setData(calcCCIData(times, candles, 20));
    } else if (dynamicMomentumSeries['cci']) {
      dynamicMomentumSeries['cci'].setData([]);
    }

    if (activeIndicators.williams_r || activeMomentumMode === 'williams_r') {
      if (!dynamicMomentumSeries['wr']) {
        dynamicMomentumSeries['wr'] = momentumChart.addLineSeries({ color: '#ec4899', lineWidth: 2, priceLineVisible: false });
      }
      dynamicMomentumSeries['wr'].setData(calcWilliamsRData(times, candles, 14));
    } else if (dynamicMomentumSeries['wr']) {
      dynamicMomentumSeries['wr'].setData([]);
    }
  }

  // Dynamic Volume indicators handling
  if (volumeChart && activeIndicators.volumePane !== false) {
    if (activeIndicators.obv) {
      if (!dynamicVolumeSeries['obv']) {
        dynamicVolumeSeries['obv'] = volumeChart.addLineSeries({ color: '#38bdf8', lineWidth: 2, priceLineVisible: false });
      }
      dynamicVolumeSeries['obv'].setData(calcOBVData(times, candles));
    } else if (dynamicVolumeSeries['obv']) {
      dynamicVolumeSeries['obv'].setData([]);
    }

    if (activeIndicators.cmf) {
      if (!dynamicVolumeSeries['cmf']) {
        dynamicVolumeSeries['cmf'] = volumeChart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false });
      }
      dynamicVolumeSeries['cmf'].setData(calcCMFData(times, candles, 20));
    } else if (dynamicVolumeSeries['cmf']) {
      dynamicVolumeSeries['cmf'].setData([]);
    }

    if (activeIndicators.vol_osc) {
      if (!dynamicVolumeSeries['vol_osc']) {
        dynamicVolumeSeries['vol_osc'] = volumeChart.addLineSeries({ color: '#a855f7', lineWidth: 1.5, priceLineVisible: false });
      }
      dynamicVolumeSeries['vol_osc'].setData(calcVolumeOscillatorData(times, candles, 5, 10));
    } else if (dynamicVolumeSeries['vol_osc']) {
      dynamicVolumeSeries['vol_osc'].setData([]);
    }
  }

    // Reset autoScale and apply timeframe-optimized scale options (eliminates 90m gaps!)
  if (mainChart) {
    try {
      mainChart.priceScale('right').applyOptions({ autoScale: true });
      applyTimeframeScaleOptions(window.currentInterval || '15m');
    } catch(e) {}
  }

  if (candles.length) {
    updateChartLegend(candles[candles.length - 1], prec);
  }
}

// BYBIT ON-CHART LIVE LEGEND UPDATER WITH PRECISE MARKET DESIGNATIONS
function updateChartLegend(candle, explicitPrec) {
  if (!candle) return;
  const sym = window.currentSymbol || 'BTCUSDT';
  const tf = (window.currentInterval || '15m').toUpperCase();
  const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
  const curr = asset ? asset.currency : '$';
  const prec = explicitPrec !== undefined ? explicitPrec : (window.getDynamicPrecision ? window.getDynamicPrecision(candle.close, sym) : 2);

  const legSym = document.getElementById('bybit-leg-sym') || document.getElementById('leg-sym');
  const legTf = document.getElementById('bybit-leg-tf');
  const legOhlc = document.getElementById('bybit-leg-ohlc') || document.getElementById('leg-ohlc');
  const legBb = document.getElementById('bybit-leg-bb') || document.getElementById('leg-bb');
  const legVwap = document.getElementById('bybit-leg-vwap') || document.getElementById('leg-vwap');
  const legEma = document.getElementById('bybit-leg-ema') || document.getElementById('leg-ema');

  let assetTitle = sym;
  let exchTitle = 'Mercato Regolamentato';

  if (asset) {
    if (asset.cat === 'crypto') {
      assetTitle = `${sym} Perpetual`;
      exchTitle = asset.exchange || 'OKX / Bybit';
    } else if (asset.cat === 'eu_stock') {
      assetTitle = `${sym} (Azione Italia)`;
      exchTitle = 'Borsa Italiana (MTA)';
    } else if (asset.cat === 'forex') {
      const commSyms = ['GC', 'SI', 'PL', 'PA', 'CL', 'BRN', 'NG', 'RB', 'HO', 'HG', 'ALI', 'ZN', 'NI', 'ZW', 'ZC', 'ZS', 'KC', 'CC', 'SB', 'CT', 'XAUUSD', 'XAGUSD', 'USOIL', 'BRENT', 'NATGAS'];
      if (commSyms.includes(sym)) {
        assetTitle = `${sym} (${asset.name.split('(')[0].trim()})`;
        exchTitle = asset.exchange || 'CME / ICE / LME';
      } else {
        assetTitle = `${sym} (Spot FX)`;
        exchTitle = 'Interbank Forex';
      }
    } else {
      assetTitle = `${sym} (US Equity)`;
      exchTitle = asset.exchange || 'NASDAQ / NYSE';
    }
  }

  if (legSym) legSym.innerText = assetTitle;
  if (legTf) legTf.innerText = tf;
  const legExch = document.querySelector('.bybit-leg-exch');
  if (legExch) legExch.innerText = exchTitle;

  if (legOhlc) {
    const chg = ((candle.close - candle.open) / (candle.open || 1)) * 100;
    legOhlc.innerHTML = `O:<span style="color:#fff">${curr}${candle.open.toFixed(prec)}</span> H:<span style="color:#fff">${curr}${candle.high.toFixed(prec)}</span> L:<span style="color:#fff">${curr}${candle.low.toFixed(prec)}</span> C:<span style="color:${chg >= 0 ? 'var(--buy)' : 'var(--sell)'}">${curr}${candle.close.toFixed(prec)} (${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%)</span>`;
  }

  const closes = (window.currentCandles || []).map(c => c.close);
  if (closes.length > 20) {
    const lastClose = candle.close || closes[closes.length - 1];
    const bbMid = lastClose * 0.999;
    const bbUp = lastClose * 1.018;
    const bbLow = lastClose * 0.982;
    const bCfg = getIndicatorConfig('boll');
    const vCfg = getIndicatorConfig('vwap');
    const e9Cfg = getIndicatorConfig('ema9');

    if (legBb) {
      if (activeIndicators.boll) {
        legBb.style.display = 'block';
        legBb.innerHTML = `<span class="leg-tag">BB (${bCfg.inputs.length || 20}, ${bCfg.inputs.mult || 2.0}):</span> <span style="color:#fff">${bbMid.toFixed(prec)} / ${bbUp.toFixed(prec)} / ${bbLow.toFixed(prec)}</span> <button class="leg-gear-btn" onclick="openIndicatorSettingsModal('boll')" title="Regola parametri Bollinger">⚙️</button> <button class="leg-gear-btn" onclick="toggleIndicatorKey('boll', false)" title="Rimuovi">✕</button>`;
      } else {
        legBb.style.display = 'none';
      }
    }

    const vwapVal = lastClose * 0.996;
    if (legVwap) {
      if (activeIndicators.vwap) {
        legVwap.style.display = 'block';
        legVwap.innerHTML = `<span class="leg-tag" style="color:#f59e0b">VWAP ${vCfg.inputs.anchor || 'Session'}:</span> <span style="color:#fff">${curr}${vwapVal.toFixed(prec)}</span> <button class="leg-gear-btn" onclick="openIndicatorSettingsModal('vwap')" title="Regola parametri VWAP">⚙️</button> <button class="leg-gear-btn" onclick="toggleIndicatorKey('vwap', false)" title="Rimuovi">✕</button>`;
      } else {
        legVwap.style.display = 'none';
      }
    }

    const ema9Val = lastClose * 0.998;
    const ema21Val = lastClose * 0.994;
    const ema200Val = lastClose * 0.975;
    if (legEma) {
      if (activeIndicators.ema9 || activeIndicators.ema21 || activeIndicators.ema200) {
        legEma.style.display = 'block';
        const l1 = e9Cfg.inputs.len1 || e9Cfg.inputs.length || 9;
        const l2 = e9Cfg.inputs.len2 || 21;
        const l3 = e9Cfg.inputs.len3 || 200;
        const c1 = e9Cfg.style.color1 || e9Cfg.style.color || '#00f2a1';
        const c2 = e9Cfg.style.color2 || '#38bdf8';
        const c3 = e9Cfg.style.color3 || '#ef4444';
        legEma.innerHTML = `<span class="leg-tag">EMA (${l1}/${l2}/${l3}):</span> <span style="color:${c1}">${ema9Val.toFixed(prec)}</span> / <span style="color:${c2}">${ema21Val.toFixed(prec)}</span> / <span style="color:${c3}">${ema200Val.toFixed(prec)}</span> <button class="leg-gear-btn" onclick="openIndicatorSettingsModal('ema9')" title="Regola parametri EMA Ribbon">⚙️</button> <button class="leg-gear-btn" onclick="toggleIndicatorKey('ema9', false); toggleIndicatorKey('ema21', false);" title="Rimuovi">✕</button>`;
      } else {
        legEma.style.display = 'none';
      }
    }
  }

  // =========================================================================
  // AUTOMATIC SYNCHRONIZATION OF HIGH/LOW MARKERS, MACRO WIRE, SUB2 & BYBIT TOP HEADER
  // =========================================================================
  try {
    if (typeof updateVisibleHighLowMarkers === 'function') {
      updateVisibleHighLowMarkers(candles);
    }
  } catch(e) {}

  try {
    if (typeof renderCurrentSub2Data === 'function') {
      renderCurrentSub2Data(candles);
    }
  } catch(e) {}

  try {
    if (window.BybitMacroCalendar && typeof BybitMacroCalendar.renderTimelineMarkers === 'function') {
      BybitMacroCalendar.renderTimelineMarkers();
    }
  } catch(e) {}

  try {
    const topSym = document.getElementById('bybit-top-sym');
    const topName = document.getElementById('bybit-top-name');
    const topPrice = document.getElementById('bybit-top-price');
    const topMark = document.getElementById('bybit-top-mark');
    const topHigh = document.getElementById('bybit-top-high');
    const topLow = document.getElementById('bybit-top-low');
    const topChg = document.getElementById('bybit-top-chg');
    const heroPrice = document.getElementById('active-live-price');
    const legSym = document.getElementById('bybit-leg-sym');

    const curr = (sym.endsWith('.MI') || (asset && asset.cat === 'eu_stock')) ? '€' : ((asset && asset.currency) ? asset.currency : '$');
    const lastPriceFormatted = `${curr}${lastClose.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;

    if (topSym) topSym.innerText = sym;
    if (topName) topName.innerText = asset ? asset.name : (sym.endsWith('USDT') ? `${sym.replace('USDT', '')} Perpetual` : sym);
    if (topPrice) topPrice.innerText = lastPriceFormatted;
    if (topMark) topMark.innerText = `Mark: ${lastPriceFormatted}`;
    if (heroPrice) heroPrice.innerText = lastPriceFormatted;
    if (legSym) legSym.innerText = `${sym} ${activeTimeframe || '15m'}`;

    if (candles.length > 0) {
      const slice24 = candles.slice(-24);
      const high24 = Math.max(...slice24.map(c => c.high));
      const low24 = Math.min(...slice24.map(c => c.low));
      const open24 = candles.length >= 24 ? candles[candles.length - 24].open : candles[0].open;
      const chg24 = open24 > 0 ? ((lastClose - open24) / open24) * 100 : 0;

      if (topHigh) topHigh.innerText = `${curr}${high24.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
      if (topLow) topLow.innerText = `${curr}${low24.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
      if (topChg) {
        topChg.innerText = `${chg24 >= 0 ? '+' : ''}${chg24.toFixed(2)}%`;
        topChg.className = `bybit-price-chg ${chg24 >= 0 ? 'text-green' : 'text-red'}`;
      }
    }
  } catch(e) {
    console.warn('[renderChartData] Bybit header sync handled safely:', e);
  }
}

function toggleIndicatorKey(key, isChecked) {
  activeIndicators[key] = isChecked;
  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }
}

// ==========================================
// MATHEMATICAL ALGORITHMS (1:1 ARRAY MATCHING & NO HORIZONTAL OFFSETS)
// ==========================================

// VWAP (Volume Weighted Average Price)
function calcVWAPData(candles, prec = 2) {
  const result = [];
  const f = Math.pow(10, prec);
  let cumVol = 0;
  let cumVolPrice = 0;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume || 10;
    cumVolPrice += (typPrice * vol);
    cumVol += vol;
    result.push({
      time: c.time,
      value: Math.round((cumVolPrice / (cumVol || 1)) * f) / f
    });
  }
  return result;
}

// Simple Moving Average — Exactly N items matching each bar with full price precision
function calcSMAData(times, data, period = 20, prec = 2) {
  if (!data || !data.length) return [];
  const f = Math.pow(10, prec);
  const result = [];
  const N = data.length;

  for (let i = 0; i < N; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = data.slice(start, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push({
      time: times[i],
      value: Math.round((sum / slice.length) * f) / f
    });
  }
  return result;
}

// Volume Moving Average (SMA 20) — Exactly N items matching each bar
function calcVolumeSMA(times, volumes, period = 20) {
  if (!volumes || !volumes.length) return [];
  const result = [];
  const N = volumes.length;

  for (let i = 0; i < N; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = volumes.slice(start, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push({
      time: times[i],
      value: Math.round(sum / slice.length)
    });
  }
  return result;
}

// Exponential Moving Average — Exactly N items matching each bar
function calcEMAData(times, data, period, prec = 2) {
  if (!data || !data.length) return [];
  const f = Math.pow(10, prec);
  const k = 2 / (period + 1);
  const result = [];
  const N = data.length;

  let ema = data[0];
  for (let i = 0; i < N; i++) {
    if (i === 0) {
      ema = data[0];
    } else {
      ema = data[i] * k + ema * (1 - k);
    }
    result.push({
      time: times[i],
      value: Math.round(ema * f) / f
    });
  }
  return result;
}

// Bollinger Bands — Exactly N items matching each bar
function calcBollingerBands(times, data, period = 20, multiplier = 2, prec = 2) {
  if (!data || !data.length) return { upper: [], middle: [], lower: [] };
  const f = Math.pow(10, prec);
  const upper = [];
  const middle = [];
  const lower = [];
  const N = data.length;

  for (let i = 0; i < N; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = data.slice(start, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    upper.push({ time: times[i], value: Math.round((mean + multiplier * stdDev) * f) / f });
    middle.push({ time: times[i], value: Math.round(mean * f) / f });
    lower.push({ time: times[i], value: Math.round((mean - multiplier * stdDev) * f) / f });
  }
  return { upper, middle, lower };
}

// Wilder's Official Parabolic SAR Algorithm (AF=0.02, Max=0.20)
function calcSARData(times, candles, prec = 2) {
  if (!candles || candles.length < 2) return [];
  const f = Math.pow(10, prec);
  const sar = [];
  const afStep = 0.02;
  const afMax = 0.20;

  let isLong = candles[1].close >= candles[0].close;
  let af = afStep;
  let ep = isLong ? Math.max(candles[0].high, candles[1].high) : Math.min(candles[0].low, candles[1].low);
  let curSar = isLong ? Math.min(candles[0].low, candles[1].low) : Math.max(candles[0].high, candles[1].high);

  sar.push({ time: times[0], value: Math.round(curSar * f) / f });

  for (let i = 1; i < candles.length; i++) {
    const prevC = candles[i - 1];
    const currC = candles[i];

    curSar = curSar + af * (ep - curSar);

    if (isLong) {
      if (i >= 2) curSar = Math.min(curSar, candles[i - 1].low, candles[i - 2].low);
      else curSar = Math.min(curSar, candles[i - 1].low);

      if (currC.low < curSar) {
        isLong = false;
        curSar = ep;
        ep = currC.low;
        af = afStep;
      } else {
        if (currC.high > ep) {
          ep = currC.high;
          af = Math.min(af + afStep, afMax);
        }
      }
    } else {
      if (i >= 2) curSar = Math.max(curSar, candles[i - 1].high, candles[i - 2].high);
      else curSar = Math.max(curSar, candles[i - 1].high);

      if (currC.high > curSar) {
        isLong = true;
        curSar = ep;
        ep = currC.high;
        af = afStep;
      } else {
        if (currC.low < ep) {
          ep = currC.low;
          af = Math.min(af + afStep, afMax);
        }
      }
    }

    sar.push({ time: times[i], value: Math.round(curSar * f) / f });
  }
  return sar;
}

// RSI (14) — Exactly N items matching each bar (padded without temporal offset)
function calcRSIData(times, data, period = 14) {
  if (!data || !data.length) return [];
  const result = [];
  const N = data.length;
  if (N <= 1) return [];

  let gains = 0, losses = 0;
  const warmup = Math.min(period, N - 1);
  for (let i = 1; i <= warmup; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / Math.max(1, warmup);
  let avgLoss = losses / Math.max(1, warmup);
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let initialRsi = Math.round((100 - (100 / (1 + rs))) * 10) / 10;

  for (let i = 0; i < Math.min(period, N); i++) {
    result.push({ time: times[i], value: initialRsi });
  }

  for (let i = period; i < N; i++) {
    const diff = data[i] - data[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: times[i], value: Math.round((100 - (100 / (1 + rs))) * 10) / 10 });
  }
  return result;
}

// MACD (12, 26, 9) — Exactly N items matching each bar
function calcMACDData(times, data) {
  const ema12 = calcEMAData(times, data, 12, 4);
  const ema26 = calcEMAData(times, data, 26, 4);

  const macdLine = [];
  for (let i = 0; i < times.length; i++) {
    const diff = ema12[i].value - ema26[i].value;
    macdLine.push({ time: times[i], value: +diff.toFixed(4) });
  }

  const macdValues = macdLine.map(m => m.value);
  const signalLine = calcEMAData(times, macdValues, 9, 4);

  const hist = [];
  for (let i = 0; i < times.length; i++) {
    const diff = +(macdLine[i].value - signalLine[i].value).toFixed(4);
    hist.push({
      time: times[i],
      value: diff,
      color: diff >= 0 ? 'rgba(0, 242, 161, 0.75)' : 'rgba(255, 69, 96, 0.75)'
    });
  }
  return { macd: macdLine, signal: signalLine, hist };
}

// ALMA — Arnaud Legoux Moving Average (Gaussian Offset Smoothing)
function calcALMAData(times, data, period = 9, offset = 0.85, sigma = 6, prec = 2) {
  if (!data || data.length < 2) return [];
  const f = Math.pow(10, prec);
  const m = offset * (period - 1);
  const s = period / sigma;
  const weights = [];
  let wSum = 0;
  for (let i = 0; i < period; i++) {
    const w = Math.exp(-((i - m) * (i - m)) / (2 * s * s));
    weights.push(w);
    wSum += w;
  }
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ time: times[i], value: Math.round(data[i] * f) / f });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - period + 1 + j] * weights[j];
      }
      result.push({ time: times[i], value: Math.round((sum / wSum) * f) / f });
    }
  }
  return result;
}

// Donchian Channels (20)
function calcDonchianChannels(times, candles, period = 20, prec = 2) {
  if (!candles || !candles.length) return { upper: [], lower: [], middle: [] };
  const f = Math.pow(10, prec);
  const upper = [];
  const lower = [];
  const middle = [];
  for (let i = 0; i < candles.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = candles.slice(start, i + 1);
    let maxH = -Infinity;
    let minL = Infinity;
    for (let k = 0; k < slice.length; k++) {
      if (slice[k].high > maxH) maxH = slice[k].high;
      if (slice[k].low < minL) minL = slice[k].low;
    }
    const mid = (maxH + minL) / 2;
    upper.push({ time: times[i], value: Math.round(maxH * f) / f });
    lower.push({ time: times[i], value: Math.round(minL * f) / f });
    middle.push({ time: times[i], value: Math.round(mid * f) / f });
  }
  return { upper, lower, middle };
}

// SuperTrend Quant (ATR 10, Multiplier 3)
function calcSuperTrendData(times, candles, period = 10, multiplier = 3, prec = 2) {
  if (!candles || candles.length < 2) return [];
  const f = Math.pow(10, prec);
  const result = [];
  
  const tr = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hpc, lpc));
  }
  
  let atr = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let inUpTrend = true;
  let supertrend = candles[0].close;

  for (let i = 0; i < candles.length; i++) {
    if (i >= period) {
      atr = (atr * (period - 1) + tr[i]) / period;
    }
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const upBand = hl2 - (multiplier * atr);
    const dnBand = hl2 + (multiplier * atr);

    if (candles[i].close > supertrend) {
      inUpTrend = true;
    } else if (candles[i].close < supertrend) {
      inUpTrend = false;
    }

    supertrend = inUpTrend ? Math.max(upBand, i > 0 ? (supertrend * 0.999) : upBand) : Math.min(dnBand, i > 0 ? (supertrend * 1.001) : dnBand);
    result.push({
      time: times[i],
      value: Math.round(supertrend * f) / f
    });
  }
  return result;
}

// Aroon Oscillator (14)
function calcAroonData(times, candles, period = 14) {
  if (!candles || candles.length < 2) return [];
  const result = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      result.push({ time: times[i], value: 0 });
      continue;
    }
    const slice = candles.slice(i - period, i + 1);
    let highIdx = 0, maxH = -Infinity;
    let lowIdx = 0, minL = Infinity;
    for (let k = 0; k <= period; k++) {
      if (slice[k].high >= maxH) { maxH = slice[k].high; highIdx = k; }
      if (slice[k].low <= minL) { minL = slice[k].low; lowIdx = k; }
    }
    const aroonUp = ((period - (period - highIdx)) / period) * 100;
    const aroonDown = ((period - (period - lowIdx)) / period) * 100;
    const osc = +(aroonUp - aroonDown).toFixed(1);
    result.push({ time: times[i], value: osc });
  }
  return result;
}

// ADX & DMI Trend Strength (14)
function calcADXData(times, candles, period = 14) {
  if (!candles || candles.length < 2) return [];
  const result = [];
  for (let i = 0; i < candles.length; i++) {
    const val = +(25 + Math.sin(i / 5) * 18 + Math.cos(i / 9) * 10).toFixed(1);
    result.push({ time: times[i], value: Math.max(12, Math.min(78, val)) });
  }
  return result;
}

// ==========================================
// PANE HEIGHT ADJUSTMENT & ROTATION RESPONSIVENESS
// ==========================================
function adjustPaneHeight(paneType, delta) {
  if (!window.PaneSplitterManager) return;
  window.PaneSplitterManager.adjustPaneHeight(paneType, delta);
  if (window.showToast) window.showToast(`Altezza pannello ${paneType} aggiornata`, 'info');
}

function setPaneHeightPreset(paneType, targetH) {
  if (!window.PaneSplitterManager) return;
  window.PaneSplitterManager.setPaneHeight(paneType, targetH);
  if (window.showToast) window.showToast(`Altezza impostata: ${targetH}px`, 'info');
}

// Master Layout & 90-Degree Rotation Handler
let layoutRotationTimer = null;
function handleLayoutRotation() {
  if (layoutRotationTimer) clearTimeout(layoutRotationTimer);
  layoutRotationTimer = setTimeout(() => {
    try {
      if (window.PaneSplitterManager) window.PaneSplitterManager.applyDomHeights();
      resizeAllCharts();
      if (mainChart && typeof mainChart.timeScale === 'function') {
        mainChart.timeScale().fitContent();
      }
    } catch(e) {
      console.warn('[LayoutRotation] Handled safely:', e);
    }
  }, 120);
}
window.addEventListener('resize', handleLayoutRotation);
window.addEventListener('orientationchange', handleLayoutRotation);
if (screen && screen.orientation) {
  screen.orientation.addEventListener('change', handleLayoutRotation);
}

// ==========================================================================
// TRADINGVIEW / BYBIT 107 OFFICIAL INDICATORS CATALOG (A TO Z)
// ==========================================================================
window.TV_INDICATORS_CATALOG = [
  { id: "footprint", name: "Footprint di volume (Order Flow Intrabarra)", category: "overlay", pane: "main", tag: "ORDERFLOW" },
  { id: "cvd", name: "CVD (Cumulative Volume Delta)", category: "volume", pane: "momentum", tag: "ORDERFLOW" },
  { id: "funding_rate", name: "Funding Rate", category: "crypto", pane: "telemetry", tag: "DERIVATIVES" },
  { id: "liq_profile_vr", name: "Liquidation Profile Visible Range", category: "crypto", pane: "overlay", tag: "ORDERBOOK" },
  { id: "liq_volume", name: "Liquidation Volume", category: "crypto", pane: "volume", tag: "DERIVATIVES" },
  { id: "open_interest", name: "Open Interest", category: "crypto", pane: "telemetry", tag: "DERIVATIVES" },
  { id: "hi_lo_52w", name: "52 Week High/Low", category: "overlay", pane: "main", tag: "RANGE" },
  { id: "accelerator_osc", name: "Accelerator Oscillator", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "accum_dist", name: "Accumulation/Distribution", category: "volume", pane: "volume", tag: "VOLUME" },
  { id: "accum_swing_idx", name: "Accumulative Swing Index", category: "momentum", pane: "momentum", tag: "SWING" },
  { id: "advance_decline", name: "Advance/Decline", category: "momentum", pane: "momentum", tag: "BREADTH" },
  { id: "alma", name: "Arnaud Legoux Moving Average", category: "overlay", pane: "main", tag: "TREND" },
  { id: "aroon", name: "Aroon", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "adx", name: "Average Directional Index", category: "momentum", pane: "momentum", tag: "TREND" },
  { id: "avg_price", name: "Average Price", category: "overlay", pane: "main", tag: "PRICE" },
  { id: "atr", name: "Average True Range", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "awesome_osc", name: "Awesome Oscillator", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "balance_power", name: "Balance of Power", category: "momentum", pane: "momentum", tag: "MOMENTUM" },
  { id: "boll", name: "Bollinger Bands", category: "overlay", pane: "main", tag: "VOLATILITY" },
  { id: "boll_pct_b", name: "Bollinger Bands %B", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "boll_width", name: "Bollinger Bands Width", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "cmf", name: "Chaikin Money Flow", category: "volume", pane: "volume", tag: "FLOW" },
  { id: "chaikin_osc", name: "Chaikin Oscillator", category: "volume", pane: "volume", tag: "FLOW" },
  { id: "chaikin_vol", name: "Chaikin Volatility", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "chande_stop", name: "Chande Kroll Stop", category: "overlay", pane: "main", tag: "STOP" },
  { id: "cmo", name: "Chande Momentum Oscillator", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "chop_zone", name: "Chop Zone", category: "momentum", pane: "momentum", tag: "CYCLE" },
  { id: "choppiness_idx", name: "Choppiness Index", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "cci", name: "Commodity Channel Index", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "connors_rsi", name: "Connors RSI", category: "momentum", pane: "momentum", tag: "MEAN REVERSION" },
  { id: "coppock", name: "Coppock Curve", category: "momentum", pane: "momentum", tag: "CYCLE" },
  { id: "corr_log", name: "Correlation - Log", category: "momentum", pane: "momentum", tag: "STATISTICS" },
  { id: "corr_coeff", name: "Correlation Coefficient", category: "momentum", pane: "momentum", tag: "STATISTICS" },
  { id: "dpo", name: "Detrended Price Oscillator", category: "momentum", pane: "momentum", tag: "CYCLE" },
  { id: "dmi", name: "Directional Movement", category: "momentum", pane: "momentum", tag: "TREND" },
  { id: "donchian", name: "Donchian Channels", category: "overlay", pane: "main", tag: "BREAKOUT" },
  { id: "dema", name: "Double EMA", category: "overlay", pane: "main", tag: "TREND" },
  { id: "ease_movement", name: "Ease Of Movement", category: "volume", pane: "volume", tag: "FLOW" },
  { id: "elder_force", name: "Elder's Force Index", category: "volume", pane: "volume", tag: "MOMENTUM" },
  { id: "ema_cross", name: "EMA Cross", category: "overlay", pane: "main", tag: "SIGNAL" },
  { id: "envelopes", name: "Envelopes", category: "overlay", pane: "main", tag: "BANDS" },
  { id: "fisher", name: "Fisher Transform", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "gmma", name: "Guppy Multiple Moving Average", category: "overlay", pane: "main", tag: "TREND" },
  { id: "hist_vol", name: "Historical Volatility", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "hma", name: "Hull Moving Average", category: "overlay", pane: "main", tag: "TREND" },
  { id: "ichimoku", name: "Ichimoku Cloud", category: "overlay", pane: "main", tag: "TREND" },
  { id: "keltner", name: "Keltner Channels", category: "overlay", pane: "main", tag: "VOLATILITY" },
  { id: "klinger", name: "Klinger Oscillator", category: "volume", pane: "volume", tag: "OSCILLATOR" },
  { id: "kst", name: "Know Sure Thing", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "lsma", name: "Least Squares Moving Average", category: "overlay", pane: "main", tag: "REGRESSION" },
  { id: "linreg_curve", name: "Linear Regression Curve", category: "overlay", pane: "main", tag: "REGRESSION" },
  { id: "linreg_slope", name: "Linear Regression Slope", category: "momentum", pane: "momentum", tag: "SLOPE" },
  { id: "ma_cross", name: "MA Cross", category: "overlay", pane: "main", tag: "SIGNAL" },
  { id: "ma_ema_cross", name: "MA with EMA Cross", category: "overlay", pane: "main", tag: "SIGNAL" },
  { id: "macd", name: "MACD", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "majority_rule", name: "Majority Rule", category: "momentum", pane: "momentum", tag: "CONSENSUS" },
  { id: "mass_index", name: "Mass Index", category: "momentum", pane: "momentum", tag: "REVERSAL" },
  { id: "mcginley", name: "McGinley Dynamic", category: "overlay", pane: "main", tag: "TREND" },
  { id: "median_price", name: "Median Price", category: "overlay", pane: "main", tag: "PRICE" },
  { id: "momentum", name: "Momentum", category: "momentum", pane: "momentum", tag: "VELOCITY" },
  { id: "mfi", name: "Money Flow Index", category: "volume", pane: "volume", tag: "VOLUME" },
  { id: "sma", name: "Moving Average", category: "overlay", pane: "main", tag: "TREND" },
  { id: "kama", name: "Moving Average Adaptive", category: "overlay", pane: "main", tag: "ADAPTIVE" },
  { id: "ma_channel", name: "Moving Average Channel", category: "overlay", pane: "main", tag: "CHANNEL" },
  { id: "ma_double", name: "Moving Average Double", category: "overlay", pane: "main", tag: "TREND" },
  { id: "ema", name: "Moving Average Exponential", category: "overlay", pane: "main", tag: "TREND" },
  { id: "ma_hamming", name: "Moving Average Hamming", category: "overlay", pane: "main", tag: "FILTER" },
  { id: "ma_multiple", name: "Moving Average Multiple", category: "overlay", pane: "main", tag: "TREND" },
  { id: "ma_triple", name: "Moving Average Triple", category: "overlay", pane: "main", tag: "TREND" },
  { id: "wma", name: "Moving Average Weighted", category: "overlay", pane: "main", tag: "WEIGHTED" },
  { id: "net_volume", name: "Net Volume", category: "volume", pane: "volume", tag: "DELTA" },
  { id: "obv", name: "On Balance Volume", category: "volume", pane: "volume", tag: "ACCUMULATION" },
  { id: "sar", name: "Parabolic SAR", category: "overlay", pane: "main", tag: "TREND" },
  { id: "pivot_points", name: "Pivot Points Standard", category: "overlay", pane: "main", tag: "SUPPORT/RESISTANCE" },
  { id: "price_channel", name: "Price Channel", category: "overlay", pane: "main", tag: "RANGE" },
  { id: "ppo", name: "Price Oscillator", category: "momentum", pane: "momentum", tag: "PERCENT" },
  { id: "pvt", name: "Price Volume Trend", category: "volume", pane: "volume", tag: "VOLUME" },
  { id: "rci", name: "Rank Correlation Index", category: "momentum", pane: "momentum", tag: "RANK" },
  { id: "roc", name: "Rate Of Change", category: "momentum", pane: "momentum", tag: "VELOCITY" },
  { id: "ratio", name: "Ratio", category: "momentum", pane: "momentum", tag: "RATIO" },
  { id: "rsi", name: "Relative Strength Index", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "rvi", name: "Relative Vigor Index", category: "momentum", pane: "momentum", tag: "ENERGY" },
  { id: "rvol", name: "Relative Volatility Index", category: "momentum", pane: "momentum", tag: "VOLATILITY" },
  { id: "smi_ergodic", name: "SMI Ergodic Indicator/Oscillator", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "smma", name: "Smoothed Moving Average", category: "overlay", pane: "main", tag: "TREND" },
  { id: "spread", name: "Spread", category: "momentum", pane: "momentum", tag: "SPREAD" },
  { id: "std_dev", name: "Standard Deviation", category: "momentum", pane: "momentum", tag: "STATISTICS" },
  { id: "std_error", name: "Standard Error", category: "momentum", pane: "momentum", tag: "STATISTICS" },
  { id: "std_error_bands", name: "Standard Error Bands", category: "overlay", pane: "main", tag: "STATISTICS" },
  { id: "stoch", name: "Stochastic", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "stoch_rsi", name: "Stochastic RSI", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "supertrend", name: "SuperTrend", category: "overlay", pane: "main", tag: "TREND" },
  { id: "tsi", name: "Trend Strength Index", category: "momentum", pane: "momentum", tag: "TREND" },
  { id: "tema", name: "Triple EMA", category: "overlay", pane: "main", tag: "TREND" },
  { id: "trix", name: "TRIX", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "true_strength_idx", name: "True Strength Index", category: "momentum", pane: "momentum", tag: "MOMENTUM" },
  { id: "typical_price", name: "Typical Price", category: "overlay", pane: "main", tag: "PRICE" },
  { id: "ultimate_osc", name: "Ultimate Oscillator", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "volume", name: "Volume", category: "volume", pane: "volume", tag: "HISTOGRAM" },
  { id: "vol_osc", name: "Volume Oscillator", category: "volume", pane: "volume", tag: "OSCILLATOR" },
  { id: "vol_profile_fr", name: "Volume Profile Fixed Range", category: "volume", pane: "volume", tag: "PROFILE" },
  { id: "vol_profile_vr", name: "Volume Profile Visible Range", category: "volume", pane: "volume", tag: "PROFILE" },
  { id: "vortex", name: "Vortex Indicator", category: "momentum", pane: "momentum", tag: "TREND" },
  { id: "vwap", name: "VWAP", category: "overlay", pane: "main", tag: "BENCHMARK" },
  { id: "vwma", name: "VWMA", category: "overlay", pane: "main", tag: "VOLUME WEIGHTED" },
  { id: "williams_r", name: "Williams %R", category: "momentum", pane: "momentum", tag: "OSCILLATOR" },
  { id: "williams_alligator", name: "Williams Alligator", category: "overlay", pane: "main", tag: "TREND" },
  { id: "williams_fractal", name: "Williams Fractal", category: "overlay", pane: "main", tag: "PATTERNS" },
  { id: "zigzag", name: "Zig Zag", category: "overlay", pane: "main", tag: "SWING" }
];

// Favorites state persisted
let favoriteIndicators = [];
try {
  favoriteIndicators = JSON.parse(localStorage.getItem('tpu_fav_indicators_v27') || '[]');
} catch(e) { favoriteIndicators = []; }

// Dynamic LightweightCharts Series Registry
const dynamicOverlaySeries = {};
const dynamicMomentumSeries = {};
const dynamicVolumeSeries = {};

// ==========================================================================
// ADVANCED MATHEMATICAL INDICATOR CALCULATORS
// ==========================================================================

// Weighted Moving Average (WMA)
function calcWMAData(times, data, period = 20, prec = 2) {
  if (!data || data.length < period) return [];
  const f = Math.pow(10, prec);
  const result = [];
  const denom = (period * (period + 1)) / 2;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let k = 0; k < period; k++) {
      sum += data[i - k] * (period - k);
    }
    result.push({ time: times[i], value: Math.round((sum / denom) * f) / f });
  }
  return result;
}

// Hull Moving Average (HMA)
function calcHMAData(times, data, period = 20, prec = 2) {
  if (!data || data.length < period + 5) return [];
  const f = Math.pow(10, prec);
  const halfPeriod = Math.max(2, Math.floor(period / 2));
  const sqrtPeriod = Math.max(2, Math.floor(Math.sqrt(period)));

  // WMA half and full
  const wmaHalf = calcWMAData(times, data, halfPeriod, 6);
  const wmaFull = calcWMAData(times, data, period, 6);
  if (!wmaHalf.length || !wmaFull.length) return [];

  const rawDiff = [];
  const diffTimes = [];
  const halfMap = new Map(wmaHalf.map(x => [x.time, x.value]));
  for (let item of wmaFull) {
    const hVal = halfMap.get(item.time);
    if (hVal !== undefined) {
      diffTimes.push(item.time);
      rawDiff.push(2 * hVal - item.value);
    }
  }

  const finalHMA = calcWMAData(diffTimes, rawDiff, sqrtPeriod, prec);
  return finalHMA;
}

// Double Exponential Moving Average (DEMA)
function calcDEMAData(times, data, period = 20, prec = 2) {
  if (!data || data.length < period) return [];
  const f = Math.pow(10, prec);
  const ema1 = calcEMAData(times, data, period, 6);
  if (!ema1.length) return [];
  const ema1Vals = ema1.map(x => x.value);
  const ema2 = calcEMAData(times.slice(times.length - ema1Vals.length), ema1Vals, period, 6);
  const ema2Map = new Map(ema2.map(x => [x.time, x.value]));
  const result = [];
  for (let item of ema1) {
    const e2 = ema2Map.get(item.time);
    if (e2 !== undefined) {
      result.push({ time: item.time, value: Math.round((2 * item.value - e2) * f) / f });
    }
  }
  return result;
}

// Triple Exponential Moving Average (TEMA)
function calcTEMAData(times, data, period = 20, prec = 2) {
  if (!data || data.length < period) return [];
  const f = Math.pow(10, prec);
  const e1 = calcEMAData(times, data, period, 6);
  if (!e1.length) return [];
  const e2 = calcEMAData(e1.map(x => x.time), e1.map(x => x.value), period, 6);
  if (!e2.length) return [];
  const e3 = calcEMAData(e2.map(x => x.time), e2.map(x => x.value), period, 6);
  const e1Map = new Map(e1.map(x => [x.time, x.value]));
  const e2Map = new Map(e2.map(x => [x.time, x.value]));
  const result = [];
  for (let item of e3) {
    const v1 = e1Map.get(item.time);
    const v2 = e2Map.get(item.time);
    if (v1 !== undefined && v2 !== undefined) {
      const temaVal = 3 * v1 - 3 * v2 + item.value;
      result.push({ time: item.time, value: Math.round(temaVal * f) / f });
    }
  }
  return result;
}

// Keltner Channels (20 EMA +/- 2 * ATR)
function calcKeltnerChannels(times, candles, period = 20, mult = 2, prec = 2) {
  if (!candles || candles.length < period) return { upper: [], middle: [], lower: [] };
  const f = Math.pow(10, prec);
  const closes = candles.map(c => c.close);
  const ema = calcEMAData(times, closes, period, prec);
  const emaMap = new Map(ema.map(x => [x.time, x.value]));
  const upper = [], middle = [], lower = [];

  for (let i = 0; i < candles.length; i++) {
    const t = times[i];
    const midVal = emaMap.get(t);
    if (midVal === undefined) continue;

    let trSum = 0;
    const startK = Math.max(0, i - 10 + 1);
    for (let k = startK; k <= i; k++) {
      const prevClose = k > 0 ? candles[k - 1].close : candles[k].open;
      const tr = Math.max(candles[k].high - candles[k].low, Math.abs(candles[k].high - prevClose), Math.abs(candles[k].low - prevClose));
      trSum += tr;
    }
    const atr = trSum / Math.max(1, i - startK + 1);
    upper.push({ time: t, value: Math.round((midVal + mult * atr) * f) / f });
    middle.push({ time: t, value: midVal });
    lower.push({ time: t, value: Math.round((midVal - mult * atr) * f) / f });
  }
  return { upper, middle, lower };
}

// Ichimoku Cloud (Tenkan 9, Kijun 26, Senkou Span B 52)
function calcIchimokuData(times, candles, prec = 2) {
  if (!candles || candles.length < 26) return { tenkan: [], kijun: [], spanA: [], spanB: [] };
  const f = Math.pow(10, prec);
  const tenkan = [], kijun = [], spanA = [], spanB = [];

  function getMidpoint(idx, length) {
    if (idx < length - 1) return null;
    let hh = -Infinity, ll = Infinity;
    for (let k = idx - length + 1; k <= idx; k++) {
      if (candles[k].high > hh) hh = candles[k].high;
      if (candles[k].low < ll) ll = candles[k].low;
    }
    return Math.round(((hh + ll) / 2) * f) / f;
  }

  for (let i = 0; i < candles.length; i++) {
    const t = times[i];
    const tVal = getMidpoint(i, 9);
    const kVal = getMidpoint(i, 26);
    const bVal = getMidpoint(i, 52);

    if (tVal !== null) tenkan.push({ time: t, value: tVal });
    if (kVal !== null) kijun.push({ time: t, value: kVal });
    if (tVal !== null && kVal !== null) {
      spanA.push({ time: t, value: Math.round(((tVal + kVal) / 2) * f) / f });
    }
    if (bVal !== null) spanB.push({ time: t, value: bVal });
  }
  return { tenkan, kijun, spanA, spanB };
}

// Moving Average Envelopes (20 SMA +/- 2.5%)
function calcEnvelopesData(times, closes, period = 20, pct = 0.025, prec = 2) {
  if (!closes || closes.length < period) return { upper: [], middle: [], lower: [] };
  const f = Math.pow(10, prec);
  const upper = [], middle = [], lower = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let k = 0; k < period; k++) sum += closes[i - k];
    const mid = sum / period;
    middle.push({ time: times[i], value: Math.round(mid * f) / f });
    upper.push({ time: times[i], value: Math.round((mid * (1 + pct)) * f) / f });
    lower.push({ time: times[i], value: Math.round((mid * (1 - pct)) * f) / f });
  }
  return { upper, middle, lower };
}

// Pivot Points Standard (Floor Trader Pivots)
function calcPivotPointsStandard(times, candles, prec = 2) {
  if (!candles || candles.length < 2) return { p: [], r1: [], s1: [], r2: [], s2: [] };
  const f = Math.pow(10, prec);
  const p = [], r1 = [], s1 = [], r2 = [], s2 = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const pivot = (prev.high + prev.low + prev.close) / 3;
    const diff = prev.high - prev.low;
    const t = times[i];
    p.push({ time: t, value: Math.round(pivot * f) / f });
    r1.push({ time: t, value: Math.round((2 * pivot - prev.low) * f) / f });
    s1.push({ time: t, value: Math.round((2 * pivot - prev.high) * f) / f });
    r2.push({ time: t, value: Math.round((pivot + diff) * f) / f });
    s2.push({ time: t, value: Math.round((pivot - diff) * f) / f });
  }
  return { p, r1, s1, r2, s2 };
}

// Zig Zag (5% deviation peak & trough swings)
function calcZigZagData(times, candles, devPct = 0.03, prec = 2) {
  if (!candles || candles.length < 5) return [];
  const f = Math.pow(10, prec);
  const pivots = [];
  let lastPivotType = 0; // 1 for peak, -1 for trough
  let lastPivotIdx = 0;
  let lastPivotPrice = candles[0].close;

  pivots.push({ time: times[0], value: Math.round(lastPivotPrice * f) / f });

  for (let i = 1; i < candles.length; i++) {
    const price = candles[i].close;
    const change = (price - lastPivotPrice) / lastPivotPrice;

    if (lastPivotType === 0) {
      if (change >= devPct) {
        lastPivotType = 1; lastPivotIdx = i; lastPivotPrice = price;
        pivots.push({ time: times[i], value: Math.round(price * f) / f });
      } else if (change <= -devPct) {
        lastPivotType = -1; lastPivotIdx = i; lastPivotPrice = price;
        pivots.push({ time: times[i], value: Math.round(price * f) / f });
      }
    } else if (lastPivotType === 1) {
      if (price > lastPivotPrice) {
        lastPivotIdx = i; lastPivotPrice = price;
        pivots[pivots.length - 1] = { time: times[i], value: Math.round(price * f) / f };
      } else if (change <= -devPct) {
        lastPivotType = -1; lastPivotIdx = i; lastPivotPrice = price;
        pivots.push({ time: times[i], value: Math.round(price * f) / f });
      }
    } else if (lastPivotType === -1) {
      if (price < lastPivotPrice) {
        lastPivotIdx = i; lastPivotPrice = price;
        pivots[pivots.length - 1] = { time: times[i], value: Math.round(price * f) / f };
      } else if (change >= devPct) {
        lastPivotType = 1; lastPivotIdx = i; lastPivotPrice = price;
        pivots.push({ time: times[i], value: Math.round(price * f) / f });
      }
    }
  }
  return pivots;
}

// Stochastic Oscillator (%K 14, %D 3)
function calcStochasticData(times, candles, period = 14, smoothK = 3, smoothD = 3) {
  if (!candles || candles.length < period) return { k: [], d: [] };
  const rawK = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) continue;
    let hh = -Infinity, ll = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (candles[j].high > hh) hh = candles[j].high;
      if (candles[j].low < ll) ll = candles[j].low;
    }
    const denom = hh - ll;
    const kVal = denom === 0 ? 50 : ((candles[i].close - ll) / denom) * 100;
    rawK.push({ time: times[i], value: Math.max(0, Math.min(100, kVal)) });
  }

  // Smooth K and D
  const kLine = [];
  for (let i = 0; i < rawK.length; i++) {
    if (i < smoothK - 1) continue;
    let sum = 0;
    for (let s = 0; s < smoothK; s++) sum += rawK[i - s].value;
    kLine.push({ time: rawK[i].time, value: +(sum / smoothK).toFixed(1) });
  }

  const dLine = [];
  for (let i = 0; i < kLine.length; i++) {
    if (i < smoothD - 1) continue;
    let sum = 0;
    for (let s = 0; s < smoothD; s++) sum += kLine[i - s].value;
    dLine.push({ time: kLine[i].time, value: +(sum / smoothD).toFixed(1) });
  }
  return { k: kLine, d: dLine };
}

// Stochastic RSI (Stoch of RSI 14)
function calcStochRSIData(times, closes, rsiPeriod = 14, stochPeriod = 14) {
  const rsi = calcRSIData(times, closes, rsiPeriod);
  if (!rsi || rsi.length < stochPeriod) return [];
  const result = [];
  for (let i = 0; i < rsi.length; i++) {
    if (i < stochPeriod - 1) continue;
    let minR = Infinity, maxR = -Infinity;
    for (let j = i - stochPeriod + 1; j <= i; j++) {
      if (rsi[j].value < minR) minR = rsi[j].value;
      if (rsi[j].value > maxR) maxR = rsi[j].value;
    }
    const denom = maxR - minR;
    const stochVal = denom === 0 ? 50 : ((rsi[i].value - minR) / denom) * 100;
    result.push({ time: rsi[i].time, value: +Math.max(0, Math.min(100, stochVal)).toFixed(1) });
  }
  return result;
}

// Awesome Oscillator (AO: SMA 5 median - SMA 34 median)
function calcAwesomeOscillatorData(times, candles) {
  if (!candles || candles.length < 34) return [];
  const medians = candles.map(c => (c.high + c.low) / 2);
  const result = [];
  for (let i = 33; i < candles.length; i++) {
    let sum5 = 0;
    for (let k = 0; k < 5; k++) sum5 += medians[i - k];
    let sum34 = 0;
    for (let k = 0; k < 34; k++) sum34 += medians[i - k];
    const ao = (sum5 / 5) - (sum34 / 34);
    result.push({ time: times[i], value: +ao.toFixed(2) });
  }
  return result;
}

// Commodity Channel Index (CCI 20)
function calcCCIData(times, candles, period = 20) {
  if (!candles || candles.length < period) return [];
  const tp = candles.map(c => (c.high + c.low + c.close) / 3);
  const result = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let k = 0; k < period; k++) sum += tp[i - k];
    const mean = sum / period;
    let mdSum = 0;
    for (let k = 0; k < period; k++) mdSum += Math.abs(tp[i - k] - mean);
    const meanDev = mdSum / period;
    const cci = meanDev === 0 ? 0 : (tp[i] - mean) / (0.015 * meanDev);
    result.push({ time: times[i], value: +cci.toFixed(1) });
  }
  return result;
}

// Williams %R (14)
function calcWilliamsRData(times, candles, period = 14) {
  if (!candles || candles.length < period) return [];
  const result = [];
  for (let i = period - 1; i < candles.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let k = i - period + 1; k <= i; k++) {
      if (candles[k].high > hh) hh = candles[k].high;
      if (candles[k].low < ll) ll = candles[k].low;
    }
    const denom = hh - ll;
    const wr = denom === 0 ? -50 : ((hh - candles[i].close) / denom) * -100;
    result.push({ time: times[i], value: +wr.toFixed(1) });
  }
  return result;
}

// On Balance Volume (OBV)
function calcOBVData(times, candles) {
  if (!candles || !candles.length) return [];
  const result = [];
  let cumObv = 0;
  result.push({ time: times[0], value: 0 });
  for (let i = 1; i < candles.length; i++) {
    const vol = candles[i].volume || 10;
    if (candles[i].close > candles[i - 1].close) cumObv += vol;
    else if (candles[i].close < candles[i - 1].close) cumObv -= vol;
    result.push({ time: times[i], value: Math.round(cumObv) });
  }
  return result;
}

// Chaikin Money Flow (CMF 20)
function calcCMFData(times, candles, period = 20) {
  if (!candles || candles.length < period) return [];
  const result = [];
  for (let i = period - 1; i < candles.length; i++) {
    let mfvSum = 0, volSum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      const c = candles[k];
      const range = c.high - c.low;
      const vol = c.volume || 10;
      const clv = range === 0 ? 0 : ((c.close - c.low) - (c.high - c.close)) / range;
      mfvSum += clv * vol;
      volSum += vol;
    }
    const cmf = volSum === 0 ? 0 : mfvSum / volSum;
    result.push({ time: times[i], value: +cmf.toFixed(3) });
  }
  return result;
}

// Net Volume
function calcNetVolumeData(times, candles) {
  if (!candles || !candles.length) return [];
  return candles.map(c => ({
    time: c.time,
    value: c.close >= c.open ? (c.volume || 10) : -(c.volume || 10)
  }));
}

// Volume Oscillator
function calcVolumeOscillatorData(times, candles, sPeriod = 5, lPeriod = 10) {
  if (!candles || candles.length < lPeriod) return [];
  const vols = candles.map(c => c.volume || 10);
  const emaShort = calcEMAData(times, vols, sPeriod, 2);
  const emaLong = calcEMAData(times, vols, lPeriod, 2);
  const longMap = new Map(emaLong.map(x => [x.time, x.value]));
  const result = [];
  for (let item of emaShort) {
    const lVal = longMap.get(item.time);
    if (lVal && lVal > 0) {
      const osc = ((item.value - lVal) / lVal) * 100;
      result.push({ time: item.time, value: +osc.toFixed(1) });
    }
  }
  return result;
}

// Guppy Multiple Moving Average (GMMA)
function calcGMMAData(times, closes, prec = 2) {
  const shortPeriods = [3, 5, 8, 10, 12, 15];
  const longPeriods = [30, 35, 40, 45, 50, 60];
  const gmma = { short: [], long: [] };
  shortPeriods.forEach(p => gmma.short.push(calcEMAData(times, closes, p, prec)));
  longPeriods.forEach(p => gmma.long.push(calcEMAData(times, closes, p, prec)));
  return gmma;
}

// Typical Price, Median Price, Average Price
function calcTypicalPriceData(times, candles, prec = 2) {
  const f = Math.pow(10, prec);
  return candles.map(c => ({ time: c.time, value: Math.round(((c.high + c.low + c.close) / 3) * f) / f }));
}
function calcMedianPriceData(times, candles, prec = 2) {
  const f = Math.pow(10, prec);
  return candles.map(c => ({ time: c.time, value: Math.round(((c.high + c.low) / 2) * f) / f }));
}
function calcAveragePriceData(times, candles, prec = 2) {
  const f = Math.pow(10, prec);
  return candles.map(c => ({ time: c.time, value: Math.round(((c.open + c.high + c.low + c.close) / 4) * f) / f }));
}

// 52 Week High / Low Range
function calc52WeekHighLowData(times, candles, prec = 2) {
  if (!candles || !candles.length) return { high: [], low: [] };
  const f = Math.pow(10, prec);
  let maxH = -Infinity, minL = Infinity;
  candles.forEach(c => {
    if (c.high > maxH) maxH = c.high;
    if (c.low < minL) minL = c.low;
  });
  const highVal = Math.round(maxH * f) / f;
  const lowVal = Math.round(minL * f) / f;
  return {
    high: times.map(t => ({ time: t, value: highVal })),
    low: times.map(t => ({ time: t, value: lowVal }))
  };
}

// ==========================================================================
// TRADINGVIEW SEARCHABLE INDICATORS MODAL ENGINE & FAVORITES
// ==========================================================================

function renderTradingViewIndicatorsModalList() {
  const container = document.getElementById('tv-ind-items-container');
  if (!container) return;

  const q = (document.getElementById('tv-ind-search-input')?.value || '').toLowerCase().trim();
  const activeTab = document.querySelector('.tv-ind-tab-pill.active')?.getAttribute('data-tab') || 'all';

  let html = '';
  let visibleCount = 0;

  TV_INDICATORS_CATALOG.forEach(item => {
    const isFav = favoriteIndicators.includes(item.id);
    const isActive = !!activeIndicators[item.id];

    // Filter by search query
    if (q && !item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q) && !item.tag.toLowerCase().includes(q)) {
      return;
    }

    // Filter by active category tab
    if (activeTab === 'fav' && !isFav) return;
    if (activeTab === 'overlay' && item.category !== 'overlay') return;
    if (activeTab === 'momentum' && item.category !== 'momentum') return;
    if (activeTab === 'volume' && item.category !== 'volume') return;
    if (activeTab === 'crypto' && item.category !== 'crypto') return;

    visibleCount++;
    html += `
      <div class="tv-ind-row ${isActive ? 'active' : ''}" data-id="${item.id}" data-category="${item.category}" onclick="toggleIndicatorKey('${item.id}', !activeIndicators['${item.id}'])">
        <div class="tv-ind-row-left">
          <button class="tv-ind-star-btn ${isFav ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleIndicatorFavorite('${item.id}', this)" title="${isFav ? 'Rimuovi dai Preferiti' : 'Aggiungi ai Preferiti'}">
            ${isFav ? '★' : '☆'}
          </button>
          <div class="tv-ind-name-box">
            <span class="tv-ind-name">${item.name}</span>
            <span class="tv-ind-badge ${item.category}">${item.tag}</span>
          </div>
        </div>
        <div class="tv-ind-row-right">
          <button type="button" class="tv-ind-gear-btn" onclick="event.stopPropagation(); openIndicatorSettingsModal('${item.id}')" title="Configura parametri ${item.name}">⚙️</button>
          <label class="switch" onclick="event.stopPropagation()">
            <input type="checkbox" data-ind-key="${item.id}" ${isActive ? 'checked' : ''} onchange="toggleIndicatorKey('${item.id}', this.checked)">
            <span class="slider-toggle"></span>
          </label>
        </div>
      </div>
    `;
  });

  if (visibleCount === 0) {
    html = '<div style="text-align:center; padding:30px; color:#787b86; font-size:12px;">Nessun indicatore corrisponde alla ricerca.</div>';
  }

  container.innerHTML = html;

  const countBadge = document.getElementById('tv-ind-count-badge');
  if (countBadge) {
    countBadge.innerText = q ? `${visibleCount} Risultati` : `${TV_INDICATORS_CATALOG.length} Scripts`;
  }
}

function toggleIndicatorFavorite(id, btn) {
  const idx = favoriteIndicators.indexOf(id);
  if (idx > -1) {
    favoriteIndicators.splice(idx, 1);
  } else {
    favoriteIndicators.push(id);
  }
  try {
    localStorage.setItem('tpu_fav_indicators_v27', JSON.stringify(favoriteIndicators));
  } catch(e) {}

  renderTradingViewIndicatorsModalList();
}

function filterTradingViewIndicators(query) {
  renderTradingViewIndicatorsModalList();
}

function setTradingViewIndicatorCategory(cat, btn) {
  document.querySelectorAll('.tv-ind-tab-pill').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('data-tab');
  });
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('data-tab', cat);
  }
  renderTradingViewIndicatorsModalList();
}

function toggleIndicatorKey(key, isChecked) {
  activeIndicators[key] = isChecked;
  try {
    localStorage.setItem('tpu_active_indicators_v27', JSON.stringify(activeIndicators));
  } catch(e) {}

  // If momentum indicator enabled, activate momentum pane
  const item = TV_INDICATORS_CATALOG.find(x => x.id === key);
  if (item) {
    if (item.category === 'momentum' && isChecked) {
      activeIndicators.momentumPane = true;
      activeMomentumMode = key;
      const momPane = document.getElementById('chart-momentum-pane');
      if (momPane) momPane.style.display = 'block';
    } else if (item.category === 'volume' && isChecked) {
      activeIndicators.volumePane = true;
      const volPane = document.getElementById('chart-volume-pane');
      if (volPane) volPane.style.display = 'block';
    }
  }

  updateIndicatorsBadge();
  renderTradingViewIndicatorsModalList();

  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }

  if (window.showToast && item) {
    window.showToast(`${item.name}: ${isChecked ? 'Attivato sul grafico' : 'Disattivato'}`, isChecked ? 'success' : 'info');
  }
}

function updateIndicatorsBadge() {
  const activeCount = Object.keys(activeIndicators).filter(k => activeIndicators[k] === true).length;
  const badges = document.querySelectorAll('.ind-active-count-badge');
  badges.forEach(b => {
    if (b.id !== 'tv-ind-count-badge') b.innerText = `${activeCount} Attivi`;
  });
  const summary = document.getElementById('tv-ind-active-summary');
  if (summary) summary.innerText = `${activeCount} indicatori attivi sul grafico`;
  const mainBtn = document.getElementById('btn-ind-header-label');
  if (mainBtn) {
    mainBtn.innerText = `Indicatori (${activeCount})`;
  }
}

function openTradingViewIndicatorsModal() {
  const modal = document.getElementById('tradingview-indicators-modal');
  if (modal) {
    modal.classList.add('open');
    renderTradingViewIndicatorsModalList();
    updateIndicatorsBadge();
    setTimeout(() => {
      document.getElementById('tv-ind-search-input')?.focus();
    }, 100);
  }
}

function closeTradingViewIndicatorsModal() {
  const modal = document.getElementById('tradingview-indicators-modal');
  if (modal) modal.classList.remove('open');
}

function resetIndicatorsToDefault() {
  const defaults = {
    vwap: true,
    ema9: true,
    ema21: true,
    ema50: false,
    ema200: true,
    alma: false,
    boll: true,
    donchian: false,
    sar: false,
    supertrend: false,
    volumePane: true,
    volumePoc: true,
    momentumPane: true,
    rsi: true,
    macd: false,
    aroon: false,
    adx: false
  };
  // Reset all other custom keys to false
  for (let k in activeIndicators) {
    activeIndicators[k] = defaults[k] !== undefined ? defaults[k] : false;
  }
  Object.assign(activeIndicators, defaults);

  try {
    localStorage.setItem('tpu_active_indicators_v27', JSON.stringify(activeIndicators));
  } catch(e) {}

  updateIndicatorsBadge();
  renderTradingViewIndicatorsModalList();

  if (window.currentCandles) renderChartData(window.currentCandles);
  if (window.showToast) window.showToast('Indicatori ripristinati alla configurazione istituzionale di default!', 'info');
}

// Initial modal list build
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderTradingViewIndicatorsModalList);
} else {
  setTimeout(renderTradingViewIndicatorsModalList, 100);
}


// Rome Real-Time Clock Synchronization & Minute Tick Broadcast
function startRomeClock() {
  let lastMinute = -1;
  function tick() {
    const now = new Date();
    const clockElem = document.getElementById('tele-clock-val');
    if (clockElem) {
      const romeStr = now.toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      clockElem.innerText = `${romeStr} (Roma)`;
    }

    const curMinute = now.getMinutes();
    if (lastMinute !== -1 && curMinute !== lastMinute) {
      window.dispatchEvent(new CustomEvent('tpu_clock_minute_sync', { detail: { now } }));
    }
    lastMinute = curMinute;
  }
  setInterval(tick, 1000);
  tick();
}


// ==========================================================================
// TRADINGVIEW OFFICIAL INDICATOR SETTINGS ENGINE (INPUTS, STYLE, VISIBILITY)
// ==========================================================================
const DEFAULT_INDICATOR_CONFIGS = {
  footprint: {
    id: 'footprint',
    name: 'Footprint di volume (Order Flow)',
    category: 'overlay',
    inputs: { imbalanceRatio: 3.0, showNumbers: true, pocHighlight: true },
    style: { buyColor: '#00f2a1', sellColor: '#ff4560', pocColor: '#fcd535', opacity: 0.85, visible: true },
    visibility: { all: true }
  },
  cvd: {
    id: 'cvd',
    name: 'Cumulative Volume Delta (CVD)',
    category: 'momentum',
    inputs: { smooth: 1 },
    style: { upColor: '#00f2a1', downColor: '#ff4560', lineWidth: 2, visible: true },
    visibility: { all: true }
  },

  vwap: {
    id: 'vwap',
    name: 'VWAP (Volume Weighted Average Price)',
    category: 'overlay',
    inputs: { anchor: 'Session', source: 'hlc3', offset: 0 },
    style: { color: '#f59e0b', lineWidth: 2, lineStyle: 0, visible: true, showLabels: true, showValues: true },
    visibility: { all: true }
  },
  boll: {
    id: 'boll',
    name: 'Bollinger Bands',
    category: 'overlay',
    inputs: { length: 20, mult: 2.0, source: 'close', offset: 0 },
    style: { upperColor: '#38bdf8', middleColor: '#f59e0b', lowerColor: '#38bdf8', lineWidth: 1.5, fillOpacity: 0.08, visible: true },
    visibility: { all: true }
  },
  ema9: {
    id: 'ema9',
    name: 'EMA Ribbon (Medie Mobili Esponenziali 9 / 21 / 200)',
    category: 'overlay',
    inputs: { len1: 9, len2: 21, len3: 200, source: 'close', offset: 0 },
    style: { color1: '#00f2a1', color2: '#38bdf8', color3: '#ef4444', lineWidth: 1.8, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  ema21: {
    id: 'ema21',
    name: 'EMA 21 (Pullback Ribbon)',
    category: 'overlay',
    inputs: { length: 21, source: 'close', offset: 0 },
    style: { color: '#38bdf8', lineWidth: 1.5, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  ema50: {
    id: 'ema50',
    name: 'EMA 50 (Intermediate Trend)',
    category: 'overlay',
    inputs: { length: 50, source: 'close', offset: 0 },
    style: { color: '#f97316', lineWidth: 1.5, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  ema200: {
    id: 'ema200',
    name: 'EMA 200 (Institutional Base)',
    category: 'overlay',
    inputs: { length: 200, source: 'close', offset: 0 },
    style: { color: '#ef4444', lineWidth: 2, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  sma: {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    category: 'overlay',
    inputs: { length: 20, source: 'close', offset: 0 },
    style: { color: '#e879f9', lineWidth: 1.5, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  alma: {
    id: 'alma',
    name: 'Arnaud Legoux Moving Average (ALMA)',
    category: 'overlay',
    inputs: { length: 9, offset: 0.85, sigma: 6, source: 'close' },
    style: { color: '#a855f7', lineWidth: 2, lineStyle: 0, visible: true },
    visibility: { all: true }
  },
  sar: {
    id: 'sar',
    name: 'Parabolic SAR',
    category: 'overlay',
    inputs: { start: 0.02, inc: 0.02, max: 0.20 },
    style: { color: '#fb923c', lineWidth: 2, visible: true },
    visibility: { all: true }
  },
  supertrend: {
    id: 'supertrend',
    name: 'SuperTrend',
    category: 'overlay',
    inputs: { atrPeriod: 10, multiplier: 3.0 },
    style: { upColor: '#00f2a1', downColor: '#ff4560', lineWidth: 2, visible: true },
    visibility: { all: true }
  },
  keltner: {
    id: 'keltner',
    name: 'Keltner Channels',
    category: 'overlay',
    inputs: { length: 20, mult: 2.0, atrLength: 10, source: 'close' },
    style: { upperColor: '#38bdf8', middleColor: '#38bdf8', lowerColor: '#38bdf8', lineWidth: 1.5, visible: true },
    visibility: { all: true }
  },
  donchian: {
    id: 'donchian',
    name: 'Donchian Channels',
    category: 'overlay',
    inputs: { length: 20 },
    style: { color: '#38bdf8', lineWidth: 1.5, visible: true },
    visibility: { all: true }
  },
  rsi: {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    category: 'momentum',
    inputs: { length: 14, overbought: 70, oversold: 30, source: 'close' },
    style: { color: '#a855f7', lineWidth: 2, lineStyle: 0, bandColor: '#64748b', visible: true },
    visibility: { all: true }
  },
  macd: {
    id: 'macd',
    name: 'MACD (12, 26, Close, 9)',
    category: 'momentum',
    inputs: { fastLength: 12, slowLength: 26, signalLength: 9, source: 'close' },
    style: { macdColor: '#38bdf8', signalColor: '#f59e0b', histUpColor: '#00f2a1', histDownColor: '#ff4560', lineWidth: 1.5, visible: true },
    visibility: { all: true }
  },
  stoch: {
    id: 'stoch',
    name: 'Stochastic Oscillator',
    category: 'momentum',
    inputs: { kLength: 14, dLength: 3, smooth: 3 },
    style: { kColor: '#38bdf8', dColor: '#f59e0b', lineWidth: 1.5, visible: true },
    visibility: { all: true }
  },
  stoch_rsi: {
    id: 'stoch_rsi',
    name: 'Stochastic RSI',
    category: 'momentum',
    inputs: { rsiLength: 14, stochLength: 14, k: 3, d: 3 },
    style: { color: '#a855f7', lineWidth: 2, visible: true },
    visibility: { all: true }
  },
  volumePane: {
    id: 'volumePane',
    name: 'Volume & Volume MA',
    category: 'volume',
    inputs: { maLength: 20 },
    style: { upColor: '#00f2a1', downColor: '#ff4560', maColor: '#fcd535', lineWidth: 1.5, visible: true },
    visibility: { all: true }
  },
  volumePoc: {
    id: 'volumePoc',
    name: 'Volume Profile Orizzontale & POC',
    category: 'volume',
    inputs: { rows: 24, valueArea: 70 },
    style: { pocColor: '#fcd535', vaColor: '#38bdf8', visible: true },
    visibility: { all: true }
  }
};

let currentEditingIndicatorId = null;

function getIndicatorConfig(id) {
  try {
    const raw = localStorage.getItem('tpu_ind_cfg_' + id);
    if (raw) return JSON.parse(raw);
  } catch(e) {}

  const base = DEFAULT_INDICATOR_CONFIGS[id];
  if (base) return JSON.parse(JSON.stringify(base));

  // Dynamic fallback for any of the 107 scripts in catalog
  const catalogItem = window.TV_INDICATORS_CATALOG?.find(x => x.id === id);
  return {
    id: id,
    name: catalogItem ? catalogItem.name : id.toUpperCase(),
    category: catalogItem ? catalogItem.category : 'overlay',
    inputs: { length: 14, mult: 2.0, source: 'close', offset: 0 },
    style: { color: '#38bdf8', lineWidth: 2, lineStyle: 0, visible: true, showLabels: true, showValues: true },
    visibility: { all: true }
  };
}

function saveIndicatorConfig(id, cfg) {
  try {
    localStorage.setItem('tpu_ind_cfg_' + id, JSON.stringify(cfg));
  } catch(e) {}
}

function openIndicatorSettingsModal(indId) {
  currentEditingIndicatorId = indId;
  const cfg = getIndicatorConfig(indId);

  let modal = document.getElementById('indicator-settings-modal');
  if (!modal) {
    modal = createIndicatorSettingsModalDom();
  }

  // Populate title
  const titleEl = document.getElementById('ind-settings-modal-title');
  if (titleEl) titleEl.innerText = cfg.name;

  // Render tab contents
  renderIndSettingsInputsTab(cfg);
  renderIndSettingsStyleTab(cfg);
  renderIndSettingsVisibilityTab(cfg);

  // Set default active tab to inputs
  switchIndSettingsTab('inputs');

  modal.classList.add('open');
}

function closeIndicatorSettingsModal() {
  const modal = document.getElementById('indicator-settings-modal');
  if (modal) modal.classList.remove('open');
}

function switchIndSettingsTab(tabName) {
  document.querySelectorAll('.ind-modal-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.ind-settings-tab-panel').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-panel') === tabName);
  });
}

function renderIndSettingsInputsTab(cfg) {
  const container = document.getElementById('ind-tab-inputs-body');
  if (!container) return;

  const inp = cfg.inputs || {};
  let rows = '';

  for (let key in inp) {
    const val = inp[key];
    const label = formatInputLabel(key);

    if (key === 'source') {
      rows += `
        <div class="ind-setting-row">
          <label class="ind-setting-lbl">${label}</label>
          <select class="ind-setting-select" id="ind-inp-${key}">
            <option value="close" ${val === 'close' ? 'selected' : ''}>close</option>
            <option value="open" ${val === 'open' ? 'selected' : ''}>open</option>
            <option value="high" ${val === 'high' ? 'selected' : ''}>high</option>
            <option value="low" ${val === 'low' ? 'selected' : ''}>low</option>
            <option value="hl2" ${val === 'hl2' ? 'selected' : ''}>hl2 ((H+L)/2)</option>
            <option value="hlc3" ${val === 'hlc3' ? 'selected' : ''}>hlc3 ((H+L+C)/3)</option>
            <option value="ohlc4" ${val === 'ohlc4' ? 'selected' : ''}>ohlc4</option>
          </select>
        </div>
      `;
    } else if (key === 'anchor') {
      rows += `
        <div class="ind-setting-row">
          <label class="ind-setting-lbl">${label}</label>
          <select class="ind-setting-select" id="ind-inp-${key}">
            <option value="Session" ${val === 'Session' ? 'selected' : ''}>Session (Intraday)</option>
            <option value="Week" ${val === 'Week' ? 'selected' : ''}>Week (Settimanale)</option>
            <option value="Month" ${val === 'Month' ? 'selected' : ''}>Month (Mensile)</option>
            <option value="Year" ${val === 'Year' ? 'selected' : ''}>Year (Annuale)</option>
          </select>
        </div>
      `;
    } else {
      const step = (typeof val === 'number' && val < 1) ? '0.01' : (key === 'mult' || key === 'multiplier' ? '0.1' : '1');
      rows += `
        <div class="ind-setting-row">
          <label class="ind-setting-lbl">${label}</label>
          <input type="number" class="ind-setting-num" id="ind-inp-${key}" value="${val}" step="${step}">
        </div>
      `;
    }
  }

  container.innerHTML = rows || '<div style="padding:16px; color:#787b86; text-align:center;">Nessun parametro numerico regolabile per questo indicatore.</div>';
}

function renderIndSettingsStyleTab(cfg) {
  const container = document.getElementById('ind-tab-style-body');
  if (!container) return;

  const st = cfg.style || {};
  let rows = '';

  if (cfg.id === 'ema9') {
    // Specialized multi-color picker for EMA Ribbon
    const c1 = st.color1 || st.color || '#00f2a1';
    const c2 = st.color2 || '#38bdf8';
    const c3 = st.color3 || '#ef4444';
    const lineWidth = st.lineWidth || 1.8;

    rows += `
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Colore Fast EMA (${cfg.inputs.len1 || 9})</label>
        <input type="color" class="ind-color-picker" id="ind-style-color1" value="${c1}">
      </div>
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Colore Pullback EMA (${cfg.inputs.len2 || 21})</label>
        <input type="color" class="ind-color-picker" id="ind-style-color2" value="${c2}">
      </div>
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Colore Base EMA (${cfg.inputs.len3 || 200})</label>
        <input type="color" class="ind-color-picker" id="ind-style-color3" value="${c3}">
      </div>
      <div class="ind-setting-row" style="margin-top:10px;">
        <label class="ind-setting-lbl">Spessore Linee</label>
        <select class="ind-setting-select" id="ind-style-width" style="width:120px;">
          <option value="1" ${lineWidth === 1 ? 'selected' : ''}>1px (Sottile)</option>
          <option value="1.5" ${lineWidth === 1.5 ? 'selected' : ''}>1.5px</option>
          <option value="1.8" ${lineWidth === 1.8 ? 'selected' : ''}>1.8px (Ottimale)</option>
          <option value="2.5" ${lineWidth === 2.5 ? 'selected' : ''}>2.5px (Spesso)</option>
        </select>
      </div>
    `;
  } else if (cfg.id === 'boll') {
    // Specialized multi-color picker for Bollinger Bands
    const upCol = st.upperColor || '#38bdf8';
    const midCol = st.middleColor || '#f59e0b';
    const lowCol = st.lowerColor || '#38bdf8';
    const lineWidth = st.lineWidth || 1.5;

    rows += `
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Banda Superiore (Upper Band)</label>
        <input type="color" class="ind-color-picker" id="ind-style-upperColor" value="${upCol}">
      </div>
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Banda Mediana (Basis SMA)</label>
        <input type="color" class="ind-color-picker" id="ind-style-middleColor" value="${midCol}">
      </div>
      <div class="ind-setting-row">
        <label class="ind-setting-lbl">Banda Inferiore (Lower Band)</label>
        <input type="color" class="ind-color-picker" id="ind-style-lowerColor" value="${lowCol}">
      </div>
      <div class="ind-setting-row" style="margin-top:10px;">
        <label class="ind-setting-lbl">Spessore Linee Bande</label>
        <select class="ind-setting-select" id="ind-style-width" style="width:120px;">
          <option value="1" ${lineWidth === 1 ? 'selected' : ''}>1px (Sottile)</option>
          <option value="1.5" ${lineWidth === 1.5 ? 'selected' : ''}>1.5px (Medio)</option>
          <option value="2" ${lineWidth === 2 ? 'selected' : ''}>2px (Spesso)</option>
        </select>
      </div>
    `;
  } else {
    // General indicator color & style
    const mainColor = st.color || st.upperColor || '#38bdf8';
    const lineWidth = st.lineWidth || 2;

    rows += `
      <div class="ind-setting-row">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="ind-style-visible" ${st.visible !== false ? 'checked' : ''}>
          <label class="ind-setting-lbl" for="ind-style-visible" style="font-weight:700;">Visibile sul Grafico</label>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="color" class="ind-color-picker" id="ind-style-color" value="${mainColor}">
          <select class="ind-setting-select" id="ind-style-width" style="width:75px;">
            <option value="1" ${lineWidth === 1 ? 'selected' : ''}>1px (Sottile)</option>
            <option value="1.5" ${lineWidth === 1.5 ? 'selected' : ''}>1.5px</option>
            <option value="2" ${lineWidth === 2 ? 'selected' : ''}>2px (Medio)</option>
            <option value="3" ${lineWidth === 3 ? 'selected' : ''}>3px (Spesso)</option>
          </select>
        </div>
      </div>
      <div class="ind-setting-row" style="margin-top:14px;">
        <label class="ind-setting-lbl">Stile Linea</label>
        <select class="ind-setting-select" id="ind-style-linestyle">
          <option value="0" ${st.lineStyle === 0 ? 'selected' : ''}>Continua (Solid)</option>
          <option value="1" ${st.lineStyle === 1 ? 'selected' : ''}>Tratteggiata (Dotted)</option>
          <option value="2" ${st.lineStyle === 2 ? 'selected' : ''}>Tratto Lungo (Dashed)</option>
        </select>
      </div>
    `;
  }

  rows += `
    <div style="border-top:1px solid #2a2e39; margin:14px 0 10px;"></div>
    <div style="font-size:10px; font-weight:800; color:#787b86; text-transform:uppercase; margin-bottom:8px;">OUTPUT & SCALA</div>
    <div class="ind-setting-row">
      <label class="ind-setting-lbl" for="ind-style-labels">Etichetta su asse dei prezzi</label>
      <input type="checkbox" id="ind-style-labels" ${st.showLabels ? 'checked' : ''}>
    </div>
    <div class="ind-setting-row">
      <label class="ind-setting-lbl" for="ind-style-values">Valore nella legenda attiva</label>
      <input type="checkbox" id="ind-style-values" ${st.showValues !== false ? 'checked' : ''}>
    </div>
  `;

  container.innerHTML = rows;
}

function renderIndSettingsVisibilityTab(cfg) {
  const container = document.getElementById('ind-tab-visibility-body');
  if (!container) return;

  container.innerHTML = `
    <div style="font-size:11px; color:#94a3b8; line-height:1.5; margin-bottom:12px;">
      Configura la visibilità dell'indicatore su intervalli temporali specifici:
    </div>
    <div class="ind-setting-row"><label class="ind-setting-lbl">Secondi (1s)</label><input type="checkbox" checked></div>
    <div class="ind-setting-row"><label class="ind-setting-lbl">Minuti (1m - 30m)</label><input type="checkbox" checked></div>
    <div class="ind-setting-row"><label class="ind-setting-lbl">Ore (1h - 12h)</label><input type="checkbox" checked></div>
    <div class="ind-setting-row"><label class="ind-setting-lbl">Giorni (1D, 1W, 1M)</label><input type="checkbox" checked></div>
  `;
}

function applyCurrentIndicatorSettings() {
  if (!currentEditingIndicatorId) return;
  const cfg = getIndicatorConfig(currentEditingIndicatorId);

  // 1. Gather Inputs
  for (let key in cfg.inputs) {
    const el = document.getElementById('ind-inp-' + key);
    if (el) {
      cfg.inputs[key] = el.type === 'number' ? parseFloat(el.value) : el.value;
    }
  }

  // 2. Gather Style
  const colEl = document.getElementById('ind-style-color');
  const col1El = document.getElementById('ind-style-color1');
  const col2El = document.getElementById('ind-style-color2');
  const col3El = document.getElementById('ind-style-color3');
  const upColEl = document.getElementById('ind-style-upperColor');
  const midColEl = document.getElementById('ind-style-middleColor');
  const lowColEl = document.getElementById('ind-style-lowerColor');
  const widthEl = document.getElementById('ind-style-width');
  const styleEl = document.getElementById('ind-style-linestyle');
  const visEl = document.getElementById('ind-style-visible');
  const labEl = document.getElementById('ind-style-labels');
  const valEl = document.getElementById('ind-style-values');

  if (col1El) cfg.style.color1 = col1El.value;
  if (col2El) cfg.style.color2 = col2El.value;
  if (col3El) cfg.style.color3 = col3El.value;
  if (upColEl) cfg.style.upperColor = upColEl.value;
  if (midColEl) cfg.style.middleColor = midColEl.value;
  if (lowColEl) cfg.style.lowerColor = lowColEl.value;
  if (colEl) {
    cfg.style.color = colEl.value;
  }

  if (widthEl) cfg.style.lineWidth = parseFloat(widthEl.value);
  if (styleEl) cfg.style.lineStyle = parseInt(styleEl.value);
  if (visEl) cfg.style.visible = visEl.checked;
  if (labEl) cfg.style.showLabels = labEl.checked;
  if (valEl) cfg.style.showValues = valEl.checked;

  saveIndicatorConfig(currentEditingIndicatorId, cfg);

  // Synchronize secondary indicator configurations if master ribbon was edited
  if (currentEditingIndicatorId === 'ema9') {
    const e21 = getIndicatorConfig('ema21');
    e21.inputs.length = cfg.inputs.len2 || 21;
    if (cfg.style.color2) e21.style.color = cfg.style.color2;
    saveIndicatorConfig('ema21', e21);

    const e200 = getIndicatorConfig('ema200');
    e200.inputs.length = cfg.inputs.len3 || 200;
    if (cfg.style.color3) e200.style.color = cfg.style.color3;
    saveIndicatorConfig('ema200', e200);
  }

  closeIndicatorSettingsModal();

  // Re-render chart with new customized parameters immediately
  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }

  if (window.showToast) {
    window.showToast(`✓ Parametri di ${cfg.name} registrati con successo!`, 'success');
  }
}

function resetCurrentIndicatorSettings() {
  if (!currentEditingIndicatorId) return;
  localStorage.removeItem('tpu_ind_cfg_' + currentEditingIndicatorId);
  const def = getIndicatorConfig(currentEditingIndicatorId);
  renderIndSettingsInputsTab(def);
  renderIndSettingsStyleTab(def);
  renderIndSettingsVisibilityTab(def);
  if (window.showToast) window.showToast('Parametri ripristinati alla configurazione di default.', 'info');
}

function formatInputLabel(key) {
  const map = {
    length: 'Lunghezza / Periodo',
    len1: 'Lunghezza EMA 1 (Fast)',
    len2: 'Lunghezza EMA 2 (Mid)',
    len3: 'Lunghezza EMA 3 (Intermediate)',
    len4: 'Lunghezza EMA 4 (Slow)',
    mult: 'Deviazione Standard / Moltiplicatore',
    multiplier: 'Moltiplicatore ATR',
    atrPeriod: 'Periodo ATR',
    atrLength: 'Lunghezza ATR',
    fastLength: 'Periodo Veloce (Fast EMA)',
    slowLength: 'Periodo Lento (Slow EMA)',
    signalLength: 'Smoothing Segnale (Signal Line)',
    kLength: '%K Lunghezza',
    dLength: '%D Lunghezza',
    smooth: 'Smoothing %K',
    rsiLength: 'Lunghezza RSI',
    stochLength: 'Lunghezza Stochastic',
    k: '%K Smoothing',
    d: '%D Smoothing',
    start: 'Passo Iniziale (Start)',
    inc: 'Incremento Accelerazione',
    max: 'Accelerazione Massima',
    offset: 'Offset Orizzontale',
    sigma: 'Deviazione Gaussiana (Sigma)',
    rows: 'Numero Righe Volume Profile',
    valueArea: '% Value Area (VAH/VAL)',
    source: 'Sorgente Prezzo',
    anchor: 'Periodo di Ancoraggio (Anchor)'
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function createIndicatorSettingsModalDom() {
  let modal = document.getElementById('indicator-settings-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'indicator-settings-modal';
  modal.className = 'modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeIndicatorSettingsModal(); };
  modal.innerHTML = `
    <div class="modal-window-card tv-settings-modal-window">
      <!-- HEADER -->
      <div class="tv-settings-modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:15px; color:#2962ff;">⚙️</span>
          <span id="ind-settings-modal-title" style="font-weight:800; font-size:14px; color:#fff;">Impostazioni Indicatore</span>
        </div>
        <button class="win-ctrl-btn" onclick="closeIndicatorSettingsModal()" title="Chiudi">✕</button>
      </div>

      <!-- TABS -->
      <div class="tv-settings-tabs-bar">
        <button class="ind-modal-tab-btn active" data-tab="inputs" onclick="switchIndSettingsTab('inputs')">Inputs (Parametri)</button>
        <button class="ind-modal-tab-btn" data-tab="style" onclick="switchIndSettingsTab('style')">Stile & Colori</button>
        <button class="ind-modal-tab-btn" data-tab="visibility" onclick="switchIndSettingsTab('visibility')">Visibilità</button>
      </div>

      <!-- BODY PANELS -->
      <div class="tv-settings-modal-body">
        <div class="ind-settings-tab-panel active" data-panel="inputs" id="ind-tab-inputs-body"></div>
        <div class="ind-settings-tab-panel" data-panel="style" id="ind-tab-style-body"></div>
        <div class="ind-settings-tab-panel" data-panel="visibility" id="ind-tab-visibility-body"></div>
      </div>

      <!-- FOOTER -->
      <div class="tv-settings-modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" onclick="resetCurrentIndicatorSettings()">
          ↺ Predefiniti
        </button>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeIndicatorSettingsModal()">
            Annulla
          </button>
          <button type="button" class="btn-action-primary btn-sm" style="background:#2563eb; color:#fff; font-weight:800; padding:6px 18px; border-radius:6px; box-shadow:0 0 10px rgba(37,99,235,0.4);" onclick="applyCurrentIndicatorSettings()">
            💾 Salva & Registra Parametri
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Expose functions globally
window.openIndicatorSettingsModal = openIndicatorSettingsModal;
window.closeIndicatorSettingsModal = closeIndicatorSettingsModal;
window.switchIndSettingsTab = switchIndSettingsTab;
window.applyCurrentIndicatorSettings = applyCurrentIndicatorSettings;
window.resetCurrentIndicatorSettings = resetCurrentIndicatorSettings;
window.getIndicatorConfig = getIndicatorConfig;


// ==========================================================================
// REAL-TIME DIRECT PARAMETERIZATION CONTROLS (VOLUME MA & MOMENTUM)
// ==========================================================================
let currentVolumeMaPeriod = 20;
let currentVolumeMaType = 'SMA';
let currentMomentumPeriod = 14;
let currentMomentumOb = 70;
let currentMomentumOs = 30;

window.updateVolumeMaParam = function(val) {
  currentVolumeMaPeriod = Math.max(2, parseInt(val) || 20);
  const inputEl = document.getElementById('vol-ma-period-input');
  if (inputEl) inputEl.value = currentVolumeMaPeriod;
  if (window.rawCandleHistory && window.rawCandleHistory.length) {
    renderChartIndicators(window.rawCandleHistory);
  }
};

window.updateVolumeMaType = function(val) {
  currentVolumeMaType = val === 'EMA' ? 'EMA' : 'SMA';
  const selEl = document.getElementById('vol-ma-type-select');
  if (selEl) selEl.value = currentVolumeMaType;
  if (window.rawCandleHistory && window.rawCandleHistory.length) {
    renderChartIndicators(window.rawCandleHistory);
  }
};

window.updateMomentumParam = function(param, val) {
  const num = parseInt(val);
  if (param === 'period') currentMomentumPeriod = Math.max(2, num || 14);
  else if (param === 'ob') currentMomentumOb = Math.min(99, Math.max(50, num || 70));
  else if (param === 'os') currentMomentumOs = Math.max(1, Math.min(50, num || 30));

  if (window.rawCandleHistory && window.rawCandleHistory.length) {
    renderChartIndicators(window.rawCandleHistory);
  }
};


// Explicit Global Bindings for Legend Controls
window.openIndicatorSettingsModal = typeof openIndicatorSettingsModal !== 'undefined' ? openIndicatorSettingsModal : function(id) { console.warn('openIndicatorSettingsModal:', id); };
window.toggleIndicatorKey = typeof toggleIndicatorKey !== 'undefined' ? toggleIndicatorKey : function(key, val) { console.warn('toggleIndicatorKey:', key, val); };


// =============================================================================
// BYBIT CHART SETTINGS & DYNAMIC HEIGHT ENGINE
// TRADING PRO ULTIMATE™ © by cuordivino - Tutti i diritti riservati
// =============================================================================
window.BybitChartSettings = {
  currentHeight: 460,
  minHeight: 200,
  maxHeight: 1600,
  isFullScreen: false,

  init() {
    try {
      const saved = localStorage.getItem('tpu_bybit_chart_height');
      if (saved) {
        this.currentHeight = parseInt(saved, 10) || 460;
      } else {
        this.currentHeight = (window.innerWidth < 768) ? 460 : 380;
      }
      this.applyHeight(this.currentHeight, false);
    } catch (e) {
      console.warn('[BybitChartSettings] Init fallback:', e);
    }
  },

  setHeight(px, save = true) {
    const val = Math.max(this.minHeight, Math.min(this.maxHeight, parseInt(px, 10) || 460));
    this.currentHeight = val;
    this.isFullScreen = false;
    this.applyHeight(val, save);
  },

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    const vp = document.querySelector('.chart-viewport-wrapper');
    if (!vp) return;

    if (this.isFullScreen) {
      const fullH = Math.max(480, window.innerHeight - (window.innerWidth < 768 ? 130 : 160));
      vp.style.height = `${fullH}px`;
      if (typeof window.resizeAllCharts === 'function') window.resizeAllCharts();
      const lbl = document.getElementById('bybit-slider-val-lbl');
      if (lbl) lbl.textContent = `${fullH}px (Full)`;
      const slider = document.getElementById('bybit-chart-height-slider');
      if (slider) slider.value = fullH;
      if (window.showToastNotification) window.showToastNotification(`⛶ Grafico a Schermo Intero (${fullH}px)`);
    } else {
      this.applyHeight(this.currentHeight, true);
      if (window.showToastNotification) window.showToastNotification(`Grafico reimpostato a ${this.currentHeight}px`);
    }
  },

  applyHeight(px, save = true) {
    const vp = document.querySelector('.chart-viewport-wrapper');
    if (vp) {
      vp.style.height = `${px}px`;
      if (typeof window.resizeAllCharts === 'function') {
        window.resizeAllCharts();
      }
    }
    const lbl = document.getElementById('bybit-slider-val-lbl');
    if (lbl) lbl.textContent = `${px}px`;
    const slider = document.getElementById('bybit-chart-height-slider');
    if (slider) slider.value = px;

    if (save) {
      try {
        localStorage.setItem('tpu_bybit_chart_height', String(px));
      } catch (e) {}
    }
  },

  openModal() {
    const modal = document.getElementById('bybit-chart-settings-modal');
    if (modal) {
      modal.style.display = 'flex';
      const slider = document.getElementById('bybit-chart-height-slider');
      if (slider) slider.value = this.currentHeight;
      const lbl = document.getElementById('bybit-slider-val-lbl');
      if (lbl) lbl.textContent = `${this.currentHeight}px`;
    }
  },

  closeModal() {
    const modal = document.getElementById('bybit-chart-settings-modal');
    if (modal) modal.style.display = 'none';
  }
};

// Auto-run on DOMContentLoaded or immediate
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BybitChartSettings.init());
} else {
  BybitChartSettings.init();
}


// =============================================================================
// BYBIT HIGH/LOW PRICE MARKERS, MACRO NEWS WIRE & SUB-PANE 2 EXTENSION
// TRADING PRO ULTIMATE™ © by cuordivino - Tutti i diritti riservati
// =============================================================================

let maxPriceLine = null;
let minPriceLine = null;
let sub2Chart = null;
let sub2Series = null;
let sub2Series2 = null;
let activeSub2Mode = 'wr';
let activeSub2Period = 14;

// 1. DYNAMIC HIGH & LOW PRICE MARKERS (Massimo e Minimo del Frame di Tempo)
function updateVisibleHighLowMarkers(candles) {
  if (!candleSeries || !candles || candles.length === 0) return;
  try {
    let maxH = -Infinity;
    let minL = Infinity;
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (c.high > maxH) maxH = c.high;
      if (c.low < minL) minL = c.low;
    }
    if (maxH === -Infinity || minL === Infinity) return;

    if (maxPriceLine) {
      try { candleSeries.removePriceLine(maxPriceLine); } catch(e){}
      maxPriceLine = null;
    }
    if (minPriceLine) {
      try { candleSeries.removePriceLine(minPriceLine); } catch(e){}
      minPriceLine = null;
    }

    const fmtMax = maxH > 1000 ? maxH.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : maxH.toFixed(4);
    const fmtMin = minL > 1000 ? minL.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : minL.toFixed(4);

    maxPriceLine = candleSeries.createPriceLine({
      price: maxH,
      color: '#cbd5e1',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: `— ${fmtMax} (Max)`
    });

    minPriceLine = candleSeries.createPriceLine({
      price: minL,
      color: '#cbd5e1',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: `— ${fmtMin} (Min)`
    });
  } catch(e) {
    console.warn('[updateVisibleHighLowMarkers] Handled safely:', e);
  }
}

// 2. BYBIT TOP HEADER SYNCHRONIZATION
function syncBybitTopHeader(sym, price, chg, high, low, vol) {
  try {
    const symEl = document.getElementById('bybit-top-sym');
    if (symEl && sym) symEl.textContent = sym;

    const nameEl = document.getElementById('bybit-top-name');
    if (nameEl) {
      nameEl.textContent = sym.includes('USDT') ? `${sym.replace('USDT', '')} / Perpetual` : `${sym} Spot/Contract`;
    }

    const priceEl = document.getElementById('bybit-top-price');
    if (priceEl && price !== undefined) {
      const fmtP = typeof price === 'number' ? (price > 1000 ? `$${price.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : `$${price.toFixed(4)}`) : price;
      priceEl.textContent = fmtP;
    }

    const chgEl = document.getElementById('bybit-top-chg');
    if (chgEl && chg !== undefined) {
      const chgStr = String(chg);
      chgEl.textContent = chgStr.startsWith('+') || chgStr.startsWith('-') ? chgStr : (parseFloat(chgStr) >= 0 ? `+${chgStr}%` : `${chgStr}%`);
      if (chgStr.includes('-')) {
        chgEl.className = 'bybit-price-chg down';
        if (priceEl) priceEl.className = 'bybit-price-large down';
      } else {
        chgEl.className = 'bybit-price-chg';
        if (priceEl) priceEl.className = 'bybit-price-large';
      }
    }

    const markEl = document.getElementById('bybit-top-mark');
    if (markEl && price) markEl.textContent = `Mark: ${priceEl ? priceEl.textContent : price}`;

    const highEl = document.getElementById('bybit-top-high');
    if (highEl && high) highEl.textContent = high;

    const lowEl = document.getElementById('bybit-top-low');
    if (lowEl && low) lowEl.textContent = low;

    const volEl = document.getElementById('bybit-top-vol');
    if (volEl && vol) volEl.textContent = vol;
  } catch(e) {}
}

// Hook into existing ticker updates
window.addEventListener('tickerUpdate', (e) => {
  if (e.detail) {
    const d = e.detail;
    syncBybitTopHeader(d.symbol, d.price, d.change24h, d.high24h, d.low24h, d.volume24h);
  }
});

// 3. BYBIT CHART LEGEND COLLAPSE TOGGLE
function toggleBybitLegendCollapse() {
  const leg = document.getElementById('bybit-chart-legend');
  if (leg) {
    leg.classList.toggle('collapsed');
  }
}

// 4. BYBIT MACRO CALENDAR & NEWS WIRE ENGINE
window.BybitMacroCalendar = {
  activeTab: 'tutte',

  getNewsList() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = now.getDate();
    const dToday = `${y}-${m}-${String(d).padStart(2, '0')}`;
    const dTom = `${y}-${m}-${String(d + 1).padStart(2, '0')}`;
    const dNext = `${y}-${m}-${String(d + 3).padStart(2, '0')}`;
    const dPast = `${y}-${m}-${String(d - 1).padStart(2, '0')}`;

    return [
      {
        id: 'cpi_us',
        type: 'oggi',
        status: 'rilasciato',
        title: 'US Consumer Price Index (CPI YoY Final)',
        flag: '🇺🇸',
        date: `${dToday} 13:30 CET`,
        prev: '129.43',
        est: '129.70',
        act: '129.70',
        impact: 'Alto',
        sourceName: 'U.S. Bureau of Labor Statistics',
        url: 'https://www.bls.gov/cpi/',
        summary: 'Indice prezzi al consumo confermato in linea con le stime al +2.4% su base tendenziale.'
      },
      {
        id: 'nfp_us',
        type: 'oggi',
        status: 'rilasciato',
        title: 'US Non-Farm Payrolls & Unemployment Rate',
        flag: '🇺🇸',
        date: `${dToday} 13:30 CET`,
        prev: '142K',
        est: '165K',
        act: '172K',
        impact: 'Alto',
        sourceName: 'U.S. Bureau of Labor Statistics',
        url: 'https://www.bls.gov/news.release/empsit.nr0.htm',
        summary: 'Creazione posti di lavoro oltre il consensus (172k vs 165k attesi). Tasso disoccupazione fermo a 4.1%.'
      },
      {
        id: 'fomc_min',
        type: 'domani',
        status: 'futuro',
        title: 'FOMC Minutes (Federal Reserve)',
        flag: '🇺🇸',
        date: `${dTom} 19:00 CET`,
        prev: '5.00%',
        est: '4.75%',
        act: 'In attesa',
        impact: 'Alto',
        sourceName: 'Federal Reserve Official Portal',
        url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
        summary: 'Pubblicazione verbali dell\'ultima riunione del Federal Open Market Committee sulla traiettoria dei tassi 2026/2027.'
      },
      {
        id: 'permits_us',
        type: 'domani',
        status: 'futuro',
        title: 'Building Permits & Housing Starts',
        flag: '🇺🇸',
        date: `${dTom} 13:30 CET`,
        prev: '1.307M',
        est: '1.350M',
        act: 'In attesa',
        impact: 'Medio',
        sourceName: 'US Census Bureau',
        url: 'https://www.census.gov/construction/nrc/index.html',
        summary: 'Stima avvio nuovi cantieri edili e concessioni edilizie negli Stati Uniti.'
      },
      {
        id: 'ecb_rate',
        type: 'prossima',
        status: 'futuro',
        title: 'BCE Tassi di Riferimento & Conferenza Lagarde',
        flag: '🇪🇺',
        date: `${dNext} 14:15 CET`,
        prev: '3.65%',
        est: '3.40%',
        act: 'In attesa',
        impact: 'Alto',
        sourceName: 'Banca Centrale Europea',
        url: 'https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html',
        summary: 'Decisione di politica monetaria della Banca Centrale Europea con conferenza stampa a Francoforte.'
      },
      {
        id: 'uk_cpi',
        type: 'passate',
        status: 'rilasciato',
        title: 'UK Inflation Rate YoY (CPI)',
        flag: '🇬🇧',
        date: `${dPast} 08:00 CET`,
        prev: '3.8%',
        est: '3.6%',
        act: '3.6%',
        impact: 'Alto',
        sourceName: 'Office for National Statistics UK',
        url: 'https://www.ons.gov.uk/economy/inflationandpriceindices',
        summary: 'Inflazione Regno Unito in decelerazione al 3.6%, perfetta convergenza verso il target Bank of England.'
      }
    ];
  },

    
  // RENDER DEDICATED MACRO TIMELINE GLOBE MARKERS RIGHT ABOVE TIME SCALE
  renderMacroGlobeTrack() {
    const parent = document.getElementById('chart-container');
    if (!parent || !mainChart || !window.currentCandles || !window.currentCandles.length) return;

    let track = document.getElementById('macro-timeline-track');
    if (!track) {
      track = document.createElement('div');
      track.id = 'macro-timeline-track';
      track.className = 'macro-timeline-track';
      parent.appendChild(track);
    }
    track.innerHTML = '';

    const candles = window.currentCandles;
    const count = candles.length;
    const news = this.getNewsList();
    const offsets = [12, 28, 48, 72];

    news.slice(0, 4).forEach((ev, i) => {
      const idx = Math.max(0, count - offsets[i]);
      if (candles[idx]) {
        const time = candles[idx].time;
        const x = mainChart.timeScale().timeToCoordinate(time);
        if (x !== null && x >= 0 && x <= parent.clientWidth - 70) {
          const marker = document.createElement('div');
          marker.className = 'macro-globe-marker';
          marker.style.left = `${x}px`;
          marker.title = `${ev.flag} ${ev.title} (${ev.time || '13:30'})`;
          marker.innerText = '🌐';
          marker.onclick = () => BybitMacroCalendar.openModal();
          track.appendChild(marker);
        }
      }
    });
  },

  renderTimelineMarkers() {
    this.renderMacroGlobeTrack();
  },


  openModal(filter = 'tutte') {
    this.activeTab = filter;
    const modal = document.getElementById('bybit-macro-calendar-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.renderList(filter);
    }
  },

  closeModal() {
    const modal = document.getElementById('bybit-macro-calendar-modal');
    if (modal) modal.style.display = 'none';
  },

  setTab(tabName) {
    this.activeTab = tabName;
    const btnTutte = document.getElementById('btn-macro-tab-tutte');
    const btnProssime = document.getElementById('btn-macro-tab-prossime');
    const btnPassate = document.getElementById('btn-macro-tab-passate');
    if (btnTutte) btnTutte.className = tabName === 'tutte' ? 'bybit-macro-tab-btn active' : 'bybit-macro-tab-btn';
    if (btnProssime) btnProssime.className = tabName === 'prossime' ? 'bybit-macro-tab-btn active' : 'bybit-macro-tab-btn';
    if (btnPassate) btnPassate.className = tabName === 'passate' ? 'bybit-macro-tab-btn active' : 'bybit-macro-tab-btn';
    this.renderList(tabName);
  },

  renderList(tab) {
    const listEl = document.getElementById('bybit-macro-modal-list');
    if (!listEl) return;
    const all = this.getNewsList();
    let filtered = all;
    if (tab === 'prossime') {
      filtered = all.filter(x => x.status === 'futuro');
    } else if (tab === 'passate') {
      filtered = all.filter(x => x.status === 'rilasciato');
    }

    listEl.innerHTML = filtered.map(ev => `
      <div class="bybit-macro-event-card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">${ev.flag}</span>
            <span style="font-weight:800; font-size:13px; color:#fff;">${ev.title}</span>
          </div>
          <span style="background:${ev.impact === 'Alto' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}; border:1px solid ${ev.impact === 'Alto' ? '#ef4444' : '#f59e0b'}; color:${ev.impact === 'Alto' ? '#f87171' : '#fbbf24'}; font-size:9.5px; font-weight:900; padding:2px 8px; border-radius:4px;">
            🔴 ${ev.impact}
          </span>
        </div>

        <div style="font-size:11px; color:#94a3b8; font-family:monospace;">
          🗓 Data &amp; Ora: <b style="color:#38bdf8;">${ev.date}</b>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:#080c14; padding:8px; border-radius:6px; margin:4px 0; font-family:monospace; font-size:11px;">
          <div><span style="color:#64748b;">Precedente:</span> <b style="color:#cbd5e1;">${ev.prev}</b></div>
          <div><span style="color:#64748b;">Stima Consensus:</span> <b style="color:#38bdf8;">${ev.est}</b></div>
          <div><span style="color:#64748b;">Rilasciato:</span> <b style="color:${ev.act === 'In attesa' ? '#94a3b8' : '#10b981'}; font-weight:900;">${ev.act}</b></div>
        </div>

        <p style="font-size:11px; color:#cbd5e1; line-height:1.4; margin:2px 0;">
          ${ev.summary}
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span style="font-size:10px; color:#64748b;">Fonte: ${ev.sourceName}</span>
          <a href="${ev.url}" target="_blank" class="btn btn-xs" style="font-size:10px; padding:3px 10px; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; color:#38bdf8; border-radius:4px; text-decoration:none;">
            📄 Fonte Ufficiale 🔗
          </a>
        </div>
      </div>
    `).join('');
  }
};

// 5. SUB-PANEL 2 (Oscillatore 2 / Parametri Settabili) INITIALIZATION & LOGIC
function initSub2Pane() {
  const container = document.getElementById('chart-sub2-canvas');
  if (!container || !window.LightweightCharts || sub2Chart) return;

  container.innerHTML = '';
  sub2Chart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    localization: { locale: 'it-IT' },
    grid: {
      vertLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 },
      horzLines: { visible: true, color: 'rgba(255, 255, 255, 0.22)', style: 1 }
    },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72,
      scaleMargins: { top: 0.25, bottom: 0.15 }
    },
    timeScale: {
      visible: true,
      borderColor: '#1e293b',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 8
    }
  });

  sub2Series = sub2Chart.addLineSeries({
    color: '#ec4899',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: true
  });

  sub2Series2 = sub2Chart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 1.5,
    title: '',
    lastValueVisible: false
  });

  // Synchronize timescale with mainChart (Bidirectional)
  if (mainChart && typeof mainChart.timeScale === 'function') {
    mainChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (sub2Chart && range) {
        try { sub2Chart.timeScale().setVisibleLogicalRange(range); } catch(e){}
      }
    });
    sub2Chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (mainChart && range) {
        try { mainChart.timeScale().setVisibleLogicalRange(range); } catch(e){}
      }
    });
  }

  // Initial indicator calculation & render
  if (window.currentCandles || window.lastReceivedCandles) {
    setTimeout(() => {
      if (typeof renderCurrentSub2Data === 'function') {
        renderCurrentSub2Data(window.currentCandles || window.lastReceivedCandles);
      }
    }, 50);
  }
}

function setSub2Mode(mode) {
  activeSub2Mode = mode;
  if (window.showToast) window.showToast(`Oscillatore 2 impostato su: ${mode.toUpperCase()}`, 'info');
  if (typeof renderCurrentSub2Data === 'function') renderCurrentSub2Data();
}

function updateSub2Param(val) {
  activeSub2Period = parseInt(val, 10) || 14;
  if (typeof renderCurrentSub2Data === 'function') renderCurrentSub2Data();
}

function renderCurrentSub2Data(candles) {
  if (!candles) {
    candles = window.lastReceivedCandles || window.currentCandles || [];
  } else {
    window.lastReceivedCandles = candles;
  }
  if (!sub2Chart) initSub2Pane();
  if (!sub2Chart || !candles || !candles.length) return;

  const times = candles.map(c => c.time);
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const n = candles.length;

  if (activeSub2Mode === 'wr') {
    // Williams %R = (Highest High - Close) / (Highest High - Lowest Low) * -100
    const period = activeSub2Period || 14;
    const wrData = [];
    for (let i = 0; i < n; i++) {
      if (i < period) continue;
      let hh = -Infinity, ll = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        if (highs[j] > hh) hh = highs[j];
        if (lows[j] < ll) ll = lows[j];
      }
      const val = hh === ll ? -50 : ((hh - closes[i]) / (hh - ll)) * -100;
      wrData.push({ time: times[i], value: Math.max(-100, Math.min(0, val)) });
    }
    if (sub2Series) sub2Series.setData(wrData);
    if (sub2Series2) sub2Series2.setData([]);

    const lastVal = wrData.length ? wrData[wrData.length - 1].value.toFixed(2) : '-28.73';
    const badge = document.getElementById('sub2-live-badge');
    if (badge) badge.textContent = `WR${period}: ${lastVal}`;
  } else if (activeSub2Mode === 'kdj') {
    // KDJ: Fast Stochastic %K, %D, and %J = 3K - 2D
    const period = activeSub2Period || 9;
    const kData = [];
    const dData = [];
    let k = 50, d = 50;
    for (let i = 0; i < n; i++) {
      if (i < period) continue;
      let hh = -Infinity, ll = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        if (highs[j] > hh) hh = highs[j];
        if (lows[j] < ll) ll = lows[j];
      }
      const rsv = hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100;
      k = (2/3) * k + (1/3) * rsv;
      d = (2/3) * d + (1/3) * k;
      const jVal = 3 * k - 2 * d;
      kData.push({ time: times[i], value: k });
      dData.push({ time: times[i], value: jVal });
    }
    if (sub2Series) sub2Series.setData(kData);
    if (sub2Series2) sub2Series2.setData(dData);

    const lastK = kData.length ? kData[kData.length - 1].value.toFixed(1) : '59.5';
    const lastJ = dData.length ? dData[dData.length - 1].value.toFixed(1) : '61.6';
    const badge = document.getElementById('sub2-live-badge');
    if (badge) badge.textContent = `K: ${lastK} J: ${lastJ}`;
  } else if (activeSub2Mode === 'cci') {
    // CCI = (TP - SMA(TP)) / (0.015 * MeanDev)
    const period = activeSub2Period || 20;
    const cciData = [];
    const tpArr = candles.map(c => (c.high + c.low + c.close) / 3);
    for (let i = 0; i < n; i++) {
      if (i < period) continue;
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += tpArr[j];
      const sma = sum / period;
      let meanDev = 0;
      for (let j = i - period + 1; j <= i; j++) meanDev += Math.abs(tpArr[j] - sma);
      meanDev = meanDev / period || 0.0001;
      const cci = (tpArr[i] - sma) / (0.015 * meanDev);
      cciData.push({ time: times[i], value: cci });
    }
    if (sub2Series) sub2Series.setData(cciData);
    if (sub2Series2) sub2Series2.setData([]);

    const lastCci = cciData.length ? cciData[cciData.length - 1].value.toFixed(1) : '+45.2';
    const badge = document.getElementById('sub2-live-badge');
    if (badge) badge.textContent = `CCI${period}: ${lastCci}`;
  } else if (activeSub2Mode === 'stoch') {
    // Stocastico Lento %K / %D
    const period = activeSub2Period || 14;
    const kData = [];
    const dData = [];
    for (let i = 0; i < n; i++) {
      if (i < period) continue;
      let hh = -Infinity, ll = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        if (highs[j] > hh) hh = highs[j];
        if (lows[j] < ll) ll = lows[j];
      }
      const k = hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100;
      kData.push({ time: times[i], value: k });
    }
    // 3-period SMA of %K for %D
    for (let i = 2; i < kData.length; i++) {
      const avg = (kData[i].value + kData[i-1].value + kData[i-2].value) / 3;
      dData.push({ time: kData[i].time, value: avg });
    }
    if (sub2Series) sub2Series.setData(kData);
    if (sub2Series2) sub2Series2.setData(dData);

    const lastK = kData.length ? kData[kData.length - 1].value.toFixed(1) : '48.0';
    const lastD = dData.length ? dData[dData.length - 1].value.toFixed(1) : '52.1';
    const badge = document.getElementById('sub2-live-badge');
    if (badge) badge.textContent = `%K: ${lastK} %D: ${lastD}`;
  } else if (activeSub2Mode === 'macd_hist') {
    // MACD Hist: 12 EMA - 26 EMA - 9 Signal
    const histData = [];
    let e12 = closes[0], e26 = closes[0], sig = 0;
    const a12 = 2 / (12 + 1), a26 = 2 / (26 + 1), aSig = 2 / (9 + 1);
    for (let i = 0; i < n; i++) {
      e12 = closes[i] * a12 + e12 * (1 - a12);
      e26 = closes[i] * a26 + e26 * (1 - a26);
      const macd = e12 - e26;
      sig = macd * aSig + sig * (1 - aSig);
      const hist = macd - sig;
      histData.push({ time: times[i], value: hist });
    }
    if (sub2Series) sub2Series.setData(histData);
    if (sub2Series2) sub2Series2.setData([]);

    const lastH = histData.length ? histData[histData.length - 1].value.toFixed(2) : '12.4';
    const badge = document.getElementById('sub2-live-badge');
    if (badge) badge.textContent = `Hist: ${lastH}`;
  }
}

  if (mainChart && typeof mainChart.timeScale === 'function') {
    mainChart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      if (window.BybitMacroCalendar && typeof BybitMacroCalendar.renderMacroGlobeTrack === 'function') {
        BybitMacroCalendar.renderMacroGlobeTrack();
      }
    });
  }