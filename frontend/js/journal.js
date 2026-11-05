/* ======================================================
   JOURNAL.JS - Trade Journal, Performance Analytics & Active Positions
   Hybrid Cloud & Local-First (Safe Offline & GitHub Pages)
   ====================================================== */

const PRO_TRADES_KEY = 'pro_trades';
let tradeHistory = [];

// Safe LocalStorage Helper
function getLocalTrades() {
  try {
    const raw = localStorage.getItem(PRO_TRADES_KEY);
    if (raw !== null && raw !== '') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  // Initial seed only once if key never existed
  const defaultSeeds = [
    {
      id: 1,
      created_at: '2026-11-04 14:30',
      symbol: 'BTCUSDT',
      side: 'LONG',
      entry_price: 64200,
      exit_price: 66800,
      qty: 0.25,
      leverage: 10,
      pnl: 650.00,
      sl: 62500,
      tp: 67000,
      investor_skill: 'Minervini VCP Breakout',
      status: 'CLOSED'
    },
    {
      id: 2,
      created_at: '2026-11-04 16:15',
      symbol: 'NVDA',
      side: 'LONG',
      entry_price: 118.5,
      exit_price: null,
      qty: 15,
      leverage: 5,
      pnl: 0,
      sl: 114.0,
      tp: 128.0,
      investor_skill: 'Buffett Value Moat',
      status: 'OPEN'
    }
  ];

  try {
    localStorage.setItem(PRO_TRADES_KEY, JSON.stringify(defaultSeeds));
  } catch (e) {}
  return defaultSeeds;
}

function saveLocalTrades(trades) {
  try {
    localStorage.setItem(PRO_TRADES_KEY, JSON.stringify(trades));
  } catch (e) {}
}

async function loadTradeJournal() {
  const container = document.getElementById('journal-table-body');
  if (!container) return;

  // 1. Try local storage first to guarantee instant, reliable render
  tradeHistory = getLocalTrades();
  renderJournalTable(tradeHistory);
  calculateJournalStats(tradeHistory);
  renderActivePositionsTable();

  // 2. Try backend sync if running in cloud / local Flask
  try {
    const res = await fetch('/api/trades');
    if (res.ok) {
      const backendTrades = await res.json();
      if (Array.isArray(backendTrades) && backendTrades.length) {
        tradeHistory = backendTrades;
        saveLocalTrades(backendTrades);
        renderJournalTable(tradeHistory);
        calculateJournalStats(tradeHistory);
        renderActivePositionsTable();
      }
    }
  } catch (e) {
    // Harmless fallback to local-first data on static GitHub Pages
  }
}

function renderJournalTable(trades) {
  const container = document.getElementById('journal-table-body');
  if (!container) return;

  if (!trades || !trades.length) {
    container.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">Nessuna operazione registrata nel diario. Usa il pannello "Esecuzione Ordine" per iniziare.</td></tr>`;
    return;
  }

  container.innerHTML = trades.map(t => {
    const isLong = t.side === 'LONG';
    const sideClass = isLong ? 'color: var(--buy)' : 'color: var(--sell)';
    const pnlVal = parseFloat(t.pnl) || 0;
    const pnlClass = pnlVal > 0 ? 'text-green' : (pnlVal < 0 ? 'text-red' : '');
    const isOpen = t.status === 'OPEN';
    const dateFormatted = t.created_at ? t.created_at.replace('T', ' ').substring(0, 16) : (t.timestamp || '-');

    return `
      <tr>
        <td>#${t.id}</td>
        <td>${dateFormatted}</td>
        <td><b>${t.symbol}</b></td>
        <td><span style="${sideClass}; font-weight:700">${t.side}</span></td>
        <td>$${t.entry_price}</td>
        <td>${t.exit_price ? '$' + t.exit_price : (isOpen ? '<span style="color:var(--accent); font-weight:700;">In corso</span>' : '-')}</td>
        <td>${t.qty} (${t.leverage || 1}x)</td>
        <td>${t.sl ? '$' + t.sl : '-'} / ${t.tp ? '$' + t.tp : '-'}</td>
        <td class="${pnlClass}" style="font-weight:700">${isOpen ? '<span style="color:var(--text-muted)">-</span>' : (pnlVal >= 0 ? '+$' + pnlVal.toFixed(2) : '-$' + Math.abs(pnlVal).toFixed(2))}</td>
        <td>
          <span style="font-size:10px; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding:2px 6px; border-radius:4px; font-weight:600;">
            ${t.investor_skill || 'Discrezionale'}
          </span>
        </td>
        <td style="white-space:nowrap;">
          ${isOpen ? `<button class="btn btn-secondary" style="padding:3px 9px; font-size:10px; background:rgba(255,69,96,0.15); border-color:#ff4560; color:#ff4560; font-weight:700; margin-right:4px;" onclick="closeOpenTrade(${t.id}, ${t.entry_price}, '${t.side}', ${t.qty}, '${t.symbol}')" title="Chiudi posizione al prezzo attuale">Chiudi</button>` : ''}
          <button class="btn btn-secondary" style="padding:3px 7px; font-size:10px; color:var(--text-muted);" onclick="deleteTradeItem(${t.id})" title="Elimina record dal registro">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function calculateJournalStats(trades) {
  const total = trades.length;
  const closed = trades.filter(t => t.status === 'CLOSED');
  const wins = closed.filter(t => (t.pnl || 0) > 0);
  const losses = closed.filter(t => (t.pnl || 0) < 0);

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const netPnl = closed.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const grossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.9 : 0);

  const totalElem = document.getElementById('stat-total-trades');
  const winRateElem = document.getElementById('stat-win-rate');
  const netPnlElem = document.getElementById('stat-net-pnl');
  const pfElem = document.getElementById('stat-profit-factor');

  if (totalElem) totalElem.innerText = total;
  if (winRateElem) winRateElem.innerText = `${winRate.toFixed(1)}%`;
  if (netPnlElem) {
    netPnlElem.innerText = `${netPnl >= 0 ? '+$' : '-$'}${Math.abs(netPnl).toFixed(2)}`;
    netPnlElem.style.color = netPnl >= 0 ? 'var(--buy)' : 'var(--sell)';
  }
  if (pfElem) pfElem.innerText = profitFactor.toFixed(2);
}

// Master Position Closer (Local-First + Backend Synchronization)
async function closeOpenTrade(tradeId, entry, side, qty, symbol) {
  // Determine realistic live exit price
  const sym = symbol || (tradeHistory.find(t => String(t.id) === String(tradeId))?.symbol) || window.currentSymbol;
  let exitPrice = (sym === window.currentSymbol && window.currentLivePrice) ? window.currentLivePrice : (entry || 100);

  const priceDiff = side === 'LONG' ? (exitPrice - entry) : (entry - exitPrice);
  const pnl = +(priceDiff * (qty || 1)).toFixed(2);

  // 1. Synchronous Local-First State Update (guaranteed to succeed on all devices/browsers)
  let trades = getLocalTrades();
  let found = false;

  trades = trades.map(t => {
    if (String(t.id) === String(tradeId)) {
      found = true;
      return {
        ...t,
        status: 'CLOSED',
        exit_price: exitPrice,
        pnl: pnl,
        closed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }
    return t;
  });

  saveLocalTrades(trades);
  tradeHistory = trades;

  // Refresh all active position views immediately
  renderJournalTable(trades);
  calculateJournalStats(trades);
  renderActivePositionsTable();

  if (window.showToast) {
    window.showToast(`✓ Operazione #${tradeId} (${sym}) chiusa con successo a $${exitPrice} (PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`, pnl >= 0 ? 'success' : 'info');
  }

  // 2. Background sync to backend if online
  try {
    fetch(`/api/trades/${tradeId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exit_price: exitPrice, pnl: pnl })
    }).catch(() => {});
  } catch (e) {}
}

// Master Position Deletion
async function deleteTradeItem(tradeId) {
  if (!confirm(`Sei sicuro di voler eliminare l'operazione #${tradeId}?`)) return;

  // Local-First deletion
  let trades = getLocalTrades();
  trades = trades.filter(t => String(t.id) !== String(tradeId));
  saveLocalTrades(trades);
  tradeHistory = trades;

  renderJournalTable(trades);
  calculateJournalStats(trades);
  renderActivePositionsTable();

  if (window.showToast) {
    window.showToast(`Operazione #${tradeId} rimossa dal registro.`, 'info');
  }

  // Background backend DELETE
  try {
    fetch(`/api/trades/${tradeId}`, { method: 'DELETE' }).catch(() => {});
  } catch (e) {}
}

// Close All Open Positions in One Click
function closeAllOpenJournalTrades() {
  let trades = getLocalTrades();
  let openCount = 0;

  trades = trades.map(t => {
    if (t.status === 'OPEN') {
      openCount++;
      const exitPrice = (t.symbol === window.currentSymbol && window.currentLivePrice) ? window.currentLivePrice : t.entry_price;
      const isLong = t.side === 'LONG';
      const diff = isLong ? (exitPrice - t.entry_price) : (t.entry_price - exitPrice);
      const pnl = +(diff * (t.qty || 1)).toFixed(2);
      return {
        ...t,
        status: 'CLOSED',
        exit_price: exitPrice,
        pnl: pnl,
        closed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }
    return t;
  });

  if (openCount === 0) {
    if (window.showToast) window.showToast('Nessuna posizione aperta da chiudere.', 'info');
    return;
  }

  saveLocalTrades(trades);
  tradeHistory = trades;
  renderJournalTable(trades);
  calculateJournalStats(trades);
  renderActivePositionsTable();

  if (window.showToast) {
    window.showToast(`✓ Chiuse tutte le ${openCount} posizioni aperte!`, 'success');
  }
}

// Render Bybit Terminal Bottom Active Positions Dock
function renderActivePositionsTable() {
  const container = document.getElementById('bb-positions-table-body');
  if (!container) return;

  const trades = getLocalTrades();
  const openTrades = trades.filter(t => t.status === 'OPEN');

  const countBadge = document.querySelector('.bb-pos-tab.active');
  if (countBadge && countBadge.innerText.includes('Posizioni Attive')) {
    countBadge.innerText = `Posizioni Attive (${openTrades.length})`;
  }

  if (!openTrades.length) {
    container.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:22px; color:var(--text-muted); font-size:12px;">
          Nessuna posizione aperta al momento. Usa il pannello <b>Esecuzione Ordine</b> per aprire una posizione LONG o SHORT.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = openTrades.map(t => {
    const isLong = t.side === 'LONG';
    const sym = t.symbol || 'BTCUSDT';
    const curPrice = (sym === window.currentSymbol && window.currentLivePrice) ? window.currentLivePrice : (t.entry_price * (isLong ? 1.002 : 0.998));
    const priceDiff = isLong ? (curPrice - t.entry_price) : (t.entry_price - curPrice);
    const unPnl = +(priceDiff * (t.qty || 1)).toFixed(2);
    const initialMargin = +((t.entry_price * (t.qty || 1)) / (t.leverage || 1)).toFixed(2);
    const roi = initialMargin > 0 ? ((unPnl / initialMargin) * 100).toFixed(2) : '0.00';
    const liqPrice = isLong ? +(t.entry_price * (1 - 0.9 / (t.leverage || 1))).toFixed(2) : +(t.entry_price * (1 + 0.9 / (t.leverage || 1))).toFixed(2);

    return `
      <tr>
        <td>
          <b style="color:var(--text-main)">${sym}</b> 
          <span class="strat-tag" style="background:${isLong ? 'rgba(0,242,161,0.15)' : 'rgba(255,69,96,0.15)'}; color:${isLong ? 'var(--buy)' : 'var(--sell)'}; font-weight:800; font-size:9px; padding:2px 6px; border-radius:4px;">
            ${t.side} ${t.leverage || 1}x
          </span>
        </td>
        <td style="font-family:var(--font-mono)">${t.qty}</td>
        <td style="font-family:var(--font-mono)">$${t.entry_price}</td>
        <td style="font-family:var(--font-mono); color:#38bdf8;">$${curPrice.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); color:var(--sell)">$${liqPrice}</td>
        <td style="font-family:var(--font-mono)">$${initialMargin}</td>
        <td style="font-weight:800; font-family:var(--font-mono); color:${unPnl >= 0 ? 'var(--buy)' : 'var(--sell)'};">
          ${unPnl >= 0 ? '+' : ''}$${unPnl} (${roi >= 0 ? '+' : ''}${roi}%)
        </td>
        <td style="font-size:10px; color:var(--text-muted);">${t.tp ? '$' + t.tp : '-'} / ${t.sl ? '$' + t.sl : '-'}</td>
        <td>
          <button class="btn btn-secondary" style="padding:3px 8px; font-size:10px; background:rgba(255,69,96,0.18); border-color:#ff4560; color:#ff4560; font-weight:800;" onclick="closeOpenTrade(${t.id}, ${t.entry_price}, '${t.side}', ${t.qty}, '${sym}')">
            ✕ Chiudi Market
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Global Exports
window.loadTradeJournal = loadTradeJournal;
window.closeOpenTrade = closeOpenTrade;
window.deleteTradeItem = deleteTradeItem;
window.closeAllOpenJournalTrades = closeAllOpenJournalTrades;
window.renderActivePositionsTable = renderActivePositionsTable;

// Periodic Refresh for Real-Time Mark Price & PnL
setInterval(() => {
  if (document.getElementById('bb-positions-table-body')) {
    renderActivePositionsTable();
  }
}, 3000);
