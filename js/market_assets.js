/**
 * TRADING PRO ULTIMATE™ — GLOBAL ASSETS UNIVERSE & FAVORITES MANAGER
 * Modeled on: Bybit, OKX, Kraken, Borsa Italiana (FTSE MIB 40/40), S&P 500, NASDAQ, Forex
 * © by cuordivino — Tutti i diritti riservati
 */

window.GlobalMarketAssets = [
  // ==========================================
  // 1. CRYPTO UNIVERSE (BYBIT, OKX, KRAKEN)
  // ==========================================
  { symbol: 'BTCUSDT', name: 'Bitcoin', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 80210.00, currency: '$', precision: 2 },
  { symbol: 'ETHUSDT', name: 'Ethereum', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 2420.50, currency: '$', precision: 2 },
  { symbol: 'SOLUSDT', name: 'Solana', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 94.80, currency: '$', precision: 2 },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 5.25, currency: '$', precision: 3 },
  { symbol: 'BNBUSDT', name: 'BNB Binance Coin', cat: 'crypto', exchange: 'Bybit/OKX', basePrice: 716.35, currency: '$', precision: 2 },
  { symbol: 'XRPUSDT', name: 'Ripple XRP', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.585, currency: '$', precision: 4 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.165, currency: '$', precision: 4 },
  { symbol: 'ADAUSDT', name: 'Cardano', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.385, currency: '$', precision: 4 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 28.40, currency: '$', precision: 2 },
  { symbol: 'LINKUSDT', name: 'Chainlink', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 12.80, currency: '$', precision: 2 },
  { symbol: 'SUIUSDT', name: 'Sui Network', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 2.15, currency: '$', precision: 4 },
  { symbol: 'APTUSDT', name: 'Aptos', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 9.80, currency: '$', precision: 2 },
  { symbol: 'PEPEUSDT', name: 'Pepe', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.0000098, currency: '$', precision: 8 },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.0000185, currency: '$', precision: 8 },
  { symbol: 'DOTUSDT', name: 'Polkadot', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 4.65, currency: '$', precision: 2 },
  { symbol: 'LTCUSDT', name: 'Litecoin', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 72.50, currency: '$', precision: 2 },
  { symbol: 'BCHUSDT', name: 'Bitcoin Cash', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 385.00, currency: '$', precision: 2 },
  { symbol: 'FETUSDT', name: 'Artificial Superintelligence Alliance', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 1.45, currency: '$', precision: 4 },
  { symbol: 'TAOUSDT', name: 'Bittensor AI', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 540.00, currency: '$', precision: 2 },
  { symbol: 'RENDERUSDT', name: 'Render Token', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 6.25, currency: '$', precision: 3 },
  { symbol: 'INJUSDT', name: 'Injective', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 23.50, currency: '$', precision: 2 },
  { symbol: 'ARBUSDT', name: 'Arbitrum One', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.62, currency: '$', precision: 4 },
  { symbol: 'OPUSDT', name: 'Optimism', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 1.75, currency: '$', precision: 3 },
  { symbol: 'MATICUSDT', name: 'Polygon (POL)', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.38, currency: '$', precision: 4 },
  { symbol: 'UNIUSDT', name: 'Uniswap', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 8.40, currency: '$', precision: 2 },
  { symbol: 'AAVEUSDT', name: 'Aave', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 165.00, currency: '$', precision: 2 },
  { symbol: 'TIAUSDT', name: 'Celestia', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 5.80, currency: '$', precision: 3 },
  { symbol: 'KASUSDT', name: 'Kaspa', cat: 'crypto', exchange: 'Bybit/Kraken', basePrice: 0.138, currency: '$', precision: 4 },
  { symbol: 'TONUSDT', name: 'Toncoin', cat: 'crypto', exchange: 'Bybit/OKX', basePrice: 5.10, currency: '$', precision: 2 },
  { symbol: 'WIFUSDT', name: 'dogwifhat', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 2.45, currency: '$', precision: 3 },
  { symbol: 'BONKUSDT', name: 'Bonk', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.0000225, currency: '$', precision: 8 },
  { symbol: 'FLOKIUSDT', name: 'Floki', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.000155, currency: '$', precision: 6 },
  { symbol: 'STXUSDT', name: 'Stacks Bitcoin L2', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 1.85, currency: '$', precision: 3 },
  { symbol: 'IMXUSDT', name: 'ImmutableX', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 1.48, currency: '$', precision: 3 },
  { symbol: 'FILUSDT', name: 'Filecoin', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 3.85, currency: '$', precision: 3 },
  { symbol: 'ATOMUSDT', name: 'Cosmos Hub', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 4.80, currency: '$', precision: 2 },
  { symbol: 'SEIUSDT', name: 'Sei Network', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.42, currency: '$', precision: 4 },
  { symbol: 'RUNEUSDT', name: 'THORChain', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 5.40, currency: '$', precision: 3 },
  { symbol: 'JUPUSDT', name: 'Jupiter DEX', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 1.05, currency: '$', precision: 3 },
  { symbol: 'PENDLEUSDT', name: 'Pendle Finance', cat: 'crypto', exchange: 'Bybit/OKX', basePrice: 4.75, currency: '$', precision: 3 },
  { symbol: 'WLDUSDT', name: 'Worldcoin', cat: 'crypto', exchange: 'Bybit/OKX', basePrice: 2.10, currency: '$', precision: 3 },
  { symbol: 'ICPUSDT', name: 'Internet Computer', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 8.60, currency: '$', precision: 2 },
  { symbol: 'HBARUSDT', name: 'Hedera Hashgraph', cat: 'crypto', exchange: 'Bybit/OKX/Kraken', basePrice: 0.054, currency: '$', precision: 4 },
  { symbol: 'ONDOUSDT', name: 'Ondo Finance RWA', cat: 'crypto', exchange: 'Bybit/OKX', basePrice: 0.78, currency: '$', precision: 4 },

  // ==========================================
  // 2. FTSE MIB — TUTTI I 40 TITOLI BORSA ITALIANA (QUOTAZIONI REALI DI MERCATO)
  // ==========================================
  { symbol: 'UCG.MI', name: 'UniCredit S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 78.65, currency: '€', precision: 2 },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 6.28, currency: '€', precision: 3 },
  { symbol: 'ENEL.MI', name: 'Enel S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 9.68, currency: '€', precision: 2 },
  { symbol: 'ENI.MI', name: 'Eni S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 25.54, currency: '€', precision: 2 },
  { symbol: 'RACE.MI', name: 'Ferrari N.V.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 382.55, currency: '€', precision: 2 },
  { symbol: 'STLAM.MI', name: 'Stellantis N.V.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 4.15, currency: '€', precision: 3 },
  { symbol: 'STM.MI', name: 'STMicroelectronics', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 40.91, currency: '€', precision: 2 },
  { symbol: 'G.MI', name: 'Assicurazioni Generali', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 44.02, currency: '€', precision: 2 },
  { symbol: 'PRY.MI', name: 'Prysmian S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 104.40, currency: '€', precision: 2 },
  { symbol: 'LDO.MI', name: 'Leonardo S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 51.12, currency: '€', precision: 2 },
  { symbol: 'BAMI.MI', name: 'Banco BPM', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 13.92, currency: '€', precision: 2 },
  { symbol: 'MONC.MI', name: 'Moncler S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 46.90, currency: '€', precision: 2 },
  { symbol: 'TEN.MI', name: 'Tenaris S.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 16.85, currency: '€', precision: 2 },
  { symbol: 'MB.MI', name: 'Mediobanca', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 16.40, currency: '€', precision: 2 },
  { symbol: 'PST.MI', name: 'Poste Italiane', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 14.20, currency: '€', precision: 2 },
  { symbol: 'TRN.MI', name: 'Terna S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 8.45, currency: '€', precision: 2 },
  { symbol: 'SRG.MI', name: 'Snam S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 4.62, currency: '€', precision: 2 },
  { symbol: 'AMP.MI', name: 'Amplifon S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 31.20, currency: '€', precision: 2 },
  { symbol: 'CPR.MI', name: 'Davide Campari-Milano', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 8.10, currency: '€', precision: 2 },
  { symbol: 'DIA.MI', name: 'DiaSorin S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 108.50, currency: '€', precision: 2 },
  { symbol: 'REC.MI', name: 'Recordati S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 54.20, currency: '€', precision: 2 },
  { symbol: 'NEXI.MI', name: 'Nexi S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 6.15, currency: '€', precision: 2 },
  { symbol: 'INW.MI', name: 'Infrastrutture Wireless (INWIT)', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 10.80, currency: '€', precision: 2 },
  { symbol: 'A2A.MI', name: 'A2A S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 2.24, currency: '€', precision: 3 },
  { symbol: 'HER.MI', name: 'Hera S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 3.75, currency: '€', precision: 2 },
  { symbol: 'BPE.MI', name: 'BPER Banca', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 6.35, currency: '€', precision: 2 },
  { symbol: 'BGN.MI', name: 'Banca Generali', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 43.80, currency: '€', precision: 2 },
  { symbol: 'AZM.MI', name: 'Azimut Holding', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 26.40, currency: '€', precision: 2 },
  { symbol: 'FBK.MI', name: 'FinecoBank', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 17.10, currency: '€', precision: 2 },
  { symbol: 'IVG.MI', name: 'Iveco Group N.V.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 11.20, currency: '€', precision: 2 },
  { symbol: 'PIRC.MI', name: 'Pirelli & C.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 5.85, currency: '€', precision: 2 },
  { symbol: 'TIT.MI', name: 'Telecom Italia', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 0.265, currency: '€', precision: 4 },
  { symbol: 'SPM.MI', name: 'Saipem S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 2.48, currency: '€', precision: 3 },
  { symbol: 'BMED.MI', name: 'Banca Mediolanum', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 11.90, currency: '€', precision: 2 },
  { symbol: 'ERG.MI', name: 'ERG S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 27.80, currency: '€', precision: 2 },
  { symbol: 'BPSO.MI', name: 'Banca Popolare di Sondrio', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 7.85, currency: '€', precision: 2 },
  { symbol: 'UNI.MI', name: 'Unipol Gruppo', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 12.30, currency: '€', precision: 2 },
  { symbol: 'IG.MI', name: 'Italgas S.p.A.', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 5.60, currency: '€', precision: 2 },
  { symbol: 'BC.MI', name: 'Brunello Cucinelli', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 98.40, currency: '€', precision: 2 },
  { symbol: 'IP.MI', name: 'Interpump Group', cat: 'eu_stock', exchange: 'MTA Milano', basePrice: 44.60, currency: '€', precision: 2 },

  // ==========================================
  // 3. S&P 500 & NASDAQ 100 LEADERS (QUOTAZIONI REALI)
  // ==========================================
  { symbol: 'NVDA', name: 'NVIDIA Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 142.50, currency: '$', precision: 2 },
  { symbol: 'AAPL', name: 'Apple Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 234.80, currency: '$', precision: 2 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 428.50, currency: '$', precision: 2 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 198.40, currency: '$', precision: 2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 181.20, currency: '$', precision: 2 },
  { symbol: 'META', name: 'Meta Platforms (Facebook)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 585.60, currency: '$', precision: 2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 248.90, currency: '$', precision: 2 },
  { symbol: 'PLTR', name: 'Palantir Technologies', cat: 'us_stock', exchange: 'NYSE', basePrice: 44.50, currency: '$', precision: 2 },
  { symbol: 'MSTR', name: 'MicroStrategy Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 252.00, currency: '$', precision: 2 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 154.20, currency: '$', precision: 2 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 178.50, currency: '$', precision: 2 },
  { symbol: 'NFLX', name: 'Netflix Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 745.00, currency: '$', precision: 2 },
  { symbol: 'COIN', name: 'Coinbase Global', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 218.40, currency: '$', precision: 2 },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 318.50, currency: '$', precision: 2 },
  { symbol: 'SMCI', name: 'Super Micro Computer', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 48.20, currency: '$', precision: 2 },
  { symbol: 'ARM', name: 'Arm Holdings plc', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 152.00, currency: '$', precision: 2 },
  { symbol: 'LLY', name: 'Eli Lilly and Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 895.00, currency: '$', precision: 2 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', cat: 'us_stock', exchange: 'NYSE', basePrice: 224.50, currency: '$', precision: 2 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cat: 'etf', exchange: 'NYSE Arca', basePrice: 582.40, currency: '$', precision: 2 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ 100)', cat: 'etf', exchange: 'NASDAQ', basePrice: 496.80, currency: '$', precision: 2 },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', cat: 'etf', exchange: 'NYSE Arca', basePrice: 228.00, currency: '$', precision: 2 },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average', cat: 'etf', exchange: 'NYSE Arca', basePrice: 432.50, currency: '$', precision: 2 },

  // ==========================================
  // 4. FOREX & COMMODITIES (VALUTE & MATERIE PRIME)
  // ==========================================
  { symbol: 'EURUSD', name: 'Euro / US Dollar', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.0850, currency: '$', precision: 4 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.2980, currency: '$', precision: 4 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', cat: 'forex', exchange: 'Interbank Forex', basePrice: 152.40, currency: '¥', precision: 2 },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.8670, currency: 'CHF', precision: 4 },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.6620, currency: '$', precision: 4 },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.3850, currency: 'C$', precision: 4 },
  { symbol: 'XAUUSD', name: 'Gold Spot / US Dollar (Oro)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 2745.00, currency: '$', precision: 2 },
  { symbol: 'XAGUSD', name: 'Silver Spot / US Dollar (Argento)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 32.80, currency: '$', precision: 2 },
  { symbol: 'USOIL', name: 'WTI Crude Oil (Petrolio)', cat: 'forex', exchange: 'Commodities', basePrice: 71.80, currency: '$', precision: 2 }
];

// ==========================================
// FAVORITES MANAGER WITH CONFIRMATION & TYPOLOGY
// ==========================================
window.FavoritesManager = {
  STORAGE_KEY: 'tpu_favorite_assets_v3',

  getFavorites: function() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Curated default favorites list covering all 4 typologies
    return [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'NEARUSDT', 'SUIUSDT',
      'UCG.MI', 'ISP.MI', 'ENEL.MI', 'ENI.MI', 'RACE.MI', 'STM.MI',
      'NVDA', 'AAPL', 'MSFT', 'TSLA', 'PLTR',
      'EURUSD', 'XAUUSD', 'USOIL'
    ];
  },

  isFavorite: function(symbol) {
    if (!symbol) return false;
    const favs = this.getFavorites();
    return favs.includes(symbol.toUpperCase().trim());
  },

  toggleFavorite: function(symbol, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    symbol = symbol.toUpperCase().trim();
    let favs = this.getFavorites();
    const isFav = favs.includes(symbol);

    if (isFav) {
      favs = favs.filter(s => s !== symbol);
      if (window.showToast) window.showToast(`⭐ Rimosso dai Preferiti: ${symbol}`, 'info');
    } else {
      favs.push(symbol);
      if (window.showToast) window.showToast(`⭐ Aggiunto ai Preferiti: ${symbol}!`, 'success');
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favs));
    } catch (e) {}

    // Re-render asset list
    if (window.filterMegaCategory) {
      window.filterMegaCategory(window.activeMegaCategory || 'all');
    }
  }
};

window.getAssetBySymbol = function(symbol) {
  if (!symbol) return null;
  symbol = symbol.toUpperCase().trim();
  const found = window.GlobalMarketAssets.find(a => a.symbol === symbol || a.symbol.replace('.MI', '') === symbol);
  if (found) return found;

  // Dynamic heuristic for any crypto, stock, or forex
  const isCrypto = symbol.endsWith('USDT') || symbol.endsWith('USD') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'BNB', 'NEAR'].some(c => symbol.includes(c));
  const isItalian = symbol.endsWith('.MI');
  const isForex = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'].some(fx => symbol.startsWith(fx) && symbol.length === 6);

  return {
    symbol: symbol,
    name: `${symbol} (Custom Asset)`,
    cat: isCrypto ? 'crypto' : (isItalian ? 'eu_stock' : (isForex ? 'forex' : 'us_stock')),
    exchange: isCrypto ? 'Bybit/OKX/Kraken' : (isItalian ? 'MTA Milano' : (isForex ? 'Forex' : 'NASDAQ/NYSE')),
    basePrice: isCrypto ? 10.00 : (isItalian ? 15.00 : (isForex ? 1.1000 : 150.00)),
    currency: isItalian ? '€' : '$',
    precision: isForex ? 4 : (isCrypto && symbol.includes('PEPE') ? 8 : 2)
  };
};
