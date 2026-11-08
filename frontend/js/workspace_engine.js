/**
 * TRADING PRO ULTIMATE™ — WORKSPACE, THEME & PANE ENGINE
 * © by cuordivino — Tutti i diritti riservati
 * 
 * 1. ThemeManager: Notte (OLED), Giorno (Light), Bloomberg (Amber), Navy (Wall St), Matrix (Cyber)
 * 2. WorkspaceMaskManager: Maschere di Lavoro salvabili e richiamabili con preferenze utente persistenti
 * 3. PaneSplitterManager: Ridimensionamento interattivo touch/desktop delle altezze di Grafico, Volumi e Momentum
 */

// ============================================================================
// 1. THEME MANAGER (MODALITÀ NOTTE / GIORNO / ALTERNATIVE ISTITUZIONALI)
// ============================================================================
window.ThemeManager = {
  STORAGE_KEY: 'tpu_theme_mode_v2',

  themes: {
    notte: {
      id: 'notte',
      name: '🌑 Notte OLED (Cyberpunk)',
      icon: '🌑',
      chartBg: '#070a12',
      paneBg: '#050811',
      gridColor: 'rgba(255, 255, 255, 0.22)',
      borderColor: '#1e293b',
      textColor: '#94a3b8',
      candleUp: '#00f2a1',
      candleDown: '#ff4560',
      vars: {
        '--bg': '#050811',
        '--bg-surface': '#0a0f1d',
        '--bg-elevated': '#0f172a',
        '--bg-card': 'rgba(15, 23, 42, 0.75)',
        '--text-main': '#f8fafc',
        '--text-dim': '#94a3b8',
        '--text-muted': '#64748b',
        '--border': '#1e293b',
        '--border-light': 'rgba(255, 255, 255, 0.08)',
        '--accent': '#ffd700',
        '--buy': '#00f2a1',
        '--sell': '#ff3366',
        '--quantum-blue': '#38bdf8'
      }
    },
    giorno: {
      id: 'giorno',
      name: '☀️ Giorno (Pro Institutional Light)',
      icon: '☀️',
      chartBg: '#ffffff',
      paneBg: '#f8fafc',
      gridColor: 'rgba(0, 0, 0, 0.18)',
      borderColor: '#cbd5e1',
      textColor: '#334155',
      candleUp: '#059669',
      candleDown: '#dc2626',
      vars: {
        '--bg': '#f1f5f9',
        '--bg-surface': '#ffffff',
        '--bg-elevated': '#e2e8f0',
        '--bg-card': 'rgba(255, 255, 255, 0.95)',
        '--text-main': '#0f172a',
        '--text-dim': '#334155',
        '--text-muted': '#64748b',
        '--border': '#cbd5e1',
        '--border-light': 'rgba(0, 0, 0, 0.08)',
        '--accent': '#d97706',
        '--buy': '#059669',
        '--sell': '#dc2626',
        '--quantum-blue': '#0284c7'
      }
    },
    bloomberg: {
      id: 'bloomberg',
      name: '🪙 Bloomberg Terminal (Amber & Charcoal)',
      icon: '🪙',
      chartBg: '#121212',
      paneBg: '#0a0a0a',
      gridColor: 'rgba(251, 191, 36, 0.22)',
      borderColor: '#292524',
      textColor: '#fbbf24',
      candleUp: '#fbbf24',
      candleDown: '#ef4444',
      vars: {
        '--bg': '#0a0a0a',
        '--bg-surface': '#141414',
        '--bg-elevated': '#222222',
        '--bg-card': 'rgba(23, 23, 23, 0.9)',
        '--text-main': '#fef08a',
        '--text-dim': '#fbbf24',
        '--text-muted': '#a16207',
        '--border': '#332714',
        '--border-light': 'rgba(251, 191, 36, 0.12)',
        '--accent': '#f59e0b',
        '--buy': '#fbbf24',
        '--sell': '#ef4444',
        '--quantum-blue': '#f59e0b'
      }
    },
    navy: {
      id: 'navy',
      name: '🌊 Wall Street Navy (JP Morgan)',
      icon: '🌊',
      chartBg: '#071126',
      paneBg: '#040915',
      gridColor: 'rgba(56, 189, 248, 0.22)',
      borderColor: '#1e3a8a',
      textColor: '#93c5fd',
      candleUp: '#00f2a1',
      candleDown: '#fb7185',
      vars: {
        '--bg': '#040915',
        '--bg-surface': '#0b1938',
        '--bg-elevated': '#122550',
        '--bg-card': 'rgba(11, 25, 56, 0.85)',
        '--text-main': '#f8fafc',
        '--text-dim': '#93c5fd',
        '--text-muted': '#60a5fa',
        '--border': '#1e3a8a',
        '--border-light': 'rgba(56, 189, 248, 0.12)',
        '--accent': '#38bdf8',
        '--buy': '#00f2a1',
        '--sell': '#fb7185',
        '--quantum-blue': '#38bdf8'
      }
    },
    matrix: {
      id: 'matrix',
      name: '🔮 Cyber Matrix (Phosphor Green)',
      icon: '🔮',
      chartBg: '#030a05',
      paneBg: '#010502',
      gridColor: 'rgba(34, 197, 94, 0.22)',
      borderColor: '#166534',
      textColor: '#86efac',
      candleUp: '#22c55e',
      candleDown: '#ef4444',
      vars: {
        '--bg': '#010502',
        '--bg-surface': '#06170d',
        '--bg-elevated': '#0d2818',
        '--bg-card': 'rgba(6, 23, 13, 0.88)',
        '--text-main': '#dcfce7',
        '--text-dim': '#86efac',
        '--text-muted': '#15803d',
        '--border': '#166534',
        '--border-light': 'rgba(34, 197, 94, 0.12)',
        '--accent': '#4ade80',
        '--buy': '#22c55e',
        '--sell': '#ef4444',
        '--quantum-blue': '#4ade80'
      }
    },
    grigio_chiaro: {
      id: 'grigio_chiaro',
      name: '🌫️ Grigio Chiaro (Soft Slate & Silver)',
      icon: '🌫️',
      chartBg: '#f1f5f9',
      paneBg: '#e2e8f0',
      gridColor: 'rgba(0, 0, 0, 0.18)',
      borderColor: '#cbd5e1',
      textColor: '#1e293b',
      candleUp: '#059669',
      candleDown: '#e11d48',
      vars: {
        '--bg': '#e2e8f0',
        '--bg-surface': '#f1f5f9',
        '--bg-elevated': '#ffffff',
        '--bg-card': 'rgba(255, 255, 255, 0.94)',
        '--text-main': '#0f172a',
        '--text-dim': '#334155',
        '--text-muted': '#64748b',
        '--border': '#cbd5e1',
        '--border-light': 'rgba(0, 0, 0, 0.08)',
        '--accent': '#0284c7',
        '--buy': '#059669',
        '--sell': '#e11d48',
        '--quantum-blue': '#2563eb'
      }
    },
        // --- NEW THEME SCHEMES ---
    emerald: {
      id: 'emerald',
      name: '💚 Emerald Quant (Smeraldo Istituzionale)',
      icon: '💚',
      chartBg: '#04130d',
      paneBg: '#020b07',
      gridColor: 'rgba(16, 185, 129, 0.22)',
      borderColor: '#064e3b',
      textColor: '#6ee7b7',
      candleUp: '#10b981',
      candleDown: '#f43f5e',
      vars: {
        '--bg': '#020b07',
        '--bg-surface': '#062016',
        '--bg-elevated': '#0b3524',
        '--bg-card': 'rgba(6, 32, 22, 0.88)',
        '--text-main': '#ecfdf5',
        '--text-dim': '#6ee7b7',
        '--text-muted': '#059669',
        '--border': '#064e3b',
        '--border-light': 'rgba(16, 185, 129, 0.15)',
        '--accent': '#10b981',
        '--buy': '#10b981',
        '--sell': '#f43f5e',
        '--quantum-blue': '#34d399'
      }
    },
    tokyo: {
      id: 'tokyo',
      name: '🌆 Tokyo Neon (Midnight Purple & Violet)',
      icon: '🌆',
      chartBg: '#0f081d',
      paneBg: '#090414',
      gridColor: 'rgba(168, 85, 247, 0.22)',
      borderColor: '#3b0764',
      textColor: '#d8b4fe',
      candleUp: '#06b6d4',
      candleDown: '#f43f5e',
      vars: {
        '--bg': '#090414',
        '--bg-surface': '#150a2a',
        '--bg-elevated': '#221042',
        '--bg-card': 'rgba(21, 10, 42, 0.88)',
        '--text-main': '#faf5ff',
        '--text-dim': '#d8b4fe',
        '--text-muted': '#9333ea',
        '--border': '#3b0764',
        '--border-light': 'rgba(168, 85, 247, 0.15)',
        '--accent': '#c084fc',
        '--buy': '#06b6d4',
        '--sell': '#f43f5e',
        '--quantum-blue': '#a855f7'
      }
    },
    crimson: {
      id: 'crimson',
      name: '🩸 Crimson Predator (Dark Ruby Red)',
      icon: '🩸',
      chartBg: '#140608',
      paneBg: '#0c0304',
      gridColor: 'rgba(239, 68, 68, 0.22)',
      borderColor: '#450a0a',
      textColor: '#fca5a5',
      candleUp: '#22c55e',
      candleDown: '#ef4444',
      vars: {
        '--bg': '#0c0304',
        '--bg-surface': '#1c080b',
        '--bg-elevated': '#2b0c11',
        '--bg-card': 'rgba(28, 8, 11, 0.90)',
        '--text-main': '#fff1f2',
        '--text-dim': '#fca5a5',
        '--text-muted': '#b91c1c',
        '--border': '#450a0a',
        '--border-light': 'rgba(239, 68, 68, 0.15)',
        '--accent': '#f43f5e',
        '--buy': '#22c55e',
        '--sell': '#ef4444',
        '--quantum-blue': '#fb7185'
      }
    },
    solaris: {
      id: 'solaris',
      name: '☀️ Solaris Gold (Oro Puro & Obsidian)',
      icon: '☀️',
      chartBg: '#0d0b05',
      paneBg: '#080602',
      gridColor: 'rgba(245, 158, 11, 0.05)',
      borderColor: '#451a03',
      textColor: '#fde68a',
      candleUp: '#fbbf24',
      candleDown: '#ef4444',
      vars: {
        '--bg': '#080602',
        '--bg-surface': '#161105',
        '--bg-elevated': '#251c09',
        '--bg-card': 'rgba(22, 17, 5, 0.92)',
        '--text-main': '#fefce8',
        '--text-dim': '#fde68a',
        '--text-muted': '#b45309',
        '--border': '#451a03',
        '--border-light': 'rgba(245, 158, 11, 0.18)',
        '--accent': '#f59e0b',
        '--buy': '#fbbf24',
        '--sell': '#ef4444',
        '--quantum-blue': '#f59e0b'
      }
    },
    nordic: {
      id: 'nordic',
      name: '❄️ Nordic Frost (Deep Arctic Ice & Cobalt)',
      icon: '❄️',
      chartBg: '#060f1e',
      paneBg: '#030811',
      gridColor: 'rgba(56, 189, 248, 0.22)',
      borderColor: '#0c4a6e',
      textColor: '#bae6fd',
      candleUp: '#38bdf8',
      candleDown: '#f87171',
      vars: {
        '--bg': '#030811',
        '--bg-surface': '#08172e',
        '--bg-elevated': '#0d2447',
        '--bg-card': 'rgba(8, 23, 46, 0.88)',
        '--text-main': '#f0f9ff',
        '--text-dim': '#bae6fd',
        '--text-muted': '#0284c7',
        '--border': '#0c4a6e',
        '--border-light': 'rgba(56, 189, 248, 0.16)',
        '--accent': '#38bdf8',
        '--buy': '#38bdf8',
        '--sell': '#f87171',
        '--quantum-blue': '#0284c7'
      }
    },
    grigio_medio: {
      id: 'grigio_medio',
      name: '⚙️ Grigio Medio (Refinitiv Graphite & Steel)',
      icon: '⚙️',
      chartBg: '#1e222d',
      paneBg: '#171b26',
      gridColor: 'rgba(255, 255, 255, 0.22)',
      borderColor: '#2e3546',
      textColor: '#b2b5be',
      candleUp: '#26a69a',
      candleDown: '#ef5350',
      vars: {
        '--bg': '#131722',
        '--bg-surface': '#1e222d',
        '--bg-elevated': '#2a2e39',
        '--bg-card': 'rgba(30, 34, 45, 0.92)',
        '--text-main': '#d1d4dc',
        '--text-dim': '#b2b5be',
        '--text-muted': '#787b86',
        '--border': '#2e3546',
        '--border-light': 'rgba(255, 255, 255, 0.08)',
        '--accent': '#2962ff',
        '--buy': '#26a69a',
        '--sell': '#ef5350',
        '--quantum-blue': '#2962ff'
      }
    }
  },

  currentTheme: 'notte',

  init: function() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && this.themes[saved]) {
        this.currentTheme = saved;
      }
    } catch(e) {}
    this.applyTheme(this.currentTheme, false);
  },

  
  // 🔒 Lock / Save Preferences Permanently
  lockCurrentPreferences: function() {
    const currentTheme = localStorage.getItem(this.STORAGE_KEY) || 'notte';
    const currentTf = window.currentInterval || '15m';
    const lockedObj = {
      theme: currentTheme,
      timeframe: currentTf,
      timestamp: Date.now()
    };
    localStorage.setItem('tpu_locked_user_preferences', JSON.stringify(lockedObj));
    localStorage.setItem('tpu_preferences_locked', 'true');

    // Update UI badge
    const trigName = document.getElementById('theme-trigger-name');
    if (trigName) {
      trigName.innerHTML = `${ThemeManager.themes[currentTheme]?.icon || '🌑'} ${ThemeManager.themes[currentTheme]?.name.split(' ')[1] || 'Tema'} <span style="color:#10b981; font-size:10px;">🔒</span>`;
    }

    if (window.showToastNotification) {
      window.showToastNotification(`🔒 Preferenze BLOCCATE con successo! Lo schema [${ThemeManager.themes[currentTheme]?.name || currentTheme}] e il timeframe [${currentTf.toUpperCase()}] sono salvati come predefiniti.`);
    } else {
      alert(`🔒 Preferenze BLOCCATE con successo!
Lo schema e il setup corrente saranno caricati automaticamente all'avvio.`);
    }
  },

  unlockPreferences: function() {
    localStorage.removeItem('tpu_locked_user_preferences');
    localStorage.removeItem('tpu_preferences_locked');
    if (window.showToastNotification) {
      window.showToastNotification("🔓 Blocco preferenze rimosso.");
    }
  },

  applyTheme: function(themeKey, notify = true) {
    const t = this.themes[themeKey] || this.themes.notte;
    this.currentTheme = t.id;

    // 1. Apply CSS Custom Properties
    const root = document.documentElement;
    for (const prop in t.vars) {
      root.style.setProperty(prop, t.vars[prop]);
    }
    root.setAttribute('data-theme', t.id);

    // 2. Apply theme to Lightweight Charts
    if (window.applyChartThemeToAll) {
      window.applyChartThemeToAll(t);
    }

    // 3. Update theme indicator in UI
    const triggerIcon = document.getElementById('theme-trigger-icon');
    const triggerLabel = document.getElementById('theme-trigger-name');
    if (triggerIcon) triggerIcon.innerText = t.icon;
    if (triggerLabel) triggerLabel.innerText = t.name.split(' ')[1];

    try {
      localStorage.setItem(this.STORAGE_KEY, t.id);
    } catch(e) {}

    if (notify && window.showToast) {
      window.showToast(`🎨 Tema applicato: ${t.name}`, 'info');
    }
  },

  toggleNextTheme: function() {
    const keys = Object.keys(this.themes);
    const idx = keys.indexOf(this.currentTheme);
    const next = keys[(idx + 1) % keys.length];
    this.applyTheme(next, true);
  }
};

// ============================================================================
// 2. WORKSPACE MASK MANAGER (MASCHERE DI LAVORO PERSONALIZZATE)
// ============================================================================
window.WorkspaceMaskManager = {
  STORAGE_KEY: 'tpu_custom_masks_v2',
  ACTIVE_KEY: 'tpu_active_mask_id',

  defaultMasks: {
    'scalping': {
      id: 'scalping',
      name: '⚡ Scalping 5M (EMA Ribbon & Volumi)',
      interval: '5m',
      theme: 'notte',
      indicators: { vwap: true, ema9: true, ema21: true, ema200: false, boll: false, sar: false, volumePane: true, momentumPane: false },
      momMode: 'rsi',
      heights: { main: 420, vol: 130, mom: 0 }
    },
    'trend': {
      id: 'trend',
      name: '📈 Trend Follower (Bollinger & RSI)',
      interval: '15m',
      theme: 'notte',
      indicators: { vwap: true, ema9: true, ema21: false, ema200: true, boll: true, sar: true, volumePane: true, momentumPane: true },
      momMode: 'rsi',
      heights: { main: 360, vol: 90, mom: 110 }
    },
    'quant': {
      id: 'quant',
      name: '🏛️ Quant Istituzionale (Tutti i Motori & MACD)',
      interval: '1h',
      theme: 'notte',
      indicators: { vwap: true, ema9: true, ema21: true, ema200: true, boll: true, sar: false, volumePane: true, momentumPane: true },
      momMode: 'macd',
      heights: { main: 340, vol: 100, mom: 120 }
    },
    'price_action': {
      id: 'price_action',
      name: '🕯️ Price Action Puro (Zero Distrazioni)',
      interval: '15m',
      theme: 'notte',
      indicators: { vwap: false, ema9: false, ema21: false, ema200: false, boll: false, sar: false, volumePane: false, momentumPane: false },
      momMode: 'rsi',
      heights: { main: 540, vol: 0, mom: 0 }
    }
  },

  getAllMasks: function() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.defaultMasks, ...JSON.parse(stored) };
      }
    } catch(e) {}
    return { ...this.defaultMasks };
  },

  init: function() {
    try {
      const activeId = localStorage.getItem(this.ACTIVE_KEY);
      if (activeId) {
        this.applyMask(activeId, false);
      }
    } catch(e) {}
  },

  applyMask: function(maskId, notify = true) {
    const masks = this.getAllMasks();
    const mask = masks[maskId];
    if (!mask) return;

    // 1. Timeframe
    if (mask.interval && window.changeTimeframe) {
      const btn = document.querySelector(`.tf-pill[onclick*="'${mask.interval}'"]`);
      window.changeTimeframe(mask.interval, btn);
    }

    // 2. Theme
    if (mask.theme && window.ThemeManager) {
      window.ThemeManager.applyTheme(mask.theme, false);
    }

    // 3. Indicators
    if (mask.indicators && window.activeIndicators) {
      for (const k in mask.indicators) {
        window.activeIndicators[k] = mask.indicators[k];
        const toggle = document.querySelector(`[data-ind="${k}"] input[type="checkbox"]`);
        if (toggle) toggle.checked = mask.indicators[k];
      }
      if (window.updateIndicators) window.updateIndicators();
    }

    // 4. Momentum Mode
    if (mask.momMode && window.setMomentumMode) {
      window.setMomentumMode(mask.momMode);
    }

    // 5. Pane Heights
    if (mask.heights && window.PaneSplitterManager) {
      window.PaneSplitterManager.setHeights(mask.heights.main, mask.heights.vol, mask.heights.mom);
    }

    try {
      localStorage.setItem(this.ACTIVE_KEY, maskId);
    } catch(e) {}

    const maskLabel = document.getElementById('active-mask-label');
    if (maskLabel) maskLabel.innerText = mask.name.split(' ')[1] || mask.name;

    if (notify && window.showToast) {
      window.showToast(`🎭 Maschera caricata: ${mask.name}`, 'success');
    }
  },

  saveCurrentMask: function() {
    const name = prompt('Inserisci il nome per questa Maschera di Lavoro:', 'Mia Strategia Pro');
    if (!name || !name.trim()) return;

    const id = 'custom_' + Date.now();
    const newMask = {
      id: id,
      name: `⭐ ${name.trim()}`,
      interval: window.currentInterval || '15m',
      theme: window.ThemeManager ? window.ThemeManager.currentTheme : 'notte',
      indicators: { ...(window.activeIndicators || {}) },
      momMode: window.activeMomentumMode || 'rsi',
      heights: window.PaneSplitterManager ? window.PaneSplitterManager.getHeights() : { main: 380, vol: 90, mom: 105 }
    };

    const all = this.getAllMasks();
    all[id] = newMask;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      localStorage.setItem(this.ACTIVE_KEY, id);
    } catch(e) {}

    if (window.showToast) window.showToast(`✅ Maschera "${name}" salvata con successo!`, 'success');
  }
};

// ============================================================================
// 3. PANE SPLITTER MANAGER (RIDIMENSIONAMENTO TOUCH & DESKTOP DELLE ALTEZZE)
// ============================================================================
window.PaneSplitterManager = {
  STORAGE_KEY: 'tpu_pane_heights_v4',

  heights: {
    main: 380,
    vol: 90,
    mom: 115,
    mom2: 90
  },

  init: function() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.heights = { ...this.heights, ...JSON.parse(saved) };
      }
    } catch(e) {}

    this.applyDomHeights();
    this.bindSplitterEvents('splitter-vol', 'main');
    this.bindSplitterEvents('splitter-mom', 'volume');
    this.bindSplitterEvents('splitter-sub2', 'momentum');
    this.bindSplitterEvents('splitter-sub2-bottom', 'sub2');
  },

    setHeights: function(main, vol, mom, mom2) {
    if (main !== undefined && !isNaN(main)) this.heights.main = Math.max(180, Math.min(2400, parseInt(main, 10)));
    if (vol !== undefined && !isNaN(vol)) this.heights.vol = Math.max(30, Math.min(1200, parseInt(vol, 10)));
    if (mom !== undefined && !isNaN(mom)) this.heights.mom = Math.max(30, Math.min(1200, parseInt(mom, 10)));
    if (mom2 !== undefined && !isNaN(mom2)) this.heights.mom2 = Math.max(30, Math.min(1200, parseInt(mom2, 10)));

    this.applyDomHeights();
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.heights));
    } catch(e) {}
  },

  getHeights: function() {
    return { ...this.heights };
  },

  setPaneHeight: function(pane, px) {
    const val = parseInt(px, 10);
    if (isNaN(val)) return;

    if (pane === 'main') this.heights.main = Math.max(180, Math.min(2400, val));
    else if (pane === 'volume') this.heights.vol = Math.max(30, Math.min(1200, val));
    else if (pane === 'momentum') this.heights.mom = Math.max(30, Math.min(1200, val));
    else if (pane === 'sub2') this.heights.mom2 = Math.max(30, Math.min(1200, val));

    this.applyDomHeights();
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.heights));
    } catch(e) {}
  },

  adjustPaneHeight: function(pane, delta) {
    const d = parseInt(delta, 10) || 0;
    if (pane === 'main') this.setPaneHeight('main', this.heights.main + d);
    else if (pane === 'volume') this.setPaneHeight('volume', this.heights.vol + d);
    else if (pane === 'momentum') this.setPaneHeight('momentum', this.heights.mom + d);
    else if (pane === 'sub2') this.setPaneHeight('sub2', (this.heights.mom2 || 90) + d);
  },

  toggleMainFullscreen: function() {
    const isBig = this.heights.main >= 1000;
    this.setPaneHeight('main', isBig ? 380 : 1200);
  },

  applyDomHeights: function() {
    const mainWrap = document.querySelector('.chart-viewport-wrapper');
    const volPane = document.getElementById('chart-volume-pane');
    const momPane = document.getElementById('chart-momentum-pane');
    const sub2Pane = document.getElementById('chart-sub2-pane');

    if (mainWrap) mainWrap.style.height = `${this.heights.main}px`;
    if (volPane) {
      volPane.style.height = `${this.heights.vol}px`;
      volPane.style.display = this.heights.vol > 0 ? 'flex' : 'none';
    }
    if (momPane) {
      momPane.style.height = `${this.heights.mom}px`;
      momPane.style.display = this.heights.mom > 0 ? 'flex' : 'none';
    }
    if (sub2Pane) {
      const h2 = this.heights.mom2 || 90;
      sub2Pane.style.height = `${h2}px`;
      sub2Pane.style.display = h2 > 0 ? 'flex' : 'none';
    }

    if (window.resizeAllCharts) {
      window.resizeAllCharts();
    }
  },

    bindSplitterEvents: function(splitterId, type) {
    const el = document.getElementById(splitterId);
    if (!el) return;

    let startY = 0;
    let startMainH = 0;
    let startVolH = 0;
    let startMomH = 0;
    let startSub2H = 0;
    let isDragging = false;

    const onStart = (clientY) => {
      isDragging = true;
      startY = clientY;
      startMainH = this.heights.main;
      startVolH = this.heights.vol;
      startMomH = this.heights.mom;
      startSub2H = this.heights.mom2 || 90;
      el.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'row-resize';
    };

    const onMove = (clientY) => {
      if (!isDragging) return;
      const delta = clientY - startY;

      if (type === 'main') {
        this.heights.main = Math.max(180, Math.min(2400, startMainH + delta));
      } else if (type === 'volume') {
        this.heights.vol = Math.max(30, Math.min(1200, startVolH + delta));
      } else if (type === 'momentum') {
        this.heights.mom = Math.max(30, Math.min(1200, startMomH + delta));
      } else if (type === 'sub2') {
        this.heights.mom2 = Math.max(30, Math.min(1200, startSub2H + delta));
      }

      this.applyDomHeights();
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.heights));
      } catch(e) {}
      if (window.resizeAllCharts) window.resizeAllCharts();
    };

    // Desktop Mouse Listeners attached to window
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        onMove(e.clientY);
      }
    });

    window.addEventListener('mouseup', onEnd);

    // Mobile / Cell Touch Listeners attached to window with passive: false
    el.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches.length) return;
      e.preventDefault();
      onStart(e.touches[0].clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches && e.touches.length) {
        e.preventDefault();
        onMove(e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        onEnd();
      }
    });
    window.addEventListener('touchcancel', () => {
      if (isDragging) {
        isDragging = false;
        onEnd();
      }
    });
  }
};

// Global helper wrappers for direct HTML button invocation
window.adjustPaneHeight = function(pane, delta) {
  if (window.PaneSplitterManager) window.PaneSplitterManager.adjustPaneHeight(pane, delta);
};

window.setPaneHeightPreset = function(pane, px) {
  if (window.PaneSplitterManager) window.PaneSplitterManager.setPaneHeight(pane, px);
};

// Auto-initialize PaneSplitterManager on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.PaneSplitterManager) window.PaneSplitterManager.init();
    } catch(e) {
      console.warn('[PaneSplitterManager] Auto-init:', e);
    }
  });
}


// ============================================================================
// 4. COLUMN SPLITTER MANAGER (TAGLI VERTICALI LARGHEZZA GRAFICO / BOOK / ORDINI)
// ============================================================================
// 4. COLUMN SPLITTER MANAGER (TAGLI VERTICALI LARGHEZZA GRAFICO / BOOK / ORDINI)
// ============================================================================
window.ColumnSplitterManager = {
  STORAGE_KEY: 'tpu_bybit_col_widths_v2',
  widths: { book: 310, order: 340 },

  init: function() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.book) this.widths.book = Math.max(180, Math.min(600, parsed.book));
        if (parsed.order) this.widths.order = Math.max(220, Math.min(600, parsed.order));
      }
    } catch(e) {}

    this.bindColSplitter('splitter-col-1-2', 'book');
    this.bindColSplitter('splitter-col-2-3', 'order');
    this.applyDomWidths();

    window.addEventListener('resize', () => this.applyDomWidths());
  },

  applyDomWidths: function() {
    const grid = document.querySelector('.bybit-terminal-grid');
    if (!grid) return;

    const bookCol = document.getElementById('bb-col-book');
    const orderCol = document.getElementById('bb-col-order');
    const chartWrap = document.getElementById('bybit-chart-column-wrap');
    const split1 = document.getElementById('splitter-col-1-2');
    const split2 = document.getElementById('splitter-col-2-3');
    const slotLateral = document.getElementById('slot-book-lateral');
    const slotUnder = document.getElementById('slot-book-under-chart');

    const isMobile = window.innerWidth <= 920;
    const isBookUnder = (window.BybitLayoutManager && window.BybitLayoutManager.bookPosition === 'under') || isMobile;

    if (!isMobile) {
      if (isBookUnder) {
        // Bybit Wide Chart Mode: Chart expands to 1fr (100% available space), Order Execution on right
        grid.style.setProperty('display', 'grid', 'important');
        grid.style.setProperty('grid-template-columns', '1fr 10px ' + (this.widths.order || 340) + 'px', 'important');
        grid.style.setProperty('gap', '0', 'important');

        if (chartWrap) {
          chartWrap.style.setProperty('grid-column', '1', 'important');
          chartWrap.style.setProperty('width', '100%', 'important');
          chartWrap.style.setProperty('max-width', '100%', 'important');
        }

        if (split1) split1.style.setProperty('display', 'none', 'important');
        if (slotLateral) slotLateral.style.setProperty('display', 'none', 'important');

        if (split2) {
          split2.style.setProperty('display', 'flex', 'important');
          split2.style.setProperty('grid-column', '2', 'important');
          split2.setAttribute('title', 'Trascina per ridimensionare il Grafico e il Form Ordini');
        }

        if (orderCol) {
          orderCol.style.setProperty('display', 'block', 'important');
          orderCol.style.setProperty('grid-column', '3', 'important');
          orderCol.style.setProperty('width', (this.widths.order || 340) + 'px', 'important');
          orderCol.style.setProperty('max-width', (this.widths.order || 340) + 'px', 'important');
        }

        if (slotUnder && bookCol && bookCol.parentElement !== slotUnder) {
          slotUnder.appendChild(bookCol);
        }
        if (slotUnder) slotUnder.style.setProperty('display', 'block', 'important');
        if (bookCol) bookCol.classList.add('docked-under');

      } else {
        // Standard 3-Column Layout: Chart (1fr) | Book | Order Execution
        grid.style.setProperty('display', 'grid', 'important');
        grid.style.setProperty('grid-template-columns', '1fr 10px ' + (this.widths.book || 310) + 'px 10px ' + (this.widths.order || 340) + 'px', 'important');
        grid.style.setProperty('gap', '0', 'important');

        if (chartWrap) {
          chartWrap.style.setProperty('grid-column', '1', 'important');
          chartWrap.style.setProperty('width', '100%', 'important');
          chartWrap.style.setProperty('max-width', '100%', 'important');
        }

        if (split1) {
          split1.style.setProperty('display', 'flex', 'important');
          split1.style.setProperty('grid-column', '2', 'important');
          split1.setAttribute('title', 'Trascina per ridimensionare il Grafico e l\'Order Book');
        }

        if (slotLateral && bookCol && bookCol.parentElement !== slotLateral) {
          slotLateral.appendChild(bookCol);
        }
        if (slotLateral) {
          slotLateral.style.setProperty('display', 'flex', 'important');
          slotLateral.style.setProperty('grid-column', '3', 'important');
          slotLateral.style.setProperty('width', (this.widths.book || 310) + 'px', 'important');
        }

        if (split2) {
          split2.style.setProperty('display', 'flex', 'important');
          split2.style.setProperty('grid-column', '4', 'important');
          split2.setAttribute('title', 'Trascina per ridimensionare l\'Order Book e il Form Ordini');
        }

        if (orderCol) {
          orderCol.style.setProperty('display', 'block', 'important');
          orderCol.style.setProperty('grid-column', '5', 'important');
          orderCol.style.setProperty('width', (this.widths.order || 340) + 'px', 'important');
          orderCol.style.setProperty('max-width', (this.widths.order || 340) + 'px', 'important');
        }

        if (slotUnder) slotUnder.style.setProperty('display', 'none', 'important');
        if (bookCol) bookCol.classList.remove('docked-under');
      }
    } else {
      // Mobile / Tablet: Stack vertically: Chart -> Book -> Orders
      grid.style.setProperty('display', 'flex', 'important');
      grid.style.setProperty('flex-direction', 'column', 'important');
      grid.style.setProperty('gap', '12px', 'important');

      if (split1) split1.style.setProperty('display', 'none', 'important');
      if (split2) split2.style.setProperty('display', 'none', 'important');
      if (slotLateral) slotLateral.style.setProperty('display', 'none', 'important');

      if (slotUnder && bookCol && bookCol.parentElement !== slotUnder) {
        slotUnder.appendChild(bookCol);
      }
      if (slotUnder) slotUnder.style.setProperty('display', 'block', 'important');
      if (bookCol) bookCol.classList.add('docked-under');
    }

    if (window.resizeAllCharts) window.resizeAllCharts();
  },

  bindColSplitter: function(splitterId, type) {
    const el = document.getElementById(splitterId);
    if (!el) return;

    let startX = 0;
    let startW = 0;
    let isDragging = false;

    const onStart = (clientX) => {
      isDragging = true;
      startX = clientX;
      startW = (type === 'book') ? this.widths.book : this.widths.order;
      el.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'col-resize';
    };

    const onMove = (clientX) => {
      if (!isDragging) return;
      const delta = clientX - startX;
      if (type === 'book') {
        this.widths.book = Math.max(180, Math.min(700, startW - delta));
      } else if (type === 'order') {
        this.widths.order = Math.max(220, Math.min(700, startW - delta));
      }
      this.applyDomWidths();
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.widths));
      } catch(e) {}
      if (window.resizeAllCharts) window.resizeAllCharts();
    };

    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        onMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches.length) return;
      e.preventDefault();
      onStart(e.touches[0].clientX);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches && e.touches.length) {
        e.preventDefault();
        onMove(e.touches[0].clientX);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (isDragging) onEnd();
    });
    window.addEventListener('touchcancel', () => {
      if (isDragging) onEnd();
    });
  }
};

// Auto-initialize ColumnSplitterManager
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.ColumnSplitterManager) window.ColumnSplitterManager.init();
      if (window.BybitLayoutManager) window.BybitLayoutManager.init();
    } catch(e) {}
  });
}

// ============================================================================
// BYBIT OFFICIAL DUAL-MODE LAYOUT MANAGER & POPOVER ENGINE
// ============================================================================
window.BybitLayoutManager = {
  layoutMode: 'split',         // 'split' | 'tabs' | 'wide' | '3col'
  bookPosition: 'under',       // 'under' (Sotto al grafico) | 'lateral' (A lato del grafico)
  splitSubMode: 'split',       // 'split' (OB sopra, Trades sotto) | 'tabs' (A schede singole)
  showBidAskRatio: true,
  mobileViewMode: 'chart-indicators',
  activeTab: 'orderbook',

  init: function() {
    try {
      const savedPos = localStorage.getItem('tpu_bybit_book_pos_v2');
      if (savedPos && ['under', 'lateral'].includes(savedPos)) {
        this.bookPosition = savedPos;
      }
      const savedMode = localStorage.getItem('tpu_bybit_layout_mode_v2');
      if (savedMode && ['split', 'tabs', 'wide', '3col'].includes(savedMode)) {
        this.layoutMode = savedMode;
      }
      const ratioSaved = localStorage.getItem('tpu_bid_ask_ratio_v1');
      if (ratioSaved !== null) {
        this.showBidAskRatio = ratioSaved === 'true';
      }
      const mobMode = localStorage.getItem('tpu_mobile_view_mode');
      if (mobMode && ['chart-only', 'chart-indicators'].includes(mobMode)) {
        this.mobileViewMode = mobMode;
      }
    } catch(e) {}

    this.applyBookPosition();
    this.applyMobileViewMode();
    this.updateRatioVisibility();
    this.updateActiveTiles();

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('bybit-layout-popover-menu');
      const btn = document.getElementById('btn-bybit-layout-menu');
      if (popover && popover.style.display !== 'none') {
        if (!popover.contains(e.target) && (!btn || !btn.contains(e.target))) {
          popover.style.display = 'none';
        }
      }
    });

    window.addEventListener('resize', () => {
      this.applyBookPosition();
      this.applyMobileViewMode();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.applyBookPosition();
        this.applyMobileViewMode();
      }, 100);
    });
  },

  setLayoutMode: function(mode) {
    if (!['split', 'tabs', 'wide', '3col'].includes(mode)) return;
    this.layoutMode = mode;
    try { localStorage.setItem('tpu_bybit_layout_mode_v2', mode); } catch(e) {}

    if (mode === 'wide') {
      this.setBookPosition('under');
    } else if (mode === '3col') {
      this.setBookPosition('lateral');
    } else if (mode === 'split') {
      this.setBookSplitMode('split');
      this.applyBookPosition();
    } else if (mode === 'tabs') {
      this.setBookSplitMode('tabs');
    }

    this.updateActiveTiles();
    this.closePopover();

    if (window.showToast) {
      const modeNames = {
        'split': 'OB + Trades (Split Verticale)',
        'tabs': 'Visualizzazione a Schede Singole',
        'wide': 'Grafico Ampio (Book Sotto)',
        '3col': '3 Colonne (Grafico | Book | Ordini)'
      };
      window.showToast('Layout Bybit applicato: ' + (modeNames[mode] || mode), 'info');
    }
  },

  setBookSplitMode: function(subMode) {
    this.splitSubMode = subMode;
    try { localStorage.setItem('tpu_bybit_split_submode_v1', subMode); } catch(e) {}

    const viewOb = document.getElementById('bb-view-orderbook');
    const viewTr = document.getElementById('bb-view-trades');
    const splitHeader = document.getElementById('bb-split-trades-header');

    if (subMode === 'split') {
      if (viewOb) { viewOb.style.display = 'flex'; viewOb.style.flex = '1'; }
      if (viewTr) { viewTr.style.display = 'flex'; viewTr.style.flex = '1'; }
      if (splitHeader) splitHeader.style.display = 'flex';
      const card = document.getElementById('bb-col-book');
      if (card) card.classList.add('split-mode');
    } else {
      if (splitHeader) splitHeader.style.display = 'none';
      const card = document.getElementById('bb-col-book');
      if (card) card.classList.remove('split-mode');
      this.switchBookSubTab(this.activeTab || 'orderbook');
    }
  },

  updateActiveTiles: function() {
    document.querySelectorAll('.bybit-layout-tile').forEach(t => t.classList.remove('active'));
    const tileMap = {
      'split': 'tile-mode-split',
      'tabs': 'tile-mode-tabs',
      'wide': 'tile-mode-wide',
      '3col': 'tile-mode-3col'
    };
    const activeTileId = tileMap[this.layoutMode] || (this.bookPosition === 'under' ? 'tile-mode-wide' : 'tile-mode-split');
    const el = document.getElementById(activeTileId);
    if (el) el.classList.add('active');
  },

  toggleBookPosition: function() {
    const nextPos = this.bookPosition === 'under' ? 'lateral' : 'under';
    this.setBookPosition(nextPos);
  },

  setBookPosition: function(pos) {
    if (!['under', 'lateral'].includes(pos)) return;
    this.bookPosition = pos;
    this.layoutMode = pos === 'under' ? 'wide' : '3col';
    try {
      localStorage.setItem('tpu_bybit_book_pos_v2', pos);
      localStorage.setItem('tpu_bybit_layout_mode_v2', this.layoutMode);
    } catch(e) {}

    this.applyBookPosition();
    this.updateActiveTiles();

    if (window.showToast) {
      window.showToast('Order Book & Trades posizionati: ' + (pos === 'under' ? 'SOTTO AL GRAFICO' : 'A LATO DEL GRAFICO'), 'info');
    }
  },

  applyBookPosition: function() {
    const lblDockIcon = document.getElementById('lbl-dock-icon');
    const lblDockText = document.getElementById('lbl-dock-text');
    const lblChartIcon = document.getElementById('lbl-chart-book-icon');
    const lblChartText = document.getElementById('lbl-chart-book-text');

    if (this.bookPosition === 'under') {
      if (lblDockIcon) lblDockIcon.innerText = '◫';
      if (lblDockText) lblDockText.innerText = 'Torna a Lato';
      if (lblChartIcon) lblChartIcon.innerText = '◫';
      if (lblChartText) lblChartText.innerText = 'Book a Lato';

      const viewOb = document.getElementById('bb-view-orderbook');
      const viewTr = document.getElementById('bb-view-trades');
      const splitHead = document.getElementById('bb-split-trades-header');
      if (viewOb) { viewOb.style.display = 'flex'; viewOb.style.flex = '1'; }
      if (viewTr) { viewTr.style.display = 'flex'; viewTr.style.flex = '1'; }
      if (splitHead) splitHead.style.display = 'flex';
    } else {
      if (lblDockIcon) lblDockIcon.innerText = '⬇';
      if (lblDockText) lblDockText.innerText = 'Passa Sotto';
      if (lblChartIcon) lblChartIcon.innerText = '⬇';
      if (lblChartText) lblChartText.innerText = 'Book Sotto al Grafico';

      if (this.splitSubMode === 'tabs') {
        this.switchBookSubTab(this.activeTab || 'orderbook');
      }
    }

    if (window.ColumnSplitterManager) {
      window.ColumnSplitterManager.applyDomWidths();
    }
  },

  applyMobileViewMode: function() {
    if (window.innerWidth > 920) return;
    const isOnly = this.mobileViewMode === 'chart-only';
    const vp = document.querySelector('.chart-viewport-wrapper');
    const container = document.getElementById('chart-container');
    const volPane = document.getElementById('chart-volume-pane');
    const momPane = document.getElementById('chart-momentum-pane');
    const sub2Pane = document.getElementById('chart-sub2-pane');
    const macroWire = document.getElementById('bybit-macro-timeline-ribbon');
    const btn = document.getElementById('btn-mobile-chart-mode');

    const targetHeight = isOnly ? Math.round(window.innerHeight * 0.72) : 390;

    if (vp) {
      vp.style.setProperty('height', targetHeight + 'px', 'important');
      vp.style.setProperty('min-height', targetHeight + 'px', 'important');
      vp.style.setProperty('max-height', targetHeight + 'px', 'important');
    }

    if (container) {
      container.style.setProperty('height', '100%', 'important');
      container.style.setProperty('width', '100%', 'important');
    }

    if (volPane) volPane.style.display = isOnly ? 'none' : 'flex';
    if (momPane) momPane.style.display = isOnly ? 'none' : 'flex';
    if (sub2Pane) sub2Pane.style.display = isOnly ? 'none' : 'flex';
    if (macroWire) macroWire.style.display = isOnly ? 'none' : 'flex';

    if (btn) {
      btn.innerText = isOnly ? '📈 Mostra Indicatori' : '🕯️ Solo Grafico (Max)';
      btn.style.background = isOnly ? 'rgba(56,189,248,0.2)' : 'rgba(0,242,161,0.18)';
      btn.style.borderColor = isOnly ? '#38bdf8' : '#00f2a1';
      btn.style.color = isOnly ? '#38bdf8' : '#00f2a1';
    }

    setTimeout(() => {
      if (window.resizeAllCharts) window.resizeAllCharts();
      if (window.mainChart && window.mainChart.timeScale) window.mainChart.timeScale().fitContent();
    }, 50);
  },

  toggleMobileViewMode: function() {
    this.mobileViewMode = this.mobileViewMode === 'chart-only' ? 'chart-indicators' : 'chart-only';
    try { localStorage.setItem('tpu_mobile_view_mode', this.mobileViewMode); } catch(e) {}
    this.applyMobileViewMode();
  },

  toggleBidAskRatio: function(checked) {
    this.showBidAskRatio = checked;
    try { localStorage.setItem('tpu_bid_ask_ratio_v1', String(checked)); } catch(e) {}
    this.updateRatioVisibility();
  },

  updateRatioVisibility: function() {
    const bar = document.getElementById('bb-bid-ask-ratio-bar');
    const chk = document.getElementById('chk-bid-ask-ratio');
    if (bar) bar.style.display = this.showBidAskRatio ? 'flex' : 'none';
    if (chk) chk.checked = this.showBidAskRatio;
  },

  togglePopover: function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const popover = document.getElementById('bybit-layout-popover-menu');
    if (!popover) return;
    popover.style.display = (popover.style.display === 'none' || !popover.style.display) ? 'block' : 'none';
    this.updateActiveTiles();
  },

  closePopover: function() {
    const popover = document.getElementById('bybit-layout-popover-menu');
    if (popover) popover.style.display = 'none';
  },

  switchBookSubTab: function(tab) {
    this.activeTab = tab;
    const viewOb = document.getElementById('bb-view-orderbook');
    const viewTr = document.getElementById('bb-view-trades');
    const tabOb = document.getElementById('bb-tab-ob-btn');
    const tabTr = document.getElementById('bb-tab-tr-btn');
    if (tab === 'orderbook') {
      if (viewOb) viewOb.style.display = 'flex';
      if (viewTr && this.splitSubMode !== 'split' && this.bookPosition !== 'under') viewTr.style.display = 'none';
      if (tabOb) tabOb.classList.add('active');
      if (tabTr && this.splitSubMode !== 'split' && this.bookPosition !== 'under') tabTr.classList.remove('active');
    } else {
      if (viewTr) viewTr.style.display = 'flex';
      if (viewOb && this.splitSubMode !== 'split' && this.bookPosition !== 'under') viewOb.style.display = 'none';
      if (tabTr) tabTr.classList.add('active');
      if (tabOb && this.splitSubMode !== 'split' && this.bookPosition !== 'under') tabOb.classList.remove('active');
    }
  }
};
