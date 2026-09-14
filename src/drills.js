/* Rounds drills — hands-on practice engines. Drills.list, Drills.run(id, container, { onDone(pct), store }) */
(function () {
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const KEYS = ['A', 'B', 'C', 'D'];
  const finish = (container, pct, right, total, onDone, extra = '') => { onDone(pct); container.appendChild(h(`<div class="card result-head" style="margin-top:14px"><b class="num" style="color:${pct >= 80 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}">${pct}%</b><div class="sub">${right} of ${total}</div>${extra}<div class="btn-row" style="justify-content:center;margin-top:14px"><button class="btn primary" id="again">Again</button><a class="btn" href="#/practice">Practice</a></div></div>`)); container.querySelector('#again').onclick = () => { container.innerHTML = ''; run(container.dataset.drill, container, { onDone }); }; };

  // ---------- 12-lead placement ----------
  function leads12(container, { onDone }) {
    const T = [['RA', 'Right arm (or right shoulder)', 62, 150, 'limb'], ['LA', 'Left arm (or left shoulder)', 338, 150, 'limb'], ['V1', '4th intercostal space, right sternal border', 184, 262], ['V2', '4th intercostal space, left sternal border', 216, 262], ['V4', '5th intercostal space, midclavicular line', 262, 300], ['V3', 'Halfway between V2 and V4', 239, 281], ['V5', 'Anterior axillary line, level with V4', 296, 300], ['V6', 'Midaxillary line, level with V4', 328, 300], ['RL', 'Right leg (or right lower abdomen)', 150, 470, 'limb'], ['LL', 'Left leg (or left lower abdomen)', 250, 470, 'limb']];
    let i = 0; const placed = []; let revealed = false;
    const el = h(`<div class="drill-wrap"><div class="card"><div class="torso" id="torso"><svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".85"><circle cx="200" cy="52" r="34"/><path d="M178 84 v22 M222 84 v22"/><path d="M178 106 C 140 112, 96 126, 78 150 L 44 300 L 78 306 L 96 232 L 96 410 Q 96 440, 120 446 L 150 450 L 150 500 M 250 500 L 250 450 L 280 446 Q 304 440, 304 410 L 304 232 L 322 306 L 356 300 L 322 150 C 304 126, 260 112, 222 106"/><path d="M150 500 h100"/></g>
      <g stroke="currentColor" stroke-width="1.2" opacity=".35" fill="none"><path d="M120 150 Q 200 176 280 150"/><path d="M200 176 v130"/><path d="M172 224 q 28 8 56 0 M164 250 q 36 12 72 0 M158 276 q 42 14 84 0 M156 302 q 44 16 88 0 M158 328 q 42 14 84 0"/><path d="M262 150 v 250" stroke-dasharray="4 5"/><path d="M296 176 v 224" stroke-dasharray="4 5"/><path d="M328 190 v 210" stroke-dasharray="4 5"/><circle cx="200" cy="184" r="4" fill="currentColor" opacity=".6"/></g>
      <text x="200" y="200" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6" font-family="IBM Plex Mono, monospace">angle of Louis</text><text x="262" y="146" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">MCL</text><text x="296" y="172" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">AAL</text><text x="328" y="186" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55" font-family="IBM Plex Mono, monospace">MAL</text>
      <g id="targets"></g><g id="marks"></g></svg></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn" id="undo">Undo</button><button class="btn" id="reveal">Reveal answers</button><button class="btn primary" id="restart">Restart</button></div></div><div class="card drill-legend" id="legend"></div></div>`);
    container.appendChild(el);
    const svg = el.querySelector('svg'), marks = el.querySelector('#marks'), targets = el.querySelector('#targets'), legend = el.querySelector('#legend');
    function draw() {
      marks.innerHTML = placed.map((p, k) => `<g><circle cx="${p.x}" cy="${p.y}" r="11" fill="${p.ok ? 'var(--good)' : 'var(--bad)'}" opacity=".9"/><text x="${p.x}" y="${p.y + 3.5}" font-size="9" font-weight="600" text-anchor="middle" fill="#fff" font-family="IBM Plex Mono, monospace">${T[k][0]}</text></g>`).join('');
      targets.innerHTML = revealed ? T.map((t) => `<g><circle cx="${t[2]}" cy="${t[3]}" r="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 3"/><text x="${t[2]}" y="${t[3] + 3.5}" font-size="9" text-anchor="middle" fill="var(--accent)" font-family="IBM Plex Mono, monospace">${t[0]}</text></g>`).join('') : '';
      legend.innerHTML = '<div class="eyebrow" style="margin-bottom:4px">Place, in order</div>' + T.map((t, k) => { const p = placed[k]; return `<div class="item ${k === i && !revealed ? 'now' : ''} ${p ? (p.ok ? 'ok' : 'miss') : ''}"><span class="k">${t[0]}</span><span class="small">${esc(t[1])}</span></div>`; }).join('');
    }
    svg.addEventListener('pointerdown', (e) => {
      if (i >= T.length) return; e.preventDefault();
      const r = svg.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 400, y = ((e.clientY - r.top) / r.height) * 520;
      const t = T[i]; const d = Math.hypot(x - t[2], y - t[3]); placed.push({ x, y, ok: d <= (t[4] === 'limb' ? 40 : 18) }); i++;
      if (i === T.length) { revealed = true; draw(); const right = placed.filter((p) => p.ok).length; finish(container, Math.round((right / T.length) * 100), right, T.length, onDone); return; }
      draw();
    });
    el.querySelector('#undo').onclick = () => { if (placed.length && !revealed) { placed.pop(); i--; draw(); } };
    el.querySelector('#reveal').onclick = () => { revealed = true; draw(); };
    el.querySelector('#restart').onclick = () => { container.innerHTML = ''; leads12(container, { onDone }); };
    draw();
  }

  // ---------- Read the monitor ----------
  const MON = [
    { v: { hr: 118, bp: '84/50', rr: 26, spo2: 92 }, sick: true, why: 'Tachycardia with hypotension and a shock index over 1 (118/84). Tachypnea and borderline SpO2 on top. This is shock until proven otherwise.' },
    { v: { hr: 72, bp: '126/78', rr: 14, spo2: 98 }, sick: false, why: 'Every value sits inside the adult normal range. Nothing here says sick on its own.' },
    { v: { hr: 48, bp: '78/40', rr: 10, spo2: 90 }, sick: true, why: 'Bradycardia with hypotension, slow breathing and low SpO2. Symptomatic bradycardia or a toxic ingestion; either way, sick.' },
    { v: { hr: 96, bp: '142/90', rr: 18, spo2: 96 }, sick: false, why: 'Mild tachycardia and a slightly high BP are common with pain or anxiety. Not reassuring forever, but not sick on these numbers alone.' },
    { v: { hr: 132, bp: '110/70', rr: 30, spo2: 88 }, sick: true, why: 'SpO2 of 88 with a respiratory rate of 30 is respiratory distress. The normal BP is compensation, not comfort.' },
    { v: { hr: 58, bp: '118/72', rr: 12, spo2: 99 }, sick: false, why: 'A resting rate of 58 in a calm adult with a normal pressure is often a fit or beta-blocked heart. Fine unless symptomatic.' },
    { v: { hr: 104, bp: '96/60', rr: 22, spo2: 95, temp: 39.2 }, sick: true, why: 'Fever, heart rate over 90, respiratory rate over 20, borderline pressure. This screens positive for sepsis. The clock is already running.' },
    { v: { hr: 88, bp: '134/84', rr: 16, spo2: 97, gcs: 15 }, sick: false, why: 'Normal set with a full GCS. Vitals are not the whole story, but nothing here is a life threat.' },
    { v: { hr: 64, bp: '188/112', rr: 14, spo2: 97, gcs: 13 }, sick: true, why: 'Very high pressure with a relatively slow heart and a dropping GCS is Cushing pattern territory. Think rising intracranial pressure.' },
    { v: { hr: 150, bp: '102/66', rr: 20, spo2: 97 }, sick: true, why: 'A regular rate of 150 is a rhythm question until proven otherwise (SVT, flutter with 2:1 block). Stable now, but this patient needs a monitor and a 12-lead now.' },
    { v: { hr: 112, bp: '118/76', rr: 24, spo2: 94, temp: 38.9 }, sick: true, why: 'Fever with tachycardia, tachypnea and an SpO2 at the floor. Two SIRS criteria plus a source is a sepsis screen; the borderline oxygen makes it pneumonia until proven otherwise.' },
    { v: { hr: 76, bp: '108/64', rr: 16, spo2: 97, glucose: 64 }, sick: true, why: 'The vitals are quiet; the glucose is not. Symptomatic hypoglycemia is a brain emergency at any heart rate. Treat, then recheck in 15 minutes.' },
    { v: { hr: 40, bp: '130/80', rr: 14, spo2: 98 }, sick: false, why: 'Forty is slow, but with a normal pressure and no symptoms this is often an athlete or a beta blocker. Ask how they feel and get an ECG; not sick on these numbers.' },
    { v: { hr: 124, bp: '150/94', rr: 28, spo2: 89, etco2: 58 }, sick: true, why: 'Low SpO2 with a high EtCO2 is hypercapnic respiratory failure, the tiring COPD or asthma patient. Sit up, oxygen to 88–92 if COPD, and set up CPAP or BiPAP now.' },
  ];
  function monitorDrill(container, { onDone }) {
    let i = 0, right = 0; const order = shuffle(MON.slice()).slice(0, 10);
    const stage = h('<div></div>'); container.appendChild(stage);
    function render() {
      if (i >= order.length) { stage.innerHTML = ''; finish(container, Math.round((right / order.length) * 100), right, order.length, onDone); return; }
      const c = order[i]; const v = c.v; const items = [['hr', 'HR', v.hr], ['bp', 'NIBP', v.bp], ['rr', 'RR', v.rr], ['spo2', 'SpO2', v.spo2 + '%'], ['temp', 'Temp', v.temp != null ? v.temp + '°' : null], ['gcs', 'GCS', v.gcs], ['glucose', 'BGL', v.glucose], ['etco2', 'EtCO2', v.etco2]].filter((x) => x[2] != null);
      stage.innerHTML = `<div class="qcard"><div class="eyebrow">Round ${i + 1} of ${order.length} · adult patient</div><div class="monitor" style="margin-top:10px">${items.map(([k, lab, val]) => `<div class="v ${k}"><span>${lab}</span><b>${esc(String(val))}</b></div>`).join('')}</div><div class="btn-row"><button class="btn lg" id="ok" style="flex:1;border-color:var(--good);color:var(--good)">Not sick</button><button class="btn lg" id="sick" style="flex:1;border-color:var(--bad);color:var(--bad)">Sick</button></div><div class="why" id="mwhy" hidden></div><div class="qnav" id="mnav" hidden><span></span><button class="btn primary" id="mnext">Next</button></div></div>`;
      const answer = (sick) => { const ok = sick === c.sick; if (ok) right++; const w = stage.querySelector('#mwhy'); w.hidden = false; w.className = 'why ' + (ok ? 'ok' : 'no'); w.innerHTML = (ok ? '<strong>Right.</strong> ' : '<strong>No.</strong> ') + esc(c.why); stage.querySelector('#ok').disabled = stage.querySelector('#sick').disabled = true; stage.querySelector('#mnav').hidden = false; stage.querySelector('#mnext').onclick = () => { i++; render(); }; };
      stage.querySelector('#ok').onclick = () => answer(false); stage.querySelector('#sick').onclick = () => answer(true);
    }
    render();
  }

  // ---------- Name the rhythm ----------
  function rhythmDrill(container, { onDone }) {
    const ids = shuffle(Rhythm.list.slice()).slice(0, 10);
    let i = 0, right = 0;
    const stage = h('<div></div>'); container.appendChild(stage);
    function render() {
      if (i >= ids.length) { stage.innerHTML = ''; finish(container, Math.round((right / ids.length) * 100), right, ids.length, onDone); return; }
      const id = ids[i]; const seed = Math.floor(Math.random() * 1e9);
      const distract = shuffle(Rhythm.list.filter((x) => x !== id)).slice(0, 3); const choices = shuffle([id, ...distract]);
      stage.innerHTML = `<div class="qcard"><div class="eyebrow">Strip ${i + 1} of ${ids.length} · lead II · name it</div><canvas class="strip" id="strip"></canvas><div class="choices" style="margin-top:14px">${choices.map((c, k) => `<button class="choice" data-id="${c}"><span class="key">${KEYS[k]}</span><span>${esc(Rhythm.info(c).name)}</span></button>`).join('')}</div><div class="why" id="rwhy" hidden></div><div class="qnav" id="rnav" hidden><button class="btn" id="rnew">Redraw</button><button class="btn primary" id="rnext">Next</button></div></div>`;
      const cv = stage.querySelector('#strip'); Rhythm.render(cv, id, seed);
      stage.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const ok = b.dataset.id === id; if (ok) right++;
        stage.querySelectorAll('.choice').forEach((x) => { x.disabled = true; if (x.dataset.id === id) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        const inf = Rhythm.info(id); const w = stage.querySelector('#rwhy'); w.hidden = false; w.className = 'why ' + (ok ? 'ok' : 'no');
        w.innerHTML = `<strong>${ok ? 'Right.' : 'No, this is ' + esc(inf.name) + '.'}</strong> ${esc(inf.features)}<br><strong>First action:</strong> ${esc(inf.action)}`;
        stage.querySelector('#rnav').hidden = false; stage.querySelector('#rnext').onclick = () => { i++; render(); }; stage.querySelector('#rnew').onclick = () => Rhythm.render(cv, id, Math.floor(Math.random() * 1e9));
      });
    }
    const onResize = () => { const cv = stage.querySelector('#strip'); if (cv && i < ids.length) Rhythm.render(cv, ids[i], 7); };
    window.addEventListener('resize', onResize);
    render();
  }

  // ---------- Abdominal map ----------
  const REGIONS = [['rh', 'Right hypochondriac', 0, 0], ['epi', 'Epigastric', 1, 0], ['lh', 'Left hypochondriac', 2, 0], ['rl', 'Right lumbar (flank)', 0, 1], ['umb', 'Umbilical', 1, 1], ['ll', 'Left lumbar (flank)', 2, 1], ['ri', 'Right iliac (RLQ)', 0, 2], ['hyp', 'Hypogastric (suprapubic)', 1, 2], ['li', 'Left iliac (LLQ)', 2, 2]];
  const ABD_Q = [
    ['Where does appendicitis pain usually settle after it starts around the navel?', ['ri'], 'It migrates to the right lower quadrant, McBurney\'s point, once the parietal peritoneum is irritated.'],
    ['Where is the gallbladder, and where is Murphy\'s sign checked?', ['rh'], 'Right upper quadrant, under the ribs. Pressing there while the patient breathes in stops the breath in cholecystitis.'],
    ['Where does diverticulitis classically hurt?', ['li'], 'Left lower quadrant, over the sigmoid colon.'],
    ['Where does pancreatitis hurt, and where does it radiate?', ['epi'], 'Epigastric, boring straight through to the back. Also the spot for peptic ulcers and the inferior MI that presents as indigestion.'],
    ['Where is early appendicitis pain felt, before it moves?', ['umb'], 'Periumbilical, because visceral pain from the midgut is felt at the umbilicus.'],
    ['Where does a bladder infection or urinary retention hurt?', ['hyp'], 'Suprapubic, the hypogastric region.'],
    ['A right kidney stone: where is the pain, before it travels to the groin?', ['rl'], 'Right flank, the lumbar region, with costovertebral angle tenderness behind it.'],
    ['Where is the spleen, and where might a ruptured spleen hurt locally?', ['lh'], 'Left upper quadrant. Blood under the diaphragm also refers to the left shoulder, Kehr\'s sign.'],
    ['Where would an ovarian torsion on the left be felt?', ['li'], 'Left lower quadrant, sudden and severe, often with vomiting.'],
    ['Where does a ruptured ectopic pregnancy usually hurt?', ['ri', 'li'], 'One lower quadrant, whichever tube it is in, then everywhere as blood spreads. Shoulder pain is a red flag.'],
    ['Where is the liver edge palpated?', ['rh'], 'Right upper quadrant, under the costal margin.'],
    ['Where would a left kidney infection (pyelonephritis) hurt?', ['ll'], 'Left flank, with fever and CVA tenderness.'],
  ];
  function abdomenDrill(container, { onDone }) {
    const qs = shuffle(ABD_Q.slice()).slice(0, 10); let i = 0, right = 0;
    const el = h(`<div class="drill-wrap"><div class="card"><div class="eyebrow" id="aq-n"></div><div class="stem" id="aq" style="margin:6px 0 12px;font-weight:500"></div><div class="abd" id="abd"><svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 10 Q150 40 260 10 L280 300 Q150 340 20 300 Z" fill="none" stroke="currentColor" stroke-width="2" opacity=".6"/>
      <circle cx="150" cy="165" r="6" fill="none" stroke="currentColor" opacity=".6"/>
      ${REGIONS.map(([id, name, cx, cy]) => `<g class="reg" data-id="${id}"><rect x="${30 + cx * 80}" y="${20 + cy * 95}" width="80" height="95" rx="8" fill="var(--surface-2)" stroke="var(--line-strong)"/><text x="${70 + cx * 80}" y="${72 + cy * 95}" font-size="8.5" text-anchor="middle" fill="currentColor" opacity=".8" font-family="IBM Plex Mono, monospace">${name.split(' (')[0].split(' ').slice(0, 2).join(' ')}</text></g>`).join('')}
    </svg></div><div class="why" id="awhy" hidden></div><div class="qnav" id="anav" hidden><span></span><button class="btn primary" id="anext">Next</button></div></div><div class="card"><div class="eyebrow">Regions</div><div class="list small" style="margin-top:6px">${REGIONS.map((r) => `<div class="list-item" style="min-height:40px;padding:8px 4px"><span class="lead" style="width:28px;height:28px;font-size:11px">${r[0].toUpperCase()}</span><span class="grow">${r[1]}</span></div>`).join('')}</div></div></div>`);
    container.appendChild(el);
    function render() {
      if (i >= qs.length) { el.remove(); finish(container, Math.round((right / qs.length) * 100), right, qs.length, onDone); return; }
      el.querySelector('#aq-n').textContent = `Question ${i + 1} of ${qs.length} · tap the region`; el.querySelector('#aq').textContent = qs[i][0];
      el.querySelectorAll('.reg rect').forEach((r) => { r.setAttribute('fill', 'var(--surface-2)'); r.setAttribute('stroke', 'var(--line-strong)'); });
      el.querySelector('#awhy').hidden = true; el.querySelector('#anav').hidden = true; el.dataset.locked = '';
    }
    el.querySelectorAll('.reg').forEach((g) => g.addEventListener('pointerdown', (e) => {
      if (el.dataset.locked || i >= qs.length) return; e.preventDefault(); el.dataset.locked = '1';
      const id = g.dataset.id; const [, ok, why] = qs[i]; const good = ok.includes(id); if (good) right++;
      ok.forEach((k) => { const r = el.querySelector(`.reg[data-id="${k}"] rect`); r.setAttribute('fill', 'var(--good-soft)'); r.setAttribute('stroke', 'var(--good)'); });
      if (!good) { const r = g.querySelector('rect'); r.setAttribute('fill', 'var(--bad-soft)'); r.setAttribute('stroke', 'var(--bad)'); }
      const w = el.querySelector('#awhy'); w.hidden = false; w.className = 'why ' + (good ? 'ok' : 'no'); w.innerHTML = (good ? '<strong>Right.</strong> ' : '<strong>No.</strong> ') + esc(why);
      el.querySelector('#anav').hidden = false; el.querySelector('#anext').onclick = () => { i++; render(); };
    }));
    render();
  }

  // ---------- Sequence engine ----------
  const SEQ = {
    'seq-heart': { title: 'Blood flow through the heart', prompt: 'Tap the structures in the order blood passes through them, starting from the body.', items: ['Vena cavae', 'Right atrium', 'Tricuspid valve', 'Right ventricle', 'Pulmonic valve', 'Pulmonary arteries', 'Lungs', 'Pulmonary veins', 'Left atrium', 'Mitral valve', 'Left ventricle', 'Aortic valve', 'Aorta'] },
    'seq-draw': { title: 'Order of draw', prompt: 'Tap the tubes in the order they are filled.', items: ['Blood culture bottles', 'Light blue (citrate)', 'Red / gold SST (serum)', 'Green (heparin)', 'Lavender / pink (EDTA)', 'Gray (fluoride oxalate)'] },
    'seq-primary': { title: 'Primary survey', prompt: 'Tap the steps of the primary survey in order.', items: ['Scene safety and BSI', 'General impression', 'Level of consciousness (AVPU)', 'Exsanguinating hemorrhage control', 'Airway', 'Breathing', 'Circulation', 'Disability', 'Expose', 'Transport decision'] },
    'seq-ppe-doff': { title: 'Doffing PPE', prompt: 'Tap in the order you take it off.', items: ['Gloves', 'Gown', 'Hand hygiene', 'Eye protection', 'Mask or respirator', 'Hand hygiene again'] },
    'seq-delivery': { title: 'Normal delivery', prompt: 'Tap the steps in order once the head is crowning.', items: ['Gentle pressure to control the head', 'Check for a nuchal cord', 'Suction only if the airway is obstructed', 'Deliver the anterior then posterior shoulder', 'Dry, warm and stimulate the newborn', 'Clamp the cord at 1–3 minutes', 'Cut between the clamps', 'Deliver the placenta without pulling', 'Fundal massage'] },
    'seq-cpr': { title: 'Witnessed adult collapse', prompt: 'Tap the actions in the order you take them.', items: ['Confirm scene safety', 'Check responsiveness', 'Send for help and an AED', 'Check pulse and breathing for up to 10 seconds', 'Start compressions 30:2', 'Attach the AED as soon as it arrives', 'Clear and analyze', 'Shock if advised', 'Resume compressions immediately'] },
    'seq-sepsis': { title: 'The sepsis hour', prompt: 'Tap the bundle elements in the order they are usually done.', items: ['Draw lactate', 'Draw two sets of blood cultures', 'Give broad-spectrum antibiotics', 'Start 30 mL/kg crystalloid if hypotensive or lactate ≥ 4', 'Recheck lactate at 2–4 hours', 'Vasopressors if MAP stays under 65'] },
  };
  function seqDrill(container, { onDone }, id) {
    const s = SEQ[id]; const items = s.items.map((t, k) => ({ t, k })); const order = shuffle(items.slice()); let next = 0, misses = 0;
    const el = h(`<div class="card"><div class="eyebrow accent">Sequence</div><h2 style="margin-top:6px">${esc(s.title)}</h2><p class="muted small" style="margin:4px 0 12px">${esc(s.prompt)}</p><div class="seq" id="seq"></div><div class="seq-done" id="done"></div></div>`);
    container.appendChild(el);
    const wrap = el.querySelector('#seq'), done = el.querySelector('#done');
    function render() {
      wrap.innerHTML = order.map((it) => `<button class="seq-item ${it.k < next ? 'placed' : ''}" data-k="${it.k}" ${it.k < next ? 'disabled' : ''}>${it.k < next ? '<span class="n">' + (it.k + 1) + '</span>' : ''}${esc(it.t)}</button>`).join('');
      wrap.querySelectorAll('.seq-item').forEach((b) => b.onclick = () => { const k = +b.dataset.k; if (k === next) { next++; if (next === items.length) { render(); const pct = Math.max(0, Math.round(((items.length - misses) / items.length) * 100)); finish(container, pct, items.length - misses, items.length, onDone, `<p class="muted small">${misses} wrong tap${misses === 1 ? '' : 's'}</p>`); } else render(); } else { misses++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 350); } });
    }
    render();
  }

  // ---------- Match engine ----------
  const MATCH = {
    'match-splint': { title: 'Injury to splint', pairs: [['Distal radius fracture', 'Sugar-tong forearm'], ['Boxer\'s fracture', 'Ulnar gutter'], ['Scaphoid tenderness', 'Thumb spica'], ['Elbow or proximal forearm', 'Posterior long-arm'], ['Ankle fracture', 'Posterior short-leg with stirrup'], ['Knee ligament injury', 'Knee immobilizer'], ['Midshaft femur (isolated, closed)', 'Traction splint'], ['Clavicle fracture', 'Sling and swathe'], ['Mallet finger', 'Extension finger splint'], ['Metatarsal fracture', 'Post-op shoe or walking boot']] },
    'match-tubes': { title: 'Tube to test', pairs: [['Light blue', 'PT/INR, aPTT, D-dimer'], ['Lavender', 'CBC'], ['Pink', 'Type and screen'], ['Gold / SST', 'CMP, troponin, lipase'], ['Green', 'Stat chemistries, i-STAT'], ['Gray', 'Lactate, ethanol, glucose'], ['Blood culture bottles', 'Aerobic and anaerobic cultures'], ['Dark blue', 'Trace metals']] },
    'match-iso': { title: 'Disease to precaution', pairs: [['Tuberculosis', 'Airborne: N95, negative pressure'], ['Measles', 'Airborne: N95, negative pressure'], ['Influenza', 'Droplet: surgical mask'], ['Meningococcal meningitis', 'Droplet: surgical mask'], ['MRSA wound', 'Contact: gown and gloves'], ['C. difficile', 'Contact plus: gown, gloves, soap and water'], ['Norovirus', 'Contact plus: gown, gloves, soap and water'], ['Scabies', 'Contact: gown and gloves']] },
    'match-drugs': { title: 'Emergency to EMT drug', pairs: [['Anaphylaxis', 'Epinephrine 0.3 mg IM'], ['Opioid overdose, breathing 6/min', 'Naloxone 4 mg IN after ventilating'], ['Chest pain, suspected ACS', 'Aspirin 324 mg chewed'], ['Hypoglycemia, able to swallow', 'Oral glucose 15 g'], ['Asthma attack with own inhaler', 'Albuterol MDI assist'], ['Angina with own prescription, SBP 130', 'Nitroglycerin 0.4 mg SL'], ['SpO2 89% on room air', 'Oxygen to 94–98%'], ['Ingestion, alert, per medical direction', 'Activated charcoal 1 g/kg']] },
    'match-mnemonic': { title: 'Mnemonic to meaning', pairs: [['SAMPLE', 'History: signs, allergies, meds, past history, last intake, events'], ['OPQRST', 'Pain: onset, provocation, quality, region, severity, time'], ['DCAP-BTLS', 'Trauma exam findings'], ['AEIOU-TIPS', 'Causes of altered mental status'], ['BE-FAST', 'Stroke screen'], ['MUDPILES', 'Anion-gap acidosis causes'], ['MIST', 'Trauma handoff report'], ['SLUDGEM', 'Cholinergic (organophosphate) toxidrome']] },
    'match-rhythm-action': { title: 'Rhythm to first action', pairs: [['Ventricular fibrillation', 'CPR and defibrillate'], ['Pulseless electrical activity', 'CPR, epinephrine, find the cause'], ['Stable SVT', 'Vagal maneuvers, then adenosine'], ['Unstable atrial fibrillation', 'Synchronized cardioversion'], ['Symptomatic bradycardia', 'Atropine, then pacing'], ['Third-degree block', 'Transcutaneous pacing'], ['Torsades de pointes', 'Magnesium 2 g IV'], ['Sinus tachycardia', 'Treat the cause']] },
    'match-labs': { title: 'Lab pattern to story', pairs: [['Troponin rising over 3 hours', 'Myocardial injury'], ['Lactate 4.8', 'Poor perfusion, likely shock'], ['Potassium 6.9 with peaked T', 'Hyperkalemia: calcium now'], ['Lipase 3× normal', 'Pancreatitis'], ['Glucose 480, pH 7.1, ketones', 'DKA'], ['BNP 1,200', 'Heart failure'], ['WBC 18k with bands', 'Bacterial infection, left shift'], ['INR 4.5 on warfarin', 'Over-anticoagulated: bleeding risk']] },
  };
  function matchDrill(container, { onDone }, id) {
    const m = MATCH[id]; const left = m.pairs.map((p, k) => ({ t: p[0], k })); const right = shuffle(m.pairs.map((p, k) => ({ t: p[1], k })));
    let sel = null, solved = new Set(), misses = 0;
    const el = h(`<div class="card"><div class="eyebrow accent">Match</div><h2 style="margin-top:6px">${esc(m.title)}</h2><p class="muted small" style="margin:4px 0 12px">Tap an item on the left, then its match on the right.</p><div class="match"><div class="col" id="L"></div><div class="col" id="R"></div></div></div>`);
    container.appendChild(el);
    function render() {
      el.querySelector('#L').innerHTML = left.map((it) => `<button class="m-item ${solved.has(it.k) ? 'ok' : ''} ${sel === it.k ? 'sel' : ''}" data-k="${it.k}" ${solved.has(it.k) ? 'disabled' : ''}>${esc(it.t)}</button>`).join('');
      el.querySelector('#R').innerHTML = right.map((it) => `<button class="m-item ${solved.has(it.k) ? 'ok' : ''}" data-k="${it.k}" ${solved.has(it.k) ? 'disabled' : ''}>${esc(it.t)}</button>`).join('');
      el.querySelectorAll('#L .m-item').forEach((b) => b.onclick = () => { sel = +b.dataset.k; render(); });
      el.querySelectorAll('#R .m-item').forEach((b) => b.onclick = () => { if (sel === null) return; if (+b.dataset.k === sel) { solved.add(sel); sel = null; render(); if (solved.size === m.pairs.length) { const pct = Math.max(0, Math.round(((m.pairs.length - misses) / m.pairs.length) * 100)); finish(container, pct, m.pairs.length - misses, m.pairs.length, onDone, `<p class="muted small">${misses} miss${misses === 1 ? '' : 'es'}</p>`); } } else { misses++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 350); } });
    }
    render();
  }

  // ---------- Med math ----------
  const rnd = (a, b, d = 0) => { const v = a + Math.random() * (b - a); return Math.round(v * 10 ** d) / 10 ** d; };
  const GEN = [
    () => { const lb = rnd(90, 260); return { q: `A patient weighs ${lb} lb. What is that in kilograms?`, a: lb / 2.2046, unit: 'kg', work: `${lb} ÷ 2.2 = ${(lb / 2.2046).toFixed(1)} kg` }; },
    () => { const kg = rnd(10, 40); const d = 0.01; return { q: `Epinephrine ${d} mg/kg for a ${kg} kg child. The vial is 0.1 mg/mL (1:10,000). How many mL?`, a: kg * d / 0.1, unit: 'mL', work: `${kg} × ${d} = ${(kg * d).toFixed(2)} mg; ${(kg * d).toFixed(2)} ÷ 0.1 = ${(kg * d / 0.1).toFixed(1)} mL` }; },
    () => { const vol = [500, 1000][rnd(0, 1)]; const hrs = rnd(2, 10); return { q: `${vol} mL of normal saline over ${hrs} hours. What rate in mL/h?`, a: vol / hrs, unit: 'mL/h', work: `${vol} ÷ ${hrs} = ${(vol / hrs).toFixed(0)} mL/h` }; },
    () => { const vol = rnd(100, 250); const min = rnd(30, 120); const df = [10, 15, 20][rnd(0, 2)]; return { q: `${vol} mL over ${min} minutes with a ${df} gtt/mL set. Drops per minute?`, a: vol * df / min, unit: 'gtt/min', work: `${vol} × ${df} ÷ ${min} = ${(vol * df / min).toFixed(0)} gtt/min` }; },
    () => { const psi = rnd(800, 2000); const flow = [10, 12, 15][rnd(0, 2)]; return { q: `An E cylinder reads ${psi} psi. At ${flow} L/min, how many minutes until the 200 psi safe residual? (E constant 0.28)`, a: (psi - 200) * 0.28 / flow, unit: 'min', work: `(${psi} − 200) × 0.28 ÷ ${flow} = ${((psi - 200) * 0.28 / flow).toFixed(0)} min` }; },
    () => { const s = rnd(80, 150); const d = rnd(40, 95); return { q: `Blood pressure ${s}/${d}. What is the mean arterial pressure?`, a: (s + 2 * d) / 3, unit: 'mmHg', work: `(${s} + 2 × ${d}) ÷ 3 = ${((s + 2 * d) / 3).toFixed(0)}` }; },
    () => { const hr = rnd(60, 140); const s = rnd(80, 140); return { q: `Heart rate ${hr}, systolic ${s}. Shock index?`, a: hr / s, unit: '', work: `${hr} ÷ ${s} = ${(hr / s).toFixed(2)}`, tol: 0.05 }; },
    () => { const mg = [325, 650, 1000][rnd(0, 2)]; const conc = [160, 500][rnd(0, 1)]; return { q: `Acetaminophen ${mg} mg ordered; the liquid is ${conc} mg per 5 mL. How many mL?`, a: mg / conc * 5, unit: 'mL', work: `${mg} ÷ ${conc} × 5 = ${(mg / conc * 5).toFixed(1)} mL` }; },
    () => { const age = rnd(2, 9); return { q: `Estimate the weight of a ${age}-year-old using (age × 2) + 8.`, a: age * 2 + 8, unit: 'kg', work: `${age} × 2 + 8 = ${age * 2 + 8} kg` }; },
    () => { const age = rnd(1, 10); return { q: `Lowest acceptable systolic for a ${age}-year-old (70 + 2 × age)?`, a: 70 + 2 * age, unit: 'mmHg', work: `70 + 2 × ${age} = ${70 + 2 * age}` }; },
    () => { const kg = rnd(8, 30); return { q: `A 20 mL/kg fluid bolus for a ${kg} kg child. How many mL?`, a: kg * 20, unit: 'mL', work: `${kg} × 20 = ${kg * 20} mL` }; },
    () => { const boxes = [3, 4, 5, 6][rnd(0, 3)]; return { q: `There are ${boxes} big boxes between R waves. Heart rate?`, a: 300 / boxes, unit: '/min', work: `300 ÷ ${boxes} = ${(300 / boxes).toFixed(0)}` }; },
    () => { const kg = rnd(50, 110); const pct = [18, 27, 36, 45][rnd(0, 3)]; return { q: `Parkland for a ${kg} kg adult with ${pct}% TBSA burns: total mL in 24 hours?`, a: 4 * kg * pct, unit: 'mL', work: `4 × ${kg} × ${pct} = ${4 * kg * pct} mL (half in the first 8 h)` }; },
    () => { const f = rnd(97, 105, 1); return { q: `Convert ${f} °F to Celsius.`, a: (f - 32) * 5 / 9, unit: '°C', work: `(${f} − 32) × 5/9 = ${((f - 32) * 5 / 9).toFixed(1)} °C` }; },
    () => { const mg = [1, 0.5, 2][rnd(0, 2)]; return { q: `Naloxone ${mg} mg ordered IM from a 0.4 mg/mL vial. How many mL?`, a: mg / 0.4, unit: 'mL', work: `${mg} ÷ 0.4 = ${(mg / 0.4).toFixed(2)} mL` }; },
  ];
  function medmathDrill(container, { onDone }) {
    const gens = shuffle(GEN.slice()).slice(0, 10); let i = 0, right = 0;
    const stage = h('<div></div>'); container.appendChild(stage);
    function render() {
      if (i >= gens.length) { stage.innerHTML = ''; finish(container, Math.round((right / gens.length) * 100), right, gens.length, onDone); return; }
      const p = gens[i]();
      stage.innerHTML = `<div class="qcard"><div class="eyebrow">Problem ${i + 1} of ${gens.length}</div><div class="stem">${esc(p.q)}</div><form class="row" id="mf"><input type="text" inputmode="decimal" id="ans" placeholder="Answer${p.unit ? ' in ' + p.unit : ''}" autocomplete="off" style="max-width:220px"><button class="btn primary" type="submit">Check</button></form><div class="why" id="mwhy" hidden></div><div class="qnav" id="mnav" hidden><span></span><button class="btn primary" id="mnext">Next</button></div></div>`;
      const inp = stage.querySelector('#ans'); inp.focus();
      stage.querySelector('#mf').onsubmit = (e) => { e.preventDefault(); const v = parseFloat(inp.value.replace(',', '.')); if (!Number.isFinite(v)) return; const tol = p.tol != null ? p.tol : Math.max(Math.abs(p.a) * 0.03, 0.5); const ok = Math.abs(v - p.a) <= tol; if (ok) right++; const w = stage.querySelector('#mwhy'); w.hidden = false; w.className = 'why ' + (ok ? 'ok' : 'no'); w.innerHTML = (ok ? '<strong>Right.</strong> ' : `<strong>Not quite.</strong> Answer: ${p.a.toFixed(p.tol ? 2 : 1).replace(/\.0$/, '')} ${esc(p.unit)}. `) + esc(p.work); inp.disabled = true; stage.querySelector('#mnav').hidden = false; stage.querySelector('#mnext').onclick = () => { i++; render(); }; };
    }
    render();
  }

  const REG = [
    { id: 'rhythm', title: 'Name the rhythm', sub: 'Real strips drawn fresh every time. Ten rounds, then the first action for each.', kind: 'ECG', lead: 'VF' },
    { id: 'leads12', title: '12-lead placement', sub: 'Place V1–V6 and the limb leads on the torso.', kind: 'ECG', lead: 'V1' },
    { id: 'monitor', title: 'Read the monitor', sub: 'Sick or not sick from a vitals set. Ten rounds.', kind: 'Assessment', lead: 'HR' },
    { id: 'medmath', title: 'Med math sprint', sub: 'Ten generated problems: doses, drips, tanks, MAP, kids. Write the number.', kind: 'Math', lead: 'mL' },
    { id: 'abdomen', title: 'Abdominal map', sub: 'Tap the region where each complaint lives.', kind: 'Anatomy', lead: 'RLQ' },
    { id: 'seq-heart', title: 'Blood through the heart', sub: 'Tap the structures in order.', kind: 'Sequence', lead: 'RA' },
    { id: 'seq-primary', title: 'Primary survey order', sub: 'XABCDE and the transport decision, in order.', kind: 'Sequence', lead: 'ABC' },
    { id: 'seq-cpr', title: 'Witnessed collapse', sub: 'From scene safety to the first shock.', kind: 'Sequence', lead: 'CPR' },
    { id: 'seq-draw', title: 'Order of draw', sub: 'Tap the tubes in order.', kind: 'Sequence', lead: 'BC' },
    { id: 'seq-delivery', title: 'Delivery steps', sub: 'From crowning to fundal massage.', kind: 'Sequence', lead: 'OB' },
    { id: 'seq-sepsis', title: 'The sepsis hour', sub: 'Bundle elements in order.', kind: 'Sequence', lead: 'SEP' },
    { id: 'seq-ppe-doff', title: 'Doffing PPE', sub: 'Take it off in the safe order.', kind: 'Sequence', lead: 'PPE' },
    { id: 'match-splint', title: 'Injury to splint', sub: 'Pair each injury with its splint.', kind: 'Match', lead: 'SPL' },
    { id: 'match-tubes', title: 'Tube to test', sub: 'Pair each tube color with what runs in it.', kind: 'Match', lead: 'LAV' },
    { id: 'match-iso', title: 'Disease to precaution', sub: 'Pair each organism with its isolation.', kind: 'Match', lead: 'N95' },
    { id: 'match-drugs', title: 'Emergency to EMT drug', sub: 'Pair the situation with the drug and dose.', kind: 'Match', lead: 'EPI' },
    { id: 'match-mnemonic', title: 'Mnemonic to meaning', sub: 'Pair each mnemonic with what it unpacks.', kind: 'Match', lead: 'OPQ' },
    { id: 'match-rhythm-action', title: 'Rhythm to first action', sub: 'Pair each rhythm with the first move.', kind: 'Match', lead: 'VT' },
    { id: 'match-labs', title: 'Lab pattern to story', sub: 'Pair each result with what it means.', kind: 'Match', lead: 'K+' },
  ];
  function run(id, container, opts) {
    container.dataset.drill = id; const o = Object.assign({ onDone: () => {} }, opts);
    if (id === 'leads12') return leads12(container, o);
    if (id === 'monitor') return monitorDrill(container, o);
    if (id === 'rhythm') return rhythmDrill(container, o);
    if (id === 'medmath') return medmathDrill(container, o);
    if (id === 'abdomen') return abdomenDrill(container, o);
    if (SEQ[id]) return seqDrill(container, o, id);
    if (MATCH[id]) return matchDrill(container, o, id);
    container.appendChild(h('<div class="empty">Drill not found.</div>'));
  }
  window.Drills = { list: REG, run, get: (id) => REG.find((d) => d.id === id) };
})();
