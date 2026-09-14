/* Rounds ink — Apple Pencil first canvas. Pointer events, pressure width, coalesced points, palm rejection.
   new Ink(hostEl, { id, penOnly, color, width, onChange }) — host must be position:relative with a size. */
(function () {
  const COLORS = ['#0F1720', '#0E7C86', '#C42B2B', '#B8600B'];
  const DARK_COLORS = ['#E8EEF3', '#3FBFCB', '#F26B6B', '#F2A33A'];
  function isDark() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true; if (t === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  class Ink {
    constructor(host, opts = {}) {
      this.host = host; this.opts = opts;
      this.id = opts.id || null;
      this.penOnly = opts.penOnly !== false;
      this.colorIdx = 0; this.baseWidth = opts.width || 2.4; this.tool = 'pen';
      this.strokes = []; this.redo = [];
      this.cur = null; this.lastPen = 0; this.dirty = false;
      this.canvas = document.createElement('canvas');
      host.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(host);
      this._bind();
      this._saveTimer = null;
      if (this.id) this.load();
    }
    get color() { return (isDark() ? DARK_COLORS : COLORS)[this.colorIdx]; }
    resize() {
      const r = this.host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      if (this.canvas.width === w * dpr && this.canvas.height === h * dpr) return;
      this.canvas.width = w * dpr; this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.redraw();
    }
    _accept(e) {
      if (e.pointerType === 'pen') { this.lastPen = Date.now(); return true; }
      if (e.pointerType === 'mouse') return e.buttons === 1 || e.type === 'pointerdown';
      if (this.penOnly) return false;
      return Date.now() - this.lastPen > 1500; // palm right after pen use
    }
    _pt(e) {
      const r = this.canvas.getBoundingClientRect();
      const p = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;
      return [e.clientX - r.left, e.clientY - r.top, p];
    }
    _bind() {
      const c = this.canvas;
      c.style.touchAction = 'none';
      c.addEventListener('pointerdown', (e) => {
        if (!this._accept(e)) return;
        e.preventDefault();
        c.setPointerCapture(e.pointerId);
        const erase = this.tool === 'eraser' || e.button === 5 || (e.pointerType === 'pen' && e.buttons === 32);
        this.cur = { color: this.color, w: this.baseWidth, erase, pts: [this._pt(e)], id: e.pointerId };
        this.redo = [];
      }, { passive: false });
      c.addEventListener('pointermove', (e) => {
        if (!this.cur || e.pointerId !== this.cur.id) return;
        e.preventDefault();
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ce of evs) this.cur.pts.push(this._pt(ce));
        this._drawTail(this.cur);
      }, { passive: false });
      const end = (e) => {
        if (!this.cur || e.pointerId !== this.cur.id) return;
        if (this.cur.pts.length === 1) this.cur.pts.push(this.cur.pts[0].slice());
        this.strokes.push(this.cur); this.cur = null;
        this.redraw(); this._changed();
      };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    }
    _changed() { this.dirty = true; if (this.opts.onChange) this.opts.onChange(this); if (this.id) { clearTimeout(this._saveTimer); this._saveTimer = setTimeout(() => this.save(), 400); } }
    _drawTail(s) {
      const n = s.pts.length; if (n < 2) return;
      this._segment(s, Math.max(1, n - 3), n);
    }
    _segment(s, from, to) {
      const ctx = this.ctx;
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s.erase) { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)'; }
      else ctx.strokeStyle = s.color;
      for (let i = from; i < to; i++) {
        const a = s.pts[i - 1], b = s.pts[i];
        const w = s.erase ? s.w * 8 : s.w * (0.45 + b[2] * 1.3);
        ctx.lineWidth = w;
        ctx.beginPath();
        if (i >= 2) { const p = s.pts[i - 2]; const mx = (p[0] + a[0]) / 2, my = (p[1] + a[1]) / 2; const nx = (a[0] + b[0]) / 2, ny = (a[1] + b[1]) / 2; ctx.moveTo(mx, my); ctx.quadraticCurveTo(a[0], a[1], nx, ny); }
        else { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
      }
      ctx.restore();
    }
    redraw() {
      const ctx = this.ctx;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); ctx.restore();
      for (const s of this.strokes) this._segment(s, 1, s.pts.length);
      if (this.cur) this._segment(this.cur, 1, this.cur.pts.length);
    }
    undo() { const s = this.strokes.pop(); if (s) { this.redo.push(s); this.redraw(); this._changed(); } }
    redoStroke() { const s = this.redo.pop(); if (s) { this.strokes.push(s); this.redraw(); this._changed(); } }
    clear() { if (!this.strokes.length) return; this.redo = this.strokes; this.strokes = []; this.redraw(); this._changed(); }
    setColor(i) { this.colorIdx = i; this.tool = 'pen'; }
    setTool(t) { this.tool = t; }
    isEmpty() { return this.strokes.length === 0; }
    async load() {
      if (!this.id || !window.Store) return;
      const d = await Store.inkGet(this.id);
      if (d && Array.isArray(d.strokes)) { this.strokes = d.strokes; this.redraw(); }
    }
    async save() {
      if (!this.id || !window.Store) return;
      await Store.inkSet(this.id, this.strokes.length ? { strokes: this.strokes, updated: Date.now() } : null);
      this.dirty = false;
    }
    destroy() { clearTimeout(this._saveTimer); if (this.dirty) this.save(); this._ro.disconnect(); this.canvas.remove(); }
  }
  Ink.COLORS = COLORS; Ink.DARK_COLORS = DARK_COLORS;
  window.Ink = Ink;
})();
