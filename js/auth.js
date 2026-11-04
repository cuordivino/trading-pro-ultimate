/**
 * TRADING PRO ULTIMATE™ — AUTHENTICATION & GATEKEEPER MODULE
 * © by cuordivino — Tutti i diritti riservati
 * 
 * Client-Side SHA-256 Gatekeeper Security for GitHub Pages & Cloud
 * Master default passwords: "cuordivino2026" or "cuordivino"
 */

const MASTER_PASSWORD_HASHES = [
  '7484973ae1aecdbc52b84e9c157d9e2885c7341191a6bcd4b5df3b3977ced718', // cuordivino2026
  '50321debce286d37c6ecb1577e8d752952e8354e9bdd6ad6e8cac6fc640ec056'  // cuordivino
];

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check on initial load
document.addEventListener('DOMContentLoaded', function() {
  checkAuthenticationState();
});

function checkAuthenticationState() {
  const gatekeeper = document.getElementById('terminal-gatekeeper');
  if (!gatekeeper) return;

  const sessionToken = sessionStorage.getItem('tpu_auth_session');
  const persistentToken = localStorage.getItem('tpu_auth_persistent');
  const expiry = parseInt(localStorage.getItem('tpu_auth_expiry') || '0', 10);

  const now = Date.now();
  if (sessionToken === 'authenticated' || (persistentToken === 'authenticated' && expiry > now)) {
    // Already unlocked
    gatekeeper.classList.add('unlocked');
    setTimeout(() => {
      gatekeeper.style.display = 'none';
    }, 400);
  } else {
    // Locked
    gatekeeper.style.display = 'flex';
    gatekeeper.classList.remove('unlocked');
    setTimeout(() => {
      document.getElementById('gatekeeper-pwd')?.focus();
    }, 100);
  }
}

async function verifyTerminalPassword() {
  const input = document.getElementById('gatekeeper-pwd');
  const errorBanner = document.getElementById('gk-error-msg');
  const rememberCheckbox = document.getElementById('gk-remember-device');
  const gatekeeper = document.getElementById('terminal-gatekeeper');

  if (!input) return;
  const typedPwd = input.value.trim();

  if (!typedPwd) {
    if (errorBanner) {
      errorBanner.innerText = '⚠️ Inserisci la password di accesso.';
      errorBanner.style.display = 'block';
    }
    input.classList.add('gk-shake');
    setTimeout(() => input.classList.remove('gk-shake'), 500);
    return;
  }

  const hash = await sha256(typedPwd);

  // Check custom user-configured hash from Settings first, otherwise master hashes
  const customHash = localStorage.getItem('tpu_custom_pwd_hash');
  const guestHash = localStorage.getItem('tpu_guest_pwd_hash');

  const isValid = (customHash && hash === customHash) ||
                  (guestHash && hash === guestHash) ||
                  MASTER_PASSWORD_HASHES.includes(hash);

  if (isValid) {
    // Access Granted
    if (errorBanner) errorBanner.style.display = 'none';

    sessionStorage.setItem('tpu_auth_session', 'authenticated');

    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('tpu_auth_persistent', 'authenticated');
      // 7 days expiration
      localStorage.setItem('tpu_auth_expiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    } else {
      localStorage.removeItem('tpu_auth_persistent');
      localStorage.removeItem('tpu_auth_expiry');
    }

    gatekeeper.classList.add('unlocked');
    setTimeout(() => {
      gatekeeper.style.display = 'none';
      if (window.showToast) {
        window.showToast('Accesso consentito! Benvenuto in Trading Pro Ultimate™', 'success');
      }
    }, 450);

  } else {
    // Access Denied
    if (errorBanner) {
      errorBanner.innerText = '⚠️ Accesso Negato: Password non valida o non autorizzata.';
      errorBanner.style.display = 'block';
    }
    input.classList.add('gk-shake');
    setTimeout(() => input.classList.remove('gk-shake'), 500);
    input.select();
  }
}

function lockTerminal() {
  sessionStorage.removeItem('tpu_auth_session');
  localStorage.removeItem('tpu_auth_persistent');
  localStorage.removeItem('tpu_auth_expiry');

  const gatekeeper = document.getElementById('terminal-gatekeeper');
  if (gatekeeper) {
    gatekeeper.style.display = 'flex';
    gatekeeper.classList.remove('unlocked');
    const input = document.getElementById('gatekeeper-pwd');
    if (input) {
      input.value = '';
      input.focus();
    }
    const err = document.getElementById('gk-error-msg');
    if (err) err.style.display = 'none';
  }

  if (window.showToast) {
    window.showToast('Terminale Bloccato con successo.', 'info');
  }
}

function toggleGatekeeperPwdVisibility() {
  const input = document.getElementById('gatekeeper-pwd');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Password Management in Settings Tab
async function updateTerminalPassword() {
  const currentPwd = document.getElementById('sec-current-pwd')?.value.trim();
  const newPwd = document.getElementById('sec-new-pwd')?.value.trim();
  const confirmPwd = document.getElementById('sec-confirm-pwd')?.value.trim();

  if (!newPwd) {
    if (window.showToast) window.showToast('Inserisci una nuova password valida.', 'error');
    return;
  }

  if (newPwd !== confirmPwd) {
    if (window.showToast) window.showToast('La nuova password e la conferma non coincidono.', 'error');
    return;
  }

  // Verify current password
  const currHash = await sha256(currentPwd);
  const existingCustom = localStorage.getItem('tpu_custom_pwd_hash');
  const isCurrValid = (existingCustom && currHash === existingCustom) || MASTER_PASSWORD_HASHES.includes(currHash);

  if (!isCurrValid) {
    if (window.showToast) window.showToast('Password attuale non corretta.', 'error');
    return;
  }

  // Save new hash
  const newHash = await sha256(newPwd);
  localStorage.setItem('tpu_custom_pwd_hash', newHash);

  // Clear inputs
  document.getElementById('sec-current-pwd').value = '';
  document.getElementById('sec-new-pwd').value = '';
  document.getElementById('sec-confirm-pwd').value = '';

  if (window.showToast) {
    window.showToast('Nuova password di accesso impostata con successo!', 'success');
  }
}

async function setGuestAccessPassword() {
  const guestPwd = document.getElementById('sec-guest-pwd')?.value.trim();
  if (!guestPwd) {
    localStorage.removeItem('tpu_guest_pwd_hash');
    if (window.showToast) window.showToast('Password Ospite rimossa.', 'info');
    return;
  }
  const hash = await sha256(guestPwd);
  localStorage.setItem('tpu_guest_pwd_hash', hash);
  if (window.showToast) window.showToast(`Password Ospite (${guestPwd}) attivata con successo!`, 'success');
}
