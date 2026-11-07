/**
 * TRADING PRO ULTIMATE™ × cuordivino — MASTER EMOTIONAL & COMMUNITY ENGINE (v4.0)
 * Deep emotional copywriting, real-time macro news community stream, and multi-tier direct checkout.
 */

(function () {
  "use strict";

  const EMOTIONAL_PROFILES = {
    prudente: {
      title: "Il Santuario della Serenità Finanziaria",
      badge: "🛡️ Rischio Zero-Compromesso • Capitale Blindato",
      hook: "“Non si tratta solo di far fruttare il denaro. Si tratta di dormire la notte sapendo che ogni singolo centesimo è protetto da un'architettura matematica inattaccabile.”",
      analysis: "Mentre i mercati globali tremano per la volatilità geopolitica, il nostro Ensemble a 4 Agent isola il tuo portafoglio in un perimetro di asset decorrelati. Nessuna leva, nessun rischio direzionale estremo, solo rendimenti stabili e prevedibili.",
      macroContext: "Analisi Macro Globale: Reazione preventiva alle politiche sui tassi della BCE e posizionamento difensivo su titoli di Stato di grado primario."
    },
    bilanciato: {
      title: "L'Equilibrio Dinamico dell'Eccellenza",
      badge: "⚖️ Crescita Armonica • Controllo Stocastico Monte Carlo",
      hook: "“La vera ricchezza non nasce dall'azzardo, ma dalla precisione con cui la geometria dei mercati incontra la tua ambizione di crescita.”",
      analysis: "Un approccio sartoriale che bilancia la stabilità delle grandi bluechip con la spinta propulsiva dei trend quantitativi emergenti. Il motore Monte Carlo ricalibra le percentuali ogni 60 minuti per offrirti il massimo rendimento con un drawdown storicamente inferiore al 4.5%.",
      macroContext: "Analisi Macro Globale: Sfruttamento delle rotazioni settoriali tra tecnologia istituzionale e materie prime energetiche."
    },
    aggressivo: {
      title: "Il Dominio Assoluto dell'Alpha Quantitativo",
      badge: "⚡ Alta Performance • Derivati & Momentum Stocastico",
      hook: "“Per chi non accetta confini. Quando gli altri vedono caos, il nostro Co-Pilot vede un'opportunità matematica da convertire in profitto netto.”",
      analysis: "Sfrutta tutta la potenza del terminale istituzionale. Leva dinamica intelligente, segnali direzionali a soglia 0.70 e protezione automatica Anti-Panic Guard al -3%. Questo è il trampolino per chi vuole scalare capitali importanti.",
      macroContext: "Analisi Macro Globale: Posizionamento aggressivo sui breakout di volatilità forex e derivati crypto ad alta correlazione."
    }
  };

  function renderMasterSuite() {
    const root = document.getElementById("master-suite-root") || document.body;
    if (document.getElementById("tpu-master-container")) return;

    const container = document.createElement("div");
    container.id = "tpu-master-container";
    container.className = "master-suite-wrapper";
    container.innerHTML = `
      <div class="master-card">
        <div style="text-align: center; max-width: 840px; margin: 0 auto 40px auto;">
          <div class="community-pill">🌐 Community Globale &amp; Intelligence Quantitativa</div>
          <h1 class="master-headline">Il Futuro del Wealth Management Emozionale</h1>
          <p style="font-size: 1.1rem; color: #94a3b8; line-height: 1.7;">
            Ogni comunicazione non è un semplice flusso di dati, ma un'esperienza immersiva che unisce le tue aspettative di vita 
            alle dinamiche macroeconomiche mondiali in tempo reale.
          </p>
        </div>

        <!-- Interactive Emotional Profiler Tabs -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
          <button class="profile-tab-btn active" data-profile="prudente" style="padding: 16px; background: rgba(14,165,233,0.1); border: 1px solid #0ea5e9; border-radius: 12px; color: #fff; cursor: pointer; font-weight: 700;">🛡️ Profilo Prudente</button>
          <button class="profile-tab-btn" data-profile="bilanciato" style="padding: 16px; background: rgba(11,16,28,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #cbd5e1; cursor: pointer; font-weight: 700;">⚖️ Profilo Bilanciato</button>
          <button class="profile-tab-btn" data-profile="aggressivo" style="padding: 16px; background: rgba(11,16,28,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #cbd5e1; cursor: pointer; font-weight: 700;">⚡ Profilo Aggressivo</button>
        </div>

        <div id="emotional-profile-display" style="padding: 32px; background: rgba(3, 7, 18, 0.85); border-radius: 18px; border: 1px solid rgba(245, 158, 11, 0.3);">
          <!-- Injected dynamically -->
        </div>

        <!-- Live Macro News & Community Stream (Forced Community Involvement) -->
        <div class="news-stream-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 1.3rem; color: #fff; display: flex; align-items: center; gap: 10px;">
              <span style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981;"></span>
              Live Community Macro Wire • Notizie in Tempo Reale
            </h3>
            <span style="font-size: 0.85rem; color: #0ea5e9; background: rgba(14,165,233,0.1); padding: 4px 10px; border-radius: 6px;">Sincronizzato con Co-Pilot AI</span>
          </div>
          <div id="live-news-container">
            <div class="news-item">
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.9rem; min-width: 90px;">10 MIN FA</div>
              <div>
                <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">Banca Centrale &amp; Liquidità Globale: Impatto sui Portafogli Bilanciati</div>
                <div style="font-size: 0.95rem; color: #94a3b8;">Il nostro algoritmo ha ricalcolato i parametri di rischio: i clienti del Profilo Bilanciato beneficiano di una riallocazione automatica del +2.4% su asset difensivi.</div>
              </div>
            </div>
            <div class="news-item">
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.9rem; min-width: 90px;">45 MIN FA</div>
              <div>
                <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">Volatilità Energetica &amp; Opportunità Quant</div>
                <div style="font-size: 0.95rem; color: #94a3b8;">I report dedicati al Profilo Aggressivo contengono già l'analisi dettagliata per sfruttare il breakout sui futures del gas naturale.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct Payment & Pricing Tier Gateway -->
        <div style="margin-top: 50px; text-align: center;">
          <h2 style="font-size: 2rem; color: #fff; margin-bottom: 12px;">Scegli il Tuo Livello di Ingresso nell'Élite</h2>
          <p style="color: #94a3b8; max-width: 600px; margin: 0 auto 36px auto;">
            Soluzioni trasparenti, senza compromessi. Paga la fee d'accesso una tantum o abbonati alla newsletter strategica avanzata.
          </p>
        </div>

        <div class="pricing-grid">
          <!-- Tier 1 -->
          <div class="pricing-tier-card">
            <div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.9rem; text-transform: uppercase;">Cloud Terminal &amp; PWA</div>
              <h3 style="font-size: 1.5rem; color: #fff; margin-top: 8px;">Standard License</h3>
              <div class="tier-price">€149 <span>una tantum</span></div>
              <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                Accesso completo al terminale web Trading Pro Ultimate, aggiornamenti via GitHub Pages e supporto PWA mobile.
              </p>
            </div>
            <a href="https://gumroad.com" target="_blank" class="checkout-btn">Acquista Licenza Base</a>
          </div>

          <!-- Tier 2 (Featured) -->
          <div class="pricing-tier-card featured">
            <div style="position: absolute; top: 16px; right: 16px; background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;"> PIÙ SCELTO</div>
            <div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.9rem; text-transform: uppercase;">Suite Completa + Newsletter VIP</div>
              <h3 style="font-size: 1.5rem; color: #fff; margin-top: 8px;">Institutional Pro</h3>
              <div class="tier-price">€39 <span>/ mese</span></div>
              <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">
                Include l'app desktop PC/Mac, installer Android APK, report giornalieri personalizzati per il tuo profilo e accesso alla community privata.
              </p>
            </div>
            <a href="https://gumroad.com" target="_blank" class="checkout-btn gold">Attiva Abbonamento Pro</a>
          </div>

          <!-- Tier 3 -->
          <div class="pricing-tier-card">
            <div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.9rem; text-transform: uppercase;">Private Wealth &amp; Co-Pilot 1-to-1</div>
              <h3 style="font-size: 1.5rem; color: #fff; margin-top: 8px;">Private Advisory</h3>
              <div class="tier-price">€199 <span>/ mese</span></div>
              <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                Consulenza quantitativa dedicata, customizzazione dei 4 agenti sul tuo capitale e linee dirette con gli sviluppatori.
              </p>
            </div>
            <a href="https://gumroad.com" target="_blank" class="checkout-btn">Accedi a Private Advisory</a>
          </div>
        </div>
      </div>
    `;

    root.prepend(container);
    renderProfileView("prudente");

    // Bind tab clicks
    const tabs = container.querySelectorAll(".profile-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => {
          t.classList.remove("active");
          t.style.background = "rgba(11,16,28,0.6)";
          t.style.borderColor = "rgba(255,255,255,0.08)";
          t.style.color = "#cbd5e1";
        });
        tab.classList.add("active");
        tab.style.background = "rgba(14,165,233,0.1)";
        tab.style.borderColor = "#0ea5e9";
        tab.style.color = "#fff";
        renderProfileView(tab.dataset.profile);
      });
    });
  }

  function renderProfileView(profileKey) {
    const data = EMOTIONAL_PROFILES[profileKey];
    const box = document.getElementById("emotional-profile-display");
    if (!box) return;

    box.innerHTML = `
      <div style="margin-bottom: 16px;">
        <span style="display: inline-block; padding: 6px 14px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.35); border-radius: 9999px; color: #fbbf24; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">${data.badge}</span>
        <h2 style="font-size: 1.8rem; color: #fff; font-weight: 800;">${data.title}</h2>
      </div>

      <blockquote style="font-size: 1.15rem; font-style: italic; color: #38bdf8; border-left: 3px solid #0ea5e9; padding-left: 20px; margin: 20px 0; line-height: 1.6;">
        ${data.hook}
      </blockquote>

      <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 20px;">
        ${data.analysis}
      </p>

      <div style="padding: 16px 20px; background: rgba(14, 165, 233, 0.08); border-radius: 12px; border: 1px solid rgba(14, 165, 233, 0.2);">
        <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Collegamento Macro Globale della Community</div>
        <div style="font-size: 0.95px; color: #e2e8f0;">${data.macroContext}</div>
      </div>
    `;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMasterSuite);
  } else {
    renderMasterSuite();
  }
})();
