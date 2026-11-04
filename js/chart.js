/* ==========================================================================
   CHART.JS - LightweightCharts Pro Integration V3 (Sector & Institutional)
   Candlesticks + VWAP + EMA 9/21/200 + Bollinger Bands
   Panel 1: Volume Vertical Bars + Volume 20 Moving Average
   Panel 2: RSI(14) / MACD Momentum Control
   ========================================================================== */

let mainChart = null;
let candleSeries = null;
let vwapSeries = null;

// Line Indicators (EMA 9, EMA 21, EMA 200, Bollinger Bands, Parabolic SAR)
let ema9Series = null;
let ema21Series = null;
let ema200Series = null;
let bbUpperSeries = null;
let bbMiddleSeries = null;
let bbLowerSeries = null;
let sarSeries = null;

// Sub-chart Panel 1: Volume + Volume Moving Average
let volumeChart = null;
let volumeHistogramSeries = null;
let volumeMaSeries = null;

// Sub-chart Panel 2: Momentum (RSI / MACD)
let momentumChart = null;
let rsiSeries = null;
let macdLineSeries = null;
let macdSignalSeries = null;
let macdHistSeries = null;
let activeMomentumMode = 'rsi'; // 'rsi' | 'macd'

// Indicator visibility states
const activeIndicators = {
  vwap: true,
  ema9: true,
  ema21: true,
  ema200: true,
  boll: true,
  sar: false,
  volumePane: true,
  momentumPane: true
};

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
    },
    timeScale: {
      borderColor: '#1e293b',
      timeVisible: true,
      secondsVisible: false,
    },
  });

  // Candlestick Series (Candele Giapponesi)
  candleSeries = mainChart.addCandlestickSeries({
    upColor: '#00f2a1',
    downColor: '#ff4560',
    borderVisible: false,
    wickUpColor: '#00f2a1',
    wickDownColor: '#ff4560',
  });

  // VWAP Line (Volume Weighted Average Price)
  vwapSeries = mainChart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 2,
    title: 'VWAP',
    priceLineVisible: false
  });

  // Institutional EMA Ribbon: 9 (Veloce/Segnale), 21 (Medio/Trend), 200 (Supporto Istituzionale)
  ema9Series = mainChart.addLineSeries({ color: '#00f2a1', lineWidth: 1.5, title: 'EMA 9' });
  ema21Series = mainChart.addLineSeries({ color: '#38bdf8', lineWidth: 1.5, title: 'EMA 21' });
  ema200Series = mainChart.addLineSeries({ color: '#a855f7', lineWidth: 2, title: 'EMA 200' });

  // Bollinger Bands (20, 2)
  bbUpperSeries = mainChart.addLineSeries({ color: 'rgba(99, 102, 241, 0.75)', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
  bbMiddleSeries = mainChart.addLineSeries({ color: 'rgba(99, 102, 241, 0.4)', lineWidth: 1, lineStyle: 0, title: 'BB Mid' });
  bbLowerSeries = mainChart.addLineSeries({ color: 'rgba(99, 102, 241, 0.75)', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });

  // Parabolic SAR
  sarSeries = mainChart.addLineSeries({ color: '#f43f5e', lineWidth: 1, lineStyle: 1, title: 'SAR' });

  // Init Sub-Panels
  initVolumePane();
  initMomentumPane();

  // Window resize handler
  window.addEventListener('resize', () => {
    resizeAllCharts();
  });
}

// ==========================================
// PANNELLO 1: VOLUMI + MEDIA MOBILE VOLUMI
// ==========================================
function initVolumePane() {
  const container = document.getElementById('chart-volume-pane');
  if (!container || !window.LightweightCharts || volumeChart) return;

  container.innerHTML = '';
  volumeChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#070a12' }, textColor: '#64748b', fontSize: 10 },
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
    rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0 } },
    timeScale: { visible: false },
  });

  // Vertical Volume Histogram
  volumeHistogramSeries = volumeChart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  });

  // Volume Moving Average (SMA 20 Volumi)
  volumeMaSeries = volumeChart.addLineSeries({
    color: '#fcd535',
    lineWidth: 1.5,
    title: 'Vol MA (20)',
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
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
    rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: { visible: false },
  });

  rsiSeries = momentumChart.addLineSeries({ color: '#a855f7', lineWidth: 1.5, title: 'RSI 14' });
  macdHistSeries = momentumChart.addHistogramSeries({ color: '#38bdf8', title: 'Istogramma' });
  macdLineSeries = momentumChart.addLineSeries({ color: '#00f2a1', lineWidth: 1.5, title: 'MACD' });
  macdSignalSeries = momentumChart.addLineSeries({ color: '#ff4560', lineWidth: 1.5, title: 'Signal' });
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
// MASTER DATA RENDERER
// ==========================================
function renderChartData(candles) {
  if (!candleSeries || !candles || !candles.length) return;

  // 1. Candele Giapponesi
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

  // 2. VWAP (Volume Weighted Average Price)
  if (activeIndicators.vwap) {
    vwapSeries.setData(calcVWAPData(candles));
  } else {
    vwapSeries.setData([]);
  }

  // 3. EMA Ribbon: EMA 9, EMA 21, EMA 200
  ema9Series.setData(activeIndicators.ema9 ? calcEMAData(times, closes, 9) : []);
  ema21Series.setData(activeIndicators.ema21 ? calcEMAData(times, closes, 21) : []);
  ema200Series.setData(activeIndicators.ema200 ? calcEMAData(times, closes, 200) : []);

  // 4. Bande di Bollinger (20, 2)
  if (activeIndicators.boll) {
    const bb = calcBollingerBands(times, closes, 20, 2);
    bbUpperSeries.setData(bb.upper);
    bbMiddleSeries.setData(bb.middle);
    bbLowerSeries.setData(bb.lower);
  } else {
    bbUpperSeries.setData([]);
    bbMiddleSeries.setData([]);
    bbLowerSeries.setData([]);
  }

  // 5. Parabolic SAR
  sarSeries.setData(activeIndicators.sar ? calcSARData(times, candles) : []);

  // 6. PANNELLO 1: Volumi Verticali + Volume Moving Average (SMA 20)
  if (!volumeChart) initVolumePane();
  if (volumeHistogramSeries && volumeMaSeries) {
    const formattedVol = candles.map(c => ({
      time: c.time,
      value: c.volume || 10,
      color: c.close >= c.open ? 'rgba(0, 242, 161, 0.65)' : 'rgba(255, 69, 96, 0.65)'
    }));
    volumeHistogramSeries.setData(formattedVol);

    // SMA 20 dei volumi
    const volMA = calcVolumeSMA(times, volumes, 20);
    volumeMaSeries.setData(volMA);
  }

  // 7. PANNELLO 2: Momentum (RSI o MACD)
  if (!momentumChart) initMomentumPane();
  if (momentumChart) {
    if (activeMomentumMode === 'rsi') {
      const rsiData = calcRSIData(times, closes, 14);
      rsiSeries.setData(rsiData);
      macdHistSeries.setData([]);
      macdLineSeries.setData([]);
      macdSignalSeries.setData([]);
    } else {
      const macdData = calcMACDData(times, closes);
      rsiSeries.setData([]);
      macdHistSeries.setData(macdData.hist);
      macdLineSeries.setData(macdData.macd);
      macdSignalSeries.setData(macdData.signal);
    }
  }

  mainChart.timeScale().fitContent();
}

function toggleIndicatorKey(key, isChecked) {
  activeIndicators[key] = isChecked;
  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }
}

// ==========================================
// MATHEMATICAL ALGORITHMS
// ==========================================

// VWAP (Volume Weighted Average Price)
function calcVWAPData(candles) {
  const result = [];
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
      value: Math.round((cumVolPrice / cumVol) * 100) / 100
    });
  }
  return result;
}

// Volume Moving Average (SMA 20 dei Volumi)
function calcVolumeSMA(times, volumes, period = 20) {
  if (volumes.length < period) return [];
  const result = [];
  for (let i = period - 1; i < volumes.length; i++) {
    const slice = volumes.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push({
      time: times[i],
      value: Math.round(sum / period)
    });
  }
  return result;
}

// Exponential Moving Average
function calcEMAData(times, data, period) {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result = [];
  let prev = data.slice(0, period).reduce((a, b) => a + b) / period;
  result.push({ time: times[period - 1], value: Math.round(prev * 100) / 100 });

  for (let i = period; i < data.length; i++) {
    const val = data[i] * k + prev * (1 - k);
    result.push({ time: times[i], value: Math.round(val * 100) / 100 });
    prev = val;
  }
  return result;
}

// Bollinger Bands (Upper, Middle, Lower)
function calcBollingerBands(times, data, period = 20, multiplier = 2) {
  const upper = [];
  const middle = [];
  const lower = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push({ time: times[i], value: Math.round((mean + multiplier * stdDev) * 100) / 100 });
    middle.push({ time: times[i], value: Math.round(mean * 100) / 100 });
    lower.push({ time: times[i], value: Math.round((mean - multiplier * stdDev) * 100) / 100 });
  }
  return { upper, middle, lower };
}

// Parabolic SAR
function calcSARData(times, candles) {
  const sar = [];
  for (let i = 5; i < candles.length; i++) {
    const isUp = candles[i].close > candles[i - 5].close;
    sar.push({
      time: times[i],
      value: isUp ? candles[i].low * 0.992 : candles[i].high * 1.008
    });
  }
  return sar;
}

// RSI (14)
function calcRSIData(times, data, period = 14) {
  if (data.length <= period) return [];
  const result = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: times[period], value: Math.round((100 - (100 / (1 + rs))) * 10) / 10 });

  for (let i = period + 1; i < data.length; i++) {
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

// MACD (12, 26, 9)
function calcMACDData(times, data) {
  const ema12 = calcEMAData(times, data, 12);
  const ema26 = calcEMAData(times, data, 26);
  const timeMap26 = new Map(ema26.map(item => [item.time, item.value]));

  const macdLine = [];
  for (const item of ema12) {
    if (timeMap26.has(item.time)) {
      macdLine.push({ time: item.time, value: +(item.value - timeMap26.get(item.time)).toFixed(2) });
    }
  }

  const macdTimes = macdLine.map(m => m.time);
  const macdValues = macdLine.map(m => m.value);
  const signalLine = calcEMAData(macdTimes, macdValues, 9);
  const signalMap = new Map(signalLine.map(item => [item.time, item.value]));

  const hist = [];
  for (const item of macdLine) {
    if (signalMap.has(item.time)) {
      const val = +(item.value - signalMap.get(item.time)).toFixed(2);
      hist.push({
        time: item.time,
        value: val,
        color: val >= 0 ? 'rgba(0, 242, 161, 0.75)' : 'rgba(255, 69, 96, 0.75)'
      });
    }
  }
  return { macd: macdLine, signal: signalLine, hist };
}
