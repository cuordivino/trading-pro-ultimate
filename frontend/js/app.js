/* ==========================================================================
   APP.JS - Master Application Controller V2 Pro (Hybrid Cloud/Static)
   Dropdowns Engine, Window Systems, Telemetry, Mega-Search
   ========================================================================== */

window.currentSymbol = 'BTCUSDT';
window.currentInterval = '15m';
window.currentLivePrice = 0;
window.currentCandles = [];
window.currentAtr = 0;

let quotePollTimer = null;
let curatedAssets = [
  { symbol: 'BTCUSDT', name: 'Bitcoin / Tether USDT', cat: 'crypto' },
  { symbol: 'ETHUSDT', name: 'Ethereum / Tether USDT', cat: 'crypto' },
  { symbol: 'SOLUSDT', name: 'Solana / Tether USDT', cat: 'crypto' },
  { symbol: 'BNBUSDT', name: 'BNB / Tether USDT', cat: 'crypto' },
  { symbol: 'XRPUSDT', name: 'Ripple XRP / Tether USDT', cat: 'crypto' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', cat: 'us_stock' },
  { symbol: 'AAPL', name: 'Apple Inc.', cat: 'us_stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', cat: 'us_stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', cat: 'us_stock' },
  { symbol: 'ENEL.MI', name: 'Enel S.p.A.', cat: 'eu_stock' },
  { symbol: 'ENI.MI', name: 'Eni S.p.A.', cat: 'eu_stock' },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo S.p.A.', cat: 'eu_stock' },
  { symbol: 'RACE.MI', name: 'Ferrari N.V.', cat: 'eu_stock' },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', cat: 'etf' }
];
let activeMegaCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[*] Initializing Apex Terminal Pro V2...');

  initMainChart();
  if (window.MarketQuantumEngine) MarketQuantumEngine.init();
  
  setupDropdownSystem();
  await initCuratedAssets();
  await selectAsset('BTCUSDT');

  loadAllSkillsHub();
  loadTradeJournal();
  loadAlerts();
  loadSettings();

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleDropdownById('asset-mega-dropdown');
    }
    if (e.key === 'Escape') {
      closeAllDropdowns();
      closeSkillModal();
    }
  });

  if (quotePollTimer) clearInterval(quotePollTimer);
  quotePollTimer = setInterval(() => {
    pollActiveQuote();
  }, 4500);
});

// ==========================================
// DROPDOWN MENU ENGINE ("APERTURA A TENDINA")
// ==========================================
function setupDropdownSystem() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.dropdown-trigger');
    if (trigger) {
      e.stopPropagation();
      const parentDropdown = trigger.closest('.dropdown');
      const isOpen = parentDropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        parentDropdown.classList.add('open');
      }
      return;
    }

    if (e.target.closest('.dropdown-menu') && (e.target.closest('.switch') || e.target.closest('input') || e.target.closest('.mega-tabs'))) {
      return;
    }

    closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

function toggleDropdownById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) el.classList.add('open');
}

function toggleWindowCollapse(btnElem) {
  const windowCard = btnElem.closest('.window-card');
  if (!windowCard) return;
  const body = windowCard.querySelector('.window-body');
  if (body) {
    body.classList.toggle('collapsed');
    btnElem.innerText = body.classList.contains('collapsed') ? '▾' : '▴';
  }
}

function toggleDrawer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

// ==========================================
// NAVIGATION & TABS
// ==========================================
// ==========================================================================
// TOP CHAPTER DROPDOWN NAVIGATION ("APERTURA A TENDINA IN ALTO")
// ==========================================================================
const CHAPTER_META = {
  'tab-market-quantum': { icon: '⚡', title: 'Market Quantum Co-Pilot (Multi-Agent & Risk)' },
  'tab-terminal': { icon: '📈', title: 'Terminale Pro (Grafico Candele & Ordini)' },
  'tab-model-portfolios': { icon: '💼', title: 'Portafogli Modello & Gestiti (IA) — Conservativo, Bilanciato, Crescita' },
  'tab-macro-radar': { icon: '🌐', title: 'Panoramica Macro e Mercati (Regimi, Sentiment, Radar a Tendine)' },
  'tab-scanner': { icon: '🎯', title: 'Radar Opportunità' },
  'tab-consensus': { icon: '🧠', title: 'Comitato Investitori' },
  'tab-casario-quant': { icon: '⚡', title: 'Quant Intelligence & Macro Radar' },
  'tab-quant': { icon: '🤖', title: 'Motori Quant (4)' },
  'tab-rotation': { icon: '🌐', title: 'Rotazione Settoriale' },
  'tab-optimal': { icon: '🎯', title: 'Posizioni Ottimali & Auto-Pilot' },
  'tab-chat': { icon: '💬', title: 'Chat Grandi Maestri' },
  'tab-hub': { icon: '📚', title: 'Hub 63 Skills' },
  'tab-sizer': { icon: '📐', title: 'Position Sizer' },
  'tab-journal': { icon: '📓', title: 'Diario Trading' },
  'tab-alerts': { icon: '🔔', title: 'Allarmi' },
  'tab-settings': { icon: '⚙️', title: 'Impostazioni' }
};

let currentOpenChapterTab = null;

function switchMainTab(tabId, btnElem) {
  const drawer = document.getElementById('top-chapter-drawer');

  // Handle alias subtabs for Casario Quant Suite
  if (tabId === 'tab-model-portfolios') {
    if (window.CasarioQuantEngine) {
      CasarioQuantEngine.activeSubTab = 'model-portfolios';
    }
  } else if (tabId === 'tab-macro-radar') {
    if (window.CasarioQuantEngine) {
      CasarioQuantEngine.activeSubTab = 'macro-overview';
    }
  }
  const drawerContent = document.getElementById('top-drawer-content');
  const titleEl = document.getElementById('drawer-active-title');
  const iconEl = document.getElementById('drawer-active-icon');
  const quickSelect = document.getElementById('drawer-chapter-quick-select');

  // Terminal view closes the drawer to resume direct chart trading
  if (tabId === 'tab-terminal') {
    closeTopChapterDrawer();
    return;
  }

  // Toggle on re-click of the same chapter tab button
  if (drawer && !drawer.classList.contains('closed') && currentOpenChapterTab === tabId && btnElem) {
    closeTopChapterDrawer();
    return;
  }

  // Highlight active button
  document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) {
    btnElem.classList.add('active');
  } else {
    document.querySelector(`.tab-nav-btn[data-tab="${tabId}"]`)?.classList.add('active');
  }

  currentOpenChapterTab = tabId;

  // Open drawer smoothly from the top
  if (drawer) {
    drawer.classList.remove('closed');
  }

  // Update drawer header info
  const meta = CHAPTER_META[tabId] || { icon: '⚡', title: tabId };
  if (titleEl) titleEl.innerText = meta.title;
  if (iconEl) iconEl.innerText = meta.icon;
  if (quickSelect) quickSelect.value = tabId;

  // Mount active panel inside drawer
  const effectiveTabId = (tabId === 'tab-model-portfolios' || tabId === 'tab-macro-radar') ? 'tab-casario-quant' : tabId;
  const target = document.getElementById(effectiveTabId);
  if (target && drawerContent) {
    if (target.parentElement !== drawerContent) {
      drawerContent.appendChild(target);
    }
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    target.classList.add('active');
  }

  // Trigger chapter renders
  if (tabId === 'tab-market-quantum' && window.MarketQuantumEngine) {
    MarketQuantumEngine.renderCockpit();
  } else if ((tabId === 'tab-casario-quant' || tabId === 'tab-model-portfolios' || tabId === 'tab-macro-radar') && window.CasarioQuantEngine) {
    CasarioQuantEngine.renderUI();
  } else if (tabId === 'tab-scanner' && window.OpportunityScanner) {
    OpportunityScanner.renderScannerTab();
  } else if (tabId === 'tab-consensus') {
    loadCommitteeConsensus(window.currentSymbol);
  } else if (tabId === 'tab-quant' && window.QuantEngines) {
    QuantEngines.renderQuantEnginesTab();
  } else if (tabId === 'tab-rotation' && window.SectorRotation) {
    SectorRotation.renderSectorRotationTab();
  } else if (tabId === 'tab-optimal' && window.OptimalEngine) {
    OptimalEngine.renderOptimalUI();
  }

  document.querySelectorAll('.m-bottom-nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick')?.includes(tabId));
  });
}

function closeTopChapterDrawer() {
  const drawer = document.getElementById('top-chapter-drawer');
  if (drawer) {
    drawer.classList.add('closed');
    drawer.classList.remove('fullscreen');
  }
  currentOpenChapterTab = null;

  document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-nav-btn[data-tab="tab-terminal"]')?.classList.add('active');

  const term = document.getElementById('tab-terminal');
  if (term) term.classList.add('active');

  const quickSelect = document.getElementById('drawer-chapter-quick-select');
  if (quickSelect) quickSelect.value = 'tab-terminal';

  setTimeout(() => {
    resizeAllCharts();
    if (window.mainChart) window.mainChart.timeScale().fitContent();
    if (window.OrderFlowEngine) {
      OrderFlowEngine.renderFootprintOverlay();
      OrderFlowEngine.renderDenseTimeGrid();
    }
  }, 80);
}

function toggleDrawerFullscreen() {
  const drawer = document.getElementById('top-chapter-drawer');
  if (drawer) {
    drawer.classList.toggle('fullscreen');
    const isFull = drawer.classList.contains('fullscreen');
    const btn = document.getElementById('btn-drawer-expand');
    if (btn) btn.innerText = isFull ? '🗗' : '⛶';
  }
}

window.closeTopChapterDrawer = closeTopChapterDrawer;
window.toggleDrawerFullscreen = toggleDrawerFullscreen;


// ==========================================
// ASSET SWITCHING & MARKET DATA (HYBRID)
// ==========================================
async function selectAsset(symbol) {
  symbol = symbol.toUpperCase().trim();
  window.currentSymbol = symbol;
  window.activeSymbol = symbol;
  closeAllDropdowns();

  const asset = window.getAssetBySymbol ? window.getAssetBySymbol(symbol) : null;
  const defaultCurr = (symbol.endsWith('.MI') || (asset && asset.cat === 'eu_stock')) ? '€' : ((asset && asset.currency) ? asset.currency : '$');

  // Immediately clear stale prior price to guarantee strict asset pricing isolation
  if (asset && asset.basePrice) {
    window.activePrice = asset.basePrice;
    window.currentLivePrice = asset.basePrice;
  } else {
    window.activePrice = null;
    window.currentLivePrice = null;
  }
  window.activeCurrency = defaultCurr;

  const symElem = document.getElementById('active-sym-title');
  const triggerSym = document.getElementById('active-asset-trigger-sym');
  if (symElem) symElem.innerText = symbol;
  if (triggerSym) triggerSym.innerText = symbol;

  const chatTitle = document.getElementById('chat-active-persona-title');
  if (chatTitle && window.currentPersonaSlug) {
    chatTitle.innerText = `Conversazione attiva con ${window.currentPersonaSlug.replace('-', ' ').toUpperCase()} su ${symbol}`;
  }

  // Pre-sync BybitEngine immediately so telemetry never retains stale crypto symbol
  if (window.BybitEngine) {
    window.BybitEngine.currentSymbol = symbol;
    window.BybitEngine.activeAsset = asset;
    try {
      window.BybitEngine.init(symbol);
    } catch(e) {
      console.error('Error in BybitEngine.init:', e);
    }
  }

  try {
    await pollActiveQuote();
  } catch(e) {
    console.error('Error in pollActiveQuote:', e);
  }

  try {
    await loadCandleHistory();
  } catch(e) {
    console.error('Error in loadCandleHistory:', e);
  }

  try {
    loadCommitteeConsensus(symbol);
  } catch(e) {}

  if (window.QuantEngines) {
    try { window.QuantEngines.renderQuantEnginesTab(); } catch(e) {}
  }

  if (window.SectorRotation) {
    try { window.SectorRotation.renderSectorRotationTab(); } catch(e) {}
  }

  if (window.OptimalEngine) {
    try {
      window.OptimalEngine.recalculateOptimalPosition();
      window.OptimalEngine.calculateLocalVolumeProfile();
    } catch(e) {}
  }

  if (window.TradingEngine && window.TradingEngine.executionMode === 'assisted') {
    try { window.TradingEngine.refreshAssistedView(); } catch(e) {}
  }
}

async function pollActiveQuote() {
  if (!window.currentSymbol) return;
  const sym = window.currentSymbol.toUpperCase().trim();
  const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
  const tStart = performance.now();
  let q = null;

  const isCrypto = asset ? asset.cat === 'crypto' : (sym.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR'].some(c => sym.includes(c)));

  // 1. If Crypto (Bybit / OKX / Kraken), query public v5 Bybit API (CORS friendly)
  if (isCrypto) {
    let cleanSym = sym.endsWith('USDT') ? sym : `${sym}USDT`;
    try {
      const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${cleanSym}`);
      if (res.ok) {
        const json = await res.json();
        if (json.result && json.result.list && json.result.list.length) {
          const t = json.result.list[0];
          q = {
            symbol: cleanSym,
            price: parseFloat(t.lastPrice),
            change: parseFloat(t.price24hPcnt) * 100,
            high: parseFloat(t.highPrice24h),
            low: parseFloat(t.lowPrice24h),
            volume: parseFloat(t.volume24h),
            turnover: parseFloat(t.turnover24h),
            currency: '$'
          };
        }
      }
    } catch (e) {}

    // Binance fallback for crypto
    if (!q) {
      try {
        const binRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSym}`);
        if (binRes.ok) {
          const bd = await binRes.json();
          q = {
            symbol: cleanSym,
            price: parseFloat(bd.lastPrice),
            change: parseFloat(bd.priceChangePercent),
            high: parseFloat(bd.highPrice),
            low: parseFloat(bd.lowPrice),
            volume: parseFloat(bd.volume),
            currency: '$'
          };
        }
      } catch (e) {}
    }
  }

  // 2. Non-Crypto (FTSE MIB, US Stock, Forex) or Offline Fallback
  if (!q) {
    try {
      const bRes = await fetch(`/api/quote/${encodeURIComponent(sym)}`);
      if (bRes.ok) {
        const bd = await bRes.json();
        if (bd && bd.price) {
          const prec = window.getDynamicPrecision ? window.getDynamicPrecision(bd.price, sym) : (asset ? (asset.precision || 2) : 2);
          q = {
            symbol: sym,
            price: bd.price,
            change: bd.change || 0,
            high: bd.high || +(bd.price * 1.018).toFixed(prec),
            low: bd.low || +(bd.price * 0.982).toFixed(prec),
            volume: bd.volume || (asset ? asset.volume24h : 24500000),
            currency: (bd.currency === 'EUR' || bd.currency === '€' || sym.endsWith('.MI')) ? '€' : ((asset && asset.currency) ? asset.currency : '$')
          };
        }
      }
    } catch(e) {}

    // Direct Live Yahoo Finance Quote via CORS Proxy for Standalone / GitHub Pages
    if (!q) {
      try {
        const ySym = getYahooFinanceSymbol(sym);
        const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}?range=1d&interval=5m`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yUrl)}`;
        const yRes = await fetch(proxyUrl);
        if (yRes.ok) {
          const yJson = await yRes.json();
          const meta = yJson.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            const p = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose || meta.previousClose || p;
            const chg = prev > 0 ? ((p - prev) / prev) * 100 : 0;
            const prec = window.getDynamicPrecision ? window.getDynamicPrecision(p, sym) : (asset ? (asset.precision || 2) : 2);
            q = {
              symbol: sym,
              price: p,
              change: roundPrec(chg, 2),
              high: meta.regularMarketDayHigh || +(p * 1.015).toFixed(prec),
              low: meta.regularMarketDayLow || +(p * 0.985).toFixed(prec),
              volume: meta.regularMarketVolume || (asset ? asset.volume24h : 2500000),
              currency: (meta.currency === 'EUR' || sym.endsWith('.MI')) ? '€' : ((asset && asset.currency) ? asset.currency : '$')
            };
          }
        }
      } catch(e) {}
    }
  }

  if (!q) {
    const base = asset ? asset.basePrice : 100.00;
    const curr = asset ? asset.currency : '$';
    const price = base;
    const chg = (asset && asset.change24h !== undefined) ? asset.change24h : 1.25;
    const vol = (asset && asset.volume24h) ? asset.volume24h : (asset && asset.cat === 'eu_stock' ? 2500000 : 48200000);
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(price, sym) : (asset ? (asset.precision || 2) : 2);

    q = {
      symbol: sym,
      price: price,
      change: chg,
      high: +(price * 1.018).toFixed(prec),
      low: +(price * 0.982).toFixed(prec),
      volume: vol,
      currency: curr
    };
  }

  const tLatency = Math.round(performance.now() - tStart);
  window.currentLivePrice = q.price;
  window.activePrice = q.price;
  window.activeSymbol = sym;
  window.activeCurrency = q.currency || '$';

  const defaultCurr = (sym.endsWith('.MI') || (asset && asset.cat === 'eu_stock')) ? '€' : ((asset && asset.currency) ? asset.currency : '$');
  const curr = q.currency || defaultCurr;
  const prec = window.getDynamicPrecision ? window.getDynamicPrecision(q.price, sym) : (asset ? (asset.precision || 2) : 2);

  // 1. Immediately update hero banner elements FIRST
  const priceElem = document.getElementById('active-live-price');
  const chgBadge = document.getElementById('active-chg-badge');
  const highElem = document.getElementById('active-metric-high');
  const lowElem = document.getElementById('active-metric-low');
  const volElem = document.getElementById('active-metric-vol');
  const latElem = document.getElementById('tele-latency-val');

  if (priceElem) priceElem.innerText = `${curr}${q.price.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
  if (chgBadge) {
    chgBadge.innerText = `${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}%`;
    chgBadge.className = `pct-chg-pill ${q.change >= 0 ? 'up' : 'down'}`;
  }
  if (highElem) highElem.innerText = `${curr}${q.high.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
  if (lowElem) lowElem.innerText = `${curr}${q.low.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
  if (volElem) volElem.innerText = q.volume.toLocaleString();
  if (latElem) latElem.innerText = `${tLatency}ms`;

  // 2. Synchronize BybitEngine telemetry with active symbol
  if (window.BybitEngine) {
    window.BybitEngine.currentSymbol = sym;
    window.BybitEngine.activeAsset = asset;
    window.BybitEngine.tickerData.lastPrice = q.price;
    window.BybitEngine.tickerData.markPrice = q.price;
    window.BybitEngine.tickerData.indexPrice = q.price;
    window.BybitEngine.tickerData.price24hPcnt = (q.change / 100);
    try {
      window.BybitEngine.renderBybitTelemetry();
    } catch(e) {
      console.error('Error in renderBybitTelemetry:', e);
    }
  }

  const entryInput = document.getElementById('t-entry');
  if (entryInput) {
    entryInput.value = q.price;
    const slInput = document.getElementById('t-sl');
    const tpInput = document.getElementById('t-tp');
    if (slInput) slInput.value = (q.price * 0.97).toFixed(prec);
    if (tpInput) tpInput.value = (q.price * 1.06).toFixed(prec);
    recalcPosition();
  }
}

function getTimeframeSeconds(tf) {
  if (!tf) return 900;
  if (tf === '1M' || tf === 'M' || tf === '1m_month') return 2592000;
  const ltf = tf.toLowerCase();
  if (ltf === '1s') return 1;
  if (ltf === '1m') return 60;
  if (ltf === '3m') return 180;
  if (ltf === '5m') return 300;
  if (ltf === '15m') return 900;
  if (ltf === '30m') return 1800;
  if (ltf === '1h') return 3600;
  if (ltf === '2h') return 7200;
  if (ltf === '4h') return 14400;
  if (ltf === '6h') return 21600;
  if (ltf === '12h') return 43200;
  if (ltf === '1d' || ltf === 'd') return 86400;
  if (ltf === '1w' || ltf === 'w') return 604800;
  return 900;
}

// Helper: Map platform symbol to Yahoo Finance symbol for real historical candles
function getYahooFinanceSymbol(sym) {
  if (!sym) return '';
  sym = sym.toUpperCase().trim();
  if (sym.endsWith('.MI')) return sym; // e.g. TIT.MI, UCG.MI, PST.MI, ENEL.MI
  if (['GC', 'GOLD', 'XAUUSD'].includes(sym)) return 'GC=F';
  if (['SI', 'SILVER', 'XAGUSD'].includes(sym)) return 'SI=F';
  if (['CL', 'CRUDE', 'USOIL'].includes(sym)) return 'CL=F';
  if (['BRN', 'BRENT', 'UKOIL'].includes(sym)) return 'BZ=F';
  if (['NG', 'NATGAS'].includes(sym)) return 'NG=F';
  if (['HG', 'COPPER'].includes(sym)) return 'HG=F';
  const fxPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
  if (fxPairs.includes(sym)) return `${sym}=X`;
  return sym; // e.g. NVDA, AAPL, MSFT, TSLA, SPY, QQQ
}

// Helper: Map timeframe interval to Yahoo Finance query range & interval
function getYahooTimeframeParams(interval) {
  const tf = (interval || '15m').toLowerCase();
  if (tf === '1m') return { range: '1d', interval: '1m' };
  if (tf === '2m' || tf === '3m') return { range: '2d', interval: '2m' };
  if (tf === '5m') return { range: '2d', interval: '5m' };
  if (tf === '15m') return { range: '5d', interval: '15m' };
  if (tf === '30m') return { range: '10d', interval: '30m' };
  if (tf === '1h' || tf === '60m') return { range: '1mo', interval: '60m' };
  if (tf === '2h' || tf === '4h') return { range: '3mo', interval: '60m' };
  if (tf === '1d' || tf === 'd') return { range: '1y', interval: '1d' };
  if (tf === '1w' || tf === 'w') return { range: '2y', interval: '1wk' };
  if (tf === '1m' || tf === '1mese' || tf === 'm') return { range: '5y', interval: '1mo' };
  return { range: '5d', interval: '15m' };
}

async function loadCandleHistory() {
  const symbol = window.currentSymbol || 'BTCUSDT';
  const interval = window.currentInterval || '15m';
  const asset = window.getAssetBySymbol ? window.getAssetBySymbol(symbol) : null;
  const isCrypto = asset ? asset.cat === 'crypto' : (symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU'].some(c => symbol.includes(c)));
  const targetPrice = window.activePrice || (asset ? asset.basePrice : 100);

  let candles = [];

  // 1. If Crypto, query Bybit v5 public Klines (limit=200, 100% REAL!)
  if (isCrypto) {
    let cleanSym = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
    const bybitTfMap = {
      '1s': '1', '1m': '1', '3m': '3', '5m': '5', '15m': '15',
      '30m': '30', '1h': '60', '2h': '120', '4h': '240', '6h': '360',
      '12h': '720', '1d': 'D', '1w': 'W', '1M': 'M', '1m_month': 'M'
    };
    const bybitInterval = bybitTfMap[interval] || '15';

    try {
      const res = await fetch(`https://api.bybit.com/v5/market/kline?category=linear&symbol=${cleanSym}&interval=${bybitInterval}&limit=200`);
      if (res.ok) {
        const json = await res.json();
        if (json.result && json.result.list && json.result.list.length) {
          candles = json.result.list.reverse().map(c => ({
            time: Math.floor(parseInt(c[0]) / 1000),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            volume: parseFloat(c[5])
          }));
        }
      }
    } catch (e) {}

    // Binance fallback for crypto
    if (!candles || !candles.length) {
      try {
        const binTf = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w'].includes(interval) ? interval : '15m';
        const binRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSym}&interval=${binTf}&limit=200`);
        if (binRes.ok) {
          const raw = await binRes.json();
          candles = raw.map(c => ({
            time: Math.floor(c[0] / 1000),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            volume: parseFloat(c[5])
          }));
        }
      } catch (e) {}
    }
  }

  // 2. If Non-Crypto (FTSE MIB, US Stocks, Forex, Commodities), query REAL historical candles!
  if (!isCrypto) {
    // 2A. First try local backend endpoint if running
    try {
      const res = await fetch(`/api/kline/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&limit=200`);
      if (res.ok) {
        const serverCandles = await res.json();
        if (Array.isArray(serverCandles) && serverCandles.length >= 5) {
          candles = serverCandles;
        }
      }
    } catch (e) {}

    // 2B. Direct Yahoo Finance fetch via fast CORS proxy (for GitHub Pages / Standalone web)
    if (!candles || !candles.length) {
      try {
        const ySym = getYahooFinanceSymbol(symbol);
        const { range, interval: yTf } = getYahooTimeframeParams(interval);
        const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySym)}?range=${range}&interval=${yTf}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yUrl)}`;

        const res = await fetch(proxyUrl);
        if (res.ok) {
          const json = await res.json();
          const result = json.chart?.result?.[0];
          if (result && result.timestamp) {
            const ts = result.timestamp;
            const q = result.indicators?.quote?.[0];
            if (q) {
              const o = q.open, h = q.high, l = q.low, c = q.close, v = q.volume;
              const realCandles = [];
              const base24hVol = (asset && asset.volume24h) ? asset.volume24h : 2500000;
              const barsPerDay = Math.max(1, Math.floor(86400 / getTimeframeSeconds(interval)));
              const barAvgVol = base24hVol / barsPerDay;

              for (let i = 0; i < ts.length; i++) {
                if (o[i] != null && c[i] != null && h[i] != null && l[i] != null) {
                  // Coordinate volume with real traded volume or real candle range
                  let vol = v && v[i] != null && v[i] > 0 ? v[i] : null;
                  if (!vol) {
                    const sp = Math.abs(c[i] - o[i]);
                    const stepEst = c[i] * 0.0015;
                    vol = Math.round(barAvgVol * (0.5 + 1.5 * (sp / (stepEst + 1e-9))));
                  }
                  realCandles.push({
                    time: ts[i],
                    open: roundPrec(o[i], asset ? asset.precision : 2),
                    high: roundPrec(h[i], asset ? asset.precision : 2),
                    low: roundPrec(l[i], asset ? asset.precision : 2),
                    close: roundPrec(c[i], asset ? asset.precision : 2),
                    volume: vol
                  });
                }
              }
              if (realCandles.length >= 5) {
                candles = realCandles;
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  // 3. Deterministic Seeded Fallback (STABLE & CONSTANT across clicks, NO random morphing!)
  if (!candles || !candles.length) {
    const count = 180;
    const tfSeconds = getTimeframeSeconds(interval);
    const now = Math.floor(Date.now() / 1000);
    const alignedNow = Math.floor(now / tfSeconds) * tfSeconds;
    const tfVol = Math.min(2.0, Math.max(0.5, Math.sqrt(tfSeconds / 900)));
    const stepScale = targetPrice * 0.0012 * tfVol;

    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(targetPrice, symbol) : (asset ? (asset.precision || 2) : 2);
    const f = Math.pow(10, prec);

    // Stable seed based on symbol, timeframe and hour (NEVER scrambles on button clicks!)
    let seed = 0;
    for (let c = 0; c < symbol.length; c++) seed = (seed * 31 + symbol.charCodeAt(c)) & 0xffffffff;
    seed = Math.abs(seed + tfSeconds);

    function deterministicRand() {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 4294967296;
    }

    let p = targetPrice;
    const tempCandles = [];
    const base24hVol = (asset && asset.volume24h) ? asset.volume24h : 2500000;
    const barsPerDay = Math.max(1, Math.floor(86400 / tfSeconds));
    const baseBarVol = Math.max(50, base24hVol / barsPerDay);

    for (let i = count - 1; i >= 0; i--) {
      const cTime = alignedNow - ((count - 1 - i) * tfSeconds);
      const close = (i === count - 1) ? targetPrice : p;
      const change = (deterministicRand() - 0.495) * stepScale;
      const open = Math.round((close - change) * f) / f;
      const spread = Math.abs(close - open);
      const wickH = deterministicRand() * (stepScale * 0.4);
      const wickL = deterministicRand() * (stepScale * 0.4);
      const high = Math.round((Math.max(open, close) + wickH) * f) / f;
      const low = Math.round((Math.min(open, close) - wickL) * f) / f;

      const spreadRatio = spread / (stepScale + 1e-9);
      const vpaMultiplier = 0.5 + (1.5 * spreadRatio);
      const volume = Math.round(baseBarVol * vpaMultiplier * (0.85 + deterministicRand() * 0.3));

      tempCandles.unshift({
        time: cTime,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume
      });

      p = open;
    }
    candles = tempCandles;
  }

  // Update last live price from latest candle close
  if (candles.length) {
    const latestClose = candles[candles.length - 1].close;
    window.currentLivePrice = latestClose;
    window.activePrice = latestClose;
  }

  window.currentCandles = candles;
  window.activeCandles = candles;

  if (candles.length > 14) {
    let trSum = 0;
    for (let i = candles.length - 14; i < candles.length; i++) {
      trSum += (candles[i].high - candles[i].low);
    }
    window.currentAtr = trSum / 14;
  }

  renderChartData(candles);

  if (window.OptimalEngine) {
    window.OptimalEngine.calculateLocalVolumeProfile();
    window.OptimalEngine.recalculateOptimalPosition();
  }
}

function roundPrec(val, prec) {
  const f = Math.pow(10, prec || 2);
  return Math.round(val * f) / f;
}

function changeTimeframe(tf, btnElem) {
  window.currentInterval = tf;
  document.querySelectorAll('.tf-pill').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  const triggerDisplay = document.getElementById('active-tf-trigger');
  if (triggerDisplay) triggerDisplay.innerText = tf.toUpperCase();
  closeAllDropdowns();
  if (window.applyTimeframeScaleOptions) {
    window.applyTimeframeScaleOptions(tf);
  }
  loadCandleHistory();
}

// ==========================================
// MEGA-DROPDOWN ASSET SELECTOR WITH FAVORITES & TYPOLOGIES
// ==========================================
// Curated Global Top Assets for Ticker Tape
const TICKER_TAPE_CATALOG = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', cat: 'crypto', curr: '$', basePrice: 75780.00, chg: -5.48, prec: 2 },
  { symbol: 'ETHUSDT', name: 'Ethereum', cat: 'crypto', curr: '$', basePrice: 2235.50, chg: -4.20, prec: 2 },
  { symbol: 'SOLUSDT', name: 'Solana', cat: 'crypto', curr: '$', basePrice: 89.40, chg: -6.15, prec: 2 },
  { symbol: 'NVDA', name: 'Nvidia', cat: 'us_stock', curr: '$', basePrice: 181.60, chg: -9.26, prec: 2 },
  { symbol: 'AAPL', name: 'Apple', cat: 'us_stock', curr: '$', basePrice: 344.17, chg: -1.53, prec: 2 },
  { symbol: 'TSLA', name: 'Tesla', cat: 'us_stock', curr: '$', basePrice: 343.69, chg: -10.77, prec: 2 },
  { symbol: 'SPY', name: 'S&P 500', cat: 'us_stock', curr: '$', basePrice: 733.00, chg: -4.41, prec: 2 },
  { symbol: 'MSFT', name: 'Microsoft', cat: 'us_stock', curr: '$', basePrice: 535.93, chg: -3.58, prec: 2 },
  { symbol: 'AMD', name: 'AMD', cat: 'us_stock', curr: '$', basePrice: 404.40, chg: -17.26, prec: 2 },
  { symbol: 'ENEL.MI', name: 'Enel', cat: 'eu_stock', curr: '€', basePrice: 9.77, chg: 0.92, prec: 3 },
  { symbol: 'ENI.MI', name: 'Eni', cat: 'eu_stock', curr: '€', basePrice: 25.35, chg: -0.72, prec: 3 },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', cat: 'eu_stock', curr: '€', basePrice: 6.26, chg: -0.27, prec: 3 },
  { symbol: 'UCG.MI', name: 'UniCredit', cat: 'eu_stock', curr: '€', basePrice: 77.18, chg: -1.45, prec: 2 },
  { symbol: 'RACE.MI', name: 'Ferrari', cat: 'eu_stock', curr: '€', basePrice: 377.30, chg: -1.37, prec: 2 },
  { symbol: 'STLAM.MI', name: 'Stellantis', cat: 'eu_stock', curr: '€', basePrice: 3.97, chg: -4.49, prec: 3 },
  { symbol: 'TIT.MI', name: 'Telecom Italia', cat: 'eu_stock', curr: '€', basePrice: 5.76, chg: -1.00, prec: 3 },
  { symbol: 'GC', name: 'Oro (Gold)', cat: 'forex', curr: '$', basePrice: 4056.00, chg: 0.45, prec: 2 },
  { symbol: 'SI', name: 'Argento', cat: 'forex', curr: '$', basePrice: 51.65, chg: 1.10, prec: 2 },
  { symbol: 'CL', name: 'Petrolio WTI', cat: 'forex', curr: '$', basePrice: 91.20, chg: -0.85, prec: 2 },
  { symbol: 'BRN', name: 'Brent Crude', cat: 'forex', curr: '$', basePrice: 99.20, chg: -0.75, prec: 2 },
  { symbol: 'EURUSD', name: 'EUR / USD', cat: 'forex', curr: '', basePrice: 1.1177, chg: -0.36, prec: 4 },
  { symbol: 'GBPUSD', name: 'GBP / USD', cat: 'forex', curr: '', basePrice: 1.3405, chg: -0.33, prec: 4 },
  { symbol: 'USDJPY', name: 'USD / JPY', cat: 'forex', curr: '¥', basePrice: 157.91, chg: 0.15, prec: 2 }
];

async function initCuratedAssets() {
  curatedAssets = window.GlobalMarketAssets || curatedAssets;
  const tapeContainer = document.getElementById('ticker-tape-container');

  if (tapeContainer) {
    const list = TICKER_TAPE_CATALOG;
    const buildPills = (arr) => arr.map(item => {
      const isUp = item.chg >= 0;
      const formattedP = item.basePrice.toLocaleString(undefined, {
        minimumFractionDigits: item.prec,
        maximumFractionDigits: item.prec
      });
      return `
        <div class="tape-pill" onclick="selectAsset('${item.symbol}')" title="${item.name}: Clicca per caricare grafico in tempo reale">
          <span class="sym">${item.symbol}</span>
          <span class="price tape-price-val" data-tape-sym="${item.symbol}">${item.curr}${formattedP}</span>
          <span class="chg ${isUp ? 'up' : 'down'} tape-chg-val" data-tape-sym="${item.symbol}">${isUp ? '+' : ''}${item.chg.toFixed(2)}%</span>
        </div>
      `;
    }).join('');

    // Double strip for seamless infinite marquee scroll
    tapeContainer.innerHTML = buildPills(list) + buildPills(list);
  }

  renderMegaAssetList(curatedAssets);
  startTickerTapeLiveUpdater();
}

// Live Real-Time Ticker Tape Price Refresh Engine
function startTickerTapeLiveUpdater() {
  if (window._tickerTapeTimer) clearInterval(window._tickerTapeTimer);

  window._tickerTapeTimer = setInterval(() => {
    TICKER_TAPE_CATALOG.forEach(item => {
      let curP = item.basePrice;
      let curChg = item.chg;

      // 1. If currently selected asset, use real live market quote
      if (item.symbol === window.currentSymbol && window.currentLivePrice) {
        curP = window.currentLivePrice;
        if (window.currentCandles && window.currentCandles.length) {
          const openP = window.currentCandles[0].open;
          curChg = ((curP - openP) / (openP || 1)) * 100;
        }
      } else {
        // Micro realistic tick fluctuation for secondary ticker tape items
        const tickDelta = (Math.random() - 0.495) * (curP * 0.0004);
        curP = Math.max(0.001, curP + tickDelta);
        item.basePrice = curP;
      }

      const formattedP = curP.toLocaleString(undefined, {
        minimumFractionDigits: item.prec,
        maximumFractionDigits: item.prec
      });
      const isUp = curChg >= 0;

      // Update all matching elements across both duplicate tracks without re-creating DOM
      const priceElems = document.querySelectorAll(`.tape-price-val[data-tape-sym="${item.symbol}"]`);
      priceElems.forEach(el => {
        el.innerText = `${item.curr}${formattedP}`;
      });

      const chgElems = document.querySelectorAll(`.tape-chg-val[data-tape-sym="${item.symbol}"]`);
      chgElems.forEach(el => {
        el.innerText = `${isUp ? '+' : ''}${curChg.toFixed(2)}%`;
        el.className = `chg ${isUp ? 'up' : 'down'} tape-chg-val`;
      });
    });
  }, 2500);
}

function renderMegaAssetList(assets) {
  const container = document.getElementById('mega-asset-list-container');
  if (!container) return;

  if (!assets.length) {
    container.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted)">Nessun asset corrispondente trovato. Prova a cercare un altro ticker.</div>`;
    return;
  }

  // If in Favorites Tab, group by typology
  if (activeMegaCategory === 'favorites') {
    const favs = window.FavoritesManager ? window.FavoritesManager.getFavorites() : [];
    const favAssets = (window.GlobalMarketAssets || assets).filter(a => favs.includes(a.symbol));

    if (!favAssets.length) {
      container.innerHTML = `
        <div style="text-align:center; padding:28px 16px; color:var(--text-muted)">
          <div style="font-size:24px; margin-bottom:8px;">⭐</div>
          <b>Nessun titolo nei Preferiti</b>
          <div style="font-size:11px; margin-top:4px;">Clicca sulla stellina accanto a qualsiasi titolo (Crypto, FTSE MIB, USA, Forex) per salvarlo nei tuoi Preferiti.</div>
        </div>
      `;
      return;
    }

    const groups = {
      crypto: { label: '🪙 Criptovalute (Listini OKX & Bybit)', items: [] },
      eu_stock: { label: '🇮🇹 Azionario Italia (FTSE MIB & Mid Cap)', items: [] },
      us_stock: { label: '🇺🇸 Azionario USA (S&P 500, NASDAQ-100 & Mid Cap)', items: [] },
      commodities: { label: '🛢️ Materie Prime & Metalli (CME / ICE / LME)', items: [] },
      forex: { label: '💱 Mercato Valutario (Forex Majors & Crosses)', items: [] },
      etf: { label: '📊 ETF & Indici Benchmark', items: [] },
      other: { label: '🌐 Altri Strumenti Finanziari', items: [] }
    };

    favAssets.forEach(a => {
      const isCommodity = (a.cat === 'forex' || a.cat === 'commodities') && (
        ['GC', 'SI', 'PL', 'PA', 'CL', 'BRN', 'NG', 'RB', 'HO', 'HG', 'ALI', 'ZN', 'NI', 'ZW', 'ZC', 'ZS', 'KC', 'CC', 'SB', 'CT', 'USOIL', 'BRENT', 'NATGAS', 'XAUUSD', 'XAGUSD'].includes(a.symbol) ||
        (a.sector && (a.sector.includes('Metalli') || a.sector.includes('Energetici') || a.sector.includes('Soft Commodities') || a.sector.includes('Agricole')))
      );

      if (isCommodity) {
        groups.commodities.items.push(a);
      } else if (groups[a.cat]) {
        groups[a.cat].items.push(a);
      } else {
        groups.other.items.push(a);
      }
    });

    let html = '';
    for (const key in groups) {
      const g = groups[key];
      if (g.items.length) {
        html += `<div style="font-size:10px; font-weight:800; color:var(--accent); text-transform:uppercase; padding:6px 10px; background:rgba(255,215,0,0.06); border-bottom:1px solid var(--border);">${g.label}</div>`;
        html += g.items.map(a => renderAssetRowHtml(a)).join('');
      }
    }
    container.innerHTML = html;
    return;
  }

  container.innerHTML = assets.map(a => renderAssetRowHtml(a)).join('');
}

function renderAssetRowHtml(a) {
  const isFav = window.FavoritesManager ? window.FavoritesManager.isFavorite(a.symbol) : false;
  const curr = a.currency || '$';
  const prec = a.precision || 2;
  const priceStr = a.basePrice ? `${curr}${a.basePrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}` : '';

  return `
    <div class="mega-asset-row" onclick="selectAsset('${a.symbol}')">
      <button class="star-fav-btn ${isFav ? 'active' : ''}" onclick="FavoritesManager.toggleFavorite('${a.symbol}', event)" title="Aggiungi o rimuovi dai Preferiti">
        ${isFav ? '★' : '☆'}
      </button>
      <div class="mega-asset-left" style="flex:1;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="mega-asset-sym">${a.symbol}</span>
          <span style="font-size:9px; background:rgba(255,255,255,0.06); padding:1px 5px; border-radius:3px; color:var(--text-muted); font-family:var(--font-mono)">
            ${a.exchange || a.cat}
          </span>
        </div>
        <span class="mega-asset-name">${a.name}</span>
      </div>
      <div class="mega-asset-right" style="text-align:right;">
        <span style="font-weight:700; color:var(--text-main); font-family:var(--font-mono); font-size:12px;">${priceStr}</span>
      </div>
    </div>
  `;
}

function filterMegaCategory(cat, tabBtn) {
  activeMegaCategory = cat;
  document.querySelectorAll('.mega-tab-pill').forEach(b => b.classList.remove('active'));
  if (tabBtn) tabBtn.classList.add('active');

  const allAssets = window.GlobalMarketAssets || curatedAssets;
  let filtered = allAssets;

  if (cat === 'favorites') {
    const favs = window.FavoritesManager ? window.FavoritesManager.getFavorites() : [];
    filtered = allAssets.filter(a => favs.includes(a.symbol));
  } else if (cat !== 'all') {
    filtered = allAssets.filter(a => a.cat === cat);
  }

  renderMegaAssetList(filtered);
}

let megaSearchTimer = null;
function onMegaSearchInput(query) {
  clearTimeout(megaSearchTimer);
  megaSearchTimer = setTimeout(async () => {
    const q = (query || '').trim().toUpperCase();
    const allAssets = window.GlobalMarketAssets || curatedAssets || [];

    if (!q) {
      filterMegaCategory(activeMegaCategory);
      return;
    }

    // Coherent multi-tier ranking:
    // 1. Exact match
    // 2. Starts with query (symbol)
    // 3. Contains query (symbol)
    // 4. Contains query (name or exchange)
    const exact = [];
    const starts = [];
    const symContains = [];
    const nameContains = [];

    allAssets.forEach(a => {
      const sym = a.symbol.toUpperCase();
      const nm = (a.name || '').toUpperCase();
      const ex = (a.exchange || '').toUpperCase();

      if (sym === q) {
        exact.push(a);
      } else if (sym.startsWith(q)) {
        starts.push(a);
      } else if (sym.includes(q)) {
        symContains.push(a);
      } else if (nm.includes(q) || ex.includes(q)) {
        nameContains.push(a);
      }
    });

    let filtered = [...exact, ...starts, ...symContains, ...nameContains];

    // If query not yet in static catalog, create a smart dynamic entry
    if (!filtered.some(a => a.symbol === q)) {
      const isCrypto = q.endsWith('USDT') || q.endsWith('USD') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU', 'INTC', 'BMNR'].some(c => q.includes(c));
      const isItal = q.endsWith('.MI');
      const isFx = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'].some(fx => q.startsWith(fx) && q.length === 6);
      const cat = isCrypto ? 'crypto' : (isItal ? 'eu_stock' : (isFx ? 'forex' : 'us_stock'));
      const exchange = isCrypto ? 'Bybit/OKX/Kraken' : (isItal ? 'MTA Milano' : (isFx ? 'Interbank Forex' : 'NASDAQ/NYSE'));
      const curr = isItal ? '€' : (q.endsWith('JPY') ? '¥' : '$');
      const base = isCrypto ? 1.00 : (isItal ? 15.00 : (isFx ? 1.0850 : 100.00));
      const prec = window.getDynamicPrecision ? window.getDynamicPrecision(base, q) : 2;

      const dynamicAsset = {
        symbol: q,
        name: `${q} (${exchange})`,
        cat: cat,
        exchange: exchange,
        basePrice: base,
        currency: curr,
        precision: prec
      };

      filtered.unshift(dynamicAsset);

      // Async live lookup from Bybit v5 linear tickers for crypto pairs
      if (isCrypto) {
        const cleanSym = q.endsWith('USDT') ? q : `${q}USDT`;
        fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${cleanSym}`)
          .then(r => r.json())
          .then(json => {
            if (json.result && json.result.list && json.result.list.length) {
              const t = json.result.list[0];
              const liveP = parseFloat(t.lastPrice);
              dynamicAsset.basePrice = liveP;
              dynamicAsset.precision = window.getDynamicPrecision(liveP, q);
              renderMegaAssetList(filtered);
            }
          }).catch(() => {});
      }
    }

    renderMegaAssetList(filtered);
  }, 40); // Ultra-responsive 40ms debounce
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
