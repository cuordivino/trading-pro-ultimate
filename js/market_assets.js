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
  { symbol: 'GC', name: 'Oro (Gold Futures)', cat: 'forex', exchange: 'COMEX / London AM Fix', basePrice: 4056.0, currency: '$', precision: 2, change24h: 0.45, volume24h: 285000, sector: 'Metalli Preziosi' },
  { symbol: 'SI', name: 'Argento (Silver Futures)', cat: 'forex', exchange: 'COMEX', basePrice: 51.65, currency: '$', precision: 2, change24h: 1.1, volume24h: 145000, sector: 'Metalli Preziosi' },
  { symbol: 'PL', name: 'Platino (Platinum Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1522.6, currency: '$', precision: 2, change24h: 0.85, volume24h: 38000, sector: 'Metalli Preziosi' },
  { symbol: 'PA', name: 'Palladio (Palladium Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1023.9, currency: '$', precision: 2, change24h: -0.65, volume24h: 24000, sector: 'Metalli Preziosi' },

  // Energetici (NYMEX / ICE)
  { symbol: 'CL', name: 'Petrolio Greggio WTI (Light Sweet Crude)', cat: 'forex', exchange: 'NYMEX', basePrice: 90.9, currency: '$', precision: 2, change24h: 3.18, volume24h: 1669462.6, sector: 'Energetici' },
  { symbol: 'BRN', name: 'Petrolio Greggio Brent (North Sea Crude)', cat: 'forex', exchange: 'ICE', basePrice: 99.2, currency: '$', precision: 2, change24h: -0.75, volume24h: 490000, sector: 'Energetici' },
  { symbol: 'NG', name: 'Gas Naturale (Henry Hub US Benchmark)', cat: 'forex', exchange: 'NYMEX', basePrice: 3.01, currency: '$', precision: 4, change24h: 1.45, volume24h: 340000, sector: 'Energetici' },
  { symbol: 'RB', name: 'Benzina RBOB (Reformulated Gasoline)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.58, currency: '$', precision: 4, change24h: -0.4, volume24h: 110000, sector: 'Energetici' },
  { symbol: 'HO', name: 'Gasolio da Riscaldamento (Heating Oil)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.74, currency: '$', precision: 4, change24h: -0.6, volume24h: 95000, sector: 'Energetici' },

  // Metalli Industriali (LME / CME)
  { symbol: 'HG', name: 'Rame (Copper Grade A)', cat: 'forex', exchange: 'LME / CME', basePrice: 6.21, currency: '$', precision: 4, change24h: 0.35, volume24h: 125000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ALI', name: 'Alluminio Primario (Aluminium)', cat: 'forex', exchange: 'LME / CME', basePrice: 2640.0, currency: '$', precision: 2, change24h: 0.2, volume24h: 85000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ZN', name: 'Zinco Primario (Zinc SHG)', cat: 'forex', exchange: 'LME / CME', basePrice: 3140.0, currency: '$', precision: 2, change24h: 0.4, volume24h: 65000, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'NI', name: 'Nichel (Nickel Class 1)', cat: 'forex', exchange: 'LME / CME', basePrice: 16250.0, currency: '$', precision: 2, change24h: -0.3, volume24h: 45000, sector: 'Metalli Industriali (Base Metals)' },

  // Materie Prime Agricole (CBOT / ICE)
  { symbol: 'ZW', name: 'Grano Tenero (Wheat Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 572.00, currency: '¢', precision: 2, change24h: 0.75, volume24h: 95000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZC', name: 'Mais Giallo (Corn Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 432.00, currency: '¢', precision: 2, change24h: -0.50, volume24h: 185000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZS', name: 'Soia (Soybeans Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 1018.00, currency: '¢', precision: 2, change24h: -0.65, volume24h: 160000, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'KC', name: 'Caffè Arabica (Coffee "C" Contract)', cat: 'forex', exchange: 'ICE', basePrice: 277.4, currency: '¢', precision: 2, change24h: -1.25, volume24h: 68000, sector: 'Soft Commodities' },
  { symbol: 'CC', name: 'Cacao (Cocoa Futures)', cat: 'forex', exchange: 'ICE', basePrice: 8950.00, currency: '$', precision: 2, change24h: 1.37, volume24h: 45000, sector: 'Soft Commodities' },
  { symbol: 'SB', name: 'Zucchero Greggio (Sugar No. 11)', cat: 'forex', exchange: 'ICE', basePrice: 21.85, currency: '¢', precision: 2, change24h: 0.65, volume24h: 115000, sector: 'Soft Commodities' },
  { symbol: 'CT', name: 'Cotone (Cotton No. 2)', cat: 'forex', exchange: 'ICE', basePrice: 0.1212, currency: '¢', precision: 2, change24h: -4.49, volume24h: 48480930.0, sector: 'Soft Commodities' },

  // =========================================================================
  // 2. MERCATO FOREX (GUIDA PDF FOREX: CORE MAJORS, COMMODITIES, CROSSES, EXOTICS)
  // =========================================================================
  { symbol: 'EURUSD', name: 'Euro / Dollaro USA (Fiber)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.11819, currency: '$', precision: 5, change24h: -0.55, volume24h: 130728.2, sector: 'Core Majors' },
  { symbol: 'USDJPY', name: 'Dollaro USA / Yen Giapponese (Gopher)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 157.738, currency: '¥', precision: 3, change24h: -0.07, volume24h: 5765.043, sector: 'Core Majors' },
  { symbol: 'GBPUSD', name: 'Sterlina / Dollaro USA (Cable)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.33888, currency: '$', precision: 5, change24h: -0.61, volume24h: 48674.4, sector: 'Core Majors' },
  { symbol: 'USDCHF', name: 'Dollaro USA / Franco Svizzero (Swissie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.81768, currency: 'CHF', precision: 5, change24h: 0.13, volume24h: 0, sector: 'Core Majors' },
  { symbol: 'USDCAD', name: 'Dollaro USA / Dollaro Canadese (Loonie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.40595, currency: 'C$', precision: 5, change24h: 0.29, volume24h: 0, sector: 'Commodity Majors' },
  { symbol: 'AUDUSD', name: 'Dollaro Australiano / Dollaro USA (Aussie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.68753, currency: '$', precision: 5, change24h: -0.79, volume24h: 0, sector: 'Commodity Majors' },
  { symbol: 'NZDUSD', name: 'Dollaro Neozelandese / Dollaro USA (Kiwi)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.55568, currency: '$', precision: 5, change24h: -0.66, volume24h: 0, sector: 'Commodity Majors' },
  { symbol: 'EURGBP', name: 'Euro / Sterlina Britannica', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.83426, currency: '£', precision: 5, change24h: 0.03, volume24h: 0, sector: 'Crosses / Minors' },
  { symbol: 'EURJPY', name: 'Euro / Yen Giapponese', cat: 'forex', exchange: 'Interbank Forex', basePrice: 176.576, currency: '¥', precision: 3, change24h: -0.18, volume24h: 0, sector: 'Crosses / Minors' },
  { symbol: 'GBPJPY', name: 'Sterlina / Yen Giapponese (Guppy)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 211.652, currency: '¥', precision: 3, change24h: -0.2, volume24h: 0, sector: 'Crosses / Minors' },
  { symbol: 'USDCNY', name: 'Dollaro USA / Renminbi Cinese (Onshore/Offshore)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 6.6695, currency: '¥', precision: 5, change24h: 0.03, volume24h: 0, sector: 'Exotics' },
  { symbol: 'USDHKD', name: 'Dollaro USA / Dollaro Hong Kong (Pegged)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 7.8388, currency: 'HK$', precision: 5, change24h: -0.03, volume24h: 0, sector: 'Exotics' },
  { symbol: 'USDSGD', name: 'Dollaro USA / Dollaro Singapore', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.28078, currency: 'S$', precision: 5, change24h: 0.3, volume24h: 0, sector: 'Exotics' },
  { symbol: 'XAUUSD', name: 'Oro Spot / Dollaro USA (Gold Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 4056.0, currency: '$', precision: 2, change24h: 0.45, volume24h: 285000, sector: 'Metalli Preziosi' },
  { symbol: 'XAGUSD', name: 'Argento Spot / Dollaro USA (Silver Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 51.65, currency: '$', precision: 2, change24h: 1.1, volume24h: 145000, sector: 'Metalli Preziosi' },
  { symbol: 'USOIL', name: 'WTI Crude Oil (Spot Petrolio)', cat: 'forex', exchange: 'Commodities', basePrice: 91.2, currency: '$', precision: 2, change24h: -0.85, volume24h: 580000, sector: 'Energetici' },
  { symbol: 'BRENT', name: 'Brent Crude Oil (Spot Brent)', cat: 'forex', exchange: 'Commodities', basePrice: 99.2, currency: '$', precision: 2, change24h: -0.75, volume24h: 490000, sector: 'Energetici' },
  { symbol: 'NATGAS', name: 'Natural Gas Henry Hub', cat: 'forex', exchange: 'Commodities', basePrice: 3.01, currency: '$', precision: 4, change24h: 1.45, volume24h: 340000, sector: 'Energetici' },

  // =========================================================================
  // 3. BORSA ITALIANA — COMPENDIO COMPLETO A-Z DA PDF UFFICIALE (FTSE MIB, STAR, EURONEXT MILAN, GROWTH)
  // =========================================================================
  { symbol: 'A2A.MI', name: 'A2A S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.433, currency: '€', precision: 4, change24h: 0.91, volume24h: 8223063, sector: 'FTSE MIB • Utility' },
  { symbol: 'ACE.MI', name: 'Acea S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 21.64, currency: '€', precision: 2, change24h: 0.28, volume24h: 68185, sector: 'Euronext Milan • Utility' },
  { symbol: 'ALF.MI', name: 'Altea Green Power', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Growth Milan • Rinnovabili' },
  { symbol: 'AMP.MI', name: 'Amplifon S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 12.08, currency: '€', precision: 3, change24h: 2.76, volume24h: 4641311, sector: 'FTSE MIB • Salute & Benessere' },
  { symbol: 'ARN.MI', name: 'Ariston Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 18.08, currency: '€', precision: 3, change24h: -1.74, volume24h: 17891, sector: 'Euronext Milan • Riscaldamento/Industria' },
  { symbol: 'G.MI', name: 'Assicurazioni Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 44.56, currency: '€', precision: 2, change24h: 1.23, volume24h: 2574498, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'AZM.MI', name: 'Azimut Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 36.1, currency: '€', precision: 2, change24h: 1.4, volume24h: 869997, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'ANIM.MI', name: 'Anima Holding S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.84, currency: '€', precision: 3, change24h: 0.44, volume24h: 425757, sector: 'FTSE Italia Mid Cap • Risparmio Gestito' },
  { symbol: 'BF.MI', name: 'B.F. S.p.A. (Bonifiche Ferraresi)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.25, currency: '€', precision: 4, change24h: 0, volume24h: 0, sector: 'FTSE Italia Mid Cap • Agricoltura / Alimentare' },
  { symbol: 'BFF.MI', name: 'BFF Bank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.914, currency: '€', precision: 4, change24h: -7.71, volume24h: 7715434, sector: 'FTSE Italia Mid Cap • Finanza Specialistica' },
  { symbol: 'BPE.MI', name: 'BPER Banca', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 13.268, currency: '€', precision: 3, change24h: -2.77, volume24h: 9637951, sector: 'FTSE MIB • Banche' },
  { symbol: 'BGEN.MI', name: 'Banca Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 59.1, currency: '€', precision: 2, change24h: 0.65, volume24h: 380000, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMED.MI', name: 'Banca Mediolanum', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 23.32, currency: '€', precision: 2, change24h: 0.17, volume24h: 1008988, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMPS.MI', name: 'Banca Monte dei Paschi di Siena', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 11.312, currency: '€', precision: 3, change24h: -1.5, volume24h: 11538542, sector: 'FTSE MIB • Banche' },
  { symbol: 'BAMI.MI', name: 'Banco BPM', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 13.885, currency: '€', precision: 3, change24h: -0.25, volume24h: 4595526, sector: 'FTSE MIB • Banche' },
  { symbol: 'BRE.MI', name: 'Brembo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.06, currency: '€', precision: 3, change24h: -3.45, volume24h: 1615286, sector: 'Euronext Milan • Componentistica Auto' },
  { symbol: 'BC.MI', name: 'Brunello Cucinelli', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 87.26, currency: '€', precision: 2, change24h: -0.39, volume24h: 276198, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'CE.MI', name: 'Cairo Communication', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 20.18, currency: '€', precision: 2, change24h: -1.37, volume24h: 161896, sector: 'Euronext Milan • Media & Editoria' },
  { symbol: 'CPR.MI', name: 'Campari (Davide Campari-Milano)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.75, currency: '€', precision: 3, change24h: 2.15, volume24h: 7867119, sector: 'FTSE MIB • Alimentari & Bevande' },
  { symbol: 'CELL.MI', name: 'Cellularline', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.72, currency: '€', precision: 4, change24h: 1.49, volume24h: 78923, sector: 'STAR • Accessori Elettronica' },
  { symbol: 'DAL.MI', name: "D'Amico International Shipping", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.95, currency: '€', precision: 2, sector: 'STAR • Trasporti Marittimi' },
  { symbol: 'DIA.MI', name: 'Diasorin S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 80.64, currency: '€', precision: 2, change24h: -1.87, volume24h: 104873, sector: 'FTSE MIB • Salute & Biomedicale' },
  { symbol: 'EAV.MI', name: 'Enav S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.21, currency: '€', precision: 4, change24h: 0, volume24h: 0, sector: 'Euronext Milan • Controllo Traffico Aereo' },
  { symbol: 'ENEL.MI', name: 'Enel S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.861, currency: '€', precision: 3, change24h: 0.92, volume24h: 24500000, sector: 'FTSE MIB — Utilities & Rinnovabili' },
  { symbol: 'ENI.MI', name: 'Eni S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 24.985, currency: '€', precision: 3, change24h: -0.26, volume24h: 7759237, sector: 'FTSE MIB — Petrolifero & Energia' },
  { symbol: 'ERG.MI', name: 'Erg S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 22.08, currency: '€', precision: 2, change24h: -0.36, volume24h: 212070, sector: 'Euronext Milan • Energia Green' },
  { symbol: 'ELUX.MI', name: 'EssilorLuxottica', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 218.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'FTSE MIB • Ottica / Beni di Consumo' },
  { symbol: 'RACE.MI', name: 'Ferrari N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 372.40, currency: '€', precision: 2, change24h: 1.15, volume24h: 420000, sector: 'FTSE MIB — Luxury Automotive' },
  { symbol: 'FB.MI', name: 'Fila S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.60, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'STAR • Beni di Consumo' },
  { symbol: 'FBK.MI', name: 'FinecoBank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 22.73, currency: '€', precision: 2, change24h: 2.43, volume24h: 4155341, sector: 'FTSE MIB • Banche Online' },
  { symbol: 'GAB.MI', name: 'Gabetti Property Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.368, currency: '€', precision: 4, change24h: -3.41, volume24h: 141419, sector: 'Euronext Milan • Immobiliare' },
  { symbol: 'GEO.MI', name: 'Geox S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.2715, currency: '€', precision: 4, change24h: 0.56, volume24h: 139074, sector: 'Euronext Milan • Calzature' },
  { symbol: 'IM.MI', name: 'Immsi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.540, currency: '€', precision: 3, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Holding Industriale' },
  { symbol: 'IP.MI', name: 'Interpump Group', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 38.54, currency: '€', precision: 2, change24h: 0.73, volume24h: 245538, sector: 'FTSE MIB • Industria' },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.353, currency: '€', precision: 3, change24h: 0.52, volume24h: 59146341, sector: 'FTSE MIB — Banche' },
  { symbol: 'INW.MI', name: 'Infrastrutture Wireless (INWIT)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.29, currency: '€', precision: 3, change24h: -0.82, volume24h: 1452336, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'IRE.MI', name: 'Iren S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.438, currency: '€', precision: 4, change24h: -0.41, volume24h: 1583448, sector: 'Euronext Milan • Multi-utility' },
  { symbol: 'IVG.MI', name: 'Iveco Group N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 14.355, currency: '€', precision: 3, change24h: -0.14, volume24h: 540950, sector: 'FTSE MIB • Veicoli Industriali' },
  { symbol: 'JUVE.MI', name: 'Juventus FC', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.59, currency: '€', precision: 4, change24h: -0.63, volume24h: 1032719, sector: 'Euronext Milan • Sport & Entertainment' },
  { symbol: 'LDO.MI', name: 'Leonardo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 49.355, currency: '€', precision: 2, change24h: -3.45, volume24h: 3578229, sector: 'FTSE MIB • Difesa & Aerospazio' },
  { symbol: 'MAU.MI', name: 'Maire Tecnimont', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.65, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Ingegneria' },
  { symbol: 'MS.MI', name: 'Mediaset (MFE A/B)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.658, currency: '€', precision: 4, change24h: 1.23, volume24h: 11000, sector: 'Euronext Milan • Media TV' },
  { symbol: 'MONC.MI', name: 'Moncler S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 45.93, currency: '€', precision: 2, change24h: -2.07, volume24h: 1348046, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'NEXI.MI', name: 'Nexi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.668, currency: '€', precision: 4, change24h: 0.52, volume24h: 11790774, sector: 'FTSE MIB • Servizi Finanziari / Digital' },
  { symbol: 'OVS.MI', name: 'Ovs S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.095, currency: '€', precision: 3, change24h: -0.08, volume24h: 298275, sector: 'Euronext Milan • Abbigliamento Retail' },
  { symbol: 'PIA.MI', name: 'Piaggio & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.044, currency: '€', precision: 4, change24h: -2.11, volume24h: 1464982, sector: 'Euronext Milan • Automotive' },
  { symbol: 'PIRC.MI', name: 'Pirelli & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.7, currency: '€', precision: 3, change24h: -0.89, volume24h: 1882605, sector: 'FTSE MIB • Pneumatici' },
  { symbol: 'PST.MI', name: 'Poste Italiane', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 25.09, currency: '€', precision: 2, change24h: 2.32, volume24h: 2848752, sector: 'FTSE MIB • Servizi Postali & Finanziari' },
  { symbol: 'PRY.MI', name: 'Prysmian S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 100.2, currency: '€', precision: 2, change24h: -4.02, volume24h: 2043389, sector: 'FTSE MIB • Cavi Industriali' },
  { symbol: 'RAI.MI', name: 'Rai Way S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Torri & Trasmissione' },
  { symbol: 'REC.MI', name: 'Recordati S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 53.05, currency: '€', precision: 2, change24h: -0.09, volume24h: 223602, sector: 'FTSE MIB • Farmaceutica' },
  { symbol: 'STM.MI', name: 'STMicroelectronics', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 37.1, currency: '€', precision: 2, change24h: -1.85, volume24h: 4200000, sector: 'FTSE MIB • Semiconduttori' },
  { symbol: 'SFL.MI', name: 'Sanlorenzo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.074, currency: '€', precision: 4, change24h: 1.07, volume24h: 527861, sector: 'FTSE Italia Mid Cap / STAR • Nautica di Lusso' },
  { symbol: 'SAFILO.MI', name: 'Safilo Group S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.150, currency: '€', precision: 3, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Occhialeria' },
  { symbol: 'SPM.MI', name: 'Saipem S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.259, currency: '€', precision: 4, change24h: -1.59, volume24h: 23535364, sector: 'FTSE MIB • Servizi Petroliferi' },
  { symbol: 'SAB.MI', name: 'Saras S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.65, currency: '€', precision: 3, change24h: -0.93, volume24h: 2172, sector: 'Euronext Milan • Raffinazione' },
  { symbol: 'SESA.MI', name: 'Sesa S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 89.15, currency: '€', precision: 2, change24h: 1.15, volume24h: 125000, sector: 'STAR • IT Services & Cloud' },
  { symbol: 'SRG.MI', name: 'Snam S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.276, currency: '€', precision: 3, change24h: 0.38, volume24h: 6370873, sector: 'FTSE MIB • Infrastrutture Gas' },
  { symbol: 'SOL.MI', name: 'Sol S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 63.2, currency: '€', precision: 2, change24h: 0.8, volume24h: 27006, sector: 'Euronext Milan • Gas Industriali' },
  { symbol: 'STLAM.MI', name: 'Stellantis N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 3.9575, currency: '€', precision: 4, change24h: -1.55, volume24h: 29534183, sector: 'FTSE MIB • Automotive' },
  { symbol: 'TEN.MI', name: 'Tenaris S.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 25.8, currency: '€', precision: 2, change24h: 3.66, volume24h: 3314046, sector: 'FTSE MIB • Tubi & Acciaio' },
  { symbol: 'TNG.MI', name: 'Technogym S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.4, currency: '€', precision: 2, change24h: 0.55, volume24h: 450000, sector: 'Euronext Milan • Fitness Equipment' },
  { symbol: 'TIT.MI', name: 'Telecom Italia (TIM)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.738, currency: '€', precision: 3, change24h: 0.67, volume24h: 2292626, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'TRN.MI', name: 'Terna S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.86, currency: '€', precision: 3, change24h: 1.21, volume24h: 4560944, sector: 'FTSE MIB • Reti Elettriche' },
  { symbol: 'TOD.MI', name: "Tod's S.p.A.", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 43.00, currency: '€', precision: 2, sector: 'Euronext Milan • Calzature Lusso' },
  { symbol: 'TXT.MI', name: 'Txt E-Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 47.3, currency: '€', precision: 2, change24h: -3.47, volume24h: 41955, sector: 'STAR • Software & Tech' },
  { symbol: 'UCG.MI', name: 'UniCredit S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 81.62, currency: '€', precision: 2, change24h: 6.28, volume24h: 6830603, sector: 'FTSE MIB — Banche' },
  { symbol: 'UNI.MI', name: 'Unipol Gruppo', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 25.85, currency: '€', precision: 2, change24h: -2.27, volume24h: 1827585, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'VLA.MI', name: 'Valsoia S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.80, currency: '€', precision: 2, change24h: 1.25, volume24h: 5000000, sector: 'Euronext Milan • Alimentare Sano' },
  { symbol: 'ZUC.MI', name: 'Zucchi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.38, currency: '€', precision: 4, change24h: -1.04, volume24h: 4730, sector: 'Euronext Milan • Tessile Casa' },
  { symbol: 'YSY.MI', name: 'Reply S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 138.5, currency: '€', precision: 2, change24h: 0.95, volume24h: 210000, sector: 'FTSE Italia Mid Cap / STAR • IT / Consulenza Tech' },

  // =========================================================================
  // 4. NASDAQ-100 — GUIDA PDF UFFICIALE (GIGANTI TECH, E-COMMERCE, AUTOMOTIVE, BIOTECH)
  // =========================================================================
  { symbol: 'AAPL', name: 'Apple Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 351.19, currency: '$', precision: 2, change24h: 2.58, volume24h: 48900000, sector: 'Tech • Elettronica di Consumo' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 176.60, currency: '$', precision: 2, change24h: -5.38, volume24h: 82400000, sector: 'Tech • Semiconduttori & AI' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 544.16, currency: '$', precision: 2, change24h: 2.55, volume24h: 22100000, sector: 'Tech • Cloud & Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 283.24, currency: '$', precision: 2, change24h: -2.61, volume24h: 141579.4, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 281.74, currency: '$', precision: 2, change24h: -1.94, volume24h: 41149906, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'META', name: 'Meta Platforms Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 605.68, currency: '$', precision: 2, change24h: -4.36, volume24h: 18103.25, sector: 'Tech • Social Media & Rete' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 302.67, currency: '$', precision: 2, change24h: -5.24, volume24h: 13362.51, sector: 'Tech • Semiconduttori' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 507.15, currency: '$', precision: 2, change24h: 12.94, volume24h: 56400000, sector: 'Tech • Microprocessori' },
  { symbol: 'ADBE', name: 'Adobe Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 243.66, currency: '$', precision: 2, change24h: -2.42, volume24h: 1733.31, sector: 'Tech • Software & Grafica' },
  { symbol: 'INTC', name: 'Intel Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 54.23, currency: '$', precision: 2, change24h: -4.79, volume24h: 949233.63, sector: 'Tech • Microchip' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 161.1, currency: '$', precision: 2, change24h: 2.18, volume24h: 29117.34, sector: 'Tech • Wireless & Telecom' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 257.58, currency: '$', precision: 2, change24h: -3.55, volume24h: 26313.84, sector: 'Retail • E-Commerce & Cloud' },
  { symbol: 'NFLX', name: 'Netflix Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 760.50, currency: '$', precision: 2, change24h: 2.80, volume24h: 3800000, sector: 'Media • Streaming & Entertainment' },
  { symbol: 'WMT', name: 'Walmart Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 127.15, currency: '$', precision: 2, change24h: -2.23, volume24h: 1053.17, sector: 'Retail • Grande Distribuzione' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 1060.65, currency: '$', precision: 2, change24h: 0.3, volume24h: 80.1, sector: 'Retail • Wholesale' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 141.65, currency: '$', precision: 2, change24h: -1.39, volume24h: 629.41, sector: 'Staples • Bevande & Alimentari' },
  { symbol: 'MDLZ', name: 'Mondelez International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 66.82, currency: '$', precision: 2, change24h: -0.83, volume24h: 12645929, sector: 'Staples • Snack & Dolciumi' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 106.16, currency: '$', precision: 2, change24h: -3.23, volume24h: 13528262, sector: 'Discretionary • Caffetterie' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', cat: 'us_stock', exchange: 'NYSE', basePrice: 35.4, currency: '$', precision: 2, change24h: -1.15, volume24h: 8400000, sector: 'Discretionary • Ristorazione' },
  { symbol: 'TSLA', name: 'Tesla Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 377.76, currency: '$', precision: 2, change24h: 5.45, volume24h: 68900000, sector: 'Automotive • Veicoli Elettrici' },
  { symbol: 'HON', name: 'Honeywell International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 215.78, currency: '$', precision: 2, change24h: -5.55, volume24h: 3353917, sector: 'Industrials • Ingegneria Aerospaziale' },
  { symbol: 'CSX', name: 'CSX Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 50.83, currency: '$', precision: 2, change24h: -2.34, volume24h: 21161373, sector: 'Industrials • Trasporti Ferroviari' },
  { symbol: 'ODFL', name: 'Old Dominion Freight Line', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 170.56, currency: '$', precision: 2, change24h: -4.92, volume24h: 2705084, sector: 'Industrials • Trasporto Gomma LTL' },
  { symbol: 'FAST', name: 'Fastenal Company', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 52.9, currency: '$', precision: 2, change24h: -0.58, volume24h: 11994047, sector: 'Industrials • Forniture Industriali' },
  { symbol: 'GILD', name: 'Gilead Sciences', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 167.72, currency: '$', precision: 2, change24h: -3.95, volume24h: 555.24, sector: 'Biotech • Farmaci Antivirali' },
  { symbol: 'AMGN', name: 'Amgen Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 457.46, currency: '$', precision: 2, change24h: -4.6, volume24h: 388.55, sector: 'Biotech • Terapie Avanzate' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 542.5, currency: '$', precision: 2, change24h: -1.19, volume24h: 2483183, sector: 'Biotech • Malattie Rare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 897.76, currency: '$', precision: 2, change24h: -4.06, volume24h: 70.61, sector: 'Biotech • Anticorpi & Ricerca' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 464.51, currency: '$', precision: 2, change24h: -3.13, volume24h: 492.37, sector: 'Health Care • Chirurgia Robotica' },

  // =========================================================================
  // 5. S&P 500 — GUIDA PDF UFFICIALE (FINANCIALS, HEALTHCARE, INDUSTRIALS, ENERGY, STAPLES)
  // =========================================================================
  { symbol: 'ACN', name: 'Accenture plc', cat: 'us_stock', exchange: 'NYSE', basePrice: 263.28, currency: '$', precision: 2, change24h: -0.8, volume24h: 207.88, sector: 'InfoTech • IT Consulting' },
  { symbol: 'CRM', name: 'Salesforce Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 218.68, currency: '$', precision: 2, change24h: -4.11, volume24h: 1128.69, sector: 'InfoTech • Cloud Software' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 96.98, currency: '$', precision: 2, change24h: -3.97, volume24h: 2137.84, sector: 'InfoTech • Communications' },
  { symbol: 'IBM', name: 'International Business Machines', cat: 'us_stock', exchange: 'NYSE', basePrice: 244.25, currency: '$', precision: 2, change24h: -4.35, volume24h: 1694.89, sector: 'InfoTech • Enterprise IT' },
  { symbol: 'ORCL', name: 'Oracle Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 118.01, currency: '$', precision: 2, change24h: -4.57, volume24h: 28320.48, sector: 'InfoTech • Systems Software' },
  { symbol: 'DIS', name: 'The Walt Disney Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 117.22, currency: '$', precision: 2, change24h: 0.45, volume24h: 11200000, sector: 'Media • Entertainment' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 24.95, currency: '$', precision: 2, change24h: 0.4, volume24h: 35872257, sector: 'Media • Cable & Satellite' },
  { symbol: 'T', name: 'AT&T Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 22.50, currency: '$', precision: 2, change24h: 0.35, volume24h: 28000000, sector: 'Telecom • Alternative Carriers' },
  { symbol: 'VZ', name: 'Verizon Communications', cat: 'us_stock', exchange: 'NYSE', basePrice: 46.12, currency: '$', precision: 2, change24h: 0.35, volume24h: 18500000, sector: 'Telecom • Integrated Services' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 144.50, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Media • Interactive Home Entertainment' },
  { symbol: 'HD', name: 'The Home Depot Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 345.68, currency: '$', precision: 2, change24h: -3.41, volume24h: 527.13, sector: 'Discretionary • Home Improvement' },
  { symbol: 'NKE', name: 'NIKE Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 38.95, currency: '$', precision: 2, change24h: -4.28, volume24h: 5471.87, sector: 'Discretionary • Footwear' },
  { symbol: 'MCD', name: "McDonald's Corporation", cat: 'us_stock', exchange: 'NYSE', basePrice: 275.28, currency: '$', precision: 2, sector: 'Discretionary • Restaurants' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 167.62, currency: '$', precision: 2, change24h: -1.28, volume24h: 198.76, sector: 'Discretionary • Hotels & Travel' },
  { symbol: 'TJX', name: 'The TJX Companies Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 144.76, currency: '$', precision: 2, change24h: 5.18, volume24h: 6902186, sector: 'Discretionary • Apparel Retail' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway (Class B)', cat: 'us_stock', exchange: 'NYSE', basePrice: 579.09, currency: '$', precision: 2, change24h: 3.95, volume24h: 6787597, sector: 'Financials • Multi-Sector Holdings' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', cat: 'us_stock', exchange: 'NYSE', basePrice: 342.68, currency: '$', precision: 2, change24h: 2.45, volume24h: 11200000, sector: 'Financials • Diversified Banks' },
  { symbol: 'BAC', name: 'Bank of America Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 49.77, currency: '$', precision: 2, change24h: -4.53, volume24h: 2356.88, sector: 'Financials • Diversified Banks' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 87.43, currency: '$', precision: 2, change24h: 2.22, volume24h: 19977526, sector: 'Financials • Diversified Banks' },
  { symbol: 'MS', name: 'Morgan Stanley', cat: 'us_stock', exchange: 'NYSE', basePrice: 193.97, currency: '$', precision: 2, change24h: 4.23, volume24h: 7867600, sector: 'Financials • Investment Banking' },
  { symbol: 'GS', name: 'The Goldman Sachs Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 861.65, currency: '$', precision: 2, change24h: -8.08, volume24h: 324.983, sector: 'Financials • Investment Banking' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 481.69, currency: '$', precision: 2, change24h: 3.36, volume24h: 2614635, sector: 'Financials • Publishing & Analytics' },
  { symbol: 'AXP', name: 'American Express Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 320.35, currency: '$', precision: 2, change24h: -4.23, volume24h: 62.35, sector: 'Financials • Consumer Finance' },
  { symbol: 'BLK', name: 'BlackRock Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 1224.37, currency: '$', precision: 2, change24h: 5.43, volume24h: 1093028, sector: 'Financials • Asset Management' },
  { symbol: 'C', name: 'Citigroup Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 68.50, currency: '$', precision: 2, change24h: 1.15, volume24h: 14500000, sector: 'Financials • Diversified Banks' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 1352.28, currency: '$', precision: 2, change24h: -6.06, volume24h: 559.31, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'UNH', name: 'UnitedHealth Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 390.93, currency: '$', precision: 2, change24h: -6.04, volume24h: 363.81, sector: 'Health Care • Managed Health Care' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', cat: 'us_stock', exchange: 'NYSE', basePrice: 269.65, currency: '$', precision: 2, change24h: -3.52, volume24h: 228.73, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 145.75, currency: '$', precision: 2, change24h: -4.44, volume24h: 904.0, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 288.72, currency: '$', precision: 2, change24h: -3.33, volume24h: 97.36, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', cat: 'us_stock', exchange: 'NYSE', basePrice: 706.16, currency: '$', precision: 2, change24h: 1.12, volume24h: 2460749, sector: 'Health Care • Life Sciences Tools' },
  { symbol: 'PFE', name: 'Pfizer Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 29.13, currency: '$', precision: 2, change24h: -5.76, volume24h: 34040.13, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 553.64, currency: '$', precision: 2, change24h: 1.85, volume24h: 3200000, sector: 'Industrials • Construction Machinery' },
  { symbol: 'GE', name: 'GE Aerospace', cat: 'us_stock', exchange: 'NYSE', basePrice: 313.08, currency: '$', precision: 2, change24h: -4.96, volume24h: 646.38, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 572.04, currency: '$', precision: 2, change24h: -3.78, volume24h: 28.106, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 308.53, currency: '$', precision: 2, change24h: 1.68, volume24h: 2876581, sector: 'Industrials • Rail Transportation' },
  { symbol: 'UPS', name: 'United Parcel Service', cat: 'us_stock', exchange: 'NYSE', basePrice: 114.31, currency: '$', precision: 2, change24h: 4.71, volume24h: 7876947, sector: 'Industrials • Air Freight & Logistics' },
  { symbol: 'BA', name: 'The Boeing Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 171.45, currency: '$', precision: 2, change24h: -3.3, volume24h: 133.68, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'MMM', name: '3M Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 193.95, currency: '$', precision: 2, change24h: 9.55, volume24h: 9053076, sector: 'Industrials • Industrial Conglomerates' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 165.49, currency: '$', precision: 2, change24h: -1.6, volume24h: 514.22, sector: 'Staples • Household Products' },
  { symbol: 'KO', name: 'The Coca-Cola Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 94.9, currency: '$', precision: 2, change24h: -1.73, volume24h: 1613.87, sector: 'Staples • Soft Drinks' },
  { symbol: 'PM', name: 'Philip Morris International', cat: 'us_stock', exchange: 'NYSE', basePrice: 211.28, currency: '$', precision: 2, change24h: 1.56, volume24h: 4471403, sector: 'Staples • Tobacco' },
  { symbol: 'CL.US', name: 'Colgate-Palmolive Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 98.50, currency: '$', precision: 2, change24h: 1.25, volume24h: 24500000, sector: 'Staples • Household Products' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 165.15, currency: '$', precision: 2, change24h: -3.27, volume24h: 22018.04, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'CVX', name: 'Chevron Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 158.40, currency: '$', precision: 2, change24h: 0.45, volume24h: 9200000, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'COP', name: 'ConocoPhillips', cat: 'us_stock', exchange: 'NYSE', basePrice: 136.94, currency: '$', precision: 2, change24h: -5.17, volume24h: 11372029, sector: 'Energy • Oil & Gas Exploration' },
  { symbol: 'SLB', name: 'SLB (Schlumberger)', cat: 'us_stock', exchange: 'NYSE', basePrice: 51.56, currency: '$', precision: 2, change24h: -1.09, volume24h: 19991309, sector: 'Energy • Equipment & Services' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 88.45, currency: '$', precision: 2, change24h: 4.89, volume24h: 27510893, sector: 'Utilities • Electric Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 129.59, currency: '$', precision: 2, change24h: 2.43, volume24h: 6957133, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SO', name: 'The Southern Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 93.12, currency: '$', precision: 2, change24h: -0.67, volume24h: 18715360, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cat: 'etf', exchange: 'NYSE Arca', basePrice: 752.84, currency: '$', precision: 2, change24h: 2.39, volume24h: 54200000, sector: 'ETF • S&P 500 Benchmark' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ 100)', cat: 'etf', exchange: 'NASDAQ', basePrice: 677.68, currency: '$', precision: 2, change24h: 3.29, volume24h: 64500000, sector: 'ETF • Tech Benchmark' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', cat: 'etf', exchange: 'NYSE Arca', basePrice: 271.03, currency: '$', precision: 2, change24h: -4.87, volume24h: 1553.9, sector: 'ETF • Small Cap' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', cat: 'etf', exchange: 'NYSE Arca', basePrice: 490.50, currency: '$', precision: 2, change24h: 0.85, volume24h: 4500000, sector: 'ETF — Blue Chips' },

  // S&P MidCap 400 & NASDAQ (Compendio Multimercato Globale)
  { symbol: 'CHTR', name: 'Charter Communications Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 125.86, currency: '$', precision: 2, change24h: 4.67, volume24h: 4494649, sector: 'NASDAQ-100 • Telecomunicazioni' },
  { symbol: 'DECK', name: 'Deckers Outdoor Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 89.11, currency: '$', precision: 2, change24h: 5.97, volume24h: 3609265, sector: 'S&P MidCap 400 • Abbigliamento & Calzature' },
  { symbol: 'EEFT', name: 'Euronet Worldwide Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 71.15, currency: '$', precision: 2, change24h: 0.71, volume24h: 882369, sector: 'S&P MidCap 400 • Elaborazione Pagamenti' },
  { symbol: 'GME', name: 'GameStop Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 25.14, currency: '$', precision: 2, change24h: 3.58, volume24h: 6798101, sector: 'S&P MidCap 400 • Specialty Retail' },
  { symbol: 'LSCC', name: 'Lattice Semiconductor Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 98.03, currency: '$', precision: 2, change24h: -8.6, volume24h: 2875819, sector: 'S&P MidCap 400 • Semiconduttori' },
  { symbol: 'MANH', name: 'Manhattan Associates Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 255.17, currency: '$', precision: 2, change24h: -2.01, volume24h: 1081819, sector: 'S&P MidCap 400 • Software Logistici' },
  { symbol: 'MEDP', name: 'Medpace Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 634.98, currency: '$', precision: 2, change24h: -3.32, volume24h: 315868, sector: 'S&P MidCap 400 • Ricerca Clinica (CRO)' },
  { symbol: 'WING', name: 'Wingstop Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 165.73, currency: '$', precision: 2, change24h: -1.13, volume24h: 1332482, sector: 'S&P MidCap 400 • Ristorazione / Catene' },

  // =========================================================================
  // 6. CRIPTOVALUTE — GUIDA PDF UFFICIALE OKX & BYBIT (LAYER 0/1, L2, DEFI, STABLE, MEME)
  // =========================================================================
  { symbol: 'BTCUSDT', name: 'Bitcoin (Digital Gold / Store of Value)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 75591.0, currency: '$', precision: 2, change24h: -5.98, volume24h: 116895.204, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ETHUSDT', name: 'Ethereum (Smart Contracts Leader)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2785.00, currency: '$', precision: 2, change24h: 1.95, volume24h: 185000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SOLUSDT', name: 'Solana (High-Performance Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 198.50, currency: '$', precision: 2, change24h: 4.10, volume24h: 1420000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'BNBUSDT', name: 'BNB (BNB Chain Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 689.4, currency: '$', precision: 2, change24h: -3.19, volume24h: 70507.61, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ADAUSDT', name: 'Cardano (Peer-reviewed Blockchain)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1833, currency: '$', precision: 4, change24h: -6.91, volume24h: 388030384.0, sector: 'Layer 0 & Layer 1' },
  { symbol: 'DOTUSDT', name: 'Polkadot (Interoperability Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.9226, currency: '$', precision: 4, change24h: -2.15, volume24h: 17548948.1, sector: 'Layer 0 & Layer 1' },
  { symbol: 'AVAXUSDT', name: 'Avalanche (Subnet Enterprise EVM)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 28.50, currency: '$', precision: 3, change24h: 2.40, volume24h: 4200000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SUIUSDT', name: 'Sui Network (Move-based Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2.2850, currency: '$', precision: 4, change24h: 5.40, volume24h: 48000000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'XRPUSDT', name: 'Ripple (Cross-Border Payments)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.5550, currency: '$', precision: 3, change24h: 1.20, volume24h: 85000000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'TONUSDT', name: 'Toncoin (Telegram Native Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 5.10, currency: '$', precision: 2, change24h: 1.25, volume24h: 85000000, sector: 'Layer 0 & Layer 1' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol (Chain Abstraction & Sharding)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 3.699, currency: '$', precision: 3, change24h: -7.73, volume24h: 58073661.1, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ENAUSDT', name: 'Ethena (Synthetic Dollar Protocol)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.16416, currency: '$', precision: 4, change24h: -8.46, volume24h: 658634616.0, sector: 'DeFi & Stable' },
  { symbol: 'HYPEUSDT', name: 'Hyperliquid Perp (High Speed DEX)', cat: 'crypto', exchange: 'Bybit / OKX', basePrice: 77.514, currency: '$', precision: 2, change24h: -6.92, volume24h: 4462738.06, sector: 'DeFi & Perp' },
  { symbol: 'KORUUSDT', name: 'South Korea Bull 3X Perpetual', cat: 'crypto', exchange: 'Bybit', basePrice: 6.94, currency: '$', precision: 2, change24h: -26.25, volume24h: 34206869.69, sector: 'Derivati Sintetici' },
  { symbol: 'INTCUSDT', name: 'Intel Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 54.23, currency: '$', precision: 2, change24h: -4.79, volume24h: 949233.63, sector: 'Derivati Sintetici' },
  { symbol: 'BMNRUSDT', name: 'Bitmine Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 18.82, currency: '$', precision: 2, change24h: -13.68, volume24h: 108624.6, sector: 'Derivati Sintetici' },
  { symbol: 'ARBUSDT', name: 'Arbitrum One (Optimistic Rollup Ethereum)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.16687, currency: '$', precision: 4, change24h: 2.47, volume24h: 185260870.0, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'OPUSDT', name: 'Optimism (OP Stack Infrastructure)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.10406, currency: '$', precision: 4, change24h: -6.16, volume24h: 116881092.3, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'POLUSDT', name: 'Polygon POL / MATIC (Multi-chain Scaling)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.0933, currency: '$', precision: 4, change24h: -3.67, volume24h: 78213243.0, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'MNTUSDT', name: 'Mantle (Modular L2 Bybit Ecosystem)', cat: 'crypto', exchange: 'Bybit', basePrice: 0.4404, currency: '$', precision: 4, change24h: -7.15, volume24h: 23312292.3, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'STRKUSDT', name: 'Starknet (ZK-Rollup Layer 2)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.04035, currency: '$', precision: 4, change24h: -7.52, volume24h: 496052244.1, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'LINKUSDT', name: 'Chainlink (Decentralized Oracle Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 13.80, currency: '$', precision: 2, change24h: 1.80, volume24h: 3800000, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'AAVEUSDT', name: 'Aave (DeFi Lending Market)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 130.17, currency: '$', precision: 2, change24h: -1.52, volume24h: 415962.37, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'UNIUSDT', name: 'Uniswap (Decentralized Exchange DEX)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 7.059, currency: '$', precision: 3, change24h: -6.79, volume24h: 9721538.5, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'MKRUSDT', name: 'MakerDAO / Sky (Stablecoin Governance)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1480.00, currency: '$', precision: 2, change24h: 1.25, volume24h: 85000000, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'LDOUSDT', name: 'Lido DAO (Liquid Staking ETH)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.3315, currency: '$', precision: 4, change24h: -3.94, volume24h: 18907544.9, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'USDT', name: 'Tether USD (Riserve Fiat Tether Ltd.)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, change24h: 1.25, volume24h: 85000000, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'USDC', name: 'USD Coin (Circle Regolamentato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0005, currency: '$', precision: 4, change24h: 0.03, volume24h: 957456.6, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DAI', name: 'Dai Stablecoin (Collaterale Decentralizzato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, change24h: 1.25, volume24h: 85000000, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin (Pioniere Meme Community)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1950, currency: '$', precision: 4, change24h: 3.50, volume24h: 245000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu (Shibarium L2 Dedicated)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00001850, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'PEPEUSDT', name: 'Pepe (Internet Culture High Beta)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00000980, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'BONKUSDT', name: 'Bonk (Meme Nativo Solana)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00002250, currency: '$', precision: 8, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },
  { symbol: 'WIFUSDT', name: 'dogwifhat (Solana Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1652, currency: '$', precision: 4, change24h: -3.79, volume24h: 53882980.0, sector: 'Meme & Token di Comunità' },
  { symbol: 'FLOKIUSDT', name: 'Floki (Gaming & Utility Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.000155, currency: '$', precision: 6, change24h: 1.25, volume24h: 85000000, sector: 'Meme & Token di Comunità' },

  // =========================================================================
  // 4. BORSA FRANCESE — CAC 40 (EURONEXT PARIS)
  // =========================================================================
  { symbol: 'MC.PA', name: 'LVMH Moët Hennessy Louis Vuitton', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 402.45, currency: '€', precision: 2, change24h: 2.15, volume24h: 480000, sector: 'CAC 40 — Luxury Goods' },
  { symbol: 'OR.PA', name: "L'Oréal S.A.", cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 446.80, currency: '€', precision: 2, change24h: 0.85, volume24h: 320000, sector: 'CAC 40 — Consumer & Beauty' },
  { symbol: 'TTE.PA', name: 'TotalEnergies SE', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 78.75, currency: '€', precision: 2, change24h: -0.45, volume24h: 2850000, sector: 'CAC 40 — Energy & Oil' },
  { symbol: 'AIR.PA', name: 'Airbus SE', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 162.40, currency: '€', precision: 2, change24h: 1.40, volume24h: 1250000, sector: 'CAC 40 — Aerospace & Defense' },
  { symbol: 'RMS.PA', name: 'Hermès International', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 2145.00, currency: '€', precision: 2, change24h: 1.80, volume24h: 110000, sector: 'CAC 40 — Luxury Ultra' },
  { symbol: 'SAN.PA', name: 'Sanofi S.A.', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 98.60, currency: '€', precision: 2, change24h: 0.35, volume24h: 1650000, sector: 'CAC 40 — Healthcare & Pharma' },
  { symbol: 'BNP.PA', name: 'BNP Paribas S.A.', cat: 'fr_stock', exchange: 'Euronext Paris', basePrice: 72.80, currency: '€', precision: 2, change24h: 1.10, volume24h: 3100000, sector: 'CAC 40 — Banking & Financial' },

  // =========================================================================
  // 5. BORSA TEDESCA — DAX 40 (XETRA FRANKFURT)
  // =========================================================================
  { symbol: 'SAP.DE', name: 'SAP SE', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 211.65, currency: '€', precision: 2, change24h: 1.85, volume24h: 1950000, sector: 'DAX 40 — Enterprise Cloud Software' },
  { symbol: 'SIE.DE', name: 'Siemens AG', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 271.00, currency: '€', precision: 2, change24h: 2.10, volume24h: 1450000, sector: 'DAX 40 — Industrial Tech' },
  { symbol: 'ALV.DE', name: 'Allianz SE', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 457.00, currency: '€', precision: 2, change24h: 0.95, volume24h: 850000, sector: 'DAX 40 — Insurance & Asset Mgmt' },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom AG', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 31.85, currency: '€', precision: 2, change24h: 0.45, volume24h: 4200000, sector: 'DAX 40 — Telecoms' },
  { symbol: 'MBG.DE', name: 'Mercedes-Benz Group AG', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 58.40, currency: '€', precision: 2, change24h: 1.25, volume24h: 2100000, sector: 'DAX 40 — Automotive' },
  { symbol: 'BMW.DE', name: 'Bayerische Motoren Werke AG (BMW)', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 79.20, currency: '€', precision: 2, change24h: 1.10, volume24h: 1650000, sector: 'DAX 40 — Automotive' },
  { symbol: 'BAYN.DE', name: 'Bayer AG', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 22.40, currency: '€', precision: 2, change24h: -1.20, volume24h: 3800000, sector: 'DAX 40 — Pharma & CropScience' },
  { symbol: 'BAS.DE', name: 'BASF SE', cat: 'de_stock', exchange: 'XETRA Frankfurt', basePrice: 44.80, currency: '€', precision: 2, change24h: 0.70, volume24h: 2200000, sector: 'DAX 40 — Chemicals' },

  // =========================================================================
  // 6. BORSA INGLESE — FTSE 100 (LONDON STOCK EXCHANGE)
  // =========================================================================
  { symbol: 'SHEL.L', name: 'Shell plc', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 3701.00, currency: 'p', precision: 2, change24h: -0.58, volume24h: 8400000, sector: 'FTSE 100 — Energy' },
  { symbol: 'AZN.L', name: 'AstraZeneca PLC', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 14066.00, currency: 'p', precision: 2, change24h: 0.98, volume24h: 1850000, sector: 'FTSE 100 — Pharmaceuticals' },
  { symbol: 'HSBA.L', name: 'HSBC Holdings plc', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 1337.20, currency: 'p', precision: 2, change24h: 2.50, volume24h: 16200000, sector: 'FTSE 100 — Banking' },
  { symbol: 'ULVR.L', name: 'Unilever PLC', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 4780.00, currency: 'p', precision: 2, change24h: 0.40, volume24h: 2400000, sector: 'FTSE 100 — Consumer Goods' },
  { symbol: 'BP.L', name: 'BP p.l.c.', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 395.00, currency: 'p', precision: 2, change24h: -0.90, volume24h: 24000000, sector: 'FTSE 100 — Energy' },
  { symbol: 'RIO.L', name: 'Rio Tinto Group', cat: 'uk_stock', exchange: 'London Stock Exchange', basePrice: 4980.00, currency: 'p', precision: 2, change24h: -0.30, volume24h: 1950000, sector: 'FTSE 100 — Mining' },

  // =========================================================================
  // 7. ASIA / BORSA ORIENTALE (TOKYO, KOREA, HONG KONG, TAIWAN)
  // =========================================================================
  { symbol: '7203.T', name: 'Toyota Motor Corporation', cat: 'asia_stock', exchange: 'Tokyo Stock Exchange', basePrice: 3491.00, currency: '¥', precision: 2, change24h: 4.58, volume24h: 28500000, sector: 'Asia — Automotive' },
  { symbol: '6758.T', name: 'Sony Group Corporation', cat: 'asia_stock', exchange: 'Tokyo Stock Exchange', basePrice: 2850.00, currency: '¥', precision: 2, change24h: 1.85, volume24h: 12400000, sector: 'Asia — Tech & Entertainment' },
  { symbol: '9984.T', name: 'SoftBank Group Corp.', cat: 'asia_stock', exchange: 'Tokyo Stock Exchange', basePrice: 9420.00, currency: '¥', precision: 2, change24h: 3.20, volume24h: 8400000, sector: 'Asia — Tech Investment' },
  { symbol: '005930.KS', name: 'Samsung Electronics Co., Ltd.', cat: 'asia_stock', exchange: 'Korea Exchange', basePrice: 58500.00, currency: '₩', precision: 2, change24h: 1.20, volume24h: 16800000, sector: 'Asia — Semis & Mobile' },
  { symbol: '0700.HK', name: 'Tencent Holdings Limited', cat: 'asia_stock', exchange: 'Hong Kong Stock Exchange', basePrice: 418.40, currency: 'HK$', precision: 2, change24h: -0.33, volume24h: 22400000, sector: 'Asia — Internet & AI' },
  { symbol: '9988.HK', name: 'Alibaba Group Holding Limited', cat: 'asia_stock', exchange: 'Hong Kong Stock Exchange', basePrice: 96.50, currency: 'HK$', precision: 2, change24h: 1.45, volume24h: 48500000, sector: 'Asia — E-commerce & Cloud' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing (TSMC)', cat: 'asia_stock', exchange: 'NYSE / Taiwan', basePrice: 195.50, currency: '$', precision: 2, change24h: 2.85, volume24h: 18400000, sector: 'Asia — Semiconductor Foundry' }
];

// Commodity & Cross Aliases Mapping for Ultra-Accurate Search & Selection
const COMMODITY_ALIASES = {
  // Futures & Yahoo Ticker Mapping (=F, =X, spot)
  'GC=F': 'GC', 'SI=F': 'SI', 'CL=F': 'CL', 'BZ=F': 'BRN', 'BRN=F': 'BRN', 'NG=F': 'NG', 'HG=F': 'HG',
  'ZW=F': 'ZW', 'ZC=F': 'ZC', 'ZS=F': 'ZS', 'KC=F': 'KC', 'CC=F': 'CC', 'SB=F': 'SB', 'CT=F': 'CT',
  'EURUSD=X': 'EURUSD', 'GBPUSD=X': 'GBPUSD', 'USDJPY=X': 'USDJPY', 'USDCHF=X': 'USDCHF',
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

  // 1. Strip query suffixes (=F, =X, -PERP, .MI) for alias matching
  const bare = s.replace('=F', '').replace('=X', '').replace('-PERP', '').replace('USDT', '').replace('.MI', '').replace('/', '');

  if (COMMODITY_ALIASES[s]) {
    s = COMMODITY_ALIASES[s];
  } else if (COMMODITY_ALIASES[bare]) {
    s = COMMODITY_ALIASES[bare];
  }

  const cleanBare = s.replace('.MI', '').replace('/', '').replace('-PERP', '').replace('USDT', '').replace('=F', '').replace('=X', '');

  // 1. Strict Exact Match First (Prevents US tickers like DIA from colliding with DIA.MI)
  let found = window.GlobalMarketAssets.find(a => a.symbol.toUpperCase() === s);
  if (!found) {
    found = window.GlobalMarketAssets.find(a => {
      const aSym = a.symbol.toUpperCase();
      const aBare = aSym.replace('.MI', '').replace('/', '').replace('USDT', '').replace('=F', '').replace('=X', '');
      return aBare === cleanBare || aBare === bare || aSym === bare || aSym === `${cleanBare}.MI`;
    });
  }

  if (found) {
    found.precision = window.getDynamicPrecision(found.basePrice, found.symbol);
    return found;
  }

  // 2. Dynamic heuristic for unlisted tickers
  const isCrypto = s.endsWith('USDT') || s.endsWith('USD') || ['BTC', 'ETH', 'SOL', 'NEAR', 'ENA', 'HYPE', 'KORU'].some(c => s.includes(c));
  const isItalian = s.endsWith('.MI');
  const isForex = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'].some(fx => s.startsWith(fx) && s.length === 6);
  const isCommodity = ['GC', 'SI', 'PL', 'PA', 'CL', 'BRN', 'NG', 'RB', 'HO', 'HG', 'ALI', 'ZN', 'NI', 'ZW', 'ZC', 'ZS', 'KC', 'CC', 'SB', 'CT'].includes(cleanBare) || ['GC', 'SI', 'PL', 'PA', 'CL', 'BRN', 'NG', 'RB', 'HO', 'HG', 'ALI', 'ZN', 'NI', 'ZW', 'ZC', 'ZS', 'KC', 'CC', 'SB', 'CT'].includes(bare);

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
