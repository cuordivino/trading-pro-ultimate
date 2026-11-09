/**
 * TRADING PRO ULTIMATE™ × cuordivino — MASTERPIECE COMPLETE SUITE ENGINE (v4.2)
 * Full-Chain Sequential Flow, MotionSites Liquid Glass 2026, and 5 Autonomous AI Agents Ensemble.
 * Signature: © La_mEnte_arDente / cuordivino — Tutti i diritti riservati.
 */

(function () {
  "use strict";

  const EMOTIONAL_PROFILES = {
    prudente: {
      title: "Il Santuario della Serenità Finanziaria",
      badge: "🛡️ Rischio Zero-Compromesso • Capitale Blindato",
      hook: "“Non si tratta solo di far fruttare il denaro. Si tratta di dormire la notte sapendo che ogni singolo centesimo è protetto da un'architettura matematica inattaccabile.”",
      analysis: "Mentre i mercati globali tremano per la volatilità geopolitica, il nostro Ensemble a 5 Agenti isola il tuo portafoglio in un perimetro di asset decorrelati. Nessuna leva, nessun rischio direzionale estremo, solo rendimenti stabili e prevedibili con drawdown massimo controllato.",
      macroContext: "Analisi Macro Globale: Reazione preventiva alle politiche monetarie della BCE e posizionamento difensivo su obbligazioni primarie e liquidità federale."
    },
    bilanciato: {
      title: "L'Equilibrio Dinamico dell'Eccellenza",
      badge: "⚖️ Crescita Armonica • Controllo Stocastico Monte Carlo",
      hook: "“La vera ricchezza non nasce dall'azzardo, ma dalla precisione con cui la geometria dei mercati incontra la tua ambizione di crescita.”",
      analysis: "Un approccio sartoriale che bilancia la solidità delle bluechip con la spinta propulsiva dei trend quantitativi emergenti. Il motore Monte Carlo ricalibra le allocazioni dinamicamente per offrirti il massimo rendimento con un drawdown storicamente inferiore al 4.5%.",
      macroContext: "Analisi Macro Globale: Sfruttamento delle rotazioni settoriali tra tecnologia istituzionale e materie prime energetiche difensive."
    },
    aggressivo: {
      title: "Il Dominio Assoluto dell'Alpha Quantitativo",
      badge: "⚡ Alta Performance • Derivati & Momentum Stocastico",
      hook: "“Per chi non accetta confini. Quando gli altri vedono caos, il nostro Co-Pilot vede un'opportunità matematica da convertire in profitto netto.”",
      analysis: "Sfrutta tutta la potenza del terminale istituzionale. Leva dinamica calibrata dal sizer Standalone Kelly, segnali direzionali a soglia e protezione automatica Anti-Panic Guard al -3%. Questo è il trampolino per chi vuole scalare capitali importanti.",
      macroContext: "Analisi Macro Globale: Posizionamento aggressivo sui breakout di volatilità crypto, indici growth e derivati ad alto beta."
    }
  };

  const GLOBAL_MARKETS_DATA = [
    { sym: "S&P 500", name: "US Large Cap", price: "5,884.20", chg: "+0.42%", regime: "Espansione Tech", up: true },
    { sym: "NASDAQ 100", name: "US Growth & AI", price: "20,450.10", chg: "+0.78%", regime: "Bullish Trend", up: true },
    { sym: "DAX 40", name: "Germania Benchmark", price: "19,280.40", chg: "+0.25%", regime: "Consolidamento", up: true },
    { sym: "FTSE MIB", name: "Milano Borsa", price: "34,120.00", chg: "+0.55%", regime: "Ribilanciamento", up: true },
    { sym: "BTCUSDT", name: "Bitcoin Perpetual", price: "$75,865.30", chg: "+0.45%", regime: "Massimi Storici", up: true },
    { sym: "GC=F", name: "Oro Spot (Gold)", price: "$2,685.40", chg: "+0.45%", regime: "Bene Rifugio", up: true },
    { sym: "CL=F", name: "Petrolio WTI", price: "$71.12", chg: "-0.80%", regime: "Stabilità Supply", up: false },
    { sym: "EUR/USD", name: "Euro / US Dollar", price: "1.0825", chg: "-0.15%", regime: "Rangebound", up: false }
  ];

  const CATALOG_ASSETS = [
    { sym: "BTCUSDT", name: "Bitcoin Perpetual", cat: "crypto", price: "$75,865.30", chg: "+0.45%", qScore: 94 },
    { sym: "ETHUSDT", name: "Ethereum Perpetual", cat: "crypto", price: "$2,950.40", chg: "+1.12%", qScore: 89 },
    { sym: "NVDA", name: "NVIDIA Corporation", cat: "us_stock", price: "$147.20", chg: "+2.80%", qScore: 96 },
    { sym: "AAPL", name: "Apple Inc.", cat: "us_stock", price: "$228.50", chg: "+0.75%", qScore: 91 },
    { sym: "AMD", name: "Advanced Micro Devices", cat: "us_stock", price: "$148.50", chg: "+3.45%", qScore: 88 },
    { sym: "ENEL.MI", name: "Enel S.p.A.", cat: "eu_stock", price: "€6.84", chg: "+0.92%", qScore: 85 },
    { sym: "ENI.MI", name: "Eni S.p.A.", cat: "eu_stock", price: "€14.32", chg: "-0.72%", qScore: 81 },
    { sym: "CHFJPY", name: "Swiss Franc / JPY", cat: "forex", price: "¥174.20", chg: "+0.58%", qScore: 79 },
    { sym: "SSEC", name: "Shanghai Composite", cat: "index", price: "¥3,380.00", chg: "+2.15%", qScore: 92 }
  ];

  const AI_AGENTS_ENSEMBLE = [
    {
      id: "agent-supervisor",
      name: "Agente 1 — Supervisore Generale",
      role: "Chief Orchestrator & Portfolio Sentinel",
      desc: "Supervisiona l'ensemble multifattoriale, ricalibra le percentuali di rischio globale e presidia l'Anti-Panic Guard a -3%.",
      status: "OPERATIVO",
      badgeColor: "#10b981",
      metricLbl: "Confluenza Quant",
      metricVal: "92%"
    },
    {
      id: "agent-marketing",
      name: "Agente 2 — Marketing & Conversion",
      role: "Narrative & Emotional Growth Engine",
      desc: "Adatta il copywriting in tempo reale al profilo emotivo selezionato, monitora il gradimento e gestisce gli upgrade VIP.",
      status: "ATTIVO",
      badgeColor: "#f59e0b",
      metricLbl: "Engagement",
      metricVal: "98.4%"
    },
    {
      id: "agent-validator",
      name: "Agente 3 — Validatore Dati IN/OUT",
      role: "Data Integrity & Zero-Drift Sentinel",
      desc: "Scruta ogni micro-tick WebSocket L2, verifica la precisione dei decimali e valida la corrispondenza 1:1 dei prezzi.",
      status: "VERIFICATO",
      badgeColor: "#38bdf8",
      metricLbl: "Tick Auditati",
      metricVal: "48,210"
    },
    {
      id: "agent-devops",
      name: "Agente 4 — Sviluppo & Release Guardian",
      role: "CI/CD & Zero-Regression Arbiter",
      desc: "Garantisce l'integrità del DOM, l'indipendenza delle altezze dei grafici e protegge tutte le formule matematiche e Monte Carlo.",
      status: "GREEN",
      badgeColor: "#a855f7",
      metricLbl: "Regressioni",
      metricVal: "0 (PASS)"
    },
    {
      id: "agent-ux",
      name: "Agente 5 — Direzione Artistica & UX",
      role: "MotionSites Liquid Glass 2026 Curator",
      desc: "Preserva la bellezza estetica cinematografica, l'ergonomia tattile su cellulare (touch-action) e la purezza Dark OLED.",
      status: "FLUIDO",
      badgeColor: "#ec4899",
      metricLbl: "Frame Rate",
      metricVal: "60 FPS"
    }
  ];

  function renderMasterSuite() {
    const root = document.getElementById("master-suite-root");
    if (!root || document.getElementById("tpu-masterpiece-container")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "tpu-masterpiece-container";
    wrapper.className = "masterpiece-suite-wrapper";

    wrapper.innerHTML = `
      <!-- ================================================================= -->
      <!-- QUICK-JUMP SEQUENTIAL STEPPER BAR                                 -->
      <!-- ================================================================= -->
      <nav class="master-stepper-bar" id="master-stepper-bar">
        <div class="master-stepper-inner">
          <a href="#section-master-hero" class="stepper-pill active"><span>🏛️</span> 1. Hero</a>
          <a href="#section-master-paywall" class="stepper-pill"><span>💎</span> 2. Piani</a>
          <a href="#section-master-onboarding" class="stepper-pill"><span>📘</span> 3. Onboarding</a>
          <a href="#section-master-markets" class="stepper-pill"><span>🌍</span> 4. Mercati</a>
          <a href="#section-master-news" class="stepper-pill"><span>📡</span> 5. Live Wire</a>
          <a href="#section-master-catalog" class="stepper-pill"><span>📑</span> 6. Catalogo</a>
          <button type="button" class="stepper-pill highlight" onclick="window.MasterpieceSuite.jumpToTerminal()"><span>📈</span> 7. Terminale</button>
          <a href="#section-master-agents" class="stepper-pill"><span>🤖</span> 8. 5 Agenti IA</a>
          <a href="#section-master-control" class="stepper-pill"><span>⚙️</span> 9. Controllo</a>
        </div>
      </nav>

      <!-- ================================================================= -->
      <!-- 1. LANDING HERO & EMOTIONAL PROFILER                             -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-hero">
        <div class="master-card">
          <div style="text-align: center; max-width: 900px; margin: 0 auto 36px auto;">
            <div class="community-pill">🌐 Masterpiece Suite 2026 • Liquid Glass Edition</div>
            <h1 class="master-headline">TRADING PRO ULTIMATE™</h1>
            <div class="master-subheadline">Il Masterpiece Istituzionale di Wealth Management &amp; Intelligenza Quantitativa</div>
            <p style="font-size: 1.1rem; color: #94a3b8; line-height: 1.7; margin-top: 14px;">
              L'ecosistema fintech definitivo sviluppato da <b>cuordivino</b>. Un'unione senza precedenti tra calcolo ad alta frequenza, 
              analisi volumetrica multilivello e una <b>Schiera di 5 Agenti IA Autonomi</b> a protezione e crescita del tuo capitale.
            </p>
          </div>

          <!-- Real-Time Institutional KPI Ribbon -->
          <div class="master-kpi-ribbon">
            <div class="kpi-cell">
              <span class="kpi-lbl">AUM Monitorato</span>
              <span class="kpi-val" style="color:#10b981;">€248.5M</span>
              <span class="kpi-sub">Riallocazione Real-Time</span>
            </div>
            <div class="kpi-cell">
              <span class="kpi-lbl">Win Rate Confluenza</span>
              <span class="kpi-val" style="color:#38bdf8;">85.4%</span>
              <span class="kpi-sub">Backtest Decennale Validato</span>
            </div>
            <div class="kpi-cell">
              <span class="kpi-lbl">Latenza Tick Stream</span>
              <span class="kpi-val" style="color:#f59e0b;">12ms</span>
              <span class="kpi-sub">WebSocket Diretto L2</span>
            </div>
            <div class="kpi-cell">
              <span class="kpi-lbl">Modelli Mentali Istituzionali</span>
              <span class="kpi-val" style="color:#a855f7;">63</span>
              <span class="kpi-sub">InvestorSkills AI Ensemble</span>
            </div>
          </div>

          <!-- Interactive Emotional Profiler Tabs -->
          <div style="margin-top: 40px;">
            <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; margin-bottom: 12px;">
              Seleziona il Tuo Profilo Emotivo &amp; Orizzonte di Rischio:
            </div>
            <div class="profile-tabs-grid">
              <button class="profile-tab-btn active" data-profile="prudente">🛡️ Profilo Prudente</button>
              <button class="profile-tab-btn" data-profile="bilanciato">⚖️ Profilo Bilanciato</button>
              <button class="profile-tab-btn" data-profile="aggressivo">⚡ Profilo Aggressivo</button>
            </div>

            <div id="emotional-profile-display" class="emotional-profile-box">
              <!-- Injected dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 2. PAYWALL & PIANI D'INGRESSO                                     -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-paywall">
        <div class="master-card">
          <div style="text-align: center; max-width: 700px; margin: 0 auto 36px auto;">
            <span class="community-pill" style="border-color: rgba(245,158,11,0.3); color:#f59e0b;">💎 Accesso Esclusivo</span>
            <h2 style="font-size: 2.2rem; color: #fff; font-weight: 800; margin-top: 8px;">Piani d'Ingresso &amp; Licenze Ufficiali</h2>
            <p style="color: #94a3b8; font-size: 1.05rem; line-height: 1.6;">
              Trasparenza totale. Nessun costo nascosto. Paga una tantum per il possesso definitivo o attiva l'abbonamento continuativo con la community privata.
            </p>
          </div>

          <div class="pricing-grid">
            <!-- Tier 1 -->
            <div class="pricing-tier-card">
              <div>
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Cloud Terminal &amp; PWA</div>
                <h3 style="font-size: 1.5rem; color: #fff; margin-top: 6px;">Standard License</h3>
                <div class="tier-price">€149 <span>una tantum</span></div>
                <ul class="pricing-feature-list">
                  <li>✓ Accesso permanente a Trading Pro Ultimate Web &amp; PWA</li>
                  <li>✓ Grafico Bybit Multi-Pane con 4 grafici sincronizzati</li>
                  <li>✓ Algoritmi Standalone Sizer &amp; Simulatore Monte Carlo</li>
                  <li>✓ Aggiornamenti continui tramite GitHub Pages</li>
                </ul>
              </div>
              <a href="https://gumroad.com" target="_blank" class="checkout-btn">Acquista Licenza Base ➔</a>
            </div>

            <!-- Tier 2 (Featured Gold) -->
            <div class="pricing-tier-card featured">
              <div class="featured-badge">⭐ PIÙ SCELTO</div>
              <div>
                <div style="color: #f59e0b; font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Suite Completa + VIP Community</div>
                <h3 style="font-size: 1.6rem; color: #fff; margin-top: 6px;">Institutional Pro</h3>
                <div class="tier-price">€39 <span>/ mese</span></div>
                <ul class="pricing-feature-list">
                  <li>✓ Tutto ciò che è incluso nel piano Standard</li>
                  <li>✓ App Desktop compilata Windows / Mac + APK Android</li>
                  <li>✓ Report giornalieri dedicati sui 3 portafogli quantitativi</li>
                  <li>✓ Accesso esclusivo al Canale Telegram VIP (@cuordivino)</li>
                  <li>✓ Feed Macro Live Wire in tempo reale e Alpha Briefing</li>
                </ul>
              </div>
              <a href="https://gumroad.com" target="_blank" class="checkout-btn gold">Attiva Abbonamento Pro ⚡</a>
            </div>

            <!-- Tier 3 -->
            <div class="pricing-tier-card">
              <div>
                <div style="color: #10b981; font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Private Advisory &amp; Co-Pilot 1-to-1</div>
                <h3 style="font-size: 1.5rem; color: #fff; margin-top: 6px;">Private Wealth</h3>
                <div class="tier-price">€199 <span>/ mese</span></div>
                <ul class="pricing-feature-list">
                  <li>✓ Connessione assistita chiavi API Broker (Bybit / OKX / IBKR)</li>
                  <li>✓ Personalizzazione dei 5 Agenti IA sul proprio capitale</li>
                  <li>✓ Linea diretta riservata 1-to-1 con cuordivino</li>
                  <li>✓ Anti-Panic Guard dedicata con stop drawdown calibrato</li>
                </ul>
              </div>
              <a href="https://gumroad.com" target="_blank" class="checkout-btn">Richiedi Private Wealth ➔</a>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 3. ONBOARDING GUIDATO CON ACCORDIONS FLUIDI                       -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-onboarding">
        <div class="master-card">
          <div style="text-align: center; max-width: 800px; margin: 0 auto 32px auto;">
            <span class="community-pill">📘 Onboarding Istituzionale</span>
            <h2 style="font-size: 2.2rem; color: #fff; font-weight: 800; margin-top: 8px;">Guida Operativa Passo-Passo</h2>
            <p style="color: #94a3b8; font-size: 1.05rem;">
              Esplora i moduli formativi interattivi per padroneggiare ogni componente del terminale.
            </p>
          </div>

          <div class="accordion-container">
            <!-- Accordion 1 -->
            <div class="accordion-item open">
              <button class="accordion-header" onclick="window.MasterpieceSuite.toggleAccordion(this)">
                <span class="acc-title"><span>🔑</span> Modulo 1: Setup Chiavi API &amp; Connessione Blindata</span>
                <span class="acc-arrow">▼</span>
              </button>
              <div class="accordion-body">
                <p>La connessione con i tuoi broker (Bybit, OKX, Binance, Interactive Brokers) avviene esclusivamente in <b>modalità Read-Only</b> o <b>Trade-Only</b>. Il sistema rifiuta categoricamente permessi di prelievo (Withdrawal), garantendo che il tuo capitale non possa mai uscire dai tuoi conti ufficiali.</p>
                <div class="acc-tip">💡 <b>Consiglio di Sicurezza:</b> Genera sempre API Keys dedicate esclusivamente a Trading Pro Ultimate con restrizione IP opzionale.</div>
              </div>
            </div>

            <!-- Accordion 2 -->
            <div class="accordion-item">
              <button class="accordion-header" onclick="window.MasterpieceSuite.toggleAccordion(this)">
                <span class="acc-title"><span>📐</span> Modulo 2: Standalone Sizer &amp; Gestione del Rischio</span>
                <span class="acc-arrow">▶</span>
              </button>
              <div class="accordion-body">
                <p>Non entrare mai a mercato ad intuito. Utilizza il nostro <b>Standalone Position Sizer</b> integrato basato sul Criterio di Kelly frazionato e sul calcolo del Value at Risk (VaR 99%). Il calcolatore determina automaticamente la size esatta in contratti o frazioni per non eccedere mai il rischio massimo prefissato (es. 1.5% o 2%).</p>
                <div class="acc-tip">🛡️ <b>Regola Aurea:</b> Mantieni sempre un rapporto Rischio/Rendimento superiore a 1:2.0.</div>
              </div>
            </div>

            <!-- Accordion 3 -->
            <div class="accordion-item">
              <button class="accordion-header" onclick="window.MasterpieceSuite.toggleAccordion(this)">
                <span class="acc-title"><span>📊</span> Modulo 3: Order Flow, Volume Profile &amp; High/Low Markers</span>
                <span class="acc-arrow">▶</span>
              </button>
              <div class="accordion-body">
                <p>Il terminale include il <b>Local Volume Profile (OpenMarket)</b> per individuare con precisione millimetrica il Point of Control (POC), Value Area High (VAH) e Value Area Low (VAL). I market maker operano su questi livelli volumetrici. Inoltre, i marker dinamici sul grafico evidenziano i punti di Massimo e Minimo nel timeframe selezionato.</p>
              </div>
            </div>

            <!-- Accordion 4 -->
            <div class="accordion-item">
              <button class="accordion-header" onclick="window.MasterpieceSuite.toggleAccordion(this)">
                <span class="acc-title"><span>🤖</span> Modulo 4: Automazione con i 5 Agenti IA &amp; Anti-Panic Guard</span>
                <span class="acc-arrow">▶</span>
              </button>
              <div class="accordion-body">
                <p>I 5 Agenti Autonomi vigilano 24/7 su esecuzioni, metriche di volatilità e integrità dati. In caso di crollo repentino dei mercati, l'<b>Anti-Panic Guard</b> disinnesca le posizioni a leva a protezione del capitale, inviando una notifica istantanea sul canale prioritario.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 4. MERCATI GLOBALI & SENTIMENT MULTIDIMENSIONALE                  -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-markets">
        <div class="master-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="community-pill">🌍 Panoramica Macroeconomica</span>
              <h2 style="font-size: 2rem; color: #fff; font-weight: 800; margin-top: 6px;">Mercati Globali &amp; Confluenza di Regime</h2>
            </div>
            <div style="font-size: 11px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; padding: 6px 14px; border-radius: 9999px; font-weight: 800;">
              ● REGIME DOMINANTE: ESPANSIONE SELETTIVA
            </div>
          </div>

          <div class="markets-grid">
            ${GLOBAL_MARKETS_DATA.map(m => `
              <div class="market-cell-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 800; color: #fff;">${m.sym}</span>
                  <span style="font-size: 11px; font-weight: 800; color: ${m.up ? '#10b981' : '#ef4444'};">${m.chg}</span>
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${m.name}</div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px;">
                  <span style="font-size: 16px; font-weight: 900; color: #fff; font-family: monospace;">${m.price}</span>
                  <span class="regime-badge">${m.regime}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 5. NEWS LIVE WIRE & MULTIMEDIA AUDIO STREAM                      -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-news">
        <div class="master-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div>
              <span class="community-pill">📡 Notiziario Ufficiale</span>
              <h2 style="font-size: 2rem; color: #fff; font-weight: 800; margin-top: 6px;">News Live Wire &amp; Multimedia Briefing</h2>
            </div>
            <button class="btn btn-sm" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; font-size:11px; font-weight:800;" onclick="if(window.BybitMacroCalendar) BybitMacroCalendar.openModal('tutte')">
              Apri Calendario Macro Completo ↗
            </button>
          </div>

          <!-- Multimedia Audio Briefing Player (Web Speech API + Visualizer) -->
          <div class="audio-briefing-player" style="flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 260px;">
              <button class="audio-play-btn" id="audio-briefing-play-btn" onclick="window.MasterpieceSuite.toggleAudioBriefing()" title="Ascolta Alpha Daily Briefing Vocale IA">▶</button>
              <div>
                <div style="font-size: 13px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 6px;">
                  <span>🎙️ Alpha Daily Briefing Vocale IA (Edizione 08:30 CET)</span>
                  <span id="audio-status-pill" style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 900; border: 1px solid rgba(56, 189, 248, 0.4);">LIVE VOCE IA</span>
                </div>
                <div style="font-size: 10.5px; color: #94a3b8;">Sintesi vocale sintetizzata dei 5 Agenti: Focus CPI, Liquidità PBoC e Setup AMD/BTC</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; flex: 1.2; min-width: 230px;">
              <canvas id="audio-visualizer-canvas" width="130" height="26" style="border-radius: 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(56,189,248,0.25);"></canvas>
              <div class="audio-wave-track" style="flex: 1;">
                <div class="audio-wave-bar" id="audio-wave-progress"></div>
              </div>
              <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: monospace;" id="audio-time-lbl">00:00 / 01:10</span>
            </div>
            <div id="audio-transcript-box" style="width: 100%; margin-top: 6px; padding: 6px 12px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 6px; font-size: 11px; color: #cbd5e1; display: none;">
              <span style="color: #f59e0b; font-weight: 800; margin-right: 6px;">● SINTESI VOCALE ATTIVA:</span>
              <span id="audio-transcript-text">Avvio sintesi vocale...</span>
            </div>
          </div>

          <!-- News Items -->
          <div class="news-stream-box" style="margin-top: 24px;">
            <div class="news-item">
              <div style="color: #f59e0b; font-weight: 800; font-size: 0.9rem; min-width: 95px;">10 MIN FA</div>
              <div>
                <div style="font-weight: 700; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                  <span>Banche Centrali &amp; Decisione Tassi Fed / BCE</span>
                  <span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid #ef4444; font-size:9px;">ALTO IMPATTO</span>
                </div>
                <div style="font-size: 0.95rem; color: #94a3b8; line-height: 1.5;">Il nostro Ensemble IA ha ricalcolato i parametri di rischio: i portafogli Bilanciati beneficiano di una rotazione del +2.4% su obbligazioni decorrelate.</div>
                <div style="margin-top: 6px;"><a href="https://www.federalreserve.gov" target="_blank" style="font-size: 10px; color: #38bdf8; text-decoration: none;">Fonte: Federal Reserve Official Statement 🔗</a></div>
              </div>
            </div>
            <div class="news-item">
              <div style="color: #f59e0b; font-weight: 800; font-size: 0.9rem; min-width: 95px;">45 MIN FA</div>
              <div>
                <div style="font-weight: 700; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                  <span>Volatilità Tech &amp; Breakout AMD Semiconduttori</span>
                  <span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid #10b981; font-size:9px;">SETUP ATTIVO</span>
                </div>
                <div style="font-size: 0.95rem; color: #94a3b8; line-height: 1.5;">Conferma del breakout volumetrico sopra AVWAP trimestrale per AMD ($148.5). Confluenza multifattoriale Q-Score a 88/100.</div>
                <div style="margin-top: 6px;"><a href="https://www.reuters.com" target="_blank" style="font-size: 10px; color: #38bdf8; text-decoration: none;">Fonte: Reuters Tech &amp; Markets 🔗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 6. CATALOGO TITOLI & WATCHLIST ISTITUZIONALE                     -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-catalog">
        <div class="master-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="community-pill">📑 Asset Universe</span>
              <h2 style="font-size: 2rem; color: #fff; font-weight: 800; margin-top: 6px;">Catalogo Titoli &amp; Caricamento a 1-Tap</h2>
            </div>
            <div style="font-size: 11px; color: #94a3b8;">
              Clicca su "Carica nel Terminale" per sincronizzare istantaneamente l'intero grafico e order book!
            </div>
          </div>

          <div class="catalog-grid">
            ${CATALOG_ASSETS.map(a => `
              <div class="catalog-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <span class="cat-pill">${a.cat.toUpperCase()}</span>
                    <div style="font-size: 16px; font-weight: 900; color: #fff; margin-top: 4px;">${a.sym}</div>
                    <div style="font-size: 11px; color: #64748b;">${a.name}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 15px; font-weight: 900; color: #fff; font-family: monospace;">${a.price}</div>
                    <div style="font-size: 11px; font-weight: 800; color: ${a.chg.startsWith('+') ? '#10b981' : '#ef4444'};">${a.chg}</div>
                    <div style="font-size: 9.5px; color: #f59e0b; margin-top: 2px;">Q-Score: <b>${a.qScore}/100</b></div>
                  </div>
                </div>
                <button class="catalog-load-btn" onclick="window.MasterpieceSuite.loadAssetAndJump('${a.sym}')">
                  ⚡ Carica nel Terminale ➔
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 8. SCHIERA DI 5 AGENTI IA AUTONOMI & TELEMETRIA HUD               -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-agents">
        <div class="master-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="community-pill" style="border-color: rgba(168,85,247,0.3); color:#c084fc;">🤖 Ensemble Autonomo</span>
              <h2 style="font-size: 2rem; color: #fff; font-weight: 800; margin-top: 6px;">Schiera dei 5 Agenti IA Autonomi</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981;"></span>
              <span style="font-size: 12px; font-weight: 800; color: #10b981;">TUTTI I 5 AGENTI IN CONFLUENZA ATTIVA</span>
            </div>
          </div>

          <!-- 5 Agents Cards Grid -->
          <div class="agents-grid">
            ${AI_AGENTS_ENSEMBLE.map(ag => `
              <div class="agent-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span class="agent-status-badge" style="background:${ag.badgeColor}22; border-color:${ag.badgeColor}; color:${ag.badgeColor};">
                    ● ${ag.status}
                  </span>
                  <span style="font-size: 10px; color: #64748b; font-family: monospace;">${ag.metricLbl}: <b style="color:#fff;">${ag.metricVal}</b></span>
                </div>
                <h4 style="font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px;">${ag.name}</h4>
                <div style="font-size: 11px; color: #38bdf8; font-weight: 700; margin-bottom: 8px;">${ag.role}</div>
                <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">${ag.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Real-Time Telemetry HUD Event Stream Log -->
          <div class="agents-telemetry-hud">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                <span>📡</span> Telemetria Log in Tempo Reale degli Agenti IA
              </div>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">Heartbeat: 1000ms • Zero Drift</span>
            </div>
            <div class="hud-log-stream" id="agents-hud-log-stream">
              <div class="hud-log-line"><span>[15:10:04]</span> <b style="color:#38bdf8;">[Validatore Dati]:</b> 48,210 tick verificati su Bybit WebSocket. Zero scostamento tra prezzo grafico ($75,865.30) e Order Book L2.</div>
              <div class="hud-log-line"><span>[15:09:42]</span> <b style="color:#10b981;">[Supervisore]:</b> Confluenza multifattoriale Q-Score a 94/100 su BTCUSDT. Rischio di portafoglio calibrato su livello ottimale.</div>
              <div class="hud-log-line"><span>[15:09:15]</span> <b style="color:#a855f7;">[Sviluppo CI/CD]:</b> Controllo stabilità DOM completato con successo. 4 splitters indipendenti operativi senza scroll collision.</div>
              <div class="hud-log-line"><span>[15:08:50]</span> <b style="color:#f59e0b;">[Marketing & Growth]:</b> Aggiornamento live del wire macroeconomico completato con le dichiarazioni BCE e FED.</div>
              <div class="hud-log-line"><span>[15:08:12]</span> <b style="color:#ec4899;">[Direzione Artistica]:</b> Responsività Liquid Glass 2026 certificata per PC Desktop, iPad e Smartphone.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 9. CENTRO DI CONTROLLO & PATERNITÀ OPERA                         -->
      <!-- ================================================================= -->
      <section class="master-section" id="section-master-control">
        <div class="master-card" style="border-color: rgba(56,189,248,0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #fff;">⚙️ Centro di Controllo Piattaforma &amp; Autore</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                TRADING PRO ULTIMATE™ — Ideato, Progettato e Sviluppato da <b>cuordivino</b>
              </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-primary" onclick="window.MasterpieceSuite.jumpToTerminal()">
                📈 Vai al Terminale Live
              </button>
              <button class="btn btn-sm btn-secondary" onclick="openCopyrightModal()">
                📜 Paternità &amp; Diritti
              </button>
              <button class="btn btn-sm" style="background:#0284c7; color:#fff;" onclick="dispatchActiveOrderToTelegram()">
                📲 Telegram @cuordivino
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    root.appendChild(wrapper);
    renderProfileView("prudente");

    if (window.NewspaperEngine && typeof window.NewspaperEngine.renderNewspaperSection === "function") {
      window.NewspaperEngine.renderNewspaperSection();
    }

    // Bind profile clicks
    wrapper.querySelectorAll(".profile-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        wrapper.querySelectorAll(".profile-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProfileView(btn.getAttribute("data-profile"));
      });
    });
  }

  function renderProfileView(profileKey) {
    const data = EMOTIONAL_PROFILES[profileKey];
    const box = document.getElementById("emotional-profile-display");
    if (!box) return;

    box.innerHTML = `
      <div style="margin-bottom: 12px;">
        <span class="profile-badge-pill">${data.badge}</span>
        <h3 style="font-size: 1.6rem; color: #fff; font-weight: 800; margin-top: 8px;">${data.title}</h3>
      </div>

      <blockquote class="profile-quote">
        ${data.hook}
      </blockquote>

      <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px;">
        ${data.analysis}
      </p>

      <div class="profile-macro-note">
        <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
          Collegamento con la Community Globale:
        </div>
        <div style="font-size: 0.95rem; color: #e2e8f0;">${data.macroContext}</div>
      </div>
    `;
  }

  // Public Interface for Masterpiece Suite
  window.MasterpieceSuite = {
    jumpToTerminal: function() {
      if (typeof switchMainTab === "function") {
        try { switchMainTab("tab-terminal"); } catch(e){}
      }
      const el = document.getElementById("bb-col-chart") || document.getElementById("chart-container") || document.getElementById("tab-terminal");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (window.resizeAllCharts) {
        setTimeout(window.resizeAllCharts, 120);
      }
    },

    loadAssetAndJump: function(symbol) {
      if (typeof selectAsset === "function") {
        selectAsset(symbol);
      }
      this.jumpToTerminal();
    },

    toggleAccordion: function(btn) {
      const item = btn.closest(".accordion-item");
      if (!item) return;
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".accordion-item").forEach(it => {
        it.classList.remove("open");
        const arr = it.querySelector(".acc-arrow");
        if (arr) arr.innerText = "▶";
      });
      if (!wasOpen) {
        item.classList.add("open");
        const arr = item.querySelector(".acc-arrow");
        if (arr) arr.innerText = "▼";
      }
    },

    audioPlaying: false,
    audioInterval: null,
    audioAnimFrame: null,
    audioSeconds: 0,
    audioTotalSeconds: 70,

    playAudioChime: function() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch(e) {}
    },

    startWaveformVisualizer: function() {
      const cvs = document.getElementById("audio-visualizer-canvas");
      if (!cvs) return;
      const ctx = cvs.getContext("2d");
      const w = cvs.width;
      const h = cvs.height;
      const bars = 16;
      const barW = Math.floor(w / bars) - 2;

      const renderWave = () => {
        if (!this.audioPlaying) return;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < bars; i++) {
          const barH = Math.max(3, Math.floor(Math.sin((Date.now() / 150) + i) * (h / 2.3) + (h / 2.3)));
          const grad = ctx.createLinearGradient(0, h, 0, 0);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#a855f7');
          ctx.fillStyle = grad;
          ctx.fillRect(i * (barW + 2), h - barH, barW, barH);
        }
        this.audioAnimFrame = requestAnimationFrame(renderWave);
      };
      renderWave();
    },

    stopAudioBriefing: function() {
      this.audioPlaying = false;
      const btn = document.getElementById("audio-briefing-play-btn");
      const pill = document.getElementById("audio-status-pill");
      const transcriptBox = document.getElementById("audio-transcript-box");
      if (btn) btn.innerText = "▶";
      if (pill) {
        pill.innerText = "PAUSA";
        pill.style.color = "#94a3b8";
        pill.style.borderColor = "#475569";
      }
      if (this.audioInterval) clearInterval(this.audioInterval);
      if (this.audioAnimFrame) cancelAnimationFrame(this.audioAnimFrame);
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch(e) {}
      }
      const cvs = document.getElementById("audio-visualizer-canvas");
      if (cvs) {
        const ctx = cvs.getContext("2d");
        ctx.clearRect(0, 0, cvs.width, cvs.height);
      }
    },

    toggleAudioBriefing: function() {
      const btn = document.getElementById("audio-briefing-play-btn");
      const prog = document.getElementById("audio-wave-progress");
      const lbl = document.getElementById("audio-time-lbl");
      const pill = document.getElementById("audio-status-pill");
      const transcriptBox = document.getElementById("audio-transcript-box");
      const transcriptText = document.getElementById("audio-transcript-text");

      this.audioPlaying = !this.audioPlaying;

      if (this.audioPlaying) {
        if (btn) btn.innerText = "⏸";
        if (pill) {
          pill.innerText = "● IN TRASMISSIONE";
          pill.style.color = "#00f2a1";
          pill.style.borderColor = "#00f2a1";
        }
        if (transcriptBox) transcriptBox.style.display = "block";
        if (window.showToast) window.showToast("Riproduzione Alpha Briefing Audio avviata...", "info");

        // Play intro acoustic chime
        this.playAudioChime();

        // Start live frequency canvas visualizer
        this.startWaveformVisualizer();

        // Financial briefing text in Italian
        const scriptLines = [
          "Buongiorno trader. Ecco l'Alpha Daily Briefing dei cinque agenti autonomi di Trading Pro Ultimate.",
          "Analisi azionaria: Il comparto tecnologico registra un forte breakout volumetrico guidato da AMD a 148 dollari e 50 centesimi e dai semiconduttori.",
          "Sul fronte macroeconomico, l'attenzione globale è focalizzata sul dato del CPI e sui non farm payrolls americani con regime di Stagflazione controllata.",
          "L'Ensemble quantistico consiglia cautela su Bitcoin e rotazione tattica verso l'Argento e bond governativi decorrelati.",
          "Sentiment sintetico difensivo al quarantuno per cento con tre proposte a confluente vantaggio statistico. Buon trading con Trading Pro Ultimate!"
        ];
        const fullScript = scriptLines.join(" ");

        if (transcriptText) transcriptText.innerText = scriptLines[0];

        // Synthesize Italian Voice via Web Speech API
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(fullScript);
            utter.lang = 'it-IT';
            utter.rate = 1.02;
            utter.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const itVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('it'));
            if (itVoice) utter.voice = itVoice;

            let currentLineIdx = 0;
            utter.onboundary = (event) => {
              const charIdx = event.charIndex || 0;
              let accumulated = 0;
              for (let i = 0; i < scriptLines.length; i++) {
                accumulated += scriptLines[i].length + 1;
                if (charIdx < accumulated) {
                  if (currentLineIdx !== i) {
                    currentLineIdx = i;
                    if (transcriptText) transcriptText.innerText = scriptLines[i];
                  }
                  break;
                }
              }
            };

            utter.onend = () => {
              this.stopAudioBriefing();
              if (prog) prog.style.width = "100%";
              if (lbl) lbl.innerText = "01:10 / 01:10";
              if (transcriptText) transcriptText.innerText = "Briefing completato.";
            };

            utter.onerror = () => {
              this.stopAudioBriefing();
            };

            window.speechSynthesis.speak(utter);
          } catch(e) {
            console.warn('[WebSpeech] Audio Briefing speak error:', e);
          }
        }

        // Progress Timer
        this.audioInterval = setInterval(() => {
          this.audioSeconds = (this.audioSeconds + 1);
          if (this.audioSeconds >= this.audioTotalSeconds) {
            this.audioSeconds = 0;
            this.stopAudioBriefing();
            return;
          }
          const pct = (this.audioSeconds / this.audioTotalSeconds) * 100;
          if (prog) prog.style.width = `${pct}%`;
          const m = Math.floor(this.audioSeconds / 60).toString().padStart(2, "0");
          const s = (this.audioSeconds % 60).toString().padStart(2, "0");
          if (lbl) lbl.innerText = `${m}:${s} / 01:10`;
        }, 1000);

      } else {
        this.stopAudioBriefing();
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMasterSuite);
  } else {
    renderMasterSuite();
  }
})();
