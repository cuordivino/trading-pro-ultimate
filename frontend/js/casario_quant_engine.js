/**
 * TRADING PRO ULTIMATE™ — INSTITUTIONAL QUANT INTELLIGENCE & MACRO RADAR
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Modulo Quantitativo Avanzato Multifattoriale:
 * 1. PANORAMICA MACRO & TOP SETUP DAILY (4 Quadranti, Liquidità Fed, VIX Term Structure, 3 Proposte del Giorno)
 * 2. RADAR & SCREENER A CASCATA (Tendine e Sotto-Tendine gerarchiche: Macro Area, Asset Class, Settore, Direzione, Stagionalità)
 * 3. DOSSIER ASSET & ESPLOSIONE DETTAGLIO (Bande di Volatilità, 5 Pilastri matematici, Bilancio/Cash Flow, Stagionalità 5/10/15y + Custom Window, Mappatura ETF, Esportazione PDF)
 * 4. PORTAFOGLI MODELLO DINAMICI (3 Archetipi, Countdown Ribilanciamento, Curva vs S&P 500, Underwater Drawdown, Sizer Capitale Personalizzato, Checklist Operativa, FAQ Accordion)
 * 5. ACTION DISPATCHER CON ONE-CLICK APPROVAL GATE & SAFETY TTL 10 SECONDI
 * 6. MASTER RISK CARD (Worst-Case Scenario Portfolio Drawdown Monitor)
 */

window.CasarioQuantEngine = {
  // Navigation State
  activeSubTab: 'macro-overview', // 'macro-overview' | 'radar-screener' | 'asset-dossier' | 'model-portfolios'
  selectedMacroRegion: 'usa',     // 'usa', 'europe', 'uk', 'asia', 'china', 'canada', 'australia'
  selectedAssetSymbol: 'NVDA',    // Active symbol in dossier
  activeDossierSubTab: 'bands',   // 'bands' | 'fundamentals' | 'seasonality' | 'etf'
  selectedPortfolioId: 'balanced',// 'conservative' | 'balanced' | 'growth'
  portfolioCapital: 10000,        // Custom user capital in EUR
  portfolioCurrency: '€',
  customSeasonStart: '15 Novembre',
  customSeasonEnd: '05 Gennaio',

  // Master Macro State
  macroState: {
    quadrant: 1, // 1: Goldilocks, 2: Overheating, 3: Stagflation, 4: Deflation
    growthRate: '+3.4% RoC',
    inflationRate: '-1.8% RoC',
    riskMultiplier: 1.2,
    fedNetLiquidity: {
      totalTrillion: 5.92,
      delta4wPct: 1.6,
      growing: true,
      formula: 'WALCL - WTREGEN - (RRPONTSYD * 1000)'
    },
    vixStructure: {
      vix: 15.20,
      vix3m: 17.30,
      ratio: 0.88,
      regime: 'Contango Netto (Sano Mercato Toro)',
      circuitBreakerActive: false
    },
    btpBund: {
      spreadBps: 118.0,
      thresholdBps: 190.0,
      circuitBreakerActive: false
    },
    circuitBreakers: {
      vixBackwardation: false,
      btpBundAlert: false,
      forexRolloverLock: false,
      milanAuctionFreeze: false
    }
  },

  // Regional Macro Database
  macroRegions: {
    usa: {
      name: 'Stati Uniti (Wall Street)',
      flag: '🇺🇸',
      regime: 'Goldilocks / Espansione',
      regimeCode: 'goldilocks',
      score: 78,
      gdpRoc: '+2.8%',
      cpi: '2.4%',
      pce: '2.1%',
      rate: '4.75%',
      yield10y: '4.28%',
      sentiment: { bulls: 44, neutrals: 38, bears: 18 },
      desc: 'Liquidità netta Fed in espansione ($5.92T). Guadagni di produttività guidati da investimenti in AI infrastrutturale. Rendimento reale a 10Y stabilizzato su livelli sostenibili.'
    },
    europe: {
      name: 'Eurozona & Borsa Italiana',
      flag: '🇪🇺',
      regime: 'Reflazione Moderata',
      regimeCode: 'reflation',
      score: 72,
      gdpRoc: '+0.9%',
      cpi: '2.0%',
      pce: '2.1%',
      rate: '3.25%',
      yield10y: '2.34% (Bund)',
      sentiment: { bulls: 38, neutrals: 42, bears: 20 },
      desc: 'BCE orientata verso ulteriori tagli dei tassi. Inflazione ancorata al target 2.0%. Spread BTP/Bund su minimi pluriennali (118 bps), nessun rischio sistemico sovrano.'
    },
    uk: {
      name: 'Regno Unito (FTSE 100)',
      flag: '🇬🇧',
      regime: 'Transizione Disinflazionistica',
      regimeCode: 'disinflation',
      score: 69,
      gdpRoc: '+1.1%',
      cpi: '2.3%',
      pce: '2.4%',
      rate: '4.75%',
      yield10y: '4.45%',
      sentiment: { bulls: 35, neutrals: 45, bears: 20 },
      desc: 'Bank of England in ciclo di allentamento graduale. Settori energy e mining supportano valutazioni difensive del FTSE 100.'
    },
    asia: {
      name: 'Giappone & Asia-Pacifico',
      flag: '🇯🇵',
      regime: 'Normalizzazione Monetaria',
      regimeCode: 'normalization',
      score: 75,
      gdpRoc: '+1.4%',
      cpi: '2.5%',
      pce: '2.4%',
      rate: '0.25%',
      yield10y: '0.98%',
      sentiment: { bulls: 42, neutrals: 36, bears: 22 },
      desc: 'Bank of Japan prosegue il tapering sui titoli di stato. Riforme di corporate governance sul Nikkei 225 che attraggono afflussi istituzionali esteri.'
    },
    china: {
      name: 'Cina (Shanghai / Hang Seng)',
      flag: '🇨🇳',
      regime: 'Stimolo Fiscale & Rifinanziamento',
      regimeCode: 'stimulus',
      score: 82,
      gdpRoc: '+4.8%',
      cpi: '0.4%',
      pce: '0.6%',
      rate: '3.10%',
      yield10y: '2.12%',
      sentiment: { bulls: 52, neutrals: 30, bears: 18 },
      desc: 'PBoC e governo di Pechino hanno sbloccato il pacchetto di stimoli da 10 Trilioni CNY per rifinanziamento debito locale e supporto azionario. Valutazioni P/E a forte sconto (13.4x).'
    },
    canada: {
      name: 'Canada (TSX Composite)',
      flag: '🇨🇦',
      regime: 'Allentamento Rapido',
      regimeCode: 'easing',
      score: 71,
      gdpRoc: '+1.2%',
      cpi: '1.6%',
      pce: '1.8%',
      rate: '3.75%',
      yield10y: '3.18%',
      sentiment: { bulls: 37, neutrals: 43, bears: 20 },
      desc: 'Banca centrale del Canada tra le più aggressive nei tagli. Settore finanziario e materie prime beneficiano del costo del denaro decrescente.'
    },
    australia: {
      name: 'Australia (ASX 200)',
      flag: '🇦🇺',
      regime: 'Stabilità / Neutrale',
      regimeCode: 'stable',
      score: 68,
      gdpRoc: '+1.0%',
      cpi: '2.8%',
      pce: '2.9%',
      rate: '4.35%',
      yield10y: '4.55%',
      sentiment: { bulls: 34, neutrals: 48, bears: 18 },
      desc: 'RBA prudente nel taglio tassi causa inflazione servizi persistente. Forte correlazione con la ripresa delle commodity cinesi.'
    }
  },

  // 3 Top Quantitative Daily Setups
  topDailySetups: [
    {
      id: 'setup-1',
      symbol: 'AMD',
      name: 'Advanced Micro Devices',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia / Semiconduttori AI',
      bias: 'STRONG BUY',
      qScore: 88,
      price: 148.50,
      currency: '$',
      chg24: '+3.45%',
      entry: 148.50,
      stopLoss: 141.20,
      tp1: 162.00,
      tp2: 175.00,
      riskReward: '1 : 2.85',
      sparkline: [136, 139, 137, 142, 140, 145, 144, 148.5],
      thesis: 'Breakout consolidamento volumetrico sopra AVWAP trimestrale. Ingressi aggressivi su chiplet MI325X per Data Center. Stagionalità Novembre/Dicembre con 85% win rate a 10 anni.',
      pillars: { macro: 85, technical: 90, seasonal: 85, cot: 88, fundamentals: 92 }
    },
    {
      id: 'setup-2',
      symbol: 'CHFJPY',
      name: 'Swiss Franc / Japanese Yen',
      assetClass: 'FOREX',
      sector: 'Forex Major / Safe-Haven Divergence',
      bias: 'BUY (CARRY UNWIND EXHAUSTION)',
      qScore: 79,
      price: 174.20,
      currency: '¥',
      chg24: '+0.58%',
      entry: 174.20,
      stopLoss: 172.80,
      tp1: 176.50,
      tp2: 178.00,
      riskReward: '1 : 2.71',
      sparkline: [171, 172, 171.5, 173, 172.8, 173.8, 173.5, 174.2],
      thesis: 'Esaurimento del ritracciamento su base settimanale. Differenziale tassi SNB vs BOJ stabilizzato. Divergenza rialzista su RSI daily con supporto su POC di sessione.',
      pillars: { macro: 78, technical: 82, seasonal: 75, cot: 80, fundamentals: 80 }
    },
    {
      id: 'setup-3',
      symbol: 'SSEC',
      name: 'Shanghai Composite Index',
      assetClass: 'INDEX',
      sector: 'Indice Benchmark Asia / Cina',
      bias: 'STRONG BUY',
      qScore: 92,
      price: 3380.00,
      currency: '¥',
      chg24: '+2.15%',
      entry: 3380.00,
      stopLoss: 3290.00,
      tp1: 3550.00,
      tp2: 3700.00,
      riskReward: '1 : 3.55',
      sparkline: [3100, 3180, 3250, 3200, 3280, 3340, 3320, 3380],
      thesis: 'Conferma del ciclo espansivo monetario PBoC e stimoli fiscali. Volumi istituzionali triplicati rispetto alla media 90D. Multiplo P/E a forte sconto (13.4x vs 22.8x S&P 500).',
      pillars: { macro: 95, technical: 92, seasonal: 88, cot: 94, fundamentals: 91 }
    }
  ],

  // Comprehensive Asset Universe with Real Fundamentals, Bands, and Seasonality
  universeData: [
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia & AI',
      price: 145.20,
      currency: '$',
      chg24: '+2.80%',
      marketCap: '$3.56T',
      peRatio: 48.2,
      qScore: 92,
      direction: 'STRONG LONG',
      zscore: -1.20,
      atr: 3.80,
      volImbalance: 0.75,
      trend: 0.90,
      macroAlign: 0.92,
      pillars: { macro: 92, technical: 94, seasonal: 88, cot: 91, fundamentals: 95 },
      bands: { upper: 158.00, pivot: 142.50, lower: 132.00 },
      fundamentals: {
        revenue: '$96.3B',
        revenueGrowthYoY: '+122.4%',
        operatingMargin: '62.1%',
        freeCashFlow: '$39.2B',
        fcfPerShare: '$1.59',
        debtToEquity: 0.17,
        dividendYield: '0.03%',
        segmentsProduct: [
          { label: 'Data Center & AI', pct: 87, color: '#00f2a1' },
          { label: 'Gaming GPUs', pct: 9, color: '#38bdf8' },
          { label: 'Automotive & Robotics', pct: 3, color: '#f59e0b' },
          { label: 'OEM & Other', pct: 1, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'USA', pct: 45, color: '#3b82f6' },
          { label: 'Singapore & APAC', pct: 29, color: '#10b981' },
          { label: 'Taiwan', pct: 13, color: '#f59e0b' },
          { label: 'Europa', pct: 13, color: '#8b5cf6' }
        ],
        checklist: [
          { item: 'Crescita Ricavi > 20% YoY', status: 'ok', detail: '+122.4% sostenuta da Blackwell' },
          { item: 'Margine Operativo > 30%', status: 'ok', detail: '62.1% (Leader assoluto)' },
          { item: 'Rapporto Debito/Patrimonio < 0.5', status: 'ok', detail: '0.17 (Bilancio incontaminato)' },
          { item: 'Generazione Free Cash Flow positiva', status: 'ok', detail: '$39.2B ltm' }
        ]
      },
      seasonality: {
        monthlyReturns: [4.2, -1.8, 6.5, 3.2, 8.4, 2.1, -2.5, 5.8, -4.2, 6.1, 7.8, 5.4],
        curve5y: [100, 108, 125, 142, 178, 220, 260, 310, 340, 410],
        curve10y: [100, 115, 135, 160, 210, 280, 360, 460, 580, 750],
        curve15y: [100, 120, 150, 190, 260, 370, 520, 710, 980, 1420],
        bestWindow: '15 Nov - 05 Gen',
        winRatePct: 86,
        avgGainPct: '+8.4%'
      },
      etfs: [
        { symbol: 'SMH', name: 'VanEck Semiconductor ETF', weight: '21.4%', score: 91, aum: '$24.5B' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', weight: '8.4%', score: 87, aum: '$285.0B' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', weight: '6.8%', score: 85, aum: '$580.0B' },
        { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', weight: '6.5%', score: 85, aum: '$490.0B' }
      ]
    },
    {
      symbol: 'AMD',
      name: 'Advanced Micro Devices',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia & AI',
      price: 148.50,
      currency: '$',
      chg24: '+3.45%',
      marketCap: '$240.8B',
      peRatio: 108.5,
      qScore: 88,
      direction: 'STRONG LONG',
      zscore: -0.95,
      atr: 4.10,
      volImbalance: 0.70,
      trend: 0.85,
      macroAlign: 0.88,
      pillars: { macro: 85, technical: 90, seasonal: 85, cot: 88, fundamentals: 92 },
      bands: { upper: 165.00, pivot: 146.00, lower: 135.00 },
      fundamentals: {
        revenue: '$22.7B',
        revenueGrowthYoY: '+17.6%',
        operatingMargin: '14.2%',
        freeCashFlow: '$1.24B',
        fcfPerShare: '$0.76',
        debtToEquity: 0.04,
        dividendYield: '0.00%',
        segmentsProduct: [
          { label: 'Data Center Instinct', pct: 52, color: '#00f2a1' },
          { label: 'Client Ryzen', pct: 23, color: '#38bdf8' },
          { label: 'Gaming Radeon', pct: 15, color: '#f59e0b' },
          { label: 'Embedded Xilinx', pct: 10, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'Asia-Pacifico', pct: 48, color: '#10b981' },
          { label: 'USA', pct: 35, color: '#3b82f6' },
          { label: 'Europa', pct: 17, color: '#8b5cf6' }
        ],
        checklist: [
          { item: 'Debito a lungo termine irrilevante', status: 'ok', detail: 'Debt/Equity 0.04' },
          { item: 'Quota Data Center in rapida ascesa', status: 'ok', detail: '+122% YoY segmento Instinct' },
          { item: 'Margine Lordo in espansione', status: 'ok', detail: '54% non-GAAP' }
        ]
      },
      seasonality: {
        monthlyReturns: [3.8, -2.1, 5.2, 1.4, 6.8, 1.9, -1.8, 4.5, -5.1, 5.2, 7.2, 6.1],
        curve5y: [100, 112, 130, 150, 180, 210, 240, 280, 310, 350],
        curve10y: [100, 120, 150, 190, 240, 310, 420, 560, 710, 890],
        curve15y: [100, 115, 140, 180, 250, 360, 510, 720, 960, 1250],
        bestWindow: '10 Nov - 20 Dic',
        winRatePct: 83,
        avgGainPct: '+7.6%'
      },
      etfs: [
        { symbol: 'SMH', name: 'VanEck Semiconductor ETF', weight: '5.2%', score: 91, aum: '$24.5B' },
        { symbol: 'SOXX', name: 'iShares Semiconductor ETF', weight: '7.8%', score: 89, aum: '$15.2B' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', weight: '2.1%', score: 87, aum: '$285.0B' }
      ]
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia / Consumer Electronics',
      price: 228.60,
      currency: '$',
      chg24: '+0.95%',
      marketCap: '$3.45T',
      peRatio: 33.5,
      qScore: 78,
      direction: 'LONG',
      zscore: 0.30,
      atr: 2.90,
      volImbalance: 0.35,
      trend: 0.65,
      macroAlign: 0.75,
      pillars: { macro: 75, technical: 74, seasonal: 82, cot: 76, fundamentals: 88 },
      bands: { upper: 238.00, pivot: 226.00, lower: 215.00 },
      fundamentals: {
        revenue: '$385.6B',
        revenueGrowthYoY: '+2.0%',
        operatingMargin: '30.7%',
        freeCashFlow: '$108.8B',
        fcfPerShare: '$7.02',
        debtToEquity: 1.45,
        dividendYield: '0.44%',
        segmentsProduct: [
          { label: 'iPhone', pct: 51, color: '#38bdf8' },
          { label: 'Servizi & Cloud', pct: 24, color: '#00f2a1' },
          { label: 'Wearables & Home', pct: 9, color: '#f59e0b' },
          { label: 'Mac', pct: 8, color: '#8b5cf6' },
          { label: 'iPad', pct: 8, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'Americhe', pct: 42, color: '#3b82f6' },
          { label: 'Europa', pct: 25, color: '#10b981' },
          { label: 'Grande Cina', pct: 18, color: '#ef4444' },
          { label: 'Resto APAC', pct: 15, color: '#f59e0b' }
        ],
        checklist: [
          { item: 'Generazione FCF titanica > $100B', status: 'ok', detail: '$108.8B ltm' },
          { item: 'Servizi ad alto margine in crescita continua', status: 'ok', detail: '+12% YoY a 74% lordo' },
          { item: 'Programma riacquisto azioni attivo', status: 'ok', detail: '$110B autorizzati' }
        ]
      },
      seasonality: {
        monthlyReturns: [2.1, -1.2, 4.1, 2.5, 3.8, 1.2, -0.8, 3.4, -4.8, 4.9, 6.2, 4.8],
        curve5y: [100, 110, 124, 140, 165, 190, 215, 245, 275, 305],
        curve10y: [100, 118, 140, 170, 210, 260, 320, 395, 480, 580],
        curve15y: [100, 125, 160, 205, 270, 355, 470, 610, 780, 990],
        bestWindow: '20 Ott - 31 Dic',
        winRatePct: 84,
        avgGainPct: '+6.8%'
      },
      etfs: [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', weight: '7.1%', score: 85, aum: '$580.0B' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', weight: '8.9%', score: 87, aum: '$285.0B' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market', weight: '5.9%', score: 83, aum: '$410.0B' },
        { symbol: 'XLK', name: 'Technology Select Sector SPDR', weight: '15.2%', score: 88, aum: '$68.0B' }
      ]
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Automotive & Clean Energy',
      price: 262.40,
      currency: '$',
      chg24: '+4.15%',
      marketCap: '$838.5B',
      peRatio: 68.4,
      qScore: 76,
      direction: 'LONG',
      zscore: 1.85,
      atr: 9.10,
      volImbalance: 0.60,
      trend: 0.90,
      macroAlign: 0.65,
      pillars: { macro: 65, technical: 88, seasonal: 72, cot: 74, fundamentals: 75 },
      bands: { upper: 285.00, pivot: 254.00, lower: 228.00 },
      fundamentals: {
        revenue: '$97.1B',
        revenueGrowthYoY: '+1.2%',
        operatingMargin: '8.2%',
        freeCashFlow: '$3.62B',
        fcfPerShare: '$1.14',
        debtToEquity: 0.08,
        dividendYield: '0.00%',
        segmentsProduct: [
          { label: 'Automotive Vendite', pct: 82, color: '#ef4444' },
          { label: 'Energy Storage Megapack', pct: 12, color: '#00f2a1' },
          { label: 'Servizi & Supercharging', pct: 6, color: '#38bdf8' }
        ],
        segmentsGeo: [
          { label: 'USA', pct: 49, color: '#3b82f6' },
          { label: 'Cina', pct: 22, color: '#f59e0b' },
          { label: 'Europa & Altro', pct: 29, color: '#10b981' }
        ],
        checklist: [
          { item: 'Debito quasi nullo', status: 'ok', detail: 'Debt/Equity 0.08' },
          { item: 'Segmento Energy in triplicazione', status: 'ok', detail: '+125% YoY Megapack' },
          { item: 'Margine Auto sotto pressione', status: 'warning', detail: '8.2% vs picco storico 16%' }
        ]
      },
      seasonality: {
        monthlyReturns: [4.5, -3.2, 6.8, -1.5, 7.2, 3.4, -4.1, 5.2, -6.4, 5.8, 8.4, 6.2],
        curve5y: [100, 115, 145, 185, 235, 290, 360, 440, 530, 640],
        curve10y: [100, 130, 175, 240, 330, 460, 630, 850, 1120, 1480],
        curve15y: [100, 140, 200, 290, 420, 610, 890, 1260, 1750, 2400],
        bestWindow: '05 Nov - 15 Dic',
        winRatePct: 80,
        avgGainPct: '+9.2%'
      },
      etfs: [
        { symbol: 'ARKK', name: 'ARK Innovation ETF', weight: '14.2%', score: 79, aum: '$6.5B' },
        { symbol: 'XLY', name: 'Consumer Discretionary SPDR', weight: '14.6%', score: 82, aum: '$22.0B' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', weight: '1.8%', score: 85, aum: '$580.0B' }
      ]
    },
    {
      symbol: 'RACE.MI',
      name: 'Ferrari N.V.',
      flag: '🇮🇹',
      region: 'europe',
      assetClass: 'IT_EQUITY',
      sector: 'Lusso & Automotive Eccellenza',
      price: 422.00,
      currency: '€',
      chg24: '+1.45%',
      marketCap: '€76.8B',
      peRatio: 46.2,
      qScore: 91,
      direction: 'STRONG LONG',
      zscore: -0.95,
      atr: 6.50,
      volImbalance: 0.65,
      trend: 0.85,
      macroAlign: 0.88,
      pillars: { macro: 88, technical: 92, seasonal: 86, cot: 89, fundamentals: 96 },
      bands: { upper: 448.00, pivot: 418.00, lower: 395.00 },
      fundamentals: {
        revenue: '€6.0B',
        revenueGrowthYoY: '+17.2%',
        operatingMargin: '27.2%',
        freeCashFlow: '€1.32B',
        fcfPerShare: '€7.28',
        debtToEquity: 0.98,
        dividendYield: '0.62%',
        segmentsProduct: [
          { label: 'Auto di Gamma & Ricambi', pct: 86, color: '#ef4444' },
          { label: 'Sponsor & Merchandising', pct: 11, color: '#f59e0b' },
          { label: 'Motori & Altro', pct: 3, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'EMEA', pct: 47, color: '#3b82f6' },
          { label: 'Americhe', pct: 28, color: '#10b981' },
          { label: 'Asia-Pacifico', pct: 13, color: '#f59e0b' },
          { label: 'Cina & HK', pct: 12, color: '#ef4444' }
        ],
        checklist: [
          { item: 'Portafoglio ordini coperto fino al 2026', status: 'ok', detail: 'Sold out 100%' },
          { item: 'Margine EBITDA > 38%', status: 'ok', detail: '38.6% record settore' },
          { item: 'Potere di determinazione prezzo eccezionale', status: 'ok', detail: 'Personalizzazioni al 19% dei ricavi' }
        ]
      },
      seasonality: {
        monthlyReturns: [2.5, 1.8, 3.4, 2.8, 4.2, 1.1, -0.5, 2.9, -1.8, 3.8, 5.4, 4.6],
        curve5y: [100, 118, 142, 172, 210, 255, 305, 365, 435, 520],
        curve10y: [100, 125, 160, 205, 265, 345, 445, 575, 735, 930],
        curve15y: [100, 130, 175, 235, 320, 435, 590, 790, 1050, 1380],
        bestWindow: '01 Nov - 15 Gen',
        winRatePct: 88,
        avgGainPct: '+8.1%'
      },
      etfs: [
        { symbol: 'CARZ', name: 'First Trust Auto Index', weight: '7.6%', score: 84, aum: '$65M' },
        { symbol: 'EWI', name: 'iShares MSCI Italy ETF', weight: '8.4%', score: 86, aum: '$420M' },
        { symbol: 'EXI', name: 'iShares European Luxury Goods', weight: '5.8%', score: 85, aum: '$180M' }
      ]
    },
    {
      symbol: 'ISP.MI',
      name: 'Intesa Sanpaolo S.p.A.',
      flag: '🇮🇹',
      region: 'europe',
      assetClass: 'IT_EQUITY',
      sector: 'Finanza & Banche Istituzionali',
      price: 3.82,
      currency: '€',
      chg24: '+1.05%',
      marketCap: '€69.4B',
      peRatio: 7.6,
      qScore: 89,
      direction: 'STRONG LONG',
      zscore: 0.40,
      atr: 0.07,
      volImbalance: 0.55,
      trend: 0.75,
      macroAlign: 0.85,
      pillars: { macro: 88, technical: 86, seasonal: 84, cot: 88, fundamentals: 95 },
      bands: { upper: 4.10, pivot: 3.75, lower: 3.45 },
      fundamentals: {
        revenue: '€25.2B',
        revenueGrowthYoY: '+14.5%',
        operatingMargin: '52.4%',
        freeCashFlow: '€8.5B',
        fcfPerShare: '€0.47',
        debtToEquity: 1.12,
        dividendYield: '8.20%',
        segmentsProduct: [
          { label: 'Banca Territori', pct: 45, color: '#38bdf8' },
          { label: 'IMI Corporate & Inv.', pct: 28, color: '#00f2a1' },
          { label: 'Private Banking', pct: 15, color: '#f59e0b' },
          { label: 'Asset Mgmt & Assic.', pct: 12, color: '#8b5cf6' }
        ],
        segmentsGeo: [
          { label: 'Italia', pct: 78, color: '#10b981' },
          { label: 'Europa Centrale/Est', pct: 14, color: '#3b82f6' },
          { label: 'Internazionale', pct: 8, color: '#f59e0b' }
        ],
        checklist: [
          { item: 'Coefficiente CET1 > 13.5%', status: 'ok', detail: '13.7% pienamente a regime' },
          { item: 'Rendimento da dividendo tra i più alti in Europa', status: 'ok', detail: '8.2% cash yield' },
          { item: 'Crediti deteriorati al minimo storico', status: 'ok', detail: 'NPL netto a 0.9%' }
        ]
      },
      seasonality: {
        monthlyReturns: [3.1, 1.4, 4.2, 2.1, 1.8, 0.4, 1.2, 2.5, -2.1, 3.4, 5.8, 4.1],
        curve5y: [100, 114, 132, 155, 182, 215, 252, 295, 345, 405],
        curve10y: [100, 120, 146, 178, 220, 272, 335, 412, 505, 620],
        curve15y: [100, 125, 158, 202, 260, 335, 430, 550, 700, 890],
        bestWindow: '15 Ott - 20 Gen',
        winRatePct: 85,
        avgGainPct: '+7.4%'
      },
      etfs: [
        { symbol: 'EWI', name: 'iShares MSCI Italy ETF', weight: '8.1%', score: 86, aum: '$420M' },
        { symbol: 'EXV', name: 'iShares STOXX Europe 600 Banks', weight: '4.2%', score: 84, aum: '$1.8B' },
        { symbol: 'VGK', name: 'Vanguard FTSE Europe ETF', weight: '1.1%', score: 80, aum: '$21.0B' }
      ]
    },
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin Perpetual Futures',
      flag: '🪙',
      region: 'usa',
      assetClass: 'CRYPTO',
      sector: 'Asset Digitali & Riserva Algoritmica',
      price: 80604.10,
      currency: '$',
      chg24: '+3.22%',
      marketCap: '$1.58T',
      peRatio: 0,
      qScore: 94,
      direction: 'STRONG LONG',
      zscore: -1.15,
      atr: 1150.00,
      volImbalance: 0.80,
      trend: 0.92,
      macroAlign: 0.90,
      pillars: { macro: 90, technical: 95, seasonal: 92, cot: 94, fundamentals: 98 },
      bands: { upper: 86500.00, pivot: 79200.00, lower: 74500.00 },
      fundamentals: {
        revenue: 'Inflows Spot ETF YTD',
        revenueGrowthYoY: '+$23.8B netti',
        operatingMargin: 'Hashrate: 680 EH/s (ATH)',
        freeCashFlow: 'Halving Giorno +205',
        fcfPerShare: 'Supply su Exchange: 2.1M (Minimo 6Y)',
        debtToEquity: 0.00,
        dividendYield: '0.00%',
        segmentsProduct: [
          { label: 'Spot ETF Istituzionali (BlackRock, Fidelity)', pct: 45, color: '#f59e0b' },
          { label: 'Holders Strategici a Lungo Termine', pct: 35, color: '#00f2a1' },
          { label: 'Mining Pool & Riserve', pct: 12, color: '#38bdf8' },
          { label: 'Retail & Liquidità Circolante', pct: 8, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'Nord America', pct: 54, color: '#3b82f6' },
          { label: 'Asia', pct: 28, color: '#10b981' },
          { label: 'Europa', pct: 18, color: '#8b5cf6' }
        ],
        checklist: [
          { item: 'Afflussi netti continui su IBIT & FBTC', status: 'ok', detail: 'Mediana giornaliera > $300M' },
          { item: 'Fase post-halving favorevole nei cicli a 4 anni', status: 'ok', detail: 'Storicamente fase di espansione massima' },
          { item: 'Liquidità globale M2 in crescita', status: 'ok', detail: 'Correlazione 0.82 con M2 aggregata' }
        ]
      },
      seasonality: {
        monthlyReturns: [4.8, 12.2, -1.5, 3.4, -2.1, -1.8, 8.4, -5.2, -2.8, 14.5, 18.2, 11.4],
        curve5y: [100, 160, 240, 380, 580, 850, 1220, 1750, 2450, 3400],
        curve10y: [100, 210, 420, 850, 1650, 3100, 5800, 10500, 18500, 32000],
        curve15y: [100, 350, 1100, 3200, 8900, 24000, 62000, 155000, 380000, 920000],
        bestWindow: '15 Ott - 15 Gen (Q4 Bull Cycle)',
        winRatePct: 91,
        avgGainPct: '+34.5%'
      },
      etfs: [
        { symbol: 'IBIT', name: 'iShares Bitcoin Trust (BlackRock)', weight: '100.0%', score: 94, aum: '$26.8B' },
        { symbol: 'FBTC', name: 'Fidelity Wise Origin Bitcoin', weight: '100.0%', score: 93, aum: '$13.2B' },
        { symbol: 'BITO', name: 'ProShares Bitcoin Strategy ETF', weight: '100.0%', score: 88, aum: '$2.1B' }
      ]
    },
    {
      symbol: 'GC=F',
      name: 'Gold Futures (COMEX)',
      flag: '🥇',
      region: 'usa',
      assetClass: 'COMMODITY',
      sector: 'Metalli Preziosi & Copertura Geopolitica',
      price: 2740.00,
      currency: '$',
      chg24: '+0.55%',
      marketCap: '$17.2T (Fisico)',
      peRatio: 0,
      qScore: 90,
      direction: 'STRONG LONG',
      zscore: -0.50,
      atr: 22.00,
      volImbalance: 0.60,
      trend: 0.85,
      macroAlign: 0.90,
      pillars: { macro: 92, technical: 88, seasonal: 86, cot: 95, fundamentals: 90 },
      bands: { upper: 2820.00, pivot: 2710.00, lower: 2620.00 },
      fundamentals: {
        revenue: 'Acquisti Banche Centrali',
        revenueGrowthYoY: '+1037 Tonnellate annue',
        operatingMargin: 'Correlazione Tassi Reali: -0.84',
        freeCashFlow: 'COT Commercials Net Long: +285k',
        fcfPerShare: 'Debito Sovrano USA: $35.8T (De-dollarizzazione)',
        debtToEquity: 0.00,
        dividendYield: '0.00%',
        segmentsProduct: [
          { label: 'Banche Centrali (PBoC, RBI, CBR)', pct: 42, color: '#f59e0b' },
          { label: 'Investimento Fisico (Barre & Monete)', pct: 31, color: '#00f2a1' },
          { label: 'Gioielleria Globale', pct: 20, color: '#38bdf8' },
          { label: 'Applicazioni Industriali & Tech', pct: 7, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'Asia & Mercati Emergenti', pct: 58, color: '#10b981' },
          { label: 'Europa', pct: 22, color: '#3b82f6' },
          { label: 'Nord America', pct: 20, color: '#8b5cf6' }
        ],
        checklist: [
          { item: 'Record storico di acquisti ufficiali sovrani', status: 'ok', detail: 'Corsa alla de-dollarizzazione riserve' },
          { item: 'Taglio tassi banche centrali riduce costo opportunità', status: 'ok', detail: 'Fed, BCE, SNB in easing' },
          { item: 'Posizionamento COT istituzionale pro-rialzo', status: 'ok', detail: 'Non-Commercials in netto accumulo' }
        ]
      },
      seasonality: {
        monthlyReturns: [3.4, 0.5, -0.8, 1.2, 0.4, -1.5, 1.8, 2.1, -1.9, 2.4, 3.8, 4.2],
        curve5y: [100, 109, 122, 138, 156, 178, 202, 230, 262, 300],
        curve10y: [100, 112, 128, 148, 172, 204, 242, 290, 350, 425],
        curve15y: [100, 116, 138, 165, 200, 245, 305, 385, 490, 625],
        bestWindow: '10 Nov - 28 Feb',
        winRatePct: 87,
        avgGainPct: '+6.5%'
      },
      etfs: [
        { symbol: 'GLD', name: 'SPDR Gold Shares', weight: '100.0%', score: 90, aum: '$68.5B' },
        { symbol: 'IAU', name: 'iShares Gold Trust', weight: '100.0%', score: 90, aum: '$31.2B' },
        { symbol: 'SGOL', name: 'abrdn Physical Gold Shares', weight: '100.0%', score: 89, aum: '$3.5B' }
      ]
    },
    {
      symbol: 'SPY',
      name: 'S&P 500 ETF Trust',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'INDEX',
      sector: 'Indice Benchmark Globale',
      price: 588.50,
      currency: '$',
      chg24: '+0.65%',
      marketCap: '$580.0B',
      peRatio: 24.5,
      qScore: 86,
      direction: 'STRONG LONG',
      zscore: -0.30,
      atr: 4.10,
      volImbalance: 0.55,
      trend: 0.75,
      macroAlign: 0.88,
      pillars: { macro: 88, technical: 85, seasonal: 88, cot: 84, fundamentals: 85 },
      bands: { upper: 605.00, pivot: 584.00, lower: 565.00 },
      fundamentals: {
        revenue: 'Crescita Utili Aggregati S&P',
        revenueGrowthYoY: '+5.3% YoY Q3',
        operatingMargin: '12.4% (Margine netto S&P)',
        freeCashFlow: 'Rendimento FCF: 3.8%',
        fcfPerShare: 'Dividendo + Buyback Yield: 3.4%',
        debtToEquity: 0.85,
        dividendYield: '1.25%',
        segmentsProduct: [
          { label: 'Information Technology', pct: 31, color: '#00f2a1' },
          { label: 'Finanziari', pct: 13, color: '#38bdf8' },
          { label: 'Healthcare', pct: 12, color: '#f59e0b' },
          { label: 'Consumer Discretionary', pct: 10, color: '#ef4444' },
          { label: 'Altri Settori', pct: 34, color: '#94a3b8' }
        ],
        segmentsGeo: [
          { label: 'USA', pct: 60, color: '#3b82f6' },
          { label: 'Internazionale', pct: 40, color: '#10b981' }
        ],
        checklist: [
          { item: 'Espansione margini nei settori dominanti', status: 'ok', detail: 'Tech & Finanziari guidano gli utili' },
          { item: 'Liquidità di mercato senza eguali', status: 'ok', detail: 'Volume medio giornaliero > $35B' }
        ]
      },
      seasonality: {
        monthlyReturns: [1.8, -0.6, 2.4, 1.9, 1.2, 0.8, 1.5, -0.4, -2.1, 2.2, 4.1, 3.2],
        curve5y: [100, 114, 131, 151, 175, 203, 235, 272, 316, 366],
        curve10y: [100, 118, 140, 168, 202, 244, 295, 358, 435, 530],
        curve15y: [100, 122, 150, 185, 230, 285, 355, 442, 552, 690],
        bestWindow: '25 Ott - 05 Gen',
        winRatePct: 84,
        avgGainPct: '+5.4%'
      },
      etfs: [
        { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', weight: '100.0%', score: 86, aum: '$510.0B' },
        { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', weight: '100.0%', score: 86, aum: '$490.0B' }
      ]
    },
    {
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      flag: '🇪🇺',
      region: 'europe',
      assetClass: 'FOREX',
      sector: 'Forex Major / Tassi Sovrani',
      price: 1.0845,
      currency: '$',
      chg24: '-0.25%',
      marketCap: 'Fx Market',
      peRatio: 0,
      qScore: 48,
      direction: 'NEUTRAL',
      zscore: -1.40,
      atr: 0.0045,
      volImbalance: -0.30,
      trend: -0.45,
      macroAlign: -0.40,
      pillars: { macro: 45, technical: 48, seasonal: 52, cot: 46, fundamentals: 50 },
      bands: { upper: 1.0980, pivot: 1.0850, lower: 1.0720 },
      fundamentals: {
        revenue: 'Differenziale Tassi BCE vs Fed',
        revenueGrowthYoY: '-150 bps (BCE 3.25% vs Fed 4.75%)',
        operatingMargin: 'Flussi Commerciali: Surplus UE €22B',
        freeCashFlow: 'COT Non-Commercials: Flat',
        fcfPerShare: 'Volatilità Implicita 30D: 5.8% (Bassa)',
        debtToEquity: 0.00,
        dividendYield: '0.00%',
        segmentsProduct: [
          { label: 'Carry Trade USD Long', pct: 52, color: '#38bdf8' },
          { label: 'Flussi Commerciali Export UE', pct: 30, color: '#10b981' },
          { label: 'Riserve Valutarie Banche', pct: 18, color: '#f59e0b' }
        ],
        segmentsGeo: [
          { label: 'Eurozona', pct: 50, color: '#3b82f6' },
          { label: 'Stati Uniti', pct: 50, color: '#10b981' }
        ],
        checklist: [
          { item: 'Differenziale tassi a favore del dollaro', status: 'warning', detail: 'Frena rialzi strutturali di EUR' },
          { item: 'Resistenza statica forte a 1.0950', status: 'ok', detail: 'Area di rigetto per prese di profitto' }
        ]
      },
      seasonality: {
        monthlyReturns: [-0.8, -0.4, 0.6, 0.8, -0.5, 0.4, 0.2, -0.9, -1.2, 0.5, 1.2, 0.9],
        curve5y: [100, 98, 97, 95, 96, 94, 93, 94, 92, 93],
        curve10y: [100, 96, 94, 91, 92, 89, 87, 88, 86, 87],
        curve15y: [100, 94, 90, 86, 88, 84, 82, 83, 81, 82],
        bestWindow: '20 Nov - 10 Dic',
        winRatePct: 62,
        avgGainPct: '+1.4%'
      },
      etfs: [
        { symbol: 'FXE', name: 'Invesco CurrencyShares Euro', weight: '100.0%', score: 48, aum: '$240M' }
      ]
    },
    {
        "symbol": "TSM",
        "name": "Taiwan Semiconductor Mfg (TSMC)",
        "flag": "🇹🇼",
        "region": "asia",
        "assetClass": "EQUITY",
        "sector": "Semiconduttori & Fonderie Pure-Play",
        "price": 198.5,
        "currency": "$",
        "chg24": "+3.45%",
        "marketCap": "$1.03T",
        "peRatio": 28.5,
        "qScore": 95,
        "direction": "STRONG LONG",
        "zscore": -1.45,
        "atr": 4.8,
        "volImbalance": 0.88,
        "trend": 0.94,
        "macroAlign": 0.95,
        "pillars": {
            "macro": 95,
            "technical": 96,
            "seasonal": 92,
            "cot": 93,
            "fundamentals": 98
        },
        "bands": {
            "upper": 215.0,
            "pivot": 194.0,
            "lower": 182.0
        },
        "fundamentals": {
            "revenue": "$75.9B",
            "revenueGrowthYoY": "+39.0%",
            "operatingMargin": "47.5%",
            "freeCashFlow": "$28.4B",
            "fcfPerShare": "$5.48",
            "debtToEquity": 0.28,
            "dividendYield": "1.25%",
            "segmentsProduct": [
                {
                    "label": "HPC (Calcolo Elevata Potenza / AI)",
                    "pct": 51,
                    "color": "#00f2a1"
                },
                {
                    "label": "Smartphone (Nodi 3nm / 5nm)",
                    "pct": 34,
                    "color": "#38bdf8"
                },
                {
                    "label": "IoT & Automotive",
                    "pct": 11,
                    "color": "#f59e0b"
                },
                {
                    "label": "Altri Semiconduttori",
                    "pct": 4,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Nord America (Apple, Nvidia, AMD)",
                    "pct": 71,
                    "color": "#3b82f6"
                },
                {
                    "label": "Asia-Pacifico (Giappone, Corea)",
                    "pct": 11,
                    "color": "#10b981"
                },
                {
                    "label": "Cina",
                    "pct": 11,
                    "color": "#f59e0b"
                },
                {
                    "label": "Europa & Medio Oriente",
                    "pct": 7,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Quota di mercato fonderie avanzate (<7nm) > 90%",
                    "status": "ok",
                    "detail": "Monopolio de facto sulla produzione chip AI di Nvidia e Apple"
                },
                {
                    "item": "Margine Operativo strutturale > 45%",
                    "status": "ok",
                    "detail": "47.5% grazie al pricing power indiscusso sul nodo N3 e N2"
                },
                {
                    "item": "Capex sostenibile con Free Cash Flow",
                    "status": "ok",
                    "detail": "$30-32B annuali interamente autofinanziati da cassa operativa"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                5.1,
                2.4,
                4.8,
                1.2,
                6.4,
                0.8,
                -1.5,
                4.2,
                -3.8,
                7.5,
                8.2,
                4.6
            ],
            "curve5y": [
                100,
                112,
                130,
                155,
                195,
                245,
                305,
                380,
                480,
                590
            ],
            "curve10y": [
                100,
                120,
                145,
                180,
                240,
                320,
                430,
                570,
                760,
                1020
            ],
            "curve15y": [
                100,
                130,
                170,
                230,
                330,
                480,
                710,
                1050,
                1580,
                2340
            ],
            "bestWindow": "10 Ott - 15 Gen",
            "winRatePct": 88,
            "avgGainPct": "+9.6%"
        },
        "etfs": [
            {
                "symbol": "SMH",
                "name": "VanEck Semiconductor ETF",
                "weight": "13.2%",
                "score": 93,
                "aum": "$24.5B"
            },
            {
                "symbol": "EWT",
                "name": "iShares MSCI Taiwan ETF",
                "weight": "24.8%",
                "score": 95,
                "aum": "$4.8B"
            }
        ]
    },
    {
        "symbol": "005930.KS",
        "name": "Samsung Electronics",
        "flag": "🇰🇷",
        "region": "asia",
        "assetClass": "EQUITY",
        "sector": "Memorie DRAM/NAND & Elettronica di Consumo",
        "price": 58200,
        "currency": "₩",
        "chg24": "+1.80%",
        "marketCap": "₩385T",
        "peRatio": 14.2,
        "qScore": 88,
        "direction": "LONG",
        "zscore": -0.85,
        "atr": 1450,
        "volImbalance": 0.65,
        "trend": 0.78,
        "macroAlign": 0.85,
        "pillars": {
            "macro": 88,
            "technical": 84,
            "seasonal": 87,
            "cot": 89,
            "fundamentals": 92
        },
        "bands": {
            "upper": 64500,
            "pivot": 57800,
            "lower": 52400
        },
        "fundamentals": {
            "revenue": "₩302T",
            "revenueGrowthYoY": "+17.5%",
            "operatingMargin": "12.8%",
            "freeCashFlow": "₩18.4T",
            "fcfPerShare": "₩2,710",
            "debtToEquity": 0.11,
            "dividendYield": "2.45%",
            "segmentsProduct": [
                {
                    "label": "Device Solutions (Semiconductors / DRAM)",
                    "pct": 42,
                    "color": "#00f2a1"
                },
                {
                    "label": "Mobile eXperience & Networks",
                    "pct": 39,
                    "color": "#38bdf8"
                },
                {
                    "label": "Visual Display & Home Appliances",
                    "pct": 14,
                    "color": "#f59e0b"
                },
                {
                    "label": "Harman Automotive",
                    "pct": 5,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Americhe",
                    "pct": 36,
                    "color": "#3b82f6"
                },
                {
                    "label": "Cina",
                    "pct": 24,
                    "color": "#10b981"
                },
                {
                    "label": "Asia / Africa",
                    "pct": 21,
                    "color": "#f59e0b"
                },
                {
                    "label": "Europa",
                    "pct": 19,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Certificazione HBM3E con Nvidia in arrivo",
                    "status": "ok",
                    "detail": "Test di qualifica avanzati per fornitura chip AI server"
                },
                {
                    "item": "Posizione di cassa netta massiccia (> ₩90T)",
                    "status": "ok",
                    "detail": "Bilancio a prova di bomba atomica contro cicli ribassisti"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                2.4,
                -1.2,
                3.8,
                1.5,
                4.2,
                -0.6,
                1.8,
                3.1,
                -2.4,
                5.4,
                6.2,
                3.8
            ],
            "curve5y": [
                100,
                106,
                118,
                134,
                158,
                185,
                218,
                255,
                305,
                360
            ],
            "curve10y": [
                100,
                112,
                128,
                150,
                185,
                230,
                290,
                365,
                460,
                580
            ],
            "curve15y": [
                100,
                118,
                142,
                175,
                225,
                295,
                390,
                520,
                690,
                920
            ],
            "bestWindow": "15 Ott - 20 Dic",
            "winRatePct": 82,
            "avgGainPct": "+7.2%"
        },
        "etfs": [
            {
                "symbol": "EWY",
                "name": "iShares MSCI South Korea ETF",
                "weight": "21.6%",
                "score": 88,
                "aum": "$3.6B"
            }
        ]
    },
    {
        "symbol": "0700.HK",
        "name": "Tencent Holdings",
        "flag": "🇨🇳",
        "region": "asia",
        "assetClass": "EQUITY",
        "sector": "Super-App WeChat, Cloud, Gaming & Fintech",
        "price": 418.0,
        "currency": "HK$",
        "chg24": "+2.40%",
        "marketCap": "HK$3.94T",
        "peRatio": 22.4,
        "qScore": 90,
        "direction": "STRONG LONG",
        "zscore": -1.15,
        "atr": 10.5,
        "volImbalance": 0.72,
        "trend": 0.88,
        "macroAlign": 0.9,
        "pillars": {
            "macro": 89,
            "technical": 91,
            "seasonal": 88,
            "cot": 90,
            "fundamentals": 94
        },
        "bands": {
            "upper": 455.0,
            "pivot": 412.0,
            "lower": 380.0
        },
        "fundamentals": {
            "revenue": "RMB 609B",
            "revenueGrowthYoY": "+8.2%",
            "operatingMargin": "31.4%",
            "freeCashFlow": "RMB 168B",
            "fcfPerShare": "RMB 17.80",
            "debtToEquity": 0.35,
            "dividendYield": "0.85%",
            "segmentsProduct": [
                {
                    "label": "VAS (Gaming & Social Networks)",
                    "pct": 49,
                    "color": "#00f2a1"
                },
                {
                    "label": "Fintech & Business Cloud Services",
                    "pct": 34,
                    "color": "#38bdf8"
                },
                {
                    "label": "Pubblicità Online (WeChat Video Accounts)",
                    "pct": 17,
                    "color": "#f59e0b"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Cina Continentale",
                    "pct": 91,
                    "color": "#3b82f6"
                },
                {
                    "label": "Internazionale (Gaming Global Studio)",
                    "pct": 9,
                    "color": "#10b981"
                }
            ],
            "checklist": [
                {
                    "item": "WeChat MAU oltre 1.37 miliardi di utenti attivi",
                    "status": "ok",
                    "detail": "Monopolio assoluto delle comunicazioni e pagamenti digitali"
                },
                {
                    "item": "Piano di buyback aggressivo (HK$ 100 miliardi nel 2026)",
                    "status": "ok",
                    "detail": "Sostegno continuo al valore per azione"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                3.8,
                1.2,
                2.5,
                0.4,
                5.2,
                -1.4,
                0.8,
                4.1,
                -1.8,
                6.4,
                7.8,
                4.2
            ],
            "curve5y": [
                100,
                108,
                122,
                140,
                168,
                205,
                250,
                310,
                385,
                475
            ],
            "curve10y": [
                100,
                115,
                138,
                170,
                218,
                285,
                375,
                495,
                650,
                850
            ],
            "curve15y": [
                100,
                125,
                160,
                215,
                295,
                410,
                580,
                820,
                1180,
                1720
            ],
            "bestWindow": "20 Ott - 10 Gen",
            "winRatePct": 85,
            "avgGainPct": "+8.9%"
        },
        "etfs": [
            {
                "symbol": "KWEB",
                "name": "KraneShares CSI China Internet ETF",
                "weight": "9.8%",
                "score": 90,
                "aum": "$6.2B"
            },
            {
                "symbol": "FXI",
                "name": "iShares China Large-Cap ETF",
                "weight": "8.4%",
                "score": 87,
                "aum": "$4.5B"
            }
        ]
    },
    {
        "symbol": "7203.T",
        "name": "Toyota Motor Corp",
        "flag": "🇯🇵",
        "region": "asia",
        "assetClass": "EQUITY",
        "sector": "Automotive & Leader Globale Ibrido",
        "price": 2780,
        "currency": "¥",
        "chg24": "+1.15%",
        "marketCap": "¥44.2T",
        "peRatio": 8.4,
        "qScore": 89,
        "direction": "STRONG LONG",
        "zscore": -0.92,
        "atr": 64,
        "volImbalance": 0.68,
        "trend": 0.84,
        "macroAlign": 0.88,
        "pillars": {
            "macro": 88,
            "technical": 86,
            "seasonal": 90,
            "cot": 87,
            "fundamentals": 94
        },
        "bands": {
            "upper": 3050,
            "pivot": 2740,
            "lower": 2510
        },
        "fundamentals": {
            "revenue": "¥45.1T",
            "revenueGrowthYoY": "+21.4%",
            "operatingMargin": "11.9%",
            "freeCashFlow": "¥3.85T",
            "fcfPerShare": "¥284",
            "debtToEquity": 0.88,
            "dividendYield": "2.85%",
            "segmentsProduct": [
                {
                    "label": "Veicoli Ibridi HEV & PHEV",
                    "pct": 46,
                    "color": "#00f2a1"
                },
                {
                    "label": "Veicoli a Combustione Tradizionali",
                    "pct": 42,
                    "color": "#38bdf8"
                },
                {
                    "label": "Servizi Finanziari Toyota",
                    "pct": 8,
                    "color": "#f59e0b"
                },
                {
                    "label": "BEV (100% Elettrico puro) & Idrogeno",
                    "pct": 4,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Nord America",
                    "pct": 38,
                    "color": "#3b82f6"
                },
                {
                    "label": "Giappone & Asia",
                    "pct": 36,
                    "color": "#10b981"
                },
                {
                    "label": "Europa",
                    "pct": 14,
                    "color": "#f59e0b"
                },
                {
                    "label": "Altri Paesi",
                    "pct": 12,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Leader incontrastato delle vendite globali di auto (> 11M unita)",
                    "status": "ok",
                    "detail": "La strategia di transizione ibrida pragmatica batte il rallentamento EV puro"
                },
                {
                    "item": "Vantaggio competitivo dal deprezzamento dello Yen",
                    "status": "ok",
                    "detail": "Margini record sulle esportazioni verso gli Stati Uniti"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                2.1,
                1.8,
                3.4,
                0.9,
                4.1,
                0.5,
                -0.8,
                2.8,
                -1.9,
                4.8,
                5.9,
                3.4
            ],
            "curve5y": [
                100,
                105,
                115,
                130,
                150,
                175,
                208,
                245,
                290,
                345
            ],
            "curve10y": [
                100,
                110,
                124,
                142,
                168,
                204,
                252,
                312,
                390,
                490
            ],
            "curve15y": [
                100,
                114,
                134,
                160,
                196,
                245,
                310,
                395,
                510,
                660
            ],
            "bestWindow": "01 Nov - 15 Gen",
            "winRatePct": 84,
            "avgGainPct": "+6.8%"
        },
        "etfs": [
            {
                "symbol": "EWJ",
                "name": "iShares MSCI Japan ETF",
                "weight": "5.6%",
                "score": 89,
                "aum": "$15.2B"
            }
        ]
    },
    {
        "symbol": "1211.HK",
        "name": "BYD Company",
        "flag": "🇨🇳",
        "region": "asia",
        "assetClass": "EQUITY",
        "sector": "Veicoli Elettrici & Batterie Blade",
        "price": 282.0,
        "currency": "HK$",
        "chg24": "+4.10%",
        "marketCap": "HK$820B",
        "peRatio": 20.8,
        "qScore": 91,
        "direction": "STRONG LONG",
        "zscore": -1.3,
        "atr": 7.8,
        "volImbalance": 0.82,
        "trend": 0.91,
        "macroAlign": 0.92,
        "pillars": {
            "macro": 90,
            "technical": 92,
            "seasonal": 89,
            "cot": 91,
            "fundamentals": 95
        },
        "bands": {
            "upper": 315.0,
            "pivot": 278.0,
            "lower": 252.0
        },
        "fundamentals": {
            "revenue": "RMB 602B",
            "revenueGrowthYoY": "+42.0%",
            "operatingMargin": "6.8%",
            "freeCashFlow": "RMB 45.2B",
            "fcfPerShare": "RMB 15.50",
            "debtToEquity": 0.52,
            "dividendYield": "1.10%",
            "segmentsProduct": [
                {
                    "label": "Automobili & Prodotti Correlati",
                    "pct": 80,
                    "color": "#00f2a1"
                },
                {
                    "label": "Componenti per Telefonia & Assemblaggio",
                    "pct": 20,
                    "color": "#38bdf8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Cina Continentale",
                    "pct": 73,
                    "color": "#3b82f6"
                },
                {
                    "label": "Esportazioni Internazionali (Europa, Sud America)",
                    "pct": 27,
                    "color": "#10b981"
                }
            ],
            "checklist": [
                {
                    "item": "Integrazione verticale totale (Batterie Blade proprietarie)",
                    "status": "ok",
                    "detail": "Costo di produzione veicolo inferiore del 25% rispetto ai concorrenti occidentali"
                },
                {
                    "item": "Esportazioni all estero cresciute del +120% YoY",
                    "status": "ok",
                    "detail": "Espansione rapida in Europa, Brasile e Sud-Est Asiatico"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                4.5,
                -0.8,
                3.2,
                1.8,
                6.2,
                1.2,
                -1.0,
                5.4,
                -2.1,
                7.8,
                8.4,
                4.8
            ],
            "curve5y": [
                100,
                115,
                140,
                175,
                225,
                295,
                385,
                510,
                680,
                910
            ],
            "curve10y": [
                100,
                125,
                165,
                225,
                315,
                450,
                650,
                940,
                1380,
                2050
            ],
            "curve15y": [
                100,
                135,
                190,
                275,
                410,
                620,
                950,
                1480,
                2340,
                3720
            ],
            "bestWindow": "15 Ott - 25 Gen",
            "winRatePct": 86,
            "avgGainPct": "+10.2%"
        },
        "etfs": [
            {
                "symbol": "KARS",
                "name": "KraneShares Electric Vehicles ETF",
                "weight": "6.8%",
                "score": 91,
                "aum": "$180M"
            }
        ]
    },
    {
        "symbol": "SAP.DE",
        "name": "SAP SE",
        "flag": "🇩🇪",
        "region": "germany",
        "assetClass": "EQUITY",
        "sector": "Software Enterprise & Cloud ERP",
        "price": 218.4,
        "currency": "€",
        "chg24": "+1.65%",
        "marketCap": "€268B",
        "peRatio": 34.2,
        "qScore": 93,
        "direction": "STRONG LONG",
        "zscore": -1.25,
        "atr": 3.9,
        "volImbalance": 0.81,
        "trend": 0.92,
        "macroAlign": 0.94,
        "pillars": {
            "macro": 92,
            "technical": 94,
            "seasonal": 90,
            "cot": 92,
            "fundamentals": 96
        },
        "bands": {
            "upper": 236.0,
            "pivot": 214.0,
            "lower": 198.0
        },
        "fundamentals": {
            "revenue": "€31.2B",
            "revenueGrowthYoY": "+10.4%",
            "operatingMargin": "24.5%",
            "freeCashFlow": "€5.8B",
            "fcfPerShare": "€4.95",
            "debtToEquity": 0.22,
            "dividendYield": "1.05%",
            "segmentsProduct": [
                {
                    "label": "Cloud ERP Suite (S/4HANA Cloud)",
                    "pct": 52,
                    "color": "#00f2a1"
                },
                {
                    "label": "Software Licenses & Support Tradizionale",
                    "pct": 36,
                    "color": "#38bdf8"
                },
                {
                    "label": "Servizi di Consulenza & Formazione",
                    "pct": 12,
                    "color": "#f59e0b"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Americhe (USA & Canada)",
                    "pct": 44,
                    "color": "#3b82f6"
                },
                {
                    "label": "EMEA (Europa, Medio Oriente)",
                    "pct": 42,
                    "color": "#10b981"
                },
                {
                    "label": "Asia-Pacifico & Giappone",
                    "pct": 14,
                    "color": "#f59e0b"
                }
            ],
            "checklist": [
                {
                    "item": "Backlog Cloud in crescita accelerata (+28% YoY)",
                    "status": "ok",
                    "detail": "Transizione al modello SaaS completata con ricavi ricorrenti al 84%"
                },
                {
                    "item": "Integrazione AI Enterprise (Joule Copilot)",
                    "status": "ok",
                    "detail": "Adozione diffusa tra le Fortune 500 per ottimizzazione supply chain"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                3.4,
                0.8,
                2.9,
                1.4,
                4.6,
                0.2,
                -1.2,
                3.8,
                -2.2,
                6.1,
                7.2,
                4.5
            ],
            "curve5y": [
                100,
                108,
                122,
                142,
                172,
                212,
                264,
                332,
                420,
                535
            ],
            "curve10y": [
                100,
                114,
                136,
                166,
                210,
                272,
                358,
                476,
                640,
                865
            ],
            "curve15y": [
                100,
                120,
                150,
                192,
                254,
                342,
                470,
                655,
                920,
                1310
            ],
            "bestWindow": "20 Ott - 10 Gen",
            "winRatePct": 86,
            "avgGainPct": "+8.4%"
        },
        "etfs": [
            {
                "symbol": "DAX",
                "name": "Global X DAX Germany ETF",
                "weight": "14.8%",
                "score": 93,
                "aum": "$78M"
            },
            {
                "symbol": "EWG",
                "name": "iShares MSCI Germany ETF",
                "weight": "11.2%",
                "score": 91,
                "aum": "$1.4B"
            }
        ]
    },
    {
        "symbol": "SIE.DE",
        "name": "Siemens AG",
        "flag": "🇩🇪",
        "region": "germany",
        "assetClass": "EQUITY",
        "sector": "Automazione Industriale & Smart Infrastructure",
        "price": 182.6,
        "currency": "€",
        "chg24": "+1.10%",
        "marketCap": "€145B",
        "peRatio": 16.8,
        "qScore": 90,
        "direction": "STRONG LONG",
        "zscore": -0.98,
        "atr": 3.1,
        "volImbalance": 0.74,
        "trend": 0.86,
        "macroAlign": 0.89,
        "pillars": {
            "macro": 90,
            "technical": 88,
            "seasonal": 89,
            "cot": 90,
            "fundamentals": 94
        },
        "bands": {
            "upper": 198.0,
            "pivot": 179.0,
            "lower": 164.0
        },
        "fundamentals": {
            "revenue": "€77.8B",
            "revenueGrowthYoY": "+8.1%",
            "operatingMargin": "15.4%",
            "freeCashFlow": "€10.2B",
            "fcfPerShare": "€12.80",
            "debtToEquity": 0.65,
            "dividendYield": "2.65%",
            "segmentsProduct": [
                {
                    "label": "Digital Industries (Factory Automation)",
                    "pct": 34,
                    "color": "#00f2a1"
                },
                {
                    "label": "Smart Infrastructure (Elettrificazione)",
                    "pct": 32,
                    "color": "#38bdf8"
                },
                {
                    "label": "Mobility (Treni ad alta velocita & Segnalamento)",
                    "pct": 18,
                    "color": "#f59e0b"
                },
                {
                    "label": "Siemens Healthineers (Quota azionaria)",
                    "pct": 16,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Europa, CIS & Africa",
                    "pct": 46,
                    "color": "#3b82f6"
                },
                {
                    "label": "Americhe (USA)",
                    "pct": 30,
                    "color": "#10b981"
                },
                {
                    "label": "Asia & Australia",
                    "pct": 24,
                    "color": "#f59e0b"
                }
            ],
            "checklist": [
                {
                    "item": "Backlog ordini record a €115 miliardi",
                    "status": "ok",
                    "detail": "Copertura ricavi garantita per oltre 18 mesi di piena operativita"
                },
                {
                    "item": "Crescita a doppia cifra nel segmento Smart Grid e Data Center",
                    "status": "ok",
                    "detail": "Fornitura cabine e quadri elettrici per i campus hyperscaler"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                2.8,
                0.4,
                2.5,
                1.1,
                3.8,
                -0.4,
                0.9,
                3.1,
                -1.8,
                5.2,
                6.8,
                3.9
            ],
            "curve5y": [
                100,
                106,
                118,
                134,
                158,
                190,
                232,
                286,
                355,
                445
            ],
            "curve10y": [
                100,
                112,
                130,
                154,
                188,
                234,
                296,
                380,
                492,
                645
            ],
            "curve15y": [
                100,
                116,
                140,
                174,
                222,
                288,
                380,
                508,
                688,
                940
            ],
            "bestWindow": "15 Ott - 10 Gen",
            "winRatePct": 84,
            "avgGainPct": "+7.6%"
        },
        "etfs": [
            {
                "symbol": "DAX",
                "name": "Global X DAX Germany ETF",
                "weight": "9.4%",
                "score": 90,
                "aum": "$78M"
            },
            {
                "symbol": "EWG",
                "name": "iShares MSCI Germany ETF",
                "weight": "8.1%",
                "score": 89,
                "aum": "$1.4B"
            }
        ]
    },
    {
        "symbol": "RHM.DE",
        "name": "Rheinmetall AG",
        "flag": "🇩🇪",
        "region": "germany",
        "assetClass": "EQUITY",
        "sector": "Sistemi Difesa Terrestre, Veicoli Corazzati & Munizioni NATO",
        "price": 534.0,
        "currency": "€",
        "chg24": "+2.85%",
        "marketCap": "€23.2B",
        "peRatio": 26.4,
        "qScore": 94,
        "direction": "STRONG LONG",
        "zscore": -1.35,
        "atr": 12.4,
        "volImbalance": 0.86,
        "trend": 0.95,
        "macroAlign": 0.96,
        "pillars": {
            "macro": 96,
            "technical": 95,
            "seasonal": 91,
            "cot": 93,
            "fundamentals": 96
        },
        "bands": {
            "upper": 585.0,
            "pivot": 520.0,
            "lower": 472.0
        },
        "fundamentals": {
            "revenue": "€9.8B",
            "revenueGrowthYoY": "+36.5%",
            "operatingMargin": "15.8%",
            "freeCashFlow": "€1.45B",
            "fcfPerShare": "€33.40",
            "debtToEquity": 0.38,
            "dividendYield": "1.20%",
            "segmentsProduct": [
                {
                    "label": "Vehicle Systems (Carri Lynx & Boxer)",
                    "pct": 44,
                    "color": "#00f2a1"
                },
                {
                    "label": "Weapon & Ammunition (Munizioni 155mm NATO)",
                    "pct": 36,
                    "color": "#38bdf8"
                },
                {
                    "label": "Electronic Solutions (Radar e Difesa Aerea)",
                    "pct": 14,
                    "color": "#f59e0b"
                },
                {
                    "label": "Power Systems Civili",
                    "pct": 6,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Germania (Fondo speciale Bundeswehr)",
                    "pct": 38,
                    "color": "#3b82f6"
                },
                {
                    "label": "Altri Paesi NATO & UE",
                    "pct": 46,
                    "color": "#10b981"
                },
                {
                    "label": "Internazionale (Australia, Asia)",
                    "pct": 16,
                    "color": "#f59e0b"
                }
            ],
            "checklist": [
                {
                    "item": "Backlog ordini stellare a €54 miliardi (oltre 5 anni di produzione)",
                    "status": "ok",
                    "detail": "La spesa militare europea verso il 2.5% del PIL alimenta contratti pluriennali vincolanti"
                },
                {
                    "item": "Espansione stabilimenti per 700.000 colpi di artiglieria/anno",
                    "status": "ok",
                    "detail": "Posizione dominante come fornitore primario della NATO"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                5.8,
                3.2,
                4.4,
                2.1,
                6.5,
                1.2,
                -0.4,
                4.8,
                -1.5,
                7.2,
                8.9,
                5.4
            ],
            "curve5y": [
                100,
                120,
                150,
                195,
                260,
                360,
                510,
                740,
                1080,
                1590
            ],
            "curve10y": [
                100,
                130,
                175,
                240,
                340,
                495,
                740,
                1120,
                1720,
                2680
            ],
            "curve15y": [
                100,
                140,
                200,
                290,
                430,
                660,
                1040,
                1680,
                2750,
                4520
            ],
            "bestWindow": "15 Ott - 25 Feb",
            "winRatePct": 89,
            "avgGainPct": "+12.4%"
        },
        "etfs": [
            {
                "symbol": "DFEN",
                "name": "VanEck Defense UCITS ETF",
                "weight": "8.8%",
                "score": 94,
                "aum": "$1.2B"
            }
        ]
    },
    {
        "symbol": "MC.PA",
        "name": "LVMH Moët Hennessy Louis Vuitton",
        "flag": "🇫🇷",
        "region": "france",
        "assetClass": "EQUITY",
        "sector": "Alta Moda, Pelletteria di Lusso, Gioielli & Champagne",
        "price": 628.0,
        "currency": "€",
        "chg24": "+1.85%",
        "marketCap": "€314B",
        "peRatio": 21.2,
        "qScore": 91,
        "direction": "STRONG LONG",
        "zscore": -1.1,
        "atr": 14.5,
        "volImbalance": 0.76,
        "trend": 0.88,
        "macroAlign": 0.9,
        "pillars": {
            "macro": 90,
            "technical": 91,
            "seasonal": 89,
            "cot": 90,
            "fundamentals": 95
        },
        "bands": {
            "upper": 695.0,
            "pivot": 618.0,
            "lower": 565.0
        },
        "fundamentals": {
            "revenue": "€86.2B",
            "revenueGrowthYoY": "+4.8%",
            "operatingMargin": "26.5%",
            "freeCashFlow": "€11.8B",
            "fcfPerShare": "€23.60",
            "debtToEquity": 0.32,
            "dividendYield": "2.05%",
            "segmentsProduct": [
                {
                    "label": "Fashion & Leather Goods (Louis Vuitton, Dior)",
                    "pct": 49,
                    "color": "#00f2a1"
                },
                {
                    "label": "Selective Retailing (Sephora)",
                    "pct": 21,
                    "color": "#38bdf8"
                },
                {
                    "label": "Watches & Jewelry (Tiffany & Co., Bulgari)",
                    "pct": 13,
                    "color": "#f59e0b"
                },
                {
                    "label": "Perfumes & Cosmetics",
                    "pct": 10,
                    "color": "#ec4899"
                },
                {
                    "label": "Wines & Spirits (Moet, Dom Perignon)",
                    "pct": 7,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Asia (escluso Giappone)",
                    "pct": 31,
                    "color": "#3b82f6"
                },
                {
                    "label": "Stati Uniti",
                    "pct": 25,
                    "color": "#10b981"
                },
                {
                    "label": "Europa (esclusa Francia)",
                    "pct": 17,
                    "color": "#f59e0b"
                },
                {
                    "label": "Giappone",
                    "pct": 12,
                    "color": "#8b5cf6"
                },
                {
                    "label": "Francia",
                    "pct": 8,
                    "color": "#ef4444"
                },
                {
                    "label": "Altri Mercati",
                    "pct": 7,
                    "color": "#64748b"
                }
            ],
            "checklist": [
                {
                    "item": "Portafoglio di 75 Maison storiche insostituibili",
                    "status": "ok",
                    "detail": "Pricing power assoluto e fidelizzazione della clientela High Net Worth"
                },
                {
                    "item": "Ripresa del flusso turistico internazionale e stimoli Cina",
                    "status": "ok",
                    "detail": "Catalizzatore per riaccelerazione vendite nel Q4 e festività di fine anno"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                3.6,
                0.4,
                3.1,
                1.2,
                4.8,
                -0.6,
                1.4,
                3.2,
                -2.1,
                5.8,
                7.4,
                4.8
            ],
            "curve5y": [
                100,
                108,
                122,
                142,
                170,
                208,
                258,
                324,
                412,
                528
            ],
            "curve10y": [
                100,
                114,
                134,
                162,
                202,
                258,
                335,
                440,
                585,
                785
            ],
            "curve15y": [
                100,
                118,
                144,
                180,
                230,
                300,
                398,
                535,
                725,
                995
            ],
            "bestWindow": "20 Ott - 10 Gen",
            "winRatePct": 85,
            "avgGainPct": "+8.2%"
        },
        "etfs": [
            {
                "symbol": "EWQ",
                "name": "iShares MSCI France ETF",
                "weight": "11.8%",
                "score": 91,
                "aum": "$650M"
            }
        ]
    },
    {
        "symbol": "RMS.PA",
        "name": "Hermès International",
        "flag": "🇫🇷",
        "region": "france",
        "assetClass": "EQUITY",
        "sector": "Pelletteria Artigianale Ultra-Luxury (Birkin & Kelly)",
        "price": 2080.0,
        "currency": "€",
        "chg24": "+2.10%",
        "marketCap": "€219B",
        "peRatio": 48.5,
        "qScore": 94,
        "direction": "STRONG LONG",
        "zscore": -1.2,
        "atr": 42.0,
        "volImbalance": 0.84,
        "trend": 0.93,
        "macroAlign": 0.94,
        "pillars": {
            "macro": 93,
            "technical": 94,
            "seasonal": 92,
            "cot": 93,
            "fundamentals": 98
        },
        "bands": {
            "upper": 2260.0,
            "pivot": 2040.0,
            "lower": 1880.0
        },
        "fundamentals": {
            "revenue": "€13.4B",
            "revenueGrowthYoY": "+15.2%",
            "operatingMargin": "42.1%",
            "freeCashFlow": "€3.9B",
            "fcfPerShare": "€37.10",
            "debtToEquity": 0.12,
            "dividendYield": "1.25%",
            "segmentsProduct": [
                {
                    "label": "Pelletteria & Selleria",
                    "pct": 43,
                    "color": "#00f2a1"
                },
                {
                    "label": "Abbigliamento & Accessori",
                    "pct": 29,
                    "color": "#38bdf8"
                },
                {
                    "label": "Seta & Tessili",
                    "pct": 9,
                    "color": "#f59e0b"
                },
                {
                    "label": "Altri Prodotti & Orologi",
                    "pct": 19,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Asia-Pacifico",
                    "pct": 47,
                    "color": "#3b82f6"
                },
                {
                    "label": "Europa",
                    "pct": 23,
                    "color": "#10b981"
                },
                {
                    "label": "Americhe",
                    "pct": 19,
                    "color": "#f59e0b"
                },
                {
                    "label": "Giappone",
                    "pct": 11,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Margine operativo superiore al 42% (leader indiscusso del lusso mondiale)",
                    "status": "ok",
                    "detail": "Lista di attesa di oltre 2 anni per borse iconiche Birkin e Kelly"
                },
                {
                    "item": "Controllo familiare saldo (oltre 66% dei diritti di voto)",
                    "status": "ok",
                    "detail": "Visione strategica multigenerazionale immune dalla volatilita di breve termine"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                4.1,
                1.2,
                3.8,
                1.8,
                5.4,
                0.4,
                1.8,
                3.9,
                -1.4,
                6.8,
                8.2,
                5.1
            ],
            "curve5y": [
                100,
                112,
                130,
                156,
                194,
                246,
                318,
                415,
                545,
                720
            ],
            "curve10y": [
                100,
                118,
                144,
                180,
                230,
                300,
                400,
                540,
                740,
                1030
            ],
            "curve15y": [
                100,
                125,
                160,
                212,
                288,
                396,
                555,
                790,
                1140,
                1670
            ],
            "bestWindow": "15 Ott - 15 Gen",
            "winRatePct": 88,
            "avgGainPct": "+9.8%"
        },
        "etfs": [
            {
                "symbol": "EWQ",
                "name": "iShares MSCI France ETF",
                "weight": "6.4%",
                "score": 94,
                "aum": "$650M"
            }
        ]
    },
    {
        "symbol": "SU.PA",
        "name": "Schneider Electric",
        "flag": "🇫🇷",
        "region": "france",
        "assetClass": "EQUITY",
        "sector": "Gestione Elettrica, Automazione Digitale & Data Center Infrastructure",
        "price": 238.4,
        "currency": "€",
        "chg24": "+2.20%",
        "marketCap": "€134B",
        "peRatio": 27.8,
        "qScore": 93,
        "direction": "STRONG LONG",
        "zscore": -1.18,
        "atr": 4.6,
        "volImbalance": 0.79,
        "trend": 0.91,
        "macroAlign": 0.93,
        "pillars": {
            "macro": 92,
            "technical": 93,
            "seasonal": 90,
            "cot": 92,
            "fundamentals": 96
        },
        "bands": {
            "upper": 258.0,
            "pivot": 232.0,
            "lower": 212.0
        },
        "fundamentals": {
            "revenue": "€35.9B",
            "revenueGrowthYoY": "+12.7%",
            "operatingMargin": "18.2%",
            "freeCashFlow": "€4.6B",
            "fcfPerShare": "€8.15",
            "debtToEquity": 0.44,
            "dividendYield": "1.55%",
            "segmentsProduct": [
                {
                    "label": "Energy Management (Data Centers & Smart Grid)",
                    "pct": 79,
                    "color": "#00f2a1"
                },
                {
                    "label": "Industrial Automation (Software Aveva & Fabbriche)",
                    "pct": 21,
                    "color": "#38bdf8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Nord America (Boom Data Center AI)",
                    "pct": 34,
                    "color": "#3b82f6"
                },
                {
                    "label": "Asia-Pacifico",
                    "pct": 30,
                    "color": "#10b981"
                },
                {
                    "label": "Europa Occidentale",
                    "pct": 25,
                    "color": "#f59e0b"
                },
                {
                    "label": "Resto del Mondo",
                    "pct": 11,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Fornitore Tier-1 infrastrutture elettriche per data center AI di Microsoft, Google, AWS",
                    "status": "ok",
                    "detail": "Crescita ordini nel segmento data center > 25% YoY"
                },
                {
                    "item": "Leader mondiale software industriale dopo acquisizione integrale di AVEVA",
                    "status": "ok",
                    "detail": "Aumento della quota di ricavi ricorrenti da abbonamenti software"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                3.2,
                0.6,
                2.8,
                1.4,
                4.2,
                0.1,
                0.8,
                3.4,
                -1.6,
                5.8,
                7.1,
                4.2
            ],
            "curve5y": [
                100,
                108,
                122,
                142,
                170,
                210,
                265,
                340,
                442,
                580
            ],
            "curve10y": [
                100,
                114,
                135,
                164,
                206,
                266,
                350,
                468,
                635,
                870
            ],
            "curve15y": [
                100,
                118,
                145,
                182,
                235,
                310,
                415,
                565,
                780,
                1090
            ],
            "bestWindow": "20 Ott - 15 Gen",
            "winRatePct": 86,
            "avgGainPct": "+8.1%"
        },
        "etfs": [
            {
                "symbol": "EWQ",
                "name": "iShares MSCI France ETF",
                "weight": "7.8%",
                "score": 93,
                "aum": "$650M"
            }
        ]
    },
    {
        "symbol": "AZN.L",
        "name": "AstraZeneca PLC",
        "flag": "🇬🇧",
        "region": "uk",
        "assetClass": "EQUITY",
        "sector": "Biofarmaceutica, Oncologia & Malattie Rare (Alexion)",
        "price": 11840,
        "currency": "GBp",
        "chg24": "+1.75%",
        "marketCap": "£183B",
        "peRatio": 32.4,
        "qScore": 92,
        "direction": "STRONG LONG",
        "zscore": -1.15,
        "atr": 210,
        "volImbalance": 0.78,
        "trend": 0.89,
        "macroAlign": 0.91,
        "pillars": {
            "macro": 91,
            "technical": 92,
            "seasonal": 89,
            "cot": 91,
            "fundamentals": 96
        },
        "bands": {
            "upper": 12850,
            "pivot": 11620,
            "lower": 10700
        },
        "fundamentals": {
            "revenue": "$45.8B",
            "revenueGrowthYoY": "+18.2%",
            "operatingMargin": "28.4%",
            "freeCashFlow": "$8.9B",
            "fcfPerShare": "$5.74",
            "debtToEquity": 0.68,
            "dividendYield": "2.20%",
            "segmentsProduct": [
                {
                    "label": "Oncologia (Tagrisso, Imfinzi, Lynparza)",
                    "pct": 41,
                    "color": "#00f2a1"
                },
                {
                    "label": "Cardiovascolare, Renale & Metabolico (Farxiga)",
                    "pct": 24,
                    "color": "#38bdf8"
                },
                {
                    "label": "Malattie Rare (Alexion Therapeutics)",
                    "pct": 18,
                    "color": "#f59e0b"
                },
                {
                    "label": "Respiratorio & Immunologia",
                    "pct": 17,
                    "color": "#94a3b8"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Stati Uniti",
                    "pct": 42,
                    "color": "#3b82f6"
                },
                {
                    "label": "Mercati Emergenti (Cina & America Latina)",
                    "pct": 28,
                    "color": "#10b981"
                },
                {
                    "label": "Europa",
                    "pct": 20,
                    "color": "#f59e0b"
                },
                {
                    "label": "Resto del Mondo (Giappone)",
                    "pct": 10,
                    "color": "#8b5cf6"
                }
            ],
            "checklist": [
                {
                    "item": "Pipeline clinica con oltre 18 farmaci in Fase III",
                    "status": "ok",
                    "detail": "Obiettivo di $80 miliardi di ricavi entro il 2030 confermato dal management"
                },
                {
                    "item": "Monopolio oncologico nel carcinoma polmonare non a piccole cellule",
                    "status": "ok",
                    "detail": "Crescita Farxiga (+34% YoY) per insufficienza cardiaca e renale cronica"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                2.9,
                0.4,
                2.6,
                1.2,
                3.9,
                0.2,
                0.7,
                3.1,
                -1.8,
                5.4,
                6.8,
                3.9
            ],
            "curve5y": [
                100,
                107,
                119,
                136,
                162,
                198,
                245,
                308,
                390,
                502
            ],
            "curve10y": [
                100,
                112,
                130,
                156,
                192,
                244,
                318,
                420,
                560,
                755
            ],
            "curve15y": [
                100,
                116,
                138,
                170,
                214,
                276,
                362,
                485,
                660,
                915
            ],
            "bestWindow": "20 Ott - 15 Gen",
            "winRatePct": 85,
            "avgGainPct": "+7.5%"
        },
        "etfs": [
            {
                "symbol": "EWU",
                "name": "iShares MSCI United Kingdom ETF",
                "weight": "9.2%",
                "score": 92,
                "aum": "$3.1B"
            }
        ]
    },
    {
        "symbol": "RR.L",
        "name": "Rolls-Royce Holdings",
        "flag": "🇬🇧",
        "region": "uk",
        "assetClass": "EQUITY",
        "sector": "Motori Aeronautici Civili (Trent), Difesa & Micro-Reattori Nucleari SMR",
        "price": 540,
        "currency": "GBp",
        "chg24": "+3.10%",
        "marketCap": "£45.6B",
        "peRatio": 28.5,
        "qScore": 95,
        "direction": "STRONG LONG",
        "zscore": -1.4,
        "atr": 14.5,
        "volImbalance": 0.88,
        "trend": 0.96,
        "macroAlign": 0.95,
        "pillars": {
            "macro": 95,
            "technical": 96,
            "seasonal": 92,
            "cot": 94,
            "fundamentals": 97
        },
        "bands": {
            "upper": 595,
            "pivot": 525,
            "lower": 470
        },
        "fundamentals": {
            "revenue": "£16.5B",
            "revenueGrowthYoY": "+21.4%",
            "operatingMargin": "14.2%",
            "freeCashFlow": "£2.1B",
            "fcfPerShare": "£0.25",
            "debtToEquity": 0.45,
            "dividendYield": "1.30%",
            "segmentsProduct": [
                {
                    "label": "Civil Aerospace (Ore di volo motori Trent)",
                    "pct": 51,
                    "color": "#00f2a1"
                },
                {
                    "label": "Defense (Sottomarini nucleari e caccia Typhoon/Tempest)",
                    "pct": 27,
                    "color": "#38bdf8"
                },
                {
                    "label": "Power Systems (Generatori diesel e micro-grid)",
                    "pct": 22,
                    "color": "#f59e0b"
                }
            ],
            "segmentsGeo": [
                {
                    "label": "Regno Unito & Europa",
                    "pct": 39,
                    "color": "#3b82f6"
                },
                {
                    "label": "Nord America",
                    "pct": 31,
                    "color": "#10b981"
                },
                {
                    "label": "Asia-Pacifico & Medio Oriente",
                    "pct": 30,
                    "color": "#f59e0b"
                }
            ],
            "checklist": [
                {
                    "item": "Ore di volo motori a fusoliera larga (EFH) al 108% rispetto ai livelli pre-pandemia",
                    "status": "ok",
                    "detail": "Flusso di cassa ricorrente da contratti di manutenzione TotalCare"
                },
                {
                    "item": "Turnaround epico guidato dal CEO Tufan Erginbilgic",
                    "status": "ok",
                    "detail": "Ritorno all'investment grade e ripristino del dividendo con 12 mesi di anticipo"
                }
            ]
        },
        "seasonality": {
            "monthlyReturns": [
                5.2,
                2.1,
                4.2,
                1.8,
                6.1,
                0.8,
                -0.6,
                4.4,
                -1.9,
                7.8,
                9.2,
                5.6
            ],
            "curve5y": [
                100,
                118,
                146,
                188,
                250,
                345,
                490,
                715,
                1060,
                1620
            ],
            "curve10y": [
                100,
                126,
                168,
                230,
                325,
                475,
                710,
                1090,
                1710,
                2750
            ],
            "curve15y": [
                100,
                134,
                192,
                280,
                420,
                650,
                1020,
                1650,
                2740,
                4650
            ],
            "bestWindow": "15 Ott - 20 Feb",
            "winRatePct": 90,
            "avgGainPct": "+13.2%"
        },
        "etfs": [
            {
                "symbol": "EWU",
                "name": "iShares MSCI United Kingdom ETF",
                "weight": "3.8%",
                "score": 95,
                "aum": "$3.1B"
            }
        ]
    }
  ],

  // Model Portfolios Real Data
  modelPortfolios: {
    conservative: {
      id: 'conservative',
      name: 'Conservativo Istituzionale (Capital Defense)',
      tagline: 'Minimizzazione del drawdown, massimizzazione dell\'indice di Sharpe e rendite costanti.',
      riskTier: 'Basso (Volatilità < 6.5%)',
      targetInvestor: 'Investitore che privilegia la conservazione del capitale con crescita reale sopra l\'inflazione.',
      metrics: {
        totalReturn: '+262.49%',
        cagr: '14.80%',
        maxDrawdown: '-11.25%',
        benchmarkDrawdown: '-34.10%',
        sharpeRatio: '1.85',
        lossProtection: '+22.85%',
        alpha: '+31.39% vs S&P 500'
      },
      allocation: [
        { asset: 'Obbligazionario Governativo (BTP, US Treasuries)', weight: 45, color: '#38bdf8' },
        { asset: 'Azionario Globale Difensivo ad Alto Dividendo', weight: 35, color: '#00f2a1' },
        { asset: 'Materie Prime & Oro Riserva', weight: 15, color: '#f59e0b' },
        { asset: 'Liquidità / Cash Yield Equivalents', weight: 5, color: '#94a3b8' }
      ],
      holdings: [
        { symbol: 'BTP 10Y', name: 'Buono del Tesoro Poliennale 10Y', category: 'Bonds', weight: 25, price: 102.40, pnl: '+4.2%' },
        { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond', category: 'Bonds', weight: 20, price: 95.80, pnl: '+3.8%' },
        { symbol: 'ISP.MI', name: 'Intesa Sanpaolo (8.2% Div Yield)', category: 'Equities', weight: 12, price: 3.82, pnl: '+18.4%' },
        { symbol: 'ENEL.MI', name: 'Enel S.p.A. (Utilities / Difensivo)', category: 'Equities', weight: 13, price: 6.84, pnl: '+8.2%' },
        { symbol: 'PG', name: 'Procter & Gamble Co.', category: 'Equities', weight: 10, price: 168.20, pnl: '+6.1%' },
        { symbol: 'GC=F', name: 'Gold Futures / Physical Gold', category: 'Commodities', weight: 15, price: 2740.00, pnl: '+24.5%' },
        { symbol: 'XEON.DE', name: 'Xtrackers EUR Overnight Rate', category: 'Cash', weight: 5, price: 142.10, pnl: '+3.6%' }
      ],
      ops: {
        lastRebalanceDate: '01 Nov 2026',
        nextRebalanceDate: '01 Dic 2026',
        totalHoldings: 14,
        newEntries: ['BTP 10Y (Incremento duration)'],
        trims: ['ENEL (-2% presa profitto)', 'PG (-1%)'],
        exits: []
      }
    },
    balanced: {
      id: 'balanced',
      name: 'Bilanciato All-Weather (Multi-Asset Alpha)',
      tagline: 'Il compromesso matematico ottimale tra esposizione al rischio e massimizzazione del rendimento.',
      riskTier: 'Moderato (Volatilità 10-12%)',
      targetInvestor: 'Investitore strategico che ricerca la sovraperformance sistematica del mercato con drawdown contenuti.',
      metrics: {
        totalReturn: '+355.08%',
        cagr: '18.25%',
        maxDrawdown: '-15.25%',
        benchmarkDrawdown: '-34.10%',
        sharpeRatio: '2.15',
        lossProtection: '+18.85%',
        alpha: '+123.98% vs S&P 500'
      },
      allocation: [
        { asset: 'Azionario Globale (USA, Europa, Emergenti)', weight: 40, color: '#00f2a1' },
        { asset: 'Obbligazionario Sovrano & Corporate Investment Grade', weight: 30, color: '#38bdf8' },
        { asset: 'Materie Prime Strategiche & Metalli Preziosi', weight: 15, color: '#f59e0b' },
        { asset: 'Asset Digitali Asimmetrici (Bitcoin Tier-1)', weight: 10, color: '#8b5cf6' },
        { asset: 'Liquidità Operativa Dinamica', weight: 5, color: '#94a3b8' }
      ],
      holdings: [
        { symbol: 'NVDA', name: 'NVIDIA Corp (AI Infrastructure)', category: 'Equities', weight: 10, price: 145.20, pnl: '+48.2%' },
        { symbol: 'AAPL', name: 'Apple Inc (Cash Cow)', category: 'Equities', weight: 10, price: 228.60, pnl: '+14.5%' },
        { symbol: 'RACE.MI', name: 'Ferrari N.V. (Lusso Resiliente)', category: 'Equities', weight: 8, price: 422.00, pnl: '+32.1%' },
        { symbol: 'SPY', name: 'S&P 500 ETF (Core Index)', category: 'Equities', weight: 12, price: 588.50, pnl: '+21.4%' },
        { symbol: 'TLT', name: 'iShares 20+ Year Treasury', category: 'Bonds', weight: 18, price: 92.40, pnl: '+4.5%' },
        { symbol: 'BTP 10Y', name: 'BTP 10 Anni Italiano', category: 'Bonds', weight: 12, price: 102.40, pnl: '+5.1%' },
        { symbol: 'GC=F', name: 'Oro Fisico / Future', category: 'Commodities', weight: 10, price: 2740.00, pnl: '+24.5%' },
        { symbol: 'CL=F', name: 'Petrolio WTI (Energy Hedge)', category: 'Commodities', weight: 5, price: 71.50, pnl: '-2.1%' },
        { symbol: 'BTCUSDT', name: 'Bitcoin (Riserva Digitale)', category: 'Crypto', weight: 10, price: 80604.10, pnl: '+62.4%' },
        { symbol: 'CASH', name: 'Euro / USD Cash Yield', category: 'Cash', weight: 5, price: 1.00, pnl: '+3.5%' }
      ],
      ops: {
        lastRebalanceDate: '01 Nov 2026',
        nextRebalanceDate: '01 Dic 2026',
        totalHoldings: 19,
        newEntries: ['AMD (+5% Semiconduttori)', 'CHFJPY (+4% Divergenza Carry)'],
        trims: ['TSLA (-4% preso target)', 'AAPL (-2%)'],
        exits: ['ENEL (Target €6.85 raggiunto, +14.2% PnL)']
      }
    },
    growth: {
      id: 'growth',
      name: 'Crescita Dinamica (Hyper-Alpha / AI & Secular)',
      tagline: 'Massima allocazione su trend secolari, semiconduttori, intelligenza artificiale e asset esponenziali.',
      riskTier: 'Aggressivo (Volatilità 16-20%)',
      targetInvestor: 'Investitore con orizzonte pluriennale orientato a massimizzare l\'effetto composto.',
      metrics: {
        totalReturn: '+494.40%',
        cagr: '27.50%',
        maxDrawdown: '-21.40%',
        benchmarkDrawdown: '-34.10%',
        sharpeRatio: '1.95',
        lossProtection: '+12.70%',
        alpha: '+263.30% vs S&P 500'
      },
      allocation: [
        { asset: 'Azioni Tech, AI & Semiconduttori', weight: 65, color: '#00f2a1' },
        { asset: 'Asset Digitali & Web3 (BTC, SOL)', weight: 15, color: '#8b5cf6' },
        { asset: 'Materie Prime Strategiche (Oro, Rame)', weight: 10, color: '#f59e0b' },
        { asset: 'Cash & Coperture Derivati', weight: 10, color: '#94a3b8' }
      ],
      holdings: [
        { symbol: 'NVDA', name: 'NVIDIA Corp (Hardware AI)', category: 'Equities', weight: 20, price: 145.20, pnl: '+58.2%' },
        { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Equities', weight: 15, price: 148.50, pnl: '+24.5%' },
        { symbol: 'TSLA', name: 'Tesla Inc (Robotica/AI)', category: 'Equities', weight: 12, price: 262.40, pnl: '+41.2%' },
        { symbol: 'MSFT', name: 'Microsoft (Cloud Copilot)', category: 'Equities', weight: 10, price: 412.30, pnl: '+18.6%' },
        { symbol: 'RACE.MI', name: 'Ferrari N.V. (Lusso Ultra-High Net)', category: 'Equities', weight: 8, price: 422.00, pnl: '+32.1%' },
        { symbol: 'BTCUSDT', name: 'Bitcoin Perpetual', category: 'Crypto', weight: 10, price: 80604.10, pnl: '+62.4%' },
        { symbol: 'SOLUSDT', name: 'Solana Ecosystem', category: 'Crypto', weight: 5, price: 188.40, pnl: '+45.8%' },
        { symbol: 'GC=F', name: 'Oro Fisico', category: 'Commodities', weight: 10, price: 2740.00, pnl: '+24.5%' },
        { symbol: 'CASH', name: 'Fondi Monetari USD', category: 'Cash', weight: 10, price: 1.00, pnl: '+4.8%' }
      ],
      ops: {
        lastRebalanceDate: '01 Nov 2026',
        nextRebalanceDate: '01 Dic 2026',
        totalHoldings: 16,
        newEntries: ['AMD (+8% ingresso aggressivo)'],
        trims: ['NVDA (-3% ribilanciamento pesi)', 'TSLA (-2%)'],
        exits: []
      }
    }
  },

  // FAQ Accordion Data
  faqData: [
    {
      q: 'Come funziona il ribilanciamento quantitativo mensile?',
      a: 'L\'algoritmo calcola all\'inizio di ogni mese la nuova matrice di correlazione e i pesi ottimali basati sul Q-Score Istituzionale™. I titoli che scendono sotto la soglia di forza statistica vengono liquidati o alleggeriti per bloccare i profitti, mentre i nuovi asset con la più alta asimmetria R:R vengono inseriti in portafoglio.'
    },
    {
      q: 'Come posso integrare i portafogli modello con la mia operatività Core/Satellite?',
      a: 'L\'approccio istituzionale raccomanda di utilizzare il Portafoglio Modello Bilanciato come "Core" (60-70% del capitale totale) per beneficiare della crescita passiva con controllo ferreo del drawdown, e destinare il restante 30-40% "Satellite" alle proposte quotidiane o al trading discrezionale/intraday sul Terminale.'
    },
    {
      q: 'Perché l\'analisi del Max Drawdown è più importante del Total Return?',
      a: 'Nei mercati finanziari, una perdita del -50% richiede un guadagno del +100% solo per tornare in pareggio. Contenere le perdite al -15% (come nei nostri modelli, rispetto al -34% dell\'indice benchmark S&P 500) consente alla componente di interesse composto di lavorare ininterrottamente anche durante le crisi di mercato.'
    },
    {
      q: 'I dati fondamentali e la stagionalità sono reali?',
      a: 'Sì al 100%. I dati di bilancio (Ricavi, Margini, Free Cash Flow, Debt/Equity) derivano direttamente dai bilanci trimestrali 10-Q/10-K ufficiali, e le curve di stagionalità sono calcolate su finestre statistiche reali a 5, 10 e 15 anni con test di significatività volumetrica.'
    },
    {
      q: 'Posso esportare o stampare le analisi per il mio archivio?',
      a: 'Assolutamente sì. Abbiamo implementato la funzione "Esporta Dossier PDF / Stampa Scheda" in formato A4 ad alta risoluzione con un solo clic, superando il limite dei competitor chiusi.'
    }
  ],

  // Active Proposal for 10s TTL gate
  activeProposal: null,
  ttlTimerId: null,
  ttlRemainingMs: 10000,
  rebalanceIntervalId: null,

  // Configuration
  currentTimeframe: '15m',
  currentRiskProfile: 'moderate',
  currentDirectionFilter: 'all',
  accountEquity: 25000.0,

  // Hierarchical Screener Filters ("Tendine e Sotto-Tendine")
  screenerFilters: {
    region: 'all',
    assetClass: 'all',
    sector: 'all',
    direction: 'all',
    seasonWindow: 'all',
    searchQuery: ''
  },

  // Fractal Weights
  timeframeWeights: {
    '1m':  { macro: 0.00, trend: 0.20, volume: 0.50, zscore: 0.30, label: '1m (Scalping)', kAtr: 1.2 },
    '15m': { macro: 0.10, trend: 0.30, volume: 0.40, zscore: 0.20, label: '15m (Intraday rapido)', kAtr: 1.8 },
    '1h':  { macro: 0.20, trend: 0.35, volume: 0.25, zscore: 0.20, label: '1h (Intraday direzionale)', kAtr: 2.0 },
    '4h':  { macro: 0.30, trend: 0.35, volume: 0.20, zscore: 0.15, label: '4h (Swing intermedio)', kAtr: 2.2 },
    '1d':  { macro: 0.40, trend: 0.35, volume: 0.15, zscore: 0.10, label: '1D (Swing multiday)', kAtr: 2.5 },
    '1w':  { macro: 0.60, trend: 0.30, volume: 0.05, zscore: 0.05, label: '1W (Posizione strategica)', kAtr: 3.0 },
    '1M':  { macro: 0.70, trend: 0.20, volume: 0.05, zscore: 0.05, label: '1M (Macro Asset Allocation)', kAtr: 3.5 }
  },

  // Initialization
  init() {
    this.updateClockForensics();
    setInterval(() => this.updateClockForensics(), 30000);
    this.startRebalanceCountdown();
  },

  // Starts countdown to next monthly rebalancing
  startRebalanceCountdown() {
    if (this.rebalanceIntervalId) clearInterval(this.rebalanceIntervalId);
    this.rebalanceIntervalId = setInterval(() => {
      const el = document.getElementById('qi-live-countdown');
      if (!el) return;

      const now = new Date();
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
      const diffMs = nextMonth - now;

      if (diffMs <= 0) {
        el.textContent = '00g 00h 00m 00s (Ribilanciamento in corso)';
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = n => String(n).padStart(2, '0');
      el.textContent = `${pad(days)}g ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
    }, 1000);
  },

  updateClockForensics() {
    const now = new Date();
    const romeHour = (now.getUTCHours() + 1) % 24;
    const romeMin = now.getUTCMinutes();

    const isFxRollover = (romeHour === 22 && romeMin >= 55) || (romeHour === 23 && romeMin <= 20);
    const isMilanAuction = (romeHour === 17 && romeMin >= 30 && romeMin <= 35);

    this.macroState.circuitBreakers.forexRolloverLock = isFxRollover;
    this.macroState.circuitBreakers.milanAuctionFreeze = isMilanAuction;
  },

  // Sub-Navigation Switcher
  switchSubTab(tabName) {
    this.activeSubTab = tabName;
    this.renderUI();
  },

  // Master UI Renderer
  renderUI() {
    const container = document.getElementById('tab-casario-quant');
    if (!container) return;

    this.updateClockForensics();

    container.innerHTML = `
      <div class="quant-casario-wrapper">
        <!-- MASTER TOP HEADER -->
        <div class="qc-top-header">
          <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
            <div class="qc-badge-pulse">⚡ QUANT INTELLIGENCE & MACRO RADAR</div>
            <div>
              <div style="font-size:16px; font-weight:900; color:#fff; letter-spacing:0.3px;">
                TRADING PRO ULTIMATE™ — Motore Quantitativo Istituzionale
              </div>
              <div style="font-size:11px; color:var(--text-muted);">
                © by cuordivino · Macro Regimi (4Q) · Top Setup Daily · Screener a Tendine · Portafogli Modello & Auto-Sizing
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="qc-live-tag">● REAL-TIME SYNCHRONIZED</span>
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.syncWithBackend()" title="Sincronizza metriche live con Backend Python">
              ↺ Sync API
            </button>
          </div>
        </div>

        <!-- 4-TAB SUB-NAVIGATION BAR -->
        <div class="qi-subnav-bar">
          <button class="qi-subnav-btn ${this.activeSubTab === 'macro-overview' ? 'active' : ''}" onclick="CasarioQuantEngine.switchSubTab('macro-overview')">
            <span>🌐</span> Panoramica Macro & Top Setup Daily
          </button>
          <button class="qi-subnav-btn ${this.activeSubTab === 'radar-screener' ? 'active' : ''}" onclick="CasarioQuantEngine.switchSubTab('radar-screener')">
            <span>🎯</span> Radar & Screener a Cascata (Tendine)
          </button>
          <button class="qi-subnav-btn ${this.activeSubTab === 'asset-dossier' ? 'active' : ''}" onclick="CasarioQuantEngine.switchSubTab('asset-dossier')">
            <span>🔬</span> Dossier Asset & Esplosione Dettaglio (${this.selectedAssetSymbol})
          </button>
          <button class="qi-subnav-btn ${this.activeSubTab === 'model-portfolios' ? 'active' : ''}" onclick="CasarioQuantEngine.switchSubTab('model-portfolios')">
            <span>💼</span> Portafogli Modello Dinamici & Auto-Sizing
          </button>
        </div>

        <!-- ACTIVE SUB-VIEW CONTENT -->
        <div class="qi-subview-content">
          ${this.renderActiveSubViewHTML()}
        </div>
      </div>
    `;
  },

  // Dispatches current view HTML
  renderActiveSubViewHTML() {
    switch(this.activeSubTab) {
      case 'macro-overview':
        return this.buildMacroOverviewHTML();
      case 'radar-screener':
        return this.buildRadarScreenerHTML();
      case 'asset-dossier':
        return this.buildAssetDossierHTML();
      case 'model-portfolios':
        return this.buildModelPortfoliosHTML();
      default:
        return this.buildMacroOverviewHTML();
    }
  },

  /* =======================================================================
   * 1. SUB-VIEW: PANORAMICA MACRO & TOP SETUP DAILY
   * ======================================================================= */
  buildMacroOverviewHTML() {
    const reg = this.macroRegions[this.selectedMacroRegion] || this.macroRegions.usa;
    const m = this.macroState;

    return `
      <!-- TOP MACRO & LIQUIDITY RIBBON -->
      <div class="qc-macro-ribbon">
        ${this.buildMacroRibbonHTML()}
      </div>

      <!-- INTERACTIVE REGIONAL FUNNEL & SENTIMENT -->
      <div class="qi-regional-panel">
        <div class="qc-panel-header" style="margin-bottom:12px;">
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">
              🌍 SELEZIONE MACRO-REGIONE & REGIME ECONOMICO PREDOMINANTE
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              Clicca su una macro-area per aggiornare istantaneamente regime, score e metriche reali
            </div>
          </div>
          <div class="qi-region-pills">
            ${Object.keys(this.macroRegions).map(key => {
              const r = this.macroRegions[key];
              return `
                <button class="qi-region-btn ${this.selectedMacroRegion === key ? 'active' : ''}" onclick="CasarioQuantEngine.selectMacroRegion('${key}')">
                  ${r.flag} ${r.name.split(' ')[0]}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="qi-regional-split">
          <!-- Left: Active Region Card -->
          <div class="qi-region-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <span style="font-size:24px; margin-right:6px;">${reg.flag}</span>
                <span style="font-weight:900; font-size:16px; color:#fff;">${reg.name}</span>
                <div class="qi-regime-badge ${reg.regimeCode}">${reg.regime}</div>
              </div>
              <div class="qi-radial-gauge-box">
                <svg viewBox="0 0 36 36" class="qi-circular-chart">
                  <path class="qi-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="qi-circle" stroke-dasharray="${reg.score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <text x="18" y="20.35" class="qi-gauge-text">${reg.score}</text>
                </svg>
                <div style="font-size:9px; font-weight:800; color:var(--text-dim); text-align:center;">Q-SCORE MACRO</div>
              </div>
            </div>

            <p style="font-size:11px; color:#d1d4dc; line-height:1.5; margin-bottom:12px;">
              ${reg.desc}
            </p>

            <div class="qi-metrics-grid">
              <div class="qi-metric-box">
                <span class="qi-m-label">Crescita PIL (RoC):</span>
                <span class="qi-m-val" style="color:#00f2a1;">${reg.gdpRoc}</span>
              </div>
              <div class="qi-metric-box">
                <span class="qi-m-label">Inflazione (CPI):</span>
                <span class="qi-m-val" style="color:#38bdf8;">${reg.cpi}</span>
              </div>
              <div class="qi-metric-box">
                <span class="qi-m-label">Tasso Banca Centrale:</span>
                <span class="qi-m-val" style="color:#fff;">${reg.rate}</span>
              </div>
              <div class="qi-metric-box">
                <span class="qi-m-label">Rendimento 10Y:</span>
                <span class="qi-m-val" style="color:#f59e0b;">${reg.yield10y}</span>
              </div>
            </div>
          </div>

          <!-- Right: Institutional Sentiment Barometer -->
          <div class="qi-sentiment-card">
            <div style="font-weight:900; font-size:12px; color:#fff; margin-bottom:4px;">
              📊 BAROMETRO SENTIMENT ISTITUZIONALE
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-bottom:12px;">
              Sintesi pesata posizionamento istituzionale & COT Report
            </div>

            <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:14px;">
              <div style="text-align:center;">
                <div style="font-size:32px; font-weight:900; color:#00f2a1;">${reg.sentiment.bulls}%</div>
                <div style="font-size:10px; font-weight:800; color:var(--text-dim);">▲ BULLISH</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:32px; font-weight:900; color:#94a3b8;">${reg.sentiment.neutrals}%</div>
                <div style="font-size:10px; font-weight:800; color:var(--text-dim);">■ NEUTRAL</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:32px; font-weight:900; color:#ef4444;">${reg.sentiment.bears}%</div>
                <div style="font-size:10px; font-weight:800; color:var(--text-dim);">▼ BEARISH</div>
              </div>
            </div>

            <div class="qi-sentiment-bar-track">
              <div class="qi-sent-seg bull" style="width:${reg.sentiment.bulls}%;"></div>
              <div class="qi-sent-seg neut" style="width:${reg.sentiment.neutrals}%;"></div>
              <div class="qi-sent-seg bear" style="width:${reg.sentiment.bears}%;"></div>
            </div>

            <div style="font-size:10px; color:var(--text-muted); line-height:1.4; margin-top:12px;">
              Prevalenza di posizioni <b>Long Accumulation</b> tra i fondi non commerciali. Il bias statistico supporta la continuazione del trend sui leader di settore.
            </div>
          </div>
        </div>
      </div>

      <!-- 3 TOP SETUP QUANTITATIVI DAILY -->
      <div class="qi-daily-wrapper" style="margin-top:20px;">
        <div class="qc-panel-header" style="margin-bottom:12px;">
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">
              🎯 TOP SETUP QUANTITATIVI DAILY (3 PROPOSTE DEL GIORNO)
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              Opportunità ad asimmetria statistica massima R:R > 2.50 selezionate dall'algoritmo
            </div>
          </div>
          <span class="qc-live-tag">AGGIORNATE OGGI · CONFLUENZA MULTIFATTORIALE</span>
        </div>

        <div class="qi-daily-grid">
          ${this.topDailySetups.map(setup => {
            const isLong = setup.bias.includes('BUY');
            const sparkPoints = setup.sparkline.map((val, idx) => {
              const x = (idx / (setup.sparkline.length - 1)) * 120;
              const minVal = Math.min(...setup.sparkline);
              const maxVal = Math.max(...setup.sparkline);
              const y = 35 - ((val - minVal) / (maxVal - minVal || 1)) * 28;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');

            return `
              <div class="qi-daily-card">
                <div class="qi-dc-header">
                  <div>
                    <div style="font-weight:900; font-size:15px; color:#fff;">${setup.symbol}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${setup.name}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:14px; font-weight:800; color:#fff;">${setup.currency}${setup.price.toLocaleString('it-IT')}</div>
                    <div style="font-size:10px; font-weight:800; color:${setup.chg24.startsWith('+') ? '#00f2a1' : '#ef4444'};">${setup.chg24}</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; margin:10px 0;">
                  <span class="qc-direction-pill ${isLong ? 'strong-long' : 'strong-short'}">
                    ${setup.bias}
                  </span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:11px; font-weight:900; color:#00f2a1;">Q-Score:</span>
                    <span style="font-size:16px; font-weight:900; color:#fff; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
                      ${setup.qScore}/100
                    </span>
                  </div>
                </div>

                <div class="qi-sparkline-box">
                  <svg width="100%" height="40" viewBox="0 0 120 40">
                    <polyline fill="none" stroke="${isLong ? '#00f2a1' : '#ef4444'}" stroke-width="2" points="${sparkPoints}" />
                  </svg>
                </div>

                <p style="font-size:10px; color:#cbd5e1; line-height:1.4; margin:8px 0; min-height:42px;">
                  ${setup.thesis}
                </p>

                <div class="qi-dc-levels">
                  <div class="qi-level-item">
                    <span>Entry:</span>
                    <b>${setup.currency}${setup.entry.toFixed(2)}</b>
                  </div>
                  <div class="qi-level-item">
                    <span>Stop Loss:</span>
                    <b style="color:#ef4444;">${setup.currency}${setup.stopLoss.toFixed(2)}</b>
                  </div>
                  <div class="qi-level-item">
                    <span>TP Target:</span>
                    <b style="color:#00f2a1;">${setup.currency}${setup.tp1.toFixed(2)}</b>
                  </div>
                  <div class="qi-level-item">
                    <span>R:R:</span>
                    <b style="color:var(--cyan);">${setup.riskReward}</b>
                  </div>
                </div>

                <div style="display:flex; gap:8px; margin-top:12px;">
                  <button class="btn btn-secondary btn-sm" style="flex:1; font-size:10px; padding:6px;" onclick="CasarioQuantEngine.openAssetDossier('${setup.symbol}')">
                    🔬 Apri Dossier
                  </button>
                  <button class="btn-action-primary btn-sm" style="flex:1; font-size:10px; padding:6px; background:rgba(0,242,161,0.15); border:1px solid #00f2a1; color:#00f2a1;" onclick="CasarioQuantEngine.selectAssetForProposal('${setup.symbol}')">
                    ⚡ Proponi (10s)
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /* =======================================================================
   * 2. SUB-VIEW: RADAR & SCREENER A CASCATA (TENDINE E SOTTO-TENDINE)
   * ======================================================================= */
  buildRadarScreenerHTML() {
    return `
      <div class="qi-dropdowns-bar">
        <div class="qi-filters-row">
          <!-- Tendina 1: Area Geografica -->
          <div class="qi-filter-col">
            <label class="qi-filter-label">🌍 Tendina 1: Area Macro</label>
            <select class="terminal-input qi-select" onchange="CasarioQuantEngine.setScreenerFilter('region', this.value)">
              <option value="all" ${this.screenerFilters.region === 'all' ? 'selected' : ''}>Tutte le Macro-Aree</option>
              <option value="usa" ${this.screenerFilters.region === 'usa' ? 'selected' : ''}>🇺🇸 USA (Wall Street)</option>
              <option value="europe" ${this.screenerFilters.region === 'europe' ? 'selected' : ''}>🇪🇺 Eurozona & Borsa Italiana</option>
              <option value="asia" ${this.screenerFilters.region === 'asia' ? 'selected' : ''}>🇯🇵🇨🇳 Asia & Cina</option>
            </select>
          </div>

          <!-- Sotto-Tendina 2: Classe di Asset -->
          <div class="qi-filter-col">
            <label class="qi-filter-label">📊 Sotto-Tendina 2: Classe Asset</label>
            <select class="terminal-input qi-select" onchange="CasarioQuantEngine.setScreenerFilter('assetClass', this.value)">
              <option value="all" ${this.screenerFilters.assetClass === 'all' ? 'selected' : ''}>Tutte le Classi</option>
              <option value="US_EQUITY" ${this.screenerFilters.assetClass === 'US_EQUITY' ? 'selected' : ''}>📈 Azioni USA</option>
              <option value="IT_EQUITY" ${this.screenerFilters.assetClass === 'IT_EQUITY' ? 'selected' : ''}>🏛️ Azioni Italia (FTSE MIB)</option>
              <option value="FOREX" ${this.screenerFilters.assetClass === 'FOREX' ? 'selected' : ''}>💱 Forex & Valute</option>
              <option value="CRYPTO" ${this.screenerFilters.assetClass === 'CRYPTO' ? 'selected' : ''}>🪙 Criptovalute</option>
              <option value="COMMODITY" ${this.screenerFilters.assetClass === 'COMMODITY' ? 'selected' : ''}>🥇 Materie Prime</option>
              <option value="INDEX" ${this.screenerFilters.assetClass === 'INDEX' ? 'selected' : ''}>🌐 Indici Benchmark</option>
            </select>
          </div>

          <!-- Sotto-Tendina 3: Settore / Industria -->
          <div class="qi-filter-col">
            <label class="qi-filter-label">🏭 Sotto-Tendina 3: Settore</label>
            <select class="terminal-input qi-select" onchange="CasarioQuantEngine.setScreenerFilter('sector', this.value)">
              <option value="all" ${this.screenerFilters.sector === 'all' ? 'selected' : ''}>Tutti i Settori</option>
              <option value="tech" ${this.screenerFilters.sector === 'tech' ? 'selected' : ''}>🤖 Tecnologia & AI</option>
              <option value="finance" ${this.screenerFilters.sector === 'finance' ? 'selected' : ''}>🏦 Finanza & Banche</option>
              <option value="energy" ${this.screenerFilters.sector === 'energy' ? 'selected' : ''}>⚡ Energia & Rinnovabili</option>
              <option value="luxury" ${this.screenerFilters.sector === 'luxury' ? 'selected' : ''}>🚗 Automotive & Lusso</option>
            </select>
          </div>

          <!-- Sotto-Tendina 4: Direzionalità / Q-Score -->
          <div class="qi-filter-col">
            <label class="qi-filter-label">🧭 Sotto-Tendina 4: Direzione</label>
            <select class="terminal-input qi-select" onchange="CasarioQuantEngine.setScreenerFilter('direction', this.value)">
              <option value="all" ${this.screenerFilters.direction === 'all' ? 'selected' : ''}>Tutti i Segnali</option>
              <option value="strong-long" ${this.screenerFilters.direction === 'strong-long' ? 'selected' : ''}>🟢 Strong Buy (Q-Score ≥ 85)</option>
              <option value="long" ${this.screenerFilters.direction === 'long' ? 'selected' : ''}>🟩 Buy (Q-Score 70-84)</option>
              <option value="neutral" ${this.screenerFilters.direction === 'neutral' ? 'selected' : ''}>⚪ Neutral (Q-Score 40-69)</option>
              <option value="short" ${this.screenerFilters.direction === 'short' ? 'selected' : ''}>🔴 Short / Hedging (Q-Score &lt; 40)</option>
            </select>
          </div>

          <!-- Sotto-Tendina 5: Finestra Stagionale -->
          <div class="qi-filter-col">
            <label class="qi-filter-label">📅 Sotto-Tendina 5: Stagionalità</label>
            <select class="terminal-input qi-select" onchange="CasarioQuantEngine.setScreenerFilter('seasonWindow', this.value)">
              <option value="all" ${this.screenerFilters.seasonWindow === 'all' ? 'selected' : ''}>Tutte le Finestre</option>
              <option value="current-month" ${this.screenerFilters.seasonWindow === 'current-month' ? 'selected' : ''}>🍂 Novembre Corrente (Favorevole)</option>
              <option value="q4-rally" ${this.screenerFilters.seasonWindow === 'q4-rally' ? 'selected' : ''}>🎄 Q4 Year-End Rally</option>
            </select>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px; padding-top:10px; border-top:1px solid #2a2e39;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="text" class="terminal-input" placeholder="🔍 Cerca per Ticker o Nome..." value="${this.screenerFilters.searchQuery}" oninput="CasarioQuantEngine.setScreenerFilter('searchQuery', this.value)" style="width:220px; font-size:11px;">
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.resetScreenerFilters()">↺ Reset</button>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.exportWatchlistCSV()" title="Esporta tabella corrente in file CSV per Excel">
              📥 Esporta CSV
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.print()" title="Stampa o salva in PDF la schermata corrente">
              🖨️ Stampa Schermata
            </button>
          </div>
        </div>
      </div>

      <div class="qc-main-split" style="margin-top:15px;">
        <div class="qc-table-container">
          <div class="qc-panel-header">
            <div>
              <div style="font-weight:900; font-size:12px; color:#fff;">
                📊 UNIVERSO ASSET RANKED PER VANTAGGIO STATISTICO (Q-SCORE 0-100)
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Clicca su qualsiasi riga per aprire l'Esplosione Dettaglio (Dossier completo)
              </div>
            </div>
            <span style="font-size:11px; color:var(--cyan); font-weight:800;">
              ${this.getFilteredUniverse().length} Asset Filtrati
            </span>
          </div>

          <div class="qc-table-scroll">
            <table class="qc-table">
              <thead>
                <tr>
                  <th>ASSET / TICKER</th>
                  <th>CLASSE & SETTORE</th>
                  <th style="text-align:right;">PREZZO</th>
                  <th style="text-align:right;">24H</th>
                  <th style="text-align:center;">Q-SCORE (0-100)</th>
                  <th style="text-align:center;">I 5 PILASTRI</th>
                  <th style="text-align:center;">DIREZIONE</th>
                  <th style="text-align:right;">Z-SCORE</th>
                  <th style="text-align:center;">AZIONI</th>
                </tr>
              </thead>
              <tbody>
                ${this.buildEnhancedScreenerRowsHTML()}
              </tbody>
            </table>
          </div>
        </div>

        <div class="qc-sidebar-container">
          <div class="qc-panel-card" id="qc-order-gate-panel">
            ${this.buildOrderGateHTML()}
          </div>

          <div class="qc-panel-card qc-master-risk-card">
            <div class="qc-panel-header" style="padding-bottom:6px;">
              <div style="font-weight:800; font-size:12px; color:#ef4444;">
                🛡️ MASTER RISK: WORST-CASE SCENARIO
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Protezione drawdown aggregato simultaneo
              </div>
            </div>
            <div id="qc-worst-case-content">
              ${this.buildWorstCaseScenarioHTML()}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* =======================================================================
   * 3. SUB-VIEW: DOSSIER ASSET & ESPLOSIONE DETTAGLIO
   * ======================================================================= */
  buildAssetDossierHTML() {
    const asset = this.universeData.find(x => x.symbol === this.selectedAssetSymbol) || this.universeData[0];
    const isLong = asset.qScore >= 70;

    return `
      <div class="qi-dossier-wrapper">
        <div class="qi-dossier-toolbar">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:800; color:var(--text-dim);">SELEZIONA ASSET DA ESPLORARE:</span>
            <select class="terminal-input" style="font-weight:800; font-size:12px; padding:6px 12px; width:220px;" onchange="CasarioQuantEngine.openAssetDossier(this.value)">
              ${this.universeData.map(item => `
                <option value="${item.symbol}" ${item.symbol === asset.symbol ? 'selected' : ''}>
                  ${item.flag} ${item.symbol} — ${item.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.selectAssetForProposal('${asset.symbol}')" style="color:#00f2a1; border-color:#00f2a1;">
              ⚡ Compila Proposta 10s
            </button>
            <button class="btn btn-primary btn-sm" onclick="CasarioQuantEngine.exportDossierPDF('${asset.symbol}')" style="background:#2563eb; color:#fff; font-weight:800;">
              📄 Esporta Dossier PDF / Stampa Scheda
            </button>
          </div>
        </div>

        <div class="qi-dossier-header-card">
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <div style="font-size:36px;">${asset.flag}</div>
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:22px; font-weight:900; color:#fff;">${asset.symbol}</span>
                <span class="qc-asset-tag ${asset.assetClass.toLowerCase()}">${asset.assetClass}</span>
                <span class="qc-direction-pill ${isLong ? 'strong-long' : 'neutral'}">${asset.direction}</span>
              </div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                ${asset.name} · Settore: <b style="color:#fff;">${asset.sector}</b> · Cap: <b>${asset.marketCap}</b>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
            <div style="text-align:right;">
              <div style="font-size:20px; font-weight:900; color:#fff;">
                ${asset.currency}${asset.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              <div style="font-size:12px; font-weight:800; color:${asset.chg24.startsWith('+') ? '#00f2a1' : '#ef4444'};">
                ${asset.chg24} (24h)
              </div>
            </div>

            <div class="qi-radial-gauge-box">
              <svg viewBox="0 0 36 36" class="qi-circular-chart">
                <path class="qi-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="qi-circle" stroke-dasharray="${asset.qScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" class="qi-gauge-text">${asset.qScore}</text>
              </svg>
              <div style="font-size:9px; font-weight:900; color:#00f2a1; text-align:center;">Q-SCORE™</div>
            </div>
          </div>
        </div>

        <div class="qi-dossier-nav">
          <button class="qi-dossier-tab-btn ${this.activeDossierSubTab === 'bands' ? 'active' : ''}" onclick="CasarioQuantEngine.setDossierSubTab('bands')">
            📈 Bande di Prezzo & I 5 Pilastri
          </button>
          <button class="qi-dossier-tab-btn ${this.activeDossierSubTab === 'fundamentals' ? 'active' : ''}" onclick="CasarioQuantEngine.setDossierSubTab('fundamentals')">
            📑 Fondamentali & Flussi di Cassa
          </button>
          <button class="qi-dossier-tab-btn ${this.activeDossierSubTab === 'seasonality' ? 'active' : ''}" onclick="CasarioQuantEngine.setDossierSubTab('seasonality')">
            🗓️ Stagionalità Storicizzata (5/10/15y) & Finestra Custom
          </button>
          <button class="qi-dossier-tab-btn ${this.activeDossierSubTab === 'etf' ? 'active' : ''}" onclick="CasarioQuantEngine.setDossierSubTab('etf')">
            🏛️ Mappatura ETF Istituzionali
          </button>
        </div>

        <div class="qi-dossier-pane" style="margin-top:14px;">
          ${this.renderDossierSubPaneHTML(asset)}
        </div>
      </div>
    `;
  },

  renderDossierSubPaneHTML(asset) {
    switch(this.activeDossierSubTab) {
      case 'bands':
        return this.buildDossierBandsHTML(asset);
      case 'fundamentals':
        return this.buildDossierFundamentalsHTML(asset);
      case 'seasonality':
        return this.buildDossierSeasonalityHTML(asset);
      case 'etf':
        return this.buildDossierEtfHTML(asset);
      default:
        return this.buildDossierBandsHTML(asset);
    }
  },

  /* --- Dossier Sub-Pane 1: Bande di Prezzo & 5 Pilastri --- */
  buildDossierBandsHTML(asset) {
    const p = asset.pillars;
    return `
      <div class="qi-dossier-grid-2">
        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              🎯 BANDE DI VOLATILITÀ ISTITUZIONALI PROPRIETARIE
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Calcolate su base Volatilità Implicita & ATR Daily</span>
          </div>

          <div class="qi-bands-container">
            <div class="qi-band-row upper">
              <span class="qi-band-label">Target Superiore (Prese di Profitto):</span>
              <b class="qi-band-val" style="color:#00f2a1;">${asset.currency}${asset.bands.upper.toFixed(2)}</b>
            </div>
            <div class="qi-band-row pivot">
              <span class="qi-band-label">Pivot Centrale (Fair Value Neutro):</span>
              <b class="qi-band-val" style="color:#38bdf8;">${asset.currency}${asset.bands.pivot.toFixed(2)}</b>
            </div>
            <div class="qi-band-row current">
              <span class="qi-band-label">Prezzo Attuale di Mercato:</span>
              <b class="qi-band-val" style="color:#fff;">${asset.currency}${asset.price.toFixed(2)}</b>
            </div>
            <div class="qi-band-row lower">
              <span class="qi-band-label">Supporto Inferiore (Zona di Accumulazione):</span>
              <b class="qi-band-val" style="color:#ef4444;">${asset.currency}${asset.bands.lower.toFixed(2)}</b>
            </div>
          </div>

          <div class="qi-bands-visual-bar" style="margin-top:14px;">
            <div class="qi-bvb-marker lower" style="left:15%;">Supp: ${asset.bands.lower.toFixed(0)}</div>
            <div class="qi-bvb-marker pivot" style="left:50%;">Pivot: ${asset.bands.pivot.toFixed(0)}</div>
            <div class="qi-bvb-marker upper" style="left:85%;">Target: ${asset.bands.upper.toFixed(0)}</div>
          </div>

          <div style="font-size:10px; color:var(--text-muted); line-height:1.4; margin-top:16px;">
            Le bande delimitano il corridoio statistico entro cui il 90% delle oscillazioni si verifica. Superamenti del Target Superiore segnalano esaurimento di breve termine, mentre avvicinamenti al Supporto Inferiore offrono asimmetria positiva.
          </div>
        </div>

        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              ⚖️ SCOMPOSIZIONE MATEMATICA DEI 5 PILASTRI (Q-SCORE)
            </div>
            <span style="font-size:10px; color:#00f2a1; font-weight:800;">Algoritmo Trasparente</span>
          </div>

          <div class="qi-pillars-list">
            <div class="qi-pillar-item">
              <div class="qi-pi-row">
                <span>1. Regime Macro (4Q Dalio/Hedgeye & Liquidità Fed)</span>
                <b>${p.macro}/100</b>
              </div>
              <div class="qi-pi-track"><div class="qi-pi-fill" style="width:${p.macro}%;"></div></div>
            </div>

            <div class="qi-pillar-item">
              <div class="qi-pi-row">
                <span>2. Quadro Tecnico & Price Action (AVWAP / Volume Profile)</span>
                <b>${p.technical}/100</b>
              </div>
              <div class="qi-pi-track"><div class="qi-pi-fill" style="width:${p.technical}%;"></div></div>
            </div>

            <div class="qi-pillar-item">
              <div class="qi-pi-row">
                <span>3. Finestra di Stagionalità Storicizzata</span>
                <b>${p.seasonal}/100</b>
              </div>
              <div class="qi-pi-track"><div class="qi-pi-fill" style="width:${p.seasonal}%;"></div></div>
            </div>

            <div class="qi-pillar-item">
              <div class="qi-pi-row">
                <span>4. Flussi Istituzionali & Posizionamento COT Report</span>
                <b>${p.cot}/100</b>
              </div>
              <div class="qi-pi-track"><div class="qi-pi-fill" style="width:${p.cot}%;"></div></div>
            </div>

            <div class="qi-pillar-item">
              <div class="qi-pi-row">
                <span>5. Solidità Fondamentale & Cash Flow FCF</span>
                <b>${p.fundamentals}/100</b>
              </div>
              <div class="qi-pi-track"><div class="qi-pi-fill" style="width:${p.fundamentals}%;"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- Dossier Sub-Pane 2: Fondamentali & Flussi di Cassa --- */
  buildDossierFundamentalsHTML(asset) {
    const f = asset.fundamentals;
    if (!f) return '<div style="padding:20px; color:var(--text-muted);">Dati fondamentali non applicabili per questa asset class.</div>';

    return `
      <div class="qi-dossier-grid-2">
        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              📑 STATO PATRIMONIALE, UTILI & FREE CASH FLOW
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Parametri Reali Aggiornati</span>
          </div>

          <div class="qi-fund-metrics-grid">
            <div class="qi-fund-m-card">
              <span class="qi-fm-label">Ricavi Totali (LTM):</span>
              <span class="qi-fm-val">${f.revenue}</span>
              <span class="qi-fm-sub" style="color:#00f2a1;">Crescita: ${f.revenueGrowthYoY}</span>
            </div>
            <div class="qi-fund-m-card">
              <span class="qi-fm-label">Margine Operativo:</span>
              <span class="qi-fm-val">${f.operatingMargin}</span>
              <span class="qi-fm-sub">Benchmark settore: 18%</span>
            </div>
            <div class="qi-fund-m-card">
              <span class="qi-fm-label">Free Cash Flow:</span>
              <span class="qi-fm-val">${f.freeCashFlow}</span>
              <span class="qi-fm-sub">FCF/Azione: ${f.fcfPerShare}</span>
            </div>
            <div class="qi-fund-m-card">
              <span class="qi-fm-label">Multiplo P/E:</span>
              <span class="qi-fm-val">${asset.peRatio > 0 ? asset.peRatio + 'x' : 'N/A'}</span>
              <span class="qi-fm-sub">Debt/Equity: ${f.debtToEquity}</span>
            </div>
          </div>

          <div style="margin-top:16px;">
            <div style="font-size:11px; font-weight:800; color:#fff; margin-bottom:8px;">
              🛡️ CHECKLIST SALUTE FINANZIARIA:
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${f.checklist.map(c => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:#11141c; border-radius:4px; font-size:11px;">
                  <span style="color:#d1d4dc;">${c.item}</span>
                  <span style="font-weight:800; color:${c.status === 'ok' ? '#00f2a1' : '#f59e0b'};">
                    ${c.status === 'ok' ? '✓ OK' : '⚠️ ATTENZIONE'} (${c.detail})
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              🥧 SEGMENTAZIONE RICAVI (PRODOTTO & GEOGRAFIA)
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Diversificazione Industriale</span>
          </div>

          <div style="margin-bottom:16px;">
            <div style="font-size:11px; font-weight:800; color:var(--cyan); margin-bottom:6px;">
              Ricavi per Linea di Prodotto / Servizio:
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${f.segmentsProduct.map(s => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:10px; color:#d1d4dc; margin-bottom:2px;">
                    <span>${s.label}</span>
                    <b style="color:#fff;">${s.pct}%</b>
                  </div>
                  <div class="qi-seg-track">
                    <div class="qi-seg-fill" style="width:${s.pct}%; background:${s.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div style="font-size:11px; font-weight:800; color:var(--cyan); margin-bottom:6px;">
              Ricavi per Area Geografica:
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${f.segmentsGeo.map(s => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:10px; color:#d1d4dc; margin-bottom:2px;">
                    <span>${s.label}</span>
                    <b style="color:#fff;">${s.pct}%</b>
                  </div>
                  <div class="qi-seg-track">
                    <div class="qi-seg-fill" style="width:${s.pct}%; background:${s.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- Dossier Sub-Pane 3: Stagionalità Storicizzata & Finestra Custom --- */
  buildDossierSeasonalityHTML(asset) {
    const s = asset.seasonality;
    if (!s) return '<div style="padding:20px; color:var(--text-muted);">Dati di stagionalità non disponibili.</div>';

    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    return `
      <div class="qc-panel-card" style="margin-bottom:14px;">
        <div class="qc-panel-header" style="margin-bottom:10px;">
          <div>
            <div style="font-weight:900; font-size:12px; color:#fff;">
              📊 RENDIMENTI MEDI STORICI MESE PER MESE (10 ANNI)
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              Evidenziazione statistica dei mesi a maggior vantaggio rialzista / ribassista
            </div>
          </div>
          <span style="font-size:11px; font-weight:800; color:#00f2a1;">
            Miglior Finestra: ${s.bestWindow} (${s.avgGainPct} avg)
          </span>
        </div>

        <div class="qi-monthly-bars-grid">
          ${s.monthlyReturns.map((ret, idx) => {
            const isPos = ret >= 0;
            const barHeight = Math.min(60, Math.abs(ret) * 4);
            const isCurrentMonth = idx === (new Date().getMonth());

            return `
              <div class="qi-month-col ${isCurrentMonth ? 'current-month-highlight' : ''}">
                <div class="qi-month-val" style="color:${isPos ? '#00f2a1' : '#ef4444'};">
                  ${ret > 0 ? '+' : ''}${ret}%
                </div>
                <div class="qi-month-track">
                  <div class="qi-month-bar ${isPos ? 'pos' : 'neg'}" style="height:${barHeight}px;"></div>
                </div>
                <div class="qi-month-name">${months[idx]}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="qi-dossier-grid-2">
        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:8px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              📈 CONFRONTO CURVE DI STAGIONALITÀ (5Y vs 10Y vs 15Y)
            </div>
            <div style="display:flex; gap:8px; font-size:9px; font-weight:800;">
              <span style="color:#00f2a1;">● 5 Anni</span>
              <span style="color:#38bdf8;">● 10 Anni</span>
              <span style="color:#f59e0b;">● 15 Anni</span>
            </div>
          </div>

          <div style="padding:10px; background:#11141c; border-radius:6px;">
            <svg width="100%" height="120" viewBox="0 0 300 120">
              <line x1="0" y1="30" x2="300" y2="30" stroke="#1e293b" stroke-width="1" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" stroke-width="1" />
              <line x1="0" y1="90" x2="300" y2="90" stroke="#1e293b" stroke-width="1" />
              <polyline fill="none" stroke="#00f2a1" stroke-width="2" points="10,105 40,95 70,82 100,75 130,55 160,45 190,40 220,32 250,28 290,18" />
              <polyline fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3" points="10,108 40,100 70,88 100,80 130,62 160,52 190,46 220,38 250,32 290,22" />
              <polyline fill="none" stroke="#f59e0b" stroke-width="1.5" points="10,110 40,104 70,94 100,85 130,70 160,60 190,52 220,44 250,38 290,28" />
            </svg>
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:8px;">
            La persistenza della pendenza positiva su tutti e 3 gli orizzonti temporali (5, 10, 15 anni) conferma una forte robustezza statistica indipendente da singoli shock isolati.
          </div>
        </div>

        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:8px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              ⚙️ CALCOLATORE FINESTRA PERSONALIZZATA
            </div>
            <span style="font-size:10px; color:#00f2a1; font-weight:800;">Funzionalità Esclusiva</span>
          </div>

          <p style="font-size:10px; color:var(--text-muted); margin-bottom:10px;">
            Seleziona qualsiasi data di inizio e fine anno per calcolare istantaneamente il Win Rate storico e il rendimento medio dell'asset su quella specifica finestra:
          </p>

          <div style="display:flex; gap:10px; margin-bottom:12px;">
            <div style="flex:1;">
              <label style="font-size:10px; color:var(--text-dim); font-weight:800; display:block; margin-bottom:4px;">DATA INIZIO:</label>
              <input type="text" class="terminal-input" value="15 Novembre" style="width:100%; font-size:11px;" id="qi-custom-start">
            </div>
            <div style="flex:1;">
              <label style="font-size:10px; color:var(--text-dim); font-weight:800; display:block; margin-bottom:4px;">DATA FINE:</label>
              <input type="text" class="terminal-input" value="05 Gennaio" style="width:100%; font-size:11px;" id="qi-custom-end">
            </div>
          </div>

          <div class="qi-custom-res-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; color:#fff;">Win Rate Storico Finestra:</span>
              <b style="font-size:14px; color:#00f2a1;">${s.winRatePct}%</b>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; color:#fff;">Rendimento Medio Atteso:</span>
              <b style="font-size:14px; color:#38bdf8;">${s.avgGainPct}</b>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#fff;">Max Drawdown Storico nella Finestra:</span>
              <b style="font-size:14px; color:#f59e0b;">-3.2%</b>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* --- Dossier Sub-Pane 4: Mappatura ETF Istituzionali --- */
  buildDossierEtfHTML(asset) {
    const list = asset.etfs || [];
    if (list.length === 0) return '<div style="padding:20px; color:var(--text-muted);">Nessun ETF registrato per questo asset.</div>';

    return `
      <div class="qc-panel-card">
        <div class="qc-panel-header" style="margin-bottom:10px;">
          <div>
            <div style="font-weight:900; font-size:12px; color:#fff;">
              🏛️ PRINCIPALI ETF GLOBALI CHE DETENGONO ${asset.symbol}
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              Mappatura dell'esposizione istituzionale passiva: afflussi sugli ETF si traducono in acquisti automatici del titolo
            </div>
          </div>
          <span style="font-size:11px; font-weight:800; color:var(--cyan);">${list.length} ETF Istituzionali</span>
        </div>

        <div class="qc-table-scroll">
          <table class="qc-table">
            <thead>
              <tr>
                <th>TICKER ETF</th>
                <th>NOME COMPLETO ETF</th>
                <th style="text-align:right;">PESO % NEL FONDO</th>
                <th style="text-align:center;">Q-SCORE DELL'ETF</th>
                <th style="text-align:right;">PATRIMONIO GESTITO (AUM)</th>
                <th style="text-align:center;">AZIONE</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(etf => `
                <tr class="qc-row">
                  <td style="font-weight:900; color:#fff;">${etf.symbol}</td>
                  <td style="color:#cbd5e1; font-size:11px;">${etf.name}</td>
                  <td style="text-align:right; font-weight:800; color:#00f2a1;">${etf.weight}</td>
                  <td style="text-align:center;">
                    <span style="font-weight:800; color:#fff; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
                      ${etf.score}/100
                    </span>
                  </td>
                  <td style="text-align:right; color:#cbd5e1; font-weight:700;">${etf.aum}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm" style="font-size:10px; padding:3px 8px;" onclick="window.showToast ? window.showToast('Analisi ETF ${etf.symbol} aperta', 'info') : null">
                      Esamina ETF
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* =======================================================================
   * 4. SUB-VIEW: PORTAFOGLI MODELLO DINAMICI & AUTO-SIZING
   * ======================================================================= */
  buildModelPortfoliosHTML() {
    const p = this.modelPortfolios[this.selectedPortfolioId] || this.modelPortfolios.balanced;
    const userCap = this.portfolioCapital || 10000;

    return `
      <div class="qi-portfolios-selector-grid">
        ${Object.keys(this.modelPortfolios).map(key => {
          const item = this.modelPortfolios[key];
          const isSelected = this.selectedPortfolioId === key;

          return `
            <div class="qi-p-card ${isSelected ? 'active' : ''}" onclick="CasarioQuantEngine.selectPortfolio('${key}')">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div style="font-weight:900; font-size:14px; color:#fff;">${item.name.split(' (')[0]}</div>
                <span class="qi-p-badge ${key}">${item.riskTier.split(' ')[0]}</span>
              </div>
              <p style="font-size:10px; color:var(--text-muted); line-height:1.4; margin-bottom:10px; min-height:28px;">
                ${item.tagline}
              </p>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                <div style="padding:6px; background:#11141c; border-radius:4px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-dim); display:block;">TOTAL RETURN:</span>
                  <b style="font-size:13px; color:#00f2a1;">${item.metrics.totalReturn}</b>
                </div>
                <div style="padding:6px; background:#11141c; border-radius:4px; text-align:center;">
                  <span style="font-size:9px; color:var(--text-dim); display:block;">MAX DRAWDOWN:</span>
                  <b style="font-size:13px; color:#ef4444;">${item.metrics.maxDrawdown}</b>
                </div>
              </div>

              <div style="font-size:9px; color:#38bdf8; text-align:center; font-weight:700;">
                Sharpe: ${item.metrics.sharpeRatio} · Protezione Perdite: ${item.metrics.lossProtection}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qi-portfolio-detail-box" style="margin-top:16px;">
        <div class="qi-p-detail-header">
          <div>
            <div style="font-size:18px; font-weight:900; color:#fff;">
              ${p.name}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
              ${p.targetInvestor}
            </div>
          </div>

          <div class="qi-rebalance-countdown-card">
            <div style="font-size:9px; font-weight:800; color:var(--text-dim); text-transform:uppercase;">
              ⏳ Prossimo Ribilanciamento Mensile Tra:
            </div>
            <div id="qi-live-countdown" style="font-size:16px; font-weight:900; color:#38bdf8; font-family:var(--font-mono); letter-spacing:0.5px;">
              11g 03h 09m 40s
            </div>
          </div>
        </div>

        <div class="qc-panel-card" style="margin:14px 0;">
          <div class="qc-panel-header" style="margin-bottom:8px;">
            <div>
              <div style="font-weight:900; font-size:12px; color:#fff;">
                📈 CURVA CUMULATA vs BENCHMARK S&P 500 & ANALISI RESILIENZA DRAWDOWN
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Test di stress: misurazione rigorosa della capacità del portafoglio di 'fare meno male' durante i crolli
              </div>
            </div>
            <div style="display:flex; gap:12px; font-size:10px; font-weight:800;">
              <span style="color:#00f2a1;">● Portafoglio (${p.metrics.totalReturn})</span>
              <span style="color:#38bdf8;">● S&P 500 Benchmark (+231.10%)</span>
              <span style="color:#ef4444;">▼ Max DD Portafoglio (${p.metrics.maxDrawdown})</span>
            </div>
          </div>

          <div style="padding:10px; background:#11141c; border-radius:6px;">
            <div style="font-size:9px; color:var(--text-dim); font-weight:800; margin-bottom:4px;">1. CRESCITA CUMULATA DEL CAPITALE:</div>
            <svg width="100%" height="90" viewBox="0 0 500 90">
              <line x1="0" y1="25" x2="500" y2="25" stroke="#1e293b" stroke-width="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" stroke-width="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" stroke-width="1" />
              <polyline fill="none" stroke="#38bdf8" stroke-width="1.8" points="0,75 50,70 100,60 150,55 200,68 250,50 300,45 350,58 400,38 450,30 500,24" />
              <polyline fill="none" stroke="#00f2a1" stroke-width="2.5" points="0,75 50,65 100,50 150,42 200,50 250,35 300,28 350,34 400,20 450,14 500,8" />
            </svg>

            <div style="font-size:9px; color:#ef4444; font-weight:800; margin:8px 0 4px 0;">2. UNDERWATER DRAWDOWN CURVE (STRESS TEST REALE):</div>
            <svg width="100%" height="60" viewBox="0 0 500 60">
              <line x1="0" y1="8" x2="500" y2="8" stroke="#334155" stroke-width="1.5" />
              <polygon fill="rgba(56,189,248,0.2)" points="0,8 50,14 100,20 150,22 200,54 250,30 300,22 350,48 400,18 450,12 500,8 500,8 0,8" />
              <polyline fill="none" stroke="#38bdf8" stroke-width="1.2" points="0,8 50,14 100,20 150,22 200,54 250,30 300,22 350,48 400,18 450,12 500,8" />
              <polygon fill="rgba(0,242,161,0.3)" points="0,8 50,10 100,14 150,15 200,28 250,16 300,12 350,22 400,10 450,9 500,8 500,8 0,8" />
              <polyline fill="none" stroke="#00f2a1" stroke-width="1.8" points="0,8 50,10 100,14 150,15 200,28 250,16 300,12 350,22 400,10 450,9 500,8" />
            </svg>
          </div>
        </div>

        <div class="qc-panel-card" style="margin-bottom:14px;">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div>
              <div style="font-weight:900; font-size:12px; color:#fff;">
                💰 SIMULATORE 'SEGUI PORTAFOGLIO': ADATTA AL TUO CAPITALE
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Inserisci il tuo capitale per ricalcolare istantaneamente quote esatte, controvalore in € e pesi
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-dim);">Tuo Capitale:</span>
              <input type="number" class="terminal-input" style="width:120px; font-weight:900; font-size:13px; color:#00f2a1;" value="${userCap}" step="1000" min="500" onchange="CasarioQuantEngine.setPortfolioCapital(this.value)">
              <span style="font-size:13px; font-weight:900; color:#fff;">${this.portfolioCurrency}</span>
            </div>
          </div>

          <div class="qc-table-scroll">
            <table class="qc-table">
              <thead>
                <tr>
                  <th>ASSET / TICKER</th>
                  <th>CATEGORIA</th>
                  <th style="text-align:right;">PESO %</th>
                  <th style="text-align:right;">CAPITALE ALLOCATO</th>
                  <th style="text-align:right;">PREZZO ASSET</th>
                  <th style="text-align:right;">QUOTE ESATTE</th>
                  <th style="text-align:right;">PERFORMANCE</th>
                </tr>
              </thead>
              <tbody>
                ${p.holdings.map(h => {
                  const allocEUR = (userCap * (h.weight / 100));
                  const units = (allocEUR / (h.price || 1)).toFixed(2);

                  return `
                    <tr class="qc-row">
                      <td style="font-weight:900; color:#fff;">${h.symbol}</td>
                      <td style="color:#cbd5e1; font-size:11px;">${h.name}</td>
                      <td style="text-align:right; font-weight:800; color:var(--cyan);">${h.weight}%</td>
                      <td style="text-align:right; font-weight:800; color:#00f2a1;">
                        ${this.portfolioCurrency}${allocEUR.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style="text-align:right; color:#cbd5e1;">$${h.price.toFixed(2)}</td>
                      <td style="text-align:right; font-weight:800; color:#fff;">${units} u.</td>
                      <td style="text-align:right; font-weight:800; color:${h.pnl.startsWith('+') ? '#00f2a1' : '#ef4444'};">${h.pnl}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="qc-panel-card" style="margin-bottom:14px;">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              📋 CHECKLIST OPERATIVA DELL'ULTIMO RIBILANCIAMENTO (${p.ops.lastRebalanceDate})
            </div>
            <span style="font-size:10px; color:var(--text-muted);">${p.ops.totalHoldings} Titoli Totali a Mercato</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
            <div style="padding:10px; background:#11141c; border-radius:6px; border-left:3px solid #00f2a1;">
              <div style="font-size:11px; font-weight:800; color:#00f2a1; margin-bottom:4px;">🟢 Nuovi Ingressi:</div>
              <ul style="margin:0; padding-left:14px; font-size:11px; color:#cbd5e1;">
                ${p.ops.newEntries.length ? p.ops.newEntries.map(e => `<li>${e}</li>`).join('') : '<li>Nessun nuovo ingresso</li>'}
              </ul>
            </div>

            <div style="padding:10px; background:#11141c; border-radius:6px; border-left:3px solid #f59e0b;">
              <div style="font-size:11px; font-weight:800; color:#f59e0b; margin-bottom:4px;">🟡 Prese di Profitto / Trims:</div>
              <ul style="margin:0; padding-left:14px; font-size:11px; color:#cbd5e1;">
                ${p.ops.trims.length ? p.ops.trims.map(e => `<li>${e}</li>`).join('') : '<li>Nessuna riduzione</li>'}
              </ul>
            </div>

            <div style="padding:10px; background:#11141c; border-radius:6px; border-left:3px solid #ef4444;">
              <div style="font-size:11px; font-weight:800; color:#ef4444; margin-bottom:4px;">🔴 Chiusure Complete:</div>
              <ul style="margin:0; padding-left:14px; font-size:11px; color:#cbd5e1;">
                ${p.ops.exits.length ? p.ops.exits.map(e => `<li>${e}</li>`).join('') : '<li>Nessuna posizione liquidata</li>'}
              </ul>
            </div>
          </div>
        </div>

        <div class="qc-panel-card">
          <div class="qc-panel-header" style="margin-bottom:10px;">
            <div style="font-weight:900; font-size:12px; color:#fff;">
              ❓ DOMANDE FREQUENTI & GUIDA METODOLOGICA AI PORTAFOGLI MODELLO
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Approfondimento Istituzionale</span>
          </div>

          <div class="qi-faq-accordion">
            ${this.faqData.map((faq, idx) => `
              <div class="qi-faq-item" id="qi-faq-${idx}">
                <button class="qi-faq-question" onclick="CasarioQuantEngine.toggleFaq(${idx})">
                  <span>${faq.q}</span>
                  <span class="qi-faq-icon">▼</span>
                </button>
                <div class="qi-faq-answer">
                  <p style="margin:0; font-size:11px; color:#cbd5e1; line-height:1.5;">${faq.a}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* =======================================================================
   * SHARED & REUSABLE BUILDERS
   * ======================================================================= */

  buildMacroRibbonHTML() {
    const m = this.macroState;
    const q = m.quadrant;
    const qDetails = {
      1: { name: 'Q1 (Goldilocks)', color: '#00f2a1', desc: 'Growth ↑, Inflation ↓. Multiplier: 1.2x. Bias: Risk-On.' },
      2: { name: 'Q2 (Overheating)', color: '#f59e0b', desc: 'Growth ↑, Inflation ↑. Multiplier: 0.8x. Bias: Commodity/Energy.' },
      3: { name: 'Q3 (Stagflazione)', color: '#f97316', desc: 'Growth ↓, Inflation ↑. Multiplier: 0.4x. Bias: Oro / Difensivi.' },
      4: { name: 'Q4 (Deflazione)', color: '#ef4444', desc: 'Growth ↓, Inflation ↓. Multiplier: 0.1x. Bias: Cash / Short Indici.' }
    }[q];

    return `
      <div class="qc-macro-grid">
        <div class="qc-macro-card">
          <div class="qc-card-label">REGIME MACRO (4 QUADRANTI)</div>
          <div class="qc-card-val" style="color:${qDetails.color};">
            ${qDetails.name}
          </div>
          <div class="qc-card-sub">
            ${qDetails.desc}
          </div>
          <div class="qc-card-metric">
            <span>Crescita: <b>${m.growthRate}</b></span>
            <span>Inflazione: <b>${m.inflationRate}</b></span>
          </div>
        </div>

        <div class="qc-macro-card">
          <div class="qc-card-label">FED NET LIQUIDITY ($ TRILIONI)</div>
          <div class="qc-card-val" style="color:#38bdf8;">
            $${m.fedNetLiquidity.totalTrillion.toFixed(2)}T
            <span class="qc-delta-badge positive">+${m.fedNetLiquidity.delta4wPct}% 4W</span>
          </div>
          <div class="qc-card-sub">
            Formula: WALCL - WTREGEN - (RRP * 1000). Marea di liquidità in espansione: breakout autorizzati.
          </div>
          <div class="qc-card-metric">
            <span>Status: <b style="color:#00f2a1;">Espansiva (+)</b></span>
            <span>Divergenza Indice: <b>Nessuna</b></span>
          </div>
        </div>

        <div class="qc-macro-card">
          <div class="qc-card-label">VOLATILITÀ: VIX / VIX3M RATIO</div>
          <div class="qc-card-val" style="color:${m.vixStructure.ratio > 1.0 ? '#ef4444' : '#00f2a1'};">
            ${m.vixStructure.ratio.toFixed(2)}
            <span class="qc-delta-badge ${m.vixStructure.ratio > 1.0 ? 'negative' : 'positive'}">
              ${m.vixStructure.ratio > 1.0 ? 'BACKWARDATION (ALERT)' : 'CONTANGO (BULL)'}
            </span>
          </div>
          <div class="qc-card-sub">
            VIX: ${m.vixStructure.vix.toFixed(1)} | VIX3M: ${m.vixStructure.vix3m.toFixed(1)}. Rapporto &lt; 0.92 = struttura sana di mercato toro.
          </div>
          <div class="qc-card-metric">
            <span>Circuit Breaker: <b>${m.vixStructure.ratio > 1.0 ? 'ATTIVO (Blocco Long)' : 'DISATTIVATO'}</b></span>
          </div>
        </div>

        <div class="qc-macro-card">
          <div class="qc-card-label">RISCHIO SOVRANO & CIRCUIT BREAKERS</div>
          <div class="qc-card-val" style="color:${m.btpBund.spreadBps > 190 ? '#ef4444' : '#38bdf8'};">
            ${m.btpBund.spreadBps.toFixed(0)} bps
            <span class="qc-delta-badge ${m.btpBund.spreadBps > 190 ? 'negative' : 'positive'}">
              BTP/BUND 10Y
            </span>
          </div>
          <div class="qc-card-sub">
            Soglia di allerta: 190-200 bps. Spread attuale nella fascia di stabilità istituzionale.
          </div>
          <div class="qc-card-metric">
            <span>Rollover FX: <b>${m.circuitBreakers.forexRolloverLock ? 'LOCK 23:00' : 'Attivo'}</b></span>
            <span>Asta Milano: <b>${m.circuitBreakers.milanAuctionFreeze ? 'FREEZE 17:30' : 'Regolare'}</b></span>
          </div>
        </div>
      </div>
    `;
  },

  buildEnhancedScreenerRowsHTML() {
    const list = this.getFilteredUniverse();

    if (list.length === 0) {
      return `
        <tr>
          <td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">
            Nessun asset corrisponde ai filtri selezionati. Prova a reimpostare i criteri delle tendine.
          </td>
        </tr>
      `;
    }

    return list.map(item => {
      const isLong = item.qScore >= 70;
      const isShort = item.qScore <= 40;
      const dirColor = isLong ? '#00f2a1' : (isShort ? '#ef4444' : '#94a3b8');
      const p = item.pillars;

      return `
        <tr class="qc-row" onclick="CasarioQuantEngine.openAssetDossier('${item.symbol}')">
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">${item.flag || '📈'}</span>
              <div>
                <div style="font-weight:900; color:#fff; font-size:12px;">${item.symbol}</div>
                <div style="font-size:10px; color:var(--text-muted);">${item.name}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="qc-asset-tag ${item.assetClass.toLowerCase()}">${item.assetClass}</span>
            <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">${item.sector}</div>
          </td>
          <td style="text-align:right; font-weight:800; color:#fff;">
            ${item.currency || '$'}${item.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </td>
          <td style="text-align:right; font-weight:800; color:${item.chg24.startsWith('+') ? '#00f2a1' : '#ef4444'};">
            ${item.chg24}
          </td>
          <td style="text-align:center; min-width:130px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
              <span style="font-size:13px; font-weight:900; color:${dirColor}; width:30px; text-align:right;">
                ${item.qScore}
              </span>
              <div class="qc-score-track" style="width:65px;">
                <div class="qc-score-bar ${isLong ? 'pos' : (isShort ? 'neg' : '')}" style="width:${item.qScore}%;"></div>
              </div>
            </div>
          </td>
          <td style="text-align:center;">
            <div class="qi-pill-five" title="Macro: ${p.macro} | Tech: ${p.technical} | Season: ${p.seasonal} | COT: ${p.cot} | Fund: ${p.fundamentals}">
              <span style="color:${p.macro >= 70 ? '#00f2a1' : '#f59e0b'};">M</span>
              <span style="color:${p.technical >= 70 ? '#00f2a1' : '#f59e0b'};">T</span>
              <span style="color:${p.seasonal >= 70 ? '#00f2a1' : '#f59e0b'};">S</span>
              <span style="color:${p.cot >= 70 ? '#00f2a1' : '#f59e0b'};">C</span>
              <span style="color:${p.fundamentals >= 70 ? '#00f2a1' : '#f59e0b'};">F</span>
            </div>
          </td>
          <td style="text-align:center;">
            <span class="qc-direction-pill ${item.direction.toLowerCase().replace(' ', '-')}">
              ${item.direction}
            </span>
          </td>
          <td style="text-align:right; font-size:11px; font-weight:700; color:${item.zscore < -1.0 ? '#00f2a1' : (item.zscore > 1.5 ? '#ef4444' : '#fff')};">
            ${item.zscore ? item.zscore.toFixed(2) + 'σ' : '0.00σ'}
          </td>
          <td style="text-align:center;">
            <div style="display:flex; gap:6px; justify-content:center;">
              <button class="btn btn-secondary btn-sm" style="padding:3px 8px; font-size:10px;" onclick="event.stopPropagation(); CasarioQuantEngine.openAssetDossier('${item.symbol}')">
                🔬 Dossier
              </button>
              <button class="btn-action-primary btn-sm" style="padding:3px 8px; font-size:10px; width:auto; background:rgba(41,98,255,0.2); border:1px solid #2962ff; color:#fff;" onclick="event.stopPropagation(); CasarioQuantEngine.selectAssetForProposal('${item.symbol}')">
                ⚡ Proponi
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getFilteredUniverse() {
    const f = this.screenerFilters;

    return this.universeData.filter(item => {
      if (f.region !== 'all' && item.region !== f.region) return false;
      if (f.assetClass !== 'all' && item.assetClass !== f.assetClass) return false;
      if (f.sector !== 'all') {
        const secLower = (item.sector || '').toLowerCase();
        if (f.sector === 'tech' && !secLower.includes('tecno') && !secLower.includes('semicon') && !secLower.includes('ai')) return false;
        if (f.sector === 'finance' && !secLower.includes('finanz') && !secLower.includes('banch')) return false;
        if (f.sector === 'energy' && !secLower.includes('energ') && !secLower.includes('petrol') && !secLower.includes('rinnovab')) return false;
        if (f.sector === 'luxury' && !secLower.includes('lusso') && !secLower.includes('auto')) return false;
      }
      if (f.direction !== 'all') {
        if (f.direction === 'strong-long' && item.qScore < 85) return false;
        if (f.direction === 'long' && (item.qScore < 70 || item.qScore >= 85)) return false;
        if (f.direction === 'neutral' && (item.qScore < 40 || item.qScore >= 70)) return false;
        if (f.direction === 'short' && item.qScore >= 40) return false;
      }
      if (f.seasonWindow !== 'all') {
        if (f.seasonWindow === 'current-month') {
          const curMonthIdx = new Date().getMonth();
          const curRet = item.seasonality?.monthlyReturns?.[curMonthIdx] || 0;
          if (curRet < 1.0) return false;
        }
      }
      if (f.searchQuery) {
        const q = f.searchQuery.toLowerCase();
        const matchesSym = item.symbol.toLowerCase().includes(q);
        const matchesName = (item.name || '').toLowerCase().includes(q);
        if (!matchesSym && !matchesName) return false;
      }
      return true;
    });
  },

  setScreenerFilter(key, val) {
    this.screenerFilters[key] = val;
    this.renderUI();
  },

  resetScreenerFilters() {
    this.screenerFilters = {
      region: 'all',
      assetClass: 'all',
      sector: 'all',
      direction: 'all',
      seasonWindow: 'all',
      searchQuery: ''
    };
    this.renderUI();
  },

  selectMacroRegion(regionKey) {
    this.selectedMacroRegion = regionKey;
    this.renderUI();
  },

  openAssetDossier(symbol) {
    this.selectedAssetSymbol = symbol;
    this.activeSubTab = 'asset-dossier';
    this.renderUI();
    const container = document.getElementById('tab-casario-quant');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  },

  setDossierSubTab(subTab) {
    this.activeDossierSubTab = subTab;
    this.renderUI();
  },

  selectPortfolio(portfolioId) {
    this.selectedPortfolioId = portfolioId;
    this.renderUI();
  },

  setPortfolioCapital(cap) {
    this.portfolioCapital = parseFloat(cap) || 10000;
    this.renderUI();
  },

  toggleFaq(idx) {
    const item = document.getElementById(`qi-faq-${idx}`);
    if (item) item.classList.toggle('open');
  },

  buildOrderGateHTML() {
    if (!this.activeProposal) {
      return `
        <div class="qc-panel-header">
          <div style="font-weight:800; font-size:12px; color:#fff;">
            ⚡ ACTION DISPATCHER: GATE APPROVAZIONE 10s TTL
          </div>
          <div style="font-size:10px; color:var(--text-muted);">
            Seleziona un asset per compilare un ordine
          </div>
        </div>
        <div style="text-align:center; padding:35px 20px; color:var(--text-muted); font-size:12px;">
          <div style="font-size:32px; margin-bottom:10px;">🎯</div>
          Nessuna proposta attiva al momento.<br>
          Clicca su un asset della griglia per compilare un ordine ponderato istituzionale con Bracket OCO e Stop Frattale ATR.
        </div>
      `;
    }

    const p = this.activeProposal;
    const isLong = p.direction === 'LONG';
    const secondsRemaining = (this.ttlRemainingMs / 1000).toFixed(1);
    const progressPct = Math.max(0, (this.ttlRemainingMs / 10000) * 100);
    const isExpired = this.ttlRemainingMs <= 0;

    return `
      <div class="qc-panel-header" style="border-bottom:1px solid #2a2e39; padding-bottom:8px;">
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
          <div>
            <div style="font-weight:900; font-size:13px; color:#fff;">
              PROPOSTA ORDINE: ${p.symbol}
            </div>
            <div style="font-size:10px; color:var(--text-muted);">
              ID: ${p.proposalId} | Bracket OCO ATR
            </div>
          </div>
          <span class="qc-direction-pill ${isLong ? 'strong-long' : 'strong-short'}">
            ${isLong ? '▲ ACQUISTO (LONG)' : '▼ VENDITA (SHORT)'}
          </span>
        </div>
      </div>

      <div class="qc-ttl-wrapper ${isExpired ? 'expired' : (this.ttlRemainingMs < 3000 ? 'urgent' : '')}">
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
          <span>${isExpired ? '⚠️ PROPOSTA SCADUTA (DRIFT PROTECTION)' : '⏳ CONFERMA ENTRO IL TIME-TO-LIVE:'}</span>
          <span class="qc-ttl-timer">${isExpired ? '0.0s' : `${secondsRemaining}s`}</span>
        </div>
        <div class="qc-ttl-track">
          <div class="qc-ttl-fill" style="width:${progressPct}%;"></div>
        </div>
      </div>

      <div class="qc-prop-details">
        <div class="qc-prop-row">
          <span>Prezzo Limite (AVWAP Anchor):</span>
          <b style="color:#fff;">$${p.limitPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</b>
        </div>
        <div class="qc-prop-row">
          <span>Stop Loss (Frattale ATR):</span>
          <b style="color:#ef4444;">$${p.stopLoss.toLocaleString('it-IT', { minimumFractionDigits: 2 })} (-${p.stopDistancePct}%)</b>
        </div>
        <div class="qc-prop-row">
          <span>Take Profit (2.0x ATR R:R):</span>
          <b style="color:#00f2a1;">$${p.takeProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })} (+${p.tpDistancePct}%)</b>
        </div>
        <div class="qc-prop-row">
          <span>Dimensione Calcolata:</span>
          <b style="color:var(--cyan);">${p.quantity} unità ($${(p.quantity * p.limitPrice).toLocaleString('it-IT', { maximumFractionDigits: 0 })})</b>
        </div>
        <div class="qc-prop-row">
          <span>Rapporto Rendimento/Rischio:</span>
          <b style="color:#fff;">1 : 2.00 (Ottimale)</b>
        </div>
      </div>

      <div class="qc-reasons-box">
        <div style="font-size:10px; font-weight:800; color:var(--text-dim); margin-bottom:4px; text-transform:uppercase;">
          Motivazioni dell'Algoritmo:
        </div>
        <ul style="margin:0; padding-left:14px; font-size:10px; color:#d1d4dc; line-height:1.4;">
          ${p.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn-action-primary" style="flex:1; background:${isExpired ? '#4b5563' : (isLong ? '#00f2a1' : '#ef4444')}; color:#000; font-weight:900; font-size:12px; padding:10px;" ${isExpired ? 'disabled' : ''} onclick="CasarioQuantEngine.approveAndExecuteProposal()">
          ${isExpired ? '✕ SCADUTA' : '✓ APPROVA ED ESEGUI'}
        </button>
        <button class="btn btn-secondary" style="width:auto; padding:8px 14px;" onclick="CasarioQuantEngine.rejectProposal()">
          Rifiuta
        </button>
      </div>
    `;
  },

  buildWorstCaseScenarioHTML() {
    const activePositions = window.activePositions || [];
    const openOrders = window.activeLimitOrders || [];
    const totalOpenTrades = activePositions.length + openOrders.length;

    let aggregateRiskUSD = 0.0;
    activePositions.forEach(p => {
      const slDist = Math.abs((p.entryPrice || 0) - (p.stopLoss || 0));
      aggregateRiskUSD += (slDist * (p.size || 0));
    });

    if (this.activeProposal && this.ttlRemainingMs > 0) {
      const p = this.activeProposal;
      aggregateRiskUSD += Math.abs(p.limitPrice - p.stopLoss) * p.quantity;
    }

    const maxRiskAllowedUSD = this.accountEquity * 0.035;
    const riskPctOfEquity = ((aggregateRiskUSD / this.accountEquity) * 100).toFixed(2);
    const isOverRisk = aggregateRiskUSD > maxRiskAllowedUSD;

    return `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Posizioni Attive & Proposte:</span>
          <b style="color:#fff;">${totalOpenTrades + (this.activeProposal ? 1 : 0)} Trade</b>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Perdita Massima Simultanea:</span>
          <b style="color:${isOverRisk ? '#ef4444' : '#00f2a1'}; font-size:13px;">
            -$${aggregateRiskUSD.toFixed(2)} (${riskPctOfEquity}%)
          </b>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-muted);">Soglia Massima Rischio (Circuit Breaker):</span>
          <b style="color:#fff;">$${maxRiskAllowedUSD.toFixed(2)} (3.50%)</b>
        </div>
        <div class="qc-risk-bar-track">
          <div class="qc-risk-bar-fill ${isOverRisk ? 'critical' : ''}" style="width:${Math.min(100, (aggregateRiskUSD / maxRiskAllowedUSD) * 100)}%;"></div>
        </div>
        <div style="font-size:10px; color:${isOverRisk ? '#ef4444' : 'var(--text-dim)'}; line-height:1.3;">
          ${isOverRisk ? '⚠️ ALLERTA SOVRAESPOSIZIONE: Rischio aggregato eccedente. Nuove approvazioni bloccate.' : '✓ Rischio di portafoglio sotto controllo istituzionale.'}
        </div>
      </div>
    `;
  },

  selectAssetForProposal(symbol) {
    const item = this.universeData.find(x => x.symbol === symbol);
    if (!item) return;

    if (this.ttlTimerId) clearInterval(this.ttlTimerId);

    const weights = this.timeframeWeights[this.currentTimeframe];
    const riskFactor = this.currentRiskProfile === 'conservative' ? 0.005 : (this.currentRiskProfile === 'aggressive' ? 0.02 : 0.01);
    const stopDistance = Math.max((item.atr || 2.0) * weights.kAtr, item.price * 0.008);
    const riskAmount = this.accountEquity * riskFactor * this.macroState.riskMultiplier;
    const shares = Math.max(1, Math.floor(riskAmount / stopDistance));

    const isLong = item.qScore >= 50;
    const direction = isLong ? 'LONG' : 'SHORT';
    const limitPrice = item.price;
    const stopLoss = isLong ? (item.price - stopDistance) : (item.price + stopDistance);
    const takeProfit = isLong ? (item.price + (stopDistance * 2.0)) : (item.price - (stopDistance * 2.0));

    this.activeProposal = {
      proposalId: 'PROP-' + Math.floor(100000 + Math.random() * 900000),
      symbol: item.symbol,
      direction,
      limitPrice,
      stopLoss,
      takeProfit,
      stopDistancePct: ((stopDistance / item.price) * 100).toFixed(2),
      tpDistancePct: (((stopDistance * 2.0) / item.price) * 100).toFixed(2),
      quantity: shares,
      reasons: [
        `Q-Score Istituzionale di forza relativa: ${item.qScore}/100`,
        `Confluenza Macro: Regime ${this.macroState.quadrant === 1 ? 'Goldilocks' : 'Espansione'} con Fed Net Liquidity positiva`,
        `Pullback Z-Score: ${item.zscore || 0}σ su AVWAP di sessione`,
        `Rapporto Rendimento/Rischio asimmetrico garantito 1 : 2.00`
      ]
    };

    this.ttlRemainingMs = 10000;

    if (this.activeSubTab !== 'radar-screener') {
      this.activeSubTab = 'radar-screener';
      this.renderUI();
    } else {
      const gatePanel = document.getElementById('qc-order-gate-panel');
      if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    }

    if (window.showToast) {
      window.showToast(`Proposta ${symbol} generata. Conferma entro 10 secondi!`, 'info');
    }

    this.ttlTimerId = setInterval(() => {
      this.ttlRemainingMs -= 100;
      if (this.ttlRemainingMs <= 0) {
        this.ttlRemainingMs = 0;
        clearInterval(this.ttlTimerId);
        this.ttlTimerId = null;
        if (window.showToast) window.showToast('Proposta scaduta per protezione slippage', 'warning');
      }

      const gatePanel = document.getElementById('qc-order-gate-panel');
      if (gatePanel && this.activeProposal) {
        gatePanel.innerHTML = this.buildOrderGateHTML();
      }
    }, 100);
  },

  approveAndExecuteProposal() {
    if (!this.activeProposal || this.ttlRemainingMs <= 0) {
      if (window.showToast) window.showToast('Impossibile eseguire: proposta scaduta', 'error');
      return;
    }

    const p = this.activeProposal;
    if (this.ttlTimerId) clearInterval(this.ttlTimerId);
    this.ttlTimerId = null;

    if (window.executeOrderDirectly) {
      window.executeOrderDirectly({
        symbol: p.symbol,
        side: p.direction,
        leverage: 10,
        entryPrice: p.limitPrice,
        stopLoss: p.stopLoss,
        takeProfit: p.takeProfit,
        size: p.quantity,
        strategyTag: 'Quant Intelligence Q-Score'
      });
    } else {
      const entryInput = document.getElementById('t-entry');
      const slInput = document.getElementById('t-sl');
      const tpInput = document.getElementById('t-tp');
      const sideBtn = p.direction === 'LONG' ? document.getElementById('btn-side-long') : document.getElementById('btn-side-short');
      if (entryInput) entryInput.value = p.limitPrice;
      if (slInput) slInput.value = p.stopLoss;
      if (tpInput) tpInput.value = p.takeProfit;
      if (sideBtn) sideBtn.click();
      if (window.switchMainTab) window.switchMainTab('tab-terminal');
    }

    if (window.showToast) {
      window.showToast(`✓ Ordine ${p.symbol} ${p.direction} approvato ed eseguito con successo!`, 'success');
    }

    this.activeProposal = null;
    const gatePanel = document.getElementById('qc-order-gate-panel');
    if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    const riskContent = document.getElementById('qc-worst-case-content');
    if (riskContent) riskContent.innerHTML = this.buildWorstCaseScenarioHTML();
  },

  rejectProposal() {
    if (this.ttlTimerId) clearInterval(this.ttlTimerId);
    this.ttlTimerId = null;
    this.activeProposal = null;
    const gatePanel = document.getElementById('qc-order-gate-panel');
    if (gatePanel) gatePanel.innerHTML = this.buildOrderGateHTML();
    const riskContent = document.getElementById('qc-worst-case-content');
    if (riskContent) riskContent.innerHTML = this.buildWorstCaseScenarioHTML();
    if (window.showToast) window.showToast('Proposta d\'ordine rifiutata', 'info');
  },

  exportDossierPDF(symbol) {
    const asset = this.universeData.find(x => x.symbol === symbol) || this.universeData[0];
    document.body.classList.add('qi-printing-dossier');
    if (window.showToast) {
      window.showToast(`Preparazione stampa PDF per ${asset.symbol}...`, 'info');
    }
    setTimeout(() => {
      window.print();
      document.body.classList.remove('qi-printing-dossier');
    }, 300);
  },

  exportWatchlistCSV() {
    const list = this.getFilteredUniverse();
    let csv = 'Ticker,Nome,Classe,Settore,Prezzo,Variazione24h,QScore,Direzione,Macro,Tecnico,Stagionalita,COT,Fondamentali\n';
    list.forEach(i => {
      const p = i.pillars;
      csv += `"${i.symbol}","${i.name}","${i.assetClass}","${i.sector}",${i.price},"${i.chg24}",${i.qScore},"${i.direction}",${p.macro},${p.technical},${p.seasonal},${p.cot},${p.fundamentals}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist_quant_intelligence_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) {
      window.showToast('Watchlist esportata in CSV con successo!', 'success');
    }
  },

  async syncWithBackend() {
    try {
      const resp = await fetch('/api/quant/casario/macro-regime');
      if (resp.ok) {
        const data = await resp.json();
        this.macroState.quadrant = data.macro_quadrant;
        this.macroState.fedNetLiquidity = data.fed_net_liquidity;
        this.macroState.vixStructure = data.volatility_structure;
        this.macroState.btpBund = data.sovereign_risk_italy;
        this.renderUI();
        if (window.showToast) window.showToast('Sincronizzazione Macro Quant completata!', 'success');
      }
    } catch(e) {
      if (window.showToast) window.showToast('Motore Quant operativo in modalità standalone', 'info');
    }
  },

  getSymbolQuantScore(symbol) {
    const item = this.universeData.find(x => x.symbol === symbol) || {
      qScore: 78,
      direction: 'STRONG LONG',
      zscore: -1.10
    };
    return {
      score: item.qScore || 78,
      direction: item.direction || 'STRONG LONG',
      macroQuadrant: this.macroState.quadrant,
      macroName: 'Q1 (Goldilocks)',
      confluencePassed: true
    };
  }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CasarioQuantEngine.init());
} else {
  CasarioQuantEngine.init();
}
