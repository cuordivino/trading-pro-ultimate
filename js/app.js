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
function switchMainTab(tabId, btnElem) {
  document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.add('active');
  }

  if (tabId === 'tab-terminal' && window.mainChart) {
    setTimeout(() => {
      resizeAllCharts();
      window.mainChart.timeScale().fitContent();
    }, 100);
  }

  if (tabId === 'tab-consensus') {
    loadCommitteeConsensus(window.currentSymbol);
  }

  if (tabId === 'tab-quant' && window.QuantEngines) {
    window.QuantEngines.renderQuantEnginesTab();
  }

  if (tabId === 'tab-rotation' && window.SectorRotation) {
    window.SectorRotation.renderSectorRotationTab();
  }

  if (tabId === 'tab-optimal' && window.OptimalEngine) {
    window.OptimalEngine.renderOptimalUI();
  }
}

// ==========================================
// ASSET SWITCHING & MARKET DATA (HYBRID)
// ==========================================
async function selectAsset(symbol) {
  symbol = symbol.toUpperCase().trim();
  window.currentSymbol = symbol;
  window.activeSymbol = symbol;
  closeAllDropdowns();

  const symElem = document.getElementById('active-sym-title');
  const triggerSym = document.getElementById('active-asset-trigger-sym');
  if (symElem) symElem.innerText = symbol;
  if (triggerSym) triggerSym.innerText = symbol;

  const chatTitle = document.getElementById('chat-active-persona-title');
  if (chatTitle && window.currentPersonaSlug) {
    chatTitle.innerText = `Conversazione attiva con ${window.currentPersonaSlug.replace('-', ' ').toUpperCase()} su ${symbol}`;
  }

  await pollActiveQuote();
  await loadCandleHistory();
  loadCommitteeConsensus(symbol);

  if (window.QuantEngines) {
    window.QuantEngines.renderQuantEnginesTab();
  }

  if (window.BybitEngine) {
    window.BybitEngine.init(symbol);
  }

  if (window.SectorRotation) {
    window.SectorRotation.renderSectorRotationTab();
  }

  if (window.OptimalEngine) {
    window.OptimalEngine.recalculateOptimalPosition();
    window.OptimalEngine.calculateLocalVolumeProfile();
  }
}

async function pollActiveQuote() {
  if (!window.currentSymbol) return;
  const tStart = performance.now();
  let q = null;

  // Try Local/Cloud Backend API first
  try {
    const res = await fetch(`/api/quote/${window.currentSymbol}`);
    if (res.ok) {
      q = await res.json();
    }
  } catch (e) {}

  // Direct Browser Fallback for GitHub Pages Static Mode
  if (!q || !q.price) {
    try {
      let sym = window.currentSymbol.toUpperCase();
      if (!sym.endsWith('USDT') && ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'].includes(sym)) sym += 'USDT';
      if (sym.endsWith('USDT')) {
        const binRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
        if (binRes.ok) {
          const bd = await binRes.json();
          q = {
            symbol: sym,
            price: parseFloat(bd.lastPrice),
            change: parseFloat(bd.priceChangePercent),
            high: parseFloat(bd.highPrice),
            low: parseFloat(bd.lowPrice),
            volume: parseFloat(bd.volume)
          };
        }
      }
    } catch (err) {}
  }

  // Baseline Fallback if completely offline
  if (!q || !q.price) {
    const base = window.currentSymbol.includes('BTC') ? 65000 : (window.currentSymbol.includes('AAPL') ? 230 : 100);
    q = { symbol: window.currentSymbol, price: base, change: 1.25, high: base * 1.02, low: base * 0.98, volume: 1200000 };
  }

  const tLatency = Math.round(performance.now() - tStart);
  window.currentLivePrice = q.price;
  window.activePrice = q.price;
  window.activeSymbol = window.currentSymbol;

  const latElem = document.getElementById('tele-latency-val');
  if (latElem) latElem.innerText = `${tLatency}ms`;

  const priceElem = document.getElementById('active-live-price');
  const chgBadge = document.getElementById('active-chg-badge');
  const highElem = document.getElementById('active-metric-high');
  const lowElem = document.getElementById('active-metric-low');
  const volElem = document.getElementById('active-metric-vol');

  if (priceElem) priceElem.innerText = `$${q.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  if (chgBadge) {
    chgBadge.innerText = `${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}%`;
    chgBadge.className = `pct-chg-pill ${q.change >= 0 ? 'up' : 'down'}`;
  }
  if (highElem) highElem.innerText = `$${q.high.toLocaleString()}`;
  if (lowElem) lowElem.innerText = `$${q.low.toLocaleString()}`;
  if (volElem) volElem.innerText = q.volume.toLocaleString();

  const entryInput = document.getElementById('t-entry');
  if (entryInput && (!entryInput.value || parseFloat(entryInput.value) === 0)) {
    entryInput.value = q.price;
    const slInput = document.getElementById('t-sl');
    const tpInput = document.getElementById('t-tp');
    if (slInput && !slInput.value) slInput.value = (q.price * 0.95).toFixed(2);
    if (tpInput && !tpInput.value) tpInput.value = (q.price * 1.15).toFixed(2);
    recalcPosition();
  }
}

async function loadCandleHistory() {
  const symbol = window.currentSymbol;
  const interval = window.currentInterval;
  let candles = [];

  // Try Backend API first
  try {
    const res = await fetch(`/api/kline/${symbol}?interval=${interval}&limit=120`);
    if (res.ok) {
      candles = await res.json();
    }
  } catch (e) {}

  // Direct Binance Fallback for GitHub Pages Static Mode
  if (!candles || !candles.length) {
    try {
      let sym = symbol.toUpperCase();
      if (!sym.endsWith('USDT') && ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'].includes(sym)) sym += 'USDT';
      if (sym.endsWith('USDT')) {
        const binRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=120`);
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
      }
    } catch (err) {}
  }

  // High-fidelity fallback generation if offline
  if (!candles || !candles.length) {
    const base = symbol.includes('BTC') ? 65000 : 150;
    const now = Math.floor(Date.now() / 1000) - (120 * 900);
    let curr = base;
    candles = [];
    for (let i = 0; i < 120; i++) {
      const step = (Math.random() - 0.49) * (curr * 0.008);
      const o = curr;
      const c = curr + step;
      candles.push({
        time: now + (i * 900),
        open: Math.round(o * 100) / 100,
        high: Math.round((Math.max(o, c) + Math.random() * (curr * 0.004)) * 100) / 100,
        low: Math.round((Math.min(o, c) - Math.random() * (curr * 0.004)) * 100) / 100,
        close: Math.round(c * 100) / 100,
        volume: Math.round(Math.random() * 5000 + 500)
      });
      curr = c;
    }
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

function changeTimeframe(tf, btnElem) {
  window.currentInterval = tf;
  document.querySelectorAll('.tf-pill').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  const triggerDisplay = document.getElementById('active-tf-trigger');
  if (triggerDisplay) triggerDisplay.innerText = tf.toUpperCase();
  closeAllDropdowns();
  loadCandleHistory();
}

// ==========================================
// MEGA-DROPDOWN ASSET SELECTOR & TICKER TAPE
// ==========================================
async function initCuratedAssets() {
  const tapeContainer = document.getElementById('ticker-tape-container');

  try {
    const res = await fetch('/api/symbols/curated');
    if (res.ok) {
      curatedAssets = await res.json();
    }
  } catch (e) {}

  if (tapeContainer) {
    const html = curatedAssets.map(item => `
      <div class="tape-pill" onclick="selectAsset('${item.symbol}')">
        <span class="sym">${item.symbol}</span>
        <span class="price" id="tape-price-${item.symbol}">...</span>
      </div>
    `).join('');
    tapeContainer.innerHTML = html + html;
  }

  renderMegaAssetList(curatedAssets);

  // Fetch prices for ticker tape
  curatedAssets.forEach(async (it) => {
    try {
      let price = null, change = 0;
      if (it.symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'].some(c => it.symbol.includes(c))) {
        let sym = it.symbol.endsWith('USDT') ? it.symbol : it.symbol + 'USDT';
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
        if (r.ok) {
          const d = await r.json();
          price = parseFloat(d.lastPrice);
          change = parseFloat(d.priceChangePercent);
        }
      }
      if (price !== null) {
        document.querySelectorAll(`[id="tape-price-${it.symbol}"]`).forEach(el => {
          el.innerHTML = `$${price} <span class="chg ${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>`;
        });
      }
    } catch (err) {}
  });
}

function renderMegaAssetList(assets) {
  const container = document.getElementById('mega-asset-list-container');
  if (!container) return;

  if (!assets.length) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted)">Nessun asset corrispondente trovato.</div>`;
    return;
  }

  container.innerHTML = assets.map(a => `
    <div class="mega-asset-row" onclick="selectAsset('${a.symbol}')">
      <div class="mega-asset-left">
        <span class="mega-asset-sym">${a.symbol}</span>
        <span class="mega-asset-name">${a.name}</span>
      </div>
      <div class="mega-asset-right">
        <span style="font-size:10px; background:var(--bg-elevated); padding:2px 6px; border-radius:3px; color:var(--text-muted); text-transform:uppercase">
          ${a.cat || 'global'}
        </span>
      </div>
    </div>
  `).join('');
}

function filterMegaCategory(cat, tabBtn) {
  activeMegaCategory = cat;
  document.querySelectorAll('.mega-tab-pill').forEach(b => b.classList.remove('active'));
  if (tabBtn) tabBtn.classList.add('active');

  const filtered = cat === 'all' ? curatedAssets : curatedAssets.filter(a => a.cat === cat);
  renderMegaAssetList(filtered);
}

let megaSearchTimer = null;
function onMegaSearchInput(query) {
  clearTimeout(megaSearchTimer);
  megaSearchTimer = setTimeout(async () => {
    query = query.trim().toUpperCase();
    if (!query) {
      filterMegaCategory(activeMegaCategory);
      return;
    }
    const filtered = curatedAssets.filter(a => a.symbol.includes(query) || a.name.toUpperCase().includes(query));
    if (!filtered.some(a => a.symbol === query)) {
      filtered.push({ symbol: query, name: `${query} (Custom Asset)`, cat: 'custom' });
    }
    renderMegaAssetList(filtered);
  }, 200);
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
