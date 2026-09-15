/* Rounds — career layer: CASPA hours log, mistake log with its own review schedule, science GPA, degree planner, not-on-shift page. */
(window.ROUNDS_EXT = window.ROUNDS_EXT || []).push(function (A) {
  const { route, h, esc, show, stale, S, save, toast, backLink, MD } = A;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const fmtDate = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${m}/${dd}/${y.slice(2)}`; };
  const num = (n, d = 1) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toString();
  const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const shareText = async (text, name, type = 'text/plain') => { try { const file = new File([text], name, { type }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; } } catch (e) { /* fall through */ } try { await navigator.clipboard.writeText(text); toast('Copied to the clipboard.'); return true; } catch (e) { return false; } };

  // ---------- Hub ----------
  route('/career', (params, token) => {
    const pce = S.hours.filter((x) => x.kind === 'pce').reduce((a, x) => a + (+x.hours || 0), 0);
    const sh = S.hours.filter((x) => x.kind === 'shadow').reduce((a, x) => a + (+x.hours || 0), 0);
    const due = S.mistakes.filter((m) => m.srs && SRS.isDue(m.srs)).length;
    const g = gpa(S.courses);
    const el = h(`<div><div class="page-head"><div><div class="eyebrow">Career</div><h1>The application, kept current</h1><p class="lede">Everything CASPA will ask for, logged as it happens instead of reconstructed two years later.</p></div></div>
      <div class="grid">
        <a class="card link" href="#/hours"><div class="eyebrow accent">Hours</div><h2 style="margin-top:6px"><span class="num">${num(pce, 1)}</span> patient care · <span class="num">${num(sh, 1)}</span> shadowing</h2><p class="muted small" style="margin-top:6px">Date, employer, role, hours, supervisor and contact. Exactly what CASPA verifies.</p></a>
        <a class="card link" href="#/mistakes"><div class="eyebrow accent">Mistake log</div><h2 style="margin-top:6px">${S.mistakes.length} logged${due ? ` · <span style="color:var(--warn)">${due} due</span>` : ''}</h2><p class="muted small" style="margin-top:6px">Every miss with its correction, reviewed on its own schedule.</p></a>
        <a class="card link" href="#/gpa"><div class="eyebrow accent">Science GPA</div><h2 style="margin-top:6px">${g.sciCredits ? `<span class="num">${num(g.sci, 2)}</span> sGPA · <span class="num">${num(g.all, 2)}</span> overall` : 'No courses yet'}</h2><p class="muted small" style="margin-top:6px">CASPA's math, live: every attempt counts, nothing gets replaced.</p></a>
        <a class="card link" href="#/degree"><div class="eyebrow accent">Degree planner</div><h2 style="margin-top:6px">${degreeSummary()}</h2><p class="muted small" style="margin-top:6px">The TESU plan as a prerequisite chain with term slots. See what a dropped course does before you drop it.</p></a>
        <a class="card link" href="#/decompress"><div class="eyebrow accent">Not on shift</div><h2 style="margin-top:6px">Support lines and a private page</h2><p class="muted small" style="margin-top:6px">Peer support, crisis numbers, your own squad contacts, and a place to write down a bad call.</p></a>
      </div></div>`);
    show(el, token);
  });

  // ---------- Hours (CASPA) ----------
  const KINDS = { pce: 'Patient care (PCE)', shadow: 'Shadowing', hce: 'Health care experience (HCE)', volunteer: 'Volunteer' };
  route('/hours', (params, token) => {
    const kind = params.kind || 'pce';
    const last = [...S.hours].filter((x) => x.kind === kind).sort((a, b) => b.ts - a.ts)[0];
    const el = h(`<div>${backLink('#/career', 'Career')}<div class="page-head"><div><div class="eyebrow">Hours</div><h1>CASPA hours log</h1><p class="lede">CASPA wants each experience with dates, total hours, the employer, your title, and a supervisor who can verify it. Log every shift the day you work it.</p></div></div>
      <div class="seg" id="kinds" style="margin-bottom:16px">${Object.entries(KINDS).map(([k, v]) => `<button data-k="${k}" class="${k === kind ? 'on' : ''}">${v.split(' (')[0]}</button>`).join('')}</div>
      <div class="two-col">
        <div class="card"><div class="eyebrow">Log a shift · ${esc(KINDS[kind])}</div><form id="hf" class="stack" style="margin-top:12px;gap:10px">
          <div class="row"><div class="field" style="flex:1"><label>Date</label><input type="date" name="date" value="${todayISO()}" required></div><div class="field" style="width:110px"><label>Hours</label><input type="number" name="hours" step="0.25" min="0.25" max="24" inputmode="decimal" placeholder="12" required></div></div>
          <div class="field"><label>Employer or site</label><input type="text" name="employer" value="${esc(last?.employer || '')}" placeholder="Cooper University Hospital, Emergency Department" required autocapitalize="words"></div>
          <div class="field"><label>Your role or title</label><input type="text" name="role" value="${esc(last?.role || (kind === 'shadow' ? 'Shadowing student' : 'ED Technician'))}" required autocapitalize="words"></div>
          <div class="row"><div class="field" style="flex:1"><label>Supervisor name</label><input type="text" name="supervisor" value="${esc(last?.supervisor || '')}" placeholder="Charge nurse or PA you worked under" autocapitalize="words"></div><div class="field" style="flex:1"><label>Supervisor contact</label><input type="text" name="contact" value="${esc(last?.contact || '')}" placeholder="Work email or phone" autocapitalize="off"></div></div>
          <div class="field"><label>Notes (what you did, procedures, anything for the essay)</label><textarea name="notes" rows="2" placeholder="Triage vitals, 6 EKGs, 4 blood draws, splinted a wrist, one code."></textarea></div>
          <div class="btn-row"><button class="btn primary" type="submit">Log shift</button><button class="btn" type="button" id="export">Export CSV</button></div></form></div>
        <div class="stack" id="side"></div></div>
      <div class="card" style="margin-top:16px"><div class="eyebrow">Entries · ${esc(KINDS[kind])}</div><div id="list" class="stack" style="margin-top:10px;gap:6px"></div></div></div>`);
    if (!show(el, token)) return;
    el.querySelectorAll('#kinds button').forEach((b) => b.onclick = () => { location.hash = '#/hours?kind=' + b.dataset.k; });
    const rows = () => S.hours.filter((x) => x.kind === kind).sort((a, b) => (b.date + b.ts).localeCompare(a.date + a.ts));
    function renderSide() {
      const all = rows(); const total = all.reduce((a, x) => a + (+x.hours || 0), 0);
      const by = {}; all.forEach((x) => { const k = x.employer + ' · ' + x.role; by[k] = by[k] || { hours: 0, n: 0, first: x.date, last: x.date, sup: new Set() }; by[k].hours += +x.hours; by[k].n++; if (x.date < by[k].first) by[k].first = x.date; if (x.date > by[k].last) by[k].last = x.date; if (x.supervisor) by[k].sup.add(x.supervisor); });
      const side = el.querySelector('#side');
      side.innerHTML = `<div class="vitals-tile" style="padding:18px"><div class="eyebrow" style="color:#9ab">Total ${esc(KINDS[kind].split(' (')[0].toLowerCase())}</div><div class="num" style="font-size:44px;line-height:1.1;color:#7CFC9A">${num(total, 1)}</div><div class="small" style="color:#9ab">${all.length} entries${kind === 'pce' ? ' · most programs want 500 to 2,000+ PCE hours; check each program' : ''}</div></div>
        ${Object.entries(by).map(([k, v]) => `<div class="card"><div class="small" style="font-weight:600">${esc(k)}</div><div class="faint small">${fmtDate(v.first)} to ${fmtDate(v.last)} · ${v.n} shifts · <b class="num">${num(v.hours, 1)}</b> h${v.sup.size ? ' · ' + esc([...v.sup].join(', ')) : ''}</div></div>`).join('') || '<p class="faint small">Totals by employer show up here.</p>'}`;
    }
    function renderList() {
      const list = el.querySelector('#list'); const all = rows();
      list.innerHTML = all.length ? all.map((x) => `<div class="task" style="cursor:default"><span style="flex:1"><span class="t" style="text-decoration:none;color:inherit"><b class="num">${fmtDate(x.date)}</b> · ${esc(x.employer)} · ${esc(x.role)} · <b class="num">${num(+x.hours, 2)} h</b></span><div class="sub">${x.supervisor ? esc(x.supervisor) + (x.contact ? ' · ' + esc(x.contact) : '') : '<span style="color:var(--warn)">No supervisor recorded</span>'}${x.notes ? ' · ' + esc(x.notes) : ''}</div></span><button class="btn sm subtle" data-del="${x.id}">Delete</button></div>`).join('') : '<p class="faint small">Nothing logged yet. The first entry is the hardest one.</p>';
      list.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (!confirm('Delete this entry?')) return; S.hours = S.hours.filter((x) => x.id !== b.dataset.del); save(); renderList(); renderSide(); });
    }
    el.querySelector('#hf').onsubmit = (e) => {
      e.preventDefault(); const f = new FormData(e.target); const o = Object.fromEntries(f.entries());
      if (!o.supervisor && !confirm('No supervisor name. CASPA needs one to verify this. Log it anyway?')) return;
      S.hours.push({ id: uid(), ts: Date.now(), kind, date: o.date, employer: o.employer.trim(), role: o.role.trim(), hours: +o.hours, supervisor: o.supervisor.trim(), contact: o.contact.trim(), notes: o.notes.trim() }); save();
      e.target.hours.value = ''; e.target.notes.value = ''; toast('Logged ' + o.hours + ' hours.'); renderList(); renderSide();
    };
    el.querySelector('#export').onclick = () => {
      const all = [...S.hours].sort((a, b) => a.date.localeCompare(b.date));
      const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
      const csv = ['kind,date,employer,role,hours,supervisor,contact,notes', ...all.map((x) => [KINDS[x.kind] || x.kind, x.date, x.employer, x.role, x.hours, x.supervisor, x.contact, x.notes].map(q).join(','))].join('\n');
      shareText(csv, 'caspa-hours-' + todayISO() + '.csv', 'text/csv');
    };
    renderSide(); renderList();
  });

  // ---------- Mistake log ----------
  const SOURCES = ['app scenario', 'quiz', 'class lab', 'ride-along', 'real call', 'ED shift', 'sim'];
  route('/mistakes', (params, token) => {
    const el = h(`<div>${backLink('#/career', 'Career')}<div class="page-head"><div><div class="eyebrow">Mistake log</div><h1>What I got wrong, and the fix</h1><p class="lede">Each entry becomes a card on its own review schedule. You learn faster from your own misses than from anyone's lesson.</p></div><a class="btn primary" href="#/mistakes/review" id="rev">Review due</a></div>
      <div class="card"><div class="eyebrow">Log a miss</div><form id="mf" class="stack" style="margin-top:12px;gap:10px">
        <div class="field"><label>The miss (what you did or said)</label><input type="text" name="miss" value="${esc(params.miss || '')}" placeholder="Called a laceration an incision" required></div>
        <div class="field"><label>The correction (what it should have been, and why)</label><textarea name="fix" rows="2" placeholder="Laceration is a tear from blunt or shearing force; incision is a clean cut from a sharp edge. Different mechanism, different bleeding, different closure." required></textarea></div>
        <div class="row"><div class="field" style="flex:1"><label>Where it happened</label><select name="source">${SOURCES.map((s) => `<option ${(params.source || 'app scenario') === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div><div class="field" style="flex:1"><label>Tags (comma separated)</label><input type="text" name="tags" value="${esc(params.tags || '')}" placeholder="terminology, trauma"></div></div>
        <div class="btn-row"><button class="btn primary" type="submit">Log it</button></div></form></div>
      <div class="card" style="margin-top:16px"><div class="row" style="justify-content:space-between"><div class="eyebrow">Entries</div><div class="row" id="filters"></div></div><div id="list" class="stack" style="margin-top:10px;gap:6px"></div></div></div>`);
    if (!show(el, token)) return;
    let filter = '';
    function render() {
      const due = S.mistakes.filter((m) => m.srs && SRS.isDue(m.srs)).length; const fresh = S.mistakes.filter((m) => !m.srs || m.srs.state === 'new').length;
      el.querySelector('#rev').textContent = due + fresh ? `Review ${due + fresh}` : 'Nothing due';
      const tags = [...new Set(S.mistakes.flatMap((m) => m.tags || []))];
      el.querySelector('#filters').innerHTML = tags.map((t) => `<button class="chip ${filter === t ? 'accent' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('');
      el.querySelectorAll('#filters button').forEach((b) => b.onclick = () => { filter = filter === b.dataset.t ? '' : b.dataset.t; render(); });
      const rows = [...S.mistakes].filter((m) => !filter || (m.tags || []).includes(filter)).sort((a, b) => b.ts - a.ts);
      el.querySelector('#list').innerHTML = rows.length ? rows.map((m) => `<div class="task" style="cursor:default"><span style="flex:1"><span class="t" style="text-decoration:none;color:inherit"><b>${esc(m.miss)}</b></span><div class="sub" style="color:var(--ink-2)">${esc(m.fix)}</div><div class="sub">${esc(m.source)} · ${new Date(m.ts).toLocaleDateString()}${(m.tags || []).length ? ' · ' + m.tags.map(esc).join(', ') : ''} · ${m.srs && m.srs.state !== 'new' ? 'next ' + new Date(m.srs.due).toLocaleDateString() + (m.srs.lapses ? ' · ' + m.srs.lapses + ' lapses' : '') : 'not reviewed yet'}</div></span><button class="btn sm subtle" data-del="${m.id}">Delete</button></div>`).join('') : '<p class="faint small">Nothing here yet. Scenario debriefs and wrong quiz answers offer a one-tap "Log this miss."</p>';
      el.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (!confirm('Delete this entry?')) return; S.mistakes = S.mistakes.filter((x) => x.id !== b.dataset.del); save(); render(); });
    }
    el.querySelector('#mf').onsubmit = (e) => { e.preventDefault(); const o = Object.fromEntries(new FormData(e.target).entries()); addMistake({ miss: o.miss, fix: o.fix, source: o.source, tags: o.tags }); e.target.reset(); toast('Logged. It comes up for review tomorrow.'); render(); };
    render();
  });
  function addMistake({ miss, fix, source, tags }) {
    const rec = SRS.grade(SRS.fresh(), 1); // first review tomorrow-ish
    S.mistakes.push({ id: uid(), ts: Date.now(), miss: String(miss || '').trim(), fix: String(fix || '').trim(), source: source || 'app scenario', tags: String(tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean), srs: rec }); save();
  }
  A.addMistake = addMistake;
  route('/mistakes/review', (params, token) => {
    const queue = S.mistakes.filter((m) => !m.srs || m.srs.state === 'new' || SRS.isDue(m.srs)).sort((a, b) => (a.srs?.due || 0) - (b.srs?.due || 0));
    const el = h(`<div>${backLink('#/mistakes', 'Mistake log')}<div class="page-head"><div><div class="eyebrow">Review</div><h1>Your own misses</h1></div><span class="chip" id="left"></span></div><div id="stage"></div></div>`);
    if (!show(el, token)) return;
    let i = 0; const stage = el.querySelector('#stage');
    function render() {
      el.querySelector('#left').textContent = (queue.length - i) + ' left';
      if (i >= queue.length) { stage.innerHTML = `<div class="card"><div class="result-head"><div class="eyebrow">Done</div><b class="num" style="color:var(--good)">${queue.length}</b><div class="sub">misses reviewed</div></div><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/mistakes">Back to the log</a></div></div>`; return; }
      const m = queue[i];
      stage.innerHTML = `<div class="card"><div class="eyebrow">${esc(m.source)} · ${new Date(m.ts).toLocaleDateString()}</div><h2 style="margin-top:8px">${esc(m.miss)}</h2><p class="muted" style="margin-top:6px">What should it have been? Say it out loud, then reveal.</p><div class="btn-row" style="margin-top:14px"><button class="btn primary" id="reveal">Reveal</button></div><div id="ans" hidden style="margin-top:14px"><div class="why ok">${esc(m.fix)}</div><div class="grades" style="margin-top:14px"><button class="btn" data-g="0">Again</button><button class="btn" data-g="1">Hard</button><button class="btn primary" data-g="2">Got it</button><button class="btn" data-g="3">Easy</button></div></div></div>`;
      stage.querySelector('#reveal').onclick = () => { stage.querySelector('#ans').hidden = false; stage.querySelector('#reveal').hidden = true; };
      stage.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { m.srs = SRS.grade(m.srs || SRS.fresh(), +b.dataset.g); save(); i++; render(); });
    }
    render();
  });

  // ---------- Science GPA (CASPA) ----------
  const GRADES = { 'A+': 4, A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, 'C-': 1.7, 'D+': 1.3, D: 1, 'D-': 0.7, F: 0 };
  const CATS = { bio: 'Biology / Zoology', ichem: 'Inorganic (General) Chemistry', ochem: 'Organic Chemistry', biochem: 'Biochemistry', phys: 'Physics', osci: 'Other Science', math: 'Math', behav: 'Behavioral Science', eng: 'English', other: 'Other Non-Science' };
  const SCI = new Set(['bio', 'ichem', 'ochem', 'biochem', 'phys', 'osci']);
  function gpa(courses) {
    let sp = 0, sc = 0, ap = 0, ac = 0, np = 0, nc = 0;
    for (const c of courses) { const g = GRADES[c.grade]; if (g === undefined || c.grade === 'P' || !c.credits) continue; const cr = +c.credits; ap += g * cr; ac += cr; if (SCI.has(c.cat)) { sp += g * cr; sc += cr; } else { np += g * cr; nc += cr; } }
    return { all: ac ? ap / ac : 0, sci: sc ? sp / sc : 0, non: nc ? np / nc : 0, sciCredits: sc, credits: ac, nonCredits: nc };
  }
  route('/gpa', (params, token) => {
    const el = h(`<div>${backLink('#/career', 'Career')}<div class="page-head"><div><div class="eyebrow">Science GPA</div><h1>CASPA GPA, live</h1><p class="lede">CASPA recalculates every course you ever took on a 4.0 scale. Repeats count twice; nothing is replaced or forgiven. Watch the number move before you take a C lightly.</p></div></div>
      <div class="grid" id="tiles" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-bottom:16px"></div>
      <div class="two-col"><div class="card"><div class="eyebrow">Add a course</div><form id="cf" class="stack" style="margin-top:12px;gap:10px">
        <div class="field"><label>Course</label><input type="text" name="name" placeholder="CHE-1210 General Chemistry I" required></div>
        <div class="row"><div class="field" style="flex:1"><label>Term</label><input type="text" name="term" placeholder="Spring 2027"></div><div class="field" style="width:90px"><label>Credits</label><input type="number" name="credits" step="0.5" min="0.5" max="12" value="3" inputmode="decimal" required></div><div class="field" style="width:100px"><label>Grade</label><select name="grade">${Object.keys(GRADES).map((g) => `<option>${g}</option>`).join('')}<option value="IP">In progress</option></select></div></div>
        <div class="field"><label>CASPA category</label><select name="cat">${Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v}${SCI.has(k) ? ' (science)' : ''}</option>`).join('')}</select></div>
        <div class="btn-row"><button class="btn primary" type="submit">Add</button></div></form></div>
      <div class="card"><div class="eyebrow">What if</div><p class="small muted" style="margin-top:8px">Pick a grade for a planned science course and see where the sGPA lands.</p><div class="row" style="margin-top:10px"><div class="field" style="width:90px"><label>Credits</label><input type="number" id="wi-cr" value="4" step="0.5" inputmode="decimal"></div><div class="field" style="flex:1"><label>Grade</label><div class="seg" id="wi-g">${['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'].map((g) => `<button data-g="${g}" class="${g === 'B' ? 'on' : ''}">${g}</button>`).join('')}</div></div></div><div id="wi-out" class="small" style="margin-top:12px"></div></div></div>
      <div class="card" style="margin-top:16px"><div class="eyebrow">Courses</div><div id="list" class="stack" style="margin-top:10px;gap:6px"></div></div></div>`);
    if (!show(el, token)) return;
    let wiG = 'B';
    function render() {
      const g = gpa(S.courses);
      const tile = (label, val, sub, color) => `<div class="vitals-tile" style="padding:16px"><div class="eyebrow" style="color:#9ab">${label}</div><div class="num" style="font-size:40px;line-height:1.1;color:${color}">${val}</div><div class="small" style="color:#9ab">${sub}</div></div>`;
      const col = (x) => x >= 3.5 ? '#7CFC9A' : x >= 3.2 ? '#FFD84D' : '#FF6B6B';
      el.querySelector('#tiles').innerHTML = tile('Science GPA', g.sciCredits ? num(g.sci, 2) : '—', g.sciCredits + ' science credits', g.sciCredits ? col(g.sci) : '#9ab') + tile('Overall GPA', g.credits ? num(g.all, 2) : '—', g.credits + ' credits', g.credits ? col(g.all) : '#9ab') + tile('Non-science', g.nonCredits ? num(g.non, 2) : '—', g.nonCredits + ' credits', '#5AD8F0') + tile('Target', '3.5+', 'matriculant average sGPA is about 3.5', '#9ab');
      const rows = [...S.courses].sort((a, b) => (b.term || '').localeCompare(a.term || ''));
      el.querySelector('#list').innerHTML = rows.length ? rows.map((c) => `<div class="task" style="cursor:default"><span style="flex:1"><span class="t" style="text-decoration:none;color:inherit"><b>${esc(c.name)}</b> · <b class="num">${esc(c.grade)}</b> · ${c.credits} cr</span><div class="sub">${esc(CATS[c.cat] || c.cat)}${SCI.has(c.cat) ? ' · science' : ''}${c.term ? ' · ' + esc(c.term) : ''}</div></span><button class="btn sm subtle" data-del="${c.id}">Delete</button></div>`).join('') : '<p class="faint small">Add every college course you have ever taken, including the ERAU ones. CASPA will see all of them.</p>';
      el.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { S.courses = S.courses.filter((x) => x.id !== b.dataset.del); save(); render(); });
      const cr = +el.querySelector('#wi-cr').value || 0; const g2 = gpa([...S.courses, { credits: cr, grade: wiG, cat: 'bio' }]);
      el.querySelector('#wi-out').innerHTML = g.sciCredits || cr ? `A <b>${esc(wiG)}</b> in a ${cr}-credit science course: sGPA <b class="num">${num(g.sciCredits ? g.sci : 0, 2)}</b> → <b class="num" style="color:${col(g2.sci)}">${num(g2.sci, 2)}</b>, overall <b class="num">${num(g.all, 2)}</b> → <b class="num">${num(g2.all, 2)}</b>.` : '';
    }
    el.querySelector('#cf').onsubmit = (e) => { e.preventDefault(); const o = Object.fromEntries(new FormData(e.target).entries()); S.courses.push({ id: uid(), name: o.name.trim(), term: o.term.trim(), credits: +o.credits, grade: o.grade, cat: o.cat }); save(); e.target.name.value = ''; render(); };
    el.querySelectorAll('#wi-g button').forEach((b) => b.onclick = () => { wiG = b.dataset.g; el.querySelectorAll('#wi-g button').forEach((x) => x.classList.toggle('on', x === b)); render(); });
    el.querySelector('#wi-cr').oninput = render;
    render();
  });

  // ---------- Degree planner (TESU BA Biology) ----------
  const COURSES = [
    { id: 'precalc', name: 'MAT-1290 Precalculus', cr: 3, where: 'TESU', pre: [], cat: 'math' },
    { id: 'bio1', name: 'General Biology I + lab', cr: 4, where: 'Transfer', pre: [], cat: 'bio' },
    { id: 'bio2', name: 'General Biology II + lab', cr: 4, where: 'Transfer', pre: ['bio1'], cat: 'bio' },
    { id: 'chem1', name: 'CHE-1210 General Chemistry I + lab', cr: 4, where: 'TESU', pre: ['precalc'], cat: 'ichem', note: 'precalc or college algebra' },
    { id: 'chem2', name: 'CHE-1220 General Chemistry II + lab', cr: 4, where: 'TESU', pre: ['chem1'], cat: 'ichem' },
    { id: 'cell', name: 'Cell Biology', cr: 3, where: 'Transfer', pre: ['bio1', 'chem1'], cat: 'bio' },
    { id: 'gen', name: 'Genetics', cr: 3, where: 'Transfer', pre: ['bio1'], cat: 'bio' },
    { id: 'orgo1', name: 'Organic Chemistry I + lab', cr: 4, where: 'Transfer', pre: ['chem2'], cat: 'ochem' },
    { id: 'orgo2', name: 'Organic Chemistry II + lab', cr: 4, where: 'Transfer', pre: ['orgo1'], cat: 'ochem' },
    { id: 'biochem', name: 'Biochemistry (elective)', cr: 3, where: 'Transfer', pre: ['orgo1'], cat: 'biochem', optional: true },
    { id: 'micro', name: 'BIO-2510 Microbiology + lab', cr: 4, where: 'TESU', pre: ['bio1', 'chem1'], cat: 'bio' },
    { id: 'anp1', name: 'BIO-2110 Anatomy & Physiology I + lab', cr: 4, where: 'TESU', pre: ['bio1'], cat: 'bio' },
    { id: 'anp2', name: 'BIO-2120 Anatomy & Physiology II + lab', cr: 4, where: 'TESU', pre: ['anp1'], cat: 'bio' },
    { id: 'phys1', name: 'PHY-1150 Physics I + lab', cr: 4, where: 'TESU', pre: ['precalc'], cat: 'phys' },
    { id: 'phys2', name: 'PHY-1160 Physics II + lab', cr: 4, where: 'TESU', pre: ['phys1'], cat: 'phys' },
    { id: 'stats', name: 'Statistics (elective)', cr: 3, where: 'TESU or transfer', pre: [], cat: 'math' },
    { id: 'psych', name: 'General Psychology (elective)', cr: 3, where: 'TESU or transfer', pre: [], cat: 'behav' },
    { id: 'abpsych', name: 'Abnormal Psychology (elective)', cr: 3, where: 'TESU or transfer', pre: ['psych'], cat: 'behav', optional: true },
    { id: 'nutr', name: 'BIO-2080 Science of Nutrition (gen ed)', cr: 3, where: 'TESU', pre: [], cat: 'osci' },
    { id: 'earth', name: 'EAS-1010 General Earth Science (gen ed)', cr: 3, where: 'TESU', pre: [], cat: 'osci' },
    { id: 'upper1', name: 'Upper-level biology elective (3000+)', cr: 3, where: 'TESU', pre: ['bio2'], cat: 'bio' },
    { id: 'upper2', name: 'Upper-level biology elective (3000+)', cr: 3, where: 'TESU', pre: ['bio2'], cat: 'bio' },
    { id: 'gened', name: 'Remaining general education (writing, speech, humanities, civics)', cr: 30, where: 'TESU / transfer', pre: [], cat: 'other', bucket: true },
    { id: 'capstone', name: 'LIB-4970 Liberal Arts Capstone', cr: 3, where: 'TESU', pre: ['bio2', 'chem2', 'micro', 'gen', 'cell', 'orgo2', 'phys2', 'upper1', 'upper2'], cat: 'other' },
  ];
  const CMAP = new Map(COURSES.map((c) => [c.id, c]));
  function planSchedule(d) {
    // Earliest-term scheduling with a per-term cap; done courses are term 0; pinned terms honored when feasible; dropped courses vanish and block their dependents.
    const cap = d.perTerm || 2; const term = {}; const dropped = d.dropped || {}; const done = d.done || {}; const pin = d.term || {};
    const load = {}; const blocked = new Set();
    const order = []; const seen = new Set();
    const visit = (id) => { if (seen.has(id)) return; seen.add(id); (CMAP.get(id).pre || []).forEach(visit); order.push(id); };
    COURSES.forEach((c) => visit(c.id));
    for (const id of order) {
      const c = CMAP.get(id);
      if (done[id]) { term[id] = 0; continue; }
      if (dropped[id] || c.pre.some((p) => blocked.has(p))) { blocked.add(id); continue; }
      const pres = c.pre.map((p) => term[p]); let t = Math.max(1, ...pres.map((x) => x + 1));
      if (pin[id] && pin[id] >= t) t = pin[id];
      if (!c.bucket) { while ((load[t] || 0) >= cap) t++; load[t] = (load[t] || 0) + 1; }
      term[id] = t;
    }
    const last = Math.max(0, ...Object.values(term)); return { term, blocked, last };
  }
  function degreeSummary() { const d = S.degree || {}; const p = planSchedule(d); const n = Object.values(d.done || {}).filter(Boolean).length; return n + ' of ' + COURSES.length + ' done · finishes term ' + p.last; }
  const termLabel = (d, n) => { if (!n) return 'Done'; if (!d.start) return 'Term ' + n; const [y, m] = d.start.split('-').map(Number); const dt = new Date(y, m - 1 + (n - 1) * 3, 1); return 'Term ' + n + ' · ' + dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); };
  route('/degree', (params, token) => {
    S.degree = S.degree || {}; const d = S.degree; d.perTerm = d.perTerm || 2; d.done = d.done || {}; d.term = d.term || {}; d.dropped = d.dropped || {};
    const el = h(`<div>${backLink('#/career', 'Career')}<div class="page-head"><div><div class="eyebrow">Degree planner</div><h1>TESU BA Biology, as a chain</h1><p class="lede">Twelve-week terms, about four a year. Each course sits in the earliest term its prerequisites allow. Drop or move one and the chain re-flows so you see what it costs before you do it.</p></div></div>
      <div class="card" style="margin-bottom:16px"><div class="row" style="gap:18px"><div class="field"><label>Courses per term</label><div class="seg" id="cap">${[1, 2, 3, 4].map((n) => `<button data-n="${n}" class="${d.perTerm === n ? 'on' : ''}">${n}</button>`).join('')}</div></div><div class="field"><label>Term 1 starts</label><input type="month" id="start" value="${esc(d.start || '')}"></div><div id="summary" class="small" style="flex:1;min-width:220px"></div></div></div>
      <div id="board" class="terms"></div>
      <div class="card" style="margin-top:16px"><div class="eyebrow">Rules the plan enforces</div><ul class="small muted" style="margin:8px 0 0 18px;line-height:1.6"><li>Six courses are transfer-only at TESU: General Biology I and II, Cell Biology, Genetics, Organic I and II. Confirm transferability before enrolling elsewhere.</li><li>At least 18 major credits at the 3000 level and 30 credits through TESU. The capstone comes last.</li><li>Statistics and psychology are not in the BA by default. They are here because PA programs want them.</li><li>Tap a course to mark it done, pin it to a term, or drop it and watch what shifts.</li></ul></div></div>`);
    if (!show(el, token)) return;
    let whatIf = null; // course id being hypothetically dropped
    function render() {
      const base = planSchedule(d); const alt = whatIf ? planSchedule(Object.assign({}, d, { dropped: Object.assign({}, d.dropped, { [whatIf]: true }) })) : null;
      const p = alt || base;
      const terms = {}; COURSES.forEach((c) => { const t = p.blocked.has(c.id) ? 'x' : p.term[c.id]; (terms[t] = terms[t] || []).push(c); });
      const keys = Object.keys(terms).filter((k) => k !== 'x').map(Number).sort((a, b) => a - b);
      const credits = COURSES.filter((c) => !p.blocked.has(c.id)).reduce((a, c) => a + c.cr, 0);
      el.querySelector('#summary').innerHTML = `${alt ? `<b style="color:var(--warn)">If you drop ${esc(CMAP.get(whatIf).name)}:</b> ` : ''}finishes in <b class="num">${termLabel(d, p.last)}</b>${alt && alt.last !== base.last ? ` <span style="color:var(--bad)">(was ${termLabel(d, base.last)})</span>` : ''} · <b class="num">${credits}</b> credits planned${p.blocked.size ? ` · <span style="color:var(--bad)">${p.blocked.size} blocked: ${[...p.blocked].map((id) => esc(CMAP.get(id).name.split(' ')[0])).join(', ')}</span>` : ''}${alt ? ' <button class="btn sm" id="clear-wi">Clear what-if</button>' : ''}`;
      const q = el.querySelector('#clear-wi'); if (q) q.onclick = () => { whatIf = null; render(); };
      el.querySelector('#board').innerHTML = keys.map((k) => `<div class="term"><div class="eyebrow">${esc(termLabel(d, k))}</div>${terms[k].map((c) => `<button class="course ${d.done[c.id] ? 'done' : ''} ${alt && base.term[c.id] !== p.term[c.id] ? 'shifted' : ''} ${c.optional ? 'optional' : ''}" data-id="${c.id}"><b>${esc(c.name)}</b><span class="sub">${c.cr} cr · ${esc(c.where)}${c.pre.length ? ' · after ' + c.pre.map((x) => esc(CMAP.get(x).name.split(' ').slice(0, 2).join(' '))).join(', ') : ''}${d.term[c.id] ? ' · pinned' : ''}</span></button>`).join('')}</div>`).join('') + (terms.x ? `<div class="term blocked"><div class="eyebrow" style="color:var(--bad)">Blocked or dropped</div>${terms.x.map((c) => `<button class="course dropped" data-id="${c.id}"><b>${esc(c.name)}</b><span class="sub">${d.dropped[c.id] ? 'dropped' : 'needs a dropped course'}</span></button>`).join('')}</div>` : '');
      el.querySelectorAll('.course').forEach((b) => b.onclick = () => menu(b.dataset.id));
    }
    function menu(id) {
      const c = CMAP.get(id); const cur = planSchedule(d).term[id];
      const m = h(`<div class="sheet-back"><div class="sheet"><div class="eyebrow">${esc(c.name)}</div><div class="stack" style="margin-top:12px;gap:8px">
        <button class="btn ${d.done[id] ? 'primary' : ''}" data-a="done">${d.done[id] ? 'Mark not done' : 'Mark done'}</button>
        <div class="row"><span class="small muted">Pin to term</span><div class="seg" id="pin">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `<button data-n="${n}" class="${d.term[id] === n ? 'on' : ''}">${n}</button>`).join('')}</div><button class="btn sm" data-a="unpin">Unpin</button></div>
        <button class="btn" data-a="whatif">What if I drop this?</button>
        <button class="btn danger" data-a="drop">${d.dropped[id] ? 'Restore' : 'Drop it'}</button>
        <button class="btn subtle" data-a="close">Close</button></div></div></div>`);
      document.body.appendChild(m);
      const close = () => m.remove();
      m.onclick = (e) => { if (e.target === m) close(); };
      m.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => { const a = b.dataset.a; if (a === 'done') { d.done[id] = !d.done[id]; if (d.done[id]) delete d.dropped[id]; } if (a === 'unpin') delete d.term[id]; if (a === 'drop') { d.dropped[id] = !d.dropped[id]; if (d.dropped[id]) delete d.done[id]; } if (a === 'whatif') whatIf = id; save(); close(); render(); });
      m.querySelectorAll('#pin button').forEach((b) => b.onclick = () => { d.term[id] = +b.dataset.n; save(); close(); render(); });
    }
    el.querySelectorAll('#cap button').forEach((b) => b.onclick = () => { d.perTerm = +b.dataset.n; save(); el.querySelectorAll('#cap button').forEach((x) => x.classList.toggle('on', x === b)); render(); });
    el.querySelector('#start').onchange = (e) => { d.start = e.target.value; save(); render(); };
    render();
  });

  // ---------- Not on shift ----------
  const LINES = [
    { name: '988 Suicide and Crisis Lifeline', how: 'Call or text 988', note: 'Any time, for you or someone you are worried about. Press 1 for veterans.' },
    { name: 'Crisis Text Line', how: 'Text HOME to 741741', note: 'When talking is too much.' },
    { name: 'Safe Call Now', how: '1-206-459-3020', note: 'Confidential line for first responders, staffed by first responders. 24/7.' },
    { name: 'Fire/EMS Helpline (NVFC Share the Load)', how: '1-888-731-3473', note: 'For fire and EMS personnel and their families.' },
    { name: 'Frontline Helpline (Frontline Responder Services)', how: '1-866-676-7500', note: 'First responders, 24/7.' },
    { name: 'NJ Hopeline', how: '1-855-654-6735', note: 'New Jersey peer support and suicide prevention, 24/7.' },
    { name: 'NJ Mental Health Cares', how: '1-866-202-4357', note: 'New Jersey mental health referral line.' },
    { name: 'SAMHSA National Helpline', how: '1-800-662-4357', note: 'Substance use and mental health treatment referral, free, 24/7.' },
  ];
  route('/decompress', (params, token) => {
    const el = h(`<div>${backLink('#/career', 'Career')}<div class="page-head"><div><div class="eyebrow">Not on shift</div><h1>For the night you need it</h1><p class="lede">Bad calls happen to everyone who does this work. This page is here so you do not have to go looking that night. Nothing written here goes in anyone's chart or leaves this device.</p></div></div>
      <div class="two-col">
        <div class="stack"><div class="card"><div class="eyebrow">Your people</div><p class="small muted" style="margin-top:6px">Squad CISM contact, your chief, a partner, a friend who gets it. Fill this in before you need it.</p><div id="contacts" class="stack" style="margin-top:10px;gap:6px"></div><form id="cf" class="row" style="margin-top:10px"><input type="text" name="name" placeholder="Name" required style="flex:1;min-width:120px"><input type="text" name="role" placeholder="Role (CISM, chief, friend)" style="flex:1;min-width:120px"><input type="tel" name="phone" placeholder="Phone" style="flex:1;min-width:120px"><button class="btn sm primary" type="submit">Add</button></form></div>
        <div class="card"><div class="eyebrow">Lines that answer</div><div class="stack" style="margin-top:10px;gap:8px">${LINES.map((l) => `<div><a class="btn" href="tel:${l.how.replace(/[^0-9]/g, '') || '988'}" style="width:100%;justify-content:space-between"><span>${esc(l.name)}</span><b class="num">${esc(l.how)}</b></a><div class="faint small" style="margin:4px 4px 0">${esc(l.note)}</div></div>`).join('')}</div><p class="faint tiny" style="margin-top:10px">If you are in immediate danger, call 911. NJ squads typically have a CISM team through the county; ask your captain for the number and put it above.</p></div></div>
        <div class="card"><div class="eyebrow">Write it down</div><p class="small muted" style="margin-top:6px">What happened, what you did, what you would do differently, and how you actually feel. Stays on this device. Not included in exports.</p><form id="jf" class="stack" style="margin-top:10px;gap:8px"><input type="text" name="title" placeholder="The call (a few words)"><textarea name="text" rows="8" placeholder="Start anywhere."></textarea><div class="btn-row"><button class="btn primary" type="submit">Save</button></div></form><div id="entries" class="stack" style="margin-top:14px;gap:8px"></div></div></div>
      <div class="card" style="margin-top:16px"><div class="eyebrow">What usually helps in the first 72 hours</div><ul class="small muted" style="margin:8px 0 0 18px;line-height:1.7"><li>Talk to someone who was there, or someone who has done the job. Not to fix it, just to say it out loud.</li><li>Sleep, eat, move. Skip the alcohol; it turns a bad night into a bad week.</li><li>Replaying the call is normal for days. It should fade. If it is not fading after a few weeks, or sleep is wrecked, that is when you call one of the lines above or your own doctor.</li><li>You are allowed to take a shift off.</li></ul></div></div>`);
    if (!show(el, token)) return;
    function render() {
      el.querySelector('#contacts').innerHTML = S.contacts.length ? S.contacts.map((c) => `<div class="task" style="cursor:default"><span style="flex:1"><span class="t" style="text-decoration:none;color:inherit"><b>${esc(c.name)}</b>${c.role ? ' · ' + esc(c.role) : ''}</span>${c.phone ? `<div class="sub"><a href="tel:${esc(c.phone.replace(/[^0-9+]/g, ''))}">${esc(c.phone)}</a></div>` : ''}</span><button class="btn sm subtle" data-del="${c.id}">Remove</button></div>`).join('') : '<p class="faint small">Nobody added yet.</p>';
      el.querySelectorAll('#contacts [data-del]').forEach((b) => b.onclick = () => { S.contacts = S.contacts.filter((x) => x.id !== b.dataset.del); save(); render(); });
      el.querySelector('#entries').innerHTML = [...S.journal].sort((a, b) => b.ts - a.ts).map((j) => `<details class="card" style="padding:12px"><summary style="cursor:pointer"><b>${esc(j.title || 'Untitled')}</b> <span class="faint small">· ${new Date(j.ts).toLocaleDateString()}</span></summary><div class="prose small" style="margin-top:8px;white-space:pre-wrap">${esc(j.text)}</div><div class="btn-row" style="margin-top:8px"><button class="btn sm subtle" data-jdel="${j.id}">Delete</button></div></details>`).join('');
      el.querySelectorAll('[data-jdel]').forEach((b) => b.onclick = () => { if (confirm('Delete this entry?')) { S.journal = S.journal.filter((x) => x.id !== b.dataset.jdel); save(); render(); } });
    }
    el.querySelector('#cf').onsubmit = (e) => { e.preventDefault(); const o = Object.fromEntries(new FormData(e.target).entries()); S.contacts.push({ id: uid(), name: o.name.trim(), role: o.role.trim(), phone: o.phone.trim() }); save(); e.target.reset(); render(); };
    el.querySelector('#jf').onsubmit = (e) => { e.preventDefault(); const o = Object.fromEntries(new FormData(e.target).entries()); if (!o.text.trim()) return; S.journal.push({ id: uid(), ts: Date.now(), title: o.title.trim(), text: o.text.trim() }); save(); e.target.reset(); toast('Saved here, nowhere else.'); render(); };
    render();
  });
});
