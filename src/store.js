/* Rounds persistence: progress in localStorage, ink strokes in IndexedDB. */
(function () {
  const KEY = 'rounds.v1';
  const DEFAULTS = () => ({
    lessons: {},     // id -> { done: ts }
    cards: {},       // id -> { ef, ivl, reps, due, lapses, last, state }
    quiz: [],        // history [{ ts, scope, n, correct, secs }]
    qstats: {},      // qid -> { seen, right }
    scenarios: {},   // id -> { runs, best }
    drills: {},      // id -> { runs, best }
    days: {},        // YYYY-MM-DD -> { cards, lessons, quiz, scen }
    path: {},        // taskId -> ts
    flags: {},
    hours: [],       // CASPA hours log [{ id, kind: 'pce'|'shadow', date, employer, role, hours, supervisor, contact, notes }]
    mistakes: [],    // [{ id, ts, miss, fix, source, tags, srs }]
    courses: [],     // GPA [{ id, name, term, credits, grade, sci }]
    degree: {},      // degree planner { perTerm, done: {courseId: true}, term: {courseId: n}, dropped: {courseId: true} }
    journal: [],     // not-on-shift entries [{ id, ts, title, text }]
    contacts: [],    // peer support contacts [{ id, name, role, phone }]
    stations: {},    // skill station runs { sheetId: [{ ts, score, total, fails, video }] }
    sims: [],        // sim history [{ ts, kind, tid, score, total }]       // 'lesson:<id>' | 'q:<id>' -> { kind, id, title, mod, note, ts }
    settings: { theme: 'system', penOnly: true, dailyNew: 20, autoInk: true },
    firstRun: Date.now(),
  });
  let state = null;
  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign(DEFAULTS(), JSON.parse(raw)) : DEFAULTS();
      state.settings = Object.assign(DEFAULTS().settings, state.settings || {});
    } catch (e) { state = DEFAULTS(); }
    return state;
  }
  let saveTimer = null;
  function save(now) {
    if (!state) return;
    const write = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota or private mode */ } };
    if (now) { clearTimeout(saveTimer); saveTimer = null; write(); return; }
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; write(); }, 150);
  }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function bump(field, n = 1) {
    const s = load();
    const k = today();
    s.days[k] = s.days[k] || { cards: 0, lessons: 0, quiz: 0, scen: 0 };
    s.days[k][field] = (s.days[k][field] || 0) + n;
    save();
  }
  function exportJSON() { save(true); const o = Object.assign({}, load()); delete o.journal; return JSON.stringify(o, null, 2); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !obj.cards || !obj.lessons) throw new Error('Not a Rounds progress file');
    state = Object.assign(DEFAULTS(), obj);
    state.settings = Object.assign(DEFAULTS().settings, state.settings || {});
    save(true);
  }
  function reset() { state = DEFAULTS(); save(true); }

  // ---- IndexedDB for ink ----
  let dbp = null;
  function idb() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open('rounds-ink', 2);
      req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains('ink')) db.createObjectStore('ink'); if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs'); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    return dbp;
  }
  async function inkGet(id) {
    const db = await idb(); if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('ink', 'readonly'); const r = tx.objectStore('ink').get(id);
      r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null);
    });
  }
  async function inkSet(id, data) {
    const db = await idb(); if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction('ink', 'readwrite');
      if (data) tx.objectStore('ink').put(data, id); else tx.objectStore('ink').delete(id);
      tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false);
    });
  }
  async function inkKeys() {
    const db = await idb(); if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction('ink', 'readonly'); const r = tx.objectStore('ink').getAllKeys();
      r.onsuccess = () => resolve(r.result || []); r.onerror = () => resolve([]);
    });
  }
  async function inkClear() {
    const db = await idb(); if (!db) return;
    return new Promise((resolve) => { const tx = db.transaction(['ink', 'blobs'], 'readwrite'); tx.objectStore('ink').clear(); tx.objectStore('blobs').clear(); tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); });
  }
  async function blobGet(id) { const db = await idb(); if (!db) return null; return new Promise((resolve) => { const r = db.transaction('blobs', 'readonly').objectStore('blobs').get(id); r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null); }); }
  async function blobSet(id, data) { const db = await idb(); if (!db) return false; return new Promise((resolve) => { const tx = db.transaction('blobs', 'readwrite'); if (data) tx.objectStore('blobs').put(data, id); else tx.objectStore('blobs').delete(id); tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); }); }
  // Merge another device's state into this one. Union everywhere; per-record, the more-advanced or more-recent wins.
  function merge(remote) {
    if (!remote || typeof remote !== 'object') return false;
    const s = load(); const before = JSON.stringify(s);
    const byId = (key, idf) => { const map = new Map((s[key] || []).map((x) => [idf(x), x])); for (const x of remote[key] || []) if (x && !map.has(idf(x))) map.set(idf(x), x); s[key] = [...map.values()]; };
    for (const [id, r] of Object.entries(remote.lessons || {})) {
      const l = s.lessons[id] || {}; const o = Object.assign({}, r, l);
      const st = Math.min(l.started || Infinity, r.started || Infinity); if (st !== Infinity) o.started = st; else delete o.started;
      const dn = l.done && r.done ? Math.min(l.done, r.done) : (l.done || r.done); if (dn) o.done = dn; else delete o.done;
      const ad = l.added || r.added; if (ad) o.added = ad; else delete o.added;
      s.lessons[id] = o;
    }
    for (const [id, r] of Object.entries(remote.cards || {})) { const l = s.cards[id]; if (!l || (r.last || 0) > (l.last || 0)) s.cards[id] = r; }
    byId('quiz', (x) => x.ts + ':' + x.scope); byId('sims', (x) => x.ts + ':' + x.kind); byId('hours', (x) => x.id); byId('mistakes', (x) => x.id); byId('courses', (x) => x.id); byId('journal', (x) => x.id); byId('contacts', (x) => x.id);
    for (const r of remote.mistakes || []) { const l = s.mistakes.find((x) => x.id === r.id); if (l && r.srs && (!l.srs || (r.srs.last || 0) > (l.srs.last || 0))) l.srs = r.srs; }
    for (const [id, r] of Object.entries(remote.qstats || {})) { const l = s.qstats[id] || { seen: 0, right: 0 }; s.qstats[id] = { seen: Math.max(l.seen || 0, r.seen || 0), right: Math.max(l.right || 0, r.right || 0) }; }
    for (const key of ['scenarios', 'drills']) for (const [id, r] of Object.entries(remote[key] || {})) { const l = s[key][id] || {}; s[key][id] = { runs: Math.max(l.runs || 0, r.runs || 0), best: Math.max(l.best || 0, r.best || 0), last: Math.max(l.last || 0, r.last || 0) }; }
    for (const [id, arr] of Object.entries(remote.stations || {})) { const l = s.stations[id] || []; const seen = new Set(l.map((x) => x.ts)); s.stations[id] = [...l, ...(arr || []).filter((x) => !seen.has(x.ts))].sort((a, b) => a.ts - b.ts); }
    for (const [d, r] of Object.entries(remote.days || {})) { const l = s.days[d] || {}; s.days[d] = { cards: Math.max(l.cards || 0, r.cards || 0), lessons: Math.max(l.lessons || 0, r.lessons || 0), quiz: Math.max(l.quiz || 0, r.quiz || 0), scen: Math.max(l.scen || 0, r.scen || 0) }; }
    for (const [id, ts] of Object.entries(remote.path || {})) if (!s.path[id]) s.path[id] = ts;
    for (const key of ['mastery', 'finals']) { s[key] = s[key] || {}; for (const [id, r] of Object.entries(remote[key] || {})) { const l = s[key][id]; if (!l || (r.pct || 0) > (l.pct || 0)) s[key][id] = r; } }
    s.exams = s.exams || {}; for (const [id, arr] of Object.entries(remote.exams || {})) { const l = s.exams[id] || []; const seen = new Set(l.map((x) => x.ts)); s.exams[id] = [...l, ...(arr || []).filter((x) => !seen.has(x.ts))]; }
    s.flags = Object.assign({}, remote.flags || {}, s.flags || {});
    s.miniq = Object.assign({}, remote.miniq || {}, s.miniq || {});
    if (remote.examRun && !s.examRun) s.examRun = remote.examRun;
    if (remote.degree && Object.keys(remote.degree).length) { s.degree = s.degree || {}; s.degree.done = Object.assign({}, remote.degree.done || {}, s.degree.done || {}); s.degree.dropped = Object.assign({}, remote.degree.dropped || {}, s.degree.dropped || {}); s.degree.term = Object.assign({}, remote.degree.term || {}, s.degree.term || {}); s.degree.perTerm = s.degree.perTerm || remote.degree.perTerm; s.degree.start = s.degree.start || remote.degree.start; }
    s.firstRun = Math.min(s.firstRun || Infinity, remote.firstRun || Infinity);
    const changed = JSON.stringify(s) !== before; if (changed) save(true); return changed;
  }
  window.Store = { load, save, today, bump, exportJSON, importJSON, reset, inkGet, inkSet, inkKeys, inkClear, blobGet, blobSet, merge };
})();
