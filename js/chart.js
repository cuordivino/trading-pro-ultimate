/* ==========================================================================
   CHART.JS - LightweightCharts Pro Integration V2
   Candlesticks, Volume, Multi-indicators & Responsive Resizing
   ========================================================================== */

let mainChart = null;
let candleSeries = null;
let volumeSeries = null;

// Indicator series
let ema20Series = null;
let ema50Series = null;
let ema200Series = null;
let bbUpperSeries = null;
let bbLowerSeries = null;
let sarSeries = null;

// Sub-charts
let rsiChart = null;
let rsiSeries = null;
let macdChart = null;
let macdLineSeries = null;
let macdSignalSeries = null;
let macdHistSeries = null;

// Indicator visibility states
const activeIndicators = {
  ma: false,
  ema20: true,
  ema50: true,
  ema200: true,
  boll: false,
  sar: false,
  rsi: false,
  macd: false
};

function initMainChart() {
  const container = document.getElementById('chart-container');
  if (!container || !window.LightweightCharts) return;

  container.innerHTML = '';

  mainChart = LightweightCharts.createChart(container, {
    layout: {
      background: { color: '#0c1017' },
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

  // Candlestick Series
  candleSeries = mainChart.addCandlestickSeries({
    upColor: '#00f2a1',
    downColor: '#ff4560',
    borderVisible: false,
    wickUpColor: '#00f2a1',
    wickDownColor: '#ff4560',
  });

  // Volume Series
  volumeSeries = mainChart.addHistogramSeries({
    color: '#38bdf8',
    priceFormat: { type: 'volume' },
    priceScaleId: '',
    scaleMargins: { top: 0.82, bottom: 0 },
  });

  // Line Indicators
  ema20Series = mainChart.addLineSeries({ color: '#fcd535', lineWidth: 1.5, title: 'EMA 20' });
  ema50Series = mainChart.addLineSeries({ color: '#06b6d4', lineWidth: 1.5, title: 'EMA 50' });
  ema200Series = mainChart.addLineSeries({ color: '#a855f7', lineWidth: 2, title: 'EMA 200' });
  bbUpperSeries = mainChart.addLineSeries({ color: 'rgba(99, 102, 241, 0.7)', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
  bbLowerSeries = mainChart.addLineSeries({ color: 'rgba(99, 102, 241, 0.7)', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });
  sarSeries = mainChart.addLineSeries({ color: '#f43f5e', lineWidth: 1, lineStyle: 1, title: 'SAR' });

  // Window resize handler
  window.addEventListener('resize', () => {
    resizeAllCharts();
  });
}

function resizeAllCharts() {
  const container = document.getElementById('chart-container');
  if (mainChart && container) {
    mainChart.resize(container.clientWidth, container.clientHeight);
  }
  const rsiElem = document.getElementById('chart-rsi-pane');
  if (rsiChart && rsiElem) {
    rsiChart.resize(rsiElem.clientWidth, rsiElem.clientHeight);
  }
  const macdElem = document.getElementById('chart-macd-pane');
  if (macdChart && macdElem) {
    macdChart.resize(macdElem.clientWidth, macdElem.clientHeight);
  }
}

function initRsiChart() {
  const container = document.getElementById('chart-rsi-pane');
  if (!container || !window.LightweightCharts || rsiChart) return;

  rsiChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#090d14' }, textColor: '#64748b', fontSize: 10 },
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
    rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: { visible: false },
  });
  rsiSeries = rsiChart.addLineSeries({ color: '#a855f7', lineWidth: 1.5 });
}

function initMacdChart() {
  const container = document.getElementById('chart-macd-pane');
  if (!container || !window.LightweightCharts || macdChart) return;

  macdChart = LightweightCharts.createChart(container, {
    layout: { background: { color: '#090d14' }, textColor: '#64748b', fontSize: 10 },
    grid: { vertLines: { color: 'transparent' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
    rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: { visible: false },
  });
  macdHistSeries = macdChart.addHistogramSeries({ color: '#38bdf8' });
  macdLineSeries = macdChart.addLineSeries({ color: '#00f2a1', lineWidth: 1 });
  macdSignalSeries = macdChart.addLineSeries({ color: '#ff4560', lineWidth: 1 });
}

function renderChartData(candles) {
  if (!candleSeries || !candles || !candles.length) return;

  const formattedCandles = candles.map(c => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close
  }));
  candleSeries.setData(formattedCandles);

  const formattedVol = candles.map(c => ({
    time: c.time,
    value: c.volume || 10,
    color: c.close >= c.open ? 'rgba(0, 242, 161, 0.35)' : 'rgba(255, 69, 96, 0.35)'
  }));
  volumeSeries.setData(formattedVol);

  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);

  // EMA Lines
  ema20Series.setData(activeIndicators.ema20 ? calcEMAData(times, closes, 20) : []);
  ema50Series.setData(activeIndicators.ema50 ? calcEMAData(times, closes, 50) : []);
  ema200Series.setData(activeIndicators.ema200 ? calcEMAData(times, closes, 200) : []);

  // Bollinger Bands
  if (activeIndicators.boll) {
    const bb = calcBollingerBands(times, closes, 20, 2);
    bbUpperSeries.setData(bb.upper);
    bbLowerSeries.setData(bb.lower);
  } else {
    bbUpperSeries.setData([]);
    bbLowerSeries.setData([]);
  }

  // Parabolic SAR
  sarSeries.setData(activeIndicators.sar ? calcSARData(times, candles) : []);

  // RSI Sub-chart
  if (activeIndicators.rsi) {
    if (!rsiChart) initRsiChart();
    document.getElementById('chart-rsi-pane')?.classList.add('active');
    const rsiData = calcRSIData(times, closes, 14);
    rsiSeries.setData(rsiData);
  } else if (rsiChart) {
    document.getElementById('chart-rsi-pane')?.classList.remove('active');
  }

  // MACD Sub-chart
  if (activeIndicators.macd) {
    if (!macdChart) initMacdChart();
    document.getElementById('chart-macd-pane')?.classList.add('active');
    const macdData = calcMACDData(times, closes);
    macdLineSeries.setData(macdData.macd);
    macdSignalSeries.setData(macdData.signal);
    macdHistSeries.setData(macdData.hist);
  } else if (macdChart) {
    document.getElementById('chart-macd-pane')?.classList.remove('active');
  }

  mainChart.timeScale().fitContent();
}

function toggleIndicatorKey(key, isChecked) {
  activeIndicators[key] = isChecked;
  if (window.currentCandles) {
    renderChartData(window.currentCandles);
  }
}

// Indicator Calculation Helpers
function calcEMAData(times, data, period) {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result = [];
  let prev = data.slice(0, period).reduce((a, b) => a + b) / period;
  result.push({ time: times[period - 1], value: prev });

  for (let i = period; i < data.length; i++) {
    const val = data[i] * k + prev * (1 - k);
    result.push({ time: times[i], value: Math.round(val * 100) / 100 });
    prev = val;
  }
  return result;
}

function calcBollingerBands(times, data, period = 20, multiplier = 2) {
  const upper = [];
  const lower = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push({ time: times[i], value: Math.round((mean + multiplier * stdDev) * 100) / 100 });
    lower.push({ time: times[i], value: Math.round((mean - multiplier * stdDev) * 100) / 100 });
  }
  return { upper, lower };
}

function calcSARData(times, candles) {
  const sar = [];
  for (let i = 5; i < candles.length; i++) {
    const isUp = candles[i].close > candles[i - 5].close;
    sar.push({
      time: times[i],
      value: isUp ? candles[i].low * 0.99 : candles[i].high * 1.01
    });
  }
  return sar;
}

function calcRSIData(times, data, period = 14) {
  const result = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: times[period], value: 100 - (100 / (1 + rs)) });

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

function calcMACDData(times, data) {
  const ema12 = calcEMAData(times, data, 12);
  const ema26 = calcEMAData(times, data, 26);
  const timeMap26 = new Map(ema26.map(item => [item.time, item.value]));

  const macdLine = [];
  for (const item of ema12) {
    if (timeMap26.has(item.time)) {
      macdLine.push({ time: item.time, value: item.value - timeMap26.get(item.time) });
    }
  }

  const macdTimes = macdLine.map(m => m.time);
  const macdValues = macdLine.map(m => m.value);
  const signalLine = calcEMAData(macdTimes, macdValues, 9);
  const signalMap = new Map(signalLine.map(item => [item.time, item.value]));

  const hist = [];
  for (const item of macdLine) {
    if (signalMap.has(item.time)) {
      const val = item.value - signalMap.get(item.time);
      hist.push({
        time: item.time,
        value: val,
        color: val >= 0 ? 'rgba(0, 242, 161, 0.7)' : 'rgba(255, 69, 96, 0.7)'
      });
    }
  }
  return { macd: macdLine, signal: signalLine, hist };
}
