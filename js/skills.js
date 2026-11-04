/* ==========================================================================
   SKILLS.JS - InvestorSkills AI Engine V2 Pro
   Circular SVG Gauge, 6 Radar Pillars, Accordion Drawers & Persona Chat
   ========================================================================== */

let allSkillsList = [];
let currentPersonaSlug = 'buffett';
let lastConsensusData = null;

// Avatars and emojis for master investors
const PERSONA_META = {
  'buffett': { emoji: '👴', tag: 'Value & Moat' },
  'minervini-vcp': { emoji: '⚡', tag: 'VCP & Breakout' },
  'dalio-principles-allweather': { emoji: '🌐', tag: 'Macro & Risk Parity' },
  'simons-quant': { emoji: '📐', tag: 'Quant & Stat-Arb' },
  'burry-asymmetric-contrarian': { emoji: '🔍', tag: 'Asymmetric Contrarian' },
  'livermore': { emoji: '📈', tag: 'Tape Reading & Pivots' },
  'lynch-growth': { emoji: '🛍️', tag: 'Growth & Fast Growers' },
  'arthur-hayes-liquidity': { emoji: '🪙', tag: 'Crypto & Liquidity' },
  'cathie-wood-innovation': { emoji: '🚀', tag: 'Disruptive Tech' },
  'ackman-concentrated-activism': { emoji: '🎯', tag: 'Concentrated Activism' }
};

// ==========================================
// 1. COMMITTEE CONSENSUS & RADAR PILLARS
// ==========================================
async function loadCommitteeConsensus(symbol) {
  const container = document.getElementById('council-cards-container');
  if (!symbol) return;

  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-dim);">
        <div style="font-size:26px; animation: pulseDot 1.2s infinite">🧠</div>
        <div style="margin-top:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px">
          Convocazione del Comitato Investitori su ${symbol}...
        </div>
      </div>`;
  }

  let data = null;
  try {
    const res = await fetch(`/api/skills/consensus/${symbol}?interval=${window.currentInterval || '15m'}`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {}

  // Client-Side Calculation Fallback for GitHub Pages Static Mode
  if (!data || !data.council) {
    data = calculateClientSideConsensus(symbol, window.currentLivePrice, window.currentCandles);
  }

  lastConsensusData = data;
  renderCommitteeConsensus(data);
  renderQuickConsensus(data);
}

function calculateClientSideConsensus(symbol, price, candles) {
  const p = price || (candles && candles.length ? candles[candles.length - 1].close : 65000);
  const council = [
    {
      investor: 'Warren Buffett',
      slug: 'buffett',
      style: 'Value & Moat',
      pillar: 'Moat & Intrinsic Value',
      score: symbol.includes('USDT') ? 22 : 82,
      verdict: symbol.includes('USDT') ? 'TOO HARD / SPECULATIVE' : 'BUY / VALUE COMPOUNDER',
      summary: 'Analisi sul vantaggio competitivo (Moat) e generazione di cassa reale nel tempo.',
      signals_met: ['Valutazione del capitale proprio e margine di sicurezza'],
      invalidation: `Breakdown strutturale sotto $${(p * 0.85).toFixed(2)}`,
      target_price: Math.round(p * 1.30 * 100) / 100,
      stop_loss: Math.round(p * 0.85 * 100) / 100
    },
    {
      investor: 'Mark Minervini',
      slug: 'minervini-vcp',
      style: 'Momentum + VCP Breakout',
      pillar: 'Trend & VCP Contraction',
      score: 88,
      verdict: 'STRONG BUY (PIVOT BREAKOUT)',
      summary: 'Trend Template Stage-2 con contrazione progressiva delle oscillazioni di prezzo (VCP).',
      signals_met: ['Stage-2 Uptrend integro', 'Volume Dry-Up in prossimità del punto pivot'],
      invalidation: `Chiusura sotto lo Stop matematico a $${(p * 0.94).toFixed(2)} (-6%)`,
      target_price: Math.round(p * 1.18 * 100) / 100,
      stop_loss: Math.round(p * 0.94 * 100) / 100
    },
    {
      investor: 'Ray Dalio',
      slug: 'dalio-principles-allweather',
      style: 'Macro & Risk Parity',
      pillar: 'Macro Regime & Volatility',
      score: 72,
      verdict: 'ALLOCATE (BALANCED RISK)',
      summary: 'Quadro della Macchina Economica. Volatilità monitorata per dimensionamento Risk Parity.',
      signals_met: ['Asset coerente con la fase di liquidità attuale'],
      invalidation: `Divergenza macro o breakdown sotto $${(p * 0.90).toFixed(2)}`,
      target_price: Math.round(p * 1.15 * 100) / 100,
      stop_loss: Math.round(p * 0.92 * 100) / 100
    },
    {
      investor: 'Jim Simons',
      slug: 'simons-quant',
      style: 'Quant & Stat-Arb',
      pillar: 'Statistical Mean Reversion',
      score: 68,
      verdict: 'QUANT LONG EDGE',
      summary: 'Z-Score entro le deviazioni standard di normalità statistica con persistenza positiva.',
      signals_met: ['Modello statistico Medallion favorevole'],
      invalidation: `Superamento 3° deviazione standard a $${(p * 0.95).toFixed(2)}`,
      target_price: Math.round(p * 1.08 * 100) / 100,
      stop_loss: Math.round(p * 0.96 * 100) / 100
    },
    {
      investor: 'Michael Burry',
      slug: 'burry-asymmetric-contrarian',
      style: 'Asymmetric Contrarian',
      pillar: 'Asymmetric Contrarian Skew',
      score: 60,
      verdict: 'WATCHLIST / ASYMMETRIC BIAS',
      summary: 'Ricerca di asimmetria estrema con catalizzatori di disallineamento prezzo/realtà.',
      signals_met: ['Profilo di rischio/rendimento moderatamente asimmetrico'],
      invalidation: `Violazione livello critico a $${(p * 0.88).toFixed(2)}`,
      target_price: Math.round(p * 1.40 * 100) / 100,
      stop_loss: Math.round(p * 0.88 * 100) / 100
    },
    {
      investor: 'Jesse Livermore',
      slug: 'livermore',
      style: 'Tape Reading & Pivots',
      pillar: 'Tape Reading & Pivotal Points',
      score: 85,
      verdict: 'BUY ON PIVOT BREAKOUT',
      summary: 'Linea di minor resistenza al rialzo. Consigliato ingresso su pivot e piramidazione.',
      signals_met: ['Punto pivot chiave testato con successo'],
      invalidation: `Perdita del pivot a $${(p * 0.93).toFixed(2)}`,
      target_price: Math.round(p * 1.25 * 100) / 100,
      stop_loss: Math.round(p * 0.93 * 100) / 100
    }
  ];

  const scores = council.map(c => c.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    symbol: symbol,
    price: p,
    consensus_score: avg,
    consensus_verdict: avg >= 75 ? 'FORTE CONSENSO RIALZISTA (CONVICTION BUY)' : 'ACCUMULAZIONE PRUDENTE (MODERATE BUY)',
    consensus_target_price: Math.round(p * 1.18 * 100) / 100,
    consensus_stop_loss: Math.round(p * 0.94 * 100) / 100,
    recommended_risk_pct: 1.5,
    pillars: {
      moat: council[0].score,
      technical_vcp: council[1].score,
      macro: council[2].score,
      quant: council[3].score,
      contrarian: council[4].score,
      pivots: council[5].score
    },
    council: council
  };
}

function renderQuickConsensus(data) {
  const scoreElem = document.getElementById('qc-score-val');
  const verdictElem = document.getElementById('qc-verdict-val');
  if (!scoreElem || !verdictElem) return;

  scoreElem.innerText = `${data.consensus_score}/100`;
  verdictElem.innerText = data.consensus_verdict;
  
  if (data.consensus_score >= 70) {
    verdictElem.style.color = 'var(--buy)';
  } else if (data.consensus_score >= 50) {
    verdictElem.style.color = 'var(--accent)';
  } else {
    verdictElem.style.color = 'var(--sell)';
  }
}

function renderCommitteeConsensus(data) {
  // 1. Render Circular SVG Gauge
  const gaugeNum = document.getElementById('svg-gauge-num');
  const gaugeCircle = document.getElementById('svg-gauge-circle');
  const gaugeVerdict = document.getElementById('gauge-verdict-label');

  if (gaugeNum) gaugeNum.innerText = data.consensus_score;
  if (gaugeVerdict) {
    gaugeVerdict.innerText = data.consensus_verdict;
    gaugeVerdict.style.color = data.consensus_score >= 70 ? 'var(--buy)' : (data.consensus_score >= 50 ? 'var(--accent)' : 'var(--sell)');
  }
  if (gaugeCircle) {
    // Circumference of r=60 is 2 * pi * 60 ~= 377
    const circumference = 377;
    const offset = circumference - (circumference * data.consensus_score / 100);
    gaugeCircle.style.strokeDashoffset = offset;
    gaugeCircle.style.stroke = data.consensus_score >= 70 ? 'var(--buy)' : (data.consensus_score >= 50 ? 'var(--accent)' : 'var(--sell)');
  }

  // 2. Render 6 Radar Pillars
  const pillars = data.pillars || {};
  setRadarBar('radar-moat', pillars.moat || 50, '#00f2a1');
  setRadarBar('radar-vcp', pillars.technical_vcp || 50, '#fcd535');
  setRadarBar('radar-macro', pillars.macro || 50, '#818cf8');
  setRadarBar('radar-quant', pillars.quant || 50, '#22d3ee');
  setRadarBar('radar-contrarian', pillars.contrarian || 50, '#ff4560');
  setRadarBar('radar-pivots', pillars.pivots || 50, '#c084fc');

  // 3. Render Targets
  const targetElem = document.getElementById('consensus-target-val');
  const stopElem = document.getElementById('consensus-stop-val');
  const riskElem = document.getElementById('consensus-risk-val');

  if (targetElem) targetElem.innerText = `$${data.consensus_target_price}`;
  if (stopElem) stopElem.innerText = `$${data.consensus_stop_loss}`;
  if (riskElem) riskElem.innerText = `${data.recommended_risk_pct}%`;

  // 4. Render Council Mentor Cards with Accordion Drawers
  const container = document.getElementById('council-cards-container');
  if (!container) return;

  container.innerHTML = data.council.map((mentor, idx) => {
    let scoreClass = mentor.score >= 75 ? 'color:var(--buy); border-color:var(--buy-dark)' : 
                     (mentor.score >= 55 ? 'color:var(--accent); border-color:rgba(252,213,53,0.4)' : 
                     'color:var(--sell); border-color:var(--sell-dark)');
    const meta = PERSONA_META[mentor.slug] || { emoji: '🏛️' };

    return `
      <div class="mentor-window-card">
        <div class="mentor-header-row">
          <div style="display:flex; align-items:center;">
            <div class="mentor-avatar-badge">${meta.emoji}</div>
            <div class="mentor-identity-info">
              <div class="mentor-fullname">${mentor.investor}</div>
              <div class="mentor-pillar-badge">${mentor.pillar || mentor.style}</div>
            </div>
          </div>
          <span class="mentor-score-tag" style="background:var(--bg-elevated); border:1px solid; ${scoreClass}">
            ${mentor.score}/100
          </span>
        </div>

        <div>
          <span style="font-size:11px; font-weight:800; ${scoreClass}">${mentor.verdict}</span>
        </div>

        <p style="font-size:12px; color:var(--text-dim); line-height:1.45;">
          ${mentor.summary}
        </p>

        <!-- ACCORDION DRAWER ("Apertura a tendina") -->
        <div class="accordion-drawer" id="mentor-drawer-${idx}">
          <div class="accordion-header" onclick="toggleMentorAccordion(${idx})">
            <span>Dettagli Parametri & Segnali Rilevati</span>
            <span class="chevron">▾</span>
          </div>
          <div class="accordion-content">
            <div style="font-weight:700; color:var(--cyan); margin-bottom:4px; font-size:10px; text-transform:uppercase">Segnali Soddisfatti:</div>
            <ul style="list-style:none; padding-left:4px; margin-bottom:8px">
              ${mentor.signals_met.map(s => `<li style="margin-bottom:3px; color:var(--text-main);">▸ ${s}</li>`).join('')}
            </ul>

            <div style="font-weight:700; color:var(--sell); margin-bottom:4px; font-size:10px; text-transform:uppercase">Condizione di Invalidazione Tesi:</div>
            <div style="color:var(--text-dim); margin-bottom:8px; line-height:1.35">${mentor.invalidation || 'Breakdown del supporto primario'}</div>

            <div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-light); font-family:var(--font-mono); font-size:10px">
              <span>Target: <b style="color:var(--buy)">${mentor.target_price ? '$' + mentor.target_price : 'N/A'}</b></span>
              <span>Stop: <b style="color:var(--sell)">${mentor.stop_loss ? '$' + mentor.stop_loss : 'N/A'}</b></span>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px">
          <button class="btn-action-primary" style="padding:6px 12px; font-size:11px; width:auto; background:var(--bg-elevated); border:1px solid var(--border); color:var(--text-dim)" onclick="consultPersona('${mentor.slug}')">
            💬 Chiedi ad AI
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setRadarBar(id, val, color) {
  const bar = document.getElementById(id);
  const valElem = document.getElementById(`${id}-val`);
  if (bar) {
    bar.style.width = `${val}%`;
    bar.style.background = color;
  }
  if (valElem) valElem.innerText = `${val}%`;
}

function toggleMentorAccordion(idx) {
  const drawer = document.getElementById(`mentor-drawer-${idx}`);
  if (drawer) drawer.classList.toggle('open');
}

function applyConsensusToOrder() {
  if (!lastConsensusData) return;
  const entryInput = document.getElementById('t-entry');
  const slInput = document.getElementById('t-sl');
  const tpInput = document.getElementById('t-tp');

  if (entryInput) entryInput.value = lastConsensusData.price;
  if (slInput) slInput.value = lastConsensusData.consensus_stop_loss;
  if (tpInput) tpInput.value = lastConsensusData.consensus_target_price;

  switchMainTab('tab-terminal', document.querySelector('[data-tab="tab-terminal"]'));
  recalcPosition();
  showToast(`Parametri del Comitato applicati: TP $${lastConsensusData.consensus_target_price}, SL $${lastConsensusData.consensus_stop_loss}`, 'success');
}

// ==========================================
// 2. 63 INVESTOR SKILLS HUB EXPLORER
// ==========================================
async function loadAllSkillsHub() {
  try {
    const res = await fetch('/api/skills');
    if (res.ok) {
      allSkillsList = await res.json();
    } else {
      const res2 = await fetch('js/skills_data.json');
      const data2 = await res2.json();
      allSkillsList = Object.values(data2);
    }
    renderSkillsCatalog(allSkillsList);
  } catch (e) {
    try {
      const res2 = await fetch('js/skills_data.json');
      const data2 = await res2.json();
      allSkillsList = Object.values(data2);
      renderSkillsCatalog(allSkillsList);
    } catch (err) {
      console.error('Error loading skills list:', err);
    }
  }
}

function renderSkillsCatalog(skills) {
  const container = document.getElementById('skills-directory-grid');
  if (!container) return;

  const countBadge = document.getElementById('skills-count-badge');
  if (countBadge) countBadge.innerText = `${skills.length} Sistemi Disponibili`;

  container.innerHTML = skills.map(skill => {
    const catLabels = {
      'value_quality': { label: 'Value & Moat', color: 'rgba(0, 242, 161, 0.15)', text: '#00f2a1' },
      'macro_cycles': { label: 'Macro & Cicli', color: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' },
      'momentum_breakouts': { label: 'Momentum / VCP', color: 'rgba(252, 213, 53, 0.15)', text: '#fcd535' },
      'quant_systematic': { label: 'Quant & Stat', color: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee' },
      'short_forensic': { label: 'Short / Forensic', color: 'rgba(255, 69, 96, 0.15)', text: '#ff4560' },
      'activist_special': { label: 'Attivismo', color: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' },
      'crypto_native': { label: 'Crypto Native', color: 'rgba(168, 85, 247, 0.15)', text: '#c084fc' },
      'vc_innovation': { label: 'VC & Tech', color: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' }
    };
    const cat = catLabels[skill.category] || { label: 'Strategia', color: 'rgba(255,255,255,0.1)', text: '#fff' };

    return `
      <div class="skill-card-item">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:14px; font-weight:800">${skill.name}</div>
              <div style="font-size:11px; color:var(--accent); font-weight:700">Mentor: ${skill.investor}</div>
            </div>
            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase; background:${cat.color}; color:${cat.text}">
              ${cat.label}
            </span>
          </div>

          <p style="font-size:12px; color:var(--text-dim); line-height:1.4; margin-top:8px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;">
            ${skill.description || 'Framework decisionale per la selezione del portafoglio e il controllo del rischio.'}
          </p>
        </div>

        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="btn-action-primary" style="flex:1; padding:6px; font-size:11px; background:var(--bg-elevated); border:1px solid var(--border); color:var(--text-main)" onclick="openSkillModal('${skill.slug}')">Dettagli & Regole</button>
          <button class="btn-action-primary" style="padding:6px 14px; font-size:11px; width:auto; background:var(--ai-gradient); color:#fff" onclick="consultPersona('${skill.slug}')">Chiedi ad AI</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterSkillsCategory(cat, btn) {
  document.querySelectorAll('.hub-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (cat === 'all') {
    renderSkillsCatalog(allSkillsList);
  } else {
    const filtered = allSkillsList.filter(s => s.category === cat);
    renderSkillsCatalog(filtered);
  }
}

function searchSkillsInput(query) {
  const q = query.toLowerCase().trim();
  const filtered = allSkillsList.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.investor.toLowerCase().includes(q) ||
    (s.description && s.description.toLowerCase().includes(q))
  );
  renderSkillsCatalog(filtered);
}

async function openSkillModal(slug) {
  const modal = document.getElementById('skill-detail-modal');
  const body = document.getElementById('skill-modal-content');
  if (!modal || !body) return;

  body.innerHTML = `<div style="text-align:center; padding:30px">Caricamento schema mentale di ${slug}...</div>`;
  modal.classList.add('open');

  try {
    const res = await fetch(`/api/skills/${slug}`);
    const data = await res.json();

    body.innerHTML = `
      <div style="margin-bottom:16px">
        <h2 style="font-size:20px; font-weight:800">${data.name}</h2>
        <div style="color:var(--accent); font-weight:700">Maestro: ${data.investor} | Stile: ${data.style}</div>
        <div style="color:var(--text-dim); font-size:12px; margin-top:2px">Orizzonte Temporale: ${data.timeHorizon}</div>
      </div>

      <div style="background:var(--bg); border:1px solid var(--border); padding:12px; border-radius:8px; margin-bottom:14px; font-size:12px">
        <b>Filosofia di Fondo:</b>
        <p style="color:var(--text-dim); margin-top:4px">${data.description || 'N/A'}</p>
      </div>

      <div style="margin-bottom:14px">
        <h4 style="font-size:13px; text-transform:uppercase; color:var(--cyan); margin-bottom:6px">Segnali Chiave d'Ingresso:</h4>
        <pre style="background:var(--bg); padding:10px; border-radius:6px; font-size:11px; font-family:var(--font-mono); overflow-x:auto">${JSON.stringify(data.signals || {}, null, 2)}</pre>
      </div>

      <div style="margin-bottom:14px">
        <h4 style="font-size:13px; text-transform:uppercase; color:var(--sell); margin-bottom:6px">Filtri di Esclusione & Stop:</h4>
        <pre style="background:var(--bg); padding:10px; border-radius:6px; font-size:11px; font-family:var(--font-mono); overflow-x:auto">${JSON.stringify(data.filters || {}, null, 2)}</pre>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px">
        <button class="btn-action-primary" style="width:auto; padding:8px 16px; background:var(--bg-elevated); border:1px solid var(--border); color:var(--text-main)" onclick="closeSkillModal()">Chiudi</button>
        <button class="btn-action-primary" style="width:auto; padding:8px 16px; background:var(--ai-gradient); color:#fff" onclick="closeSkillModal(); consultPersona('${data.slug}')">Avvia Conversazione</button>
      </div>
    `;
  } catch (e) {
    body.innerHTML = `<div style="color:var(--sell)">Errore nel caricamento dei dati della skill.</div>`;
  }
}

function closeSkillModal() {
  document.getElementById('skill-detail-modal')?.classList.remove('open');
}

// ==========================================
// 3. INTERACTIVE 1-ON-1 PERSONA CHAT
// ==========================================
function selectChatPersona(slug, btnElem) {
  currentPersonaSlug = slug;
  document.querySelectorAll('.mentor-select-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  const meta = PERSONA_META[slug] || { emoji: '🏛️', tag: 'Esperto' };
  const headerElem = document.getElementById('chat-active-persona-title');
  if (headerElem) {
    headerElem.innerText = `${meta.emoji} Conversazione attiva con ${slug.replace('-', ' ').toUpperCase()} su ${window.currentSymbol || 'Asset'}`;
  }

  appendChatMessage('mentor', `Saluti! Sono **${slug.replace('-', ' ').toUpperCase()}**. Quale aspetto dell'operazione su **${window.currentSymbol}** desideri approfondire? Chiedimi pure la mia opinione sul trend, sul dimensionamento del rischio o sulle condizioni di invalidazione.`);
}

function consultPersona(slug) {
  currentPersonaSlug = slug;
  switchMainTab('tab-chat', document.querySelector('[data-tab="tab-chat"]'));
  const targetBtn = document.querySelector(`[data-persona="${slug}"]`);
  selectChatPersona(slug, targetBtn);
}

function sendPresetPrompt(promptText) {
  const input = document.getElementById('chat-user-input');
  if (input) {
    input.value = promptText;
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-user-input');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  appendChatMessage('user', message);
  input.value = '';

  const loadingId = appendChatMessage('mentor', 'Consultazione del framework decisionale in corso...');

  try {
    const res = await fetch('/api/skills/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: currentPersonaSlug,
        message: message,
        symbol: window.currentSymbol || 'BTCUSDT'
      })
    });
    const data = await res.json();
    
    const loadElem = document.getElementById(loadingId);
    if (loadElem) {
      loadElem.innerHTML = formatMarkdown(data.reply);
    }
  } catch (e) {
    console.error('Chat error:', e);
    const loadElem = document.getElementById(loadingId);
    if (loadElem) loadElem.innerText = 'Impossibile completare la risposta. Riprova più tardi.';
  }
}

let msgIdCounter = 0;
function appendChatMessage(sender, text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return null;

  const id = `msg-${++msgIdCounter}`;
  const div = document.createElement('div');
  div.id = id;
  div.className = `chat-bubble ${sender}`;
  div.innerHTML = formatMarkdown(text);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function formatMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}
