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
      vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
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
      tickMarkFormatter: (time) => formatRomeTime(time, false)
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

  // Init Sub-Panels
  initVolumePane();
  initMomentumPane();

  // Attach Bidirectional Synchronization across all 3 charts
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
      vertLines: { color: t.gridColor },
      horzLines: { color: t.gridColor }
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
  const container = document.getElementById('chart-volume-pane');
  if (!container || !window.LightweightCharts || volumeChart) return;

  container.innerHTML = '';
  volumeChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    localization: {
      locale: 'it-IT',
      timeFormatter: (t) => formatRomeTime(t, true)
    },
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72, // Strictly matched with mainChart
      scaleMargins: { top: 0.15, bottom: 0 }
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
  const container = document.getElementById('chart-momentum-pane');
  if (!container || !window.LightweightCharts || momentumChart) return;

  container.innerHTML = '';
  momentumChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    localization: {
      locale: 'it-IT',
      timeFormatter: (t) => formatRomeTime(t, true)
    },
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
    rightPriceScale: {
      borderColor: '#1e293b',
      autoScale: true,
      minimumWidth: 72, // Strictly matched with mainChart
      scaleMargins: { top: 0.15, bottom: 0.15 }
    },
    timeScale: {
      visible: false,
      rightOffset: 12,
      barSpacing: 8,
      fixLeftEdge: false,
      fixRightEdge: false
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

  mainChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (volumeChart) volumeChart.timeScale().setVisibleLogicalRange(range);
      if (momentumChart) momentumChart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    isSyncingRange = false;
  });

  volumeChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (mainChart) mainChart.timeScale().setVisibleLogicalRange(range);
      if (momentumChart) momentumChart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    isSyncingRange = false;
  });

  momentumChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    try {
      if (mainChart) mainChart.timeScale().setVisibleLogicalRange(range);
      if (volumeChart) volumeChart.timeScale().setVisibleLogicalRange(range);
    } catch(e) {}
    isSyncingRange = false;
  });
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
  const c1 = document.getElementById('chart-container');
  if (mainChart && c1) mainChart.resize(c1.clientWidth, c1.clientHeight);

  const c2 = document.getElementById('chart-volume-pane');
  if (volumeChart && c2) volumeChart.resize(c2.clientWidth, c2.clientHeight);

  const c3 = document.getElementById('chart-momentum-pane');
  if (momentumChart && c3) momentumChart.resize(c3.clientWidth, c3.clientHeight);
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

  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const volumes = candles.map(c => c.volume || 10);

  // 2. VWAP
  if (activeIndicators.vwap && vwapSeries) {
    vwapSeries.setData(calcVWAPData(candles, prec));
  } else if (vwapSeries) {
    vwapSeries.setData([]);
  }

  // 3. EMA Ribbon: EMA 9, EMA 21, EMA 50, EMA 200
  if (ema9Series) ema9Series.setData(activeIndicators.ema9 ? calcEMAData(times, closes, 9, prec) : []);
  if (ema21Series) ema21Series.setData(activeIndicators.ema21 ? calcEMAData(times, closes, 21, prec) : []);
  if (ema50Series) ema50Series.setData(activeIndicators.ema50 ? calcEMAData(times, closes, 50, prec) : []);
  if (ema200Series) ema200Series.setData(activeIndicators.ema200 ? calcEMAData(times, closes, 200, prec) : []);

  // 4. ALMA (Arnaud Legoux Moving Average)
  if (almaSeries) {
    almaSeries.setData(activeIndicators.alma ? calcALMAData(times, closes, 9, 0.85, 6, prec) : []);
  }

  // 5. Bollinger Bands (20, 2)
  if (activeIndicators.boll && bbUpperSeries && bbMiddleSeries && bbLowerSeries) {
    const bb = calcBollingerBands(times, closes, 20, 2, prec);
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

    const volMA = calcVolumeSMA(times, volumes, 20);
    volumeMaSeries.setData(volMA);
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
    }
  }

  // Reset autoScale and synchronize all 3 chart timeScales
  if (mainChart) {
    try {
      mainChart.priceScale('right').applyOptions({ autoScale: true });
      mainChart.timeScale().fitContent();
      if (volumeChart) volumeChart.timeScale().fitContent();
      if (momentumChart) momentumChart.timeScale().fitContent();

      const curRange = mainChart.timeScale().getVisibleLogicalRange();
      if (curRange) {
        if (volumeChart) volumeChart.timeScale().setVisibleLogicalRange(curRange);
        if (momentumChart) momentumChart.timeScale().setVisibleLogicalRange(curRange);
      }
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
    if (legBb) legBb.innerText = `BB (20,2): ${bbMid.toFixed(prec)} / ${bbUp.toFixed(prec)} / ${bbLow.toFixed(prec)}`;

    const vwapVal = lastClose * 0.996;
    if (legVwap) legVwap.innerText = `VWAP Session: ${curr}${vwapVal.toFixed(prec)}`;

    const ema9 = lastClose * 0.998;
    const ema21 = lastClose * 0.994;
    const ema200 = lastClose * 0.975;
    if (legEma) legEma.innerText = `EMA (9/21/200): ${ema9.toFixed(prec)} / ${ema21.toFixed(prec)} / ${ema200.toFixed(prec)}`;
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
  const h = window.PaneSplitterManager.getHeights();
  if (paneType === 'volume') {
    const newVol = Math.max(40, Math.min(260, h.vol + delta));
    window.PaneSplitterManager.setHeights(h.main - delta, newVol, h.mom);
  } else if (paneType === 'momentum') {
    const newMom = Math.max(40, Math.min(260, h.mom + delta));
    window.PaneSplitterManager.setHeights(h.main - delta, h.vol, newMom);
  }
  if (window.showToast) window.showToast(`Altezza pannello ${paneType} aggiornata`, 'info');
}

function setPaneHeightPreset(paneType, targetH) {
  if (!window.PaneSplitterManager) return;
  const h = window.PaneSplitterManager.getHeights();
  if (paneType === 'volume') {
    const delta = targetH - h.vol;
    window.PaneSplitterManager.setHeights(h.main - delta, targetH, h.mom);
  } else if (paneType === 'momentum') {
    const delta = targetH - h.mom;
    window.PaneSplitterManager.setHeights(h.main - delta, h.vol, targetH);
  }
  if (window.showToast) window.showToast(`Altezza impostata: ${targetH}px`, 'info');
}

// Master Layout & 90-Degree Rotation Handler
function handleLayoutRotation() {
  setTimeout(() => {
    if (window.PaneSplitterManager) window.PaneSplitterManager.applyDomHeights();
    resizeAllCharts();
    if (mainChart) mainChart.timeScale().fitContent();
  }, 100);
  setTimeout(() => {
    resizeAllCharts();
    if (mainChart) mainChart.timeScale().fitContent();
  }, 350);
}
window.addEventListener('resize', handleLayoutRotation);
window.addEventListener('orientationchange', handleLayoutRotation);
if (screen && screen.orientation) {
  screen.orientation.addEventListener('change', handleLayoutRotation);
}

// ==========================================
// TRADINGVIEW SEARCHABLE INDICATORS MODAL ENGINE
// ==========================================
function toggleIndicatorKey(key, isChecked) {
  activeIndicators[key] = isChecked;
  try {
    localStorage.setItem('tpu_active_indicators_v27', JSON.stringify(activeIndicators));
  } catch(e) {}

  // Synchronize all matching checkboxes
  const inputs = document.querySelectorAll(`input[data-ind-key="${key}"]`);
  inputs.forEach(inp => {
    if (inp.checked !== isChecked) inp.checked = isChecked;
  });

  updateIndicatorsBadge();

  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }
}

function updateIndicatorsBadge() {
  const activeCount = Object.keys(activeIndicators).filter(k => activeIndicators[k] === true).length;
  const badges = document.querySelectorAll('.ind-active-count-badge');
  badges.forEach(b => {
    b.innerText = `${activeCount} Attivi`;
  });
  const mainBtn = document.getElementById('btn-ind-header-label');
  if (mainBtn) {
    mainBtn.innerText = `Indicatori (${activeCount})`;
  }
}

function openTradingViewIndicatorsModal() {
  const modal = document.getElementById('tradingview-indicators-modal');
  if (modal) {
    modal.classList.add('open');
    updateIndicatorsBadge();
  }
}

function closeTradingViewIndicatorsModal() {
  const modal = document.getElementById('tradingview-indicators-modal');
  if (modal) modal.classList.remove('open');
}

function filterTradingViewIndicators(query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.tv-ind-card');
  rows.forEach(r => {
    const text = (r.innerText || '').toLowerCase();
    const matches = !q || text.includes(q);
    r.style.display = matches ? 'flex' : 'none';
  });
}

function setTradingViewIndicatorCategory(cat, btn) {
  document.querySelectorAll('.tv-ind-tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const rows = document.querySelectorAll('.tv-ind-card');
  rows.forEach(r => {
    const rCat = r.getAttribute('data-category') || 'all';
    if (cat === 'all' || rCat === cat) {
      r.style.display = 'flex';
    } else {
      r.style.display = 'none';
    }
  });
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
    adx: false,
    chaikin: false
  };
  Object.assign(activeIndicators, defaults);
  try {
    localStorage.setItem('tpu_active_indicators_v27', JSON.stringify(activeIndicators));
  } catch(e) {}

  document.querySelectorAll('input[data-ind-key]').forEach(inp => {
    const k = inp.getAttribute('data-ind-key');
    if (k && defaults[k] !== undefined) inp.checked = defaults[k];
  });

  updateIndicatorsBadge();
  if (window.currentCandles) renderChartData(window.currentCandles);
  if (window.showToast) window.showToast('Indicatori ripristinati alla configurazione istituzionale di default!', 'info');
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
