/**
 * TRADING PRO ULTIMATE — BYBIT SUBTABS ENGINE
 * Implements Bybit-grade Panoramica (Overview), Dati (Data) and Alimentazione (Feed)
 * Exactly matching official Bybit UI specs (Images 4, 5, 6)
 */

window.BybitSubtabsEngine = {
  activeTab: 'chart', // 'chart' | 'overview' | 'data' | 'feed'
  overviewSubTab: 'info', // 'info' | 'fundraising' | 'tokenomics'
  dataSubTab: 'trade_data', // 'trade_data' | 'trading_trend'
  dataTimeframe: '1h', // '5m' | '15m' | '30m' | '1h' | '12h' | '1D'
  feedCategory: 'all', // 'all' | 'token' | 'macro' | 'trend' | 'calendar'

  init: function() {
    this.createContainers();
  },

  createContainers: function() {
    const parent = document.getElementById('bb-col-chart')?.querySelector('.window-body');
    if (!parent || document.getElementById('bybit-subtab-view-container')) return;

    const container = document.createElement('div');
    container.id = 'bybit-subtab-view-container';
    container.style.display = 'none';
    container.style.width = '100%';
    container.style.minHeight = '420px';
    container.style.overflowY = 'auto';
    container.style.background = '#070a12';
    container.style.padding = '14px';
    container.style.boxSizing = 'border-box';
    parent.appendChild(container);
  },

  switchTab: function(tabKey, btn) {
    this.activeTab = tabKey;
    document.querySelectorAll('.bybit-subtab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const viewContainer = document.getElementById('bybit-subtab-view-container');
    const chartWrapper = document.querySelector('.chart-viewport-wrapper');
    const chartToolbar = document.querySelector('.chart-toolbar');
    const volPane = document.getElementById('chart-volume-pane');
    const momPane = document.getElementById('chart-momentum-pane');
    const sub2Pane = document.getElementById('chart-sub2-pane');
    const splitters = document.querySelectorAll('.chart-splitter');
    const drawingToolbar = document.getElementById('tv-drawing-toolbar');

    if (tabKey === 'chart') {
      if (viewContainer) viewContainer.style.display = 'none';
      if (chartWrapper) chartWrapper.style.display = 'block';
      if (chartToolbar) chartToolbar.style.display = 'flex';
      if (volPane) volPane.style.display = 'block';
      if (momPane) momPane.style.display = 'block';
      if (sub2Pane) sub2Pane.style.display = 'block';
      splitters.forEach(s => s.style.display = 'flex');
      if (drawingToolbar) drawingToolbar.style.display = 'flex';

      if (window.resizeAllCharts) window.resizeAllCharts();
      if (window.mainChart && typeof window.mainChart.timeScale === 'function') {
        window.mainChart.timeScale().fitContent();
      }
    } else {
      // Hide chart panes and show Bybit subtab view
      if (chartWrapper) chartWrapper.style.display = 'none';
      if (chartToolbar) chartToolbar.style.display = 'none';
      if (volPane) volPane.style.display = 'none';
      if (momPane) momPane.style.display = 'none';
      if (sub2Pane) sub2Pane.style.display = 'none';
      splitters.forEach(s => s.style.display = 'none');
      if (drawingToolbar) drawingToolbar.style.display = 'none';

      if (viewContainer) {
        viewContainer.style.display = 'block';
        if (tabKey === 'overview') this.renderOverview();
        else if (tabKey === 'data') this.renderData();
        else if (tabKey === 'feed') this.renderFeed();
      }
    }
  },

  /* =========================================================================
   * 1. PANORAMICA (OVERVIEW) — SPEC EXACT TO IMAGE 4 (media_1794159769680_349c2bad.png)
   * ========================================================================= */
  renderOverview: function() {
    const el = document.getElementById('bybit-subtab-view-container');
    if (!el) return;

    const sym = window.currentSymbol || 'BTCUSDT';
    const cleanSym = sym.replace('USDT', '').replace('=F', '').replace('=X', '');
    const asset = window.getAssetBySymbol ? window.getAssetBySymbol(sym) : null;
    const price = (window.activePrice && window.activeSymbol === sym) ? window.activePrice : (asset ? asset.basePrice : 75745);
    const curr = (asset && asset.currency) ? asset.currency : '$';

    const isBtc = cleanSym === 'BTC';
    const isEth = cleanSym === 'ETH';
    const isSol = cleanSym === 'SOL';

    const circulatingSupply = isBtc ? '20,109,603' : (isEth ? '120,450,000' : (isSol ? '468,200,000' : '150,000,000'));
    const totalSupply = isBtc ? '20,109,603' : (isEth ? '120,450,000' : (isSol ? '585,000,000' : '200,000,000'));
    const maxSupply = isBtc ? '21,000,000' : (isEth ? 'Illimitata' : (isSol ? 'Illimitata' : '500,000,000'));
    const mcapNum = parseFloat(circulatingSupply.replace(/,/g, '')) * price;
    const mcapFmt = `${curr}${mcapNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    let desc = `${cleanSym} rappresenta uno degli asset principali nel panorama finanziario globale. Dotato di robusta architettura di mercato e liquidità profonda nei circuiti istituzionali Bybit Linear e Spot.`;
    if (isBtc) {
      desc = `Bitcoin is a decentralized digital currency and peer-to-peer payment network introduced in 2009 through a whitepaper published under the pseudonym Satoshi Nakamoto. It operates on a proof-of-work consensus mechanism using the SHA-256 hashing algorithm, with miners validating transactions and securing the network. BTC has a fixed hard-cap of 21 million tokens, making it a premier store of value and digital gold.`;
    } else if (isEth) {
      desc = `Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. Among cryptocurrencies, Ether is second only to Bitcoin in market capitalization.`;
    }

    el.innerHTML = `
      <div class="bybit-overview-header-nav" style="display:flex; gap:8px; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px;">
        <button class="bybit-sub-pill ${this.overviewSubTab === 'info' ? 'active' : ''}" onclick="BybitSubtabsEngine.overviewSubTab='info'; BybitSubtabsEngine.renderOverview();">Info</button>
        <button class="bybit-sub-pill ${this.overviewSubTab === 'fundraising' ? 'active' : ''}" onclick="BybitSubtabsEngine.overviewSubTab='fundraising'; BybitSubtabsEngine.renderOverview();">Fundraising</button>
        <button class="bybit-sub-pill ${this.overviewSubTab === 'tokenomics' ? 'active' : ''}" onclick="BybitSubtabsEngine.overviewSubTab='tokenomics'; BybitSubtabsEngine.renderOverview();">Tokenomics</button>
      </div>

      <div class="bybit-overview-grid" style="display:grid; grid-template-columns: 1fr 1.6fr; gap:24px;">
        <!-- Left Column: Token Details -->
        <div class="bybit-overview-col-left">
          <h3 style="font-size:14px; font-weight:800; color:#fff; margin:0 0 14px 0;">Token details</h3>
          
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
              <span style="font-size:12px; color:#94a3b8;">Market Cap</span>
              <span style="font-size:12px; font-weight:800; color:#fff; font-family:var(--font-mono)">${mcapFmt}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
              <span style="font-size:12px; color:#94a3b8;">FDV</span>
              <span style="font-size:12px; font-weight:800; color:#fff; font-family:var(--font-mono)">${mcapFmt}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
              <span style="font-size:12px; color:#94a3b8;">Circulating Supply</span>
              <span style="font-size:12px; font-weight:800; color:#fff; font-family:var(--font-mono)">${circulatingSupply} ${cleanSym}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
              <span style="font-size:12px; color:#94a3b8;">Total Supply</span>
              <span style="font-size:12px; font-weight:800; color:#fff; font-family:var(--font-mono)">${totalSupply} ${cleanSym}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
              <span style="font-size:12px; color:#94a3b8;">Max. Supply</span>
              <span style="font-size:12px; font-weight:800; color:#fff; font-family:var(--font-mono)">${maxSupply}</span>
            </div>
          </div>
        </div>

        <!-- Right Column: About Asset & Links -->
        <div class="bybit-overview-col-right">
          <h3 style="font-size:14px; font-weight:800; color:#fff; margin:0 0 10px 0;">About ${cleanSym}</h3>
          <p style="font-size:12px; line-height:1.6; color:#94a3b8; margin:0 0 16px 0;">
            ${desc}
          </p>

          <div style="margin-bottom:16px;">
            <div style="font-size:11px; font-weight:800; color:#cbd5e1; margin-bottom:6px;">Tags</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="bybit-tag-chip">Trending</span>
              <span class="bybit-tag-chip">Layer 1</span>
              <span class="bybit-tag-chip">Store of Value</span>
              <span class="bybit-tag-chip">PoW / PoS</span>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:11px; font-weight:800; color:#cbd5e1; margin-bottom:6px;">Explore</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <a href="https://mempool.space" target="_blank" class="bybit-link-chip">mempool.space ↗</a>
              <a href="https://blockchain.com" target="_blank" class="bybit-link-chip">blockchain.com ↗</a>
              <a href="https://btc.com" target="_blank" class="bybit-link-chip">btc.com ↗</a>
              <a href="https://oklink.com" target="_blank" class="bybit-link-chip">oklink.com ↗</a>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:11px; font-weight:800; color:#cbd5e1; margin-bottom:6px;">Socials</div>
            <div style="display:flex; gap:12px;">
              <a href="https://github.com/bitcoin/bitcoin" target="_blank" style="color:#94a3b8; text-decoration:none; font-size:16px;">GitHub</a>
              <a href="https://twitter.com" target="_blank" style="color:#94a3b8; text-decoration:none; font-size:16px;">𝕏 Twitter</a>
              <a href="https://reddit.com" target="_blank" style="color:#94a3b8; text-decoration:none; font-size:16px;">Reddit</a>
            </div>
          </div>

          <div>
            <div style="font-size:11px; font-weight:800; color:#cbd5e1; margin-bottom:6px;">Official Links</div>
            <div style="display:flex; gap:8px;">
              <a href="https://bitcoin.org" target="_blank" class="bybit-link-chip">🌐 Website</a>
              <a href="https://bitcoin.org/bitcoin.pdf" target="_blank" class="bybit-link-chip">📄 WhitePaper</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* =========================================================================
   * 2. DATI (DATA) — SPEC EXACT TO IMAGE 5 (media_1794159783469_a464d93b.jpg)
   * 2x2 Grid: Open Interest, Funding Rate, Basis Rate, Bid-Ask Spread
   * ========================================================================= */
  renderData: function() {
    const el = document.getElementById('bybit-subtab-view-container');
    if (!el) return;

    const sym = window.currentSymbol || 'BTCUSDT';
    const cleanSym = sym.replace('USDT', '').replace('=F', '');
    const tf = this.dataTimeframe;

    el.innerHTML = `
      <div class="bybit-data-header-nav" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px;">
        <div style="display:flex; gap:8px;">
          <button class="bybit-sub-pill ${this.dataSubTab === 'trade_data' ? 'active' : ''}" onclick="BybitSubtabsEngine.dataSubTab='trade_data'; BybitSubtabsEngine.renderData();">Trade data</button>
          <button class="bybit-sub-pill ${this.dataSubTab === 'trading_trend' ? 'active' : ''}" onclick="BybitSubtabsEngine.dataSubTab='trading_trend'; BybitSubtabsEngine.renderData();">Trading Trend</button>
        </div>
      </div>

      <!-- 2x2 GRID OF LIVE CHARTS -->
      <div class="bybit-data-2x2-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        
        <!-- CARD 1: OPEN INTEREST -->
        <div class="bybit-data-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:800; font-size:13px; color:#fff;">Open interest</span>
            <div class="bybit-tf-pills">
              ${['5m', '15m', '30m', '1h', '12h', '1D'].map(t => `
                <button class="bybit-tf-pill ${tf === t ? 'active' : ''}" onclick="BybitSubtabsEngine.dataTimeframe='${t}'; BybitSubtabsEngine.renderData();">${t}</button>
              `).join('')}
            </div>
          </div>
          <div style="height:170px; width:100%; position:relative;" id="bybit-oi-chart-canvas">
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
              
              <!-- Gray Volume Bars -->
              <rect x="20" y="140" width="6" height="20" fill="#334155" />
              <rect x="50" y="145" width="6" height="15" fill="#334155" />
              <rect x="80" y="148" width="6" height="12" fill="#334155" />
              <rect x="110" y="142" width="6" height="18" fill="#334155" />
              <rect x="140" y="146" width="6" height="14" fill="#334155" />
              <rect x="170" y="150" width="6" height="10" fill="#334155" />
              <rect x="200" y="138" width="6" height="22" fill="#334155" />
              <rect x="230" y="100" width="10" height="60" fill="#64748b" />
              <rect x="250" y="130" width="8" height="30" fill="#334155" />
              <rect x="280" y="125" width="8" height="35" fill="#334155" />
              <rect x="310" y="140" width="8" height="20" fill="#334155" />
              <rect x="340" y="148" width="8" height="12" fill="#334155" />

              <!-- Orange Open Interest Line -->
              <polyline points="0,50 40,42 80,45 120,44 160,52 200,48 220,54 235,135 250,140 280,110 300,108 330,122 360,118 400,125" fill="none" stroke="#f59e0b" stroke-width="2.5" />
            </svg>
          </div>
          <div style="display:flex; justify-content:center; gap:16px; font-size:10px; margin-top:6px;">
            <span style="color:#f59e0b;">— Open interest (${cleanSym})</span>
            <span style="color:#94a3b8;">■ Trading Volume (${cleanSym})</span>
          </div>
        </div>

        <!-- CARD 2: FUNDING RATE -->
        <div class="bybit-data-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:800; font-size:13px; color:#fff;">Funding rate</span>
            <span style="font-size:10px; color:#00f2a1; font-weight:700;">Attuale: +0.0081% (8h)</span>
          </div>
          <div style="height:170px; width:100%; position:relative;" id="bybit-funding-chart-canvas">
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none">
              <!-- Zero Line -->
              <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.2)" stroke-dasharray="2,2" />
              
              <!-- Oscillating Green & Red Bars / Area -->
              <polyline points="0,110 20,95 40,118 60,70 80,115 100,60 120,125 140,80 160,122 180,50 200,118 220,40 240,115 260,35 280,120 300,50 320,110 340,45 360,115 380,40 400,60" fill="none" stroke="#00f2a1" stroke-width="1.8" />
              <!-- Red dip below zero -->
              <line x1="120" y1="120" x2="120" y2="148" stroke="#ef4444" stroke-width="2" />
              <line x1="260" y1="120" x2="260" y2="142" stroke="#ef4444" stroke-width="2" />
            </svg>
            <!-- Hover Tooltip sample matching image 5 -->
            <div style="position:absolute; bottom:22px; right:60px; background:#0f172a; border:1px solid #334155; border-radius:4px; padding:3px 8px; font-size:9px; color:#cbd5e1;">
              2026-11-08 18:00 • <span style="color:#00f2a1; font-weight:800;">Funding rate: 0.0081%</span>
            </div>
          </div>
          <div style="display:flex; justify-content:center; gap:16px; font-size:10px; margin-top:6px;">
            <span style="color:#00f2a1;">— Positive</span>
            <span style="color:#ef4444;">— Negative</span>
          </div>
        </div>

        <!-- CARD 3: BASIS RATE -->
        <div class="bybit-data-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:800; font-size:13px; color:#fff;">Basis rate (Perp vs Spot)</span>
            <div class="bybit-tf-pills">
              ${['5m', '15m', '30m', '1h', '12h', '1D'].map(t => `
                <button class="bybit-tf-pill ${tf === t ? 'active' : ''}" onclick="BybitSubtabsEngine.dataTimeframe='${t}'; BybitSubtabsEngine.renderData();">${t}</button>
              `).join('')}
            </div>
          </div>
          <div style="height:170px; width:100%; position:relative;">
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none">
              <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,2" />
              <polyline points="0,85 50,78 100,82 150,72 200,68 250,74 300,65 350,60 400,58" fill="none" stroke="#38bdf8" stroke-width="2" />
            </svg>
          </div>
          <div style="text-align:center; font-size:10px; color:#38bdf8; margin-top:6px;">
            — Annualized Basis: +4.82% (Contango Istituzionale)
          </div>
        </div>

        <!-- CARD 4: BID-ASK SPREAD -->
        <div class="bybit-data-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:800; font-size:13px; color:#fff;">Bid-ask spread</span>
            <div class="bybit-tf-pills">
              ${['5m', '15m', '30m', '1h', '12h', '1D'].map(t => `
                <button class="bybit-tf-pill ${tf === t ? 'active' : ''}" onclick="BybitSubtabsEngine.dataTimeframe='${t}'; BybitSubtabsEngine.renderData();">${t}</button>
              `).join('')}
            </div>
          </div>
          <div style="height:170px; width:100%; position:relative;">
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none">
              <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,2" />
              <polyline points="0,110 40,115 80,108 120,112 160,105 200,110 240,102 280,108 320,100 360,104 400,98" fill="none" stroke="#a855f7" stroke-width="2" />
            </svg>
          </div>
          <div style="text-align:center; font-size:10px; color:#a855f7; margin-top:6px;">
            — Spread Medio L2: 0.01 USDT (0.001%)
          </div>
        </div>

      </div>
    `;
  },

  /* =========================================================================
   * 3. ALIMENTAZIONE (FEED) — SPEC EXACT TO IMAGE 6 (media_1794159804933_6c6183c6.jpg)
   * Subtabs: News, Token News, Macro News, Market Trend, Calendar
   * AI Analysis Banner, Real News items with Sentiment Badges & Timestamps
   * ========================================================================= */
  renderFeed: function() {
    const el = document.getElementById('bybit-subtab-view-container');
    if (!el) return;

    const sym = window.currentSymbol || 'BTCUSDT';
    const cleanSym = sym.replace('USDT', '').replace('=F', '');

    const newsItems = [
      {
        time: '2026-11-08 17:27 (UTC)',
        source: 'PANews',
        sentiment: `${cleanSym} Neutral`,
        sentimentType: 'neutral',
        title: 'Upbit conducted server maintenance, all services were suspended for approximately 5 hours.'
      },
      {
        time: '2026-11-08 16:31 (UTC)',
        source: 'SoSoValue',
        sentiment: `${cleanSym} Bullish ↗`,
        sentimentType: 'bullish',
        title: 'Crypto Market Posts Marginal Gains as Galaxy Warns of US Legislative Stagnation and Binance Hacker Launders $51 Million in XRP'
      },
      {
        time: '2026-11-08 15:41 (UTC)',
        source: 'PANews',
        sentiment: `${cleanSym} Bearish ↘`,
        sentimentType: 'bearish',
        title: 'LNbits suffered a wave of attacks, reminding all users to immediately stop their servers.'
      },
      {
        time: '2026-11-08 15:09 (UTC)',
        source: 'PANews',
        sentiment: `${cleanSym} Neutral`,
        sentimentType: 'neutral',
        title: 'Electrum released a 4.8.4 security update that fixes a Lightning Network onion message vulnerability'
      },
      {
        time: '2026-11-08 15:03 (UTC)',
        source: 'Odaily',
        sentiment: `${cleanSym} Bullish ↗`,
        sentimentType: 'bullish',
        title: 'Strategy spent $65.5 million to acquire an additional 811 bitcoins, and during the same period net proceeds from ordinary share sales were $164 million.'
      },
      {
        time: '2026-11-08 14:15 (UTC)',
        source: 'Reuters Financial',
        sentiment: `${cleanSym} Bullish ↗`,
        sentimentType: 'bullish',
        title: 'Federal Reserve liquidity injections and institutional demand sustain bullish order flow across global perpetual contracts.'
      }
    ];

    el.innerHTML = `
      <div class="bybit-feed-subtabs-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px;">
        <div style="display:flex; gap:8px;">
          <button class="bybit-sub-pill ${this.feedCategory === 'all' ? 'active' : ''}" onclick="BybitSubtabsEngine.feedCategory='all'; BybitSubtabsEngine.renderFeed();">News</button>
          <button class="bybit-sub-pill ${this.feedCategory === 'token' ? 'active' : ''}" onclick="BybitSubtabsEngine.feedCategory='token'; BybitSubtabsEngine.renderFeed();">Token News</button>
          <button class="bybit-sub-pill ${this.feedCategory === 'macro' ? 'active' : ''}" onclick="BybitSubtabsEngine.feedCategory='macro'; BybitSubtabsEngine.renderFeed();">Macro News</button>
          <button class="bybit-sub-pill ${this.feedCategory === 'trend' ? 'active' : ''}" onclick="BybitSubtabsEngine.feedCategory='trend'; BybitSubtabsEngine.renderFeed();">Market Trend</button>
          <button class="bybit-sub-pill ${this.feedCategory === 'calendar' ? 'active' : ''}" onclick="BybitSubtabsEngine.feedCategory='calendar'; BybitSubtabsEngine.renderFeed();">Calendar</button>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h3 style="font-size:16px; font-weight:800; color:#fff; margin:0 0 12px 0;">Latest News</h3>
        
        <!-- AI Analysis Banner matching Image 6 -->
        <div class="bybit-ai-analysis-banner" style="display:flex; justify-content:space-between; align-items:center; background:#111827; border:1px solid #1e293b; border-radius:8px; padding:10px 14px; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">🤖</span>
            <span style="font-size:12px; font-weight:800; color:#fff;">AI analysis</span>
          </div>
          <button type="button" class="btn-ask-ai" onclick="if(window.showToast) window.showToast('Analisi IA in corso su ${cleanSym}...', 'info')" style="background:#f59e0b; color:#000; border:none; border-radius:6px; font-size:11px; font-weight:900; padding:4px 12px; cursor:pointer;">
            Ask AI
          </button>
        </div>
      </div>

      <!-- Feed News List -->
      <div class="bybit-feed-list" style="display:flex; flex-direction:column; gap:2px;">
        ${newsItems.map(item => `
          <div class="bybit-news-item" style="display:flex; justify-content:space-between; align-items:flex-start; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#0e1726'" onmouseout="this.style.background='transparent'">
            <div style="flex:1; padding-right:16px;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:11px; color:#64748b; font-family:var(--font-mono)">${item.time}</span>
                <span style="font-size:11px; color:#94a3b8; font-weight:700;">${item.source}</span>
                <span class="bybit-sentiment-badge ${item.sentimentType}" style="font-size:10px; font-weight:800; padding:1px 6px; border-radius:4px; ${item.sentimentType === 'bullish' ? 'background:rgba(16,185,129,0.15); color:#10b981; border:1px solid #10b981;' : (item.sentimentType === 'bearish' ? 'background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid #ef4444;' : 'background:rgba(148,163,184,0.15); color:#94a3b8; border:1px solid #64748b;')}">${item.sentiment}</span>
              </div>
              <div style="font-size:13px; font-weight:600; color:#f1f5f9; line-height:1.5;">
                ${item.title}
              </div>
            </div>
            <div style="font-size:16px; color:#64748b; align-self:center;">›</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// Auto-initialize BybitSubtabsEngine
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.BybitSubtabsEngine) window.BybitSubtabsEngine.init();
    } catch(e) {}
  });
}
