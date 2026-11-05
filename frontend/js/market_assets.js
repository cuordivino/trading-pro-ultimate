/**
 * TRADING PRO ULTIMATE™ — COMPENDIO ENCICLOPEDICO ASSETS
 * Riferimento Ufficiale Guide PDF: Borsa Italiana (Tutti i Titoli A-Z), NASDAQ-100, S&P 500, Forex Majors & Exotics, Crypto OKX/Bybit, Guida agli Asset Globali (Materie Prime CME/ICE/LME)
 * © by cuordivino — Tutti i diritti riservati
 */

// Motore Dinamico Precisione Decimale (fino a 0.00000001 per meme token e micro-pip)
window.getDynamicPrecision = function(price, symbol) {
  if (symbol) {
    const s = symbol.toUpperCase().trim().replace('/', '').replace('.MI', '');
    if (s.includes('PEPE') || s.includes('SHIB') || s.includes('BONK')) return 8;
    if (s.includes('FLOKI')) return 6;
    if (s.endsWith('JPY')) return 3;
    if (['EURUSD', 'GBPUSD', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'USDCNY', 'USDCNH', 'USDHKD', 'USDSGD'].includes(s)) return 4;
    // Commodities specific precision
    if (['RB', 'HO', 'NG', 'NATGAS'].includes(s)) return 4;
    if (['HG', 'COPPER', 'SB'].includes(s)) return 4;
  }
  const p = Math.abs(Number(price) || 0);
  if (p === 0) return 2;
  if (p < 0.0001) return 8;
  if (p < 0.01) return 6;
  if (p < 1.0) return 4;   // es. ENA ~$0.1835, TIT.MI ~€0.2650, DOGE ~$0.1650, ADA ~$0.3850
  if (p < 10.0) return 4;  // es. NEAR ~$4.0200, STLAM.MI ~€4.1500, NG ~$2.7480, RB ~$2.1240, HO ~$2.2850
  if (p < 100.0) return 2; // es. PST.MI ~€14.20, UCG.MI ~€78.65, CL ~$71.85, SI ~$32.84
  return 2;                // es. BTC ~$80,210.00, GC ~$2,746.50, NVDA ~$142.50
};

window.getDynamicMinMove = function(precision) {
  return Math.pow(10, -(precision || 2));
};

window.GlobalMarketAssets = [
  // =========================================================================
  // 1. MATERIE PRIME (GUIDA AGLI ASSET GLOBALI: METALLI PREZIOSI, ENERGETICI, METALLI INDUSTRIALI, AGRICOLI)
  // =========================================================================
  // Metalli Preziosi (COMEX / NYMEX)
  { symbol: 'GC', name: 'Oro (Gold Futures)', cat: 'forex', exchange: 'COMEX / London AM Fix', basePrice: 2746.50, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Preziosi' },
  { symbol: 'SI', name: 'Argento (Silver Futures)', cat: 'forex', exchange: 'COMEX', basePrice: 32.84, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Preziosi' },
  { symbol: 'PL', name: 'Platino (Platinum Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1012.40, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Preziosi' },
  { symbol: 'PA', name: 'Palladio (Palladium Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1115.60, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Preziosi' },

  // Energetici (NYMEX / ICE)
  { symbol: 'CL', name: 'Petrolio Greggio WTI (Light Sweet Crude)', cat: 'forex', exchange: 'NYMEX', basePrice: 71.85, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'BRN', name: 'Petrolio Greggio Brent (North Sea Crude)', cat: 'forex', exchange: 'ICE', basePrice: 75.42, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'NG', name: 'Gas Naturale (Henry Hub US Benchmark)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.7480, currency: '$', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'RB', name: 'Benzina RBOB (Reformulated Gasoline)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.1240, currency: '$', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'HO', name: 'Gasolio da Riscaldamento (Heating Oil)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.2850, currency: '$', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },

  // Metalli Industriali (LME / CME)
  { symbol: 'HG', name: 'Rame (Copper Grade A)', cat: 'forex', exchange: 'LME / CME', basePrice: 4.4250, currency: '$', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ALI', name: 'Alluminio Primario (Aluminium)', cat: 'forex', exchange: 'LME / CME', basePrice: 2620.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ZN', name: 'Zinco Primario (Zinc SHG)', cat: 'forex', exchange: 'LME / CME', basePrice: 3120.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'NI', name: 'Nichel (Nickel Class 1)', cat: 'forex', exchange: 'LME / CME', basePrice: 16180.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Industriali (Base Metals)' },

  // Materie Prime Agricole (CBOT / ICE)
  { symbol: 'ZW', name: 'Grano Tenero (Wheat Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 572.50, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZC', name: 'Mais Giallo (Corn Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 418.25, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZS', name: 'Soia (Soybeans Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 998.50, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'KC', name: 'Caffè Arabica (Coffee "C" Contract)', cat: 'forex', exchange: 'ICE', basePrice: 248.60, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Soft Commodities' },
  { symbol: 'CC', name: 'Cacao (Cocoa Futures)', cat: 'forex', exchange: 'ICE', basePrice: 7280.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Soft Commodities' },
  { symbol: 'SB', name: 'Zucchero Greggio (Sugar No. 11)', cat: 'forex', exchange: 'ICE', basePrice: 22.15, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Soft Commodities' },
  { symbol: 'CT', name: 'Cotone (Cotton No. 2)', cat: 'forex', exchange: 'ICE', basePrice: 72.80, currency: '¢', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Soft Commodities' },

  // =========================================================================
  // 2. MERCATO FOREX (GUIDA PDF FOREX: CORE MAJORS, COMMODITIES, CROSSES, EXOTICS)
  // =========================================================================
  { symbol: 'EURUSD', name: 'Euro / Dollaro USA (Fiber)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.12350, currency: '$', precision: 5, change24h: 0.05, volume24h: 1468, sector: 'Core Majors' },
  { symbol: 'USDJPY', name: 'Dollaro USA / Yen Giapponese (Gopher)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 158.369, currency: '¥', precision: 3, change24h: -0.03, volume24h: 3790, sector: 'Core Majors' },
  { symbol: 'GBPUSD', name: 'Sterlina / Dollaro USA (Cable)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.34776, currency: '$', precision: 5, change24h: 0.04, volume24h: 3530, sector: 'Core Majors' },
  { symbol: 'USDCHF', name: 'Dollaro USA / Franco Svizzero (Swissie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.81655, currency: 'CHF', precision: 5, change24h: -0.07, volume24h: 3228, sector: 'Core Majors' },
  { symbol: 'USDCAD', name: 'Dollaro USA / Dollaro Canadese (Loonie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.39730, currency: 'C$', precision: 5, change24h: -0.03, volume24h: 1798, sector: 'Commodity Majors' },
  { symbol: 'AUDUSD', name: 'Dollaro Australiano / Dollaro USA (Aussie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.70060, currency: '$', precision: 5, change24h: 1.25, volume24h: 1456, sector: 'Commodity Majors' },
  { symbol: 'NZDUSD', name: 'Dollaro Neozelandese / Dollaro USA (Kiwi)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.56244, currency: '$', precision: 5, change24h: 0.03, volume24h: 3937, sector: 'Commodity Majors' },
  { symbol: 'EURGBP', name: 'Euro / Sterlina Britannica', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.83362, currency: '£', precision: 5, change24h: 0.02, volume24h: 1261, sector: 'Crosses / Minors' },
  { symbol: 'EURJPY', name: 'Euro / Yen Giapponese', cat: 'forex', exchange: 'Interbank Forex', basePrice: 177.928, currency: '¥', precision: 3, change24h: 0.02, volume24h: 3223, sector: 'Crosses / Minors' },
  { symbol: 'GBPJPY', name: 'Sterlina / Yen Giapponese (Guppy)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 213.446, currency: '¥', precision: 3, change24h: 0.01, volume24h: 5230, sector: 'Crosses / Minors' },
  { symbol: 'USDCNY', name: 'Dollaro USA / Renminbi Cinese (Onshore/Offshore)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 6.67310, currency: '¥', precision: 5, change24h: 0.05, volume24h: 24500000, sector: 'Exotics' },
  { symbol: 'USDHKD', name: 'Dollaro USA / Dollaro Hong Kong (Pegged)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 7.84497, currency: 'HK$', precision: 5, change24h: -0.0, volume24h: 121, sector: 'Exotics' },
  { symbol: 'USDSGD', name: 'Dollaro USA / Dollaro Singapore', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.27880, currency: 'S$', precision: 5, change24h: -0.0, volume24h: 2681, sector: 'Exotics' },
  { symbol: 'XAUUSD', name: 'Oro Spot / Dollaro USA (Gold Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 4070.24, currency: '$', precision: 2, change24h: 0.24, volume24h: 6282, sector: 'Metalli Preziosi' },
  { symbol: 'XAGUSD', name: 'Argento Spot / Dollaro USA (Silver Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 32.84, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Metalli Preziosi' },
  { symbol: 'USOIL', name: 'WTI Crude Oil (Spot Petrolio)', cat: 'forex', exchange: 'Commodities', basePrice: 71.85, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'BRENT', name: 'Brent Crude Oil (Spot Brent)', cat: 'forex', exchange: 'Commodities', basePrice: 75.42, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },
  { symbol: 'NATGAS', name: 'Natural Gas Henry Hub', cat: 'forex', exchange: 'Commodities', basePrice: 2.7480, currency: '$', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'Energetici' },

  // =========================================================================
  // 3. BORSA ITALIANA — COMPENDIO COMPLETO A-Z DA PDF UFFICIALE (FTSE MIB, STAR, EURONEXT MILAN, GROWTH)
  // =========================================================================
  { symbol: 'A2A.MI', name: 'A2A S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.4110, currency: '€', precision: 4, change24h: 1.73, volume24h: 9559813, sector: 'FTSE MIB • Utility' },
  { symbol: 'ACE.MI', name: 'Acea S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 21.58, currency: '€', precision: 2, change24h: 1.98, volume24h: 126019, sector: 'Euronext Milan • Utility' },
  { symbol: 'ALF.MI', name: 'Altea Green Power', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Growth Milan • Rinnovabili' },
  { symbol: 'AMP.MI', name: 'Amplifon S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 11.755, currency: '€', precision: 3, change24h: 0.17, volume24h: 2446905, sector: 'FTSE MIB • Salute & Benessere' },
  { symbol: 'ARN.MI', name: 'Ariston Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 18.400, currency: '€', precision: 3, change24h: 5.14, volume24h: 36618, sector: 'Euronext Milan • Riscaldamento/Industria' },
  { symbol: 'G.MI', name: 'Assicurazioni Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 44.02, currency: '€', precision: 2, change24h: 2.87, volume24h: 2313122, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'AZM.MI', name: 'Azimut Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 35.60, currency: '€', precision: 2, change24h: 2.12, volume24h: 559609, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'ANIM.MI', name: 'Anima Holding S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.810, currency: '€', precision: 3, change24h: -2.99, volume24h: 628032, sector: 'FTSE Italia Mid Cap • Risparmio Gestito' },
  { symbol: 'BF.MI', name: 'B.F. S.p.A. (Bonifiche Ferraresi)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.2500, currency: '€', precision: 4, change24h: 1.25, volume24h: 24500000, sector: 'FTSE Italia Mid Cap • Agricoltura / Alimentare' },
  { symbol: 'BFF.MI', name: 'BFF Bank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.0740, currency: '€', precision: 4, change24h: 5.82, volume24h: 2929486, sector: 'FTSE Italia Mid Cap • Finanza Specialistica' },
  { symbol: 'BPE.MI', name: 'BPER Banca', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 13.646, currency: '€', precision: 3, change24h: 3.96, volume24h: 9341120, sector: 'FTSE MIB • Banche' },
  { symbol: 'BGEN.MI', name: 'Banca Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 43.80, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMED.MI', name: 'Banca Mediolanum', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 23.28, currency: '€', precision: 2, change24h: 3.56, volume24h: 916580, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMPS.MI', name: 'Banca Monte dei Paschi di Siena', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 11.484, currency: '€', precision: 3, change24h: 5.07, volume24h: 13446455, sector: 'FTSE MIB • Banche' },
  { symbol: 'BAMI.MI', name: 'Banco BPM', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 13.920, currency: '€', precision: 3, change24h: 3.61, volume24h: 7273615, sector: 'FTSE MIB • Banche' },
  { symbol: 'BRE.MI', name: 'Brembo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.420, currency: '€', precision: 3, change24h: 1.25, volume24h: 958053, sector: 'Euronext Milan • Componentistica Auto' },
  { symbol: 'BC.MI', name: 'Brunello Cucinelli', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 87.60, currency: '€', precision: 2, change24h: 1.93, volume24h: 271497, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'CE.MI', name: 'Cairo Communication', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 20.46, currency: '€', precision: 2, change24h: 4.02, volume24h: 199563, sector: 'Euronext Milan • Media & Editoria' },
  { symbol: 'CPR.MI', name: 'Campari (Davide Campari-Milano)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.608, currency: '€', precision: 3, change24h: 3.67, volume24h: 5730393, sector: 'FTSE MIB • Alimentari & Bevande' },
  { symbol: 'CELL.MI', name: 'Cellularline', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.6800, currency: '€', precision: 4, change24h: -0.74, volume24h: 26244, sector: 'STAR • Accessori Elettronica' },
  { symbol: 'DAL.MI', name: "D'Amico International Shipping", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.95, currency: '€', precision: 2, sector: 'STAR • Trasporti Marittimi' },
  { symbol: 'DIA.MI', name: 'Diasorin S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 82.18, currency: '€', precision: 2, change24h: 2.21, volume24h: 171206, sector: 'FTSE MIB • Salute & Biomedicale' },
  { symbol: 'EAV.MI', name: 'Enav S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.2100, currency: '€', precision: 4, change24h: -1.63, volume24h: 2500, sector: 'Euronext Milan • Controllo Traffico Aereo' },
  { symbol: 'ENEL.MI', name: 'Enel S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.679, currency: '€', precision: 3, change24h: 3.82, volume24h: 29229047, sector: 'FTSE MIB • Utility / Energia' },
  { symbol: 'ENI.MI', name: 'Eni S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 25.54, currency: '€', precision: 2, change24h: -1.9, volume24h: 9603314, sector: 'FTSE MIB • Petrolifero' },
  { symbol: 'ERG.MI', name: 'Erg S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 22.16, currency: '€', precision: 2, change24h: 1.74, volume24h: 393366, sector: 'Euronext Milan • Energia Green' },
  { symbol: 'ELUX.MI', name: 'EssilorLuxottica', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 218.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'FTSE MIB • Ottica / Beni di Consumo' },
  { symbol: 'RACE.MI', name: 'Ferrari N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 382.55, currency: '€', precision: 2, change24h: 2.01, volume24h: 773973, sector: 'FTSE MIB • Automotive / Lusso' },
  { symbol: 'FB.MI', name: 'Fila S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.60, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'STAR • Beni di Consumo' },
  { symbol: 'FBK.MI', name: 'FinecoBank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 22.19, currency: '€', precision: 2, change24h: 4.37, volume24h: 4350207, sector: 'FTSE MIB • Banche Online' },
  { symbol: 'GAB.MI', name: 'Gabetti Property Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.3810, currency: '€', precision: 4, change24h: 4.38, volume24h: 93391, sector: 'Euronext Milan • Immobiliare' },
  { symbol: 'GEO.MI', name: 'Geox S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.2700, currency: '€', precision: 4, change24h: 1.25, volume24h: 338289, sector: 'Euronext Milan • Calzature' },
  { symbol: 'IM.MI', name: 'Immsi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.540, currency: '€', precision: 3, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Holding Industriale' },
  { symbol: 'IP.MI', name: 'Interpump Group', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 38.26, currency: '€', precision: 2, change24h: 0.1, volume24h: 130114, sector: 'FTSE MIB • Industria' },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.282, currency: '€', precision: 3, change24h: 4.93, volume24h: 94071895, sector: 'FTSE MIB • Banche' },
  { symbol: 'INW.MI', name: 'Infrastrutture Wireless (INWIT)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.350, currency: '€', precision: 3, change24h: -0.27, volume24h: 1417069, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'IRE.MI', name: 'Iren S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.4480, currency: '€', precision: 4, change24h: 2.34, volume24h: 1353332, sector: 'Euronext Milan • Multi-utility' },
  { symbol: 'IVG.MI', name: 'Iveco Group N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 14.375, currency: '€', precision: 3, change24h: 1.25, volume24h: 964193, sector: 'FTSE MIB • Veicoli Industriali' },
  { symbol: 'JUVE.MI', name: 'Juventus FC', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.6000, currency: '€', precision: 4, change24h: 1.91, volume24h: 789018, sector: 'Euronext Milan • Sport & Entertainment' },
  { symbol: 'LDO.MI', name: 'Leonardo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 51.12, currency: '€', precision: 2, change24h: -1.03, volume24h: 2840592, sector: 'FTSE MIB • Difesa & Aerospazio' },
  { symbol: 'MAU.MI', name: 'Maire Tecnimont', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.65, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Ingegneria' },
  { symbol: 'MS.MI', name: 'Mediaset (MFE A/B)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.6500, currency: '€', precision: 4, change24h: -1.52, volume24h: 14476, sector: 'Euronext Milan • Media TV' },
  { symbol: 'MONC.MI', name: 'Moncler S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 46.90, currency: '€', precision: 2, change24h: 4.5, volume24h: 1600727, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'NEXI.MI', name: 'Nexi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.6440, currency: '€', precision: 4, change24h: 3.27, volume24h: 8687340, sector: 'FTSE MIB • Servizi Finanziari / Digital' },
  { symbol: 'OVS.MI', name: 'Ovs S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.100, currency: '€', precision: 3, change24h: 2.95, volume24h: 221543, sector: 'Euronext Milan • Abbigliamento Retail' },
  { symbol: 'PIA.MI', name: 'Piaggio & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.0880, currency: '€', precision: 4, change24h: 1.16, volume24h: 994367, sector: 'Euronext Milan • Automotive' },
  { symbol: 'PIRC.MI', name: 'Pirelli & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.760, currency: '€', precision: 3, change24h: 1.96, volume24h: 1633300, sector: 'FTSE MIB • Pneumatici' },
  { symbol: 'PST.MI', name: 'Poste Italiane', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 24.87, currency: '€', precision: 2, change24h: 2.77, volume24h: 2989517, sector: 'FTSE MIB • Servizi Postali & Finanziari' },
  { symbol: 'PRY.MI', name: 'Prysmian S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 104.40, currency: '€', precision: 2, change24h: -6.91, volume24h: 2106311, sector: 'FTSE MIB • Cavi Industriali' },
  { symbol: 'RAI.MI', name: 'Rai Way S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Torri & Trasmissione' },
  { symbol: 'REC.MI', name: 'Recordati S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 53.10, currency: '€', precision: 2, change24h: 0.19, volume24h: 378457, sector: 'FTSE MIB • Farmaceutica' },
  { symbol: 'STM.MI', name: 'STMicroelectronics', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 40.91, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'FTSE MIB • Semiconduttori' },
  { symbol: 'SFL.MI', name: 'Sanlorenzo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.0520, currency: '€', precision: 4, change24h: 2.09, volume24h: 331889, sector: 'FTSE Italia Mid Cap / STAR • Nautica di Lusso' },
  { symbol: 'SAFILO.MI', name: 'Safilo Group S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.150, currency: '€', precision: 3, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Occhialeria' },
  { symbol: 'SPM.MI', name: 'Saipem S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.3280, currency: '€', precision: 4, change24h: -0.21, volume24h: 19731708, sector: 'FTSE MIB • Servizi Petroliferi' },
  { symbol: 'SAB.MI', name: 'Saras S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.750, currency: '€', precision: 3, change24h: -1.38, volume24h: 1020, sector: 'Euronext Milan • Raffinazione' },
  { symbol: 'SESA.MI', name: 'Sesa S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 92.50, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'STAR • IT Services & Cloud' },
  { symbol: 'SRG.MI', name: 'Snam S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.252, currency: '€', precision: 3, change24h: 1.53, volume24h: 7404037, sector: 'FTSE MIB • Infrastrutture Gas' },
  { symbol: 'SOL.MI', name: 'Sol S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 62.70, currency: '€', precision: 2, change24h: 2.12, volume24h: 23350, sector: 'Euronext Milan • Gas Industriali' },
  { symbol: 'STLAM.MI', name: 'Stellantis N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.1550, currency: '€', precision: 4, change24h: 1.96, volume24h: 58508077, sector: 'FTSE MIB • Automotive' },
  { symbol: 'TEN.MI', name: 'Tenaris S.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 24.89, currency: '€', precision: 2, change24h: -3.38, volume24h: 2169277, sector: 'FTSE MIB • Tubi & Acciaio' },
  { symbol: 'TNG.MI', name: 'Technogym S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Fitness Equipment' },
  { symbol: 'TIT.MI', name: 'Telecom Italia (TIM)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.819, currency: '€', precision: 3, change24h: 2.2, volume24h: 2465506, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'TRN.MI', name: 'Terna S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.742, currency: '€', precision: 3, change24h: 2.29, volume24h: 3011812, sector: 'FTSE MIB • Reti Elettriche' },
  { symbol: 'TOD.MI', name: "Tod's S.p.A.", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 43.00, currency: '€', precision: 2, sector: 'Euronext Milan • Calzature Lusso' },
  { symbol: 'TXT.MI', name: 'Txt E-Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 49.00, currency: '€', precision: 2, change24h: 3.92, volume24h: 61816, sector: 'STAR • Software & Tech' },
  { symbol: 'UCG.MI', name: 'UniCredit S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 78.32, currency: '€', precision: 2, change24h: 5.47, volume24h: 7963565, sector: 'FTSE MIB • Banche' },
  { symbol: 'UNI.MI', name: 'Unipol Gruppo', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 26.45, currency: '€', precision: 2, change24h: 2.96, volume24h: 1766608, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'VLA.MI', name: 'Valsoia S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.80, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Alimentare Sano' },
  { symbol: 'ZUC.MI', name: 'Zucchi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.3840, currency: '€', precision: 4, change24h: 1.05, volume24h: 3836, sector: 'Euronext Milan • Tessile Casa' },
  { symbol: 'YSY.MI', name: 'Reply S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 138.50, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'FTSE Italia Mid Cap / STAR • IT / Consulenza Tech' },

  // =========================================================================
  // 4. NASDAQ-100 — GUIDA PDF UFFICIALE (GIGANTI TECH, E-COMMERCE, AUTOMOTIVE, BIOTECH)
  // =========================================================================
  { symbol: 'AAPL', name: 'Apple Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 349.51, currency: '$', precision: 2, change24h: 5.31, volume24h: 89535634, sector: 'Tech • Elettronica di Consumo' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 200.13, currency: '$', precision: 2, change24h: -3.17, volume24h: 148424178, sector: 'Tech • Semiconduttori & AI' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 555.80, currency: '$', precision: 2, change24h: 6.68, volume24h: 50764990, sector: 'Tech • Cloud & Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 288.93, currency: '$', precision: 2, change24h: 3.18, volume24h: 51457443, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 287.30, currency: '$', precision: 2, change24h: 3.25, volume24h: 31652252, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'META', name: 'Meta Platforms Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 630.00, currency: '$', precision: 2, change24h: 1.44, volume24h: 32405990, sector: 'Tech • Social Media & Rete' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 325.48, currency: '$', precision: 2, change24h: -2.0, volume24h: 23841056, sector: 'Tech • Semiconduttori' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 488.78, currency: '$', precision: 2, change24h: 1.01, volume24h: 50861225, sector: 'Tech • Microprocessori' },
  { symbol: 'ADBE', name: 'Adobe Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 248.48, currency: '$', precision: 2, change24h: 0.95, volume24h: 4378168, sector: 'Tech • Software & Grafica' },
  { symbol: 'INTC', name: 'Intel Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 58.27, currency: '$', precision: 2, change24h: -3.77, volume24h: 188713476, sector: 'Tech • Microchip' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 173.19, currency: '$', precision: 2, change24h: 5.33, volume24h: 22139958, sector: 'Tech • Wireless & Telecom' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 266.03, currency: '$', precision: 2, change24h: 6.12, volume24h: 93072940, sector: 'Retail • E-Commerce & Cloud' },
  { symbol: 'NFLX', name: 'Netflix Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 66.39, currency: '$', precision: 2, change24h: 4.68, volume24h: 49722290, sector: 'Media • Streaming & Entertainment' },
  { symbol: 'WMT', name: 'Walmart Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 129.17, currency: '$', precision: 2, change24h: 3.45, volume24h: 29276099, sector: 'Retail • Grande Distribuzione' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 1046.47, currency: '$', precision: 2, change24h: 2.67, volume24h: 2583373, sector: 'Retail • Wholesale' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 142.42, currency: '$', precision: 2, change24h: 3.75, volume24h: 12078885, sector: 'Staples • Bevande & Alimentari' },
  { symbol: 'MDLZ', name: 'Mondelez International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 67.38, currency: '$', precision: 2, change24h: 3.47, volume24h: 9715041, sector: 'Staples • Snack & Dolciumi' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 109.70, currency: '$', precision: 2, change24h: 4.71, volume24h: 10193073, sector: 'Discretionary • Caffetterie' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', cat: 'us_stock', exchange: 'NYSE', basePrice: 35.20, currency: '$', precision: 2, change24h: 5.83, volume24h: 21881853, sector: 'Discretionary • Ristorazione' },
  { symbol: 'TSLA', name: 'Tesla Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 385.19, currency: '$', precision: 2, change24h: -3.34, volume24h: 47698701, sector: 'Automotive • Veicoli Elettrici' },
  { symbol: 'HON', name: 'Honeywell International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 228.47, currency: '$', precision: 2, change24h: 1.97, volume24h: 3696832, sector: 'Industrials • Ingegneria Aerospaziale' },
  { symbol: 'CSX', name: 'CSX Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 52.05, currency: '$', precision: 2, change24h: 2.62, volume24h: 15637740, sector: 'Industrials • Trasporti Ferroviari' },
  { symbol: 'ODFL', name: 'Old Dominion Freight Line', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 179.39, currency: '$', precision: 2, change24h: 0.96, volume24h: 1902768, sector: 'Industrials • Trasporto Gomma LTL' },
  { symbol: 'FAST', name: 'Fastenal Company', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 53.21, currency: '$', precision: 2, change24h: 1.68, volume24h: 10837732, sector: 'Industrials • Forniture Industriali' },
  { symbol: 'GILD', name: 'Gilead Sciences', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 174.48, currency: '$', precision: 2, change24h: 4.19, volume24h: 9635691, sector: 'Biotech • Farmaci Antivirali' },
  { symbol: 'AMGN', name: 'Amgen Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 478.48, currency: '$', precision: 2, change24h: 3.73, volume24h: 4619337, sector: 'Biotech • Terapie Avanzate' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 549.04, currency: '$', precision: 2, change24h: 3.44, volume24h: 1832540, sector: 'Biotech • Malattie Rare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 930.67, currency: '$', precision: 2, change24h: -4.39, volume24h: 1395096, sector: 'Biotech • Anticorpi & Ricerca' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 482.10, currency: '$', precision: 2, change24h: 9.38, volume24h: 4825364, sector: 'Health Care • Chirurgia Robotica' },

  // =========================================================================
  // 5. S&P 500 — GUIDA PDF UFFICIALE (FINANCIALS, HEALTHCARE, INDUSTRIALS, ENERGY, STAPLES)
  // =========================================================================
  { symbol: 'ACN', name: 'Accenture plc', cat: 'us_stock', exchange: 'NYSE', basePrice: 264.27, currency: '$', precision: 2, change24h: 3.81, volume24h: 6086438, sector: 'InfoTech • IT Consulting' },
  { symbol: 'CRM', name: 'Salesforce Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 227.11, currency: '$', precision: 2, change24h: 2.21, volume24h: 6506150, sector: 'InfoTech • Cloud Software' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 103.61, currency: '$', precision: 2, change24h: 0.62, volume24h: 29519057, sector: 'InfoTech • Communications' },
  { symbol: 'IBM', name: 'International Business Machines', cat: 'us_stock', exchange: 'NYSE', basePrice: 254.32, currency: '$', precision: 2, change24h: 1.71, volume24h: 3761393, sector: 'InfoTech • Enterprise IT' },
  { symbol: 'ORCL', name: 'Oracle Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 123.73, currency: '$', precision: 2, change24h: -1.95, volume24h: 111757562, sector: 'InfoTech • Systems Software' },
  { symbol: 'DIS', name: 'The Walt Disney Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 118.95, currency: '$', precision: 2, change24h: 4.18, volume24h: 13405989, sector: 'Media • Entertainment' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 24.85, currency: '$', precision: 2, change24h: 4.99, volume24h: 33970834, sector: 'Media • Cable & Satellite' },
  { symbol: 'T', name: 'AT&T Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 21.83, currency: '$', precision: 2, change24h: 2.06, volume24h: 47463274, sector: 'Telecom • Alternative Carriers' },
  { symbol: 'VZ', name: 'Verizon Communications', cat: 'us_stock', exchange: 'NYSE', basePrice: 46.17, currency: '$', precision: 2, change24h: 2.06, volume24h: 25185769, sector: 'Telecom • Integrated Services' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 144.50, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Media • Interactive Home Entertainment' },
  { symbol: 'HD', name: 'The Home Depot Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 355.44, currency: '$', precision: 2, change24h: 6.53, volume24h: 8099482, sector: 'Discretionary • Home Improvement' },
  { symbol: 'NKE', name: 'NIKE Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 40.49, currency: '$', precision: 2, change24h: 5.22, volume24h: 34475742, sector: 'Discretionary • Footwear' },
  { symbol: 'MCD', name: "McDonald's Corporation", cat: 'us_stock', exchange: 'NYSE', basePrice: 296.50, currency: '$', precision: 2, sector: 'Discretionary • Restaurants' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 170.97, currency: '$', precision: 2, change24h: 9.83, volume24h: 14634909, sector: 'Discretionary • Hotels & Travel' },
  { symbol: 'TJX', name: 'The TJX Companies Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 144.76, currency: '$', precision: 2, change24h: 5.18, volume24h: 6902186, sector: 'Discretionary • Apparel Retail' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway (Class B)', cat: 'us_stock', exchange: 'NYSE', basePrice: 579.09, currency: '$', precision: 2, change24h: 3.95, volume24h: 6787597, sector: 'Financials • Multi-Sector Holdings' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', cat: 'us_stock', exchange: 'NYSE', basePrice: 352.11, currency: '$', precision: 2, change24h: 4.18, volume24h: 10378605, sector: 'Financials • Diversified Banks' },
  { symbol: 'BAC', name: 'Bank of America Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 51.63, currency: '$', precision: 2, change24h: 3.97, volume24h: 47380338, sector: 'Financials • Diversified Banks' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 87.43, currency: '$', precision: 2, change24h: 2.22, volume24h: 19977526, sector: 'Financials • Diversified Banks' },
  { symbol: 'MS', name: 'Morgan Stanley', cat: 'us_stock', exchange: 'NYSE', basePrice: 193.97, currency: '$', precision: 2, change24h: 4.23, volume24h: 7867600, sector: 'Financials • Investment Banking' },
  { symbol: 'GS', name: 'The Goldman Sachs Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 928.00, currency: '$', precision: 2, change24h: 3.56, volume24h: 2819861, sector: 'Financials • Investment Banking' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 481.69, currency: '$', precision: 2, change24h: 3.36, volume24h: 2614635, sector: 'Financials • Publishing & Analytics' },
  { symbol: 'AXP', name: 'American Express Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 332.59, currency: '$', precision: 2, change24h: 2.18, volume24h: 3873127, sector: 'Financials • Consumer Finance' },
  { symbol: 'BLK', name: 'BlackRock Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 1224.37, currency: '$', precision: 2, change24h: 5.43, volume24h: 1093028, sector: 'Financials • Asset Management' },
  { symbol: 'C', name: 'Citigroup Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 124.74, currency: '$', precision: 2, change24h: 1.65, volume24h: 16268799, sector: 'Financials • Diversified Banks' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 1417.99, currency: '$', precision: 2, change24h: 0.61, volume24h: 3638114, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'UNH', name: 'UnitedHealth Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 409.38, currency: '$', precision: 2, change24h: 1.22, volume24h: 9524446, sector: 'Health Care • Managed Health Care' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', cat: 'us_stock', exchange: 'NYSE', basePrice: 276.32, currency: '$', precision: 2, change24h: 3.81, volume24h: 9620449, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 150.36, currency: '$', precision: 2, change24h: 3.93, volume24h: 10712911, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 294.83, currency: '$', precision: 2, change24h: 3.09, volume24h: 8434280, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', cat: 'us_stock', exchange: 'NYSE', basePrice: 706.16, currency: '$', precision: 2, change24h: 1.12, volume24h: 2460749, sector: 'Health Care • Life Sciences Tools' },
  { symbol: 'PFE', name: 'Pfizer Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 30.79, currency: '$', precision: 2, change24h: 2.63, volume24h: 49869186, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 591.30, currency: '$', precision: 2, change24h: -5.23, volume24h: 5790773, sector: 'Industrials • Construction Machinery' },
  { symbol: 'GE', name: 'GE Aerospace', cat: 'us_stock', exchange: 'NYSE', basePrice: 329.45, currency: '$', precision: 2, change24h: 2.74, volume24h: 6488200, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 595.04, currency: '$', precision: 2, change24h: -6.88, volume24h: 3057042, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 308.53, currency: '$', precision: 2, change24h: 1.68, volume24h: 2876581, sector: 'Industrials • Rail Transportation' },
  { symbol: 'UPS', name: 'United Parcel Service', cat: 'us_stock', exchange: 'NYSE', basePrice: 114.31, currency: '$', precision: 2, change24h: 4.71, volume24h: 7876947, sector: 'Industrials • Air Freight & Logistics' },
  { symbol: 'BA', name: 'The Boeing Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 177.00, currency: '$', precision: 2, change24h: 2.13, volume24h: 8160167, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'MMM', name: '3M Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 193.95, currency: '$', precision: 2, change24h: 9.55, volume24h: 9053076, sector: 'Industrials • Industrial Conglomerates' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 167.32, currency: '$', precision: 2, change24h: 3.25, volume24h: 13960759, sector: 'Staples • Household Products' },
  { symbol: 'KO', name: 'The Coca-Cola Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 95.80, currency: '$', precision: 2, change24h: 1.05, volume24h: 27078977, sector: 'Staples • Soft Drinks' },
  { symbol: 'PM', name: 'Philip Morris International', cat: 'us_stock', exchange: 'NYSE', basePrice: 211.28, currency: '$', precision: 2, change24h: 1.56, volume24h: 4471403, sector: 'Staples • Tobacco' },
  { symbol: 'CL.US', name: 'Colgate-Palmolive Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 98.50, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Staples • Household Products' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 169.27, currency: '$', precision: 2, change24h: -4.62, volume24h: 25653447, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'CVX', name: 'Chevron Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 216.96, currency: '$', precision: 2, change24h: -3.69, volume24h: 11584956, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'COP', name: 'ConocoPhillips', cat: 'us_stock', exchange: 'NYSE', basePrice: 136.94, currency: '$', precision: 2, change24h: -5.17, volume24h: 11372029, sector: 'Energy • Oil & Gas Exploration' },
  { symbol: 'SLB', name: 'SLB (Schlumberger)', cat: 'us_stock', exchange: 'NYSE', basePrice: 51.56, currency: '$', precision: 2, change24h: -1.09, volume24h: 19991309, sector: 'Energy • Equipment & Services' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 88.45, currency: '$', precision: 2, change24h: 4.89, volume24h: 27510893, sector: 'Utilities • Electric Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 129.59, currency: '$', precision: 2, change24h: 2.43, volume24h: 6957133, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SO', name: 'The Southern Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 93.12, currency: '$', precision: 2, change24h: -0.67, volume24h: 18715360, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cat: 'etf', exchange: 'NYSE Arca', basePrice: 582.40, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'ETF • S&P 500 Benchmark' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ 100)', cat: 'etf', exchange: 'NASDAQ', basePrice: 691.95, currency: '$', precision: 2, change24h: 0.97, volume24h: 62161700, sector: 'ETF • Tech Benchmark' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', cat: 'etf', exchange: 'NYSE Arca', basePrice: 228.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'ETF • Small Cap' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average', cat: 'etf', exchange: 'NYSE Arca', basePrice: 82.18, currency: '$', precision: 2, change24h: 2.21, volume24h: 171206, sector: 'ETF • Blue Chips' },

  // S&P MidCap 400 & NASDAQ (Compendio Multimercato Globale)
  { symbol: 'CHTR', name: 'Charter Communications Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 120.25, currency: '$', precision: 2, change24h: 5.68, volume24h: 3258117, sector: 'NASDAQ-100 • Telecomunicazioni' },
  { symbol: 'DECK', name: 'Deckers Outdoor Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 89.11, currency: '$', precision: 2, change24h: 5.97, volume24h: 3609265, sector: 'S&P MidCap 400 • Abbigliamento & Calzature' },
  { symbol: 'EEFT', name: 'Euronet Worldwide Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 70.65, currency: '$', precision: 2, change24h: 6.66, volume24h: 980680, sector: 'S&P MidCap 400 • Elaborazione Pagamenti' },
  { symbol: 'GME', name: 'GameStop Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 25.14, currency: '$', precision: 2, change24h: 3.58, volume24h: 6798101, sector: 'S&P MidCap 400 • Specialty Retail' },
  { symbol: 'LSCC', name: 'Lattice Semiconductor Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 107.25, currency: '$', precision: 2, change24h: 1.26, volume24h: 4293797, sector: 'S&P MidCap 400 • Semiconduttori' },
  { symbol: 'MANH', name: 'Manhattan Associates Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 260.41, currency: '$', precision: 2, change24h: 2.07, volume24h: 843662, sector: 'S&P MidCap 400 • Software Logistici' },
  { symbol: 'MEDP', name: 'Medpace Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 656.77, currency: '$', precision: 2, change24h: -1.01, volume24h: 232663, sector: 'S&P MidCap 400 • Ricerca Clinica (CRO)' },
  { symbol: 'WING', name: 'Wingstop Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 167.62, currency: '$', precision: 2, change24h: 3.74, volume24h: 1529094, sector: 'S&P MidCap 400 • Ristorazione / Catene' },

  // =========================================================================
  // 6. CRIPTOVALUTE — GUIDA PDF UFFICIALE OKX & BYBIT (LAYER 0/1, L2, DEFI, STABLE, MEME)
  // =========================================================================
  { symbol: 'BTCUSDT', name: 'Bitcoin (Digital Gold / Store of Value)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 80521.40, currency: '$', precision: 2, change24h: 3.64, volume24h: 101723, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ETHUSDT', name: 'Ethereum (Smart Contracts Leader)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2426.52, currency: '$', precision: 2, change24h: 6.28, volume24h: 1633698, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SOLUSDT', name: 'Solana (High-Performance Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 95.60, currency: '$', precision: 2, change24h: 2.56, volume24h: 8576903, sector: 'Layer 0 & Layer 1' },
  { symbol: 'BNBUSDT', name: 'BNB (BNB Chain Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 720.67, currency: '$', precision: 2, change24h: 2.9, volume24h: 78044, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ADAUSDT', name: 'Cardano (Peer-reviewed Blockchain)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1980, currency: '$', precision: 4, change24h: 3.83, volume24h: 344636298, sector: 'Layer 0 & Layer 1' },
  { symbol: 'DOTUSDT', name: 'Polkadot (Interoperability Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.9572, currency: '$', precision: 4, change24h: 1.78, volume24h: 15082400, sector: 'Layer 0 & Layer 1' },
  { symbol: 'AVAXUSDT', name: 'Avalanche (Subnet Enterprise EVM)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 8.760, currency: '$', precision: 3, change24h: 2.43, volume24h: 4373795, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SUIUSDT', name: 'Sui Network (Move-based Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.9314, currency: '$', precision: 4, change24h: 3.8, volume24h: 106924820, sector: 'Layer 0 & Layer 1' },
  { symbol: 'XRPUSDT', name: 'Ripple (Cross-Border Payments)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.306, currency: '$', precision: 3, change24h: 1.93, volume24h: 346791763, sector: 'Layer 0 & Layer 1' },
  { symbol: 'TONUSDT', name: 'Toncoin (Telegram Native Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 5.10, currency: '$', precision: 2, change24h: 1.25, volume24h: 85000000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol (Chain Abstraction & Sharding)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 4.017, currency: '$', precision: 3, change24h: 3.85, volume24h: 85021855, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ENAUSDT', name: 'Ethena (Synthetic Dollar Protocol)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1815, currency: '$', precision: 4, change24h: 3.18, volume24h: 765922295, sector: 'DeFi & Stable' },
  { symbol: 'HYPEUSDT', name: 'Hyperliquid Perp (High Speed DEX)', cat: 'crypto', exchange: 'Bybit / OKX', basePrice: 83.84, currency: '$', precision: 2, change24h: -1.8, volume24h: 4501819, sector: 'DeFi & Perp' },
  { symbol: 'KORUUSDT', name: 'South Korea Bull 3X Perpetual', cat: 'crypto', exchange: 'Bybit', basePrice: 10.37, currency: '$', precision: 2, change24h: -8.47, volume24h: 12408683, sector: 'Derivati Sintetici' },
  { symbol: 'INTCUSDT', name: 'Intel Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 58.24, currency: '$', precision: 2, change24h: -4.79, volume24h: 868693, sector: 'Derivati Sintetici' },
  { symbol: 'BMNRUSDT', name: 'Bitmine Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 21.96, currency: '$', precision: 2, change24h: 7.05, volume24h: 120730, sector: 'Derivati Sintetici' },
  { symbol: 'ARBUSDT', name: 'Arbitrum One (Optimistic Rollup Ethereum)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1628, currency: '$', precision: 4, change24h: 2.75, volume24h: 150342025, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'OPUSDT', name: 'Optimism (OP Stack Infrastructure)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1105, currency: '$', precision: 4, change24h: 0.98, volume24h: 123591060, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'POLUSDT', name: 'Polygon POL / MATIC (Multi-chain Scaling)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.0960, currency: '$', precision: 4, change24h: 4.22, volume24h: 80547216, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'MNTUSDT', name: 'Mantle (Modular L2 Bybit Ecosystem)', cat: 'crypto', exchange: 'Bybit', basePrice: 0.4802, currency: '$', precision: 4, change24h: 2.02, volume24h: 26471265, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'STRKUSDT', name: 'Starknet (ZK-Rollup Layer 2)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.0427, currency: '$', precision: 4, change24h: 0.42, volume24h: 528305176, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'LINKUSDT', name: 'Chainlink (Decentralized Oracle Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 11.46, currency: '$', precision: 2, change24h: 3.76, volume24h: 5320551, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'AAVEUSDT', name: 'Aave (DeFi Lending Market)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 131.91, currency: '$', precision: 2, change24h: 3.46, volume24h: 307133, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'UNIUSDT', name: 'Uniswap (Decentralized Exchange DEX)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 7.644, currency: '$', precision: 3, change24h: 5.27, volume24h: 10085642, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'MKRUSDT', name: 'MakerDAO / Sky (Stablecoin Governance)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1480.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 85000000, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'LDOUSDT', name: 'Lido DAO (Liquid Staking ETH)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.3415, currency: '$', precision: 4, change24h: 2.52, volume24h: 13860953, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'USDT', name: 'Tether USD (Riserve Fiat Tether Ltd.)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, change24h: 1.25, volume24h: 85000000, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'USDC', name: 'USD Coin (Circle Regolamentato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, change24h: 1.25, volume24h: 85000000, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DAI', name: 'Dai Stablecoin (Collaterale Decentralizzato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, change24h: 1.25, volume24h: 85000000, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin (Pioniere Meme Community)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.0772, currency: '$', precision: 4, change24h: 2.33, volume24h: 1848325027, sector: 'Meme & Token di Comunità' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu (Shibarium L2 Dedicated)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00001850, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'PEPEUSDT', name: 'Pepe (Internet Culture High Beta)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00000980, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'BONKUSDT', name: 'Bonk (Meme Nativo Solana)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00002250, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'WIFUSDT', name: 'dogwifhat (Solana Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1708, currency: '$', precision: 4, change24h: -0.99, volume24h: 50140474, sector: 'Meme & Token di Comunità' },
  { symbol: 'FLOKIUSDT', name: 'Floki (Gaming & Utility Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.000155, currency: '$', precision: 6, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' }
];

// Commodity & Cross Aliases Mapping for Ultra-Accurate Search & Selection
const COMMODITY_ALIASES = {
  // Metalli Preziosi
  'GC': 'GC', 'GOLD': 'GC', 'ORO': 'GC', 'XAUUSD': 'XAUUSD',
  'SI': 'SI', 'SILVER': 'SI', 'ARGENTO': 'SI', 'XAGUSD': 'XAGUSD',
  'PL': 'PL', 'PLATINUM': 'PL', 'PLATINO': 'PL',
  'PA': 'PA', 'PALLADIUM': 'PA', 'PALLADIO': 'PA',

  // Energetici
  'CL': 'CL', 'WTI': 'CL', 'CRUDE': 'CL', 'PETROLIO': 'CL', 'USOIL': 'USOIL',
  'BRN': 'BRN', 'BZ': 'BRN', 'BRENT': 'BRENT',
  'NG': 'NG', 'NATGAS': 'NG', 'NAT_GAS': 'NG', 'GAS': 'NG',
  'RB': 'RB', 'RBOB': 'RB', 'BENZINA': 'RB',
  'HO': 'HO', 'HEATING': 'HO', 'GASOLIO': 'HO',

  // Metalli Industriali
  'HG': 'HG', 'COPPER': 'HG', 'RAME': 'HG',
  'ALI': 'ALI', 'AL': 'ALI', 'ALUMINIUM': 'ALI', 'ALLUMINIO': 'ALI',
  'ZN': 'ZN', 'ZINC': 'ZN', 'ZINCO': 'ZN',
  'NI': 'NI', 'NICKEL': 'NI', 'NICHEL': 'NI',

  // Materie Prime Agricole (Softs & Grains)
  'ZW': 'ZW', 'WHEAT': 'ZW', 'GRANO': 'ZW', 'FRUMENTO': 'ZW',
  'ZC': 'ZC', 'CORN': 'ZC', 'MAIS': 'ZC',
  'ZS': 'ZS', 'SOY': 'ZS', 'SOIA': 'ZS', 'SOYBEANS': 'ZS',
  'KC': 'KC', 'COFFEE': 'KC', 'CAFFE': 'KC', 'CAFFÈ': 'KC',
  'CC': 'CC', 'COCOA': 'CC', 'CACAO': 'CC',
  'SB': 'SB', 'SUGAR': 'SB', 'ZUCCHERO': 'SB',
  'CT': 'CT', 'COTTON': 'CT', 'COTONE': 'CT',

  // Cripto Shortcuts (OKX / Bybit)
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'SOL': 'SOLUSDT', 'BNB': 'BNBUSDT',
  'MNT': 'MNTUSDT', 'ARB': 'ARBUSDT', 'LINK': 'LINKUSDT', 'ADA': 'ADAUSDT',
  'DOT': 'DOTUSDT', 'XRP': 'XRPUSDT', 'SUI': 'SUIUSDT', 'OP': 'OPUSDT',
  'STRK': 'STRKUSDT', 'MATIC': 'POLUSDT', 'POL': 'POLUSDT', 'AAVE': 'AAVEUSDT',
  'UNI': 'UNIUSDT', 'MKR': 'MKRUSDT', 'SKY': 'MKRUSDT', 'DOGE': 'DOGEUSDT',
  'SHIB': 'SHIBUSDT', 'PEPE': 'PEPEUSDT', 'BONK': 'BONKUSDT', 'WIF': 'WIFUSDT',
  'FLOKI': 'FLOKIUSDT', 'NEAR': 'NEARUSDT', 'ENA': 'ENAUSDT', 'HYPE': 'HYPEUSDT',

  // Borsa Italiana Shortcuts & Mid Cap
  'UNICREDIT': 'UCG.MI', 'INTESA': 'ISP.MI', 'FERRARI': 'RACE.MI', 'POSTE': 'PST.MI',
  'ENEL': 'ENEL.MI', 'ENI': 'ENI.MI', 'STELLANTIS': 'STLAM.MI', 'MONCLER': 'MONC.MI',
  'AMPLIFON': 'AMP.MI', 'ANIMA': 'ANIM.MI', 'BONIFICHE': 'BF.MI', 'BFF': 'BFF.MI',
  'BREMBO': 'BRE.MI', 'JUVENTUS': 'JUVE.MI', 'OVS': 'OVS.MI', 'SANLORENZO': 'SFL.MI',
  'REPLY': 'YSY.MI', 'REY.MI': 'YSY.MI', 'TECHNOGYM': 'TNG.MI', 'INWIT': 'INW.MI',

  // USA Equities & Mid Cap Shortcuts
  'CHARTER': 'CHTR', 'DECKERS': 'DECK', 'EURONET': 'EEFT', 'GAMESTOP': 'GME',
  'LATTICE': 'LSCC', 'MANHATTAN': 'MANH', 'MEDPACE': 'MEDP', 'WINGSTOP': 'WING',
  'COLGATE': 'CL.US'
};

// FAVORITES MANAGER
window.FavoritesManager = {
  STORAGE_KEY: 'tpu_favorite_assets_v6',

  getFavorites: function() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return [
      'PST.MI', 'UCG.MI', 'ISP.MI', 'ENEL.MI', 'RACE.MI', 'ANIM.MI', 'SFL.MI', 'YSY.MI',
      'GC', 'SI', 'CL', 'BRN', 'HG', 'ZW', 'KC', 'CC',
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'NEARUSDT', 'ENAUSDT', 'MNTUSDT', 'HYPEUSDT',
      'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GME', 'WING',
      'EURUSD', 'GBPUSD', 'USDJPY'
    ];
  },

  isFavorite: function(symbol) {
    if (!symbol) return false;
    const favs = this.getFavorites();
    const clean = symbol.toUpperCase().trim();
    return favs.includes(clean) || favs.includes(`${clean}.MI`);
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
      favs = favs.filter(s => s !== symbol && s !== `${symbol}.MI`);
      if (window.showToast) window.showToast(`⭐ Rimosso dai Preferiti: ${symbol}`, 'info');
    } else {
      favs.push(symbol);
      if (window.showToast) window.showToast(`⭐ Aggiunto ai Preferiti: ${symbol}!`, 'success');
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favs));
    } catch (e) {}

    if (window.filterMegaCategory) {
      window.filterMegaCategory(window.activeMegaCategory || 'all');
    }
  }
};

window.getAssetBySymbol = function(symbol) {
  if (!symbol) return null;
  let s = symbol.toUpperCase().trim();

  // Alias lookup for commodities & tokens (es. 'ORO' -> 'GC', 'RAME' -> 'HG', 'CACAO' -> 'CC')
  if (COMMODITY_ALIASES[s]) {
    s = COMMODITY_ALIASES[s];
  }

  const cleanBare = s.replace('.MI', '').replace('/', '').replace('-PERP', '').replace('USDT', '');

  // 1. Exact or Clean Match
  const found = window.GlobalMarketAssets.find(a => {
    const aSym = a.symbol.toUpperCase();
    const aBare = aSym.replace('.MI', '').replace('/', '').replace('USDT', '');
    return aSym === s || aSym === `${s}.MI` || aBare === cleanBare || aSym.replace('.MI', '') === s;
  });

  if (found) {
    found.precision = window.getDynamicPrecision(found.basePrice, found.symbol);
    return found;
  }

  // 2. Dynamic heuristic for unlisted tickers
  const isCrypto = s.endsWith('USDT') || s.endsWith('USD') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU'].some(c => s.includes(c));
  const isItalian = s.endsWith('.MI');
  const isForex = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'].some(fx => s.startsWith(fx) && s.length === 6);
  const isCommodity = ['GC', 'SI', 'PL', 'PA', 'CL', 'BRN', 'NG', 'RB', 'HO', 'HG', 'ALI', 'ZN', 'NI', 'ZW', 'ZC', 'ZS', 'KC', 'CC', 'SB', 'CT'].includes(s);

  const basePrice = isCrypto ? (s.includes('ENA') ? 0.1835 : (s.includes('NEAR') ? 4.0200 : 10.00)) : (isItalian ? 14.20 : (isForex ? 1.0850 : (isCommodity ? 100.00 : 150.00)));
  const precision = window.getDynamicPrecision(basePrice, s);

  return {
    symbol: s,
    name: `${s} (${isItalian ? 'Borsa Italiana' : (isCrypto ? 'OKX/Bybit' : (isCommodity ? 'CME / ICE / LME' : (isForex ? 'Forex' : 'US Market')))})`,
    cat: isCrypto ? 'crypto' : (isItalian ? 'eu_stock' : (isForex ? 'forex' : 'us_stock')),
    exchange: isItalian ? 'Borsa Italiana' : (isCrypto ? 'OKX / Bybit' : (isCommodity ? 'CME / ICE / LME' : (isForex ? 'Interbank Forex' : 'NASDAQ / NYSE'))),
    basePrice: basePrice,
    currency: isItalian ? '€' : (s.endsWith('JPY') ? '¥' : (isForex && s.includes('GBP') ? '£' : '$')),
    precision: precision,
    sector: isItalian ? 'Azionario Italia' : (isCrypto ? 'Criptovalute' : (isCommodity ? 'Materie Prime (Commodities)' : (isForex ? 'Mercato Valutario' : 'Azionario USA')))
  };
};
