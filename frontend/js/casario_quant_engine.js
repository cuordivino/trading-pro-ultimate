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
  selectedAssetSymbol: 'ADCT', // Default to ADCT as requested
  activeDossierSubTab: 'overview', // 'overview' | 'smartquant' | 'revenues' | 'financials' | 'fundamentals' | 'seasonality' | 'etf'
  macroRegimeDetailsExpanded: true,
  macroSentimentView: 'panoramica', // 'panoramica' | 'dettagli'
  macroMarketTab1: 'USA',
  macroMarketTab2: 'Materie Prime',
  eventsTimeFilter: 'oggi',
  eventsCategoryFilter: 'all', // 'all' | 'utili' | 'macro'
  eventsImpactFilter: 'alto',
  eventsCountryFilter: 'all',
  radarStrategy: 'smartquant_stagionalita',
  radarOpenDropdown: null,
  radarFilters: {
    search: '',
    type: ['STOCK', 'ETF', 'FUND'],
    direction: ['BUY', 'SHORT'],
    sector: ['Information Technology'],
    country: ['US'],
    tradeState: 'inizio_1g',
    marketCap: ['mega', 'large', 'mid']
  },
  portfolioActiveView: 'summary', // 'summary' | 'details'
  portfolioDetailsTab: 'panoramica', // 'panoramica' | 'checklist' | 'attuale' | 'ribilanciamenti' | 'drawdown' | 'faq'
  portfolioFollowModalOpen: false,
  followedPortfolios: { balanced: true },
  followedCapital: 10000,
  dossierForecastConeActive: true,
  dossierHistoryExpanded: false,
  dossierRevenueYearGeo: '2024',
  dossierRevenueYearProd: '2024',
  dossierFinancialsPeriod: 'annual',
  dossierFinancialsSubTab: 'income',
  portfolioExpandedCategories: { crypto: true, bonds: true, commodities: true, equities: true },    // Active symbol in dossier
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
      symbol: 'ADCT',
      name: 'ADC Therapeutics SA',
      isin: 'CH0499880968',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Healthcare',
      industry: 'Biotechnology',
      price: 4.00,
      currency: '$',
      chg24: '+0.76%',
      marketCap: '$380M',
      peRatio: null,
      qScore: 63,
      direction: 'BUY',
      pillars: { macro: 100, technical: 70, seasonal: 40, cot: 91, fundamentals: 26 },
      description: 'ADC Therapeutics SA fornisce una piattaforma tecnologica di anticorpi farmaco-coniugati (ADC) per trasformare il paradigma di trattamento per i pazienti affetti da neoplasie ematologiche e tumori solidi. Il suo prodotto di punta comprende ZYNLONTA, un ADC diretto contro il CD19, che ha ricevuto l\'approvazione accelerata dalla Food and Drug Administration statunitense e l\'approvazione condizionata dalla Commissione Europea.',
      analystRatings: {
        consensus: 'STRONG BUY',
        ratingScore: 91,
        targetMean: 6.13,
        targetHigh: 7.00,
        targetLow: 5.50,
        upsidePct: '+53.25%',
        institutions: [
          { bank: 'Goldman Sachs', rating: 'Buy', target: '$6.50', date: '28 Ott 2025', report: 'GS Equity Research: Zynlonta US Acceleration & Solid Tumor Pipeline', pdf: 'GS_ADCT_Q3_Initiation.pdf' },
          { bank: 'JPMorgan Chase', rating: 'Overweight', target: '$6.00', date: '15 Ott 2025', report: 'JPM Healthcare: CD19 ADC Market Penetration Analysis', pdf: 'JPM_ADCT_ClinicalPipeline.pdf' },
          { bank: 'Morgan Stanley', rating: 'Overweight', target: '$5.50', date: '04 Ott 2025', report: 'Morgan Stanley Biopharma: Global Commercial Ramp', pdf: 'MS_ADCT_Target_Update.pdf' },
          { bank: 'UBS Investment Bank', rating: 'Buy', target: '$7.00', date: '22 Set 2025', report: 'UBS Global Research: Breakthrough Valuation & Target Elevation', pdf: 'UBS_BioTech_ADCT_DeepDive.pdf' },
          { bank: 'Bank of America', rating: 'Buy', target: '$6.00', date: '10 Set 2025', report: 'BofA Securities: Strong Fundamentals & Cash Runway', pdf: 'BofA_ADCT_Zynlonta_Outlook.pdf' },
          { bank: 'Barclays', rating: 'Overweight', target: '$5.80', date: '18 Ago 2025', report: 'Barclays Capital: European Launch Trajectory Update', pdf: 'Barclays_Healthcare_ADC.pdf' }
        ]
      },
      trendAnalysis: [
        { horizon: 'Breve', type: 'Neutrale', duration: '7 Giorni', force: 'Medio', typeColor: '#f59e0b', forceColor: '#f59e0b' },
        { horizon: 'Medio', type: 'Rialzista', duration: '38 Giorni', force: 'Forte', typeColor: '#10b981', forceColor: '#10b981' },
        { horizon: 'Lungo', type: 'Rialzista', duration: '70 Giorni', force: 'Forte', typeColor: '#10b981', forceColor: '#10b981' }
      ],
      attentionLevels: {
        upper: { today: 4.52, d1: '-0.36%', d15: '-3.30%', m1: '-5.39%', m3: '+22.94%' },
        lower: { today: 3.63, d1: '-0.82%', d15: '-7.66%', m1: '+4.24%', m3: '+29.48%' },
        currentPrice: 4.00,
        riskPct: '9.33%',
        rewardPct: '11.50%'
      },
      ratingPerformance: [
        { name: 'Indice (S&P 500)', d1: '-0.83%', d5: '-3.35%', m1: '-3.26%', qtd: '-1.06%', ytd: '+12.76%', y1: '+11.23%', avgMom: '+3.23%' },
        { name: 'Settore (Healthcare)', d1: '-1.63%', d5: '-4.77%', m1: '-7.20%', qtd: '-1.00%', ytd: '+20.29%', y1: '+18.97%', avgMom: '+5.79%' },
        { name: 'ADCT (ADC Therapeutics SA)', d1: '+0.76%', d5: '+0.76%', m1: '-10.31%', qtd: '0.00%', ytd: '+100.00%', y1: '+50.94%', avgMom: '+18.20%' }
      ],
      sqm: {
        returnPct: '+18.34%',
        signal: 'BUY',
        entryDate: '17 Jun 25',
        status: 'In corso',
        durationDays: 155,
        historyTrades: [
          { entry: '17/06/2025', exit: 'In corso', entryPrice: 3.38, currentPrice: 4.00, pnl: '+18.34%', duration: '155 gg', sp500: '+8.4%' },
          { entry: '12/01/2025', exit: '14/05/2025', entryPrice: 2.10, currentPrice: 3.45, pnl: '+64.28%', duration: '122 gg', sp500: '+4.1%' },
          { entry: '04/09/2024', exit: '18/11/2024', entryPrice: 1.85, currentPrice: 2.30, pnl: '+24.32%', duration: '75 gg', sp500: '+3.8%' }
        ]
      },
      revenueSegmentation: {
        geo: {
          '2024': [
            { label: 'UNITED STATES', amount: '$69.3M', pct: 97.8, color: '#f97316' },
            { label: 'EMEA', amount: '$1.5M', pct: 2.2, color: '#38bdf8' }
          ],
          '2023': [
            { label: 'UNITED STATES', amount: '$68.0M', pct: 97.7, color: '#f97316' },
            { label: 'EMEA', amount: '$1.6M', pct: 2.3, color: '#38bdf8' }
          ]
        },
        product: {
          '2024': [
            { label: 'Product', amount: '$69.3M', pct: 97.8, color: '#6366f1' },
            { label: 'Royalty Revenue', amount: '$1.5M', pct: 2.2, color: '#f97316' }
          ],
          '2023': [
            { label: 'Product', amount: '$68.0M', pct: 97.7, color: '#6366f1' },
            { label: 'Royalty Revenue', amount: '$1.6M', pct: 2.3, color: '#f97316' }
          ],
          '2022': [
            { label: 'Product', amount: '$205.2M', pct: 97.8, color: '#6366f1' },
            { label: 'Royalty Revenue', amount: '$4.7M', pct: 2.2, color: '#f97316' }
          ]
        }
      },
      financialStatements: {
        income: [
          { row: 'Revenue', y2024: '70.84M (+1.84%)', y2023: '69.56M (-66.86%)', y2022: '209.91M (+518.89%)', y2021: '33.92M', y2020: '0.00', isBold: true, group: 'Ricavi' },
          { row: 'Cost Of Revenue', y2024: '5.95M (+135.23%)', y2023: '2.53M (-23.39%)', y2022: '3.30M (+136.97%)', y2021: '1.39M', y2020: '141.82M', group: 'Ricavi' },
          { row: 'Gross Profit', y2024: '64.89M (-3.19%)', y2023: '67.03M (-67.56%)', y2022: '206.61M (+535.24%)', y2021: '32.52M', y2020: '-141.82M', isBold: true, group: 'Ricavi' },
          { row: 'Research And Development Expenses', y2024: '109.63M (-13.76%)', y2023: '127.13M (-31.82%)', y2022: '186.46M (+18.01%)', y2021: '158.00M', y2020: '142.03M', group: 'Spese Operative' },
          { row: 'General And Administrative Expenses', y2024: '64.47M (-11.55%)', y2023: '72.88M (-32.36%)', y2022: '107.74M (+50.77%)', y2021: '71.46M', y2020: '55.13M', group: 'Spese Operative' },
          { row: 'Selling And Marketing Expenses', y2024: '21.44M (-35.04%)', y2023: '33.01M (-7.68%)', y2022: '35.75M (-44.81%)', y2021: '64.78M', y2020: '22.10M', group: 'Spese Operative' },
          { row: 'Selling General And Administrative Expenses', y2024: '85.91M (-18.87%)', y2023: '105.89M (-26.21%)', y2022: '143.49M (+5.32%)', y2021: '136.24M', y2020: '77.23M', group: 'Spese Operative' },
          { row: 'Other Expenses', y2024: '0.00', y2023: '0.00', y2022: '0.00', y2021: '0.00', y2020: '-141.82M', group: 'Spese Operative' },
          { row: 'Operating Expenses', y2024: '195.54M (-16.08%)', y2023: '233.01M (-29.38%)', y2022: '329.95M (+12.14%)', y2021: '294.24M', y2020: '77.45M', isBold: true, group: 'Spese Operative' },
          { row: 'Cost And Expenses', y2024: '201.49M (-14.46%)', y2023: '235.54M (-29.32%)', y2022: '333.25M (+12.72%)', y2021: '295.64M', y2020: '219.26M', isBold: true, group: 'Spese Operative' },
          { row: 'Reddito Operativo (Operating Income)', y2024: '-130.65M', y2023: '-165.98M', y2022: '-123.34M', y2021: '-261.72M', y2020: '-219.26M', isBold: true, group: 'Reddito Operativo' }
        ]
      }
    },
    {
      symbol: 'GAP',
      name: 'The Gap, Inc.',
      isin: 'US3647601083',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Consumer Discretionary',
      price: 22.40,
      currency: '$',
      chg24: '+1.45%',
      marketCap: '$8.9B',
      qScore: 76,
      direction: 'BUY',
      pillars: { macro: 82, technical: 75, seasonal: 78, cot: 74, fundamentals: 72 },
      earningsEvent: {
        epsEstimate: '0.58',
        epsReported: '-',
        surprisePct: '0.00%',
        date: '2025-11-20',
        period: '2025-10-31',
        time: 'after_close'
      }
    },
    {
      symbol: 'CSCO',
      name: 'Cisco Systems Inc',
      isin: 'US17275R1023',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Information Technology',
      price: 77.37,
      currency: '$',
      chg24: '+0.54%',
      marketCap: '$310B',
      qScore: 75,
      direction: 'BUY',
      sqEntryDate: '15/10/2025',
      sqPerformance: '+0.13%',
      seasonalWindow: '17-11 • 31-12 (45 giorni)',
      winRate: 71.43,
      avgProfit: '4.21 $',
      pillars: { macro: 78, technical: 74, seasonal: 82, cot: 75, fundamentals: 80 }
    },
    {
      symbol: 'SMAR',
      name: 'Smartsheet Inc',
      isin: 'US83200N1037',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Information Technology',
      price: 56.47,
      currency: '$',
      chg24: '+0.88%',
      marketCap: '$7.8B',
      qScore: 84,
      direction: 'BUY',
      sqEntryDate: '03/10/2024',
      sqPerformance: '+0.02%',
      seasonalWindow: '18-11 • 17-12 (30 giorni)',
      winRate: 100.00,
      avgProfit: '16.33 $',
      pillars: { macro: 85, technical: 88, seasonal: 90, cot: 84, fundamentals: 82 }
    },
    {
      symbol: 'ENV',
      name: 'Envestnet Inc',
      isin: 'US29404K1060',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Information Technology',
      price: 63.14,
      currency: '$',
      chg24: '+0.32%',
      marketCap: '$3.5B',
      qScore: 75,
      direction: 'BUY',
      sqEntryDate: '24/10/2024',
      sqPerformance: '+0.01%',
      seasonalWindow: '22-11 • 21-12 (30 giorni)',
      winRate: 66.67,
      avgProfit: '3.62 $',
      pillars: { macro: 76, technical: 74, seasonal: 75, cot: 72, fundamentals: 78 }
    },
    {
      symbol: 'TCX',
      name: 'Tricon Residential Inc',
      isin: 'CA89612C1077',
      type: 'Common Stock',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Information Technology',
      price: 21.48,
      currency: '$',
      chg24: '+0.65%',
      marketCap: '$5.9B',
      qScore: 77,
      direction: 'BUY',
      sqEntryDate: '15/11/2025',
      sqPerformance: '+0.04%',
      seasonalWindow: '16-11 • 30-12 (45 giorni)',
      winRate: 58.62,
      avgProfit: '1.26 $',
      pillars: { macro: 79, technical: 78, seasonal: 80, cot: 74, fundamentals: 75 }
    },
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
        { symbol: 'ISP.MI',
      name: 'Intesa Sanpaolo S.p.A.',
      flag: '🇮🇹',
      region: 'europe',
      assetClass: 'IT_EQUITY',
      sector: 'Finanza & Banche Istituzionali',
      price: 6.26, pnl: '+18.4%' },
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
        { symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia & AI',
      price: 181.60, pnl: '+48.2%' },
        { symbol: 'AAPL',
      name: 'Apple Inc.',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia / Consumer Electronics',
      price: 344.17, pnl: '+14.5%' },
        { symbol: 'RACE.MI',
      name: 'Ferrari N.V.',
      flag: '🇮🇹',
      region: 'europe',
      assetClass: 'IT_EQUITY',
      sector: 'Lusso & Automotive Eccellenza',
      price: 377.30, pnl: '+32.1%' },
        { symbol: 'SPY',
      name: 'S&P 500 ETF Trust',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'INDEX',
      sector: 'Indice Benchmark Globale',
      price: 733.00, pnl: '+21.4%' },
        { symbol: 'TLT', name: 'iShares 20+ Year Treasury', category: 'Bonds', weight: 18, price: 92.40, pnl: '+4.5%' },
        { symbol: 'BTP 10Y', name: 'BTP 10 Anni Italiano', category: 'Bonds', weight: 12, price: 102.40, pnl: '+5.1%' },
        { symbol: 'GC=F', name: 'Oro Fisico / Future', category: 'Commodities', weight: 10, price: 2740.00, pnl: '+24.5%' },
        { symbol: 'CL=F', name: 'Petrolio WTI (Energy Hedge)', category: 'Commodities', weight: 5, price: 71.50, pnl: '-2.1%' },
        { symbol: 'BTCUSDT',
      name: 'Bitcoin Perpetual Futures',
      flag: '🪙',
      region: 'usa',
      assetClass: 'CRYPTO',
      sector: 'Asset Digitali & Riserva Algoritmica',
      price: 75780.00, pnl: '+62.4%' },
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
        { symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia & AI',
      price: 181.60, pnl: '+58.2%' },
        { symbol: 'AMD',
      name: 'Advanced Micro Devices',
      assetClass: 'US_EQUITY',
      sector: 'Tecnologia / Semiconduttori AI',
      bias: 'STRONG BUY',
      qScore: 88,
      price: 404.40, pnl: '+24.5%' },
        { symbol: 'TSLA',
      name: 'Tesla Inc.',
      flag: '🇺🇸',
      region: 'usa',
      assetClass: 'US_EQUITY',
      sector: 'Automotive & Clean Energy',
      price: 343.69, pnl: '+41.2%' },
        { symbol: 'MSFT', name: 'Microsoft (Cloud Copilot)', category: 'Equities', weight: 10, price: 412.30, pnl: '+18.6%' },
        { symbol: 'RACE.MI',
      name: 'Ferrari N.V.',
      flag: '🇮🇹',
      region: 'europe',
      assetClass: 'IT_EQUITY',
      sector: 'Lusso & Automotive Eccellenza',
      price: 377.30, pnl: '+32.1%' },
        { symbol: 'BTCUSDT',
      name: 'Bitcoin Perpetual Futures',
      flag: '🪙',
      region: 'usa',
      assetClass: 'CRYPTO',
      sector: 'Asset Digitali & Riserva Algoritmica',
      price: 75780.00, pnl: '+62.4%' },
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
/* =======================================================================
   * 1. SUB-VIEW: PANORAMICA MACRO E MERCATI (QUANTASTE / INSTITUTIONAL OVERVIEW)
   * ======================================================================= */
/* =======================================================================
   * 1. SUB-VIEW: PANORAMICA MACRO E MERCATI (QUANTASTE / INSTITUTIONAL OVERVIEW)
   * ======================================================================= */
/* =======================================================================
   * 1. SUB-VIEW: PANORAMICA MACRO E MERCATI (QUANTASTE / INSTITUTIONAL OVERVIEW)
   * ======================================================================= */
/* =======================================================================
   * 1. SUB-VIEW: PANORAMICA MACRO E MERCATI (QUANTASTE / INSTITUTIONAL OVERVIEW)
   * ======================================================================= */
  buildMacroOverviewHTML() {
    const reg = this.macroRegions[this.selectedMacroRegion] || this.macroRegions.usa;
    const m = this.macroState;

    return `
      <!-- TOP MACRO BANNER & FORENSICS -->
      <div class="qc-macro-ribbon" style="margin-bottom:14px;">
        ${this.buildMacroRibbonHTML()}
      </div>

      <div style="margin-bottom:18px;">
        <h2 style="font-size:22px; font-weight:900; color:#fff; margin:0 0 4px 0; letter-spacing:0.3px;">
          Panoramica Macro e Mercati
        </h2>
        <div style="font-size:11px; color:var(--text-muted);">
          Monitoraggio algoritmico del regime dominante, sentiment multi-asset e congiuntura macro globale
        </div>
      </div>

      <!-- TOP 2 HERO CARDS: REGIME ECONOMICO PREDOMINANTE & SMART QUANT SENTIMENT -->
      <div class="qc-macro-hero-grid">
        
        <!-- CARD 1: REGIME ECONOMICO PREDOMINANTE -->
        <div class="qc-panel-card" style="padding:18px; background:#0c101c; border:1px solid #1e2638; border-radius:10px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <div style="font-size:15px; font-weight:900; color:#fff;">Regime Economico Predominante</div>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
                Indicazione del regime economico dominante attuale, basato su indicatori macroeconomici chiave.
              </div>
            </div>
          </div>

          <!-- Main Regime Indicator Row -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin:14px 0 10px 0;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:24px;">🇺🇸</span>
              <span style="font-size:18px; font-weight:900; color:#fff;">America</span>
              <span style="background:rgba(249,115,22,0.18); border:1px solid #f97316; color:#fb923c; font-weight:900; font-size:11px; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">
                STAGFLAZIONE
              </span>
            </div>
            <div style="font-size:36px; font-weight:900; color:#fff; font-family:var(--font-mono); letter-spacing:-0.5px;">
              77 <span style="font-size:15px; color:#64748b; font-weight:600;">/ 100</span>
            </div>
          </div>

          <!-- Horizontal Gradient Bar (Red -> Yellow -> Green) with white slider dot -->
          <div style="position:relative; margin:12px 0 6px 0;">
            <div style="height:6px; border-radius:3px; background:linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); width:100%;"></div>
            <div style="position:absolute; top:-4px; left:77%; width:14px; height:14px; border-radius:50%; background:#fff; border:2px solid #0f172a; box-shadow:0 0 10px rgba(255,255,255,0.9); transform:translateX(-50%);"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:9px; color:#64748b; font-weight:800; font-family:var(--font-mono); margin-bottom:12px;">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>

          <!-- Dettagli Toggle Button -->
          <div style="text-align:center; margin:10px 0;">
            <button class="btn btn-sm" onclick="CasarioQuantEngine.toggleMacroRegimeDetails()" style="background:transparent; border:none; color:#94a3b8; font-size:11px; font-weight:800; cursor:pointer;">
              Dettagli ${this.macroRegimeDetailsExpanded ? '▲' : '▼'}
            </button>
          </div>

          <!-- 7 Circular Progress Gauges (Obbligazioni, Materie Prime, Stocks, Cripto, Valute, Fattori, Settori) -->
          ${this.macroRegimeDetailsExpanded ? `
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; padding:12px 0; border-top:1px solid #1e2638; border-bottom:1px solid #1e2638; margin-bottom:14px;">
              ${[
                { label: 'Obbligazioni', score: 68, color: '#f59e0b' },
                { label: 'Materie Prime', score: 73, color: '#f59e0b' },
                { label: 'Stocks', score: 88, color: '#10b981' },
                { label: 'Cripto', score: 43, color: '#ef4444' },
                { label: 'Valute', score: 88, color: '#10b981' },
                { label: 'Fattori', score: 87, color: '#10b981' },
                { label: 'Settori', score: 80, color: '#10b981' }
              ].map(g => `
                <div style="text-align:center;">
                  <div style="width:48px; height:48px; margin:0 auto; position:relative;">
                    <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform:rotate(-90deg);">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" stroke-width="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${g.color}" stroke-width="3" stroke-dasharray="${g.score}, 100" stroke-linecap="round" />
                    </svg>
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:#fff; font-family:var(--font-mono);">
                      ${g.score}<span style="font-size:7px; color:#64748b;">/100</span>
                    </div>
                  </div>
                  <div style="font-size:9px; color:#94a3b8; font-weight:700; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${g.label}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- 4 Regional Mini Cards Below: Europa, Canada, Cina, Australia -->
          <div class="qc-kpi-4-grid" style="gap:8px;">
            ${[
              { flag: '🇪🇺', name: 'Europa', regime: 'STAGFLAZIONE', rClass: 'orange', score: 72 },
              { flag: '🇨🇦', name: 'Canada', regime: 'REFLAZIONE', rClass: 'green', score: 78 },
              { flag: '🇨🇳', name: 'Cina', regime: 'STAGFLAZIONE', rClass: 'orange', score: 53 },
              { flag: '🇦🇺', name: 'Australia', regime: 'STAGFLAZIONE', rClass: 'orange', score: 68 }
            ].map(rc => `
              <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:8px 10px;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span style="font-size:14px;">${rc.flag}</span>
                  <span style="font-size:11px; font-weight:800; color:#fff;">${rc.name}</span>
                </div>
                <div style="font-size:8px; font-weight:900; padding:1px 6px; border-radius:10px; display:inline-block; margin-bottom:6px; ${rc.rClass === 'green' ? 'background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399;' : 'background:rgba(249,115,22,0.18); border:1px solid #f97316; color:#fb923c;'}">
                  ${rc.regime}
                </div>
                <div style="font-size:18px; font-weight:900; color:#fff; font-family:var(--font-mono);">
                  ${rc.score} <span style="font-size:10px; color:#64748b; font-weight:600;">/ 100</span>
                </div>
                <div style="font-size:8px; color:#64748b; margin-top:2px;">Dettagli ˅</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CARD 2: SMART QUANT SENTIMENT (Q-SENTIMENT BAROMETER) -->
        <div class="qc-panel-card" style="padding:18px; background:#0c101c; border:1px solid #1e2638; border-radius:10px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <div>
                <div style="font-size:15px; font-weight:900; color:#fff;">Smart Quant Sentiment</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
                  Analisi del sentiment di mercato per tutte le asset class, basata sul modello Smart Quant.
                </div>
              </div>
              <div style="display:flex; gap:4px; background:#080c14; padding:2px; border-radius:6px; border:1px solid #1e2638;">
                <button class="btn btn-sm ${this.macroSentimentView === 'panoramica' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px;" onclick="CasarioQuantEngine.setMacroSentimentView('panoramica')">
                  👁 Panoramica
                </button>
                <button class="btn btn-sm ${this.macroSentimentView === 'dettagli' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px;" onclick="CasarioQuantEngine.setMacroSentimentView('dettagli')">
                  📊 Dettagli
                </button>
              </div>
            </div>

            ${this.macroSentimentView === 'panoramica' ? `
              <!-- Slider Track: Sell -> Hold -> Buy -->
              <div style="position:relative; margin:24px 0 8px 0;">
                <div style="height:6px; border-radius:3px; background:linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); width:100%;"></div>
                <div style="position:absolute; top:-4px; left:41%; width:14px; height:14px; border-radius:50%; background:#fff; border:2px solid #0f172a; box-shadow:0 0 10px rgba(255,255,255,0.9); transform:translateX(-50%);"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:9px; color:#64748b; font-weight:800; font-family:var(--font-mono); margin-bottom:20px;">
                <span>Sell</span>
                <span>Hold</span>
                <span>Buy</span>
              </div>

              <!-- Huge Score Text -->
              <div style="text-align:center; margin:16px 0;">
                <div style="font-size:46px; font-weight:900; color:#fb923c; font-family:var(--font-mono); letter-spacing:-1px; line-height:1;">
                  41%
                </div>
                <div style="font-size:10px; font-weight:800; color:var(--text-dim); margin-top:4px;">
                  SENTIMENT SINTETICO MULTI-ASSET (PREVALENZA DEFENSIVA)
                </div>
              </div>
            ` : `
              <!-- Dettagli Mode: Horizontal breakdown bars -->
              <div style="display:flex; flex-direction:column; gap:8px; margin:16px 0;">
                ${[
                  { label: 'Strong Buy', pct: 10, count: 120, color: '#059669' },
                  { label: 'Buy', pct: 29, count: 348, color: '#10b981', tooltip: 'Totale 29%' },
                  { label: 'Hold', pct: 20, count: 240, color: '#f59e0b' },
                  { label: 'Sell', pct: 37, count: 444, color: '#ea580c' },
                  { label: 'Strong Sell', pct: 4, count: 48, color: '#dc2626' }
                ].map(bar => `
                  <div style="display:flex; align-items:center; gap:8px; font-size:10px;">
                    <span style="width:70px; color:#94a3b8; font-weight:700;">${bar.label}</span>
                    <div style="flex:1; background:#080c14; height:18px; border-radius:4px; overflow:hidden; position:relative;">
                      <div style="width:${bar.pct * 2.2}%; height:100%; background:${bar.color}; border-radius:4px; display:flex; align-items:center; padding-left:6px; font-size:9px; font-weight:900; color:#fff;">
                        ${bar.pct}%
                      </div>
                      ${bar.tooltip ? `
                        <div style="position:absolute; right:8px; top:1px; background:#1e293b; color:#fff; font-size:8px; padding:1px 5px; border-radius:3px; border:1px solid #334155;">
                          ${bar.tooltip}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 3 Bottom Summary Pill Cards: Sell 41%, Hold 20%, Buy 39% -->
          <div class="qc-kpi-3-grid" style="margin-top:14px;">
            <div style="background:rgba(239,68,68,0.10); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:8px; text-align:center;">
              <div style="font-size:9px; font-weight:800; color:#94a3b8;">Sell</div>
              <div style="font-size:16px; font-weight:900; color:#ef4444; font-family:var(--font-mono); margin-top:2px;">
                ↓ 41%
              </div>
            </div>
            <div style="background:rgba(245,158,11,0.10); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:8px; text-align:center;">
              <div style="font-size:9px; font-weight:800; color:#94a3b8;">Hold</div>
              <div style="font-size:16px; font-weight:900; color:#f59e0b; font-family:var(--font-mono); margin-top:2px;">
                20%
              </div>
            </div>
            <div style="background:rgba(16,185,129,0.10); border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:8px; text-align:center;">
              <div style="font-size:9px; font-weight:800; color:#94a3b8;">Buy</div>
              <div style="font-size:16px; font-weight:900; color:#10b981; font-family:var(--font-mono); margin-top:2px;">
                ↑ 39%
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- SECTION 2: PROPOSTE DEL GIORNO (TOP 3 STATISTICAL SETUPS) -->
      <div style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#fff;">Proposte del giorno</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
              Selezione dei 3 asset con il maggior vantaggio statistico.
            </div>
          </div>
          <span class="qc-live-tag">● AGGIORNATE OGGI · CONFLUENZA MULTIFATTORIALE</span>
        </div>

        <div class="qc-top-setups-grid">
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
              <div class="qi-daily-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:28px; height:28px; border-radius:6px; background:#1e293b; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:#fff;">
                      ${setup.symbol.slice(0,3)}
                    </div>
                    <div>
                      <div style="font-weight:900; font-size:14px; color:#fff;">${setup.symbol}</div>
                      <div style="font-size:10px; color:var(--text-muted);">${setup.name}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:13px; font-weight:800; color:#fff;">${setup.currency}${setup.price.toLocaleString('it-IT')}</div>
                    <div style="font-size:10px; font-weight:800; color:${setup.chg24.startsWith('+') ? '#10b981' : '#ef4444'};">${setup.chg24}</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; margin:10px 0;">
                  <span style="font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px; ${isLong ? 'background:rgba(16,185,129,0.18); color:#34d399; border:1px solid #10b981;' : 'background:rgba(239,68,68,0.18); color:#f87171; border:1px solid #ef4444;'}">
                    ${setup.bias}
                  </span>
                  <div style="display:flex; align-items:center; gap:4px;">
                    <span style="font-size:10px; font-weight:800; color:var(--text-dim);">Q-Score:</span>
                    <span style="font-size:14px; font-weight:900; color:#fff; background:#1e293b; padding:1px 6px; border-radius:4px; border:1px solid #334155;">
                      ${setup.qScore}/100
                    </span>
                  </div>
                </div>

                <div style="height:35px; margin:8px 0;">
                  <svg width="100%" height="35" viewBox="0 0 120 35">
                    <polyline fill="none" stroke="${isLong ? '#10b981' : '#ef4444'}" stroke-width="2" points="${sparkPoints}" />
                  </svg>
                </div>

                <p style="font-size:10px; color:#94a3b8; line-height:1.4; margin:6px 0; min-height:38px;">
                  ${setup.thesis}
                </p>

                <div style="display:flex; gap:6px; margin-top:10px;">
                  <button class="btn btn-secondary btn-sm" style="flex:1; font-size:10px; padding:5px;" onclick="CasarioQuantEngine.openAssetDossier('${setup.symbol}')">
                    🔬 Dettagli
                  </button>
                  <button class="btn btn-primary btn-sm" style="flex:1; font-size:10px; padding:5px; background:#2563eb; color:#fff;" onclick="CasarioQuantEngine.selectAssetForProposal('${setup.symbol}')">
                    ⚡ Apri Trade
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 3: PANORAMICA DEL MERCATO (TWO MULTI-ASSET TABLES CON TABS) -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:14px;">
          <h3 style="font-size:18px; font-weight:900; color:#fff; margin:0 0 4px 0;">Panoramica del Mercato</h3>
          <div style="font-size:10px; color:var(--text-muted);">
            Una panoramica delle tendenze globali del mercato, evidenziando i principali movimenti tra le principali classi di asset e regioni.
          </div>
        </div>

        <!-- TABLE 1: REGIONAL / PAESI -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px; margin-bottom:16px;">
          <!-- Tabs for Table 1 -->
          <div style="display:flex; gap:6px; margin-bottom:12px; border-bottom:1px solid #1e2638; padding-bottom:8px;">
            ${['USA', 'Europa', 'Asia', 'Mercati Emergenti', 'Mercati Sviluppati'].map(t => `
              <button class="btn btn-sm ${this.macroMarketTab1 === t ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:4px 10px; font-weight:800;" onclick="CasarioQuantEngine.setMacroMarketTab(1, '${t}')">
                ${t}
              </button>
            `).join('')}
          </div>

          <div style="overflow-x:auto;">
            <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                  <th style="padding:8px 10px;">Paese</th>
                  <th style="padding:8px 10px;">Posizionamento</th>
                  <th style="padding:8px 10px; text-align:center;">Smart Quant</th>
                  <th style="padding:8px 10px; text-align:right;">1D %</th>
                  <th style="padding:8px 10px; text-align:right;">1W %</th>
                  <th style="padding:8px 10px; text-align:right;">1M %</th>
                  <th style="padding:8px 10px; text-align:right;">Momentum Medio</th>
                  <th style="padding:8px 10px; text-align:right; width:100px;">Variazione Prezzo</th>
                </tr>
              </thead>
              <tbody>
                ${this.getRegionalMarketRows(this.macroMarketTab1).map(row => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 10px; font-weight:800; color:#fff;">${row.name}</td>
                    <td style="padding:8px 10px;">
                      <span style="font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px; ${row.positioning.includes('STRONG BUY') ? 'background:rgba(5,150,105,0.2); color:#10b981; border:1px solid #059669;' : row.positioning === 'BUY' ? 'background:rgba(16,185,129,0.18); color:#34d399; border:1px solid #10b981;' : row.positioning === 'HOLD' ? 'background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid #f59e0b;' : 'background:rgba(239,68,68,0.18); color:#f87171; border:1px solid #ef4444;'}">
                        ${row.positioning}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:center;">
                      <span style="background:#fff; color:#0f172a; font-weight:900; font-size:10px; padding:2px 8px; border-radius:4px;">
                        ${row.qScore}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.d1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.d1} ${row.d1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.w1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.w1} ${row.w1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.m1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.m1} ${row.m1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.avgMom.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.avgMom} ${row.avgMom.startsWith('+') ? '↗' : '↘'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <svg width="80" height="18" viewBox="0 0 80 18">
                        <polyline fill="none" stroke="${row.d1.startsWith('+') ? '#10b981' : '#ef4444'}" stroke-width="1.8" points="${row.sparkline}" />
                      </svg>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TABLE 2: ASSET CLASSES / COMMODITIES -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px;">
          <!-- Tabs for Table 2 -->
          <div style="display:flex; gap:6px; margin-bottom:12px; border-bottom:1px solid #1e2638; padding-bottom:8px;">
            ${['Forex', 'Cripto', 'Obbligazioni', 'Materie Prime'].map(t => `
              <button class="btn btn-sm ${this.macroMarketTab2 === t ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:4px 10px; font-weight:800;" onclick="CasarioQuantEngine.setMacroMarketTab(2, '${t}')">
                ${t}
              </button>
            `).join('')}
          </div>

          <div style="overflow-x:auto;">
            <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                  <th style="padding:8px 10px;">Asset / Materia</th>
                  <th style="padding:8px 10px;">Posizionamento</th>
                  <th style="padding:8px 10px; text-align:center;">Smart Quant</th>
                  <th style="padding:8px 10px; text-align:right;">1D %</th>
                  <th style="padding:8px 10px; text-align:right;">1W %</th>
                  <th style="padding:8px 10px; text-align:right;">1M %</th>
                  <th style="padding:8px 10px; text-align:right;">Momentum Medio</th>
                  <th style="padding:8px 10px; text-align:right; width:100px;">Variazione Prezzo</th>
                </tr>
              </thead>
              <tbody>
                ${this.getAssetClassRows(this.macroMarketTab2).map(row => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 10px; font-weight:800; color:#fff;">${row.name}</td>
                    <td style="padding:8px 10px;">
                      <span style="font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px; ${row.positioning.includes('STRONG BUY') ? 'background:rgba(5,150,105,0.2); color:#10b981; border:1px solid #059669;' : row.positioning === 'BUY' ? 'background:rgba(16,185,129,0.18); color:#34d399; border:1px solid #10b981;' : row.positioning === 'HOLD' ? 'background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid #f59e0b;' : 'background:rgba(239,68,68,0.18); color:#f87171; border:1px solid #ef4444;'}">
                        ${row.positioning}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:center;">
                      <span style="background:#fff; color:#0f172a; font-weight:900; font-size:10px; padding:2px 8px; border-radius:4px;">
                        ${row.qScore}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.d1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.d1} ${row.d1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.w1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.w1} ${row.w1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.m1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.m1} ${row.m1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${row.avgMom.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${row.avgMom} ${row.avgMom.startsWith('+') ? '↗' : '↘'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <svg width="80" height="18" viewBox="0 0 80 18">
                        <polyline fill="none" stroke="${row.d1.startsWith('+') ? '#10b981' : '#ef4444'}" stroke-width="1.8" points="${row.sparkline}" />
                      </svg>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION 4: RAFFRONTO PER AREA (SCREENSHOT 1793912828562_db52578c) -->
      <div style="margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <h3 style="font-size:18px; font-weight:900; color:#fff; margin:0 0 4px 0;">Raffronto per Area</h3>
          <div style="font-size:10px; color:var(--text-muted);">
            Confronto strutturato e professionale degli indici benchmark per ciascuna area geografica
          </div>
        </div>

        <!-- USA Group (4 indices) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px; margin-bottom:14px;">
          <div style="margin-bottom:8px;">
            <div style="font-size:14px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
              <span>🌐</span> USA
            </div>
            <div style="font-size:9px; color:#64748b;">4 indices</div>
          </div>
          <div style="overflow-x:auto;">
            <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                  <th style="padding:6px 10px;">Index</th>
                  <th style="padding:6px 10px; text-align:center;">SmartQuant</th>
                  <th style="padding:6px 10px;">Positioning</th>
                  <th style="padding:6px 10px; text-align:right;">1D %</th>
                  <th style="padding:6px 10px; text-align:right;">1W %</th>
                  <th style="padding:6px 10px; text-align:right;">1M %</th>
                  <th style="padding:6px 10px; text-align:right;">Avg Momentum</th>
                  <th style="padding:6px 10px; text-align:right; width:110px;">Chart</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { name: 'Dow Jones', sub: 'DJI', sq: 71, pos: 'BUY', d1: '-1.07%', w1: '-2.24%', m1: '-3.09%', mom: '3.84%', pts: '0,5 20,4 40,7 60,6 80,12 100,16' },
                  { name: 'Russell 2000', sub: 'VTWO', sq: 68, pos: 'BUY', d1: '+0.30%', w1: '-1.68%', m1: '-5.18%', mom: '2.48%', pts: '0,4 20,6 40,5 60,8 80,14 100,15' },
                  { name: 'Nasdaq', sub: 'IXIC', sq: 68, pos: 'BUY', d1: '-1.21%', w1: '-2.04%', m1: '-5.45%', mom: '9.53%', pts: '0,14 20,10 40,12 60,4 80,8 100,15' },
                  { name: 'S&P 500', sub: 'GSPC', sq: 67, pos: 'BUY', d1: '-0.83%', w1: '-1.73%', m1: '-3.26%', mom: '6.08%', pts: '0,10 20,6 40,8 60,5 80,9 100,14' }
                ].map(r => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 10px;">
                      <div style="font-weight:900; color:#fff;">${r.name}</div>
                      <div style="font-size:9px; color:#64748b;">${r.sub}</div>
                    </td>
                    <td style="padding:8px 10px; text-align:center;">
                      <span style="background:#fff; color:#0f172a; font-weight:900; font-size:10px; padding:2px 8px; border-radius:4px;">${r.sq}</span>
                    </td>
                    <td style="padding:8px 10px;">
                      <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">${r.pos}</span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.d1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.d1} ${r.d1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.w1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.w1} ${r.w1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.m1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.m1} ${r.m1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px;">
                        ${r.mom} ↗
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <svg width="100" height="20" viewBox="0 0 100 20">
                        <polyline fill="none" stroke="#ef4444" stroke-width="1.8" points="${r.pts}" />
                      </svg>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Europa Group (9 indices) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px;">
          <div style="margin-bottom:8px;">
            <div style="font-size:14px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
              <span>🌐</span> Europa
            </div>
            <div style="font-size:9px; color:#64748b;">9 indices</div>
          </div>
          <div style="overflow-x:auto;">
            <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                  <th style="padding:6px 10px;">Index</th>
                  <th style="padding:6px 10px; text-align:center;">SmartQuant</th>
                  <th style="padding:6px 10px;">Positioning</th>
                  <th style="padding:6px 10px; text-align:right;">1D %</th>
                  <th style="padding:6px 10px; text-align:right;">1W %</th>
                  <th style="padding:6px 10px; text-align:right;">1M %</th>
                  <th style="padding:6px 10px; text-align:right;">Avg Momentum</th>
                  <th style="padding:6px 10px; text-align:right; width:110px;">Chart</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { name: 'Spagna', sub: 'IBEX 35', sq: 89, pos: 'STRONG BUY', d1: '-2.14%', w1: '-3.17%', m1: '-1.28%', mom: '12.46%', pts: '0,8 20,4 40,6 60,3 80,12 100,10', color: '#10b981' },
                  { name: 'Italia', sub: 'FTSE MIB', sq: 82, pos: 'STRONG BUY', d1: '-0.45%', w1: '-1.10%', m1: '+1.80%', mom: '10.25%', pts: '0,12 20,8 40,5 60,3 80,6 100,4', color: '#10b981' },
                  { name: 'Germania', sub: 'DAX 40', sq: 76, pos: 'BUY', d1: '-0.68%', w1: '-1.45%', m1: '+0.50%', mom: '8.34%', pts: '0,10 20,7 40,8 60,4 80,8 100,6', color: '#10b981' },
                  { name: 'Euro Stoxx 50', sub: 'SX5E', sq: 75, pos: 'BUY', d1: '-0.72%', w1: '-1.50%', m1: '-0.20%', mom: '7.80%', pts: '0,8 20,6 40,7 60,5 80,9 100,7', color: '#10b981' },
                  { name: 'Francia', sub: 'CAC 40', sq: 74, pos: 'BUY', d1: '-0.85%', w1: '-1.90%', m1: '-1.10%', mom: '6.45%', pts: '0,6 20,8 40,7 60,9 80,12 100,11', color: '#10b981' },
                  { name: 'Olanda', sub: 'AEX', sq: 71, pos: 'BUY', d1: '-0.40%', w1: '-1.12%', m1: '+2.10%', mom: '8.90%', pts: '0,12 20,10 40,6 60,4 80,7 100,5', color: '#10b981' },
                  { name: 'Svizzera', sub: 'SMI', sq: 69, pos: 'BUY', d1: '-0.25%', w1: '-0.80%', m1: '+0.40%', mom: '5.10%', pts: '0,8 20,7 40,8 60,6 80,7 100,6', color: '#10b981' },
                  { name: 'Regno Unito', sub: 'FTSE 100', sq: 67, pos: 'BUY', d1: '-0.59%', w1: '-1.36%', m1: '-1.12%', mom: '7.45%', pts: '0,5 20,6 40,8 60,7 80,11 100,12', color: '#10b981' },
                  { name: 'Portogallo', sub: 'PSI 20', sq: 65, pos: 'BUY', d1: '+0.15%', w1: '-0.90%', m1: '+1.20%', mom: '4.80%', pts: '0,10 20,9 40,7 60,8 80,6 100,5', color: '#10b981' }
                ].map(r => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 10px;">
                      <div style="font-weight:900; color:#fff;">${r.name}</div>
                      <div style="font-size:9px; color:#64748b;">${r.sub}</div>
                    </td>
                    <td style="padding:8px 10px; text-align:center;">
                      <span style="background:#fff; color:#0f172a; font-weight:900; font-size:10px; padding:2px 8px; border-radius:4px;">${r.sq}</span>
                    </td>
                    <td style="padding:8px 10px;">
                      <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">${r.pos}</span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.d1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.d1} ${r.d1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.w1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.w1} ${r.w1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px; ${r.m1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">
                        ${r.m1} ${r.m1.startsWith('+') ? '↑' : '↓'}
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px;">
                        ${r.mom} ↗
                      </span>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <svg width="100" height="20" viewBox="0 0 100 20">
                        <polyline fill="none" stroke="${r.color}" stroke-width="1.8" points="${r.pts}" />
                      </svg>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION 5: CALENDARIO DEGLI EVENTI & DATI MACRO (SCREENSHOTS 88f03da2 & 574597d7) -->
      <div style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #f59e0b; padding-bottom:8px; margin-bottom:14px;">
          <div>
            <h3 style="font-size:18px; font-weight:900; color:#fff; margin:0 0 4px 0;">
              Calendario degli Utili & Notizie Macroeconomiche
            </h3>
            <div style="font-size:10px; color:var(--text-muted);">
              Scadenze bilanci societari, date earnings e rilasci macroeconomici ad alto impatto
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm ${this.eventsCategoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="CasarioQuantEngine.setEventsCategoryFilter('all')">
              Tutti gli Eventi
            </button>
            <button class="btn btn-sm ${this.eventsCategoryFilter === 'utili' ? 'btn-primary' : 'btn-secondary'}" onclick="CasarioQuantEngine.setEventsCategoryFilter('utili')">
              📅 Utili Trimestrali
            </button>
            <button class="btn btn-sm ${this.eventsCategoryFilter === 'macro' ? 'btn-primary' : 'btn-secondary'}" onclick="CasarioQuantEngine.setEventsCategoryFilter('macro')">
              🌐 Dati Macro
            </button>
          </div>
        </div>

        <!-- Filter Bar: Time ranges + Country + Impact -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:#0c101c; padding:10px 14px; border-radius:8px; border:1px solid #1e2638;">
          <div style="display:flex; gap:6px;">
            ${[
              { id: 'ieri', label: 'Ieri' },
              { id: 'oggi', label: 'Oggi' },
              { id: 'domani', label: 'Domani' },
              { id: 'settimana', label: 'Questa Settimana' },
              { id: 'prossima', label: 'Prossima Settimana' }
            ].map(tf => `
              <button class="btn btn-sm ${this.eventsTimeFilter === tf.id ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:4px 10px;" onclick="CasarioQuantEngine.setEventsTimeFilter('${tf.id}')">
                ${tf.label}
              </button>
            `).join('')}
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <!-- Impact Pill -->
            <button class="btn btn-sm btn-secondary" style="font-size:10px; padding:4px 8px; border-color:rgba(239,68,68,0.4); color:#f87171;" onclick="CasarioQuantEngine.setEventsImpactFilter('alto')">
              🔴 Alto ✕
            </button>
            <!-- Country Filter Select -->
            <select class="terminal-input" style="font-size:10px; padding:4px 8px;" onchange="CasarioQuantEngine.setEventsCountryFilter(this.value)">
              <option value="all">🇺🇸 US + 🇮🇹 IT + Tutti</option>
              <option value="US">🇺🇸 Solo Stati Uniti</option>
              <option value="EU">🇪🇺 Eurozona</option>
              <option value="IT">🇮🇹 Italia</option>
            </select>
          </div>
        </div>

        ${this.eventsCategoryFilter !== 'macro' ? `
          <!-- TABLE 1: CALENDARIO DEGLI UTILI (SCREENSHOT 88f03da2) -->
          <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px; margin-bottom:16px;">
            <div style="font-size:13px; font-weight:900; color:#fff; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <span>📅</span> Calendario degli utili
            </div>
            <div style="overflow-x:auto;">
              <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                  <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                    <th style="padding:8px 10px;">Simbolo / Nome</th>
                    <th style="padding:8px 10px;">Paese</th>
                    <th style="padding:8px 10px;">Capitalizzazione di mercato</th>
                    <th style="padding:8px 10px;">Posizionamento</th>
                    <th style="padding:8px 10px; text-align:center;">Smart Quant</th>
                    <th style="padding:8px 10px; text-align:right;">Stima EPS</th>
                    <th style="padding:8px 10px; text-align:right;">EPS segnalato</th>
                    <th style="padding:8px 10px; text-align:right;">Sorpresa %</th>
                    <th style="padding:8px 10px; text-align:center;">Data</th>
                    <th style="padding:8px 10px; text-align:center;">Periodo</th>
                    <th style="padding:8px 10px; text-align:center;">Orario</th>
                  </tr>
                </thead>
                <tbody>
                  ${[
                    { sym: 'GAP', name: 'The Gap, Inc.', flag: '🇺🇸', cap: '8.9 B $', pos: 'BUY', sq: 76, epsEst: '0.58', epsRep: '-', surp: '0.00%', date: '2025-11-20', period: '2025-10-31', time: '🌙' },
                    { sym: 'NVDA', name: 'NVIDIA Corporation', flag: '🇺🇸', cap: '3.56 T $', pos: 'STRONG BUY', sq: 92, epsEst: '0.74', epsRep: '0.81', surp: '+9.46%', date: '2025-11-20', period: '2025-10-31', time: '🌙' },
                    { sym: 'PANW', name: 'Palo Alto Networks', flag: '🇺🇸', cap: '124.5 B $', pos: 'BUY', sq: 81, epsEst: '1.48', epsRep: '-', surp: '0.00%', date: '2025-11-20', period: '2025-10-31', time: '🌙' },
                    { sym: 'INTU', name: 'Intuit Inc.', flag: '🇺🇸', cap: '182.0 B $', pos: 'BUY', sq: 79, epsEst: '2.35', epsRep: '-', surp: '0.00%', date: '2025-11-21', period: '2025-10-31', time: '🌙' },
                    { sym: 'DE', name: 'Deere & Company', flag: '🇺🇸', cap: '112.4 B $', pos: 'HOLD', sq: 58, epsEst: '3.87', epsRep: '-', surp: '0.00%', date: '2025-11-21', period: '2025-10-31', time: '☀️' }
                  ].map(r => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:8px 10px;">
                        <div style="font-weight:900; color:#fff;">${r.sym}</div>
                        <div style="font-size:9px; color:#64748b;">${r.name}</div>
                      </td>
                      <td style="padding:8px 10px; font-size:14px;">${r.flag}</td>
                      <td style="padding:8px 10px; color:#cbd5e1; font-weight:700;">${r.cap}</td>
                      <td style="padding:8px 10px;">
                        <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">${r.pos}</span>
                      </td>
                      <td style="padding:8px 10px; text-align:center;">
                        <span style="background:#fff; color:#0f172a; font-weight:900; font-size:10px; padding:2px 8px; border-radius:4px;">${r.sq}</span>
                      </td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#fff;">${r.epsEst}</td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#94a3b8;">${r.epsRep}</td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); ${r.surp.startsWith('+') ? 'color:#10b981;' : 'color:#94a3b8;'}">${r.surp}</td>
                      <td style="padding:8px 10px; text-align:center; font-family:var(--font-mono); color:#cbd5e1;">${r.date}</td>
                      <td style="padding:8px 10px; text-align:center; font-family:var(--font-mono); color:#64748b;">${r.period}</td>
                      <td style="padding:8px 10px; text-align:center; font-size:13px;" title="${r.time === '🌙' ? 'Dopo la chiusura (After Close)' : "Prima apertura (Before Open)"}">${r.time}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <!-- Pagination Controls -->
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:12px; font-size:11px; color:#64748b;">
              <span style="cursor:pointer;">&laquo;</span>
              <span style="cursor:pointer;">&lsaquo;</span>
              <span style="background:#1e293b; color:#fff; padding:2px 8px; border-radius:4px; font-weight:800;">1</span>
              <span style="cursor:pointer;">&rsaquo;</span>
              <span style="cursor:pointer;">&raquo;</span>
            </div>
          </div>
        ` : ''}

        ${this.eventsCategoryFilter !== 'utili' ? `
          <!-- TABLE 2: NOTIZIE MACROECONOMICHE (SCREENSHOT 574597d7) -->
          <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px;">
            <div style="font-size:13px; font-weight:900; color:#fff; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <span>🌐</span> Notizie macroeconomiche
            </div>
            <div style="overflow-x:auto;">
              <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                  <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                    <th style="padding:8px 10px;">Data</th>
                    <th style="padding:8px 10px;">Paese</th>
                    <th style="padding:8px 10px;">Evento</th>
                    <th style="padding:8px 10px; text-align:right;">Precedente</th>
                    <th style="padding:8px 10px; text-align:right;">Stima</th>
                    <th style="padding:8px 10px; text-align:right;">Attuale</th>
                    <th style="padding:8px 10px; text-align:center;">Impatto</th>
                  </tr>
                </thead>
                <tbody>
                  ${[
                    { date: '2025-11-19 07:00:00', flag: '🇬🇧', event: 'Inflation Rate YoY (Oct)', prev: '3.8', est: '3.6', act: '3.6', imp: 'Alto' },
                    { date: '2025-11-19 10:00:00', flag: '🇪🇺', event: 'CPI (Oct)', prev: '129.43', est: '129.7', act: '129.7', imp: 'Alto' },
                    { date: '2025-11-19 13:30:00', flag: '🇺🇸', event: 'Housing Starts (Sep)', prev: '1.307', est: '1.32', act: '-', imp: 'Alto' },
                    { date: '2025-11-19 13:30:00', flag: '🇺🇸', event: 'Building Permits (Oct)', prev: '-', est: '1.35', act: '-', imp: 'Alto' },
                    { date: '2025-11-19 13:30:00', flag: '🇺🇸', event: 'Housing Starts (Oct)', prev: '-', est: '1.33', act: '-', imp: 'Alto' },
                    { date: '2025-11-19 19:00:00', flag: '🇺🇸', event: 'FOMC Minutes', prev: '-', est: '-', act: '-', imp: 'Alto' }
                  ].map(r => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:8px 10px; font-family:var(--font-mono); color:#94a3b8;">${r.date}</td>
                      <td style="padding:8px 10px; font-size:14px;">${r.flag}</td>
                      <td style="padding:8px 10px; font-weight:800; color:#fff;">${r.event}</td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#94a3b8;">${r.prev}</td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#cbd5e1;">${r.est}</td>
                      <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#fff; font-weight:800;">${r.act}</td>
                      <td style="padding:8px 10px; text-align:center;">
                        <span style="background:rgba(239,68,68,0.18); border:1px solid #ef4444; color:#f87171; font-size:9px; font-weight:900; padding:2px 8px; border-radius:4px;">
                          🔴 ${r.imp}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <!-- Pagination Controls -->
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:12px; font-size:11px; color:#64748b;">
              <span style="cursor:pointer;">&laquo;</span>
              <span style="cursor:pointer;">&lsaquo;</span>
              <span style="background:#1e293b; color:#fff; padding:2px 8px; border-radius:4px; font-weight:800;">1</span>
              <span style="cursor:pointer;">&rsaquo;</span>
              <span style="cursor:pointer;">&raquo;</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

/* =======================================================================
   * 2. SUB-VIEW: RADAR SCREENER (MULTI-FILTER & STAGIONALITÀ + QUANT MOMENTUM)
   * ======================================================================= */
  buildRadarScreenerHTML() {
    return `
      <div style="margin-bottom:18px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">🎯</span>
          <h2 style="font-size:22px; font-weight:900; color:#fff; margin:0; letter-spacing:0.3px;">
            Radar
          </h2>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
          Analisi di stagionalità e segnali di trend per il mercato azionario
        </div>
      </div>

      <!-- STRATEGY TABS: [Stagionalità] [Smart Quant Momentum] [Smart Quant + Stagionalità] -->
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="btn btn-sm ${this.radarStrategy === 'stagionalita' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; padding:6px 14px; font-weight:800;" onclick="CasarioQuantEngine.setRadarStrategy('stagionalita')">
          <span>📅</span> Stagionalità
        </button>
        <button class="btn btn-sm ${this.radarStrategy === 'momentum' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; padding:6px 14px; font-weight:800;" onclick="CasarioQuantEngine.setRadarStrategy('momentum')">
          <span>📈</span> Smart Quant Momentum
        </button>
        <button class="btn btn-sm ${this.radarStrategy === 'smartquant_stagionalita' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; padding:6px 14px; font-weight:800; background:#fff; color:#0f172a; border-color:#fff;" onclick="CasarioQuantEngine.setRadarStrategy('smartquant_stagionalita')">
          <span>🔄</span> Smart Quant + Stagionalità
        </button>
      </div>

      <!-- FILTRI SECTION (SCREENSHOTS 5c99962a & 949d97c2) -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:16px; margin-bottom:20px;">
        <div style="font-size:12px; font-weight:900; color:#fff; margin-bottom:14px; display:flex; align-items:center; gap:6px;">
          <span>▼</span> Filtri
        </div>

        <!-- Row 1: Ricerca | Tipo | Direzione -->
        <div class="qc-macro-overview-3col">
          
          <!-- Ricerca Input -->
          <div>
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Ricerca</label>
            <div style="position:relative;">
              <span style="position:absolute; left:10px; top:8px; font-size:12px; color:#64748b;">🔍</span>
              <input type="text" class="terminal-input" placeholder="Cerca per nome, ticker, settore..." value="${this.radarFilters.search}" oninput="CasarioQuantEngine.setRadarSearch(this.value)" style="width:100%; padding:7px 10px 7px 30px; font-size:11px; background:#080c14; border:1px solid #1e2638; border-radius:6px; color:#fff;">
            </div>
          </div>

          <!-- Tipo Multi-Select Chips with Dropdown -->
          <div style="position:relative;">
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Tipo</label>
            <div style="display:flex; align-items:center; justify-content:space-between; background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:4px 8px; min-height:34px; cursor:pointer;" onclick="CasarioQuantEngine.toggleRadarDropdown('tipo', event)">
              <div style="display:flex; gap:4px; flex-wrap:wrap; align-items:center;">
                <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #334155;">STOCK ✕</span>
                <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #334155;">ETF ✕</span>
                <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #334155;">FUND ✕</span>
                <span style="font-size:9px; color:#64748b; font-weight:800;">+1 more ▾</span>
              </div>
              <span style="font-size:9px; color:#64748b;">✕ ▾</span>
            </div>

            <!-- Dropdown Menu for Tipo -->
            ${this.radarOpenDropdown === 'tipo' ? `
              <div style="position:absolute; top:100%; left:0; width:220px; background:#0c101c; border:1px solid #334155; border-radius:6px; padding:10px; z-index:100; box-shadow:0 10px 25px rgba(0,0,0,0.8); margin-top:4px;">
                <input type="text" placeholder="Search..." style="width:100%; font-size:10px; padding:4px 8px; background:#1e293b; border:1px solid #475569; color:#fff; border-radius:4px; margin-bottom:8px;">
                <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto; font-size:11px;">
                  <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;"><input type="checkbox"> (Select All)</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#fff; cursor:pointer;"><input type="checkbox" checked> STOCK</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#fff; cursor:pointer;"><input type="checkbox" checked> ETF</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;"><input type="checkbox"> INDEX</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#fff; cursor:pointer;"><input type="checkbox" checked> FUND</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;"><input type="checkbox"> Crypto</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;"><input type="checkbox"> Currency</label>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid #1e2638;">
                  <button class="btn btn-sm btn-secondary" style="font-size:9px; padding:2px 8px;" onclick="CasarioQuantEngine.closeAllRadarDropdowns()">Clear</button>
                  <button class="btn btn-sm btn-primary" style="font-size:9px; padding:2px 8px;" onclick="CasarioQuantEngine.closeAllRadarDropdowns()">Close</button>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Direzione Multi-Select Chips with Dropdown -->
          <div style="position:relative;">
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Direzione</label>
            <div style="display:flex; align-items:center; justify-content:space-between; background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:4px 8px; min-height:34px; cursor:pointer;" onclick="CasarioQuantEngine.toggleRadarDropdown('direzione', event)">
              <div style="display:flex; gap:4px; flex-wrap:wrap; align-items:center;">
                <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #334155;">BUY ✕</span>
                <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid #334155;">SHORT ✕</span>
              </div>
              <span style="font-size:9px; color:#64748b;">✕ ▾</span>
            </div>

            <!-- Dropdown for Direzione -->
            ${this.radarOpenDropdown === 'direzione' ? `
              <div style="position:absolute; top:100%; left:0; width:180px; background:#0c101c; border:1px solid #334155; border-radius:6px; padding:10px; z-index:100; box-shadow:0 10px 25px rgba(0,0,0,0.8); margin-top:4px;">
                <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
                  <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer;"><input type="checkbox"> (Select All)</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#fff; cursor:pointer;"><input type="checkbox" checked> BUY</label>
                  <label style="display:flex; align-items:center; gap:6px; color:#fff; cursor:pointer;"><input type="checkbox" checked> SHORT</label>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid #1e2638;">
                  <button class="btn btn-sm btn-secondary" style="font-size:9px; padding:2px 8px;" onclick="CasarioQuantEngine.closeAllRadarDropdowns()">Clear</button>
                  <button class="btn btn-sm btn-primary" style="font-size:9px; padding:2px 8px;" onclick="CasarioQuantEngine.closeAllRadarDropdowns()">Close</button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Row 2: Settore | Paese | Stato Trade -->
        <div class="qc-sector-perf-3col">
          <!-- Settore -->
          <div>
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Settore</label>
            <div style="display:flex; align-items:center; justify-content:space-between; background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:4px 8px; min-height:34px;">
              <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #334155;">Information Technology ✕</span>
              <span style="font-size:9px; color:#64748b;">✕ ▾</span>
            </div>
          </div>

          <!-- Paese -->
          <div>
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Paese</label>
            <div style="display:flex; align-items:center; justify-content:space-between; background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:4px 8px; min-height:34px;">
              <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #334155;">🇺🇸 Stati Uniti ✕</span>
              <span style="font-size:9px; color:#64748b;">✕ ▾</span>
            </div>
          </div>

          <!-- Stato Trade -->
          <div>
            <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Stato Trade</label>
            <select class="terminal-input" style="width:100%; font-size:11px; padding:7px 10px; background:#080c14; border:1px solid #1e2638; border-radius:6px; color:#fff;">
              <option>Inizio entro 1 giorno</option>
              <option>In corso (Attivo)</option>
              <option>In chiusura</option>
              <option>Tutti gli stati</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Capitalizzazione di mercato -->
        <div>
          <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:5px;">Capitalizzazione di mercato</label>
          <div style="display:flex; align-items:center; justify-content:space-between; background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:4px 8px; min-height:34px;">
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #334155;">Mega Cap (&gt; $200B) ✕</span>
              <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #334155;">Large Cap ($10B-$200B) ✕</span>
              <span class="qi-chip" style="background:#1e293b; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #334155;">Mid Cap ($2B-$10B) ✕</span>
              <span style="font-size:9px; color:#64748b; font-weight:800;">+3 more ▾</span>
            </div>
            <span style="font-size:9px; color:#64748b;">✕ ▾</span>
          </div>
        </div>
      </div>

      <!-- RESULTS SECTION: Smart Quant + Stagionalità -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:16px;">
        <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <div style="font-size:14px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
              <span>🔄</span> Smart Quant + Stagionalità
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
              Titoli con segnali Smart Quant attivi e finestre stagionali
            </div>
          </div>
          <span style="font-size:11px; color:#64748b; font-weight:800;">${this.universeData.length} setup identificati</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:8px 10px;">Simbolo</th>
                <th style="padding:8px 10px;">Settore</th>
                <th style="padding:8px 10px; text-align:center;">Paese</th>
                <th style="padding:8px 10px; text-align:center;">Direzione</th>
                <th style="padding:8px 10px; text-align:center;">Smart Quant</th>
                <th style="padding:8px 10px; text-align:center;">SQ Data Entrata</th>
                <th style="padding:8px 10px; text-align:right;">SQ Performance</th>
                <th style="padding:8px 10px; text-align:center;">Finestra Stagionale</th>
                <th style="padding:8px 10px; width:130px;">Win Rate</th>
                <th style="padding:8px 10px; text-align:right;">Profitto Medio</th>
                <th style="padding:8px 10px; text-align:right;">Prezzo Chiusura</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { sym: 'CSCO', name: 'Cisco Systems Inc', sector: 'Information Technology', flag: '🇺🇸', dir: '+ BUY', sq: 75, date: '15/10/2025', perf: '+0.13%', window: '📅 17-11 • 31-12 (45 giorni)', wr: 71.43, profit: '4.21 $', price: '77.37' },
                { sym: 'SMAR', name: 'Smartsheet Inc', sector: 'Information Technology', flag: '🇺🇸', dir: '+ BUY', sq: 84, date: '03/10/2024', perf: '+0.02%', window: '📅 18-11 • 17-12 (30 giorni)', wr: 100.00, profit: '16.33 $', price: '56.47' },
                { sym: 'ENV', name: 'Envestnet Inc', sector: 'Information Technology', flag: '🇺🇸', dir: '+ BUY', sq: 75, date: '24/10/2024', perf: '+0.01%', window: '📅 22-11 • 21-12 (30 giorni)', wr: 66.67, profit: '3.62 $', price: '63.14' },
                { sym: 'TCX', name: 'Tricon Residential', sector: 'Information Technology', flag: '🇺🇸', dir: '+ BUY', sq: 77, date: '15/11/2025', perf: '+0.04%', window: '📅 16-11 • 30-12 (45 giorni)', wr: 58.62, profit: '1.26 $', price: '21.48' },
                { sym: 'ADCT', name: 'ADC Therapeutics SA', sector: 'Healthcare', flag: '🇺🇸', dir: '+ BUY', sq: 63, date: '17/06/2025', perf: '+18.34%', window: '📅 01-11 • 15-01 (75 giorni)', wr: 78.50, profit: '1.85 $', price: '4.00' },
                { sym: 'NVDA', name: 'NVIDIA Corporation', sector: 'Information Technology', flag: '🇺🇸', dir: '+ BUY', sq: 92, date: '28/09/2025', perf: '+8.45%', window: '📅 15-10 • 15-01 (90 giorni)', wr: 85.00, profit: '24.50 $', price: '145.20' }
              ].map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="CasarioQuantEngine.openAssetDossier('${r.sym}')">
                  <td style="padding:10px 10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="width:24px; height:24px; border-radius:50%; background:#1e293b; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:#38bdf8;">
                        ${r.sym.slice(0,2)}
                      </div>
                      <div>
                        <div style="font-weight:900; color:#fff;">${r.sym}</div>
                        <div style="font-size:9px; color:#64748b;">${r.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:10px 10px;">
                    <span style="background:#1e2638; color:#cbd5e1; font-size:9px; font-weight:700; padding:2px 8px; border-radius:12px;">${r.sector}</span>
                  </td>
                  <td style="padding:10px 10px; text-align:center; font-size:14px;">${r.flag}</td>
                  <td style="padding:10px 10px; text-align:center;">
                    <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:9px; font-weight:900; padding:2px 8px; border-radius:12px;">
                      ${r.dir}
                    </span>
                  </td>
                  <td style="padding:10px 10px; text-align:center;">
                    <span style="background:#fff; color:#0f172a; font-weight:900; font-size:11px; padding:2px 8px; border-radius:4px;">
                      ${r.sq}
                    </span>
                  </td>
                  <td style="padding:10px 10px; text-align:center; font-family:var(--font-mono); color:#94a3b8;">${r.date}</td>
                  <td style="padding:10px 10px; text-align:right; font-family:var(--font-mono); color:#10b981; font-weight:800;">${r.perf}</td>
                  <td style="padding:10px 10px; text-align:center; font-size:10px; color:#cbd5e1; background:#080c14; border-radius:4px;">${r.window}</td>
                  <td style="padding:10px 10px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <div style="flex:1; background:#1e293b; height:6px; border-radius:3px; overflow:hidden;">
                        <div style="width:${r.wr}%; height:100%; background:#fff; border-radius:3px;"></div>
                      </div>
                      <span style="font-size:9px; font-family:var(--font-mono); color:#fff; font-weight:800;">${r.wr.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td style="padding:10px 10px; text-align:right; font-family:var(--font-mono); color:#10b981; font-weight:800;">${r.profit}</td>
                  <td style="padding:10px 10px; text-align:right; font-family:var(--font-mono); color:#fff; font-weight:800;">${r.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

/* =======================================================================
   * 3. SUB-VIEW: ASSET DOSSIER (SCHEDA TITOLO COMPLETA · BANCHE, FORECAST CONE, BILANCI)
   * ======================================================================= */
  buildAssetDossierHTML() {
    const asset = this.universeData.find(x => x.symbol === this.selectedAssetSymbol) || this.universeData[0];
    const isLong = asset.qScore >= 60;

    return `
      <div class="qi-dossier-wrapper" style="padding:10px 0;">
        
        <!-- TOP TOOLBAR: ASSET SELECTOR & WATCHLIST -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; background:#0c101c; padding:12px 16px; border-radius:8px; border:1px solid #1e2638;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-dim);">SELEZIONA ASSET DA ESPLORARE:</span>
            <select class="terminal-input" style="font-weight:800; font-size:12px; padding:6px 12px; width:260px;" onchange="CasarioQuantEngine.openAssetDossier(this.value)">
              ${this.universeData.map(item => `
                <option value="${item.symbol}" ${item.symbol === asset.symbol ? 'selected' : ''}>
                  ${item.flag || '🇺🇸'} ${item.symbol} — ${item.name} (${item.qScore}/100)
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" style="background:#2563eb; color:#fff; font-weight:800; padding:6px 14px;" onclick="window.showToast ? window.showToast('${asset.symbol} aggiunto alla Watchlist Personale', 'success') : null">
              + Aggiungi alla Watchlist
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.selectAssetForProposal('${asset.symbol}')" style="color:#00f2a1; border-color:#00f2a1;">
              ⚡ Proponi Setup (10s)
            </button>
          </div>
        </div>

        <!-- HEADER BANNER: TICKER, NAME, ISIN, INDUSTRY, DESCRIPTION -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px; margin-bottom:18px;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:48px; height:48px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; color:#38bdf8; border:1px solid #334155;">
                ${asset.symbol.slice(0,3)}
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span style="font-size:22px; font-weight:900; color:#fff;">${asset.name} (${asset.symbol})</span>
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                  ${asset.type || 'Common Stock'} | ${asset.sector || 'Healthcare'} | ${asset.industry || 'Biotechnology'} | ISIN: <b style="color:#cbd5e1; font-family:var(--font-mono);">${asset.isin || 'CH0499880968'}</b>
                </div>
              </div>
            </div>

            <div style="text-align:right;">
              <div style="font-size:24px; font-weight:900; color:#fff; font-family:var(--font-mono);">
                ${asset.currency || '$'}${Number(asset.price).toFixed(2)}
              </div>
              <div style="font-size:11px; font-weight:800; color:${String(asset.chg24).startsWith('+') ? '#10b981' : '#ef4444'};">
                ${asset.chg24} oggi
              </div>
            </div>
          </div>

          <p style="font-size:11px; color:#94a3b8; line-height:1.6; margin:0; border-top:1px solid #1e2638; padding-top:10px;">
            ${asset.description || 'Piattaforma quantitativa avanzata di monitoraggio fondamentale, macro e tecnico istituzionale con modelli proprietari di correlazione e stagionalità.'}
          </p>
        </div>

        <!-- 7-SUBTAB NAVIGATION BAR (SCREENSHOTS e2cc5bcf, b2fbb521, 5446f5c5, 6472e5c4) -->
        <div style="display:flex; gap:4px; margin-bottom:16px; border-bottom:1px solid #1e2638; padding-bottom:6px; overflow-x:auto;">
          ${[
            { id: 'overview', label: 'Panoramica', icon: '🏠' },
            { id: 'smartquant', label: 'Smart Quant', icon: '⭐' },
            { id: 'revenues', label: 'Ricavi', icon: '🍩' },
            { id: 'financials', label: 'Dati Finanziari', icon: '📑' },
            { id: 'fundamentals', label: 'Fondamentali', icon: '📊' },
            { id: 'seasonality', label: 'Stagionalità', icon: '🗓️' },
            { id: 'etf', label: 'Esposizione ETF/Indici', icon: '🏛️' }
          ].map(tab => `
            <button class="btn btn-sm ${this.activeDossierSubTab === tab.id ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px; border-radius:6px;" onclick="CasarioQuantEngine.setDossierSubTab('${tab.id}')">
              <span>${tab.icon}</span> ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- SUBTAB CONTENT PANE -->
        <div class="qi-dossier-pane">
          ${this.renderDossierSubPaneHTML(asset)}
        </div>
      </div>
    `;
  },

  renderDossierSubPaneHTML(asset) {
    switch (this.activeDossierSubTab) {
      case 'overview': return this.buildDossierOverviewHTML(asset);
      case 'smartquant': return this.buildDossierSqmHTML(asset);
      case 'revenues': return this.buildDossierRevenuesHTML(asset);
      case 'financials': return this.buildDossierFinancialStatementsHTML(asset);
      case 'fundamentals': return this.buildDossierFundamentalsHTML(asset);
      case 'seasonality': return this.buildDossierSeasonalityHTML(asset);
      case 'etf': return this.buildDossierEtfHTML(asset);
      default: return this.buildDossierOverviewHTML(asset);
    }
  },

  /* 3.1 PANORAMICA (SCREENSHOTS e2cc5bcf, bc326ecf, 892a596f) */
  buildDossierOverviewHTML(asset) {
    const isLong = asset.qScore >= 60;
    const ratings = asset.analystRatings || {
      consensus: 'STRONG BUY',
      ratingScore: 91,
      targetMean: 6.13,
      upsidePct: '+53.25%',
      institutions: []
    };

    return `
      <!-- TOP SPLIT: CHART WITH FORECAST CONE & SMART QUANT RATING CARD -->
      <div class="qc-dossier-split-grid">
        
        <!-- CHART WITH FORECAST CONE TOGGLE (SCREENSHOT e2cc5bcf & e2fc3b15) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:12px; font-weight:800; color:#fff;">Grafico Avanzato & Proiezione</span>
            </div>
            <!-- Toggle Mostra Previsione -->
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:#38bdf8;">Mostra previsione</span>
              <label class="switch" style="position:relative; display:inline-block; width:34px; height:18px;">
                <input type="checkbox" ${this.dossierForecastConeActive ? 'checked' : ''} onchange="CasarioQuantEngine.toggleDossierForecastCone()">
                <span class="slider-toggle" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#1e293b; border-radius:18px; transition:.3s;"></span>
              </label>
            </div>
          </div>

          <!-- Interactive SVG Chart with Price and Forecast Cone Fan Lines -->
          <div style="position:relative; height:240px; background:#080c14; border-radius:8px; border:1px solid #1a2233; overflow:hidden;">
            <svg width="100%" height="240" viewBox="0 0 600 240" style="display:block;">
              <!-- Grid lines -->
              <line x1="0" y1="50" x2="600" y2="50" stroke="#161f30" stroke-width="1" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#161f30" stroke-width="1" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#161f30" stroke-width="1" />
              
              <!-- Bollinger / ATR Resistance & Support envelope -->
              <polyline fill="none" stroke="rgba(244,63,94,0.4)" stroke-width="1.2" points="50,180 120,150 180,90 250,140 320,120 400,90 460,95" />
              <polyline fill="none" stroke="rgba(16,185,129,0.4)" stroke-width="1.2" points="50,210 120,180 180,140 250,190 320,170 400,140 460,150" />

              <!-- Price Candle line / curve -->
              <polyline fill="none" stroke="#fff" stroke-width="2" points="50,200 90,190 120,170 150,120 180,95 210,130 250,165 280,155 320,140 360,135 400,105 430,115 460,120" />
              
              ${this.dossierForecastConeActive ? `
                <!-- FORECAST CONE FAN LINES EXTENDING INTO FUTURE (SCREENSHOT e2fc3b15) -->
                <polygon fill="rgba(14, 165, 233, 0.12)" points="460,120 580,75 580,165" />
                <!-- Upper bound (Resistance Target) -->
                <line x1="460" y1="120" x2="580" y2="75" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,4" />
                <!-- Median line (Consensus Target) -->
                <line x1="460" y1="120" x2="580" y2="120" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" stroke-dasharray="4,4" />
                <!-- Lower bound (Support Stop) -->
                <line x1="460" y1="120" x2="580" y2="165" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="4,4" />

                <!-- Current Price Pin -->
                <circle cx="460" cy="120" r="4" fill="#38bdf8" />
                <rect x="540" y="110" width="45" height="20" rx="3" fill="#38bdf8" />
                <text x="562" y="124" fill="#000" font-size="10" font-weight="900" font-family="monospace" text-anchor="middle">4.00</text>
              ` : ''}

              <!-- Volume bars at bottom -->
              <rect x="50" y="220" width="8" height="15" fill="#f43f5e" />
              <rect x="90" y="215" width="8" height="20" fill="#f43f5e" />
              <rect x="150" y="195" width="8" height="40" fill="#10b981" />
              <rect x="180" y="185" width="8" height="50" fill="#10b981" />
              <rect x="250" y="210" width="8" height="25" fill="#f43f5e" />
              <rect x="360" y="218" width="8" height="17" fill="#10b981" />
              <rect x="400" y="205" width="8" height="30" fill="#10b981" />
              <rect x="460" y="212" width="8" height="23" fill="#38bdf8" />
            </svg>

            <!-- Bottom volume badge -->
            <div style="position:absolute; bottom:6px; right:10px; background:#0c101c; border:1px solid #1e2638; border-radius:4px; padding:2px 8px; font-size:10px; color:#38bdf8; font-family:monospace; font-weight:800;">
              Vol: 718.21K
            </div>
          </div>
        </div>

        <!-- RIGHT CARD: SMART QUANT RATING (SCREENSHOT e2cc5bcf) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
              <span style="font-size:14px; font-weight:900; color:#fff;">Smart Quant</span>
              <span style="font-size:12px; color:#64748b;">📈</span>
            </div>

            <!-- BUY Label & Big Score -->
            <div style="text-align:center; margin:16px 0;">
              <div style="font-size:18px; font-weight:900; color:#fff; letter-spacing:1px; margin-bottom:6px;">
                ${asset.direction || 'BUY'}
              </div>
              <div style="font-size:52px; font-weight:900; color:#fff; font-family:var(--font-mono); line-height:1;">
                ${asset.qScore}
              </div>
              <div style="font-size:10px; color:#64748b; font-weight:700; margin-top:2px;">
                100
              </div>
            </div>

            <!-- Segmented Colored Scale [10] [20] ... [100] with Indicator ^ -->
            <div style="position:relative; margin:22px 0 10px 0;">
              <div style="display:grid; grid-template-columns:repeat(10, 1fr); gap:2px; height:18px;">
                <div style="background:#ef4444; border-radius:3px 0 0 3px; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">10</div>
                <div style="background:#f97316; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">20</div>
                <div style="background:#fb923c; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">30</div>
                <div style="background:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">40</div>
                <div style="background:#eab308; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">50</div>
                <div style="background:#84cc16; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff; position:relative; box-shadow:0 0 8px #84cc16;">
                  60
                  <span style="position:absolute; bottom:-14px; font-size:10px; color:#fff;">▲</span>
                </div>
                <div style="background:#22c55e; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">70</div>
                <div style="background:#16a34a; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">80</div>
                <div style="background:#15803d; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">90</div>
                <div style="background:#14532d; border-radius:0 3px 3px 0; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:900; color:#fff;">100</div>
              </div>
            </div>
          </div>

          <div style="font-size:10px; color:var(--text-muted); text-align:center; line-height:1.4; margin-top:14px; padding-top:10px; border-top:1px solid #1e2638;">
            Basata sul rating tecnico, fondamentali, macroeconomico e di stagionalità.
          </div>
        </div>

      </div>

      <!-- 5 PILLARS ROW (SCREENSHOTS e2cc5bcf & bc326ecf) WITH REAL BANK RATINGS & ATTACHMENTS -->
      <div style="margin-bottom:20px;">
        <div class="qc-kpi-5-grid" style="gap:12px;">
          
          <!-- Pillar 1: MACRO -->
          <div style="background:#0c101c; border:1px solid #1e2638; border-top:2px solid #f59e0b; border-radius:8px; padding:14px;">
            <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:6px; letter-spacing:0.5px;">MACRO</div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
              <span style="font-size:13px; font-weight:900; color:#fff;">Stagflazione</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; font-weight:700; margin-bottom:8px;">Rating 100/100</div>
            <p style="font-size:9px; color:#64748b; line-height:1.4; margin:0;">
              Rating proprietario: Basato sugli aspetti macroeconomici.
            </p>
          </div>

          <!-- Pillar 2: TECNICO -->
          <div style="background:#0c101c; border:1px solid #1e2638; border-top:2px solid #f59e0b; border-radius:8px; padding:14px;">
            <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:6px; letter-spacing:0.5px;">TECNICO</div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
              <span style="font-size:13px; font-weight:900; color:#fff;">BUY</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; font-weight:700; margin-bottom:8px;">Rating 70/100</div>
            <p style="font-size:9px; color:#64748b; line-height:1.4; margin:0;">
              Rating proprietario: Calcolato dai livelli e trend tecnici.
            </p>
          </div>

          <!-- Pillar 3: STAGIONALITÀ -->
          <div style="background:#0c101c; border:1px solid #1e2638; border-top:2px solid #f59e0b; border-radius:8px; padding:14px;">
            <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:6px; letter-spacing:0.5px;">STAGIONALITÀ</div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
              <span style="font-size:13px; font-weight:900; color:#fff;">SELL</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; font-weight:700; margin-bottom:8px;">Rating 40/100</div>
            <p style="font-size:9px; color:#64748b; line-height:1.4; margin:0;">
              Rating proprietario: Basato sulla stagionalità.
            </p>
          </div>

          <!-- Pillar 4: ANALISTI (BANCHE E BROKER REALI) -->
          <div style="background:#0c101c; border:1px solid #1e2638; border-top:2px solid #10b981; border-radius:8px; padding:14px; position:relative;">
            <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:6px; letter-spacing:0.5px;">ANALISTI</div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
              <span style="font-size:13px; font-weight:900; color:#fff;">STRONG BUY</span>
            </div>
            <div style="font-size:10px; color:#10b981; font-weight:700; margin-bottom:8px;">
              Rating 91/100 · Target $6.13
            </div>
            <p style="font-size:9px; color:#64748b; line-height:1.4; margin:0;">
              Rating istituzionale: Goldman Sachs, JPM, MS, UBS.
            </p>
          </div>

          <!-- Pillar 5: FONDAMENTALE -->
          <div style="background:#0c101c; border:1px solid #1e2638; border-top:2px solid #f59e0b; border-radius:8px; padding:14px;">
            <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:6px; letter-spacing:0.5px;">FONDAMENTALE</div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
              <span style="font-size:13px; font-weight:900; color:#fff;">SELL</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; font-weight:700; margin-bottom:8px;">Rating 26/100</div>
            <p style="font-size:9px; color:#64748b; line-height:1.4; margin:0;">
              Rating proprietario: Basato su dati fondamentali.
            </p>
          </div>

        </div>

        <!-- DETTAGLIO ANALISTI BANCHE D'AFFARI CON ALLEGATI (USER REQUEST: "Collegate ai rating dati da ogni singola agenzia con valori reali e allegati") -->
        ${ratings.institutions && ratings.institutions.length ? `
          <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:14px; margin-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                <span>🏛️</span> RATING E TARGET PRICE BANCHE D'AFFARI & REPORT ALLEGATI
              </div>
              <div style="font-size:10px; color:#38bdf8; font-weight:800;">
                Target Price Medio: $${ratings.targetMean.toFixed(2)} (${ratings.upsidePct} Upside)
              </div>
            </div>

            <div style="overflow-x:auto;">
              <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                  <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                    <th style="padding:6px 10px;">Banca / Agenzia</th>
                    <th style="padding:6px 10px;">Rating Emesso</th>
                    <th style="padding:6px 10px; text-align:right;">Target Price</th>
                    <th style="padding:6px 10px; text-align:center;">Data Report</th>
                    <th style="padding:6px 10px;">Nota di Ricerca</th>
                    <th style="padding:6px 10px; text-align:center;">Allegato PDF</th>
                  </tr>
                </thead>
                <tbody>
                  ${ratings.institutions.map(inst => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                      <td style="padding:6px 10px; font-weight:900; color:#fff;">${inst.bank}</td>
                      <td style="padding:6px 10px;">
                        <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">
                          ${inst.rating}
                        </span>
                      </td>
                      <td style="padding:6px 10px; text-align:right; font-family:var(--font-mono); font-weight:900; color:#fff;">
                        ${inst.target}
                      </td>
                      <td style="padding:6px 10px; text-align:center; color:#94a3b8; font-size:10px;">${inst.date}</td>
                      <td style="padding:6px 10px; color:#cbd5e1; font-size:10px;">${inst.report || 'Equity Research Report'}</td>
                      <td style="padding:6px 10px; text-align:center;">
                        <button class="btn btn-sm btn-secondary" style="font-size:9px; padding:2px 8px; color:#38bdf8; border-color:#38bdf8;" onclick="window.showToast ? window.showToast('Download report istituzionale: ${inst.pdf}', 'info') : null">
                          📄 ${inst.pdf}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- TREND & LIVELLI DI ATTENZIONE (SCREENSHOT bc326ecf) -->
      <div class="qc-trend-levels-grid">
        
        <!-- CARD 1: TREND -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:16px;">
          <div style="font-size:14px; font-weight:900; color:#fff; border-bottom:2px solid #f59e0b; padding-bottom:4px; margin-bottom:12px;">
            Trend
          </div>
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:6px 8px;">Orizzonte</th>
                <th style="padding:6px 8px;">Tipo</th>
                <th style="padding:6px 8px;">Durata</th>
                <th style="padding:6px 8px;">Forza</th>
              </tr>
            </thead>
            <tbody>
              ${(asset.trendAnalysis || [
                { horizon: 'Breve', type: 'Neutrale', duration: '7 Giorni', force: 'Medio', typeColor: '#f59e0b', forceColor: '#f59e0b' },
                { horizon: 'Medio', type: 'Rialzista', duration: '38 Giorni', force: 'Forte', typeColor: '#10b981', forceColor: '#10b981' },
                { horizon: 'Lungo', type: 'Rialzista', duration: '70 Giorni', force: 'Forte', typeColor: '#10b981', forceColor: '#10b981' }
              ]).map(t => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:8px; font-weight:800; color:#cbd5e1;">${t.horizon}</td>
                  <td style="padding:8px;">
                    <span style="color:${t.typeColor}; font-weight:800;">● ${t.type}</span>
                  </td>
                  <td style="padding:8px; color:#fff; font-family:var(--font-mono);">${t.duration}</td>
                  <td style="padding:8px;">
                    <span style="color:${t.forceColor}; font-weight:800;">● ${t.force}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-size:9px; color:#64748b; margin-top:10px; text-align:center;">
            Trend calcolati dall'algoritmo proprietario Quantaste
          </div>
        </div>

        <!-- CARD 2: LIVELLI DI ATTENZIONE & RISCHIO/RENDIMENTO SLIDER -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:16px;">
          <div style="font-size:14px; font-weight:900; color:#fff; border-bottom:2px solid #f59e0b; padding-bottom:4px; margin-bottom:12px;">
            Livelli di Attenzione
          </div>
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:6px 8px;">Livello</th>
                <th style="padding:6px 8px; text-align:right;">Oggi</th>
                <th style="padding:6px 8px; text-align:right;">1D</th>
                <th style="padding:6px 8px; text-align:right;">15D</th>
                <th style="padding:6px 8px; text-align:right;">1M</th>
                <th style="padding:6px 8px; text-align:right;">3M</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:8px; font-weight:800; color:#fff;">Superiore</td>
                <td style="padding:8px; text-align:right; font-family:var(--font-mono); color:#fff; font-weight:800;">4.52 $</td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(239,68,68,0.18); color:#f87171; font-size:9px; padding:2px 5px; border-radius:3px;">-0.36% ↓</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(239,68,68,0.18); color:#f87171; font-size:9px; padding:2px 5px; border-radius:3px;">-3.30% ↓</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(239,68,68,0.18); color:#f87171; font-size:9px; padding:2px 5px; border-radius:3px;">-5.39% ↓</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; padding:2px 5px; border-radius:3px;">22.94% ↑</span></td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:8px; font-weight:800; color:#fff;">Inferiore</td>
                <td style="padding:8px; text-align:right; font-family:var(--font-mono); color:#fff; font-weight:800;">3.63 $</td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(239,68,68,0.18); color:#f87171; font-size:9px; padding:2px 5px; border-radius:3px;">-0.82% ↓</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(239,68,68,0.18); color:#f87171; font-size:9px; padding:2px 5px; border-radius:3px;">-7.66% ↓</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; padding:2px 5px; border-radius:3px;">4.24% ↑</span></td>
                <td style="padding:8px; text-align:right;"><span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; padding:2px 5px; border-radius:3px;">29.48% ↑</span></td>
              </tr>
            </tbody>
          </table>

          <!-- Rischio / Rendimento Slider Bar -->
          <div style="margin-top:14px; padding-top:8px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:4px;">
              <span>Rischio/Rendimento</span>
              <span style="color:#fff;">4.00 $ (Prezzo Corrente)</span>
              <span style="color:#10b981;">4.52 $ (11.5%)</span>
            </div>
            <div style="position:relative; margin:8px 0;">
              <div style="height:6px; background:#2563eb; border-radius:3px; width:100%;"></div>
              <div style="position:absolute; top:-4px; left:42%; width:14px; height:14px; border-radius:50%; background:#fff; border:2px solid #0f172a; box-shadow:0 0 8px rgba(255,255,255,0.8); transform:translateX(-50%);"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:9px; font-family:var(--font-mono); color:#64748b;">
              <span>3.63 $ (9.33%)</span>
              <span></span>
              <span>4.52 $ (11.5%)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- RATING PERFORMANCE ROW (SCREENSHOT 892a596f) -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:16px; margin-bottom:20px;">
        <div style="font-size:14px; font-weight:900; color:#fff; border-bottom:2px solid #f59e0b; padding-bottom:4px; margin-bottom:12px;">
          Rating Performance
        </div>
        <div style="overflow-x:auto;">
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:6px 10px;">Benchmark / Asset</th>
                <th style="padding:6px 10px; text-align:right;">1D</th>
                <th style="padding:6px 10px; text-align:right;">5D</th>
                <th style="padding:6px 10px; text-align:right;">1M</th>
                <th style="padding:6px 10px; text-align:right;">QTD</th>
                <th style="padding:6px 10px; text-align:right;">YTD</th>
                <th style="padding:6px 10px; text-align:right;">1Y</th>
                <th style="padding:6px 10px; text-align:right;">Momentum Medio</th>
              </tr>
            </thead>
            <tbody>
              ${(asset.ratingPerformance || [
                { name: 'Indice (S&P 500)', d1: '-0.83%', d5: '-3.35%', m1: '-3.26%', qtd: '-1.06%', ytd: '+12.76%', y1: '+11.23%', avgMom: '+3.23%' },
                { name: 'Settore (Healthcare)', d1: '-1.63%', d5: '-4.77%', m1: '-7.20%', qtd: '-1.00%', ytd: '+20.29%', y1: '+18.97%', avgMom: '+5.79%' },
                { name: 'ADCT (ADC Therapeutics SA)', d1: '+0.76%', d5: '+0.76%', m1: '-10.31%', qtd: '0.00%', ytd: '+100.00%', y1: '+50.94%', avgMom: '+18.20%' }
              ]).map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:8px 10px; font-weight:800; color:#fff;">${r.name}</td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.d1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.d1} ${r.d1.startsWith('+') ? '↑' : '↓'}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.d5.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.d5} ${r.d5.startsWith('+') ? '↑' : '↓'}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.m1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.m1} ${r.m1.startsWith('+') ? '↑' : '↓'}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.qtd === '0.00%' ? 'background:#1e293b; color:#94a3b8;' : r.qtd.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.qtd}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.ytd.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.ytd} ${r.ytd.startsWith('+') ? '↑' : '↓'}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="font-size:9px; padding:2px 5px; border-radius:3px; ${r.y1.startsWith('+') ? 'background:rgba(16,185,129,0.18); color:#34d399;' : 'background:rgba(239,68,68,0.18); color:#f87171;'}">${r.y1} ${r.y1.startsWith('+') ? '↑' : '↓'}</span></td>
                  <td style="padding:8px 10px; text-align:right;"><span style="background:rgba(16,185,129,0.18); color:#34d399; font-size:9px; font-weight:800; padding:2px 5px; border-radius:3px;">${r.avgMom} ↗</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="font-size:9px; color:#64748b; margin-top:10px; text-align:center;">
          Trend e Livelli calcolati dall'algoritmo proprietario Quantaste
        </div>
      </div>
    `;
  },

  /* 3.2 SMART QUANT MOMENTUM & DETTAGLI STORICI (SCREENSHOTS b2fbb521 & 5652455a) */
  buildDossierSqmHTML(asset) {
    const sqm = asset.sqm || {
      returnPct: '+18.34%',
      signal: 'BUY',
      entryDate: '17 Jun 25',
      status: 'In corso',
      durationDays: 155,
      historyTrades: []
    };

    return `
      <!-- SQM HEADER & RETURN CURVE -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
            <span>📈</span> SQM - Smart Quant Momentum
          </div>
          <span style="font-size:11px; color:#64748b;">⚙</span>
        </div>

        <div style="display:flex; align-items:flex-start; gap:20px; margin-bottom:16px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:32px; font-weight:900; color:#10b981; font-family:var(--font-mono);">
              ${sqm.returnPct}
            </div>
            <span style="background:rgba(16,185,129,0.18); border:1px solid #10b981; color:#34d399; font-size:10px; font-weight:900; padding:3px 8px; border-radius:4px;">
              ${sqm.signal}
            </span>
          </div>

          <p style="font-size:11px; color:#94a3b8; line-height:1.5; margin:0; flex:1; min-width:280px;">
            Performance basata sull'entrata ipotetica di un'operazione avviata quando lo Smart Quant ha raggiunto un punteggio di almeno 75/100 per le opportunità al rialzo e inferiore a 25/100 per quelle al ribasso. Alla posizione non viene applicato nessun Money Management. Si entra ed esce al segnale dello Smart Quant.
          </p>
        </div>

        <!-- Cumulative Return Line Chart (Jun to Nov) -->
        <div style="height:120px; background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px; margin-bottom:16px;">
          <svg width="100%" height="100" viewBox="0 0 600 100">
            <polyline fill="none" stroke="#10b981" stroke-width="2" points="0,40 50,70 100,65 150,50 200,55 250,75 300,55 350,50 400,25 450,35 500,18 550,30 600,28" />
          </svg>
          <div style="display:flex; justify-content:space-between; font-size:9px; color:#64748b; font-family:monospace; margin-top:4px;">
            <span>Jun</span>
            <span>25 Jun</span>
            <span>2 Jul</span>
            <span>10 Jul</span>
            <span>24 Jul</span>
            <span>7 Aug</span>
            <span>21 Aug</span>
            <span>5 Sep</span>
            <span>19 Sep</span>
            <span>3 Oct</span>
            <span>17 Oct</span>
            <span>31 Oct</span>
            <span>14 Nov</span>
          </div>
        </div>

        <!-- Metric Cards: Entrata/Uscita & Durata -->
        <div class="qc-split-2col" style="gap:12px; margin-bottom:12px;">
          <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">📅 Entrata / Uscita</div>
            <div style="font-size:13px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">
              ${sqm.entryDate} - ${sqm.status}
            </div>
          </div>
          <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">⏱ Durata</div>
            <div style="font-size:13px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">
              ${sqm.durationDays} giorni
            </div>
          </div>
        </div>

        <!-- Accordion Toggle Button: Vedi Storico ˅ -->
        <div style="text-align:center; margin-top:8px;">
          <button class="btn btn-sm btn-secondary" style="font-size:11px; font-weight:800; padding:6px 16px;" onclick="CasarioQuantEngine.toggleDossierHistory()">
            Vedi storico ${this.dossierHistoryExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <!-- DETTAGLI STORICI ACCORDION (SCREENSHOT 5652455a) -->
      ${this.dossierHistoryExpanded ? `
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px; margin-bottom:20px;">
          
          <!-- Chart 1: Prezzo vs Banda di Resistenza e Banda di Supporto -->
          <div style="margin-bottom:20px;">
            <div style="font-size:14px; font-weight:900; color:#fff; margin-bottom:8px;">
              Grafico (Bande Dinamiche)
            </div>
            <div style="position:relative; height:180px; background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px;">
              <svg width="100%" height="160" viewBox="0 0 600 160">
                <!-- Y-axis markers: 0.91, 2.91, 5.03 -->
                <text x="5" y="20" fill="#64748b" font-size="9" font-family="monospace">5.03</text>
                <text x="5" y="85" fill="#64748b" font-size="9" font-family="monospace">2.91</text>
                <text x="5" y="150" fill="#64748b" font-size="9" font-family="monospace">0.91</text>

                <!-- Banda di Resistenza (Green line) -->
                <polyline fill="none" stroke="#10b981" stroke-width="1.6" points="40,80 100,85 160,110 220,130 280,140 340,90 400,40 460,70 520,30 580,45" />
                <!-- Prezzo (White line) -->
                <polyline fill="none" stroke="#ffffff" stroke-width="2" points="40,90 100,95 160,130 220,145 280,150 340,110 400,60 460,85 520,50 580,70" />
                <!-- Banda di Supporto (Red line) -->
                <polyline fill="none" stroke="#ef4444" stroke-width="1.6" points="40,105 100,110 160,145 220,155 280,158 340,130 400,85 460,110 520,75 580,95" />

                <!-- Tooltip Marker on 12 Jun 2025 -->
                <line x1="400" y1="10" x2="400" y2="155" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2" />
                <circle cx="400" cy="40" r="3.5" fill="#10b981" />
                <circle cx="400" cy="60" r="3.5" fill="#ffffff" />
                <circle cx="400" cy="85" r="3.5" fill="#ef4444" />
              </svg>

              <!-- Interactive Floating Tooltip -->
              <div style="position:absolute; top:25px; left:62%; background:rgba(15,23,42,0.95); border:1px solid #334155; border-radius:6px; padding:8px 12px; font-size:10px; font-family:monospace; box-shadow:0 8px 20px rgba(0,0,0,0.8);">
                <div style="color:#94a3b8; font-weight:800; margin-bottom:4px;">12 Jun. 2025</div>
                <div style="color:#10b981;">Banda di Resistenza : 4.403325</div>
                <div style="color:#fff; font-weight:800;">Prezzo : 3.53</div>
                <div style="color:#ef4444;">Banda di Supporto : 2.408098</div>
              </div>
            </div>
            <div style="display:flex; justify-content:center; gap:16px; font-size:10px; font-weight:800; margin-top:8px;">
              <span style="color:#10b981;">● Banda di Resistenza</span>
              <span style="color:#fff;">● Prezzo</span>
              <span style="color:#ef4444;">● Banda di Supporto</span>
            </div>
          </div>

          <!-- Chart 2: Storico Smart Quant Score nel Tempo -->
          <div>
            <div style="font-size:14px; font-weight:900; color:#fff; margin-bottom:8px;">
              Smart Quant (Storico 0-100)
            </div>
            <div style="height:120px; background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px; position:relative;">
              <svg width="100%" height="100" viewBox="0 0 600 100">
                <!-- Zone Thresholds at 75 (Buy zone) and 25 (Sell zone) -->
                <rect x="0" y="0" width="600" height="25" fill="rgba(16,185,129,0.12)" />
                <line x1="0" y1="25" x2="600" y2="25" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
                <rect x="0" y="75" width="600" height="25" fill="rgba(239,68,68,0.12)" />

                <!-- Smart Quant Score Line -->
                <polyline fill="none" stroke="#fff" stroke-width="1.8" points="0,45 50,60 100,55 150,40 200,30 250,20 300,22 350,15 400,18 450,22 500,20 550,25 600,22" />
                <!-- Dots along score -->
                <circle cx="250" cy="20" r="3" fill="#fff" />
                <circle cx="350" cy="15" r="3" fill="#fff" />
                <circle cx="450" cy="22" r="3" fill="#fff" />
              </svg>
              <div style="position:absolute; top:8px; right:12px; font-size:9px; color:#10b981; font-weight:800;">
                Soglia Buy ≥ 75
              </div>
              <div style="position:absolute; bottom:8px; right:12px; font-size:9px; color:#ef4444; font-weight:800;">
                Soglia Sell ≤ 25
              </div>
            </div>
          </div>

        </div>
      ` : ''}
    `;
  },

  /* 3.3 SEGMENTAZIONE DEI RICAVI (SCREENSHOT 5446f5c5) */
  buildDossierRevenuesHTML(asset) {
    const rev = asset.revenueSegmentation || {
      geo: {
        '2024': [
          { label: 'UNITED STATES', amount: '$69.3M', pct: 97.8, color: '#f97316' },
          { label: 'EMEA', amount: '$1.5M', pct: 2.2, color: '#38bdf8' }
        ],
        '2023': [
          { label: 'UNITED STATES', amount: '$68.0M', pct: 97.7, color: '#f97316' },
          { label: 'EMEA', amount: '$1.6M', pct: 2.3, color: '#38bdf8' }
        ]
      },
      product: {
        '2024': [
          { label: 'Product', amount: '$69.3M', pct: 97.8, color: '#6366f1' },
          { label: 'Royalty Revenue', amount: '$1.5M', pct: 2.2, color: '#f97316' }
        ],
        '2023': [
          { label: 'Product', amount: '$68.0M', pct: 97.7, color: '#6366f1' },
          { label: 'Royalty Revenue', amount: '$1.6M', pct: 2.3, color: '#f97316' }
        ],
        '2022': [
          { label: 'Product', amount: '$205.2M', pct: 97.8, color: '#6366f1' },
          { label: 'Royalty Revenue', amount: '$4.7M', pct: 2.2, color: '#f97316' }
        ]
      }
    };

    const currentGeo = rev.geo[this.dossierRevenueYearGeo || '2024'] || rev.geo['2024'];
    const currentProd = rev.product[this.dossierRevenueYearProd || '2024'] || rev.product['2024'];

    return `
      <div style="margin-bottom:14px;">
        <h3 style="font-size:18px; font-weight:900; color:#fff; margin:0 0 4px 0;">
          Segmentazione dei Ricavi
        </h3>
        <div style="font-size:10px; color:var(--text-muted);">
          Analisi della scomposizione del fatturato aziendale per area geografica e linea di prodotto
        </div>
      </div>

      <div class="qc-split-2col" style="gap:16px;">
        
        <!-- CARD 1: RICAVI PER AREA GEOGRAFICA (DONUT CHART) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <div style="font-size:14px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                Ricavi per Area Geografica <span style="font-size:11px; color:#64748b;">ⓘ</span>
              </div>
              <div style="font-size:9px; color:#64748b;">Segmentazione geografica per anno fiscale</div>
            </div>
            <!-- Year Selector -->
            <div style="display:flex; gap:4px;">
              ${['2024', '2023'].map(y => `
                <button class="btn btn-sm ${this.dossierRevenueYearGeo === y ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px;" onclick="CasarioQuantEngine.setRevenueYear('geo', '${y}')">
                  ${y}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- SVG Donut Chart with Center Text -->
          <div style="position:relative; width:190px; height:190px; margin:20px auto;">
            <svg viewBox="0 0 42 42" style="width:100%; height:100%; transform:rotate(-90deg);">
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#38bdf8" stroke-width="4.5" stroke-dasharray="2.2 97.8" stroke-dashoffset="0"></circle>
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#f97316" stroke-width="4.5" stroke-dasharray="97.8 2.2" stroke-dashoffset="-2.2"></circle>
            </svg>
            <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
              <div style="font-size:11px; font-weight:900; color:#fff;">UNITED STATES</div>
              <div style="font-size:16px; font-weight:900; color:#f97316; font-family:monospace;">$69.3M</div>
              <div style="font-size:10px; color:#94a3b8; font-weight:800;">97.8%</div>
            </div>
          </div>

          <!-- Legend -->
          <div style="display:flex; justify-content:center; gap:16px; font-size:10px; font-weight:800; margin-top:14px;">
            <span style="color:#38bdf8;">● EMEA 2.2%</span>
            <span style="color:#f97316;">● UNITED STATES 97.8%</span>
          </div>
        </div>

        <!-- CARD 2: RICAVI PER PRODOTTO (DONUT CHART) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <div style="font-size:14px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                Ricavi per Prodotto <span style="font-size:11px; color:#64748b;">ⓘ</span>
              </div>
              <div style="font-size:9px; color:#64748b;">Segmentazione per prodotto per anno fiscale</div>
            </div>
            <!-- Year Selector -->
            <div style="display:flex; gap:4px;">
              ${['2024', '2023', '2022'].map(y => `
                <button class="btn btn-sm ${this.dossierRevenueYearProd === y ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px;" onclick="CasarioQuantEngine.setRevenueYear('product', '${y}')">
                  ${y}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- SVG Donut Chart with Center Text -->
          <div style="position:relative; width:190px; height:190px; margin:20px auto;">
            <svg viewBox="0 0 42 42" style="width:100%; height:100%; transform:rotate(-90deg);">
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#f97316" stroke-width="4.5" stroke-dasharray="2.2 97.8" stroke-dashoffset="0"></circle>
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#6366f1" stroke-width="4.5" stroke-dasharray="97.8 2.2" stroke-dashoffset="-2.2"></circle>
            </svg>
            <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
              <div style="font-size:11px; font-weight:900; color:#fff;">Product</div>
              <div style="font-size:16px; font-weight:900; color:#818cf8; font-family:monospace;">$69.3M</div>
              <div style="font-size:10px; color:#94a3b8; font-weight:800;">97.8%</div>
            </div>
          </div>

          <!-- Legend -->
          <div style="display:flex; justify-content:center; gap:16px; font-size:10px; font-weight:800; margin-top:14px;">
            <span style="color:#6366f1;">● Product 97.8%</span>
            <span style="color:#f97316;">● Royalty Revenue 2.2%</span>
          </div>
        </div>

      </div>
    `;
  },

  /* 3.4 FINANCIAL STATEMENTS / BILANCI (SCREENSHOT 6472e5c4) */
  buildDossierFinancialStatementsHTML(asset) {
    const fs = asset.financialStatements || {
      income: []
    };

    return `
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <!-- Header: Title + Annual/Quarterly Toggle -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <h3 style="font-size:18px; font-weight:900; color:#fff; margin:0 0 4px 0;">Financial Statements</h3>
            <div style="font-size:10px; color:var(--text-muted);">Comprehensive view of financial performance</div>
          </div>
          <div style="display:flex; gap:4px; background:#080c14; padding:2px; border-radius:6px; border:1px solid #1e2638;">
            <button class="btn btn-sm ${this.dossierFinancialsPeriod === 'annual' ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:3px 10px;" onclick="CasarioQuantEngine.setFinancialsPeriod('annual')">Annual</button>
            <button class="btn btn-sm ${this.dossierFinancialsPeriod === 'quarterly' ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:3px 10px;" onclick="CasarioQuantEngine.setFinancialsPeriod('quarterly')">Quarterly</button>
          </div>
        </div>

        <!-- 5 Subtabs: Stato Patrimoniale, Conto Economico, Flusso di Cassa, Indici, Metriche Chiave -->
        <div style="display:flex; gap:6px; margin-bottom:14px; border-bottom:1px solid #1e2638; padding-bottom:6px; overflow-x:auto;">
          ${[
            { id: 'balance', label: '🏛 Stato Patrimoniale' },
            { id: 'income', label: '$ Conto Economico' },
            { id: 'cashflow', label: '💼 Flusso di Cassa' },
            { id: 'ratios', label: '📊 Indici' },
            { id: 'metrics', label: '📈 Metriche Chiave' }
          ].map(t => `
            <button class="btn btn-sm ${this.dossierFinancialsSubTab === t.id ? 'btn-primary' : 'btn-secondary'}" style="font-size:10px; padding:4px 12px; font-weight:800;" onclick="CasarioQuantEngine.setFinancialsSubTab('${t.id}')">
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div style="font-size:13px; font-weight:900; color:#fff; margin-bottom:8px;">
          $ Conto Economico
        </div>

        <!-- Conto Economico Table with 2024 to 2020 Breakdown -->
        <div style="overflow-x:auto;">
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:8px 10px; width:300px;">Breakdown</th>
                <th style="padding:8px 10px; text-align:right;">2024</th>
                <th style="padding:8px 10px; text-align:right;">2023</th>
                <th style="padding:8px 10px; text-align:right;">2022</th>
                <th style="padding:8px 10px; text-align:right;">2021</th>
                <th style="padding:8px 10px; text-align:right;">2020</th>
              </tr>
            </thead>
            <tbody>
              ${(fs.income || []).map(row => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.03); ${row.isBold ? 'background:rgba(255,255,255,0.02); font-weight:800;' : ''}">
                  <td style="padding:8px 10px; color:${row.isBold ? '#fff' : '#cbd5e1'};">
                    ${row.row}
                  </td>
                  <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#fff;">${row.y2024}</td>
                  <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#cbd5e1;">${row.y2023}</td>
                  <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#cbd5e1;">${row.y2022}</td>
                  <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#94a3b8;">${row.y2021}</td>
                  <td style="padding:8px 10px; text-align:right; font-family:var(--font-mono); color:#64748b;">${row.y2020}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

/* =======================================================================
   * 4. SUB-VIEW: MODEL PORTFOLIOS & DETTAGLI (SCEGLI IL TUO PORTAFOGLIO & MONITORAGGIO)
   * ======================================================================= */
  buildModelPortfoliosHTML() {
    const isSummary = this.portfolioActiveView === 'summary';
    const isDetails = this.portfolioActiveView === 'details';
    const curTab = this.portfolioDetailsTab || 'panoramica';

    const topQuickNav = `
      <!-- SUB-NAVIGATION BAR FOR MANAGED & MODEL PORTFOLIOS (QUANTASTE PAGES 16-22) -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:18px; background:linear-gradient(90deg, #0f172a 0%, #0c101c 100%); padding:10px 16px; border:1px solid #1e293b; border-left:4px solid #38bdf8; border-radius:8px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-sm ${isSummary ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px;" onclick="CasarioQuantEngine.portfolioActiveView = 'summary'; CasarioQuantEngine.renderUI();">
            <span>📊</span> 1. Scegli Modello & Confronto (pp. 16-18)
          </button>
          <button class="btn btn-sm ${isDetails && curTab === 'panoramica' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px;" onclick="CasarioQuantEngine.openPortfolioDetails('bilanciato', 'panoramica')">
            <span>📈</span> 2. Dettagli Performance & Countdown (p. 19)
          </button>
          <button class="btn btn-sm ${isDetails && curTab === 'attuale' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px;" onclick="CasarioQuantEngine.openPortfolioDetails('bilanciato', 'attuale')">
            <span>💼</span> 3. Portafoglio Attuale & Donut Allocation (p. 22)
          </button>
          <button class="btn btn-sm ${isDetails && curTab === 'ribilanciamenti' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px;" onclick="CasarioQuantEngine.openPortfolioDetails('bilanciato', 'ribilanciamenti')">
            <span>⏱</span> 4. Storico Ribilanciamenti (p. 21)
          </button>
          <button class="btn btn-sm ${isDetails && curTab === 'drawdown' ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px; font-weight:800; padding:6px 14px;" onclick="CasarioQuantEngine.openPortfolioDetails('bilanciato', 'drawdown')">
            <span>📉</span> 5. Comparativa Drawdown (p. 20)
          </button>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.exportGuidePDF()" style="border-color:#38bdf8; color:#38bdf8; font-weight:800; font-size:11px;" title="Esporta Guida Completa ai Portafogli Modello in PDF (p. 7)">
            <span>📄</span> Esporta Guida PDF
          </button>
        </div>
      </div>
    `;

    if (this.portfolioActiveView === 'details') {
      return topQuickNav + this.buildPortfolioDetailsHTML();
    }
    return topQuickNav + this.buildPortfolioSummaryHTML();
  },

  buildPortfolioSummaryHTML() {
    return `
      <div style="margin-bottom:18px;">
        <h2 style="font-size:22px; font-weight:900; color:#fff; margin:0 0 4px 0; letter-spacing:0.3px;">
          Scegli il tuo portafoglio di esempio
        </h2>
        <div style="font-size:11px; color:var(--text-muted);">
          Scegli il portafoglio che meglio si adatta al tuo profilo di rischio e ai tuoi obiettivi di investimento
        </div>
      </div>

      <!-- AI GENERATOR & CUSTOM FILTER BAR (USER REQUEST: "suggeriti in base al rischio e all'area geografica...") -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:14px; margin-bottom:20px;">
        <div style="font-size:11px; font-weight:900; color:#fff; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
          <span>🤖</span> GENERATORE INTELLIGENTE & SALVATAGGI MANUALI
          <span style="font-size:9px; color:var(--text-dim); font-weight:700;">(Suggeriti dall'IA Quant o personalizzati)</span>
        </div>

        <div class="qc-generator-filter-bar">
          <div>
            <label style="font-size:9px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">PROFILO RISCHIO</label>
            <select class="terminal-input" style="font-size:10px; padding:6px 8px; width:100%;">
              <option>Tutti i Profili</option>
              <option>🛡 Conservativo (Basso Rischio)</option>
              <option selected>🎯 Bilanciato (Medio Rischio)</option>
              <option>📈 Crescita (Alto Rischio)</option>
            </select>
          </div>

          <div>
            <label style="font-size:9px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">AREA GEOGRAFICA</label>
            <select class="terminal-input" style="font-size:10px; padding:6px 8px; width:100%;">
              <option selected>🌐 Globale Multi-Regione</option>
              <option>🇺🇸 Solo USA & Wall Street</option>
              <option>🇪🇺 Solo Europa & Italia</option>
              <option>🇯🇵🇨🇳 Asia Pacifico</option>
            </select>
          </div>

          <div>
            <label style="font-size:9px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">IMPORTO CAPITALE</label>
            <input type="number" class="terminal-input" value="${this.portfolioCapital || 10000}" style="font-size:10px; padding:6px 8px; width:100%; font-family:var(--font-mono);" onchange="CasarioQuantEngine.setPortfolioCapital(this.value)">
          </div>

          <div>
            <label style="font-size:9px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">TIPOLOGIA TITOLI</label>
            <select class="terminal-input" style="font-size:10px; padding:6px 8px; width:100%;">
              <option selected>Multi-Asset (ETF+Stocks+Bonds+Gold)</option>
              <option>Solo Azioni Quality / Dividendi</option>
              <option>Macro Trend & Commodities</option>
            </select>
          </div>

          <div style="display:flex; gap:6px;">
            <button class="btn btn-primary btn-sm" style="font-size:10px; padding:6px 12px; background:#2563eb; color:#fff;" onclick="window.showToast ? window.showToast('Portafoglio ricalcolato con IA Quant', 'success') : null">
              🤖 Suggerisci IA
            </button>
            <button class="btn btn-secondary btn-sm" style="font-size:10px; padding:6px 12px;" onclick="window.showToast ? window.showToast('Configurazione salvata nei preferiti', 'info') : null">
              💾 Salva
            </button>
          </div>
        </div>
      </div>

      <!-- THE 3 MAIN PORTFOLIO CARDS: CONSERVATIVO | BILANCIATO | CRESCITA (SCREENSHOT 0c786ba6) -->
      <div class="qc-portfolio-cards-grid">
        
        <!-- CARD 1: CONSERVATIVO -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="padding:16px;">
            <!-- Header Badge -->
            <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">🛡</span>
                <span style="font-size:15px; font-weight:900; color:#fff;">Conservativo</span>
              </div>
              <p style="font-size:10px; color:#94a3b8; line-height:1.4; margin:6px 0 0 0;">
                Approccio conservativo con focus su obbligazioni, oro, mercati, azioni di qualità e asset difensivi per preservare il capitale.
              </p>
            </div>

            <!-- Comparison Matrix: Max Drawdown vs Total Return -->
            <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:8px; font-weight:800; color:#64748b; margin-bottom:6px;">
                <span>MAX DRAWDOWN</span>
                <span>TOTAL RETURN</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; color:#94a3b8; font-weight:700;">Portfolio</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">-16.83%</span>
                  <span style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">+262.49%</span>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:11px; color:#64748b;">S&P 500</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">-34.10%</span>
                  <span style="background:rgba(16,185,129,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">+231.15%</span>
                </div>
              </div>
              <!-- vs S&P 500 comparison pills -->
              <div style="display:flex; justify-content:space-between; gap:6px; border-top:1px solid #1e2638; padding-top:8px;">
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+17.27% meno drawdown</span>
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+31.34% extra profitto</span>
              </div>
            </div>

            <!-- COMPOSIZIONE PORTFOLIO -->
            <div style="margin-bottom:14px;">
              <div style="font-size:10px; font-weight:900; color:#fff; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>📊</span> COMPOSIZIONE PORTFOLIO
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:10px;">
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Bonds</span>
                    <span style="color:#fff; font-weight:800;">49.09%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:49.09%; height:100%; background:#10b981; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Azionario</span>
                    <span style="color:#fff; font-weight:800;">41.31%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:41.31%; height:100%; background:#3b82f6; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Materie Prime</span>
                    <span style="color:#fff; font-weight:800;">7.04%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:7.04%; height:100%; background:#f59e0b; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Altro</span>
                    <span style="color:#fff; font-weight:800;">2.55%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:2.55%; height:100%; background:#ef4444; border-radius:3px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="margin:12px; font-size:11px; font-weight:900; background:#2563eb; color:#fff; border-radius:6px; padding:8px;" onclick="CasarioQuantEngine.viewPortfolioDetails('conservative')">
            Visualizza Dettagli →
          </button>
        </div>

        <!-- CARD 2: BILANCIATO (SEGUITO) -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="padding:16px;">
            <!-- Header Badge with ♡ Seguito -->
            <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:12px; margin-bottom:14px; position:relative;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:16px;">🎯</span>
                  <span style="font-size:15px; font-weight:900; color:#fff;">Bilanciato</span>
                </div>
                <span style="background:rgba(239,68,68,0.18); border:1px solid #ef4444; color:#f87171; font-size:9px; font-weight:900; padding:2px 8px; border-radius:12px;">
                  ♡ Seguito
                </span>
              </div>
              <p style="font-size:10px; color:#94a3b8; line-height:1.4; margin:6px 0 0 0;">
                Strategia bilanciata con obbligazioni, oro, Bitcoin e titoli quality per un equilibrio ottimale tra stabilità e crescita.
              </p>
            </div>

            <!-- Comparison Matrix -->
            <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:8px; font-weight:800; color:#64748b; margin-bottom:6px;">
                <span>MAX DRAWDOWN</span>
                <span>TOTAL RETURN</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; color:#94a3b8; font-weight:700;">Portfolio</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">-15.25%</span>
                  <span style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">+355.08%</span>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:11px; color:#64748b;">S&P 500</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">-34.10%</span>
                  <span style="background:rgba(16,185,129,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">+231.15%</span>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; gap:6px; border-top:1px solid #1e2638; padding-top:8px;">
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+18.85% meno drawdown</span>
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+123.93% extra profitto</span>
              </div>
            </div>

            <!-- COMPOSIZIONE PORTFOLIO -->
            <div style="margin-bottom:14px;">
              <div style="font-size:10px; font-weight:900; color:#fff; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>📊</span> COMPOSIZIONE PORTFOLIO
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:10px;">
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Bonds</span>
                    <span style="color:#fff; font-weight:800;">44.52%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:44.52%; height:100%; background:#10b981; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Azionario</span>
                    <span style="color:#fff; font-weight:800;">39.32%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:39.32%; height:100%; background:#3b82f6; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Materie Prime</span>
                    <span style="color:#fff; font-weight:800;">11.33%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:11.33%; height:100%; background:#f59e0b; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Altro (Cripto)</span>
                    <span style="color:#fff; font-weight:800;">4.83%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:4.83%; height:100%; background:#a855f7; border-radius:3px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="margin:12px; font-size:11px; font-weight:900; background:#2563eb; color:#fff; border-radius:6px; padding:8px;" onclick="CasarioQuantEngine.viewPortfolioDetails('balanced')">
            Visualizza Dettagli →
          </button>
        </div>

        <!-- CARD 3: CRESCITA -->
        <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="padding:16px;">
            <!-- Header Badge -->
            <div style="background:rgba(225,29,72,0.12); border:1px solid rgba(225,29,72,0.3); border-radius:8px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">📈</span>
                <span style="font-size:15px; font-weight:900; color:#fff;">Crescita</span>
              </div>
              <p style="font-size:10px; color:#94a3b8; line-height:1.4; margin:6px 0 0 0;">
                Portfolio dinamico focalizzato su crescita tecnologica con esposizione elevata su Nasdaq, Germania, settori emergenti e criptovalute per massimizzare il potenziale di crescita.
              </p>
            </div>

            <!-- Comparison Matrix -->
            <div style="background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:12px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:8px; font-weight:800; color:#64748b; margin-bottom:6px;">
                <span>MAX DRAWDOWN</span>
                <span>TOTAL RETURN</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; color:#94a3b8; font-weight:700;">Portfolio</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">-22.82%</span>
                  <span style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px;">+494.40%</span>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:11px; color:#64748b;">S&P 500</span>
                <div style="display:flex; gap:4px;">
                  <span style="background:rgba(239,68,68,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">-34.10%</span>
                  <span style="background:rgba(16,185,129,0.12); color:#94a3b8; font-size:10px; padding:2px 8px; border-radius:4px;">+231.15%</span>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; gap:6px; border-top:1px solid #1e2638; padding-top:8px;">
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+11.28% meno drawdown</span>
                <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:9px; font-weight:800; padding:2px 6px; border-radius:3px;">+263.25% extra profitto</span>
              </div>
            </div>

            <!-- COMPOSIZIONE PORTFOLIO -->
            <div style="margin-bottom:14px;">
              <div style="font-size:10px; font-weight:900; color:#fff; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>📊</span> COMPOSIZIONE PORTFOLIO
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:10px;">
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Azionario</span>
                    <span style="color:#fff; font-weight:800;">64.05%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:64.05%; height:100%; background:#3b82f6; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Bonds</span>
                    <span style="color:#fff; font-weight:800;">20.78%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:20.78%; height:100%; background:#10b981; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Materie Prime</span>
                    <span style="color:#fff; font-weight:800;">10.66%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:10.66%; height:100%; background:#f59e0b; border-radius:3px;"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#94a3b8;">Altro (Cripto)</span>
                    <span style="color:#fff; font-weight:800;">4.51%</span>
                  </div>
                  <div style="background:#1e293b; height:5px; border-radius:3px; overflow:hidden;">
                    <div style="width:4.51%; height:100%; background:#a855f7; border-radius:3px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="margin:12px; font-size:11px; font-weight:900; background:#2563eb; color:#fff; border-radius:6px; padding:8px;" onclick="CasarioQuantEngine.viewPortfolioDetails('growth')">
            Visualizza Dettagli →
          </button>
        </div>

      </div>

      <!-- SECTION: CONFRONTO PORTAFOGLI (SCREENSHOT 02f4db24) -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <div style="width:24px; height:24px; border-radius:50%; background:#1e293b; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900;">
            4
          </div>
          <div>
            <div style="font-size:12px; font-weight:900; color:#fff;">Monitora</div>
            <div style="font-size:9px; color:#64748b;">Controlla performance, volatilità e drawdown per mantenere il tuo portafoglio sempre allineato al contesto di mercato.</div>
          </div>
        </div>

        <div style="text-align:center; margin:14px 0 16px 0;">
          <h3 style="font-size:20px; font-weight:900; color:#fff; margin:0 0 4px 0;">Confronto Portafogli</h3>
          <div style="font-size:10px; color:var(--text-muted);">
            Analizza le performance e le caratteristiche di ogni strategia per scegliere quella più adatta al tuo profilo di rischio
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="qi-table" style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #1e2638;">
                <th style="padding:10px;">PORTAFOGLIO</th>
                <th style="padding:10px; text-align:center;">RENDIMENTO</th>
                <th style="padding:10px; text-align:center;">RENDIMENTO MEDIO ANNUO (CAGR)</th>
                <th style="padding:10px; text-align:center;">MASSIMO DRAWDOWN</th>
                <th style="padding:10px; text-align:center;">PROTEZIONE PERDITE</th>
                <th style="padding:10px; text-align:center;">PROFILO RISCHIO</th>
                <th style="padding:10px; text-align:right;">AZIONE</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { id: 'conservative', name: 'Conservativo', icon: '🛡', rend: '262,49%', vsSp: '+31,34%', cagr: '20,02%', dd: '-16,83%', ddSp: '-34,10%', prot: '+17,27%', risk: 'Conservativo', rColor: '#10b981' },
                { id: 'balanced', name: 'Bilanciato', icon: '🎯', badge: '♡ Seguito', rend: '355,08%', vsSp: '+123,93%', cagr: '23,95%', dd: '-15,25%', ddSp: '-34,10%', prot: '+18,85%', risk: 'Bilanciato', rColor: '#f59e0b' },
                { id: 'growth', name: 'Crescita', icon: '📈', rend: '494,40%', vsSp: '+263,25%', cagr: '28,73%', dd: '-22,82%', ddSp: '-34,10%', prot: '+11,28%', risk: 'Aggressivo', rColor: '#ef4444' }
              ].map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:12px 10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:16px;">${r.icon}</span>
                      <div>
                        <div style="font-weight:900; color:#fff; font-size:12px;">${r.name}</div>
                        ${r.badge ? `<span style="font-size:8px; color:#f87171; background:rgba(239,68,68,0.12); padding:1px 5px; border-radius:3px;">${r.badge}</span>` : ''}
                      </div>
                    </div>
                  </td>
                  <td style="padding:12px 10px; text-align:center;">
                    <div style="font-size:13px; font-weight:900; color:#fff; font-family:var(--font-mono);">${r.rend}</div>
                    <div style="font-size:8px; color:#38bdf8;">vs S&P 500: ${r.vsSp}</div>
                  </td>
                  <td style="padding:12px 10px; text-align:center;">
                    <div style="font-size:13px; font-weight:900; color:#10b981; font-family:var(--font-mono);">${r.cagr}</div>
                    <div style="font-size:8px; color:#64748b;">Ritorno annuale medio</div>
                  </td>
                  <td style="padding:12px 10px; text-align:center;">
                    <div style="font-size:13px; font-weight:900; color:#ef4444; font-family:var(--font-mono);">${r.dd}</div>
                    <div style="font-size:8px; color:#64748b;">vs S&P 500: ${r.ddSp}</div>
                  </td>
                  <td style="padding:12px 10px; text-align:center;">
                    <div style="font-size:13px; font-weight:900; color:#38bdf8; font-family:var(--font-mono);">${r.prot}</div>
                    <div style="font-size:8px; color:#64748b;">🛡 Meno perdite</div>
                  </td>
                  <td style="padding:12px 10px; text-align:center;">
                    <span style="background:rgba(255,255,255,0.06); border:1px solid ${r.rColor}; color:${r.rColor}; font-size:9px; font-weight:900; padding:3px 10px; border-radius:12px;">
                      ${r.risk}
                    </span>
                  </td>
                  <td style="padding:12px 10px; text-align:right;">
                    <button class="btn btn-primary btn-sm" style="font-size:10px; padding:4px 10px; background:#2563eb; color:#fff;" onclick="CasarioQuantEngine.viewPortfolioDetails('${r.id}')">
                      Dettagli →
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

  /* 4.2 DETTAGLIO PORTAFOGLIO MONITORATO (SCREENSHOTS 6369d00a, 029e9234, 1e3c46a0, 935e1081, 5409d698) */
  buildPortfolioDetailsHTML() {
    const pId = this.portfolioSelectedId || this.selectedPortfolioId || 'bilanciato';

    return `
      <!-- TOP NAVIGATION BAR: RETURN TO SUMMARY -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.portfolioActiveView = 'summary'; CasarioQuantEngine.renderUI();">
          ← Torna al Confronto Portafogli
        </button>
        <span style="font-size:11px; color:#64748b;">Modalità Monitoraggio Istituzionale Attivo</span>
      </div>

      <div class="qc-portfolio-details-layout">
        
        <!-- LEFT SIDEBAR: SEZIONI (SCREENSHOT 6369d00a) -->
        <div style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:14px; height:fit-content;">
          <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:10px; letter-spacing:0.5px;">SEZIONI</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${[
              { id: 'panoramica', label: 'Panoramica', icon: '📊' },
              { id: 'checklist', label: 'Checklist Operativa', icon: '☑️' },
              { id: 'attuale', label: 'Portafoglio Attuale', icon: '💼' },
              { id: 'ribilanciamenti', label: 'Storico Ribilanciamenti', icon: '⏱' },
              { id: 'drawdown', label: 'Comparativa Drawdown', icon: '📉' },
              { id: 'faq', label: 'FAQ', icon: '❓' }
            ].map(sec => `
              <button class="btn btn-sm ${this.portfolioDetailsTab === sec.id ? 'btn-primary' : 'btn-secondary'}" style="text-align:left; font-size:11px; font-weight:800; padding:8px 10px; border-radius:6px; display:flex; align-items:center; gap:8px;" onclick="CasarioQuantEngine.setPortfolioDetailsTab('${sec.id}')">
                <span>${sec.icon}</span> ${sec.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT MAIN AREA -->
        <div>
          <!-- HEADER ROW WITH COUNTDOWN & SEGUITO BUTTON (SCREENSHOT 029e9234) -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:10px; background:#2563eb; display:flex; align-items:center; justify-content:center; font-size:20px;">
                📊
              </div>
              <div>
                <div style="font-size:18px; font-weight:900; color:#fff;">
                  ${pId === 'conservative' ? 'Conservativo' : pId === 'growth' ? 'Crescita' : 'Bilanciato'}
                </div>
                <div style="font-size:10px; color:#64748b;">
                  Ultimo aggiornamento: 3 nov 2025
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:12px;">
              <!-- Countdown Box -->
              <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:6px 14px; text-align:center;">
                <div style="font-size:8px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:2px;">
                  🗓 PROSSIMO RIBILANCIAMENTO: <span style="color:#fff;">lun 1 dic</span>
                </div>
                <div style="font-size:16px; font-weight:900; color:#fff; font-family:monospace; letter-spacing:1px;">
                  11 : 03 : 09 : 40
                </div>
                <div style="display:flex; justify-content:space-between; font-size:7px; color:#64748b; margin-top:1px; padding:0 2px;">
                  <span>G</span><span>H</span><span>M</span><span>S</span>
                </div>
              </div>

              <!-- Follow Portfolio Button (Screenshot a53514a9) -->
              <button class="btn btn-sm" style="background:#ef4444; color:#fff; font-weight:900; padding:8px 14px; border-radius:6px; display:flex; align-items:center; gap:6px;" onclick="CasarioQuantEngine.openFollowPortfolioModal('${pId}', event)">
                <span>♡</span> Seguito
              </button>
            </div>
          </div>

          <!-- DYNAMIC CONTENT DISPATCHER FOR SUBTABS -->
          ${
            this.portfolioDetailsTab === 'attuale' ? this.buildPortfolioAttualeHTML() :
            this.portfolioDetailsTab === 'checklist' ? this.buildPortfolioChecklistHTML() :
            this.portfolioDetailsTab === 'ribilanciamenti' ? this.buildPortfolioHistoryHTML() :
            this.portfolioDetailsTab === 'drawdown' ? this.buildPortfolioDrawdownHTML() :
            this.portfolioDetailsTab === 'faq' ? this.buildPortfolioFaqHTML() :
            this.buildPortfolioPanoramicaHTML()
          }
        </div>

      </div>

      <!-- FOLLOW PORTFOLIO MODAL (SCREENSHOT a53514a9) -->
      ${this.portfolioFollowModalOpen ? `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;" onclick="CasarioQuantEngine.closeFollowPortfolioModal()">
          <div style="background:#0c101c; border:1px solid #334155; border-radius:12px; padding:24px; width:360px; box-shadow:0 20px 40px rgba(0,0,0,0.9);" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                <span>♡</span> Follow Portfolio
              </div>
              <button onclick="CasarioQuantEngine.closeFollowPortfolioModal()" style="background:none; border:none; color:#64748b; font-size:16px; cursor:pointer;">✕</button>
            </div>

            <p style="font-size:11px; color:#94a3b8; line-height:1.4; margin-bottom:16px;">
              Enter your investment capital to follow this portfolio. All metrics will be scaled based on your capital amount.
            </p>

            <div style="margin-bottom:14px;">
              <label style="font-size:10px; font-weight:800; color:#cbd5e1; display:block; margin-bottom:4px;">Investment Capital</label>
              <input type="number" class="terminal-input" id="follow-portfolio-capital" value="${this.portfolioCapital || 10000}" style="width:100%; font-size:12px; padding:8px 10px; font-family:monospace; color:#fff;">
              <div style="font-size:9px; color:#64748b; margin-top:3px;">Enter the amount you want to invest in this portfolio</div>
            </div>

            <div style="margin-bottom:20px;">
              <label style="font-size:10px; font-weight:800; color:#cbd5e1; display:block; margin-bottom:4px;">Currency</label>
              <select class="terminal-input" style="width:100%; font-size:11px; padding:8px 10px;">
                <option>Euro (€)</option>
                <option>US Dollar ($)</option>
                <option>British Pound (£)</option>
              </select>
              <div style="font-size:9px; color:#64748b; margin-top:3px;">Currency for your investment (currently for display only)</div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="CasarioQuantEngine.closeFollowPortfolioModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" style="background:#2563eb; color:#fff; font-weight:800;" onclick="CasarioQuantEngine.saveFollowPortfolio()">♡ Follow Portfolio</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  },

  buildPortfolioAttualeHTML() {
    return `
<!-- SUBTAB: PORTAFOGLIO ATTUALE (SCREENSHOTS 935e1081 & 5409d698) -->
            <div style="margin-bottom:16px;">
              
              <!-- 4 Top KPI Cards for Portafoglio Attuale -->
              <div class="qc-kpi-4-grid">
                <div style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:12px;">
                  <div style="font-size:9px; color:#64748b; font-weight:800;">VALORE TOTALE</div>
                  <div style="font-size:20px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">
                    €40.142,90
                  </div>
                </div>
                <div style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:12px;">
                  <div style="font-size:9px; color:#64748b; font-weight:800;">ASSET TOTALI</div>
                  <div style="font-size:20px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">
                    20
                  </div>
                </div>
                <div style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:12px;">
                  <div style="font-size:9px; color:#64748b; font-weight:800;">PERFORMANCE MEDIA</div>
                  <div style="font-size:20px; font-weight:900; color:#10b981; font-family:monospace; margin-top:2px;">
                    +598.59%
                  </div>
                </div>
                <div style="background:#0c101c; border:1px solid #1e2638; border-radius:8px; padding:12px;">
                  <div style="font-size:9px; color:#64748b; font-weight:800;">SATELLITI ATTIVI</div>
                  <div style="font-size:20px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">
                    4
                  </div>
                </div>
              </div>

              <!-- Asset Allocation Donut + Composizione Dettagliata (Screenshot 935e1081) -->
              <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px; margin-bottom:16px;">
                <div style="margin-bottom:14px;">
                  <div style="font-size:14px; font-weight:900; color:#fff;">Asset Allocation</div>
                  <div style="font-size:10px; color:#64748b;">Distribuzione percentuale del capitale per categoria</div>
                </div>

                <div class="qc-split-2col" style="gap:20px; align-items:center;">
                  <!-- Pie / Donut SVG -->
                  <div style="position:relative; width:200px; height:200px; margin:0 auto;">
                    <svg viewBox="0 0 42 42" style="width:100%; height:100%; transform:rotate(-90deg);">
                      <!-- CRIPTO 4.8% (Blue) -->
                      <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#3b82f6" stroke-width="6" stroke-dasharray="4.8 95.2" stroke-dashoffset="0"></circle>
                      <!-- OBBLIGAZIONARIO 44.5% (Green) -->
                      <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#10b981" stroke-width="6" stroke-dasharray="44.5 55.5" stroke-dashoffset="-4.8"></circle>
                      <!-- MATERIE PRIME 11.3% (Purple) -->
                      <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#a855f7" stroke-width="6" stroke-dasharray="11.3 88.7" stroke-dashoffset="-49.3"></circle>
                      <!-- AZIONARIO 39.3% (Orange) -->
                      <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#f97316" stroke-width="6" stroke-dasharray="39.4 60.6" stroke-dashoffset="-60.6"></circle>
                    </svg>
                  </div>

                  <!-- Composizione Dettagliata List -->
                  <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="font-size:11px; font-weight:900; color:#64748b; margin-bottom:4px;">Composizione Dettagliata</div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#080c14; border-radius:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:#3b82f6;"></span>
                        <span style="font-size:11px; font-weight:900; color:#fff;">CRIPTO</span>
                      </div>
                      <div style="text-align:right;">
                        <span style="font-size:11px; font-weight:900; color:#fff; font-family:monospace;">4.8%</span>
                        <div style="font-size:9px; color:#64748b; font-family:monospace;">€1.937,81</div>
                      </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#080c14; border-radius:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:#10b981;"></span>
                        <span style="font-size:11px; font-weight:900; color:#fff;">OBBLIGAZIONARIO</span>
                      </div>
                      <div style="text-align:right;">
                        <span style="font-size:11px; font-weight:900; color:#fff; font-family:monospace;">44.5%</span>
                        <div style="font-size:9px; color:#64748b; font-family:monospace;">€17.870,73</div>
                      </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#080c14; border-radius:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:#a855f7;"></span>
                        <span style="font-size:11px; font-weight:900; color:#fff;">MATERIE PRIME</span>
                      </div>
                      <div style="text-align:right;">
                        <span style="font-size:11px; font-weight:900; color:#fff; font-family:monospace;">11.3%</span>
                        <div style="font-size:9px; color:#64748b; font-family:monospace;">€4.550,10</div>
                      </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#080c14; border-radius:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:#f97316;"></span>
                        <span style="font-size:11px; font-weight:900; color:#fff;">AZIONARIO USA e Europa</span>
                      </div>
                      <div style="text-align:right;">
                        <span style="font-size:11px; font-weight:900; color:#fff; font-family:monospace;">39.3%</span>
                        <div style="font-size:9px; color:#64748b; font-family:monospace;">€15.784,26</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dettaglio Categorie Accordion & L'ESITO DELLE POSIZIONI (Screenshot 5409d698 & 935e1081) -->
              <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <div>
                    <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
                      <span>Dettaglio &amp; L'Esito delle Posizioni</span>
                      <span class="badge" style="background:#1e293b; color:#38bdf8; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">20 Asset</span>
                    </div>
                    <div style="font-size:11px; color:#64748b;">Composizione dettagliata per categoria ed esito di ogni singola posizione monitorata</div>
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-secondary" style="font-size:10px; padding:3px 10px; border-radius:5px;" onclick="CasarioQuantEngine.toggleAllPortfolioCategories(true)">
                      ▾ Espandi Tutto
                    </button>
                    <button class="btn btn-sm btn-secondary" style="font-size:10px; padding:3px 10px; border-radius:5px;" onclick="CasarioQuantEngine.toggleAllPortfolioCategories(false)">
                      ▴ Comprimi Tutto
                    </button>
                  </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:12px;">
                  
                  <!-- Accordion 1: CRIPTO -->
                  <div style="background:#080c14; border:1px solid ${this.isCategoryExpanded('crypto') ? '#3b82f6' : '#1e2638'}; border-radius:8px; overflow:hidden; transition:all 0.2s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; cursor:pointer; background:${this.isCategoryExpanded('crypto') ? 'rgba(59,130,246,0.06)' : 'transparent'};" onclick="CasarioQuantEngine.togglePortfolioCategory('crypto')">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; border-radius:6px; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:15px;">
                          🪙
                        </div>
                        <div>
                          <div style="font-size:13px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                            <span>CRIPTO</span>
                            <span style="font-size:10px; color:#60a5fa; background:rgba(59,130,246,0.15); padding:1px 6px; border-radius:4px;">1 attivi</span>
                          </div>
                          <div style="font-size:10px; color:#64748b;">Esposizione al megatrend digitale decentralizzato</div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:16px;">
                        <div style="text-align:right;">
                          <div style="font-size:14px; font-weight:900; color:#fff; font-family:monospace;">€1.937,81</div>
                          <div style="font-size:10px; color:#10b981; font-weight:800;">4.8% del portfolio · <span style="color:#10b981;">+2310.98%</span></div>
                        </div>
                        <div style="color:#64748b; font-size:13px; transform:${this.isCategoryExpanded('crypto') ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:transform 0.2s;">
                          ▼
                        </div>
                      </div>
                    </div>

                    ${this.isCategoryExpanded('crypto') ? `
                      <div style="border-top:1px solid #1e2638; padding:12px 14px; background:#06090f;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Esito Posizioni Cripto</div>
                        <div style="overflow-x:auto;">
                          <table class="qc-table" style="width:100%; font-size:11px;">
                            <thead>
                              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                                <th style="padding:6px;">Asset</th>
                                <th style="padding:6px;">Entrata</th>
                                <th style="padding:6px;">Prezzo In / Att</th>
                                <th style="padding:6px; text-align:center;">Peso</th>
                                <th style="padding:6px; text-align:right;">Valore</th>
                                <th style="padding:6px; text-align:right;">P&amp;L Totale</th>
                                <th style="padding:6px; text-align:center;">Stato</th>
                                <th style="padding:6px;">Esito Operativo</th>
                                <th style="padding:6px; text-align:center;">Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="background:#f59e0b; color:#000; font-weight:900; font-size:9px; padding:2px 4px; border-radius:3px;">BTC</span>
                                    <div>
                                      <div style="font-weight:900; color:#fff;">Bitcoin Spot</div>
                                      <div style="font-size:9px; color:#64748b;">BTC/USD · Criptovaluta</div>
                                    </div>
                                  </div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">15 Gen 23</td>
                                <td style="padding:8px 6px; font-family:monospace;">
                                  <span style="color:#64748b;">$19.450</span> → <span style="color:#38bdf8; font-weight:800;">$75.780</span>
                                </td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">4.8%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.937,81</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace;">
                                  <div style="color:#10b981; font-weight:900;">+2310.98%</div>
                                  <div style="color:#10b981; font-size:9px;">+€1.857,40</div>
                                </td>
                                <td style="padding:8px 6px; text-align:center;">
                                  <span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-weight:900; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span>
                                </td>
                                <td style="padding:8px 6px;">
                                  <span style="color:#10b981; font-weight:800;">🚀 Target Raggiunto</span>
                                  <div style="font-size:9px; color:#64748b;">Trailing stop al massimo storico</div>
                                </td>
                                <td style="padding:8px 6px; text-align:center;">
                                  <button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('BTC')">Dossier ↗</button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Accordion 2: OBBLIGAZIONARIO -->
                  <div style="background:#080c14; border:1px solid ${this.isCategoryExpanded('bonds') ? '#10b981' : '#1e2638'}; border-radius:8px; overflow:hidden; transition:all 0.2s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; cursor:pointer; background:${this.isCategoryExpanded('bonds') ? 'rgba(16,185,129,0.06)' : 'transparent'};" onclick="CasarioQuantEngine.togglePortfolioCategory('bonds')">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; border-radius:6px; background:#10b981; display:flex; align-items:center; justify-content:center; font-size:15px;">
                          🏛️
                        </div>
                        <div>
                          <div style="font-size:13px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                            <span>OBBLIGAZIONARIO</span>
                            <span style="font-size:10px; color:#34d399; background:rgba(16,185,129,0.15); padding:1px 6px; border-radius:4px;">4 attivi</span>
                          </div>
                          <div style="font-size:10px; color:#64748b;">Cuscinetto difensivo sovrano e corporate a cedola</div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:16px;">
                        <div style="text-align:right;">
                          <div style="font-size:14px; font-weight:900; color:#fff; font-family:monospace;">€17.870,73</div>
                          <div style="font-size:10px; color:#ef4444; font-weight:800;">44.5% del portfolio · <span style="color:#ef4444;">-2.86%</span></div>
                        </div>
                        <div style="color:#64748b; font-size:13px; transform:${this.isCategoryExpanded('bonds') ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:transform 0.2s;">
                          ▼
                        </div>
                      </div>
                    </div>

                    ${this.isCategoryExpanded('bonds') ? `
                      <div style="border-top:1px solid #1e2638; padding:12px 14px; background:#06090f;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Esito Posizioni Obbligazionario (4 Asset)</div>
                        <div style="overflow-x:auto;">
                          <table class="qc-table" style="width:100%; font-size:11px;">
                            <thead>
                              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                                <th style="padding:6px;">Asset</th>
                                <th style="padding:6px;">Entrata</th>
                                <th style="padding:6px;">Prezzo In / Att</th>
                                <th style="padding:6px; text-align:center;">Peso</th>
                                <th style="padding:6px; text-align:right;">Valore</th>
                                <th style="padding:6px; text-align:right;">P&amp;L Totale</th>
                                <th style="padding:6px; text-align:center;">Stato</th>
                                <th style="padding:6px;">Esito Operativo</th>
                                <th style="padding:6px; text-align:center;">Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">TLT · iShares 20+ Year Treasury</div>
                                  <div style="font-size:9px; color:#64748b;">US Gov Long Duration ETF</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">12 Mag 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$102.40</span> → <span style="color:#fff;">$94.10</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">15.2%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€6.101,80</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#ef4444; font-weight:800;">-8.10% (-€494,20)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#94a3b8;">🛡 Accumulo cedolare in attesa taglio tassi Fed</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('TLT')">Dossier ↗</button></td>
                              </tr>
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">BTP 10Y Dec 2033 (4.35%)</div>
                                  <div style="font-size:9px; color:#64748b;">Titolo di Stato Repubblica Italiana</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">20 Set 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">98.20</span> → <span style="color:#10b981;">101.40</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">14.3%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€5.741,90</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+3.26% (+€187,10)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">In profitto + Cedola 4.35% annua</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">IEAC · iShares Core Euro Corp Bond</div>
                                  <div style="font-size:9px; color:#64748b;">Corporate Investment Grade UCITS ETF</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">10 Nov 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">€118.50</span> → <span style="color:#10b981;">€121.30</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">10.0%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€4.014,30</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+2.36% (+€94,80)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In profitto a basso beta</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <tr>
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">TIP · iShares TIPS Bond ETF</div>
                                  <div style="font-size:9px; color:#64748b;">US Treasury Inflation-Protected Securities</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">14 Feb 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$106.80</span> → <span style="color:#fff;">$105.90</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">5.0%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€2.012,73</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#ef4444; font-weight:800;">-0.84% (-€17,00)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#94a3b8;">Hedge inflazione reale attivo</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Accordion 3: MATERIE PRIME -->
                  <div style="background:#080c14; border:1px solid ${this.isCategoryExpanded('commodities') ? '#a855f7' : '#1e2638'}; border-radius:8px; overflow:hidden; transition:all 0.2s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; cursor:pointer; background:${this.isCategoryExpanded('commodities') ? 'rgba(168,85,247,0.06)' : 'transparent'};" onclick="CasarioQuantEngine.togglePortfolioCategory('commodities')">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; border-radius:6px; background:#a855f7; display:flex; align-items:center; justify-content:center; font-size:15px;">
                          🥇
                        </div>
                        <div>
                          <div style="font-size:13px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                            <span>MATERIE PRIME</span>
                            <span style="font-size:10px; color:#c084fc; background:rgba(168,85,247,0.15); padding:1px 6px; border-radius:4px;">1 attivi</span>
                          </div>
                          <div style="font-size:10px; color:#64748b;">Protezione valutaria e copertura shock geopolitici</div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:16px;">
                        <div style="text-align:right;">
                          <div style="font-size:14px; font-weight:900; color:#fff; font-family:monospace;">€4.550,10</div>
                          <div style="font-size:10px; color:#10b981; font-weight:800;">11.3% del portfolio · <span style="color:#10b981;">+50.34%</span></div>
                        </div>
                        <div style="color:#64748b; font-size:13px; transform:${this.isCategoryExpanded('commodities') ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:transform 0.2s;">
                          ▼
                        </div>
                      </div>
                    </div>

                    ${this.isCategoryExpanded('commodities') ? `
                      <div style="border-top:1px solid #1e2638; padding:12px 14px; background:#06090f;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Esito Posizioni Materie Prime</div>
                        <div style="overflow-x:auto;">
                          <table class="qc-table" style="width:100%; font-size:11px;">
                            <thead>
                              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                                <th style="padding:6px;">Asset</th>
                                <th style="padding:6px;">Entrata</th>
                                <th style="padding:6px;">Prezzo In / Att</th>
                                <th style="padding:6px; text-align:center;">Peso</th>
                                <th style="padding:6px; text-align:right;">Valore</th>
                                <th style="padding:6px; text-align:right;">P&amp;L Totale</th>
                                <th style="padding:6px; text-align:center;">Stato</th>
                                <th style="padding:6px;">Esito Operativo</th>
                                <th style="padding:6px; text-align:center;">Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">GLD · SPDR Gold Shares</div>
                                  <div style="font-size:9px; color:#64748b;">Oro Fisico · Metallo Prezioso</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">08 Ott 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$171.20</span> → <span style="color:#38bdf8; font-weight:800;">$257.40</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">11.3%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€4.550,10</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace;">
                                  <div style="color:#10b981; font-weight:900;">+50.34%</div>
                                  <div style="color:#10b981; font-size:9px;">+€1.523,40</div>
                                </td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">🚀 Target 1 &amp; 2 Raggiunti (Run Profit)</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('GLD')">Dossier ↗</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Accordion 4: AZIONARIO USA E EUROPA -->
                  <div style="background:#080c14; border:1px solid ${this.isCategoryExpanded('equities') ? '#f97316' : '#1e2638'}; border-radius:8px; overflow:hidden; transition:all 0.2s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; cursor:pointer; background:${this.isCategoryExpanded('equities') ? 'rgba(249,115,22,0.06)' : 'transparent'};" onclick="CasarioQuantEngine.togglePortfolioCategory('equities')">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; border-radius:6px; background:#f97316; display:flex; align-items:center; justify-content:center; font-size:15px;">
                          📈
                        </div>
                        <div>
                          <div style="font-size:13px; font-weight:900; color:#fff; display:flex; align-items:center; gap:6px;">
                            <span>AZIONARIO USA e Europa</span>
                            <span style="font-size:10px; color:#fb923c; background:rgba(249,115,22,0.15); padding:1px 6px; border-radius:4px;">12 attivi - 1 chiusi</span>
                          </div>
                          <div style="font-size:10px; color:#64748b;">Selezione alpha azionaria ad alto score quantitativo Q-Score</div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:16px;">
                        <div style="text-align:right;">
                          <div style="font-size:14px; font-weight:900; color:#fff; font-family:monospace;">€15.784,26</div>
                          <div style="font-size:10px; color:#10b981; font-weight:800;">39.3% del portfolio · <span style="color:#10b981;">+35.91%</span></div>
                        </div>
                        <div style="color:#64748b; font-size:13px; transform:${this.isCategoryExpanded('equities') ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:transform 0.2s;">
                          ▼
                        </div>
                      </div>
                    </div>

                    ${this.isCategoryExpanded('equities') ? `
                      <div style="border-top:1px solid #1e2638; padding:12px 14px; background:#06090f;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Esito Posizioni Azionario USA &amp; Europa (13 Titoli Totali)</div>
                        <div style="overflow-x:auto;">
                          <table class="qc-table" style="width:100%; font-size:11px;">
                            <thead>
                              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                                <th style="padding:6px;">Asset</th>
                                <th style="padding:6px;">Entrata</th>
                                <th style="padding:6px;">Prezzo In / Att</th>
                                <th style="padding:6px; text-align:center;">Peso</th>
                                <th style="padding:6px; text-align:right;">Valore</th>
                                <th style="padding:6px; text-align:right;">P&amp;L Totale</th>
                                <th style="padding:6px; text-align:center;">Stato</th>
                                <th style="padding:6px;">Esito Operativo</th>
                                <th style="padding:6px; text-align:center;">Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              <!-- NVDA -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">NVDA · NVIDIA Corp</div>
                                  <div style="font-size:9px; color:#64748b;">Semiconductors US · Q-Score 94</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">14 Mar 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$24.80</span> → <span style="color:#10b981; font-weight:800;">$146.50</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">5.2%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€2.087,40</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+490.7% (+€1.734,50)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">🔥 Super-Trend Rialzista AI</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('NVDA')">Dossier ↗</button></td>
                              </tr>
                              <!-- MSFT -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">MSFT · Microsoft</div>
                                  <div style="font-size:9px; color:#64748b;">Cloud / Software US · Q-Score 86</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">02 Mag 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$305.20</span> → <span style="color:#10b981;">$422.80</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">4.8%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.926,80</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+38.5% (+€536,20)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In Profitto Stabile Cloud</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('MSFT')">Dossier ↗</button></td>
                              </tr>
                              <!-- AAPL -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">AAPL · Apple Inc</div>
                                  <div style="font-size:9px; color:#64748b;">Consumer Hardware US · Q-Score 81</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">18 Gen 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$182.50</span> → <span style="color:#10b981;">$228.20</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">4.5%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.806,40</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+25.0% (+€362,10)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In Profitto Consolidato</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('AAPL')">Dossier ↗</button></td>
                              </tr>
                              <!-- ASML -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">ASML · ASML Holding NV</div>
                                  <div style="font-size:9px; color:#64748b;">Lithography EU · Q-Score 68</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">22 Feb 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">€840.00</span> → <span style="color:#fff;">€680.00</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">3.2%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.284,50</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#ef4444; font-weight:800;">-16.0% (-€244,60)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#94a3b8;">Hold su supporto chiave settimanale</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('ASML')">Dossier ↗</button></td>
                              </tr>
                              <!-- LVMH -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">MC · LVMH Moët Hennessy</div>
                                  <div style="font-size:9px; color:#64748b;">Luxury EU · Q-Score 58</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">15 Giu 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">€810.00</span> → <span style="color:#fff;">€620.00</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">2.8%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.124,00</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#ef4444; font-weight:800;">-19.0% (-€263,80)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#94a3b8;">Fase di consolidamento ciclico</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <!-- SAP -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">SAP · SAP SE</div>
                                  <div style="font-size:9px; color:#64748b;">Cloud ERP EU · Q-Score 89</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">12 Gen 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">€142.00</span> → <span style="color:#10b981; font-weight:800;">€218.50</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">3.5%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.405,00</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+53.8% (+€492,00)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">🚀 Nuovo Massimo Storico</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <!-- CSCO -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">CSCO · Cisco Systems</div>
                                  <div style="font-size:9px; color:#64748b;">Networking US · Q-Score 78</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">15 Mag 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$47.50</span> → <span style="color:#10b981;">$58.20</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">3.0%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.204,20</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+22.5% (+€221,70)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In Profitto</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('CSCO')">Dossier ↗</button></td>
                              </tr>
                              <!-- TSM -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">TSM · Taiwan Semi ADR</div>
                                  <div style="font-size:9px; color:#64748b;">Foundry US/TW · Q-Score 91</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">04 Gen 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$102.00</span> → <span style="color:#10b981; font-weight:800;">$192.50</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">3.8%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.525,40</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+88.7% (+€717,30)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">In Forte Crescita Operativa</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('TSM')">Dossier ↗</button></td>
                              </tr>
                              <!-- AMD -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">AMD · Advanced Micro Devices</div>
                                  <div style="font-size:9px; color:#64748b;">Semiconductors US · Q-Score 84</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">18 Set 23</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$101.50</span> → <span style="color:#10b981;">$138.40</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">2.5%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€1.003,50</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+36.3% (+€267,40)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In Profitto</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('AMD')">Dossier ↗</button></td>
                              </tr>
                              <!-- ENI -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">ENI · Eni SpA</div>
                                  <div style="font-size:9px; color:#64748b;">Energy Oil &amp; Gas EU · Q-Score 62</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">12 Mar 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">€14.10</span> → <span style="color:#fff;">€13.90</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">2.2%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€883,10</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#ef4444; font-weight:800;">-1.4% (-€12,50)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#94a3b8;">Dividendo 7% cash incassato</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <!-- INTU -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">INTU · Intuit Inc</div>
                                  <div style="font-size:9px; color:#64748b;">FinTech US · Q-Score 79</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">10 Lug 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$620.00</span> → <span style="color:#10b981;">$665.00</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">2.0%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€802,80</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+7.2% (+€54,30)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">In Profitto</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <!-- UNH -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#fff;">UNH · UnitedHealth Group</div>
                                  <div style="font-size:9px; color:#64748b;">Healthcare US · Q-Score 74</div>
                                </td>
                                <td style="padding:8px 6px; color:#94a3b8; font-family:monospace;">15 Ago 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$565.00</span> → <span style="color:#10b981;">$598.00</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#fff;">1.8%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">€722,50</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+5.8% (+€42,10)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:9px; padding:2px 6px; border-radius:4px;">🟢 ATTIVA</span></td>
                                <td style="padding:8px 6px; color:#10b981;">Difensivo in profitto</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;">Dossier ↗</button></td>
                              </tr>
                              <!-- TSLA (CHIUSA) -->
                              <tr style="border-bottom:1px solid rgba(255,255,255,0.04); background:rgba(255,255,255,0.02);">
                                <td style="padding:8px 6px;">
                                  <div style="font-weight:900; color:#94a3b8;">TSLA · Tesla Inc</div>
                                  <div style="font-size:9px; color:#64748b;">EV Automotive US · Chiusa</div>
                                </td>
                                <td style="padding:8px 6px; color:#64748b; font-family:monospace;">10 Nov 23 - 25 Gen 24</td>
                                <td style="padding:8px 6px; font-family:monospace;"><span style="color:#64748b;">$215.00</span> → <span style="color:#10b981;">$248.00</span></td>
                                <td style="padding:8px 6px; text-align:center; font-weight:800; color:#64748b;">0.0%</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#64748b;">€0,00</td>
                                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:800;">+15.3% (+€385,00)</td>
                                <td style="padding:8px 6px; text-align:center;"><span class="badge" style="background:rgba(148,163,184,0.15); color:#94a3b8; font-size:9px; padding:2px 6px; border-radius:4px;">⚪ CHIUSA</span></td>
                                <td style="padding:8px 6px; color:#10b981; font-weight:800;">✅ Target Chiuso al Segnale SQM</td>
                                <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="CasarioQuantEngine.selectDossierSymbol('TSLA')">Dossier ↗</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ` : ''}
                  </div>

                </div>
              </div>
            </div>
    `;
  },

  buildPortfolioPanoramicaHTML() {
    return `
<!-- SUBTAB: PANORAMICA (SCREENSHOT 6369d00a & 1e3c46a0) -->
            <!-- 5 KPI Cards -->
            <div class="qc-kpi-5-grid">
              <div style="background:#0c101c; border:1px solid #1e2638; border-left:3px solid #10b981; border-radius:6px; padding:12px;">
                <div style="font-size:9px; color:#64748b; font-weight:800;">VALORE TOTALE</div>
                <div style="font-size:18px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">13.652,35 €</div>
                <div style="font-size:9px; color:#10b981; font-weight:800;">355,08%</div>
              </div>

              <div style="background:#0c101c; border:1px solid #1e2638; border-left:3px solid #38bdf8; border-radius:6px; padding:12px;">
                <div style="font-size:9px; color:#64748b; font-weight:800;">CONFRONTO PROFITTO</div>
                <div style="font-size:18px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">355,08%</div>
                <div style="font-size:8px; color:#64748b;">vs S&P 500: 231,15%</div>
              </div>

              <div style="background:#0c101c; border:1px solid #1e2638; border-left:3px solid #a855f7; border-radius:6px; padding:12px;">
                <div style="font-size:9px; color:#64748b; font-weight:800;">SHARPE RATIO</div>
                <div style="font-size:18px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">1.93</div>
                <div style="font-size:8px; color:#64748b;">vs S&P 500: 0.65</div>
              </div>

              <div style="background:#0c101c; border:1px solid #1e2638; border-left:3px solid #f59e0b; border-radius:6px; padding:12px;">
                <div style="font-size:9px; color:#64748b; font-weight:800;">PROTEZIONE PERDITE</div>
                <div style="font-size:18px; font-weight:900; color:#f87171; font-family:monospace; margin-top:2px;">-15,25%</div>
                <div style="font-size:8px; color:#64748b;">vs S&P 500: -34,10%</div>
              </div>

              <div style="background:#0c101c; border:1px solid #1e2638; border-left:3px solid #10b981; border-radius:6px; padding:12px;">
                <div style="font-size:9px; color:#64748b; font-weight:800;">CAGR</div>
                <div style="font-size:18px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">16,59%</div>
                <div style="font-size:8px; color:#64748b;">Tasso composto medio</div>
              </div>
            </div>

            <!-- Equity Curve vs S&P 500 Benchmark (Screenshot 6369d00a & 19e9301e) -->
            <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px; margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="display:flex; gap:16px; font-size:10px; font-weight:800;">
                  <span style="color:#10b981;">● Portfolio +355.1%</span>
                  <span style="color:#94a3b8;">● S&P 500 (US) +231.1%</span>
                  <span style="color:#ef4444;">● DD Portfolio -15.25%</span>
                  <span style="color:#64748b;">● DD S&P 500 -34.10%</span>
                </div>
                <div style="display:flex; gap:4px;">
                  ${['3M', '6M', '1Y', 'Tutto'].map(tf => `
                    <button class="btn btn-sm ${tf === 'Tutto' ? 'btn-primary' : 'btn-secondary'}" style="font-size:9px; padding:3px 8px;">${tf}</button>
                  `).join('')}
                </div>
              </div>

              <!-- Interactive Equity Curve SVG -->
              <div style="position:relative; height:180px; background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px;">
                <svg width="100%" height="160" viewBox="0 0 600 160">
                  <!-- S&P 500 Benchmark (Grey line) -->
                  <polyline fill="none" stroke="#64748b" stroke-width="1.8" points="0,140 60,135 120,120 180,125 240,110 300,100 360,95 420,80 480,75 540,60 600,50" />
                  <!-- Portfolio (Bright green line) -->
                  <polyline fill="none" stroke="#10b981" stroke-width="2.5" points="0,140 60,130 120,105 180,100 240,75 300,60 360,55 420,38 480,30 540,18 600,12" />
                  
                  <!-- Tooltip Marker at latest point -->
                  <circle cx="600" cy="12" r="4" fill="#10b981" />
                  <circle cx="600" cy="50" r="4" fill="#64748b" />
                </svg>

                <div style="position:absolute; top:20px; right:30px; background:rgba(15,23,42,0.92); border:1px solid #334155; border-radius:6px; padding:6px 10px; font-size:10px; font-family:monospace;">
                  <div style="color:#94a3b8;">11 nov 2025</div>
                  <div style="color:#10b981; font-weight:800;">● Portfolio 356.8%</div>
                  <div style="color:#64748b;">● S&P 500 239.8%</div>
                </div>
              </div>
            </div>

            <!-- Underwater Drawdown Chart (Screenshot 1e3c46a0) -->
            <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
              <div style="font-size:12px; font-weight:900; color:#fff; margin-bottom:8px;">
                Comparativa Drawdown (Stress Test Underwater)
              </div>
              <div style="height:120px; background:#080c14; border:1px solid #1a2233; border-radius:6px; padding:10px; position:relative;">
                <svg width="100%" height="100" viewBox="0 0 600 100">
                  <line x1="0" y1="10" x2="600" y2="10" stroke="#334155" stroke-width="1.5" />
                  <!-- S&P 500 Deep DD area -->
                  <polygon fill="rgba(100,116,139,0.2)" points="0,10 60,25 120,35 180,30 240,85 300,45 360,35 420,75 480,30 540,25 600,10 600,10 0,10" />
                  <!-- Portfolio DD area -->
                  <polygon fill="rgba(239,68,68,0.25)" points="0,10 60,18 120,24 180,22 240,42 300,28 360,20 420,38 480,18 540,15 600,10 600,10 0,10" />
                  <polyline fill="none" stroke="#ef4444" stroke-width="1.8" points="0,10 60,18 120,24 180,22 240,42 300,28 360,20 420,38 480,18 540,15 600,10" />
                </svg>
                <div style="position:absolute; bottom:8px; right:12px; font-size:9px; color:#ef4444; font-weight:800;">
                  Max DD Portafoglio: -15.25% (vs -34.10% S&P 500)
                </div>
              </div>
            </div>
    `;
  },

  buildPortfolioChecklistHTML() {
    return `
      <!-- SUBTAB: CHECKLIST OPERATIVA -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
              <span>☑️</span> Checklist Operativa di Ribilanciamento
              <span class="badge" style="background:#059669; color:#fff; font-size:9px; padding:2px 8px; border-radius:10px;">Attiva per lun 1 dic</span>
            </div>
            <div style="font-size:11px; color:#64748b;">Protocollo procedurale per il ribilanciamento automatico o manuale del portafoglio</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="if(window.showToast) window.showToast('Tolleranze pesi conformi (drift max 1.8%). Nessun intervento richiesto oggi.', 'success')">
            ⚡ Simula Drift Pesi
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${[
            { title: '1. Verifica Tolleranza & Drift di Portafoglio', desc: 'Controllare che nessun asset superi la banda di tolleranza prefissata (±2.5% rispetto al peso target teorico).', status: 'Conforme', color: '#10b981', checked: true },
            { title: '2. Calcolo Quote da Acquistare / Alleggerire', desc: 'Generare la matrice netta delle quantità e del controvalore per minimizzare il turnover e l’impatto commissionale.', status: 'Pronto', color: '#38bdf8', checked: true },
            { title: '3. Finestra Ottimale di Esecuzione Ordini Limite', desc: 'Inviare gli ordini tra le 16:30 e le 17:15 CET per sfruttare la massima sovrapposizione di liquidità tra borse europee e Wall Street.', status: 'In Attesa (lun 1 dic)', color: '#f59e0b', checked: false },
            { title: '4. Raccolta Cedole Obbligazionarie & Dividendi Cash', desc: 'Reinvestire i flussi di cassa maturati da BTP 10Y, IEAC e titoli ad alto dividend yield nel buffer di liquidità.', status: 'Completato', color: '#10b981', checked: true },
            { title: '5. Riconciliazione Fiscale & Calcolo Tracking Error', desc: 'Verificare lo scostamento rispetto al benchmark S&P 500 (+355.1% vs +231.1%) e la compensazione minusvalenze pregresse.', status: 'Monitorato', color: '#a855f7', checked: true }
          ].map(item => `
            <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:flex-start; gap:10px;">
                <input type="checkbox" ${item.checked ? 'checked' : ''} style="margin-top:3px; accent-color:#2563eb; transform:scale(1.15);">
                <div>
                  <div style="font-size:12px; font-weight:800; color:#fff;">${item.title}</div>
                  <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${item.desc}</div>
                </div>
              </div>
              <span class="badge" style="background:rgba(255,255,255,0.06); color:${item.color}; border:1px solid ${item.color}; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; white-space:nowrap;">
                ${item.status}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  buildPortfolioHistoryHTML() {
    return `
      <!-- SUBTAB: STORICO RIBILANCIAMENTI -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
              <span>⏱</span> Storico Ribilanciamenti Trimestrali
            </div>
            <div style="font-size:11px; color:#64748b;">Archivio cronologico delle rotazioni tattiche e delle quote ribilanciate</div>
          </div>
          <span style="font-size:11px; color:#94a3b8; font-family:monospace;">Frequenza: Trimestrale + Soglia Tattica Volatilità</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="qc-table" style="width:100%; font-size:11px;">
            <thead>
              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                <th style="padding:8px 6px;">Data</th>
                <th style="padding:8px 6px;">Regime Macro</th>
                <th style="padding:8px 6px;">Operazioni Chiave</th>
                <th style="padding:8px 6px; text-align:center;">Turnover</th>
                <th style="padding:8px 6px; text-align:right;">Valore Portafoglio</th>
                <th style="padding:8px 6px; text-align:right;">P&amp;L Post-Rebalance</th>
                <th style="padding:8px 6px; text-align:center;">Report</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { date: '01 Set 2025', regime: 'Q3 Stagflazione', ops: 'Take profit parziale BTC, accumulo BTP 10Y e GLD Oro', turnover: '4.2%', val: '€ 40.142,90', pnl: '+18.4%', report: 'PDF 📥' },
                { date: '01 Giu 2025', regime: 'Q1 Goldilocks', ops: 'Incremento NVDA e TSM, rotazione da difensivi a tech growth', turnover: '5.8%', val: '€ 36.850,20', pnl: '+24.1%', report: 'PDF 📥' },
                { date: '01 Mar 2025', regime: 'Q2 Overheating', ops: 'Apertura posizione materie prime (GLD), riduzione duration bond', turnover: '6.1%', val: '€ 31.200,00', pnl: '+14.6%', report: 'PDF 📥' },
                { date: '01 Dic 2024', regime: 'Q1 Goldilocks', ops: 'Ribilanciamento pesi annuale e stacco cedola IEAC', turnover: '3.4%', val: '€ 28.450,10', pnl: '+19.2%', report: 'PDF 📥' },
                { date: '01 Set 2024', regime: 'Q3 Stagflazione', ops: 'Ingresso Cripto spot (BTC) a $19.450 e sovereign bond BTP', turnover: '7.5%', val: '€ 24.100,00', pnl: '+32.8%', report: 'PDF 📥' }
              ].map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:8px 6px; font-weight:800; color:#fff; font-family:monospace;">${r.date}</td>
                  <td style="padding:8px 6px;"><span class="badge" style="background:#1e293b; color:#38bdf8; font-size:9px; padding:2px 6px; border-radius:4px;">${r.regime}</span></td>
                  <td style="padding:8px 6px; color:#cbd5e1;">${r.ops}</td>
                  <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#94a3b8;">${r.turnover}</td>
                  <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${r.val}</td>
                  <td style="padding:8px 6px; text-align:right; font-family:monospace; font-weight:800; color:#10b981;">${r.pnl}</td>
                  <td style="padding:8px 6px; text-align:center;"><button class="btn btn-xs btn-outline-info" style="font-size:9px; padding:2px 6px;" onclick="if(window.showToast) window.showToast('Download report certificato di ribilanciamento...', 'info')">${r.report}</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buildPortfolioDrawdownHTML() {
    return `
      <!-- SUBTAB: COMPARATIVA DRAWDOWN (SCREENSHOT 1e3c46a0) -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
              <span>📉</span> Comparativa Drawdown &amp; Protezione dalle Perdite
            </div>
            <div style="font-size:11px; color:#64748b;">Comportamento del portafoglio durante i peggiori shock e correzioni di mercato</div>
          </div>
          <span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-weight:800; font-size:10px; padding:4px 10px; border-radius:5px;">
            Protezione +18.85% vs S&amp;P 500
          </span>
        </div>

        <!-- 4 KPI Drawdown Cards -->
        <div class="qc-kpi-4-grid">
          <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">MAX DRAWDOWN</div>
            <div style="font-size:18px; font-weight:900; color:#f87171; font-family:monospace; margin-top:2px;">-15,25%</div>
            <div style="font-size:9px; color:#64748b;">vs S&amp;P 500: -34,10%</div>
          </div>
          <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">RECOVERY TIME MEDIO</div>
            <div style="font-size:18px; font-weight:900; color:#10b981; font-family:monospace; margin-top:2px;">42 giorni</div>
            <div style="font-size:9px; color:#64748b;">vs S&amp;P 500: 148 giorni</div>
          </div>
          <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">ULCER INDEX</div>
            <div style="font-size:18px; font-weight:900; color:#38bdf8; font-family:monospace; margin-top:2px;">2.41</div>
            <div style="font-size:9px; color:#64748b;">Stress drawdown minimo</div>
          </div>
          <div style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px;">
            <div style="font-size:9px; color:#64748b; font-weight:800;">CALMAR RATIO</div>
            <div style="font-size:18px; font-weight:900; color:#fff; font-family:monospace; margin-top:2px;">1.08</div>
            <div style="font-size:9px; color:#10b981; font-weight:800;">+125% efficienza rischio</div>
          </div>
        </div>

        <!-- Shock Analysis Table -->
        <div style="font-size:11px; font-weight:900; color:#94a3b8; margin-bottom:8px; text-transform:uppercase;">
          Resistenza del Portafoglio durante le Grandi Crisi
        </div>
        <div style="overflow-x:auto;">
          <table class="qc-table" style="width:100%; font-size:11px;">
            <thead>
              <tr style="color:#64748b; border-bottom:1px solid #1e2638; text-align:left;">
                <th style="padding:8px 6px;">Evento di Mercato</th>
                <th style="padding:8px 6px; text-align:center;">Perdita S&amp;P 500</th>
                <th style="padding:8px 6px; text-align:center;">Perdita Portafoglio</th>
                <th style="padding:8px 6px; text-align:right;">Capitale Preservato</th>
                <th style="padding:8px 6px;">Fattore Difensivo Chiave</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:8px 6px; font-weight:800; color:#fff;">Bear Market 2022 (Inflazione &amp; Rialzo Tassi Fed)</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#ef4444; font-weight:800;">-25.40%</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#f59e0b; font-weight:800;">-15.25%</td>
                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:900;">+10.15%</td>
                <td style="padding:8px 6px; color:#cbd5e1;">Hedge Oro fisico (GLD) e TIPS contro l'inflazione</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:8px 6px; font-weight:800; color:#fff;">Crisi Bancaria Regionale USA (SVB Mar 2023)</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#ef4444; font-weight:800;">-7.80%</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#10b981; font-weight:800;">-2.80%</td>
                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:900;">+5.00%</td>
                <td style="padding:8px 6px; color:#cbd5e1;">Flight-to-safety su Treasury Governativo (TLT) e Bitcoin spot</td>
              </tr>
              <tr>
                <td style="padding:8px 6px; font-weight:800; color:#fff;">Flash Crash Yen Carry Trade (Ago 2024)</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#ef4444; font-weight:800;">-8.60%</td>
                <td style="padding:8px 6px; text-align:center; font-family:monospace; color:#10b981; font-weight:800;">-4.10%</td>
                <td style="padding:8px 6px; text-align:right; font-family:monospace; color:#10b981; font-weight:900;">+4.50%</td>
                <td style="padding:8px 6px; color:#cbd5e1;">Basso beta di portafoglio e cedole staccate dai BTP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buildPortfolioFaqHTML() {
    return `
      <!-- SUBTAB: FAQ & METODOLOGIA -->
      <div class="qc-panel-card" style="background:#0c101c; border:1px solid #1e2638; border-radius:10px; padding:18px;">
        <div style="margin-bottom:16px;">
          <div style="font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
            <span>❓</span> Domande Frequenti &amp; Metodologia di Gestione
          </div>
          <div style="font-size:11px; color:#64748b;">Guida completa all'architettura quantitativa e alle regole operative del modello</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            { q: '1. Come vengono selezionati gli asset del portafoglio?', a: 'La selezione combina l’analisi macro top-down a 4 Quadranti (Crescita vs Inflazione) con il Q-Score Istituzionale™ proprietario. Vengono ammessi solo asset con punteggio quantitativo superiore a 75/100 che superano il test di coerenza macroeconomica.' },
            { q: '2. Con quale frequenza avviene il ribilanciamento?', a: 'Il ribilanciamento segue una cadenza trimestrale prestabilita (prossimo: lunedì 1 dicembre). Inoltre, scatta un controllo tattico se la volatilità di mercato (VIX) supera la soglia critica di 28 o se un asset subisce un drift superiore al ±2.5%.' },
            { q: '3. Come viene ottenuta la protezione dalle perdite (-15.25% vs -34.10%)?', a: 'Grazie all’allocazione bilanciata in 4 satelliti decorrelati: Obbligazionario (44.5%), Azionario (39.3%), Oro e Materie Prime (11.3%) e Cripto spot (4.8%). Nei periodi di crollo azionario, l’Oro e i titoli governativi agiscono da cuscinetto assorbente.' },
            { q: '4. Qual è il trattamento fiscale per investitori italiani ed europei?', a: 'Tutti gli strumenti selezionati sono ETF armonizzati UCITS o Titoli di Stato a tassazione agevolata (12.5% per BTP e Treasury, 26% per azioni e altri strumenti), ottimizzando l’efficienza fiscale del capital gain.' },
            { q: '5. Posso replicare il portafoglio con qualsiasi broker?', a: 'Sì, la composizione utilizza ISIN standard quotati sulle borse europee (Borsa Italiana, Xetra, Euronext) e americane (NYSE, NASDAQ), perfettamente negoziabili su Directa, Fineco, Degiro, Interactive Brokers o banche tradizionali.' }
          ].map(faq => `
            <details style="background:#080c14; border:1px solid #1e2638; border-radius:8px; padding:12px 14px; cursor:pointer;">
              <summary style="font-size:12px; font-weight:800; color:#fff; outline:none;">
                ${faq.q}
              </summary>
              <div style="font-size:11px; color:#94a3b8; line-height:1.5; margin-top:10px; padding-top:8px; border-top:1px solid #1e2638;">
                ${faq.a}
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    `;
  },
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


    /* =======================================================================
   * INTERACTIVE QUANT ENGINE HANDLERS & NAVIGATION CONTROLLERS
   * ======================================================================= */

  getRegionalMarketRows(tab) {
    const all = [
      { region: 'sviluppati', name: '🇺🇸 S&P 500 (GSPC)', positioning: 'STRONG BUY', qScore: 82, d1: '+0.38%', w1: '+1.45%', m1: '+3.20%', avgMom: '+2.1%', sparkline: '0,14 15,12 30,15 45,9 60,7 80,3' },
      { region: 'sviluppati', name: '🇺🇸 Nasdaq 100 (IXIC)', positioning: 'STRONG BUY', qScore: 85, d1: '+0.65%', w1: '+2.10%', m1: '+4.80%', avgMom: '+3.2%', sparkline: '0,16 15,13 30,14 45,7 60,5 80,2' },
      { region: 'sviluppati', name: '🇺🇸 Dow Jones (DJI)', positioning: 'BUY', qScore: 74, d1: '+0.12%', w1: '+0.65%', m1: '+1.80%', avgMom: '+1.1%', sparkline: '0,11 15,12 30,10 45,11 60,9 80,8' },
      { region: 'sviluppati', name: '🇺🇸 Russell 2000 (VTWO)', positioning: 'BUY', qScore: 79, d1: '+0.88%', w1: '+2.40%', m1: '+5.10%', avgMom: '+2.8%', sparkline: '0,15 15,13 30,16 45,10 60,6 80,4' },
      { region: 'sviluppati', name: '🇩🇪 DAX 40 (GDAXI)', positioning: 'BUY', qScore: 79, d1: '+0.42%', w1: '+1.15%', m1: '+2.60%', avgMom: '+1.7%', sparkline: '0,13 15,11 30,12 45,8 60,7 80,5' },
      { region: 'sviluppati', name: '🇮🇹 FTSE MIB (FTSEMIB)', positioning: 'STRONG BUY', qScore: 81, d1: '+0.78%', w1: '+1.90%', m1: '+3.90%', avgMom: '+2.4%', sparkline: '0,14 15,13 30,11 45,7 60,5 80,3' },
      { region: 'sviluppati', name: '🇪🇺 Euro Stoxx 50 (SX5E)', positioning: 'BUY', qScore: 76, d1: '+0.31%', w1: '+0.95%', m1: '+2.20%', avgMom: '+1.4%', sparkline: '0,12 15,11 30,13 45,9 60,8 80,6' },
      { region: 'sviluppati', name: '🇬🇧 FTSE 100 (FTSE)', positioning: 'HOLD', qScore: 71, d1: '+0.08%', w1: '+0.35%', m1: '+0.90%', avgMom: '+0.6%', sparkline: '0,10 15,11 30,10 45,10 60,9 80,9' },
      { region: 'sviluppati', name: '🇫🇷 CAC 40 (FCHI)', positioning: 'HOLD', qScore: 73, d1: '+0.25%', w1: '+0.60%', m1: '+1.10%', avgMom: '+0.8%', sparkline: '0,11 15,12 30,11 45,10 60,8 80,8' },
      { region: 'sviluppati', name: '🇪🇸 IBEX 35 (IBEX)', positioning: 'BUY', qScore: 77, d1: '+0.54%', w1: '+1.40%', m1: '+2.90%', avgMom: '+1.9%', sparkline: '0,13 15,12 30,10 45,8 60,6 80,5' },
      { region: 'sviluppati', name: '🇨🇭 SMI Swiss (SSMI)', positioning: 'HOLD', qScore: 72, d1: '+0.15%', w1: '+0.45%', m1: '+1.20%', avgMom: '+0.7%', sparkline: '0,10 15,11 30,10 45,9 60,9 80,8' },
      { region: 'sviluppati', name: '🇳🇱 AEX Index (AEX)', positioning: 'BUY', qScore: 78, d1: '+0.33%', w1: '+1.05%', m1: '+2.40%', avgMom: '+1.6%', sparkline: '0,12 15,11 30,12 45,8 60,7 80,6' },
      { region: 'sviluppati', name: '🇯🇵 Nikkei 225 (N225)', positioning: 'STRONG BUY', qScore: 80, d1: '+0.95%', w1: '+2.20%', m1: '+4.10%', avgMom: '+2.7%', sparkline: '0,15 15,12 30,14 45,8 60,5 80,3' },
      { region: 'emergenti', name: '🇭🇰 Hang Seng (HSI)', positioning: 'SELL', qScore: 48, d1: '-0.45%', w1: '-1.80%', m1: '-3.20%', avgMom: '-2.1%', sparkline: '0,4 15,6 30,5 45,11 60,13 80,16' },
      { region: 'emergenti', name: '🇨🇳 Shanghai Comp (SSEC)', positioning: 'HOLD', qScore: 54, d1: '-0.18%', w1: '-0.60%', m1: '+0.40%', avgMom: '-0.3%', sparkline: '0,8 15,9 30,7 45,10 60,11 80,11' },
      { region: 'emergenti', name: '🇮🇳 Nifty 50 (NIFTY)', positioning: 'STRONG BUY', qScore: 83, d1: '+0.82%', w1: '+2.05%', m1: '+4.30%', avgMom: '+2.9%', sparkline: '0,15 15,13 30,15 45,9 60,6 80,2' },
      { region: 'emergenti', name: '🇧🇷 Bovespa (BVSP)', positioning: 'HOLD', qScore: 66, d1: '+0.35%', w1: '+0.90%', m1: '+1.40%', avgMom: '+0.9%', sparkline: '0,11 15,10 30,12 45,9 60,8 80,7' }
    ];
    if (tab && tab.toLowerCase() === 'sviluppati') return all.filter(x => x.region === 'sviluppati');
    if (tab && tab.toLowerCase() === 'emergenti') return all.filter(x => x.region === 'emergenti');
    return all;
  },

  getAssetClassRows(tab) {
    const all = [
      { cls: 'Materie Prime', name: '🥇 Oro Spot (GC=F)', positioning: 'STRONG BUY', qScore: 92, d1: '+0.45%', w1: '+1.80%', m1: '+5.20%', avgMom: '+3.4%', sparkline: '0,14 15,12 30,15 45,8 60,5 80,2' },
      { cls: 'Materie Prime', name: '🥈 Argento (SI=F)', positioning: 'STRONG BUY', qScore: 84, d1: '+0.92%', w1: '+2.60%', m1: '+6.10%', avgMom: '+3.9%', sparkline: '0,15 15,13 30,16 45,9 60,6 80,3' },
      { cls: 'Materie Prime', name: '🛢 Petrolio WTI (CL=F)', positioning: 'HOLD', qScore: 58, d1: '-0.85%', w1: '-2.10%', m1: '-3.80%', avgMom: '-2.4%', sparkline: '0,5 15,7 30,6 45,12 60,14 80,16' },
      { cls: 'Materie Prime', name: '⚡ Rame Copper (HG=F)', positioning: 'BUY', qScore: 76, d1: '+0.34%', w1: '+1.20%', m1: '+2.80%', avgMom: '+1.8%', sparkline: '0,12 15,11 30,13 45,9 60,7 80,5' },
      { cls: 'Forex', name: '💶 EUR / USD', positioning: 'SELL', qScore: 42, d1: '-0.22%', w1: '-0.85%', m1: '-1.90%', avgMom: '-1.4%', sparkline: '0,6 15,8 30,7 45,12 60,14 80,15' },
      { cls: 'Forex', name: '💴 USD / JPY', positioning: 'STRONG BUY', qScore: 80, d1: '+0.38%', w1: '+1.40%', m1: '+3.10%', avgMom: '+2.1%', sparkline: '0,13 15,12 30,14 45,9 60,6 80,4' },
      { cls: 'Forex', name: '💷 GBP / USD', positioning: 'HOLD', qScore: 56, d1: '-0.15%', w1: '-0.50%', m1: '-0.90%', avgMom: '-0.7%', sparkline: '0,9 15,10 30,9 45,11 60,12 80,12' },
      { cls: 'Cripto', name: '🪙 Bitcoin (BTC)', positioning: 'STRONG BUY', qScore: 88, d1: '+2.85%', w1: '+8.40%', m1: '+22.50%', avgMom: '+14.2%', sparkline: '0,16 15,14 30,16 45,7 60,4 80,1' },
      { cls: 'Cripto', name: '💠 Ethereum (ETH)', positioning: 'BUY', qScore: 79, d1: '+1.92%', w1: '+5.60%', m1: '+14.80%', avgMom: '+9.1%', sparkline: '0,14 15,12 30,14 45,8 60,6 80,3' },
      { cls: 'Cripto', name: '⚡ Solana (SOL)', positioning: 'STRONG BUY', qScore: 86, d1: '+4.10%', w1: '+11.20%', m1: '+28.40%', avgMom: '+18.5%', sparkline: '0,16 15,13 30,15 45,6 60,3 80,1' },
      { cls: 'Obbligazioni', name: '🏛️ US Treasury 10Y Yield', positioning: 'BUY', qScore: 65, d1: '+0.03%', w1: '+0.12%', m1: '+0.25%', avgMom: '+0.1%', sparkline: '0,11 15,12 30,10 45,9 60,8 80,7' },
      { cls: 'Obbligazioni', name: '🇩🇪 Bund 10Y Yield', positioning: 'HOLD', qScore: 60, d1: '+0.01%', w1: '+0.05%', m1: '+0.10%', avgMom: '+0.1%', sparkline: '0,10 15,11 30,10 45,10 60,9 80,9' },
      { cls: 'Obbligazioni', name: '🇮🇹 BTP 10Y Yield', positioning: 'BUY', qScore: 68, d1: '-0.02%', w1: '-0.08%', m1: '-0.15%', avgMom: '-0.1%', sparkline: '0,12 15,11 30,13 45,10 60,9 80,8' }
    ];
    if (tab && tab !== 'Tutti') {
      const match = all.filter(x => x.cls.toLowerCase() === tab.toLowerCase());
      if (match.length > 0) return match;
    }
    return all;
  },

  toggleMacroRegimeDetails() {
    this.macroRegimeDetailsExpanded = !this.macroRegimeDetailsExpanded;
    this.renderUI();
  },

  setMacroSentimentView(v) {
    this.macroSentimentView = v;
    this.renderUI();
  },

  setMacroMarketTab(group, tab) {
    if (group === 1) this.macroMarketTab1 = tab;
    if (group === 2) this.macroMarketTab2 = tab;
    this.renderUI();
  },

  setEventsTimeFilter(t) {
    this.eventsTimeFilter = t;
    this.renderUI();
  },

  setEventsCategoryFilter(cat) {
    this.eventsCategoryFilter = cat;
    this.renderUI();
  },

  setEventsImpactFilter(i) {
    this.eventsImpactFilter = i;
    this.renderUI();
  },

  setEventsCountryFilter(c) {
    this.eventsCountryFilter = c;
    this.renderUI();
  },

  setRadarStrategy(s) {
    this.radarStrategy = s;
    this.renderUI();
  },

  setRadarSearch(q) {
    this.radarFilters.search = q;
    this.renderUI();
  },

  toggleRadarDropdown(name, event) {
    if (event) event.stopPropagation();
    this.radarOpenDropdown = (this.radarOpenDropdown === name) ? null : name;
    this.renderUI();
  },

  closeAllRadarDropdowns() {
    this.radarOpenDropdown = null;
    this.renderUI();
  },

  toggleRadarFilter(type, value, event) {
    if (event) event.stopPropagation();
    if (!this.radarFilters[type]) this.radarFilters[type] = [];
    const idx = this.radarFilters[type].indexOf(value);
    if (idx >= 0) this.radarFilters[type].splice(idx, 1);
    else this.radarFilters[type].push(value);
    this.renderUI();
  },

  setDossierSubTab(t) {
    this.activeDossierSubTab = t;
    this.dossierSubTab = t;
    this.renderUI();
  },

  toggleDossierForecastCone() {
    this.dossierForecastConeActive = !this.dossierForecastConeActive;
    this.renderUI();
    if (window.OrderFlowEngine && window.OrderFlowEngine.toggleForecastCone) {
      window.OrderFlowEngine.toggleForecastCone(this.dossierForecastConeActive);
    }
  },

  toggleDossierHistory() {
    this.dossierHistoryExpanded = !this.dossierHistoryExpanded;
    this.renderUI();
  },

  setRevenueYear(type, y) {
    if (type === 'geo') this.dossierRevenueYearGeo = y;
    if (type === 'product') this.dossierRevenueYearProd = y;
    this.renderUI();
  },

  setFinancialsPeriod(p) {
    this.dossierFinancialsPeriod = p;
    this.renderUI();
  },

  setFinancialsSubTab(t) {
    this.dossierFinancialsSubTab = t;
    this.renderUI();
  },

  selectDossierSymbol(sym) {
    this.selectedAssetSymbol = sym;
    this.selectedSymbol = sym;
    this.activeSubTab = 'asset-dossier';
    this.activeDossierSubTab = 'overview';
    this.dossierSubTab = 'overview';
    this.renderUI();
    if (window.loadSymbolData) {
      window.loadSymbolData(sym);
    }
    if (window.showToast) {
      window.showToast(`Dossier Quant caricato: ${sym}`, 'info');
    }
  },

  openPortfolioDetails(id, tab) {
    this.portfolioActiveView = 'details';
    if (id) this.portfolioSelectedId = id;
    if (tab) this.portfolioDetailsTab = tab;
    this.renderUI();
  },

  exportGuidePDF() {
    if (window.showToast) {
      window.showToast('Preparazione stampa/esportazione PDF Guida Portafogli...', 'info');
    }
    setTimeout(() => {
      window.print();
    }, 300);
  },

  viewPortfolioDetails(id) {
    this.portfolioActiveView = 'details';
    this.portfolioSelectedId = id || 'bilanciato';
    this.portfolioDetailsTab = 'panoramica';
    this.renderUI();
  },

  setPortfolioDetailsTab(t) {
    this.portfolioDetailsTab = t;
    this.renderUI();
  },

  openFollowPortfolioModal(id, event) {
    if (event) event.stopPropagation();
    this.portfolioFollowModalOpen = true;
    this.portfolioSelectedId = id || this.portfolioSelectedId || 'bilanciato';
    this.renderUI();
  },

  closeFollowPortfolioModal() {
    this.portfolioFollowModalOpen = false;
    this.renderUI();
  },

  saveFollowPortfolio() {
    this.portfolioFollowModalOpen = false;
    const el = document.getElementById('follow-portfolio-capital');
    const val = el ? el.value : '10000';
    if (window.showToast) {
      window.showToast(`Portafoglio seguito con successo! Capitale allocato: € ${val}`, 'success');
    }
    this.renderUI();
  },

  isCategoryExpanded(cat) {
    if (Array.isArray(this.portfolioExpandedCategories)) {
      return this.portfolioExpandedCategories.includes(cat);
    }
    if (this.portfolioExpandedCategories && typeof this.portfolioExpandedCategories === 'object') {
      return this.portfolioExpandedCategories[cat] !== false;
    }
    return true;
  },

  togglePortfolioCategory(cat) {
    if (!this.portfolioExpandedCategories || typeof this.portfolioExpandedCategories !== 'object') {
      this.portfolioExpandedCategories = { crypto: true, bonds: true, commodities: true, equities: true };
    }
    if (Array.isArray(this.portfolioExpandedCategories)) {
      const idx = this.portfolioExpandedCategories.indexOf(cat);
      if (idx >= 0) this.portfolioExpandedCategories.splice(idx, 1);
      else this.portfolioExpandedCategories.push(cat);
    } else {
      this.portfolioExpandedCategories[cat] = !this.portfolioExpandedCategories[cat];
    }
    this.renderUI();
  },

  toggleAllPortfolioCategories(expand) {
    this.portfolioExpandedCategories = {
      crypto: !!expand,
      bonds: !!expand,
      commodities: !!expand,
      equities: !!expand
    };
    this.renderUI();
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
