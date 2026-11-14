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
      const base = (asset && asset.basePrice) ? asset.basePrice : (this.tickerData.lastPrice || 75000);
      this.generateSyntheticOrderBook(base);
      this.fetchTicker();
      this.fetchOrderBook();
      this.fetchRecentTrades();
      this.initWebSocket();
    } else {
      // Non-crypto asset (FTSE MIB, US Stock, Forex)
      if (this.ws) {
        try {
          this.ws.onmessage = null;
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.close();
        } catch(e) {}
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
    if (this.fundingTimer) clearInterval(this.fundingTimer);
    this.fundingTimer = setInterval(() => this.updateFundingCountdown(), 1000);
  },

  initNonCryptoAsset: function(asset) {
    const baseline = window.MarketLiveFeed ? window.MarketLiveFeed.getBaselineQuote(this.currentSymbol) : null;
    const base = baseline ? baseline.price : ((asset && asset.basePrice) ? asset.basePrice : ((window.activePrice && window.activeSymbol === this.currentSymbol) ? window.activePrice : 100));
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(base, this.currentSymbol) : 2;
    const f = Math.pow(10, prec);
    const chgPct = baseline ? (baseline.change / 100) : ((asset && asset.change24h !== undefined) ? (asset.change24h / 100) : 0.0125);
    const vol24h = baseline ? baseline.volume : ((asset && asset.volume24h) ? asset.volume24h : 2500000);

    this.tickerData = {
      lastPrice: base,
      indexPrice: base,
      markPrice: base,
      price24hPcnt: chgPct,
      highPrice24h: baseline ? baseline.high : Math.round((base * 1.018) * f) / f,
      lowPrice24h: baseline ? baseline.low : Math.round((base * 0.982) * f) / f,
      volume24h: vol24h,
      turnover24h: base * vol24h,
      fundingRate: 0,
      nextFundingTime: Date.now() + 14400000,
      openInterest: 0
    };

    window.currentLivePrice = base;
    window.activePrice = base;

    // Reset order form inputs to this asset's scale immediately so no residual BTC prices remain
    const entryInput = document.getElementById('t-entry');
    const slInput = document.getElementById('t-sl');
    const tpInput = document.getElementById('t-tp');
    if (entryInput) entryInput.value = base.toFixed(prec);
    if (slInput) slInput.value = (base * 0.97).toFixed(prec);
    if (tpInput) tpInput.value = (base * 1.06).toFixed(prec);

    this.renderBybitTelemetry();
    this.generateSyntheticOrderBook(base);
    this.generateSyntheticRecentTrades(base);
    this.recalcBybitOrderMetrics();
  },

  updateNonCryptoTick: function() {
    if (!this.activeAsset && !window.currentSymbol) return;
    const base = this.tickerData.lastPrice || (this.activeAsset ? this.activeAsset.basePrice : (window.activePrice || 100));
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(base, this.currentSymbol) : 2;
    const f = Math.pow(10, prec);
    const minStep = Math.pow(10, -prec);

    // Subtle micro-tick aligned with dynamic precision (e.g. 0.0001 or 0.01)
    const tickSteps = (Math.floor(Math.random() * 3) - 1) * minStep;
    const newPrice = Math.max(minStep, Math.round((base + tickSteps) * f) / f);

    this.tickerData.lastPrice = newPrice;
    this.tickerData.markPrice = newPrice;
    this.tickerData.indexPrice = newPrice;
    window.currentLivePrice = newPrice;
    window.activePrice = newPrice;
    this.renderBybitTelemetry();
  },

  generateSyntheticOrderBook: function(base) {
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(base, this.currentSymbol) : 2;
    const f = Math.pow(10, prec);
    const minStep = Math.pow(10, -prec);
    const bids = [];
    const asks = [];
    for (let i = 1; i <= 8; i++) {
      bids.push({ price: Math.round((base - (i * minStep)) * f) / f, size: Math.round(Math.random() * 5000 + 800) });
      asks.push({ price: Math.round((base + (i * minStep)) * f) / f, size: Math.round(Math.random() * 5000 + 800) });
    }
    const spread = asks.length && bids.length ? Math.round((asks[0].price - bids[0].price) * f) / f : 0;
    const spreadPct = asks.length && asks[0].price > 0 ? (spread / asks[0].price) * 100 : 0;
    this.activeOrderBook = { bids, asks, spread, spreadPct };
    this.renderOrderBook();
  },

  generateSyntheticRecentTrades: function(base) {
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(base, this.currentSymbol) : 2;
    const f = Math.pow(10, prec);
    const minStep = Math.pow(10, -prec);
    const trades = [];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const stepOffset = (Math.floor(Math.random() * 5) - 2) * minStep;
      const p = Math.round((base + stepOffset) * f) / f;
      trades.push({
        id: 'TR-' + (1000 + i),
        price: p,
        size: Math.round(Math.random() * 2000 + 100),
        side: Math.random() > 0.5 ? 'Buy' : 'Sell',
        time: new Date(now.getTime() - i * 4000).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
    } catch (e) {
      this.generateSyntheticOrderBook(this.tickerData.lastPrice || 75000);
    }
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
  getKlineInterval: function(tf) {
    tf = (tf || window.currentInterval || window.activeTimeframe || '15m').toLowerCase();
    if (tf === '1s' || tf === '1m') return '1';
    if (tf === '3m') return '3';
    if (tf === '5m') return '5';
    if (tf === '15m') return '15';
    if (tf === '30m') return '30';
    if (tf === '1h') return '60';
    if (tf === '2h') return '120';
    if (tf === '4h') return '240';
    if (tf === '6h') return '360';
    if (tf === '12h') return '720';
    if (tf === '1d' || tf === 'd') return 'D';
    if (tf === '1w' || tf === 'w') return 'W';
    if (tf === '1m_month' || tf === '1mese') return 'M';
    return '15';
  },

  initWebSocket: function() {
    try {
      if (this.ws) {
        try {
          this.ws.onmessage = null;
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.close();
        } catch(e) {}
        this.ws = null;
      }
      this.ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');
      
      this.ws.onopen = () => {
        const interval = this.getKlineInterval();
        const subMsg = {
          op: 'subscribe',
          args: [
            `tickers.${this.currentSymbol}`,
            `publicTrade.${this.currentSymbol}`,
            `kline.${interval}.${this.currentSymbol}`
          ]
        };
        if (this.ws && typeof this.ws.send === "function") { try { this.ws.send(JSON.stringify(subMsg)); } catch(e) {} }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const isCurrentCrypto = this.currentSymbol && (this.activeAsset ? this.activeAsset.cat === 'crypto' : this.currentSymbol.endsWith('USDT'));
          if (!isCurrentCrypto) return;

          if (msg.topic && msg.topic.startsWith('kline') && msg.data) {
            const klines = Array.isArray(msg.data) ? msg.data : [msg.data];
            klines.forEach(k => {
              if (window.onRealtimeKlineUpdate) {
                window.onRealtimeKlineUpdate(k, this.currentSymbol);
              }
            });
          } else if (msg.topic && msg.topic.startsWith('tickers') && msg.data) {
            const topicSym = msg.topic.split('.')[1];
            if (topicSym && topicSym !== this.currentSymbol) return;

            const d = msg.data;
            if (d.lastPrice) {
              const p = parseFloat(d.lastPrice);
              this.tickerData.lastPrice = p;
              if (window.onRealtimePriceTick) {
                // Pass 0 for incremental volume: d.volume24h is 24h cumulative total, NOT candle volume!
                window.onRealtimePriceTick(p, 0, null, this.currentSymbol);
              }
            }
            if (d.markPrice) this.tickerData.markPrice = parseFloat(d.markPrice);
            if (d.indexPrice) this.tickerData.indexPrice = parseFloat(d.indexPrice);
            if (d.fundingRate) this.tickerData.fundingRate = parseFloat(d.fundingRate);
            this.renderBybitTelemetry();
          } else if (msg.topic && msg.topic.startsWith('publicTrade') && msg.data) {
            const topicSym = msg.topic.split('.')[1];
            if (topicSym && topicSym !== this.currentSymbol) return;

            const newTrades = msg.data.map(tr => ({
              id: tr.i || Math.random(),
              price: parseFloat(tr.p),
              size: parseFloat(tr.v),
              side: tr.S,
              time: new Date(tr.T).toTimeString().split(' ')[0]
            }));
            this.recentTrades = [...newTrades, ...this.recentTrades].slice(0, 25);
            this.renderRecentTrades();

            if (msg.data.length && window.onRealtimePriceTick) {
              const latestTrade = msg.data[0];
              window.onRealtimePriceTick(parseFloat(latestTrade.p), 0, latestTrade.T, this.currentSymbol);
            }
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
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(t.lastPrice, this.currentSymbol) : (asset ? (asset.precision || 2) : 2);
    const isCrypto = asset ? asset.cat === 'crypto' : (this.currentSymbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU'].some(s => this.currentSymbol.includes(s)));

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

    // Dedicated Bybit Chart Top Header Elements (100% Synchronized)
    const bybitTopSym = document.getElementById('bybit-top-sym');
    const bybitTopName = document.getElementById('bybit-top-name');
    const bybitTopPrice = document.getElementById('bybit-top-price');
    const bybitTopMark = document.getElementById('bybit-top-mark');
    const bybitTopHigh = document.getElementById('bybit-top-high');
    const bybitTopLow = document.getElementById('bybit-top-low');
    const bybitTopChg = document.getElementById('bybit-top-chg');
    const bybitTopVol = document.getElementById('bybit-top-vol');

    if (bybitTopSym) bybitTopSym.innerText = this.currentSymbol;
    if (bybitTopName) bybitTopName.innerText = asset ? asset.name : (this.currentSymbol.endsWith('USDT') ? `${this.currentSymbol.replace('USDT', '')} Perpetual` : this.currentSymbol);
    if (bybitTopPrice) bybitTopPrice.innerText = `${curr}${t.lastPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (bybitTopMark) bybitTopMark.innerText = `Mark: ${curr}${t.markPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (bybitTopHigh) bybitTopHigh.innerText = `${curr}${t.highPrice24h.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (bybitTopLow) bybitTopLow.innerText = `${curr}${t.lowPrice24h.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}`;
    if (bybitTopChg) {
      bybitTopChg.innerText = `${(t.price24hPcnt * 100) >= 0 ? '+' : ''}${(t.price24hPcnt * 100).toFixed(2)}%`;
      bybitTopChg.className = `bybit-price-chg ${(t.price24hPcnt * 100) >= 0 ? 'text-green' : 'text-red'}`;
    }
    if (bybitTopVol) bybitTopVol.innerText = `${curr}${(t.turnover24h / 1e6).toFixed(2)}M`;

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

    const asset = this.activeAsset || (window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null);
    const curr = asset ? asset.currency : '$';
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(this.tickerData.lastPrice, this.currentSymbol) : (asset ? (asset.precision || 2) : 2);

    const { bids, asks, spread, spreadPct } = this.activeOrderBook;
    if (spreadVal) {
      spreadVal.innerText = `${curr}${spread.toFixed(prec)} (${spreadPct.toFixed(3)}%)`;
    }

    
    // Update Live Bid-Ask Ratio Bar (media_1794165856984_419758d4.jpg)
    const totalBidVol = bids.reduce((acc, b) => acc + (b.size || 0), 0);
    const totalAskVol = asks.reduce((acc, a) => acc + (a.size || 0), 0);
    const sumVol = totalBidVol + totalAskVol;
    if (sumVol > 0) {
      const bidPct = Math.round((totalBidVol / sumVol) * 1000) / 10;
      const askPct = (100 - bidPct).toFixed(1);
      const bidEl = document.getElementById('bb-ratio-bid-lbl');
      const askEl = document.getElementById('bb-ratio-ask-lbl');
      const bidBar = document.getElementById('bb-ratio-bid-bar');
      const askBar = document.getElementById('bb-ratio-ask-bar');
      if (bidEl) bidEl.innerText = `Bid ${bidPct.toFixed(1)}%`;
      if (askEl) askEl.innerText = `Ask ${askPct}%`;
      if (bidBar) bidBar.style.width = `${bidPct}%`;
      if (askBar) askBar.style.width = `${askPct}%`;
    }

    const maxBidVol = bids.length ? Math.max(...bids.map(b => b.size)) : 1;
    const maxAskVol = asks.length ? Math.max(...asks.map(a => a.size)) : 1;
    const maxVol = Math.max(maxBidVol, maxAskVol, 1);

    // Limit to 8 rows each for sleek layout
    const sliceAsks = asks.slice(0, 8).reverse();
    const sliceBids = bids.slice(0, 8);

    let html = '';

    const isCrypto = asset ? asset.cat === 'crypto' : (this.currentSymbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU'].some(s => this.currentSymbol.includes(s)));
    const obUnit = isCrypto ? 'USDT' : (curr || '$');
    const obAsset = (asset ? asset.symbol.replace('=F', '').replace('=X', '') : (this.currentSymbol || 'Asset'));
    const headEl = document.querySelector('#bb-view-orderbook .bb-ob-head');
    if (headEl) {
      headEl.innerHTML = `
        <span>Prezzo (${obUnit})</span>
        <span>Dim. (${obAsset})</span>
        <span>Totale</span>
      `;
    }

    // Asks (Red)
    if (this.orderBookFilter !== 'bids') {
      html += sliceAsks.map(a => {
        const depthPct = Math.min(100, (a.size / maxVol) * 100);
        const fmtSize = (a.size >= 100) ? Math.round(a.size).toLocaleString() : a.size.toFixed(prec > 2 ? 3 : 2);
        const fmtSum = ((a.price * a.size) >= 1000) ? `${((a.price * a.size) / 1000).toFixed(1)}k` : (a.price * a.size).toFixed(0);
        return `
          <div class="bb-ob-row ask" onclick="BybitEngine.setPriceFromOrderBook(${a.price})">
            <div class="bb-ob-depth-bar ask" style="width:${depthPct}%"></div>
            <span class="bb-ob-price">${a.price.toFixed(prec)}</span>
            <span class="bb-ob-size">${fmtSize}</span>
            <span class="bb-ob-sum">${fmtSum}</span>
          </div>
        `;
      }).join('');
    }

    // Mid Price Divider
    html += `
      <div class="bb-ob-mid-divider">
        <span class="bb-ob-mid-price ${this.tickerData.price24hPcnt >= 0 ? 'text-green' : 'text-red'}">
          ${curr}${this.tickerData.lastPrice.toFixed(prec)}
        </span>
        <span class="bb-ob-mid-spread">Spread ${curr}${spread.toFixed(prec)}</span>
      </div>
    `;

    // Bids (Green)
    if (this.orderBookFilter !== 'asks') {
      html += sliceBids.map(b => {
        const depthPct = Math.min(100, (b.size / maxVol) * 100);
        const fmtSize = (b.size >= 100) ? Math.round(b.size).toLocaleString() : b.size.toFixed(prec > 2 ? 3 : 2);
        const fmtSum = ((b.price * b.size) >= 1000) ? `${((b.price * b.size) / 1000).toFixed(1)}k` : (b.price * b.size).toFixed(0);
        return `
          <div class="bb-ob-row bid" onclick="BybitEngine.setPriceFromOrderBook(${b.price})">
            <div class="bb-ob-depth-bar bid" style="width:${depthPct}%"></div>
            <span class="bb-ob-price">${b.price.toFixed(prec)}</span>
            <span class="bb-ob-size">${fmtSize}</span>
            <span class="bb-ob-sum">${fmtSum}</span>
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

    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(this.tickerData.lastPrice, this.currentSymbol) : 2;

    container.innerHTML = this.recentTrades.slice(0, 15).map(tr => {
      const isBuy = tr.side === 'Buy';
      return `
        <div class="bb-trade-row ${isBuy ? 'buy' : 'sell'}">
          <span class="bb-tr-price">${tr.price.toFixed(prec)}</span>
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

  // SIZING MODES: 'amount' | 'qty'
  sizingMode: 'amount',
  setSizingMode: function(mode) {
    this.sizingMode = mode;
    document.querySelectorAll('.bb-size-mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-sm="${mode}"]`)?.classList.add('active');

    const amtWrap = document.getElementById('bb-amt-wrap');
    const qtyWrap = document.getElementById('bb-qty-wrap');
    if (mode === 'amount') {
      if (amtWrap) amtWrap.style.display = 'block';
      if (qtyWrap) qtyWrap.style.display = 'none';
    } else {
      if (amtWrap) amtWrap.style.display = 'none';
      if (qtyWrap) qtyWrap.style.display = 'block';
    }
  },

  onOrderAmountInput: function(val) {
    const amt = parseFloat(val) || 0;
    const price = this.tickerData.lastPrice || 80000;
    const qty = price > 0 ? (amt / price) : 0;
    const qtyInput = document.getElementById('bb-order-qty');
    if (qtyInput) qtyInput.value = qty.toFixed(qty < 1 ? 4 : 2);
    this.recalcBybitOrderMetrics();
  },

  onOrderQtyInput: function(val) {
    const qty = parseFloat(val) || 0;
    const price = this.tickerData.lastPrice || 80000;
    const amt = qty * price;
    const amtInput = document.getElementById('bb-order-usdt');
    if (amtInput) amtInput.value = amt.toFixed(2);
    this.recalcBybitOrderMetrics();
  },

  setQuickSlPct: function(pct) {
    const price = this.tickerData.lastPrice || window.currentLivePrice || (this.activeAsset ? this.activeAsset.basePrice : 100);
    const side = window.currentTradeSide || 'LONG';
    const factor = side === 'LONG' ? (1 - pct / 100) : (1 + pct / 100);
    const sl = price * factor;
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(price, this.currentSymbol) : 2;
    const slInput = document.getElementById('t-sl');
    if (slInput) {
      slInput.value = sl.toFixed(prec);
      this.onSlTpChanged();
    }
  },

  setQuickSlPoc: function() {
    const poc = window.OptimalEngine?.currentVolumeProfile?.poc;
    if (poc && poc > 0) {
      const slInput = document.getElementById('t-sl');
      if (slInput) {
        slInput.value = Number(poc).toFixed(2);
        this.onSlTpChanged();
      }
    } else {
      this.setQuickSlPct(2);
    }
  },

  setQuickTpPct: function(pct) {
    const price = this.tickerData.lastPrice || window.currentLivePrice || (this.activeAsset ? this.activeAsset.basePrice : 100);
    const side = window.currentTradeSide || 'LONG';
    const factor = side === 'LONG' ? (1 + pct / 100) : (1 - pct / 100);
    const tp = price * factor;
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(price, this.currentSymbol) : 2;
    const tpInput = document.getElementById('t-tp');
    if (tpInput) {
      tpInput.value = tp.toFixed(prec);
      this.onSlTpChanged();
    }
  },

  setQuickTpVah: function() {
    const vah = window.OptimalEngine?.currentVolumeProfile?.vah;
    if (vah && vah > 0) {
      const tpInput = document.getElementById('t-tp');
      if (tpInput) {
        tpInput.value = Number(vah).toFixed(2);
        this.onSlTpChanged();
      }
    } else {
      this.setQuickTpPct(5);
    }
  },

  onSlTpChanged: function() {
    const asset = this.activeAsset || (window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null);
    const curr = (asset && asset.currency) ? asset.currency : '$';
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(this.tickerData.lastPrice, this.currentSymbol) : (asset ? (asset.precision || 2) : 2);
    const price = this.orderType === 'Market' ? (this.tickerData.lastPrice || (asset ? asset.basePrice : 80000)) : (parseFloat(String(document.getElementById('t-entry')?.value || '').replace(',', '.')) || this.tickerData.lastPrice || 80000);
    
    let qty = 0.1;
    if (this.sizingMode === 'amount') {
      const amt = parseFloat(String(document.getElementById('bb-order-usdt')?.value || '1000').replace(',', '.')) || 1000;
      qty = price > 0 ? (amt / price) : 0.1;
    } else {
      qty = parseFloat(String(document.getElementById('bb-order-qty')?.value || '0.1').replace(',', '.')) || 0.1;
    }
    const slRaw = document.getElementById('t-sl')?.value || '';
    const tpRaw = document.getElementById('t-tp')?.value || '';
    const sl = slRaw ? parseFloat(String(slRaw).replace(',', '.')) : 0;
    const tp = tpRaw ? parseFloat(String(tpRaw).replace(',', '.')) : 0;

    const slPreview = document.getElementById('sl-loss-preview');
    if (slPreview) {
      if (sl > 0) {
        const slDist = Math.abs(price - sl);
        const loss = qty * slDist;
        const lossPct = (slDist / price) * 100;
        slPreview.innerText = `-$${loss.toFixed(2)} (-${lossPct.toFixed(2)}%)`;
      } else {
        slPreview.innerText = '-$0.00 (-0.0%)';
      }
    }

    const tpPreview = document.getElementById('tp-gain-preview');
    if (tpPreview) {
      if (tp > 0) {
        const tpDist = Math.abs(tp - price);
        const gain = qty * tpDist;
        const gainPct = (tpDist / price) * 100;
        tpPreview.innerText = `+$${gain.toFixed(2)} (+${gainPct.toFixed(2)}%)`;
      } else {
        tpPreview.innerText = '+$0.00 (+0.0%)';
      }
    }

    const rrElem = document.getElementById('pos-res-rr');
    if (rrElem) {
      if (sl > 0 && tp > 0 && Math.abs(price - sl) > 0) {
        const rr = Math.abs(tp - price) / Math.abs(price - sl);
        rrElem.innerText = `1 : ${rr.toFixed(2)}`;
        rrElem.style.color = rr >= 2 ? 'var(--buy)' : (rr >= 1.5 ? 'var(--accent)' : 'var(--sell)');
      }
    }

    this.recalcBybitOrderMetrics();
  },

  // PERCENTAGE PILLS (10%, 25%, 50%, 75%, 100%)
  setBalancePercent: function(pct) {
    const cap = parseFloat(localStorage.getItem('capital') || 25000);
    const lev = this.currentLeverage || 10;
    const currentPrice = this.tickerData.lastPrice || 80000;

    const maxMargin = cap * (pct / 100);
    const nominal = maxMargin * lev;
    const qty = (nominal / currentPrice);

    const qtyInput = document.getElementById('bb-order-qty');
    if (qtyInput) qtyInput.value = qty.toFixed(qty < 1 ? 4 : 2);

    const amtInput = document.getElementById('bb-order-usdt');
    if (amtInput) amtInput.value = nominal.toFixed(2);

    this.recalcBybitOrderMetrics();
  },


  // =========================================================================
  // DYNAMIC ORDER CURRENCY & COMMUTATION ENGINE
  // Euro for EU/Italian Stocks, USDT for Crypto, USD for US/Commodities
  // Supports manual switching via commutation dropdown at any time
  // =========================================================================
  customOrderCurrency: null,

  getOrderCurrency: function() {
    if (this.customOrderCurrency) return this.customOrderCurrency;
    const asset = this.activeAsset || (window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null);
    if (asset) {
      if (asset.currency === '€' || asset.cat === 'eu_stock' || asset.cat === 'Borsa Italiana' || (asset.symbol && asset.symbol.endsWith('.MI'))) {
        return 'EUR';
      }
      if (asset.cat === 'crypto' || (this.currentSymbol && this.currentSymbol.endsWith('USDT'))) {
        return 'USDT';
      }
      if (asset.currency === '$') return 'USD';
      if (asset.currency) return asset.currency;
    }
    if (this.currentSymbol && this.currentSymbol.endsWith('.MI')) return 'EUR';
    if (this.currentSymbol && (this.currentSymbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'NEAR'].some(s => this.currentSymbol.includes(s)))) return 'USDT';
    return 'USD';
  },

  getCurrencySymbol: function(currCode) {
    const c = currCode || this.getOrderCurrency();
    if (c === 'EUR' || c === '€') return '€';
    if (c === 'USDT') return 'USDT';
    if (c === 'GBP' || c === '£') return '£';
    if (c === 'CHF') return 'CHF';
    return '$';
  },

  setOrderCurrency: function(val) {
    this.customOrderCurrency = val;
    this.updateCurrencyUI();
    this.recalcBybitOrderMetrics();
    if (window.showToast) window.showToast(`Valuta Ordine impostata su: ${val}`, 'info');
  },

  updateCurrencyUI: function() {
    const code = this.getOrderCurrency();
    const sym = this.getCurrencySymbol(code);

        const amtInput = document.getElementById('bb-order-usdt');
    if (amtInput) {
      amtInput.style.paddingLeft = (code === 'USDT' || code === 'CHF') ? '58px' : '28px';
    }
    const sel = document.getElementById('bb-order-currency-select');
    if (sel && sel.value !== code) sel.value = code;

    const amtBtn = document.querySelector('[data-sm="amount"]');
    if (amtBtn) amtBtn.innerText = `💵 Per Importo (${code === 'EUR' ? '€' : code})`;

    const symBadge = document.getElementById('bb-order-amt-sym');
    if (symBadge) symBadge.innerText = (code === 'USDT' || code === 'CHF') ? code : sym;

    const slLbl = document.getElementById('bb-sl-label');
    if (slLbl) slLbl.innerText = `STOP LOSS (${code === 'EUR' ? '€' : code})`;

    const tpLbl = document.getElementById('bb-tp-label');
    if (tpLbl) tpLbl.innerText = `TAKE PROFIT (${code === 'EUR' ? '€' : code})`;
  },

  // CALCULATE BYBIT LIQUIDATION PRICE & ORDER COST (COHERENT SINGLE SOURCE OF TRUTH)
  recalcBybitOrderMetrics: function() {
    const asset = this.activeAsset || (window.getAssetBySymbol ? window.getAssetBySymbol(this.currentSymbol) : null);
    const currCode = this.getOrderCurrency ? this.getOrderCurrency() : 'USD';
    const currSym = this.getCurrencySymbol ? this.getCurrencySymbol(currCode) : '$';
    const curr = (currCode === 'USDT' || currCode === 'CHF') ? `${currCode} ` : currSym;
    this.updateCurrencyUI();
    const prec = window.getDynamicPrecision ? window.getDynamicPrecision(this.tickerData.lastPrice, this.currentSymbol) : (asset ? (asset.precision || 2) : 2);
    
    // 1. Entry Price
    let price = this.tickerData.lastPrice || (asset ? asset.basePrice : 80000);
    if (this.orderType !== 'Market') {
      const rawEntry = document.getElementById('t-entry')?.value;
      if (rawEntry) {
        const parsedEntry = parseFloat(String(rawEntry).replace(',', '.'));
        if (parsedEntry > 0) price = parsedEntry;
      }
    }

    // 2. Leverage
    const levInput = document.getElementById('leverage-input');
    const lev = (levInput ? parseInt(levInput.value, 10) : null) || this.currentLeverage || 10;
    this.currentLeverage = lev;

    // 3. Sizing (Per Importo vs Per Quantità)
    let nominalValue = 1000;
    let qty = 0.0125;

    if (this.sizingMode === 'amount') {
      const rawAmt = document.getElementById('bb-order-usdt')?.value;
      const amt = (rawAmt ? parseFloat(String(rawAmt).replace(',', '.')) : 1000) || 1000;
      nominalValue = amt;
      qty = price > 0 ? (nominalValue / price) : 0;
      const qtyInput = document.getElementById('bb-order-qty');
      if (qtyInput) qtyInput.value = qty.toFixed(qty < 1 ? 4 : 2);
    } else {
      const rawQty = document.getElementById('bb-order-qty')?.value;
      qty = (rawQty ? parseFloat(String(rawQty).replace(',', '.')) : 0.1) || 0.1;
      nominalValue = qty * price;
      const amtInput = document.getElementById('bb-order-usdt');
      if (amtInput) amtInput.value = nominalValue.toFixed(2);
    }

    const initialMargin = nominalValue / Math.max(1, lev);
    const mmr = 0.005; // 0.5% Maintenance Margin Rate for Bybit Perpetual
    const side = window.currentTradeSide || 'LONG';

    // 4. Bybit Liquidation Price Formula
    let liqPrice = 0;
    if (side === 'LONG') {
      liqPrice = price * (1 - (1 / lev) + mmr);
    } else {
      liqPrice = price * (1 + (1 / lev) - mmr);
    }
    const liqDistPct = price > 0 ? Math.abs((liqPrice - price) / price) * 100 : 0;
    const estFee = nominalValue * 0.00055;

    // 5. Update UI elements (both primary and duplicate targets)
    const costElem = document.getElementById('bb-cost-val');
    const liqElem = document.getElementById('bb-liq-val');
    const feeElem = document.getElementById('bb-fee-val');
    const sumLevElem = document.getElementById('bb-summary-lev');
    const nominalElems = [document.getElementById('bb-nominal-val'), document.getElementById('bb-nominal-val-dup')];

    const fmtNominal = `${curr}${nominalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtMargin = `${curr}${initialMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtLiq = `${curr}${Math.max(0, liqPrice).toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })} (${side === 'LONG' ? '-' : '+'}${liqDistPct.toFixed(1)}%)`;
    const fmtFee = `${curr}${estFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    nominalElems.forEach(el => { if (el) el.innerText = fmtNominal; });
    if (costElem) costElem.innerText = fmtMargin;
    if (liqElem) liqElem.innerText = fmtLiq;
    if (feeElem) feeElem.innerText = fmtFee;
    if (sumLevElem) sumLevElem.innerText = `${lev}x`;

    // 6. Stop Loss & Take Profit Previews and R:R
    const slInputEl = document.getElementById('t-sl');
    const tpInputEl = document.getElementById('t-tp');
    let slRaw = slInputEl?.value || '';
    let tpRaw = tpInputEl?.value || '';
    let sl = slRaw ? parseFloat(String(slRaw).replace(',', '.')) : 0;
    let tp = tpRaw ? parseFloat(String(tpRaw).replace(',', '.')) : 0;

    // Sanity check: prevent residual prior asset scale (e.g. BTC 75,000 lingering when UCG 81.62 is active)
    if (price > 0 && ((sl > price * 3 || (sl > 0 && sl < price * 0.2)) || (tp > price * 3 || (tp > 0 && tp < price * 0.2)))) {
      sl = +(price * 0.97).toFixed(prec);
      tp = +(price * 1.06).toFixed(prec);
      if (slInputEl) slInputEl.value = sl;
      if (tpInputEl) tpInputEl.value = tp;
    }

    const slPreview = document.getElementById('sl-loss-preview');
    const tpPreview = document.getElementById('tp-gain-preview');
    const rrElem = document.getElementById('pos-res-rr');

    if (slPreview) {
      if (sl > 0) {
        const slDist = Math.abs(price - sl);
        const slLoss = qty * slDist;
        const slPct = (slDist / price) * 100;
        slPreview.innerText = `-${curr}${slLoss.toFixed(2)} (-${slPct.toFixed(2)}%)`;
      } else {
        slPreview.innerText = `-${curr}0.00 (-0.0%)`;
      }
    }

    if (tpPreview) {
      if (tp > 0) {
        const tpDist = Math.abs(tp - price);
        const tpGain = qty * tpDist;
        const tpPct = (tpDist / price) * 100;
        tpPreview.innerText = `+${curr}${tpGain.toFixed(2)} (+${tpPct.toFixed(2)}%)`;
      } else {
        tpPreview.innerText = `+${curr}0.00 (+0.0%)`;
      }
    }

    if (rrElem) {
      if (sl > 0 && tp > 0 && Math.abs(price - sl) > 0) {
        const rr = Math.abs(tp - price) / Math.abs(price - sl);
        rrElem.innerText = `1 : ${rr.toFixed(2)}`;
        rrElem.style.color = rr >= 2 ? 'var(--buy)' : (rr >= 1.5 ? 'var(--accent)' : 'var(--sell)');
      }
    }

    // 7. Sync with legacy display IDs if present
    const posResUnits = document.getElementById('pos-res-units');
    const posResMargin = document.getElementById('pos-res-margin');
    const posResLiq = document.getElementById('pos-res-liq');
    if (posResUnits) posResUnits.innerText = qty.toFixed(qty < 1 ? 4 : 2);
    if (posResMargin) posResMargin.innerText = fmtMargin;
    if (posResLiq) posResLiq.innerText = `${curr}${Math.max(0, liqPrice).toFixed(prec)}`;

    // 8. Update Execution Button
    const execBtn = document.getElementById('btn-execute-order');
    if (execBtn) {
      if (side === 'LONG') {
        execBtn.className = 'btn-action-primary btn-buy';
        execBtn.innerText = `🟢 APRI POSIZIONE BUY / LONG · ${fmtMargin} Margine`;
      } else {
        execBtn.className = 'btn-action-primary btn-sell';
        execBtn.innerText = `🔴 APRI POSIZIONE SELL / SHORT · ${fmtMargin} Margine`;
      }
    }
  }
};

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    BybitEngine.init();
  }, 400);
});

window.switchBookSubTab = function(tab) {
  if (window.BybitLayoutManager) {
    window.BybitLayoutManager.switchBookSubTab(tab);
  }
};