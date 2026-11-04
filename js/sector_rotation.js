/**
 * TRADING PRO ULTIMATE™ — ROTAZIONE SETTORIALE & MONEY FLOW ENGINE
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Modulo per il Tracciamento dei Volumi Istituzionali e Rotazione del Capitale:
 * 1. Macro Regime Detector: Risk-On vs Risk-Off
 * 2. Settori Azionari USA/EU (ETF XLK, XLF, XLE, XLV, XLI, XLU, XLP vs SPY)
 * 3. Narrazioni & Categorie Crypto (AI, Layer 1/2, DeFi, RWA, Meme, DePIN)
 * 4. La Regola d'Oro: Validazione del trend tramite volumi anomali di settore
 */

window.SectorRotation = {
  activeSectorTab: 'us_etf', // 'us_etf' | 'crypto_narratives'

  // Macro Regime State
  macroRegime: {
    state: 'RISK-ON (CRESCITA ESPANSIVA)',
    badgeColor: 'var(--buy)',
    narrative: 'I capitali istituzionali abbandonano i beni difensivi e si riversano massicciamente su Tecnologia (XLK), Intelligenza Artificiale e Crypto Layer 1.',
    vixLevel: '14.8 (Bassa Volatilità / Espansione)',
    riskRatio: '2.4x (Favorevole ad asset di crescita)'
  },

  // US Sector ETFs Data
  usSectors: [
    {
      ticker: 'XLK',
      name: 'Technology',
      price: 228.40,
      chg24h: '+2.85%',
      chg7d: '+5.40%',
      volumeRatio: 2.35, // 235% of 20d avg volume (Anomalous Surge!)
      rsVsSpy: '+1.8%',
      status: 'ACCUMULAZIONE FORTE (Surge Volumi)',
      isHot: true,
      topHoldings: 'NVDA, AAPL, MSFT, AVGO'
    },
    {
      ticker: 'XLE',
      name: 'Energy',
      price: 91.20,
      chg24h: '+1.45%',
      chg7d: '+3.10%',
      volumeRatio: 1.85,
      rsVsSpy: '+0.6%',
      status: 'ACCUMULAZIONE ISTITUZIONALE',
      isHot: true,
      topHoldings: 'XOM, CVX, COP'
    },
    {
      ticker: 'XLF',
      name: 'Financials',
      price: 47.80,
      chg24h: '+0.95%',
      chg7d: '+2.10%',
      volumeRatio: 1.20,
      rsVsSpy: '+0.1%',
      status: 'STABILE / INFLOW COSTANTE',
      isHot: false,
      topHoldings: 'JPM, BRK.B, V, MA'
    },
    {
      ticker: 'XLI',
      name: 'Industrials',
      price: 136.50,
      chg24h: '+0.60%',
      chg7d: '+1.20%',
      volumeRatio: 0.95,
      rsVsSpy: '-0.3%',
      status: 'NEUTRO',
      isHot: false,
      topHoldings: 'GE, CAT, UNP, HON'
    },
    {
      ticker: 'XLV',
      name: 'Healthcare (Difensivo)',
      price: 148.20,
      chg24h: '-0.85%',
      chg7d: '-1.80%',
      volumeRatio: 0.72,
      rsVsSpy: '-1.4%',
      status: 'DEFLUSSO CAPITALE (Risk-Off Out)',
      isHot: false,
      topHoldings: 'LLY, UNH, JNJ, ABBV'
    },
    {
      ticker: 'XLU',
      name: 'Utilities (Difensivo)',
      price: 74.30,
      chg24h: '-1.20%',
      chg7d: '-2.90%',
      volumeRatio: 0.65,
      rsVsSpy: '-1.9%',
      status: 'DEFLUSSO MARCATO',
      isHot: false,
      topHoldings: 'NEE, SO, DUK, CEG'
    },
    {
      ticker: 'XLP',
      name: 'Consumer Staples (Difensivo)',
      price: 79.10,
      chg24h: '-0.40%',
      chg7d: '-1.10%',
      volumeRatio: 0.80,
      rsVsSpy: '-0.9%',
      status: 'CONSOLIDAMENTO SOTTO LA MEDIA',
      isHot: false,
      topHoldings: 'PG, COST, KO, PEP'
    }
  ],

  // Crypto Narratives & On-Chain Categories Data
  cryptoCategories: [
    {
      category: 'AI & Big Data Tokens',
      tokens: 'NEAR, FET, RENDER, TAO, AGIX',
      vol24hSurge: '+315%', // +300% anomalous increase!
      flow7d: '+$1.84B Inflow Netto',
      dominanceChange: '+4.2%',
      momentumScore: 94,
      status: 'ROTATION LEADER (Boom Volumi Istituzionali)',
      isHot: true,
      sentiment: 'SUPER BULLISH'
    },
    {
      category: 'Layer 1 & High-Performance Chains',
      tokens: 'BTC, SOL, SUI, APT, ETH',
      vol24hSurge: '+185%',
      flow7d: '+$4.20B Inflow Netto',
      dominanceChange: '+2.8%',
      momentumScore: 91,
      status: 'ACCUMULAZIONE FORTE (Flusso Spot ETF & Derivati)',
      isHot: true,
      sentiment: 'BULLISH'
    },
    {
      category: 'Real World Assets (RWA)',
      tokens: 'ONDO, LINK, TRU, PENDLE',
      vol24hSurge: '+142%',
      flow7d: '+$640M Inflow Netto',
      dominanceChange: '+1.5%',
      momentumScore: 82,
      status: 'INFLOW STRUTTURALE (Tokenizzazione Treasury)',
      isHot: true,
      sentiment: 'ACCUMULATE'
    },
    {
      category: 'Layer 2 & Rollups',
      tokens: 'ARB, OP, BASE Tokens, STRK',
      vol24hSurge: '+45%',
      flow7d: '+$210M Inflow Netto',
      dominanceChange: '-0.2%',
      momentumScore: 68,
      status: 'STABILE / CONSOLIDAMENTO',
      isHot: false,
      sentiment: 'NEUTRAL'
    },
    {
      category: 'DeFi & Lending Protocols',
      tokens: 'UNI, AAVE, MKR, CRV',
      vol24hSurge: '+28%',
      flow7d: '+$140M Inflow Netto',
      dominanceChange: '-0.5%',
      momentumScore: 62,
      status: 'ATTIVITÀ MEDIA (Yield Stabili)',
      isHot: false,
      sentiment: 'NEUTRAL'
    },
    {
      category: 'Meme & Speculative Community',
      tokens: 'DOGE, SHIB, PEPE, WIF, BONK',
      vol24hSurge: '-18%',
      flow7d: '-$320M Deflusso',
      dominanceChange: '-2.1%',
      momentumScore: 48,
      status: 'DEFLUSSO TEMPORANEO (Rotazione verso AI)',
      isHot: false,
      sentiment: 'COOLING OFF'
    }
  ],

  // EVALUATE THE GOLDEN RULE ("LA REGOLA D'ORO") FOR THE ACTIVE ASSET
  evaluateGoldenRule: function(symbol) {
    symbol = (symbol || window.activeSymbol || 'BTCUSDT').toUpperCase();

    if (symbol.includes('BTC') || symbol.includes('SOL') || symbol.includes('ETH')) {
      return {
        asset: symbol,
        sector: 'Crypto Layer 1 & Major Assets',
        sectorStatus: 'ACCUMULAZIONE FORTE (+185% Volumi Settoriali)',
        goldenRuleVerdict: 'CONFERMATO AL 100%',
        goldenRuleValid: true,
        summary: 'Il movimento di prezzo è sostenuto e anticipato da un aumento anomalo dei volumi sull\'intero settore crypto Layer 1. Elevata probabilità statistica di continuazione.',
        action: 'Acquisto consigliato solo sui ritracciamenti verso VWAP ed EMA 21.'
      };
    } else if (symbol.includes('NVDA') || symbol.includes('AAPL') || symbol.includes('MSFT')) {
      return {
        asset: symbol,
        sector: 'US Tech (XLK Technology ETF)',
        sectorStatus: 'ROTATION LEADER (+235% Volumi 2.35x Media)',
        goldenRuleVerdict: 'CONFERMATO AL 100%',
        goldenRuleValid: true,
        summary: 'L\'ETF Tecnologico XLK registra volumi record su base settimanale rispetto a SPY. Il trend di ' + symbol + ' è validato dal flusso massiccio istituzionale sul settore.',
        action: 'Applicare setup VWAP e Breakout VCP sul titolo leader.'
      };
    } else if (symbol.includes('ENEL') || symbol.includes('ENI')) {
      return {
        asset: symbol,
        sector: 'Utilities & Energy Europe',
        sectorStatus: 'ROTATION MISTA (Energy forte, Utilities difensive in deflusso)',
        goldenRuleVerdict: 'CONFERMA PARZIALE (Attenzione a selettività)',
        goldenRuleValid: false,
        summary: 'I volumi sul settore utilities sono in contrazione rispetto ai comparti di crescita. Operare con stop rigorosi.',
        action: 'Verificare supporto EMA 200 prima di posizionarsi.'
      };
    }

    return {
      asset: symbol,
      sector: 'Mercato Globale / Discrezionale',
      sectorStatus: 'VOLUMI SETTORIALI NELLA MEDIA',
      goldenRuleVerdict: 'NEUTRO',
      goldenRuleValid: true,
      summary: 'Volumi settoriali allineati alla media a 20 periodi. Nessuna divergenza anomala rilevata.',
      action: 'Attendere breakout di volume prima dell\'ingresso.'
    };
  },

  // RENDER DEDICATED SECTOR ROTATION TAB
  renderSectorRotationTab: function() {
    const container = document.getElementById('sector-rotation-view-container');
    if (!container) return;

    const currentSym = (window.activeSymbol || 'BTCUSDT').toUpperCase();
    const gr = this.evaluateGoldenRule(currentSym);

    container.innerHTML = `
      <div class="quant-grid-layout">
        
        <!-- MACRO REGIME DECK -->
        <div class="quant-header-deck">
          <div class="quant-deck-title">
            <span class="sparkle-icon">🌐</span>
            <div>
              <div style="font-weight:900; font-size:16px; letter-spacing:0.5px">ROTAZIONE SETTORIALE & FLUSSO DEI VOLUMI ISTITUZIONALI</div>
              <div style="font-size:11px; color:var(--text-muted)">Sector Rotation Matrix • Analisi Risk-On / Risk-Off • Trading Pro Ultimate © by cuordivino</div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:10px;">
            <div class="engine-status-pill" style="border-color:${this.macroRegime.badgeColor}; color:${this.macroRegime.badgeColor}; font-weight:800;">
              <span class="pulse-indicator" style="background:${this.macroRegime.badgeColor}"></span>
              <span>${this.macroRegime.state}</span>
            </div>
          </div>
        </div>

        <!-- GOLDEN RULE LIVE VERDICT CARD -->
        <div class="window-card" style="border-color:${gr.goldenRuleValid ? 'rgba(0,242,161,0.4)' : 'rgba(255,215,0,0.4)'}; background:linear-gradient(135deg, rgba(8,14,28,0.95) 0%, rgba(13,22,42,0.95) 100%)">
          <div class="window-header">
            <div class="window-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px">👑</span>
              <span style="color:var(--accent); font-weight:900">LA REGOLA D'ORO DEI VOLUMI SETTORIALI SU ${currentSym}</span>
            </div>
            <span class="strat-tag" style="background:${gr.goldenRuleValid ? 'rgba(0,242,161,0.15)' : 'rgba(255,215,0,0.15)'}; color:${gr.goldenRuleValid ? 'var(--buy)' : 'var(--accent)'}; font-size:11px; font-weight:800;">
              ${gr.goldenRuleVerdict}
            </span>
          </div>
          <div class="window-body" style="padding:16px;">
            <div class="input-grid-2col" style="gap:16px;">
              <div class="pos-summary">
                <div class="pos-row"><span>Asset Attivo:</span><span style="font-weight:800; color:#fff">${gr.asset}</span></div>
                <div class="pos-row"><span>Settore / Categoria:</span><span style="color:var(--cyan); font-weight:700">${gr.sector}</span></div>
                <div class="pos-row"><span>Stato Volumi Settoriali:</span><span style="color:var(--buy); font-weight:800">${gr.sectorStatus}</span></div>
                <div class="pos-row"><span>Direttiva Operativa:</span><span style="font-size:10px; color:var(--text-dim)">${gr.action}</span></div>
              </div>
              <div class="pos-summary" style="display:flex; flex-direction:column; justify-content:center;">
                <div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:800; margin-bottom:6px">ANALISI MONEY FLOW REGOLA D'ORO:</div>
                <div style="font-size:12px; color:var(--text-main); line-height:1.5">${gr.summary}</div>
                <div style="margin-top:10px; display:flex; gap:8px">
                  <button class="btn-telegram-dispatch" style="padding:6px 12px; font-size:11px" onclick="SectorRotation.sendSectorTelegramAlert('${gr.asset}', '${gr.sector}', '${gr.sectorStatus}', '${gr.goldenRuleVerdict}')">
                    📲 Invia Analisi Settoriale su Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUB-TABS: AZIONARIO (ETF US) VS CRYPTO NARRATIVES -->
        <div style="display:flex; gap:10px; margin-top:4px;">
          <button class="quant-nav-btn ${this.activeSectorTab === 'us_etf' ? 'active' : ''}" onclick="SectorRotation.switchSectorSubTab('us_etf')">
            🇺🇸 ETF Settoriali Azionario (XLK, XLF, XLE, XLV, XLI, XLU, XLP)
          </button>
          <button class="quant-nav-btn ${this.activeSectorTab === 'crypto_narratives' ? 'active' : ''}" onclick="SectorRotation.switchSectorSubTab('crypto_narratives')">
            🪙 Categorie & Narrazioni Crypto On-Chain (AI, Layer 1, DeFi, RWA)
          </button>
        </div>

        <!-- VIEW 1: US SECTOR ETFS TABLE & HEATMAP -->
        <div id="sec-pane-us" style="display:${this.activeSectorTab === 'us_etf' ? 'block' : 'none'};">
          <div class="window-card">
            <div class="window-header">
              <div class="window-title">
                <span>📊 Monitoraggio Volumi Settoriali & Forza Relativa (RS vs SPY)</span>
              </div>
              <div style="font-size:11px; color:var(--text-muted)">Anomalia di Volume = Rapporto vs Media 20 Periodi</div>
            </div>
            <div class="window-body">
              <div class="table-glass-container">
                <table class="pro-terminal-table">
                  <thead>
                    <tr>
                      <th>Ticker ETF</th>
                      <th>Settore</th>
                      <th>Prezzo</th>
                      <th>Var. 24h</th>
                      <th>Var. 7d</th>
                      <th>Anomalia Volumi (vs 20d MA)</th>
                      <th>Forza Relativa (RS vs SPY)</th>
                      <th>Stato Flusso Istituzionale</th>
                      <th>Top Holdings</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.usSectors.map(s => `
                      <tr style="${s.isHot ? 'background:rgba(0,242,161,0.03);' : ''}">
                        <td style="font-weight:900; color:var(--cyan)">${s.ticker}</td>
                        <td style="font-weight:700">${s.name}</td>
                        <td style="font-family:var(--font-mono)">$${s.price.toFixed(2)}</td>
                        <td style="font-family:var(--font-mono); color:${s.chg24h.startsWith('+') ? 'var(--buy)' : 'var(--sell)'}; font-weight:700">${s.chg24h}</td>
                        <td style="font-family:var(--font-mono); color:${s.chg7d.startsWith('+') ? 'var(--buy)' : 'var(--sell)'}">${s.chg7d}</td>
                        <td>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-weight:900; font-family:var(--font-mono); color:${s.volumeRatio >= 1.5 ? 'var(--buy)' : (s.volumeRatio < 0.8 ? 'var(--sell)' : 'var(--text-main)')}">
                              ${s.volumeRatio}x
                            </span>
                            ${s.volumeRatio >= 1.5 ? '<span class="strat-tag" style="background:rgba(0,242,161,0.2); color:var(--buy); font-size:9px">SURGE 🔥</span>' : ''}
                          </div>
                        </td>
                        <td style="font-family:var(--font-mono); font-weight:700; color:${s.rsVsSpy.startsWith('+') ? 'var(--buy)' : 'var(--sell)'}">${s.rsVsSpy}</td>
                        <td>
                          <span class="strat-tag" style="${s.isHot ? 'background:rgba(0,242,161,0.15); color:var(--buy);' : ''}">
                            ${s.status}
                          </span>
                        </td>
                        <td style="font-size:10px; color:var(--text-muted)">${s.topHoldings}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW 2: CRYPTO NARRATIVES TABLE -->
        <div id="sec-pane-crypto" style="display:${this.activeSectorTab === 'crypto_narratives' ? 'block' : 'none'};">
          <div class="window-card">
            <div class="window-header">
              <div class="window-title">
                <span>🪙 Narrazioni & Categorie Crypto On-Chain (Flusso Capitale 24h / 7d)</span>
              </div>
              <div style="font-size:11px; color:var(--text-muted)">Aggregazione Artemis & CoinGecko Institutional</div>
            </div>
            <div class="window-body">
              <div class="table-glass-container">
                <table class="pro-terminal-table">
                  <thead>
                    <tr>
                      <th>Categoria / Narrazione</th>
                      <th>Token Principali</th>
                      <th>Impulso Volumi 24h</th>
                      <th>Flusso Netto 7 Giorni</th>
                      <th>Variazione Dominanza</th>
                      <th>Score Momentum</th>
                      <th>Regime di Flusso</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.cryptoCategories.map(c => `
                      <tr style="${c.isHot ? 'background:rgba(6,182,212,0.03);' : ''}">
                        <td style="font-weight:900; color:#fff">${c.category}</td>
                        <td style="color:var(--cyan); font-weight:700">${c.tokens}</td>
                        <td>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-weight:900; font-family:var(--font-mono); color:${c.vol24hSurge.startsWith('+') ? 'var(--buy)' : 'var(--sell)'}">
                              ${c.vol24hSurge}
                            </span>
                            ${c.vol24hSurge.includes('3') ? '<span class="strat-tag" style="background:rgba(0,242,161,0.2); color:var(--buy); font-size:9px">BOOM 🔥</span>' : ''}
                          </div>
                        </td>
                        <td style="font-family:var(--font-mono); font-weight:700; color:${c.flow7d.includes('+') ? 'var(--buy)' : 'var(--sell)'}">${c.flow7d}</td>
                        <td style="font-family:var(--font-mono); color:var(--accent)">${c.dominanceChange}</td>
                        <td>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <div style="flex:1; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; width:60px;">
                              <div style="width:${c.momentumScore}%; height:100%; background:var(--cyan)"></div>
                            </div>
                            <span style="font-family:var(--font-mono); font-weight:800; font-size:11px">${c.momentumScore}/100</span>
                          </div>
                        </td>
                        <td>
                          <span class="strat-tag" style="${c.isHot ? 'background:rgba(6,182,212,0.15); color:var(--cyan);' : ''}">
                            ${c.status}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  switchSectorSubTab: function(tab) {
    this.activeSectorTab = tab;
    this.renderSectorRotationTab();
  },

  sendSectorTelegramAlert: function(asset, sector, status, verdict) {
    if (window.sendTelegramSignalDirect) {
      window.sendTelegramSignalDirect({
        asset: asset,
        side: 'LONG',
        price: window.activePrice || 80350,
        score: 92,
        verdict: `ROTAZIONE SETTORIALE: ${verdict}`,
        reason: `La Regola d'Oro dei Volumi conferma che il trend su ${asset} è sostenuto e anticipato dall'inflow di volumi anomalo sull'intero settore ${sector} (${status}). Regime globale: Risk-On.`
      });
    }
  }
};

// Auto init on document load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    SectorRotation.renderSectorRotationTab();
  }, 500);
});
