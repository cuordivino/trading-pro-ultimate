/**
 * TRADING PRO ULTIMATE — DRAWING ENGINE
 * Professional TradingView-Style Interactive Drawing Tools
 * Supports: Crosshair, Trendline, Horizontal Ray, Fibonacci Retracement,
 * Freehand Brush, Text Note, Ruler / Measure Tool, Magnet, Lock, Hide, Trash
 * Full Touch & Desktop Pointer Events for PC, iPhone & iPad
 */

window.DrawingEngine = {
  activeTool: 'crosshair', // 'crosshair' | 'trendline' | 'horz' | 'fib' | 'brush' | 'text' | 'ruler'
  drawings: [],
  isDrawing: false,
  currentDrawing: null,
  magnetMode: false,
  locked: false,
  hidden: false,
  STORAGE_KEY: 'tpu_drawings_v2',

  init: function() {
    this.loadDrawings();
    this.createCanvasOverlay();
    this.renderToolbar();
    this.bindEvents();
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  loadDrawings: function() {
    try {
      const sym = window.currentSymbol || 'BTCUSDT';
      const saved = localStorage.getItem(`${this.STORAGE_KEY}_${sym}`);
      if (saved) this.drawings = JSON.parse(saved);
    } catch(e) {}
  },

  saveDrawings: function() {
    try {
      const sym = window.currentSymbol || 'BTCUSDT';
      localStorage.setItem(`${this.STORAGE_KEY}_${sym}`, JSON.stringify(this.drawings));
    } catch(e) {}
  },

  setTool: function(tool) {
    if (this.locked && tool !== 'crosshair' && tool !== 'ruler') {
      if (window.showToast) window.showToast('Disegni Bloccati (Sblocca per modificare)', 'warning');
      return;
    }
    this.activeTool = tool;
    document.querySelectorAll('.tv-tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });

    const overlay = document.getElementById('tv-drawing-canvas');
    if (overlay) {
      overlay.style.cursor = tool === 'crosshair' ? 'crosshair' : (tool === 'brush' ? 'crosshair' : 'crosshair');
    }
  },

  toggleLock: function() {
    this.locked = !this.locked;
    const btn = document.getElementById('tv-btn-lock');
    if (btn) {
      btn.classList.toggle('active', this.locked);
      btn.innerHTML = this.locked ? '🔒' : '🔓';
    }
    if (window.showToast) window.showToast(this.locked ? 'Disegni Bloccati' : 'Disegni Sbloccati', 'info');
  },

  toggleHide: function() {
    this.hidden = !this.hidden;
    const btn = document.getElementById('tv-btn-hide');
    const canvas = document.getElementById('tv-drawing-canvas');
    if (btn) {
      btn.classList.toggle('active', this.hidden);
      btn.innerHTML = this.hidden ? '🚫' : '👁️';
    }
    if (canvas) canvas.style.opacity = this.hidden ? '0' : '1';
    if (window.showToast) window.showToast(this.hidden ? 'Disegni Nascosti' : 'Disegni Visibili', 'info');
  },

  toggleMagnet: function() {
    this.magnetMode = !this.magnetMode;
    const btn = document.getElementById('tv-btn-magnet');
    if (btn) btn.classList.toggle('active', this.magnetMode);
    if (window.showToast) window.showToast(`Magnet Mode: ${this.magnetMode ? 'ATTIVO' : 'DISATTIVO'}`, 'info');
  },

  clearAll: function() {
    if (confirm('Eliminare tutti i disegni dal grafico corrente?')) {
      this.drawings = [];
      this.saveDrawings();
      this.redraw();
      if (window.showToast) window.showToast('Tutti i disegni eliminati', 'info');
    }
  },

  createCanvasOverlay: function() {
    const parent = document.getElementById('chart-container');
    if (!parent || document.getElementById('tv-drawing-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'tv-drawing-canvas';
    canvas.className = 'tv-drawing-canvas-layer';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'all';
    canvas.style.zIndex = '12';
    parent.style.position = 'relative';
    parent.appendChild(canvas);

    this.resizeCanvas();
  },

  resizeCanvas: function() {
    const canvas = document.getElementById('tv-drawing-canvas');
    const parent = document.getElementById('chart-container');
    if (!canvas || !parent) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    this.redraw();
  },

  renderToolbar: function() {
    const wrapper = document.querySelector('.chart-viewport-wrapper');
    if (!wrapper || document.getElementById('tv-drawing-toolbar')) return;

    const tb = document.createElement('div');
    tb.id = 'tv-drawing-toolbar';
    tb.className = 'tv-drawing-toolbar';
    tb.innerHTML = `
      <button class="tv-tool-btn active" data-tool="crosshair" onclick="DrawingEngine.setTool('crosshair')" title="Puntatore Crosshair">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
      </button>
      <button class="tv-tool-btn" data-tool="trendline" onclick="DrawingEngine.setTool('trendline')" title="Linea di Trend">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"></line><circle cx="4" cy="20" r="2" fill="currentColor"></circle><circle cx="20" cy="4" r="2" fill="currentColor"></circle></svg>
      </button>
      <button class="tv-tool-btn" data-tool="horz" onclick="DrawingEngine.setTool('horz')" title="Livello Orizzontale / Prezzo">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="6" y1="9" x2="6" y2="15"></line><line x1="18" y1="9" x2="18" y2="15"></line></svg>
      </button>
      <button class="tv-tool-btn" data-tool="fib" onclick="DrawingEngine.setTool('fib')" title="Ritracciamento Fibonacci">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="5" x2="21" y2="5"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="3" y1="14" x2="21" y2="14"></line><line x1="3" y1="19" x2="21" y2="19"></line></svg>
      </button>
      <button class="tv-tool-btn" data-tool="brush" onclick="DrawingEngine.setTool('brush')" title="Pennello a Mano Libera">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
      </button>
      <button class="tv-tool-btn" data-tool="text" onclick="DrawingEngine.setTool('text')" title="Testo / Nota">
        <span style="font-weight:900; font-size:13px; font-family:var(--font-mono)">T</span>
      </button>
      <button class="tv-tool-btn" data-tool="ruler" onclick="DrawingEngine.setTool('ruler')" title="Misura / Righello (Delta Pips & %)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 8.7l-6-6a1 1 0 0 0-1.4 0l-11 11a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0l11-11a1 1 0 0 0 0-1.4z"></path><line x1="7.5" y1="10.5" x2="9.5" y2="8.5"></line><line x1="10.5" y1="13.5" x2="12.5" y2="11.5"></line><line x1="13.5" y1="16.5" x2="15.5" y2="14.5"></line></svg>
      </button>
      
      <div class="tv-toolbar-divider"></div>

      <button class="tv-tool-btn" id="tv-btn-magnet" onclick="DrawingEngine.toggleMagnet()" title="Magnet Mode (Snap ai Prezzi)">
        <span style="font-size:12px;">🧲</span>
      </button>
      <button class="tv-tool-btn" id="tv-btn-lock" onclick="DrawingEngine.toggleLock()" title="Blocca / Sblocca Disegni">
        <span style="font-size:12px;">🔓</span>
      </button>
      <button class="tv-tool-btn" id="tv-btn-hide" onclick="DrawingEngine.toggleHide()" title="Nascondi / Mostra Disegni">
        <span style="font-size:12px;">👁️</span>
      </button>
      <button class="tv-tool-btn" onclick="DrawingEngine.clearAll()" title="Elimina Tutti i Disegni">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    wrapper.style.position = 'relative';
    wrapper.appendChild(tb);
  },

  bindEvents: function() {
    const canvas = document.getElementById('tv-drawing-canvas');
    if (!canvas) return;

    let startX = 0, startY = 0;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onStart = (e) => {
      if (this.activeTool === 'crosshair' || this.locked || this.hidden) return;
      e.preventDefault();
      e.stopPropagation();
      const pos = getPos(e);
      startX = pos.x;
      startY = pos.y;
      this.isDrawing = true;

      if (this.activeTool === 'trendline') {
        this.currentDrawing = { type: 'trendline', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, color: '#38bdf8' };
      } else if (this.activeTool === 'horz') {
        const pStr = window.candleSeries ? '' : '';
        this.drawings.push({ type: 'horz', y: pos.y, color: '#f59e0b', priceText: '' });
        this.isDrawing = false;
        this.saveDrawings();
        this.redraw();
      } else if (this.activeTool === 'fib') {
        this.currentDrawing = { type: 'fib', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
      } else if (this.activeTool === 'brush') {
        this.currentDrawing = { type: 'brush', points: [pos], color: '#a855f7' };
      } else if (this.activeTool === 'text') {
        const text = prompt('Inserisci testo della nota sul grafico:');
        if (text) {
          this.drawings.push({ type: 'text', x: pos.x, y: pos.y, text, color: '#fff' });
          this.saveDrawings();
          this.redraw();
        }
        this.isDrawing = false;
      } else if (this.activeTool === 'ruler') {
        this.currentDrawing = { type: 'ruler', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
      }
    };

    const onMove = (e) => {
      if (!this.isDrawing || !this.currentDrawing) return;
      e.preventDefault();
      const pos = getPos(e);

      if (this.currentDrawing.type === 'trendline' || this.currentDrawing.type === 'fib' || this.currentDrawing.type === 'ruler') {
        this.currentDrawing.x2 = pos.x;
        this.currentDrawing.y2 = pos.y;
      } else if (this.currentDrawing.type === 'brush') {
        this.currentDrawing.points.push(pos);
      }
      this.redraw();
    };

    const onEnd = (e) => {
      if (!this.isDrawing || !this.currentDrawing) return;
      this.isDrawing = false;
      this.drawings.push(this.currentDrawing);
      this.currentDrawing = null;
      this.saveDrawings();
      this.redraw();
    };

    canvas.addEventListener('pointerdown', onStart);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
  },

  redraw: function() {
    const canvas = document.getElementById('tv-drawing-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (this.hidden) return;

    const all = [...this.drawings];
    if (this.currentDrawing) all.push(this.currentDrawing);

    all.forEach(d => {
      if (d.type === 'trendline') {
        ctx.strokeStyle = d.color || '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.stroke();

        ctx.fillStyle = d.color || '#38bdf8';
        ctx.beginPath();
        ctx.arc(d.x1, d.y1, 3, 0, Math.PI * 2);
        ctx.arc(d.x2, d.y2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'horz') {
        ctx.strokeStyle = d.color || '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, d.y);
        ctx.lineTo(canvas.width / dpr, d.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (d.type === 'fib') {
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const colors = ['#64748b', '#ef4444', '#f59e0b', '#10b981', '#38bdf8', '#818cf8', '#64748b'];
        const dy = d.y2 - d.y1;
        levels.forEach((lvl, idx) => {
          const y = d.y1 + dy * lvl;
          ctx.strokeStyle = colors[idx];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(Math.min(d.x1, d.x2), y);
          ctx.lineTo(canvas.width / dpr, y);
          ctx.stroke();

          ctx.fillStyle = colors[idx];
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(`Fib ${(lvl * 100).toFixed(1)}%`, Math.min(d.x1, d.x2) + 5, y - 3);
        });
      } else if (d.type === 'brush') {
        if (!d.points || d.points.length < 2) return;
        ctx.strokeStyle = d.color || '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        for (let i = 1; i < d.points.length; i++) {
          ctx.lineTo(d.points[i].x, d.points[i].y);
        }
        ctx.stroke();
      } else if (d.type === 'text') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(d.x - 4, d.y - 14, ctx.measureText(d.text).width + 8, 18);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(d.x - 4, d.y - 14, ctx.measureText(d.text).width + 8, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(d.text, d.x, d.y);
      } else if (d.type === 'ruler') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(Math.min(d.x1, d.x2), Math.min(d.y1, d.y2), Math.abs(d.x2 - d.x1), Math.abs(d.y2 - d.y1));
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(Math.min(d.x1, d.x2), Math.min(d.y1, d.y2), Math.abs(d.x2 - d.x1), Math.abs(d.y2 - d.y1));

        const dy = Math.abs(d.y2 - d.y1);
        const dx = Math.abs(d.x2 - d.x1);
        ctx.fillStyle = '#fff';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`ΔX: ${dx.toFixed(0)}px | ΔY: ${dy.toFixed(0)}px`, Math.min(d.x1, d.x2) + 6, Math.min(d.y1, d.y2) + 14);
      }
    });
  }
};

// Auto-initialize DrawingEngine
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.DrawingEngine) window.DrawingEngine.init();
    } catch(e) {}
  });
}
