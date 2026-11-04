/* ==========================================================================
   TRADING.JS - Pro Order Execution & Risk Optimizer V2
   Leverage Presets, Multi-Target TP & Margin Liquidation Logic
   ========================================================================== */

let currentTradeSide = 'LONG';
let currentLeverage = 10;
let defaultCapital = 25000;
let defaultRiskPct = 1.5;

function setTradeSide(side) {
  currentTradeSide = side;
  const longBtn = document.getElementById('btn-mode-long');
  const shortBtn = document.getElementById('btn-mode-short');
  const execBtn = document.getElementById('btn-execute-order');

  if (side === 'LONG') {
    if (longBtn) longBtn.classList.add('active');
    if (shortBtn) shortBtn.classList.remove('active');
    if (execBtn) {
      execBtn.className = 'btn-action-primary btn-buy';
      execBtn.innerText = 'Apri Posizione LONG / BUY';
    }
  } else {
    if (longBtn) longBtn.classList.remove('active');
    if (shortBtn) shortBtn.classList.add('active');
    if (execBtn) {
      execBtn.className = 'btn-action-primary btn-sell';
      execBtn.innerText = 'Apri Posizione SHORT / SELL';
    }
  }
  recalcPosition();
}

function setLeveragePreset(val, chipElem) {
  currentLeverage = parseInt(val);
  document.querySelectorAll('.lev-chip').forEach(c => c.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');

  const slider = document.getElementById('leverage-slider');
  if (slider) slider.value = currentLeverage;
  const display = document.getElementById('lev-display-val');
  if (display) display.innerText = `${currentLeverage}x`;

  recalcPosition();
}

function updateLeverage(val) {
  currentLeverage = parseInt(val);
  const display = document.getElementById('lev-display-val');
  if (display) display.innerText = `${currentLeverage}x`;

  // Highlight matching chip if any
  document.querySelectorAll('.lev-chip').forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.val) === currentLeverage);
  });

  recalcPosition();
}

function setRiskPreset(val, chipElem) {
  defaultRiskPct = parseFloat(val);
  document.querySelectorAll('.risk-chip').forEach(c => c.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');

  const riskInput = document.getElementById('calc-risk-pct');
  if (riskInput) riskInput.value = defaultRiskPct;

  recalcPosition();
}

async function recalcPosition() {
  const entryVal = parseFloat(document.getElementById('t-entry')?.value) || 0;
  const slVal = parseFloat(document.getElementById('t-sl')?.value) || 0;
  const tpVal = parseFloat(document.getElementById('t-tp')?.value) || 0;
  const modeVal = document.getElementById('sizing-mode-select')?.value || 'standard';
  const capital = defaultCapital;
  const riskPct = defaultRiskPct;

  if (entryVal <= 0 || slVal <= 0) {
    return;
  }

  try {
    const res = await fetch('/api/calculate-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capital: capital,
        entry: entryVal,
        sl: slVal,
        tp: tpVal,
        risk_pct: riskPct,
        leverage: currentLeverage,
        mode: modeVal,
        atr: window.currentAtr || 0
      })
    });
    const data = await res.json();

    // Render calculated values
    const unitsElem = document.getElementById('pos-res-units');
    const marginElem = document.getElementById('pos-res-margin');
    const riskElem = document.getElementById('pos-res-risk');
    const profitElem = document.getElementById('pos-res-profit');
    const rrElem = document.getElementById('pos-res-rr');
    const liqElem = document.getElementById('pos-res-liq');
    const warnElem = document.getElementById('pos-res-warn');

    if (unitsElem) unitsElem.innerText = data.position_size_units || 0;
    if (marginElem) marginElem.innerText = `$${data.margine_richiesto || 0}`;
    if (riskElem) riskElem.innerText = `$${data.rischio_valuta || 0} (${data.distanza_sl_pct}%)`;
    if (profitElem) profitElem.innerText = `$${data.profitto_potenziale || 0}`;
    if (rrElem) rrElem.innerText = `1 : ${data.rr_ratio || 0}`;
    if (liqElem) liqElem.innerText = data.liquidation_price > 0 ? `$${data.liquidation_price}` : 'N/A (1x)';

    // Render Multi-TP Targets in Accordion
    const multiTpBody = document.getElementById('multi-tp-tbody');
    if (multiTpBody && data.multi_tp) {
      multiTpBody.innerHTML = data.multi_tp.map(tier => `
        <tr>
          <td style="color:var(--text-dim)">${tier.tier}</td>
          <td style="font-weight:700; color:var(--buy)">$${tier.price}</td>
          <td>${tier.rr}</td>
          <td style="color:var(--buy)">+$${tier.profit}</td>
        </tr>
      `).join('');
    }

    if (warnElem) {
      if (data.warning) {
        warnElem.innerText = data.warning;
        warnElem.style.display = 'block';
      } else {
        warnElem.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('Recalc position error:', e);
  }
}

async function executeTrade() {
  const symbol = window.currentSymbol || 'BTCUSDT';
  const entry = parseFloat(document.getElementById('t-entry')?.value);
  const sl = parseFloat(document.getElementById('t-sl')?.value) || null;
  const tp = parseFloat(document.getElementById('t-tp')?.value) || null;
  const units = parseFloat(document.getElementById('pos-res-units')?.innerText) || 1.0;
  const skill = document.getElementById('trade-skill-tag')?.value || 'Discretionary';

  if (!entry || entry <= 0) {
    showToast('Inserisci un prezzo di Entry valido.', 'error');
    return;
  }

  // Pre-trade circuit breaker check
  try {
    const riskRes = await fetch('/api/risk/status');
    const riskStatus = await riskRes.json();
    if (!riskStatus.circuit_breaker_ok) {
      showToast(riskStatus.status_message, 'error');
      return;
    }
  } catch (e) {}

  try {
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol,
        side: currentTradeSide,
        entry_price: entry,
        qty: units,
        leverage: currentLeverage,
        sl: sl,
        tp: tp,
        investor_skill: skill,
        notes: `Eseguito dal Terminale Apex - Strategia: ${skill}`
      })
    });
    const result = await res.json();
    if (result.status === 'created') {
      showToast(`Ordine ${currentTradeSide} su ${symbol} inviato con successo!`, 'success');
      loadTradeJournal();
    }
  } catch (e) {
    showToast('Errore durante l\'esecuzione dell\'ordine.', 'error');
  }
}
