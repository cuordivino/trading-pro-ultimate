/**
 * TRADING PRO ULTIMATE™ — BYBIT PERPETUAL & MARKET DATA ENGINE
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Direct Integration with Bybit v5 Public API & WebSocket
 * Mirrors all official Bybit parameters from: https://www.bybit.com/en/trade/usdt/BTCUSDT
 */

window.BybitEngine = {
  currentSymbol: 'BTCUSDT',
  ws: null,
  pollTimer: null,
  activeOrderBook: { bids: [], asks: [], spread: 0, spreadPct: 0 },
  recentTrades: [],
  tickerData: {
    lastPrice: 80350,
    indexPrice: 80390,
    markPrice: 80350,
    price24hPcnt: 0.034,
    highPrice24h: 81180,
    lowPrice24h: 75670,
    volume24h: 97960,
    turnover24h: 7680580000,
    fundingRate: 0.0001,
    nextFundingTime: Date.now() + 14400000,
    openInterest: 67240
  },
  marginMode: 'cross', // 'cross' | 'isolated'
  orderType: 'Market', // 'Limit' | 'Market' | 'Conditional'
  orderUnit: 'qty', // 'qty' | 'value'
  currentLeverage: 10,
  orderBookFilter: 'both', // 'both' | 'bids' | 'asks'

  init: function(symbol) {
    this.currentSymbol = (symbol || window.activeSymbol || 'BTCUSDT').toUpperCase().trim();
    const asset = window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null;
    this.activeAsset = asset;
    const isCrypto = asset ? asset.cat === 'crypto' : (this.currentSymbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR'].some(s => this.currentSymbol.includes(s)));

    if (isCrypto) {
      if (!this.currentSymbol.endsWith('USDT')) this.currentSymbol += 'USDT';
      this.fetchTicker();
      this.fetchOrderBook();
      this.fetchRecentTrades();
      this.initWebSocket();
    } else {
      // Non-crypto asset (FTSE MIB, US Stock, Forex)
      if (this.ws) {
        try { this.ws.close(); } catch(e) {}
        this.ws = null;
      }
      this.initNonCryptoAsset(asset);
    }

    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      if (isCrypto) {
        this.fetchTicker();
        this.fetchOrderBook();
      } else {
        this.updateNonCryptoTick();
      }
    }, 3000);

    // Update Funding Countdown every second
    setInterval(() => this.updateFundingCountdown(), 1000);
  },

  initNonCryptoAsset: function(asset) {
    const base = asset ? asset.basePrice : (window.activePrice || 100);
    this.tickerData = {
      lastPrice: base,
      indexPrice: Math.round(base * 0.998 * 100) / 100,
      markPrice: base,
      price24hPcnt: 0.0125,
      highPrice24h: Math.round(base * 1.025 * 100) / 100,
      lowPrice24h: Math.round(base * 0.985 * 100) / 100,
      volume24h: asset && asset.cat === 'eu_stock' ? 24500000 : 48000000,
      turnover24h: base * (asset && asset.cat === 'eu_stock' ? 24500000 : 48000000),
      fundingRate: 0,
      nextFundingTime: Date.now() + 14400000,
      openInterest: 0
    };
    this.renderBybitTelemetry();
    this.generateSyntheticOrderBook(base);
    this.generateSyntheticRecentTrades(base);
  },

  updateNonCryptoTick: function() {
    if (!this.activeAsset) return;
    const base = this.activeAsset.basePrice;
    const drift = (Math.random() - 0.5) * (base * 0.0006);
    this.tickerData.lastPrice = Math.round((base + drift) * 100) / 100;
    this.renderBybitTelemetry();
  },

  generateSyntheticOrderBook: function(base) {
    const bids = [];
    const asks = [];
    const step = base * 0.001;
    for (let i = 1; i <= 8; i++) {
      bids.push({ price: Math.round((base - (i * step)) * 100) / 100, size: Math.round(Math.random() * 5000 + 800) });
      asks.push({ price: Math.round((base + (i * step)) * 100) / 100, size: Math.round(Math.random() * 5000 + 800) });
    }
    const spread = asks[0].price - bids[0].price;
    const spreadPct = (spread / asks[0].price) * 100;
    this.activeOrderBook = { bids, asks, spread, spreadPct };
    this.renderOrderBook();
  },

  generateSyntheticRecentTrades: function(base) {
    const trades = [];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const p = Math.round((base + (Math.random() - 0.5) * (base * 0.003)) * 100) / 100;
      const t = new Date(now.getTime() - i * 4000).toTimeString().split(' ')[0];
      trades.push({
        id: Math.random().toString(),
        price: p,
        size: Math.round(Math.random() * 1500 + 200),
        side: Math.random() > 0.5 ? 'Buy' : 'Sell',
        time: t
      });
    }
    this.recentTrades = trades;
    this.renderRecentTrades();
  },

  // 1. TICKER & PERPETUAL PARAMETERS
  fetchTicker: async function() {
    try {
      const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${this.currentSymbol}`);
      if (res.ok) {
        const json = await res.json();
        if (json.result && json.result.list && json.result.list.length) {
          const t = json.result.list[0];
          this.tickerData = {
            lastPrice: parseFloat(t.lastPrice) || this.tickerData.lastPrice,
            indexPrice: parseFloat(t.indexPrice) || this.tickerData.indexPrice,
            markPrice: parseFloat(t.markPrice) || this.tickerData.markPrice,
            price24hPcnt: parseFloat(t.price24hPcnt) || 0,
            highPrice24h: parseFloat(t.highPrice24h) || 0,
            lowPrice24h: parseFloat(t.lowPrice24h) || 0,
            volume24h: parseFloat(t.volume24h) || 0,
            turnover24h: parseFloat(t.turnover24h) || 0,
            fundingRate: parseFloat(t.fundingRate) || 0.0001,
            nextFundingTime: parseInt(t.nextFundingTime) || (Date.now() + 14400000),
            openInterest: parseFloat(t.openInterest) || 0
          };
          this.renderBybitTelemetry();
        }
      }
    } catch (e) {
      // Offline fallback
    }
  },

  // 2. ORDER BOOK DEPTH
  fetchOrderBook: async function() {
    try {
      const res = await fetch(`https://api.bybit.com/v5/market/orderbook?category=linear&symbol=${this.currentSymbol}&limit=15`);
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const bids = (json.result.b || []).map(b => ({ price: parseFloat(b[0]), size: parseFloat(b[1]) }));
          const asks = (json.result.a || []).map(a => ({ price: parseFloat(a[0]), size: parseFloat(a[1]) }));

          const bestBid = bids.length ? bids[0].price : 0;
          const bestAsk = asks.length ? asks[0].price : 0;
          const spread = bestAsk > bestBid ? bestAsk - bestBid : 0;
          const spreadPct = bestAsk > 0 ? (spread / bestAsk) * 100 : 0;

          this.activeOrderBook = { bids, asks, spread, spreadPct };
          this.renderOrderBook();
        }
      }
    } catch (e) {}
  },

  // 3. RECENT TRADES
  fetchRecentTrades: async function() {
    try {
      const res = await fetch(`https://api.bybit.com/v5/market/recent-trade?category=linear&symbol=${this.currentSymbol}&limit=20`);
      if (res.ok) {
        const json = await res.json();
        if (json.result && json.result.list) {
          this.recentTrades = json.result.list.map(tr => ({
            id: tr.execId,
            price: parseFloat(tr.price),
            size: parseFloat(tr.size),
            side: tr.side, // 'Buy' | 'Sell'
            time: new Date(parseInt(tr.time)).toTimeString().split(' ')[0]
          }));
          this.renderRecentTrades();
        }
      }
    } catch (e) {}
  },

  // 4. BYBIT WEBSOCKET FOR ZERO-LATENCY TICKS
  initWebSocket: function() {
    try {
      if (this.ws) {
        this.ws.close();
      }
      this.ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');
      
      this.ws.onopen = () => {
        const subMsg = {
          op: 'subscribe',
          args: [
            `tickers.${this.currentSymbol}`,
            `publicTrade.${this.currentSymbol}`
          ]
        };
        this.ws.send(JSON.stringify(subMsg));
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.topic && msg.topic.startsWith('tickers') && msg.data) {
            const d = msg.data;
            if (d.lastPrice) this.tickerData.lastPrice = parseFloat(d.lastPrice);
            if (d.markPrice) this.tickerData.markPrice = parseFloat(d.markPrice);
            if (d.indexPrice) this.tickerData.indexPrice = parseFloat(d.indexPrice);
            if (d.fundingRate) this.tickerData.fundingRate = parseFloat(d.fundingRate);
            this.renderBybitTelemetry();
          } else if (msg.topic && msg.topic.startsWith('publicTrade') && msg.data) {
            const newTrades = msg.data.map(tr => ({
              id: tr.i || Math.random(),
              price: parseFloat(tr.p),
              size: parseFloat(tr.v),
              side: tr.S, // 'Buy' or 'Sell'
              time: new Date(tr.T).toTimeString().split(' ')[0]
            }));
            this.recentTrades = [...newTrades, ...this.recentTrades].slice(0, 25);
            this.renderRecentTrades();
          }
        } catch (err) {}
      };
    } catch (e) {
      console.warn('Bybit WS init error:', e);
    }
  },

  // RENDER ALL PARAMETERS IN HEADER TELEMETRY
  renderBybitTelemetry: function() {
    const t = this.tickerData;
    const asset = this.activeAsset || (window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null);
    const curr = asset ? asset.currency : '$';
    const prec = asset ? (asset.precision || 2) : 2;
    const isCrypto = asset ? asset.cat === 'crypto' : (this.currentSymbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR'].some(s => this.currentSymbol.includes(s)));

    // Bybit Header Telemetry Bar Elements
    const pContract = document.getElementById('bb-tele-contract');
    const pLast = document.getElementById('bb-last-price');
    const pIndex = document.getElementById('bb-index-price');
    const pMark = document.getElementById('bb-mark-price');
    const pChg = document.getElementById('bb-24h-chg');
    const pHigh = document.getElementById('bb-24h-high');
    const pLow = document.getElementById('bb-24h-low');
    const pVol = document.getElementById('bb-24h-vol');
    const pTurnover = document.getElementById('bb-24h-turnover');
    const pFunding = document.getElementById('bb-funding-rate');
    const pOI = document.getElementById('bb-open-interest');

    // Main hero quote
    const heroPrice = document.getElementById('active-live-price');
    const heroChg = document.getElementById('active-chg-badge');

    if (pContract) {
      if (isCrypto) pContract.innerText = `${this.currentSymbol} Perp`;
      else if (asset && asset.cat === 'eu_stock') pContract.innerText = `${asset.symbol} • MTA Milano`;
      else if (asset && asset.cat === 'forex') pContract.innerText = `${asset.symbol} • Spot FX`;
      else pContract.innerText = `${this.currentSymbol} • US Equity`;
    }

    if (pLast) pLast.innerText = `${curr}${t.lastPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (pIndex) pIndex.innerText = `${curr}${t.indexPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (pMark) pMark.innerText = `${curr}${t.markPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;

    const chgPct = (t.price24hPcnt * 100);
    const chgStr = `${chgPct >= 0 ? '+' : ''}${chgPct.toFixed(2)}%`;
    if (pChg) {
      pChg.innerText = chgStr;
      pChg.className = chgPct >= 0 ? 'text-green' : 'text-red';
    }

    if (pHigh) pHigh.innerText = `${curr}${t.highPrice24h.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (pLow) pLow.innerText = `${curr}${t.lowPrice24h.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;

    const volUnit = isCrypto ? (this.currentSymbol.replace('USDT', '') || 'BTC') : (asset && asset.cat === 'eu_stock' ? 'Azioni' : 'Shares');
    if (pVol) pVol.innerText = `${t.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${volUnit}`;
    if (pTurnover) pTurnover.innerText = `${curr}${(t.turnover24h / 1e6).toFixed(2)}M`;
    if (pFunding) pFunding.innerText = isCrypto ? `${(t.fundingRate * 100).toFixed(4)}%` : 'Regolare';
    if (pOI) pOI.innerText = isCrypto ? `${t.openInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${volUnit}` : 'N/A';

    // Also sync active-live-price
    if (heroPrice) heroPrice.innerText = `${curr}${t.lastPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (heroChg) {
      heroChg.innerText = chgStr;
      heroChg.className = `pct-chg-pill ${chgPct >= 0 ? 'up' : 'down'}`;
    }

    // Recalculate liquidation and margin
    this.recalcBybitOrderMetrics();
  },

  updateFundingCountdown: function() {
    const countdownEl = document.getElementById('bb-funding-countdown');
    if (!countdownEl) return;
    const diff = Math.max(0, this.tickerData.nextFundingTime - Date.now());
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    countdownEl.innerText = `${h}:${m}:${s}`;
  },

  // RENDER ORDER BOOK L2 DEPTH
  renderOrderBook: function() {
    const obContainer = document.getElementById('bb-orderbook-rows');
    const spreadVal = document.getElementById('bb-ob-spread');
    if (!obContainer) return;

    const { bids, asks, spread, spreadPct } = this.activeOrderBook;
    if (spreadVal) {
      spreadVal.innerText = `$${spread.toFixed(2)} (${spreadPct.toFixed(3)}%)`;
    }

    const maxBidVol = bids.length ? Math.max(...bids.map(b => b.size)) : 1;
    const maxAskVol = asks.length ? Math.max(...asks.map(a => a.size)) : 1;
    const maxVol = Math.max(maxBidVol, maxAskVol, 1);

    // Limit to 8 rows each for sleek layout
    const sliceAsks = asks.slice(0, 8).reverse();
    const sliceBids = bids.slice(0, 8);

    let html = '';

    // Asks (Red)
    if (this.orderBookFilter !== 'bids') {
      html += sliceAsks.map(a => {
        const depthPct = Math.min(100, (a.size / maxVol) * 100);
        return `
          <div class="bb-ob-row ask" onclick="BybitEngine.setPriceFromOrderBook(${a.price})">
            <div class="bb-ob-depth-bar ask" style="width:${depthPct}%"></div>
            <span class="bb-ob-price">${a.price.toFixed(2)}</span>
            <span class="bb-ob-size">${a.size.toFixed(3)}</span>
            <span class="bb-ob-sum">${(a.price * a.size / 1000).toFixed(1)}k</span>
          </div>
        `;
      }).join('');
    }

    // Mid Price Divider
    html += `
      <div class="bb-ob-mid-divider">
        <span class="bb-ob-mid-price ${this.tickerData.price24hPcnt >= 0 ? 'text-green' : 'text-red'}">
          $${this.tickerData.lastPrice.toFixed(2)}
        </span>
        <span class="bb-ob-mid-spread">Spread $${spread.toFixed(2)}</span>
      </div>
    `;

    // Bids (Green)
    if (this.orderBookFilter !== 'asks') {
      html += sliceBids.map(b => {
        const depthPct = Math.min(100, (b.size / maxVol) * 100);
        return `
          <div class="bb-ob-row bid" onclick="BybitEngine.setPriceFromOrderBook(${b.price})">
            <div class="bb-ob-depth-bar bid" style="width:${depthPct}%"></div>
            <span class="bb-ob-price">${b.price.toFixed(2)}</span>
            <span class="bb-ob-size">${b.size.toFixed(3)}</span>
            <span class="bb-ob-sum">${(b.price * b.size / 1000).toFixed(1)}k</span>
          </div>
        `;
      }).join('');
    }

    obContainer.innerHTML = html;
  },

  // RENDER RECENT TRADES
  renderRecentTrades: function() {
    const container = document.getElementById('bb-recent-trades-rows');
    if (!container) return;

    container.innerHTML = this.recentTrades.slice(0, 15).map(tr => {
      const isBuy = tr.side === 'Buy';
      return `
        <div class="bb-trade-row ${isBuy ? 'buy' : 'sell'}">
          <span class="bb-tr-price">${tr.price.toFixed(2)}</span>
          <span class="bb-tr-size">${tr.size.toFixed(3)}</span>
          <span class="bb-tr-time">${tr.time}</span>
        </div>
      `;
    }).join('');
  },

  // CLICK PRICE TO POPULATE ENTRY
  setPriceFromOrderBook: function(price) {
    const entryInput = document.getElementById('t-entry');
    if (entryInput) {
      entryInput.value = price;
      this.recalcBybitOrderMetrics();
      if (window.recalcPosition) window.recalcPosition();
    }
  },

  // MARGIN MODE SWITCH (CROSS / ISOLATED)
  setMarginMode: function(mode) {
    this.marginMode = mode;
    document.querySelectorAll('.bb-margin-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-margin="${mode}"]`)?.classList.add('active');
    this.recalcBybitOrderMetrics();
    if (window.showToast) window.showToast(`Modalità Margine impostata su: ${mode.toUpperCase()}`, 'info');
  },

  // ORDER TYPE SWITCH (LIMIT / MARKET / CONDITIONAL)
  setOrderType: function(type) {
    this.orderType = type;
    document.querySelectorAll('.bb-ot-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-ot="${type}"]`)?.classList.add('active');

    const entryField = document.getElementById('bb-entry-field-wrap');
    const triggerField = document.getElementById('bb-trigger-field-wrap');
    if (entryField) {
      entryField.style.display = type === 'Market' ? 'none' : 'block';
    }
    if (triggerField) {
      triggerField.style.display = type === 'Conditional' ? 'block' : 'none';
    }
    this.recalcBybitOrderMetrics();
  },

  // PERCENTAGE PILLS (10%, 25%, 50%, 75%, 100%)
  setBalancePercent: function(pct) {
    const cap = parseFloat(localStorage.getItem('capital') || 25000);
    const lev = this.currentLeverage;
    const currentPrice = this.tickerData.lastPrice || 80000;

    const maxMargin = cap * (pct / 100);
    const nominal = maxMargin * lev;
    const qty = (nominal / currentPrice);

    const qtyInput = document.getElementById('bb-order-qty');
    if (qtyInput) {
      qtyInput.value = qty.toFixed(qty < 1 ? 4 : 2);
    }
    this.recalcBybitOrderMetrics();
  },

  // CALCULATE BYBIT LIQUIDATION PRICE & ORDER COST
  recalcBybitOrderMetrics: function() {
    const price = this.orderType === 'Market' ? this.tickerData.lastPrice : (parseFloat(document.getElementById('t-entry')?.value) || this.tickerData.lastPrice);
    const qty = parseFloat(document.getElementById('bb-order-qty')?.value) || 0.1;
    const lev = this.currentLeverage || 10;
    const side = window.currentTradeSide || 'LONG';

    const nominalValue = qty * price;
    const initialMargin = nominalValue / lev;
    const mmr = 0.005; // 0.5% Maintenance Margin Rate for BTC on Bybit

    // Bybit Liquidation Price Formula
    let liqPrice = 0;
    if (side === 'LONG') {
      // Long Liq: Entry * (1 - (1/Lev) + MMR)
      liqPrice = price * (1 - (1 / lev) + mmr);
    } else {
      // Short Liq: Entry * (1 + (1/Lev) - MMR)
      liqPrice = price * (1 + (1 / lev) - mmr);
    }

    // Update UI elements
    const costElem = document.getElementById('bb-cost-val');
    const liqElem = document.getElementById('bb-liq-val');
    const nominalElem = document.getElementById('bb-nominal-val');

    if (costElem) costElem.innerText = `$${initialMargin.toFixed(2)}`;
    if (nominalElem) nominalElem.innerText = `$${nominalValue.toFixed(2)}`;
    if (liqElem) liqElem.innerText = `$${Math.max(0, liqPrice).toFixed(2)}`;

    // Sync with main position sizing displays
    const posResUnits = document.getElementById('pos-res-units');
    const posResMargin = document.getElementById('pos-res-margin');
    const posResLiq = document.getElementById('pos-res-liq');
    if (posResUnits) posResUnits.innerText = qty.toFixed(qty < 1 ? 4 : 2);
    if (posResMargin) posResMargin.innerText = `$${initialMargin.toFixed(2)}`;
    if (posResLiq) posResLiq.innerText = `$${Math.max(0, liqPrice).toFixed(2)}`;
  }
};

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    BybitEngine.init();
  }, 400);
});
