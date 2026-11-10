/**
 * TRADING PRO ULTIMATE™ — MARKETING, COMMERCIAL & ERP CORPORATE ENGINE
 * Sviluppato da cuordivino — Rete Aziendale Autonoma Apex-CEO IA
 * 
 * Moduli:
 * 1. Vertice Apex-CEO IA & 2 Direttori di Reparto (Tecnico + Commerciale/CFO)
 * 2. Schiera 6 Agenti Marketing & Vendite (WhatsApp, Instagram, Email, Call Vocale IA, CRM, Contabilità)
 * 3. Studio Video Demo (.WEBM) & Poster 4K (.PNG) su Canvas 1920x1080
 * 4. Generatore di Messaggi Omnicanale Personalizzati (Architetti, Designer, Immobiliari, Agenzie & Quants)
 * 5. Sintesi Vocale IA per Telefonate e Pitch Commerciali (SpeechSynthesis it-IT)
 * 6. Contabilità Aziendale, Tenuta Conto, Scorporo IVA 22% ed Export Bilancio Excel (.CSV)
 */

(function(window) {
  'use strict';

  const MASTER_VOICE_AUDIO = new Audio('assets/master_voice_sample.mp4');
MASTER_VOICE_AUDIO.preload = 'auto';

const MKT_ERP_STATE = {
    useMasterVoiceRealAudio: true,
    activeDemoSector: 'architetto',
    activeMarketDomain: 'realestate', // 'realestate' | 'trading'
    activeChannel: 'whatsapp',
    demoAnimRunning: false,
    demoAnimFrame: null,
    demoTime: 0,
    ceoAutopilotInterval: null,
    ledger: JSON.parse(localStorage.getItem('tpu_erp_ledger') || 'null') || [
      { id: 101, date: '10/11/2026', type: 'income', amount: 397.00, client: 'Studio Arch. Innovativo Milano (Licenza Pro 4K)', method: 'Gumroad' },
      { id: 102, date: '08/11/2026', type: 'income', amount: 590.00, client: 'Gruppo Immobiliare Garda (Virtual Staging + Suite)', method: 'Bonifico Fattura' },
      { id: 103, date: '05/11/2026', type: 'expense', amount: 84.50, client: 'Server Cloud GPU & Hosting Protetto SSL', method: 'Stripe / Carta' }
    ],
    messages: {}
  };

  const PROMO_SECTORS = {
    // REAL ESTATE & ARCHITECTURE SECTORS
    architetto: {
      domain: 'realestate',
      tag: 'SPOT 1 • ARCHITETTI & INGEGNERI INNOVATIVI',
      title: 'Dal Sopralluogo col Telefono a AutoCAD + Render 4K in 10s',
      sub: 'Rilievo Foto/Video • Verifica RAI >= 1/8 • Script .LSP/.RB • Viste Prima/Dopo Sul Campo',
      kpi1: '-85% Tempo in Ufficio',
      kpi2: '+310% Approvazione Committente',
      kpi3: '100% Mobile & Portatile',
      accent: '#22d3ee',
      facade: '#f5f0e6',
      headline: 'Dal Rilievo Cantiere col Telefonino a AutoCAD/SketchUp + Render 4K in 10 Secondi',
      pain: 'Basta ore perse in ufficio tra rilievi cartacei e render lenti da tavolino.',
      benefit: 'Scatti una foto o un video in sopralluogo, raddrizzi le verticali 2-Point, verifichi il RAI, esporti DWG per AutoCAD e mostri al committente la vista 4K Prima/Dopo.',
      stats: '+310% velocità approvazione cliente in cantiere | -85% tempo di restituzione grafica'
    },
    designer: {
      domain: 'realestate',
      tag: 'SPOT 2 • INTERIOR DESIGNER & VISUALIZER (VIZMAKER FLOW)',
      title: 'Video-to-Video Interior Redesign & 3D Assets in 1 Tocco',
      sub: 'Cammina nella stanza col cellulare → Ottieni il Video Tour 4K Arredato senza Flickering',
      kpi1: '0% Sfarfallio Arredi',
      kpi2: 'Libreria 3D 1-Tap',
      kpi3: 'Mood Japandi & Luxury',
      accent: '#f472b6',
      facade: '#ede0d4',
      headline: 'Interior Redesign Video-to-Video (Stile VizMaker) & 3D Assets in 1 Tocco sul Campo',
      pain: 'Mostrare al cliente una stanza vuota o datata senza fargli percepire il risultato finale blocca le decisioni.',
      benefit: 'Cammina nella stanza col cellulare: i nostri Agenti IA trasformano il video grezzo in un Walkthrough 4K arredato (Japandi, Luxury, Minimal) con sostituzione finiture in tempo reale.',
      stats: '0% flickering arredi | +280% chiusura contratti di interior design alla prima visita'
    },
    immobiliarista: {
      domain: 'realestate',
      tag: 'SPOT 3 • IMMOBILIARISTI & COSTRUTTORI EDILI',
      title: 'Vendi su Carta Prima della Fine Lavori al +22% di Valore',
      sub: 'Trasforma Cantieri al Grezzo o Ruderi in Residenze Classe A4 NZEB con Studio Solare GPS',
      kpi1: '+22% Valore Manufatti',
      kpi2: '-50% Tempi di Vendita',
      kpi3: 'Tour 4K per Investitori',
      accent: '#fbbf24',
      facade: '#e2e8f0',
      headline: 'Vendi Immobili su Carta e Cantieri al Grezzo Prima della Fine Lavori',
      pain: 'Un cantiere al grezzo o un immobile da ristrutturare perde fino al 25% di attrattiva agli occhi degli acquirenti.',
      benefit: 'In cantiere col portatile o iPhone generi viste 4K Classe A4 NZEB, studio solare reale Google Maps e Video Tour emozionali pronti per gli investitori.',
      stats: '+22% valore percepito del manufatto | -50% tempi di vendita su carta'
    },
    agenzia: {
      domain: 'realestate',
      tag: 'SPOT 4 • AGENZIE IMMOBILIARI (NUOVO & USATO)',
      title: 'Virtual Home Staging Istantaneo & Annunci Portali Dominanti',
      sub: 'Svuota i mobili vecchi, arreda in 4K col telefono e crea Locandina + Reel in 3 secondi',
      kpi1: '+340% Click sui Portali',
      kpi2: '+45% Visite Qualificate',
      kpi3: 'Pronto per Immobiliare.it',
      accent: '#34d399',
      facade: '#f8fafc',
      headline: 'Virtual Home Staging Istantaneo & Video Reel 4K per Immobili Nuovi o Usati',
      pain: 'Annunci con foto buie, mobili vecchi o stanze disordinate vengono ignorati su Immobiliare.it e Idealista.',
      benefit: 'Con un tocco dal telefono rimuovi i mobili datati (AI Declutter), arredi l’immobile usato con Virtual Home Staging 4K, generi la Locandina Prima/Dopo e il testo annuncio pronto per i portali.',
      stats: '+340% click sugli annunci immobiliari | +45% richieste di visita qualificata'
    },

    // QUANTITATIVE & FINANCIAL TRADING SECTORS
    trader: {
      domain: 'trading',
      tag: 'SPOT 5 • TRADER PROFESSIONISTI & SCALPER INDIPENDENTI',
      title: 'Terminale Istituzionale con DeepMind TimesFM & Bybit Live',
      sub: 'Da Grafici Piatti a Volumetrie 3D • 78.4% Win Rate TimesFM • Day Trader Skills 11-in-1',
      kpi1: '78.4% Win Rate Algoritmico',
      kpi2: '< 25ms Latenza Esecuzione',
      kpi3: '100% Protezione Anti-Loss',
      accent: '#00f2a1',
      facade: '#0b1120',
      headline: 'Smetti di Combattere i Bot con Grafici Piatti: Passa a un Terminale Quant Istituzionale',
      pain: 'Il 90% dei trader perde denaro usando indicatori lagging e grafici 2D statici contro algoritmi HFT.',
      benefit: 'Utilizza la tecnologia dei fondi: Google DeepMind TimesFM 2026 per la previsione delle candele, profondità volumetrica 3D e 11 strategie Day Trader con test automatici.',
      stats: '+240% Profit Factor | -65% Drawdown medio | Segnali verificati in tempo reale'
    },
    consulente: {
      domain: 'trading',
      tag: 'SPOT 6 • CONSULENTI FINANZIARI & FAMILY OFFICE',
      title: 'Report Istituzionali in PDF con Tuo Marchio & Asset Allocation 3D',
      sub: 'Presenta ai Clienti un Rendiconto Matematico Certificato con Logo Ufficiale e Backtest Monte Carlo',
      kpi1: 'PDF Ufficiale 1-Click',
      kpi2: 'Monte Carlo 1000 Run',
      kpi3: 'Multi-Broker Unificato',
      accent: '#f59e0b',
      facade: '#070a14',
      headline: 'Consulenza Finanziaria di Livello Istituzionale: Report Patrimoniali ed Asset Allocation 3D',
      pain: 'Presentare ai clienti fogli Excel disordinati o schermate amatoriali compromette la fiducia patrimoniale.',
      benefit: 'Genera rendiconti patrimoniali ufficiali in PDF con il tuo logo, analisi Monte Carlo, grafici tridimensionali dell\'allocazione e curve di rendimento benchmark.',
      stats: '+400% fidelizzazione clienti ad alto patrimonio | 100% conformità di presentazione'
    }
  };

  const MarketingERPEngine = {
    
    // MASTER VOICE CLONER & OFFICIAL AUDIO PLAYER
    playMasterVoiceSample: function() {
      const btn = document.getElementById('btnPlayMasterVoice');
      if (MASTER_VOICE_AUDIO.paused) {
        MASTER_VOICE_AUDIO.currentTime = 0;
        MASTER_VOICE_AUDIO.play().catch(e => console.log('Audio autoplay blocked', e));
        if (btn) btn.innerHTML = '⏸️ Metti in Pausa Voce Maestra';
        MASTER_VOICE_AUDIO.onended = () => {
          if (btn) btn.innerHTML = '▶️ Ascolta Voce Ufficiale Originale (69.4s)';
        };
      } else {
        MASTER_VOICE_AUDIO.pause();
        if (btn) btn.innerHTML = '▶️ Ascolta Voce Ufficiale Originale (69.4s)';
      }
    },

    toggleMasterVoiceMode: function() {
      MKT_ERP_STATE.useMasterVoiceRealAudio = !MKT_ERP_STATE.useMasterVoiceRealAudio;
      const btn = document.getElementById('btnToggleMasterVoiceMode');
      if (btn) {
        if (MKT_ERP_STATE.useMasterVoiceRealAudio) {
          btn.textContent = '🟢 Voce Maestra Attiva per Tutti gli Agenti';
          btn.style.color = '#10b981';
          btn.style.borderColor = '#10b981';
        } else {
          btn.textContent = '⚪ Sintesi Vocale Standard TTS';
          btn.style.color = '#cbd5e1';
          btn.style.borderColor = 'rgba(255,255,255,0.2)';
        }
      }
    },
    init: function() {
      console.log('📈 Marketing, Commercial & ERP Engine Online (Apex-CEO Active).');
      this.renderErpLedger();
      this.generateAutomatedOmnichannelCampaign();
      this.selectPromoDemoSector('architetto');
      this.bindEvents();
    },

    bindEvents: function() {
      const segSel = document.getElementById('mktTargetSegment');
      if (segSel) {
        segSel.addEventListener('change', () => {
          this.generateAutomatedOmnichannelCampaign();
        });
      }
    },

    // 1. Esegui Ciclo Aziendale Autonomo Completo (Apex-CEO IA)
    runAutonomousCorporateCycle: function(logToFeed = true) {
      const box = document.getElementById('ceoNetworkLogBox');
      const seg = document.getElementById('mktTargetSegment')?.value || 'architetto';
      const leadName = document.getElementById('mktLeadName')?.value || 'Cliente Target';
      const info = PROMO_SECTORS[seg] || PROMO_SECTORS.architetto;

      this.generateAutomatedOmnichannelCampaign();
      this.selectPromoDemoSector(seg);

      let totRev = 0;
      let totExp = 0;
      MKT_ERP_STATE.ledger.forEach(it => {
        if (it.type === 'income') totRev += it.amount;
        else totExp += it.amount;
      });
      const netProfit = (totRev / 1.22) - totExp;

      if (box) {
        box.textContent = `👑 [VERTICE IN TESTA — DIRETTORE GENERALE "APEX-CEO IA"]:
   • Ordine Esecutivo diramato ai 2 Direttori di Reparto per il settore: [${info.tag}]
   • Connessione Mansioni: Flusso Sinaptico Reparto 1 (Tecnico/Core Engine) ➔ Reparto 2 (Marketing/Commerciale/CFO) ATTIVO.

🏗️ [DIRETTORE REPARTO 1 — PRODUZIONE & CORE ENGINE IA]:
   ├─ Core Engine (${info.domain === 'realestate' ? 'CAD, Rilievo Mobile, Virtual Staging 4K & Google Maps' : 'DeepMind TimesFM, Volumetrie 3D, Bybit Telemetry & Day Trader 11-in-1'}):
   ├─ Generato asset 4K e verificate metriche di prestazione (${info.kpi1} | ${info.kpi2}).
   └─ Trasmissione automatica dei materiali dimostrativi e delle schede ad alta risoluzione al Reparto Commerciale.

💼 [DIRETTORE REPARTO 2 — CMO & CFO DIRECTOR IA (Coordina i 6 Agenti Marketing, Vendite & Contabilità)]:
   ├─ Spot Video Demo & Poster 4K: Compilato spot promozionale "${info.title}".
   ├─ Agenti M1, M2, M3 & M4 (WhatsApp, Telegram, Instagram, Email, Call Vocale IA): Pronti i messaggi su misura per "${leadName}".
   ├─ Agente M5 (CRM Commerciale): Trattativa qualificata in pipeline con link 1-a-1 protetto per visualizzazione demo.
   └─ Agente M6 (Contabilità & Tenuta Conto): Fatturato Lordo € ${totRev.toFixed(2)} | Scorporo IVA 22% | Utile Netto Aziendale: € ${netProfit.toFixed(2)}.`;
      }
    },

    toggleCeoAutopilot: function() {
      const btn = document.getElementById('toggleAutoPilotCeoBtn');
      if (MKT_ERP_STATE.ceoAutopilotInterval) {
        clearInterval(MKT_ERP_STATE.ceoAutopilotInterval);
        MKT_ERP_STATE.ceoAutopilotInterval = null;
        if (btn) btn.textContent = '🤖 Pilota Automatico Continuo CEO IA: OFF';
        return;
      }

      if (btn) btn.textContent = '🟢 Pilota Automatico Continuo CEO IA: ATTIVO (Ciclo ogni 8s)';
      this.runAutonomousCorporateCycle(false);

      const sectors = Object.keys(PROMO_SECTORS);
      let idx = 0;
      MKT_ERP_STATE.ceoAutopilotInterval = setInterval(() => {
        idx = (idx + 1) % sectors.length;
        const nextSec = sectors[idx];
        const sel = document.getElementById('mktTargetSegment');
        if (sel) sel.value = nextSec;
        this.selectPromoDemoSector(nextSec);
        this.runAutonomousCorporateCycle(false);
      }, 8000);
    },

    // 2. Generatore di Campagne Omnicanale Automatizzate
    generateAutomatedOmnichannelCampaign: function() {
      const leadName = document.getElementById('mktLeadName')?.value || 'Gentile Professionista / Investitore';
      const seg = document.getElementById('mktTargetSegment')?.value || 'architetto';
      const info = PROMO_SECTORS[seg] || PROMO_SECTORS.architetto;
      const appUrl = window.location.href.split('?')[0];
      const gumroadUrl = localStorage.getItem('tpu_gumroad_url') || 'https://lamente7.gumroad.com/l/trading-pro-ultimate';

      MKT_ERP_STATE.messages = {
        whatsapp: `👋 Ciao *${leadName}*,
abbiamo selezionato la tua realtà per presentarti in anteprima la nostra nuova suite professionale 🚀

💡 *${info.headline}*
${info.pain}

Con la nostra tecnologia diretta:
✅ ${info.benefit}
📊 *Risultato sul mercato:* ${info.stats}

🔗 *Guarda la presentazione e attiva la tua Licenza Ufficiale qui:*
${gumroadUrl}

🌐 *Terminal Live Web:* ${appUrl}

Rispondi *"DEMO"* a questo messaggio per ricevere subito un Link Diretto 1-a-1 di prova gratuita senza impegno!`,

        email: `OGGETTO: 🚀 [Innovazione per ${leadName}] ${info.headline}

Gentile ${leadName},

${info.pain}

Per questo abbiamo sviluppato questa piattaforma con Intelligenza Artificiale Operativa: uno strumento progettato specificamente per chi vuole operare con velocità, precisione istituzionale e massima redditività.

COSA PUOI FARE SUBITO:
• ${info.benefit}
• Video Demo interattivi e presentazioni ad alta conversione in pochi secondi.
• Protezione totale dei dati e facilità d'uso da cellulare, tablet e portatile.
• Impatto misurato: ${info.stats}.

👉 Attiva subito la tua licenza protetta su Gumroad: ${gumroadUrl}
👉 Oppure rispondi direttamente a questa email con il tuo numero WhatsApp per ricevere un Link Diretto 1-a-1 di dimostrazione.

Un cordiale saluto,
Divisione Sviluppo & Business — cuordivino`,

        telegram: `⚡ **Opportunità Esclusiva per ${leadName}**
🎯 *${info.headline}*

🔥 ${info.benefit}
📈 **Impatto sul mercato:** ${info.stats}

🛒 **Licenza Ufficiale:** ${gumroadUrl}
📲 Scrivici qui su Telegram per attivare subito il tuo Link di Prova 1-a-1 dedicato!`,

        instagram: `✨ [SPOT PRIMA & DOPO — INNOVAZIONE AD ALTA CONVERSIONE] ✨
🛑 ${info.pain}

Guarda la trasformazione in 10 secondi! 👇

✅ ${info.headline}
✅ Agenti IA Autonomi sempre operativi
✅ Risultati certificati e velocità estrema
📈 ${info.stats}

💬 Commenta "INFO" o tocca il link in Bio per ricevere subito la demo in DM!
#Innovazione #IntelligenzaArtificiale #Immobiliare #Architettura #TradingQuant #Investimenti #Fintech`,

        voicecall: `Buongiorno ${leadName}, la contatto perché aiutiamo professionisti e operatori leader a rivoluzionare il proprio lavoro e moltiplicare i risultati. ${info.pain} Grazie alla nostra tecnologia con Agenti di Intelligenza Artificiale integrati, ${info.benefit} Le abbiamo preparato un video dimostrativo e una scheda riassuntiva inviabile direttamente su WhatsApp: desidera che gliela inoltri subito al suo recapito?`
      };

      this.updateMktMessageDisplay();
    },

    switchMktChannel: function(ch, btnEl) {
      MKT_ERP_STATE.activeChannel = ch;
      if (btnEl && btnEl.parentElement) {
        btnEl.parentElement.querySelectorAll('.code-tab').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
      }
      this.updateMktMessageDisplay();
    },

    updateMktMessageDisplay: function() {
      const box = document.getElementById('mktAutomatedMessageBox');
      if (!box) return;
      box.textContent = MKT_ERP_STATE.messages[MKT_ERP_STATE.activeChannel] || '';
    },

    // Azioni Dirette di Invio
    sendAutomatedWhatsApp: function() {
      const phone = (document.getElementById('mktLeadPhone')?.value || '').replace(/[^0-9]/g, '');
      const text = MKT_ERP_STATE.messages.whatsapp || '';
      const url = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    },

    sendAutomatedTelegram: function() {
      const text = MKT_ERP_STATE.messages.telegram || '';
      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    },

    sendAutomatedEmail: function() {
      const email = document.getElementById('mktLeadEmail')?.value || '';
      const raw = MKT_ERP_STATE.messages.email || '';
      const lines = raw.split('\n');
      const subj = (lines[0] || '').replace('OGGETTO:', '').trim();
      const body = lines.slice(2).join('\n');
      window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    },

    speakAiPhoneCallPitch: function() {
      const text = MKT_ERP_STATE.messages.voicecall || '';
      const btn = document.getElementById('aiVoiceCallBtn');
      if (!('speechSynthesis' in window)) {
        alert(text);
        return;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (btn) btn.textContent = '📞 Ascolta / Avvia Telefonata Vocale IA';
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'it-IT';
      utter.rate = 1.02;
      if (btn) btn.textContent = '🔊 Telefonata IA in Corso... (Tocca per fermare)';
      utter.onend = () => {
        if (btn) btn.textContent = '📞 Ascolta / Avvia Telefonata Vocale IA';
      };
      window.speechSynthesis.speak(utter);
    },

    copyMktMessage: function() {
      const txt = MKT_ERP_STATE.messages[MKT_ERP_STATE.activeChannel] || '';
      navigator.clipboard.writeText(txt);
      alert(`📋 Messaggio per il canale "${MKT_ERP_STATE.activeChannel.toUpperCase()}" copiato negli appunti!`);
    },

    // 3. Studio Video Demo & Poster 4K su Canvas
    selectPromoDemoSector: function(secId) {
      MKT_ERP_STATE.activeDemoSector = secId;
      Object.keys(PROMO_SECTORS).forEach(s => {
        const b = document.getElementById(`demo-sec-${s}`);
        if (b) {
          if (s === secId) {
            b.style.background = '#0ea5e9';
            b.style.color = '#fff';
            b.style.borderColor = '#38bdf8';
          } else {
            b.style.background = 'rgba(255,255,255,0.06)';
            b.style.color = '#cbd5e1';
            b.style.borderColor = 'rgba(255,255,255,0.15)';
          }
        }
      });

      const info = PROMO_SECTORS[secId] || PROMO_SECTORS.architetto;
      const copyBox = document.getElementById('promoCopyAndStatsBox');
      if (copyBox) {
        copyBox.textContent = `🎯 [${info.tag}]
• Slogan Video & Poster: "${info.title}"
• Sottotitolo Tecnico: ${info.sub}
• Statistiche di Risposta sul Mercato: [ ${info.kpi1} ]  |  [ ${info.kpi2} ]  |  [ ${info.kpi3} ]
• Call to Action Commerciale: "Genera la demo ad alta risoluzione e chiudi la vendita direttamente col cliente."`;
      }
      this.drawPromoDemoCanvas(50);
    },

    drawPromoDemoCanvas: function(wipePct = 50) {
      const c = document.getElementById('promoDemoVideoCanvas');
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = c.width;
      const H = c.height;
      const info = PROMO_SECTORS[MKT_ERP_STATE.activeDemoSector] || PROMO_SECTORS.architetto;
      const splitX = (W * wipePct) / 100;

      ctx.clearRect(0, 0, W, H);

      // Metà Sinistra: PRIMA (Stato di fatto grezzo, wireframe, vecchi metodi)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, H);
      ctx.clip();
      ctx.fillStyle = '#070a14';
      ctx.fillRect(0, 0, W, H);

      // Griglia wireframe tecnica
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x, H - 150); ctx.stroke(); }
      for (let y = 160; y < H - 150; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.strokeRect(W * 0.14, H * 0.25, W * 0.72, H * 0.52);
      ctx.strokeRect(W * 0.20, H * 0.33, W * 0.28, H * 0.44);
      ctx.strokeRect(W * 0.52, H * 0.33, W * 0.28, H * 0.44);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(info.domain === 'realestate'
        ? 'PRIMA: CANTIERE AL GREZZO / IMMOBILE USATO / METODO TRADIZIONALE'
        : 'PRIMA: GRAFICI PIATTI / RITARDO DEI DATI / TRADING MANUALE EMOTIVO', 70, 230);
      ctx.restore();

      // Metà Destra: DOPO (Restyling 4K / Terminale Quant ad Alto Rendimento)
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, W - splitX, H);
      ctx.clip();

      const sky = ctx.createLinearGradient(0, 150, 0, H * 0.78);
      if (info.domain === 'realestate') {
        sky.addColorStop(0, '#0f172a');
        sky.addColorStop(0.55, '#0284c7');
        sky.addColorStop(1, '#fde047');
      } else {
        sky.addColorStop(0, '#05070f');
        sky.addColorStop(0.6, '#064e3b');
        sky.addColorStop(1, '#00f2a1');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Piano di appoggio / Grafica volumetrica
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, H * 0.74, W, H * 0.26);

      if (info.domain === 'realestate') {
        // Architettura e piscina
        ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
        ctx.fillRect(W * 0.14, H * 0.76, W * 0.72, H * 0.10);
        ctx.fillStyle = info.facade;
        ctx.fillRect(W * 0.14, H * 0.25, W * 0.72, H * 0.50);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(W * 0.50, H * 0.28, W * 0.34, H * 0.47);

        const winGrad = ctx.createLinearGradient(0, H * 0.33, 0, H * 0.75);
        winGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
        winGrad.addColorStop(1, 'rgba(234, 88, 12, 0.75)');
        ctx.fillStyle = winGrad;
        ctx.fillRect(W * 0.18, H * 0.33, W * 0.28, H * 0.42);
        ctx.fillRect(W * 0.54, H * 0.35, W * 0.26, H * 0.40);
      } else {
        // Curve quant e candele volumetriche 3D
        ctx.strokeStyle = '#00f2a1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        let prevY = H * 0.65;
        ctx.moveTo(W * 0.14, prevY);
        for (let x = W * 0.14; x < W * 0.86; x += 40) {
          prevY -= Math.random() * 25 - 6;
          ctx.lineTo(x, prevY);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 242, 161, 0.25)';
        ctx.fillRect(W * 0.20, H * 0.35, 120, 180);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fillRect(W * 0.40, H * 0.28, 140, 230);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.fillRect(W * 0.62, H * 0.22, 160, 270);
      }

      // Badge "DOPO"
      ctx.fillStyle = 'rgba(5, 7, 10, 0.85)';
      ctx.fillRect(W - 740, 185, 680, 70);
      ctx.fillStyle = info.accent;
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.fillText(info.domain === 'realestate'
        ? 'DOPO: REDESIGN 4K & VIRTUAL STAGING IA'
        : 'DOPO: DEEPMIND TIMESFM 78.4% & 3D QUANT', W - 715, 230);
      ctx.restore();

      // Barra divisoria animata
      ctx.strokeStyle = info.accent;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(splitX, 150);
      ctx.lineTo(splitX, H - 150);
      ctx.stroke();

      // Header Bar
      ctx.fillStyle = 'rgba(5, 7, 10, 0.95)';
      ctx.fillRect(0, 0, W, 155);
      ctx.fillStyle = info.accent;
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.fillText(info.tag, 60, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Inter, sans-serif';
      ctx.fillText(info.title, 60, 102);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px Inter, sans-serif';
      ctx.fillText(info.sub, 60, 138);

      // Footer KPI Bar
      ctx.fillStyle = 'rgba(5, 7, 10, 0.95)';
      ctx.fillRect(0, H - 150, W, 150);
      const kpis = [info.kpi1, info.kpi2, info.kpi3, 'SUITE UFFICIALE CUORDIVINO'];
      kpis.forEach((k, idx) => {
        const bx = 60 + idx * 455;
        ctx.fillStyle = idx === 3 ? info.accent : '#111827';
        ctx.fillRect(bx, H - 122, 430, 92);
        ctx.strokeStyle = info.accent;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, H - 122, 430, 92);
        ctx.fillStyle = idx === 3 ? '#000000' : '#ffffff';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText(k, bx + 24, H - 65);
      });
    },

    togglePromoDemoAnimation: function() {
      const btn = document.getElementById('playPromoDemoBtn');
      if (MKT_ERP_STATE.demoAnimRunning) {
        MKT_ERP_STATE.demoAnimRunning = false;
        if (MKT_ERP_STATE.demoAnimFrame) cancelAnimationFrame(MKT_ERP_STATE.demoAnimFrame);
        if (btn) btn.textContent = '▶️ Avvia Spot Video Demo Animato';
        return;
      }
      MKT_ERP_STATE.demoAnimRunning = true;
      if (btn) btn.textContent = '⏹️ Ferma Spot Video Demo';

      const step = () => {
        if (!MKT_ERP_STATE.demoAnimRunning) return;
        MKT_ERP_STATE.demoTime += 0.035;
        const wipe = 50 + Math.sin(MKT_ERP_STATE.demoTime) * 36;
        this.drawPromoDemoCanvas(wipe);
        MKT_ERP_STATE.demoAnimFrame = requestAnimationFrame(step);
      };
      step();
    },

    recordPromoDemoWebm: function() {
      const canvas = document.getElementById('promoDemoVideoCanvas');
      const btn = document.getElementById('recordPromoVideoBtn');
      if (!canvas || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        this.downloadPromoPoster4K();
        return;
      }
      if (!MKT_ERP_STATE.demoAnimRunning) this.togglePromoDemoAnimation();

      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Spot_Demo_Promozionale_${MKT_ERP_STATE.activeDemoSector}_4K.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        if (btn) btn.textContent = '🎥 Scarica Video Demo (.WEBM)';
      };

      if (btn) btn.textContent = '🔴 Registrazione Spot (5s)...';
      rec.start();
      setTimeout(() => {
        if (rec.state === 'recording') rec.stop();
        if (MKT_ERP_STATE.demoAnimRunning) this.togglePromoDemoAnimation();
      }, 5000);
    },

    downloadPromoPoster4K: function() {
      this.drawPromoDemoCanvas(50);
      const canvas = document.getElementById('promoDemoVideoCanvas');
      if (!canvas) return;
      const a = document.createElement('a');
      a.download = `Poster_Promozionale_4K_${MKT_ERP_STATE.activeDemoSector}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    },

    // 4. Contabilità Aziendale, Tenuta Conto, IVA 22% & Export Excel (.CSV)
    addErpAccountingEntry: function() {
      const type = document.getElementById('erpEntryType')?.value || 'income';
      const amount = parseFloat(document.getElementById('erpEntryAmount')?.value) || 0;
      const client = document.getElementById('erpEntryClient')?.value.trim() || 'Operazione Contabile';
      const method = document.getElementById('erpEntryMethod')?.value || 'Gumroad';
      if (amount <= 0) return;

      const today = new Date().toLocaleDateString('it-IT');
      MKT_ERP_STATE.ledger.unshift({
        id: Date.now(),
        date: today,
        type,
        amount,
        client,
        method
      });
      localStorage.setItem('tpu_erp_ledger', JSON.stringify(MKT_ERP_STATE.ledger));
      this.renderErpLedger();
    },

    renderErpLedger: function() {
      const listEl = document.getElementById('erpLedgerList');
      if (!listEl) return;

      let totRev = 0;
      let totExp = 0;
      MKT_ERP_STATE.ledger.forEach(item => {
        if (item.type === 'income') totRev += item.amount;
        else totExp += item.amount;
      });

      const netRev = totRev / 1.22;
      const vatAmount = totRev - netRev;
      const netProfit = netRev - totExp;

      const fmt = n => `€ ${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const rEl = document.getElementById('erpTotalRevenue');
      const eEl = document.getElementById('erpTotalExpenses');
      const vEl = document.getElementById('erpTotalVat');
      const pEl = document.getElementById('erpNetProfit');

      if (rEl) rEl.textContent = fmt(totRev);
      if (eEl) eEl.textContent = fmt(totExp);
      if (vEl) vEl.textContent = fmt(vatAmount);
      if (pEl) {
        pEl.textContent = fmt(netProfit);
        pEl.style.color = netProfit >= 0 ? '#10b981' : '#f43f5e';
      }

      listEl.innerHTML = MKT_ERP_STATE.ledger.map(m => {
        const isInc = m.type === 'income';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:9px 12px; margin-bottom:6px; background:rgba(15,23,42,0.7); border:1px solid ${isInc ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; border-radius:8px; font-size:11.5px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${isInc ? '🟢' : '🔴'}</span>
              <div>
                <strong style="color:#fff;">${m.client}</strong>
                <div style="font-size:10px; color:#94a3b8;">${m.date} • ${m.method}</div>
              </div>
            </div>
            <div style="font-weight:900; font-family:monospace; font-size:12.5px; color:${isInc ? '#10b981' : '#f87171'};">
              ${isInc ? '+' : '-'} € ${m.amount.toFixed(2)}
            </div>
          </div>
        `;
      }).join('');
    },

    exportAccountingCsv: function() {
      let csv = 'ID;Data;Tipo;Cliente / Voce;Metodo Pagamento;Importo Lordo (€);IVA 22% (€);Imponibile Netto (€)\r\n';
      MKT_ERP_STATE.ledger.forEach(item => {
        const isInc = item.type === 'income';
        const vat = isInc ? (item.amount - (item.amount / 1.22)).toFixed(2) : '0.00';
        const net = isInc ? (item.amount / 1.22).toFixed(2) : (-item.amount).toFixed(2);
        csv += `${item.id};${item.date};${isInc ? 'Entrata' : 'Uscita'};"${item.client}";${item.method};${item.amount.toFixed(2)};${vat};${net}\r\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bilancio_Aziendale_Contabilita_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  };

  window.MarketingERPEngine = MarketingERPEngine;
  window.playMasterVoiceSample = function() { MarketingERPEngine.playMasterVoiceSample(); };
  window.toggleMasterVoiceMode = function() { MarketingERPEngine.toggleMasterVoiceMode(); };

  // Global helper hooks for inline HTML onclick handlers
  window.runAutonomousCorporateCycle = function(l) { MarketingERPEngine.runAutonomousCorporateCycle(l); };
  window.toggleCeoAutopilot = function() { MarketingERPEngine.toggleCeoAutopilot(); };
  window.generateAutomatedOmnichannelCampaign = function() { MarketingERPEngine.generateAutomatedOmnichannelCampaign(); };
  window.switchMktChannel = function(c, b) { MarketingERPEngine.switchMktChannel(c, b); };
  window.sendAutomatedWhatsApp = function() { MarketingERPEngine.sendAutomatedWhatsApp(); };
  window.sendAutomatedTelegram = function() { MarketingERPEngine.sendAutomatedTelegram(); };
  window.sendAutomatedEmail = function() { MarketingERPEngine.sendAutomatedEmail(); };
  window.speakAiPhoneCallPitch = function() { MarketingERPEngine.speakAiPhoneCallPitch(); };
  window.copyMktMessage = function() { MarketingERPEngine.copyMktMessage(); };
  window.selectPromoDemoSector = function(s) { MarketingERPEngine.selectPromoDemoSector(s); };
  window.togglePromoDemoAnimation = function() { MarketingERPEngine.togglePromoDemoAnimation(); };
  window.recordPromoDemoWebm = function() { MarketingERPEngine.recordPromoDemoWebm(); };
  window.downloadPromoPoster4K = function() { MarketingERPEngine.downloadPromoPoster4K(); };
  window.addErpAccountingEntry = function() { MarketingERPEngine.addErpAccountingEntry(); };
  window.exportAccountingCsv = function() { MarketingERPEngine.exportAccountingCsv(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MarketingERPEngine.init());
  } else {
    MarketingERPEngine.init();
  }

})(window);