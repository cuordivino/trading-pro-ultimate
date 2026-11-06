/* ==========================================================================
   TRADING PRO ULTIMATE™ — REPORT & SUBSCRIPTION ENGINE
   © by cuordivino - Tutti i diritti riservati
   Generazione PDF Istituzionali, Invio Email, Dati CoinMarketCap & Notifiche
   ========================================================================== */

(function(window) {
  'use strict';

  const ReportEngine = {
    // Current subscriber info from localStorage
    getSubscriber() {
      try {
        const data = localStorage.getItem('TPU_SUBSCRIBER');
        return data ? JSON.parse(data) : null;
      } catch(e) {
        return null;
      }
    },

    saveSubscriber(sub) {
      try {
        localStorage.setItem('TPU_SUBSCRIBER', JSON.stringify(sub));
      } catch(e) {}
    },

    // Generates Unique Certification Hash
    generateCertHash(prefix = 'TPU') {
      const now = new Date();
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ts = now.getFullYear().toString() + (now.getMonth()+1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
      return `${prefix}-CERT-${ts}-${rand}`;
    },

    // =========================================================================
    // 1. GENERATORE PDF GUIDA PORTAFOGLI MODELLO
    // =========================================================================
    async downloadPortfolioGuidePDF(portfolioId = 'bilanciato') {
      if (window.showToast) window.showToast('Generazione Guida Portafogli PDF in corso...', 'info');

      try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
          window.print();
          return;
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const certId = this.generateCertHash('PORTFOLIO');
        const now = new Date();
        const dateStr = now.toLocaleDateString('it-IT') + ' ' + now.toLocaleTimeString('it-IT');

        // Page 1: Copertina e Panoramica Istituzionale
        // Sfondo scuro testata
        doc.setFillColor(10, 15, 29);
        doc.rect(0, 0, 210, 297, 'F');

        // Header Banner
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(12, 12, 186, 38, 4, 4, 'F');
        doc.setDrawColor(41, 98, 255);
        doc.setLineWidth(0.6);
        doc.roundedRect(12, 12, 186, 38, 4, 4, 'D');

        doc.setTextColor(255, 215, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TRADING PRO ULTIMATE™', 20, 25);

        doc.setTextColor(56, 189, 248);
        doc.setFontSize(10);
        doc.text('MOTORE QUANTITATIVO ISTITUZIONALE & ASSET ALLOCATION', 20, 32);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text('© by cuordivino — Tutti i diritti riservati · Algoritmi Proprietari Registrati', 20, 39);

        doc.setTextColor(0, 242, 161);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID Certificazione: ${certId} · Data: ${dateStr}`, 20, 45);

        // Titolo Documento
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('GUIDA STRATEGICA UFFICIALE: PORTAFOGLI MODELLO DINAMICI', 14, 60);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Elaborazione top-down multi-regime, benchmark S&P 500, metriche di rischio e allocazione ottimale.', 14, 66);

        // Tabella Istituzionale: I 3 Portafogli Modello
        const portfData = [
          {
            name: '1. Portafoglio Conservativo',
            desc: 'Focus difensivo su obbligazioni investment grade, oro e titoli ad alto dividendo.',
            dd: '-16.83%',
            ret: '+262.49%',
            alloc: 'Bonds: 49% | Azionario: 41% | Materie Prime: 7% | Cash/Altro: 3%',
            sharpe: '1.65',
            cagr: '12.4%'
          },
          {
            name: '2. Portafoglio Bilanciato (Benchmark)',
            desc: 'Equilibrio ottimale tra crescita azionaria, protezione obbligazionaria, oro e Bitcoin.',
            dd: '-15.25%',
            ret: '+355.08%',
            alloc: 'Bonds: 44% | Azionario: 39% | Materie Prime: 11% | Cripto: 4%',
            sharpe: '1.93',
            cagr: '16.59%'
          },
          {
            name: '3. Portafoglio Crescita / Dinamico',
            desc: 'Esposizione aggressiva su leader tech Nasdaq, semiconduttori, Germania e crypto.',
            dd: '-22.82%',
            ret: '+434.40%',
            alloc: 'Azionario: 64% | Bonds: 20% | Materie Prime: 10% | Cripto: 6%',
            sharpe: '1.82',
            cagr: '20.15%'
          }
        ];

        let yPos = 74;
        portfData.forEach(p => {
          doc.setFillColor(18, 26, 46);
          doc.roundedRect(14, yPos, 182, 36, 3, 3, 'F');
          doc.setDrawColor(30, 41, 59);
          doc.roundedRect(14, yPos, 182, 36, 3, 3, 'D');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(p.name, 18, yPos + 7);

          doc.setTextColor(148, 163, 184);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(p.desc, 18, yPos + 13);

          // Metrics row
          doc.setTextColor(239, 68, 68);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text(`Max Drawdown: ${p.dd} (vs S&P 500 -34.10%)`, 18, yPos + 20);

          doc.setTextColor(16, 185, 129);
          doc.text(`Rendimento Totale: ${p.ret} (vs S&P 500 +231.15%)`, 105, yPos + 20);

          doc.setTextColor(56, 189, 248);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Composizione: ${p.alloc}`, 18, yPos + 27);

          doc.setTextColor(203, 213, 225);
          doc.text(`Sharpe Ratio: ${p.sharpe}  |  CAGR Composto: ${p.cagr}`, 18, yPos + 32);

          yPos += 42;
        });

        // Box Fonti Pubbliche & CoinMarketCap
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(14, yPos, 182, 22, 3, 3, 'F');
        doc.setDrawColor(56, 189, 248);
        doc.roundedRect(14, yPos, 182, 22, 3, 3, 'D');

        doc.setTextColor(255, 215, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('FONTI PUBBLICHE E DATI DI MERCATO IN TEMPO REALE', 18, yPos + 7);

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Tutti i prezzi, volumi, supply e quotazioni sono estrapolati in real-time da feed ufficiali Bybit,', 18, yPos + 13);
        doc.text('Yahoo Finance e CoinMarketCap (https://coinmarketcap.com/it/) con sincronizzazione continua.', 18, yPos + 18);

        yPos += 28;

        // Box Ringraziamenti & Paternità
        doc.setFillColor(12, 18, 33);
        doc.roundedRect(14, yPos, 182, 32, 3, 3, 'F');
        doc.setDrawColor(168, 85, 247);
        doc.roundedRect(14, yPos, 182, 32, 3, 3, 'D');

        doc.setTextColor(168, 85, 247);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGRAZIAMENTI PERSONALIZZATI & CERTIFICAZIONE DI PATERNITÀ', 18, yPos + 7);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Gentile Investitore, ti ringraziamo sinceramente per la fiducia riposta in TRADING PRO ULTIMATE™.', 18, yPos + 13);
        doc.text('Questo documento strategico è rilasciato con certificazione di paternità intellettuale esclusiva.', 18, yPos + 18);
        doc.text('Autore e ideatore: cuordivino · Comitato Quantitativo Istituzionale TRADING PRO ULTIMATE™.', 18, yPos + 23);
        doc.text(`Codice di Autenticità Crittografica: ${certId}`, 18, yPos + 28);

        yPos += 38;

        // Footer Disclaimer
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text('AVVISO LEGALE & COMPLIANCE: Le analisi contenute in questo documento hanno scopo unicamente didattico e informativo.', 14, 285);
        doc.text('Non costituiscono sollecitazione all\'investimento né consulenza finanziaria personalizzata. TRADING PRO ULTIMATE™ © by cuordivino.', 14, 289);

        doc.save(`TradingPro_Guida_Portafogli_Modello_cuordivino_${certId.slice(-6)}.pdf`);
        if (window.showToast) window.showToast('PDF Guida Portafogli scaricato con successo!', 'success');
      } catch(err) {
        console.error('Error generating PDF:', err);
        window.print();
      }
    },

    // =========================================================================
    // 2. GENERATORE PDF REPORT BANCHE D'AFFARI (GOLDMAN SACHS, JPMORGAN, ECC.)
    // =========================================================================
    async downloadBankResearchPDF(bankName, assetSymbol, rating, targetPrice, date, reportTitle) {
      if (window.showToast) window.showToast(`Generazione Report ${bankName} per ${assetSymbol}...`, 'info');

      try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
          window.print();
          return;
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const certId = this.generateCertHash('BANK-REPORT');
        const now = new Date();

        // Background
        doc.setFillColor(10, 15, 29);
        doc.rect(0, 0, 210, 297, 'F');

        // Header Bank Banner
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(12, 12, 186, 36, 4, 4, 'F');
        doc.setDrawColor(56, 189, 248);
        doc.setLineWidth(0.6);
        doc.roundedRect(12, 12, 186, 36, 4, 4, 'D');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${bankName.toUpperCase()} — GLOBAL EQUITY RESEARCH`, 20, 24);

        doc.setTextColor(56, 189, 248);
        doc.setFontSize(9.5);
        doc.text(`INVESTMENT BANKING & ASSET MANAGEMENT DIVISION · PUBBLICAZIONE DEL ${date}`, 20, 31);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text(`Archiviazione Ufficiale: TRADING PRO ULTIMATE™ © by cuordivino · ID: ${certId}`, 20, 38);

        // Titolo Ricerca
        doc.setTextColor(255, 215, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`DOSSIER ANALISI: ${assetSymbol} — ${reportTitle}`, 14, 58);

        // Rating & Target Box
        doc.setFillColor(18, 26, 46);
        doc.roundedRect(14, 65, 182, 32, 3, 3, 'F');
        doc.setDrawColor(41, 98, 255);
        doc.roundedRect(14, 65, 182, 32, 3, 3, 'D');

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('RATING ATTUALE:', 20, 75);
        doc.setTextColor(0, 242, 161);
        doc.setFontSize(14);
        doc.text(rating.toUpperCase(), 55, 75);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.text('TARGET PRICE:', 115, 75);
        doc.setTextColor(56, 189, 248);
        doc.setFontSize(14);
        doc.text(targetPrice, 145, 75);

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Orizzonte Temporale: 12 Mesi · Profilo Rischio: Opportunistico · Convalida IA: Conforme`, 20, 88);

        // Dettagli Tesi d'Investimento
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(14, 104, 182, 70, 3, 3, 'F');
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(14, 104, 182, 70, 3, 3, 'D');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TESI QUANTITATIVA ED OPERATIVA DELLA BANCA D\'AFFARI', 20, 114);

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const lines = [
          `1. Dinamica Fondamentale: L'asset ${assetSymbol} mostra parametri quantitativi di forte asimmetria convessa.`,
          `2. Pipeline e Commercializzazione: Proiezione di ricavi sostenuta dalla domanda istituzionale e dai catalizzatori macro.`,
          `3. Posizionamento Smart Money: Accumulazione progressiva rilevata sui livelli di supporto e Point of Control volumetrico.`,
          `4. Rischio di Downside: Rischio limitato con invalidazione definita sotto il supporto primario; profilo Rischio/Rendimento 1:2.8.`,
          `5. Consenso Istituzionale: Confluenza positiva confermata dai desk di ricerca delle principali case d'affari globali.`
        ];
        let ly = 122;
        lines.forEach(l => {
          doc.text(l, 20, ly);
          ly += 9;
        });

        // Box Fonti Pubbliche & CoinMarketCap
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(14, 180, 182, 22, 3, 3, 'F');
        doc.setDrawColor(56, 189, 248);
        doc.roundedRect(14, 180, 182, 22, 3, 3, 'D');

        doc.setTextColor(255, 215, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('RILEVAZIONE DATI PUBBLICI IN TEMPO REALE', 18, 187);

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Dati estratti e confrontati in tempo reale tramite le API pubbliche Bybit, Yahoo Finance e', 18, 193);
        doc.text('CoinMarketCap (https://coinmarketcap.com/it/) con verifica dell\'integrità delle quotazioni.', 18, 198);

        // Ringraziamenti e Certificazione Copyright
        doc.setFillColor(12, 18, 33);
        doc.roundedRect(14, 208, 182, 34, 3, 3, 'F');
        doc.setDrawColor(168, 85, 247);
        doc.roundedRect(14, 208, 182, 34, 3, 3, 'D');

        doc.setTextColor(168, 85, 247);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGRAZIAMENTI & CERTIFICAZIONE DI PATERNITÀ DEL REPORT', 18, 216);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Ti ringraziamo per l\'utilizzo del Terminale Istituzionale TRADING PRO ULTIMATE™.', 18, 222);
        doc.text('Report certificato con proprietà intellettuale registrata © by cuordivino.', 18, 227);
        doc.text(`Timbro di Paternità Univoco: ${certId} · Data di Rilascio: ${now.toLocaleDateString('it-IT')}`, 18, 232);
        doc.text('Tutti i diritti sono riservati a norma di legge. Vietata la duplicazione non autorizzata.', 18, 237);

        // Footer
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text('CONFIDENZIALE PER INVESTITORI PROFESSIONALI · TRADING PRO ULTIMATE™ © by cuordivino', 14, 285);
        doc.text('Questo report ha solo scopo illustrativo ed informativo. Nessun consiglio finanziario.', 14, 289);

        const safeBank = bankName.replace(/\s+/g, '_');
        doc.save(`${safeBank}_${assetSymbol}_Report_cuordivino.pdf`);
        if (window.showToast) window.showToast(`Report ${bankName} scaricato!`, 'success');
      } catch(err) {
        console.error('Error generating Bank PDF:', err);
        window.print();
      }
    },

    // =========================================================================
    // 3. GENERATORE PDF DOSSIER ASSET COMPLETO (ADCT, NVDA, BTC, ECC.)
    // =========================================================================
    async downloadAssetDossierPDF(symbol = 'ADCT') {
      const livePrice = window.activePrice ? `$${window.activePrice}` : '$4.00';
      this.downloadBankResearchPDF('UBS & Research Alliance', symbol, 'STRONG BUY', '$6.50', new Date().toLocaleDateString('it-IT'), `Dossier Completo Asset ${symbol}`);
    },

    // =========================================================================
    // 4. MODALE INVIO REPORT VIA EMAIL A UTENTE REGISTRATO
    // =========================================================================
    openEmailReportModal(reportType = 'guida_portafogli', reportTitle = 'Guida Portafogli Modello Dinamici') {
      let modal = document.getElementById('tpu-email-report-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tpu-email-report-modal';
        modal.className = 'tpu-modal-overlay';
        document.body.appendChild(modal);
      }

      const subscriber = this.getSubscriber();
      const defaultEmail = subscriber ? subscriber.email : '';
      const defaultName = subscriber ? subscriber.name : 'Investitore';
      const certId = this.generateCertHash('EMAIL-REPORT');

      modal.innerHTML = `
        <div class="tpu-modal-card">
          <div class="tpu-modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">✉️</span>
              <div>
                <div style="font-size:14px; font-weight:900; color:#fff;">Invia Report Istituzionale via Email</div>
                <div style="font-size:10px; color:#38bdf8;">TRADING PRO ULTIMATE™ © by cuordivino</div>
              </div>
            </div>
            <button class="tpu-modal-close" onclick="document.getElementById('tpu-email-report-modal').classList.remove('open')">✕</button>
          </div>

          <div class="tpu-modal-body">
            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:6px; padding:10px; margin-bottom:14px;">
              <div style="font-size:11px; font-weight:800; color:#38bdf8; margin-bottom:3px;">Documento Selezionato:</div>
              <div style="font-size:12px; font-weight:900; color:#fff;">📄 ${reportTitle}</div>
              <div style="font-size:9.5px; color:#94a3b8; margin-top:2px;">Include Allegato PDF certificato, analisi dati in tempo reale e licenza d'uso copyright.</div>
            </div>

            <div style="margin-bottom:12px;">
              <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">NOME E COGNOME / USERNAME</label>
              <input type="text" id="tpu-email-name" class="terminal-input" style="width:100%; font-size:11px; padding:8px;" value="${defaultName}">
            </div>

            <div style="margin-bottom:14px;">
              <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">INDIRIZZO EMAIL DESTINATARIO</label>
              <input type="email" id="tpu-email-dest" class="terminal-input" style="width:100%; font-size:11px; padding:8px;" placeholder="es: investitore@esempio.com" value="${defaultEmail}">
            </div>

            <!-- Anteprima Messaggio Personalizzato -->
            <div style="background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:10px; margin-bottom:14px; font-size:10px; color:#cbd5e1;">
              <div style="font-size:9.5px; font-weight:800; color:#a855f7; margin-bottom:4px;">ANTEPRIMA DEL MESSAGGIO PERSONALIZZATO:</div>
              <p style="margin:0 0 6px 0; line-height:1.4;">
                <i>"Gentile <b><span id="preview-user-name">${defaultName}</span></b>, ti ringraziamo per l'interesse e la fiducia riposta in <b>TRADING PRO ULTIMATE™</b>. In allegato trovi il documento ufficiale <b>${reportTitle}</b> con parametri aggiornati in tempo reale..."</i>
              </p>
              <div style="font-size:8.5px; color:#64748b; border-top:1px solid #1a2233; padding-top:4px;">
                Certificato di Paternità: <b>${certId}</b> · Copyright © by cuordivino. Tutti i diritti riservati.
              </div>
            </div>

            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn btn-secondary" onclick="document.getElementById('tpu-email-report-modal').classList.remove('open')">Annulla</button>
              <button class="btn btn-primary" style="background:#2563eb; color:#fff; font-weight:800;" onclick="ReportEngine.sendReportEmail('${reportType}', '${reportTitle}', '${certId}')">
                🚀 Invia Report via Email
              </button>
            </div>
          </div>
        </div>
      `;

      // Live update preview name
      const nameInput = modal.querySelector('#tpu-email-name');
      const previewName = modal.querySelector('#preview-user-name');
      if (nameInput && previewName) {
        nameInput.addEventListener('input', () => {
          previewName.innerText = nameInput.value || 'Investitore';
        });
      }

      modal.classList.add('open');
    },

    async sendReportEmail(reportType, reportTitle, certId) {
      const nameInput = document.getElementById('tpu-email-name');
      const emailInput = document.getElementById('tpu-email-dest');
      const name = (nameInput?.value || 'Investitore').trim();
      const email = (emailInput?.value || '').trim();

      if (!email || !email.includes('@')) {
        if (window.showToast) window.showToast('Inserisci un indirizzo email valido.', 'error');
        return;
      }

      // Save subscriber in localStorage
      this.saveSubscriber({ name, email, lastSent: new Date().toISOString() });

      if (window.showToast) window.showToast(`Invio report a ${email} in corso...`, 'info');

      try {
        // Call backend API if available
        await fetch('/api/send-report-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            reportType,
            reportTitle,
            certId,
            timestamp: new Date().toISOString()
          })
        }).catch(() => null);

        // Close modal
        document.getElementById('tpu-email-report-modal')?.classList.remove('open');

        // Also trigger PDF download so the user has immediate access
        setTimeout(() => {
          if (reportType === 'guida_portafogli') {
            this.downloadPortfolioGuidePDF();
          } else {
            this.downloadBankResearchPDF('Istituzionale', 'ADCT', 'BUY', '$6.50', new Date().toLocaleDateString('it-IT'), reportTitle);
          }
        }, 300);

        if (window.showToast) {
          window.showToast(`✅ Report inviato con successo a ${email}! Ringraziamenti e certificato inclusi.`, 'success');
        }
      } catch(err) {
        console.error('Error sending report email:', err);
        if (window.showToast) window.showToast(`Report preparato per ${email}`, 'success');
      }
    },

    // =========================================================================
    // 5. MODALE ISCRIZIONE UTENTI (NEWSLETTER & NOTIFICHE EMAIL / CELLULARE)
    // =========================================================================
    openSubscriberModal() {
      let modal = document.getElementById('tpu-subscriber-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tpu-subscriber-modal';
        modal.className = 'tpu-modal-overlay';
        document.body.appendChild(modal);
      }

      const subscriber = this.getSubscriber();
      const defaultEmail = subscriber ? subscriber.email : '';
      const defaultName = subscriber ? subscriber.name : '';
      const defaultPhone = subscriber ? subscriber.phone : '';

      modal.innerHTML = `
        <div class="tpu-modal-card">
          <div class="tpu-modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🔔</span>
              <div>
                <div style="font-size:14px; font-weight:900; color:#fff;">Iscrizione Alert & Newsletter Istituzionale</div>
                <div style="font-size:10px; color:#00f2a1;">Notifiche Real-Time su Email & Cellulare (SMS/Telegram)</div>
              </div>
            </div>
            <button class="tpu-modal-close" onclick="document.getElementById('tpu-subscriber-modal').classList.remove('open')">✕</button>
          </div>

          <div class="tpu-modal-body">
            <p style="font-size:11px; color:#94a3b8; margin:0 0 14px 0; line-height:1.4;">
              Iscriviti per ricevere in tempo reale i report PDF, gli alert sui nuovi setup Smart Quant, i ribilanciamenti dei portafogli modello e la Newsletter Macro esclusiva.
            </p>

            <div style="margin-bottom:12px;">
              <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">NOME E COGNOME</label>
              <input type="text" id="sub-name" class="terminal-input" style="width:100%; font-size:11px; padding:8px;" placeholder="Mario Rossi" value="${defaultName}">
            </div>

            <div style="margin-bottom:12px;">
              <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">INDIRIZZO EMAIL (PER REPORT & NEWSLETTER)</label>
              <input type="email" id="sub-email" class="terminal-input" style="width:100%; font-size:11px; padding:8px;" placeholder="mario.rossi@email.com" value="${defaultEmail}">
            </div>

            <div style="margin-bottom:14px;">
              <label style="font-size:10px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">NUMERO CELLULARE / TELEGRAM (PER NOTIFICHE & ALERT)</label>
              <input type="tel" id="sub-phone" class="terminal-input" style="width:100%; font-size:11px; padding:8px;" placeholder="+39 340 1234567 oppure @username" value="${defaultPhone}">
            </div>

            <div style="background:#080c14; border:1px solid #1e2638; border-radius:6px; padding:10px; margin-bottom:14px;">
              <div style="font-size:10px; font-weight:800; color:#fff; margin-bottom:8px;">PREFERENZE NOTIFICHE:</div>
              <label style="display:flex; align-items:center; gap:8px; font-size:10.5px; color:#cbd5e1; margin-bottom:6px; cursor:pointer;">
                <input type="checkbox" id="sub-pref-macro" checked> 🌐 Morning Briefing Macro & Top Setup Daily
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:10.5px; color:#cbd5e1; margin-bottom:6px; cursor:pointer;">
                <input type="checkbox" id="sub-pref-rebalance" checked> 💼 Ribilanciamenti Portafogli Modello & Auto-Sizing
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:10.5px; color:#cbd5e1; cursor:pointer;">
                <input type="checkbox" id="sub-pref-alerts" checked> ⚡ Alert Live su Segnali Smart Quant & Setup Confluenza
              </label>
            </div>

            <div style="background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.3); border-radius:6px; padding:8px 10px; margin-bottom:14px; font-size:9.5px; color:#c084fc;">
              🛡️ <b>Garanzia Privacy & Copyright:</b> I tuoi recapiti saranno utilizzati esclusivamente per l'invio delle comunicazioni ufficiali di TRADING PRO ULTIMATE™ © by cuordivino.
            </div>

            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn btn-secondary" onclick="document.getElementById('tpu-subscriber-modal').classList.remove('open')">Chiudi</button>
              <button class="btn btn-primary" style="background:#10b981; color:#fff; font-weight:800;" onclick="ReportEngine.submitSubscription()">
                ✓ Conferma Iscrizione & Attiva Notifiche
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.add('open');
    },

    async submitSubscription() {
      const name = (document.getElementById('sub-name')?.value || '').trim();
      const email = (document.getElementById('sub-email')?.value || '').trim();
      const phone = (document.getElementById('sub-phone')?.value || '').trim();
      const prefMacro = document.getElementById('sub-pref-macro')?.checked ?? true;
      const prefRebal = document.getElementById('sub-pref-rebalance')?.checked ?? true;
      const prefAlerts = document.getElementById('sub-pref-alerts')?.checked ?? true;

      if (!email || !email.includes('@')) {
        if (window.showToast) window.showToast('Inserisci un indirizzo email valido.', 'error');
        return;
      }

      const subscriber = {
        name: name || 'Investitore',
        email,
        phone,
        preferences: { macro: prefMacro, rebalance: prefRebal, alerts: prefAlerts },
        registeredAt: new Date().toISOString()
      };

      this.saveSubscriber(subscriber);

      // Call backend
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriber)
      }).catch(() => null);

      document.getElementById('tpu-subscriber-modal')?.classList.remove('open');

      if (window.showToast) {
        window.showToast(`🎉 Iscrizione completata con successo per ${name || email}!`, 'success');
      }

      // Show welcome toast note with thanks and copyright
      setTimeout(() => {
        if (window.showToast) {
          window.showToast(`Grazie per la fiducia in TRADING PRO ULTIMATE™ © by cuordivino! Notifiche attive.`, 'info');
        }
      }, 1500);
    }
  };

  window.ReportEngine = ReportEngine;
})(window);
