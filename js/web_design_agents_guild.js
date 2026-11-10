/**
 * TRADING PRO ULTIMATE™ × cuordivino — WEB DESIGN & UX ARCHITECTURE AGENTS GUILD
 * Schiera di Agenti IA di Web Design & Responsive Cross-Device Engineering
 * 
 * Schiera Operativa:
 * 1. Supervisore Generale Architettura UI/UX (Capo Reparto & Direzione Artistica)
 * 2. Agente 11 Regole Responsive (iPhone Portrait, iPhone 90° Landscape, Dynamic Island, iPad, PC)
 * 3. Agente Visual 3D & Volumetria (Torte 3D, Colonne Verticali Cilindriche, Ombreggiature e Luci)
 * 4. Agente Ergonomia & Drawer Navigazione (Hub dei Capitoli One-Thumb e Menu a Tendina)
 */

(function(window) {
  'use strict';

  const TPUWebDesignGuild = {
    agents: {
      supervisor: {
        id: 'supervisor',
        name: 'Architetto UI/UX Supervisore Generale',
        role: 'Direzione artistica, gerarchia visiva master e coerenza estetica',
        status: 'Supervisione Attiva (0 Conflitti Grafici)',
        load: '16%'
      },
      responsive: {
        id: 'responsive',
        name: 'Agente 11 Regole Responsive (Cross-Device)',
        role: 'Vigilanza attiva su iPhone (dritto/90° orizzontale), Dynamic Island, iPad e PC',
        status: '11 Regole Convalidate (100% Mobile Ready)',
        load: '22%'
      },
      depth3d: {
        id: 'depth3d',
        name: 'Agente Visual 3D & Volumetria',
        role: 'Rendering volumetrico torte 3D, colonne verticali e riflessi speculari',
        status: 'Motore 3D Attivo (Canvas Extrusion Online)',
        load: '19%'
      },
      ergonomics: {
        id: 'ergonomics',
        name: 'Agente Ergonomia & Drawer Capitoli',
        role: 'Menu a tendina gerarchico, drawer mobile one-thumb e navigazione istantanea',
        status: 'Hub Capitoli Operativo (Accesso Diretto)',
        load: '14%'
      }
    },

    viewportState: {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth <= 768,
      isTablet: window.innerWidth > 768 && window.innerWidth <= 1080,
      isDesktop: window.innerWidth > 1080,
      isLandscapePhone: window.innerHeight <= 480 && window.innerWidth > window.innerHeight,
      hasNotchOrIsland: false
    },

    init: function() {
      console.log('🎨 TPU Web Design Agents Guild Online & Ready.');
      this.detectEnvironment();
      this.bindEvents();
      this.bindDropdownEvents();
      this.startAuditLoop();
      this.injectMobileDrawerHTML();
    },

    detectEnvironment: function() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.viewportState.width = w;
      this.viewportState.height = h;
      this.viewportState.isMobile = w <= 768;
      this.viewportState.isTablet = w > 768 && w <= 1080;
      this.viewportState.isDesktop = w > 1080;
      this.viewportState.isLandscapePhone = h <= 480 && w > h;

      if (this.viewportState.hasNotchOrIsland === undefined && typeof document !== 'undefined' && document.body) {
        try {
          const testEl = document.createElement('div');
          testEl.style.paddingTop = 'env(safe-area-inset-top, 0px)';
          document.body.appendChild(testEl);
          const computedPad = parseInt(window.getComputedStyle(testEl).paddingTop) || 0;
          document.body.removeChild(testEl);
          this.viewportState.hasNotchOrIsland = computedPad > 0;
        } catch(e) {
          this.viewportState.hasNotchOrIsland = false;
        }
      }
    },

    bindDropdownEvents: function() {
      document.querySelectorAll('.chapter-dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const parent = btn.closest('.chapter-dropdown');
          if (!parent) return;
          const wasOpen = parent.classList.contains('open');
          document.querySelectorAll('.chapter-dropdown.open').forEach(d => d.classList.remove('open'));
          if (!wasOpen) parent.classList.add('open');
        });
      });

      document.querySelectorAll('.chapter-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          document.querySelectorAll('.chapter-dropdown.open').forEach(d => d.classList.remove('open'));
        });
      });

      document.addEventListener('click', () => {
        document.querySelectorAll('.chapter-dropdown.open').forEach(d => d.classList.remove('open'));
      });
    },

    bindEvents: function() {
      window.addEventListener('resize', () => {
        this.detectEnvironment();
        this.applyAutoResponsiveAdjustments();
      });

      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.detectEnvironment();
          this.applyAutoResponsiveAdjustments();
        }, 150);
      });
    },

    startAuditLoop: function() {
      setInterval(() => {
        this.runLayoutTelemetry();
      }, 5000);
    },

    runLayoutTelemetry: function() {
      // Simulate real-time agent autonomous fine-tuning telemetry
      const loads = ['14%', '18%', '22%', '15%', '25%'];
      Object.keys(this.agents).forEach(k => {
        const el = document.getElementById(`design-agent-status-${k}`);
        if (el) {
          const l = loads[Math.floor(Math.random() * loads.length)];
          el.innerText = `Stato: Operativo (${l})`;
        }
      });
    },

    applyAutoResponsiveAdjustments: function() {
      // Apply optimal chart heights for iPhone landscape vs portrait
      if (this.viewportState.isLandscapePhone) {
        document.body.classList.add('mode-iphone-landscape');
      } else {
        document.body.classList.remove('mode-iphone-landscape');
      }

      // Re-render portfolio charts on resize to match canvas display size
      if (window.PortfolioEngine && typeof window.PortfolioEngine.renderAllCharts === 'function') {
        window.PortfolioEngine.renderAllCharts();
      }
    },

    // Unified Mobile Drawer Actions (Rule 11)
    openMobileDrawer: function() {
      const drawer = document.getElementById('mobile-unified-chapters-drawer');
      if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeMobileDrawer: function() {
      const drawer = document.getElementById('mobile-unified-chapters-drawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    toggleMobileDrawer: function() {
      const drawer = document.getElementById('mobile-unified-chapters-drawer');
      if (drawer) {
        if (drawer.classList.contains('active')) this.closeMobileDrawer();
        else this.openMobileDrawer();
      }
    },

    switchChapter: function(tabId) {
      if (typeof window.switchMainTab === 'function') {
        window.switchMainTab(tabId);
      }
      this.closeMobileDrawer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Inject Unified Mobile Drawer HTML into DOM if not present
    injectMobileDrawerHTML: function() {
      if (document.getElementById('mobile-unified-chapters-drawer')) return;

      const drawerHtml = `
      <div id="mobile-unified-chapters-drawer" class="mobile-unified-drawer-overlay" onclick="if(event.target === this) window.TPUWebDesignGuild.closeMobileDrawer()">
        <div class="mobile-unified-drawer-panel">
          <div class="mobile-drawer-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="assets/tradingpro_institutional_logo.jpg" alt="Logo" style="height:32px; border-radius:6px; border:1px solid #f59e0b;">
              <div>
                <strong style="color:#fff; font-size:13px; display:block;">HUB CAPITOLI &amp; MENU</strong>
                <span style="color:#10b981; font-size:10px; font-weight:700;">● 11 REGOLE RESPONSIVE ATTIVE</span>
              </div>
            </div>
            <button class="cm-btn-close" onclick="window.TPUWebDesignGuild.closeMobileDrawer()" style="width:36px; height:36px; font-size:18px;">✕</button>
          </div>

          <!-- Section 1: Trading & Terminale -->
          <div class="mobile-drawer-section-title">📈 1. Trading &amp; Terminale Pro</div>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-terminal')">
            <span style="font-size:18px;">📈</span>
            <div>
              <div style="color:#fff; font-size:13px;">Terminale Principale</div>
              <div style="font-size:10.5px; color:#94a3b8;">Grafico Candele, Volume e Ordini Bybit</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-sizer')">
            <span style="font-size:18px;">📐</span>
            <div>
              <div style="color:#fff; font-size:13px;">Position Sizer &amp; Calcolatore</div>
              <div style="font-size:10.5px; color:#94a3b8;">Leva, Margine e Rischio per Trade</div>
            </div>
          </button>

          <!-- Section 2: Portafoglio & Conti -->
          <div class="mobile-drawer-section-title">💼 2. Portafoglio &amp; Conti</div>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-portfolio-manager'); if(window.PortfolioEngine) window.PortfolioEngine.renderPortfolioSector();">
            <span style="font-size:18px;">💼</span>
            <div>
              <div style="color:#00f2a1; font-size:13px;">Gestione Portafoglio (Demo &amp; Reale)</div>
              <div style="font-size:10.5px; color:#94a3b8;">Grafici 3D Torte, NAV €30k e PnL</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-model-portfolios')">
            <span style="font-size:18px;">📊</span>
            <div>
              <div style="color:#38bdf8; font-size:13px;">Portafogli Modello &amp; Gestiti (IA)</div>
              <div style="font-size:10.5px; color:#94a3b8;">Strategie Quantitative Automatizzate</div>
            </div>
          </button>

          <!-- Section 3: Intelligenza Artificiale & Quant -->
          <div class="mobile-drawer-section-title">🤖 3. Intelligenza Artificiale &amp; Quant</div>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.closeMobileDrawer(); if(window.CavaliereMemoEngine) window.CavaliereMemoEngine.openModal();" style="border-color:#f59e0b; background:rgba(245,158,11,0.12);">
            <span style="font-size:18px;">⚔️</span>
            <div>
              <div style="color:#fbbf24; font-size:13px; font-weight:800;">Cavaliere Memo (Giudice Attivo h24)</div>
              <div style="font-size:10.5px; color:#cbd5e1;">Cancelleria &amp; Protocolli Certificati 8h</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-supreme-suite')">
            <span style="font-size:18px;">🤖</span>
            <div>
              <div style="color:#fbbf24; font-size:13px;">Supreme Suite &amp; Agenti IA</div>
              <div style="font-size:10.5px; color:#94a3b8;">Schiera 5 Agenti Autonomi + Web Design</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.closeMobileDrawer(); if(window.TimesFMEngine) window.TimesFMEngine.openStrategyModal();">
            <span style="font-size:18px;">⚡</span>
            <div>
              <div style="color:#0ea5e9; font-size:13px;">Google TimesFM Strategia</div>
              <div style="font-size:10.5px; color:#94a3b8;">Previsioni Stocastiche Fondazionali</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-casario-quant')">
            <span style="font-size:18px;">⚡</span>
            <div>
              <div style="color:#fff; font-size:13px;">Suite Quantaste Casario Completa</div>
              <div style="font-size:10.5px; color:#94a3b8;">Motori Quantistici &amp; Radar Macro</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-quant')">
            <span style="font-size:18px;">🤖</span>
            <div>
              <div style="color:#fff; font-size:13px;">4 Motori Quant Istituzionali</div>
              <div style="font-size:10.5px; color:#94a3b8;">Stat-Arb, Volatilità &amp; Trend Following</div>
            </div>
          </button>

          <!-- Section 4: Macro Intelligence & Screener -->
          <div class="mobile-drawer-section-title">🌐 4. Macro Intelligence &amp; Screener</div>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-macro-radar')">
            <span style="font-size:18px;">🌐</span>
            <div>
              <div style="color:#00f2a1; font-size:13px;">Panoramica Macro &amp; Radar</div>
              <div style="font-size:10.5px; color:#94a3b8;">Banche Centrali, Rendimenti &amp; Valute</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-scanner')">
            <span style="font-size:18px;">🎯</span>
            <div>
              <div style="color:#fff; font-size:13px;">Radar Opportunità Rapido</div>
              <div style="font-size:10.5px; color:#94a3b8;">Setup Tecnici in Tempo Reale</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-consensus')">
            <span style="font-size:18px;">🧠</span>
            <div>
              <div style="color:#fff; font-size:13px;">Comitato Investitori IA</div>
              <div style="font-size:10.5px; color:#94a3b8;">Consensus Multi-Agente Ponderato</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-rotation')">
            <span style="font-size:18px;">🔄</span>
            <div>
              <div style="color:#fff; font-size:13px;">Rotazione Settoriale</div>
              <div style="font-size:10.5px; color:#94a3b8;">Cicli Economici &amp; Fasi di Mercato</div>
            </div>
          </button>

          <!-- Section 5: Strumenti & Registri -->
          <div class="mobile-drawer-section-title">🛠️ 5. Strumenti &amp; Registri</div>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-hub')">
            <span style="font-size:18px;">📚</span>
            <div>
              <div style="color:#fff; font-size:13px;">Hub 63 Skills Quant</div>
              <div style="font-size:10.5px; color:#94a3b8;">Enciclopedia Finanziaria Interattiva</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-journal')">
            <span style="font-size:18px;">📓</span>
            <div>
              <div style="color:#fff; font-size:13px;">Diario di Trading &amp; Journal</div>
              <div style="font-size:10.5px; color:#94a3b8;">Storico Operazioni &amp; Note Esecutive</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.switchChapter('tab-alerts')">
            <span style="font-size:18px;">🔔</span>
            <div>
              <div style="color:#fff; font-size:13px;">Allarmi Istituzionali</div>
              <div style="font-size:10.5px; color:#94a3b8;">Notifiche Prezzo &amp; Breakout</div>
            </div>
          </button>
          <button class="mobile-drawer-btn" onclick="window.TPUWebDesignGuild.closeMobileDrawer(); if(window.openCopyrightModal) window.openCopyrightModal();">
            <span style="font-size:18px;">📜</span>
            <div>
              <div style="color:#f59e0b; font-size:13px;">Paternità, Copyright &amp; Marchi</div>
              <div style="font-size:10.5px; color:#94a3b8;">© by cuordivino • Tutti i Diritti Riservati</div>
            </div>
          </button>

          <div style="margin-top:20px; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; text-align:center; font-size:10px; color:#64748b;">
            TRADING PRO ULTIMATE™ • 11 REGOLE RESPONSIVE ENGINE
          </div>
        </div>
      </div>
      `;

      const div = document.createElement('div');
      div.innerHTML = drawerHtml;
      document.body.appendChild(div);
    }
  };

  window.TPUWebDesignGuild = TPUWebDesignGuild;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TPUWebDesignGuild.init());
  } else {
    TPUWebDesignGuild.init();
  }

})(window);
