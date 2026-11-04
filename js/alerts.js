/* ======================================================
   ALERTS.JS & SETTINGS
   Price Alerts, Telegram Notifications & API Keys
   ====================================================== */

let activeAlerts = [];

async function loadAlerts() {
  const container = document.getElementById('alerts-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/alerts');
    activeAlerts = await res.json();
    renderAlertsTable(activeAlerts);
  } catch (e) {
    console.error('Error loading alerts:', e);
  }
}

function renderAlertsTable(alerts) {
  const container = document.getElementById('alerts-table-body');
  if (!container) return;

  if (!alerts.length) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-muted);">Nessun allarme attivo configurato.</td></tr>`;
    return;
  }

  container.innerHTML = alerts.map(a => {
    return `
      <tr>
        <td>#${a.id}</td>
        <td><b>${a.symbol}</b></td>
        <td><span style="color:var(--cyan); font-weight:700">${a.condition}</span></td>
        <td>$${a.target_price}</td>
        <td>${a.skill_slug || 'Prezzo Semplice'}</td>
        <td>
          <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px; color:var(--sell)" onclick="deleteAlertItem(${a.id})">Elimina</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function addAlert() {
  const symbol = window.currentSymbol || 'BTCUSDT';
  const cond = document.getElementById('alert-condition-select')?.value || 'ABOVE';
  const price = parseFloat(document.getElementById('alert-target-price')?.value);
  const skill = document.getElementById('alert-skill-select')?.value || '';

  if (!price || price <= 0) {
    showToast('Inserisci un prezzo obiettivo valido.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol,
        condition: cond,
        target_price: price,
        skill_slug: skill
      })
    });
    const data = await res.json();
    if (data.status === 'created') {
      showToast(`Allarme impostato su ${symbol} a $${price}`, 'success');
      loadAlerts();
    }
  } catch (e) {
    showToast('Errore durante la creazione dell\'allarme.', 'error');
  }
}

async function deleteAlertItem(id) {
  try {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    showToast(`Allarme #${id} rimosso.`, 'info');
    loadAlerts();
  } catch (e) {
    showToast('Errore durante l\'eliminazione.', 'error');
  }
}

// Settings
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();

    const capInput = document.getElementById('set-capital');
    const riskInput = document.getElementById('set-risk-pct');
    const profSelect = document.getElementById('set-risk-profile');
    const tgToken = document.getElementById('set-tg-token');
    const tgChat = document.getElementById('set-tg-chat');
    const bybitKey = document.getElementById('set-bybit-key');
    const bybitSecret = document.getElementById('set-bybit-secret');

    if (capInput && settings.initial_capital) capInput.value = settings.initial_capital;
    if (riskInput && settings.risk_percentage) riskInput.value = settings.risk_percentage;
    if (profSelect && settings.risk_profile) profSelect.value = settings.risk_profile;
    if (tgToken && settings.telegram_token) tgToken.value = settings.telegram_token;
    if (tgChat && settings.telegram_chat_id) tgChat.value = settings.telegram_chat_id;
    if (bybitKey && settings.bybit_key) bybitKey.value = settings.bybit_key;
    if (bybitSecret && settings.bybit_secret) bybitSecret.value = settings.bybit_secret;

    defaultCapital = parseFloat(settings.initial_capital) || 25000;
    defaultRiskPct = parseFloat(settings.risk_percentage) || 1.5;
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

async function saveSettings() {
  const settings = {
    initial_capital: document.getElementById('set-capital')?.value || '25000',
    risk_percentage: document.getElementById('set-risk-pct')?.value || '1.5',
    risk_profile: document.getElementById('set-risk-profile')?.value || 'moderate',
    telegram_token: document.getElementById('set-tg-token')?.value || '',
    telegram_chat_id: document.getElementById('set-tg-chat')?.value || '',
    bybit_key: document.getElementById('set-bybit-key')?.value || '',
    bybit_secret: document.getElementById('set-bybit-secret')?.value || ''
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (data.status === 'updated') {
      defaultCapital = parseFloat(settings.initial_capital) || 25000;
      defaultRiskPct = parseFloat(settings.risk_percentage) || 1.5;
      showToast('Impostazioni salvate con successo!', 'success');
    }
  } catch (e) {
    showToast('Errore durante il salvataggio delle impostazioni.', 'error');
  }
}

async function testTelegramNotification() {
  try {
    const res = await fetch('/api/telegram/test', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('Messaggio Telegram di test inviato!', 'success');
    } else {
      showToast('Invio fallito. Controlla il Token del bot e Chat ID.', 'error');
    }
  } catch (e) {
    showToast('Errore durante il test Telegram.', 'error');
  }
}
