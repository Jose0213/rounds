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
  function exportJSON() { save(true); return JSON.stringify(load(), null, 2); }
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
      const req = indexedDB.open('rounds-ink', 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('ink'); };
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
    return new Promise((resolve) => { const tx = db.transaction('ink', 'readwrite'); tx.objectStore('ink').clear(); tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); });
  }
  window.Store = { load, save, today, bump, exportJSON, importJSON, reset, inkGet, inkSet, inkKeys, inkClear };
})();
