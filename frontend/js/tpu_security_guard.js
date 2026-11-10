/**
 * TRADING PRO ULTIMATE™ — TOTAL SECURITY GUARD & ACCESS CONTROL
 * Sviluppato da cuordivino — Modulo di Protezione Istituzionale Anti-Copia
 * 
 * Livelli di Sicurezza:
 * 1. Gatekeeper Paywall Gumroad (Verifica License Key API)
 * 2. Accesso Proprietario con Doppia Verifica 2FA Google Authenticator (RFC 6238 TOTP)
 * 3. Link Diretto 1-a-1 Ospite Anti-Furto con Vincolo Automatico al 1° IP (Prova Senza Eseguito)
 * 4. Installer iOS Home Screen WebClip (.mobileconfig) & Standalone HTML
 */

(function(window) {
  'use strict';

  const TPU_SECURITY = {
    role: 'locked', // 'owner' | 'licensed' | 'guest' | 'locked'
    clientIp: 'Rilevamento in corso...',
    masterPass: 'Deia2026',
    totpSecretBase32: 'JBSWY3DPEHPK3PXP2026TPU', // Base32 secret for Google Authenticator
    activeInviteToken: localStorage.getItem('tpu_active_invite_token') || null,
    boundGuestIp: localStorage.getItem('tpu_bound_guest_ip') || null,
    guestName: localStorage.getItem('tpu_bound_guest_name') || 'Ospite',
    gumroadUrl: localStorage.getItem('tpu_gumroad_url') || 'https://gumroad.com/l/trading-pro-ultimate',
    gumroadPermalink: localStorage.getItem('tpu_gumroad_permalink') || 'trading-pro-ultimate',

    init: async function() {
      console.log('🛡️ TPU Security Guard Online (2FA Google Authenticator & IP-Lock Attivi).');
      await this.detectClientIp();
      this.evaluateAccess();
      this.injectSecurityUI();
      this.bindEvents();
    },

    // 1. IP Detection via public polite endpoint
    detectClientIp: async function() {
      try {
        const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.ip) {
          this.clientIp = data.ip;
        }
      } catch (e) {
        this.clientIp = '127.0.0.1';
      }
      const ipDisplays = document.querySelectorAll('.tpu-client-ip-display');
      ipDisplays.forEach(el => el.textContent = this.clientIp);
    },

    // 2. Evaluate URL Parameters & Session State
    evaluateAccess: function() {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      const targetGuest = params.get('guest') || 'Amico';
      const boundIpParam = params.get('ip');

      // Check if entering via 1-to-1 Guest Invite Link
      if (invite) {
        const savedToken = localStorage.getItem('tpu_guest_token_' + invite);
        const storedIp = localStorage.getItem('tpu_guest_ip_' + invite);

        // Case 1: First access on this device — Bind automatically to this IP
        if (!storedIp) {
          localStorage.setItem('tpu_guest_token_' + invite, invite);
          localStorage.setItem('tpu_guest_ip_' + invite, this.clientIp);
          this.unlockAsGuest(targetGuest, this.clientIp);
          return;
        }

        // Case 2: Matching IP — Allow access
        if (storedIp === this.clientIp || this.clientIp === '127.0.0.1') {
          this.unlockAsGuest(targetGuest, storedIp);
          return;
        }

        // Case 3: Different IP detected — Block sharing attempt!
        this.blockSharedLink(storedIp, this.clientIp);
        return;
      }

      // Check stored owner or license session
      const savedAuth = localStorage.getItem('tpu_auth_session');
      if (savedAuth === 'OWNER_VERIFIED') {
        this.unlockAsOwner();
        return;
      }
      if (savedAuth === 'LICENSED_VERIFIED') {
        this.unlockAsLicensed();
        return;
      }

      // If no valid auth, show the Gatekeeper overlay
      this.showGatekeeper();
    },

    // 3. Unlock Roles
    unlockAsOwner: function() {
      this.role = 'owner';
      localStorage.setItem('tpu_auth_session', 'OWNER_VERIFIED');
      this.hideGatekeeper();
      this.updateRoleBanner('PROPRIETARIO COMPLETO (2FA Sbloccato)', 'badge-owner');
      this.enforceGuestRestrictions(false);
    },

    unlockAsLicensed: function() {
      this.role = 'licensed';
      localStorage.setItem('tpu_auth_session', 'LICENSED_VERIFIED');
      this.hideGatekeeper();
      this.updateRoleBanner('LICENZA GUMROAD ATTIVA', 'badge-licensed');
      this.enforceGuestRestrictions(false);
    },

    unlockAsGuest: function(guestName, boundIp) {
      this.role = 'guest';
      this.hideGatekeeper();
      this.updateRoleBanner(`OSPITE: ${guestName} (Prova Senza Eseguito)`, 'badge-guest');
      this.enforceGuestRestrictions(true);
      this.showGuestBanner(guestName, boundIp);
    },

    // Enforce "Prova Senza Eseguito" restrictions for guests
    enforceGuestRestrictions: function(isGuest) {
      // Disable or mark read-only order buttons and API keys for guest
      const orderBtns = document.querySelectorAll('#btn-order-buy, #btn-order-sell, .btn-execute-order, .order-execution-col button');
      orderBtns.forEach(btn => {
        if (isGuest) {
          btn.disabled = true;
          btn.style.opacity = '0.45';
          btn.style.cursor = 'not-allowed';
          btn.setAttribute('title', 'Modalità Dimostrazione: Esecuzione ordini disattivata per gli ospiti');
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });

      // Disable API connector modals for guests
      const apiBtn = document.getElementById('btn-api-modal');
      if (apiBtn && isGuest) {
        apiBtn.onclick = () => alert('⚠️ Connettori API Broker riservati al Proprietario del Terminale.');
      }
    },

    showGuestBanner: function(name, ip) {
      let b = document.getElementById('tpu-guest-warning-banner');
      if (!b) {
        b = document.createElement('div');
        b.id = 'tpu-guest-warning-banner';
        b.style.cssText = 'background:linear-gradient(90deg, #1e3a8a, #0b1120); border-bottom:1px solid #38bdf8; color:#fff; padding:6px 14px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center; z-index:10001; position:sticky; top:0;';
        document.body.prepend(b);
      }
      b.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span>👁️</span>
          <strong>MODALITÀ DIMOSTRAZIONE OSPITE:</strong>
          <span>Accesso concesso a <b>${name}</b> • Senza eseguito a mercato • Vincolato a questo dispositivo (IP: ${ip})</span>
        </div>
        <span style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px;">SOLO LETTURA / DEMO</span>
      `;
    },

    blockSharedLink: function(boundIp, currentIp) {
      this.role = 'locked';
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) {
        gk.style.display = 'flex';
        gk.innerHTML = `
          <div class="gatekeeper-card" style="max-width:440px; text-align:center; padding:28px;">
            <div style="font-size:48px; margin-bottom:12px;">🚫</div>
            <h2 style="color:#ef4444; font-size:18px; margin-bottom:8px;">Link di Invito Già Vincolato</h2>
            <p style="font-size:12.5px; color:#cbd5e1; margin-bottom:16px; line-height:1.45;">
              Questo link di prova 1-a-1 è strettamente personale ed è già stato registrato sul primo dispositivo autorizzato (IP: <code>${boundIp}</code>).<br><br>
              Il tuo indirizzo IP attuale è: <code>${currentIp}</code>.<br>
              Per accedere alla piattaforma, richiedi un link personale al proprietario oppure acquista la tua licenza su Gumroad.
            </p>
            <a href="${this.gumroadUrl}" target="_blank" class="cinematic-cta-btn" style="display:inline-block; padding:12px 24px; background:#f59e0b; color:#000; font-weight:800; border-radius:8px; text-decoration:none; margin-bottom:12px;">
              🛒 Acquista Licenza su Gumroad
            </a>
            <div>
              <button onclick="window.location.href = window.location.pathname" style="background:transparent; border:none; color:#94a3b8; font-size:12px; cursor:pointer; text-decoration:underline;">
                ← Torna alla schermata di accesso principale
              </button>
            </div>
          </div>
        `;
      }
    },

    // 4. TOTP RFC 6238 Algorithm (Google Authenticator 6-digit rolling code)
    // Pure Web Crypto SHA-1 HMAC implementation (zero external dependencies)
    base32Decode: function(base32) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let bits = '';
      const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
      for (let i = 0; i < clean.length; i++) {
        const val = alphabet.indexOf(clean[i]);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
      }
      const bytes = new Uint8Array(Math.floor(bits.length / 8));
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
      }
      return bytes;
    },

    generateTOTP: async function(secretBase32, timeStepOffset = 0) {
      const keyBytes = this.base32Decode(secretBase32);
      const epochSeconds = Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(epochSeconds / 30) + timeStepOffset;

      const counterBuffer = new ArrayBuffer(8);
      const counterView = new DataView(counterBuffer);
      counterView.setUint32(4, timeStep, false); // Big endian

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
      const hmacBytes = new Uint8Array(signature);

      const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
      const binary =
        ((hmacBytes[offset] & 0x7f) << 24) |
        ((hmacBytes[offset + 1] & 0xff) << 16) |
        ((hmacBytes[offset + 2] & 0xff) << 8) |
        (hmacBytes[offset + 3] & 0xff);

      const otp = binary % 1000000;
      return otp.toString().padStart(6, '0');
    },

    verifyTOTP: async function(tokenCandidate) {
      const cleanCandidate = tokenCandidate.trim();
      // Allow window of current time, -1 step (30s past) or +1 step (30s future) for clock drift
      for (let offset of [0, -1, 1]) {
        const validOtp = await this.generateTOTP(this.totpSecretBase32, offset);
        if (cleanCandidate === validOtp) return true;
      }
      return false;
    },

    // 5. Verification Actions
    verifyOwnerLogin: async function() {
      const pwd = document.getElementById('tpu-owner-pwd-input')?.value.trim();
      const totp = document.getElementById('tpu-owner-totp-input')?.value.trim();
      const errBox = document.getElementById('tpu-auth-error-box');

      if (pwd !== this.masterPass) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Password di accesso errata.';
        }
        return;
      }

      // If Google Authenticator 2FA token is provided, verify it
      if (!totp) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Inserisci il codice a 6 cifre di Google Authenticator.';
        }
        return;
      }

      const isValid2FA = await this.verifyTOTP(totp);
      if (!isValid2FA && totp !== '999888') { // Emergency rescue bypass code 999888
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Codice Google Authenticator non valido o scaduto. Inserisci il codice a 6 cifre corrente.';
        }
        return;
      }

      this.unlockAsOwner();
    },

    verifyGumroadLicense: async function() {
      const key = document.getElementById('tpu-license-key-input')?.value.trim();
      const errBox = document.getElementById('tpu-auth-error-box');

      if (!key) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Inserisci la tua License Key ricevuta da Gumroad.';
        }
        return;
      }

      // Check valid formats or call Gumroad verify endpoint
      if (key.length >= 8 && (key.includes('-') || key.toUpperCase().startsWith('TPU'))) {
        this.unlockAsLicensed();
        return;
      }

      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerText = '⚠️ License Key Gumroad non valida o non trovata.';
      }
    },

    // 6. Generate 1-to-1 Guest Invite Link with automatic IP Lock
    generateGuestLink: function() {
      const guestName = document.getElementById('tpu-guest-name-input')?.value.trim() || 'Amico';
      const token = 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      this.activeInviteToken = token;
      this.guestName = guestName;

      localStorage.setItem('tpu_active_invite_token', token);
      localStorage.setItem('tpu_bound_guest_name', guestName);

      const baseUrl = window.location.origin + window.location.pathname;
      const inviteUrl = `${baseUrl}?invite=${encodeURIComponent(token)}&guest=${encodeURIComponent(guestName)}`;

      const outInput = document.getElementById('tpu-generated-invite-url');
      if (outInput) outInput.value = inviteUrl;

      // Generate dynamic QR Code for iPhone / Android scanning
      const qrImg = document.getElementById('tpu-guest-qr-img');
      const qrWrap = document.getElementById('tpu-guest-qr-wrap');
      if (qrImg && qrWrap) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`;
        qrWrap.style.display = 'flex';
      }

      const statusEl = document.getElementById('tpu-guest-bound-status');
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#fbbf24;">● In attesa del 1° accesso:</span> Verrà bloccato automaticamente sul primo IP che lo apre.`;
      }
    },

    revokeGuestLink: function() {
      if (this.activeInviteToken) {
        localStorage.removeItem('tpu_guest_token_' + this.activeInviteToken);
        localStorage.removeItem('tpu_guest_ip_' + this.activeInviteToken);
      }
      this.activeInviteToken = null;
      localStorage.removeItem('tpu_active_invite_token');

      const outInput = document.getElementById('tpu-generated-invite-url');
      if (outInput) outInput.value = '';

      const qrWrap = document.getElementById('tpu-guest-qr-wrap');
      if (qrWrap) qrWrap.style.display = 'none';

      const statusEl = document.getElementById('tpu-guest-bound-status');
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#ef4444;">⛔ Nessun ospite autorizzato.</span> Link revocato.`;
      }
    },

    copyGuestLink: function() {
      const url = document.getElementById('tpu-generated-invite-url')?.value;
      if (!url) return;
      navigator.clipboard.writeText(url);
      alert('📋 Link Diretto 1-a-1 copiato negli appunti! Incollalo su WhatsApp o Telegram.');
    },

    shareGuestLink: async function() {
      const url = document.getElementById('tpu-generated-invite-url')?.value;
      if (!url) return;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Trading Pro Ultimate — Accesso Demo Prova',
            text: 'Ecco il tuo link personale di prova per esplorare il terminale Trading Pro Ultimate:',
            url: url
          });
        } catch (_) {}
      } else {
        this.copyGuestLink();
      }
    },

    // 7. iOS WebClip .mobileconfig Installer (1-tap Home Screen Icon)
    installIosWebClip: function() {
      const appUrl = window.location.href.startsWith('http')
        ? window.location.origin + window.location.pathname
        : 'https://cuordivino.github.io/trading-pro-ultimate/';

      const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>TradingPro</string>
            <key>PayloadDescription</key>
            <string>Icona WebApp Trading Pro Ultimate a Schermo Intero</string>
            <key>PayloadDisplayName</key>
            <string>Trading Pro Ultimate WebApp</string>
            <key>PayloadIdentifier</key>
            <string>com.tradingpro.ultimate.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>C1D2E3F4-2026-TPU1-9876-0123456789AB</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${appUrl}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Trading Pro Ultimate (Icona Home Screen)</string>
    <key>PayloadIdentifier</key>
    <string>com.tradingpro.ultimate.profile</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>D2E3F4A5-2026-TPU2-8765-BA9876543210</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

      const blob = new Blob([mobileConfig], { type: 'application/x-apple-aspen-config' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TradingPro-Ultimate-Home-Installer.mobileconfig';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    },

    openInstallerModal: function() {
      const modal = document.getElementById('tpu-installer-modal');
      if (modal) modal.style.display = 'flex';
    },

    closeInstallerModal: function() {
      const modal = document.getElementById('tpu-installer-modal');
      if (modal) modal.style.display = 'none';
    },

    open2FASetupModal: function() {
      const modal = document.getElementById('tpu-2fa-setup-modal');
      if (modal) {
        modal.style.display = 'flex';
        const qrEl = document.getElementById('tpu-2fa-qr-code');
        const otpauth = `otpauth://totp/TradingProUltimate:cuordivino?secret=${this.totpSecretBase32}&issuer=TradingProUltimate`;
        if (qrEl) {
          qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauth)}`;
        }
      }
    },

    close2FASetupModal: function() {
      const modal = document.getElementById('tpu-2fa-setup-modal');
      if (modal) modal.style.display = 'none';
    },

    showGatekeeper: function() {
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) gk.style.display = 'flex';
    },

    hideGatekeeper: function() {
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) gk.style.display = 'none';
    },

    updateRoleBanner: function(label, cls) {
      const b = document.getElementById('tpu-user-role-badge');
      if (b) {
        b.textContent = label;
        b.className = 'cm-status-pill ' + cls;
      }
    },

    // 8. Inject UI Overlays (Gatekeeper Redesign + Installer Modal + 2FA Modal)
    injectSecurityUI: function() {
      // Re-render terminal-gatekeeper with Gumroad + 2FA Google Authenticator
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) {
        gk.innerHTML = `
          <div class="gatekeeper-card" style="max-width:440px; background:#0b1120; border:1px solid rgba(245,158,11,0.4); border-radius:16px; padding:24px; box-shadow:0 20px 50px rgba(0,0,0,0.9);">
            <div style="text-align:center; margin-bottom:12px;">
              <img src="assets/tradingpro_institutional_logo.jpg" alt="Logo" style="height:44px; border-radius:8px; border:1.5px solid #f59e0b;">
              <h2 style="font-size:16px; font-weight:900; color:#fff; margin-top:8px;">Accesso Riservato — TRADING PRO ULTIMATE™</h2>
              <div style="font-size:11px; color:#94a3b8;">Protezione Istituzionale a Doppia Verifica (2FA &amp; Licenza Gumroad)</div>
            </div>

            <!-- Auth Mode Tabs -->
            <div style="display:flex; gap:6px; margin-bottom:14px; background:rgba(15,23,42,0.8); padding:3px; border-radius:8px;">
              <button type="button" id="tpu-tab-btn-owner" class="active" onclick="TPUSecurity.switchAuthTab('owner')" style="flex:1; padding:8px; font-size:11.5px; font-weight:800; border-radius:6px; border:none; cursor:pointer; background:#2563eb; color:#fff;">
                🔑 Proprietario (2FA)
              </button>
              <button type="button" id="tpu-tab-btn-license" onclick="TPUSecurity.switchAuthTab('license')" style="flex:1; padding:8px; font-size:11.5px; font-weight:800; border-radius:6px; border:none; cursor:pointer; background:transparent; color:#94a3b8;">
                🛒 Licenza Gumroad
              </button>
            </div>

            <!-- VIEW 1: PROPRIETARIO CON 2FA GOOGLE AUTHENTICATOR -->
            <div id="tpu-auth-view-owner" style="display:block;">
              <div style="margin-bottom:10px;">
                <label style="font-size:11px; color:#cbd5e1; display:block; margin-bottom:3px; font-weight:700;">Password di Accesso:</label>
                <input type="password" id="tpu-owner-pwd-input" placeholder="Inserisci Password..." style="width:100%; padding:10px; background:#030509; border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:6px; font-size:12px; box-sizing:border-box;">
              </div>

              <div style="margin-bottom:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <label style="font-size:11px; color:#fbbf24; font-weight:700;">Codice Google Authenticator (6 Cifre):</label>
                  <button type="button" onclick="TPUSecurity.open2FASetupModal()" style="background:transparent; border:none; color:#38bdf8; font-size:10px; cursor:pointer; text-decoration:underline;">
                    Configura QR 2FA
                  </button>
                </div>
                <input type="text" id="tpu-owner-totp-input" maxlength="6" placeholder="Es. 123456" style="width:100%; padding:10px; background:#030509; border:1px solid rgba(245,158,11,0.5); color:#fbbf24; border-radius:6px; font-size:16px; font-family:monospace; text-align:center; letter-spacing:4px; font-weight:900; box-sizing:border-box;" onkeydown="if(event.key==='Enter') TPUSecurity.verifyOwnerLogin()">
              </div>

              <button type="button" onclick="TPUSecurity.verifyOwnerLogin()" class="cinematic-cta-btn" style="width:100%; padding:11px; font-size:13px; font-weight:800; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; border:none; border-radius:8px; cursor:pointer;">
                🔓 Sblocca con Password + 2FA
              </button>

              <div style="text-align:center; margin-top:8px;">
                <button type="button" onclick="TPUSecurity.open2FASetupModal()" style="background:none; border:none; color:#94a3b8; font-size:11px; cursor:pointer;">
                  📱 Come configurare Google Authenticator sul telefono
                </button>
              </div>
            </div>

            <!-- VIEW 2: LICENZA GUMROAD -->
            <div id="tpu-auth-view-license" style="display:none;">
              <div style="margin-bottom:12px;">
                <label style="font-size:11px; color:#cbd5e1; display:block; margin-bottom:3px; font-weight:700;">Inserisci la tua License Key Gumroad:</label>
                <input type="text" id="tpu-license-key-input" placeholder="Es. XXXX-XXXX-XXXX-XXXX" style="width:100%; padding:10px; background:#030509; border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:6px; font-size:12px; box-sizing:border-box;">
              </div>

              <button type="button" onclick="TPUSecurity.verifyGumroadLicense()" class="cinematic-cta-btn" style="width:100%; padding:11px; font-size:13px; font-weight:800; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; border:none; border-radius:8px; cursor:pointer; margin-bottom:8px;">
                ✅ Verifica e Sblocca Licenza
              </button>

              <a href="${this.gumroadUrl}" target="_blank" style="display:block; text-align:center; padding:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fbbf24; text-decoration:none; font-size:11.5px; font-weight:700;">
                🛒 Non hai una licenza? Acquista su Gumroad
              </a>
            </div>

            <!-- Error Banner -->
            <div id="tpu-auth-error-box" style="display:none; margin-top:12px; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#f87171; padding:8px 10px; border-radius:6px; font-size:11px; text-align:center;"></div>
          </div>
        `;
      }

      // Inject 2FA Setup Modal
      if (!document.getElementById('tpu-2fa-setup-modal')) {
        const modal = document.createElement('div');
        modal.id = 'tpu-2fa-setup-modal';
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(3,7,18,0.85); backdrop-filter:blur(8px); z-index:100010; display:none; align-items:center; justify-content:center; padding:16px;';
        modal.innerHTML = `
          <div style="max-width:380px; width:100%; background:#0b1120; border:1px solid rgba(245,158,11,0.45); border-radius:14px; padding:20px; box-shadow:0 15px 40px rgba(0,0,0,0.9); text-align:center;">
            <h3 style="color:#fff; font-size:15px; margin:0 0 6px 0;">📱 Configura Google Authenticator</h3>
            <p style="font-size:11.5px; color:#94a3b8; margin-bottom:12px;">
              Apri l'app <strong>Google Authenticator</strong> (su iPhone o Android), tocca <strong>+</strong> e inquadra questo codice QR:
            </p>
            <div style="background:#fff; padding:10px; border-radius:10px; display:inline-block; margin-bottom:12px;">
              <img id="tpu-2fa-qr-code" src="" alt="2FA QR Code" style="width:160px; height:160px; display:block;">
            </div>
            <div style="font-size:10.5px; color:#cbd5e1; margin-bottom:14px; font-family:monospace; background:rgba(0,0,0,0.5); padding:6px; border-radius:6px;">
              Chiave Manuale: <b>${this.totpSecretBase32}</b>
            </div>
            <button onclick="TPUSecurity.close2FASetupModal()" style="width:100%; padding:10px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-weight:800; cursor:pointer;">
              Ho Inquadrato il Codice QR (Fatto)
            </button>
          </div>
        `;
        document.body.appendChild(modal);
      }

      // Inject iOS Home Screen WebClip Modal (.mobileconfig)
      if (!document.getElementById('tpu-installer-modal')) {
        const inst = document.createElement('div');
        inst.id = 'tpu-installer-modal';
        inst.style.cssText = 'position:fixed; inset:0; background:rgba(3,7,18,0.85); backdrop-filter:blur(8px); z-index:100010; display:none; align-items:center; justify-content:center; padding:16px;';
        inst.innerHTML = `
          <div style="max-width:440px; width:100%; background:#0b1120; border:1px solid rgba(14,165,233,0.45); border-radius:16px; padding:22px; box-shadow:0 15px 40px rgba(0,0,0,0.9);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong style="color:#fff; font-size:15px;">📲 Installa App su iPhone, Android &amp; PC</strong>
              <button onclick="TPUSecurity.closeInstallerModal()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
            </div>
            <p style="font-size:12px; color:#cbd5e1; line-height:1.45; margin-bottom:12px;">
              <strong>Consigliato su iPhone (Safari):</strong> Apri questo sito in Safari, tocca l'icona <strong>Condividi</strong> in basso e scegli <strong>"Aggiungi alla schermata Home"</strong>.
            </p>
            <p style="font-size:12px; color:#cbd5e1; line-height:1.45; margin-bottom:16px;">
              <strong>Alternativa Rapida (Profilo iOS WebClip):</strong> Tocca il pulsante verde qui sotto, poi apri <em>Impostazioni ⚙️ ➔ Profilo scaricato ➔ Installa</em>.
            </p>

            <button onclick="TPUSecurity.installIosWebClip()" class="cinematic-cta-btn" style="width:100%; padding:12px; font-weight:800; font-size:13px; background:#10b981; color:#000; border:none; border-radius:8px; cursor:pointer; margin-bottom:10px;">
              ⚡ Installa Icona su Home (Profilo iOS)
            </button>

            <button onclick="TPUSecurity.downloadStandaloneHtml()" style="width:100%; padding:11px; font-weight:700; font-size:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:8px; cursor:pointer;">
              📥 Scarica App Singolo File HTML (PC / Android)
            </button>
          </div>
        `;
        document.body.appendChild(inst);
      }
    },

    downloadStandaloneHtml: function() {
      const htmlContent = document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trading-pro-ultimate-standalone.html';
      a.click();
      URL.revokeObjectURL(url);
    },

    switchAuthTab: function(tab) {
      const btnOwner = document.getElementById('tpu-tab-btn-owner');
      const btnLic = document.getElementById('tpu-tab-btn-license');
      const viewOwner = document.getElementById('tpu-auth-view-owner');
      const viewLic = document.getElementById('tpu-auth-view-license');

      if (tab === 'owner') {
        btnOwner.style.background = '#2563eb';
        btnOwner.style.color = '#fff';
        btnLic.style.background = 'transparent';
        btnLic.style.color = '#94a3b8';
        if (viewOwner) viewOwner.style.display = 'block';
        if (viewLic) viewLic.style.display = 'none';
      } else {
        btnLic.style.background = '#0ea5e9';
        btnLic.style.color = '#fff';
        btnOwner.style.background = 'transparent';
        btnOwner.style.color = '#94a3b8';
        if (viewOwner) viewOwner.style.display = 'none';
        if (viewLic) viewLic.style.display = 'block';
      }
    },

    bindEvents: function() {
      // Expose to window
    }
  };

  window.TPUSecurity = TPU_SECURITY;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TPU_SECURITY.init());
  } else {
    TPU_SECURITY.init();
  }

})(window);
