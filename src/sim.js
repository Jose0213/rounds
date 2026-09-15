/* Rounds — simulations: radio report / handoff with a clock, PCR narrative practice, SAMPLE/OPQRST AI patient, skill station self-check with video. */
(window.ROUNDS_EXT = window.ROUNDS_EXT || []).push(function (A) {
  const { route, h, esc, show, stale, S, save, toast, backLink, REF, MD, Store, today } = A;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const daySeed = () => Math.floor(Date.now() / 86400000);

  // Streams a completion from the tutor service with a custom system prompt. Returns the full text.
  async function ai(system, messages, onDelta, signal) {
    const res = await fetch(Tutor.endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ system, messages: messages.slice(-16) }) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '', full = '';
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = chunk.split('\n').find((l) => l.startsWith('data:')); if (!line) continue;
        try { const ev = JSON.parse(line.slice(5)); if (ev.delta) { full += ev.delta; if (onDelta) onDelta(full); } if (ev.text && !full) { full = ev.text; if (onDelta) onDelta(full); } if (ev.error) throw new Error(ev.error); } catch (e) { if (e.message && !/JSON/.test(e.message)) throw e; }
      }
    }
    return full;
  }
  const offlineMsg = 'The tutor service is not reachable (needs Tailscale on). The local rubric still works; the AI critique does not.';
  function recordSim(kind, c, score, total) { S.sims.push({ ts: Date.now(), kind, tid: c ? c.tid : null, score, total }); if (S.sims.length > 400) S.sims = S.sims.slice(-400); save(); }
  const logMissesBtn = (misses, source, tag) => misses.length ? `<button class="btn" id="log-misses">Log ${misses.length} miss${misses.length > 1 ? 'es' : ''} to the mistake log</button>` : '';
  function wireLogMisses(el, misses, source, tag, fixFor) {
    const b = el.querySelector('#log-misses'); if (!b) return;
    b.onclick = () => { misses.forEach((m) => A.addMistake({ miss: m, fix: fixFor(m), source, tags: tag })); b.disabled = true; b.textContent = 'Logged'; toast('Logged. They come up for review tomorrow.'); };
  }

  // ---------- Simulations hub ----------
  route('/sim', (params, token) => {
    const hist = (k) => S.sims.filter((x) => x.kind === k); const last = (k) => { const a = hist(k); return a.length ? a[a.length - 1] : null; };
    const line = (k) => { const l = last(k); return l ? `Last: <b class="num">${l.score}/${l.total}</b> · ${hist(k).length} runs` : 'Not run yet'; };
    const el = h(`<div>${backLink('#/practice', 'Practice')}<div class="page-head"><div><div class="eyebrow">Simulations</div><h1>The things you will do a hundred times</h1><p class="lede">A new patient every run. Report it, chart it, interview it, and run the skill stations on camera.</p></div></div>
      <div class="grid">
        <a class="card link" href="#/sim/report"><div class="eyebrow accent">Radio report · 30 s</div><h2 style="margin-top:6px">Call it in</h2><p class="muted small" style="margin-top:6px">Patient generated, 30-second clock, MIST or SBAR, graded against what had to be in it.</p><p class="faint small" style="margin-top:6px">${line('report')}</p></a>
        <a class="card link" href="#/sim/pcr"><div class="eyebrow accent">PCR narrative</div><h2 style="margin-top:6px">Write the chart</h2><p class="muted small" style="margin-top:6px">Times, vitals trend, every treatment with its response, objective language, refusals done right.</p><p class="faint small" style="margin-top:6px">${line('pcr')}</p></a>
        <a class="card link" href="#/sim/history"><div class="eyebrow accent">AI patient</div><h2 style="margin-top:6px">Take the history</h2><p class="muted small" style="margin-top:6px">A patient who only answers what you ask. SAMPLE and OPQRST audit at the end. Daily.</p><p class="faint small" style="margin-top:6px">${line('history')}</p></a>
        <a class="card link" href="#/station"><div class="eyebrow accent">Skill stations</div><h2 style="margin-top:6px">Run it on camera</h2><p class="muted small" style="margin-top:6px">NREMT sheets with a record-yourself mode. Tick the sheet against the video; critical criteria highlighted.</p><p class="faint small" style="margin-top:6px">${Object.values(S.stations).flat().length} runs</p></a>
      </div></div>`);
    show(el, token);
  });

  // ---------- Radio report / handoff ----------
  route('/sim/report', (params, token) => {
    const seed = +params.seed || (Date.now() % 1e9);
    const c = Cases.generate(seed, params.tid ? { id: params.tid } : {});
    const fmt = params.fmt || S.settings.reportFmt || 'MIST';
    const el = h(`<div>${backLink('#/sim', 'Simulations')}<div class="page-head"><div><div class="eyebrow">Radio report</div><h1>${esc(fmt)} · ${esc(c.dest)}</h1></div><div class="seg" id="fmt">${['MIST', 'SBAR'].map((f) => `<button data-f="${f}" class="${f === fmt ? 'on' : ''}">${f}</button>`).join('')}</div></div>
      <div class="two-col">
        <div class="stack">
          <div class="card"><div class="eyebrow">Your patient</div><p class="small" style="margin-top:8px">${esc(Cases.dispatch(c))}</p><div class="prose small" style="margin-top:8px">${MD.render(Cases.story(c).split('\n').map((l) => '- ' + l).join('\n'))}</div></div>
          <div class="card"><div class="eyebrow">${esc(fmt)} in one breath</div><p class="small muted" style="margin-top:8px">${fmt === 'MIST' ? '<b>M</b>echanism or medical complaint · <b>I</b>njuries or illness found · <b>S</b>igns: vitals and mental status · <b>T</b>reatment given and response. Open with unit, age, sex; close with ETA and what you need waiting.' : '<b>S</b>ituation: unit, age, sex, chief complaint · <b>B</b>ackground: history, meds, allergies that matter · <b>A</b>ssessment: findings, vitals, mental status, your impression · <b>R</b>ecommendation: what you need on arrival, ETA.'}</p></div>
        </div>
        <div class="card"><div class="row" style="justify-content:space-between"><div class="eyebrow">Give the report</div><div class="timer num" id="clock">0:30</div></div>
          <p class="small muted" style="margin-top:6px">Tap Start, then talk (use the keyboard mic to dictate) or type. The clock is the one at the real hospital.</p>
          <textarea id="rep" rows="8" style="margin-top:10px" placeholder="Cooper, this is BLS 47 with a 12-minute ETA..." disabled></textarea>
          <div class="btn-row" style="margin-top:10px"><button class="btn primary" id="start">Start</button><button class="btn" id="grade" disabled>Grade it</button><a class="btn" href="#/sim/report?seed=${seed + 1}&fmt=${fmt}">New patient</a></div>
          <div id="result" style="margin-top:14px"></div></div></div></div>`);
    if (!show(el, token)) return;
    el.querySelectorAll('#fmt button').forEach((b) => b.onclick = () => { S.settings.reportFmt = b.dataset.f; save(); location.hash = `#/sim/report?seed=${seed}&fmt=${b.dataset.f}`; });
    const ta = el.querySelector('#rep'); const clock = el.querySelector('#clock'); let t = 30, iv = null, started = 0, over = false;
    function tick() { const left = Math.max(0, 30 - Math.round((Date.now() - started) / 1000)); clock.textContent = '0:' + String(left).padStart(2, '0'); clock.style.color = left <= 5 ? 'var(--bad)' : left <= 10 ? 'var(--warn)' : ''; if (left === 0 && !over) { over = true; clock.textContent = 'over'; } }
    el.querySelector('#start').onclick = () => { started = Date.now(); over = false; ta.disabled = false; ta.focus(); el.querySelector('#grade').disabled = false; el.querySelector('#start').disabled = true; iv = setInterval(tick, 250); tick(); };
    el.querySelector('#grade').onclick = async () => {
      clearInterval(iv); const secs = Math.round((Date.now() - started) / 1000); const text = ta.value.trim(); ta.disabled = true; el.querySelector('#grade').disabled = true;
      const rub = Cases.reportRubric(c); const res = rub.map((r) => ({ label: r.label, ok: !!text && r.test(text) }));
      const score = res.filter((r) => r.ok).length; const words = text.split(/\s+/).filter(Boolean).length;
      recordSim('report', c, score, res.length);
      const misses = res.filter((r) => !r.ok).map((r) => r.label);
      const out = el.querySelector('#result');
      out.innerHTML = `<div class="result-head"><div class="eyebrow">${secs}s · ${words} words${secs > 35 ? ' · over time' : ''}</div><b class="num" style="color:${score >= res.length - 1 ? 'var(--good)' : score >= res.length - 3 ? 'var(--warn)' : 'var(--bad)'}">${score}/${res.length}</b></div>
        <div class="stack" style="gap:4px;margin-top:8px">${res.map((r) => `<div class="task ${r.ok ? 'done' : ''}" style="cursor:default;padding:6px 10px"><span class="box">${r.ok ? '✓' : ''}</span><span class="t" style="text-decoration:none;color:${r.ok ? 'var(--ink-3)' : 'var(--bad)'}">${esc(r.label)}</span></div>`).join('')}</div>
        <div class="btn-row" style="margin-top:12px">${logMissesBtn(misses)}<button class="btn ask" id="critique">Ask the tutor to critique it</button></div><div id="crit" class="prose small" style="margin-top:10px"></div>`;
      wireLogMisses(out, misses, 'sim', 'radio report', (m) => `Radio report for ${c.cc} left out: ${m}. Every report needs unit/ETA, age/sex, complaint, ${c.moi ? 'mechanism' : 'relevant history'}, key findings, full vitals, mental status, treatments and response, and what you need waiting.`);
      out.querySelector('#critique').onclick = async () => {
        const crit = out.querySelector('#crit'); crit.innerHTML = '<span class="faint">Thinking…</span>'; out.querySelector('#critique').disabled = true;
        try { await ai(`You are an emergency department charge nurse grading an EMT student's ${fmt} radio report. The facts of the case:\n${Cases.story(c)}\n\nGrade the report they gave in under 30 seconds. Be specific and brief: (1) what was missing or wrong, in order of how much it mattered; (2) anything said that wasted seconds; (3) a model ${fmt} report for this exact patient in 60 words or fewer. Plain text, no headers, no praise padding.`, [{ role: 'user', content: text || '(said nothing)' }], (full) => { crit.innerHTML = MD.render(full); }); } catch (e) { crit.textContent = offlineMsg; }
      };
    };
    return () => clearInterval(iv);
  });

  // ---------- PCR narrative ----------
  route('/sim/pcr', (params, token) => {
    const seed = +params.seed || (Date.now() % 1e9);
    const c = Cases.generate(seed, params.tid ? { id: params.tid } : params.refusal ? { refusal: true } : {});
    const el = h(`<div>${backLink('#/sim', 'Simulations')}<div class="page-head"><div><div class="eyebrow">PCR narrative</div><h1>Chart this call</h1><p class="lede">Write it as if it will be read in a deposition in three years. Objective, timed, complete.</p></div><a class="btn" href="#/sim/pcr?seed=${seed + 1}${c.refusal ? '&refusal=1' : ''}">New call</a></div>
      <div class="two-col">
        <div class="card"><div class="eyebrow">The call, as it happened</div><div class="prose small" style="margin-top:8px">${MD.render(['- Dispatch ' + c.times.dispatch + ', en route ' + c.times.enroute + ', on scene ' + c.times.onscene + ', patient contact ' + c.times.contact + (c.refusal ? ', cleared ' + c.times.clear : ', departed ' + c.times.depart + ', arrived ' + c.dest + ' ' + c.times.arrive), ...Cases.story(c).split('\n').map((l) => '- ' + l)].join('\n'))}</div>
          <p class="faint small" style="margin-top:8px">Formats that work: CHART (chief complaint, history, assessment, Rx, transport) or SOAP. Times in 24-hour clock.</p></div>
        <div class="card"><div class="eyebrow">Narrative</div><textarea id="pcr" rows="16" style="margin-top:10px;font-family:var(--mono);font-size:14px" placeholder="${c.times.dispatch} Dispatched to ${esc(c.place)} for a ${c.age} y/o ${c.sexWord}, ${esc(c.cc)}. ${c.times.onscene} On scene..."></textarea>
          <div class="btn-row" style="margin-top:10px"><button class="btn primary" id="check">Check it</button><span class="faint small" id="wc"></span></div><div id="result" style="margin-top:14px"></div></div></div></div>`);
    if (!show(el, token)) return;
    const ta = el.querySelector('#pcr'); ta.oninput = () => { el.querySelector('#wc').textContent = ta.value.split(/\s+/).filter(Boolean).length + ' words'; };
    el.querySelector('#check').onclick = async () => {
      const text = ta.value.trim(); const rub = Cases.pcrRubric(c); const res = rub.map((r) => ({ label: r.label, ok: !!text && r.test(text) }));
      const subj = Cases.subjectiveHits(text); const score = res.filter((r) => r.ok).length; recordSim('pcr', c, score, res.length);
      const misses = res.filter((r) => !r.ok).map((r) => r.label);
      const out = el.querySelector('#result');
      out.innerHTML = `<div class="result-head"><div class="eyebrow">${c.refusal ? 'Refusal call' : 'Transport'}</div><b class="num" style="color:${score >= res.length - 1 ? 'var(--good)' : score >= res.length - 3 ? 'var(--warn)' : 'var(--bad)'}">${score}/${res.length}</b></div>
        <div class="stack" style="gap:4px;margin-top:8px">${res.map((r) => `<div class="task ${r.ok ? 'done' : ''}" style="cursor:default;padding:6px 10px"><span class="box">${r.ok ? '✓' : ''}</span><span class="t" style="text-decoration:none;color:${r.ok ? 'var(--ink-3)' : 'var(--bad)'}">${esc(r.label)}</span></div>`).join('')}</div>
        ${subj.length ? `<div class="why no" style="margin-top:10px"><strong>Subjective or loaded language:</strong> ${subj.map(esc).join(', ')}. Write what you observed and what the patient said, in quotes.</div>` : ''}
        <div class="btn-row" style="margin-top:12px">${logMissesBtn(misses)}<button class="btn ask" id="critique">Ask the tutor to critique it</button></div><div id="crit" class="prose small" style="margin-top:10px"></div>`;
      wireLogMisses(out, misses, 'sim', 'documentation', (m) => `PCR for ${c.cc} was missing: ${m}. A defensible narrative has every time, both sets of vitals, each treatment with dose/route/response, pertinent negatives, objective language, and ${c.refusal ? 'a complete refusal: capacity, risks explained, alternatives, call-back advice, signature and witness' : 'the transfer of care'}.`);
      out.querySelector('#critique').onclick = async () => {
        const crit = out.querySelector('#crit'); crit.innerHTML = '<span class="faint">Thinking…</span>'; out.querySelector('#critique').disabled = true;
        try { await ai(`You are an EMS QA officer reviewing an EMT student's patient care report narrative. The facts of the call:\n${Cases.story(c)}\nTimes: ${JSON.stringify(c.times)}.\n\nReview the narrative for: missing times, missing or wrong vitals, treatments without dose/route/time/response, missing pertinent negatives, subjective or judgmental language, ${c.refusal ? 'refusal documentation (capacity, risks, alternatives, call back, signature, witness, medical direction)' : 'transfer of care'}, and anything that would hurt them in court. Then give a corrected version of ONE weak paragraph, not the whole thing. Plain text, brief, specific, no praise padding.`, [{ role: 'user', content: text || '(blank)' }], (full) => { crit.innerHTML = MD.render(full); }); } catch (e) { crit.textContent = offlineMsg; }
      };
    };
  });

  // ---------- SAMPLE / OPQRST AI patient ----------
  route('/sim/history', (params, token) => {
    const seed = +params.seed || (daySeed() * 7919 + (S.sims.filter((x) => x.kind === 'history').length));
    const c = Cases.generate(seed, params.tid ? { id: params.tid } : {});
    const el = h(`<div>${backLink('#/sim', 'Simulations')}<div class="page-head"><div><div class="eyebrow">AI patient · history taking</div><h1>${esc(c.first)}, ${c.age}</h1><p class="lede">${esc(Cases.dispatch(c))} You have made contact. Ask your questions one at a time. The patient answers only what you ask.</p></div><a class="btn" href="#/sim/history?seed=${seed + 1}">New patient</a></div>
      <div class="two-col">
        <div class="card"><div class="tutor-log" id="log" style="max-height:52vh;min-height:240px;overflow:auto"></div>
          <form id="f" class="tutor-form" style="margin-top:10px"><textarea id="in" rows="1" placeholder="What's going on today?" enterkeyhint="send"></textarea><button class="btn primary" type="submit" id="send">Ask</button></form>
          <div class="btn-row" style="margin-top:10px"><button class="btn" id="finish">Finish and audit</button></div></div>
        <div class="stack"><div class="card"><div class="eyebrow">What you have covered</div><div id="audit" class="stack" style="gap:3px;margin-top:8px"></div><p class="faint small" style="margin-top:8px">Live checklist. It counts what you asked, not what the patient volunteered.</p></div><div id="result"></div></div></div></div>`);
    if (!show(el, token)) return;
    const log = el.querySelector('#log'); const ta = el.querySelector('#in'); const history = []; let busy = false, abort = null;
    const userTurns = () => history.filter((m) => m.role === 'user').map((m) => m.content);
    function renderLog() { log.innerHTML = history.map((m) => `<div class="msg ${m.role}">${m.role === 'assistant' ? MD.render(m.content || (m.pending ? '…' : '')) : esc(m.content)}</div>`).join('') || `<div class="faint small" style="padding:8px 2px">${esc(c.first)} is ${esc(c.sample.s.split(',')[0])}. Introduce yourself and start.</div>`; log.scrollTop = log.scrollHeight; }
    function renderAudit() { const a = Cases.historyAudit(userTurns()); el.querySelector('#audit').innerHTML = a.map((x) => `<div class="task ${x.asked ? 'done' : ''}" style="cursor:default;padding:4px 8px"><span class="box" style="width:18px;height:18px;font-size:12px">${x.asked ? '✓' : ''}</span><span class="t small" style="text-decoration:none;color:${x.asked ? 'var(--ink-3)' : 'inherit'}"><b>${x.k}</b> ${esc(x.label)}</span></div>`).join(''); return a; }
    async function ask(q) {
      if (busy) return; busy = true; el.querySelector('#send').disabled = true;
      history.push({ role: 'user', content: q }); const a = { role: 'assistant', content: '', pending: true }; history.push(a); renderLog(); renderAudit();
      abort = new AbortController();
      try { await ai(Cases.patientSystem(c), history.filter((m) => !m.pending).map((m) => ({ role: m.role, content: m.content })), (full) => { a.content = full; renderLog(); }, abort.signal); if (!a.content) a.content = '…'; }
      catch (e) { a.content = e.name === 'AbortError' ? '' : offlineMsg; }
      finally { a.pending = false; busy = false; el.querySelector('#send').disabled = false; renderLog(); }
    }
    el.querySelector('#f').onsubmit = (e) => { e.preventDefault(); const q = ta.value.trim(); if (q) { ta.value = ''; ask(q); } };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.querySelector('#f').requestSubmit(); } });
    el.querySelector('#finish').onclick = () => {
      const a = renderAudit(); const score = a.filter((x) => x.asked).length; recordSim('history', c, score, a.length);
      const misses = a.filter((x) => !x.asked).map((x) => x.label);
      const out = el.querySelector('#result');
      out.innerHTML = `<div class="card"><div class="result-head"><div class="eyebrow">History audit</div><b class="num" style="color:${score >= 11 ? 'var(--good)' : score >= 8 ? 'var(--warn)' : 'var(--bad)'}">${score}/12</b><div class="sub">${userTurns().length} questions asked</div></div>
        <div class="prose small" style="margin-top:8px"><p><b>What the full history was:</b></p>${MD.render(Cases.story(c).split('\n').slice(1, 4).map((l) => '- ' + l).join('\n'))}<p style="margin-top:8px"><b>Working impression:</b> ${esc(c.dx)}.</p></div>
        <div class="btn-row" style="margin-top:10px">${logMissesBtn(misses)}<button class="btn ask" id="critique">Ask the tutor how the interview went</button></div><div id="crit" class="prose small" style="margin-top:10px"></div></div>`;
      wireLogMisses(out, misses, 'sim', 'history', (m) => `Did not ask about ${m.toLowerCase()} when taking a history for ${c.cc}. SAMPLE and OPQRST every patient, every time, in order, until it is automatic.`);
      out.querySelector('#critique').onclick = async () => {
        const crit = out.querySelector('#crit'); crit.innerHTML = '<span class="faint">Thinking…</span>'; out.querySelector('#critique').disabled = true;
        try { await ai(`You are an EMT instructor reviewing a student's history-taking interview with a simulated patient. Case facts:\n${Cases.story(c)}\n\nReview the transcript: which SAMPLE and OPQRST elements were asked well, which were missed or asked badly (leading questions, two questions at once, medical jargon, no follow-up on a red flag), and whether the student found the key finding that drives the impression (${c.dx}). Give three concrete things to do differently next time. Brief, plain text, no praise padding.`, [{ role: 'user', content: history.filter((m) => !m.pending).map((m) => (m.role === 'user' ? 'EMT: ' : 'Patient: ') + m.content).join('\n') || '(no questions asked)' }], (full) => { crit.innerHTML = MD.render(full); }); } catch (e) { crit.textContent = offlineMsg; }
      };
    };
    renderLog(); renderAudit(); setTimeout(() => ta.focus(), 50);
    return () => { if (abort) abort.abort(); };
  });

  // ---------- Skill stations with video ----------
  function parseSheet(sheet) {
    const steps = [], critical = []; let inCrit = false, section = '';
    for (const raw of sheet.body.split('\n')) {
      const line = raw.trim();
      if (/^##\s*critical/i.test(line)) { inCrit = true; continue; }
      if (/^##\s/.test(line)) { inCrit = false; continue; }
      if (/^###\s/.test(line)) { section = line.replace(/^###\s*/, '').replace(/^\d+\.\s*/, ''); continue; }
      const m = line.match(/^(\d+)\.\s+(.*?)(?:\s+—\s+`(\d+)`)?$/);
      if (m && !inCrit) { steps.push({ n: +m[1], text: m[2].replace(/`/g, ''), pts: +(m[3] || 1), section }); continue; }
      const b = line.match(/^[-*]\s+(.*)$/); if (b && inCrit) critical.push(b[1].replace(/`/g, ''));
    }
    return { steps, critical };
  }
  route('/station', (params, token) => {
    const sheets = [...REF.values()].filter((r) => r.id.startsWith('skill-'));
    const el = h(`<div>${backLink('#/sim', 'Simulations')}<div class="page-head"><div><div class="eyebrow">Skill stations</div><h1>Run the sheet on camera</h1><p class="lede">Prop the iPad up, record the station, then score yourself line by line against the video. Critical criteria are the automatic fails.</p></div></div>
      <div class="grid">${sheets.map((s) => { const runs = S.stations[s.id] || []; const best = runs.length ? runs.reduce((a, r) => r.score / r.total > a ? r.score / r.total : a, 0) : 0; return `<a class="card link" href="#/station/${s.id}"><div class="eyebrow accent">Station</div><h2 style="margin-top:6px">${esc(s.title.replace(/^NREMT (skill sheet: )?/i, ''))}</h2><p class="faint small" style="margin-top:6px">${runs.length ? `${runs.length} run${runs.length > 1 ? 's' : ''} · best ${Math.round(best * 100)}%${runs.some((r) => r.fails.length) ? ' · has critical fails' : ''}` : 'Not run yet'}</p></a>`; }).join('')}</div></div>`);
    show(el, token);
  });
  route('/station/:id', async (id, params, token) => {
    const sheet = REF.get(id); if (!sheet) { show(h('<div class="empty">Station not found.</div>'), token); return; }
    const { steps, critical } = parseSheet(sheet);
    const runs = S.stations[id] || [];
    const el = h(`<div>${backLink('#/station', 'Stations')}<div class="page-head"><div><div class="eyebrow">Skill station</div><h1>${esc(sheet.title.replace(/^NREMT (skill sheet: )?/i, ''))}</h1></div><a class="btn" href="#/ref/${id}">Read the sheet</a></div>
      <div class="two-col">
        <div class="stack"><div class="card"><div class="eyebrow">Camera</div><div class="cam"><video id="v" playsinline muted autoplay></video></div>
          <div class="btn-row" style="margin-top:10px"><button class="btn primary" id="rec">Start recording</button><button class="btn" id="stop" disabled>Stop</button><button class="btn subtle" id="flip">Flip camera</button><span class="timer num" id="rt"></span></div>
          <p class="faint small" style="margin-top:8px">Video stays on this iPad. Only the last recording per station is kept.</p></div>
          <div class="card" id="hist"><div class="eyebrow">Past runs</div><div class="stack" style="gap:6px;margin-top:8px">${runs.length ? runs.slice().reverse().map((r) => `<div class="task" style="cursor:default"><span><b class="num">${r.score}/${r.total}</b> · ${new Date(r.ts).toLocaleDateString()}${r.fails.length ? ` · <span style="color:var(--bad)">${r.fails.length} critical</span>` : ''}</span></div>`).join('') : '<p class="faint small">No runs yet.</p>'}</div></div></div>
        <div class="card"><div class="row" style="justify-content:space-between"><div class="eyebrow">Score the run</div><span class="chip" id="score">0 / ${steps.reduce((a, s) => a + s.pts, 0)}</span></div>
          <div class="stack" style="gap:3px;margin-top:10px" id="steps">${steps.map((s, i) => `${i === 0 || steps[i - 1].section !== s.section ? `<div class="eyebrow" style="margin-top:8px">${esc(s.section)}</div>` : ''}<label class="task" data-i="${i}"><span class="box"></span><span class="t small" style="text-decoration:none;color:inherit">${s.n}. ${esc(s.text)}</span></label>`).join('')}</div>
          <div class="eyebrow" style="margin-top:14px;color:var(--bad)">Critical criteria · any one fails the station</div>
          <div class="stack" style="gap:3px;margin-top:8px" id="crit">${critical.map((c, i) => `<label class="task crit" data-i="${i}"><span class="box"></span><span class="t small" style="text-decoration:none;color:inherit">${esc(c)}</span></label>`).join('')}</div>
          <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="save">Save this run</button><button class="btn" id="reset">Clear</button></div><div id="verdict" style="margin-top:10px"></div></div></div></div>`);
    if (!show(el, token)) return;
    const done = new Set(), fails = new Set(); const total = steps.reduce((a, s) => a + s.pts, 0);
    const refresh = () => { const sc = steps.filter((s, i) => done.has(i)).reduce((a, s) => a + s.pts, 0); el.querySelector('#score').textContent = sc + ' / ' + total; el.querySelector('#score').className = 'chip ' + (fails.size ? 'bad' : sc >= Math.ceil(total * 0.75) ? 'good' : 'warn'); el.querySelector('#verdict').innerHTML = fails.size ? `<div class="why no"><strong>Fail.</strong> ${fails.size} critical criterion. Fix that before anything else.</div>` : sc === total ? '<div class="why ok"><strong>Clean run.</strong></div>' : ''; };
    el.querySelectorAll('#steps .task').forEach((l) => l.onclick = () => { const i = +l.dataset.i; done.has(i) ? done.delete(i) : done.add(i); l.classList.toggle('done', done.has(i)); l.querySelector('.box').textContent = done.has(i) ? '✓' : ''; refresh(); });
    el.querySelectorAll('#crit .task').forEach((l) => l.onclick = () => { const i = +l.dataset.i; fails.has(i) ? fails.delete(i) : fails.add(i); l.classList.toggle('failed', fails.has(i)); l.querySelector('.box').textContent = fails.has(i) ? '✕' : ''; refresh(); });
    el.querySelector('#reset').onclick = () => { done.clear(); fails.clear(); el.querySelectorAll('.task').forEach((l) => { l.classList.remove('done', 'failed'); l.querySelector('.box').textContent = ''; }); refresh(); };
    // Camera
    const video = el.querySelector('#v'); let stream = null, rec = null, chunks = [], facing = 'environment', rt = null, t0 = 0, playbackUrl = null;
    async function openCam() { try { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 } }, audio: true }); video.srcObject = stream; video.muted = true; video.controls = false; video.play().catch(() => {}); } catch (e) { toast('Camera not available. You can still score the sheet from memory.'); } }
    const prior = await Store.blobGet('station:' + id); if (stale(token)) return;
    if (prior) { playbackUrl = URL.createObjectURL(prior); video.srcObject = null; video.src = playbackUrl; video.muted = false; video.controls = true; video.autoplay = false; toast('Last recording loaded. Start recording to replace it.'); } else openCam();
    el.querySelector('#flip').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; openCam(); };
    el.querySelector('#rec').onclick = async () => {
      if (!stream) await openCam(); if (!stream) return;
      video.controls = false; video.srcObject = stream; video.muted = true; video.play().catch(() => {});
      const type = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
      try { rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined); } catch (e) { toast('Recording is not supported in this browser.'); return; }
      chunks = []; rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => { const blob = new Blob(chunks, { type: rec.mimeType || type || 'video/mp4' }); await Store.blobSet('station:' + id, blob); if (playbackUrl) URL.revokeObjectURL(playbackUrl); playbackUrl = URL.createObjectURL(blob); video.srcObject = null; video.src = playbackUrl; video.muted = false; video.controls = true; video.autoplay = false; toast('Saved. Scrub the video and score the sheet.'); };
      rec.start(1000); t0 = Date.now(); el.querySelector('#rec').disabled = true; el.querySelector('#stop').disabled = false;
      rt = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); el.querySelector('#rt').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
    };
    el.querySelector('#stop').onclick = () => { if (rec && rec.state !== 'inactive') rec.stop(); clearInterval(rt); el.querySelector('#rec').disabled = false; el.querySelector('#stop').disabled = true; };
    el.querySelector('#save').onclick = () => {
      const sc = steps.filter((s, i) => done.has(i)).reduce((a, s) => a + s.pts, 0);
      S.stations[id] = S.stations[id] || []; S.stations[id].push({ ts: Date.now(), score: sc, total, fails: [...fails].map((i) => critical[i]), video: !!playbackUrl }); save();
      const missed = steps.filter((s, i) => !done.has(i)).map((s) => s.text);
      if (fails.size || missed.length) { const b = h('<button class="btn">Log the misses</button>'); el.querySelector('#verdict').appendChild(b); b.onclick = () => { [...fails].forEach((i) => A.addMistake({ miss: 'Critical fail: ' + critical[i], fix: 'Station: ' + sheet.title + '. This line fails the station outright. Drill it until it is automatic.', source: 'class lab', tags: 'skill station' })); missed.slice(0, 5).forEach((m) => A.addMistake({ miss: 'Skipped: ' + m, fix: 'Station: ' + sheet.title + '. Say it and do it every run, in order.', source: 'class lab', tags: 'skill station' })); b.disabled = true; b.textContent = 'Logged'; }; }
      toast('Run saved.');
    };
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); if (rec && rec.state !== 'inactive') rec.stop(); clearInterval(rt); if (playbackUrl) URL.revokeObjectURL(playbackUrl); };
  });
});
