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
  { symbol: 'GC', name: 'Oro (Gold Futures)', cat: 'forex', exchange: 'COMEX / London AM Fix', basePrice: 2746.50, currency: '$', precision: 2, sector: 'Metalli Preziosi' },
  { symbol: 'SI', name: 'Argento (Silver Futures)', cat: 'forex', exchange: 'COMEX', basePrice: 32.84, currency: '$', precision: 2, sector: 'Metalli Preziosi' },
  { symbol: 'PL', name: 'Platino (Platinum Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1012.40, currency: '$', precision: 2, sector: 'Metalli Preziosi' },
  { symbol: 'PA', name: 'Palladio (Palladium Futures)', cat: 'forex', exchange: 'NYMEX', basePrice: 1115.60, currency: '$', precision: 2, sector: 'Metalli Preziosi' },

  // Energetici (NYMEX / ICE)
  { symbol: 'CL', name: 'Petrolio Greggio WTI (Light Sweet Crude)', cat: 'forex', exchange: 'NYMEX', basePrice: 71.85, currency: '$', precision: 2, sector: 'Energetici' },
  { symbol: 'BRN', name: 'Petrolio Greggio Brent (North Sea Crude)', cat: 'forex', exchange: 'ICE', basePrice: 75.42, currency: '$', precision: 2, sector: 'Energetici' },
  { symbol: 'NG', name: 'Gas Naturale (Henry Hub US Benchmark)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.7480, currency: '$', precision: 4, sector: 'Energetici' },
  { symbol: 'RB', name: 'Benzina RBOB (Reformulated Gasoline)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.1240, currency: '$', precision: 4, sector: 'Energetici' },
  { symbol: 'HO', name: 'Gasolio da Riscaldamento (Heating Oil)', cat: 'forex', exchange: 'NYMEX', basePrice: 2.2850, currency: '$', precision: 4, sector: 'Energetici' },

  // Metalli Industriali (LME / CME)
  { symbol: 'HG', name: 'Rame (Copper Grade A)', cat: 'forex', exchange: 'LME / CME', basePrice: 4.4250, currency: '$', precision: 4, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ALI', name: 'Alluminio Primario (Aluminium)', cat: 'forex', exchange: 'LME / CME', basePrice: 2620.00, currency: '$', precision: 2, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'ZN', name: 'Zinco Primario (Zinc SHG)', cat: 'forex', exchange: 'LME / CME', basePrice: 3120.00, currency: '$', precision: 2, sector: 'Metalli Industriali (Base Metals)' },
  { symbol: 'NI', name: 'Nichel (Nickel Class 1)', cat: 'forex', exchange: 'LME / CME', basePrice: 16180.00, currency: '$', precision: 2, sector: 'Metalli Industriali (Base Metals)' },

  // Materie Prime Agricole (CBOT / ICE)
  { symbol: 'ZW', name: 'Grano Tenero (Wheat Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 572.50, currency: '¢', precision: 2, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZC', name: 'Mais Giallo (Corn Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 418.25, currency: '¢', precision: 2, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'ZS', name: 'Soia (Soybeans Futures)', cat: 'forex', exchange: 'CBOT / ICE', basePrice: 998.50, currency: '¢', precision: 2, sector: 'Materie Prime Agricole (Grains)' },
  { symbol: 'KC', name: 'Caffè Arabica (Coffee "C" Contract)', cat: 'forex', exchange: 'ICE', basePrice: 248.60, currency: '¢', precision: 2, sector: 'Soft Commodities' },
  { symbol: 'CC', name: 'Cacao (Cocoa Futures)', cat: 'forex', exchange: 'ICE', basePrice: 7280.00, currency: '$', precision: 2, sector: 'Soft Commodities' },
  { symbol: 'SB', name: 'Zucchero Greggio (Sugar No. 11)', cat: 'forex', exchange: 'ICE', basePrice: 22.15, currency: '¢', precision: 2, sector: 'Soft Commodities' },
  { symbol: 'CT', name: 'Cotone (Cotton No. 2)', cat: 'forex', exchange: 'ICE', basePrice: 72.80, currency: '¢', precision: 2, sector: 'Soft Commodities' },

  // =========================================================================
  // 2. MERCATO FOREX (GUIDA PDF FOREX: CORE MAJORS, COMMODITIES, CROSSES, EXOTICS)
  // =========================================================================
  { symbol: 'EURUSD', name: 'Euro / Dollaro USA (Fiber)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.0850, currency: '$', precision: 4, sector: 'Core Majors' },
  { symbol: 'USDJPY', name: 'Dollaro USA / Yen Giapponese (Gopher)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 152.42, currency: '¥', precision: 3, sector: 'Core Majors' },
  { symbol: 'GBPUSD', name: 'Sterlina / Dollaro USA (Cable)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.2985, currency: '$', precision: 4, sector: 'Core Majors' },
  { symbol: 'USDCHF', name: 'Dollaro USA / Franco Svizzero (Swissie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.8668, currency: 'CHF', precision: 4, sector: 'Core Majors' },
  { symbol: 'USDCAD', name: 'Dollaro USA / Dollaro Canadese (Loonie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.3852, currency: 'C$', precision: 4, sector: 'Commodity Majors' },
  { symbol: 'AUDUSD', name: 'Dollaro Australiano / Dollaro USA (Aussie)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.6621, currency: '$', precision: 4, sector: 'Commodity Majors' },
  { symbol: 'NZDUSD', name: 'Dollaro Neozelandese / Dollaro USA (Kiwi)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.5984, currency: '$', precision: 4, sector: 'Commodity Majors' },
  { symbol: 'EURGBP', name: 'Euro / Sterlina Britannica', cat: 'forex', exchange: 'Interbank Forex', basePrice: 0.8354, currency: '£', precision: 4, sector: 'Crosses / Minors' },
  { symbol: 'EURJPY', name: 'Euro / Yen Giapponese', cat: 'forex', exchange: 'Interbank Forex', basePrice: 165.35, currency: '¥', precision: 3, sector: 'Crosses / Minors' },
  { symbol: 'GBPJPY', name: 'Sterlina / Yen Giapponese (Guppy)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 197.85, currency: '¥', precision: 3, sector: 'Crosses / Minors' },
  { symbol: 'USDCNY', name: 'Dollaro USA / Renminbi Cinese (Onshore/Offshore)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 7.1245, currency: '¥', precision: 4, sector: 'Exotics' },
  { symbol: 'USDHKD', name: 'Dollaro USA / Dollaro Hong Kong (Pegged)', cat: 'forex', exchange: 'Interbank Forex', basePrice: 7.7780, currency: 'HK$', precision: 4, sector: 'Exotics' },
  { symbol: 'USDSGD', name: 'Dollaro USA / Dollaro Singapore', cat: 'forex', exchange: 'Interbank Forex', basePrice: 1.3210, currency: 'S$', precision: 4, sector: 'Exotics' },
  { symbol: 'XAUUSD', name: 'Oro Spot / Dollaro USA (Gold Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 2746.50, currency: '$', precision: 2, sector: 'Metalli Preziosi' },
  { symbol: 'XAGUSD', name: 'Argento Spot / Dollaro USA (Silver Spot)', cat: 'forex', exchange: 'Bullion Spot', basePrice: 32.84, currency: '$', precision: 2, sector: 'Metalli Preziosi' },
  { symbol: 'USOIL', name: 'WTI Crude Oil (Spot Petrolio)', cat: 'forex', exchange: 'Commodities', basePrice: 71.85, currency: '$', precision: 2, sector: 'Energetici' },
  { symbol: 'BRENT', name: 'Brent Crude Oil (Spot Brent)', cat: 'forex', exchange: 'Commodities', basePrice: 75.42, currency: '$', precision: 2, sector: 'Energetici' },
  { symbol: 'NATGAS', name: 'Natural Gas Henry Hub', cat: 'forex', exchange: 'Commodities', basePrice: 2.7480, currency: '$', precision: 4, sector: 'Energetici' },

  // =========================================================================
  // 3. BORSA ITALIANA — COMPENDIO COMPLETO A-Z DA PDF UFFICIALE (FTSE MIB, STAR, EURONEXT MILAN, GROWTH)
  // =========================================================================
  { symbol: 'A2A.MI', name: 'A2A S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.240, currency: '€', precision: 3, sector: 'FTSE MIB • Utility' },
  { symbol: 'ACE.MI', name: 'Acea S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 17.85, currency: '€', precision: 2, sector: 'Euronext Milan • Utility' },
  { symbol: 'ALF.MI', name: 'Altea Green Power', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.40, currency: '€', precision: 2, sector: 'Growth Milan • Rinnovabili' },
  { symbol: 'AMP.MI', name: 'Amplifon S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 31.20, currency: '€', precision: 2, sector: 'FTSE MIB • Salute & Benessere' },
  { symbol: 'ARN.MI', name: 'Ariston Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.12, currency: '€', precision: 2, sector: 'Euronext Milan • Riscaldamento/Industria' },
  { symbol: 'G.MI', name: 'Assicurazioni Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 44.02, currency: '€', precision: 2, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'AZM.MI', name: 'Azimut Holding', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 26.40, currency: '€', precision: 2, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'ANIM.MI', name: 'Anima Holding S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.18, currency: '€', precision: 2, sector: 'FTSE Italia Mid Cap • Risparmio Gestito' },
  { symbol: 'BF.MI', name: 'B.F. S.p.A. (Bonifiche Ferraresi)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 3.92, currency: '€', precision: 2, sector: 'FTSE Italia Mid Cap • Agricoltura / Alimentare' },
  { symbol: 'BFF.MI', name: 'BFF Bank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.85, currency: '€', precision: 2, sector: 'FTSE Italia Mid Cap • Finanza Specialistica' },
  { symbol: 'BPE.MI', name: 'BPER Banca', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.35, currency: '€', precision: 2, sector: 'FTSE MIB • Banche' },
  { symbol: 'BGEN.MI', name: 'Banca Generali', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 43.80, currency: '€', precision: 2, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMED.MI', name: 'Banca Mediolanum', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 11.90, currency: '€', precision: 2, sector: 'FTSE MIB • Servizi Finanziari' },
  { symbol: 'BMPS.MI', name: 'Banca Monte dei Paschi di Siena', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.45, currency: '€', precision: 2, sector: 'FTSE MIB • Banche' },
  { symbol: 'BAMI.MI', name: 'Banco BPM', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 13.92, currency: '€', precision: 2, sector: 'FTSE MIB • Banche' },
  { symbol: 'BRE.MI', name: 'Brembo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.25, currency: '€', precision: 2, sector: 'Euronext Milan • Componentistica Auto' },
  { symbol: 'BC.MI', name: 'Brunello Cucinelli', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 98.40, currency: '€', precision: 2, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'CE.MI', name: 'Cairo Communication', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.15, currency: '€', precision: 2, sector: 'Euronext Milan • Media & Editoria' },
  { symbol: 'CPR.MI', name: 'Campari (Davide Campari-Milano)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 8.10, currency: '€', precision: 2, sector: 'FTSE MIB • Alimentari & Bevande' },
  { symbol: 'CELL.MI', name: 'Cellularline', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.85, currency: '€', precision: 2, sector: 'STAR • Accessori Elettronica' },
  { symbol: 'DAL.MI', name: "D'Amico International Shipping", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.95, currency: '€', precision: 2, sector: 'STAR • Trasporti Marittimi' },
  { symbol: 'DIA.MI', name: 'Diasorin S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 108.50, currency: '€', precision: 2, sector: 'FTSE MIB • Salute & Biomedicale' },
  { symbol: 'EAV.MI', name: 'Enav S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 3.98, currency: '€', precision: 2, sector: 'Euronext Milan • Controllo Traffico Aereo' },
  { symbol: 'ENEL.MI', name: 'Enel S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.68, currency: '€', precision: 2, sector: 'FTSE MIB • Utility / Energia' },
  { symbol: 'ENI.MI', name: 'Eni S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 25.54, currency: '€', precision: 2, sector: 'FTSE MIB • Petrolifero' },
  { symbol: 'ERG.MI', name: 'Erg S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 27.80, currency: '€', precision: 2, sector: 'Euronext Milan • Energia Green' },
  { symbol: 'ELUX.MI', name: 'EssilorLuxottica', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 218.40, currency: '€', precision: 2, sector: 'FTSE MIB • Ottica / Beni di Consumo' },
  { symbol: 'RACE.MI', name: 'Ferrari N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 382.55, currency: '€', precision: 2, sector: 'FTSE MIB • Automotive / Lusso' },
  { symbol: 'FB.MI', name: 'Fila S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.60, currency: '€', precision: 2, sector: 'STAR • Beni di Consumo' },
  { symbol: 'FBK.MI', name: 'FinecoBank', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 17.10, currency: '€', precision: 2, sector: 'FTSE MIB • Banche Online' },
  { symbol: 'GAB.MI', name: 'Gabetti Property Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.850, currency: '€', precision: 3, sector: 'Euronext Milan • Immobiliare' },
  { symbol: 'GEO.MI', name: 'Geox S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.680, currency: '€', precision: 3, sector: 'Euronext Milan • Calzature' },
  { symbol: 'IM.MI', name: 'Immsi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.540, currency: '€', precision: 3, sector: 'Euronext Milan • Holding Industriale' },
  { symbol: 'IP.MI', name: 'Interpump Group', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 44.60, currency: '€', precision: 2, sector: 'FTSE MIB • Industria' },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.28, currency: '€', precision: 2, sector: 'FTSE MIB • Banche' },
  { symbol: 'INW.MI', name: 'Infrastrutture Wireless (INWIT)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.80, currency: '€', precision: 2, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'IRE.MI', name: 'Iren S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.980, currency: '€', precision: 3, sector: 'Euronext Milan • Multi-utility' },
  { symbol: 'IVG.MI', name: 'Iveco Group N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 11.20, currency: '€', precision: 2, sector: 'FTSE MIB • Veicoli Industriali' },
  { symbol: 'JUVE.MI', name: 'Juventus FC', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.450, currency: '€', precision: 3, sector: 'Euronext Milan • Sport & Entertainment' },
  { symbol: 'LDO.MI', name: 'Leonardo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 51.12, currency: '€', precision: 2, sector: 'FTSE MIB • Difesa & Aerospazio' },
  { symbol: 'MAU.MI', name: 'Maire Tecnimont', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 7.65, currency: '€', precision: 2, sector: 'Euronext Milan • Ingegneria' },
  { symbol: 'MS.MI', name: 'Mediaset (MFE A/B)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 3.400, currency: '€', precision: 3, sector: 'Euronext Milan • Media TV' },
  { symbol: 'MONC.MI', name: 'Moncler S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 46.90, currency: '€', precision: 2, sector: 'FTSE MIB • Moda & Lusso' },
  { symbol: 'NEXI.MI', name: 'Nexi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 6.15, currency: '€', precision: 2, sector: 'FTSE MIB • Servizi Finanziari / Digital' },
  { symbol: 'OVS.MI', name: 'Ovs S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.820, currency: '€', precision: 3, sector: 'Euronext Milan • Abbigliamento Retail' },
  { symbol: 'PIA.MI', name: 'Piaggio & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.740, currency: '€', precision: 3, sector: 'Euronext Milan • Automotive' },
  { symbol: 'PIRC.MI', name: 'Pirelli & C.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.85, currency: '€', precision: 2, sector: 'FTSE MIB • Pneumatici' },
  { symbol: 'PST.MI', name: 'Poste Italiane', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 14.20, currency: '€', precision: 2, sector: 'FTSE MIB • Servizi Postali & Finanziari' },
  { symbol: 'PRY.MI', name: 'Prysmian S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 104.40, currency: '€', precision: 2, sector: 'FTSE MIB • Cavi Industriali' },
  { symbol: 'RAI.MI', name: 'Rai Way S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 5.40, currency: '€', precision: 2, sector: 'Euronext Milan • Torri & Trasmissione' },
  { symbol: 'REC.MI', name: 'Recordati S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 54.20, currency: '€', precision: 2, sector: 'FTSE MIB • Farmaceutica' },
  { symbol: 'STM.MI', name: 'STMicroelectronics', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 40.91, currency: '€', precision: 2, sector: 'FTSE MIB • Semiconduttori' },
  { symbol: 'SFL.MI', name: 'Sanlorenzo S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 38.40, currency: '€', precision: 2, sector: 'FTSE Italia Mid Cap / STAR • Nautica di Lusso' },
  { symbol: 'SAFILO.MI', name: 'Safilo Group S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.150, currency: '€', precision: 3, sector: 'Euronext Milan • Occhialeria' },
  { symbol: 'SPM.MI', name: 'Saipem S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 2.480, currency: '€', precision: 3, sector: 'FTSE MIB • Servizi Petroliferi' },
  { symbol: 'SAB.MI', name: 'Saras S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.750, currency: '€', precision: 3, sector: 'Euronext Milan • Raffinazione' },
  { symbol: 'SESA.MI', name: 'Sesa S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 92.50, currency: '€', precision: 2, sector: 'STAR • IT Services & Cloud' },
  { symbol: 'SRG.MI', name: 'Snam S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.62, currency: '€', precision: 2, sector: 'FTSE MIB • Infrastrutture Gas' },
  { symbol: 'SOL.MI', name: 'Sol S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 34.80, currency: '€', precision: 2, sector: 'Euronext Milan • Gas Industriali' },
  { symbol: 'STLAM.MI', name: 'Stellantis N.V.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 4.150, currency: '€', precision: 3, sector: 'FTSE MIB • Automotive' },
  { symbol: 'TEN.MI', name: 'Tenaris S.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 16.85, currency: '€', precision: 2, sector: 'FTSE MIB • Tubi & Acciaio' },
  { symbol: 'TNG.MI', name: 'Technogym S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 10.40, currency: '€', precision: 2, sector: 'Euronext Milan • Fitness Equipment' },
  { symbol: 'TIT.MI', name: 'Telecom Italia (TIM)', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 0.2650, currency: '€', precision: 4, sector: 'FTSE MIB • Telecomunicazioni' },
  { symbol: 'TRN.MI', name: 'Terna S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 8.45, currency: '€', precision: 2, sector: 'FTSE MIB • Reti Elettriche' },
  { symbol: 'TOD.MI', name: "Tod's S.p.A.", cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 43.00, currency: '€', precision: 2, sector: 'Euronext Milan • Calzature Lusso' },
  { symbol: 'TXT.MI', name: 'Txt E-Solutions', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 24.50, currency: '€', precision: 2, sector: 'STAR • Software & Tech' },
  { symbol: 'UCG.MI', name: 'UniCredit S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 78.65, currency: '€', precision: 2, sector: 'FTSE MIB • Banche' },
  { symbol: 'UNI.MI', name: 'Unipol Gruppo', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 12.30, currency: '€', precision: 2, sector: 'FTSE MIB • Assicurazioni' },
  { symbol: 'VLA.MI', name: 'Valsoia S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 9.80, currency: '€', precision: 2, sector: 'Euronext Milan • Alimentare Sano' },
  { symbol: 'ZUC.MI', name: 'Zucchi S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 1.200, currency: '€', precision: 3, sector: 'Euronext Milan • Tessile Casa' },
  { symbol: 'YSY.MI', name: 'Reply S.p.A.', cat: 'eu_stock', exchange: 'Borsa Italiana', basePrice: 138.50, currency: '€', precision: 2, sector: 'FTSE Italia Mid Cap / STAR • IT / Consulenza Tech' },

  // =========================================================================
  // 4. NASDAQ-100 — GUIDA PDF UFFICIALE (GIGANTI TECH, E-COMMERCE, AUTOMOTIVE, BIOTECH)
  // =========================================================================
  { symbol: 'AAPL', name: 'Apple Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 234.80, currency: '$', precision: 2, sector: 'Tech • Elettronica di Consumo' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 142.50, currency: '$', precision: 2, sector: 'Tech • Semiconduttori & AI' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 428.50, currency: '$', precision: 2, sector: 'Tech • Cloud & Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 181.20, currency: '$', precision: 2, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 182.50, currency: '$', precision: 2, sector: 'Tech • Servizi Internet & Ricerca' },
  { symbol: 'META', name: 'Meta Platforms Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 585.60, currency: '$', precision: 2, sector: 'Tech • Social Media & Rete' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 178.50, currency: '$', precision: 2, sector: 'Tech • Semiconduttori' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 154.20, currency: '$', precision: 2, sector: 'Tech • Microprocessori' },
  { symbol: 'ADBE', name: 'Adobe Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 498.00, currency: '$', precision: 2, sector: 'Tech • Software & Grafica' },
  { symbol: 'INTC', name: 'Intel Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 24.80, currency: '$', precision: 2, sector: 'Tech • Microchip' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 168.00, currency: '$', precision: 2, sector: 'Tech • Wireless & Telecom' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 198.40, currency: '$', precision: 2, sector: 'Retail • E-Commerce & Cloud' },
  { symbol: 'NFLX', name: 'Netflix Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 745.00, currency: '$', precision: 2, sector: 'Media • Streaming & Entertainment' },
  { symbol: 'WMT', name: 'Walmart Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 82.50, currency: '$', precision: 2, sector: 'Retail • Grande Distribuzione' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 910.00, currency: '$', precision: 2, sector: 'Retail • Wholesale' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 172.40, currency: '$', precision: 2, sector: 'Staples • Bevande & Alimentari' },
  { symbol: 'MDLZ', name: 'Mondelez International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 68.90, currency: '$', precision: 2, sector: 'Staples • Snack & Dolciumi' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 98.40, currency: '$', precision: 2, sector: 'Discretionary • Caffetterie' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', cat: 'us_stock', exchange: 'NYSE', basePrice: 59.80, currency: '$', precision: 2, sector: 'Discretionary • Ristorazione' },
  { symbol: 'TSLA', name: 'Tesla Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 248.90, currency: '$', precision: 2, sector: 'Automotive • Veicoli Elettrici' },
  { symbol: 'HON', name: 'Honeywell International', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 215.40, currency: '$', precision: 2, sector: 'Industrials • Ingegneria Aerospaziale' },
  { symbol: 'CSX', name: 'CSX Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 35.80, currency: '$', precision: 2, sector: 'Industrials • Trasporti Ferroviari' },
  { symbol: 'ODFL', name: 'Old Dominion Freight Line', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 198.50, currency: '$', precision: 2, sector: 'Industrials • Trasporto Gomma LTL' },
  { symbol: 'FAST', name: 'Fastenal Company', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 76.20, currency: '$', precision: 2, sector: 'Industrials • Forniture Industriali' },
  { symbol: 'GILD', name: 'Gilead Sciences', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 88.40, currency: '$', precision: 2, sector: 'Biotech • Farmaci Antivirali' },
  { symbol: 'AMGN', name: 'Amgen Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 315.60, currency: '$', precision: 2, sector: 'Biotech • Terapie Avanzate' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 468.20, currency: '$', precision: 2, sector: 'Biotech • Malattie Rare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 915.00, currency: '$', precision: 2, sector: 'Biotech • Anticorpi & Ricerca' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 518.00, currency: '$', precision: 2, sector: 'Health Care • Chirurgia Robotica' },

  // =========================================================================
  // 5. S&P 500 — GUIDA PDF UFFICIALE (FINANCIALS, HEALTHCARE, INDUSTRIALS, ENERGY, STAPLES)
  // =========================================================================
  { symbol: 'ACN', name: 'Accenture plc', cat: 'us_stock', exchange: 'NYSE', basePrice: 354.20, currency: '$', precision: 2, sector: 'InfoTech • IT Consulting' },
  { symbol: 'CRM', name: 'Salesforce Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 290.00, currency: '$', precision: 2, sector: 'InfoTech • Cloud Software' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 56.40, currency: '$', precision: 2, sector: 'InfoTech • Communications' },
  { symbol: 'IBM', name: 'International Business Machines', cat: 'us_stock', exchange: 'NYSE', basePrice: 214.80, currency: '$', precision: 2, sector: 'InfoTech • Enterprise IT' },
  { symbol: 'ORCL', name: 'Oracle Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 172.50, currency: '$', precision: 2, sector: 'InfoTech • Systems Software' },
  { symbol: 'DIS', name: 'The Walt Disney Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 96.50, currency: '$', precision: 2, sector: 'Media • Entertainment' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 42.80, currency: '$', precision: 2, sector: 'Media • Cable & Satellite' },
  { symbol: 'T', name: 'AT&T Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 21.60, currency: '$', precision: 2, sector: 'Telecom • Alternative Carriers' },
  { symbol: 'VZ', name: 'Verizon Communications', cat: 'us_stock', exchange: 'NYSE', basePrice: 42.10, currency: '$', precision: 2, sector: 'Telecom • Integrated Services' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 144.50, currency: '$', precision: 2, sector: 'Media • Interactive Home Entertainment' },
  { symbol: 'HD', name: 'The Home Depot Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 395.00, currency: '$', precision: 2, sector: 'Discretionary • Home Improvement' },
  { symbol: 'NKE', name: 'NIKE Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 82.40, currency: '$', precision: 2, sector: 'Discretionary • Footwear' },
  { symbol: 'MCD', name: "McDonald's Corporation", cat: 'us_stock', exchange: 'NYSE', basePrice: 296.50, currency: '$', precision: 2, sector: 'Discretionary • Restaurants' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 4420.00, currency: '$', precision: 2, sector: 'Discretionary • Hotels & Travel' },
  { symbol: 'TJX', name: 'The TJX Companies Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 118.40, currency: '$', precision: 2, sector: 'Discretionary • Apparel Retail' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway (Class B)', cat: 'us_stock', exchange: 'NYSE', basePrice: 458.50, currency: '$', precision: 2, sector: 'Financials • Multi-Sector Holdings' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', cat: 'us_stock', exchange: 'NYSE', basePrice: 224.50, currency: '$', precision: 2, sector: 'Financials • Diversified Banks' },
  { symbol: 'BAC', name: 'Bank of America Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 42.80, currency: '$', precision: 2, sector: 'Financials • Diversified Banks' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 64.20, currency: '$', precision: 2, sector: 'Financials • Diversified Banks' },
  { symbol: 'MS', name: 'Morgan Stanley', cat: 'us_stock', exchange: 'NYSE', basePrice: 118.50, currency: '$', precision: 2, sector: 'Financials • Investment Banking' },
  { symbol: 'GS', name: 'The Goldman Sachs Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 524.00, currency: '$', precision: 2, sector: 'Financials • Investment Banking' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 508.00, currency: '$', precision: 2, sector: 'Financials • Publishing & Analytics' },
  { symbol: 'AXP', name: 'American Express Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 274.00, currency: '$', precision: 2, sector: 'Financials • Consumer Finance' },
  { symbol: 'BLK', name: 'BlackRock Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 995.00, currency: '$', precision: 2, sector: 'Financials • Asset Management' },
  { symbol: 'C', name: 'Citigroup Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 66.80, currency: '$', precision: 2, sector: 'Financials • Diversified Banks' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 895.00, currency: '$', precision: 2, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'UNH', name: 'UnitedHealth Group', cat: 'us_stock', exchange: 'NYSE', basePrice: 592.00, currency: '$', precision: 2, sector: 'Health Care • Managed Health Care' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', cat: 'us_stock', exchange: 'NYSE', basePrice: 162.00, currency: '$', precision: 2, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 106.50, currency: '$', precision: 2, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 192.00, currency: '$', precision: 2, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', cat: 'us_stock', exchange: 'NYSE', basePrice: 562.00, currency: '$', precision: 2, sector: 'Health Care • Life Sciences Tools' },
  { symbol: 'PFE', name: 'Pfizer Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 28.40, currency: '$', precision: 2, sector: 'Health Care • Pharmaceuticals' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 388.50, currency: '$', precision: 2, sector: 'Industrials • Construction Machinery' },
  { symbol: 'GE', name: 'GE Aerospace', cat: 'us_stock', exchange: 'NYSE', basePrice: 184.20, currency: '$', precision: 2, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 578.00, currency: '$', precision: 2, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 242.00, currency: '$', precision: 2, sector: 'Industrials • Rail Transportation' },
  { symbol: 'UPS', name: 'United Parcel Service', cat: 'us_stock', exchange: 'NYSE', basePrice: 134.50, currency: '$', precision: 2, sector: 'Industrials • Air Freight & Logistics' },
  { symbol: 'BA', name: 'The Boeing Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 154.80, currency: '$', precision: 2, sector: 'Industrials • Aerospace & Defense' },
  { symbol: 'MMM', name: '3M Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 128.50, currency: '$', precision: 2, sector: 'Industrials • Industrial Conglomerates' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 168.00, currency: '$', precision: 2, sector: 'Staples • Household Products' },
  { symbol: 'KO', name: 'The Coca-Cola Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 66.80, currency: '$', precision: 2, sector: 'Staples • Soft Drinks' },
  { symbol: 'PM', name: 'Philip Morris International', cat: 'us_stock', exchange: 'NYSE', basePrice: 128.00, currency: '$', precision: 2, sector: 'Staples • Tobacco' },
  { symbol: 'CL.US', name: 'Colgate-Palmolive Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 98.50, currency: '$', precision: 2, sector: 'Staples • Household Products' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 118.00, currency: '$', precision: 2, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'CVX', name: 'Chevron Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 154.50, currency: '$', precision: 2, sector: 'Energy • Integrated Oil & Gas' },
  { symbol: 'COP', name: 'ConocoPhillips', cat: 'us_stock', exchange: 'NYSE', basePrice: 108.40, currency: '$', precision: 2, sector: 'Energy • Oil & Gas Exploration' },
  { symbol: 'SLB', name: 'SLB (Schlumberger)', cat: 'us_stock', exchange: 'NYSE', basePrice: 42.80, currency: '$', precision: 2, sector: 'Energy • Equipment & Services' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', cat: 'us_stock', exchange: 'NYSE', basePrice: 82.50, currency: '$', precision: 2, sector: 'Utilities • Electric Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', cat: 'us_stock', exchange: 'NYSE', basePrice: 114.20, currency: '$', precision: 2, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SO', name: 'The Southern Company', cat: 'us_stock', exchange: 'NYSE', basePrice: 88.90, currency: '$', precision: 2, sector: 'Utilities • Electric Utilities' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cat: 'etf', exchange: 'NYSE Arca', basePrice: 582.40, currency: '$', precision: 2, sector: 'ETF • S&P 500 Benchmark' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ 100)', cat: 'etf', exchange: 'NASDAQ', basePrice: 496.80, currency: '$', precision: 2, sector: 'ETF • Tech Benchmark' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', cat: 'etf', exchange: 'NYSE Arca', basePrice: 228.00, currency: '$', precision: 2, sector: 'ETF • Small Cap' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average', cat: 'etf', exchange: 'NYSE Arca', basePrice: 432.50, currency: '$', precision: 2, sector: 'ETF • Blue Chips' },

  // S&P MidCap 400 & NASDAQ (Compendio Multimercato Globale)
  { symbol: 'CHTR', name: 'Charter Communications Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 382.40, currency: '$', precision: 2, sector: 'NASDAQ-100 • Telecomunicazioni' },
  { symbol: 'DECK', name: 'Deckers Outdoor Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 165.20, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Abbigliamento & Calzature' },
  { symbol: 'EEFT', name: 'Euronet Worldwide Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 108.50, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Elaborazione Pagamenti' },
  { symbol: 'GME', name: 'GameStop Corp.', cat: 'us_stock', exchange: 'NYSE', basePrice: 24.50, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Specialty Retail' },
  { symbol: 'LSCC', name: 'Lattice Semiconductor Corp.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 48.20, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Semiconduttori' },
  { symbol: 'MANH', name: 'Manhattan Associates Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 274.00, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Software Logistici' },
  { symbol: 'MEDP', name: 'Medpace Holdings Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 318.50, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Ricerca Clinica (CRO)' },
  { symbol: 'WING', name: 'Wingstop Inc.', cat: 'us_stock', exchange: 'NASDAQ', basePrice: 348.00, currency: '$', precision: 2, sector: 'S&P MidCap 400 • Ristorazione / Catene' },

  // =========================================================================
  // 6. CRIPTOVALUTE — GUIDA PDF UFFICIALE OKX & BYBIT (LAYER 0/1, L2, DEFI, STABLE, MEME)
  // =========================================================================
  { symbol: 'BTCUSDT', name: 'Bitcoin (Digital Gold / Store of Value)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 80210.00, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ETHUSDT', name: 'Ethereum (Smart Contracts Leader)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2420.50, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SOLUSDT', name: 'Solana (High-Performance Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 94.80, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'BNBUSDT', name: 'BNB (BNB Chain Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 716.35, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ADAUSDT', name: 'Cardano (Peer-reviewed Blockchain)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.3850, currency: '$', precision: 4, sector: 'Layer 0 & Layer 1' },
  { symbol: 'DOTUSDT', name: 'Polkadot (Interoperability Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 4.65, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'AVAXUSDT', name: 'Avalanche (Subnet Enterprise EVM)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 8.74, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'SUIUSDT', name: 'Sui Network (Move-based Layer 1)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2.1500, currency: '$', precision: 4, sector: 'Layer 0 & Layer 1' },
  { symbol: 'XRPUSDT', name: 'Ripple (Cross-Border Payments)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.5850, currency: '$', precision: 4, sector: 'Layer 0 & Layer 1' },
  { symbol: 'TONUSDT', name: 'Toncoin (Telegram Native Ecosystem)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 5.10, currency: '$', precision: 2, sector: 'Layer 0 & Layer 1' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol (Chain Abstraction & Sharding)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 4.0200, currency: '$', precision: 4, sector: 'Layer 0 & Layer 1' },
  { symbol: 'ENAUSDT', name: 'Ethena (Synthetic Dollar Protocol)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1835, currency: '$', precision: 4, sector: 'DeFi & Stable' },
  { symbol: 'HYPEUSDT', name: 'Hyperliquid Perp (High Speed DEX)', cat: 'crypto', exchange: 'Bybit / OKX', basePrice: 83.45, currency: '$', precision: 2, sector: 'DeFi & Perp' },
  { symbol: 'KORUUSDT', name: 'South Korea Bull 3X Perpetual', cat: 'crypto', exchange: 'Bybit', basePrice: 10.43, currency: '$', precision: 2, sector: 'Derivati Sintetici' },
  { symbol: 'INTCUSDT', name: 'Intel Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 58.12, currency: '$', precision: 2, sector: 'Derivati Sintetici' },
  { symbol: 'BMNRUSDT', name: 'Bitmine Perpetual Derivative', cat: 'crypto', exchange: 'Bybit', basePrice: 21.89, currency: '$', precision: 2, sector: 'Derivati Sintetici' },
  { symbol: 'ARBUSDT', name: 'Arbitrum One (Optimistic Rollup Ethereum)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.6200, currency: '$', precision: 4, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'OPUSDT', name: 'Optimism (OP Stack Infrastructure)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.7500, currency: '$', precision: 4, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'POLUSDT', name: 'Polygon POL / MATIC (Multi-chain Scaling)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.3800, currency: '$', precision: 4, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'MNTUSDT', name: 'Mantle (Modular L2 Bybit Ecosystem)', cat: 'crypto', exchange: 'Bybit', basePrice: 0.7200, currency: '$', precision: 4, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'STRKUSDT', name: 'Starknet (ZK-Rollup Layer 2)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.4400, currency: '$', precision: 4, sector: 'Soluzioni di Scalabilità & Layer 2' },
  { symbol: 'LINKUSDT', name: 'Chainlink (Decentralized Oracle Network)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 12.80, currency: '$', precision: 2, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'AAVEUSDT', name: 'Aave (DeFi Lending Market)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 165.00, currency: '$', precision: 2, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'UNIUSDT', name: 'Uniswap (Decentralized Exchange DEX)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 8.40, currency: '$', precision: 2, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'MKRUSDT', name: 'MakerDAO / Sky (Stablecoin Governance)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1480.00, currency: '$', precision: 2, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'LDOUSDT', name: 'Lido DAO (Liquid Staking ETH)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.2500, currency: '$', precision: 4, sector: 'Oracoli & Finanza Decentrata (DeFi)' },
  { symbol: 'USDT', name: 'Tether USD (Riserve Fiat Tether Ltd.)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'USDC', name: 'USD Coin (Circle Regolamentato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DAI', name: 'Dai Stablecoin (Collaterale Decentralizzato)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 1.0000, currency: '$', precision: 4, sector: 'Monete Ancorate (Stablecoin)' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin (Pioniere Meme Community)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.1650, currency: '$', precision: 4, sector: 'Meme & Token di Comunità' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu (Shibarium L2 Dedicated)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00001850, currency: '$', precision: 8, sector: 'Meme & Token di Comunità' },
  { symbol: 'PEPEUSDT', name: 'Pepe (Internet Culture High Beta)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00000980, currency: '$', precision: 8, sector: 'Meme & Token di Comunità' },
  { symbol: 'BONKUSDT', name: 'Bonk (Meme Nativo Solana)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.00002250, currency: '$', precision: 8, sector: 'Meme & Token di Comunità' },
  { symbol: 'WIFUSDT', name: 'dogwifhat (Solana Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 2.4500, currency: '$', precision: 4, sector: 'Meme & Token di Comunità' },
  { symbol: 'FLOKIUSDT', name: 'Floki (Gaming & Utility Meme)', cat: 'crypto', exchange: 'OKX / Bybit', basePrice: 0.000155, currency: '$', precision: 6, sector: 'Meme & Token di Comunità' }
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
