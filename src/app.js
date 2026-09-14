/* Rounds — app: router + views. Vanilla JS, no build-time framework. */
(function () {
  'use strict';
  const C = window.ROUNDS_CONTENT || { tracks: [], modules: [], reference: [], version: 'dev' };
  const S = Store.load();
  const $ = (sel, el = document) => el.querySelector(sel);
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = MD.esc;
  const view = $('#view');
  const main = $('#main');

  // ---------- Content index ----------
  const MOD = new Map(C.modules.map((m) => [m.id, m]));
  const TRACK = new Map(C.tracks.map((t) => [t.id, t]));
  const LESSON = new Map(); const LESSON_MOD = new Map(); const CARD = new Map(); const Q = new Map(); const SCEN = new Map();
  const orderedModules = [];
  for (const t of C.tracks) for (const id of t.modules) { const m = MOD.get(id); if (m) orderedModules.push(m); }
  for (const m of orderedModules) {
    m.lessons.forEach((l, i) => { l._idx = i; LESSON.set(l.id, l); LESSON_MOD.set(l.id, m); });
    m.cards.forEach((c) => { c._mod = m.id; CARD.set(c.id, c); });
    m.quiz.forEach((q) => { q._mod = m.id; Q.set(q.id, q); });
    (m.scenarios || []).forEach((s) => { s._mod = m.id; SCEN.set(s.id, s); });
  }
  const REF = new Map((C.reference || []).map((r) => [r.id, r]));
  const trackOf = (m) => TRACK.get(m.track);

  // ---------- Helpers ----------
  function toast(msg, action) {
    const t = $('#toast');
    t.innerHTML = esc(msg) + (action ? ' <button class="btn sm primary">' + esc(action.label) + '</button>' : '');
    if (action) $('button', t).onclick = () => { action.fn(); t.hidden = true; };
    t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, action ? 8000 : 2600);
  }
  const lessonDone = (id) => !!S.lessons[id]?.done;
  const modProgress = (m) => { const n = m.lessons.filter((l) => lessonDone(l.id)).length; return { n, total: m.lessons.length, pct: m.lessons.length ? Math.round((n / m.lessons.length) * 100) : 0 }; };
  const trackProgress = (t) => { let n = 0, total = 0; for (const id of t.modules) { const m = MOD.get(id); if (!m) continue; n += m.lessons.filter((l) => lessonDone(l.id)).length; total += m.lessons.length; } return { n, total, pct: total ? Math.round((n / total) * 100) : 0 }; };
  function nextLesson() {
    for (const m of orderedModules) for (const l of m.lessons) if (!lessonDone(l.id)) return { m, l };
    return null;
  }
  function nextInModule(m, l) { const i = m.lessons.indexOf(l); return m.lessons[i + 1] || null; }
  function dueCards(now = Date.now()) { const out = []; for (const [id, rec] of Object.entries(S.cards)) if (SRS.isDue(rec, now) && CARD.has(id)) out.push(id); return out; }
  function newCardPool() {
    // New cards come from lessons that are done (or modules explicitly added) and have no record yet.
    const out = [];
    for (const m of orderedModules) for (const c of m.cards) if (!S.cards[c.id] && (lessonDone(c.lesson) || S.lessons['*' + m.id]?.added)) out.push(c.id);
    return out;
  }
  function learningCards(now = Date.now()) { const out = []; for (const [id, rec] of Object.entries(S.cards)) if (rec.state === 'learning' && rec.due <= now + 1000 * 60 * 30 && CARD.has(id)) out.push(id); return out; }
  function streak() {
    let n = 0; const d = new Date(); d.setHours(12, 0, 0, 0);
    const key = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    const active = (k) => { const v = S.days[k]; return v && (v.cards || v.lessons || v.quiz || v.scen); };
    if (!active(key(d))) d.setDate(d.getDate() - 1);
    while (active(key(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function updateBadge() {
    const n = dueCards().length + learningCards().length;
    const b = $('#badge-due'); b.textContent = n > 99 ? '99+' : String(n); b.hidden = n === 0;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const fmtMin = (n) => n + ' min';
  const KEYS = ['A', 'B', 'C', 'D'];
  function choicesHTML(choices) { return '<div class="choices">' + choices.map((c, i) => '<button class="choice" data-i="' + i + '"><span class="key">' + KEYS[i] + '</span><span>' + MD.inline(c) + '</span></button>').join('') + '</div>'; }
  function applyTheme() {
    const t = S.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  }
  const backLink = (href, label) => '<a class="back" href="' + href + '"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' + esc(label) + '</a>';
  const chev = '<svg class="chev" width="20" height="20" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- Router ----------
  const routes = [];
  const route = (pattern, fn) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn });
  let cleanup = null;
  function navigate() {
    const hash = location.hash.replace(/^#/, '') || '/today';
    const [path, qs] = hash.split('?');
    const params = Object.fromEntries(new URLSearchParams(qs || ''));
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const args = m.slice(1).map(decodeURIComponent);
        const nav = path.split('/')[1] || 'today';
        document.querySelectorAll('.rail-item').forEach((a) => a.classList.toggle('active', a.dataset.nav === (({ lesson: 'learn', module: 'learn', quiz: 'practice', scenario: 'practice', drill: 'practice', search: 'learn' })[nav] || nav)));
        view.innerHTML = '';
        window.scrollTo(0, 0);
        const ret = r.fn(...args, params);
        if (typeof ret === 'function') cleanup = ret;
        updateBadge();
        return;
      }
    }
    location.hash = '#/today';
  }
  window.addEventListener('hashchange', navigate);

  // ---------- Today ----------
  route('/today', () => {
    const nl = nextLesson();
    const due = dueCards().length, learn = learningCards().length, pool = newCardPool().length;
    const st = streak();
    const totalLessons = orderedModules.reduce((a, m) => a + m.lessons.length, 0);
    const doneLessons = Object.keys(S.lessons).filter((k) => !k.startsWith('*') && LESSON.has(k) && S.lessons[k].done).length;
    const learned = Object.values(S.cards).filter((r) => r.state === 'review').length;
    const qh = S.quiz.slice(-10); const acc = qh.length ? Math.round((qh.reduce((a, q) => a + q.correct, 0) / qh.reduce((a, q) => a + q.n, 0)) * 100) : null;
    const scen = pickScenario();
    const el = h(`
      <div>
        <div class="page-head"><div><div class="eyebrow">Rounds</div><h1>Today</h1></div><div class="chip mono">${esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }))}</div></div>
        <div class="today-grid">
          <section class="card trace-card span-8">
            <div class="eyebrow">Activity · last 30 days</div>
            <canvas class="trace-canvas" id="trace"></canvas>
            <div class="trace-stats">
              <div class="trace-stat hr"><b class="num">${st}</b><span>day streak</span></div>
              <div class="trace-stat spo2"><b class="num">${learned}</b><span>cards learned</span></div>
              <div class="trace-stat bp"><b class="num">${doneLessons}<span style="font-size:.9rem;color:#8FA0AE">/${totalLessons}</span></b><span>lessons</span></div>
              <div class="trace-stat rr"><b class="num">${acc === null ? '--' : acc + '%'}</b><span>quiz accuracy</span></div>
            </div>
          </section>
          <section class="card next-card span-4">
            <div class="eyebrow accent">Review</div>
            <h2>${due + learn ? '<span class="num">' + (due + learn) + '</span> cards due' : 'Nothing due'}</h2>
            <p class="muted small">${pool ? '<span class="num">' + Math.min(pool, S.settings.dailyNew) + '</span> new cards ready from finished lessons.' : due + learn ? 'Clear the queue, then keep learning.' : 'Finish a lesson to unlock its cards.'}</p>
            <a class="btn ${due + learn + pool ? 'primary' : ''}" href="#/review">${due + learn + pool ? 'Start review' : 'Open review'}</a>
          </section>
          <section class="card next-card span-6">
            <div class="eyebrow accent">Up next</div>
            ${nl ? `<h2>${esc(nl.l.title)}</h2><p class="muted small">${esc(nl.m.title)} · ${fmtMin(nl.l.minutes)} · lesson ${nl.l._idx + 1} of ${nl.m.lessons.length}</p><a class="btn primary" href="#/lesson/${nl.l.id}">${lessonStarted(nl.l.id) ? 'Continue lesson' : 'Start lesson'}</a>` : '<h2>All lessons done</h2><p class="muted small">Keep the cards moving and run scenarios.</p>'}
          </section>
          <section class="card next-card span-6">
            <div class="eyebrow accent">Scenario</div>
            ${scen ? `<h2>${esc(scen.title)}</h2><p class="muted small">${esc(MOD.get(scen._mod).title)} · ${scen.setting === 'field' ? 'In the field' : scen.setting === 'ed' ? 'In the ED' : 'Reasoning'} · ${scen.steps.length} decisions</p><a class="btn" href="#/scenario/${scen.id}">Run it</a>` : '<p class="muted">Scenarios appear as modules load.</p>'}
          </section>
          <section class="card span-12">
            <div class="eyebrow">Tracks</div>
            <div class="track-progress" style="margin-top:10px">
              ${C.tracks.map((t) => { const p = trackProgress(t); return `<a class="track-${t.id}" href="#/learn"><span><b>${esc(t.title)}</b> <span class="faint small">${esc(t.tagline)}</span></span><span class="pct">${p.n}/${p.total}</span><div class="progress"><i style="width:${p.pct}%"></i></div></a>`; }).join('')}
            </div>
          </section>
        </div>
      </div>`);
    view.appendChild(el);
    drawTrace($('#trace', el));
  });
  function lessonStarted(id) { return !!S.lessons[id]?.started; }
  function pickScenario() {
    const all = [...SCEN.values()];
    if (!all.length) return null;
    // Prefer scenarios from modules with progress, unplayed first.
    const scored = all.map((s) => { const m = MOD.get(s._mod); const p = modProgress(m).pct; const runs = S.scenarios[s.id]?.runs || 0; return { s, score: (runs ? -10 : 0) + p + (m.track === 'foundations' ? 20 : 0) }; });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].s;
  }
  function drawTrace(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, hgt = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = hgt * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    // grid
    ctx.strokeStyle = 'rgba(143,160,174,.14)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, hgt); ctx.stroke(); }
    for (let y = 0; y < hgt; y += 20) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
    const days = [];
    const d = new Date(); d.setHours(12, 0, 0, 0);
    for (let i = 29; i >= 0; i--) { const x = new Date(d); x.setDate(d.getDate() - i); const k = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); const v = S.days[k]; days.push(v ? (v.cards || 0) + (v.lessons || 0) * 8 + (v.quiz || 0) * 2 + (v.scen || 0) * 6 : 0); }
    const max = Math.max(10, ...days);
    const base = hgt * 0.62, step = w / 30;
    ctx.strokeStyle = '#3DDC84'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(61,220,132,.5)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(0, base);
    days.forEach((v, i) => {
      const x0 = i * step, amp = (v / max) * (hgt * 0.5);
      if (v <= 0) { ctx.lineTo(x0 + step, base); return; }
      // P-QRS-T shaped beat scaled by activity
      ctx.lineTo(x0 + step * 0.15, base);
      ctx.lineTo(x0 + step * 0.28, base - amp * 0.18);
      ctx.lineTo(x0 + step * 0.38, base);
      ctx.lineTo(x0 + step * 0.45, base + amp * 0.18);
      ctx.lineTo(x0 + step * 0.53, base - amp);
      ctx.lineTo(x0 + step * 0.61, base + amp * 0.3);
      ctx.lineTo(x0 + step * 0.68, base);
      ctx.lineTo(x0 + step * 0.82, base - amp * 0.28);
      ctx.lineTo(x0 + step * 0.92, base);
      ctx.lineTo(x0 + step, base);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    // today marker
    ctx.fillStyle = '#3DDC84'; ctx.beginPath(); ctx.arc(w - 2, base, 3, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Learn ----------
  route('/learn', () => {
    const el = h(`<div>
      <div class="page-head"><div><div class="eyebrow">Curriculum</div><h1>Learn</h1><p class="lede">Four tracks, in order. Each lesson ends in a check; passing it unlocks the lesson's cards for review.</p></div>
        <form class="search" id="search-form" role="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="search-q" placeholder="Search lessons, cards, sheets" autocapitalize="off" autocorrect="off" enterkeyhint="search"></form>
      </div>
      <div id="tracks"></div></div>`);
    const wrap = $('#tracks', el);
    for (const t of C.tracks) {
      const p = trackProgress(t);
      wrap.appendChild(h(`<div class="track-${t.id}"><div class="track-head"><span class="dot"></span><h2>${esc(t.title)}</h2><span class="chip track num">${p.n}/${p.total}</span></div><p class="muted small" style="margin:-4px 0 12px 24px">${esc(t.tagline)}</p><div class="grid" id="tg-${t.id}"></div></div>`));
      const g = $('#tg-' + t.id, wrap);
      for (const id of t.modules) {
        const m = MOD.get(id);
        if (!m) { g.appendChild(h(`<div class="card module-card" style="opacity:.55"><div class="title">${esc(id)}</div><div class="summary">Not loaded yet.</div></div>`)); continue; }
        const mp = modProgress(m);
        const mins = m.lessons.reduce((a, l) => a + l.minutes, 0);
        g.appendChild(h(`<a class="card link module-card" href="#/module/${m.id}"><div class="title">${esc(m.title)}</div>${chev}<div class="summary">${esc(m.summary)}</div><div class="meta"><span class="chip">${m.lessons.length} lessons · ${fmtMin(mins)}</span><span class="chip">${m.cards.length} cards</span>${(m.scenarios || []).length ? '<span class="chip">' + m.scenarios.length + ' scenario' + (m.scenarios.length > 1 ? 's' : '') + '</span>' : ''}</div><div class="progress"><i style="width:${mp.pct}%"></i></div></a>`));
      }
    }
    view.appendChild(el);
    $('#search-form', el).addEventListener('submit', (e) => { e.preventDefault(); const q = $('#search-q', el).value.trim(); if (q) location.hash = '#/search?q=' + encodeURIComponent(q); });
  });

  route('/module/:id', (id) => {
    const m = MOD.get(id); if (!m) { view.appendChild(h('<div class="empty">Module not found.</div>')); return; }
    const t = trackOf(m); const mp = modProgress(m);
    const mins = m.lessons.reduce((a, l) => a + l.minutes, 0);
    const added = !!S.lessons['*' + m.id]?.added;
    const el = h(`<div class="track-${m.track}">
      ${backLink('#/learn', 'Learn')}
      <div class="page-head"><div><div class="eyebrow" style="color:var(--track)">${esc(t.title)}</div><h1>${esc(m.title)}</h1><p class="lede">${esc(m.summary)}</p></div>
        <div class="row"><span class="chip track num">${mp.n}/${mp.total} lessons</span><span class="chip">${fmtMin(mins)}</span></div></div>
      <div class="progress" style="margin-bottom:20px"><i style="width:${mp.pct}%"></i></div>
      <div class="split">
        <div>
          <div class="eyebrow" style="margin-bottom:6px">Lessons</div>
          <div class="card list" id="lessons"></div>
        </div>
        <div class="stack">
          <div class="card"><div class="eyebrow">Practice this module</div>
            <div class="btn-row" style="margin-top:12px">
              <a class="btn" href="#/quiz?scope=${m.id}&n=${Math.min(20, m.quiz.length)}">Quiz · <span class="num">${m.quiz.length}</span> questions</a>
              <button class="btn" id="add-cards">${added ? 'Cards added to review' : 'Add all ' + m.cards.length + ' cards to review'}</button>
            </div>
            <p class="faint small" style="margin-top:10px">Cards normally unlock as you finish lessons. Adding them all is for cramming before an exam.</p>
          </div>
          ${(m.scenarios || []).length ? `<div class="card"><div class="eyebrow">Scenarios</div><div class="list">${m.scenarios.map((s) => { const r = S.scenarios[s.id]; return `<a class="list-item" href="#/scenario/${s.id}"><span class="lead">${s.setting === 'field' ? 'EMS' : s.setting === 'ed' ? 'ED' : 'CR'}</span><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${s.steps.length} decisions${r ? ' · best ' + r.best + '%' : ''}</span></span>${chev}</a>`; }).join('')}</div></div>` : ''}
        </div>
      </div></div>`);
    const list = $('#lessons', el);
    m.lessons.forEach((l, i) => {
      const done = lessonDone(l.id);
      list.appendChild(h(`<a class="list-item ${done ? 'done' : ''}" href="#/lesson/${l.id}"><span class="lead">${done ? '✓' : String(i + 1).padStart(2, '0')}</span><span class="grow"><span class="title">${esc(l.title)}</span><span class="sub">${fmtMin(l.minutes)} · ${l.checks.length} checks · ${m.cards.filter((c) => c.lesson === l.id).length} cards</span></span>${chev}</a>`));
    });
    $('#add-cards', el).onclick = (e) => { S.lessons['*' + m.id] = { added: Date.now() }; Store.save(); e.target.textContent = 'Cards added to review'; toast('All ' + m.cards.length + ' cards will show up as new in Review.'); updateBadge(); };
    view.appendChild(el);
  });

  // ---------- Lesson ----------
  route('/lesson/:id', (id) => {
    const l = LESSON.get(id); if (!l) { view.appendChild(h('<div class="empty">Lesson not found.</div>')); return; }
    const m = LESSON_MOD.get(id); const t = trackOf(m);
    S.lessons[id] = Object.assign({}, S.lessons[id], { started: S.lessons[id]?.started || Date.now() }); Store.save();
    const done = lessonDone(id);
    const next = nextInModule(m, l);
    const el = h(`<div class="lesson track-${m.track}" id="lesson">
      ${backLink('#/module/' + m.id, m.title)}
      <div class="ink-bar" id="ink-bar" hidden></div>
      <header class="lesson-head"><div class="eyebrow" style="color:var(--track)">${esc(t.title)} · ${esc(m.short)} · Lesson ${l._idx + 1} of ${m.lessons.length}</div><h1>${esc(l.title)}</h1>
        <div class="meta"><span class="chip">${fmtMin(l.minutes)}</span>${done ? '<span class="chip good">Completed</span>' : ''}<div class="lesson-tools"><button class="btn sm subtle" id="ink-toggle" title="Pencil notes"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 20l4-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="2"/></svg>Notes</button></div></div></header>
      <article class="prose" id="body">${MD.render(l.body)}</article>
      <section class="keypoints"><div class="eyebrow accent">Walk away with</div><ol>${l.keyPoints.map((k) => '<li>' + MD.inline(k) + '</li>').join('')}</ol></section>
      <section class="checks"><div class="eyebrow accent">Check yourself</div><p class="muted small" style="margin-top:4px">Get all ${l.checks.length} right to finish the lesson and unlock its cards.</p><div id="checks"></div></section>
      <footer class="lesson-foot"><button class="btn primary lg" id="finish" ${done ? '' : 'disabled'}>${done ? 'Completed' : 'Finish lesson'}</button>${next ? `<a class="btn" href="#/lesson/${next.id}">Next: ${esc(next.title)}</a>` : `<a class="btn" href="#/module/${m.id}">Back to module</a>`}</footer>
      <div class="ink-layer" id="ink-layer"></div>
    </div>`);
    const checks = $('#checks', el);
    const passed = new Array(l.checks.length).fill(done);
    l.checks.forEach((c, ci) => {
      const box = h(`<div class="check"><div class="eyebrow">Check ${ci + 1}</div><div class="q">${MD.inline(c.q)}</div>${choicesHTML(c.choices)}<div class="why" hidden></div></div>`);
      box.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const i = +b.dataset.i; const ok = i === c.answer;
        box.querySelectorAll('.choice').forEach((x) => { x.classList.remove('picked', 'right', 'wrong'); });
        b.classList.add(ok ? 'right' : 'wrong');
        if (ok) { box.querySelectorAll('.choice').forEach((x) => { x.disabled = true; if (+x.dataset.i === c.answer) x.classList.add('right'); }); }
        const why = $('.why', box); why.hidden = false; why.className = 'why ' + (ok ? 'ok' : 'no'); why.innerHTML = (ok ? '<strong>Right.</strong> ' : '<strong>Not quite.</strong> Try again. ') + MD.inline(ok ? c.why : '');
        passed[ci] = passed[ci] || ok;
        if (passed.every(Boolean)) { const f = $('#finish', el); f.disabled = false; }
      });
      checks.appendChild(box);
    });
    $('#finish', el).onclick = () => {
      if (lessonDone(id)) return;
      S.lessons[id] = Object.assign({}, S.lessons[id], { done: Date.now() }); Store.bump('lessons'); Store.save(true);
      const n = m.cards.filter((c) => c.lesson === id).length;
      $('#finish', el).textContent = 'Completed';
      toast('Lesson done. ' + n + ' cards unlocked for review.', next ? { label: 'Next lesson', fn: () => { location.hash = '#/lesson/' + next.id; } } : { label: 'Review now', fn: () => { location.hash = '#/review'; } });
      updateBadge();
    };
    view.appendChild(el);
    // ---- Pencil notes layer ----
    const layer = $('#ink-layer', el); const bar = $('#ink-bar', el); const toggle = $('#ink-toggle', el);
    let ink = null;
    function ensureInk() {
      if (ink) return ink;
      ink = new Ink(layer, { id: 'lesson:' + id, penOnly: S.settings.penOnly, width: 2.2 });
      const colors = (document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches)) ? Ink.DARK_COLORS : Ink.COLORS;
      bar.innerHTML = colors.map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" data-c="${i}" style="background:${c}" aria-label="Ink color ${i + 1}"></button>`).join('') +
        '<span class="sep"></span><button class="tool" data-t="eraser" aria-label="Eraser"><svg viewBox="0 0 24 24"><path d="M4 16l8-8 6 6-6 6H8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8l6 6" stroke="currentColor" stroke-width="2"/></svg></button><button class="tool" data-t="undo" aria-label="Undo"><svg viewBox="0 0 24 24"><path d="M9 14l-4-4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10h9a5 5 0 0 1 0 10h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="tool" data-t="clear" aria-label="Clear"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="sep"></span><button class="tool" data-t="done" aria-label="Done"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
      bar.querySelectorAll('.sw').forEach((b) => b.onclick = () => { bar.querySelectorAll('.sw').forEach((x) => x.classList.remove('on')); bar.querySelectorAll('.tool').forEach((x) => x.classList.remove('on')); b.classList.add('on'); ink.setColor(+b.dataset.c); });
      bar.querySelectorAll('.tool').forEach((b) => b.onclick = () => {
        const t = b.dataset.t;
        if (t === 'eraser') { const on = b.classList.toggle('on'); ink.setTool(on ? 'eraser' : 'pen'); }
        else if (t === 'undo') ink.undo(); else if (t === 'clear') ink.clear(); else if (t === 'done') setInking(false);
      });
      return ink;
    }
    function setInking(on) { ensureInk(); el.classList.toggle('inking', on); bar.hidden = !on; toggle.classList.toggle('primary', on); }
    toggle.onclick = () => setInking(!el.classList.contains('inking'));
    // Show existing notes without entering ink mode; auto-enter on pencil touch if enabled.
    Store.inkGet('lesson:' + id).then((d) => { if (d && d.strokes && d.strokes.length) ensureInk(); });
    const onPointer = (e) => { if (e.pointerType === 'pen' && S.settings.autoInk && !el.classList.contains('inking') && !e.target.closest('button, a, input')) setInking(true); };
    el.addEventListener('pointerdown', onPointer);
    return () => { el.removeEventListener('pointerdown', onPointer); if (ink) ink.destroy(); };
  });

  // ---------- Review ----------
  route('/review', () => {
    const now = Date.now();
    const due = shuffle(dueCards(now)); const learn = learningCards(now); const pool = newCardPool();
    const newToday = Object.values(S.cards).filter((r) => r.state !== 'new' && r.last && new Date(r.last).toDateString() === new Date().toDateString() && r.reps <= 1 && r.lapses === 0 && r.ivl <= 4).length;
    const newN = Math.max(0, S.settings.dailyNew - newToday);
    const queue = [...new Set([...learn, ...due, ...pool.slice(0, newN)])];
    if (!queue.length) {
      view.appendChild(h(`<div class="review"><div class="page-head"><div><div class="eyebrow">Spaced repetition</div><h1>Review</h1></div></div>
        <div class="card session-done"><b class="num">0</b><p>Nothing to review right now.</p><p class="muted small" style="margin-top:6px">${pool.length ? 'You have hit today\'s new-card limit (' + S.settings.dailyNew + '). Raise it in Settings or come back tomorrow.' : 'Finish a lesson to unlock its cards, or add a whole module from its page.'}</p><div class="btn-row" style="justify-content:center;margin-top:16px"><a class="btn primary" href="#/learn">Go learn</a><a class="btn" href="#/settings">Settings</a></div></div></div>`));
      return;
    }
    let idx = 0, flipped = false, doneCount = 0, again = 0;
    let scratch = null;
    const el = h(`<div class="review"><div class="review-top"><div><div class="eyebrow">Spaced repetition</div><h1>Review</h1></div><div class="counts"><span class="new" title="New">new <b id="c-new"></b></span><span class="learn" title="Learning">learn <b id="c-learn"></b></span><span class="due" title="Due">due <b id="c-due"></b></span></div></div>
      <div class="progress" style="margin-bottom:14px"><i id="rp" style="width:0%"></i></div><div id="stage"></div></div>`);
    view.appendChild(el);
    const stage = $('#stage', el);
    function counts() { let n = 0, lr = 0, d = 0; for (const id of queue.slice(idx)) { const r = S.cards[id]; if (!r || r.state === 'new') n++; else if (r.state === 'learning') lr++; else d++; } $('#c-new', el).textContent = n; $('#c-learn', el).textContent = lr; $('#c-due', el).textContent = d; $('#rp', el).style.width = Math.round((doneCount / (doneCount + queue.length - idx)) * 100) + '%'; }
    function render() {
      if (scratch) { scratch.destroy(); scratch = null; }
      if (idx >= queue.length) {
        stage.innerHTML = `<div class="card session-done"><b class="num">${doneCount}</b><p>cards reviewed. ${again ? again + ' marked again and will come back in 10 minutes.' : 'Clean session.'}</p><div class="btn-row" style="justify-content:center;margin-top:16px"><a class="btn primary" href="#/review">Check for more</a><a class="btn" href="#/today">Today</a></div></div>`;
        counts(); return;
      }
      const id = queue[idx]; const c = CARD.get(id); const m = MOD.get(c._mod); const l = LESSON.get(c.lesson);
      const rec = S.cards[id] || SRS.fresh();
      const pv = SRS.preview(rec);
      flipped = false;
      stage.innerHTML = `<div class="flashcard track-${m.track}">
          <div class="face"><div class="eyebrow" style="color:var(--track)">${esc(m.short)}${rec.state === 'new' ? ' · new' : rec.state === 'learning' ? ' · learning' : ' · review'}</div><div class="front" style="margin-top:8px">${MD.inline(c.front)}</div></div>
          <div class="scratch" id="scratch"><span class="hint">Work it out here</span></div>
          <div class="face back" id="back" hidden>${MD.inline(c.back)}<div class="src">${esc(l ? l.title : '')}</div></div>
        </div>
        <div class="flip-row" id="flip-row"><button class="btn primary lg block" id="flip">Show answer <span class="faint tiny mono" style="margin-left:6px">space</span></button></div>
        <div class="grades" id="grades" hidden>
          <button class="grade again" data-g="0">Again<small>${pv[0]}</small></button><button class="grade hard" data-g="1">Hard<small>${pv[1]}</small></button><button class="grade good" data-g="2">Good<small>${pv[2]}</small></button><button class="grade easy" data-g="3">Easy<small>${pv[3]}</small></button>
        </div>`;
      scratch = new Ink($('#scratch', stage), { penOnly: S.settings.penOnly, width: 2.4 });
      $('#flip', stage).onclick = flip;
      stage.querySelectorAll('.grade').forEach((b) => b.onclick = () => gradeCard(+b.dataset.g));
      counts();
    }
    function flip() { if (flipped) return; flipped = true; $('#back', stage).hidden = false; $('#flip-row', stage).hidden = true; $('#grades', stage).hidden = false; }
    function gradeCard(g) {
      if (!flipped) return;
      const id = queue[idx];
      S.cards[id] = SRS.grade(S.cards[id], g); Store.bump('cards'); Store.save();
      doneCount++;
      if (g === 0) { again++; queue.push(id); }
      idx++; render(); updateBadge();
    }
    const onKey = (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) flip(); else gradeCard(2); }
      else if (['1', '2', '3', '4'].includes(e.key)) { gradeCard(+e.key - 1); }
    };
    document.addEventListener('keydown', onKey);
    render();
    return () => { document.removeEventListener('keydown', onKey); if (scratch) scratch.destroy(); };
  });

  // ---------- Practice hub ----------
  route('/practice', () => {
    const scen = [...SCEN.values()];
    const bySetting = { field: [], ed: [], classroom: [] };
    scen.forEach((s) => bySetting[s.setting]?.push(s));
    const weak = weakLessons();
    const el = h(`<div>
      <div class="page-head"><div><div class="eyebrow">Practice</div><h1>Practice</h1><p class="lede">Exam-style questions, branching scenarios, and hands-on drills.</p></div></div>
      <div class="grid" style="margin-bottom:22px">
        <a class="card link" href="#/quiz?scope=all&n=20"><div class="eyebrow accent">Quiz</div><h2 style="margin-top:6px">Mixed 20</h2><p class="muted small" style="margin-top:6px">Twenty questions across everything you have unlocked.</p></a>
        <a class="card link" href="#/quiz?scope=emt&n=70&mode=exam"><div class="eyebrow accent">Exam mode</div><h2 style="margin-top:6px">NREMT mock · 70</h2><p class="muted small" style="margin-top:6px">Timed, no feedback until the end. Domain-weighted like the real thing.</p></a>
        <a class="card link" href="#/quiz?scope=weak&n=20"><div class="eyebrow accent">Weak spots</div><h2 style="margin-top:6px">${weak.length ? weak.length + ' lessons to shore up' : 'No weak spots yet'}</h2><p class="muted small" style="margin-top:6px">${weak.length ? 'Questions from the lessons you miss most.' : 'Take a few quizzes and this fills in.'}</p></a>
        <a class="card link" href="#/quiz"><div class="eyebrow accent">Custom</div><h2 style="margin-top:6px">Build a quiz</h2><p class="muted small" style="margin-top:6px">Pick a track or module, length, and mode.</p></a>
      </div>
      <div class="split" style="grid-template-columns:1fr">
        <div class="card"><div class="eyebrow">Drills</div><div class="list">
          <a class="list-item" href="#/drill/leads12"><span class="lead">V1</span><span class="grow"><span class="title">12-lead placement</span><span class="sub">Place V1–V6 and the limb leads on the torso. ${S.drills.leads12 ? 'Best ' + S.drills.leads12.best + '%' : 'Not tried yet'}</span></span>${chev}</a>
          <a class="list-item" href="#/drill/monitor"><span class="lead">HR</span><span class="grow"><span class="title">Read the monitor</span><span class="sub">Sick or not sick from a vitals set, ten rounds. ${S.drills.monitor ? 'Best ' + S.drills.monitor.best + '%' : 'Not tried yet'}</span></span>${chev}</a>
        </div></div>
        ${['field', 'ed', 'classroom'].map((k) => bySetting[k].length ? `<div class="card"><div class="eyebrow">${k === 'field' ? 'Scenarios · in the field' : k === 'ed' ? 'Scenarios · in the ED' : 'Scenarios · reasoning'}</div><div class="list">${bySetting[k].map((s) => { const r = S.scenarios[s.id]; const m = MOD.get(s._mod); return `<a class="list-item track-${m.track}" href="#/scenario/${s.id}"><span class="lead" style="background:var(--track-soft);color:var(--track)">${esc(m.short.slice(0, 3).toUpperCase())}</span><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${esc(m.title)} · ${s.steps.length} decisions${r ? ' · best ' + r.best + '%' : ''}</span></span>${chev}</a>`; }).join('')}</div></div>` : '').join('')}
      </div></div>`);
    view.appendChild(el);
  });
  function weakLessons() {
    const byLesson = {};
    for (const [qid, st] of Object.entries(S.qstats)) { const q = Q.get(qid); if (!q) continue; const b = byLesson[q.lesson] = byLesson[q.lesson] || { seen: 0, right: 0 }; b.seen += st.seen; b.right += st.right; }
    return Object.entries(byLesson).filter(([, b]) => b.seen >= 2 && b.right / b.seen < 0.7).map(([id]) => id);
  }

  // ---------- Quiz ----------
  route('/quiz', (params) => {
    if (!params.scope) return quizSetup();
    const scope = params.scope; const n = Math.max(1, Math.min(120, +params.n || 20)); const mode = params.mode === 'exam' ? 'exam' : 'practice';
    let pool = [];
    if (scope === 'all') pool = [...Q.values()];
    else if (scope === 'weak') { const w = new Set(weakLessons()); pool = [...Q.values()].filter((q) => w.has(q.lesson)); if (!pool.length) pool = [...Q.values()]; }
    else if (TRACK.has(scope)) pool = [...Q.values()].filter((q) => MOD.get(q._mod).track === scope);
    else if (MOD.has(scope)) pool = MOD.get(scope).quiz.slice();
    if (!pool.length) { view.appendChild(h('<div class="empty">No questions available for that scope yet.</div>')); return; }
    let qs;
    if (scope === 'emt' && mode === 'exam') qs = weightedEMT(pool, n); else { shuffle(pool); pool.sort((a, b) => (S.qstats[a.id]?.seen || 0) - (S.qstats[b.id]?.seen || 0)); qs = pool.slice(0, n); shuffle(qs); }
    return runQuiz(qs, { scope, mode });
  });
  function weightedEMT(pool, n) {
    const W = { 'emt-airway': .20, 'emt-cardio': .22, 'emt-trauma': .16, 'emt-medical': .19, 'emt-obgyn-peds': .10, 'emt-pharm': .05, 'emt-ops': .12, 'emt-exam': .02 };
    const groups = {}; pool.forEach((q) => (groups[q._mod] = groups[q._mod] || []).push(q));
    const out = [];
    for (const [mid, w] of Object.entries(W)) { const g = shuffle(groups[mid] || []); out.push(...g.slice(0, Math.round(n * w))); }
    const rest = shuffle(pool.filter((q) => !out.includes(q)));
    while (out.length < n && rest.length) out.push(rest.pop());
    return shuffle(out.slice(0, n));
  }
  function quizSetup() {
    const sel = { scope: 'all', n: 20, mode: 'practice' };
    const el = h(`<div class="quiz"><div class="page-head"><div><div class="eyebrow">Practice</div><h1>Build a quiz</h1></div></div>
      <div class="setup">
        <div class="field"><label>Scope</label><div class="opt-grid" id="scopes"></div></div>
        <div class="field"><label>Questions</label><div class="seg" id="ns">${[10, 20, 40, 70].map((k) => `<button data-n="${k}" class="${k === 20 ? 'on' : ''}">${k}</button>`).join('')}</div></div>
        <div class="field"><label>Mode</label><div class="seg" id="modes"><button data-m="practice" class="on">Practice · instant feedback</button><button data-m="exam">Exam · timed, feedback at end</button></div></div>
        <button class="btn primary lg" id="go">Start</button>
      </div></div>`);
    const scopes = $('#scopes', el);
    const opts = [['all', 'Everything', Q.size + ' questions'], ['weak', 'Weak spots', weakLessons().length + ' lessons']];
    C.tracks.forEach((t) => opts.push([t.id, t.title, [...Q.values()].filter((q) => MOD.get(q._mod).track === t.id).length + ' questions']));
    orderedModules.forEach((m) => opts.push([m.id, m.title, m.quiz.length + ' questions']));
    scopes.innerHTML = opts.map(([id, t, s]) => `<button class="opt ${id === 'all' ? 'on' : ''}" data-s="${id}">${esc(t)}<small>${esc(s)}</small></button>`).join('');
    scopes.querySelectorAll('.opt').forEach((b) => b.onclick = () => { scopes.querySelectorAll('.opt').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.scope = b.dataset.s; });
    $('#ns', el).querySelectorAll('button').forEach((b) => b.onclick = () => { $('#ns', el).querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.n = +b.dataset.n; });
    $('#modes', el).querySelectorAll('button').forEach((b) => b.onclick = () => { $('#modes', el).querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sel.mode = b.dataset.m; });
    $('#go', el).onclick = () => { location.hash = '#/quiz?scope=' + sel.scope + '&n=' + sel.n + '&mode=' + sel.mode; };
    view.appendChild(el);
  }
  function runQuiz(qs, { scope, mode }) {
    let i = 0; const answers = new Array(qs.length).fill(null); const start = Date.now();
    const limit = mode === 'exam' ? qs.length * 75 * 1000 : 0; // 75 s per question, roughly NREMT pace
    const scopeName = scope === 'all' ? 'Everything' : scope === 'weak' ? 'Weak spots' : TRACK.get(scope)?.title || MOD.get(scope)?.title || scope;
    const el = h(`<div class="quiz"><div class="quiz-top"><div><div class="eyebrow">${mode === 'exam' ? 'Exam mode' : 'Practice quiz'}</div><h2>${esc(scopeName)}</h2></div><div class="progress"><i id="qp"></i></div><div class="timer num" id="timer"></div></div><div id="qstage"></div></div>`);
    view.appendChild(el);
    const stage = $('#qstage', el);
    let timer = null;
    function tick() { const ms = Date.now() - start; const rem = limit ? Math.max(0, limit - ms) : ms; const s = Math.floor(rem / 1000); $('#timer', el).textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); if (limit && rem <= 0) finish(); }
    timer = setInterval(tick, 500); tick();
    function render() {
      $('#qp', el).style.width = Math.round((i / qs.length) * 100) + '%';
      const q = qs[i]; const m = MOD.get(q._mod);
      stage.innerHTML = `<div class="qcard track-${m.track}"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="eyebrow" style="color:var(--track)">${esc(m.short)} · Q${i + 1} of ${qs.length}</span><span class="chip">${['recall', 'application', 'analysis'][q.difficulty - 1] || ''}</span></div><div class="stem">${MD.inline(q.q)}</div>${choicesHTML(q.choices)}<div class="why" id="why" hidden></div></div>
        <div class="qnav"><button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>Back</button><button class="btn primary" id="next" ${answers[i] === null ? 'disabled' : ''}>${i === qs.length - 1 ? 'Finish' : 'Next'}</button></div>`;
      const btns = stage.querySelectorAll('.choice');
      const show = () => {
        const a = answers[i];
        btns.forEach((b) => { const k = +b.dataset.i; b.classList.toggle('picked', k === a); if (mode === 'practice') { b.disabled = true; if (k === q.answer) b.classList.add('right'); else if (k === a) b.classList.add('wrong'); } });
        if (mode === 'practice') { const w = $('#why', stage); w.hidden = false; w.className = 'why ' + (a === q.answer ? 'ok' : 'no'); w.innerHTML = (a === q.answer ? '<strong>Correct.</strong> ' : '<strong>Not this one.</strong> ') + MD.inline(q.why); }
        $('#next', stage).disabled = false;
      };
      if (answers[i] !== null) show();
      btns.forEach((b) => b.onclick = () => { if (mode === 'practice' && answers[i] !== null) return; answers[i] = +b.dataset.i; show(); });
      $('#prev', stage).onclick = () => { if (i > 0) { i--; render(); } };
      $('#next', stage).onclick = () => { if (i < qs.length - 1) { i++; render(); window.scrollTo(0, 0); } else finish(); };
    }
    function finish() {
      clearInterval(timer); timer = null;
      const secs = Math.round((Date.now() - start) / 1000);
      let correct = 0;
      qs.forEach((q, k) => { const st = S.qstats[q.id] = S.qstats[q.id] || { seen: 0, right: 0 }; st.seen++; if (answers[k] === q.answer) { st.right++; correct++; } });
      S.quiz.push({ ts: Date.now(), scope, n: qs.length, correct, secs, mode }); if (S.quiz.length > 300) S.quiz.splice(0, S.quiz.length - 300);
      Store.bump('quiz', qs.length); Store.save(true);
      const pct = Math.round((correct / qs.length) * 100);
      const byMod = {}; qs.forEach((q, k) => { const b = byMod[q._mod] = byMod[q._mod] || { n: 0, r: 0 }; b.n++; if (answers[k] === q.answer) b.r++; });
      $('#qp', el).style.width = '100%';
      stage.innerHTML = `<div class="card"><div class="result-head"><div class="eyebrow">${esc(scopeName)} · ${qs.length} questions · ${Math.floor(secs / 60)}m ${secs % 60}s</div><b class="num" style="color:${pct >= 70 ? 'var(--good)' : 'var(--bad)'}">${pct}%</b><div class="sub">${correct} of ${qs.length} correct${mode === 'exam' ? ' · NREMT-style passing needs consistent 70%+ across domains' : ''}</div></div>
        <div class="row" style="justify-content:center;gap:8px;margin-bottom:8px">${Object.entries(byMod).map(([mid, b]) => `<span class="chip ${b.r / b.n >= .7 ? 'good' : 'bad'}">${esc(MOD.get(mid).short)} ${b.r}/${b.n}</span>`).join('')}</div>
        <div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/quiz?scope=${scope}&n=${qs.length}&mode=${mode}">Again</a><a class="btn" href="#/practice">Practice</a></div></div>
        <div class="card" style="margin-top:14px"><div class="eyebrow">Review answers</div>${qs.map((q, k) => `<div class="result-q"><div class="stem">${k + 1}. ${MD.inline(q.q)}</div><div class="ans ${answers[k] === q.answer ? 'ok' : 'no'}">${answers[k] === null ? 'Skipped' : 'You: ' + KEYS[answers[k]] + '. ' + MD.inline(q.choices[answers[k]])}</div>${answers[k] !== q.answer ? `<div class="ans ok">Answer: ${KEYS[q.answer]}. ${MD.inline(q.choices[q.answer])}</div>` : ''}<div class="why" style="margin-top:8px">${MD.inline(q.why)}</div><div class="faint tiny" style="margin-top:6px"><a href="#/lesson/${q.lesson}">${esc(LESSON.get(q.lesson)?.title || q.lesson)}</a></div></div>`).join('')}</div>`;
      window.scrollTo(0, 0);
    }
    const onKey = (e) => { if (e.target.matches('input, textarea')) return; const k = e.key.toUpperCase(); const idx = KEYS.indexOf(k); if (idx >= 0) { const b = stage.querySelector('.choice[data-i="' + idx + '"]'); if (b && !b.disabled) b.click(); } else if (e.key === 'Enter' || e.key === 'ArrowRight') { const n = $('#next', stage); if (n && !n.disabled) n.click(); } };
    document.addEventListener('keydown', onKey);
    render();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  // ---------- Scenario ----------
  route('/scenario/:id', (id) => {
    const s = SCEN.get(id); if (!s) { view.appendChild(h('<div class="empty">Scenario not found.</div>')); return; }
    const m = MOD.get(s._mod);
    const steps = new Map(s.steps.map((st) => [st.id, st]));
    let cur = null; const path = []; let score = 0;
    const el = h(`<div class="scenario track-${m.track}">${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow" style="color:var(--track)">${esc(m.title)} · ${s.setting === 'field' ? 'In the field' : s.setting === 'ed' ? 'In the ED' : 'Reasoning'}</div><h1>${esc(s.title)}</h1></div></div><div class="sc-steps" id="dots"></div><div id="sstage"></div></div>`);
    view.appendChild(el);
    const stage = $('#sstage', el);
    function dots() { $('#dots', el).innerHTML = s.steps.map((st, i) => { const p = path.find((x) => x.step === st.id); return '<i class="' + (p ? 's' + p.score : (cur && cur.id === st.id ? 'now' : '')) + '"></i>'; }).join(''); }
    function vitalsHTML(v) {
      if (!v) return '';
      const items = [['hr', 'HR', v.hr], ['bp', 'NIBP', v.bp], ['rr', 'RR', v.rr], ['spo2', 'SpO2', v.spo2 != null ? v.spo2 + '%' : null], ['temp', 'Temp', v.temp != null ? v.temp + '°' : null], ['gcs', 'GCS', v.gcs], ['glucose', 'BGL', v.glucose], ['etco2', 'EtCO2', v.etco2]].filter((x) => x[2] != null && x[2] !== '');
      return '<div class="monitor">' + items.map(([k, lab, val]) => `<div class="v ${k}"><span>${lab}</span><b>${esc(String(val))}</b></div>`).join('') + '</div>';
    }
    function intro() {
      cur = null; dots();
      stage.innerHTML = `<div class="sc-step"><div class="eyebrow accent">Briefing</div><div class="prose" style="margin-top:8px">${MD.render(s.intro)}</div><div class="btn-row" style="margin-top:18px"><button class="btn primary lg" id="begin">Begin</button></div></div>`;
      $('#begin', stage).onclick = () => go(s.steps[0].id);
    }
    function go(stepId) {
      if (stepId === 'end') return debrief();
      cur = steps.get(stepId); dots();
      stage.innerHTML = `<div class="sc-step"><div class="eyebrow accent">Decision ${path.length + 1}</div><div class="prose" style="margin-top:8px">${MD.render(cur.prompt)}</div>${vitalsHTML(cur.vitals)}<div class="choices" id="sc-choices">${cur.choices.map((c, i) => `<button class="choice" data-i="${i}"><span class="key">${KEYS[i]}</span><span>${MD.inline(c.text)}</span></button>`).join('')}</div><div id="fb"></div></div>`;
      stage.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const c = cur.choices[+b.dataset.i];
        stage.querySelectorAll('.choice').forEach((x) => { x.disabled = true; x.classList.remove('picked'); });
        b.classList.add(c.score === 1 ? 'right' : c.score === 0 ? 'picked' : 'wrong');
        path.push({ step: cur.id, choice: +b.dataset.i, score: c.score }); score += c.score; dots();
        $('#fb', stage).innerHTML = `<div class="sc-feedback s${c.score}"><span class="label">${c.score === 1 ? 'Best move' : c.score === 0 ? 'Acceptable, not ideal' : 'Harmful'}</span>${MD.inline(c.feedback)}</div><div class="btn-row" style="margin-top:14px"><button class="btn primary" id="cont">${c.next === 'end' ? 'Debrief' : 'Continue'}</button></div>`;
        $('#cont', stage).onclick = () => { go(c.next); window.scrollTo(0, 0); };
      });
    }
    function debrief() {
      cur = null; dots();
      const max = path.length; const pct = Math.max(0, Math.round(((score + max) / (2 * max)) * 100));
      const rec = S.scenarios[id] = S.scenarios[id] || { runs: 0, best: 0 }; rec.runs++; rec.best = Math.max(rec.best, pct); Store.bump('scen'); Store.save(true);
      stage.innerHTML = `<div class="sc-step"><div class="result-head"><div class="eyebrow">Debrief</div><b class="num" style="color:${pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}">${pct}%</b><div class="sub">${path.filter((p) => p.score === 1).length} best moves, ${path.filter((p) => p.score === 0).length} acceptable, ${path.filter((p) => p.score === -1).length} harmful</div></div><div class="prose">${MD.render(s.debrief)}</div><div class="btn-row" style="margin-top:18px"><a class="btn primary" href="#/scenario/${id}">Run again</a><a class="btn" href="#/module/${m.id}">Module</a><a class="btn" href="#/practice">Practice</a></div></div>`;
    }
    intro();
  });

  // ---------- Drills ----------
  route('/drill/:id', (id) => {
    if (id === 'leads12') return drillLeads();
    if (id === 'monitor') return drillMonitor();
    view.appendChild(h('<div class="empty">Drill not found.</div>'));
  });
  function drillLeads() {
    // Torso in a 400x520 box. Targets in SVG units.
    const T = [
      ['RA', 'Right arm (or right shoulder)', 62, 150, 'limb'], ['LA', 'Left arm (or left shoulder)', 338, 150, 'limb'],
      ['V1', '4th intercostal space, right sternal border', 184, 262], ['V2', '4th intercostal space, left sternal border', 216, 262],
      ['V4', '5th intercostal space, midclavicular line', 262, 300], ['V3', 'Halfway between V2 and V4', 239, 281],
      ['V5', 'Anterior axillary line, level with V4', 296, 300], ['V6', 'Midaxillary line, level with V4', 328, 300],
      ['RL', 'Right leg (or right lower abdomen)', 150, 470, 'limb'], ['LL', 'Left leg (or left lower abdomen)', 250, 470, 'limb'],
    ];
    let i = 0; const placed = []; let revealed = false;
    const el = h(`<div>${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow accent">Drill</div><h1>12-lead placement</h1><p class="lede">Tap (or use the Pencil) where each electrode goes. Within about a finger-width counts.</p></div></div>
      <div class="drill-wrap"><div class="card"><div class="torso" id="torso">
        <svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="skin" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="currentColor" opacity=".15"/></pattern></defs>
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".85">
            <circle cx="200" cy="52" r="34"/>
            <path d="M178 84 v22 M222 84 v22"/>
            <path d="M178 106 C 140 112, 96 126, 78 150 L 44 300 L 78 306 L 96 232 L 96 410 Q 96 440, 120 446 L 150 450 L 150 500 M 250 500 L 250 450 L 280 446 Q 304 440, 304 410 L 304 232 L 322 306 L 356 300 L 322 150 C 304 126, 260 112, 222 106"/>
            <path d="M150 500 h100" />
          </g>
          <g stroke="currentColor" stroke-width="1.2" opacity=".35" fill="none">
            <path d="M120 150 Q 200 176 280 150" />
            <path d="M200 176 v130" />
            <path d="M172 224 q 28 8 56 0 M164 250 q 36 12 72 0 M158 276 q 42 14 84 0 M156 302 q 44 16 88 0 M158 328 q 42 14 84 0" />
            <path d="M262 150 v 250" stroke-dasharray="4 5" /><path d="M296 176 v 224" stroke-dasharray="4 5" /><path d="M328 190 v 210" stroke-dasharray="4 5" />
            <circle cx="200" cy="184" r="4" fill="currentColor" opacity=".6"/>
          </g>
          <text x="200" y="200" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6" font-family="IBM Plex Mono, monospace">angle of Louis</text>
          <text x="262" y="146" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">MCL</text>
          <text x="296" y="172" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">AAL</text>
          <text x="328" y="186" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">MAL</text>
          <g id="targets"></g><g id="marks"></g>
        </svg></div>
        <div class="btn-row" style="margin-top:12px"><button class="btn" id="undo">Undo</button><button class="btn" id="reveal">Reveal answers</button><button class="btn primary" id="restart">Restart</button></div></div>
        <div class="card drill-legend" id="legend"></div></div></div>`);
    view.appendChild(el);
    const svg = $('svg', el); const marks = $('#marks', svg); const targets = $('#targets', svg); const legend = $('#legend', el);
    function renderLegend() {
      legend.innerHTML = '<div class="eyebrow" style="margin-bottom:4px">Place, in order</div>' + T.map((t, k) => { const p = placed[k]; return `<div class="item ${k === i && !revealed ? 'now' : ''} ${p ? (p.ok ? 'ok' : 'miss') : ''}"><span class="k">${t[0]}</span><span class="small">${esc(t[1])}</span></div>`; }).join('') + (placed.length === T.length ? `<div class="stat" style="margin-top:8px"><b class="num">${Math.round((placed.filter((p) => p.ok).length / T.length) * 100)}%</b><span>${placed.filter((p) => p.ok).length} of ${T.length} within range</span></div>` : '');
    }
    function draw() {
      marks.innerHTML = placed.map((p, k) => `<g><circle cx="${p.x}" cy="${p.y}" r="11" fill="${p.ok ? 'var(--good)' : 'var(--bad)'}" opacity=".9"/><text x="${p.x}" y="${p.y + 3.5}" font-size="9" font-weight="600" text-anchor="middle" fill="#fff" font-family="IBM Plex Mono, monospace">${T[k][0]}</text></g>`).join('');
      targets.innerHTML = revealed ? T.map((t) => `<g><circle cx="${t[2]}" cy="${t[3]}" r="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 3"/><text x="${t[2]}" y="${t[3] + 3.5}" font-size="9" text-anchor="middle" fill="var(--accent)" font-family="IBM Plex Mono, monospace">${t[0]}</text></g>`).join('') : '';
      renderLegend();
    }
    function pt(e) { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 400, ((e.clientY - r.top) / r.height) * 520]; }
    svg.addEventListener('pointerdown', (e) => {
      if (i >= T.length) return; e.preventDefault();
      const [x, y] = pt(e); const t = T[i]; const d = Math.hypot(x - t[2], y - t[3]);
      placed.push({ x, y, ok: d <= (t[4] === 'limb' ? 40 : 18) }); i++;
      if (i === T.length) { const pct = Math.round((placed.filter((p) => p.ok).length / T.length) * 100); const rec = S.drills.leads12 = S.drills.leads12 || { runs: 0, best: 0 }; rec.runs++; rec.best = Math.max(rec.best, pct); Store.bump('scen'); Store.save(true); revealed = true; }
      draw();
    });
    $('#undo', el).onclick = () => { if (placed.length && !revealed) { placed.pop(); i--; draw(); } };
    $('#reveal', el).onclick = () => { revealed = true; draw(); };
    $('#restart', el).onclick = () => { placed.length = 0; i = 0; revealed = false; draw(); };
    draw();
  }
  function drillMonitor() {
    const CASES = [
      { v: { hr: 118, bp: '84/50', rr: 26, spo2: 92 }, sick: true, why: 'Tachycardia with hypotension and a shock index over 1 (118/84). Tachypnea and borderline SpO2 on top. This is shock until proven otherwise.' },
      { v: { hr: 72, bp: '126/78', rr: 14, spo2: 98 }, sick: false, why: 'Every value sits inside the adult normal range. Nothing here says sick on its own.' },
      { v: { hr: 48, bp: '78/40', rr: 10, spo2: 90 }, sick: true, why: 'Bradycardia with hypotension, slow breathing and low SpO2. Symptomatic bradycardia or a toxic ingestion; either way, sick.' },
      { v: { hr: 96, bp: '142/90', rr: 18, spo2: 96 }, sick: false, why: 'Mild tachycardia and a slightly high BP are common with pain or anxiety. Not reassuring forever, but not sick on these numbers alone.' },
      { v: { hr: 132, bp: '110/70', rr: 30, spo2: 88 }, sick: true, why: 'SpO2 of 88 with a respiratory rate of 30 is respiratory distress. The normal BP is compensation, not comfort.' },
      { v: { hr: 58, bp: '118/72', rr: 12, spo2: 99 }, sick: false, why: 'A resting rate of 58 in a calm adult with a normal pressure is often a fit or beta-blocked heart. Fine unless symptomatic.' },
      { v: { hr: 104, bp: '96/60', rr: 22, spo2: 95, temp: 39.2 }, sick: true, why: 'Fever, heart rate over 90, respiratory rate over 20, borderline pressure. This screens positive for sepsis. Treat it as a clock that is already running.' },
      { v: { hr: 88, bp: '134/84', rr: 16, spo2: 97, gcs: 15 }, sick: false, why: 'Normal set with a full GCS. Vitals are not the whole story, but nothing here is a life threat.' },
      { v: { hr: 64, bp: '188/112', rr: 14, spo2: 97, gcs: 13 }, sick: true, why: 'Very high pressure with a relatively slow heart and a dropping GCS is Cushing pattern territory. Think rising intracranial pressure.' },
      { v: { hr: 150, bp: '102/66', rr: 20, spo2: 97 }, sick: true, why: 'A regular rate of 150 is a rhythm question until proven otherwise (SVT, flutter with 2:1 block). Stable now, but this patient needs a monitor and a 12-lead now.' },
    ];
    let i = 0, right = 0; const order = shuffle(CASES.slice());
    const el = h(`<div class="quiz">${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow accent">Drill</div><h1>Read the monitor</h1><p class="lede">Adult patient. Sick or not sick from the numbers alone. Ten rounds.</p></div></div><div id="mstage"></div></div>`);
    view.appendChild(el); const stage = $('#mstage', el);
    function render() {
      if (i >= order.length) { const pct = Math.round((right / order.length) * 100); const rec = S.drills.monitor = S.drills.monitor || { runs: 0, best: 0 }; rec.runs++; rec.best = Math.max(rec.best, pct); Store.bump('scen'); Store.save(true); stage.innerHTML = `<div class="card result-head"><b class="num">${pct}%</b><div class="sub">${right} of ${order.length}</div><div class="btn-row" style="justify-content:center;margin-top:14px"><a class="btn primary" href="#/drill/monitor">Again</a><a class="btn" href="#/practice">Practice</a></div></div>`; return; }
      const c = order[i];
      const v = c.v; const items = [['hr', 'HR', v.hr], ['bp', 'NIBP', v.bp], ['rr', 'RR', v.rr], ['spo2', 'SpO2', v.spo2 + '%'], ['temp', 'Temp', v.temp != null ? v.temp + '°' : null], ['gcs', 'GCS', v.gcs]].filter((x) => x[2] != null);
      stage.innerHTML = `<div class="qcard"><div class="eyebrow">Round ${i + 1} of ${order.length}</div><div class="monitor" style="margin-top:10px">${items.map(([k, lab, val]) => `<div class="v ${k}"><span>${lab}</span><b>${esc(String(val))}</b></div>`).join('')}</div><div class="btn-row"><button class="btn lg" id="ok" style="flex:1;border-color:var(--good);color:var(--good)">Not sick</button><button class="btn lg" id="sick" style="flex:1;border-color:var(--bad);color:var(--bad)">Sick</button></div><div class="why" id="mwhy" hidden></div><div class="qnav" id="mnav" hidden><span></span><button class="btn primary" id="mnext">Next</button></div></div>`;
      const answer = (sick) => { const ok = sick === c.sick; if (ok) right++; const w = $('#mwhy', stage); w.hidden = false; w.className = 'why ' + (ok ? 'ok' : 'no'); w.innerHTML = (ok ? '<strong>Right.</strong> ' : '<strong>No.</strong> ') + esc(c.why); $('#ok', stage).disabled = $('#sick', stage).disabled = true; $('#mnav', stage).hidden = false; $('#mnext', stage).onclick = () => { i++; render(); }; };
      $('#ok', stage).onclick = () => answer(false); $('#sick', stage).onclick = () => answer(true);
    }
    render();
  }

  // ---------- Reference ----------
  const GROUP_NAMES = { assessment: 'Assessment', airway: 'Airway', cardiac: 'Cardiac', trauma: 'Trauma', meds: 'Medications', labs: 'Labs', ecg: 'ECG', ed: 'ED', terms: 'Terminology', exam: 'Exam' };
  route('/ref', (params) => {
    const sheets = [...REF.values()];
    const groups = [...new Set(sheets.map((s) => s.group))];
    let g = params.g || 'all';
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Pocket cards</div><h1>Reference</h1><p class="lede">The numbers you need at the bedside, in table form. Search or browse by group.</p></div>
      <form class="search" id="rsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="rq" placeholder="Search sheets" autocapitalize="off" enterkeyhint="search"></form></div>
      <div class="ref-groups" id="groups"></div><div class="grid" id="sheets"></div></div>`);
    view.appendChild(el);
    const gw = $('#groups', el); const list = $('#sheets', el);
    function render() {
      gw.innerHTML = ['all', ...groups].map((k) => `<button class="opt ${g === k ? 'on' : ''}" data-g="${k}">${k === 'all' ? 'All' : esc(GROUP_NAMES[k] || k)}</button>`).join('');
      gw.querySelectorAll('.opt').forEach((b) => b.onclick = () => { g = b.dataset.g; render(); });
      const q = $('#rq', el).value.trim().toLowerCase();
      const shown = sheets.filter((s) => (g === 'all' || s.group === g) && (!q || s.title.toLowerCase().includes(q) || s.tags.join(' ').toLowerCase().includes(q) || s.body.toLowerCase().includes(q)));
      list.innerHTML = shown.length ? shown.map((s) => `<a class="card link" href="#/ref/${s.id}"><div class="eyebrow accent">${esc(GROUP_NAMES[s.group] || s.group)}</div><h3 style="margin-top:6px">${esc(s.title)}</h3><div class="row" style="margin-top:10px">${s.tags.slice(0, 4).map((t) => '<span class="chip">' + esc(t) + '</span>').join('')}</div></a>`).join('') : '<div class="empty">No sheets match.</div>';
    }
    $('#rq', el).addEventListener('input', render);
    $('#rsearch', el).addEventListener('submit', (e) => e.preventDefault());
    render();
  });
  route('/ref/:id', (id) => {
    const s = REF.get(id); if (!s) { view.appendChild(h('<div class="empty">Sheet not found.</div>')); return; }
    view.appendChild(h(`<div class="ref-sheet lesson">${backLink('#/ref', 'Reference')}<div class="page-head"><div><div class="eyebrow accent">${esc(GROUP_NAMES[s.group] || s.group)}</div><h1>${esc(s.title)}</h1></div></div><article class="prose">${MD.render(s.body)}</article></div>`));
  });

  // ---------- Search ----------
  route('/search', (params) => {
    const q = (params.q || '').trim(); const ql = q.toLowerCase();
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Search</div><h1>${q ? esc(q) : 'Search'}</h1></div>
      <form class="search" id="sf"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="sq" value="${esc(q)}" placeholder="Search" autocapitalize="off" enterkeyhint="search"></form></div><div id="results" class="stack"></div></div>`);
    view.appendChild(el);
    $('#sf', el).addEventListener('submit', (e) => { e.preventDefault(); const v = $('#sq', el).value.trim(); if (v) location.hash = '#/search?q=' + encodeURIComponent(v); });
    if (!ql) return;
    const res = $('#results', el);
    const lessons = [], cards = [], sheets = [];
    for (const m of orderedModules) { for (const l of m.lessons) if (l.title.toLowerCase().includes(ql) || l.body.toLowerCase().includes(ql)) lessons.push({ l, m }); for (const c of m.cards) if (c.front.toLowerCase().includes(ql) || c.back.toLowerCase().includes(ql)) cards.push({ c, m }); }
    for (const s of REF.values()) if (s.title.toLowerCase().includes(ql) || s.body.toLowerCase().includes(ql) || s.tags.join(' ').toLowerCase().includes(ql)) sheets.push(s);
    const snippet = (text) => { const i = text.toLowerCase().indexOf(ql); const start = Math.max(0, i - 60); const s = text.slice(start, i + 90).replace(/[#*>`|]/g, ''); return (start ? '…' : '') + esc(s) + '…'; };
    if (!lessons.length && !cards.length && !sheets.length) { res.innerHTML = '<div class="empty">Nothing found.</div>'; return; }
    if (lessons.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Lessons · ${lessons.length}</div><div class="list">${lessons.slice(0, 30).map(({ l, m }) => `<a class="list-item" href="#/lesson/${l.id}"><span class="grow"><span class="title">${esc(l.title)}</span><span class="sub">${esc(m.title)} · ${snippet(l.body)}</span></span>${chev}</a>`).join('')}</div></div>`));
    if (sheets.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Reference · ${sheets.length}</div><div class="list">${sheets.map((s) => `<a class="list-item" href="#/ref/${s.id}"><span class="grow"><span class="title">${esc(s.title)}</span><span class="sub">${snippet(s.body)}</span></span>${chev}</a>`).join('')}</div></div>`));
    if (cards.length) res.appendChild(h(`<div class="card"><div class="eyebrow">Cards · ${cards.length}</div><div class="list">${cards.slice(0, 40).map(({ c, m }) => `<div class="list-item"><span class="grow"><span class="title">${MD.inline(c.front)}</span><span class="sub">${MD.inline(c.back)}</span></span></div>`).join('')}</div></div>`));
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
      ['emt-nj', 'Apply for NJ EMT certification', 'NJ Office of EMS: application, background check, CPR card, fees.'],
    ] },
    { id: 'ed', title: 'ED technician job', when: 'Right after the card', text: 'The job that pays, teaches, and counts as patient-care experience for PA applications.', tasks: [
      ['ed-track', 'Finish the ED Tech track here', 'Triage, ECG, phlebotomy, procedures, monitoring, presentations, safety.'],
      ['ed-drills', 'Score 100% on the 12-lead placement drill twice', 'Practice tab. Placement is the single most-asked tech skill.'],
      ['ed-apply', 'Apply to ED tech / patient care tech postings', 'Search "ED technician", "ER tech", "patient care technician emergency". EMT-B plus BLS is the usual ask.'],
      ['ed-hired', 'Start in the department', 'Then give notice and leave retail for good.'],
      ['ed-log', 'Start the de-identified case log on shift one', 'Chief complaint, workup, dispo, one thing learned. This becomes PCE evidence and interview material.'],
      ['ed-hours', 'Track PCE hours from day one', 'A 36-hour week for a year is about 1,700 hours. Most competitive applicants show 1,000 to 3,000.'],
    ] },
    { id: 'degree', title: 'Bachelor\'s degree and prerequisites', when: 'In parallel, 2–4 years', text: 'Nearly every PA program requires a completed bachelor\'s. Prerequisites can be folded into it. Do this while working, not instead of working.', tasks: [
      ['deg-transcripts', 'Pull transcripts from every prior school', 'Prior credits transfer more often than people expect.'],
      ['deg-plan', 'Pick a degree path that contains the PA prereqs', 'Health sciences or biology at a state school or online. Community college for the early science courses is the cheap route.'],
      ['deg-prereqs', 'Complete the core prerequisites', 'A&P I and II with lab, microbiology with lab, general chemistry I and II, organic or biochemistry, statistics, psychology, medical terminology.'],
      ['deg-gpa', 'Keep the science GPA at 3.5 or better', 'Programs compute it separately. An upward trend matters.'],
      ['deg-prepa', 'Finish the Pre-PA track here', 'A&P, pharm, patho, labs, ECG reading, clinical reasoning. Use it as the study layer under the courses.'],
      ['deg-done', 'Graduate', ''],
    ] },
    { id: 'apply', title: 'PA school application', when: 'The spring before you want to start', text: 'CASPA opens in late April. Early, complete, verified applications win rolling admissions.', tasks: [
      ['app-shadow', 'Shadow PAs, 40+ hours', 'Ask the PAs in your own ED. Log dates and hours.'],
      ['app-lor', 'Line up 3–5 recommenders', 'A PA, a supervisor, a science professor. Ask months ahead.'],
      ['app-test', 'Take the GRE or PA-CAT if your target programs require it', 'Many programs are test-optional now. Check each one.'],
      ['app-ps', 'Write the personal statement', '5,000 characters. Specific patients, specific moments, why PA and not MD or NP.'],
      ['app-programs', 'Build a list of 8–12 programs that fit your prereqs and hours', 'PANCE pass rate, attrition, cost, location, mission.'],
      ['app-submit', 'Submit CASPA in May or June', 'Verification takes weeks. Do not wait for the deadline.'],
      ['app-interview', 'Interviews', 'MMI or traditional. Practice the ethics scenarios and the one-liner about yourself.'],
      ['app-accept', 'Accept an offer', 'Then start reading everything about the didactic year.'],
    ] },
  ];
  route('/path', () => {
    const el = h(`<div class="path"><div class="page-head"><div><div class="eyebrow">Roadmap</div><h1>The path</h1><p class="lede">EMT card, ED tech job, degree with prerequisites, then the PA application. Tap a task to check it off. Stages overlap on purpose.</p></div></div><div id="stages"></div></div>`);
    const wrap = $('#stages', el);
    function render() {
      wrap.innerHTML = '';
      let activeSet = false;
      PATH.forEach((st) => {
        const done = st.tasks.filter((t) => S.path[t[0]]).length; const all = done === st.tasks.length;
        const active = !all && !activeSet; if (active) activeSet = true;
        wrap.appendChild(h(`<section class="stage ${all ? 'done' : active ? 'active' : ''}"><div class="when">${esc(st.when)} · ${done}/${st.tasks.length}</div><h2>${esc(st.title)}</h2><p>${esc(st.text)}</p><div class="tasks">${st.tasks.map((t) => `<div class="task ${S.path[t[0]] ? 'done' : ''}" data-id="${t[0]}"><span class="box">${S.path[t[0]] ? '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><span><span class="t">${esc(t[1])}</span>${t[2] ? '<div class="sub">' + esc(t[2]) + '</div>' : ''}</span></div>`).join('')}</div></section>`));
      });
      wrap.querySelectorAll('.task').forEach((t) => t.onclick = () => { const id = t.dataset.id; if (S.path[id]) delete S.path[id]; else S.path[id] = Date.now(); Store.save(); render(); });
    }
    render(); view.appendChild(el);
  });

  // ---------- Settings ----------
  route('/settings', () => {
    const el = h(`<div class="settings"><div class="page-head"><div><div class="eyebrow">Rounds</div><h1>Settings</h1></div></div>
      <div class="card"><div class="eyebrow">Appearance</div><div class="seg" style="margin-top:10px" id="theme">${['system', 'light', 'dark'].map((t) => `<button data-t="${t}" class="${S.settings.theme === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
      <div class="card"><div class="eyebrow">Review</div>
        <div class="field" style="margin-top:10px"><label>New cards per day</label><div class="seg" id="dn">${[10, 20, 30, 50, 100].map((n) => `<button data-n="${n}" class="${S.settings.dailyNew === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
        <p class="faint small" style="margin-top:8px">Twenty a day is sustainable. Fifty or more is for exam week.</p></div>
      <div class="card"><div class="eyebrow">Apple Pencil</div>
        <div class="stack" style="margin-top:10px">
          <label class="task ${S.settings.penOnly ? 'done' : ''}" id="penonly"><span class="box">${S.settings.penOnly ? '✓' : ''}</span><span><span class="t" style="text-decoration:none;color:inherit">Pencil only draws, fingers scroll</span><div class="sub">Off lets a finger draw too. Palm rejection stays on either way.</div></span></label>
          <label class="task ${S.settings.autoInk ? 'done' : ''}" id="autoink"><span class="box">${S.settings.autoInk ? '✓' : ''}</span><span><span class="t" style="text-decoration:none;color:inherit">Touching a lesson with the Pencil opens notes</span><div class="sub">Otherwise use the Notes button on each lesson.</div></span></label>
        </div></div>
      <div class="card"><div class="eyebrow">Progress</div>
        <div class="btn-row" style="margin-top:10px"><button class="btn" id="export">Export progress</button><button class="btn" id="import">Import</button><button class="btn danger" id="reset">Reset everything</button></div>
        <textarea id="io" hidden placeholder="Paste a Rounds progress export here" style="margin-top:10px"></textarea>
        <div class="btn-row" id="io-actions" hidden style="margin-top:10px"><button class="btn primary" id="io-apply">Apply import</button><button class="btn" id="io-cancel">Cancel</button></div>
        <p class="faint small" style="margin-top:10px">Progress lives on this device. Export before switching iPads. Pencil notes are not included in the export.</p></div>
      <div class="card"><div class="eyebrow">About</div><p class="small muted" style="margin-top:8px">Rounds · content ${esc(String(C.version || 'dev'))} · build ${esc(document.getElementById('app').dataset.build || 'dev')}<br>${orderedModules.length} modules · ${LESSON.size} lessons · ${CARD.size} cards · ${Q.size} questions · ${SCEN.size} scenarios · ${REF.size} reference sheets</p>
        <div class="btn-row" style="margin-top:10px"><button class="btn sm" id="update">Check for updates</button></div></div></div>`);
    view.appendChild(el);
    $('#theme', el).querySelectorAll('button').forEach((b) => b.onclick = () => { S.settings.theme = b.dataset.t; Store.save(); applyTheme(); $('#theme', el).querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); });
    $('#dn', el).querySelectorAll('button').forEach((b) => b.onclick = () => { S.settings.dailyNew = +b.dataset.n; Store.save(); $('#dn', el).querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); updateBadge(); });
    const tog = (id, key) => { $('#' + id, el).onclick = () => { S.settings[key] = !S.settings[key]; Store.save(); const t = $('#' + id, el); t.classList.toggle('done', S.settings[key]); $('.box', t).textContent = S.settings[key] ? '✓' : ''; }; };
    tog('penonly', 'penOnly'); tog('autoink', 'autoInk');
    const io = $('#io', el), ioA = $('#io-actions', el);
    $('#export', el).onclick = async () => {
      const json = Store.exportJSON(); const name = 'rounds-progress-' + Store.today() + '.json';
      try { const file = new File([json], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Rounds progress' }); return; } } catch (e) { /* fall through */ }
      io.hidden = false; io.value = json; io.select(); ioA.hidden = true; toast('Copy the text below to save it.');
    };
    $('#import', el).onclick = () => { io.hidden = false; io.value = ''; ioA.hidden = false; io.focus(); };
    $('#io-cancel', el).onclick = () => { io.hidden = true; ioA.hidden = true; };
    $('#io-apply', el).onclick = () => { try { Store.importJSON(io.value); toast('Progress imported.'); location.reload(); } catch (e) { toast('That is not a Rounds progress file.'); } };
    $('#reset', el).onclick = () => { if (confirm('Erase all progress and Pencil notes on this device?')) { Store.reset(); Store.inkClear().then(() => location.reload()); } };
    $('#update', el).onclick = async () => { if (!('serviceWorker' in navigator)) return toast('Offline mode is not available in this browser.'); const r = await navigator.serviceWorker.getRegistration(); if (!r) return toast('Not installed for offline yet.'); await r.update(); toast('Checked. If a new version exists it will load on the next open.'); };
  });

  // ---------- Boot ----------
  applyTheme();
  if (!C.modules.length) view.innerHTML = '<div class="empty">No content bundle loaded. Run the build.</div>';
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
