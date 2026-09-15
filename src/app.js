/* Rounds — app: router + views. Vanilla JS. Content index loads up front; modules load on demand. */
(function () {
  'use strict';
  const IDX = window.ROUNDS_INDEX || { tracks: [], modules: [], reference: [], version: 'dev', build: 'dev' };
  const S = Store.load();
  const $ = (sel, el = document) => el.querySelector(sel);
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = MD.esc;
  const view = $('#view');
  const BUILD = document.getElementById('app').dataset.build || 'dev';

  // ---------- Content index (light) + lazy full modules ----------
  const TRACK = new Map(IDX.tracks.map((t) => [t.id, t]));
  const MODS = new Map(IDX.modules.map((m) => [m.id, m]));            // light: lessons list, counts, scenario list
  const orderedIds = []; for (const t of IDX.tracks) for (const id of t.modules) if (MODS.has(id)) orderedIds.push(id);
  const orderedLight = orderedIds.map((id) => MODS.get(id));
  const LESSON_IDX = new Map(); for (const m of orderedLight) m.lessons.forEach((l, i) => { l._idx = i; l._mod = m.id; LESSON_IDX.set(l.id, l); });
  const SCEN_IDX = new Map(); for (const m of orderedLight) m.scenarios.forEach((s) => { s._mod = m.id; SCEN_IDX.set(s.id, s); });
  const REF = new Map((IDX.reference || []).map((r) => [r.id, r]));
  const FULL = new Map(), LESSON = new Map(), CARD = new Map(), Q = new Map(), SCEN = new Map();
  const loading = new Map();
  const modOf = (id) => String(id).replace(/-(l|c|q|s)\d+$/, '');
  function indexModule(m) {
    FULL.set(m.id, m);
    m.lessons.forEach((l, i) => { l._idx = i; l._mod = m.id; LESSON.set(l.id, l); });
    m.cards.forEach((c) => { c._mod = m.id; CARD.set(c.id, c); });
    m.quiz.forEach((q) => { q._mod = m.id; Q.set(q.id, q); });
    (m.scenarios || []).forEach((s) => { s._mod = m.id; SCEN.set(s.id, s); });
  }
  function loadModule(id) {
    if (FULL.has(id)) return Promise.resolve(FULL.get(id));
    if (!MODS.has(id)) return Promise.reject(new Error('unknown module ' + id));
    if (loading.has(id)) return loading.get(id);
    const p = new Promise((resolve, reject) => {
      if (window.ROUNDS_MODULES && window.ROUNDS_MODULES[id]) { indexModule(window.ROUNDS_MODULES[id]); return resolve(FULL.get(id)); }
      const s = document.createElement('script'); s.src = 'content/' + id + '.js?v=' + BUILD; s.async = true;
      s.onload = () => { const m = window.ROUNDS_MODULES && window.ROUNDS_MODULES[id]; if (!m) return reject(new Error('module did not register')); indexModule(m); resolve(m); };
      s.onerror = () => reject(new Error('failed to load ' + id));
      document.head.appendChild(s);
    });
    loading.set(id, p); p.finally(() => loading.delete(id));
    return p;
  }
  const loadModules = (ids) => Promise.all([...new Set(ids)].filter((id) => MODS.has(id)).map(loadModule));
  const loadAll = () => loadModules(orderedIds);
  const activeModuleIds = () => { const s = new Set(); for (const id of Object.keys(S.cards)) s.add(modOf(id)); for (const k of Object.keys(S.lessons)) { if (k.startsWith('*')) s.add(k.slice(1)); else if (S.lessons[k]?.done) s.add(modOf(k)); } return [...s].filter((id) => MODS.has(id)); };
  const trackOf = (m) => TRACK.get(m.track);

  // ---------- Helpers ----------
  function flagItem(key, info) {
    S.flags = S.flags || {}; const prior = S.flags[key];
    const note = prompt(prior ? 'Update the note on this flag (leave empty to remove it):' : 'What looks wrong? Cite the textbook page if you have it.', prior ? prior.note : '');
    if (note === null) return; if (!note.trim()) { delete S.flags[key]; Store.save(); toast('Flag removed.'); return; }
    S.flags[key] = Object.assign({}, info, { note: note.trim(), ts: Date.now() }); Store.save(); toast('Flagged. Review your flags in Settings.');
  }
  function toast(msg, action) {
    const t = $('#toast');
    t.innerHTML = esc(msg) + (action ? ' <button class="btn sm primary">' + esc(action.label) + '</button>' : '');
    if (action) $('button', t).onclick = () => { action.fn(); t.hidden = true; };
    t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, action ? 8000 : 2600);
  }
  const lessonDone = (id) => !!S.lessons[id]?.done;
  const strict = () => S.settings.strict !== false;
  const moduleComplete = (m) => m.lessons.every((l) => lessonDone(l.id));
  const moduleMastered = (m) => (S.mastery?.[m.id]?.pct || 0) >= 80;
  // Strict order: a lesson unlocks when the one before it is finished; a module unlocks when the previous module in its track is finished and its mastery test is passed.
  function moduleLock(m) {
    if (!strict()) return null; const t = trackOf(m); const i = t.modules.indexOf(m.id);
    let prev = null;
    if (i > 0) prev = MODS.get(t.modules[i - 1]);
    else { // first module of a track: the previous track must be finished (foundations → EMT → ED tech → pre-PA; prerequisites run in parallel)
      const chain = IDX.tracks.filter((x) => x.id !== 'prereq'); const ti = chain.findIndex((x) => x.id === t.id);
      if (ti > 0) { const pt = chain[ti - 1]; prev = MODS.get(pt.modules[pt.modules.length - 1]); }
    }
    if (!prev) return null;
    const up = moduleLock(prev); if (up) return up;
    if (!moduleComplete(prev)) { const nl = prev.lessons.find((l) => !lessonDone(l.id)); return { reason: 'Finish ' + prev.title + ' first', href: '#/lesson/' + nl.id, label: 'Go to ' + nl.title }; }
    if (!moduleMastered(prev)) return { reason: 'Pass the ' + prev.short + ' mastery test (80%) first', href: '#/quiz?scope=' + prev.id + '&n=25&mode=exam', label: 'Take the mastery test' };
    return null;
  }
  function lessonLock(l) {
    if (!strict() || lessonDone(l.id)) return null; const m = MODS.get(l._mod);
    if (l._idx === 0) return moduleLock(m);
    const prev = m.lessons[l._idx - 1]; if (!lessonDone(prev.id)) return { reason: 'Finish the lesson before it first', href: '#/lesson/' + prev.id, label: prev.title };
    return null;
  }
  const lessonStarted = (id) => !!S.lessons[id]?.started;
  const modProgress = (m) => { const n = m.lessons.filter((l) => lessonDone(l.id)).length; return { n, total: m.lessons.length, pct: m.lessons.length ? Math.round((n / m.lessons.length) * 100) : 0 }; };
  const trackProgress = (t) => { let n = 0, total = 0; for (const id of t.modules) { const m = MODS.get(id); if (!m) continue; n += m.lessons.filter((l) => lessonDone(l.id)).length; total += m.lessons.length; } return { n, total, pct: total ? Math.round((n / total) * 100) : 0 }; };
  function nextLesson() { for (const m of orderedLight) for (const l of m.lessons) if (!lessonDone(l.id)) return { m, l }; return null; }
  function nextInModule(m, l) { const i = m.lessons.findIndex((x) => x.id === l.id); return m.lessons[i + 1] || null; }
  function dueCards(now = Date.now()) { const out = []; for (const [id, rec] of Object.entries(S.cards)) if (SRS.isDue(rec, now) && MODS.has(modOf(id))) out.push(id); return out; }
  function learningCards(now = Date.now()) { const out = []; for (const [id, rec] of Object.entries(S.cards)) if (rec.state === 'learning' && rec.due <= now + 1800000 && MODS.has(modOf(id))) out.push(id); return out; }
  function newCardPool() { const out = []; for (const id of orderedIds) { const m = FULL.get(id); if (!m) continue; for (const c of m.cards) if (!S.cards[c.id] && (lessonDone(c.lesson) || S.lessons['*' + m.id]?.added)) out.push(c.id); } return out; }
  function newCardEstimate() { let n = 0; for (const m of orderedLight) { const added = !!S.lessons['*' + m.id]?.added; for (const l of m.lessons) if (added || lessonDone(l.id)) n += l.cards; } const have = Object.keys(S.cards).filter((id) => MODS.has(modOf(id))).length; return Math.max(0, n - have); }
  function streak() {
    let n = 0; const d = new Date(); d.setHours(12, 0, 0, 0);
    const key = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    const active = (k) => { const v = S.days[k]; return v && (v.cards || v.lessons || v.quiz || v.scen); };
    if (!active(key(d))) d.setDate(d.getDate() - 1);
    while (active(key(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function updateBadge() { const n = dueCards().length + learningCards().length; const b = $('#badge-due'); b.textContent = n > 99 ? '99+' : String(n); b.hidden = n === 0; }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const fmtMin = (n) => n + ' min';
  const KEYS = ['A', 'B', 'C', 'D'];
  const choicesHTML = (choices) => '<div class="choices">' + choices.map((c, i) => '<button class="choice" data-i="' + i + '"><span class="key">' + KEYS[i] + '</span><span>' + MD.inline(c) + '</span></button>').join('') + '</div>';
  function applyTheme() { const t = S.settings.theme; if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  const backLink = (href, label) => '<a class="back" href="' + href + '"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' + esc(label) + '</a>';
  const chev = '<svg class="chev" width="20" height="20" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const askBtn = (cls = 'btn sm subtle ask') => `<button class="${cls}" data-ask><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Ask</button>`;
  const settingLabel = (s) => s === 'field' ? 'In the field' : s === 'ed' ? 'In the ED' : 'Reasoning';
  const today = () => Store.today();
  const isToday = (ts) => !!ts && new Date(ts).toDateString() === new Date().toDateString();
  const loadingHTML = '<div class="empty"><span class="faint">Loading…</span></div>';

  // ---------- Router ----------
  const routes = [];
  const route = (pattern, fn) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn });
  let cleanup = null, navToken = 0;
  async function navigate() {
    const hash = location.hash.replace(/^#/, '') || '/today';
    const [path, qs] = hash.split('?');
    const params = Object.fromEntries(new URLSearchParams(qs || ''));
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    const token = ++navToken;
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const args = m.slice(1).map(decodeURIComponent);
        const nav = path.split('/')[1] || 'today';
        document.querySelectorAll('.rail-item').forEach((a) => a.classList.toggle('active', a.dataset.nav === (({ lesson: 'learn', module: 'learn', quiz: 'practice', scenario: 'practice', drill: 'practice', tools: 'practice', exam: 'practice', search: 'learn', sim: 'practice', station: 'practice', hours: 'career', mistakes: 'career', gpa: 'career', degree: 'career', decompress: 'career' })[nav] || nav)));
        view.innerHTML = loadingHTML; window.scrollTo(0, 0);
        try {
          const ret = await r.fn(...args, params, token);
          if (token !== navToken) return;
          if (typeof ret === 'function') cleanup = ret;
        } catch (e) { if (token === navToken) view.innerHTML = '<div class="empty">That did not load. <a href="#/today">Back to Today</a><div class="faint tiny" style="margin-top:8px">' + esc(e.message || e) + '</div></div>'; }
        updateBadge();
        return;
      }
    }
    location.hash = '#/today';
  }
  const stale = (token) => token !== navToken;
  function show(el, token) { if (stale(token)) return false; view.innerHTML = ''; view.appendChild(el); return true; }
  window.addEventListener('hashchange', navigate);

  // ---------- Daily plan ----------
  function buildPlan() {
    const k = today();
    if (S.plan && S.plan.date === k && S.plan.items && !(S.plan.items.some((i) => i.kind === 'review-empty') && (dueCards().length + learningCards().length + newCardEstimate()) > 0)) return S.plan;
    const items = [];
    const nl = nextLesson();
    if (nl) items.push({ kind: 'lesson', id: nl.l.id, title: nl.l.title, sub: nl.m.title, mins: nl.l.minutes, href: '#/lesson/' + nl.l.id });
    const nothingToReview = dueCards().length + learningCards().length === 0 && newCardEstimate() === 0;
    if (!nothingToReview) items.push({ kind: 'review', id: 'review', title: 'Review the cards that are due', sub: 'Spaced repetition', mins: 8, href: '#/review' });
    else if (nl) items.push({ kind: 'review-empty', id: 'review', title: 'No cards yet: finishing a lesson unlocks its cards', sub: 'Review starts after your first lesson', mins: 0, href: '#/lesson/' + nl.l.id });
    const dayIdx = Math.floor(Date.now() / 86400000);
    const drills = Drills.list; const d = drills[dayIdx % drills.length];
    items.push({ kind: 'drill', id: d.id, title: d.title, sub: 'Drill · ' + d.kind, mins: 4, href: '#/drill/' + d.id });
    items.push({ kind: 'sim', id: 'history', title: 'Take a history from the AI patient', sub: 'Simulation · SAMPLE and OPQRST', mins: 5, href: '#/sim/history' });
    const sc = pickScenario();
    if (sc && dayIdx % 2 === 0) items.push({ kind: 'scenario', id: sc.id, title: sc.title, sub: 'Scenario · ' + MODS.get(sc._mod).title, mins: 6, href: '#/scenario/' + sc.id });
    else items.push({ kind: 'quiz', id: 'quiz', title: 'Ten mixed questions', sub: 'Quiz · everything unlocked', mins: 6, href: '#/quiz?scope=all&n=10' });
    S.plan = { date: k, items }; Store.save();
    return S.plan;
  }
  function planItemDone(it) {
    const d = S.days[today()] || {};
    if (it.kind === 'lesson') return lessonDone(it.id);
    if (it.kind === 'review') return (d.cards || 0) >= 8 || (dueCards().length + learningCards().length === 0 && newCardEstimate() === 0);
    if (it.kind === 'review-empty') return false;
    if (it.kind === 'drill') return isToday(S.drills[it.id]?.last);
    if (it.kind === 'scenario') return isToday(S.scenarios[it.id]?.last);
    if (it.kind === 'quiz') return S.quiz.some((q) => isToday(q.ts));
    if (it.kind === 'sim') return (S.sims || []).some((x) => x.kind === 'history' && isToday(x.ts));
    return false;
  }
  function pickScenario() {
    const all = [...SCEN_IDX.values()];
    if (!all.length) return null;
    const scored = all.map((s) => { const m = MODS.get(s._mod); const p = modProgress(m).pct; const runs = S.scenarios[s.id]?.runs || 0; return { s, score: (runs ? -10 * runs : 0) + p + (m.track === 'foundations' ? 20 : 0) + Math.random() * 5 }; });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].s;
  }

  // ---------- Today ----------
  route('/today', async (params, token) => {
    await loadModules(activeModuleIds()); if (stale(token)) return;
    const nl = nextLesson();
    const due = dueCards().length, learn = learningCards().length, pool = newCardPool().length;
    const st = streak();
    const totalLessons = orderedLight.reduce((a, m) => a + m.lessons.length, 0);
    const doneLessons = Object.keys(S.lessons).filter((k) => !k.startsWith('*') && LESSON_IDX.has(k) && S.lessons[k].done).length;
    const learned = Object.values(S.cards).filter((r) => r.state === 'review').length;
    const qh = S.quiz.slice(-10); const acc = qh.length ? Math.round((qh.reduce((a, q) => a + q.correct, 0) / qh.reduce((a, q) => a + q.n, 0)) * 100) : null;
    const plan = buildPlan(); const planDone = plan.items.filter(planItemDone).length;
    const el = h(`<div>
        <div class="page-head"><div><div class="eyebrow">Rounds</div><h1>Today</h1></div><div class="chip mono">${esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }))}</div></div>
        ${S.examRun && (IDX.exams || []).some((x) => x.id === S.examRun.id) ? `<a class="card link" style="margin-bottom:16px;border-left:4px solid var(--warn)" href="#/exam/${S.examRun.id}?start=1"><div class="eyebrow" style="color:var(--warn)">Exam in progress</div><h3 style="margin-top:4px">${esc((IDX.exams.find((x) => x.id === S.examRun.id) || {}).title || '')} · ${Object.keys(S.examRun.answers).length} answered</h3><p class="muted small">Tap to resume. The clock has been running since you started.</p></a>` : ''}<div class="today-grid">
          <section class="card trace-card span-8"><div class="eyebrow">Activity · last 30 days</div><canvas class="trace-canvas" id="trace"></canvas>
            <div class="trace-stats"><div class="trace-stat hr"><b class="num">${st}</b><span>day streak</span></div><div class="trace-stat spo2"><b class="num">${learned}</b><span>cards learned</span></div><div class="trace-stat bp"><b class="num">${doneLessons}<span style="font-size:.9rem;color:#8FA0AE">/${totalLessons}</span></b><span>lessons</span></div><div class="trace-stat rr"><b class="num">${acc === null ? '--' : acc + '%'}</b><span>quiz accuracy</span></div></div></section>
          <section class="card next-card span-4"><div class="eyebrow accent">Review</div><h2>${due + learn ? '<span class="num">' + (due + learn) + '</span> cards due' : 'Nothing due'}</h2><p class="muted small">${pool ? '<span class="num">' + Math.min(pool, S.settings.dailyNew) + '</span> new cards ready from finished lessons.' : due + learn ? 'Clear the queue, then keep learning.' : 'Finish a lesson to unlock its cards.'}</p><a class="btn ${due + learn + pool ? 'primary' : ''}" href="#/review">${due + learn + pool ? 'Start review' : 'Open review'}</a></section>
          <section class="card span-6"><div class="row" style="justify-content:space-between"><div class="eyebrow accent">Today's rounds</div><span class="chip ${planDone === plan.items.length ? 'good' : ''} num">${planDone}/${plan.items.length}</span></div><p class="muted small" style="margin:4px 0 10px">About ${plan.items.reduce((a, i) => a + i.mins, 0)} minutes. One of each, then you are done for the day.</p><div class="plan">${plan.items.map((it) => `<a class="plan-item ${planItemDone(it) ? 'done' : ''}" href="${it.href}"><span class="box">${planItemDone(it) ? '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><span class="grow"><div class="t">${esc(it.title)}</div><div class="sub">${esc(it.sub)}</div></span><span class="mins">${it.mins} min</span></a>`).join('')}</div></section>
          <section class="card next-card span-6"><div class="eyebrow accent">Up next</div>${nl ? `<h2>${esc(nl.l.title)}</h2><p class="muted small">${esc(nl.m.title)} · ${fmtMin(nl.l.minutes)} · lesson ${nl.l._idx + 1} of ${nl.m.lessons.length}</p><a class="btn primary" href="#/lesson/${nl.l.id}">${lessonStarted(nl.l.id) ? 'Continue lesson' : 'Start lesson'}</a>` : '<h2>All lessons done</h2><p class="muted small">Keep the cards moving and run scenarios.</p>'}
            <div class="btn-row" style="margin-top:4px"><a class="btn sm" href="#/practice">Practice</a><a class="btn sm" href="#/tools">Tools</a><button class="btn sm subtle ask" id="ask-today">${askBtn('btn sm subtle ask').replace(/<button[^>]*>|<\/button>/g, '')}</button></div></section>
          <section class="card span-12"><div class="eyebrow">Tracks</div><div class="track-progress" style="margin-top:10px">${IDX.tracks.map((t) => { const p = trackProgress(t); return `<a class="track-${t.id}" href="#/learn"><span><b>${esc(t.title)}</b> <span class="faint small">${esc(t.tagline)}</span></span><span class="pct">${p.n}/${p.total}</span><div class="progress"><i style="width:${p.pct}%"></i></div></a>`; }).join('')}</div></section>
        </div></div>`);
    if (!show(el, token)) return;
    drawTrace($('#trace', el));
    $('#ask-today', el).onclick = () => Tutor.open({ id: 'today', kind: 'general', title: 'Anything', label: 'Ask the tutor', text: nl ? 'Next lesson: ' + nl.l.title + ' (' + nl.m.title + ')' : '' });
  });
  function drawTrace(canvas) {
    const dpr = window.devicePixelRatio || 1; const w = canvas.clientWidth, hgt = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = hgt * dpr; const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.strokeStyle = 'rgba(143,160,174,.14)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, hgt); ctx.stroke(); }
    for (let y = 0; y < hgt; y += 20) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
    const days = []; const d = new Date(); d.setHours(12, 0, 0, 0);
    for (let i = 29; i >= 0; i--) { const x = new Date(d); x.setDate(d.getDate() - i); const k = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); const v = S.days[k]; days.push(v ? (v.cards || 0) + (v.lessons || 0) * 8 + (v.quiz || 0) * 2 + (v.scen || 0) * 6 : 0); }
    const max = Math.max(10, ...days); const base = hgt * 0.62, step = w / 30;
    ctx.strokeStyle = '#3DDC84'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(61,220,132,.5)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(0, base);
    days.forEach((v, i) => { const x0 = i * step, amp = (v / max) * (hgt * 0.5); if (v <= 0) { ctx.lineTo(x0 + step, base); return; } ctx.lineTo(x0 + step * 0.15, base); ctx.lineTo(x0 + step * 0.28, base - amp * 0.18); ctx.lineTo(x0 + step * 0.38, base); ctx.lineTo(x0 + step * 0.45, base + amp * 0.18); ctx.lineTo(x0 + step * 0.53, base - amp); ctx.lineTo(x0 + step * 0.61, base + amp * 0.3); ctx.lineTo(x0 + step * 0.68, base); ctx.lineTo(x0 + step * 0.82, base - amp * 0.28); ctx.lineTo(x0 + step * 0.92, base); ctx.lineTo(x0 + step, base); });
    ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#3DDC84'; ctx.beginPath(); ctx.arc(w - 2, base, 3, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Learn ----------
  route('/learn', (params, token) => {
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Curriculum</div><h1>Learn</h1><p class="lede">Four tracks, in order. Each lesson ends in a check; passing it unlocks the lesson's cards for review.</p></div>
        <form class="search" id="search-form" role="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="search-q" placeholder="Search lessons, cards, sheets" autocapitalize="off" autocorrect="off" enterkeyhint="search"></form></div><div id="tracks"></div></div>`);
    const wrap = $('#tracks', el);
    for (const t of IDX.tracks) {
      const p = trackProgress(t);
      wrap.appendChild(h(`<div class="track-${t.id}"><div class="track-head"><span class="dot"></span><h2>${esc(t.title)}</h2><span class="chip track num">${p.n}/${p.total}</span></div><p class="muted small" style="margin:-4px 0 12px 24px">${esc(t.tagline)}</p><div class="grid" id="tg-${t.id}"></div></div>`));
      const g = $('#tg-' + t.id, wrap);
      for (const id of t.modules) {
        const m = MODS.get(id);
        if (!m) { g.appendChild(h(`<div class="card module-card" style="opacity:.55"><div class="title">${esc(id)}</div><div class="summary">Not loaded yet.</div></div>`)); continue; }
        const mp = modProgress(m);
        const mlk = moduleLock(m); g.appendChild(h(`<a class="card link module-card ${mlk ? 'locked' : ''}" href="#/module/${m.id}"><div class="title">${esc(m.title)}${mlk ? ' <span class="chip warn" style="vertical-align:middle">locked</span>' : ''}</div>${chev}<div class="summary">${esc(m.summary)}</div><div class="meta"><span class="chip">${m.lessons.length} lessons · ${fmtMin(m.counts.minutes)}</span><span class="chip">${m.counts.cards} cards</span>${m.counts.scenarios ? '<span class="chip">' + m.counts.scenarios + ' scenario' + (m.counts.scenarios > 1 ? 's' : '') + '</span>' : ''}${S.mastery?.[m.id]?.pct >= 80 ? '<span class="chip good">Mastered</span>' : ''}</div><div class="progress"><i style="width:${mp.pct}%"></i></div></a>`));
      }
    }
    show(el, token);
    $('#search-form', el).addEventListener('submit', (e) => { e.preventDefault(); const q = $('#search-q', el).value.trim(); if (q) location.hash = '#/search?q=' + encodeURIComponent(q); });
  });

  route('/module/:id', (id, params, token) => {
    const m = MODS.get(id); if (!m) { show(h('<div class="empty">Module not found.</div>'), token); return; }
    const t = trackOf(m); const mp = modProgress(m); const added = !!S.lessons['*' + m.id]?.added;
    const el = h(`<div class="track-${m.track}">${backLink('#/learn', 'Learn')}
      <div class="page-head"><div><div class="eyebrow" style="color:var(--track)">${esc(t.title)}</div><h1>${esc(m.title)}</h1><p class="lede">${esc(m.summary)}</p></div><div class="row"><span class="chip track num">${mp.n}/${mp.total} lessons</span><span class="chip">${fmtMin(m.counts.minutes)}</span>${S.mastery?.[m.id]?.pct >= 80 ? '<span class="chip good">Mastered ' + S.mastery[m.id].pct + '%</span>' : ''}</div></div>
      <div class="progress" style="margin-bottom:20px"><i style="width:${mp.pct}%"></i></div>
      <div class="split"><div><div class="eyebrow" style="margin-bottom:6px">Lessons</div><div class="card list" id="lessons"></div></div>
        <div class="stack"><div class="card"><div class="eyebrow">Practice this module</div><div class="btn-row" style="margin-top:12px"><a class="btn" href="#/quiz?scope=${m.id}&n=${Math.min(20, m.counts.quiz)}">Practice quiz · <span class="num">${m.counts.quiz}</span> questions</a><a class="btn ${S.mastery?.[m.id]?.pct >= 80 ? 'subtle' : 'primary'}" href="#/quiz?scope=${m.id}&n=${Math.min(25, m.counts.quiz)}&mode=exam">${S.mastery?.[m.id] ? 'Mastery test · best ' + S.mastery[m.id].pct + '%' : 'Mastery test · 25 timed'}</a><button class="btn" id="add-cards">${added ? 'Cards added to review' : 'Add all ' + m.counts.cards + ' cards to review'}</button></div><p class="faint small" style="margin-top:10px">Cards normally unlock as you finish lessons. Adding them all is for cramming before an exam.</p></div>
          ${m.scenarios.length ? `<div class="card"><div class="eyebrow">Scenarios</div><div class="list">${m.scenarios.map((s) => { const r = S.scenarios[s.id]; return `<a class="list-item" href="#/scenario/${s.id}"><span class="lead">${s.setting === 'field' ? 'EMS' : s.setting === 'ed' ? 'ED' : 'CR'}</span><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${s.steps} decisions${r ? ' · best ' + r.best + '%' : ''}</span></span>${chev}</a>`; }).join('')}</div></div>` : ''}</div></div></div>`);
    const list = $('#lessons', el); const ml = moduleLock(m);
    if (ml) list.parentNode.insertBefore(h(`<div class="why no" style="margin-bottom:10px"><strong>Locked.</strong> ${esc(ml.reason)}. <a href="${ml.href}">${esc(ml.label)}</a></div>`), list);
    m.lessons.forEach((l, i) => { const done = lessonDone(l.id); const lk = lessonLock(LESSON_IDX.get(l.id)); list.appendChild(h(`<a class="list-item ${done ? 'done' : ''} ${lk ? 'locked' : ''}" href="${lk ? lk.href : '#/lesson/' + l.id}" ${lk ? 'title="' + esc(lk.reason) + '"' : ''}><span class="lead">${done ? '✓' : String(i + 1).padStart(2, '0')}</span><span class="grow"><span class="title">${esc(l.title)}</span><span class="sub">${fmtMin(l.minutes)} · ${l.checks} checks · ${l.cards} cards</span></span>${chev}</a>`)); });
    $('#add-cards', el).onclick = (e) => { S.lessons['*' + m.id] = { added: Date.now() }; Store.save(); e.target.textContent = 'Cards added to review'; toast('All ' + m.counts.cards + ' cards will show up as new in Review.'); updateBadge(); };
    show(el, token);
  });

  // ---------- Lesson ----------
  route('/lesson/:id', async (id, params, token) => {
    const li = LESSON_IDX.get(id); if (!li) { show(h('<div class="empty">Lesson not found.</div>'), token); return; }
    const m = await loadModule(li._mod); if (stale(token)) return;
    const l = LESSON.get(id); const t = trackOf(m);
    const lock = lessonLock(LESSON_IDX.get(id)); if (lock) { toast(lock.reason + '.'); location.hash = lock.href; return; }
    S.lessons[id] = Object.assign({}, S.lessons[id], { started: S.lessons[id]?.started || Date.now() }); Store.save();
    const done = lessonDone(id); const next = nextInModule(m, l);
    const el = h(`<div class="lesson track-${m.track}" id="lesson">${backLink('#/module/' + m.id, m.title)}<div class="ink-bar" id="ink-bar" hidden></div>
      <header class="lesson-head"><div class="eyebrow" style="color:var(--track)">${esc(t.title)} · ${esc(m.short)} · Lesson ${l._idx + 1} of ${m.lessons.length}</div><h1>${esc(l.title)}</h1>
        <div class="meta"><span class="chip">${fmtMin(l.minutes)}</span>${done ? '<span class="chip good">Completed</span>' : ''}<div class="lesson-tools">${askBtn()}<button class="btn sm subtle" id="ink-toggle" title="Pencil notes"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 20l4-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="2"/></svg>Notes</button></div></div></header>
      <article class="prose" id="body">${MD.render(l.body)}</article>
      <section class="keypoints"><div class="eyebrow accent">Walk away with</div><ol>${l.keyPoints.map((k) => '<li>' + MD.inline(k) + '</li>').join('')}</ol></section>
      <section class="checks ${done || !strict() ? '' : 'gated'}" id="checks-sec"><div class="eyebrow accent">Check yourself</div><p class="muted small" style="margin-top:4px">Get all ${l.checks.length} right to finish the lesson and unlock its cards.${done || !strict() ? '' : ' <b>Read to the end first.</b>'}</p><div id="checks"></div></section>
      <footer class="lesson-foot"><button class="btn primary lg" id="finish" ${done ? '' : 'disabled'}>${done ? 'Completed' : 'Finish lesson'}</button>${next ? `<a class="btn" href="#/lesson/${next.id}">Next: ${esc(next.title)}</a>` : `<a class="btn" href="#/module/${m.id}">Back to module</a>`}</footer>
      <aside class="source-note"><div class="eyebrow">Source check</div><p class="small muted">This lesson was written by an AI model and has not been reviewed by a clinician. Your textbook wins every conflict: for EMT, the AAOS <em>Emergency Care and Transportation of the Sick and Injured</em> or Brady <em>Emergency Care</em> is what the NREMT tests from. If something here disagrees with class, flag it.</p><button class="btn sm ${(S.flags || {})['lesson:' + id] ? 'danger' : ''}" id="flag">${(S.flags || {})['lesson:' + id] ? 'Flagged · edit' : 'Flag an error'}</button></aside>
      <div class="ink-layer" id="ink-layer"></div></div>`);
    $('#flag', el).onclick = () => { flagItem('lesson:' + id, { kind: 'lesson', id, title: l.title, mod: m.id }); const f = (S.flags || {})['lesson:' + id]; $('#flag', el).textContent = f ? 'Flagged · edit' : 'Flag an error'; $('#flag', el).classList.toggle('danger', !!f); };
    const checks = $('#checks', el); const passed = new Array(l.checks.length).fill(done);
    if (!done && strict() && 'IntersectionObserver' in window) { const kp = $('.keypoints', el); const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { $('#checks-sec', el).classList.remove('gated'); io.disconnect(); } }, { threshold: 0.6 }); setTimeout(() => io.observe(kp), 300); } else $('#checks-sec', el).classList.remove('gated');
    l.checks.forEach((c, ci) => {
      const box = h(`<div class="check"><div class="eyebrow">Check ${ci + 1}</div><div class="q">${MD.inline(c.q)}</div>${choicesHTML(c.choices)}<div class="why" hidden></div></div>`);
      box.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const i = +b.dataset.i; const ok = i === c.answer;
        box.querySelectorAll('.choice').forEach((x) => x.classList.remove('picked', 'right', 'wrong'));
        b.classList.add(ok ? 'right' : 'wrong');
        if (ok) box.querySelectorAll('.choice').forEach((x) => { x.disabled = true; if (+x.dataset.i === c.answer) x.classList.add('right'); });
        const why = $('.why', box); why.hidden = false; why.className = 'why ' + (ok ? 'ok' : 'no'); why.innerHTML = (ok ? '<strong>Right.</strong> ' : '<strong>Not quite.</strong> Try again. ') + MD.inline(ok ? c.why : '');
        passed[ci] = passed[ci] || ok; if (passed.every(Boolean)) $('#finish', el).disabled = false;
      });
      checks.appendChild(box);
    });
    $('#finish', el).onclick = () => {
      if (lessonDone(id)) return;
      S.lessons[id] = Object.assign({}, S.lessons[id], { done: Date.now() }); Store.bump('lessons'); Store.save(true);
      const n = m.cards.filter((c) => c.lesson === id).length; $('#finish', el).textContent = 'Completed';
      const doneIds = m.lessons.filter((x) => lessonDone(x.id)).map((x) => x.id);
      S.miniq = S.miniq || {}; const sinceIds = doneIds.filter((x) => !(S.miniq[m.id] || []).includes(x));
      if (doneIds.length === m.lessons.length) { toast('Module complete. Take the mastery test.', { label: 'Mastery test', fn: () => { location.hash = '#/quiz?scope=' + m.id + '&n=' + Math.min(25, m.quiz.length) + '&mode=exam'; } }); }
      else if (sinceIds.length >= 3) { S.miniq[m.id] = doneIds.slice(); Store.save(); toast('Quick check on the last ' + sinceIds.length + ' lessons.', { label: 'Take it (5 Qs)', fn: () => { location.hash = '#/quiz?scope=' + m.id + '&n=5&lessons=' + sinceIds.join(','); } }); }
      else toast('Lesson done. ' + n + ' cards unlocked for review.', next ? { label: 'Next lesson', fn: () => { location.hash = '#/lesson/' + next.id; } } : { label: 'Review now', fn: () => { location.hash = '#/review'; } });
      updateBadge();
    };
    if (!show(el, token)) return;
    const ctxObj = { id: 'lesson:' + id, kind: 'lesson', title: l.title, label: 'Lesson · ' + l.title, text: l.body + '\n\nKey points:\n' + l.keyPoints.join('\n') };
    el.querySelector('[data-ask]').onclick = () => Tutor.open(ctxObj); Tutor.setContext(ctxObj);
    // ---- Pencil notes layer ----
    const layer = $('#ink-layer', el), bar = $('#ink-bar', el), toggle = $('#ink-toggle', el); let ink = null;
    function ensureInk() {
      if (ink) return ink;
      ink = new Ink(layer, { id: 'lesson:' + id, penOnly: S.settings.penOnly, width: 2.2 });
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      const colors = dark ? Ink.DARK_COLORS : Ink.COLORS;
      bar.innerHTML = colors.map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" data-c="${i}" style="background:${c}" aria-label="Ink color ${i + 1}"></button>`).join('') + '<span class="sep"></span><button class="tool" data-t="eraser" aria-label="Eraser"><svg viewBox="0 0 24 24"><path d="M4 16l8-8 6 6-6 6H8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8l6 6" stroke="currentColor" stroke-width="2"/></svg></button><button class="tool" data-t="undo" aria-label="Undo"><svg viewBox="0 0 24 24"><path d="M9 14l-4-4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10h9a5 5 0 0 1 0 10h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="tool" data-t="clear" aria-label="Clear"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="sep"></span><button class="tool" data-t="done" aria-label="Done"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
      bar.querySelectorAll('.sw').forEach((b) => b.onclick = () => { bar.querySelectorAll('.sw').forEach((x) => x.classList.remove('on')); bar.querySelectorAll('.tool').forEach((x) => x.classList.remove('on')); b.classList.add('on'); ink.setColor(+b.dataset.c); });
      bar.querySelectorAll('.tool').forEach((b) => b.onclick = () => { const tt = b.dataset.t; if (tt === 'eraser') { const on = b.classList.toggle('on'); ink.setTool(on ? 'eraser' : 'pen'); } else if (tt === 'undo') ink.undo(); else if (tt === 'clear') ink.clear(); else if (tt === 'done') setInking(false); });
      return ink;
    }
    function setInking(on) { ensureInk(); el.classList.toggle('inking', on); bar.hidden = !on; toggle.classList.toggle('primary', on); }
    toggle.onclick = () => setInking(!el.classList.contains('inking'));
    Store.inkGet('lesson:' + id).then((d) => { if (d && d.strokes && d.strokes.length) ensureInk(); });
    const onPointer = (e) => { if (e.pointerType === 'pen' && S.settings.autoInk && !el.classList.contains('inking') && !e.target.closest('button, a, input')) setInking(true); };
    el.addEventListener('pointerdown', onPointer);
    return () => { el.removeEventListener('pointerdown', onPointer); if (ink) ink.destroy(); };
  });

  // ---------- Review ----------
  route('/review', async (params, token) => {
    await loadModules(activeModuleIds()); if (stale(token)) return;
    const now = Date.now();
    const due = shuffle(dueCards(now)), learn = learningCards(now), pool = newCardPool();
    const newToday = Object.values(S.cards).filter((r) => r.state !== 'new' && isToday(r.last) && r.reps <= 1 && r.lapses === 0 && r.ivl <= 4).length;
    const newN = Math.max(0, S.settings.dailyNew - newToday);
    const queue = [...new Set([...learn, ...due, ...pool.slice(0, newN)])].filter((id) => CARD.has(id));
    if (!queue.length) {
      show(h(`<div class="review"><div class="page-head"><div><div class="eyebrow">Spaced repetition</div><h1>Review</h1></div></div><div class="card session-done"><b class="num">0</b><p>Nothing to review right now.</p><p class="muted small" style="margin-top:6px">${pool.length ? 'You have hit today\'s new-card limit (' + S.settings.dailyNew + '). Raise it in Settings or come back tomorrow.' : 'Finish a lesson to unlock its cards, or add a whole module from its page.'}</p><div class="btn-row" style="justify-content:center;margin-top:16px"><a class="btn primary" href="#/learn">Go learn</a><a class="btn" href="#/settings">Settings</a></div></div></div>`), token);
      return;
    }
    let idx = 0, flipped = false, doneCount = 0, again = 0, scratch = null;
    const el = h(`<div class="review"><div class="review-top"><div><div class="eyebrow">Spaced repetition</div><h1>Review</h1></div><div class="counts"><span class="new">new <b id="c-new"></b></span><span class="learn">learn <b id="c-learn"></b></span><span class="due">due <b id="c-due"></b></span></div></div><div class="progress" style="margin-bottom:14px"><i id="rp" style="width:0%"></i></div><div id="stage"></div></div>`);
    if (!show(el, token)) return;
    const stage = $('#stage', el);
    function counts() { let n = 0, lr = 0, d = 0; for (const id of queue.slice(idx)) { const r = S.cards[id]; if (!r || r.state === 'new') n++; else if (r.state === 'learning') lr++; else d++; } $('#c-new', el).textContent = n; $('#c-learn', el).textContent = lr; $('#c-due', el).textContent = d; $('#rp', el).style.width = Math.round((doneCount / (doneCount + queue.length - idx)) * 100) + '%'; }
    function render() {
      if (scratch) { scratch.destroy(); scratch = null; }
      if (idx >= queue.length) { stage.innerHTML = `<div class="card session-done"><b class="num">${doneCount}</b><p>cards reviewed. ${again ? again + ' marked again and will come back in 10 minutes.' : 'Clean session.'}</p><div class="btn-row" style="justify-content:center;margin-top:16px"><a class="btn primary" href="#/review">Check for more</a><a class="btn" href="#/today">Today</a></div></div>`; counts(); return; }
      const id = queue[idx]; const c = CARD.get(id); const m = MODS.get(c._mod); const l = LESSON.get(c.lesson);
      const rec = S.cards[id] || SRS.fresh(); const pv = SRS.preview(rec); flipped = false;
      stage.innerHTML = `<div class="flashcard track-${m.track}"><div class="face"><div class="row" style="justify-content:space-between"><div class="eyebrow" style="color:var(--track)">${esc(m.short)}${rec.state === 'new' ? ' · new' : rec.state === 'learning' ? ' · learning' : ' · review'}</div>${askBtn('btn sm ghost ask')}</div><div class="front" style="margin-top:8px">${MD.inline(c.front)}</div></div><div class="scratch" id="scratch"><span class="hint">Work it out here</span></div><div class="face back" id="back" hidden>${MD.inline(c.back)}<div class="src">${esc(l ? l.title : '')}</div></div></div>
        <div class="flip-row" id="flip-row"><button class="btn primary lg block" id="flip">Show answer <span class="faint tiny mono" style="margin-left:6px">space</span></button></div>
        <div class="grades" id="grades" hidden><button class="grade again" data-g="0">Again<small>${pv[0]}</small></button><button class="grade hard" data-g="1">Hard<small>${pv[1]}</small></button><button class="grade good" data-g="2">Good<small>${pv[2]}</small></button><button class="grade easy" data-g="3">Easy<small>${pv[3]}</small></button></div>`;
      scratch = new Ink($('#scratch', stage), { penOnly: S.settings.penOnly, width: 2.4 });
      $('#flip', stage).onclick = flip;
      stage.querySelectorAll('.grade').forEach((b) => b.onclick = () => gradeCard(+b.dataset.g));
      stage.querySelector('[data-ask]').onclick = () => Tutor.open({ id: 'card:' + id, kind: 'card', title: c.front, label: 'Card · ' + m.short, text: 'Card front: ' + c.front + '\nCard back: ' + c.back + '\nFrom lesson: ' + (l ? l.title : '') });
      counts();
    }
    function flip() { if (flipped) return; flipped = true; $('#back', stage).hidden = false; $('#flip-row', stage).hidden = true; $('#grades', stage).hidden = false; }
    function gradeCard(g) { if (!flipped) return; const id = queue[idx]; S.cards[id] = SRS.grade(S.cards[id], g); Store.bump('cards'); Store.save(); doneCount++; if (g === 0) { again++; queue.push(id); } idx++; render(); updateBadge(); }
    const onKey = (e) => { if (e.target.matches('input, textarea')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) flip(); else gradeCard(2); } else if (['1', '2', '3', '4'].includes(e.key)) gradeCard(+e.key - 1); };
    document.addEventListener('keydown', onKey);
    render();
    return () => { document.removeEventListener('keydown', onKey); if (scratch) scratch.destroy(); };
  });

  // ---------- Practice hub ----------
  route('/practice', async (params, token) => {
    await loadModules([...new Set(Object.keys(S.qstats).map(modOf))]); if (stale(token)) return;
    const scen = [...SCEN_IDX.values()]; const bySetting = { field: [], ed: [], classroom: [] }; scen.forEach((s) => bySetting[s.setting]?.push(s));
    const weak = weakLessons();
    const kinds = [...new Set(Drills.list.map((d) => d.kind))];
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Practice</div><h1>Practice</h1><p class="lede">Exam-style questions, drawn rhythm strips, branching scenarios, and hands-on drills.</p></div><a class="btn" href="#/tools">Bedside tools</a></div>
      <div class="grid" style="margin-bottom:22px">
        <a class="card link" href="#/quiz?scope=all&n=20"><div class="eyebrow accent">Quiz</div><h2 style="margin-top:6px">Mixed 20</h2><p class="muted small" style="margin-top:6px">Twenty questions across everything.</p></a>
        <a class="card link" href="#/quiz?scope=emt&n=70&mode=exam"><div class="eyebrow accent">Exam mode</div><h2 style="margin-top:6px">NREMT mock · 70</h2><p class="muted small" style="margin-top:6px">Timed, no feedback until the end. Domain-weighted like the real thing.</p></a>
        <a class="card link" href="#/quiz?scope=weak&n=20"><div class="eyebrow accent">Weak spots</div><h2 style="margin-top:6px">${weak.length ? weak.length + ' lessons to shore up' : 'No weak spots yet'}</h2><p class="muted small" style="margin-top:6px">${weak.length ? 'Questions from the lessons you miss most.' : 'Take a few quizzes and this fills in.'}</p></a>
        <a class="card link" href="#/quiz"><div class="eyebrow accent">Custom</div><h2 style="margin-top:6px">Build a quiz</h2><p class="muted small" style="margin-top:6px">Pick a track or module, length, and mode.</p></a>
      </div>
      <div class="grid" style="margin-bottom:22px">
        <a class="card link" href="#/sim/history"><div class="eyebrow accent">Simulation · daily</div><h2 style="margin-top:6px">AI patient: take the history</h2><p class="muted small" style="margin-top:6px">SAMPLE and OPQRST on a patient who only answers what you ask. Audited at the end.</p></a>
        <a class="card link" href="#/sim/report"><div class="eyebrow accent">Simulation · 30 s</div><h2 style="margin-top:6px">Radio report</h2><p class="muted small" style="margin-top:6px">MIST or SBAR against the clock, graded on what had to be in it.</p></a>
        <a class="card link" href="#/sim/pcr"><div class="eyebrow accent">Simulation</div><h2 style="margin-top:6px">PCR narrative</h2><p class="muted small" style="margin-top:6px">Chart a call. Checked for times, vitals trend, treatments, objective language, refusals.</p></a>
        <a class="card link" href="#/station"><div class="eyebrow accent">Skill stations</div><h2 style="margin-top:6px">Record and score yourself</h2><p class="muted small" style="margin-top:6px">NREMT sheets on camera, critical criteria highlighted.</p></a>
      </div>
      <div class="card" style="margin-bottom:22px"><div class="eyebrow">Full-length practice exams</div><div class="list">${(IDX.exams || []).map((x) => { const hist = (S.exams || {})[x.id] || []; const best = hist.length ? Math.max(...hist.map((a) => a.pct)) : null; return `<a class="list-item" href="#/exam/${x.id}"><span class="lead">${x.count}</span><span class="grow"><span class="title">${esc(x.title)}</span><span class="sub">${x.count} questions · ${Math.floor(x.minutes / 60) ? Math.floor(x.minutes / 60) + ' h ' : ''}${x.minutes % 60 ? x.minutes % 60 + ' min' : ''} · pool of ${x.pool}${best !== null ? ' · best ' + best + '%' : ''}</span></span>${chev}</a>`; }).join('') || '<div class="empty">Exam banks are still being written.</div>'}</div></div>
      <div class="card" style="margin-bottom:22px"><div class="eyebrow">Track finals · 50 timed questions, 80% to pass</div><div class="list">${IDX.tracks.map((t) => { const f = (S.finals || {})[t.id]; return `<a class="list-item track-${t.id}" href="#/quiz?scope=${t.id}&n=50&mode=exam"><span class="lead" style="background:var(--track-soft);color:var(--track)">${esc(t.title.slice(0, 3).toUpperCase())}</span><span class="grow"><span class="title">${esc(t.title)} final</span><span class="sub">${f ? 'best ' + f.pct + '%' + (f.pct >= 80 ? ' · passed' : '') : 'not taken yet'}</span></span>${chev}</a>`; }).join('')}</div></div>
      <div class="card" style="margin-bottom:22px"><div class="row" style="justify-content:space-between"><div class="eyebrow">Drills</div><div class="drill-kinds" id="kinds" style="margin:0"><button class="opt on" data-k="all">All</button>${kinds.map((k) => `<button class="opt" data-k="${k}">${esc(k)}</button>`).join('')}</div></div><div class="list" id="drills"></div></div>
      ${['field', 'ed', 'classroom'].map((k) => bySetting[k].length ? `<div class="card" style="margin-bottom:14px"><div class="eyebrow">${k === 'field' ? 'Scenarios · in the field' : k === 'ed' ? 'Scenarios · in the ED' : 'Scenarios · reasoning'}</div><div class="list">${bySetting[k].map((s) => { const r = S.scenarios[s.id]; const m = MODS.get(s._mod); return `<a class="list-item track-${m.track}" href="#/scenario/${s.id}"><span class="lead" style="background:var(--track-soft);color:var(--track)">${esc(m.short.slice(0, 3).toUpperCase())}</span><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${esc(m.title)} · ${s.steps} decisions${r ? ' · best ' + r.best + '%' : ''}</span></span>${chev}</a>`; }).join('')}</div></div>` : '').join('')}</div>`);
    const dl = $('#drills', el);
    const renderDrills = (k) => { dl.innerHTML = Drills.list.filter((d) => k === 'all' || d.kind === k).map((d) => { const r = S.drills[d.id]; return `<a class="list-item" href="#/drill/${d.id}"><span class="lead">${esc(d.lead)}</span><span class="grow"><span class="title">${esc(d.title)}</span><span class="sub">${esc(d.sub)} ${r ? '· best ' + r.best + '%' : ''}</span></span>${chev}</a>`; }).join(''); };
    $('#kinds', el).querySelectorAll('.opt').forEach((b) => b.onclick = () => { $('#kinds', el).querySelectorAll('.opt').forEach((x) => x.classList.toggle('on', x === b)); renderDrills(b.dataset.k); });
    renderDrills('all');
    show(el, token);
  });
  function weakLessons() { const byLesson = {}; for (const [qid, st] of Object.entries(S.qstats)) { const q = Q.get(qid); if (!q) continue; const b = byLesson[q.lesson] = byLesson[q.lesson] || { seen: 0, right: 0 }; b.seen += st.seen; b.right += st.right; } return Object.entries(byLesson).filter(([, b]) => b.seen >= 2 && b.right / b.seen < 0.7).map(([id]) => id); }

  // ---------- Drills & tools ----------
  route('/drill/:id', (id, params, token) => {
    const d = Drills.get(id); if (!d) { show(h('<div class="empty">Drill not found.</div>'), token); return; }
    const el = h(`<div class="quiz">${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow accent">Drill · ${esc(d.kind)}</div><h1>${esc(d.title)}</h1><p class="lede">${esc(d.sub)}</p></div></div><div id="dstage"></div></div>`);
    if (!show(el, token)) return;
    Drills.run(id, $('#dstage', el), { onDone: (pct) => { const rec = S.drills[id] = S.drills[id] || { runs: 0, best: 0 }; rec.runs++; rec.best = Math.max(rec.best, pct); rec.last = Date.now(); Store.bump('scen'); Store.save(true); } });
  });
  route('/tools', (params, token) => {
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Bedside</div><h1>Tools</h1><p class="lede">The calculations you do at the bedside, with the formula shown so you learn it while you use it.</p></div></div><div class="grid">${Tools.list.map((t) => `<a class="card link" href="#/tools/${t.id}"><div class="eyebrow accent">Tool</div><h3 style="margin-top:6px">${esc(t.title)}</h3><p class="muted small" style="margin-top:6px">${esc(t.sub)}</p></a>`).join('')}</div></div>`);
    show(el, token);
  });
  route('/tools/:id', (id, params, token) => {
    const el = h(`<div class="quiz">${backLink('#/tools', 'Tools')}<div class="card" id="tool"></div></div>`);
    if (!show(el, token)) return; Tools.render(id, $('#tool', el));
  });

  // ---------- Quiz ----------
  route('/quiz', async (params, token) => {
    if (!params.scope) return quizSetup(token);
    const scope = params.scope; const n = Math.max(1, Math.min(120, +params.n || 20)); const mode = params.mode === 'exam' ? 'exam' : 'practice';
    if (scope === 'all' || scope === 'weak') await loadAll(); else if (TRACK.has(scope)) await loadModules(TRACK.get(scope).modules); else if (MODS.has(scope)) await loadModule(scope);
    if (stale(token)) return;
    let pool = [];
    if (scope === 'all') pool = [...Q.values()];
    else if (scope === 'weak') { const w = new Set(weakLessons()); pool = [...Q.values()].filter((q) => w.has(q.lesson)); if (!pool.length) pool = [...Q.values()]; }
    else if (TRACK.has(scope)) pool = [...Q.values()].filter((q) => MODS.get(q._mod).track === scope);
    else if (MODS.has(scope)) pool = FULL.get(scope).quiz.slice();
    if (params.lessons) { const want = new Set(params.lessons.split(',')); const sub = pool.filter((q) => want.has(q.lesson)); if (sub.length >= 3) pool = sub; }
    if (!pool.length) { show(h('<div class="empty">No questions available for that scope yet.</div>'), token); return; }
    let qs;
    if (scope === 'emt' && mode === 'exam') qs = weightedEMT(pool, n); else { shuffle(pool); pool.sort((a, b) => (S.qstats[a.id]?.seen || 0) - (S.qstats[b.id]?.seen || 0)); qs = pool.slice(0, n); shuffle(qs); }
    return runQuiz(qs, { scope, mode }, token);
  });
  function weightedEMT(pool, n) {
    const W = { 'emt-airway': .19, 'emt-cardio': .21, 'emt-trauma': .15, 'emt-medical': .18, 'emt-obgyn-peds': .09, 'emt-pharm': .04, 'emt-med-math': .02, 'emt-ops': .10, 'emt-exam': .02 };
    const groups = {}; pool.forEach((q) => (groups[q._mod] = groups[q._mod] || []).push(q));
    const out = []; for (const [mid, w] of Object.entries(W)) { const g = shuffle(groups[mid] || []); out.push(...g.slice(0, Math.round(n * w))); }
    const rest = shuffle(pool.filter((q) => !out.includes(q))); while (out.length < n && rest.length) out.push(rest.pop());
    return shuffle(out.slice(0, n));
  }
  function quizSetup(token) {
    const sel = { scope: 'all', n: 20, mode: 'practice' };
    const totalQ = orderedLight.reduce((a, m) => a + m.counts.quiz, 0);
    const el = h(`<div class="quiz"><div class="page-head"><div><div class="eyebrow">Practice</div><h1>Build a quiz</h1></div></div><div class="setup"><div class="field"><label>Scope</label><div class="opt-grid" id="scopes"></div></div><div class="field"><label>Questions</label><div class="seg" id="ns">${[10, 20, 40, 70].map((k) => `<button data-n="${k}" class="${k === 20 ? 'on' : ''}">${k}</button>`).join('')}</div></div><div class="field"><label>Mode</label><div class="seg" id="modes"><button data-m="practice" class="on">Practice · instant feedback</button><button data-m="exam">Exam · timed, feedback at end</button></div></div><button class="btn primary lg" id="go">Start</button></div></div>`);
    const scopes = $('#scopes', el);
    const opts = [['all', 'Everything', totalQ + ' questions'], ['weak', 'Weak spots', 'from missed questions']];
    IDX.tracks.forEach((t) => opts.push([t.id, t.title, t.modules.reduce((a, id) => a + (MODS.get(id)?.counts.quiz || 0), 0) + ' questions']));
    orderedLight.forEach((m) => opts.push([m.id, m.title, m.counts.quiz + ' questions']));
    scopes.innerHTML = opts.map(([id, t, s]) => `<button class="opt ${id === 'all' ? 'on' : ''}" data-s="${id}">${esc(t)}<small>${esc(s)}</small></button>`).join('');
    scopes.querySelectorAll('.opt').forEach((b) => b.onclick = () => { scopes.querySelectorAll('.opt').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.scope = b.dataset.s; });
    $('#ns', el).querySelectorAll('button').forEach((b) => b.onclick = () => { $('#ns', el).querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.n = +b.dataset.n; });
    $('#modes', el).querySelectorAll('button').forEach((b) => b.onclick = () => { $('#modes', el).querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.mode = b.dataset.m; });
    $('#go', el).onclick = () => { location.hash = '#/quiz?scope=' + sel.scope + '&n=' + sel.n + '&mode=' + sel.mode; };
    show(el, token);
  }
  function runQuiz(qs, { scope, mode }, token) {
    let i = 0; const answers = new Array(qs.length).fill(null); const start = Date.now();
    const limit = mode === 'exam' ? qs.length * 75 * 1000 : 0;
    const scopeName = scope === 'all' ? 'Everything' : scope === 'weak' ? 'Weak spots' : TRACK.get(scope)?.title || MODS.get(scope)?.title || scope;
    const el = h(`<div class="quiz"><div class="quiz-top"><div><div class="eyebrow">${mode === 'exam' ? 'Exam mode' : 'Practice quiz'}</div><h2>${esc(scopeName)}</h2></div><div class="progress"><i id="qp"></i></div><div class="timer num" id="timer"></div></div><div id="qstage"></div></div>`);
    if (!show(el, token)) return;
    const stage = $('#qstage', el); let timer = null;
    function tick() { const ms = Date.now() - start; const rem = limit ? Math.max(0, limit - ms) : ms; const s = Math.floor(rem / 1000); $('#timer', el).textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); if (limit && rem <= 0) finish(); }
    timer = setInterval(tick, 500); tick();
    const askQ = (q) => Tutor.open({ id: 'q:' + q.id, kind: 'question', title: q.q.slice(0, 80), label: 'Question · ' + MODS.get(q._mod).short, text: 'Question: ' + q.q + '\nChoices: ' + q.choices.map((c, k) => KEYS[k] + '. ' + c).join(' | ') + '\nCorrect: ' + KEYS[q.answer] + '\nRationale: ' + q.why });
    function render() {
      $('#qp', el).style.width = Math.round((i / qs.length) * 100) + '%';
      const q = qs[i]; const m = MODS.get(q._mod);
      stage.innerHTML = `<div class="qcard track-${m.track}"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="eyebrow" style="color:var(--track)">${esc(m.short)} · Q${i + 1} of ${qs.length}</span><span class="chip">${['recall', 'application', 'analysis'][q.difficulty - 1] || ''}</span></div><div class="stem">${MD.inline(q.q)}</div>${choicesHTML(q.choices)}<div class="why" id="why" hidden></div></div><div class="qnav"><button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>Back</button><span id="askslot"></span><button class="btn primary" id="next" ${answers[i] === null ? 'disabled' : ''}>${i === qs.length - 1 ? 'Finish' : 'Next'}</button></div>`;
      const btns = stage.querySelectorAll('.choice');
      const showA = () => { const a = answers[i]; btns.forEach((b) => { const k = +b.dataset.i; b.classList.toggle('picked', k === a); if (mode === 'practice') { b.disabled = true; if (k === q.answer) b.classList.add('right'); else if (k === a) b.classList.add('wrong'); } }); if (mode === 'practice') { const w = $('#why', stage); w.hidden = false; w.className = 'why ' + (a === q.answer ? 'ok' : 'no'); w.innerHTML = (a === q.answer ? '<strong>Correct.</strong> ' : '<strong>Not this one.</strong> ') + MD.inline(q.why); $('#askslot', stage).innerHTML = askBtn('btn ask') + ' <button class="btn subtle sm" data-flag title="Flag this question as wrong">Flag</button>'; $('#askslot', stage).querySelector('button').onclick = () => askQ(q); $('#askslot', stage).querySelector('[data-flag]').onclick = () => flagItem('q:' + q.id, { kind: 'question', id: q.id, title: q.q.slice(0, 120), mod: q._mod }); } $('#next', stage).disabled = false; };
      if (answers[i] !== null) showA();
      btns.forEach((b) => b.onclick = () => { if (mode === 'practice' && answers[i] !== null) return; answers[i] = +b.dataset.i; showA(); });
      $('#prev', stage).onclick = () => { if (i > 0) { i--; render(); } };
      $('#next', stage).onclick = () => { if (i < qs.length - 1) { i++; render(); window.scrollTo(0, 0); } else finish(); };
    }
    function finish() {
      clearInterval(timer); timer = null;
      const secs = Math.round((Date.now() - start) / 1000); let correct = 0;
      qs.forEach((q, k) => { const st = S.qstats[q.id] = S.qstats[q.id] || { seen: 0, right: 0 }; st.seen++; if (answers[k] === q.answer) { st.right++; correct++; } });
      S.quiz.push({ ts: Date.now(), scope, n: qs.length, correct, secs, mode }); if (S.quiz.length > 300) S.quiz.splice(0, S.quiz.length - 300);
      if (mode === 'exam' && MODS.has(scope) && qs.length >= 20) { const pct0 = Math.round((correct / qs.length) * 100); S.mastery = S.mastery || {}; const prev = S.mastery[scope]; if (!prev || pct0 > prev.pct) S.mastery[scope] = { pct: pct0, ts: Date.now() }; }
      if (mode === 'exam' && TRACK.has(scope) && qs.length >= 40) { const pct0 = Math.round((correct / qs.length) * 100); S.finals = S.finals || {}; const prev = S.finals[scope]; if (!prev || pct0 > prev.pct) S.finals[scope] = { pct: pct0, ts: Date.now() }; }
      Store.bump('quiz', qs.length); Store.save(true);
      const pct = Math.round((correct / qs.length) * 100);
      const byMod = {}; qs.forEach((q, k) => { const b = byMod[q._mod] = byMod[q._mod] || { n: 0, r: 0 }; b.n++; if (answers[k] === q.answer) b.r++; });
      $('#qp', el).style.width = '100%';
      stage.innerHTML = `<div class="card"><div class="result-head"><div class="eyebrow">${esc(scopeName)} · ${qs.length} questions · ${Math.floor(secs / 60)}m ${secs % 60}s</div><b class="num" style="color:${pct >= 70 ? 'var(--good)' : 'var(--bad)'}">${pct}%</b><div class="sub">${correct} of ${qs.length} correct${mode === 'exam' && MODS.has(scope) && qs.length >= 20 ? (pct >= 80 ? ' · module mastered' : ' · 80% earns mastery') : mode === 'exam' && TRACK.has(scope) ? (pct >= 80 ? ' · track final passed' : ' · 80% passes the track final') : mode === 'exam' ? ' · the NREMT wants consistent 70%+ across domains' : ''}</div></div><div class="row" style="justify-content:center;gap:8px;margin-bottom:8px">${Object.entries(byMod).map(([mid, b]) => `<span class="chip ${b.r / b.n >= .7 ? 'good' : 'bad'}">${esc(MODS.get(mid).short)} ${b.r}/${b.n}</span>`).join('')}</div><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/quiz?scope=${scope}&n=${qs.length}&mode=${mode}">Again</a><a class="btn" href="#/practice">Practice</a></div></div>
        <div class="card" style="margin-top:14px"><div class="eyebrow">Review answers</div>${qs.map((q, k) => `<div class="result-q"><div class="stem">${k + 1}. ${MD.inline(q.q)}</div><div class="ans ${answers[k] === q.answer ? 'ok' : 'no'}">${answers[k] === null ? 'Skipped' : 'You: ' + KEYS[answers[k]] + '. ' + MD.inline(q.choices[answers[k]])}</div>${answers[k] !== q.answer ? `<div class="ans ok">Answer: ${KEYS[q.answer]}. ${MD.inline(q.choices[q.answer])}</div>` : ''}<div class="why" style="margin-top:8px">${MD.inline(q.why)}</div><div class="row" style="margin-top:6px;justify-content:space-between"><a class="faint tiny" href="#/lesson/${q.lesson}">${esc(LESSON.get(q.lesson)?.title || q.lesson)}</a>${answers[k] !== q.answer ? `<a class="btn sm ghost" href="#/mistakes?source=quiz&tags=${encodeURIComponent(MODS.get(q._mod).short.toLowerCase())}&miss=${encodeURIComponent(('Picked ' + (answers[k] === null ? 'nothing' : q.choices[answers[k]]) + ' for: ' + q.q).slice(0, 180))}">Log miss</a>` : ''}<button class="btn sm ghost ask" data-k="${k}">Ask</button></div></div>`).join('')}</div>`;
      stage.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => askQ(qs[+b.dataset.k]));
      window.scrollTo(0, 0);
    }
    const onKey = (e) => { if (e.target.matches('input, textarea')) return; const k = e.key.toUpperCase(); const idx = KEYS.indexOf(k); if (idx >= 0) { const b = stage.querySelector('.choice[data-i="' + idx + '"]'); if (b && !b.disabled) b.click(); } else if (e.key === 'Enter' || e.key === 'ArrowRight') { const n = $('#next', stage); if (n && !n.disabled) n.click(); } };
    document.addEventListener('keydown', onKey);
    render();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  // ---------- Full-length exams ----------
  function loadExam(id) {
    const key = 'exam-' + id;
    if (window.ROUNDS_MODULES && window.ROUNDS_MODULES[key]) return Promise.resolve(window.ROUNDS_MODULES[key]);
    return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = 'content/' + key + '.js?v=' + BUILD; s.async = true; s.onload = () => resolve(window.ROUNDS_MODULES && window.ROUNDS_MODULES[key]); s.onerror = () => reject(new Error('failed to load exam')); document.head.appendChild(s); });
  }
  route('/exam/:id', async (id, params, token) => {
    const xi = (IDX.exams || []).find((x) => x.id === id); if (!xi) { show(h('<div class="empty">Exam not found.</div>'), token); return; }
    const x = await loadExam(id); if (stale(token) || !x) return;
    const hist = (S.exams || {})[id] || [];
    const saved = S.examRun && S.examRun.id === id ? S.examRun : null;
    if (!params.start && !saved) {
      const el = h(`<div class="quiz">${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow accent">Full-length practice exam</div><h1>${esc(x.title)}</h1><p class="lede">${esc(x.blurb)}</p></div></div>
        <div class="card"><div class="stat-row"><div class="stat"><b class="num">${x.count}</b><span>questions</span></div><div class="stat"><b class="num">${x.minutes}</b><span>minutes</span></div><div class="stat"><b class="num">${x.questions.length}</b><span>question pool</span></div><div class="stat"><b class="num">${hist.length ? Math.max(...hist.map((a) => a.pct)) + '%' : '--'}</b><span>best score</span></div></div>
          <div class="eyebrow" style="margin-top:16px">Sections</div><div class="row" style="margin-top:8px">${x.sections.map((sc) => `<span class="chip">${esc(sc.title)} · ${Math.round(sc.weight * x.count)}</span>`).join('')}</div>
          <p class="muted small" style="margin-top:14px">Timed. No feedback until the end. Questions you have not seen are drawn first. Leaving the page keeps your place.</p>
          <div class="btn-row" style="margin-top:14px"><a class="btn primary lg" href="#/exam/${id}?start=1">Start attempt</a></div></div>
        ${hist.length ? `<div class="card" style="margin-top:14px"><div class="eyebrow">Attempts</div><div class="list">${hist.slice().reverse().slice(0, 10).map((a) => `<div class="list-item"><span class="lead" style="${a.pct >= 70 ? 'background:var(--good-soft);color:var(--good)' : 'background:var(--bad-soft);color:var(--bad)'}">${a.pct}%</span><span class="grow"><span class="title">${esc(new Date(a.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</span><span class="sub">${Object.entries(a.sections).map(([k, v]) => esc(x.sections.find((sc) => sc.id === k)?.title || k) + ' ' + v.r + '/' + v.n).join(' · ')}</span></span></div>`).join('')}</div></div>` : ''}</div>`);
      show(el, token); return;
    }
    let run = saved;
    if (!run) {
      const seen = new Set(hist.flatMap((a) => a.ids || []));
      const ids = [];
      for (const sc of x.sections) {
        const want = Math.round(sc.weight * x.count);
        const pool = x.questions.filter((q) => q.section === sc.id);
        const fresh = shuffle(pool.filter((q) => !seen.has(q.id))), old = shuffle(pool.filter((q) => seen.has(q.id)));
        ids.push(...[...fresh, ...old].slice(0, want).map((q) => q.id));
      }
      while (ids.length < x.count) { const extra = x.questions.find((q) => !ids.includes(q.id)); if (!extra) break; ids.push(extra.id); }
      run = { id, ids: shuffle(ids).slice(0, x.count), answers: {}, start: Date.now(), i: 0 };
      S.examRun = run; Store.save(true);
    }
    const byId = new Map(x.questions.map((q) => [q.id, q]));
    const qs = run.ids.map((qid) => byId.get(qid)).filter(Boolean);
    let i = Math.min(run.i || 0, qs.length - 1);
    const limit = x.minutes * 60000;
    const el = h(`<div class="quiz"><div class="quiz-top"><div><div class="eyebrow">Exam</div><h2>${esc(x.title)}</h2></div><div class="progress"><i id="qp"></i></div><div class="timer num" id="timer"></div></div><div id="qstage"></div></div>`);
    if (!show(el, token)) return;
    const stage = $('#qstage', el); let timer = null;
    const answered = () => Object.keys(run.answers).length;
    function tick() { const rem = Math.max(0, limit - (Date.now() - run.start)); const s = Math.floor(rem / 1000); $('#timer', el).textContent = Math.floor(s / 3600) + ':' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); if (rem <= 0) finish(); }
    timer = setInterval(tick, 500); tick();
    function render() {
      $('#qp', el).style.width = Math.round((answered() / qs.length) * 100) + '%';
      const q = qs[i]; const sec = x.sections.find((sc) => sc.id === q.section);
      run.i = i; Store.save();
      stage.innerHTML = `<div class="qcard"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="eyebrow">${esc(sec?.title || '')} · Q${i + 1} of ${qs.length}</span><span class="chip">${answered()} answered</span></div><div class="stem">${MD.inline(q.q)}</div>${choicesHTML(q.choices)}</div>
        <div class="qnav"><button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>Back</button><button class="btn subtle" id="jump">Go to…</button><button class="btn ${i === qs.length - 1 ? 'primary' : ''}" id="next">${i === qs.length - 1 ? 'Finish exam' : 'Next'}</button></div>`;
      const btns = stage.querySelectorAll('.choice');
      const mark = () => btns.forEach((b) => b.classList.toggle('picked', run.answers[q.id] === +b.dataset.i));
      mark();
      btns.forEach((b) => b.onclick = () => { run.answers[q.id] = +b.dataset.i; Store.save(); mark(); $('#qp', el).style.width = Math.round((answered() / qs.length) * 100) + '%'; const ch = stage.querySelector('.qcard .chip'); if (ch) ch.textContent = answered() + ' answered'; });
      $('#prev', stage).onclick = () => { if (i > 0) { i--; render(); } };
      $('#next', stage).onclick = () => { if (i < qs.length - 1) { i++; render(); window.scrollTo(0, 0); } else { if (answered() < qs.length && !confirm((qs.length - answered()) + ' unanswered. Finish anyway?')) return; finish(); } };
      $('#jump', stage).onclick = () => { const v = prompt('Question number (1 to ' + qs.length + ')'); const n = parseInt(v, 10); if (n >= 1 && n <= qs.length) { i = n - 1; render(); } };
    }
    function finish() {
      clearInterval(timer); timer = null;
      const secs = Math.round((Date.now() - run.start) / 1000);
      const sections = {}; let correct = 0;
      qs.forEach((q) => { const sc = sections[q.section] = sections[q.section] || { n: 0, r: 0 }; sc.n++; if (run.answers[q.id] === q.answer) { sc.r++; correct++; } });
      const pct = Math.round((correct / qs.length) * 100);
      S.exams = S.exams || {}; (S.exams[id] = S.exams[id] || []).push({ ts: Date.now(), pct, secs, sections, ids: run.ids });
      S.examRun = null; S.quiz.push({ ts: Date.now(), scope: 'exam:' + id, n: qs.length, correct, secs, mode: 'exam' }); Store.bump('quiz', qs.length); Store.save(true);
      const weak = Object.entries(sections).filter(([, v]) => v.r / v.n < 0.7).map(([k]) => x.sections.find((sc) => sc.id === k)?.title || k);
      stage.innerHTML = `<div class="card"><div class="result-head"><div class="eyebrow">${esc(x.title)} · ${qs.length} questions · ${Math.floor(secs / 60)} min</div><b class="num" style="color:${pct >= 70 ? 'var(--good)' : 'var(--bad)'}">${pct}%</b><div class="sub">${correct} of ${qs.length} correct${weak.length ? ' · under 70% in: ' + esc(weak.join(', ')) : ' · every section at 70% or better'}</div></div>
        <div class="stack" style="margin:8px 0 14px">${x.sections.map((sc) => { const v = sections[sc.id] || { n: 0, r: 0 }; const p = v.n ? Math.round((v.r / v.n) * 100) : 0; return `<div><div class="row" style="justify-content:space-between"><span class="small">${esc(sc.title)}</span><span class="num small" style="color:${p >= 70 ? 'var(--good)' : 'var(--bad)'}">${v.r}/${v.n} · ${p}%</span></div><div class="progress ${p >= 70 ? 'good' : ''}"><i style="width:${p}%"></i></div></div>`; }).join('')}</div>
        <div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/exam/${id}?start=1">New attempt</a><a class="btn" href="#/exam/${id}">Exam page</a><a class="btn" href="#/practice">Practice</a></div></div>
        <div class="card" style="margin-top:14px"><div class="eyebrow">Review answers</div>${qs.map((q, k) => `<div class="result-q"><div class="stem">${k + 1}. ${MD.inline(q.q)}</div><div class="ans ${run.answers[q.id] === q.answer ? 'ok' : 'no'}">${run.answers[q.id] == null ? 'Skipped' : 'You: ' + KEYS[run.answers[q.id]] + '. ' + MD.inline(q.choices[run.answers[q.id]])}</div>${run.answers[q.id] !== q.answer ? `<div class="ans ok">Answer: ${KEYS[q.answer]}. ${MD.inline(q.choices[q.answer])}</div>` : ''}<div class="why" style="margin-top:8px">${MD.inline(q.why)}</div><div class="row" style="margin-top:6px;justify-content:space-between"><span class="faint tiny">${esc(x.sections.find((sc) => sc.id === q.section)?.title || '')}</span><button class="btn sm ghost ask" data-k="${k}">Ask</button></div></div>`).join('')}</div>`;
      stage.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const q = qs[+b.dataset.k]; Tutor.open({ id: 'xq:' + q.id, kind: 'question', title: q.q.slice(0, 80), label: 'Exam question', text: 'Question: ' + q.q + '\nChoices: ' + q.choices.map((c, j) => KEYS[j] + '. ' + c).join(' | ') + '\nCorrect: ' + KEYS[q.answer] + '\nRationale: ' + q.why }); });
      window.scrollTo(0, 0);
    }
    const onKey = (e) => { if (e.target.matches('input, textarea')) return; const idx = KEYS.indexOf(e.key.toUpperCase()); if (idx >= 0) { const b = stage.querySelector('.choice[data-i="' + idx + '"]'); if (b) b.click(); } else if (e.key === 'ArrowRight') $('#next', stage)?.click(); else if (e.key === 'ArrowLeft') $('#prev', stage)?.click(); };
    document.addEventListener('keydown', onKey);
    render();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  });

  // ---------- Scenario ----------
  route('/scenario/:id', async (id, params, token) => {
    const si = SCEN_IDX.get(id); if (!si) { show(h('<div class="empty">Scenario not found.</div>'), token); return; }
    const m = await loadModule(si._mod); if (stale(token)) return;
    const s = SCEN.get(id); const steps = new Map(s.steps.map((st) => [st.id, st]));
    let cur = null; const path = []; let score = 0;
    const el = h(`<div class="scenario track-${m.track}">${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow" style="color:var(--track)">${esc(m.title)} · ${settingLabel(s.setting)}</div><h1>${esc(s.title)}</h1></div>${askBtn()}</div><div class="sc-steps" id="dots"></div><div id="sstage"></div></div>`);
    if (!show(el, token)) return;
    const stage = $('#sstage', el);
    const ctxText = () => 'Scenario: ' + s.title + '\nBriefing: ' + s.intro + (cur ? '\nCurrent situation: ' + cur.prompt + (cur.vitals ? '\nVitals: ' + JSON.stringify(cur.vitals) : '') + '\nChoices: ' + cur.choices.map((c) => c.text).join(' | ') : '') + (path.length ? '\nDecisions so far: ' + path.map((p) => steps.get(p.step).choices[p.choice].text + ' (' + (p.score === 1 ? 'best' : p.score === 0 ? 'acceptable' : 'harmful') + ')').join('; ') : '');
    el.querySelector('[data-ask]').onclick = () => Tutor.open({ id: 'scen:' + id, kind: 'scenario', title: s.title, label: 'Scenario · ' + s.title, text: ctxText() });
    function dots() { $('#dots', el).innerHTML = s.steps.map((st) => { const p = path.find((x) => x.step === st.id); return '<i class="' + (p ? 's' + p.score : (cur && cur.id === st.id ? 'now' : '')) + '"></i>'; }).join(''); }
    function vitalsHTML(v) { if (!v) return ''; const items = [['hr', 'HR', v.hr], ['bp', 'NIBP', v.bp], ['rr', 'RR', v.rr], ['spo2', 'SpO2', v.spo2 != null ? v.spo2 + '%' : null], ['temp', 'Temp', v.temp != null ? v.temp + '°' : null], ['gcs', 'GCS', v.gcs], ['glucose', 'BGL', v.glucose], ['etco2', 'EtCO2', v.etco2]].filter((x) => x[2] != null && x[2] !== ''); return '<div class="monitor">' + items.map(([k, lab, val]) => `<div class="v ${k}"><span>${lab}</span><b>${esc(String(val))}</b></div>`).join('') + '</div>'; }
    function intro() { cur = null; dots(); stage.innerHTML = `<div class="sc-step"><div class="eyebrow accent">Briefing</div><div class="prose" style="margin-top:8px">${MD.render(s.intro)}</div><div class="btn-row" style="margin-top:18px"><button class="btn primary lg" id="begin">Begin</button></div></div>`; $('#begin', stage).onclick = () => go(s.steps[0].id); }
    function go(stepId) {
      if (stepId === 'end') return debrief();
      cur = steps.get(stepId); dots();
      stage.innerHTML = `<div class="sc-step"><div class="eyebrow accent">Decision ${path.length + 1}</div><div class="prose" style="margin-top:8px">${MD.render(cur.prompt)}</div>${vitalsHTML(cur.vitals)}<div class="choices" id="sc-choices">${cur.choices.map((c, i) => `<button class="choice" data-i="${i}"><span class="key">${KEYS[i]}</span><span>${MD.inline(c.text)}</span></button>`).join('')}</div><div id="fb"></div></div>`;
      stage.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const c = cur.choices[+b.dataset.i];
        stage.querySelectorAll('.choice').forEach((x) => { x.disabled = true; x.classList.remove('picked'); });
        b.classList.add(c.score === 1 ? 'right' : c.score === 0 ? 'picked' : 'wrong');
        path.push({ step: cur.id, choice: +b.dataset.i, score: c.score, label: (c.text || c.label || '').slice(0, 140) }); score += c.score; dots();
        $('#fb', stage).innerHTML = `<div class="sc-feedback s${c.score}"><span class="label">${c.score === 1 ? 'Best move' : c.score === 0 ? 'Acceptable, not ideal' : 'Harmful'}</span>${MD.inline(c.feedback)}</div><div class="btn-row" style="margin-top:14px"><button class="btn primary" id="cont">${c.next === 'end' ? 'Debrief' : 'Continue'}</button></div>`;
        $('#cont', stage).onclick = () => { go(c.next); window.scrollTo(0, 0); };
      });
    }
    function debrief() {
      cur = null; dots(); const max = path.length; const pct = Math.max(0, Math.round(((score + max) / (2 * max)) * 100));
      const rec = S.scenarios[id] = S.scenarios[id] || { runs: 0, best: 0 }; rec.runs++; rec.best = Math.max(rec.best, pct); rec.last = Date.now(); Store.bump('scen'); Store.save(true);
      stage.innerHTML = `<div class="sc-step"><div class="result-head"><div class="eyebrow">Debrief</div><b class="num" style="color:${pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}">${pct}%</b><div class="sub">${path.filter((p) => p.score === 1).length} best moves, ${path.filter((p) => p.score === 0).length} acceptable, ${path.filter((p) => p.score === -1).length} harmful</div></div><div class="prose">${MD.render(s.debrief)}</div><div class="btn-row" style="margin-top:18px"><a class="btn primary" href="#/scenario/${id}">Run again</a><a class="btn" href="#/mistakes?source=${encodeURIComponent('app scenario')}&tags=${encodeURIComponent(m.short.toLowerCase())}&miss=${encodeURIComponent(path.filter((p) => p.score === -1).map((p) => p.label || '').filter(Boolean)[0] || '')}">Log a miss</a><a class="btn" href="#/module/${m.id}">Module</a><a class="btn" href="#/practice">Practice</a></div></div>`;
    }
    intro();
  });

  // ---------- Reference ----------
  const GROUP_NAMES = { assessment: 'Assessment', airway: 'Airway', cardiac: 'Cardiac', trauma: 'Trauma', meds: 'Medications', labs: 'Labs', ecg: 'ECG', ed: 'ED', terms: 'Terminology', exam: 'Exam', spanish: 'Spanish', math: 'Math' };
  route('/ref', (params, token) => {
    const sheets = [...REF.values()]; const groups = [...new Set(sheets.map((s) => s.group))]; let g = params.g || 'all';
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Pocket cards</div><h1>Reference</h1><p class="lede">The numbers you need at the bedside, in table form. Search or browse by group.</p></div><form class="search" id="rsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="rq" placeholder="Search sheets" autocapitalize="off" enterkeyhint="search"></form></div><div class="ref-groups" id="groups"></div><div class="grid" id="sheets"></div></div>`);
    if (!show(el, token)) return;
    const gw = $('#groups', el); const list = $('#sheets', el);
    function render() {
      gw.innerHTML = ['all', ...groups].map((k) => `<button class="opt ${g === k ? 'on' : ''}" data-g="${k}">${k === 'all' ? 'All' : esc(GROUP_NAMES[k] || k)}</button>`).join('');
      gw.querySelectorAll('.opt').forEach((b) => b.onclick = () => { g = b.dataset.g; render(); });
      const q = $('#rq', el).value.trim().toLowerCase();
      const shown = sheets.filter((s) => (g === 'all' || s.group === g) && (!q || s.title.toLowerCase().includes(q) || s.tags.join(' ').toLowerCase().includes(q) || s.body.toLowerCase().includes(q)));
      list.innerHTML = shown.length ? shown.map((s) => `<a class="card link" href="#/ref/${s.id}"><div class="eyebrow accent">${esc(GROUP_NAMES[s.group] || s.group)}</div><h3 style="margin-top:6px">${esc(s.title)}</h3><div class="row" style="margin-top:10px">${s.tags.slice(0, 4).map((t) => '<span class="chip">' + esc(t) + '</span>').join('')}</div></a>`).join('') : '<div class="empty">No sheets match.</div>';
    }
    $('#rq', el).addEventListener('input', render); $('#rsearch', el).addEventListener('submit', (e) => e.preventDefault()); render();
  });
  route('/ref/:id', (id, params, token) => {
    const s = REF.get(id); if (!s) { show(h('<div class="empty">Sheet not found.</div>'), token); return; }
    const el = h(`<div class="ref-sheet lesson">${backLink('#/ref', 'Reference')}<div class="page-head"><div><div class="eyebrow accent">${esc(GROUP_NAMES[s.group] || s.group)}</div><h1>${esc(s.title)}</h1></div>${askBtn()}</div><article class="prose">${MD.render(s.body)}</article></div>`);
    if (!show(el, token)) return;
    el.querySelector('[data-ask]').onclick = () => Tutor.open({ id: 'ref:' + id, kind: 'reference', title: s.title, label: 'Reference · ' + s.title, text: s.body });
  });

  // ---------- Search ----------
  route('/search', async (params, token) => {
    const q = (params.q || '').trim(); const ql = q.toLowerCase();
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Search</div><h1>${q ? esc(q) : 'Search'}</h1></div><form class="search" id="sf"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="sq" value="${esc(q)}" placeholder="Search" autocapitalize="off" enterkeyhint="search"></form></div><div id="results" class="stack">${ql ? loadingHTML : ''}</div></div>`);
    if (!show(el, token)) return;
    $('#sf', el).addEventListener('submit', (e) => { e.preventDefault(); const v = $('#sq', el).value.trim(); if (v) location.hash = '#/search?q=' + encodeURIComponent(v); });
    if (!ql) return;
    await loadAll(); if (stale(token)) return;
    const res = $('#results', el); res.innerHTML = '';
    const lessons = [], cards = [], sheets = [];
    for (const id of orderedIds) { const m = FULL.get(id); if (!m) continue; for (const l of m.lessons) if (l.title.toLowerCase().includes(ql) || l.body.toLowerCase().includes(ql)) lessons.push({ l, m }); for (const c of m.cards) if (c.front.toLowerCase().includes(ql) || c.back.toLowerCase().includes(ql)) cards.push({ c, m }); }
    for (const s of REF.values()) if (s.title.toLowerCase().includes(ql) || s.body.toLowerCase().includes(ql) || s.tags.join(' ').toLowerCase().includes(ql)) sheets.push(s);
    const snippet = (text) => { const i = text.toLowerCase().indexOf(ql); const start = Math.max(0, i - 60); const s = text.slice(start, i + 90).replace(/[#*>`|]/g, ''); return (start ? '…' : '') + esc(s) + '…'; };
    if (!lessons.length && !cards.length && !sheets.length) { res.innerHTML = '<div class="empty">Nothing found.</div>'; return; }
    if (lessons.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Lessons · ${lessons.length}</div><div class="list">${lessons.slice(0, 40).map(({ l, m }) => `<a class="list-item" href="#/lesson/${l.id}"><span class="grow"><span class="title">${esc(l.title)}</span><span class="sub">${esc(m.title)} · ${snippet(l.body)}</span></span>${chev}</a>`).join('')}</div></div>`));
    if (sheets.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Reference · ${sheets.length}</div><div class="list">${sheets.map((s) => `<a class="list-item" href="#/ref/${s.id}"><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${snippet(s.body)}</span></span>${chev}</a>`).join('')}</div></div>`));
    if (cards.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Cards · ${cards.length}</div><div class="list">${cards.slice(0, 50).map(({ c }) => `<div class="list-item"><span class="grow"><span class="title">${MD.inline(c.front)}</span><span class="sub">${MD.inline(c.back)}</span></span></div>`).join('')}</div></div>`));
  });

  // ---------- Path ----------
  const PATH = [
    { id: 'emt', title: 'EMT-Basic certification', when: 'Now → ~4 months', text: 'The entry ticket. A state-approved course, then the national exam, then the New Jersey card.', tasks: [
      ['emt-enroll', 'Enroll in an NJ-approved EMT course', 'Community college, hospital, or squad-run. Evenings and weekends exist.'],
      ['emt-cpr', 'Get a BLS Provider (CPR/AED) card', 'AHA or Red Cross. Required for the course and every job after.'],
      ['emt-found', 'Finish the Foundations track here', 'Body, terminology, vitals, assessment, communication. Do it before class starts.'],
      ['emt-track', 'Finish the EMT track here', 'Run it alongside the course. The scenarios mirror the skill stations.'],
      ['emt-mock', 'Score 80%+ on three 70-question exam-mode mocks', 'Practice tab, exam mode. Domain-weighted like the real CAT.'],
      ['emt-nremt', 'Pass the NREMT cognitive exam', 'Schedule through Pearson VUE once your course marks you eligible.'],
      ['emt-nj', 'Apply for NJ EMT certification', 'NJ Office of EMS: application, background check, CPR card, fees.'] ] },
    { id: 'ed', title: 'ED technician job', when: 'Right after the card', text: 'The job that pays, teaches, and counts as patient-care experience for PA applications.', tasks: [
      ['ed-track', 'Finish the ED Tech track here', 'Getting hired, the department, Epic, triage, ECG, phlebotomy, procedures, codes, presentations, psych, Spanish, safety.'],
      ['ed-drills', 'Score 100% on the 12-lead placement drill twice', 'Practice tab. Placement is the single most-asked tech skill.'],
      ['ed-rhythm', 'Score 90%+ on Name the rhythm three times', 'Practice tab. Recognizing VT and VF on the monitor is a day-one skill.'],
      ['ed-apply', 'Apply to ED tech / patient care tech postings', 'Search "ED technician", "ER tech", "patient care technician emergency". EMT-B plus BLS is the usual ask.'],
      ['ed-hired', 'Start in the department', 'Then give notice and leave retail for good.'],
      ['ed-log', 'Start the de-identified case log on shift one', 'Chief complaint, workup, dispo, one thing learned. This becomes PCE evidence and interview material.'],
      ['ed-hours', 'Track PCE hours from day one', 'A 36-hour week for a year is about 1,700 hours. Most competitive applicants show 1,000 to 3,000.'] ] },
    { id: 'degree', title: 'BA in Biology at Thomas Edison State University', when: 'In parallel, 2–4 years', text: 'Online, 120 credits: 45 general education, 60 in the major, 15 electives. The major contains most PA prerequisites. Six major courses are transfer-only at TESU, so they come from a community college or another accredited school. Do this while working, not instead of working.', tasks: [
      ['deg-transcripts', 'Send every prior transcript to TESU for evaluation', 'ERAU credits count toward general education and electives; math and physics may clear required courses.'],
      ['deg-enroll', 'Enroll at TESU in the BA Biology', 'Confirm the current catalog-year plan with an advisor. The TESU course map in Reference lists the current catalog.'],
      ['deg-tesu-core', 'Take the TESU-offered major courses', 'BIO-2510 Microbiology with lab, MAT-1290 Precalculus, CHE-1210 and CHE-1220 General Chemistry I and II with lab, PHY-1150 and PHY-1160 Physics I and II with lab. The Prerequisites track teaches each one.'],
      ['deg-transfer', 'Take the transfer-required courses elsewhere', 'General Biology I and II with lab, Cell Biology, Genetics, Organic Chemistry I and II with lab. Camden County College or Rowan College at Burlington County are the local options; confirm transferability with TESU before registering.'],
      ['deg-anp', 'Use the biology electives for A&P I and II', 'BIO-2110 and BIO-2120 with lab at TESU count toward the 12 biology elective credits and are required by nearly every PA program.'],
      ['deg-gened', 'Clear the general education science courses', 'EAS-1010 General Earth Science and BIO-2080 The Science of Nutrition, plus the writing, math, and humanities blocks.'],
      ['deg-upper', 'Get 18 credits at the 3000 level or above in the major', 'A TESU rule. Plan the biology electives and transfer choices so they land upper level.'],
      ['deg-residency', 'Complete at least 30 credits through TESU itself', 'The residency minimum since 2021. Transfer everything you can, but keep 30 with TESU.'],
      ['deg-gpa', 'Keep the science GPA at 3.5 or better', 'PA programs compute it separately. An upward trend matters.'],
      ['deg-prepa', 'Finish the Prerequisites and Pre-PA tracks here alongside the courses', 'Course-by-course modules under the classes; the medicine layer under those.'],
      ['deg-capstone', 'LIB-4970 Liberal Arts Capstone, then graduate', ''] ] },
    { id: 'apply', title: 'PA school application', when: 'The spring before you want to start', text: 'CASPA opens in late April. Early, complete, verified applications win rolling admissions.', tasks: [
      ['app-shadow', 'Shadow PAs, 40+ hours', 'Ask the PAs in your own ED. Log dates and hours.'],
      ['app-lor', 'Line up 3–5 recommenders', 'A PA, a supervisor, a science professor. Ask months ahead.'],
      ['app-test', 'Take the GRE or PA-CAT if your target programs require it', 'Many programs are test-optional now. Check each one.'],
      ['app-ps', 'Write the personal statement', '5,000 characters. Specific patients, specific moments, why PA and not MD or NP. The Interviews & Essays module has the method.'],
      ['app-programs', 'Build a list of 8–12 programs that fit your prereqs and hours', 'PANCE pass rate, attrition, cost, location, mission.'],
      ['app-submit', 'Submit CASPA in May or June', 'Verification takes weeks. Do not wait for the deadline.'],
      ['app-interview', 'Interviews', 'MMI or traditional. Run the interview scenarios in the Interviews & Essays module until the answers are yours.'],
      ['app-accept', 'Accept an offer', 'Then start reading everything about the didactic year.'] ] },
    { id: 'career', title: 'Cooper first, then Virtua ICU', when: 'After PANCE', text: 'Two years at Cooper for volume, structure and a name on the resume, then an overnight ICU APP job at Virtua where the autonomy is. The academic center follows the residents’ track; the community ICU runs on its APPs.', tasks: [
      ['car-pance', 'Pass the PANCE and get the NJ license', 'NCCPA certification, then NJ Board of Medical Examiners PA license and CDS/DEA.'],
      ['car-rotation', 'Land a critical care or EM rotation at Cooper during clinical year', 'Rotations are auditions. Ask for Cooper by name when the program assigns sites.'],
      ['car-fellowship', 'Apply to Cooper’s APP fellowship (critical care or emergency medicine) as the fast track', 'A 12-month structured fellowship beats two unstructured years for an ICU hire. Verify which tracks Cooper is running that cycle.'],
      ['car-cooper', 'Work at Cooper 1–2 years', 'Trauma, sepsis, vents, lines, codes. Keep the case log going: it becomes the interview for the next job.'],
      ['car-certs', 'Stack the ICU certifications while there', 'ACLS and PALS, FCCS (Fundamental Critical Care Support), ultrasound and line credentials, ventilator management course.'],
      ['car-network', 'Meet the Virtua intensivists and night APPs before you need them', 'Shadow a night, ask what their APPs actually own overnight, learn which campus (Voorhees, Marlton, Mount Holly, Camden) staffs the way you want.'],
      ['car-virtua', 'Move to Virtua as an overnight ICU APP', 'Negotiate on the experience: nights differential, scope, procedures, and a defined supervision model.'] ] },
  ];
  route('/path', (params, token) => {
    const el = h(`<div class="path"><div class="page-head"><div><div class="eyebrow">Roadmap</div><h1>The path</h1><p class="lede">EMT card, ED tech job, degree with prerequisites, then the PA application. Tap a task to check it off. Stages overlap on purpose.</p></div></div><div id="stages"></div></div>`);
    const wrap = $('#stages', el);
    function render() {
      wrap.innerHTML = ''; let activeSet = false;
      PATH.forEach((st) => {
        const done = st.tasks.filter((t) => S.path[t[0]]).length; const all = done === st.tasks.length; const active = !all && !activeSet; if (active) activeSet = true;
        wrap.appendChild(h(`<section class="stage ${all ? 'done' : active ? 'active' : ''}"><div class="when">${esc(st.when)} · ${done}/${st.tasks.length}</div><h2>${esc(st.title)}</h2><p>${esc(st.text)}</p><div class="tasks">${st.tasks.map((t) => `<div class="task ${S.path[t[0]] ? 'done' : ''}" data-id="${t[0]}"><span class="box">${S.path[t[0]] ? '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><span><span class="t">${esc(t[1])}</span>${t[2] ? '<div class="sub">' + esc(t[2]) + '</div>' : ''}</span></div>`).join('')}</div></section>`));
      });
      wrap.querySelectorAll('.task').forEach((t) => t.onclick = () => { const id = t.dataset.id; if (S.path[id]) delete S.path[id]; else S.path[id] = Date.now(); Store.save(); render(); });
    }
    render(); show(el, token);
  });

  // ---------- Settings ----------
  route('/settings', (params, token) => {
    const counts = orderedLight.reduce((a, m) => ({ lessons: a.lessons + m.lessons.length, cards: a.cards + m.counts.cards, quiz: a.quiz + m.counts.quiz, scen: a.scen + m.counts.scenarios }), { lessons: 0, cards: 0, quiz: 0, scen: 0 });
    const el = h(`<div class="settings"><div class="page-head"><div><div class="eyebrow">Rounds</div><h1>Settings</h1></div></div>
      <div class="card"><div class="eyebrow">Appearance</div><div class="seg" style="margin-top:10px" id="theme">${['system', 'light', 'dark'].map((t) => `<button data-t="${t}" class="${S.settings.theme === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
      <div class="card"><div class="eyebrow">Learning</div><div class="stack" style="margin-top:10px"><label class="task ${S.settings.strict !== false ? 'done' : ''}" id="strict"><span class="box">${S.settings.strict !== false ? '\u2713' : ''}</span><span><span class="t" style="text-decoration:none;color:inherit">Strict order</span><div class="sub">Read to the end before the checks unlock. The next lesson opens only when this one is finished. The next module opens only after its mastery test (80%). Foundations must be finished before EMT, EMT before ED tech, ED tech before pre-PA. Prerequisites run in parallel.</div></span></label></div></div>
      <div class="card"><div class="eyebrow">Review</div><div class="field" style="margin-top:10px"><label>New cards per day</label><div class="seg" id="dn">${[10, 20, 30, 50, 100].map((n) => `<button data-n="${n}" class="${S.settings.dailyNew === n ? 'on' : ''}">${n}</button>`).join('')}</div></div><p class="faint small" style="margin-top:8px">Twenty a day is sustainable. Fifty or more is for exam week.</p></div>
      <div class="card"><div class="eyebrow">Tutor</div><div class="field" style="margin-top:10px"><label for="tutor-url">Tutor service address</label><input type="text" id="tutor-url" value="${esc(S.settings.tutorUrl || '')}" placeholder="${esc(Tutor.endpoint())}" autocapitalize="off" autocorrect="off" spellcheck="false"></div><p class="faint small" style="margin-top:8px">Leave blank to use the default. Answers come from Claude on your own subscription, through the homelab. Needs Tailscale on.</p><div class="btn-row" style="margin-top:10px"><button class="btn sm" id="tutor-test">Test connection</button><button class="btn sm ask" id="tutor-open">Open tutor</button></div></div>
      <div class="card"><div class="eyebrow">Apple Pencil</div><div class="stack" style="margin-top:10px">
        <label class="task ${S.settings.penOnly ? 'done' : ''}" id="penonly"><span class="box">${S.settings.penOnly ? '✓' : ''}</span><span><span class="t" style="text-decoration:none;color:inherit">Pencil only draws, fingers scroll</span><div class="sub">Off lets a finger draw too. Palm rejection stays on either way.</div></span></label>
        <label class="task ${S.settings.autoInk ? 'done' : ''}" id="autoink"><span class="box">${S.settings.autoInk ? '✓' : ''}</span><span><span class="t" style="text-decoration:none;color:inherit">Touching a lesson with the Pencil opens notes</span><div class="sub">Otherwise use the Notes button on each lesson.</div></span></label></div></div>
      <div class="card"><div class="eyebrow">Progress</div><div class="btn-row" style="margin-top:10px"><button class="btn" id="export">Export progress</button><button class="btn" id="import">Import</button><button class="btn danger" id="reset">Reset everything</button></div><textarea id="io" hidden placeholder="Paste a Rounds progress export here" style="margin-top:10px"></textarea><div class="btn-row" id="io-actions" hidden style="margin-top:10px"><button class="btn primary" id="io-apply">Apply import</button><button class="btn" id="io-cancel">Cancel</button></div><p class="faint small" style="margin-top:10px">Progress lives on this device. Export before switching iPads. Pencil notes are not included in the export.</p></div>
      <div class="card"><div class="eyebrow">Flagged content</div><p class="small muted" style="margin-top:8px">Lessons and questions you marked as wrong or doubtful. The content is AI-written and unreviewed; check it against your textbook and flag what disagrees, then export the list so it can be fixed at the source.</p><div id="flags" class="stack" style="margin-top:10px"></div><div class="btn-row" style="margin-top:10px"><button class="btn sm" id="flags-export">Export flags</button><button class="btn sm danger" id="flags-clear">Clear flags</button></div></div>
      <div class="card"><div class="eyebrow">About</div><p class="small muted" style="margin-top:8px">Rounds · content ${esc(String(IDX.version || 'dev'))} · build ${esc(BUILD)}<br>${orderedLight.length} modules · ${counts.lessons} lessons · ${counts.cards} cards · ${counts.quiz} questions · ${counts.scen} scenarios · ${REF.size} reference sheets · ${Drills.list.length} drills · ${Tools.list.length} tools</p><div class="btn-row" style="margin-top:10px"><button class="btn sm" id="update">Check for updates</button></div></div></div>`);
    if (!show(el, token)) return;
    $('#theme', el).querySelectorAll('button').forEach((b) => b.onclick = () => { S.settings.theme = b.dataset.t; Store.save(); applyTheme(); $('#theme', el).querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); });
    $('#dn', el).querySelectorAll('button').forEach((b) => b.onclick = () => { S.settings.dailyNew = +b.dataset.n; Store.save(); $('#dn', el).querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); updateBadge(); });
    const tog = (id, key) => { $('#' + id, el).onclick = () => { S.settings[key] = !S.settings[key]; Store.save(); const t = $('#' + id, el); t.classList.toggle('done', S.settings[key]); $('.box', t).textContent = S.settings[key] ? '✓' : ''; }; };
    tog('penonly', 'penOnly'); tog('autoink', 'autoInk');
    $('#strict', el).onclick = () => { S.settings.strict = S.settings.strict === false; Store.save(); const t = $('#strict', el); t.classList.toggle('done', S.settings.strict !== false); $('.box', t).textContent = S.settings.strict !== false ? '\u2713' : ''; };
    $('#tutor-url', el).addEventListener('change', (e) => { S.settings.tutorUrl = e.target.value.trim(); Store.save(); });
    $('#tutor-test', el).onclick = async () => { const u = Tutor.endpoint().replace(/\/tutor\/?$/, '/tutor/health').replace(/\/api\/tutor\/health$/, '/api/tutor/health'); try { const r = await fetch(u, { cache: 'no-store' }); toast(r.ok ? 'Tutor is reachable.' : 'Tutor answered with an error (' + r.status + ').'); } catch (e) { toast('Tutor not reachable. Check Tailscale and the service.'); } };
    $('#tutor-open', el).onclick = () => Tutor.open({ id: 'settings', kind: 'general', title: 'Anything', label: 'Ask the tutor', text: '' });
    const io = $('#io', el), ioA = $('#io-actions', el);
    const renderFlags = () => { const fl = Object.entries(S.flags || {}); const box = $('#flags', el); box.innerHTML = fl.length ? fl.sort((a, b) => b[1].ts - a[1].ts).map(([k, f]) => `<div class="task"><span><span class="t" style="text-decoration:none;color:inherit">${esc(f.title)}</span><div class="sub">${esc(f.kind)} · ${esc(MODS.get(f.mod)?.short || f.mod)} · ${esc(f.note)}</div></span>${f.kind === 'lesson' ? `<a class="btn sm" href="#/lesson/${esc(f.id)}">Open</a>` : ''}<button class="btn sm subtle" data-rm="${esc(k)}">Remove</button></div>`).join('') : '<p class="faint small">Nothing flagged yet.</p>'; box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { delete S.flags[b.dataset.rm]; Store.save(); renderFlags(); }); };
    renderFlags();
    $('#flags-export', el).onclick = () => { const fl = Object.values(S.flags || {}); if (!fl.length) return toast('Nothing flagged yet.'); io.hidden = false; io.value = JSON.stringify(fl, null, 2); io.select(); ioA.hidden = true; toast('Copy the text below and send it to be fixed.'); };
    $('#flags-clear', el).onclick = () => { if (confirm('Remove all flags?')) { S.flags = {}; Store.save(); renderFlags(); } };
    $('#export', el).onclick = async () => { const json = Store.exportJSON(); const name = 'rounds-progress-' + Store.today() + '.json'; try { const file = new File([json], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Rounds progress' }); return; } } catch (e) { /* fall through */ } io.hidden = false; io.value = json; io.select(); ioA.hidden = true; toast('Copy the text below to save it.'); };
    $('#import', el).onclick = () => { io.hidden = false; io.value = ''; ioA.hidden = false; io.focus(); };
    $('#io-cancel', el).onclick = () => { io.hidden = true; ioA.hidden = true; };
    $('#io-apply', el).onclick = () => { try { Store.importJSON(io.value); toast('Progress imported.'); location.reload(); } catch (e) { toast('That is not a Rounds progress file.'); } };
    $('#reset', el).onclick = () => { if (confirm('Erase all progress and Pencil notes on this device?')) { Store.reset(); Store.inkClear().then(() => location.reload()); } };
    $('#update', el).onclick = async () => { if (!('serviceWorker' in navigator)) return toast('Offline mode is not available in this browser.'); const r = await navigator.serviceWorker.getRegistration(); if (!r) return toast('Not installed for offline yet.'); await r.update(); toast('Checked. If a new version exists it will load on the next open.'); };
  });

  // ---------- Extensions (career.js, sim.js) ----------
  const API = { route, h, esc, show, stale, S, save: (now) => Store.save(now), toast, backLink, MD, Store, REF, MODS, LESSON, SCEN_IDX, loadModule, today, isToday, Tutor };
  (window.ROUNDS_EXT || []).forEach((fn) => { try { fn(API); } catch (e) { console.error('extension failed', e); } });

  // ---------- Boot ----------
  applyTheme();
  if (!IDX.modules.length) view.innerHTML = '<div class="empty">No content loaded. Run the build.</div>';
  navigate();
  window.addEventListener('visibilitychange', () => { if (!document.hidden) { updateBadge(); Store.save(true); } });
  window.addEventListener('pagehide', () => Store.save(true));
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => { const w = reg.installing; if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Update ready.', { label: 'Reload', fn: () => location.reload() }); }); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
  }
})();
