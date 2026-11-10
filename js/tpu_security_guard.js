/**
 * TRADING PRO ULTIMATE™ — TOTAL SECURITY GUARD, FACE ID (WEBAUTHN), QR HUB & 4 ACCESS LEVELS
 * Sviluppato da cuordivino — Modulo di Protezione Istituzionale Anti-Copia
 * 
 * I 4 Livelli di Accesso:
 * 1. PROPRIETARIO COMPLETO (Pass: Deia2026 + Sblocco Face ID iPhone Nativo + QR Auto-Login + 2FA Opzionale)
 * 2. OSPITE SPETTATORE BLINDATO (Link/QR 1-a-1 + IP-Lock + Solo Visione + Input Congelati + Anti-Copia + Filigrana)
 * 3. OSPITE DEMO INTERATTIVA (Link/QR 1-a-1 + IP-Lock + Simulazione Senza Mercato Reale e Senza API)
 * 4. CLIENTE LICENZA GUMROAD (Paywall Commerciale + Verifica License Key)
 */

(function(window) {
  'use strict';

  const TPU_SECURITY = {
    role: 'locked', // 'owner' | 'licensed' | 'guest' | 'locked'
    guestPerm: 'spectator', // 'spectator' (Blindato: solo visione, no modifiche, no copia) | 'demo_unlocked'
    clientIp: 'Rilevamento in corso...',
    masterPass: 'Deia2026',
    ownerQuickToken: 'TPU-OWNER-DEIA2026',
    totpSecretBase32: 'JBSWY3DPEHPK3PXP2026TPU', // Base32 secret for Google Authenticator
    require2FAForOwner: localStorage.getItem('tpu_require_2fa_owner') === 'true', // Opzionale di default per non bloccare il proprietario su WebClip iOS
    faceIdCredentialId: localStorage.getItem('tpu_faceid_cred_id') || null,
    activeInviteToken: localStorage.getItem('tpu_active_invite_token') || null,
    boundGuestIp: localStorage.getItem('tpu_bound_guest_ip') || null,
    guestName: localStorage.getItem('tpu_bound_guest_name') || 'Amico / Collaboratore',
    gumroadUrl: localStorage.getItem('tpu_gumroad_url') || 'https://gumroad.com/l/trading-pro-ultimate',
    gumroadPermalink: localStorage.getItem('tpu_gumroad_permalink') || 'trading-pro-ultimate',
    antiCopyHandlersBound: false,

    init: async function() {
      console.log('🛡️ TPU Security Guard v3.0 Online (Face ID iPhone + QR Hub 4 Livelli + IP-Lock + Anti-Theft).');
      await this.detectClientIp();
      this.injectSecurityUI();
      this.injectTopBarQuickButtons();
      this.evaluateAccess();
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
      const ownerKey = params.get('owner_key') || params.get('pass');
      const invite = params.get('invite');
      const targetGuest = params.get('guest') || 'Amico';
      const permMode = params.get('perm') || 'spectator';

      // Case 0: Direct Owner Auto-Login via Owner QR Code or Pre-Unlocked iOS Home WebClip
      if (ownerKey === this.masterPass || ownerKey === this.ownerQuickToken) {
        this.unlockAsOwner('PROPRIETARIO COMPLETO (Auto-Login iPhone)');
        // Clean URL without reloading so secret isn't left in address bar
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (_) {}
        return;
      }

      // Check if entering via 1-to-1 Guest Invite Link / QR Code
      if (invite) {
        const storedIp = localStorage.getItem('tpu_guest_ip_' + invite);

        // Case 1: First access on this device — Bind automatically to this IP
        if (!storedIp) {
          localStorage.setItem('tpu_guest_token_' + invite, invite);
          localStorage.setItem('tpu_guest_ip_' + invite, this.clientIp);
          this.unlockAsGuest(targetGuest, this.clientIp, permMode);
          return;
        }

        // Case 2: Matching IP — Allow access
        if (storedIp === this.clientIp || this.clientIp === '127.0.0.1') {
          this.unlockAsGuest(targetGuest, storedIp, permMode);
          return;
        }

        // Case 3: Different IP detected — Block sharing attempt!
        this.blockSharedLink(storedIp, this.clientIp);
        return;
      }

      // Check stored owner or license session in localStorage
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
    unlockAsOwner: function(customBadge) {
      this.role = 'owner';
      localStorage.setItem('tpu_auth_session', 'OWNER_VERIFIED');
      this.hideGatekeeper();
      const b = document.getElementById('tpu-guest-warning-banner');
      if (b) b.remove();
      this.updateRoleBanner(customBadge || 'PROPRIETARIO COMPLETO (Deia2026)', 'badge-owner');
      this.enforceGuestRestrictions(false);
    },

    unlockAsLicensed: function() {
      this.role = 'licensed';
      localStorage.setItem('tpu_auth_session', 'LICENSED_VERIFIED');
      this.hideGatekeeper();
      this.updateRoleBanner('LICENZA GUMROAD ATTIVA', 'badge-licensed');
      this.enforceGuestRestrictions(false);
    },

    unlockAsGuest: function(guestName, boundIp, perm = 'spectator') {
      this.role = 'guest';
      this.guestPerm = perm;
      this.hideGatekeeper();
      const badgeText = perm === 'spectator'
        ? `OSPITE: ${guestName} (Solo Visione Blindata)`
        : `OSPITE: ${guestName} (Demo Interattiva)`;
      this.updateRoleBanner(badgeText, 'badge-guest');
      this.enforceGuestRestrictions(true, guestName, boundIp, perm);
      this.showGuestBanner(guestName, boundIp, perm);
    },

    // =========================================================================
    // APPLE FACE ID / TOUCH ID BIOMETRIC AUTHENTICATION (WebAuthn Passkey API)
    // =========================================================================
    isBiometricAvailable: function() {
      return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
    },

    registerFaceID: async function() {
      if (!this.isBiometricAvailable()) {
        alert('⚠️ Face ID / WebAuthn richiede HTTPS (es. GitHub Pages) su Safari o App Home iPhone.');
        return;
      }

      // Ensure user is owner or has entered master password
      const pwdInput = document.getElementById('tpu-owner-pwd-input')?.value.trim();
      if (this.role !== 'owner' && pwdInput !== this.masterPass) {
        const askPwd = prompt('Inserisci la tua Password Proprietario (Deia2026) per associare il Face ID di questo iPhone:');
        if (!askPwd || askPwd.trim() !== this.masterPass) {
          alert('⚠️ Password Proprietario non valida. Inserisci Deia2026 per attivare Face ID.');
          return;
        }
      }

      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const publicKeyOptions = {
          challenge: challenge,
          rp: {
            name: 'Trading Pro Ultimate',
            id: window.location.hostname || 'localhost'
          },
          user: {
            id: userId,
            name: 'cuordivino@tradingpro.ultimate',
            displayName: 'Proprietario (cuordivino)'
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   // ES256 (Apple Face ID / Secure Enclave standard)
            { type: 'public-key', alg: -257 }  // RS256 fallback
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Forces built-in iPhone Face ID / Touch ID / Windows Hello
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        };

        const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
        if (credential && credential.rawId) {
          const credIdBase64 = this.bufferToBase64(credential.rawId);
          this.faceIdCredentialId = credIdBase64;
          localStorage.setItem('tpu_faceid_cred_id', credIdBase64);
          this.updateFaceIdUIState();
          this.unlockAsOwner('PROPRIETARIO (Face ID Attivo)');
          this.showSecurityToast('✅ Face ID / Touch ID registrato con successo su questo dispositivo!');
          alert('✅ Face ID iPhone registrato con successo!\n\nDa ora ti basterà toccare "👤 Entra con Face ID" per sbloccare il terminale con lo sguardo.');
        }
      } catch (err) {
        console.warn('WebAuthn Registration Notice:', err);
        alert('ℹ️ Verifica Face ID annullata o già attiva su questo dispositivo. Assicurati di aprire il link HTTPS su Safari/Home iPhone.');
      }
    },

    loginWithFaceID: async function() {
      if (!this.isBiometricAvailable()) {
        alert('⚠️ Face ID non supportato su questa connessione. Usa la password Deia2026.');
        return;
      }

      const savedCredId = localStorage.getItem('tpu_faceid_cred_id');
      if (!savedCredId) {
        // First time pressing Face ID button: guide them to register it in 1 step
        const confirmReg = confirm('👤 Face ID non è ancora associato a questa icona/browser.\n\nVuoi attivare subito il Face ID del tuo iPhone inserendo la password Deia2026 una sola volta?');
        if (confirmReg) {
          await this.registerFaceID();
        }
        return;
      }

      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const allowCredentials = [{
          type: 'public-key',
          id: this.base64ToBuffer(savedCredId),
          transports: ['internal']
        }];

        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            allowCredentials: allowCredentials,
            userVerification: 'required',
            timeout: 60000
          }
        });

        if (assertion) {
          this.unlockAsOwner('PROPRIETARIO (Sbloccato con Face ID)');
          this.showSecurityToast('👤 Identità confermata con Face ID — Benvenuto Proprietario!');
        }
      } catch (err) {
        console.warn('Face ID Login Notice:', err);
        const errBox = document.getElementById('tpu-auth-error-box');
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Riconoscimento Face ID annullato o non riuscito. Riprova o usa la password Deia2026.';
        }
      }
    },

    bufferToBase64: function(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },

    base64ToBuffer: function(base64) {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    },

    updateFaceIdUIState: function() {
      const hasFaceId = !!localStorage.getItem('tpu_faceid_cred_id');
      const statusEls = document.querySelectorAll('.tpu-faceid-status-label');
      statusEls.forEach(el => {
        el.innerHTML = hasFaceId
          ? '<span style="color:#10b981; font-weight:800;">● Face ID Attivo su questo dispositivo</span>'
          : '<span style="color:#fbbf24; font-weight:700;">○ Face ID non ancora registrato su questa schermata</span>';
      });
    },

    // Toast Alert for blocked actions in Spectator mode
    showSecurityToast: function(msg) {
      let t = document.getElementById('tpu-security-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'tpu-security-toast';
        t.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#0f172a; border:1px solid #f59e0b; color:#fbbf24; padding:10px 18px; border-radius:8px; font-size:12px; font-weight:700; z-index:100050; box-shadow:0 10px 30px rgba(0,0,0,0.85); transition:opacity 0.3s ease; pointer-events:none; text-align:center; max-width:90vw;';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.display = 'block';
      t.style.opacity = '1';
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        if (t) t.style.opacity = '0';
        setTimeout(() => { if (t) t.style.display = 'none'; }, 300);
      }, 2800);
    },

    // Enforce "Spettatore Blindato" restrictions for guests
    enforceGuestRestrictions: function(isGuest, guestName = 'Ospite', boundIp = '', perm = 'spectator') {
      const styleId = 'tpu-spectator-anti-theft-styles';
      const watermarkId = 'tpu-spectator-watermark-overlay';

      // 1. Trading Execution & Sensitive Action Buttons: ALWAYS blocked for any guest
      const orderSelectors = [
        '#btn-order-buy', '#btn-order-sell', '.btn-execute-order', '.order-execution-col button',
        '.btn-place-order', '#btn-api-modal', '.cm-save-btn', '#btn-clear-history',
        '#btn-save-keys', '#btn-reset-balance', '#btn-deposit', '#btn-withdraw',
        '#btn-save-gumroad', '#tpu-btn-save-keys'
      ];
      orderSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
          if (isGuest) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.cursor = 'not-allowed';
            btn.setAttribute('title', '🔒 Modalità Ospite: Esecuzione ordini e modifiche riservate al proprietario.');
          } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
          }
        });
      });

      const apiBtn = document.getElementById('btn-api-modal');
      if (apiBtn && isGuest) {
        apiBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showSecurityToast('🔒 Connettori API Broker riservati al Proprietario.');
        };
      }

      // 2. Spectator Mode ("Spettatore Blindato"):
      if (isGuest && perm === 'spectator') {
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            body.tpu-spectator-mode * {
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-touch-callout: none !important;
            }
            body.tpu-spectator-mode input:not(#tpu-owner-pwd-input):not(#tpu-owner-totp-input):not(.tpu-nav-search),
            body.tpu-spectator-mode select:not(.tpu-nav-select):not(.tpu-view-select),
            body.tpu-spectator-mode textarea,
            body.tpu-spectator-mode input[type="range"] {
              pointer-events: none !important;
              opacity: 0.65 !important;
              filter: grayscale(35%) !important;
              cursor: not-allowed !important;
            }
            body.tpu-spectator-mode .chapters-nav-desktop,
            body.tpu-spectator-mode .nav-tabs-container,
            body.tpu-spectator-mode .mobile-drawer,
            body.tpu-spectator-mode .drawer-section-item,
            body.tpu-spectator-mode .chapter-btn,
            body.tpu-spectator-mode .tab-btn,
            body.tpu-spectator-mode .tpu-chapter-pill,
            body.tpu-spectator-mode .timeframe-btn,
            body.tpu-spectator-mode .symbol-chip,
            body.tpu-spectator-mode .btn-tf,
            body.tpu-spectator-mode .bybit-sym-btn,
            body.tpu-spectator-mode .accordion-toggle,
            body.tpu-spectator-mode .tpu-allow-click {
              pointer-events: auto !important;
              cursor: pointer !important;
            }
          `;
          document.head.appendChild(style);
        }
        document.body.classList.add('tpu-spectator-mode');

        document.querySelectorAll('input:not(#tpu-owner-pwd-input):not(#tpu-owner-totp-input), textarea').forEach(el => {
          el.setAttribute('readonly', 'true');
        });

        const sensitiveCodeBlocks = document.querySelectorAll('#tfm-sql-code, #tfm-python-code, .algorithm-source-code');
        sensitiveCodeBlocks.forEach(el => {
          if (!el.dataset.originalCode) {
            el.dataset.originalCode = el.innerHTML;
          }
          el.innerHTML = '<span style="color:#f59e0b; font-weight:800; font-family:monospace;">🔒 [CODICE PROPRIETARIO RISERVATO — SOLA VISIONE RISULTATI &amp; GRAFICI]</span>';
        });

        if (!document.getElementById(watermarkId)) {
          const wm = document.createElement('div');
          wm.id = watermarkId;
          wm.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:99990; overflow:hidden; opacity:0.065; display:flex; flex-direction:column; justify-content:space-around; align-items:center; transform:rotate(-22deg) scale(1.3);';
          
          let patternHtml = '';
          const repeatText = `OSPITE AUTORIZZATO: ${guestName.toUpperCase()} • IP: ${boundIp || this.clientIp} • SOLO VISIONE SPETTATORE — VIETATA LA COPIA O CONDIVISIONE • TRADING PRO ULTIMATE™`;
          for (let i = 0; i < 20; i++) {
            patternHtml += `<div style="white-space:nowrap; font-size:13.5px; font-weight:900; color:#fbbf24; letter-spacing:2px; margin:22px 0;">${repeatText}</div>`;
          }
          wm.innerHTML = patternHtml;
          document.body.appendChild(wm);
        }

        if (!this.antiCopyHandlersBound) {
          this.antiCopyHandlersBound = true;

          document.addEventListener('contextmenu', (e) => {
            if (this.role === 'guest' && this.guestPerm === 'spectator') {
              e.preventDefault();
              this.showSecurityToast('🔒 Modalità Spettatore Blindato: Tasto destro disabilitato per protezione del codice sorgente.');
              return false;
            }
          }, true);

          document.addEventListener('keydown', (e) => {
            if (this.role === 'guest' && this.guestPerm === 'spectator') {
              const k = e.key.toLowerCase();
              if (k === 'f12' ||
                  ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
                  ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's' || k === 'p' || k === 'c' || k === 'x'))) {
                e.preventDefault();
                e.stopPropagation();
                this.showSecurityToast('🔒 Azione bloccata in Modalità Spettatore (Protezione Codice & Dati Attiva).');
                return false;
              }
            }
          }, true);

          document.addEventListener('copy', (e) => {
            if (this.role === 'guest' && this.guestPerm === 'spectator') {
              e.preventDefault();
              if (e.clipboardData) {
                e.clipboardData.setData('text/plain', 'PROTETTO DA TRADING PRO ULTIMATE™ — COPYRIGHT CUORDIVINO — TUTTI I DIRITTI RISERVATI');
              }
              this.showSecurityToast('🔒 Copia non autorizzata: protezione del codice attiva.');
            }
          }, true);
        }

      } else {
        document.body.classList.remove('tpu-spectator-mode');
        const wm = document.getElementById(watermarkId);
        if (wm) wm.remove();
        const style = document.getElementById(styleId);
        if (style) style.remove();
      }
    },

    showGuestBanner: function(name, ip, perm = 'spectator') {
      let b = document.getElementById('tpu-guest-warning-banner');
      if (!b) {
        b = document.createElement('div');
        b.id = 'tpu-guest-warning-banner';
        b.style.cssText = 'background:linear-gradient(90deg, #1e3a8a, #0b1120); border-bottom:1px solid #38bdf8; color:#fff; padding:7px 16px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center; z-index:10001; position:sticky; top:0; box-shadow:0 4px 15px rgba(0,0,0,0.5); flex-wrap:wrap; gap:8px;';
        document.body.prepend(b);
      }
      const isSpectator = perm === 'spectator';
      b.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${isSpectator ? '🔒' : '👁️'}</span>
          <strong>${isSpectator ? 'MODALITÀ SPETTATORE BLINDATO' : 'MODALITÀ DIMOSTRAZIONE OSPITE'}:</strong>
          <span style="color:#e2e8f0;">Ospite: <b>${name}</b> • ${isSpectator ? 'Solo Visione (No Operazioni • No Modifiche • Anti-Copia)' : 'Senza Eseguito'} • Vincolato a questo IP: <code style="color:#38bdf8;">${ip}</code></span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="background:rgba(245,158,11,0.2); border:1px solid #f59e0b; color:#fbbf24; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px;">
            ${isSpectator ? 'SOLO VISIONE • ANTI-FURTO ATTIVO' : 'DEMO INTERATTIVA'}
          </span>
          <button type="button" class="tpu-allow-click" onclick="TPUSecurity.showGatekeeper()" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:4px; cursor:pointer;">
            🔑 Sei il Proprietario? Accedi
          </button>
        </div>
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
      counterView.setUint32(4, timeStep, false);

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
      for (let offset of [0, -1, 1]) {
        const validOtp = await this.generateTOTP(this.totpSecretBase32, offset);
        if (cleanCandidate === validOtp) return true;
      }
      return false;
    },

    // 5. Verification Actions — Owner Login (Now supports instant Deia2026 login without blocking on 2FA!)
    verifyOwnerLogin: async function() {
      const pwd = document.getElementById('tpu-owner-pwd-input')?.value.trim();
      const totp = document.getElementById('tpu-owner-totp-input')?.value.trim();
      const errBox = document.getElementById('tpu-auth-error-box');

      if (pwd !== this.masterPass) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Password di accesso errata. Usa la tua password Proprietario (Deia2026).';
        }
        return;
      }

      // If Owner has NOT forced strict 2FA, allow direct login with Deia2026 when TOTP is left empty!
      if (!totp && !this.require2FAForOwner) {
        this.unlockAsOwner('PROPRIETARIO COMPLETO (Deia2026)');
        this.showSecurityToast('🔓 Accesso Proprietario sbloccato e memorizzato su questo dispositivo!');
        return;
      }

      if (!totp && this.require2FAForOwner) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Hai attivato l\'obbligo 2FA: inserisci il codice Google Authenticator (o il codice master 999888).';
        }
        return;
      }

      // If a 6-digit code was typed, validate it (or accept rescue codes 999888 / 202600)
      const isValid2FA = await this.verifyTOTP(totp);
      if (!isValid2FA && totp !== '999888' && totp !== '202600') {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.innerText = '⚠️ Codice 2FA non valido. Puoi lasciare vuoto il campo 2FA (basta Deia2026) o usare il codice master 999888.';
        }
        return;
      }

      this.unlockAsOwner('PROPRIETARIO COMPLETO (2FA Verificato)');
    },

    toggleStrict2FA: function(checked) {
      this.require2FAForOwner = !!checked;
      localStorage.setItem('tpu_require_2fa_owner', this.require2FAForOwner ? 'true' : 'false');
      this.showSecurityToast(this.require2FAForOwner
        ? '🔐 Obbligo 2FA Google Authenticator ATTIVATO per il Proprietario.'
        : '🔓 Accesso Rapido Attivo: basta la password Deia2026 o il Face ID.');
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

      // Also allow Owner Pass here in case Owner typed Deia2026 in the License tab
      if (key === this.masterPass) {
        this.unlockAsOwner();
        return;
      }

      if (key.length >= 8 && (key.includes('-') || key.toUpperCase().startsWith('TPU'))) {
        this.unlockAsLicensed();
        return;
      }

      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerText = '⚠️ License Key Gumroad non valida o non trovata.';
      }
    },

    // 6. Generate 1-to-1 Guest Invite Link with automatic IP Lock (Works both in page & in Quick QR Modal)
    generateGuestLink: function(sourcePrefix = 'tpu') {
      const nameInput = document.getElementById(`${sourcePrefix}-guest-name-input`) || document.getElementById('tpu-guest-name-input');
      const permSelect = document.getElementById(`${sourcePrefix}-guest-perm-select`) || document.getElementById('tpu-guest-perm-select');

      const guestName = nameInput?.value.trim() || 'Amico / Collaboratore';
      const permMode = permSelect?.value || 'spectator';
      const token = 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      this.activeInviteToken = token;
      this.guestName = guestName;
      this.guestPerm = permMode;

      localStorage.setItem('tpu_active_invite_token', token);
      localStorage.setItem('tpu_bound_guest_name', guestName);
      localStorage.setItem('tpu_bound_guest_perm', permMode);

      const baseUrl = window.location.href.startsWith('http')
        ? window.location.origin + window.location.pathname
        : 'https://cuordivino.github.io/trading-pro-ultimate/';
      const inviteUrl = `${baseUrl}?invite=${encodeURIComponent(token)}&guest=${encodeURIComponent(guestName)}&perm=${encodeURIComponent(permMode)}`;

      // Sync both page inputs and modal inputs
      ['tpu-generated-invite-url', 'tpu-modal-generated-invite-url'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = inviteUrl;
      });

      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}`;
      ['tpu-guest-qr-img', 'tpu-modal-guest-qr-img'].forEach(id => {
        const img = document.getElementById(id);
        if (img) img.src = qrApiUrl;
      });
      ['tpu-guest-qr-wrap', 'tpu-modal-guest-qr-wrap'].forEach(id => {
        const wrap = document.getElementById(id);
        if (wrap) wrap.style.display = 'flex';
      });

      const modeDesc = permMode === 'spectator'
        ? '🔒 Spettatore Blindato (Solo Visione • No Operazioni • No Modifiche • Anti-Copia)'
        : '🔓 Demo Interattiva (Simulazione libera senza mercato reale)';

      ['tpu-guest-bound-status', 'tpu-modal-guest-bound-status'].forEach(id => {
        const statusEl = document.getElementById(id);
        if (statusEl) {
          statusEl.innerHTML = `<span style="color:#fbbf24;">● Pronto per ${guestName} (${modeDesc}):</span> Fai inquadrare il QR Code o invia il link. Si bloccherà sul 1° IP che accede.`;
        }
      });

      this.showSecurityToast('✅ Link 1-a-1 + Codice QR generati con successo!');
    },

    revokeGuestLink: function() {
      if (this.activeInviteToken) {
        localStorage.removeItem('tpu_guest_token_' + this.activeInviteToken);
        localStorage.removeItem('tpu_guest_ip_' + this.activeInviteToken);
      }
      this.activeInviteToken = null;
      localStorage.removeItem('tpu_active_invite_token');

      ['tpu-generated-invite-url', 'tpu-modal-generated-invite-url'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      ['tpu-guest-qr-wrap', 'tpu-modal-guest-qr-wrap'].forEach(id => {
        const wrap = document.getElementById(id);
        if (wrap) wrap.style.display = 'none';
      });
      ['tpu-guest-bound-status', 'tpu-modal-guest-bound-status'].forEach(id => {
        const statusEl = document.getElementById(id);
        if (statusEl) {
          statusEl.innerHTML = `<span style="color:#ef4444;">⛔ Nessun ospite autorizzato.</span> Link e QR precedenti revocati.`;
        }
      });
      this.showSecurityToast('⛔ Accesso ospite revocato.');
    },

    copyGuestLink: function(inputId = 'tpu-generated-invite-url') {
      const url = document.getElementById(inputId)?.value || document.getElementById('tpu-generated-invite-url')?.value;
      if (!url) {
        this.generateGuestLink(inputId.includes('modal') ? 'tpu-modal' : 'tpu');
      }
      const finalUrl = document.getElementById(inputId)?.value || document.getElementById('tpu-generated-invite-url')?.value;
      if (!finalUrl) return;
      navigator.clipboard.writeText(finalUrl);
      this.showSecurityToast('📋 Link Diretto 1-a-1 copiato negli appunti!');
    },

    shareGuestLink: async function(inputId = 'tpu-generated-invite-url') {
      let url = document.getElementById(inputId)?.value || document.getElementById('tpu-generated-invite-url')?.value;
      if (!url) {
        this.generateGuestLink(inputId.includes('modal') ? 'tpu-modal' : 'tpu');
        url = document.getElementById(inputId)?.value || document.getElementById('tpu-generated-invite-url')?.value;
      }
      if (!url) return;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Trading Pro Ultimate — Accesso Personale 1-a-1',
            text: 'Ecco il tuo link personale 1-a-1 per visualizzare il terminale Trading Pro Ultimate:',
            url: url
          });
        } catch (_) {}
      } else {
        this.copyGuestLink(inputId);
      }
    },

    // 7. iOS WebClip .mobileconfig Installer (PRE-UNLOCKED FOR OWNER SO HOME ICON NEVER ASKS FOR 2FA!)
    installIosWebClip: function(preUnlockOwner = true) {
      const baseAppUrl = window.location.href.startsWith('http')
        ? window.location.origin + window.location.pathname
        : 'https://cuordivino.github.io/trading-pro-ultimate/';

      const targetUrl = preUnlockOwner
        ? `${baseAppUrl}?owner_key=${encodeURIComponent(this.ownerQuickToken)}`
        : baseAppUrl;

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
            <string>Icona WebApp Trading Pro Ultimate Pre-Autorizzata Proprietario</string>
            <key>PayloadDisplayName</key>
            <string>Trading Pro Ultimate (Proprietario)</string>
            <key>PayloadIdentifier</key>
            <string>com.tradingpro.ultimate.webclip.owner</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>C1D2E3F4-2026-TPU1-9876-0123456789AB</string>
            <key>PayloadVersion</key>
            <integer>2</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${targetUrl}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Trading Pro Ultimate — Icona Home Proprietario</string>
    <key>PayloadIdentifier</key>
    <string>com.tradingpro.ultimate.profile.owner</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>D2E3F4A5-2026-TPU2-8765-BA9876543210</string>
    <key>PayloadVersion</key>
    <integer>2</integer>
</dict>
</plist>`;

      const blob = new Blob([mobileConfig], { type: 'application/x-apple-aspen-config' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TradingPro-Ultimate-Owner-Home.mobileconfig';
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
        const directBtn = document.getElementById('tpu-2fa-direct-ios-link');
        if (directBtn) {
          directBtn.href = otpauth;
        }
      }
    },

    close2FASetupModal: function() {
      const modal = document.getElementById('tpu-2fa-setup-modal');
      if (modal) modal.style.display = 'none';
    },

    // =========================================================================
    // NEW: UNIFIED QR CODE HUB & 4 ACCESS LEVELS + SPECIFIC GUIDE MODAL
    // =========================================================================
    openAccessHubModal: function(defaultTab = 'share') {
      const modal = document.getElementById('tpu-access-hub-modal');
      if (!modal) return;
      modal.style.display = 'flex';
      this.switchHubTab(defaultTab);
      this.updateFaceIdUIState();

      // Populate Owner Auto-Login QR Code & URL
      const baseAppUrl = window.location.href.startsWith('http')
        ? window.location.origin + window.location.pathname
        : 'https://cuordivino.github.io/trading-pro-ultimate/';
      const ownerAutoUrl = `${baseAppUrl}?owner_key=${encodeURIComponent(this.ownerQuickToken)}`;
      const ownerQrImg = document.getElementById('tpu-owner-autologin-qr');
      if (ownerQrImg) {
        ownerQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ownerAutoUrl)}`;
      }
      const ownerUrlInput = document.getElementById('tpu-owner-autologin-url');
      if (ownerUrlInput) {
        ownerUrlInput.value = ownerAutoUrl;
      }

      // Populate Gumroad Commercial QR Code
      const gumroadQrImg = document.getElementById('tpu-gumroad-commercial-qr');
      if (gumroadQrImg) {
        gumroadQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.gumroadUrl)}`;
      }
    },

    closeAccessHubModal: function() {
      const modal = document.getElementById('tpu-access-hub-modal');
      if (modal) modal.style.display = 'none';
    },

    switchHubTab: function(tabName) {
      const tabs = ['share', 'owner', 'levels', 'guide'];
      tabs.forEach(t => {
        const btn = document.getElementById(`tpu-hub-tab-btn-${t}`);
        const view = document.getElementById(`tpu-hub-view-${t}`);
        if (btn) {
          const isActive = (t === tabName);
          btn.style.background = isActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)';
          btn.style.color = isActive ? '#000' : '#cbd5e1';
          btn.style.borderColor = isActive ? '#f59e0b' : 'rgba(255,255,255,0.12)';
        }
        if (view) {
          view.style.display = (t === tabName) ? 'block' : 'none';
        }
      });
    },

    // Inject Quick Buttons in the Top Header Bar so QR & Access Hub is always 1 click away!
    injectTopBarQuickButtons: function() {
      const headerRight = document.querySelector('.header-right-actions');
      if (headerRight && !document.getElementById('tpu-topbar-qr-hub-btn')) {
        const qrBtn = document.createElement('button');
        qrBtn.id = 'tpu-topbar-qr-hub-btn';
        qrBtn.type = 'button';
        qrBtn.className = 'btn btn-secondary tpu-allow-click';
        qrBtn.style.cssText = 'font-size:11px; padding:5px 11px; border:1px solid #f59e0b; background:rgba(245,158,11,0.18); color:#fbbf24; font-weight:900; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; box-shadow:0 0 12px rgba(245,158,11,0.3);';
        qrBtn.title = 'Apri Centro QR Code, Condivisione 1-a-1, Face ID iPhone e Guida 4 Livelli di Accesso';
        qrBtn.innerHTML = '<span>📲</span> <span>QR &amp; Accessi</span>';
        qrBtn.onclick = () => this.openAccessHubModal('share');

        const guideBtn = document.createElement('button');
        guideBtn.id = 'tpu-topbar-access-guide-btn';
        guideBtn.type = 'button';
        guideBtn.className = 'btn btn-secondary tpu-allow-click';
        guideBtn.style.cssText = 'font-size:11px; padding:5px 10px; border:1px solid #38bdf8; background:rgba(56,189,248,0.14); color:#38bdf8; font-weight:800; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;';
        guideBtn.title = 'Guida Specifica ai 4 Livelli di Accesso, Face ID iPhone e Condivisione QR';
        guideBtn.innerHTML = '<span>📘</span> <span>Guida Accessi</span>';
        guideBtn.onclick = () => this.openAccessHubModal('guide');

        headerRight.prepend(guideBtn);
        headerRight.prepend(qrBtn);
      }
    },

    showGatekeeper: function() {
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) {
        gk.style.display = 'flex';
        this.updateFaceIdUIState();
      }
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

    // 8. Inject UI Overlays (Gatekeeper with Face ID + Optional 2FA + QR Access Hub Modal + Specific Guide)
    injectSecurityUI: function() {
      const gk = document.getElementById('terminal-gatekeeper');
      if (gk) {
        gk.innerHTML = `
          <div class="gatekeeper-card" style="max-width:450px; width:94%; background:#0b1120; border:1px solid rgba(245,158,11,0.45); border-radius:16px; padding:22px; box-shadow:0 20px 50px rgba(0,0,0,0.92); max-height:92vh; overflow-y:auto;">
            <div style="text-align:center; margin-bottom:12px;">
              <img src="assets/tradingpro_institutional_logo.jpg" alt="Logo" style="height:44px; border-radius:8px; border:1.5px solid #f59e0b;">
              <h2 style="font-size:16px; font-weight:900; color:#fff; margin-top:8px; margin-bottom:2px;">Accesso Riservato — TRADING PRO ULTIMATE™</h2>
              <div style="font-size:11px; color:#94a3b8;">Sblocco Rapido Proprietario, Face ID iPhone, QR 1-a-1 &amp; Licenza Gumroad</div>
            </div>

            <!-- Auth Mode Tabs -->
            <div style="display:flex; gap:6px; margin-bottom:14px; background:rgba(15,23,42,0.85); padding:4px; border-radius:8px;">
              <button type="button" id="tpu-tab-btn-owner" class="active" onclick="TPUSecurity.switchAuthTab('owner')" style="flex:1; padding:8px; font-size:11.5px; font-weight:800; border-radius:6px; border:none; cursor:pointer; background:#2563eb; color:#fff;">
                🔑 Proprietario &amp; Face ID
              </button>
              <button type="button" id="tpu-tab-btn-license" onclick="TPUSecurity.switchAuthTab('license')" style="flex:1; padding:8px; font-size:11.5px; font-weight:800; border-radius:6px; border:none; cursor:pointer; background:transparent; color:#94a3b8;">
                🛒 Licenza Gumroad
              </button>
            </div>

            <!-- VIEW 1: PROPRIETARIO (FACE ID + PASSWORD DEIA2026 + 2FA OPZIONALE) -->
            <div id="tpu-auth-view-owner" style="display:block;">
              
              <!-- PULSANTE BIOMETRICO APPLE FACE ID / TOUCH ID -->
              <button type="button" onclick="TPUSecurity.loginWithFaceID()" style="width:100%; padding:12px; margin-bottom:12px; font-size:13px; font-weight:900; background:linear-gradient(135deg, #10b981, #059669); color:#04130d; border:none; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(16,185,129,0.3);">
                <span style="font-size:17px;">👤</span>
                <span>Entra con Face ID / Touch ID (iPhone)</span>
              </button>

              <div style="margin-bottom:10px;">
                <label style="font-size:11px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:700;">Password Proprietario (Basta <code style="color:#fbbf24;">Deia2026</code> per entrare subito):</label>
                <input type="password" id="tpu-owner-pwd-input" placeholder="Inserisci Deia2026..." style="width:100%; padding:11px; background:#030509; border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:8px; font-size:13px; box-sizing:border-box;" onkeydown="if(event.key==='Enter') TPUSecurity.verifyOwnerLogin()">
              </div>

              <!-- 2FA Google Authenticator (Opzionale di default così l'app Home iPhone non blocca mai il proprietario) -->
              <div style="margin-bottom:12px; background:rgba(15,23,42,0.55); border:1px solid rgba(255,255,255,0.08); padding:10px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <label style="font-size:10.5px; color:#94a3b8; font-weight:700;">Codice 2FA (Opzionale — lascia vuoto o usa <code style="color:#38bdf8;">999888</code>):</label>
                  <button type="button" onclick="TPUSecurity.open2FASetupModal()" style="background:transparent; border:none; color:#38bdf8; font-size:10px; cursor:pointer; text-decoration:underline;">
                    Configura QR 2FA
                  </button>
                </div>
                <input type="text" id="tpu-owner-totp-input" maxlength="6" placeholder="Opzionale (lascia vuoto con Deia2026)" style="width:100%; padding:8px; background:#030509; border:1px solid rgba(245,158,11,0.35); color:#fbbf24; border-radius:6px; font-size:13px; font-family:monospace; text-align:center; letter-spacing:2px; font-weight:800; box-sizing:border-box;" onkeydown="if(event.key==='Enter') TPUSecurity.verifyOwnerLogin()">
              </div>

              <button type="button" onclick="TPUSecurity.verifyOwnerLogin()" class="cinematic-cta-btn" style="width:100%; padding:12px; font-size:13px; font-weight:900; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; border:none; border-radius:8px; cursor:pointer; margin-bottom:10px;">
                🔓 Sblocca Terminale Proprietario
              </button>

              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
                <button type="button" onclick="TPUSecurity.registerFaceID()" style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.35); color:#34d399; font-size:10.5px; font-weight:700; padding:6px 10px; border-radius:6px; cursor:pointer;">
                  👤 Attiva Face ID su iPhone
                </button>
                <button type="button" onclick="TPUSecurity.openAccessHubModal('guide')" style="background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.35); color:#38bdf8; font-size:10.5px; font-weight:700; padding:6px 10px; border-radius:6px; cursor:pointer;">
                  📘 Guida Accessi &amp; QR Code
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

      // Inject 2FA Setup Modal (with direct 1-tap iPhone Authenticator link + copyable key)
      if (!document.getElementById('tpu-2fa-setup-modal')) {
        const modal = document.createElement('div');
        modal.id = 'tpu-2fa-setup-modal';
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(3,7,18,0.88); backdrop-filter:blur(8px); z-index:100030; display:none; align-items:center; justify-content:center; padding:16px;';
        modal.innerHTML = `
          <div style="max-width:400px; width:100%; background:#0b1120; border:1px solid rgba(245,158,11,0.45); border-radius:14px; padding:20px; box-shadow:0 15px 40px rgba(0,0,0,0.9); text-align:center;">
            <h3 style="color:#fff; font-size:15px; margin:0 0 6px 0;">📱 Configura 2FA su iPhone o Android (Opzionale)</h3>
            <p style="font-size:11.5px; color:#94a3b8; margin-bottom:10px; line-height:1.4;">
              Nota: Come Proprietario puoi sempre entrare subito con la sola password <strong style="color:#fbbf24;">Deia2026</strong> o col <strong>Face ID</strong>. Se desideri anche il codice a 6 cifre:
            </p>
            <div style="background:#fff; padding:10px; border-radius:10px; display:inline-block; margin-bottom:10px;">
              <img id="tpu-2fa-qr-code" src="" alt="2FA QR Code" style="width:150px; height:150px; display:block;">
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:10px; font-family:monospace; background:rgba(0,0,0,0.5); padding:8px; border-radius:6px; word-break:break-all;">
              Chiave Manuale: <b style="color:#fbbf24;">${this.totpSecretBase32}</b><br>
              <span style="color:#10b981;">Codice Master Sempre Valido: <b>999888</b></span>
            </div>
            <a id="tpu-2fa-direct-ios-link" href="otpauth://totp/TradingProUltimate:cuordivino?secret=${this.totpSecretBase32}&issuer=TradingProUltimate" style="display:block; width:100%; padding:10px; background:#10b981; color:#04130d; text-decoration:none; border-radius:8px; font-weight:900; font-size:12px; margin-bottom:8px; box-sizing:border-box;">
              📲 Apri Direttamente in Authenticator / Passwords su iPhone
            </a>
            <button onclick="TPUSecurity.close2FASetupModal()" style="width:100%; padding:10px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-weight:800; cursor:pointer;">
              Chiudi e Torna all'Accesso
            </button>
          </div>
        `;
        document.body.appendChild(modal);
      }

      // Inject iOS Home Screen WebClip Modal (.mobileconfig Pre-Sbloccato)
      if (!document.getElementById('tpu-installer-modal')) {
        const inst = document.createElement('div');
        inst.id = 'tpu-installer-modal';
        inst.style.cssText = 'position:fixed; inset:0; background:rgba(3,7,18,0.88); backdrop-filter:blur(8px); z-index:100030; display:none; align-items:center; justify-content:center; padding:16px;';
        inst.innerHTML = `
          <div style="max-width:440px; width:100%; background:#0b1120; border:1px solid rgba(14,165,233,0.45); border-radius:16px; padding:22px; box-shadow:0 15px 40px rgba(0,0,0,0.9);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong style="color:#fff; font-size:15px;">📲 Installa App Home iPhone (Pre-Sbloccata Proprietario)</strong>
              <button onclick="TPUSecurity.closeInstallerModal()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
            </div>
            <p style="font-size:12px; color:#cbd5e1; line-height:1.45; margin-bottom:12px;">
              <strong>Perché l'icona Home chiedeva l'accesso?</strong> Su iPhone, le icone aggiunte alla schermata Home hanno una memoria separata da Safari.
            </p>
            <p style="font-size:12px; color:#cbd5e1; line-height:1.45; margin-bottom:14px;">
              <strong>Soluzione 1 (Su icona già salvata):</strong> Inserisci solo <code style="color:#fbbf24;">Deia2026</code> (lasciando vuoto il codice 6 cifre) e attiva <strong>👤 Face ID</strong>.<br>
              <strong>Soluzione 2 (Profilo iOS Automatico):</strong> Scarica il profilo qui sotto che contiene già la tua chiave Proprietario pre-autorizzata!
            </p>

            <button onclick="TPUSecurity.installIosWebClip(true)" class="cinematic-cta-btn" style="width:100%; padding:12px; font-weight:900; font-size:12.5px; background:linear-gradient(135deg, #10b981, #059669); color:#04130d; border:none; border-radius:8px; cursor:pointer; margin-bottom:10px;">
              ⚡ Installa Icona Home Pre-Sbloccata Proprietario (iOS)
            </button>

            <button onclick="TPUSecurity.downloadStandaloneHtml()" style="width:100%; padding:11px; font-weight:700; font-size:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:8px; cursor:pointer;">
              📥 Scarica App Singolo File HTML (PC / Android)
            </button>
          </div>
        `;
        document.body.appendChild(inst);
      }

      // Inject UNIFIED QR CODE HUB, 4 ACCESS LEVELS & SPECIFIC GUIDE MODAL
      if (!document.getElementById('tpu-access-hub-modal')) {
        const hub = document.createElement('div');
        hub.id = 'tpu-access-hub-modal';
        hub.style.cssText = 'position:fixed; inset:0; background:rgba(3,7,18,0.9); backdrop-filter:blur(10px); z-index:100025; display:none; align-items:center; justify-content:center; padding:14px;';
        hub.innerHTML = `
          <div style="max-width:780px; width:100%; max-height:92vh; overflow-y:auto; background:#0b1120; border:1.5px solid rgba(245,158,11,0.5); border-radius:16px; padding:22px; box-shadow:0 25px 60px rgba(0,0,0,0.95); color:#f8fafc;">
            
            <!-- Modal Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:14px; gap:10px;">
              <div>
                <div style="font-size:16px; font-weight:900; color:#fbbf24; display:flex; align-items:center; gap:8px;">
                  <span>📲</span>
                  <span>CENTRO COMANDO QR CODE, FACE ID &amp; 4 LIVELLI DI ACCESSO</span>
                </div>
                <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">
                  Genera codici QR istantanei, configura il Face ID iPhone e consulta la Guida Specifica dei permessi
                </div>
              </div>
              <button type="button" onclick="TPUSecurity.closeAccessHubModal()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; width:34px; height:34px; border-radius:8px; font-size:16px; cursor:pointer; font-weight:800;">✕</button>
            </div>

            <!-- Navigation Tabs inside Hub -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(165px, 1fr)); gap:8px; margin-bottom:18px;">
              <button type="button" id="tpu-hub-tab-btn-share" onclick="TPUSecurity.switchHubTab('share')" style="padding:10px; font-size:11.5px; font-weight:900; border-radius:8px; border:1px solid #f59e0b; cursor:pointer; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000;">
                🔗 1. Condividi QR Ospite 1-a-1
              </button>
              <button type="button" id="tpu-hub-tab-btn-owner" onclick="TPUSecurity.switchHubTab('owner')" style="padding:10px; font-size:11.5px; font-weight:800; border-radius:8px; border:1px solid rgba(255,255,255,0.12); cursor:pointer; background:rgba(255,255,255,0.05); color:#cbd5e1;">
                👑 2. Tuo iPhone (Face ID &amp; QR)
              </button>
              <button type="button" id="tpu-hub-tab-btn-levels" onclick="TPUSecurity.switchHubTab('levels')" style="padding:10px; font-size:11.5px; font-weight:800; border-radius:8px; border:1px solid rgba(255,255,255,0.12); cursor:pointer; background:rgba(255,255,255,0.05); color:#cbd5e1;">
                🛡️ 3. Mappa 4 Livelli Accesso
              </button>
              <button type="button" id="tpu-hub-tab-btn-guide" onclick="TPUSecurity.switchHubTab('guide')" style="padding:10px; font-size:11.5px; font-weight:800; border-radius:8px; border:1px solid rgba(255,255,255,0.12); cursor:pointer; background:rgba(255,255,255,0.05); color:#cbd5e1;">
                📘 4. Guida Specifica Completa
              </button>
            </div>

            <!-- ==============================================================
                 TAB 1: CONDIVISIONE RAPIDA QR CODE OSPITE 1-A-1
                 ============================================================== -->
            <div id="tpu-hub-view-share" style="display:block;">
              <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(16,185,129,0.4); border-radius:12px; padding:16px; margin-bottom:14px;">
                <div style="font-size:13.5px; font-weight:900; color:#10b981; margin-bottom:6px;">
                  🔗 Genera QR Code &amp; Link Diretto 1-a-1 per Amico / Collaboratore
                </div>
                <p style="font-size:11.5px; color:#cbd5e1; margin-bottom:14px; line-height:1.45;">
                  Scegli il livello di permesso per il tuo ospite, premi <strong>Genera Link + QR Code</strong> e fagli inquadrare lo schermo col suo telefono (oppure invialo su WhatsApp). Il sistema bloccherà il link sul <strong>primo indirizzo IP</strong> che lo apre.
                </p>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:14px;">
                  <div>
                    <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:4px; font-weight:700;">Nome Ospite / Amico:</label>
                    <input type="text" id="tpu-modal-guest-name-input" value="Amico / Collaboratore" style="width:100%; padding:10px; background:#030509; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:8px; font-size:12px; box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:4px; font-weight:700;">Livello di Accesso Ospite:</label>
                    <select id="tpu-modal-guest-perm-select" style="width:100%; padding:10px; background:#030509; border:1px solid rgba(245,158,11,0.5); color:#fbbf24; border-radius:8px; font-size:12px; font-weight:800; box-sizing:border-box;">
                      <option value="spectator" selected>🔒 Livello 2: Spettatore Blindato (Solo Visione • No Modifiche • Anti-Copia)</option>
                      <option value="demo_unlocked">🧪 Livello 3: Demo Interattiva (Può usare simulatori senza mercato reale)</option>
                    </select>
                  </div>
                </div>

                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
                  <button type="button" onclick="TPUSecurity.generateGuestLink('tpu-modal')" style="flex:2; min-width:220px; padding:12px; font-weight:900; font-size:13px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; border:none; border-radius:8px; cursor:pointer;">
                    📲 Genera Link Unico 1-a-1 + Mostra QR Code
                  </button>
                  <button type="button" onclick="TPUSecurity.revokeGuestLink()" style="flex:1; min-width:130px; padding:12px; font-weight:800; font-size:12px; background:rgba(239,68,68,0.18); border:1px solid #ef4444; color:#f87171; border-radius:8px; cursor:pointer;">
                    ⛔ Revoca Ospite
                  </button>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
                  <input type="text" id="tpu-modal-generated-invite-url" readonly placeholder="Premi 'Genera Link Unico 1-a-1 + Mostra QR Code'..." style="flex:1; min-width:200px; padding:10px; background:#030509; border:1px solid rgba(56,189,248,0.35); color:#38bdf8; font-family:monospace; font-size:11.5px; border-radius:8px;">
                  <button type="button" onclick="TPUSecurity.copyGuestLink('tpu-modal-generated-invite-url')" style="padding:10px 14px; font-size:12px; font-weight:800; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:8px; cursor:pointer;">
                    📋 Copia Link
                  </button>
                  <button type="button" onclick="TPUSecurity.shareGuestLink('tpu-modal-generated-invite-url')" style="padding:10px 14px; font-size:12px; font-weight:800; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; border:none; border-radius:8px; cursor:pointer;">
                    📤 Invia su WhatsApp / Telegram
                  </button>
                </div>

                <!-- QR Code Box inside Modal -->
                <div id="tpu-modal-guest-qr-wrap" style="display:none; align-items:center; gap:18px; background:#050811; border:1.5px solid #10b981; padding:16px; border-radius:12px; flex-wrap:wrap; justify-content:center;">
                  <div style="background:#fff; padding:10px; border-radius:10px;">
                    <img id="tpu-modal-guest-qr-img" src="" alt="QR Code Ospite" style="width:170px; height:170px; display:block;">
                  </div>
                  <div style="flex:1; min-width:220px;">
                    <div style="font-weight:900; color:#10b981; font-size:14px; margin-bottom:6px;">
                      📷 Fai Inquadrare questo QR Code all'Ospite
                    </div>
                    <p style="font-size:12px; color:#cbd5e1; line-height:1.45; margin-bottom:8px;">
                      Apri la fotocamera dell'iPhone o Android del tuo amico e inquadra il codice: entrerà subito senza bisogno di password né codici 2FA, bloccato sul suo dispositivo.
                    </p>
                    <div id="tpu-modal-guest-bound-status" style="font-size:11.5px; font-family:monospace; color:#38bdf8;">
                      In attesa del 1° accesso...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ==============================================================
                 TAB 2: TUO ACCESSO PROPRIETARIO (FACE ID iPHONE & QR AUTO-LOGIN)
                 ============================================================== -->
            <div id="tpu-hub-view-owner" style="display:none;">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:14px;">
                
                <!-- Card A: Face ID iPhone -->
                <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(16,185,129,0.45); border-radius:12px; padding:16px;">
                  <div style="font-size:14px; font-weight:900; color:#10b981; margin-bottom:6px;">
                    👤 1. Verifica Biometrica Face ID (iPhone / iPad)
                  </div>
                  <p style="font-size:11.5px; color:#cbd5e1; line-height:1.45; margin-bottom:10px;">
                    Attiva il riconoscimento facciale nativo Apple (WebAuthn Passkey) sull'app salvata nella Home del tuo iPhone: non dovrai mai più digitare password o codici!
                  </p>
                  <div class="tpu-faceid-status-label" style="font-size:11.5px; margin-bottom:12px; padding:8px; background:rgba(0,0,0,0.4); border-radius:6px;"></div>
                  <button type="button" onclick="TPUSecurity.registerFaceID()" style="width:100%; padding:11px; background:linear-gradient(135deg, #10b981, #059669); color:#04130d; font-weight:900; font-size:12.5px; border:none; border-radius:8px; cursor:pointer; margin-bottom:8px;">
                    👤 Registra / Attiva Face ID su questo Dispositivo
                  </button>
                  <button type="button" onclick="TPUSecurity.installIosWebClip(true)" style="width:100%; padding:10px; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; color:#38bdf8; font-weight:800; font-size:11.5px; border-radius:8px; cursor:pointer;">
                    📲 Scarica Icona Home iOS Pre-Sbloccata Proprietario
                  </button>
                </div>

                <!-- Card B: QR Code Auto-Login Proprietario -->
                <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(245,158,11,0.45); border-radius:12px; padding:16px; text-align:center;">
                  <div style="font-size:14px; font-weight:900; color:#fbbf24; margin-bottom:6px;">
                    👑 2. Tuo QR Code Personale Auto-Login Proprietario
                  </div>
                  <p style="font-size:11px; color:#cbd5e1; line-height:1.4; margin-bottom:10px;">
                    Inquadra questo QR Code con la fotocamera del <strong>tuo iPhone</strong> per entrare istantaneamente come <strong>PROPRIETARIO COMPLETO</strong> senza inserire password o 2FA (non mostrarlo agli ospiti!):
                  </p>
                  <div style="background:#fff; padding:8px; border-radius:10px; display:inline-block; margin-bottom:10px;">
                    <img id="tpu-owner-autologin-qr" src="" alt="QR Auto-Login Proprietario" style="width:150px; height:150px; display:block;">
                  </div>
                  <div style="display:flex; gap:6px;">
                    <input type="text" id="tpu-owner-autologin-url" readonly style="flex:1; padding:7px; background:#030509; border:1px solid rgba(245,158,11,0.3); color:#fbbf24; font-family:monospace; font-size:10.5px; border-radius:6px;">
                    <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('tpu-owner-autologin-url').value); TPUSecurity.showSecurityToast('📋 Link Auto-Login Proprietario copiato!');" style="padding:7px 10px; background:#f59e0b; color:#000; font-weight:800; font-size:11px; border:none; border-radius:6px; cursor:pointer;">
                      Copia
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- ==============================================================
                 TAB 3: MAPPA RIEPILOGATIVA DEI 4 LIVELLI DI ACCESSO
                 ============================================================== -->
            <div id="tpu-hub-view-levels" style="display:none;">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
                
                <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.4); border-radius:10px; padding:14px;">
                  <div style="font-weight:900; color:#10b981; font-size:13px; margin-bottom:4px;">👑 LIVELLO 1 — PROPRIETARIO (Tu)</div>
                  <div style="font-size:11.5px; color:#cbd5e1; line-height:1.45;">
                    • <b>Come accedi:</b> Password <code>Deia2026</code> (senza bisogno di 2FA), oppure <b>Face ID iPhone</b>, oppure <b>QR Auto-Login Proprietario</b>.<br>
                    • <b>Poteri:</b> Controllo 100% totale, Conto Reale Live, API Broker (Fineco, Bybit, OKX), creazione Link/QR per ospiti e configurazione Gumroad.
                  </div>
                </div>

                <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:14px;">
                  <div style="font-weight:900; color:#fbbf24; font-size:13px; margin-bottom:4px;">🔒 LIVELLO 2 — OSPITE SPETTATORE BLINDATO</div>
                  <div style="font-size:11.5px; color:#cbd5e1; line-height:1.45;">
                    • <b>Come accede:</b> Tramite il tuo <b>Link / QR Code 1-a-1</b> (opzione <i>Spettatore Blindato</i>).<br>
                    • <b>Limiti:</b> Vincolato al 1° IP (non può passarlo ad altri). Può solo navigare e guardare grafici. <b>Zero ordini, zero modifiche agli input, tasto destro/copia/F12 bloccati e filigrana anti-screenshot.</b>
                  </div>
                </div>

                <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.4); border-radius:10px; padding:14px;">
                  <div style="font-weight:900; color:#38bdf8; font-size:13px; margin-bottom:4px;">🧪 LIVELLO 3 — OSPITE DEMO INTERATTIVA</div>
                  <div style="font-size:11.5px; color:#cbd5e1; line-height:1.45;">
                    • <b>Come accede:</b> Tramite il tuo <b>Link / QR Code 1-a-1</b> (opzione <i>Demo Interattiva</i>).<br>
                    • <b>Limiti:</b> Vincolato al 1° IP. Può muovere gli slider, usare il Position Sizer e simulare, ma <b>senza eseguito a mercato reale e senza accesso alle tue chiavi API</b>.
                  </div>
                </div>

                <div style="background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.4); border-radius:10px; padding:14px;">
                  <div style="font-weight:900; color:#c084fc; font-size:13px; margin-bottom:4px;">🛒 LIVELLO 4 — CLIENTE LICENZA GUMROAD</div>
                  <div style="font-size:11.5px; color:#cbd5e1; line-height:1.45;">
                    • <b>Come accede:</b> Chi apre l'URL pubblico senza invito vede il Paywall e acquista su Gumroad, ricevendo una <code>License Key</code>.<br>
                    • <b>Poteri:</b> Usa la propria istanza locale sul suo browser con le proprie impostazioni, senza mai vedere i tuoi conti personali.
                  </div>
                </div>

              </div>
            </div>

            <!-- ==============================================================
                 TAB 4: GUIDA SPECIFICA PASSO-PASSO (IPHONE HOME, FACE ID & QR)
                 ============================================================== -->
            <div id="tpu-hub-view-guide" style="display:none;">
              <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.35); border-radius:12px; padding:16px; font-size:12px; line-height:1.55; color:#e2e8f0;">
                <h4 style="color:#38bdf8; font-size:14px; margin:0 0 8px 0;">📘 GUIDA RAPIDA UFFICIALE — COME GESTIRE ACCESSI, IPHONE E QR CODE</h4>
                
                <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08);">
                  <strong style="color:#fbbf24;">1. Perché l'App salvata su Home di iPhone mi chiedeva il codice e come entro subito?</strong><br>
                  Su iPhone, le WebApp salvate sulla schermata Home hanno una memoria isolata rispetto a Safari. Adesso ti basta inserire la sola password <code style="color:#10b981; font-weight:900;">Deia2026</code> (lasciando vuoto il campo 6 cifre, oppure scrivendo il codice d'emergenza <code style="color:#10b981; font-weight:900;">999888</code>) e premere <b>Sblocca</b>. Una volta sbloccata, l'icona Home ricorderà per sempre che sei il Proprietario!
                </div>

                <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08);">
                  <strong style="color:#10b981;">2. Come attivo il Face ID su iPhone?</strong><br>
                  1️⃣ Apri l'app su iPhone (da Safari o dall'icona Home).<br>
                  2️⃣ Nella schermata di accesso (oppure nella scheda <i>"👑 2. Tuo iPhone"</i> di questo pannello) tocca <b>"👤 Attiva Face ID su iPhone"</b>.<br>
                  3️⃣ Conferma con il volto quando compare il pop-up di Apple.<br>
                  4️⃣ Da quel momento ti basterà toccare il bottone verde <b>"👤 Entra con Face ID"</b> per entrare in mezzo secondo!
                </div>

                <div style="margin-bottom:4px;">
                  <strong style="color:#f59e0b;">3. Come condivido l'app con un amico tramite QR Code senza rischi?</strong><br>
                  1️⃣ Premi il pulsante giallo in alto <b>"📲 QR &amp; Accessi"</b>.<br>
                  2️⃣ Scrivi il nome dell'amico e lascia selezionato <b>"🔒 Livello 2: Spettatore Blindato"</b>.<br>
                  3️⃣ Premi <b>"📲 Genera Link Unico 1-a-1 + Mostra QR Code"</b>.<br>
                  4️⃣ Fai inquadrare il QR Code direttamente dal telefono dell'amico (o premi <i>Invia su WhatsApp</i>). L'amico entrerà subito in sola lettura, vincolato al suo IP, senza poter toccare o copiare nulla. Se vuoi togliergli l'accesso in qualsiasi momento, premi <b>"⛔ Revoca Ospite"</b>.
                </div>
              </div>
            </div>

          </div>
        `;
        document.body.appendChild(hub);
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
