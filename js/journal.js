/* ======================================================
   JOURNAL.JS - Trade Journal & Performance Analytics
   Win Rate, Profit Factor, Realized PnL & Trade Logs
   ====================================================== */

let tradeHistory = [];

async function loadTradeJournal() {
  const container = document.getElementById('journal-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/trades');
    tradeHistory = await res.json();
    renderJournalTable(tradeHistory);
    calculateJournalStats(tradeHistory);
  } catch (e) {
    console.error('Error loading trade journal:', e);
  }
}

function renderJournalTable(trades) {
  const container = document.getElementById('journal-table-body');
  if (!container) return;

  if (!trades.length) {
    container.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">Nessuna operazione registrata nel diario.</td></tr>`;
    return;
  }

  container.innerHTML = trades.map(t => {
    const isLong = t.side === 'LONG';
    const sideClass = isLong ? 'color: var(--buy)' : 'color: var(--sell)';
    const pnlVal = parseFloat(t.pnl) || 0;
    const pnlClass = pnlVal > 0 ? 'text-green' : (pnlVal < 0 ? 'text-red' : '');
    const isOpen = t.status === 'OPEN';
    const dateFormatted = t.created_at ? t.created_at.replace('T', ' ').substring(0, 16) : '-';

    return `
      <tr>
        <td>#${t.id}</td>
        <td>${dateFormatted}</td>
        <td><b>${t.symbol}</b></td>
        <td><span style="${sideClass}; font-weight:700">${t.side}</span></td>
        <td>$${t.entry_price}</td>
        <td>${t.exit_price ? '$' + t.exit_price : (isOpen ? '<span style="color:var(--accent)">In corso</span>' : '-')}</td>
        <td>${t.qty} (${t.leverage}x)</td>
        <td>${t.sl ? '$' + t.sl : '-'} / ${t.tp ? '$' + t.tp : '-'}</td>
        <td class="${pnlClass}" style="font-weight:700">${isOpen ? '-' : (pnlVal >= 0 ? '+$' + pnlVal.toFixed(2) : '-$' + Math.abs(pnlVal).toFixed(2))}</td>
        <td>
          <span style="font-size:10px; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding:2px 6px; border-radius:4px">
            ${t.investor_skill || 'Discrezionale'}
          </span>
        </td>
        <td>
          ${isOpen ? `<button class="btn btn-secondary" style="padding:3px 8px; font-size:10px;" onclick="closeOpenTrade(${t.id}, ${t.entry_price}, '${t.side}', ${t.qty})">Chiudi</button>` : ''}
          <button class="btn btn-secondary" style="padding:3px 6px; font-size:10px; color:var(--sell)" onclick="deleteTradeItem(${t.id})">✕</button>
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

  // Render into stats deck
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

async function closeOpenTrade(tradeId, entry, side, qty) {
  // Use current live price as exit price
  const exitPrice = window.currentLivePrice || entry;
  const priceDiff = side === 'LONG' ? (exitPrice - entry) : (entry - exitPrice);
  const pnl = priceDiff * qty;

  try {
    const res = await fetch(`/api/trades/${tradeId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exit_price: exitPrice,
        pnl: pnl
      })
    });
    const data = await res.json();
    if (data.status === 'closed') {
      showToast(`Trade #${tradeId} chiuso a $${exitPrice} (PnL: $${pnl.toFixed(2)})`, pnl >= 0 ? 'success' : 'info');
      loadTradeJournal();
    }
  } catch (e) {
    showToast('Errore durante la chiusura del trade.', 'error');
  }
}

async function deleteTradeItem(tradeId) {
  if (!confirm(`Sei sicuro di voler eliminare il trade #${tradeId}?`)) return;

  try {
    await fetch(`/api/trades/${tradeId}`, { method: 'DELETE' });
    showToast(`Trade #${tradeId} eliminato.`, 'info');
    loadTradeJournal();
  } catch (e) {
    showToast('Errore nella cancellazione del trade.', 'error');
  }
}
