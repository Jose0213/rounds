/* Rounds rhythm generator — synthesizes ECG strips on a canvas (monitor style) for the rhythm drill.
   Rhythm.render(canvas, id, seed) draws a 6-second strip. Rhythm.list has ids; Rhythm.info(id) has name/features/action. */
(function () {
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const gauss = (t, c, w, a) => a * Math.exp(-((t - c) * (t - c)) / (2 * w * w));
  // A beat = P (optional), QRS (narrow or wide), T. Returns a function of time (seconds) → mV contribution.
  function beat(t0, { p = true, pr = 0.16, wide = false, amp = 1, tInv = false, qrsShape = 'normal', tAmp = 0.28, pAmp = 0.14 }) {
    const qrsStart = t0;
    return (t) => {
      let v = 0;
      if (p) v += gauss(t, qrsStart - pr + 0.05, 0.022, pAmp);
      if (qrsShape === 'normal') {
        v += gauss(t, qrsStart + 0.02, 0.006, -0.12 * amp);       // q
        v += gauss(t, qrsStart + 0.045, 0.0085, 1.15 * amp);      // R
        v += gauss(t, qrsStart + 0.072, 0.007, -0.3 * amp);       // s
        v += gauss(t, qrsStart + 0.30, 0.045, tInv ? -tAmp : tAmp); // T
      } else if (qrsShape === 'wide') {
        v += gauss(t, qrsStart + 0.05, 0.03, 1.0 * amp);
        v += gauss(t, qrsStart + 0.13, 0.025, -0.45 * amp);
        v += gauss(t, qrsStart + 0.36, 0.06, -0.5 * amp);         // discordant T
      } else if (qrsShape === 'paced') {
        v += (t >= qrsStart - 0.004 && t <= qrsStart) ? 1.3 : 0;     // spike
        v += gauss(t, qrsStart + 0.06, 0.028, 0.9 * amp);
        v += gauss(t, qrsStart + 0.14, 0.02, -0.4 * amp);
        v += gauss(t, qrsStart + 0.36, 0.06, -0.4 * amp);
      }
      return v;
    };
  }
  function regularBeats(rate, dur, jitter, r, opts) { const rr = 60 / rate; const out = []; for (let t = -rr * r(); t < dur + 0.5; t += rr * (1 + (r() - 0.5) * jitter)) out.push(beat(t, opts)); return out; }
  const R = {};
  R.nsr = (r) => ({ beats: regularBeats(62 + r() * 32, 6, 0.03, r, {}) });
  R.stach = (r) => ({ beats: regularBeats(105 + r() * 40, 6, 0.02, r, { pAmp: 0.12 }) });
  R.sbrady = (r) => ({ beats: regularBeats(38 + r() * 18, 6, 0.03, r, {}) });
  R.afib = (r) => { const out = []; let t = -0.3; while (t < 6.5) { out.push(beat(t, { p: false })); t += 0.35 + r() * 0.75; } return { beats: out, noise: 0.05 }; };
  R.flutter = (r) => { const out = []; const ratio = r() < 0.6 ? 2 : (r() < 0.5 ? 3 : 4); const f = 0.2; let i = 0; for (let t = -0.2; t < 6.5; t += f, i++) if (i % ratio === 0) out.push(beat(t + 0.06, { p: false })); return { beats: out, saw: f }; };
  R.svt = (r) => ({ beats: regularBeats(165 + r() * 55, 6, 0.005, r, { p: false }) });
  R.vt = (r) => ({ beats: regularBeats(150 + r() * 50, 6, 0.01, r, { p: false, qrsShape: 'wide' }) });
  R.vf = (r) => ({ beats: [], vf: 0.5 + r() * 0.6, coarse: r() < 0.6 });
  R.asystole = (r) => ({ beats: [], drift: 0.02 + r() * 0.03 });
  R.avb1 = (r) => ({ beats: regularBeats(60 + r() * 25, 6, 0.03, r, { pr: 0.26 + r() * 0.08 }) });
  R.avb2i = (r) => { const out = []; const rr = 60 / (70 + r() * 15); let t = -0.2; let pr = 0.16; let n = 0; const cycle = 3 + Math.floor(r() * 2); while (t < 6.8) { n++; if (n % (cycle + 1) === 0) { out.push({ pOnly: t + 0.05 }); pr = 0.16; } else { out.push(beat(t + pr, { pr })); pr += 0.06; } t += rr; } return { beats: out.filter((b) => typeof b === 'function'), pOnly: out.filter((b) => b.pOnly).map((b) => b.pOnly) }; };
  R.avb2ii = (r) => { const out = []; const pOnly = []; const rr = 60 / (75 + r() * 15); let t = -0.2; let n = 0; const drop = 3 + Math.floor(r() * 2); while (t < 6.8) { n++; if (n % drop === 0) pOnly.push(t + 0.05); else out.push(beat(t + 0.16, { pr: 0.16 })); t += rr; } return { beats: out, pOnly }; };
  R.avb3 = (r) => { const beats = regularBeats(34 + r() * 12, 6, 0.01, r, { p: false, qrsShape: r() < 0.5 ? 'wide' : 'normal' }); const pOnly = []; const prr = 60 / (70 + r() * 20); for (let t = -0.4 + r() * 0.5; t < 6.6; t += prr) pOnly.push(t); return { beats, pOnly }; };
  R.pvc = (r) => { const out = []; const rr = 60 / (70 + r() * 15); let t = -0.2; let n = 0; const bigeminy = r() < 0.4; while (t < 6.8) { n++; if (bigeminy ? n % 2 === 0 : n === 3 || n === 7) { out.push(beat(t - rr * 0.35, { p: false, qrsShape: 'wide', amp: 1.2 })); t += rr * 0.65; } else { out.push(beat(t, {})); } t += rr; } return { beats: out }; };
  R.paced = (r) => ({ beats: regularBeats(70 + r() * 10, 6, 0.0, r, { p: false, qrsShape: 'paced' }) });
  R.junctional = (r) => ({ beats: regularBeats(42 + r() * 16, 6, 0.01, r, { p: false }) });
  R.torsades = (r) => ({ beats: [], torsades: true, rate: 200 + r() * 60 });
  R.hyperk = (r) => ({ beats: regularBeats(60 + r() * 25, 6, 0.02, r, { pAmp: 0.05, tAmp: 0.9, pr: 0.22 }), wideQrs: true });

  const INFO = {
    nsr: ['Normal sinus rhythm', 'Regular, 60–100, upright P before every narrow QRS, PR 0.12–0.20 s.', 'Nothing to treat. Treat the patient, not the strip.'],
    stach: ['Sinus tachycardia', 'Regular, 100–150, a P before every narrow QRS.', 'Find the cause: pain, fever, hypovolemia, hypoxia, anxiety, drugs. Do not treat the number.'],
    sbrady: ['Sinus bradycardia', 'Regular, under 60, P before every QRS.', 'Symptomatic with poor perfusion: atropine 1 mg, pacing. Asymptomatic: observe.'],
    afib: ['Atrial fibrillation', 'Irregularly irregular, no P waves, wavy baseline, narrow QRS.', 'Check a pulse and perfusion. Rate control if fast and stable; cardioversion if unstable; anticoagulation question.'],
    flutter: ['Atrial flutter', 'Sawtooth flutter waves at about 300/min, often 2:1 with a ventricular rate near 150, regular.', 'A regular narrow rhythm at 150 is flutter until proven otherwise. Rate control or cardioversion per stability.'],
    svt: ['Supraventricular tachycardia', 'Regular, narrow, 150–250, P waves buried or absent, sudden onset.', 'Stable: vagal maneuvers, adenosine 6 mg then 12 mg. Unstable: synchronized cardioversion.'],
    vt: ['Ventricular tachycardia', 'Wide bizarre QRS, regular, 140–200, no P waves.', 'Check a pulse now. Pulse and stable: antiarrhythmic. Unstable: synchronized cardioversion. No pulse: defibrillate and CPR.'],
    vf: ['Ventricular fibrillation', 'Chaotic, no organized complexes, no P, no QRS.', 'No pulse by definition. CPR and defibrillate immediately. Epinephrine, amiodarone.'],
    asystole: ['Asystole', 'Flat line with minor baseline drift. Confirm in two leads and check the gain.', 'CPR, epinephrine every 3–5 minutes, find the H\'s and T\'s. Not shockable.'],
    avb1: ['First-degree AV block', 'Regular, P before every QRS, PR longer than 0.20 s (one big box).', 'Usually benign. Note it, look for drugs or ischemia.'],
    avb2i: ['Second-degree AV block, Mobitz I (Wenckebach)', 'PR gets longer beat by beat until a QRS drops, then the cycle restarts. Grouped beating.', 'Usually stable. Treat only if symptomatic. Watch for progression.'],
    avb2ii: ['Second-degree AV block, Mobitz II', 'Constant PR, then a P wave with no QRS. Dropped beats without warning.', 'Dangerous: can progress to complete block. Pacing pads on, cardiology, avoid atropine reliance.'],
    avb3: ['Third-degree (complete) AV block', 'P waves and QRS complexes march independently. Atrial rate faster than the slow ventricular escape.', 'Transcutaneous pacing if symptomatic, prepare for transvenous pacing. Atropine rarely helps.'],
    pvc: ['Premature ventricular complexes', 'Underlying sinus rhythm with early wide bizarre beats followed by a pause. Bigeminy if every other beat.', 'Frequent or multifocal: check electrolytes, oxygen, ischemia. Isolated: observe.'],
    paced: ['Paced rhythm', 'A pacer spike before each wide QRS. Regular at the set rate.', 'Confirm capture (a QRS after every spike) and a pulse. Failure to capture or sense is a device problem.'],
    junctional: ['Junctional rhythm', 'Regular, narrow, 40–60, no P waves (or inverted P before or after).', 'The AV node is escaping. Treat like bradycardia if symptomatic; look at digoxin and electrolytes.'],
    torsades: ['Torsades de pointes', 'Polymorphic VT: the QRS amplitude twists around the baseline. Usually from a long QT.', 'Magnesium 2 g IV. Unstable or pulseless: defibrillate. Stop QT-prolonging drugs.'],
    hyperk: ['Sinus rhythm with peaked T waves (hyperkalemia)', 'Tall, narrow, tented T waves; flattened P; widening QRS as potassium rises.', 'Potassium now. Calcium to protect the heart, insulin and glucose to shift, then removal.'],
  };
  const list = Object.keys(R);
  function samples(id, seed) {
    const r = rnd(seed);
    const spec = R[id](r);
    const dur = 6; const N = Math.round(dur * 250); const out = new Float32Array(N);
    let drift = 0;
    for (let i = 0; i < N; i++) {
      const t = i / 250;
      let v = 0;
      if (spec.vf) { v = spec.vf * (spec.coarse ? 0.9 : 0.35) * (Math.sin(t * 31 + Math.sin(t * 7) * 3) + 0.6 * Math.sin(t * 53 + 1.3) + 0.4 * Math.sin(t * 19 * (1 + 0.2 * Math.sin(t)))) * (0.7 + 0.3 * Math.sin(t * 2.3)); }
      else if (spec.torsades) { const env = Math.sin(t * 2.4); v = 1.3 * env * Math.sin(t * spec.rate / 60 * 2 * Math.PI) + 0.25 * Math.sin(t * spec.rate / 60 * 4 * Math.PI); }
      else {
        for (const b of spec.beats) v += b(t);
        if (spec.pOnly) for (const pt of spec.pOnly) v += gauss(t, pt, 0.022, 0.14);
        if (spec.saw) v += 0.18 * (2 * ((t / spec.saw) % 1) - 1);
        if (spec.noise) v += (r() - 0.5) * spec.noise;
      }
      drift += (r() - 0.5) * (spec.drift || 0.004); drift *= 0.995;
      out[i] = v + drift + (r() - 0.5) * 0.012;
    }
    return out;
  }
  function render(canvas, id, seed = 1) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 160;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0B1014'; ctx.fillRect(0, 0, w, h);
    const pxPerSec = w / 6; const mm = pxPerSec / 25; // 25 mm/s
    ctx.strokeStyle = 'rgba(61,220,132,.10)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += mm) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += mm) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(61,220,132,.22)';
    for (let x = 0; x < w; x += mm * 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += mm * 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const s = samples(id, seed);
    const base = h * 0.62; const mv = mm * 10; // 10 mm/mV
    ctx.strokeStyle = '#3DDC84'; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(61,220,132,.45)'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i < s.length; i++) { const x = (i / 250) * pxPerSec; const y = base - s[i] * mv; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(232,238,243,.55)'; ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.fillText('II   25 mm/s   10 mm/mV   6 s', 8, h - 8);
  }
  window.Rhythm = { list, info: (id) => ({ name: INFO[id][0], features: INFO[id][1], action: INFO[id][2] }), render, samples };
})();
